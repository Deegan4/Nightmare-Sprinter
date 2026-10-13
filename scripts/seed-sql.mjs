// Emit SQL that inserts the seed records (INSERT OR IGNORE: never overwrites edits).
// Usage: node scripts/seed-sql.mjs > /tmp/seed.sql
import { build } from 'esbuild';
const out = await build({ entryPoints: ['shared/seed.ts'], bundle: true, format: 'esm', write: false, platform: 'neutral' });
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const recs = mod.seedRecords();
const lines = recs.map((r, i) =>
  `INSERT OR IGNORE INTO records (id, kind, vehicle_id, data, created_at, updated_at, created_by, deleted, seq) VALUES (${q(r.id)}, ${q(r.kind)}, ${q(r.vehicle_id)}, ${q(JSON.stringify(r.data))}, ${r.created_at}, ${r.updated_at}, ${q(r.created_by)}, 0, (SELECT value FROM counter WHERE name = 'seq') + ${i + 1});`);
lines.push(`UPDATE counter SET value = (SELECT MAX(seq) FROM records) WHERE name = 'seq' AND value < (SELECT MAX(seq) FROM records);`);
console.log(lines.join('\n'));
