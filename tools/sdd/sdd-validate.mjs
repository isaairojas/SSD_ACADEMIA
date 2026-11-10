#!/usr/bin/env node
// Validador de artefactos SDD. Mismo código en hooks locales y en CI.
// Uso:
//   node sdd-validate.mjs                 valida todos los cambios activos + specs canónicas + constitución
//   node sdd-validate.mjs --change <id>   valida un cambio
//   node sdd-validate.mjs --ci            igual que --all, exit 1 si hay errores
//   node sdd-validate.mjs --json          salida JSON
//   node sdd-validate.mjs --hook          modo PostToolUse (lee stdin, valida solo lo tocado, exit 2 si hay errores)
import path from 'node:path';
import fs from 'node:fs';
import {
  projectRoot, sddDir, sddDirName, exists, readText, readChange, listChanges, listCapabilities,
  listDeltaSpecs, parseSpec, hasShall, scenarioHasWhenThen, countNeedsClarification, parseTasks,
  INTENSITIES, STATUSES, STATUS_RANK, parseArgs, readStdinJson, toPosix, changeDir,
} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const root = projectRoot();
const dir = sddDir(root);
const findings = [];
const add = (level, file, line, msg) => findings.push({ level, file: file ? toPosix(path.relative(root, file)) : null, line, msg });
const err = (f, l, m) => add('error', f, l, m);
const warn = (f, l, m) => add('warning', f, l, m);
const info = (f, l, m) => add('info', f, l, m);

function validateSpecFile(file, { delta, status, changeCaps }) {
  const text = readText(file);
  const parsed = parseSpec(text);
  const deltaSections = parsed.sections.filter(s => s.kind !== 'CANONICAL');
  const canonSections = parsed.sections.filter(s => s.kind === 'CANONICAL');

  if (delta) {
    if (deltaSections.length === 0) err(file, 1, 'Un delta debe tener al menos una sección "## ADDED|MODIFIED|REMOVED|RENAMED Requirements".');
    if (canonSections.length) warn(file, canonSections[0].line, 'Un delta no debería contener "## Requisitos" (eso es formato canónico).');
  } else {
    if (deltaSections.length) err(file, deltaSections[0].line, 'Una spec canónica no puede contener encabezados de delta (ADDED/MODIFIED/...). Fusiona con sdd-sync.');
    if (canonSections.length === 0) err(file, 1, 'Una spec canónica necesita la sección "## Requisitos".');
  }

  for (const sec of parsed.sections) {
    if (sec.kind === 'RENAMED') {
      if (sec.renames.length === 0) err(file, sec.line, 'La sección RENAMED no tiene pares "- FROM: Requirement: X" / "- TO: Requirement: Y".');
      for (const r of sec.renames) if (!r.to) err(file, r.line, `RENAMED "${r.from}" sin línea "- TO:".`);
      continue;
    }
    if (sec.requirements.length === 0 && sec.kind !== 'CANONICAL') err(file, sec.line, `La sección ${sec.kind} no tiene ningún "### Requirement:".`);
    for (const req of sec.requirements) {
      if (sec.kind === 'REMOVED') {
        if (!req.bodyLines.some(l => /Reason:|Razón:/i.test(l))) warn(file, req.line, `REMOVED "${req.name}": indica la razón (línea "Reason: ...").`);
        continue;
      }
      if (!hasShall(req.bodyLines)) err(file, req.line, `"${req.name}": el requisito debe ser una afirmación con SHALL/MUST (o DEBE).`);
      if (req.scenarios.length === 0) err(file, req.line, `"${req.name}": falta al menos un "#### Scenario:" que lo ejercite.`);
      for (const sc of req.scenarios) {
        if (!scenarioHasWhenThen(sc)) err(file, sc.line, `Escenario "${sc.name}": necesita WHEN y THEN (GIVEN opcional).`);
      }
      if (sec.kind === 'MODIFIED' && !req.bodyLines.some(l => /\(Previously:|\(Antes:/i.test(l))) {
        warn(file, req.line, `MODIFIED "${req.name}": añade "(Previously: ...)" con el texto anterior para que la revisión vea el cambio.`);
      }
      const words = req.bodyLines.join(' ').split(/\s+/).filter(Boolean).length;
      if (words > 120) warn(file, req.line, `"${req.name}": requisito muy largo (${words} palabras); divide en requisitos más pequeños.`);
      if (/\b(rápido|fácil|intuitivo|robusto|escalable)\b/i.test(req.bodyLines.join(' ')) && !/\d/.test(req.bodyLines.join(' '))) {
        warn(file, req.line, `"${req.name}": adjetivos no medibles sin número (rápido/fácil/...). Cuantifica o mueve a criterios de éxito.`);
      }
    }
  }

  const nc = countNeedsClarification(text);
  if (nc) {
    if (status && STATUS_RANK[status] >= STATUS_RANK.designed) err(file, null, `${nc} marcador(es) [NEEDS CLARIFICATION] pendientes; resuélvelos con /exodus-sdd:clarify antes de diseñar.`);
    else info(file, null, `${nc} marcador(es) [NEEDS CLARIFICATION] pendientes.`);
  }
  return parsed;
}

function validateChange(id) {
  const cdir = changeDir(id, dir);
  const cj = path.join(cdir, 'change.json');
  const ch = readChange(id, dir);
  if (!ch) { err(cj, null, 'Falta change.json (crea el cambio con /exodus-sdd:intent o scripts/sdd-new.mjs).'); return; }
  if (ch.__error) { err(cj, null, `change.json inválido: ${ch.__error}`); return; }
  if (ch.id && ch.id !== id) err(cj, null, `change.json.id ("${ch.id}") no coincide con la carpeta "${id}".`);
  if (!INTENSITIES.includes(ch.intensity)) err(cj, null, `intensity debe ser ${INTENSITIES.join('|')} (actual: ${ch.intensity}).`);
  if (!STATUSES.includes(ch.status)) err(cj, null, `status debe ser uno de ${STATUSES.join('|')} (actual: ${ch.status}).`);
  const status = STATUSES.includes(ch.status) ? ch.status : 'intent';
  const rank = STATUS_RANK[status];

  // intent.md
  const intent = path.join(cdir, 'intent.md');
  if (!exists(intent)) err(intent, null, 'Falta intent.md.');
  else {
    const t = readText(intent);
    for (const k of ['Problema', 'Objetivo', 'Criterios de éxito', 'No-objetivos']) {
      if (!new RegExp(k, 'i').test(t)) warn(intent, null, `intent.md no menciona "${k}".`);
    }
    if (/\{\{\w+\}\}/.test(t)) warn(intent, null, 'intent.md aún tiene placeholders {{...}} sin rellenar.');
  }

  // specs delta
  const deltas = listDeltaSpecs(id, dir);
  if (rank >= STATUS_RANK.specified && deltas.length === 0) err(cdir, null, 'Estado "specified" o posterior sin deltas en specs/<capacidad>/spec.md.');
  const caps = listCapabilities(dir);
  const declared = Array.isArray(ch.capabilities) ? ch.capabilities : [];
  for (const d of deltas) {
    const parsed = validateSpecFile(d.file, { delta: true, status, changeCaps: declared });
    if (!declared.includes(d.capability)) warn(cj, null, `El delta toca la capacidad "${d.capability}" pero change.json.capabilities no la declara.`);
    const isNew = !caps.includes(d.capability);
    const kinds = parsed.sections.map(s => s.kind);
    if (isNew && kinds.some(k => k === 'MODIFIED' || k === 'REMOVED' || k === 'RENAMED')) {
      err(d.file, null, `La capacidad "${d.capability}" no existe en ${sddDirName()}/specs/; solo se admite ADDED para capacidades nuevas.`);
    }
    if (isNew) info(d.file, null, `Capacidad nueva "${d.capability}": se creará en sync.`);
  }
  const mirroredCaps = new Set((ch.mirrors || []).flatMap(m => m.capabilities || []));
  for (const c of declared) {
    if (!deltas.find(d => d.capability === c) && rank >= STATUS_RANK.specified && !mirroredCaps.has(c)) warn(cj, null, `Capacidad declarada "${c}" sin delta en specs/.`);
  }
  if (ch.mirrorOf) info(cj, null, `Cambio espejo de ${ch.mirrorOf} (repo ${ch.mirrorRepo}).`);

  // design.md
  const design = path.join(cdir, 'design.md');
  if (ch.intensity !== 'light' && rank >= STATUS_RANK.designed) {
    if (!exists(design)) err(design, null, 'Intensidad standard/full requiere design.md desde el estado "designed".');
    else {
      const t = readText(design);
      if (!/Constitution Check/i.test(t)) err(design, null, 'design.md debe incluir la sección "Constitution Check".');
      else {
        const section = t.split(/Constitution Check/i)[1] || '';
        const open = (section.match(/^\s*-\s*\[ \]/gm) || []).length;
        if (open && rank >= STATUS_RANK.planned) warn(design, null, `${open} ítem(s) del Constitution Check sin marcar.`);
      }
      if (!/##\s+(Repos|Repositorios|Alcance por repositorio)/i.test(t)) warn(design, null, 'design.md: añade la sección de alcance por repositorio (backend/frontend).');
    }
  }

  // tasks.md
  const tasks = path.join(cdir, 'tasks.md');
  if (rank >= STATUS_RANK.planned) {
    if (!exists(tasks)) err(tasks, null, 'Estado "planned" o posterior sin tasks.md.');
    else {
      const list = parseTasks(readText(tasks));
      if (list.length === 0) err(tasks, null, 'tasks.md no tiene tareas con formato "- [ ] T001 ...".');
      const noId = list.filter(t => !t.id);
      if (noId.length) warn(tasks, noId[0].line, `${noId.length} tarea(s) sin id Tnnn.`);
      const noRef = list.filter(t => t.id && !t.ref);
      if (noRef.length) warn(tasks, noRef[0].line, `${noRef.length} tarea(s) sin referencia a requisito (usa "(→ Requirement: X)").`);
      const ids = list.map(t => t.id).filter(Boolean);
      const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
      if (dup.length) err(tasks, null, `Ids de tarea duplicados: ${[...new Set(dup)].join(', ')}.`);
      if (rank >= STATUS_RANK.converged && list.some(t => !t.done)) warn(tasks, null, 'Estado converged/delivered con tareas pendientes.');
    }
  }

  // verify.md
  if (rank >= STATUS_RANK.verifying && !exists(path.join(cdir, 'verify.md'))) warn(path.join(cdir, 'verify.md'), null, 'Falta verify.md (ejecuta /exodus-sdd:verify).');

  // gates por intensidad
  const gates = ch.gates || {};
  const need = { light: [], standard: ['P', 'A'], full: ['P', 'A', 'Q'] }[ch.intensity] || [];
  if (rank >= STATUS_RANK.implementing) {
    for (const g of need) if (!gates[g] && (g !== 'Q')) warn(cj, null, `Gate ${g} no registrado y el cambio ya está en "${status}". Regístralo: node scripts/sdd-change.mjs gate ${id} ${g} --by <nombre>.`);
  }
  if (rank >= STATUS_RANK.synced && ch.synced !== true) err(cj, null, 'Estado synced/archived pero change.json.synced no es true.');
}

function validateCanonical() {
  for (const cap of listCapabilities(dir)) {
    const f = path.join(dir, 'specs', cap, 'spec.md');
    if (!exists(f)) { warn(path.join(dir, 'specs', cap), null, `La capacidad "${cap}" no tiene spec.md.`); continue; }
    validateSpecFile(f, { delta: false });
  }
}

function validateConstitution() {
  const f = path.join(dir, 'constitution.md');
  if (!exists(f)) { warn(f, null, 'Falta constitution.md (ejecuta /exodus-sdd:init o /exodus-sdd:constitution).'); return; }
  const t = readText(f);
  const principles = (t.match(/^\d+\.\s+/gm) || []).length;
  if (principles > 15) warn(f, null, `La constitución tiene ${principles} principios; más de 15 suele ignorarse. Mueve detalle a skills/steering.`);
  const checks = (t.match(/Check:/g) || []).length;
  if (principles && checks < principles) warn(f, null, `${principles - checks} principio(s) sin "Check:" (cada principio debe ser verificable).`);
  if (/\{\{\w+\}\}/.test(t)) warn(f, null, 'La constitución aún tiene placeholders {{...}}.');
}

function report() {
  const errors = findings.filter(f => f.level === 'error');
  const warnings = findings.filter(f => f.level === 'warning');
  if (args.json) { console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, findings }, null, 2)); return errors.length; }
  const lines = findings.map(f => `${f.level === 'error' ? 'ERROR  ' : f.level === 'warning' ? 'WARN   ' : 'INFO   '} ${f.file || ''}${f.line ? ':' + f.line : ''} — ${f.msg}`);
  const summary = `[exodus-sdd] validación: ${errors.length} error(es), ${warnings.length} advertencia(s), ${findings.length - errors.length - warnings.length} info.`;
  return { errors, warnings, lines, summary };
}

// ---------- ejecución ----------
if (!exists(dir)) {
  if (args.hook) process.exit(0);
  console.log(`[exodus-sdd] No existe ${sddDirName()}/ en ${root}. Ejecuta /exodus-sdd:init.`);
  process.exit(args.ci ? 1 : 0);
}

if (args.hook) {
  const input = await readStdinJson();
  const target = input?.tool_input?.file_path || input?.tool_input?.path;
  if (!target) process.exit(0);
  const rel = toPosix(path.relative(root, path.resolve(root, target)));
  const sdd = sddDirName();
  if (!rel.startsWith(sdd + '/')) process.exit(0);
  const inner = rel.slice(sdd.length + 1);
  const m = inner.match(/^changes\/(?!archive\/)([^/]+)\//);
  if (m) validateChange(m[1]);
  else if (inner.startsWith('specs/')) validateCanonical();
  else if (inner === 'constitution.md') validateConstitution();
  else process.exit(0);
  const r = report();
  if (r.errors.length) { process.stderr.write(r.summary + '\n' + r.lines.filter(l => l.startsWith('ERROR')).join('\n') + '\n'); process.exit(2); }
  if (r.warnings.length) { process.stdout.write(r.summary + '\n' + r.lines.filter(l => l.startsWith('WARN')).join('\n') + '\n'); }
  process.exit(0);
}

if (args.change) validateChange(args.change);
else { for (const id of listChanges(dir)) validateChange(id); validateCanonical(); validateConstitution(); }
const r = report();
if (typeof r === 'number') process.exit(args.ci && r ? 1 : 0);
console.log(r.summary);
if (r.lines.length) console.log(r.lines.join('\n'));
process.exit(args.ci && r.errors.length ? 1 : 0);
