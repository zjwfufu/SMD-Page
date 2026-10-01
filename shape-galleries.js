/* Independent model galleries: one counter per model, all frames square. */
available.shapes=SMD_SHAPE_REFRESH.hunyuan;
// User exclusions refer to the original 18-case order; keep stable source IDs.
const excludedTrellis=new Set(['T01','T04','T05','T06','T10','T13','T14','T15']);
available.trellis=SMD_SHAPE_REFRESH.trellis.filter(c=>!excludedTrellis.has(c.code));
resultIds.trellis='trellis-results';
const shapeHost=$('#shapes-carousel').parentElement;
const hunGroup=document.createElement('div');hunGroup.className='shape-model-group';hunGroup.innerHTML='<h3>Hunyuan3D 2.1</h3>';
$('#shapes-carousel').before(hunGroup);hunGroup.append($('#shapes-carousel'));
$('#shapes-carousel').setAttribute('aria-label','Hunyuan3D examples');
$('#shapes-carousel .previous').setAttribute('aria-label','Previous Hunyuan3D example');$('#shapes-carousel .next').setAttribute('aria-label','Next Hunyuan3D example');
const trellisGroup=document.createElement('div');trellisGroup.className='shape-model-group';
trellisGroup.innerHTML='<h3>TRELLIS.2</h3><div id="trellis-carousel" class="case-carousel" role="region" aria-roledescription="carousel" aria-label="TRELLIS.2 examples" data-carousel-group="trellis"><div class="carousel-stage"><button class="carousel-arrow previous" data-step="-1" data-group="trellis" aria-label="Previous TRELLIS.2 example" aria-controls="trellis-results">‹</button><div id="trellis-results" class="carousel-slide" tabindex="0" role="group" aria-roledescription="slide"></div><button class="carousel-arrow next" data-step="1" data-group="trellis" aria-label="Next TRELLIS.2 example" aria-controls="trellis-results">›</button></div><div class="carousel-footer"><span class="case-page" role="status" aria-live="polite" aria-atomic="true"></span></div></div>';
shapeHost.append(trellisGroup);
function renderShapeModel(group){const c=state[group],id=resultIds[group];$('#'+id).innerHTML=`<div class="shape-video-grid video-group" style="--shape-ratio:1"><figure class="shape-video-input">${image(c.input,'Input image')}<figcaption>Input image</figcaption></figure>${vid(c.routes.ours,'Ours','ours')}${vid(c.routes.short,'Undistilled teacher')}${vid(c.routes.teacher,'Full teacher')}</div><div class="playback-tools"><button class="sync-button" data-sync="${id}">▶ Play together</button></div>`;}
renders.shapes=()=>renderShapeModel('shapes');renders.trellis=()=>renderShapeModel('trellis');
trellisGroup.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>stepCase('trellis',Number(button.dataset.step)));
trellisGroup.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('video,input,textarea,select,button,a,summary'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stepCase('trellis',e.key==='ArrowLeft'?-1:1)}});
const trellisStage=trellisGroup.querySelector('.carousel-stage');let shapeGesture=null,shapeSuppressClickUntil=0;
trellisStage.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('[data-step],[data-sync],.video-start,summary,a'))return;const v=e.target.closest('video');if(v&&e.clientY>v.getBoundingClientRect().bottom-50)return;shapeGesture={x:e.clientX,y:e.clientY,id:e.pointerId}});
trellisStage.addEventListener('pointerup',e=>{if(!shapeGesture||shapeGesture.id!==e.pointerId)return;const dx=e.clientX-shapeGesture.x,dy=e.clientY-shapeGesture.y;shapeGesture=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){shapeSuppressClickUntil=performance.now()+500;stepCase('trellis',dx<0?1:-1)}});
trellisStage.addEventListener('pointercancel',()=>shapeGesture=null);trellisStage.addEventListener('dragstart',e=>{if(e.target.closest('.image-button'))e.preventDefault()});trellisStage.addEventListener('click',e=>{if(performance.now()<shapeSuppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
changeCase('shapes',available.shapes[0].code);changeCase('trellis',available.trellis[0].code);
$('#shape .caption').textContent=`Image-to-3D generation on Hunyuan3D 2.1 and TRELLIS.2. Each example shows the input image, Ours, undistilled teacher, and full teacher. Play the turntable videos together and use each gallery’s arrows or swipe to browse ${available.shapes.length} Hunyuan3D and ${available.trellis.length} TRELLIS.2 examples.`;
const shapeVideoVisibility=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting){cancelPlayback(entry.target.id);entry.target.querySelectorAll('video').forEach(v=>{v.pause();deferVideoRelease(v)})}},{threshold:.1});
for(const id of ['shape-results','trellis-results'])shapeVideoVisibility.observe($('#'+id));
