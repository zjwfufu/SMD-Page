/* Reader-facing copy grounded in the independent technical report, 5 Oct 2026.
 * Report sources are documented in REPORT_CONTENT.md. Never edit sample prompts here.
 */
window.SMD_REPORT_CONTENT = {
  abstract: [
    'Simplified Matching Distillation (SMD) turns many-step diffusion models into few-step generators through direct teacher–student velocity matching. Training needs no auxiliary score model or adversarial objective, and inference uses the same student architecture.',
    'We demonstrate the approach across image generation and editing, 3D, video, and joint audio–video generation, with models up to 33B parameters.'
  ],
  explore: {
    title: 'Image Generation',
    overview: 'Four evaluations, with room for variation. On FLUX.1-dev and Qwen-Image, SMD leads the compared few-step methods on GenEval and DPG-Bench, while retaining variation across repeated generations.',
    detail: 'Prompt-only, on-policy distillation reduces FLUX.1-dev and Qwen-Image to 4 NFE. The gallery compares Qwen-Image with Lightning using four matched seeds per prompt; benchmark results below cover both backbones.',
    protocol: 'GenEval measures compositional alignment; DPG-Bench measures dense-prompt alignment; OneIG-Bench-EN covers alignment, text rendering, diversity, style, and reasoning. Multi-step teachers are reference points, not matched-budget baselines. PDD results are quoted from its paper. Selected examples are not per-prompt benchmark scores.',
    metrics: ['qwen', 'flux']
  },
  editing: {
    title: 'Image Editing',
    overview: 'Change the requested content while preserving the rest. At 4 NFE, SMD matches the teacher’s displayed ImgEdit overall score and improves GEdit results over Lightning, without training on target edited images.',
    detail: 'Qwen-Image-Edit-2511 learns from source images and instructions, without target edited images. Compare the same input and instruction across Lightning and SMD at 4 NFE.',
    protocol: 'ImgEdit-Bench measures editing operations. GEdit-Bench-EN reports GPT-4.1-based semantic consistency, perceptual quality, and overall quality. Aggregate gains are not uniform across operations: Lightning remains stronger on extraction. The teacher uses 40 × 2 NFE, including both CFG branches.',
    metrics: ['edit']
  },
  shape: {
    title: '3D Generation',
    overview: 'The same objective extends to fixed-size shape latents in Hunyuan3D 2.1 and sparse geometry and appearance latents in TRELLIS.2. Rendered views show what survives few-step distillation.',
    detail: 'Compare input images and synchronized turntables from SMD, direct four-step teacher sampling, and the multi-step teacher. These are selected qualitative comparisons, not a quantitative 3D benchmark.',
    protocol: 'Hunyuan3D 2.1 distills shape generation to 4 NFE. For TRELLIS.2, only the final high-resolution shape and texture stages are distilled, each to 4 NFE. Sparse-structure and coarse-shape stages remain unchanged; 4 NFE is not the budget of the entire pipeline.',
    evidence: [['Hunyuan3D 2.1', '4 NFE', 'Shape-generation stage'], ['TRELLIS.2 shape', '4 NFE', 'High-resolution stage only'], ['TRELLIS.2 texture', '4 NFE', 'Texture stage only']],
    evidenceTitle: 'Two representations. Stage-specific budgets.',
    evidenceNote: 'The report evaluates geometry, appearance, and local detail through rendered views and crops. No aggregate 3D score is reported.'
  },
  video: {
    title: 'Video Generation',
    overview: 'Preserve motion as well as frame quality. SMD distills Wan2.1 at 1.3B and 14B scales to 4 NFE, remaining competitive with strong few-step baselines without changing the student’s inference architecture.',
    detail: 'The gallery compares AnyFlow and SMD on Wan2.1-T2V-14B at 4 NFE, with three samples for each prompt. Quantitative VBench results below cover both model scales.',
    protocol: 'VBench evaluation uses the Self-Forcing prompt set. Dynamic Degree measures motion activity, not diversity across repeated generations; Color measures prompt-specified color adherence, not saturation. DMD2* is reproduced by us; PDD† is quoted from its paper. Gallery clips are selected illustrations, not the benchmark itself.',
    metrics: ['wan14', 'wan13']
  },
  causal: {
    title: 'Causal Video Generation',
    overview: 'Local regression can replace DMD in the final compression stage of a causal video generator. A 4-NFE Wan student approaches Causal Forcing’s Total score without maintaining an auxiliary fake-score model.',
    detail: 'Compare Causal Forcing, our DMD* control, and SMD on matched prompts. SMD uses a causal teacher for direct velocity targets and a frozen bidirectional teacher for a training-only correction signal.',
    protocol: 'This study concerns few-step compression, not an end-to-end streaming system. DMD* denotes our rank-256 LoRA control. The main SMD result uses correction weight 0.2 without teacher-reference repulsion. Its higher Quality comes with lower Semantic; the no-correction setting has the highest Total in the separate sweep.',
    metrics: ['causal', 'correction']
  },
  audio: {
    title: 'Audio–Video Generation',
    overview: 'Generate sound and motion together. On the 33B MiniMax H3 model, SMD improves temporal coherence, visual naturalness, and audio clarity and quality over LightX2V-DMD at both 4 and 8 NFE. DMD retains stronger prompt alignment.',
    detail: 'Compare SMD and LightX2V-DMD v1.1 at 4 or 8 NFE. Both methods use the same prompt within each case; switch the listening track to hear the original audio. The gallery contains 30 selected examples, not the 100-prompt evaluation set.',
    protocol: 'The report evaluates both budgets on the same 100 prompts, matching seeds, resolution, and duration between methods. Four visual scores use a 1–5 scale (GPT-5.6 Sol, 24 chronological frames, two candidate orders). Audio clarity is PAM × 5 and audio quality is Audiobox Production Quality ÷ 2, both on a 0–5 scale. These automatic scores are not a human preference study or a direct measure of audio–visual synchronization. Means describe the text-conditioned benchmark, not REF2VA or individual gallery clips.',
    metrics: ['h3', 'h3eight']
  },
  multimodal: {
    title: 'Multimodal Generation',
    overview: 'Reference-conditioned generation goes beyond text alone. SMD transfers appearance, composition, and motion from reference inputs, using instructions and reference clips as conditions rather than ground-truth target outputs.',
    detail: 'Explore 15 reference-conditioned H3 examples with their image and video inputs. The report presents this as a qualitative extension; the gallery also provides a separate 8-NFE viewing option.',
    protocol: 'The report’s reference-conditioned figure shows a 4-NFE student. No directly comparable DMD baseline or aggregate REF2VA benchmark is reported. Text-conditioned H3 scores must not be interpreted as scores for these reference-conditioned outputs.',
    evidence: [['Conditioning', 'References', 'Instructions with reference inputs'], ['Report examples', '4 NFE', 'Qualitative capability demonstration'], ['Aggregate benchmark', 'Not reported', 'No comparable DMD baseline']],
    evidenceTitle: 'Reference-guided capabilities, not a score ranking.',
    evidenceNote: 'Inspect appearance editing, composition, and reference-guided motion and appearance transfer. The examples illustrate capabilities; they do not establish an aggregate success rate.'
  },
  transfer: {
    title: 'Cross-Model Distillation',
    overview: 'A different teacher can change what a student learns. A 9B FLUX.2 teacher improves six of seven metrics for the 4B student. Transfer to Lens improves diversity and style but exposes trade-offs on other criteria.',
    detail: 'All four teacher-to-student routes use 4 NFE. Compare cross-capacity transfer within FLUX.2-klein and cross-architecture transfer into Lens-RL-3.8B; each route uses the same prompt.',
    protocol: 'Compare teacher choices within the same student, not as a single pooled ranking. The 9B teacher helps the FLUX.2-4B student on six of seven metrics, with a small reasoning decrease. For Lens, diversity and style improve but the other scores decrease. Lens was pretrained with long captions, which may affect short-prompt evaluations.',
    metrics: ['crossFlux', 'crossLens']
  },
  'multi-teacher': {
    title: 'Multi-Teacher Distillation',
    overview: 'Bring complementary specialists into one student. Prompt-routed supervision improves all six reported metrics over self-distillation and the 28-NFE base teacher. Inference uses only the resulting 4-NFE student.',
    detail: 'Four reward-specialized LoRA teachers target CLIPScore, GenEval, OCR, and PickScore. Compare their individually distilled students with self-distillation, the base teacher, and the routed SD3.5-Medium student.',
    protocol: 'All students share the same initialization and use imitation without repulsion. GenEval, OCR, and PickScore use their respective evaluation sets; HPSv2, CLIPScore, and ImageReward use DrawBench. Routing is training-only. Specialists still lead several criteria: the claim is balanced transfer, not dominance over every specialist.',
    metrics: ['multi']
  }
};
