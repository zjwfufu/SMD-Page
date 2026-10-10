/* A continuous, keyboard-accessible mosaic built from the original overview art.
   Existing chapter nodes are moved nowhere and keep their gallery state. */
(() => {
  const root = document.getElementById('experiments');
  if (!root || !window.SMD_REPORT_CONTENT) return;
  const body = root.querySelector('.experiment-body');
  const ids = overviewSpecs.map(spec => spec.section);
  const sections = ids.map(id => document.getElementById(id));
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title = id => SMD_REPORT_CONTENT[id].title;
  let selected = null, version = 0;

  // Nine large canvases are revealed through narrow, shared diagonal apertures.
  const board = document.createElement('div');
  board.id = 'experiment-atlas';
  board.className = 'experiment-atlas';
  board.setAttribute('role', 'group');
  board.setAttribute('aria-label', 'Explore the experiments');
  const toolbar = document.createElement('div');
  toolbar.className = 'atlas-toolbar';
  toolbar.hidden = true;
  toolbar.innerHTML = '<button type="button" class="atlas-return" aria-label="Return to Explore SMD">Return</button>';
  const viewport = document.createElement('div');viewport.className = 'atlas-viewport';viewport.append(board);
  body.before(viewport, toolbar);

  function overviewArt(id, index) {
    const stage = document.querySelector(`#${id}-overview .overview-stage`).cloneNode(true);
    if(id==='video'){
      // Independent live scenes distinguish video synthesis from the causal
      // chapter's repeated views of one sequence. Reuse the same source cases.
      const wall=document.createElement('div');wall.className='video-scene-wall';
      for(const clip of overviewData.strips){
        const scene=document.createElement('div');scene.className='video-scene';scene.dataset.videoCase=clip.id;
        scene.innerHTML=`<video data-src="${esc(clip.video)}" poster="${esc(clip.frames[0])}" muted playsinline loop preload="none"></video>`;
        wall.append(scene);
      }
      stage.replaceChildren(wall);
    }
    const artwork = document.createElement('span');
    artwork.className = 'atlas-art';
    artwork.setAttribute('aria-hidden', 'true');
    artwork.inert = true;
    // Copies must not duplicate SVG paint-server IDs or add nested controls.
    const idMap = new Map();
    stage.querySelectorAll('[id]').forEach(node => {
      const previous = node.id, next = `atlas-${index}-${previous}`;
      idMap.set(previous, next);node.id = next;
    });
    for (const node of stage.querySelectorAll('*')) for (const attribute of [...node.attributes]) {
      let value = attribute.value;
      for (const [before, after] of idMap) value = value.replaceAll(`url(#${before})`, `url(#${after})`);
      if (value !== attribute.value) node.setAttribute(attribute.name, value);
    }
    stage.querySelectorAll('input,button,.edit-instruction').forEach(node => node.remove());
    // The entry collage shows the media, not the overview's explanatory arrows.
    stage.querySelectorAll('.transfer-arrow,.multi-merge,.multimodal-brush-arrow,.audio-ribbon').forEach(node => node.remove());
    // Posters keep nine entries inexpensive. Only a hovered/focused entry may play.
    stage.querySelectorAll('video').forEach(video => {
      const poster = document.createElement('img');
      poster.src = video.getAttribute('poster') || video.dataset.poster;
      poster.alt = '';poster.loading = 'lazy';poster.decoding = 'async';
      poster.dataset.previewSrc = video.dataset.src;
      video.replaceWith(poster);
    });
    stage.querySelectorAll('img').forEach(image => {image.alt = '';image.draggable = false;});
    artwork.append(stage);
    return artwork;
  }

  const tiles = ids.map((id, index) => {
    const wrapper = document.createElement('div');wrapper.className = 'atlas-piece';
    const button = document.createElement('button');button.type = 'button';
    button.className = 'atlas-tile';button.dataset.chapter = id;
    button.setAttribute('aria-label', `Explore ${title(id)}`);
    button.setAttribute('aria-controls', id);button.setAttribute('aria-expanded', 'false');
    button.append(overviewArt(id, index));
    const label = document.createElement('span');label.className = 'atlas-label';
    label.innerHTML = `<span class="atlas-number">${String(index + 1).padStart(2, '0')}</span><span class="atlas-name">${esc(title(id))}</span><span class="atlas-arrow" aria-hidden="true">↗</span>`;
    button.append(label);wrapper.append(button);board.append(wrapper);
    let touchWasActive = false, touchPointer = false;
    button.addEventListener('pointerdown', event => {touchPointer=event.pointerType !== 'mouse';if(touchPointer)touchWasActive = activeIndex === index;});
    button.addEventListener('click', event => {
      if ((event.pointerType ? event.pointerType !== 'mouse' : touchPointer && event.detail !== 0) && !touchWasActive) {preview(button);revealOnTouch(index);return;}
      navigate(id);
    });
    button.addEventListener('focus', () => {preview(button);revealOnTouch(index);});
    button.addEventListener('blur', event => {if (!board.contains(event.relatedTarget)) stopPreview();});
    button.addEventListener('keydown', event => {
      const shifts = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1};
      let destination;
      if (event.key in shifts) destination = (index + shifts[event.key] + ids.length) % ids.length;
      else if (event.key === 'Home') destination = 0;
      else if (event.key === 'End') destination = ids.length - 1;
      if (destination !== undefined) {event.preventDefault();tiles[destination].focus();}
    });
    return button;
  });

  let activeIndex = -1, previewMedia = [], previewJob = 0;
  const restingWeights = [1.08,.96,1.12,.98,1.04,.95,1.10,.94,1.02];
  const currentWeights = [...restingWeights];
  function paintApertures() {
    const width = board.clientWidth, height = board.clientHeight;
    if (!width || !height) return;
    // Hover never changes these resting bounds or shared diagonal seams.
    const total = currentWeights.reduce((a,b) => a+b,0);
    const lean = Math.min(72, width*.075);
    // Preserve strong slopes where space permits. Bound the difference between
    // adjacent seams rather than flattening every seam when one slice opens.
    const cuts = [0,-.85,.5,1,-.4,-1,.7,.22,-.65,0];
    const offsets=cuts.map(value=>value*lean/2);
    const minimum=width<=800?44:36, gap=1.5;
    // The ribbon is three times taller; keep seam angles identical to the
    // previous-height composition rather than relaxing the slope constraints.
    const seamReferenceHeight=height/3;
    const limits=currentWeights.map(weight=>Math.max(0,weight/total*seamReferenceHeight-minimum-gap*2-.1));
    const clamp=(value,center,radius)=>Math.max(center-radius,Math.min(center+radius,value));
    for(let pass=0;pass<12;pass++){
      for(let i=1;i<9;i++)offsets[i]=clamp(offsets[i],offsets[i-1],limits[i-1]);
      for(let i=8;i>0;i--)offsets[i]=clamp(offsets[i],offsets[i+1],limits[i]);
    }
    let cumulative = 0;
    tiles.forEach((tile,index) => {
      const top = cumulative / total * height;cumulative += currentWeights[index];
      const bottom = cumulative / total * height;
      const topLeft = top + offsets[index], topRight = top - offsets[index];
      const bottomLeft = bottom + offsets[index+1], bottomRight = bottom - offsets[index+1];
      const y = Math.min(topLeft,topRight), h = Math.max(bottomLeft,bottomRight)-y;
      tile.parentElement.style.top = y+'px';tile.parentElement.style.height = h+'px';
      tile.style.clipPath = `polygon(0 ${topLeft-y+gap}px,100% ${topRight-y+gap}px,100% ${bottomRight-y-gap}px,0 ${bottomLeft-y-gap}px)`;
      tile.style.setProperty('--label-bottom', (h-(bottomLeft-y)+26)+'px');
    });
  }
  function expandAperture(index) {
    activeIndex=index;
  }
  // Only scroll when a keyboard/touch selection would otherwise be offscreen.
  let revealTimer = 0;
  function revealOnTouch(index) {
    clearTimeout(revealTimer);
    revealTimer=setTimeout(()=>{
      if(activeIndex!==index||selected)return;
      const piece=tiles[index].parentElement,rect=piece.getBoundingClientRect();
      const header=document.querySelector('.project-topbar')?.getBoundingClientRect().height||64;
      if(rect.top<header+12||rect.bottom>innerHeight-12){
        const delta=rect.top<header+12?rect.top-header-12:rect.bottom-innerHeight+12;
        window.scrollBy({top:delta,behavior:reducedMotion()?'instant':'smooth'});
      }
    },320);
  }
  function stopPreview(collapse = true) {
    previewJob++;
    clearTimeout(revealTimer);
    for(const {video,poster} of previewMedia){
      video.pause();video.removeAttribute('src');video.load();video.remove();poster.hidden=false;
    }
    previewMedia = [];
    board.classList.remove('is-exploring');
    board.querySelectorAll('.is-active').forEach(node => node.classList.remove('is-active'));
    if (collapse) expandAperture(-1);
  }
  async function preview(button) {
    const index=tiles.indexOf(button);if(index===activeIndex)return;
    stopPreview(false);expandAperture(index);
    button.parentElement.classList.add('is-active');board.classList.add('is-exploring');
    if (reducedMotion() || document.hidden || board.hidden) return;
    const posters = [...button.querySelectorAll('[data-preview-src]')], job = previewJob;
    // Multimodal has both a reference video and a generated result. Preview all
    // videos in this one active tile rather than picking the first DOM match.
    previewMedia = posters.map(poster=>{
      const video=document.createElement('video');
      video.className='atlas-motion';video.muted=true;video.loop=true;video.playsInline=true;
      video.poster=poster.src;video.setAttribute('aria-hidden','true');
      video.src=poster.dataset.previewSrc;poster.after(video);poster.hidden=true;
      return {video,poster};
    });
    await Promise.allSettled(previewMedia.map(async entry=>{
      const {video,poster}=entry;
      try{await video.play();if(job!==previewJob)video.pause();}
      catch{if(job===previewJob){video.pause();video.removeAttribute('src');video.load();video.remove();poster.hidden=false;previewMedia=previewMedia.filter(item=>item!==entry);}}
    }));
  }
  // Reflow alone must not trigger a new selection under a stationary pointer.
  // Resolve the piece only on actual pointer travel, so opening a slice is stable.
  let pointerX = null, pointerY = null;
  board.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || selected) return;
    if (pointerX !== null && Math.hypot(event.clientX-pointerX,event.clientY-pointerY)<3) return;
    pointerX=event.clientX;pointerY=event.clientY;
    const tile=event.target.closest('.atlas-tile');if(tile)preview(tile);
  });
  board.addEventListener('pointerleave', () => {pointerX=pointerY=null;if(!board.contains(document.activeElement))stopPreview();});
  document.addEventListener('visibilitychange', () => {if (document.hidden) stopPreview();});
  const boardObserver = new IntersectionObserver(entries => {if (!entries[0].isIntersecting) stopPreview();});
  boardObserver.observe(board);

  // Artwork stays large even inside a closed slice. The aperture does the cropping.
  const artResize = new ResizeObserver(paintApertures);artResize.observe(board);paintApertures();
  for (const section of sections) {
    section.hidden = true;
    section.classList.add('atlas-chapter');
    const end = document.createElement('div');end.className = 'atlas-chapter-end';
    const back = document.createElement('button');back.type = 'button';back.className = 'atlas-return';
    back.textContent = 'Return';back.setAttribute('aria-label','Return to Explore SMD');back.addEventListener('click', () => navigate('experiments'));
    end.append(back);section.append(end);
  }
  body.hidden = true;
  root.classList.add('has-experiment-atlas');
  toolbar.querySelector('button').addEventListener('click', () => navigate('experiments'));
  // This presentation enters results directly. Legacy collapse actions must not
  // bring the intermediate overview back, including the panel's Escape handler.
  root.addEventListener('click', event => {
    if(event.target.closest('.results-collapse')){event.preventDefault();event.stopImmediatePropagation();navigate('experiments');}
  },true);
  root.addEventListener('keydown', event => {
    if(event.key==='Escape'&&selected&&!document.querySelector('dialog[open]')){
      event.preventDefault();event.stopImmediatePropagation();navigate('experiments');
    }
  },true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected && !document.querySelector('dialog[open]') && !event.defaultPrevented) {
      event.preventDefault();navigate('experiments');
    }
  });
  const status = document.createElement('span');status.className = 'sr-only';status.setAttribute('role', 'status');root.append(status);
  function updateHash(id, enabled) {if (enabled && location.hash !== '#' + id) history.pushState(null, '', '#' + id);}
  async function transition(element, incoming, enabled) {
    if (!enabled || reducedMotion() || !element.animate) return;
    await playResultTransition(element, incoming
      ? [{opacity: 0, transform: 'translateY(18px) scale(.985)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}]
      : [{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(-10px)'}],
    {duration: incoming ? 320 : 160, easing: 'cubic-bezier(.2,.7,.2,1)'});
  }
  async function show(id, anchor, options) {
    const {history: writeHistory = true, animate = true, focus = true, scroll = true} = options;
    const chapter = document.getElementById(id), panel = document.getElementById(id+'-details');
    const requested = document.getElementById(anchor);
    const destination = requested?.closest('.results-panel') ? requested : panel;
    if (selected === id) {
      version++;
      await inlineResults.get(panel.id).setExpanded(true, {focus, scroll: false, animate: false});
      updateHash(anchor, writeHistory);
      if (scroll) destination.scrollIntoView({block: 'start', behavior: 'instant'});
      return;
    }
    const currentVersion = ++version;
    stopPreview();stopOverviewMotion(true);
    sections.forEach(section => pauseResultContent(section));
    const outgoing = body.hidden ? board : body;
    await transition(outgoing, false, animate);
    if (currentVersion !== version) return;
    sections.forEach(section => {section.hidden = section !== chapter;});
    selected = id;board.hidden = true;viewport.hidden = true;body.hidden = false;toolbar.hidden = false;
    root.classList.add('has-selected-chapter');
    tiles.forEach(tile => tile.setAttribute('aria-expanded', String(tile.dataset.chapter === id)));
    await inlineResults.get(id + '-details').setExpanded(true, {focus: false, scroll: false, animate: false});
    updateHash(anchor, writeHistory);
    if (scroll) (destination===panel?toolbar:destination).scrollIntoView({block: 'start', behavior: 'instant'});
    const focusTarget = panel;
    focusTarget.tabIndex = -1;if (focus) focusTarget.focus({preventScroll: true});
    status.textContent = title(id);
    dispatchEvent(new Event('resize'));
    await transition(body, true, animate);
  }
  async function showBoard(options) {
    const {history: writeHistory = true, animate = true, focus = true, scroll = true} = options;
    if (!selected && !board.hidden) {version++;updateHash('experiments', writeHistory);if (scroll) root.scrollIntoView({block: 'start', behavior: 'instant'});return;}
    const currentVersion = ++version, previous = selected;
    stopPreview();stopOverviewMotion(true);sections.forEach(section => pauseResultContent(section));
    await transition(body, false, animate);
    if (currentVersion !== version) return;
    selected = null;sections.forEach(section => {section.hidden = true;});
    body.hidden = true;toolbar.hidden = true;board.hidden = false;viewport.hidden=false;
    root.classList.remove('has-selected-chapter');
    tiles.forEach(tile => tile.setAttribute('aria-expanded', 'false'));
    updateHash('experiments', writeHistory);
    if (scroll) root.scrollIntoView({block: 'start', behavior: 'instant'});
    if (focus) tiles[Math.max(0, ids.indexOf(previous))].focus({preventScroll: true});
    status.textContent = 'Explore SMD';dispatchEvent(new Event('resize'));
    await transition(board, true, animate);
  }
  function navigate(anchor, options = {}) {
    if (anchor === 'experiments' || anchor === board.id) {void showBoard(options);return true;}
    const target = document.getElementById(anchor), chapter = target?.closest('.atlas-chapter');
    if (!chapter) return false;
    void show(chapter.id, anchor, options);return true;
  }
  window.SMD_EXPERIMENT_ATLAS = {navigate};
  // Include the skip link and any in-content chapter/evidence links.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    let anchor;try {anchor = decodeURIComponent(link.hash.slice(1));} catch {return;}
    if (navigate(anchor)) {event.preventDefault();event.stopImmediatePropagation();}
  }, true);
  let initial;try {initial = decodeURIComponent(location.hash.slice(1));} catch {}
  if (initial) navigate(initial, {history: false, animate: false, focus: false});
  dispatchEvent(new Event('resize'));
})();
