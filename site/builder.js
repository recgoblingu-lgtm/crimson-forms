const questionsRoot = document.querySelector('#questions');
let questionNumber = 0;
function addQuestion(question = {}) {
  questionNumber += 1;
  const box = document.createElement('div'); box.className = 'question-card';
  const head = document.createElement('div'); head.className = 'question-card-top';
  const title = document.createElement('strong'); title.textContent = `QUESTION ${questionsRoot.children.length + 1}`;
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-question'; remove.textContent = 'Remove'; remove.onclick = () => { box.remove(); renumber(); refreshPreview(); };
  head.append(title, remove);
  const grid = document.createElement('div'); grid.className = 'question-grid';
  const label = document.createElement('input'); label.className = 'q-label'; label.maxLength = 80; label.placeholder = 'Question label'; label.value = question.label || '';
  const type = document.createElement('select'); type.className = 'q-type';
  [['input','Short answer'],['textarea','Long answer'],['dropdown','Dropdown'],['checkboxes','Checkboxes']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(question.type===v)o.selected=true;type.append(o);});
  grid.append(label,type);
  const desc = document.createElement('textarea'); desc.className='q-description'; desc.rows=2; desc.placeholder='Optional help text'; desc.value=question.description||'';
  const placeholder = document.createElement('input'); placeholder.className='q-placeholder text-input'; placeholder.maxLength=100; placeholder.placeholder='Optional answer hint'; placeholder.value=question.placeholder||'';
  const options = document.createElement('textarea'); options.className='q-options text-input'; options.rows=3; options.placeholder='For dropdowns/checklists, put one option on each line'; options.value=Array.isArray(question.options)?question.options.join('\n'):'';
  const requiredRow = document.createElement('label'); requiredRow.className='required-row';
  const required = document.createElement('input'); required.type='checkbox'; required.className='q-required'; required.checked=question.required!==false;
  requiredRow.append(required, document.createTextNode('Required question'));
  box.append(head,grid,desc,placeholder,options,requiredRow); questionsRoot.append(box);
  type.onchange = () => { syncQuestionControls(box); refreshPreview(); };
  box.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input',refreshPreview));
  syncQuestionControls(box); renumber(); refreshPreview();
}
function syncQuestionControls(box) {
  const type=box.querySelector('.q-type').value;
  box.querySelector('.q-options').hidden=!['dropdown','checkboxes'].includes(type);
  box.querySelector('.q-placeholder').hidden=!['input','textarea'].includes(type);
}
function renumber(){[...questionsRoot.children].forEach((box,i)=>box.querySelector('strong').textContent=`QUESTION ${i+1}`);}
function makeDefinition(){
  const slug=document.querySelector('#slug').value.trim().toLowerCase();
  const title=document.querySelector('#title').value.trim();
  const description=document.querySelector('#description').value.trim();
  const questions=[...questionsRoot.children].map((box,i)=>{
    const label=box.querySelector('.q-label').value.trim(); const type=box.querySelector('.q-type').value;
    const q={id:`question-${i+1}`,type,label,required:box.querySelector('.q-required').checked};
    const desc=box.querySelector('.q-description').value.trim();if(desc)q.description=desc;
    const placeholder=box.querySelector('.q-placeholder').value.trim();if(placeholder&&['input','textarea'].includes(type))q.placeholder=placeholder;
    if(['dropdown','checkboxes'].includes(type))q.options=box.querySelector('.q-options').value.split('\n').map(s=>s.trim()).filter(Boolean);
    return q;
  });
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a URL name with lowercase letters, numbers, and hyphens only.');
  if(!title) throw new Error('Add a form title.'); if(!description) throw new Error('Add a short description.');
  if(!questions.length) throw new Error('Add at least one question.');
  questions.forEach((q,i)=>{if(!q.label)throw new Error(`Add a label for question ${i+1}.`);if(['dropdown','checkboxes'].includes(q.type)&&q.options.length<2)throw new Error(`Add at least two options for question ${i+1}.`);});
  return {slug,title,description,questions};
}
function refreshPreview(){
  const title=document.querySelector('#title').value.trim()||'Untitled form';
  document.querySelector('#preview-title').textContent=title;
  document.querySelector('#preview-description').textContent=document.querySelector('#description').value.trim()||'Add a short description.';
  const root=document.querySelector('#preview-questions');root.replaceChildren();
  [...questionsRoot.children].forEach(box=>{
    const wrap=document.createElement('div');wrap.className='preview-question';
    const label=document.createElement('label');label.textContent=box.querySelector('.q-label').value||'Question label';wrap.append(label);
    const type=box.querySelector('.q-type').value;
    if(type==='dropdown'||type==='checkboxes'){const opts=document.createElement('div');opts.className='preview-options';const values=box.querySelector('.q-options').value.split('\n').map(x=>x.trim()).filter(Boolean);opts.textContent=values.length?values.join(' · '):'Options will appear here';wrap.append(opts);}else{const line=document.createElement('div');line.className='preview-line';line.textContent=type==='textarea'?'Long answer…':'Short answer…';wrap.append(line);}
    root.append(wrap);
  });
}
document.querySelector('#add-question').onclick=()=>addQuestion();
document.querySelector('#generate').onclick=()=>{
  const result=document.querySelector('#result');const status=document.querySelector('#status-message');
  try{const definition=makeDefinition();document.querySelector('#json-output').value=JSON.stringify(definition,null,2);result.hidden=false;status.textContent='Copy this JSON, then open the GitHub Actions save workflow and paste it into the form_json field.';result.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(err){result.hidden=false;status.textContent=err.message;status.style.color='#a71930';}
};
document.querySelector('#copy-json').onclick=async()=>{const output=document.querySelector('#json-output');try{await navigator.clipboard.writeText(output.value);document.querySelector('#status-message').textContent='Copied. Now open the save workflow, choose Run workflow, and paste into form_json.';}catch{output.select();document.execCommand('copy');document.querySelector('#status-message').textContent='Copied. Paste the JSON into the GitHub Actions form_json field.';}};
['slug','title','description'].forEach(id=>document.querySelector(`#${id}`).addEventListener('input',refreshPreview));
addQuestion({label:'What would you like to share?',type:'textarea',required:true});
