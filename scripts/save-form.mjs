import fs from 'node:fs';
import path from 'node:path';
import { validateForm } from './form-utils.mjs';

const raw = process.env.FORM_JSON;
if (!raw || !raw.trim()) {
  console.log('No new form JSON provided; rebuilding and publishing saved forms.');
  process.exit(0);
}
let parsed;
try { parsed = JSON.parse(raw); } catch { throw new Error('form_json is not valid JSON. Copy the full JSON from Crimson Form Studio.'); }
const form = validateForm(parsed);
const target = path.resolve('forms', `${form.slug}.json`);
if (!target.startsWith(path.resolve('forms') + path.sep)) throw new Error('Invalid form path.');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify(form, null, 2)}\n`);
console.log(`Saved form definition: ${target}`);
