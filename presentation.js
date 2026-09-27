/* FastGen-PDD layout adaptation using only this project's own content/assets. */
const teaser=document.querySelector('#teaser');
teaser.innerHTML=`<div class="teaser-grid">
${vid(state.av.ours,'MiniMax H3 · 8 NFE')}
<figure class="media-card">${image(state.images.ours,'Qwen-Image · 4 NFE')}<figcaption>Qwen-Image · 4 NFE</figcaption></figure>
${vid(D.wan.find(c=>c.id==='lantern_river_city_seed510102').ours,'Wan2.1-14B · 4 NFE')}
<figure class="media-card">${image(D.images.find(c=>c.id==='forest_nurse_log').ours,'Qwen-Image · 4 NFE')}<figcaption>Qwen-Image · 4 NFE</figcaption></figure>
${vid(state.wan.ours,'Wan2.1-14B · 4 NFE')}
${vid(D.av.find(c=>c.id==='case51').ours,'MiniMax H3 · 8 NFE')}
</div>`;
// The method illustration is intentionally omitted from the project page.
const presentationTitles={explore:['Ours vs. Lightning on Qwen-Image','Four matched seeds for each prompt. Both methods use 4 NFE.'],editing:['Image Editing with Qwen-Image-Edit','Input, Lightning and Ours. Both students use 4 NFE.'],shape:['Image-to-3D Generation','Hunyuan3D 2.1 and TRELLIS.2. Inspect the generated assets or compare turntables.'],video:['Ours vs. AnyFlow on Wan2.1-14B','AnyFlow and Ours at 4 NFE. Three paired prompts per page.'],audio:['Joint Audio–Video Generation with MiniMax H3','LightX2V DMD and Ours at 8 NFE. Select an audio track to listen.'],transfer:['Cross-Model Distillation','Four teacher-to-student routes at 4 NFE.'],method:['Simplified Matching Distillation','Pivot proxy and teacher repulsion are used during training only.']};
for(const [id,[title,caption]] of Object.entries(presentationTitles)){
  if(id==='method'){document.querySelector('#method')?.remove();continue}
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
changeCase=function(group,code){originalChangeCase(group,code);presentCase(group);if(['wan','av'].includes(group)&&isVisible(document.querySelector('#'+resultIds[group])))syncPlay(resultIds[group]);};
for(const group of Object.keys(resultIds))presentCase(group);
function isVisible(element){const r=element.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}
prepareMedia();
// Like the reference: muted motion when visible, with lazy loading off screen.
const teaserPlayback=new IntersectionObserver(entries=>{for(const entry of entries){const video=entry.target;if(entry.isIntersecting&&!document.hidden){video.muted=true;video.loop=true;ensureVideoSource(video).then(()=>{if(isVisible(video)&&!document.hidden)return video.play()}).catch(()=>{})}else video.pause()}},{threshold:.15});
teaser.querySelectorAll('video').forEach(video=>teaserPlayback.observe(video));
const comparisonPlayback=new IntersectionObserver(entries=>{for(const entry of entries){const element=entry.target;if(entry.isIntersecting&&!document.hidden){const videos=[...element.querySelectorAll('video')];if(videos.every(v=>v.paused))syncPlay(element.id)}else{cancelPlayback(element.id);element.querySelectorAll('video').forEach(v=>v.pause())}}},{threshold:.15});
for(const id of ['wan-results','av-results'])comparisonPlayback.observe(document.getElementById(id));
document.addEventListener('visibilitychange',()=>{if(document.hidden)teaser.querySelectorAll('video').forEach(v=>v.pause())});
const multiMetrics=SMD_METRICS.multi;
const metricRanks=multiMetrics.metrics.map((_,i)=>[...new Set(multiMetrics.rows.slice(1).map(row=>row[i+2]))].sort((a,b)=>b-a));
const tableNumber=(value,i)=>Number(value).toFixed(i===2?2:i===5&&value>=1?3:4);
const inlineTable=document.createElement('div');inlineTable.className='table-scroll multi-metrics';inlineTable.tabIndex=0;inlineTable.setAttribute('aria-label','Multi-teacher metrics');
inlineTable.innerHTML=`<table><caption>SD3.5-Medium</caption><thead><tr><th scope="col">Method</th><th scope="col">NFE</th>${multiMetrics.metrics.map(m=>`<th scope="col">${esc(m)} ↑</th>`).join('')}</tr></thead><tbody>${multiMetrics.rows.map((row,r)=>`<tr class="${r===6?'highlight':''}"><th scope="row">${esc(row[0].replace('Base teacher','Teacher').replace('CLIP specialist','CLIPScore specialist').replace('SMD · routed','Routed multi-teacher (Ours)'))}</th><td>${row[1]}</td>${row.slice(2).map((value,i)=>{const number=tableNumber(value,i);return `<td>${r>0&&value===metricRanks[i][0]?`<strong>${number}</strong>`:r>0&&value===metricRanks[i][1]?`<u>${number}</u>`:number}</td>`}).join('')}</tr>`).join('')}</tbody></table><details class="protocol-note"><summary>Notes</summary><p>Best and second-best student results are bold and underlined. GenEval, OCR and PickScore use their respective test sets; HPSv2, CLIPScore and ImageReward use DrawBench. Source: technical report, reward-specialized distillation table.</p></details>`;
document.querySelector('#multi-benchmark-link').replaceWith(inlineTable);
document.querySelector('.multi-block').id='multi-teacher';
document.querySelector('#benchmarks').remove();
document.querySelector('#video .protocol-note .fine-print').textContent='AnyFlow uses its public-release checkpoint; Ours uses 08_25@200. Each column pairs the same prompt across methods. Different columns are different prompts, not repeated seeds of one prompt. These are curated qualitative examples, not per-prompt benchmark wins.';
document.querySelector('#audio .protocol-note .fine-print').textContent='Selected 8-NFE qualitative examples compared with the LightX2V DMD release. Original media and audio tracks are retained. The separate 4-NFE quantitative evaluation is not an NFE ablation.';
document.querySelector('#editing .protocol-note .fine-print').textContent='Qwen-Image-Edit-2511 at 4 NFE. Each comparison uses the same input and editing instruction. New ImgEdit-Bench examples were selected by visual inspection; historical per-case scores are not a new official evaluation.';
