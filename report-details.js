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
    panel.innerHTML = `<div class="evidence-heading"><h3 id="${id}-evidence-title">${spec.metrics.length === 1 ? escape(SMD_METRICS[spec.metrics[0]].title) : 'Benchmarks'}</h3></div>`;

    let selected = spec.metrics[0], metric = id === 'audio' ? 4 : 0;
    const tabs = document.createElement('div');
    tabs.className = 'benchmark-tabs';
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', `${spec.title} benchmark setting`);
    tabs.innerHTML = spec.metrics.map(key => `<button type="button" data-benchmark="${key}" aria-pressed="${key === selected}">${escape(SMD_METRICS[key].title)}</button>`).join('');
    const view = document.createElement('div');
    view.className = 'benchmark-view';
    if (spec.metrics.length > 1) panel.querySelector('.evidence-heading').append(tabs);
    panel.append(view);
    const status = document.createElement('p');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    panel.append(status);
    function render() {
      const data = SMD_METRICS[selected];
      if (metric >= data.metrics.length) metric = 0;
      const format = (value, i) => value === null ? 'Not reported' : Number(value).toFixed(data.precision[i]);
      const label = i => /^h3/.test(selected) && i === 4 ? 'Audio clarity · PAM × 5' : /^h3/.test(selected) && i === 5 ? 'Audio quality · PQ ÷ 2' : data.metrics[i];
      panel.classList.toggle('has-paired-metrics', data.rows.length === 2);
      if (data.rows.length === 2) {
        // Pairwise comparisons show every metric at once. Each pair shares its
        // own zero-based scale; unlike metrics never share a numerical axis.
        view.innerHTML = `<div class="paired-legend">${data.rows.map((row,r) => `<span><i class="${r === data.focus ? 'is-focus' : ''}" aria-hidden="true"></i>${escape(row[0])}<small>${escape(row[1])} NFE</small></span>`).join('')}</div>
          <div class="paired-metrics">${data.metrics.map((name,i) => `<section class="paired-metric" aria-label="${escape(label(i))}"><h4>${escape(label(i))} <span>↑</span></h4><div class="paired-axis" aria-hidden="true"><span>0</span><span>${data.max[i]}</span></div>${data.rows.map((row,r) => `<div class="paired-row ${r === data.focus ? 'is-focus' : ''}" aria-label="${escape(row[0] + ': ' + format(row[i+2], i))}"><div class="benchmark-track" aria-hidden="true">${row[i+2] === null ? '' : `<span style="width:${100 * row[i+2] / data.max[i]}%"></span>`}</div><strong>${format(row[i+2], i)}</strong></div>`).join('')}</section>`).join('')}</div>`;
      } else {
      view.innerHTML = `<div class="benchmark-toolbar"><label class="sr-only" for="${id}-metric-select">Metric</label><select id="${id}-metric-select">${data.metrics.map((name,i) => `<option value="${i}" ${i === metric ? 'selected' : ''}>${escape(label(i))} ↑</option>`).join('')}</select></div>
        <div class="benchmark-chart" role="group" aria-label="${escape(data.title + ': ' + label(metric))}"><div class="chart-axis" aria-hidden="true"><span>0</span><span>${data.max[metric]}</span></div>${data.rows.map((row,i) => `<div class="benchmark-row ${i === data.focus ? 'is-focus' : ''} ${/teacher/i.test(row[0]) && !/^cross/.test(selected) ? 'is-reference' : ''}"><div class="benchmark-method"><span title="${escape(row[0].includes('†') ? 'Quoted from the original paper' : row[0].includes('*') ? 'Baseline reproduced by us' : row[0])}">${escape(row[0])}</span><small>${escape(row[1])} NFE</small></div><div class="benchmark-track" aria-hidden="true">${row[metric+2] === null ? '' : `<span style="width:${100 * row[metric+2] / data.max[metric]}%"></span>`}</div><strong class="benchmark-value">${format(row[metric+2],metric)}</strong></div>`).join('')}</div>`;
      }
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.benchmark === selected)));
    }
    function chooseMetric(next, returnFocus) {
      metric = next;
      render();
      view.querySelector(returnFocus)?.focus({preventScroll:true});
      status.textContent = `${SMD_METRICS[selected].title}: ${SMD_METRICS[selected].metrics[metric]}`;
    }
    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-benchmark]');
      if (!button) return;
      selected = button.dataset.benchmark;
      render();
      status.textContent = `${SMD_METRICS[selected].title}: ${SMD_METRICS[selected].metrics[metric]}`;
    });
    view.addEventListener('change', event => {
      if (event.target.matches('select')) chooseMetric(Number(event.target.value), 'select');
    });
    // The audio benchmark follows the gallery budget in one direction. Benchmark
    // exploration itself never changes the current case, playback, or gallery NFE.
    if (id === 'audio') {
      document.querySelector('.audio-nfe-tabs').addEventListener('click', event => {
        const button = event.target.closest('[data-nfe]');
        if (button) { selected = button.dataset.nfe === '8' ? 'h3eight' : 'h3'; render(); }
      });
      document.querySelector('.audio-nfe-tabs').addEventListener('keydown', event => {
        if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
          selected = audioNfe === 8 ? 'h3eight' : 'h3'; render();
        }
      });
    }
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
    const body = panelRoot.querySelector('.results-content');
    // Supersede old report notes and the legacy multi-teacher-only table.
    body.querySelectorAll('.protocol-note,.multi-quantitative').forEach(el => el.remove());
    const intro = document.createElement('div');
    intro.className = 'report-detail-intro';
    intro.innerHTML = spec.metrics ? `<nav class="detail-jumps" aria-label="${escape(spec.title)} detail sections"><button type="button" data-detail-jump="examples">Gallery</button><button type="button" data-detail-jump="evidence">Benchmarks</button></nav>` : '';
    if (spec.metrics) panelRoot.querySelector('.results-label').replaceWith(intro);
    const examples = body.querySelector('.case-carousel,#multimodal-gallery-results');
    if (examples) examples.id ||= `${id}-examples`;
    const panel = spec.metrics ? metricPanel(id, spec) : null;
    if (panel) body.append(panel);
    intro.addEventListener('click', event => {
      const button = event.target.closest('[data-detail-jump]');
      if (!button) return;
      const target = button.dataset.detailJump === 'evidence' ? panel : examples;
      if (target) {
        target.scrollIntoView({block:'start',behavior:resultScrollBehavior()});
        target.tabIndex = -1;
        target.focus({preventScroll:true});
      }
    });
    // Preserve the original button nodes and handlers; share one footer layout.
    body.querySelectorAll('.case-carousel').forEach(carousel => {
      const previous = carousel.querySelector('.carousel-arrow.previous');
      const next = carousel.querySelector('.carousel-arrow.next');
      const footer = carousel.querySelector('.carousel-footer');
      if (previous && next && footer) { footer.prepend(previous); footer.append(next); }
    });
  }
})();
