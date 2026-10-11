/* Integrated seven-step method overview. Source clips are frame-exact segments. */
(() => {
const root=document.getElementById('method');
if(!root||root.classList.contains('method-overview'))return;
root.classList.add('method-overview');
root.querySelector('.film-pending')?.remove();
root.insertAdjacentHTML('beforeend','<div id="method-steps"></div><nav class="method-timeline" role="tablist" aria-label="Method steps"></nav>');

const chapters=[
 {id:'noise_to_image',title:'From noise to an image',copy:'A diffusion <span class="method-teacher">teacher</span> turns noise into an image through many small denoising steps. The blue trajectory follows one sample along that path.'},
 {id:'coarse_prediction',title:'Take a larger step',copy:'A few-step <span class="method-student">student</span> must cover the same journey with much larger transitions. Its initial prediction misses the target region.'},
 {id:'local_matching',title:'Match along the student’s path',copy:'Query the <span class="method-teacher">teacher</span> at intermediate states along the <span class="method-student">student’s</span> own transition. Train one coarse student velocity to match these local predictions.'},
 {id:'simple_optimization',title:'A simple baseline',copy:'Local matching improves the coarse prediction. But one constant velocity cannot follow all of the teacher’s variation within a transition.'},
 {id:'pivot',title:'Let Pivot capture local variation',copy:'A training-only proxy adds a varying residual to the student’s coarse velocity.',equation:true,after:'The proxy can follow local teacher predictions while preserving the student’s transition endpoints.'},
 {id:'repulsion',title:'Learn away from weaker predictions',copy:'At each sampled state, match the <span class="method-teacher">target teacher prediction</span> while repelling a <span class="method-weak">weaker prediction from the same teacher</span>.'},
 {id:'inference',title:'Generate with the student alone',copy:'After training, remove Pivot and the teacher queries. Sampling uses only the student, with its original architecture and sampling procedure unchanged.'}
];
const pauseIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path class="method-pause-glyph" d="M7 5v10M13 5v10"/><path class="method-play-glyph" d="M6 3.5 16 10 6 16.5Z"/></svg>';
const expandIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/></svg>';
const pivotMath='<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="Proxy velocity equals student velocity plus local residual"><mrow><mi>v</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>v</mi><mi>θ</mi></msub><mo>+</mo><msub><mi>r</mi><mi>φ</mi></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></math>';
root.querySelector('#method-steps').innerHTML=chapters.map((c,i)=>`<section class="method-step" id="method-${c.id}" role="tabpanel" aria-labelledby="method-tab-${c.id}" ${i?'hidden inert':''}><div class="method-visual is-paused"><video muted playsinline preload="none" poster="assets/method/${c.id}.png" data-src="assets/method/${c.id}.mp4" aria-label="${c.title}"></video><div class="method-controls"><button class="method-toggle" type="button" aria-label="Play ${c.title}" aria-pressed="true">${pauseIcon}</button><button class="method-fullscreen" type="button" aria-label="Fullscreen ${c.title}">${expandIcon}</button></div></div><div class="method-copy"><h3 id="method-title-${c.id}">${c.title}</h3><p>${c.copy}</p>${c.equation?'<div class="method-equation">'+pivotMath+'</div>':''}${c.after?`<p>${c.after}</p>`:''}</div></section>`).join('');
// Same objective as report Eq. repulsion_objective. Use the animation's physical
// time t; teacher state/time arguments are suppressed, as stated in the prose.
const targetVelocity='<msub class="method-teacher"><mi>v</mi><mi>T</mi></msub>';
const weakVelocity='<msub class="method-weak"><mover accent="true"><mi>v</mi><mo>~</mo></mover><mi>T</mi></msub>';
const distance=target=>'<msub><mrow><mo fence="true">‖</mo><mi>v</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>−</mo>'+target+'<mo fence="true">‖</mo></mrow><mn>2</mn></msub>';
const repulsionMath='<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="Loss equals the expectation of the target L2 distance minus lambda times the weaker teacher L2 distance"><mtable columnalign="right left" columnspacing="0.25em" rowspacing="0.3em"><mtr><mtd><mi mathvariant="normal">ℒ</mi><mo>=</mo></mtd><mtd><msub><mi mathvariant="normal">𝔼</mi><mi>t</mi></msub><mo stretchy="false">[</mo>'+distance(targetVelocity)+'</mtd></mtr><mtr><mtd></mtd><mtd><mo>−</mo><mi>λ</mi>'+distance(weakVelocity)+'<mo stretchy="false">]</mo></mtd></mtr></mtable></math>';
root.querySelector('#method-repulsion .method-copy').insertAdjacentHTML('beforeend','<div class="method-equation method-repulsion-loss">'+repulsionMath+'</div>');
const stepNames=['Teacher','Student','Local matching','Baseline','Pivot','Repulsion','Inference'];
const timeline=root.querySelector('.method-timeline');
timeline.innerHTML=chapters.map((c,i)=>`<button class="method-tab" type="button" role="tab" id="method-tab-${c.id}" aria-controls="method-${c.id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${stepNames[i]}</button>`).join('');
const panels=[...root.querySelectorAll('.method-step')],tabs=[...timeline.querySelectorAll('button')],videos=[...root.querySelectorAll('video')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
let selected=0,manualPaused=reduce.matches||!!navigator.connection?.saveData,queued=false,epoch=0,selectionEpoch=0,pending=false,methodInView=false,initialized=false;
const stage=root.querySelector('#method-steps');
function sync(v){const paused=v.paused,box=v.closest('.method-visual'),button=box.querySelector('.method-toggle');box.classList.toggle('is-paused',paused);button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',(paused?'Play ':'Pause ')+v.getAttribute('aria-label'));}
function stop(){epoch++;videos.forEach(v=>{v.pause();sync(v)});}
async function play(v){initialized=true;const job=++epoch;videos.filter(other=>other!==v).forEach(other=>other.pause());if(!v.getAttribute('src'))v.src=v.dataset.src;if(v.ended)v.currentTime=0;try{await v.play();if(job!==epoch||v!==videos[selected])v.pause();}catch{}sync(v);}
// Keep the outgoing frame visible while the next clip loads and seeks. Only
// reveal it once HAVE_CURRENT_DATA confirms a decoded frame at the start.
function prepare(v,reset=false){
 return new Promise(resolve=>{
  let timer,done=false;
  const cleanup=()=>{clearTimeout(timer);['loadeddata','seeked','canplay'].forEach(name=>v.removeEventListener(name,check));v.removeEventListener('error',fail)};
  const finish=ok=>{if(done)return;done=true;cleanup();resolve(ok)};
  const check=()=>{if(v.readyState>=2&&!v.seeking&&(!reset||v.currentTime<.05))finish(true)};
  const fail=()=>finish(false);
  ['loadeddata','seeked','canplay'].forEach(name=>v.addEventListener(name,check));v.addEventListener('error',fail);
  timer=setTimeout(fail,8000);
  if(!v.getAttribute('src')){v.preload='auto';v.src=v.dataset.src;v.load()}
  else if(reset&&v.readyState>=1&&v.currentTime!==0)v.currentTime=0;
  check();
 });
}
function revealTab(index){const tab=tabs[index],r=tab.getBoundingClientRect(),box=timeline.getBoundingClientRect();if(r.left<box.left)timeline.scrollLeft+=r.left-box.left;else if(r.right>box.right)timeline.scrollLeft+=r.right-box.right;}
async function select(index,{focus=false}={}){
 initialized=true;
 const request=++selectionEpoch;pending=true;stage.setAttribute('aria-busy','true');stop();
 if(focus)tabs[index].focus({preventScroll:true});
 const ready=await prepare(videos[index],true);
 if(request!==selectionEpoch)return;
 selected=index;pending=false;stage.removeAttribute('aria-busy');
 if(!ready)manualPaused=true;
 panels.forEach((panel,i)=>{panel.hidden=i!==index;panel.inert=i!==index});
 tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;tab.style.setProperty('--progress',i<index?1:0)});
 sync(videos[index]);
 if(focus)tabs[index].focus({preventScroll:true});
 revealTab(index);
 // Retain only the active decoder and the next preloaded chapter.
 videos.forEach((video,i)=>{if(i!==index&&i!==index+1&&video.getAttribute('src')){video.pause();video.removeAttribute('src');video.preload='none';video.load()}});
 if(index+1<videos.length&&!manualPaused)prepare(videos[index+1]);
 schedule();
}
function choose(){queued=false;if(pending||!initialized)return;const v=videos[selected],r=v.getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,64));if(document.hidden||(!document.fullscreenElement&&visible/Math.min(r.height,innerHeight-64)<.45)){stop();return}if(!manualPaused&&v.paused&&!v.ended)play(v);}
function schedule(){if(!queued){queued=true;requestAnimationFrame(choose)}}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(next,{focus:true})})});
videos.forEach((v,i)=>{
 v.addEventListener('play',()=>sync(v));v.addEventListener('pause',()=>sync(v));
 v.addEventListener('timeupdate',()=>{if(i===selected&&v.duration)tabs[i].style.setProperty('--progress',Math.min(1,v.currentTime/v.duration))});
 v.addEventListener('ended',()=>{if(i!==selected||manualPaused)return;if(i<videos.length-1&&!document.fullscreenElement)select(i+1);else{manualPaused=true;sync(v)}});
 v.closest('.method-visual').querySelector('.method-toggle').addEventListener('click',()=>{if(v.paused){manualPaused=false;play(v)}else{manualPaused=true;stop()}});
 v.closest('.method-visual').querySelector('.method-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(v.closest('.method-visual').requestFullscreen)await v.closest('.method-visual').requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();else v.controls=true;}catch{v.controls=true}});
});
const observer=new IntersectionObserver(entries=>{methodInView=entries[0].isIntersecting;if(!methodInView){stop();return}if(!initialized&&!manualPaused)select(0);else schedule()},{threshold:[0,.25,.5,.75,1]});observer.observe(root.querySelector('#method-steps'));
addEventListener('scroll',()=>{if(methodInView)schedule()},{passive:true});addEventListener('resize',()=>{revealTab(selected);if(methodInView)schedule()});document.addEventListener('visibilitychange',schedule);document.addEventListener('fullscreenchange',schedule);reduce.addEventListener('change',()=>{manualPaused=reduce.matches||!!navigator.connection?.saveData;stop();if(methodInView&&!initialized&&!manualPaused)select(0);else schedule()});
// Leave posters in place until the section is visible or the reader selects a step.

})();
