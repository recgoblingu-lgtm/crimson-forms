import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeIssueTemplate, validateForm } from './form-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const formsDir = path.join(root, 'forms');
const templateDir = path.join(root, '.github', 'ISSUE_TEMPLATE');
const siteDir = path.join(root, 'site');
const owner = 'recgoblingu-lgtm';
const repo = 'crimson-forms';
fs.mkdirSync(templateDir, { recursive: true });
fs.mkdirSync(siteDir, { recursive: true });
const files = fs.readdirSync(formsDir).filter(file => file.endsWith('.json')).sort();
const forms = [];
const desiredTemplates = new Set();
for (const file of files) {
  const parsed = JSON.parse(fs.readFileSync(path.join(formsDir, file), 'utf8'));
  const form = validateForm(parsed);
  if (file !== `${form.slug}.json`) throw new Error(`Form file ${file} must be named ${form.slug}.json.`);
  const template = `crimson-${form.slug}.yml`;
  desiredTemplates.add(template);
  fs.writeFileSync(path.join(templateDir, template), `${JSON.stringify(makeIssueTemplate(form), null, 2)}\n`);
  forms.push({
    slug: form.slug,
    title: form.title,
    description: form.description,
    questionCount: form.questions.length,
    template
  });
}
for (const file of fs.readdirSync(templateDir)) {
  if (file.startsWith('crimson-') && file.endsWith('.yml') && !desiredTemplates.has(file)) fs.rmSync(path.join(templateDir, file));
}
fs.writeFileSync(path.join(siteDir, 'forms.json'), `${JSON.stringify(forms, null, 2)}\n`);
console.log(`Built ${forms.length} Crimson form(s).`);
