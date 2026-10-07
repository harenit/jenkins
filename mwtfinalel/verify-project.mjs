import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbidden = ['d' + 'emo'];
const ignored = new Set(['node_modules', '.git', 'dist']);
const extensions = new Set(['.js', '.jsx', '.css', '.html', '.md', '.json', '.bat', '.env', '.example']);
let failures = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name)) || entry.name === '.env') {
      const text = fs.readFileSync(full, 'utf8').toLowerCase();
      for (const word of forbidden) {
        if (text.includes(word)) {
          console.error(`Forbidden project word found: ${path.relative(root, full)}`);
          failures++;
        }
      }
    }
  }
}

walk(root);
if (failures) process.exit(1);
console.log('PrepCycle source verification passed.');
