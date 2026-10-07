/* Visual overviews and text links disclose result galleries in the document flow. */
document.documentElement.classList.add('editorial-preview');
const overviewData=window.SMD_FEATURE_OVERVIEWS;
const overviewImage=(v,alt,extra='')=>`<img src="${esc(v.src||v)}" ${v.width?`width="${v.width}" height="${v.height}"`:''} alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
function generationOverview(){return `<div class="overview-stage generation-glance"><div class="glance-columns">${[0,1,2].map(col=>`<div class="glance-column">${overviewData.gallery.slice(col*3,col*3+3).map(v=>`<div class="glance-tile">${overviewImage(v,v.title)}</div>`).join('')}</div>`).join('')}</div><div class="glance-frost frost-top" aria-hidden="true"></div><div class="glance-frost frost-bottom" aria-hidden="true"></div></div>`}
function editingOverview(){const e=overviewData.editing;return `<div class="overview-stage editing-glance"><div class="edit-instruction"><p>“Transform deep winter into late spring.”</p></div><div class="edit-paper"><div class="edit-comparison" style="--edit-split:50%"><div class="edit-comparison-media">${overviewImage(e.after,'Edited mountain cabin in spring','class="edit-result-image"')}${overviewImage(e.before,'Source mountain cabin in winter','class="edit-source-image"')}</div><div class="edit-divider" aria-hidden="true"><span>‹ ›</span></div><input class="edit-scrubber" type="range" min="0" max="100" value="50" aria-label="Image editing comparison" aria-valuetext="50 percent source image"></div></div></div>`}
function shapeOverview(){const s=overviewData.shape;return `<div class="overview-stage shape-glance"><div class="shape-video-print"><video class="overview-motion-media" data-src="${esc(s.video)}" poster="${esc(s.poster.src)}" muted playsinline loop preload="none" aria-label="Two generated 3D turntables rotating side by side"></video></div></div>`}
function videoOverview(){return `<div class="overview-stage video-glance"><div class="film-stack">${overviewData.strips.map((strip,row)=>`<div class="film-strip film-strip-${row}">${strip.frames.map((src,i)=>`<div class="film-frame">${overviewImage(src,`${strip.title}, moment ${i+1}`)}</div>`).join('')}</div>`).join('')}</div></div>`}
function causalOverview(){const c=window.SMD_CAUSAL_OVERVIEW;return `<div class="overview-stage causal-glance"><div class="causal-time-band" aria-hidden="true"></div><div class="causal-frame causal-frame-early">${overviewImage(c.frames[0],'An earlier moment from the causal video')}</div><div class="causal-frame causal-frame-middle">${overviewImage(c.frames[1],'A middle moment from the causal video')}</div><div class="causal-frame causal-frame-current"><video class="overview-motion-media" data-src="${esc(c.video)}" poster="${esc(c.poster)}" muted playsinline loop preload="none" aria-label="Causal video generation result"></video></div></div>`}
function audioOverview(){const a=overviewData.audio,width=640,baseline=72,scale=47,step=width/(a.amplitudes.length-1),top=a.amplitudes.map((value,index)=>`${index?'L':'M'}${(index*step).toFixed(1)} ${(baseline-value*scale).toFixed(1)}`).join(' '),bottom=[...a.amplitudes].reverse().map((value,index)=>`L${(width-index*step).toFixed(1)} ${(baseline+value*scale).toFixed(1)}`).join(' '),area=`${top} ${bottom} Z`;return `<div class="overview-stage audio-glance"><div class="audio-cinema"><video class="overview-motion-media" data-src="${esc(a.video)}" poster="${esc(a.poster.src)}" muted playsinline loop preload="none" aria-label="Joint audio–video generation result"></video><div class="audio-field" aria-hidden="true"><i></i><i></i><i></i></div></div><svg class="audio-ribbon" viewBox="0 0 640 144" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="audio-ribbon-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#78a6bd" stop-opacity=".38"/><stop offset=".48" stop-color="#4d86aa" stop-opacity=".92"/><stop offset=".78" stop-color="#d6a260" stop-opacity=".9"/><stop offset="1" stop-color="#e9c58d" stop-opacity=".38"/></linearGradient><filter id="audio-ribbon-glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path class="audio-ribbon-shadow" d="${area}"/><path class="audio-ribbon-shape" d="${area}"/></svg></div>`}
function multimodalOverview(){
 const m=overviewData.multimodal;
 const out=m.outputs.find(v=>v.nfe===4);
 const summary=(m.prompt.match(/summary:\s*\n([^\n]+)/i)||[])[1]||'An explorer combines motion, a lantern, and an ice-cave scene.';
 const videoRef=m.references.find(v=>v.kind==='video');
 const imageRefs=m.references.filter(v=>v.kind==='image');
 return `<div class="overview-stage multimodal-glance">
  <div class="multimodal-source-stack">
   <div class="multimodal-source multimodal-stack-video multimodal-plane"><span>Video</span><video class="overview-motion-media" data-src="${esc(videoRef.src)}" poster="${esc(videoRef.poster)}" muted playsinline loop preload="none" aria-label="${esc(videoRef.label)}"></video></div>
   <div class="multimodal-prompt-card multimodal-stack-text multimodal-plane"><span>Text</span><p>${esc(summary)}</p></div>
   <div class="multimodal-image-stack" aria-label="Two image references">${imageRefs.map((v,i)=>`<div class="multimodal-source multimodal-stack-image-${i} multimodal-plane"><span>${i?'Image':'Images'}</span>${overviewImage(v,`${v.label} for ${m.title}`)}</div>`).join('')}</div>
  </div>
  <svg class="multimodal-brush-arrow" viewBox="0 0 280 330" aria-hidden="true">
   <defs>
    <linearGradient id="multimodal-video-flow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f91aa" stop-opacity=".5"/><stop offset="1" stop-color="#4b7fa4"/></linearGradient>
    <linearGradient id="multimodal-text-flow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#907f9e" stop-opacity=".5"/><stop offset="1" stop-color="#567fa1"/></linearGradient>
    <linearGradient id="multimodal-image-flow" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5a9b96" stop-opacity=".5"/><stop offset="1" stop-color="#4f81a3"/></linearGradient>
    <linearGradient id="multimodal-merged-flow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f81a3"/><stop offset=".62" stop-color="#788f9e"/><stop offset="1" stop-color="#c99261"/></linearGradient>
   </defs>
   <g class="multimodal-flow-ribbons"><path class="multimodal-flow-video" d="M5 53 C72 55 84 132 143 158"/><path class="multimodal-flow-text" d="M5 164 C70 164 105 164 143 164"/><path class="multimodal-flow-image" d="M5 275 C72 272 84 196 143 170"/></g>
   <path class="multimodal-merged-flow" d="M138 157 C174 153 210 153 244 156 L238 143 C254 149 268 157 280 164 C268 171 254 179 238 185 L244 172 C210 175 174 175 138 171 Z"/>
  </svg>
  <div class="multimodal-output multimodal-plane"><video class="overview-motion-media" data-src="${esc(out.src)}" poster="${esc(out.poster)}" muted playsinline loop preload="none" aria-label="Multimodal generation output"></video></div>
 </div>`;
}
function crossOverview(){const pair=['4B → 4B','9B → 4B'].map(label=>overviewData.cross.find(v=>v.label===label));return `<div class="overview-stage cross-glance"><div class="transfer-flow"><figure class="transfer-result">${overviewImage(pair[0],'Four-billion-parameter student distilled from its matching teacher')}<figcaption><strong>4B teacher → 4B student</strong></figcaption></figure><div class="transfer-arrow" aria-hidden="true"><span>Learning from a<br>different teacher</span><svg viewBox="0 0 120 40"><defs><marker id="cross-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/></marker></defs><path d="M4 20 H112" marker-end="url(#cross-arrowhead)"/></svg></div><figure class="transfer-result">${overviewImage(pair[1],'The same four-billion-parameter student distilled from a nine-billion-parameter teacher')}<figcaption><strong>9B teacher → 4B student</strong></figcaption></figure></div></div>`}
function multiOverview(){return `<div class="overview-stage multi-glance"><div class="multi-flow"><div class="specialist-results">${overviewData.multi.specialists.map(v=>`<figure class="specialist-result">${overviewImage(v,`${v.label} specialist-distilled output`)}<figcaption>${esc(v.label)}</figcaption></figure>`).join('')}</div><div class="multi-merge" aria-hidden="true"><svg viewBox="0 0 130 300"><defs><marker id="multi-arrowhead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="currentColor"/></marker></defs><path d="M2 35 Q48 35 62 150 M2 105 Q48 105 62 150 M2 195 Q48 195 62 150 M2 265 Q48 265 62 150 M62 150 H122" marker-end="url(#multi-arrowhead)"/></svg></div><figure class="multi-result">${overviewImage(overviewData.multi.ours,'Output from the multi-teacher student')}<figcaption>${esc(overviewData.multi.ours.label)}</figcaption></figure></div></div>`}
const multimodalSection=document.createElement('section');
multimodalSection.id='multimodal';multimodalSection.className='section';
const multimodalData=overviewData.multimodal,multimodalCases=multimodalData.cases||[multimodalData];
let multimodalCaseIndex=0,multimodalNfe=4;
multimodalSection.innerHTML=`<div class="section-heading"><div><h2>Multimodal Generation</h2></div></div><div id="multimodal-gallery-results"></div>`;
document.querySelector('#audio').after(multimodalSection);visibilityObserver.observe(multimodalSection);
const multimodalGallery=$('#multimodal-gallery-results');
const multimodalSummary=c=>{const explicit=(c.prompt.match(/summary:\s*\n([^\n]+)/i)||[])[1];if(explicit)return explicit;const integrated=(c.prompt.match(/integrated_multimodal_description:\s*([^\n]+)/i)||[])[1]||c.prompt;return(integrated.match(/^.*?[.!?](?=\s|$)/)||[])[0]||integrated.slice(0,220)};
const multimodalReference=v=>v.kind==='video'?vid(v,`Video · ${v.label}`,'multimodal-reference-card'):`<figure class="media-card multimodal-reference-card">${image(v.src,`Image reference: ${v.label}`)}<figcaption><span>Image</span>${esc(v.label)}</figcaption></figure>`;
const multimodalOutput=v=>`<figure class="media-card ${v.family==='dmd'?'baseline':'ours'}"><div class="video-wrap" style="aspect-ratio:${v.width}/${v.height}"><video controls playsinline preload="none" data-src="${esc(v.src)}" data-poster="${esc(v.poster)}" aria-label="${esc(v.label)}"></video><button class="video-start" aria-label="Play ${esc(v.label)}">▶</button></div><figcaption>${esc(v.label)}</figcaption></figure>`;
function releaseMultimodalGallery(){multimodalGallery.querySelectorAll('video').forEach(v=>{v.pause();releaseVideoSource(v);posterObserver.unobserve(v)});multimodalGallery.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img))}
function renderMultimodalGallery(){
 releaseMultimodalGallery();const c=multimodalCases[multimodalCaseIndex],active=c.outputs.filter(v=>v.nfe===multimodalNfe),ordered=c.kind==='t2va'?['ours','dmd'].map(family=>active.find(v=>v.family===family)).filter(Boolean):[active[0]||c.outputs[0]],out=ordered[0],position=multimodalCaseIndex+1;
 multimodalGallery.innerHTML=`<div class="multimodal-case-heading"><h3>${esc(c.title)}</h3><span class="multimodal-case-count" role="status" aria-live="polite">${position} / ${multimodalCases.length}</span></div><div class="multimodal-nfe-tabs" role="tablist" aria-label="Sampling steps">${[4,8].map(nfe=>`<button type="button" role="tab" aria-selected="${nfe===multimodalNfe}" tabindex="${nfe===multimodalNfe?0:-1}" data-multimodal-nfe="${nfe}" aria-controls="multimodal-active-output">${nfe} NFE</button>`).join('')}</div><div class="condition-composition ${out.height>out.width?'is-portrait':''}">${c.references.length?`<div class="condition-inputs"><p class="condition-heading">Reference inputs</p><div class="multimodal-reference-strip">${c.references.map(multimodalReference).join('')}</div></div>`:''}<div class="condition-output"><p class="condition-heading">Generated video</p><div id="multimodal-active-output" class="multimodal-gallery-output video-group ${ordered.length>1?'is-comparison ':''}${out.height>out.width?'is-portrait':out.height===out.width?'is-square':''}" role="tabpanel" aria-label="${multimodalNfe} NFE results">${ordered.map(multimodalOutput).join('')}</div></div></div><details class="prompt"><summary>Prompt</summary><pre>${esc(c.prompt)}</pre></details><div class="multimodal-case-nav"><button type="button" data-multimodal-step="-1" aria-label="Previous multimodal case">‹</button><span>${position} / ${multimodalCases.length}</span><button type="button" data-multimodal-step="1" aria-label="Next multimodal case">›</button></div>`;
 prepareMedia();minimalLabels(multimodalGallery);modernizePrompts(multimodalGallery,multimodalSummary(c));updatePlaybackControls();
}
multimodalGallery.addEventListener('click',event=>{const tab=event.target.closest('[data-multimodal-nfe]'),step=event.target.closest('[data-multimodal-step]');if(tab){const nfe=Number(tab.dataset.multimodalNfe);if(nfe!==multimodalNfe){multimodalNfe=nfe;renderMultimodalGallery()}}else if(step){multimodalCaseIndex=(multimodalCaseIndex+Number(step.dataset.multimodalStep)+multimodalCases.length)%multimodalCases.length;renderMultimodalGallery();multimodalGallery.querySelector(`[data-multimodal-step="${step.dataset.multimodalStep}"]`)?.focus({preventScroll:true})}});
multimodalGallery.addEventListener('keydown',event=>{const tab=event.target.closest('[data-multimodal-nfe]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();multimodalNfe=event.key==='Home'?4:event.key==='End'?8:multimodalNfe===4?8:4;renderMultimodalGallery();multimodalGallery.querySelector(`[data-multimodal-nfe="${multimodalNfe}"]`)?.focus()}});
renderMultimodalGallery();
const overviewSpecs=[
 {section:'explore',direction:'visual-left',visual:generationOverview,copy:'Text-to-image generation provides a well-established setting for studying distillation. We examine what a student retains—composition, fine detail, and variation—when a long sampling trajectory is reduced to four evaluations.'},
 {section:'editing',direction:'visual-right',visual:editingOverview,copy:'Editing asks for change without losing the original scene. Few-step distillation must preserve the input while following a new instruction, from a local adjustment to a change of season.'},
 {section:'shape',direction:'visual-left',visual:shapeOverview,copy:'A generated shape has to hold together beyond a single view. We compare few-step 3D generation through rendered turntables, examining shape and appearance across viewpoints.'},
 {section:'video',direction:'visual-right',visual:videoOverview,copy:'Motion adds another dimension to distillation. A video model must retain appearance as subjects move and the camera changes its view. We compare few-step generation across scenes with different kinds of motion.'},
 {section:'causal',direction:'visual-left',visual:causalOverview,copy:'Causal generation produces a video progressively through time. We compare Ours with Causal Forcing and DMD† on the same prompts, using synchronized playback to inspect motion and temporal consistency.'},
 {section:'audio',direction:'visual-left',visual:audioOverview,copy:'Sound and motion unfold together. We examine few-step distillation for joint audio–video generation, with original soundtracks available alongside each video comparison.'},
 {section:'multimodal',direction:'visual-right',visual:multimodalOverview,copy:'Images and videos jointly define appearance, motion, objects, and scene. We distill these multimodal conditions into few-step audio–video generation.'},
 {section:'transfer',direction:'visual-right',visual:crossOverview,copy:'A teacher need not share its student’s architecture. We study distillation across model sizes and model families, comparing what different teachers bring to a four-step student.'},
 {section:'multi-teacher',direction:'visual-left',visual:multiOverview,copy:'Different teachers emphasize different qualities. Routed supervision brings their strengths into one student, without requiring a collection of teachers at inference time.'}
];
function pauseResultContent(panel){panel.querySelectorAll('[data-sync]').forEach(b=>{cancelAuto(b.dataset.sync);cancelPlayback(b.dataset.sync)});panel.querySelectorAll('video').forEach(v=>{v.pause();releaseVideoSource(v)});updatePlaybackControls()}
// Comparisons remain opt-in, including after case changes and tab restoration.
const scheduleBeforeInlineResults=scheduleComparison;
scheduleComparison=function(id){if(document.getElementById(id)?.closest('.results-panel'))return;scheduleBeforeInlineResults(id)};
const inlineResults=new Map();
const resultVisibility=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting)pauseResultContent(entry.target)},{threshold:0});
// Move once after layout, without a long animated scroll through other chapters.
const resultScrollBehavior=()=> 'instant';
for(const spec of overviewSpecs){
 const section=$('#'+spec.section),heading=section.querySelector('.section-heading')||section.querySelector('#multi-title').parentElement,title=heading.querySelector('h2'),holder=spec.section==='multi-teacher'?section:heading.parentElement;
 if(!title)throw new Error('Overview title missing: '+spec.section);const titleText=title.textContent,nodes=[...holder.children];
 const panelId=spec.section+'-details',titleId=title.id||spec.section+'-overview-title';title.id=titleId;
 const row=document.createElement('div');row.className='task-overview '+spec.direction;row.id=spec.section+'-overview';row.innerHTML=`<div class="overview-copy"><p class="overview-intro">${esc(spec.copy)}</p><button type="button" class="overview-link" aria-expanded="false" aria-controls="${panelId}"><span class="overview-link-label">View results</span><span class="overview-link-icon" aria-hidden="true">＋</span></button></div><div class="overview-visual">${spec.section==='editing'?`<div class="overview-interactive" role="group" aria-label="Interactive image editing comparison">${spec.visual()}</div>`:`<button type="button" class="overview-trigger" aria-label="View ${esc(titleText)} results" aria-expanded="false" aria-controls="${panelId}">${spec.visual()}</button>`}</div>`;row.querySelector('.overview-copy').prepend(title);
 const panel=document.createElement('div');panel.className='results-panel';panel.id=panelId;panel.hidden=true;panel.tabIndex=-1;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',titleId);panel.innerHTML=`<div class="results-toolbar"><span class="results-label">Results</span><button type="button" class="results-collapse" aria-label="Hide ${esc(titleText)} results">Hide results <span aria-hidden="true">−</span></button></div><div class="results-content"></div><div class="results-end"><button type="button" class="results-collapse">Hide results <span aria-hidden="true">−</span></button></div>`;
 for(const node of nodes)panel.querySelector('.results-content').append(node);heading.classList.add('comparison-heading');holder.append(row,panel);
 const triggers=[...row.querySelectorAll('[aria-expanded]')],link=row.querySelector('.overview-link');
 const scrubber=row.querySelector('.edit-scrubber');if(scrubber)scrubber.addEventListener('input',()=>{scrubber.closest('.edit-comparison').style.setProperty('--edit-split',scrubber.value+'%');scrubber.setAttribute('aria-valuetext',scrubber.value+' percent source image')});
 function setExpanded(expanded,{focus=true,scroll=true}={}){
  if(expanded===!panel.hidden)return;
  panel.hidden=!expanded;row.classList.toggle('is-expanded',expanded);
  triggers.forEach(button=>button.setAttribute('aria-expanded',String(expanded)));
  link.querySelector('.overview-link-label').textContent=expanded?'Hide results':'View results';
  link.querySelector('.overview-link-icon').textContent=expanded?'−':'＋';
  row.querySelector('.overview-trigger')?.setAttribute('aria-label',`${expanded?'Hide':'View'} ${title.textContent} results`);
  if(expanded){
   for(const id of autoplayTimers.keys())cancelAuto(id);
   row.querySelectorAll('video').forEach(video=>{const state=overviewMotionStates.find(s=>s.video===video);if(state)stopMotionPreview(state,true)});
   prepareMedia();if(focus)panel.focus({preventScroll:true});
   if(scroll)panel.scrollIntoView({block:'start',behavior:resultScrollBehavior()});
  }else{
   pauseResultContent(panel);panel.querySelectorAll('details[open]').forEach(details=>closeDisclosure(details));
   if(focus)link.focus({preventScroll:true});
   if(scroll)row.scrollIntoView({block:'start',behavior:resultScrollBehavior()});
   if(!document.hidden)void startOverviewMotion();
  }
 }
 triggers.forEach(button=>button.addEventListener('click',()=>setExpanded(panel.hidden)));
 panel.querySelectorAll('.results-collapse').forEach(button=>button.addEventListener('click',()=>setExpanded(false)));
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')){event.preventDefault();setExpanded(false)}});
 // Observe the individual galleries, not the tall expanded chapter. Scrolling
 // to benchmarks must stop comparisons even while the chapter is still visible.
 panel.querySelectorAll('.case-carousel,#multimodal-gallery-results').forEach(gallery=>resultVisibility.observe(gallery));
 inlineResults.set(panelId,{panel,setExpanded});
}
// Silent overview videos loop automatically while visible; no extra playback UI.
const overviewMotionStates=[...document.querySelectorAll('.overview-motion-media')].map(video=>({video,inView:false,job:0}));
function canPreviewOverview(state){return !document.hidden&&state.inView&&allowAutoMotion()&&!state.video.closest('.task-overview')?.classList.contains('is-expanded')&&!document.querySelector('dialog[open]')}
async function startMotionPreview(state){if(!canPreviewOverview(state))return;const job=++state.job;try{state.video.muted=true;state.video.loop=true;await ensureVideoSource(state.video);if(job===state.job&&canPreviewOverview(state))await state.video.play()}catch{}}
function stopMotionPreview(state,release=false){state.job++;state.video.pause();if(release)releaseVideoSource(state.video)}
function startOverviewMotion(target=null){return Promise.allSettled(overviewMotionStates.filter(state=>!target||state===target).map(state=>startMotionPreview(state)))}
function stopOverviewMotion(release=false,target=null){overviewMotionStates.filter(state=>!target||state===target).forEach(state=>stopMotionPreview(state,release))}
for(const state of overviewMotionStates){const observer=new IntersectionObserver(entries=>{state.inView=entries[0].isIntersecting;if(state.inView)void startMotionPreview(state);else stopMotionPreview(state,true)},{threshold:.35});observer.observe(state.video.closest('.overview-stage'))}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopOverviewMotion(true);for(const {panel}of inlineResults.values())if(!panel.hidden)pauseResultContent(panel)}else void startOverviewMotion()});
// Shared links can address a chapter's results or a benchmark without a modal.
function openLinkedResults(){
 let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
 const target=document.getElementById(id),panel=target?.closest('.results-panel');
 if(!panel)return;inlineResults.get(panel.id)?.setExpanded(true,{focus:false,scroll:false});
 requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
addEventListener('hashchange',openLinkedResults);requestAnimationFrame(openLinkedResults);
