/* Shared report copy, evidence panels and navigation for nine inline chapters. */
(() => {
  const content = window.SMD_REPORT_CONTENT;
  const escape = value => esc(String(value));
  const abstract = document.querySelector('#abstract');
  abstract.setAttribute('aria-label', 'About Simplified Matching Distillation');
  abstract.innerHTML = content.abstract.map(p => `<p>${escape(p)}</p>`).join('');

  function metricPanel(id, spec) {
    const panel = document.createElement('section');
    panel.className = 'report-evidence';
    panel.id = `${id}-evidence`;
    panel.setAttribute('aria-labelledby', `${id}-evidence-title`);
    panel.innerHTML = `<div class="evidence-heading"><h3 id="${id}-evidence-title">Benchmarks</h3></div>`;

    let selected = spec.metrics[0], sortMetric = null, chartOptions = {}, pinnedSeries = null;
    const narrow = matchMedia('(max-width:700px)');
    const tabs = document.createElement('div');
    tabs.className = 'benchmark-tabs';
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', `${spec.title} benchmark setting`);
    tabs.innerHTML = spec.metrics.map(key => `<button type="button" data-benchmark="${key}" aria-pressed="${key === selected}">${escape(SMD_METRICS[key].title)}</button>`).join('');
    const view = document.createElement('div');
    view.className = 'benchmark-view';
    if (spec.metrics.length > 1 && id !== 'audio') panel.querySelector('.evidence-heading').append(tabs);
    panel.append(view);
    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    panel.append(status);
    function render() {
      const keepOpen=!!view.querySelector('.bench-full-data[open]');
      panel.dataset.benchmark=selected;
      view.innerHTML=SMD_RENDER_BENCHMARK(selected,sortMetric,{...chartOptions,compact:narrow.matches});
      if(keepOpen)view.querySelector('.bench-full-data').open=true;
      tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.benchmark===selected)));
      highlight(pinnedSeries);
    }
    function highlight(index){
      const root=view.querySelector('.benchmark-explorer');if(!root)return;
      const active=index===null?Number(root.dataset.defaultSeries):Number(index);
      root.classList.toggle('has-inspection',index!==null);
      root.querySelectorAll('.bench-series').forEach(el=>el.classList.toggle('is-inspected',Number(el.dataset.benchSeries)===active));
      root.querySelectorAll('.bench-legend button').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.benchSeries)===active)));
      const legend=root.querySelector(`.bench-legend button[data-bench-series="${active}"]`),out=root.querySelector('.bench-inspector');
      if(legend&&out)out.textContent=legend.dataset.inspect;
    }
    narrow.addEventListener('change',render);
    tabs.addEventListener('click',event=>{
      const button=event.target.closest('[data-benchmark]');if(!button)return;
      selected=button.dataset.benchmark;sortMetric=null;pinnedSeries=null;render();status.textContent=SMD_METRICS[selected].title;
    });
    view.addEventListener('click',event=>{
      const series=event.target.closest('[data-bench-series]');
      if(series){pinnedSeries=Number(series.dataset.benchSeries);highlight(pinnedSeries);return;}
      const axis=event.target.closest('[data-bench-axis]'),metric=event.target.closest('[data-bench-metric]'),button=event.target.closest('[data-sort-metric]');
      if(axis){chartOptions.axis=axis.dataset.benchAxis;render();view.querySelector(`[data-bench-axis="${chartOptions.axis}"]`).focus({preventScroll:true});return;}
      if(metric){chartOptions.metric=Number(metric.dataset.benchMetric);render();view.querySelector(`[data-bench-metric="${chartOptions.metric}"]`).focus({preventScroll:true});return;}
      if(!button)return;
      const tableKey=button.closest('[data-table-key]')?.dataset.tableKey;
      sortMetric=Number(button.dataset.sortMetric);render();
      view.querySelector(`[data-table-key="${tableKey}"] [data-sort-metric="${sortMetric}"]`).focus({preventScroll:true});
      status.textContent='Sorted by '+SMD_METRICS[selected].metrics[sortMetric];
    });
    view.addEventListener('pointerover',event=>{const el=event.target.closest('[data-bench-series]');if(el)highlight(Number(el.dataset.benchSeries));});
    view.addEventListener('pointerout',event=>{const el=event.target.closest('[data-bench-series]');if(el&&!el.contains(event.relatedTarget))highlight(pinnedSeries);});
    view.addEventListener('focusin',event=>{const el=event.target.closest('[data-bench-series]');if(el)highlight(Number(el.dataset.benchSeries));});
    view.addEventListener('focusout',event=>{if(event.target.closest('[data-bench-series]'))highlight(pinnedSeries);});
    view.addEventListener('keydown',event=>{const el=event.target.closest('g[data-bench-series]');if(el&&['Enter',' '].includes(event.key)){event.preventDefault();pinnedSeries=Number(el.dataset.benchSeries);highlight(pinnedSeries);}});
    render();
    return panel;
  }

  for (const [id, spec] of Object.entries(content)) {
    if (id === 'abstract') continue;
    const overview = document.getElementById(`${id}-overview`);
    const panelRoot = document.getElementById(`${id}-details`);
    if (!overview || !panelRoot) continue;
    overview.querySelector('h2').textContent = spec.title;
    overview.querySelector('.overview-intro').textContent = spec.overview;
    overview.querySelector('.overview-trigger')?.setAttribute('aria-label', `View ${spec.title} results`);
    panelRoot.querySelector('.results-collapse[aria-label]').setAttribute('aria-label', `Hide ${spec.title} results`);
    panelRoot.querySelector('.results-heading-title').textContent=spec.title;
    const body = panelRoot.querySelector('.results-content');
    // Supersede old report notes and the legacy multi-teacher-only table.
    body.querySelectorAll('.protocol-note,.multi-quantitative').forEach(el => el.remove());
    const galleryHeading=document.createElement('h3');galleryHeading.className='results-subheading';galleryHeading.textContent='Gallery';galleryHeading.id=`${id}-gallery-title`;body.prepend(galleryHeading);
    const examples=body.querySelector('.case-carousel,#multimodal-gallery-results');
    if(examples)examples.id ||= `${id}-examples`;
    if(spec.metrics)body.append(metricPanel(id,spec));
    // Preserve the original button nodes and handlers; share one footer layout.
    body.querySelectorAll('.case-carousel').forEach(carousel => {
      const previous = carousel.querySelector('.carousel-arrow.previous');
      const next = carousel.querySelector('.carousel-arrow.next');
      const footer = carousel.querySelector('.carousel-footer');
      if (previous && next && footer) { footer.prepend(previous); footer.append(next); }
    });
  }
})();
