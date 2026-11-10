import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const excluded = new Set(['node_modules','.git','.freebuff','uploads']);
const signatures = [ /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bAKIA[A-Z0-9]{16}\b/, /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, /\bpostgres(?:ql)?:\/\/[^\s/:]+:(?!password@)[^\s@]+@/ ];
let scanned = 0, found = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    if (excluded.has(entry.name) || (entry.name.startsWith('.env') && entry.name !== '.env.example')) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!/\.(?:js|json|html|css|md|ya?ml|txt|example)$/.test(entry.name) || /results\.txt$/.test(entry.name)) continue;
    const text = await readFile(file,'utf8'); scanned++;
    if (signatures.some(pattern=>pattern.test(text))) { console.error('Potential secret in '+path.relative(root,file)+' (value redacted)');found++; }
    if (file.startsWith(path.join(root,'client')) && /(?:JWT_SECRET|DB_PASSWORD|DATABASE_URL|DB_MIGRATION_URL)/.test(text)) { console.error('Server secret reference in '+path.relative(root,file));found++; }
  }
}
await walk(root);
console.log(JSON.stringify({scannedTextFiles:scanned,potentialSecrets:found,scope:'working tree patterns; dotenv values and Git history excluded'}));
if(found)process.exitCode=1;
