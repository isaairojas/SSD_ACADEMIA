#!/usr/bin/env node
// Actualiza change.json de forma determinista.
// Uso:
//   node sdd-change.mjs status <id> <estado>
//   node sdd-change.mjs gate <id> <P|A|Q|D> [--by <nombre>] [--clear]
//   node sdd-change.mjs set <id> <clave> <valor>        (p. ej. synced true, title "..." , capabilities a,b , repos backend,frontend)
//   node sdd-change.mjs metric <id> <clave> <valor>     (p. ej. converge_passes 2, tokens.specify 12000)
import path from 'node:path';
import { sddDir, readChange, writeJson, changeDir, STATUSES, parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const [cmd, id, k, v] = args._;
const dir = sddDir();
const ch = readChange(id, dir);
if (!ch || ch.__error) { console.error(`No se pudo leer change.json de "${id}".`); process.exit(1); }
const file = path.join(changeDir(id, dir), 'change.json');

const parseVal = s => {
  if (s === 'true') return true; if (s === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (/,/.test(s)) return s.split(',').map(x => x.trim()).filter(Boolean);
  return s;
};

if (cmd === 'status') {
  if (!STATUSES.includes(k)) { console.error(`Estado inválido. Válidos: ${STATUSES.join(', ')}`); process.exit(1); }
  ch.status = k;
  ch.history = ch.history || [];
  ch.history.push({ status: k, at: new Date().toISOString() });
} else if (cmd === 'gate') {
  if (!['P', 'A', 'Q', 'D'].includes(k)) { console.error('Gate inválido (P|A|Q|D).'); process.exit(1); }
  ch.gates = ch.gates || {};
  ch.gates[k] = args.clear ? null : { by: args.by || 'humano', at: new Date().toISOString() };
} else if (cmd === 'set') {
  const listKeys = ['capabilities', 'repos'];
  ch[k] = listKeys.includes(k) ? String(v).split(',').map(x => x.trim()).filter(Boolean) : parseVal(v);
} else if (cmd === 'metric') {
  ch.metrics = ch.metrics || {};
  const parts = k.split('.');
  let obj = ch.metrics;
  while (parts.length > 1) { const p = parts.shift(); obj[p] = obj[p] || {}; obj = obj[p]; }
  obj[parts[0]] = parseVal(v);
} else {
  console.log('Uso: sdd-change.mjs status|gate|set|metric <id> ...');
  process.exit(1);
}
ch.updated = new Date().toISOString();
writeJson(file, ch);
console.log(`change.json actualizado (${cmd} ${k}${v !== undefined ? ' ' + v : ''}).`);
