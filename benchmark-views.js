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
 const blue='#345ee8',gray='#7c8593';
 const color=(data,index)=>index===data.focus?blue:teacher(data.rows[index])?'#b4b8c0':['#58677d','#8d776d','#84917d','#9696ab','#667f89','#a68b76'][index%6];
 const signed=(data,value,i)=>`${value>0?'+':value<0?'−':''}${Math.abs(value).toFixed(data.precision[i])}`;
 const score=(data,row,i)=>format(data,row[i+2],i);
 function extent(values,maximum){
  const valid=values.filter(v=>v!==null&&Number.isFinite(v)),min=Math.min(...valid),max=Math.max(...valid);
  const span=Math.max(max-min,maximum*.006),padding=span*.22;
  const raw=(span+2*padding)/4,power=10**Math.floor(Math.log10(raw));
  const step=([1,2,2.5,5,10].find(n=>n*power>=raw)||10)*power;
  let low=Math.max(0,Math.floor((min-padding)/step)*step),high=Math.min(maximum,Math.ceil((max+padding)/step)*step);
  if(high<=low)high=low+step;
  const ticks=[];for(let v=low;v<=high+step*.01;v+=step)ticks.push(v);
  if(Math.abs(ticks[ticks.length-1]-high)>step*.01)ticks.push(high);
  const precision=Math.min(4,Math.max(0,-Math.floor(Math.log10(step)))+(String(step/power).includes('.')?1:0));
  return {low,high,ticks,precision};
 }
 const tick=(range,value)=>value.toFixed(range.precision);
 function frame(compact){const w=compact?420:820,h=compact?360:390;return {w,h,l:64,r:w-30,t:35,b:h-62};}
 const map=(range,a,b,value)=>a+(value-range.low)/(range.high-range.low)*(b-a);
 function svgOpen(f,name){return `<svg class="bench-plot" viewBox="0 0 ${f.w} ${f.h}" role="img" aria-label="${escape(name)}">`;}
 function axes(f,xr,yr,xlabel,ylabel){
  return `${yr.ticks.map(v=>{const y=map(yr,f.b,f.t,v);return `<line class="bench-grid" x1="${f.l}" y1="${y}" x2="${f.r}" y2="${y}"/><text class="bench-tick" x="${f.l-12}" y="${y+4}" text-anchor="end">${tick(yr,v)}</text>`}).join('')}${xr.ticks.map(v=>{const x=map(xr,f.l,f.r,v);return `<line class="bench-grid bench-grid-vertical" x1="${x}" y1="${f.t}" x2="${x}" y2="${f.b}"/><text class="bench-tick" x="${x}" y="${f.b+24}" text-anchor="middle">${tick(xr,v)}</text>`}).join('')}<text class="bench-axis-title" x="${(f.l+f.r)/2}" y="${f.h-8}" text-anchor="middle">${escape(xlabel)} ↑</text><text class="bench-axis-title" transform="translate(17 ${(f.t+f.b)/2}) rotate(-90)" text-anchor="middle">${escape(ylabel)} ↑</text>`;
 }
 const controls=(items,active,attribute)=>`<div class="bench-controls" role="group" aria-label="Chart view">${items.map(item=>`<button type="button" ${attribute}="${item.id}" aria-pressed="${String(item.id)===String(active)}">${escape(item.label)}</button>`).join('')}</div>`;
 const story=(title,meta)=>`<header class="bench-story"><h4>${escape(title)}</h4><p>${escape(meta)}</p></header>`;
 const detailText=(key,data,row,indices)=>`${row[0]} · ${row[1]} NFE · ${indices.map(i=>`${label(key,data,i)} ${score(data,row,i)}`).join(' · ')}`;
 function legend(key,data,indices,active=data.focus){return `<div class="bench-legend" role="group" aria-label="Inspect a method">${data.rows.map((row,index)=>`<button type="button" data-bench-series="${index}" data-inspect="${escape(detailText(key,data,row,indices))}" aria-pressed="${index===active}" style="--series-color:${color(data,index)}"><i aria-hidden="true"></i>${escape(row[0])}<small>${escape(row[1])} NFE</small></button>`).join('')}</div><output class="bench-inspector" aria-live="polite">${escape(detailText(key,data,data.rows[active],indices))}</output>`;}
 function dot(key,data,index,x,y,extra=''){
  const row=data.rows[index],c=color(data,index);
  return `<g class="bench-series ${index===data.focus?'bench-focus':''}" data-bench-series="${index}" tabindex="0" role="button" aria-label="${escape(detailText(key,data,row,data.metrics.map((_,i)=>i)))}"><circle cx="${x}" cy="${y}" r="15" fill="transparent"/>${index===data.focus?`<path d="M${x} ${y-8}L${x+8} ${y}L${x} ${y+8}L${x-8} ${y}Z" fill="${c}"/>`:`<circle cx="${x}" cy="${y}" r="6" fill="${teacher(row)?'#fff':c}" stroke="${c}" stroke-width="2"/>`}${extra}</g>`;
 }
 function scatter(key,data,options){
  const causal=key==='causal',presets=causal?[{id:'balance',label:'Semantic × Quality',x:1,y:0}]:[{id:'motion',label:'Motion × Quality',x:2,y:0},{id:'semantic',label:'Semantic × Quality',x:1,y:0},{id:'smoothness',label:'Motion × Smoothness',x:2,y:3}];
  const p=presets.find(p=>p.id===options.axis)||presets[0],f=frame(options.compact);
  const xr=extent(data.rows.map(row=>row[p.x+2]),data.max[p.x]),yr=extent(data.rows.map(row=>row[p.y+2]),data.max[p.y]);
  let marks='',teacherNote='';const positions=[];
  data.rows.forEach((row,index)=>{
   const xv=row[p.x+2],yv=row[p.y+2];if(yv===null)return;
   const y=map(yr,f.b,f.t,yv);
   if(xv===null){marks+=`<line class="bench-reference" x1="${f.l}" x2="${f.r}" y1="${y}" y2="${y}"/>`;teacherNote=`Teacher reference · ${data.metrics[p.y]} ${score(data,row,p.y)} · ${data.metrics[p.x]} not reported`;return;}
   const x=map(xr,f.l,f.r,xv);positions.push({index,x,y});
  });
  // Label positions are chosen in chart coordinates, independently of point values.
  const occupied=[];
  for(const point of positions){
   const {index,x,y}=point,row=data.rows[index];let annotation='';
   if(!options.compact||index===data.focus){
    const name=row[0],w=name.length*7.2+8;
    const candidates=[{x:x+12,y:y-13,anchor:'start'},{x:x-12,y:y+22,anchor:'end'},{x:x+12,y:y+24,anchor:'start'},{x:x-12,y:y-17,anchor:'end'},{x:x+12,y:y+43,anchor:'start'}];
    const boxes=candidates.map(c=>({...c,left:c.anchor==='end'?c.x-w:c.x,right:c.anchor==='end'?c.x:c.x+w,top:c.y-13,bottom:c.y+3}));
    const chosen=boxes.find(b=>b.left>=f.l&&b.right<=f.r&&b.top>=5&&b.bottom<=f.b&&!occupied.some(o=>!(b.right<o.left||b.left>o.right||b.bottom<o.top||b.top>o.bottom)))||boxes[0];occupied.push(chosen);
    annotation=`<text class="bench-point-label" x="${chosen.x}" y="${chosen.y}" text-anchor="${chosen.anchor}" fill="${color(data,index)}">${escape(name)}</text>`;
   }
   marks+=dot(key,data,index,x,y,annotation);
  }
  return story(causal?'Quality and semantic fidelity':p.x===1?'Semantic and visual quality':p.y===3?'Motion and temporal smoothness':'Motion and visual quality',`${data.title} · Compared students at 4 NFE`)+(presets.length>1?controls(presets, p.id,'data-bench-axis'):'')+svgOpen(f,'Reported scores across two evaluation dimensions')+axes(f,xr,yr,data.metrics[p.x],data.metrics[p.y])+marks+'</svg>'+legend(key,data,[p.x,p.y])+`<p class="bench-note">Axes use the reported score range${teacherNote?' · '+escape(teacherNote):''}</p>`;
 }
 function wanComparison(key,data,options){
  const compact=options.compact,w=compact?420:660,h=compact?370:410;
  const f={w,h,l:62,r:w-24,t:25,b:h-65};
  const xr={low:40,high:90,ticks:[40,50,60,70,80,90],precision:0};
  const yr={low:97,high:100,ticks:[97,98,99,100],precision:0};
  const students=data.rows.map((row,index)=>({row,index})).filter(({row})=>!teacher(row));
  const points=students.map(({row,index})=>{
   const x=map(xr,f.l,f.r,row[4]),y=map(yr,f.b,f.t,row[5]),ours=index===data.focus;
   // Labels stay close to their dots without changing any measured position.
   const anchor=ours&&!compact?'end':'start',dx=ours&&!compact?-11:10,dy=ours?23:-12;
   return `<g class="wan-motion-point ${ours?'is-ours':''}" data-motion="${row[4]}" data-smoothness="${row[5]}"><title>${escape(row[0])} · Dynamic degree ${score(data,row,2)} · Motion smoothness ${score(data,row,3)}</title><circle cx="${x}" cy="${y}" r="${ours?7:5}"/><text x="${x+dx}" y="${y+dy}" text-anchor="${anchor}">${escape(row[0])}</text></g>`;
  }).join('');
  const plot=`<svg class="wan-motion-plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="Dynamic degree and motion smoothness at 4 NFE" data-x-range="40 90" data-y-range="97 100">${axes(f,xr,yr,'Dynamic degree','Motion smoothness')}${points}</svg>`;
  const table=`<table class="wan-quality-table"><caption class="sr-only">Quality and semantic scores at 4 NFE</caption><thead><tr><th scope="col">Method</th><th scope="col">Quality ↑</th><th scope="col">Semantic ↑</th></tr></thead><tbody>${students.map(({row,index})=>`<tr class="${index===data.focus?'is-ours':''}"><th scope="row">${escape(row[0])}</th><td>${score(data,row,0)}</td><td>${score(data,row,1)}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="wan-comparison">${plot}${table}</div>`;
 }
 function crossMap(key,data,options){
  const presets=[{id:'diversity',label:'Diversity × Alignment',x:4,y:2},{id:'style',label:'Style × Text',x:5,y:3},{id:'overall',label:'GenEval × DPG-Bench',x:0,y:1}];
  const p=presets.find(p=>p.id===options.axis)||presets[0],f=frame(options.compact);
  // Common scales across both students prevent an exaggerated change on tab switch.
  const reference=[...SMD_METRICS.crossFlux.rows,...SMD_METRICS.crossLens.rows];
  const xr=extent(reference.map(row=>row[p.x+2]),data.max[p.x]),yr=extent(reference.map(row=>row[p.y+2]),data.max[p.y]);
  const points=data.rows.map(row=>({x:map(xr,f.l,f.r,row[p.x+2]),y:map(yr,f.b,f.t,row[p.y+2])})),a=points[0],b=points[1],distance=Math.hypot(b.x-a.x,b.y-a.y),end={x:b.x-(b.x-a.x)/distance*13,y:b.y-(b.y-a.y)/distance*13};
  const contextData=SMD_METRICS[key==='crossFlux'?'crossLens':'crossFlux'];
  const contextPoints=contextData.rows.map(row=>({x:map(xr,f.l,f.r,row[p.x+2]),y:map(yr,f.b,f.t,row[p.y+2])}));
  const ca=contextPoints[0],cb=contextPoints[1],contextName=key==='crossFlux'?'Lens student':'4B student';
  const context=`<g class="bench-context"><path d="M${ca.x} ${ca.y}L${cb.x} ${cb.y}" marker-end="url(#${key}-context-direction)"/>${contextPoints.map(q=>`<circle cx="${q.x}" cy="${q.y}" r="4"/>`).join('')}<text x="${(ca.x+cb.x)/2}" y="${(ca.y+cb.y)/2-13}" text-anchor="middle">${contextName}</text></g>`;
  const svg=svgOpen(f,'Change in student capability after switching teachers')+axes(f,xr,yr,data.metrics[p.x],data.metrics[p.y])+`<defs><marker id="${key}-direction" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${blue}"/></marker><marker id="${key}-context-direction" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#b6bdc8"/></marker></defs>`+context+`<path class="bench-transfer-line" d="M${a.x} ${a.y}L${end.x} ${end.y}" marker-end="url(#${key}-direction)"/>`+points.map((point,index)=>dot(key,data,index,point.x,point.y,`<text class="bench-point-label" x="${point.x}" y="${point.y+(index?-17:26)}" text-anchor="middle" fill="${color(data,index)}">${index?'9B teacher':'Matching teacher'}</text>`)).join('')+'</svg>';
  return story('A different teacher. A different balance.',`${data.title} · Same student and 4 NFE`)+controls(presets,p.id,'data-bench-axis')+svg+legend(key,data,[p.x,p.y])+`<div class="bench-deltas">${data.metrics.map((metric,i)=>{const delta=data.rows[1][i+2]-data.rows[0][i+2];return `<div class="bench-delta ${delta<0?'is-down':'is-up'}"><span>${escape(metric)}</span><strong data-delta="${delta}">${signed(data,delta,i)}</strong></div>`}).join('')}</div><p class="bench-note">Arrow shows the teacher switch · Changes are in original score units · Shared axes across students</p>`;
 }
 function profile(key,data,options){
  const compact=options.compact,w=compact?420:900,h=compact?435:390;
  const ranges=data.metrics.map((_,i)=>extent(data.rows.map(row=>row[i+2]),data.max[i]));
  const point=(row,i)=>compact?{x:map(ranges[i],126,w-28,row[i+2]),y:48+i*64}:{x:70+i*(w-140)/5,y:map(ranges[i],h-65,65,row[i+2])};
  let axesText='';
  data.metrics.forEach((metric,i)=>{
   const r=ranges[i];
   if(compact){const y=48+i*64;axesText+=`<text class="bench-profile-metric" x="6" y="${y+4}">${escape(metric)}</text><line class="bench-grid" x1="126" y1="${y}" x2="${w-28}" y2="${y}"/><text class="bench-tick" x="126" y="${y+23}">${tick(r,r.low)}</text><text class="bench-tick" x="${w-28}" y="${y+23}" text-anchor="end">${tick(r,r.high)}</text>`;}
   else{const x=70+i*(w-140)/5;axesText+=`<text class="bench-profile-metric" x="${x}" y="25" text-anchor="middle">${escape(metric)}</text><line class="bench-grid" x1="${x}" y1="65" x2="${x}" y2="${h-65}"/><text class="bench-tick" x="${x}" y="50" text-anchor="middle">${tick(r,r.high)}</text><text class="bench-tick" x="${x}" y="${h-39}" text-anchor="middle">${tick(r,r.low)}</text>`;}
  });
  const lines=data.rows.map((row,index)=>{
   const points=data.metrics.map((_,i)=>point(row,i));
   return `<g class="bench-series bench-profile-series ${index===data.focus?'bench-focus':''}" data-bench-series="${index}" style="--series-color:${color(data,index)}"><polyline points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${color(data,index)}" stroke-width="${index===data.focus?3:1.7}" ${teacher(row)?'stroke-dasharray="5 5"':''}/>${points.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="${index===data.focus?5:3.5}" fill="${color(data,index)}"/>${index===data.focus?`<text class="bench-profile-value" x="${p.x}" y="${p.y-10}" text-anchor="middle">${score(data,row,i)}</text>`:''}`).join('')}</g>`;
  }).join('');
  return story('Different strengths. One student.','SD3.5-Medium · Four-step students')+legend(key,data,data.metrics.map((_,i)=>i))+`<svg class="bench-plot bench-profile" viewBox="0 0 ${w} ${h}" role="img" aria-label="Six independently scaled capability axes comparing specialists and the multi-teacher student">${axesText}${lines}</svg><p class="bench-note">Each axis has its own labeled score range · Hover or select a method to trace its profile · No aggregate score</p>`;
 }
 function ranking(key,data,index,compact){
  const rows=data.rows.map((row,i)=>({row,i})).filter(({row})=>!teacher(row)),reference=data.rows.find(teacher);
  const r=extent(data.rows.map(row=>row[index+2]),data.max[index]),w=compact?420:820,l=compact?125:165,right=w-82,top=55,spacing=44,h=top+rows.length*spacing+46;
  let svg=`<svg class="bench-plot bench-ranking" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(data.metrics[index])} comparison at the reported inference budgets">`;
  svg+=r.ticks.map(v=>{const x=map(r,l,right,v);return `<line class="bench-grid" x1="${x}" y1="${top-8}" x2="${x}" y2="${h-48}"/><text class="bench-tick" x="${x}" y="${h-22}" text-anchor="middle">${tick(r,v)}</text>`}).join('');
  if(reference&&reference[index+2]!==null){const x=map(r,l,right,reference[index+2]);svg+=`<line class="bench-reference" x1="${x}" y1="${top-15}" x2="${x}" y2="${h-48}"/><text class="bench-tick" x="${x}" y="20" text-anchor="middle">Teacher ${score(data,reference,index)}</text>`;}
  rows.forEach(({row,i},j)=>{const y=top+j*spacing+12,x=map(r,l,right,row[index+2]);svg+=`<text class="bench-rank-label ${i===data.focus?'bench-blue':''}" x="${l-15}" y="${y+4}" text-anchor="end">${escape(row[0])}</text><line class="bench-rank-guide" x1="${l}" y1="${y}" x2="${right}" y2="${y}"/><circle cx="${x}" cy="${y}" r="${i===data.focus?7:5}" fill="${color(data,i)}"/><text class="bench-rank-value ${i===data.focus?'bench-blue':''}" x="${w-8}" y="${y+4}" text-anchor="end">${score(data,row,index)}</text>`;});
  return svg+'</svg>';
 }
 function imageScores(key,data,options){
  const primary=key==='edit'?[0,3]:[0,1,2],i=Number.isInteger(options.metric)?options.metric:primary[0],rest=data.metrics.map((_,i)=>i).filter(i=>!primary.includes(i));
  const reference=data.rows.find(teacher),meta=`SMD · ${data.rows[data.focus][1]} NFE${reference?'  /  Teacher · '+reference[1]+' NFE':''}`;
  const cards=rest.map(m=>{
   const r=extent(data.rows.map(row=>row[m+2]),data.max[m]);
   return `<button type="button" class="bench-mini ${i===m?'is-selected':''}" data-bench-metric="${m}" aria-pressed="${i===m}"><span>${escape(data.metrics[m])}</span><strong>${score(data,data.rows[data.focus],m)}<small>SMD</small></strong><svg viewBox="0 0 160 32" aria-hidden="true"><line class="bench-grid" x1="8" y1="16" x2="152" y2="16"/>${data.rows.map((row,j)=>row[m+2]===null?'':`<circle cx="${map(r,8,152,row[m+2])}" cy="16" r="${j===data.focus?5:3.5}" fill="${teacher(row)?'#fff':color(data,j)}" stroke="${color(data,j)}"/>`).join('')}</svg></button>`;
  }).join('');
  return story('Quality at four evaluations',meta)+controls(primary.map(m=>({id:m,label:data.metrics[m]})),i,'data-bench-metric')+`<div class="bench-ranking-title">${escape(data.metrics[i])} ↑</div>`+ranking(key,data,i,options.compact)+(rest.length?`<div class="bench-mini-grid">${cards}</div>`:'')+'<p class="bench-note">Blue marks SMD · Dashed line is the multi-step teacher reference · Axes use the reported score range</p>';
 }
 // Image Generation only. Three simultaneous, zero-baseline comparisons;
 // no metric picker, extra headline or secondary-dimension cards.
 function imagePrimaryCharts(key,data){
  const rows=data.rows.map((row,index)=>({row,index})).filter(({row})=>!teacher(row));
  const reference=data.rows.find(teacher);
  return `<div class="image-primary-charts">${[0,1,2].map(metric=>{
   const w=360,h=350,l=35,r=352,t=46,b=265;
   const high=metric===1?100:Math.min(1,Math.ceil(Math.max(...data.rows.map(row=>row[metric+2]))*11)/10);
   const y=value=>b-(value/high)*(b-t),slot=(r-l)/rows.length,barWidth=Math.min(46,slot*.62);
   const ticks=[0,high/2,high];
   const referenceLabel=reference?`<line x1="8" y1="21" x2="31" y2="21" class="image-teacher-line"/><text class="image-teacher-label" x="39" y="26">Teacher ${score(data,reference,metric)}</text><line class="image-teacher-line" x1="${l}" y1="${y(reference[metric+2])}" x2="${r}" y2="${y(reference[metric+2])}"/>`:'';
   return `<figure class="image-primary-chart" data-image-metric="${metric}"><figcaption>${escape(data.metrics[metric])} ↑</figcaption><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(data.metrics[metric])}, all four-NFE methods with a multi-step teacher reference" data-baseline="${b}">${referenceLabel}${ticks.map(v=>`<line class="image-score-grid" x1="${l}" y1="${y(v)}" x2="${r}" y2="${y(v)}"/><text class="image-axis-value" x="${l-8}" y="${y(v)+5}" text-anchor="end">${Number(v.toFixed(2))}</text>`).join('')}${rows.map(({row,index},j)=>{
    const x=l+slot*(j+.5),value=row[metric+2],isOurs=index===data.focus;
    return `<g class="image-score-method ${isOurs?'is-ours':''}" data-method-index="${index}"><title>${escape(row[0])} · ${escape(row[1])} NFE · ${score(data,row,metric)}</title><rect class="image-score-bar" data-bar-value="${value}" x="${x-barWidth/2}" y="${y(value)}" width="${barWidth}" height="${b-y(value)}" rx="2"/><text class="image-score-value" x="${x}" y="${y(value)-10}" text-anchor="middle">${score(data,row,metric)}</text><text class="image-method-name" transform="translate(${x+8} ${b+23}) rotate(-30)" text-anchor="end">${escape(row[0])}</text></g>`;
   }).join('')}</svg></figure>`;
  }).join('')}</div>`;
 }
 function editingComparison(data){
  const students=data.rows.filter(row=>!teacher(row));
  const overall=(metric,title)=>`<section class="editing-benchmark-group"><h4>${title}</h4><div class="editing-overall-label">Overall ↑</div><div class="editing-overall-bars" role="img" aria-label="${title} overall at 4 NFE, on a zero to ${data.max[metric]} scale">${students.map(row=>`<div class="editing-bar-row ${row[0]==='SMD'?'is-ours':''}"><span class="editing-method">${escape(row[0])}</span><span class="editing-bar-track"><span class="editing-bar-fill" data-edit-value="${row[metric+2]}" data-edit-max="${data.max[metric]}" style="width:${row[metric+2]/data.max[metric]*100}%"></span></span><strong class="editing-value">${score(data,row,metric)}</strong></div>`).join('')}<div class="editing-scale" aria-hidden="true"><span>0</span><span>${data.max[metric]}</span></div></div>${metric===3?`<table class="editing-submetrics"><thead><tr><td></td>${students.map(row=>`<th scope="col" class="${row[0]==='SMD'?'is-ours':''}">${escape(row[0])}</th>`).join('')}</tr></thead><tbody>${[1,2].map((m,i)=>`<tr><th scope="row">${i?'Perceptual quality':'Semantic consistency'}</th>${students.map(row=>`<td class="${row[0]==='SMD'?'is-ours':''}">${score(data,row,m)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}</section>`;
  return `<p class="editing-model-label">Qwen-Image-Edit-2511 · 4 NFE</p><div class="editing-comparison">${overall(0,'ImgEdit-Bench')}${overall(3,'GEdit-Bench-EN')}</div>`;
 }
 function audioCurves(options){
  const a=SMD_METRICS.h3,b=SMD_METRICS.h3eight;
  const cards=indices=>indices.map(i=>{
   const range=extent([a.rows[0][i+2],a.rows[1][i+2],b.rows[0][i+2],b.rows[1][i+2]],5),w=360,h=225,l=78,r=278,t=30,bottom=165;
   const y=v=>map(range,bottom,t,v);
   return `<figure class="bench-budget-card"><figcaption>${escape(label('h3',a,i))}</figcaption><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(label('h3',a,i))} at four and eight evaluations">${range.ticks.map(v=>`<line class="bench-grid" x1="${l}" y1="${y(v)}" x2="${r}" y2="${y(v)}"/><text class="bench-tick" x="${l-10}" y="${y(v)+4}" text-anchor="end">${tick(range,v)}</text>`).join('')}${[0,1].map(j=>{
    const values=[a.rows[j][i+2],b.rows[j][i+2]],c=j===1?blue:gray;
    return `<g class="bench-series ${j===1?'bench-focus':''}" data-bench-series="${j}"><line x1="${l}" y1="${y(values[0])}" x2="${r}" y2="${y(values[1])}" stroke="${c}" stroke-width="${j===1?2.5:1.7}" ${j===0?'stroke-dasharray="5 4"':''}/>${values.map((v,k)=>{const higher=v>=(k?b:a).rows[1-j][i+2];return `<circle cx="${k?r:l}" cy="${y(v)}" r="5" fill="${j===1?c:'#fff'}" stroke="${c}" stroke-width="2"/><text class="bench-budget-value" x="${k?r-8:l+12}" y="${y(v)+(higher?-12:19)}" text-anchor="${k?'end':'start'}" fill="${c}">${v.toFixed(3)}</text>`}).join('')}</g>`;
   }).join('')}<text class="bench-axis-title" x="${l}" y="202" text-anchor="middle">4 NFE</text><text class="bench-axis-title" x="${r}" y="202" text-anchor="middle">8 NFE</text></svg></figure>`;
  }).join('');
  return story('What changes with more steps?','Same 100 prompts · Four and eight evaluations')+`<div class="bench-inline-key"><span><i style="background:${blue}"></i>SMD</span><span><i style="background:${gray}"></i>LightX2V-DMD v1.1</span></div><h5 class="bench-group-title">Visual</h5><div class="bench-budget-grid">${cards([0,1,2,3])}</div><h5 class="bench-group-title">Audio</h5><div class="bench-budget-grid">${cards([4,5])}</div><p class="bench-note">Only measured budgets are shown · Each plot labels its score range · Higher means do not establish statistical significance</p>`;
 }
 function correctionMap(key,data,options){
  const f=frame(options.compact),xr=extent(data.rows.map(r=>r[3]),100),yr=extent(data.rows.map(r=>r[2]),100),points=data.rows.map(row=>({x:map(xr,f.l,f.r,row[3]),y:map(yr,f.b,f.t,row[2])}));
  const path=`<polyline class="bench-correction-path" points="${points.map(p=>`${p.x},${p.y}`).join(' ')}"/>`;
  return story('Choosing a correction weight','4 NFE · λ = 0.2 is the main setting')+svgOpen(f,'Quality and semantic trade-off across measured correction weights')+axes(f,xr,yr,'Semantic','Quality')+path+points.map((p,i)=>dot(key,data,i,p.x,p.y,`<text class="bench-point-label" x="${p.x}" y="${p.y-16}" text-anchor="middle" fill="${color(data,i)}">${escape(data.rows[i][0].replace(' (main)',''))}</text>`)).join('')+'</svg>'+legend(key,data,[0,1,2])+`<p class="bench-note">Points follow λ = 0, 0.2, 0.4, 0.8 · The main setting is not the highest Total score</p>`;
 }
 function fullScores(key,sort){
  const keys=/^h3/.test(key)?['h3','h3eight']:[key];
  return `<details class="bench-full-data"><summary>All scores <span>Exact values and evaluation notes</span></summary>${keys.map(k=>{
   const isImage=k==='qwen'||k==='flux'||k==='edit'||/^wan/.test(k);
   const table=matrix(k,SMD_METRICS[k],sort);
   const cleanTable=isImage?table.replace(/<p class="benchmark-(?:key|footnote)">[\s\S]*?<\/p>/g,''):table;
   const note=k==='qwen'?'† PDD from original paper · Teacher NFE includes both CFG branches':k==='flux'?'':k==='edit'?'Teacher NFE includes both CFG branches':/^wan/.test(k)?'4 NFE · * Reproduced DMD2 · † PDD from original paper · Teacher NFE includes both CFG branches · — Not reported':SMD_METRICS[k].note.replace(/[:;]/g,' —');
   return `<section data-table-key="${k}"><h5>${escape(SMD_METRICS[k].title)}</h5>${cleanTable}${note?`<p class="bench-source-note">${escape(note)}</p>`:''}</section>`;
  }).join('')}</details>`;
 }
 window.SMD_RENDER_BENCHMARK=(key,sort=null,options={})=>{
  const data=window.SMD_METRICS[key];
  const isImage=key==='qwen'||key==='flux';
  const chart=isImage?imagePrimaryCharts(key,data):key==='edit'?editingComparison(data):/^wan/.test(key)?wanComparison(key,data,options):key==='causal'?scatter(key,data,options):/^cross/.test(key)?crossMap(key,data,options):key==='multi'?profile(key,data,options):/^h3/.test(key)?audioCurves(options):key==='correction'?correctionMap(key,data,options):imageScores(key,data,options);
  return `<div class="benchmark-explorer${isImage?' image-primary-only':key==='edit'?' editing-primary-only':/^wan/.test(key)?' wan-primary-only':''}" data-chart-key="${key}" data-default-series="${data.focus}">${chart}${fullScores(key,sort)}</div>`;
 };
})();
