/* Research galleries using only this project's own content and assets. */
const teaser=document.querySelector('#teaser');
teaser.querySelectorAll('video').forEach(v=>posterObserver.unobserve(v));
teaser.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img));
// Two independently browsable media rows. Existing selections and bytes stay intact.
const teaserLeadVideos=[
 {src:'assets/top-picked-20261005/h3_ghost_whale.mp4',poster:'assets/top-picked-20261005/h3_ghost_whale-poster.webp'},
 {src:'assets/top-picked-20261005/h3_sci_talk.mp4',poster:'assets/top-picked-20261005/h3_sci_talk-poster.webp'},
 {src:'assets/feature-overviews/t2va-h3wave02-l10-ours-8.mp4',poster:'assets/top-picked-20261005/h3-cloudship-gallery-poster.webp'}
];
const teaserCompanions={
 topImage:D.images.find(c=>c.id==='frosted_rowan_bothy'),
 bottomImage:D.images.find(c=>c.id==='tianmen_shanshui')
};
for(const [slot,item] of Object.entries(teaserCompanions))if(!item)throw new Error('Missing curated teaser companion: '+slot);
const teaserPickedClip=name=>({src:`assets/top-picked-20261005/${name}.mp4`,poster:`assets/top-picked-20261005/${name}-poster.webp`});
// Verified against the H3 gallery catalog. Keep all teaser video examples H3 or 3D.
const teaserH3Clip=(stem,folder='feature-overviews',ratio='900/514')=>({src:`assets/${folder}/${stem}.mp4`,poster:`assets/${folder}/${stem}-poster.webp`,ratio});
const teaserH3Extras={
 glass:teaserH3Clip('t2va-h3wave01-l07-ours-8'),
 manta:teaserH3Clip('new-011-8-ours','h3-selected-20261001','1344/768'),
 portal:teaserH3Clip('t2va-h3wave01-l08-ours-8'),
 train:teaserH3Clip('new-018-8-ours','h3-selected-20261001','1344/768'),
 panda:teaserH3Clip('t2va-h3wave02-l09-ours-8'),
 birds:teaserH3Clip('t2va-h3doc-016-ours-8')
};
const teaserExtras={
 moth:D.images.find(c=>c.id==='black_moth_macro'),
 pomegranate:D.images.find(c=>c.id==='pomegranate_still_life'),
 hummingbird:D.images.find(c=>c.id==='hummingbird_flower'),
 porcelain:D.images.find(c=>c.id==='reassembling_porcelain_bowl'),
 honeycomb:D.images.find(c=>c.id==='honeycomb_macro')
};
for(const [name,item]of Object.entries(teaserExtras))if(!item)throw new Error('Missing teaser case '+name);
const teaserVideoTile=(v,label,small=false)=>`<div class="teaser-item${small?' teaser-object':''}" style="--tile-ratio:${v.ratio||'16/9'}">${vid(v,label,small?'teaser-3d':'')}</div>`;
const teaserImageTile=(src,label)=>{const size=window.SMD_MEDIA_SIZES?.[src]||[1,1];return `<div class="teaser-item teaser-still" style="--tile-ratio:${size[0]}/${size[1]}"><figure class="media-card">${image(src,label)}</figure></div>`};
teaser.innerHTML=`<div class="teaser-wall" aria-label="Selected generation examples">
<div class="teaser-rail" id="teaser-row-1" role="region" aria-label="First row of generation examples" tabindex="0">
${teaserVideoTile(teaserLeadVideos[0],'MiniMax H3 · ghost whales')}
${teaserImageTile(teaserCompanions.topImage.ours,'Qwen-Image · frosted cabin · 4 NFE')}
${teaserVideoTile(teaserPickedClip('3d_ulta'),'3D generation · teapot',true)}
${teaserVideoTile(teaserH3Extras.glass,'MiniMax H3 · glass creature · 8 NFE')}
${teaserVideoTile(teaserH3Extras.manta,'MiniMax H3 · manta ray · 8 NFE')}
${teaserVideoTile(teaserH3Extras.portal,'MiniMax H3 · forest portal · 8 NFE')}
${teaserVideoTile(teaserH3Extras.train,'MiniMax H3 · autumn train · 8 NFE')}
${teaserVideoTile(teaserPickedClip('3d_bunny'),'3D generation · bunny',true)}
${teaserImageTile(teaserCompanions.bottomImage.ours,'Qwen-Image · ink landscape · 4 NFE')}
${teaserImageTile(teaserExtras.moth.ours,'Qwen-Image · black moth · 4 NFE')}
${teaserVideoTile(teaserH3Extras.panda,'MiniMax H3 · red panda · 8 NFE')}
</div>
<div class="teaser-rail" id="teaser-row-2" role="region" aria-label="Second row of generation examples" tabindex="0">
${teaserVideoTile(teaserLeadVideos[1],'MiniMax H3 · sci-fi conversation')}
${teaserImageTile(teaserExtras.pomegranate.ours,'Qwen-Image · pomegranate still life · 4 NFE')}
${teaserVideoTile(teaserH3Extras.birds,'MiniMax H3 · cockatiels · 8 NFE')}
${teaserImageTile(teaserExtras.hummingbird.ours,'Qwen-Image · hummingbird · 4 NFE')}
${teaserVideoTile(teaserLeadVideos[2],'MiniMax H3 · cloud-sea ship · 8 NFE')}
${teaserImageTile(teaserExtras.porcelain.ours,'Qwen-Image · reassembling porcelain bowl · 4 NFE')}
${teaserImageTile(teaserExtras.honeycomb.ours,'Qwen-Image · honeycomb · 4 NFE')}
</div></div>
<div class="teaser-tools"><span class="teaser-hint">Drag or swipe to explore</span><div class="teaser-actions"><button type="button" class="teaser-motion">Pause videos</button><button type="button" class="teaser-browse" data-teaser-direction="-1" aria-label="Previous generation examples" aria-controls="teaser-row-1 teaser-row-2">‹</button><button type="button" class="teaser-browse" data-teaser-direction="1" aria-label="Next generation examples" aria-controls="teaser-row-1 teaser-row-2">›</button></div></div>`;
const presentationTitles={explore:['Ours vs. Lightning on Qwen-Image','Four matched seeds for each prompt. Both methods use 4 NFE.'],editing:['Image Editing with Qwen-Image-Edit','Input, Lightning and Ours. Both students use 4 NFE.'],shape:['3D Generation','Hunyuan3D 2.1 and TRELLIS.2. Compare the generated turntables across views.'],video:['Ours vs. AnyFlow on Wan2.1-14B','AnyFlow and Ours at 4 NFE. Three paired prompts per page.'],audio:['Joint Audio–Video Generation with MiniMax H3','LightX2V DMD and Ours at 8 NFE. Select an audio track to listen.'],transfer:['Cross-Model Distillation','Four teacher-to-student routes at 4 NFE.']};
for(const [id,[title,caption]] of Object.entries(presentationTitles)){
  const heading=document.querySelector('#'+id+' .section-heading');heading.querySelector('h2').textContent=title;
  const description=document.createElement('p');description.className='caption';description.textContent=caption;heading.append(description);
}
function presentCase(group){
  const root=document.querySelector('#'+resultIds[group]);
  // Visible prompt underneath the comparison, matching the reference page.
  root.querySelectorAll('.prompt').forEach(details=>{details.open=false});
  const page=document.querySelector('#'+group+'-carousel .case-page');
  const [current,total]=page.textContent.split('/');page.innerHTML=`<strong>${current.trim()}</strong> / ${total.trim()}`;
}
// Preserve the existing media lifecycle, case IDs and keyboard/swipe navigation.
const originalChangeCase=changeCase;
changeCase=function(group,code){originalChangeCase(group,code);presentCase(group);if(['wan','av'].includes(group))scheduleComparison(resultIds[group]);};
for(const group of Object.keys(resultIds))presentCase(group);
function isVisible(element){if(!element?.isConnected)return false;const r=element.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}
prepareMedia();

// Start motion only after the visitor has settled on visible content.
const allowAutoMotion=()=>!document.hidden&&!navigator.connection?.saveData&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
const autoplayTimers=new Map();
function cancelAuto(id){clearTimeout(autoplayTimers.get(id));autoplayTimers.delete(id)}
function scheduleComparison(id){
 cancelAuto(id);const element=document.getElementById(id);
 if(!allowAutoMotion()||!isVisible(element))return;
 autoplayTimers.set(id,setTimeout(()=>{
  autoplayTimers.delete(id);
  if(allowAutoMotion()&&isVisible(element)&&element.querySelectorAll('video').length&&[...element.querySelectorAll('video')].every(v=>v.paused))syncPlay(id);
 },300));
}
const teaserVisible=new Set();
let teaserPaused=!allowAutoMotion(),teaserExplicitPlay=false;
const teaserMotionButton=teaser.querySelector('.teaser-motion');
const canPlayTeaser=()=>!teaserPaused&&!document.hidden&&!document.querySelector('dialog[open]')&&(teaserExplicitPlay||allowAutoMotion());
function refreshTeaserMotion(){
 teaserMotionButton.textContent=teaserPaused?'Play videos':'Pause videos';
 // At most two visible clips per row. Horizontal browsing never fetches every video.
 const chosen=canPlayTeaser()?[...teaser.querySelectorAll('.teaser-rail')].flatMap(row=>[...row.querySelectorAll('video')].filter(v=>teaserVisible.has(v)).slice(0,2)):[];
 teaser.querySelectorAll('video').forEach(video=>{
  cancelAuto(video);
  video._teaserJob=(video._teaserJob||0)+1;const job=video._teaserJob;
  if(!chosen.includes(video)){video.pause();if(teaserPaused)releaseVideoSource(video);else deferVideoRelease(video);return}
  if(!video.paused)return;
  clearTimeout(video._releaseTimer);
  autoplayTimers.set(video,setTimeout(async()=>{
   autoplayTimers.delete(video);
   if(!canPlayTeaser()||!teaserVisible.has(video)||job!==video._teaserJob)return;
   video.muted=true;video.loop=true;
   try{await ensureVideoSource(video);if(canPlayTeaser()&&teaserVisible.has(video)&&job===video._teaserJob){if(video._teaserResumeTime>0){video.currentTime=video._teaserResumeTime;delete video._teaserResumeTime}await video.play()}}catch(error){if(error.name!=='AbortError')videoError(video,error)}
  },300));
 });
}
teaserMotionButton.addEventListener('click',()=>{teaserPaused=!teaserPaused;teaserExplicitPlay=!teaserPaused;refreshTeaserMotion()});
const teaserRails=[...teaser.querySelectorAll('.teaser-rail')];
const teaserLoops=new Map();
// One original cycle and two inert-to-keyboard buffers. Only visible media load.
// Recentring by an exact cycle preserves the visible composition at the seam.
for(const row of teaserRails){
 const originals=[...row.children];
 originals.forEach((item,index)=>{item.dataset.teaserCase=String(index);item.dataset.teaserCycle='1'});
 for(const cycle of [0,2]){
  const fragment=document.createDocumentFragment();
  for(const item of originals){
   const clone=item.cloneNode(true);clone.dataset.teaserCycle=String(cycle);clone.setAttribute('aria-hidden','true');
   clone.querySelectorAll('button,a,video').forEach(el=>el.tabIndex=-1);
   clone.querySelectorAll('video').forEach(video=>{video.removeAttribute('src');delete video.dataset.prepared});
   fragment.append(clone);
  }
  if(cycle===0)row.prepend(fragment);else row.append(fragment);
 }
 teaserLoops.set(row,{originals,period:0,drag:null,animation:0,target:null});
}
prepareMedia();
teaser.querySelectorAll('video').forEach(video=>{video.controls=false;video.muted=true;video.loop=true;video.tabIndex=-1});
const teaserPlayback=new IntersectionObserver(entries=>{
 for(const entry of entries){if(entry.isIntersecting)teaserVisible.add(entry.target);else teaserVisible.delete(entry.target)}
 refreshTeaserMotion();
},{threshold:.35});
teaser.querySelectorAll('video').forEach(video=>teaserPlayback.observe(video));
function recenterTeaser(row){
 const loop=teaserLoops.get(row),period=loop.period;if(!period)return;
 const left=row.scrollLeft;
 if(left>=period*.75&&left<=period*1.75)return;
 const shift=left<period*.75?period:-period;
 // Carry video time to the equivalent copy before the old one is released.
 for(const video of row.querySelectorAll('video[src]')){
  const item=video.closest('.teaser-item'),cycle=Number(item.dataset.teaserCycle)+(shift>0?1:-1);
  const twin=row.querySelector(`[data-teaser-cycle="${cycle}"][data-teaser-case="${item.dataset.teaserCase}"] video`);
  if(twin)twin._teaserResumeTime=video.currentTime;
 }
 row.scrollLeft=left+shift;
 if(loop.drag)loop.drag.left+=shift;
 if(loop.target!==null)loop.target+=shift;
}
function measureTeaserLoops(){
 for(const row of teaserRails){
  const loop=teaserLoops.get(row),first=loop.originals[0],before=row.firstElementChild;
  const phase=loop.period?((row.scrollLeft/loop.period-1)%1+1)%1:0;
  loop.period=first.offsetLeft-before.offsetLeft;
  cancelAnimationFrame(loop.animation);loop.target=null;
  row.scrollLeft=loop.period*(1+phase);
  if(loop.drag)loop.drag=null;
 }
}
function moveTeaser(row,delta,animate=true){
 const loop=teaserLoops.get(row);cancelAnimationFrame(loop.animation);loop.target=row.scrollLeft+delta;
 if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){row.scrollLeft=loop.target;loop.target=null;recenterTeaser(row);return}
 let previous=performance.now();
 const step=now=>{const elapsed=Math.min(now-previous,40);previous=now;const distance=loop.target-row.scrollLeft;
  if(Math.abs(distance)<2){row.scrollLeft=loop.target;loop.target=null;recenterTeaser(row);return}
  row.scrollLeft+=distance*Math.min(1,elapsed/75);recenterTeaser(row);loop.animation=requestAnimationFrame(step);
 };loop.animation=requestAnimationFrame(step);
}
for(const button of teaser.querySelectorAll('[data-teaser-direction]'))button.addEventListener('click',()=>{for(const row of teaserRails)moveTeaser(row,Number(button.dataset.teaserDirection)*row.clientWidth*.65)});
for(const row of teaserRails){
 const loop=teaserLoops.get(row);let suppressClick=false;
 row.addEventListener('scroll',()=>recenterTeaser(row),{passive:true});
 row.addEventListener('keydown',event=>{if(event.target!==row)return;const offsets={ArrowLeft:-row.clientWidth*.65,ArrowRight:row.clientWidth*.65,Home:loop.period-row.scrollLeft,End:loop.originals.at(-1).offsetLeft-row.firstElementChild.offsetLeft-row.scrollLeft};if(event.key in offsets){event.preventDefault();moveTeaser(row,offsets[event.key],false)}});
 row.addEventListener('wheel',()=>{cancelAnimationFrame(loop.animation);loop.target=null},{passive:true});
 row.addEventListener('pointerdown',event=>{cancelAnimationFrame(loop.animation);loop.target=null;if(event.pointerType!=='mouse'||event.button!==0)return;suppressClick=false;loop.drag={id:event.pointerId,x:event.clientX,left:row.scrollLeft,moved:false}});
 row.addEventListener('pointermove',event=>{const drag=loop.drag;if(!drag)return;if(!event.buttons){loop.drag=null;row.classList.remove('is-dragging');return}const dx=event.clientX-drag.x;if(Math.abs(dx)>6&&!drag.moved){drag.moved=true;row.setPointerCapture(drag.id);row.classList.add('is-dragging')}if(drag.moved){event.preventDefault();row.scrollLeft=drag.left-dx;recenterTeaser(row)}});
 const finishDrag=()=>{const drag=loop.drag;if(!drag)return;suppressClick=drag.moved;if(row.hasPointerCapture(drag.id))row.releasePointerCapture(drag.id);loop.drag=null;row.classList.remove('is-dragging')};
 row.addEventListener('pointerup',finishDrag);row.addEventListener('pointercancel',finishDrag);row.addEventListener('lostpointercapture',()=>{loop.drag=null;row.classList.remove('is-dragging')});
 row.addEventListener('dragstart',event=>event.preventDefault());
 row.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false}},true);
}
new ResizeObserver(measureTeaserLoops).observe(teaser);measureTeaserLoops();
// Opening the image viewer pauses the wall, including clips waiting to load.
new MutationObserver(refreshTeaserMotion).observe(document.getElementById('image-dialog'),{attributes:true,attributeFilter:['open']});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){teaserPaused=true;teaserExplicitPlay=false}refreshTeaserMotion()});
const comparisonPlayback=new IntersectionObserver(entries=>{for(const entry of entries){
 if(entry.isIntersecting)scheduleComparison(entry.target.id);
 else{cancelAuto(entry.target.id);cancelPlayback(entry.target.id);entry.target.querySelectorAll('video').forEach(v=>{v.pause();deferVideoRelease(v)})}
}},{threshold:.2});
for(const id of ['wan-results','av-results'])comparisonPlayback.observe(document.getElementById(id));
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){for(const id of autoplayTimers.keys())cancelAuto(id);teaser.querySelectorAll('video').forEach(releaseVideoSource)}
 else{refreshTeaserMotion();for(const id of ['wan-results','av-results'])scheduleComparison(id)}
});

const multiMetrics=SMD_METRICS.multi;
const metricRanks=multiMetrics.metrics.map((_,i)=>[...new Set(multiMetrics.rows.slice(1).map(row=>row[i+2]))].sort((a,b)=>b-a));
const tableNumber=(value,i)=>Number(value).toFixed(i===2?2:i===5&&value>=1?3:4);
const inlineTable=document.createElement('div');inlineTable.className='table-scroll multi-metrics';inlineTable.tabIndex=0;inlineTable.setAttribute('aria-label','Multi-teacher metrics');
inlineTable.innerHTML=`<table><caption>SD3.5-Medium</caption><thead><tr><th scope="col">Method</th><th scope="col">NFE</th>${multiMetrics.metrics.map(m=>`<th scope="col">${esc(m)} ↑</th>`).join('')}</tr></thead><tbody>${multiMetrics.rows.map((row,r)=>`<tr class="${r===6?'highlight':''}"><th scope="row">${esc(row[0].replace('Base teacher','Teacher').replace('CLIP specialist','CLIPScore specialist').replace('SMD · routed','Routed multi-teacher (Ours)'))}</th><td>${row[1]}</td>${row.slice(2).map((value,i)=>{const number=tableNumber(value,i);return `<td>${r>0&&value===metricRanks[i][0]?`<strong>${number}</strong>`:r>0&&value===metricRanks[i][1]?`<u>${number}</u>`:number}</td>`}).join('')}</tr>`).join('')}</tbody></table><details class="protocol-note"><summary>Notes</summary><p>Best and second-best student results are bold and underlined. GenEval, OCR and PickScore use their respective test sets; HPSv2, CLIPScore and ImageReward use DrawBench. Source: technical report, reward-specialized distillation table.</p></details>`;
document.querySelector('#multi-metrics-slot').replaceWith(inlineTable);
document.querySelector('.multi-block').id='multi-teacher';
document.querySelector('#video .protocol-note .fine-print').textContent='AnyFlow uses its public-release checkpoint; Ours uses 08_25@200. Each column pairs the same prompt across methods. Different columns are different prompts, not repeated seeds of one prompt. These are curated qualitative examples, not per-prompt benchmark wins.';
document.querySelector('#audio .protocol-note .fine-print').textContent='Selected 8-NFE qualitative examples compared with the LightX2V DMD release. Original media and audio tracks are retained. The separate 4-NFE quantitative evaluation is not an NFE ablation.';
document.querySelector('#editing .protocol-note .fine-print').textContent='Qwen-Image-Edit-2511 at 4 NFE. Each comparison uses the same input and editing instruction. New ImgEdit-Bench examples were selected by visual inspection; historical per-case scores are not a new official evaluation.';
