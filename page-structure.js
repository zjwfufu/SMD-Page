/* Report authors and reading navigation. See PAGE_REFINEMENT.md for provenance. */
(() => {
 const authors=[
  {name:'Jiawei Zhang',affiliation:'1',url:'https://github.com/zjwfufu'},
  {name:'Ziyu Wan',affiliation:'1',url:'https://github.com/raywzy'},
  {name:'Nanye Ma',affiliation:'2',url:'https://willisma.github.io/'},
  {name:'Long Zhao',affiliation:'',url:'https://garyzhao.github.io/'},
  {name:'Dong Chen',affiliation:'1',url:'https://www.microsoft.com/en-us/research/people/doch/about/'},
  {name:'Hongyu Liu',affiliation:'3',url:'https://kumapowerliu.github.io/'},
  {name:'Qifeng Chen',affiliation:'3',url:'https://cqf.io/'},
  {name:'Dongdong Chen',affiliation:'1',url:'https://www.microsoft.com/en-us/research/people/dochen/'}
 ];
 const hero=document.querySelector('.hero');hero.id='overview';
 document.getElementById('teaser').after(hero);
 const authorBlock=document.createElement('div');authorBlock.className='project-credits';
 authorBlock.innerHTML=`<ul class="project-authors" aria-label="Authors">${authors.map(a=>`<li><a href="${a.url}" target="_blank" rel="noopener noreferrer">${esc(a.name)}</a>${a.affiliation?`<sup>${a.affiliation}</sup>`:''}</li>`).join('')}</ul><p class="project-affiliations"><span><sup>1</sup> Microsoft Research</span><span><sup>2</sup> NYU</span><span><sup>3</sup> HKUST</span></p>`;
 hero.append(authorBlock);

 // Supply source/poster paths here when the two requested films are ready.
 // Null means no player, no media request, and no invented demo asset.
 const films=[{id:'demo',title:'Demo film',src:null,poster:null},{id:'method',title:'Method',src:null,poster:null}];
 const filmSections=document.createElement('div');filmSections.id='film-sections';
 for(const film of films){
  const section=document.createElement('section');section.id=film.id;section.className='project-film';section.setAttribute('aria-labelledby',film.id+'-title');
  section.innerHTML=`<h2 id="${film.id}-title">${film.title}</h2>`;
  if(film.src){const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=film.src;if(film.poster)video.poster=film.poster;section.append(video)}
  else{const note=document.createElement('p');note.className='film-pending';note.textContent='Coming soon';section.append(note)}
  filmSections.append(section);
 }
 document.getElementById('abstract').after(filmSections);

 const groups=[
  {label:'Visual generation',items:[['explore','Images'],['editing','Image editing'],['shape','3D']]},
  {label:'Video and audio',items:[['video','Video'],['causal','Causal video'],['audio','Audio–video'],['multimodal','Multimodal']]},
  {label:'Teacher transfer',items:[['transfer','Cross-model'],['multi-teacher','Multi-teacher']]}
 ];
 const experiments=document.createElement('div');experiments.id='experiments';experiments.className='experiment-layout';
 const sidebar=document.createElement('nav');sidebar.className='experiment-sidebar';sidebar.setAttribute('aria-label','Experiment sections');
 sidebar.innerHTML=`<a class="experiment-index-title" href="#experiments">Experiments</a>${groups.map(group=>`<div class="experiment-nav-group"><p>${group.label}</p>${group.items.map(([id,title])=>`<a href="#${id}" data-section-link="${id}">${title}</a>`).join('')}</div>`).join('')}`;
 const body=document.createElement('div');body.className='experiment-body';
 const heading=document.createElement('h2');heading.className='experiment-heading';heading.textContent='Experiments';body.append(heading);
 for(const group of groups)for(const [id]of group.items)body.append(document.getElementById(id));
 experiments.append(sidebar,body);document.getElementById('full-content').prepend(experiments);
 const jump=document.createElement('div');jump.className='experiment-mobile-nav';
 jump.innerHTML=`<label for="experiment-jump">Experiments</label><select id="experiment-jump">${groups.map(group=>`<optgroup label="${group.label}">${group.items.map(([id,title])=>`<option value="${id}">${title}</option>`).join('')}</optgroup>`).join('')}</select>`;
 heading.after(jump);jump.querySelector('select').addEventListener('change',event=>goToSection(event.target.value));

 const topbar=document.createElement('header');topbar.className='project-topbar';
 topbar.innerHTML='<div class="project-topbar-inner"><a class="project-wordmark" href="#top" aria-label="SMD home">SMD</a><nav aria-label="Main navigation"><a href="#overview" data-main-link="overview">Overview</a><a href="#demo" data-main-link="demo">Demo</a><a href="#method" data-main-link="method">Method</a><a href="#experiments" data-main-link="experiments">Experiments</a></nav></div>';
 document.body.prepend(topbar);
 const ids=['overview','demo','method',...groups.flatMap(g=>g.items.map(([id])=>id))];
 let scrollJob=0;
 function markSection(){
  scrollJob=0;let current='';for(const id of ids){if(document.getElementById(id).getBoundingClientRect().top<=150)current=id}
  for(const link of sidebar.querySelectorAll('[data-section-link]')){if(link.dataset.sectionLink===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  const category=['overview','demo','method'].includes(current)?current:current?'experiments':'';
  for(const link of topbar.querySelectorAll('[data-main-link]')){if(link.dataset.mainLink===category)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  if(groups.some(g=>g.items.some(([id])=>id===current))&&document.activeElement!==jump.querySelector('select'))jump.querySelector('select').value=current;
 }
 addEventListener('scroll',()=>{if(!scrollJob)scrollJob=requestAnimationFrame(markSection)},{passive:true});addEventListener('resize',markSection);markSection();
 function goToSection(id){const target=document.getElementById(id);if(!target)return;history.pushState(null,'','#'+id);target.scrollIntoView({block:'start',behavior:'instant'});markSection()}
 for(const link of [...topbar.querySelectorAll('a'),...sidebar.querySelectorAll('a')])link.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();goToSection(link.hash.slice(1))});
 addEventListener('popstate',()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}openLinkedResults();document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});markSection()});
 // Existing hash links continue to work after grouping the section nodes.
 if(location.hash){requestAnimationFrame(()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'})})}
})();
