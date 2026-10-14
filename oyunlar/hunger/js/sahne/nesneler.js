/* Hunger 3D - sahne: doğa nesneleri (parçalara bölünmüş, iki ayrıntı düzeyli örnekleme), yerleştirilen yapılar, alevler, kademeli parçalanma */
(()=>{
'use strict';
const {W,H,O,hash}=HG;
const S=HG.Scene,sc=HG.sc;
const {box,cone}=sc.g;
const CH=32;                                   /* parça (chunk) boyutu: kare */
const LOD_DIST=62,CULL_DIST=185;               /* yakın: ayrıntılı model · uzak: sade model · çok uzak: çizilmez */
let inst=new Map(),chunks=new Map(),placedGroup=null,flames=[],wobIdx=-1;
const staged=new Map();let stagedGroup=null;
const wm=new THREE.Matrix4(),wq=new THREE.Quaternion(),wv=new THREE.Vector3(),ws=new THREE.Vector3();
const INSTKEYS=['treeA','treeB','palm','palm0','rock','coal','copper','iron','bush','bush0'];
const WIND={treeA:.022,treeB:.03,palm:.05,palm0:.05,bush:.025,bush0:.025};
const windU={uTime:{value:0}};
sc.windU=windU;
/* rüzgâr: yüksekliğe bağlı hafif sallanma (yalnızca yaprak/ağaç malzemeleri) */
function windMat(extra){
 const m=sc.mat(extra);
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTime=windU.uTime;sh.uniforms.uWindV=sc.U.uWindV;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform vec3 uWindV;').replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
  #ifdef USE_INSTANCING
  float wph=instanceMatrix[3].x*.6+instanceMatrix[3].z*.45;
  float wy=max(position.y-.6,0.);
  float wk=.5+uWindV.z*1.1,gs=sin(uTime*(1.5+uWindV.z)+wph)*.6+sin(uTime*2.9+wph*1.7)*.4;
  transformed.x+=(gs*.0035+uWindV.x*uWindV.z*.0045)*wk*wy*wy;
  transformed.z+=(cos(uTime*1.2+wph*1.3)*.0025+uWindV.y*uWindV.z*.0045)*wk*wy*wy;
  #endif`);
 };
 return m;
}
let matFol,matFolDS,matRock;
sc.getFolMats=()=>({matFol,matFolDS,matRock});
const tint=new THREE.Color();
function tintFor(key,a,b,c){
 if(key==='treeA'||key==='treeB'||key==='bush'||key==='bush0')return tint.setRGB(.82+a*.3,.88+b*.22,.78+c*.3);
 if(key==='palm'||key==='palm0')return tint.setRGB(.9+a*.2,.92+b*.16,.85+c*.2);
 const v=.82+a*.3;return tint.setRGB(v,v*(.98+b*.04),v*(.96+c*.08));
}
sc.tintFor=tintFor;
function chunkKey(key,x,z){return key+'|'+Math.floor(x/CH)+'|'+Math.floor(z/CH)}
function mkInst(geo,mat,n,shadow){
 const im=new THREE.InstancedMesh(geo,mat,n);im.count=0;im.castShadow=shadow;im.receiveShadow=true;im.frustumCulled=false;
 im.setColorAt(0,tint.setRGB(1,1,1));sc.scene.add(im);return im;
}
const KEYOF={[O.PALM]:'palm',[O.PALM0]:'palm0',[O.ROCK]:'rock',[O.COAL]:'coal',[O.COPPER]:'copper',[O.IRON]:'iron',[O.BUSH]:'bush',[O.BUSH0]:'bush0'};
function buildInstances(G){
 for(const c of chunks.values()){sc.scene.remove(c.mesh);c.mesh.dispose&&c.mesh.dispose();if(c.lo){sc.scene.remove(c.lo);c.lo.dispose&&c.lo.dispose()}}
 chunks.clear();
 if(!matFol){matFol=windMat();matFolDS=windMat({side:THREE.DoubleSide});matRock=sc.mat()}
 const cnt=new Map();
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const o=G.obj[z*W+x];if(!o)continue;
  const ks=o===O.TREE?['treeA','treeB']:[KEYOF[o]];
  for(const key of ks){if(!key)continue;const k=chunkKey(key,x,z);cnt.set(k,(cnt.get(k)||0)+1)}
 }
 for(const [k,n] of cnt){
  const [key,cx,cz]=k.split('|');
  const mat=key==='palm'||key==='palm0'?matFolDS:WIND[key]?matFol:matRock;
  const isTree=key==='treeA'||key==='treeB'||key==='palm'||key==='palm0';
  const c={mesh:mkInst(sc.MODEL[key],mat,n,true),lo:sc.MODEL[key+'_lo']?mkInst(sc.MODEL[key+'_lo'],mat,n,true):null,n,cnt:0,key,
   box:new THREE.Box3(new THREE.Vector3(+cx*CH,-3,+cz*CH),new THREE.Vector3((+cx+1)*CH,16,(+cz+1)*CH))};
  chunks.set(k,c);
 }
}
function flameGroup(){
 const g=new THREE.Group();
 const mk=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
 const a=new THREE.Mesh(cone(.22,.7,10,2),mk(0xe8541c));a.position.y=.45;const b=new THREE.Mesh(cone(.15,.55,10,2),mk(0xf6a623));b.position.y=.4;const c=new THREE.Mesh(cone(.09,.35,8,1),mk(0xffe08a));c.position.y=.3;
 g.add(a,b,c);
 const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xff8a3c,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:.6}));
 gl.scale.set(2.6,2.6,1);gl.position.y=.55;g.add(gl);g.userData.glow=gl;
 return g;
}
function syncObjects(G){
 if(placedGroup){sc.scene.remove(placedGroup)}
 placedGroup=new THREE.Group();sc.scene.add(placedGroup);
 if(stagedGroup)sc.scene.remove(stagedGroup);
 stagedGroup=new THREE.Group();sc.scene.add(stagedGroup);staged.clear();
 inst.clear();sc.fires.length=0;flames=[];
 for(const c of chunks.values())c.cnt=0;
 const plm=sc.MODEL.matPlain;
 const q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s3=new THREE.Vector3(),m=new THREE.Matrix4();
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const i=z*W+x,o=G.obj[i];if(!o)continue;
  const gy=S.groundY(x+.5,z+.5),hh=hash(x,z,21),h2=hash(x,z,22),h3=hash(x,z,23);
  let key=null;
  if(o===O.TREE)key=hh<.5?'treeA':'treeB';else key=KEYOF[o];
  if(key){
   const ch=chunks.get(chunkKey(key,x,z));if(!ch)continue;
   const idx=ch.cnt++;
   if(idx>=ch.n){ch.cnt--;continue}
   const sc2=(o===O.TREE?.8+h2*.4:o===O.PALM||o===O.PALM0?.9+h2*.3:.9+h2*.3);
   p.set(x+.5+(hh-.5)*.2,gy-.04,z+.5+(h2-.5)*.2);e.set((h3-.5)*.05,hh*6.28,(h2-.5)*.05);q.setFromEuler(e);s3.set(sc2,sc2*(o===O.TREE?1:.95),sc2);
   m.compose(p,q,s3);
   const t=tintFor(key,hh,h2,h3);
   ch.mesh.setMatrixAt(idx,m);ch.mesh.setColorAt(idx,t);
   if(ch.lo){ch.lo.setMatrixAt(idx,m);ch.lo.setColorAt(idx,t)}
   inst.set(i,{mesh:ch.mesh,lo:ch.lo,idx,mat:m.clone(),tint:[t.r,t.g,t.b],key});
   continue;
  }
  let geo=null;
  if(o===O.FIRE)geo=sc.MODEL.fireBase;else if(o===O.BENCH)geo=sc.MODEL.bench;else if(o===O.FURN)geo=sc.MODEL.furn;
  else if(o===O.WALLW)geo=sc.MODEL.wallw;else if(o===O.WALLS)geo=sc.MODEL.walls;else if(o===O.DOOR)geo=sc.MODEL.door;
  if(!geo)continue;
  const me=new THREE.Mesh(geo,plm);me.position.set(x+.5,gy,z+.5);me.castShadow=true;me.receiveShadow=true;
  if(o===O.DOOR){const isW=c=>{const q2=G.obj[c];return q2===O.WALLW||q2===O.WALLS};const alongX=(x>0&&isW(i-1))||(x<W-1&&isW(i+1));me.rotation.y=alongX?0:Math.PI/2}
  else if(o===O.WALLW||o===O.WALLS)me.rotation.y=hh<.5?0:Math.PI;
  placedGroup.add(me);
  if(o===O.FIRE){const f=flameGroup();f.position.set(x+.5,gy+.05,z+.5);placedGroup.add(f);sc.fires.push({x:x+.5,z:z+.5,y:gy});flames.push({g:f,ph:hh*10})}
  if(o===O.FURN){const gl=new THREE.Mesh(box(.42,.3,.04),new THREE.MeshBasicMaterial({color:0xff7a1a,toneMapped:false}));gl.position.set(x+.5,gy+.4,z+.5+.49);placedGroup.add(gl)}
 }
 for(const c of chunks.values()){
  for(const mm of [c.mesh,c.lo]){if(!mm)continue;mm.count=c.cnt;mm.instanceMatrix.needsUpdate=true;if(mm.instanceColor)mm.instanceColor.needsUpdate=true}
 }
 wobIdx=-1;
 /* yarım kalmış kaya/maden parçalanmaları yeniden görünür */
 if(G.dmg)for(const k in G.dmg)applyDamage(+k,G.dmg[k],G,true);
};
/* ---- Kademeli parçalanma: ilerleme oranına göre kaya/maden küçülür ---- */
const ZERO=new THREE.Matrix4().makeScale(1e-4,1e-4,1e-4);
function applyDamage(i,frac,G,silent){
 const o=G.obj[i],key=KEYOF[o];
 if(!key||!(key==='rock'||key==='coal'||key==='copper'||key==='iron'))return;
 if(!G.dmg)G.dmg={};
 G.dmg[i]=frac;
 const st=frac<.34?0:frac<.67?1:2,cur=staged.get(i),r=inst.get(i);
 if((cur?cur.stage:0)===st&&!silent)return;
 if(!r)return;
 if(cur){stagedGroup.remove(cur.mesh);cur.mesh.material.dispose();staged.delete(i)}
 if(st===0){r.mesh.setMatrixAt(r.idx,r.mat);r.mesh.instanceMatrix.needsUpdate=true;return}
 /* örnek gizlenir, yerine aşamaya özel mesh konur */
 const pos=new THREE.Vector3(),qq=new THREE.Quaternion(),ss=new THREE.Vector3();r.mat.decompose(pos,qq,ss);
 wm.compose(pos,qq,new THREE.Vector3(1e-4,1e-4,1e-4));r.mesh.setMatrixAt(r.idx,wm);r.mesh.instanceMatrix.needsUpdate=true;
 const mat=matRock.clone();mat.color.setRGB(r.tint[0],r.tint[1],r.tint[2]);sc.mats.push(mat);
 const mesh=new THREE.Mesh(sc.MODEL[key+'_s'+st],mat);mesh.matrixAutoUpdate=false;mesh.matrix.copy(r.mat);mesh.castShadow=true;mesh.receiveShadow=true;
 stagedGroup.add(mesh);staged.set(i,{mesh,stage:st});
}
S.setDamage=(i,f)=>applyDamage(i,f,HG.G);
S.onBuild(buildInstances);
S.onSync(syncObjects);
const fr=new THREE.Frustum(),pm=new THREE.Matrix4(),pp=new THREE.Vector3();
S.onFrame((G,t,dt,info)=>{
 windU.uTime.value=t;
 /* parça görünürlüğü: görüş alanı veya gölge menzili içindekiler çizilir; uzaktakiler sade model kullanır */
 pm.multiplyMatrices(sc.cam.projectionMatrix,sc.cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
 const play=info.mode==='play';pp.set(G.px||0,0,G.py||0);
 if(!play)pp.set(W/2,0,H/2);
 for(const c of chunks.values()){
  if(!c.mesh.count){c.mesh.visible=false;if(c.lo)c.lo.visible=false;continue}
  const d=c.box.distanceToPoint(pp);
  let vis=!play||(fr.intersectsBox(c.box)&&d<CULL_DIST)||d<34;
  if(!play)vis=true;
  const near=!play?false:d<LOD_DIST;
  c.mesh.visible=vis&&(near||!c.lo);
  if(c.lo)c.lo.visible=vis&&!near;
 }
 /* ateş alevleri */
 const night=1-info.L;
 for(const f of flames){
  const s=1+Math.sin(t*13+f.ph)*.08+Math.sin(t*7+f.ph*2)*.06;f.g.scale.set(1+Math.sin(t*9+f.ph)*.08,s*1.1,1+Math.cos(t*8+f.ph)*.08);
  const gl=f.g.userData.glow;gl.material.opacity=(.25+.5*night)*(.9+Math.sin(t*17+f.ph)*.1);const gs=2.2+night*1.6;gl.scale.set(gs/f.g.scale.x,gs/f.g.scale.y,1);
 }
 /* vurulan nesne sallanması */
 if(wobIdx>=0&&(wobIdx!==info.hitI||info.hitT<=0)){const r=inst.get(wobIdx);if(r&&!staged.has(wobIdx)){r.mesh.setMatrixAt(r.idx,r.mat);if(r.lo)r.lo.setMatrixAt(r.idx,r.mat);r.mesh.instanceMatrix.needsUpdate=true;if(r.lo)r.lo.instanceMatrix.needsUpdate=true}wobIdx=-1}
 if(info.hitI>=0&&info.hitT>0&&!staged.has(info.hitI)){
  const r=inst.get(info.hitI);
  if(r){
   const amt=Math.sin(t*90)*.07*(info.hitT/.18)*(r.key==='treeA'||r.key==='treeB'?.35:1);
   r.mat.decompose(wv,wq,ws);
   const q2=wq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(amt,0,amt*.8)));
   wm.compose(wv,q2,ws);r.mesh.setMatrixAt(r.idx,wm);if(r.lo)r.lo.setMatrixAt(r.idx,wm);r.mesh.instanceMatrix.needsUpdate=true;if(r.lo)r.lo.instanceMatrix.needsUpdate=true;wobIdx=info.hitI;
  }
 }
});
})();
