/* FastGen-PDD layout adaptation using only this project's own content/assets. */
const teaser=document.querySelector('#teaser');
teaser.querySelectorAll('video').forEach(v=>posterObserver.unobserve(v));
teaser.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img));
// Three diagonal leads, with image/video/3D companions interspersed by palette.
const teaserLeadVideos=[
 {src:'assets/top-picked-20261005/h3_ghost_whale.mp4',poster:'assets/top-picked-20261005/h3_ghost_whale-poster.webp'},
 {src:'assets/top-picked-20261005/h3_sci_talk.mp4',poster:'assets/top-picked-20261005/h3_sci_talk-poster.webp'},
 {src:'assets/feature-overviews/t2va-h3wave02-l10-ours-8.mp4',poster:'assets/top-picked-20261005/h3-cloudship-gallery-poster.webp'}
];
const teaserCompanions={
 topImage:D.images.find(c=>c.id==='frosted_rowan_bothy'),
 topVideo:D.wan.find(c=>c.id==='13_close_up_of_grapes_on_a_rotating_table'),
 bottomImage:D.images.find(c=>c.id==='tianmen_shanshui'),
 bottomVideo:D.wan.find(c=>c.id==='drawing_sample1')
};
for(const [slot,item] of Object.entries(teaserCompanions))if(!item)throw new Error('Missing curated teaser companion: '+slot);
const teaserPickedClip=name=>({src:`assets/top-picked-20261005/${name}.mp4`,poster:`assets/top-picked-20261005/${name}-poster.webp`});
teaser.innerHTML=`<div class="teaser-grid teaser-curated">
${vid(teaserLeadVideos[0],'MiniMax H3')}
<figure class="media-card">${image(teaserCompanions.topImage.ours,'Qwen-Image · 4 NFE')}<figcaption>Qwen-Image · 4 NFE</figcaption></figure>
${vid(teaserPickedClip('3d_ulta'),'3D generation','teaser-3d')}
${vid(teaserPickedClip('3d_bunny'),'3D generation','teaser-3d')}
${vid(teaserCompanions.bottomVideo.ours,'Wan2.1-14B · 4 NFE')}
${vid(teaserLeadVideos[1],'MiniMax H3')}
${vid(teaserLeadVideos[2],'MiniMax H3 · 8 NFE')}
<figure class="media-card">${image(teaserCompanions.bottomImage.ours,'Qwen-Image · 4 NFE')}<figcaption>Qwen-Image · 4 NFE</figcaption></figure>
${vid(teaserCompanions.topVideo.ours,'Wan2.1-14B · 4 NFE')}
</div>`;
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
function refreshTeaserMotion(){
 const chosen=allowAutoMotion()?[...teaser.querySelectorAll('video')].filter(v=>teaserVisible.has(v)).slice(0,2):[];
 teaser.querySelectorAll('video').forEach(video=>{
  cancelAuto(video);
  if(!chosen.includes(video)){video.pause();deferVideoRelease(video);return}
  clearTimeout(video._releaseTimer);
  autoplayTimers.set(video,setTimeout(async()=>{
   autoplayTimers.delete(video);
   if(!allowAutoMotion()||!teaserVisible.has(video))return;
   video.muted=true;video.loop=true;
   try{await ensureVideoSource(video);if(allowAutoMotion()&&teaserVisible.has(video))await video.play()}catch{}
  },300));
 });
}
const teaserPlayback=new IntersectionObserver(entries=>{
 for(const entry of entries){if(entry.isIntersecting)teaserVisible.add(entry.target);else teaserVisible.delete(entry.target)}
 refreshTeaserMotion();
},{threshold:.2});
teaser.querySelectorAll('video').forEach(video=>teaserPlayback.observe(video));
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
