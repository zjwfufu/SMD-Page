/* One NFE at a time; shared case order and existing media lifecycle. */
let audioNfe=4;
available.av=window.SMD_AUDIO_CASES;
const audioHeading=$('#audio .section-heading'),audioTabs=document.createElement('div');
audioTabs.className='audio-nfe-tabs';audioTabs.setAttribute('role','tablist');audioTabs.setAttribute('aria-label','Audio–video sampling steps');
audioTabs.innerHTML=[4,8].map(n=>`<button type="button" id="audio-tab-${n}" role="tab" aria-selected="${n===4}" aria-controls="av-results" tabindex="${n===4?0:-1}" data-nfe="${n}">${n} NFE</button>`).join('');audioHeading.after(audioTabs);
// Switching NFE or cases must not trigger automatic video playback.
cancelAuto('av-results');const scheduleBeforeAudioTabs=scheduleComparison;
scheduleComparison=function(id){if(id!=='av-results')scheduleBeforeAudioTabs(id)};
renders.av=function(){
 const c=state.av,pair=c.steps[audioNfe],root=$('#av-results');
 root.classList.toggle('audio-portrait',c.height>c.width);root.classList.toggle('audio-square',c.width===c.height);
 root.setAttribute('role','tabpanel');root.setAttribute('aria-labelledby','audio-tab-'+audioNfe);
 root.innerHTML=`<div class="two-col video-group" style="--audio-ratio:${c.width}/${c.height}">${vid(pair.ours,'Ours · '+audioNfe+' NFE','ours')}${vid(pair.baseline,'LightX2V DMD · '+audioNfe+' NFE')}</div><div class="playback-tools"><button class="sync-button" data-sync="av-results">▶ Play together</button><button data-listen="0">Listen to Ours</button><button data-listen="1">Listen to DMD</button></div>${prompt(c)}`;
 $('#audio .caption').textContent=`Comparison between Ours and LightX2V DMD on MiniMax H3 at 4 and 8 NFE. Select a step count above the videos; switching keeps the same prompt. Use the side arrows or swipe to browse all ${available.av.length} examples.`;
 for(const button of audioTabs.querySelectorAll('button')){const selected=Number(button.dataset.nfe)===audioNfe;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1}
};
function switchAudioNfe(nfe){if(nfe===audioNfe)return;cancelAuto('av-results');audioNfe=nfe;changeCase('av',state.av.code)}
audioTabs.addEventListener('click',event=>{const tab=event.target.closest('[data-nfe]');if(tab)switchAudioNfe(Number(tab.dataset.nfe))});
audioTabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const nfe=event.key==='Home'?4:event.key==='End'?8:audioNfe===4?8:4;switchAudioNfe(nfe);$('#audio-tab-'+nfe).focus()});
changeCase('av',available.av[0].code);
