// Utilidades compartidas del kit exodus-sdd (Node >= 18, sin dependencias).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const INTENSITIES = ['light', 'standard', 'full'];
export const STATUSES = [
  'intent', 'specified', 'designed', 'planned', 'implementing',
  'verifying', 'converged', 'delivered', 'synced', 'archived',
];
export const STATUS_RANK = Object.fromEntries(STATUSES.map((s, i) => [s, i]));
export const DELTA_HEADINGS = ['ADDED', 'MODIFIED', 'REMOVED', 'RENAMED'];

export function projectRoot() {
  return path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

export function sddDirName() {
  return (process.env.CLAUDE_PLUGIN_OPTION_SDD_DIR || process.env.SDD_DIR || 'sdd').replace(/[\\/]+$/, '');
}

export function sddDir(root = projectRoot()) {
  return path.join(root, sddDirName());
}

export function pluginRoot() {
  return process.env.CLAUDE_PLUGIN_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

export function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

export function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

export function writeText(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
}

export function readJson(p) {
  return JSON.parse(readText(p));
}

export function writeJson(p, obj) {
  writeText(p, JSON.stringify(obj, null, 2) + '\n');
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function toPosix(p) {
  return p.replace(/\\/g, '/');
}

export function relToRoot(p, root = projectRoot()) {
  return toPosix(path.relative(root, path.resolve(root, p)));
}

/** Lista las carpetas de cambios activos (excluye archive). */
export function listChanges(dir = sddDir()) {
  const changesDir = path.join(dir, 'changes');
  if (!exists(changesDir)) return [];
  return fs.readdirSync(changesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'archive')
    .map(d => d.name)
    .sort();
}

export function listCapabilities(dir = sddDir()) {
  const specsDir = path.join(dir, 'specs');
  if (!exists(specsDir)) return [];
  return fs.readdirSync(specsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

export function changeDir(id, dir = sddDir()) {
  return path.join(dir, 'changes', id);
}

export function readChange(id, dir = sddDir()) {
  const p = path.join(changeDir(id, dir), 'change.json');
  if (!exists(p)) return null;
  try { return readJson(p); } catch (e) { return { __error: e.message }; }
}

export function listDeltaSpecs(id, dir = sddDir()) {
  const specsDir = path.join(changeDir(id, dir), 'specs');
  if (!exists(specsDir)) return [];
  const out = [];
  for (const cap of fs.readdirSync(specsDir, { withFileTypes: true })) {
    if (!cap.isDirectory()) continue;
    const f = path.join(specsDir, cap.name, 'spec.md');
    if (exists(f)) out.push({ capability: cap.name, file: f });
  }
  return out;
}

/**
 * Parsea un archivo de spec (canónico o delta) en bloques.
 * Devuelve { sections: [{ kind, line, requirements, renames, raw }], lines }
 * kind: 'ADDED'|'MODIFIED'|'REMOVED'|'RENAMED'|'CANONICAL'
 * requirement: { name, line, bodyLines, scenarios: [{ name, line, lines }], rawLines, text }
 */
export function parseSpec(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = null;
  let req = null;
  let scen = null;

  const pushSection = (kind, line) => {
    current = { kind, line, requirements: [], renames: [], raw: [] };
    sections.push(current);
    req = null; scen = null;
  };

  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    const delta = raw.match(/^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/i);
    if (delta) { pushSection(delta[1].toUpperCase(), lineNo); return; }
    if (/^##\s+/.test(raw)) {
      if (/^##\s+(Requisitos|Requirements)\b/i.test(raw)) pushSection('CANONICAL', lineNo);
      else { current = null; req = null; scen = null; }
      return;
    }
    if (/^#\s+/.test(raw)) { current = null; req = null; scen = null; return; }
    if (!current) return;
    current.raw.push(raw);
    const r = raw.match(/^###\s+Requirement:\s*(.+?)\s*$/i);
    if (r) {
      req = { name: r[1], line: lineNo, bodyLines: [], scenarios: [], rawLines: [raw] };
      current.requirements.push(req);
      scen = null;
      return;
    }
    const s = raw.match(/^####\s+Scenario:\s*(.+?)\s*$/i);
    if (s && req) {
      scen = { name: s[1], line: lineNo, lines: [] };
      req.scenarios.push(scen);
      req.rawLines.push(raw);
      return;
    }
    if (current.kind === 'RENAMED') {
      const from = raw.match(/^-\s*FROM:\s*`?(?:###\s+)?Requirement:\s*(.+?)`?\s*$/i);
      const to = raw.match(/^-\s*TO:\s*`?(?:###\s+)?Requirement:\s*(.+?)`?\s*$/i);
      if (from) current.renames.push({ from: from[1], to: null, line: lineNo });
      else if (to && current.renames.length) current.renames[current.renames.length - 1].to = to[1];
    }
    if (req) {
      req.rawLines.push(raw);
      if (scen) scen.lines.push(raw); else req.bodyLines.push(raw);
    }
  });

  for (const sec of sections) {
    for (const r of sec.requirements) r.text = r.rawLines.join('\n').replace(/\s+$/, '');
  }
  return { sections, lines };
}

export function hasShall(bodyLines) {
  return bodyLines.some(l => /\b(SHALL|MUST|DEBE)\b/.test(l));
}

export function scenarioHasWhenThen(scen) {
  const txt = scen.lines.join('\n');
  return /\b(WHEN|CUANDO)\b/.test(txt) && /\b(THEN|ENTONCES)\b/.test(txt);
}

export function countNeedsClarification(text) {
  return (text.match(/\[NEEDS CLARIFICATION[^\]]*\]/g) || []).length;
}

export function parseTasks(text) {
  const tasks = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const m = raw.match(/^\s*-\s*\[( |x|X)\]\s*(T\d{3,})?\s*(.*)$/);
    if (!m) return;
    tasks.push({
      line: i + 1,
      done: m[1].toLowerCase() === 'x',
      id: m[2] || null,
      text: m[3],
      parallel: /\[P\]/.test(m[3]),
      ref: /→|->|\(R-|Requirement:/.test(m[3]),
    });
  });
  return tasks;
}

export function fmtTable(rows, headers) {
  const all = [headers, ...rows];
  const widths = headers.map((_, c) => Math.max(...all.map(r => String(r[c] ?? '').length)));
  const line = r => '| ' + r.map((v, c) => String(v ?? '').padEnd(widths[c])).join(' | ') + ' |';
  return [line(headers), '|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|', ...rows.map(line)].join('\n');
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { args[key] = next; i++; }
      else args[key] = true;
    } else args._.push(a);
  }
  return args;
}

function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }

export async function readStdinJson() {
  return new Promise(resolve => {
    let data = '';
    let done = false;
    const finish = v => { if (!done) { done = true; resolve(v); } };
    if (process.stdin.isTTY) return finish(null);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', c => data += c);
    process.stdin.on('end', () => finish(data.trim() ? safeJson(data) : null));
    process.stdin.on('error', () => finish(null));
    setTimeout(() => finish(data.trim() ? safeJson(data) : null), 1500);
  });
}

export function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? `{{${k}}}`));
}
