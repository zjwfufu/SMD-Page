/* Isolated overlays and pre-sized media keep other sections stationary. */
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
prepareDisclosures(document);
const changeCaseBeforeLayout=changeCase;
changeCase=function(group,code){
  document.querySelectorAll('#'+resultIds[group]+' details[open]').forEach(closeDisclosure);
  changeCaseBeforeLayout(group,code);prepareDisclosures(document.querySelector('#'+resultIds[group]));
};
document.addEventListener('pointerdown',event=>{document.querySelectorAll('.overlay-disclosure[open]').forEach(details=>{if(!details.contains(event.target))closeDisclosure(details)})});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||document.querySelector('dialog[open]'))return;
  const open=[...document.querySelectorAll('.overlay-disclosure[open]')];if(!open.length)return;
  const focused=open.find(details=>details.contains(document.activeElement));open.forEach(closeDisclosure);focused?.querySelector('summary').focus();
});
