import {resolveAsset} from './large-assets.js';
// Downloaded only after the visitor explicitly opens a 3D asset.
import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/addons/controls/OrbitControls.js';
import { GLTFLoader } from './vendor/three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from './vendor/three/addons/loaders/OBJLoader.js';
import { RoomEnvironment } from './vendor/three/addons/environments/RoomEnvironment.js';

export async function mountViewer(host,url,onProgress){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{throw new Error('WebGL is unavailable. Use the turntable videos below instead.');}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
  renderer.setSize(host.clientWidth,host.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.domElement.setAttribute('aria-label','Interactive 3D model: drag to rotate, scroll or pinch to zoom');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#eaf0f5');
  const camera=new THREE.PerspectiveCamera(38,host.clientWidth/host.clientHeight,.01,100);
  camera.position.set(2,1.3,3.5);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.autoRotate=false;controls.minDistance=.6;controls.maxDistance=9;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe9f4ff,0x748297,2));
  const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(3,5,4);scene.add(sun);
  let object,loadedAsset,disposed=false,raf;
  const cleanup=()=>{disposed=true;cancelAnimationFrame(raf);observer?.disconnect();resize?.disconnect();controls.dispose();object?.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats.filter(Boolean)){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose()}});loadedAsset?.revoke();environment.dispose();renderer.dispose();renderer.domElement.remove()};
  let observer,resize;
  try{
    loadedAsset=await resolveAsset(url,onProgress);
    const loader=/\.obj(?:\.parts\.json)?$/.test(url)?new OBJLoader():new GLTFLoader();
    const result=await loader.loadAsync(loadedAsset.url,event=>{if(event.total)onProgress(Math.round(event.loaded/event.total*100))});
    object=result.scene||result;
    if(/\.obj(?:\.parts\.json)?$/.test(url))object.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshStandardMaterial({color:0xb9cddd,roughness:.72,metalness:.04,side:THREE.DoubleSide})});
    const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    const scale=2/Math.max(size.x,size.y,size.z);
    object.position.sub(center);const group=new THREE.Group();group.add(object);group.scale.setScalar(scale);scene.add(group);
    host.replaceChildren(renderer.domElement);
    let visible=true;
    observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});observer.observe(host);
    resize=new ResizeObserver(()=>{if(disposed)return;renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix()});resize.observe(host);
    const frame=()=>{if(disposed)return;raf=requestAnimationFrame(frame);if(visible&&!document.hidden){controls.update();renderer.render(scene,camera)}};frame();
    return{dispose:cleanup,reset(){camera.position.set(2,1.3,3.5);controls.target.set(0,0,0);controls.update()},rotate(){controls.autoRotate=!controls.autoRotate;return controls.autoRotate}};
  }catch(error){cleanup();throw error}
}
