// Lossless transport for hosts with a per-file size limit.
export async function resolveAsset(url, onProgress=()=>{}) {
  if(!url.endsWith('.parts.json'))return {url,filename:url.split('/').pop(),revoke(){}};
  const manifestUrl=new URL(url,location.href);
  const response=await fetch(manifestUrl);if(!response.ok)throw new Error('Asset manifest download failed');
  const manifest=await response.json();
  if(!Number.isSafeInteger(manifest.bytes)||manifest.bytes<=0||manifest.bytes>100*1024*1024)throw new Error('Invalid asset size');
  const bytes=new Uint8Array(manifest.bytes);let offset=0;
  for(const part of manifest.parts){
    const partUrl=new URL(part.path,manifestUrl);
    if(partUrl.origin!==manifestUrl.origin)throw new Error('Cross-origin asset chunk rejected');
    const result=await fetch(partUrl);if(!result.ok)throw new Error('Asset chunk download failed');
    const chunk=new Uint8Array(await result.arrayBuffer());
    if(chunk.length!==part.bytes||offset+chunk.length>bytes.length)throw new Error('Invalid asset chunk');
    bytes.set(chunk,offset);offset+=chunk.length;onProgress(Math.round(offset/bytes.length*100));
  }
  if(offset!==bytes.length)throw new Error('Incomplete asset');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  if(hash!==manifest.sha256)throw new Error('Asset integrity check failed');
  const blobUrl=URL.createObjectURL(new Blob([bytes],{type:manifest.type}));
  return {url:blobUrl,filename:manifest.filename,revoke(){URL.revokeObjectURL(blobUrl)}};
}
