/* Displayed values from overleaf-report/report/tables, verified 5 Oct 2026.
 * Row format: [method, NFE, ...metrics]. Bars always start at zero.
 */
window.SMD_METRICS={
 flux:{title:'FLUX.1-dev',source:'img_gen_flux1dev.tex',metrics:['GenEval','DPG-Bench','OneIG overall','Alignment','Text','Diversity','Style','Reasoning'],max:[1,100,1,1,1,1,1,1],rows:[['Teacher','50',.664,84.2,.430,.790,.556,.239,.308,.258],['Hyper-SD','4',.667,83,.399,.786,.423,.185,.361,.239],['SenseFlow','4',.643,82.6,.380,.774,.388,.156,.348,.234],['Pi-Flow','4',.675,84.3,.419,.799,.460,.229,.360,.251],['SMD','4',.715,84.8,.420,.810,.455,.209,.370,.256]],note:'SMD leads the compared few-step methods on GenEval and DPG-Bench, but not every OneIG dimension. The 50-NFE teacher is a reference, not a few-step baseline.'},
 qwen:{title:'Qwen-Image',source:'img_gen_qwen.tex',metrics:['GenEval','DPG-Bench','OneIG overall','Alignment','Text','Diversity','Style','Reasoning'],max:[1,100,1,1,1,1,1,1],rows:[['Teacher','50 × 2',.874,88.3,.540,.880,.889,.195,.428,.307],['Lightning','4',.852,88.3,.527,.886,.921,.108,.411,.310],['TwinFlow','4',.818,86,.502,.860,.872,.152,.361,.263],['Pi-Flow','4',.850,88.2,.532,.878,.876,.180,.430,.296],['PDD †','4',.860,88.5,.535,.879,.897,.192,.417,.292],['SMD','4',.873,88.7,.540,.883,.944,.144,.429,.300]],note:'SMD preserves more measured diversity than Lightning (0.144 vs. 0.108), but less than Pi-Flow, PDD and the teacher. † PDD Euler results are quoted in the report from the PDD paper. Teacher 50 × 2 includes both CFG branches.'},
 edit:{title:'Image editing',source:'img_edit_qwen.tex',metrics:['ImgEdit overall','GEdit semantic','GEdit perceptual','GEdit overall','Adjust','Style','Background','Extract','Remove','Replace','Add','Hybrid','Action'],max:[5,10,10,10,5,5,5,5,5,5,5,5,5],rows:[['Teacher','40 × 2',4.51,8.30,8.20,7.88,4.57,4.89,4.36,4.13,4.46,4.70,4.54,4.16,4.81],['Lightning','4',4.48,8.95,7.74,8.14,4.40,4.76,4.39,4.21,4.54,4.72,4.67,3.87,4.80],['SMD','4',4.51,8.96,7.79,8.19,4.58,4.74,4.37,3.98,4.74,4.76,4.67,3.95,4.80]],note:'Qwen-Image-Edit-2511. Aggregate ImgEdit and GEdit scores improve over Lightning; this does not imply a win in every editing category.'},
 wan14:{title:'Wan2.1 · 14B',source:'video_gen_wan.tex',metrics:['Quality','Semantic','Dynamic degree','Motion smoothness','Color'],max:[100,100,100,100,100],rows:[['Teacher','50 × 2',84.37,81.10,null,null,null],['DMD2*','4',84.33,80.26,49.72,98.76,87.81],['rCM','4',85.19,81.21,76.39,97.81,82.91],['AnyFlow','4',85.78,82.10,73.61,98.10,85.79],['PDD †','4',85.69,80.71,74.72,98.52,86.59],['SMD','4',85.72,80.52,83.89,98.52,86.18]],note:'VBench on 944 Self-Forcing prompts. SMD has the highest Dynamic Degree here; AnyFlow has higher Quality and Semantic scores. † PDD is quoted from its paper. Newly generated AnyFlow gallery clips are not asserted to be the exact benchmark checkpoint.'},
 wan13:{title:'Wan2.1 · 1.3B',source:'video_gen_wan.tex',metrics:['Quality','Semantic','Dynamic degree','Motion smoothness','Color'],max:[100,100,100,100,100],rows:[['Teacher','50 × 2',84.25,79.08,null,null,null],['DMD2*','4',84.68,79.39,45,98.81,84.63],['rCM','4',84.61,79.56,81.94,97.64,85.39],['AnyFlow','4',85.40,81.47,68.33,98.29,87.67],['PDD †','4',85.99,78.22,72.50,99.02,85.41],['SMD','4',85.64,78.97,79.44,98.66,89.19]],note:'Same evaluation protocol as the 14B comparison. Higher is better for every displayed dimension. † PDD Euler results are quoted from its paper.'},
 multi:{title:'Multi-teacher',source:'multi_teacher_sd35m.tex',metrics:['GenEval','OCR','PickScore','HPSv2','CLIPScore','ImageReward'],max:[1,1,25,1,1,2],rows:[['Base teacher','28',.6279,.5813,21.76,.2802,.2837,.8512],['Self-distill','4',.6153,.3019,21.60,.2848,.2741,.8163],['CLIP specialist','4',.7082,.4202,22.22,.3055,.3011,1.223],['GenEval specialist','4',.7385,.3153,21.53,.2658,.2799,.9196],['OCR specialist','4',.6410,.5944,21.71,.2841,.2803,.9002],['PickScore specialist','4',.6551,.3738,22.81,.3107,.2706,1.120],['Multi-teacher','4',.7289,.5948,22.56,.2995,.2848,1.141]],note:'SD3.5-Medium. Each capability uses its corresponding evaluation set, not one common prompt set. Multi-teacher distillation improves all six metrics over self-distillation, but does not beat every specialist.'},
 h3:{"title":"H3 · 4 NFE","source":"h3_generation.tex","metrics":["Prompt alignment","Structural coherence","Temporal coherence","Visual naturalness","Audio clarity","Audio quality"],"max":[5,5,5,5,5,5],"rows":[["LightX2V-DMD v1.1","4",3.797,3.653,3.644,3.556,1.829,3.133],["SMD","4",3.609,3.638,3.738,3.638,3.486,3.514]],"note":"Same 100-prompt set at both budgets. Visual scores: 1–5. Audio: PAM × 5 and Audiobox Production Quality ÷ 2 (0–5). Higher means are not significance claims. DMD has higher prompt alignment; SMD improves temporal, naturalness, and audio scores."},
 h3eight:{"title":"H3 · 8 NFE","source":"h3_generation.tex","metrics":["Prompt alignment","Structural coherence","Temporal coherence","Visual naturalness","Audio clarity","Audio quality"],"max":[5,5,5,5,5,5],"rows":[["LightX2V-DMD v1.1","8",3.922,3.625,3.597,3.528,3.209,3.44],["SMD","8",3.863,3.863,3.834,3.625,3.619,3.5]],"note":"Same 100-prompt set and score definitions as 4 NFE. SMD improves five of six displayed means; DMD retains higher prompt alignment. These are text-conditioned results, not a REF2VA benchmark."},
 causal:{"title":"Main comparison","source":"causal_video_distillation.tex","metrics":["Quality","Semantic","Total"],"max":[100,100,100],"rows":[["Causal Forcing","4",84.59,81.84,84.04],["DMD*","4",84.15,80.82,83.48],["SMD","4",84.97,79.86,83.95]],"note":"VBench scores × 100. SMD uses correction weight 0.2. Quality and Total improve over our DMD* control, while Semantic decreases. Causal Forcing has the highest Total (84.04); SMD reaches 83.95."},
 correction:{"title":"Correction sweep","source":"causal_video_distillation.tex","metrics":["Quality","Semantic","Total"],"max":[100,100,100],"rows":[["λ = 0","4",85.36,79.64,84.22],["λ = 0.2 (main)","4",84.97,79.86,83.95],["λ = 0.4","4",84.68,79.41,83.63],["λ = 0.8","4",84.88,79.53,83.81]],"note":"Causal guidance is fixed and teacher-reference repulsion is disabled. Weight 0.2 gives the best Semantic score in this sweep, but no correction gives the highest Total; larger weights do not improve monotonically."},
 crossFlux:{"title":"FLUX.2-klein-4B student","source":"cross_model.tex","metrics":["GenEval","DPG-Bench","Alignment","Text","Diversity","Style","Reasoning"],"max":[1,100,1,1,1,1,1],"rows":[["4B teacher → 4B","4",0.789,83.34,0.826,0.663,0.215,0.419,0.249],["9B teacher → 4B","4",0.791,84.26,0.843,0.744,0.224,0.441,0.246]],"note":"Cross-capacity transfer within FLUX.2-klein. The larger teacher improves six of seven metrics; Reasoning falls slightly from 0.249 to 0.246. OneIG scores are separate dimensions, not an overall score."},
 crossLens:{"title":"Lens-RL-3.8B student","source":"cross_model.tex","metrics":["GenEval","DPG-Bench","Alignment","Text","Diversity","Style","Reasoning"],"max":[1,100,1,1,1,1,1],"rows":[["Lens teacher → Lens","4",0.829,87.3,0.866,0.954,0.184,0.31,0.277],["9B teacher → Lens","4",0.77,85.13,0.834,0.888,0.234,0.414,0.247]],"note":"Cross-architecture transfer from FLUX.2-klein-9B. Diversity and Style improve, but other reported scores decrease. A larger teacher is not uniformly better."}
};
// Full Wan breakdown from video_gen_wan_full.tex. Existing five columns stay
// in place; append only dimensions not already present (DD, MS and Color).
{
 const names=['Subject consistency','Background consistency','Temporal flickering','Aesthetic quality','Imaging quality','Object class','Multiple objects','Human action','Spatial relationship','Scene','Appearance style','Temporal style','Overall consistency'];
 const indices=[0,1,2,5,6,7,8,9,11,12,13,14,15];
 const full={
  wan13:[
   [97.76,97.82,99.42,98.81,45.00,68.80,69.46,95.85,87.80,95.60,84.63,73.76,53.21,21.59,23.43,26.28],
   [94.72,95.79,98.77,97.64,81.94,64.68,66.73,93.76,85.64,96.00,85.39,74.95,56.87,20.50,24.38,26.37],
   [97.79,96.96,99.26,98.29,68.33,67.01,67.63,95.74,90.47,97.00,87.67,80.33,57.50,20.65,24.37,26.53],
   [97.69,95.90,99.33,99.02,72.50,66.26,69.03,96.22,85.79,93.34,85.41,76.95,51.47,19.33,23.77,25.73],
   [96.29,95.44,98.83,98.66,79.44,66.19,68.14,94.21,83.84,96.00,89.19,74.54,55.11,19.91,23.76,25.82]
  ],
  wan14:[
   [96.92,97.83,99.67,98.76,49.72,67.07,67.04,97.17,88.81,97.00,87.81,73.55,52.54,21.88,23.56,26.50],
   [95.65,96.45,98.57,97.81,76.39,66.76,69.17,97.59,90.48,98.80,82.91,83.05,53.27,21.00,24.48,26.39],
   [97.22,97.40,99.00,98.10,73.61,67.12,68.78,97.56,92.50,98.20,85.79,83.84,54.72,20.90,24.68,26.83],
   [95.41,96.42,99.39,98.52,74.72,66.78,68.88,96.55,87.90,96.40,86.59,80.02,54.30,20.86,24.39,26.49],
   [96.60,95.73,97.86,98.52,83.89,66.47,68.50,97.37,90.70,96.20,86.18,80.92,53.21,19.93,24.10,26.42]
  ]
 };
 for(const [key,breakdown] of Object.entries(full)){
  const data=window.SMD_METRICS[key];
  data.metrics.push(...names);data.max.push(...names.map(()=>100));
  data.rows.forEach((row,i)=>row.push(...indices.map(index=>i===0?null:breakdown[i-1][index])));
 }
}
// Each metric retains its own numerical scale.
for (const [key, dataset] of Object.entries(window.SMD_METRICS)) {
 dataset.precision = key === 'multi' ? [4,4,2,4,4,4] : key === 'edit' ? dataset.metrics.map(()=>2) : /^(wan|causal|correction)/.test(key) ? dataset.metrics.map(()=>2) : /^(qwen|flux)$/.test(key) ? [3,1,3,3,3,3,3,3] : /^cross/.test(key) ? [3,2,3,3,3,3,3] : dataset.metrics.map(()=>3);
 dataset.focus = key === 'correction' || /^cross/.test(key) ? 1 : dataset.rows.length-1;
}
