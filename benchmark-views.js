/* Dense, report-backed views. Numerical data remains in metrics.js. */
(() => {
 const escape=value=>esc(String(value));
 const label=(key,data,i)=>/^h3/.test(key)&&i===4?'Audio clarity · PAM × 5':/^h3/.test(key)&&i===5?'Audio quality · PQ ÷ 2':data.metrics[i];
 const format=(data,value,i)=>value===null?'—':Number(value).toFixed(data.precision[i]);
 const teacher=row=>/^(?:Teacher|Base teacher)$/i.test(row[0]);
 function matrix(key,data,sort){
  const eligible=data.rows.filter(row=>!teacher(row));
  const ranks=data.metrics.map((_,i)=>[...new Set(eligible.map(row=>row[i+2]).filter(v=>v!==null))].sort((a,b)=>b-a));
  const order=data.rows.map((row,index)=>({row,index}));
  if(sort!==null)order.sort((a,b)=>Number(teacher(b.row))-Number(teacher(a.row))||(b.row[sort+2]??-Infinity)-(a.row[sort+2]??-Infinity));
  return `<div class="score-matrix-scroll" role="region" aria-label="${escape(data.title)} all metric scores" tabindex="0"><table class="score-matrix"><caption class="sr-only">${escape(data.title)}. Higher is better. Bold marks the best and underlining the second-best non-teacher score.</caption><thead><tr><th scope="col">Method</th><th scope="col">NFE</th>${data.metrics.map((_,i)=>`<th scope="col" ${sort===i?'aria-sort="descending"':''}><button type="button" data-sort-metric="${i}" class="${sort===i?'is-selected':''}" aria-label="Sort by ${escape(label(key,data,i))}">${escape(label(key,data,i))}<span aria-hidden="true"> ↑</span></button></th>`).join('')}</tr></thead><tbody>${order.map(({row,index})=>`<tr data-method-index="${index}" class="${index===data.focus?'is-focus ':''}${teacher(row)?'is-teacher':''}"><th scope="row">${escape(row[0])}${teacher(row)?'<small>Reference</small>':''}</th><td class="nfe-cell">${escape(row[1])}</td>${data.metrics.map((_,i)=>{const value=row[i+2],rank=!teacher(row)?ranks[i].indexOf(value):-1;return `<td data-metric="${i}" data-value="${value??''}" class="${rank===0?'is-best':rank===1?'is-second':''} ${sort===i?'is-sorted':''}" ${value===null?'aria-label="Not reported"':''}>${format(data,value,i)}</td>`}).join('')}</tr>`).join('')}</tbody></table></div><p class="benchmark-key"><strong>Bold</strong> best · <u>Underline</u> second-best among non-teacher methods · Select a metric heading to sort</p>${data.rows.some(row=>/[†*]/.test(row[0]))?'<p class="benchmark-footnote">† Quoted from the original paper · * Reproduced baseline</p>':''}`;
 }
 function pair(key,data){
  const focus=data.focus,other=focus===0?1:0,a=data.rows[other],b=data.rows[focus];
  return `<div class="paired-scoreboard"><div class="pair-score-header"><span>Metric ↑</span><span class="pair-axis-heading">Score range</span><span><i class="pair-marker hollow" aria-hidden="true"></i>${escape(a[0])}<small>${escape(a[1])} NFE</small></span><span><i class="pair-marker solid" aria-hidden="true"></i>${escape(b[0])}<small>${escape(b[1])} NFE</small></span><span>Δ</span></div>${data.metrics.map((_,i)=>{
   const av=a[i+2],bv=b[i+2],low=/^h3/.test(key)&&i<4?1:0,high=data.max[i];
   const x=v=>12+156*(v-low)/(high-low),delta=av===null||bv===null?null:bv-av;
   const diff=delta===null?'—':`${delta>0?'+':delta<0?'−':''}${Math.abs(delta).toFixed(data.precision[i])}`;
   return `<div class="pair-score-row" data-metric="${i}"><h4>${escape(label(key,data,i))}</h4><svg class="pair-dumbbell" viewBox="0 0 180 42" aria-hidden="true"><line x1="12" y1="15" x2="168" y2="15" class="pair-axis"/>${av===null||bv===null?'':`<line x1="${x(av)}" y1="15" x2="${x(bv)}" y2="15" class="pair-join"/><circle cx="${x(av)}" cy="15" r="4.5" class="pair-point hollow"/><circle cx="${x(bv)}" cy="15" r="3.5" class="pair-point solid"/>`}<text x="12" y="36">${low}</text><text x="168" y="36" text-anchor="end">${high}</text></svg><span class="pair-score" data-method-index="${other}" data-value="${av??''}">${format(data,av,i)}</span><span class="pair-score is-focus" data-method-index="${focus}" data-value="${bv??''}">${format(data,bv,i)}</span><span class="pair-delta ${delta<0?'is-negative':delta>0?'is-positive':''}" data-delta="${delta??''}">${diff}</span></div>`;
  }).join('')}</div><p class="benchmark-key">Δ is the right-hand method minus the left-hand method, in score units</p>`;
 }
 function sweep(data){
  const weights=data.rows.map(row=>Number(row[0].match(/=\s*([\d.]+)/)[1]));
  return `<div class="sweep-charts">${data.metrics.map((metric,i)=>{
   const values=data.rows.map(row=>row[i+2]);let low=Math.floor(Math.min(...values)*10)/10,high=Math.ceil(Math.max(...values)*10)/10;if(high===low)high=low+.1;
   const x=j=>34+230*weights[j]/Math.max(...weights),y=value=>124-94*(value-low)/(high-low);
   return `<figure class="sweep-chart"><figcaption>${escape(metric)} ↑</figcaption><svg viewBox="0 0 300 165" role="img" aria-label="${escape(metric)} across correction weights">${[low,(low+high)/2,high].map(v=>`<line x1="34" y1="${y(v)}" x2="275" y2="${y(v)}" class="sweep-grid"/><text x="29" y="${y(v)+3}" text-anchor="end">${v.toFixed(2)}</text>`).join('')}<polyline points="${values.map((v,j)=>`${x(j)},${y(v)}`).join(' ')}" class="sweep-line"/>${values.map((value,j)=>`<circle cx="${x(j)}" cy="${y(value)}" r="4" class="${j===data.focus?'sweep-main':'sweep-point'}"/><text x="${x(j)}" y="${y(value)-10}" text-anchor="middle" class="sweep-value" data-method-index="${j}" data-metric="${i}" data-value="${value}">${format(data,value,i)}</text><text x="${x(j)}" y="147" text-anchor="middle">${weights[j]}</text>`).join('')}<text x="290" y="147">λ</text></svg></figure>`;
  }).join('')}</div><p class="benchmark-key">4 NFE · Each plot shows its labeled score range · Filled point is the main setting</p>`;
 }
 window.SMD_RENDER_BENCHMARK=(key,sort=null)=>{
  const data=window.SMD_METRICS[key];return key==='correction'?sweep(data):data.rows.length===2?pair(key,data):matrix(key,data,sort);
 };
})();
