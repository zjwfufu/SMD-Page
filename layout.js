/* Isolated overlays and pre-sized media keep other sections stationary. */

// Independent, equally centered sections instead of nested width/spacing rules.
const referenceHeading=document.querySelector('#audio .subsection-heading');
if(referenceHeading){
  const referenceSection=document.createElement('section');
  referenceSection.id='reference-section';referenceSection.className='section';
  document.querySelector('#audio').after(referenceSection);
  while(referenceHeading.nextSibling)referenceSection.append(referenceHeading.nextSibling);
  referenceSection.prepend(referenceHeading);referenceHeading.className='section-heading';
  const oldTitle=referenceHeading.querySelector('h3'),title=document.createElement('h2');
  title.id='reference-title';title.textContent=oldTitle.textContent;oldTitle.replaceWith(title);
  referenceSection.setAttribute('aria-labelledby',title.id);
  visibilityObserver.observe(referenceSection);
}
const multiBlock=document.querySelector('#multi-teacher');
if(multiBlock){
  const multiSection=document.createElement('section');
  multiSection.id=multiBlock.id;multiSection.className='section multi-block';
  while(multiBlock.firstChild)multiSection.append(multiBlock.firstChild);
  document.querySelector('#transfer').after(multiSection);multiBlock.remove();
  const oldTitle=multiSection.querySelector('h3'),title=document.createElement('h2');
  title.id='multi-title';title.textContent=oldTitle.textContent;oldTitle.replaceWith(title);
  multiSection.setAttribute('aria-labelledby',title.id);
}
const teaserCases=[state.av,state.images,D.wan.find(c=>c.id==='lantern_river_city_seed510102'),D.images.find(c=>c.id==='forest_nurse_log'),state.wan,D.av.find(c=>c.id==='case51')];
document.querySelectorAll('#teaser > .teaser-grid > figure').forEach((card,i)=>{
  const caption=card.querySelector('figcaption'),label=caption.textContent;
  card.classList.toggle('has-video',!!card.querySelector('video'));
  caption.classList.add('teaser-caption');
  caption.innerHTML=`<strong>${esc(label)}</strong><div class="teaser-prompt">${esc(teaserCases[i].prompt)}</div>`;
});
function closeDisclosure(details){details.open=false;details.querySelectorAll('video').forEach(video=>video.pause());const slide=details.closest('.carousel-slide');if(slide&&details.querySelector('video'))cancelPlayback(slide.id)}
function prepareDisclosures(root){
  root.querySelectorAll('details.prompt,details.protocol-note,details.extra-gallery,details.turntable-details').forEach(details=>{
    if(details.dataset.overlayReady)return;details.dataset.overlayReady='true';details.classList.add('overlay-disclosure');
    const summary=details.querySelector(':scope > summary'),panel=document.createElement('div');panel.className='disclosure-panel';
    [...details.childNodes].filter(node=>node!==summary).forEach(node=>panel.append(node));details.append(panel);
    details.addEventListener('toggle',()=>{
      if(!details.open){closeDisclosure(details);return}
      const box=summary.getBoundingClientRect(),spaceBelow=innerHeight-box.bottom;
      details.classList.toggle('opens-up',spaceBelow<Math.min(panel.scrollHeight,360)&&box.top>spaceBelow);
    });
  });
}
/* Reader-facing copy and controls: experimental IDs stay only in source data. */
const readerSections={
  explore:['Image Generation',`Comparison between Ours and Lightning on Qwen-Image, both at 4 NFE. Each method is one row; the four images are different samples of the same prompt, paired across methods. Use the side arrows or swipe to browse all ${available.images.length} prompts.`],
  editing:['Image Editing',`Comparison between Ours and Lightning on Qwen-Image-Edit-2511, both at 4 NFE. From left to right: input image, Lightning, and Ours, using the same editing instruction. Use the side arrows or swipe to browse all ${available.edits.length} examples.`],
  shape:['Image-to-3D Generation',`Results on Hunyuan3D 2.1 and TRELLIS.2. The input image is shown beside our generated asset; load the 3D viewer to rotate it, or open the turntables to compare with the full and reduced-step teachers. Use the side arrows or swipe to browse all ${available.shapes.length} examples.`],
  video:['Video Generation',`Comparison between Ours and AnyFlow on Wan2.1 14B T2V, both at 4 NFE. Each method is one row; each column pairs the same prompt across methods. Three different prompts are shown per page. Use the side arrows or swipe to browse all ${available.wan.length} prompts.`],
  audio:['Audio–Video Generation',`Comparison between Ours and LightX2V DMD on MiniMax H3, both at 8 NFE, using the same prompt. Listen to either audio track with the buttons below. Use the side arrows or swipe to browse all ${available.av.length} prompts.`],
  'reference-section':['Reference-Conditioned Generation',`Image- and video-conditioned audio–video generation with MiniMax H3 at 4 NFE. Reference inputs are shown on the left and our output on the right. Use the side arrows or swipe to browse all ${available.reference.length} examples.`],
  transfer:['Cross-Model Distillation',`Distillation across model sizes and architectures at 4 NFE. Each column is a teacher-to-student route, with two outputs for the same prompt. Use the side arrows or swipe to browse all ${available.cross.length} prompts.`]
};
for(const [id,[title,copy]] of Object.entries(readerSections)){
  const heading=document.querySelector('#'+id+' .section-heading');
  heading.querySelector('h2').textContent=title;
  let caption=heading.querySelector('.caption');
  if(!caption){caption=document.createElement('p');caption.className='caption';heading.append(caption)}
  caption.textContent=copy;
}
document.querySelector('#multi-title').textContent='Multi-Teacher Distillation';
const multiDescription=document.createElement('p');multiDescription.className='caption';
multiDescription.textContent='Four reward-specialized teachers—CLIPScore, GenEval, OCR, and PickScore—supervise one SD3.5-Medium student at 4 NFE. The table compares six metrics; bold and underlined values mark the best and second-best student results. The images below compare the teacher, individual specialists, and our multi-teacher student.';
document.querySelector('#multi-title').after(multiDescription);
document.querySelectorAll('.protocol-note,.extra-gallery').forEach(el=>el.remove());
function prepareReaderCase(group){
  const root=document.querySelector('#'+resultIds[group]);
  const cleanLabel=text=>text.replace(/\b[IEVTARCH]\d{2}\b\s*[·:]?\s*/g,'').replace(/,?\s*seed\s+\d+/gi,'').replace(/SMD(?: · ours)?/g,'Ours').replace(/\s+·\s+·\s+/g,' · ').trim();
  root.querySelectorAll('figcaption').forEach(el=>{el.textContent=cleanLabel(el.textContent)});
  root.querySelectorAll('[data-image]').forEach(el=>{
    el.dataset.alt=cleanLabel(el.dataset.alt);el.setAttribute('aria-label','Enlarge '+el.dataset.alt);
    el.querySelector('img').alt=el.dataset.alt;delete el.dataset.seed;
  });
  root.querySelectorAll('video[aria-label],.video-start[aria-label]').forEach(el=>el.setAttribute('aria-label',cleanLabel(el.getAttribute('aria-label'))));
  root.querySelectorAll('.turntable-details .fine-print').forEach(el=>el.remove());
  const turntableSummary=root.querySelector('.turntable-details summary');if(turntableSummary)turntableSummary.textContent='Compare turntables';
  const prompts=[...root.querySelectorAll('details.prompt:not([data-reader-ready])')];
  for(const original of prompts){
    const texts=[...original.querySelectorAll('pre')].map(el=>el.textContent.trim());
    const holder=document.createElement('div');holder.className='reader-prompts'+(group==='wan'?' reader-prompts-wan':'');
    for(const text of texts){
      if(text.length<=800&&text.split('\n').length<=8){
        const paragraph=document.createElement('p');paragraph.className='inline-prompt';paragraph.textContent=text;holder.append(paragraph);
      }else{
        const details=document.createElement('details');details.className='prompt prompt-long';details.dataset.readerReady='true';
        const summary=document.createElement('summary');summary.textContent='Read prompt';
        const pre=document.createElement('pre');pre.textContent=text;details.append(summary,pre);holder.append(details);
      }
    }
    original.replaceWith(holder);
  }
}
for(const group of Object.keys(resultIds))prepareReaderCase(group);
prepareDisclosures(document);
const changeCaseBeforeLayout=changeCase;
changeCase=function(group,code){
  document.querySelectorAll('#'+resultIds[group]+' details[open]').forEach(closeDisclosure);
  changeCaseBeforeLayout(group,code);prepareReaderCase(group);prepareDisclosures(document.querySelector('#'+resultIds[group]));
};
document.addEventListener('pointerdown',event=>{document.querySelectorAll('.overlay-disclosure[open]').forEach(details=>{if(!details.contains(event.target))closeDisclosure(details)})});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||document.querySelector('dialog[open]'))return;
  const open=[...document.querySelectorAll('.overlay-disclosure[open]')];if(!open.length)return;
  const focused=open.find(details=>details.contains(document.activeElement));open.forEach(closeDisclosure);focused?.querySelector('summary').focus();
});
