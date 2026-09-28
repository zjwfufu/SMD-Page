/* Framework-free, offline-capable result explorers. No media is prefetched. */
'use strict';

const D=window.SMD_DATA, selection=window.SMD_SELECTION;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefixes={images:'I',edits:'E',wan:'V',av:'A',reference:'R',cross:'C'};
for(const group of Object.keys(prefixes))D[group].forEach((c,i)=>c.code ||= prefixes[group]+String(i+1).padStart(2,'0'));
D.shapes.forEach((c,i)=>c.code ||= (c.model==='trellis2'?'T':'H')+String(i%10+1).padStart(2,'0'));
const available={};
for(const group of Object.keys(selection).filter(k=>k!=='defaults')){available[group]=selection[group]?selection[group].map(code=>D[group].find(c=>c.code===code)).filter(Boolean):D[group];if(!available[group].length)available[group]=D[group]}
const state={};
for(const group in available)state[group]=available[group].find(c=>c.code===selection.defaults[group])||available[group][0];
const image=(src,alt,cls='')=>{const size=window.SMD_MEDIA_SIZES?.[src]||[1000,1000],preview=window.SMD_IMAGE_PLACEHOLDERS?.[src]||'';return `<button class="image-button progressive-image ${cls}" style="aspect-ratio:${size[0]}/${size[1]};--preview:url('${preview}')" data-image="${esc(src)}" data-alt="${esc(alt)}" aria-label="Enlarge ${esc(alt)}" aria-busy="true"><img data-src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" width="${size[0]}" height="${size[1]}"><span class="image-loading-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="image-load-error" aria-hidden="true">Image unavailable · click to open</span></button>`};
const vid=(v,label,cls='')=>`<figure class="media-card ${cls}"><div class="video-wrap"><video controls playsinline preload="none" data-src="${esc(v.src)}" data-poster="${esc(v.poster)}" aria-label="${esc(label)}"></video><button class="video-start" aria-label="Play ${esc(label)}">▶</button></div><figcaption>${esc(label)}</figcaption></figure>`;
const picker=(group,label)=>`<div id="${group}-carousel" class="case-carousel" role="region" aria-roledescription="carousel" aria-label="${label}" data-carousel-group="${group}"></div>`;
const prompt=c=>`<details class="prompt"><summary>View exact prompt <span>${esc(c.code)}</span></summary><pre>${esc(c.prompt)}</pre></details>`;
$('#full-content').innerHTML=`
<section class="results-band" id="explore"><div class="section"><div class="section-heading"><div><div class="eyebrow">02 / IMAGE GENERATION</div><h2>Same prompt.<br>Room for variation.</h2></div><p>Distillation should preserve possibilities, not collapse them. Explore four matched seeds for each Qwen-Image prompt, side by side with Lightning.</p></div><div class="section-links"><a href="#editing">Image editing ↗</a><a href="#shape">3D generation ↗</a><a href="#video">Video ↗</a><a href="#audio">Audio + video ↗</a></div>${picker('images','Image case')}<div id="image-results"></div><p class="fine-print">Both methods: 4 Euler steps, same prompt, numerical seed and source resolution. The first column is the original gallery sample; three additional matched seeds follow. Selected examples illustrate variation, not a diversity benchmark by themselves.</p><details class="extra-gallery"><summary>Also explore FLUX.1-dev outputs <span>↗</span></summary>${image(D.flux,'FLUX.1-dev few-step generation gallery')}</details></div></section>
<section class="section" id="editing"><div class="section-heading"><div><div class="eyebrow">03 / IMAGE EDITING</div><h2>Change the detail.<br>Keep the intention.</h2></div><p>Follow an instruction while preserving the image around it. Source, Lightning, and SMD stay visible together—no slider hiding the context.</p></div>${picker('edits','Edit case')}<div id="edit-results"></div><p class="fine-print">Qwen-Image-Edit-2511 · both students at 4 NFE · matched per-case seeds. Training conditions on source images and instructions, without target edited-image supervision.</p></section>
<section class="shape-band" id="shape"><div class="section"><div class="section-heading"><div><div class="eyebrow">04 / 3D GENERATION</div><h2>From an image<br>into your hands.</h2></div><p>Inspect the actual generated asset. Rotate it, zoom into the geometry, or compare the recorded turntables. Model files load only when you ask.</p></div>${picker('shapes','3D asset')}<div id="shape-results"></div><p class="fine-print">Qualitative applicability study, not a quantitative 3D ranking. Hunyuan3D distills the shape stage. TRELLIS.2 distills the final high-resolution shape and texture stages (4 NFE each); sparse structure and coarse shape remain unchanged.</p></div></section>
<section class="section" id="video"><div class="section-heading"><div><div class="eyebrow">05 / VIDEO GENERATION</div><h2>Fewer steps.<br>Still moving.</h2></div><p>Watch the original Wan2.1-14B clips. Compare motion, composition, and color at 4 NFE; use synchronized playback or inspect each video independently.</p></div>${picker('wan','Video case')}<div id="wan-results"></div><p class="fine-print">SMD without Pivot: 08_25@200; SMD with Pivot: 08_13@1000. AnyFlow uses a newly generated public-release checkpoint, not a claimed bitwise reproduction of the benchmark run. Prompts match; the original Pivot turtle seed is unknown. Gallery preference is not a measured per-prompt VBench win.</p></section>
<section class="audio-band" id="audio"><div class="section"><div class="section-heading"><div><div class="eyebrow">06 / JOINT AUDIO–VIDEO</div><h2>A world to see.<br>And to hear.</h2></div><p>MiniMax H3 generates video and audio together. Play each clip with its native audio, or switch which side you hear during synchronized playback.</p></div>${picker('av','Audio–video case')}<div id="av-results"></div><p class="fine-print">These are the selected 8-NFE Figure 1 clips: SMD rep02k4@850 and DMD8 v1.0, as identified by the media catalog. The separate 4-NFE release evaluation is not an NFE ablation and is not attached to these clips.</p><div class="subsection-heading"><h3>Guided by a reference.</h3><p>Image- and video-conditioned generation at 4 NFE.</p></div>${picker('reference','Reference case')}<div id="reference-results"></div><p class="fine-print">Selected Ref2VA outputs use skip25@1000. All actual reference inputs are retained, including all three RDR2 images. These qualitative examples use a different checkpoint from the quantitative release evaluation.</p></div></section>
<section class="section" id="transfer"><div class="section-heading"><div><div class="eyebrow">07 / BEYOND SELF-DISTILLATION</div><h2>More than<br>one teacher.</h2></div><p>The same imitation objective can transfer across model sizes and architectures—or combine the strengths of multiple specialized teachers.</p></div><div class="subsection-heading"><h3>Cross-model transfer</h3><p>Four teacher → student routes. Two fixed seeds per route.</p></div>${picker('cross','Transfer case')}<div id="cross-results"></div><p class="fine-print">All students use 4 NFE. Matching numeric seeds across different latent architectures does not imply identical initial noise. A larger teacher improves most FLUX.2-klein-4B metrics, but only diversity and style for Lens; larger is not uniformly better.</p><div class="multi-block"><div><div class="eyebrow">FOUR EXPERTS → ONE STUDENT</div><h3>Bring complementary<br>strengths together.</h3><p>CLIPScore, GenEval, OCR, and PickScore teachers supervise one SD3.5-Medium student. Routing happens during training only; inference uses a single 4-NFE student.</p><a class="text-link inline" href="#benchmarks" id="multi-benchmark-link">Compare the six metrics ↗</a></div><div>${image(D.multi,'Multi-teacher comparison: teacher, self-distillation, four specialists and routed SMD')}<p class="fine-print">The report’s comparison panel. Click to inspect the column labels.</p></div></div></section>
<section class="benchmark-band" id="benchmarks"><div class="section"><div class="section-heading"><div><div class="eyebrow">08 / THE EVIDENCE</div><h2>Look at the numbers.<br>Keep the nuance.</h2></div><p>Explore the reported benchmark values one metric at a time. Every bar starts at zero; all displayed metrics are higher-is-better.</p></div><div class="benchmark-controls"><label>Model or setting<select id="benchmark-set">${Object.entries(SMD_METRICS).map(([k,v])=>`<option value="${k}">${v.title}</option>`).join('')}</select></label><label>Metric<select id="benchmark-metric"></select></label><a class="download-link" href="benchmarks.csv" download>Download all values ↓</a></div><div id="benchmark-chart" aria-live="polite"></div><details class="full-table"><summary>Show all metrics for this setting</summary><div id="benchmark-table" class="table-scroll"></div></details></div></section>
<section class="section" id="method"><div class="section-heading"><div><div class="eyebrow">09 / UNDER THE HOOD</div><h2>A simpler way<br>to learn the path.</h2></div><p>A frozen teacher supervises the trajectories the student actually visits. Training is richer; inference stays simple.</p></div><div class="method-steps"><article><span>01</span><h3>Follow the student</h3><p>Generate an on-policy rollout and directly match student velocities to teacher predictions along each coarse transition.</p></article><article><span>02</span><h3>Learn local variation</h3><p>A small Pivot network provides a proxy path to capture within-step velocity variation. It is used only during training.</p></article><article><span>03</span><h3>Learn what to avoid</h3><p>A repulsive regularizer uses weaker predictions from the same teacher as negative references alongside target imitation.</p></article></div><details class="method-figure"><summary>Open the method figure <span>↗</span></summary>${image(D.method,'SMD proxy-path and teacher-repulsion method figure')}</details><div class="closing-note"><span class="eyebrow">SIMPLIFIED MATCHING DISTILLATION</span><h2>Less machinery.<br>More possibility.</h2><p>Research across generative modalities, with the same simple starting point.</p><div class="release-note">Manuscript and code links will be added when released. No placeholder authors or publication links are presented here.</div></div></section>
<dialog id="image-dialog"><div class="dialog-toolbar"><span id="dialog-caption"></span><button id="close-dialog" aria-label="Close image">Close ×</button></div><img id="dialog-image" alt=""><a id="original-image" target="_blank" rel="noopener">Open image in new tab ↗</a></dialog>
`;

function renderImages(){const c=state.images,samples=[{seed:c.seed,ours:c.ours,baseline:c.baseline},...c.samples];$('#image-results').innerHTML=`<div class="diversity-grid">${[['Lightning','baseline'],['SMD · ours','ours']].map(([label,key])=>`<div class="diversity-row ${key}"><div class="row-label">${label}<small>4 NFE</small></div>${samples.map((s,i)=>image(s[key],`${label}, sample ${i+1}`)).join('')}</div>`).join('')}</div>${prompt(c)}`;}
function renderEdits(){const c=state.edits;$('#edit-results').innerHTML=`<div class="three-col">${[['Input image','input'],['Lightning · 4 NFE','baseline'],['SMD · 4 NFE','ours']].map(([label,key])=>`<figure class="media-card ${key}">${image(c[key],c.code+' '+label)}<figcaption>${label}</figcaption></figure>`).join('')}</div>${prompt(c)}`;}
let viewer=null,viewerVersion=0;
function renderShapes(){viewerVersion++;viewer?.dispose();viewer=null;const c=state.shapes;$('#shape-results').innerHTML=`<div class="shape-stage"><figure class="shape-input">${image(c.input,c.code+' conditioning image')}<figcaption>Conditioning image <span>${c.code}</span></figcaption></figure><div><div class="model-stage" id="model-stage"><img data-src="${c.routes.ours.poster}" alt="${esc(c.title)} 3D preview" loading="lazy"><button id="load-model" class="button primary">Load interactive 3D <span>↗</span></button><span class="model-badge">${c.model==='trellis2'?'TRELLIS.2 · textured asset':'Hunyuan3D 2.1 · shape'}</span></div><div class="viewer-toolbar"><span id="viewer-status" role="status">Click to load · drag to orbit · scroll / pinch to zoom</span><button id="reset-view" disabled>Reset view</button><button id="rotate-view" disabled aria-pressed="false">Auto-rotate</button><a href="${c.mesh}" download>Download asset ↓</a></div></div></div><details class="turntable-details"><summary>Compare recorded turntables <span>Input → full teacher / reduced-step teacher / SMD</span></summary><div class="three-col video-group">${vid(c.routes.teacher,'Full teacher')}${vid(c.routes.short,'Reduced-step teacher')}${vid(c.routes.ours,'SMD · distilled stages','ours')}</div><button class="sync-button" data-sync="shape-results">▶ Play together</button><p class="fine-print">Directory names are historical: the Hunyuan reduced-budget source records 5 sampler steps. These route labels are not a claim of identical end-to-end NFE. Original turntable videos are not re-rendered by this page.</p></details>`;
$('#load-model').onclick=async()=>{const version=viewerVersion,button=$('#load-model');button.disabled=true;button.textContent='Loading 3D…';$('#viewer-status').textContent='Loading the viewer and this model only…';try{if(location.protocol==='file:')throw new Error('Interactive 3D needs a local web server. Run npm start in project_page; the turntable videos work without it.');const{mountViewer}=await loadPublishedViewer();if(version!==viewerVersion)return;const result=await mountViewer($('#model-stage'),c.mesh,n=>{if(version===viewerVersion)$('#viewer-status').textContent=`Loading asset · ${n}%`});if(version!==viewerVersion){result.dispose();return}viewer=result;$('#viewer-status').textContent='Drag to orbit · scroll / pinch to zoom';$('#reset-view').disabled=false;$('#rotate-view').disabled=false}catch(e){if(version!==viewerVersion)return;$('#viewer-status').textContent=e.message;button.disabled=false;button.textContent='Retry interactive 3D';}};
$('#reset-view').onclick=()=>viewer?.reset();$('#rotate-view').onclick=function(){this.setAttribute('aria-pressed',String(viewer?.rotate()))};}
function wanCases(){return [state.wan]}
function renderWan(){const c=state.wan,portrait=c.height>c.width;const groups=portrait?`<div class="wan-portrait video-group">${c.samples.map(s=>`<div class="wan-sample-pair">${vid(s.baseline,'AnyFlow · 4 NFE')}${vid(s.ours,'Ours · 4 NFE','ours')}</div>`).join('')}</div>`:`<div class="wan-comparison video-group" style="--wan-ratio:${c.width} / ${c.height}">${[['AnyFlow','baseline'],['Ours','ours']].map(([label,key])=>`<div class="wan-row ${key}"><div class="row-label">${label}<small>4 NFE</small></div>${c.samples.map(s=>vid(s[key],label+' · 4 NFE',key)).join('')}</div>`).join('')}</div>`;$('#wan-results').innerHTML=groups+`<button class="sync-button" data-sync="wan-results">▶ Play together</button>`+prompt(c);}
function renderAv(){const c=state.av;$('#av-results').innerHTML=`<div class="two-col video-group">${vid(c.baseline,'LightX2V DMD · 8 NFE')}${vid(c.ours,'SMD · 8 NFE','ours')}</div><div class="playback-tools"><button class="sync-button" data-sync="av-results">▶ Play together (muted)</button><button data-listen="0">Listen to DMD</button><button data-listen="1">Listen to SMD</button></div>${prompt(c)}`;}
function renderReference(){const c=state.reference;$('#reference-results').innerHTML=`<div class="reference-layout"><div class="references">${c.references.map((r,i)=>r.kind==='video'?vid(r,'Video reference '+(i+1)):`<figure>${image(r.src,`${c.code} image reference ${i+1}`)}<figcaption>Image reference ${i+1}</figcaption></figure>`).join('')}</div>${vid(c.output,'SMD · '+c.code+' · 4 NFE','ours')}</div>${prompt(c)}`;}
function renderCross(){const c=state.cross,labels={'flux2_9b_to_4b':'FLUX.2 9B → 4B','flux2_4b_to_4b':'FLUX.2 4B → 4B','flux2_9b_to_lens':'FLUX.2 9B → Lens','lens_to_lens':'Lens → Lens'};$('#cross-results').innerHTML=`<div class="cross-grid">${Object.entries(labels).map(([key,label])=>`<div><h4>${label}</h4>${c.methods[key].map((src,i)=>`<div>${image(src,c.code+' '+label+' sample '+(i+1))}</div>`).join('')}</div>`).join('')}</div>${prompt(c)}`;}
const renders={images:renderImages,edits:renderEdits,shapes:renderShapes,wan:renderWan,av:renderAv,reference:renderReference,cross:renderCross};
const resultIds={images:'image-results',edits:'edit-results',shapes:'shape-results',wan:'wan-results',av:'av-results',reference:'reference-results',cross:'cross-results'};
for(const render of Object.values(renders))render();
for(const [group,id] of Object.entries(resultIds)){
  const carousel=$('#'+group+'-carousel'),results=$('#'+id),label=carousel.getAttribute('aria-label');
  carousel.innerHTML=`<div class="carousel-stage"><button class="carousel-arrow previous" data-step="-1" data-group="${group}" aria-label="Previous ${label}" aria-controls="${id}">‹</button><div class="carousel-slot"></div><button class="carousel-arrow next" data-step="1" data-group="${group}" aria-label="Next ${label}" aria-controls="${id}">›</button></div><div class="carousel-footer"><span class="case-page" role="status" aria-live="polite" aria-atomic="true"></span></div>`;
  carousel.querySelector('.carousel-slot').replaceWith(results);results.classList.add('carousel-slide');results.tabIndex=0;results.setAttribute('role','group');results.setAttribute('aria-roledescription','slide');
  updateCarousel(group);
}
function updateCarousel(group){
  const carousel=$('#'+group+'-carousel'),c=state[group],list=available[group],position=list.indexOf(c)+1;
  carousel.querySelector('.case-page').textContent=`${position} / ${list.length}`;
  carousel.querySelector('.case-page').setAttribute('aria-label',`${c.title}, ${position} of ${list.length}`);
  carousel.querySelector('.carousel-slide').setAttribute('aria-label',c.title);
  carousel.querySelectorAll('[data-step]').forEach(button=>{button.disabled=list.length<2});
}
// Bound URLs use preload=none; media downloads start on playback, posters near viewport.
function loadNearbyImage(img){
 const src=img.dataset.src;if(!src)return;
 const holder=img.closest('.progressive-image');
 holder?.classList.add('is-fetching');
 const ready=async()=>{
  try{await img.decode()}catch{}
  if(!img.isConnected)return;
  if(!img.naturalWidth){failed();return}
  holder?.classList.add('is-ready');holder?.classList.remove('is-fetching');
  holder?.setAttribute('aria-busy','false');
 };
 const failed=()=>{holder?.classList.add('has-error');holder?.classList.remove('is-fetching');holder?.setAttribute('aria-busy','false')};
 img.addEventListener('load',ready,{once:true});img.addEventListener('error',failed,{once:true});
 // IntersectionObserver is the loading gate; avoid a second browser lazy delay.
 img.loading='eager';img.src=src;img.removeAttribute('data-src');
 imageObserver.unobserve(img);
}
const imageObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)loadNearbyImage(entry.target)},{rootMargin:'400px'});
const posterObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const v=e.target;if(v.dataset.poster)v.poster=v.dataset.poster;posterObserver.unobserve(v)}},{rootMargin:'400px'});

function videoError(v,error){
  if(!v.isConnected||error?.name==='AbortError')return;
  const wrap=v.parentElement;let message=wrap.querySelector('.media-error');
  if(!message){message=document.createElement('div');message.className='media-error';wrap.append(message)}
  const code=v.error?.code;message.replaceChildren();
  const text=document.createElement('span');text.textContent=code===4?'This browser cannot decode this video. ':code===2?'Video download failed. ':'Playback failed. ';
  const link=document.createElement('a');link.href=v.dataset.src;link.target='_blank';link.rel='noopener';link.textContent='Open video ↗';message.append(text,link);
  const start=wrap.querySelector('.video-start');if(start){start.hidden=false;start.disabled=false;start.textContent='↻'}
}
function prepareMedia(){document.querySelectorAll('img[data-src]').forEach(img=>imageObserver.observe(img));document.querySelectorAll('video[data-poster]').forEach(v=>{
  posterObserver.observe(v);if(v.dataset.prepared)return;v.dataset.prepared='true';
  const start=v.parentElement.querySelector('.video-start');
  start.onclick=()=>{v.parentElement.querySelector('.media-error')?.remove();start.textContent='…';start.disabled=true;ensureVideoSource(v).then(()=>v.play()).catch(error=>videoError(v,error)).finally(()=>{start.disabled=false;if(v.paused)start.textContent='▶'})};
  for(const event of ['loadeddata','playing','error','emptied'])v.addEventListener(event,()=>v.parentElement?.classList.remove('is-loading'));
  v.addEventListener('playing',()=>{start.hidden=true;start.disabled=false;start.textContent='▶'});
  const stopped=()=>{start.hidden=false;start.disabled=false;start.textContent='▶'};
  v.addEventListener('pause',stopped);v.addEventListener('ended',stopped);
  v.addEventListener('play',()=>{if(!v.muted)document.querySelectorAll('video').forEach(other=>{if(other!==v)other.muted=true})});
  v.addEventListener('error',()=>videoError(v,v.error));
})}
prepareMedia();
function changeCase(group,code){const c=available[group].find(x=>x.code===code);if(!c)return;cancelPlayback(resultIds[group]);document.querySelectorAll('#'+resultIds[group]+' video').forEach(v=>{v.pause();releaseVideoSource(v);posterObserver.unobserve(v)});document.querySelectorAll('#'+resultIds[group]+' img[data-src]').forEach(img=>imageObserver.unobserve(img));state[group]=c;renders[group]();prepareMedia();minimalLabels($('#'+resultIds[group]));updatePlaybackControls();updateCarousel(group);}
function stepCase(group,direction){const list=available[group];changeCase(group,list[(list.indexOf(state[group])+direction+list.length)%list.length].code)}
document.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>stepCase(el.dataset.group,Number(el.dataset.step)));
// A swipe advances a whole comparison, never one model independently.
document.querySelectorAll('.case-carousel').forEach(carousel=>{
  let gesture=null,suppressClickUntil=0;
  const stage=carousel.querySelector('.carousel-stage'),group=carousel.dataset.carouselGroup;
  stage.addEventListener('pointerdown',e=>{
    if(!e.isPrimary){gesture=null;return}
    if(e.button!==0||e.target.closest('canvas,.model-stage,select,input,textarea,pre,.prompt,[data-step],[data-sync],[data-listen],.video-start,summary,a'))return;
    const video=e.target.closest('video');if(video&&e.clientY>video.getBoundingClientRect().bottom-50)return;
    if(e.target.closest('button')&&!e.target.closest('.image-button'))return;
    gesture={x:e.clientX,y:e.clientY,id:e.pointerId};
  });
  stage.addEventListener('pointerup',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;
    if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.5)return;
    suppressClickUntil=performance.now()+500;stepCase(group,dx<0?1:-1);
  });
  stage.addEventListener('pointercancel',()=>{gesture=null});
  stage.addEventListener('dragstart',e=>{if(e.target.closest('.image-button'))e.preventDefault()});
  stage.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
  carousel.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('video,canvas,input,textarea,select,button,a,summary'))return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stepCase(group,e.key==='ArrowLeft'?-1:1)}
  });
});

const playbackJobs=new Map();
function cancelPlayback(id){playbackJobs.get(id)?.abort();playbackJobs.delete(id)}
function updatePlaybackControls(){
  document.querySelectorAll('[data-sync]').forEach(button=>{
    const id=button.dataset.sync,videos=[...document.querySelectorAll('#'+id+' .video-group video')];
    const loading=playbackJobs.has(id),active=videos.some(v=>!v.paused&&!v.ended);
    button.textContent=loading?'Cancel loading ×':active?'Ⅱ Pause together':'▶ Play together';
    button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-busy',String(loading));
  });
  document.querySelectorAll('[data-listen]').forEach(button=>{
    const video=document.querySelectorAll('#av-results .video-group video')[Number(button.dataset.listen)];
    button.setAttribute('aria-pressed',String(!!video&&!video.paused&&!video.muted&&!video.ended));
  });
}
async function readyVideo(video,signal){
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  const cancel=()=>releaseVideoSource(video);signal.addEventListener('abort',cancel,{once:true});
  try{await ensureVideoSource(video)}finally{signal.removeEventListener('abort',cancel)}
  video.preload='auto';
  if(signal.aborted)return Promise.reject(new DOMException('Cancelled','AbortError'));
  if(video.readyState>=2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const cleanup=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',done);video.removeEventListener('error',fail);signal.removeEventListener('abort',abort)};
    const done=()=>{cleanup();resolve()},fail=()=>{cleanup();reject(new Error('Video failed to load'))},abort=()=>{cleanup();releaseVideoSource(video);reject(new DOMException('Cancelled','AbortError'))};
    const timer=setTimeout(fail,30000);
    video.addEventListener('loadeddata',done,{once:true});video.addEventListener('error',fail,{once:true});signal.addEventListener('abort',abort,{once:true});video.load();
  });
}
async function syncPlay(id,audio=-1){
  const videos=[...document.querySelectorAll('#'+id+' .video-group video')];if(!videos.length)return;
  if(playbackJobs.has(id)){cancelPlayback(id);videos.forEach(releaseVideoSource);updatePlaybackControls();return}
  const active=videos.some(v=>!v.paused&&!v.ended);
  if(active&&audio<0){videos.forEach(v=>v.pause());updatePlaybackControls();return}
  // Switching sound during comparison must not restart either clip.
  if(audio>=0&&videos.every(v=>!v.paused&&!v.ended)){
    document.querySelectorAll('video').forEach(v=>{v.muted=v!==videos[audio]});updatePlaybackControls();return;
  }
  const time=audio>=0?(videos.find(v=>!v.paused&&!v.ended)||videos[0]).currentTime:0;
  const job=new AbortController();playbackJobs.set(id,job);
  videos.forEach(v=>{v.pause();v.muted=true});updatePlaybackControls();
  try{
    await Promise.all(videos.map(v=>readyVideo(v,job.signal)));
    if(job.signal.aborted||videos.some(v=>!v.isConnected))return;
    if(audio>=0)document.querySelectorAll('video').forEach(v=>{v.muted=true});
    videos.forEach((v,i)=>{v.currentTime=v.ended?0:time;v.muted=i!==audio});
    await Promise.all(videos.map(v=>v.play()));
    if(job.signal.aborted||videos.some(v=>!v.isConnected))return;
    // Decoders can start at different times; align once all play promises resolve.
    const times=videos.map(v=>v.currentTime);
    if(Math.max(...times)-Math.min(...times)>.08){const common=Math.max(...times);videos.forEach(v=>{v.currentTime=common})}
  }catch(error){
    if(job.signal.aborted)return;
    videos.forEach(v=>v.pause());
    if(error.name!=='AbortError')videos.forEach(v=>videoError(v,error));
  }finally{if(playbackJobs.get(id)===job)playbackJobs.delete(id);updatePlaybackControls()}
}
for(const event of ['play','pause','ended','volumechange'])document.addEventListener(event,updatePlaybackControls,true);
updatePlaybackControls();
document.addEventListener('click',e=>{const sync=e.target.closest('[data-sync]');if(sync)syncPlay(sync.dataset.sync);const listen=e.target.closest('[data-listen]');if(listen)syncPlay('av-results',Number(listen.dataset.listen));});
// Stop videos that leave the screen; no autoplay or background downloads.
function stopSection(section){section.querySelectorAll('[data-sync]').forEach(b=>cancelPlayback(b.dataset.sync));section.querySelectorAll('video').forEach(v=>{v.pause();deferVideoRelease(v)});updatePlaybackControls()}
const visibilityObserver=new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting)stopSection(e.target)});document.querySelectorAll('section').forEach(s=>visibilityObserver.observe(s));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSection(document)});

const dialog=$('#image-dialog');
document.addEventListener('click',e=>{const target=e.target.closest('[data-image]');if(!target)return;$('#dialog-image').src=target.dataset.image;$('#dialog-image').alt=target.dataset.alt;$('#dialog-caption').textContent=target.dataset.alt;$('#original-image').href=target.dataset.image;dialog.showModal()});
$('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

function setBenchmark(){const b=SMD_METRICS[$('#benchmark-set').value];$('#benchmark-metric').innerHTML=b.metrics.map((m,i)=>`<option value="${i}">${m} ↑</option>`).join('');renderBenchmark();}
function renderBenchmark(){const key=$('#benchmark-set').value,b=SMD_METRICS[key],m=Number($('#benchmark-metric').value),max=b.max[m];const fmt=n=>Number.isInteger(n)?n.toFixed(2):String(n);$('#benchmark-chart').innerHTML=`<div class="chart-header"><h3>${b.title} <span>${b.metrics[m]} ↑</span></h3><span>BLUE = SMD · GRAY = COMPARISON</span></div><div class="bar-chart" role="img" aria-label="${esc(b.title+' '+b.metrics[m]+': '+b.rows.map(r=>r[0]+' '+r[m+2]).join(', '))}">${b.rows.map(r=>`<div class="bar-row ${r[0].startsWith('SMD')?'highlight':''}"><span>${r[0]}<small>${r[1]} NFE</small></span><div class="bar-track"><div style="width:${r[m+2]/max*100}%"></div></div><strong>${fmt(r[m+2])}</strong></div>`).join('')}<div class="chart-axis"><span>0</span><span>${max}</span></div></div><p class="chart-note">${b.note}</p><p class="fine-print">Source: manuscript table ${b.source}. Values shown at the report’s display precision; bar endpoint ${max} is a display scale, not necessarily a theoretical metric maximum.</p>`;$('#benchmark-table').innerHTML=`<table><caption>${b.title} — all reported metrics in this view</caption><thead><tr><th>Method</th><th>NFE</th>${b.metrics.map(m=>`<th>${m} ↑</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr class="${r[0].startsWith('SMD')?'highlight':''}">${r.map((v,i)=>`<${i===0?'th':'td'}>${v}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table>`;}
$('#benchmark-set').onchange=setBenchmark;$('#benchmark-metric').onchange=renderBenchmark;$('#multi-benchmark-link').onclick=()=>{$('#benchmark-set').value='multi';setBenchmark()};setBenchmark();
// Every image, including the initial presentation strip, uses native lazy loading.
document.querySelectorAll('img').forEach(i=>{if(i.id!=='dialog-image'){i.loading='lazy';i.decoding='async'}});
window.SMD_DEBUG={state,available};

// Compact research presentation. Protocol text remains available on demand.
const sectionCopy={explore:['Qwen-Image','Four matched seeds per prompt.'],editing:['Image editing','Input / Lightning / SMD · 4 NFE'],shape:['3D generation','Hunyuan3D 2.1 / TRELLIS.2'],video:['Video generation','Wan2.1-14B · 4 NFE'],audio:['Audio–video generation','MiniMax H3 · 8 NFE'],transfer:['Cross-model distillation','Four routes · two seeds · 4 NFE'],benchmarks:['Benchmarks','Reported values · higher is better'],method:['Method','']};
for(const[id,[title,subtitle]]of Object.entries(sectionCopy)){
  const heading=document.querySelector('#'+id+' .section-heading');
  heading.querySelector('h2').textContent=title;heading.querySelector('.eyebrow')?.remove();
  const description=heading.querySelector(':scope > p');if(subtitle)description.textContent=subtitle;else description?.remove();
}
document.querySelectorAll('.section > .fine-print').forEach(p=>{const details=document.createElement('details');details.className='protocol-note';const summary=document.createElement('summary');summary.textContent='Protocol & notes';p.replaceWith(details);details.append(summary,p)});
document.querySelectorAll('.subsection-heading p').forEach(p=>p.remove());
$('#transfer .subsection-heading')?.remove();$('#audio .subsection-heading h3').textContent='Reference-conditioned · 4 NFE';
const multi=$('.multi-block');multi.querySelector('.eyebrow').textContent='SD3.5-MEDIUM · 4 NFE';multi.querySelector('h3').textContent='Multi-teacher distillation';multi.querySelector('p').textContent='CLIPScore + GenEval + OCR + PickScore';
$('.closing-note')?.remove();$('.method-steps')?.remove();$('.method-figure summary').textContent='Proxy path & repulsion';$('.method-figure').open=true;
function compactBenchmarkNotes(){const chart=$('#benchmark-chart'),note=chart.querySelector('.chart-note'),source=chart.querySelector('.fine-print');if(!note)return;const details=document.createElement('details');details.className='protocol-note';const summary=document.createElement('summary');summary.textContent='Notes';details.append(summary,note);if(source)details.append(source);chart.append(details);chart.querySelector('.chart-header > span').textContent='';minimalLabels(chart);minimalLabels($('#benchmark-table'))}
compactBenchmarkNotes();$('#benchmark-set').addEventListener('change',compactBenchmarkNotes);$('#benchmark-metric').addEventListener('change',compactBenchmarkNotes);$('#multi-benchmark-link').addEventListener('click',compactBenchmarkNotes);

function minimalLabels(root){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode())node.nodeValue=node.nodeValue.replace(/SMD · ours/g,'Ours').replace(/\bSMD\b/g,'Ours').replace(/View exact prompt/g,'Prompt').replace(/Protocol & notes/g,'Notes');
  root.querySelectorAll('.prompt summary').forEach(s=>{s.firstChild.textContent='Prompt '});
}
minimalLabels($('#full-content'));
document.querySelectorAll('.section-heading > p,.section-links,.hero-tile > span,.multi-block > div > .eyebrow,.multi-block > div > p,.multi-block .fine-print,#selection-panel p').forEach(el=>el.remove());
// Keep experimental qualifications, but group them under one unobtrusive disclosure.
document.querySelectorAll('.section > .protocol-note').forEach(el=>{el.querySelector('summary').textContent='Notes'});
$('.extra-gallery summary').firstChild.textContent='FLUX.1-dev ';
$('.full-table summary').textContent='Full table';
$('.method-figure summary').textContent='Figure';


const videoAssets=new WeakMap();
const videoLoads=new WeakMap();
async function ensureVideoSource(video){
 if(!video.isConnected)throw new DOMException('Cancelled','AbortError');
 clearTimeout(video._releaseTimer);
 if(video.getAttribute('src'))return;
 if(videoLoads.has(video))return videoLoads.get(video).promise;
 const controller=new AbortController(),job={controller};
 job.promise=(async()=>{
  const source=video.dataset.src;
  if(!source)throw new Error('Missing video source');
  video.parentElement.classList.add('is-loading');
  let asset;
  try{
   if(source.endsWith('.parts.json')){
    asset=await window.resolvePublishedAsset(source,()=>{if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError')});
   }else asset={url:source,revoke(){}};
   if(controller.signal.aborted||!video.isConnected){asset.revoke();throw new DOMException('Cancelled','AbortError')}
   videoAssets.set(video,asset);video.src=asset.url;
  }catch(error){video.parentElement.classList.remove('is-loading');throw error}
 })();
 videoLoads.set(video,job);
 try{await job.promise}finally{if(videoLoads.get(video)===job)videoLoads.delete(video)}
}
function releaseVideoSource(video){
 clearTimeout(video._releaseTimer);videoLoads.get(video)?.controller.abort();videoLoads.delete(video);
 video.pause();video.removeAttribute('src');video.preload='none';video.load();
 videoAssets.get(video)?.revoke();videoAssets.delete(video);
 video.parentElement?.classList.remove('is-loading');
}
function deferVideoRelease(video){clearTimeout(video._releaseTimer);video._releaseTimer=setTimeout(()=>{if(!isVisible(video)||document.hidden)releaseVideoSource(video)},1200)}

document.addEventListener('click',async event=>{
 const link=event.target.closest('a[download]');if(!link||!link.getAttribute('href')?.endsWith('.parts.json'))return;
 event.preventDefault();const old=link.textContent;link.textContent='Preparing download…';
 try{const asset=await window.resolvePublishedAsset(link.getAttribute('href'));const download=document.createElement('a');download.href=asset.url;download.download=asset.filename;download.click();setTimeout(()=>asset.revoke(),30000)}catch{link.textContent='Download failed — retry';return}finally{if(link.textContent==='Preparing download…')link.textContent=old}
});

let publishedViewerPromise;function loadPublishedViewer(){if(!publishedViewerPromise)publishedViewerPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('viewer-classic.js?v=alpha12',location.href).href;script.onload=()=>resolve(window.ProjectViewer);script.onerror=()=>{publishedViewerPromise=null;reject(new Error('3D viewer download failed'))};document.head.append(script)});return publishedViewerPromise}
