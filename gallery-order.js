/* User-directed ordering, applied after all galleries are assembled.
 * IDs refer to the pre-change cases, never shifting on-screen indices.
 * Teaser DOM is intentionally untouched.
 */
function firstCase(list,code){const first=list.find(c=>c.code===code);if(!first)throw new Error('Missing lead example: '+code);return[first,...list.filter(c=>c.code!==code)]}
available.images=firstCase(available.images,'I04');
const editingCases=new Map([...available.edits,...SMD_EDIT_REPLACEMENTS].map(c=>[c.code,c]));
available.edits=['E23','E11','E24','E05','E12','E13','E14','E25','E26','E17','E18','E19','E20','E21','E22'].map(code=>{const c=editingCases.get(code);if(!c)throw new Error('Missing edit: '+code);return c});
available.wan=firstCase(available.wan,'V06');
available.trellis=firstCase(available.trellis,'T16');
// Hide reference-conditioned generation for now, retaining recoverable sources.
const referenceSection=$('#reference-section');
if(referenceSection){cancelPlayback('reference-results');visibilityObserver.unobserve(referenceSection);referenceSection.querySelectorAll('video').forEach(v=>{v.pause();releaseVideoSource(v);posterObserver.unobserve(v)});referenceSection.querySelectorAll('img[data-src]').forEach(img=>imageObserver.unobserve(img));referenceSection.remove()}
available.reference=[];
// Remove the wine-label example: its required phrase is visibly malformed.
SMD_CURATED.multiCases=SMD_CURATED.multiCases.filter(c=>c.id!=='multi-original-1');
curatedMultiIndex=0;showCuratedMulti();
$('#multi-teacher .caption').textContent=`Four reward-specialized teachers supervise one SD3.5-Medium student at 4 NFE. Compare the base teacher, self-distilled student, four specialist-distilled students, and Ours for the same prompt; use the arrows or swipe to browse ${SMD_CURATED.multiCases.length} examples.`;
// Start each visible widget at its actual first item, not a later default index.
for(const group of ['images','edits','shapes','trellis','wan','av','cross'])changeCase(group,available[group][0].code);
