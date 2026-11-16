/* Classic scripts work in the anonymous host's opaque-origin sandbox. */
(() => {
 'use strict';
 const manifest=window.demoStreamManifest,cache=new Map(),waiting=new Map(),downloads=new Map();
 window.isDemoStream=source=>source===manifest.source;
 function receivePart(id,encoded){
  const job=waiting.get(id);if(!job)return;
  try{
   const raw=atob(encoded),bytes=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   if(bytes.length!==job.bytes)throw new Error('Incomplete video segment');
   cache.set(id,bytes);job.resolve(bytes);
  }catch(error){job.reject(error)}
 }
 window.addEventListener('message',event=>{
  const message=event.data;
  if(!message||message.type!=='demo-part')return;
  const job=waiting.get(message.id);
  if(!job||event.source!==job.frame.contentWindow)return;
  if(message.failed)job.reject(new Error('Video segment unavailable'));
  else receivePart(message.id,message.encoded);
 });
 function readPart(part){
  if(downloads.has(part.id))return downloads.get(part.id);
  const promise=downloadPart(part);downloads.set(part.id,promise);
  promise.finally(()=>downloads.delete(part.id)).catch(()=>{});
  return promise;
 }
 async function downloadPart(part){
  if(cache.has(part.id))return cache.get(part.id);
  for(let attempt=0;attempt<4;attempt++){
   try{
    return await new Promise((resolve,reject)=>{
     const frame=document.createElement('iframe');frame.hidden=true;frame.setAttribute('aria-hidden','true');
     // Removing a script does not abort its download. Removing its frame does,
     // so timed-out requests cannot consume every browser connection slot.
     const cleanup=()=>{clearTimeout(timer);frame.remove();waiting.delete(part.id)};
     const job={frame,bytes:part.bytes,resolve:value=>{cleanup();resolve(value)},reject:error=>{cleanup();reject(error)}};
     // Cold files on the mirror can take longer than a warm retry. Give later
     // attempts more time instead of repeatedly cancelling the same response.
     const timer=setTimeout(()=>job.reject(new Error('Video segment timed out')),12000*(attempt+1));
     waiting.set(part.id,job);
     const url=new URL(part.path,location.href).href+(attempt?'?retry='+attempt:'');
     frame.srcdoc='<script>window.receiveDemoPart=(id,encoded)=>parent.postMessage({type:"demo-part",id,encoded},"*");<\/script>'+
      '<script src="'+url.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" onerror=\'parent.postMessage({type:"demo-part",id:'+JSON.stringify(part.id)+',failed:true},"*")\'><\/script>';
     document.body.append(frame);
    });
   }catch(error){
    if(attempt===3)throw error;
    await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));
   }
  }
 }
 window.loadDemoStream=async(video,onProgress=()=>{})=>{
  const NativeMediaSource=window.MediaSource;
  const streaming=NativeMediaSource&&NativeMediaSource.isTypeSupported(manifest.type);
  let revoked=false,objectURL,media,buffer,settled=false;
  let resolveReady,rejectReady;
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
  const asset={get url(){return objectURL},revoke(){revoked=true;if(objectURL)URL.revokeObjectURL(objectURL)}};
  function checkActive(){if(revoked||!video.isConnected)throw new DOMException('Cancelled','AbortError')}
  function append(bytes){
   return new Promise((resolve,reject)=>{
    const done=()=>{buffer.removeEventListener('updateend',success);buffer.removeEventListener('error',failure)};
    const success=()=>{done();resolve()},failure=()=>{done();reject(new Error('Video segment could not be decoded'))};
    buffer.addEventListener('updateend',success);buffer.addEventListener('error',failure);
    try{buffer.appendBuffer(bytes)}catch(error){done();reject(error)}
   });
  }
  // Download independently of append order: one slow segment must not stop
  // the other workers from filling the buffer. Keep four workers in flight.
  // Resolved segment bytes also survive a manual retry.
  (async()=>{
   try{
    if(streaming){
     media=new NativeMediaSource();objectURL=URL.createObjectURL(media);
     const opened=new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Video player did not open')),10000);
      media.addEventListener('sourceopen',()=>{clearTimeout(timer);resolve()},{once:true});
     });
     video.src=objectURL;await opened;checkActive();
     media.duration=manifest.duration;buffer=media.addSourceBuffer(manifest.type);
    }
    const chunks=[],jobs=manifest.parts.map(()=>{
     let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});
     promise.catch(()=>{});return{promise,resolve,reject};
    });
    let next=0;
    async function worker(){
     while(next<manifest.parts.length&&!revoked){
      const index=next++;
      try{jobs[index].resolve(await readPart(manifest.parts[index]))}
      catch(error){jobs[index].reject(error)}
     }
    }
    for(let i=0;i<4;i++)worker().catch(()=>{});
    let received=0;
    for(let i=0;i<manifest.parts.length;i++){
     checkActive();const bytes=await jobs[i].promise;checkActive();
     if(streaming)await append(bytes);else chunks.push(bytes);
     received+=bytes.length;
     onProgress(Math.round(received/manifest.bytes*100));
     video.dispatchEvent(new CustomEvent('demo-progress',{detail:{percent:Math.round(received/manifest.bytes*100)}}));
     if(streaming&&!settled&&buffer.buffered.length&&buffer.buffered.end(0)>=2){settled=true;resolveReady(asset)}
    }
    if(streaming){media.endOfStream()}
    else{objectURL=URL.createObjectURL(new Blob(chunks,{type:'video/mp4'}));video.src=objectURL}
    if(!settled){settled=true;resolveReady(asset)}
    video.dispatchEvent(new CustomEvent('demo-complete'));
   }catch(error){
    asset.revoke();video.removeAttribute('src');video.load();
    if(!settled){settled=true;rejectReady(error)}
    else video.dispatchEvent(new CustomEvent('demo-load-error'));
   }
  })();
  return ready;
 };
})();
