export function validateForm(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Form definition must be a JSON object.');
  const slug = String(value.slug || '').trim().toLowerCase();
  const title = String(value.title || '').trim();
  const description = String(value.description || '').trim();
  const questions = value.questions;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('slug must use lowercase letters, numbers, and hyphens.');
  if (!title || title.length > 80) throw new Error('title is required and must be 80 characters or fewer.');
  if (!description || description.length > 200) throw new Error('description is required and must be 200 characters or fewer.');
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 20) throw new Error('questions must contain between 1 and 20 items.');
  const seen = new Set();
  const normalized = questions.map((question, index) => {
    const id = String(question.id || `question-${index + 1}`).trim().toLowerCase();
    const label = String(question.label || '').trim();
    const type = String(question.type || 'input');
    const required = Boolean(question.required);
    if (!/^[a-z][a-z0-9_-]{0,39}$/.test(id)) throw new Error(`Question ${index + 1}: id must start with a letter and contain only letters, numbers, _ or -.`);
    if (seen.has(id)) throw new Error(`Question id "${id}" is duplicated.`);
    seen.add(id);
    if (!label || label.length > 80) throw new Error(`Question ${index + 1}: label is required and must be 80 characters or fewer.`);
    if (!['input', 'textarea', 'dropdown', 'checkboxes'].includes(type)) throw new Error(`Question ${index + 1}: unsupported type "${type}".`);
    const out = { id, type, label, required };
    const descriptionText = String(question.description || '').trim();
    const placeholder = String(question.placeholder || '').trim();
    if (descriptionText) out.description = descriptionText.slice(0, 200);
    if (placeholder && ['input', 'textarea'].includes(type)) out.placeholder = placeholder.slice(0, 100);
    if (type === 'dropdown' || type === 'checkboxes') {
      const options = Array.isArray(question.options) ? question.options.map(x => String(x).trim()).filter(Boolean) : [];
      if (options.length < 2 || options.length > 20) throw new Error(`Question ${index + 1}: add between 2 and 20 options.`);
      if (new Set(options.map(x => x.toLowerCase())).size !== options.length) throw new Error(`Question ${index + 1}: options must be unique.`);
      if (options.some(x => x.length > 80)) throw new Error(`Question ${index + 1}: each option must be 80 characters or fewer.`);
      out.options = options;
    }
    return out;
  });
  return { slug, title, description, questions: normalized };
}

export function makeIssueTemplate(form) {
  const body = form.questions.map(q => {
    const item = { type: q.type, id: q.id, attributes: { label: q.label } };
    if (q.description) item.attributes.description = q.description;
    if (q.placeholder) item.attributes.placeholder = q.placeholder;
    if (q.type === 'dropdown') {
      item.attributes.options = q.options;
      item.attributes.multiple = false;
      item.attributes.default = 0;
    }
    if (q.type === 'checkboxes') item.attributes.options = q.options.map((label, i) => ({ label, required: q.required && i === 0 }));
    if (q.required && q.type !== 'checkboxes') item.validations = { required: true };
    return item;
  });
  return {
    name: form.title.slice(0, 64),
    description: form.description.slice(0, 200),
    title: `[Crimson] ${form.title}`.slice(0, 200),
    body
  };
}
