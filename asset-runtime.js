/* Same-origin-independent script transport for sandboxed static website hosts. */
window.createPublishedAssetRuntime=function(manifests){
 const pending=new Map();
 window.receivePublishedAssetPart=(id,encoded)=>{const job=pending.get(id);if(!job)return;const raw=atob(encoded),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);job.resolve(bytes)};
 function readPart(part){
  if(pending.has(part.id))return pending.get(part.id).promise;
  const job={};job.promise=new Promise((resolve,reject)=>{job.resolve=resolve;job.reject=reject});pending.set(part.id,job);
  const script=document.createElement('script');script.src=new URL(part.path,location.href).href;
  const timer=setTimeout(()=>job.reject(new Error('Asset download timed out')),60000);
  script.onerror=()=>job.reject(new Error('Asset part download failed'));
  document.head.append(script);
  job.promise.finally(()=>{clearTimeout(timer);script.remove();pending.delete(part.id)}).catch(()=>{});return job.promise;
 }
 // Portable SHA-256 also works in sandboxed documents without Web Crypto.
 function sha256(input){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],padded=new Uint8Array(Math.ceil((input.length+9)/64)*64);padded.set(input);padded[input.length]=128;
  const view=new DataView(padded.buffer);view.setUint32(padded.length-8,Math.floor(input.length/0x20000000));view.setUint32(padded.length-4,(input.length*8)>>>0);
  const w=new Uint32Array(64),r=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let offset=0;offset<padded.length;offset+=64){
   for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4);
   for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(r(a,7)^r(a,18)^(a>>>3))+w[i-7]+(r(b,17)^r(b,19)^(b>>>10)))>>>0}
   let[a,b,c,d,e,f,g,h]=H;
   for(let i=0;i<64;i++){const t1=(h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}
   [a,b,c,d,e,f,g,h].forEach((v,i)=>H[i]=(H[i]+v)>>>0);
  }
  return H.map(v=>v.toString(16).padStart(8,'0')).join('');
 }
 window.resolvePublishedAsset=async function(url,onProgress=()=>{}){
  const m=manifests[url];if(!m)return{url,filename:url.split('/').pop(),revoke(){}};
  const bytes=new Uint8Array(m.bytes);let offset=0;
  for(const part of m.parts){const chunk=await readPart(part);if(chunk.length!==part.bytes)throw new Error('Asset part size mismatch');bytes.set(chunk,offset);offset+=chunk.length;onProgress(Math.round(offset/bytes.length*100))}
  if(offset!==bytes.length||sha256(bytes)!==m.sha256)throw new Error('Asset integrity check failed');
  const result=URL.createObjectURL(new Blob([bytes],{type:m.type}));return{url:result,filename:m.filename,revoke(){URL.revokeObjectURL(result)}};
 };
};

window.hasPublishedAsset=url=>Object.prototype.hasOwnProperty.call({"assets/av/case25-ours.mp4": true, "assets/h3-selected-20261001/new-018-4-baseline.mp4": true, "assets/h3-selected-20261001/new-018-4-ours.mp4": true, "assets/h3-selected-20261001/new-018-8-baseline.mp4": true, "assets/h3-selected-20261001/new-018-8-ours.mp4": true, "assets/teaser/SMD_r69_1080p_x264.mp4": true},url);
window.createPublishedAssetRuntime({"assets/av/case25-ours.mp4":{"bytes":8398361,"type":"video/mp4","filename":"case25-ours.mp4","sha256":"a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94","parts":[{"id":"a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-0","path":"asset-parts/a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-0.js","bytes":4194304},{"id":"a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-1","path":"asset-parts/a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-1.js","bytes":4194304},{"id":"a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-2","path":"asset-parts/a3b6f652cb8e60975a66631b5082abac429c8b55dc1cf9b7186ecfeae10e6e94-2.js","bytes":9753}]},"assets/h3-selected-20261001/new-018-4-baseline.mp4":{"bytes":7525524,"type":"video/mp4","filename":"new-018-4-baseline.mp4","sha256":"87d2e0b8b326b3aa2309bd6556cb838236ec8a5f833718a0652fa1391b7dd9ec","parts":[{"id":"87d2e0b8b326b3aa2309bd6556cb838236ec8a5f833718a0652fa1391b7dd9ec-0","path":"asset-parts/87d2e0b8b326b3aa2309bd6556cb838236ec8a5f833718a0652fa1391b7dd9ec-0.js","bytes":4194304},{"id":"87d2e0b8b326b3aa2309bd6556cb838236ec8a5f833718a0652fa1391b7dd9ec-1","path":"asset-parts/87d2e0b8b326b3aa2309bd6556cb838236ec8a5f833718a0652fa1391b7dd9ec-1.js","bytes":3331220}]},"assets/h3-selected-20261001/new-018-4-ours.mp4":{"bytes":8957280,"type":"video/mp4","filename":"new-018-4-ours.mp4","sha256":"ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb","parts":[{"id":"ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-0","path":"asset-parts/ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-0.js","bytes":4194304},{"id":"ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-1","path":"asset-parts/ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-1.js","bytes":4194304},{"id":"ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-2","path":"asset-parts/ad721d336eac63ec78844874ef3b3afd6a1de8c176e29b569a9fc64dda6d55cb-2.js","bytes":568672}]},"assets/h3-selected-20261001/new-018-8-baseline.mp4":{"bytes":9489786,"type":"video/mp4","filename":"new-018-8-baseline.mp4","sha256":"ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee","parts":[{"id":"ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-0","path":"asset-parts/ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-0.js","bytes":4194304},{"id":"ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-1","path":"asset-parts/ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-1.js","bytes":4194304},{"id":"ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-2","path":"asset-parts/ffe98db9c66ff7fdbb2ad6bfa76b491768ae7f08767ed2884e3c52ce9e14e4ee-2.js","bytes":1101178}]},"assets/h3-selected-20261001/new-018-8-ours.mp4":{"bytes":8654835,"type":"video/mp4","filename":"new-018-8-ours.mp4","sha256":"3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d","parts":[{"id":"3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-0","path":"asset-parts/3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-0.js","bytes":4194304},{"id":"3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-1","path":"asset-parts/3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-1.js","bytes":4194304},{"id":"3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-2","path":"asset-parts/3341f9d71f68245c3510d15b8bb757f8fc3bfc8292103fb14e90519fb59d7e5d-2.js","bytes":266227}]}});
