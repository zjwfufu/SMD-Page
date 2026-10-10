/* Report authors and reading navigation. See PAGE_REFINEMENT.md for provenance. */
(() => {
 const authors=[
  {name:'Jiawei Zhang',affiliation:'1',url:'https://zjwsite.github.io/'},
  {name:'Ziyu Wan',affiliation:'1',url:'http://raywzy.com/'},
  {name:'Nanye Ma',affiliation:'2',url:'https://willisma.github.io/'},
  {name:'Long Zhao',affiliation:'',url:'https://garyzhao.github.io/'},
  {name:'Dong Chen',affiliation:'1',url:'https://www.dongchen.pro/'},
  {name:'Hongyu Liu',affiliation:'3',url:'https://kumapowerliu.github.io/'},
  {name:'Qifeng Chen',affiliation:'3',url:'https://cqf.io/'},
  {name:'Dongdong Chen',affiliation:'1',url:'https://www.dongdongchen.bid/'}
 ];
 const hero=document.querySelector('.hero');hero.id='overview';
 document.getElementById('teaser').after(hero);
 const authorBlock=document.createElement('div');authorBlock.className='project-credits';
 authorBlock.innerHTML=`<ul class="project-authors" aria-label="Authors">${authors.map(a=>`<li><a href="${a.url}" target="_blank" rel="noopener noreferrer">${esc(a.name)}</a>${a.affiliation?`<sup>${a.affiliation}</sup>`:''}</li>`).join('')}</ul><p class="project-affiliations"><span><sup>1</sup> Microsoft Research</span><span><sup>2</sup> NYU</span><span><sup>3</sup> HKUST</span></p>`;
 hero.append(authorBlock);

 // Set verified release URLs here. Never substitute the website-source repository.
 const projectResources=[
  {label:'Paper',url:'#todo',icon:'<path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5"/>'},
  {label:'Code',url:'https://github.com/zjwfufu/SMD',icon:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>'},
  {label:'Model',url:'https://huggingface.co/collections/zjwfufu/smd',icon:'<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9m-4.5-16.5 9 5"/>'},
  {label:'Data',url:'https://huggingface.co/collections/zjwfufu/smd-data',icon:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'}
 ];
 const resources=document.createElement('div');resources.className='project-resources';resources.setAttribute('aria-label','Project resources');
 resources.innerHTML=projectResources.map(item=>{const contents=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.icon}</svg><span>${item.label}</span>`;return item.url?`<a class="resource-button" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${contents}</a>`:`<button type="button" class="resource-button" disabled aria-label="${item.label} link pending" title="Link pending">${contents}</button>`}).join('');
 authorBlock.append(resources);
 resources.querySelector('a[href="#todo"]').addEventListener('click',event=>event.preventDefault());

 // One editorial introduction, credits on the left and approved copy on the right.
 // Move existing nodes so author links and abstract wording remain untouched.
 const introduction=document.createElement('div');introduction.className='project-introduction';introduction.id='overview';
 hero.id='project-title-block';hero.before(introduction);
 introduction.append(hero,document.getElementById('abstract'));

 // Supply source/poster paths here when the two requested films are ready.
 // Null means no player, no media request, and no invented demo asset.
 const films=[{id:'demo',title:'Teaser Video',src:null,poster:null},{id:'method',title:'Method Overview',src:null,poster:null}];
 const filmSections=document.createElement('div');filmSections.id='film-sections';
 for(const film of films){
  const section=document.createElement('section');section.id=film.id;section.className='project-film';section.setAttribute('aria-labelledby',film.id+'-title');
  section.innerHTML=`<h2 id="${film.id}-title">${film.title}</h2>`;
  if(film.src){const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=film.src;if(film.poster)video.poster=film.poster;section.append(video)}
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
