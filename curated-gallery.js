/* Reader-facing additions; keep the original carousel and media lifecycle. */
// User shortlist: original positions 1–7, 12, 9, 10; retain stable source codes.
available.cross=['C01','C02','C03','C04','C05','C06','C07','C12','C09','C10'].map(code=>D.cross.find(c=>c.code===code)).filter(Boolean);
const curatedCrossRender=renderCross;
renders.cross=function(){
 curatedCrossRender();
 const c=state.cross,root=$('#cross-results');
 root.classList.toggle('has-grid-samples',c.sampleLayout==='grid4');
 const count=c.sampleLayout==='grid4'?'four outputs, kept together in the original 2 × 2 grid':c.sampleLayout==='single'?'one output':'two outputs';
 $('#transfer .caption').textContent=`Distillation across model sizes and architectures at 4 NFE. Each column is a teacher-to-student route; this example shows ${count} per route for the same prompt. Use the side arrows or swipe to browse all ${available.cross.length} prompts.`;
};
renders.av=function(){
 const c=state.av,nfe=c.nfe||8;
 $('#av-results').innerHTML=`<div class="two-col video-group">${vid(c.baseline,'LightX2V DMD · '+nfe+' NFE')}${vid(c.ours,'Ours · '+nfe+' NFE','ours')}</div><div class="playback-tools"><button class="sync-button" data-sync="av-results">▶ Play together (muted)</button><button data-listen="0">Listen to DMD</button><button data-listen="1">Listen to Ours</button></div>${prompt(c)}`;
 $('#audio .caption').textContent=`Comparison between Ours and LightX2V DMD on MiniMax H3, using the same prompt. This pair uses ${nfe} NFE. Browse all ${available.av.length} examples with the side arrows or swipe; use the buttons below to listen to either original audio track. The 4-NFE and 8-NFE examples come from separate evaluations.`;
};
// The user removed the fifth (early-checkpoint) reference example.
available.reference=available.reference.filter(c=>c.id!=='curated-A019');
$('#reference-section .caption').textContent=`Image- and video-conditioned audio–video generation with MiniMax H3 at 4 NFE. Reference inputs are shown on the left and our output on the right. Use the side arrows or swipe to browse all ${available.reference.length} examples.`;
// Re-render through the existing wrappers: image previews, prompt folding,
// keyboard/swipe controls, and offscreen cleanup remain active.
for(const [group,code] of [['cross','C01'],['edits','E20'],['av','A08'],['reference','R04']])changeCase(group,code);

// All eleven cases share one carousel. The old composite is no longer displayed.
const oldMultiPanel=$('#multi-teacher .image-button');
if(oldMultiPanel){oldMultiPanel.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img));oldMultiPanel.remove()}
const extraMulti=document.createElement('div');extraMulti.className='case-carousel curated-multi';
extraMulti.innerHTML='<div class="carousel-stage"><button class="carousel-arrow previous" aria-label="Previous multi-teacher example">‹</button><div id="curated-multi-results" class="carousel-slide" tabindex="0" role="group" aria-roledescription="slide"></div><button class="carousel-arrow next" aria-label="Next multi-teacher example">›</button></div><div class="carousel-footer"><span class="case-page" role="status" aria-live="polite"></span></div>';
$('#multi-teacher').append(extraMulti);
const multiLabels={base_teacher:'Base teacher',self_distill:'Self-distill',clipscore_all:'CLIPScore distill',geneval_all:'GenEval distill',ocr_all:'OCR distill',pickscore_all:'PickScore distill',multi_distill:'Multi-teacher (Ours)'};
let curatedMultiIndex=0;
function showCuratedMulti(delta=0){
 const cases=SMD_CURATED.multiCases;curatedMultiIndex=(curatedMultiIndex+delta+cases.length)%cases.length;
 const c=cases[curatedMultiIndex],root=$('#curated-multi-results');
 root.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img));
 root.innerHTML=`<div class="curated-multi-row">${Object.entries(multiLabels).map(([key,label])=>`<figure>${image(c.methods[key],label)}<figcaption>${label}</figcaption></figure>`).join('')}</div>${prompt(c)}`;
 root.setAttribute('aria-label',c.title);
 // Reuse short-inline / long-disclosure prompt treatment without new controls.
 const text=root.querySelector('.prompt pre').textContent,old=root.querySelector('.prompt');
 if(text.length<=800&&text.split('\n').length<=8){const p=document.createElement('p');p.className='inline-prompt';p.textContent=text;old.replaceWith(p)}else{old.querySelector('summary').textContent='Read prompt';prepareDisclosures(root)}
 extraMulti.querySelector('.case-page').innerHTML=`<strong>${curatedMultiIndex+1}</strong> / ${cases.length}`;
 prepareMedia();
}
extraMulti.querySelector('.previous').onclick=()=>showCuratedMulti(-1);
extraMulti.querySelector('.next').onclick=()=>showCuratedMulti(1);
extraMulti.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showCuratedMulti(e.key==='ArrowLeft'?-1:1)}});
let multiTouch;
extraMulti.addEventListener('touchstart',e=>{multiTouch=[e.touches[0].clientX,e.touches[0].clientY]},{passive:true});
extraMulti.addEventListener('touchend',e=>{if(!multiTouch)return;const dx=e.changedTouches[0].clientX-multiTouch[0],dy=e.changedTouches[0].clientY-multiTouch[1];if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)showCuratedMulti(dx>0?-1:1);multiTouch=null},{passive:true});
showCuratedMulti();
$('#multi-teacher .caption').textContent=`Four reward-specialized teachers—CLIPScore, GenEval, OCR, and PickScore—supervise one SD3.5-Medium student at 4 NFE. The table compares six metrics; bold and underlined values mark the best and second-best student results. Below, each column shows the same prompt across the base teacher, self-distilled student, four specialist-distilled students, and our multi-teacher student. Use the arrows or swipe to browse all ${SMD_CURATED.multiCases.length} examples.`;
