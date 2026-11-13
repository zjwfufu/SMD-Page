/* Anonymous project introduction and reading navigation. */
(() => {
 const hero=document.querySelector('.hero');hero.id='overview';
 document.getElementById('teaser').after(hero);
 // Arrange the title and project description in two columns.
 // Retain the project description and navigation.
 const introduction=document.createElement('div');introduction.className='project-introduction';introduction.id='overview';
 hero.id='project-title-block';hero.before(introduction);
 introduction.append(hero,document.getElementById('abstract'));

 // The approved teaser uses the existing film slot, independently of Method.
 // preload=none keeps the full film off the network until the visitor plays it.
 const films=[{id:'demo',title:'Teaser Video',src:'assets/teaser/SMD_r69_1080p_x264.mp4',poster:'assets/teaser/SMD_r69_first_frame.jpg'},{id:'method',title:'Method Overview',src:null,poster:null}];
 const filmSections=document.createElement('div');filmSections.id='film-sections';
 for(const film of films){
  const section=document.createElement('section');section.id=film.id;section.className='project-film';section.setAttribute('aria-labelledby',film.id+'-title');
  section.innerHTML=`<h2 id="${film.id}-title">${film.title}</h2>`;
  if(film.src){
   const player=document.createElement('div');player.className='film-player';
   const video=document.createElement('video');video.controls=false;video.playsInline=true;video.preload='none';video.dataset.src=film.src;if(film.poster)video.poster=film.poster;
   const cover=document.createElement('button');cover.type='button';cover.className='film-cover';
   cover.innerHTML='<span class="film-play-mark" aria-hidden="true">▶</span><span class="film-play-label">Play teaser video</span>';
   cover.addEventListener('click',async()=>{cover.disabled=true;video.controls=true;const label=cover.querySelector('.film-play-label');label.textContent='Loading video…';try{await ensureVideoSource(video);await video.play()}catch{
    if(!video.error){cover.disabled=false;video.controls=false;label.textContent='Play teaser video';return}
    cover.hidden=true;video.focus()
   }});
   video.addEventListener('playing',()=>{cover.hidden=true},{once:true});
   video.addEventListener('error',()=>{cover.hidden=true});
   player.append(video,cover);section.append(player);
  }
  else{const note=document.createElement('p');note.className='film-pending';note.textContent='Coming soon';section.append(note)}
  filmSections.append(section);
 }
 introduction.after(filmSections);

 const groups=[
  {label:'Visual generation',items:[['explore','Image Generation'],['editing','Image Editing'],['shape','3D Generation']]},
  {label:'Video and audio',items:[['video','Video Generation'],['causal','Causal Video Generation'],['audio','Audio–Video Generation'],['multimodal','Multimodal Generation']]},
  {label:'Teacher transfer',items:[['transfer','Cross-Model Distillation'],['multi-teacher','Multi-Teacher Distillation']]}
 ];
 const experiments=document.createElement('div');experiments.id='experiments';experiments.className='experiment-layout';
 const sidebar=document.createElement('nav');sidebar.className='experiment-sidebar';sidebar.setAttribute('aria-label','Experiment sections');
 sidebar.innerHTML=`<a class="experiment-index-title" href="#experiments">Explore SMD</a>${groups.map(group=>`<div class="experiment-nav-group"><p>${group.label}</p>${group.items.map(([id,title])=>`<a href="#${id}" data-section-link="${id}">${title}</a>`).join('')}</div>`).join('')}`;
 const body=document.createElement('div');body.className='experiment-body';
 const heading=document.createElement('h2');heading.className='experiment-heading';heading.textContent='Explore SMD';
 for(const group of groups)for(const [id]of group.items)body.append(document.getElementById(id));
 experiments.append(heading,sidebar,body);document.getElementById('full-content').prepend(experiments);
 const jump=document.createElement('nav');jump.className='experiment-mobile-nav';jump.setAttribute('aria-label','Experiment chapters');
 jump.innerHTML=groups.flatMap(group=>group.items.map(([id,title])=>`<a href="#${id}" data-section-link="${id}">${title}</a>`)).join('');
 heading.after(jump);

 const topbar=document.createElement('header');topbar.className='project-topbar';
 topbar.innerHTML='<div class="project-topbar-inner"><a class="project-wordmark" href="#top" aria-label="SMD home">SMD</a><nav aria-label="Main navigation"><a href="#overview" data-main-link="overview">Overview</a><a href="#demo" data-main-link="demo">Teaser Video</a><a href="#method" data-main-link="method">Method Overview</a><a href="#experiments" data-main-link="experiments">Explore SMD</a></nav></div>';
 document.body.prepend(topbar);
 for(const [id,short]of Object.entries({demo:'Teaser',method:'Method',experiments:'Explore SMD'})){const link=topbar.querySelector(`[data-main-link="${id}"]`),full=link.textContent;link.setAttribute('aria-label',full);link.innerHTML=`<span class="nav-full">${full}</span><span class="nav-short" aria-hidden="true">${short}</span>`}
 const ids=['overview','demo','method','experiments',...groups.flatMap(g=>g.items.map(([id])=>id))];
 let scrollJob=0,lastChapter='';
 function updateNavigationOffsets(){
  const headerHeight=Math.ceil(topbar.getBoundingClientRect().height),chapterHeight=Math.ceil(jump.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--project-header-height',headerHeight+'px');
  document.documentElement.style.setProperty('--experiment-scroll-offset',(headerHeight+chapterHeight+16)+'px');
  markSection();
 }
 function markSection(){
  scrollJob=0;let current='';const boundary=topbar.getBoundingClientRect().height+jump.getBoundingClientRect().height+48;for(const id of ids){const element=document.getElementById(id);if(!element.closest('[hidden]')&&element.getBoundingClientRect().top<=boundary)current=id}
  for(const link of [...sidebar.querySelectorAll('[data-section-link]'),...jump.querySelectorAll('[data-section-link]')]){if(link.dataset.sectionLink===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  const category=['overview','demo','method'].includes(current)?current:current?'experiments':'';
  for(const link of topbar.querySelectorAll('[data-main-link]')){if(link.dataset.mainLink===category)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  lastChapter=current;
 }
 addEventListener('scroll',()=>{if(!scrollJob)scrollJob=requestAnimationFrame(markSection)},{passive:true});addEventListener('resize',updateNavigationOffsets);
 const navigationResize=new ResizeObserver(updateNavigationOffsets);navigationResize.observe(topbar);navigationResize.observe(jump);updateNavigationOffsets();
 function goToSection(id){if(window.SMD_EXPERIMENT_ATLAS?.navigate(id))return;const target=document.getElementById(id);if(!target)return;history.pushState(null,'','#'+id);target.scrollIntoView({block:'start',behavior:'instant'});markSection()}
 for(const link of [...topbar.querySelectorAll('a'),...sidebar.querySelectorAll('a'),...jump.querySelectorAll('a')])link.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();goToSection(link.hash.slice(1))});
 addEventListener('popstate',()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}if(window.SMD_EXPERIMENT_ATLAS?.navigate(id,{history:false,animate:false}))return;openLinkedResults();document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});markSection()});
 // Existing hash links continue to work after grouping the section nodes.
 if(location.hash){openLinkedResults();requestAnimationFrame(()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'})})}
})();
