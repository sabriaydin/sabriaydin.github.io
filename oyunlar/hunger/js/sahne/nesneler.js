/* Hunger 3D - sahne: doğa nesneleri (parçalara bölünmüş, iki ayrıntı düzeyli örnekleme), yerleştirilen yapılar, alevler, kademeli parçalanma */
(()=>{
'use strict';
const {W,H,O,hash}=HG;
const S=HG.Scene,sc=HG.sc;
const {box,cone}=sc.g;
const CH=32;                                   /* parça (chunk) boyutu: kare */
const LOD_DIST=62,CULL_DIST=185;               /* yakın: ayrıntılı model · uzak: sade model · çok uzak: çizilmez */
let inst=new Map(),chunks=new Map(),placedGroup=null,flames=[],wobIdx=-1;
const placedCells=new Set();                    /* yerleştirilen yapıların kareleri */
const placedBy=new Map();                       /* kare -> {o,objs,own,fire,flame}: yapı tek tek eklenip kaldırılabilir (artımlı güncelleme) */
const STRUCT=new Set([O.FIRE,O.BENCH,O.FURN,O.WALLW,O.WALLS,O.DOOR,O.WALLT,O.WALLM,O.DOORM,O.FENCE,O.BED,O.RACK,O.BARREL,O.TORCHP,O.SNARE,O.PLOT]);
const NBR=new Set([O.WALLT,O.WALLM,O.DOOR,O.DOORM]);   /* yönü komşu yapılara bağlı olanlar */
const staged=new Map();let stagedGroup=null;
const wm=new THREE.Matrix4(),wq=new THREE.Quaternion(),wv=new THREE.Vector3(),ws=new THREE.Vector3();
const INSTKEYS=['treeA','treeB','palm','palm0','rock','coal','copper','iron','bush','bush0','shroom'];
const WIND={treeA:.022,treeB:.03,palm:.05,palm0:.05,bush:.025,bush0:.025};
const windU={uTime:{value:0}};
sc.windU=windU;
/* rüzgâr: yüksekliğe bağlı hafif sallanma (yalnızca yaprak/ağaç malzemeleri) */
function windMat(extra){
 const m=sc.mat(extra);
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTime=windU.uTime;sh.uniforms.uWindV=sc.U.uWindV;sh.uniforms.uWPh=sc.U.uWPh;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform vec3 uWindV;uniform vec2 uWPh;').replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
  #ifdef USE_INSTANCING
  float wph=instanceMatrix[3].x*.6+instanceMatrix[3].z*.45;
  float wy=max(position.y-.6,0.);
  float wk=.5+uWindV.z*1.1,gs=sin(uWPh.y+wph)*.6+sin(uTime*2.9+wph*1.7)*.4;
  transformed.x+=(gs*.0035+uWindV.x*uWindV.z*.0045)*wk*wy*wy;
  transformed.z+=(cos(uTime*1.2+wph*1.3)*.0025+uWindV.y*uWindV.z*.0045)*wk*wy*wy;
  #endif`);
 };
 return m;
}
let matFol,matFolDS,matRock,matOre;
const ORE={coal:1,copper:1,iron:1};
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
const ALT={bush:'bush0',bush0:'bush',palm:'palm0',palm0:'palm'};
const KEYOF={[O.PALM]:'palm',[O.PALM0]:'palm0',[O.ROCK]:'rock',[O.COAL]:'coal',[O.COPPER]:'copper',[O.IRON]:'iron',[O.BUSH]:'bush',[O.BUSH0]:'bush0',[O.SHROOM]:'shroom'};
function buildInstances(G){
 for(const c of chunks.values()){sc.scene.remove(c.mesh);c.mesh.dispose&&c.mesh.dispose();if(c.lo){sc.scene.remove(c.lo);c.lo.dispose&&c.lo.dispose()}}
 chunks.clear();
 if(!matFol){matFol=windMat({pbr:true,leaf:true});matFolDS=windMat({side:THREE.DoubleSide,pbr:true,leaf:true,nocut:true});matRock=sc.mat({pbr:true});matOre=sc.mat({ore:true})}
 const cnt=new Map();
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const o=G.obj[z*W+x];if(!o)continue;
  const ks=o===O.TREE?['treeA','treeB']:ALT[KEYOF[o]]?[KEYOF[o],ALT[KEYOF[o]]]:[KEYOF[o]];   /* çalı ve palmiyede iki hâl de ayrılır: meyveli/meyvesiz geçiş artımlı yapılır */
  for(const key of ks){if(!key)continue;const k=chunkKey(key,x,z);cnt.set(k,(cnt.get(k)||0)+1)}
 }
 /* kesilmiş ve yeniden büyümeyi bekleyen ağaç/kaya/maden için de yer ayrılır: kayıt yüklendikten sonra yeniden büyüme tam senkron gerektirmesin */
 for(const t of G.timers||[]){
  if(!t||t.from!==O.NONE||G.obj[t.i])continue;
  const x=t.i%W,z=(t.i-x)/W,ks=t.to===O.TREE?['treeA','treeB']:KEYOF[t.to]?[KEYOF[t.to]]:[];
  for(const key of ks){const k=chunkKey(key,x,z);cnt.set(k,(cnt.get(k)||0)+1)}
 }
 for(const [k,n] of cnt){
  const [key,cx,cz]=k.split('|');
  const mat=key==='palm'||key==='palm0'?matFolDS:WIND[key]?matFol:ORE[key]?matOre:matRock;
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
/* ---- Yerleştirilen yapılar: tek tek kurulur/kaldırılır (tam senkron yerine artımlı güncelleme) ---- */
function buildStruct(G,i){
 const x=i%W,z=(i-x)/W,o=G.obj[i],plm=sc.MODEL.matPlain;
 let geo=null;
 if(o===O.FIRE)geo=sc.MODEL.fireBase;else if(o===O.BENCH)geo=sc.MODEL.bench;else if(o===O.FURN)geo=sc.MODEL.furn;
 else if(o===O.WALLW)geo=sc.MODEL.wallw;else if(o===O.WALLS)geo=sc.MODEL.walls;else if(o===O.DOOR)geo=sc.MODEL.door;
 else if(o===O.WALLT)geo=sc.MODEL.wallt;else if(o===O.WALLM)geo=sc.MODEL.wallm;else if(o===O.DOORM)geo=sc.MODEL.doorm;else if(o===O.FENCE)geo=sc.MODEL.fence;
 else if(o===O.BED)geo=sc.MODEL.bed;else if(o===O.RACK)geo=sc.MODEL.rack;else if(o===O.BARREL)geo=sc.MODEL.barrel;
 else if(o===O.TORCHP)geo=sc.MODEL.tpost;else if(o===O.SNARE)geo=sc.MODEL.snare;else if(o===O.PLOT)geo=sc.MODEL.plot;
 if(!geo)return;
 const gy=S.groundY(x+.5,z+.5),hh=hash(x,z,21);
 const me=new THREE.Mesh(geo,plm);me.position.set(x+.5,gy,z+.5);me.castShadow=true;me.receiveShadow=true;
 if(o===O.DOOR||o===O.DOORM){const isW=c=>{const q2=G.obj[c];return q2===O.WALLW||q2===O.WALLS||q2===O.WALLT||q2===O.WALLM||q2===O.FENCE};const alongX=(x>0&&isW(i-1))||(x<W-1&&isW(i+1));me.rotation.y=alongX?0:Math.PI/2}
 else if(o===O.WALLT||o===O.WALLM){
  /* ince duvar: komşu yapıların doğrultusuna uzanır (yan yana ise doğu-batı, alt alta ise kuzey-güney) */
  const cn=c=>{const q2=G.obj[c];return q2===O.WALLW||q2===O.WALLS||q2===O.WALLT||q2===O.WALLM||q2===O.DOOR||q2===O.DOORM||q2===O.FENCE};
  const ax=(x>0&&cn(i-1))||(x<W-1&&cn(i+1)),az=(z>0&&cn(i-W))||(z<H-1&&cn(i+W));
  me.rotation.y=az&&!ax?Math.PI/2:ax?0:(hh<.5?0:Math.PI/2);
 }
 else if(o===O.WALLW||o===O.WALLS)me.rotation.y=hh<.5?0:Math.PI;
 else if(o===O.BED)me.rotation.y=Math.floor(hh*4)*Math.PI/2;else if(o===O.RACK)me.rotation.y=hh<.5?0:Math.PI/2;else if(o===O.SNARE)me.rotation.y=hh*6.28;
 placedGroup.add(me);placedCells.add(i);
 const ent={o,objs:[me],own:[]};
 if(o===O.FIRE){const f=flameGroup();f.position.set(x+.5,gy+.05,z+.5);placedGroup.add(f);const fr2={x:x+.5,z:z+.5,y:gy},fl={g:f,ph:hh*10};sc.fires.push(fr2);flames.push(fl);ent.objs.push(f);ent.fire=fr2;ent.flame=fl;ent.own.push(f)}
 if(o===O.TORCHP){const hd=new THREE.Group();hd.position.set(x+.5,gy+1.86,z+.5);hd.scale.setScalar(.4);const f=flameGroup();hd.add(f);placedGroup.add(hd);const fr2={x:x+.5,z:z+.5,y:gy+1},fl={g:f,ph:hh*10};sc.fires.push(fr2);flames.push(fl);ent.objs.push(hd);ent.fire=fr2;ent.flame=fl;ent.own.push(hd)}
 if(o===O.FURN){const gl=new THREE.Mesh(box(.42,.3,.04),new THREE.MeshBasicMaterial({color:0xff7a1a,toneMapped:false}));gl.position.set(x+.5,gy+.4,z+.5+.49);placedGroup.add(gl);ent.objs.push(gl);ent.own.push(gl)}
 placedBy.set(i,ent);
}
function disposeEnt(e){
 /* yapıya özgü (paylaşılmayan) geometri ve malzemeler: alev grubu, fırın parıltısı */
 for(const ob of e.own)ob.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)n.material.dispose()});
}
function removeStruct(i){
 const e=placedBy.get(i);if(!e)return;
 for(const ob of e.objs)placedGroup.remove(ob);
 if(e.flame){const k=flames.indexOf(e.flame);if(k>=0)flames.splice(k,1)}
 if(e.fire){const k=sc.fires.indexOf(e.fire);if(k>=0)sc.fires.splice(k,1)}
 disposeEnt(e);placedBy.delete(i);placedCells.delete(i);
}
function syncObjects(G){
 if(placedGroup){sc.scene.remove(placedGroup)}
 placedGroup=new THREE.Group();sc.scene.add(placedGroup);
 if(stagedGroup)sc.scene.remove(stagedGroup);
 stagedGroup=new THREE.Group();sc.scene.add(stagedGroup);staged.clear();
 for(const e of placedBy.values())disposeEnt(e);
 inst.clear();placedCells.clear();placedBy.clear();sc.fires.length=0;flames=[];
 for(const c of chunks.values())c.cnt=0;
 const q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s3=new THREE.Vector3(),m=new THREE.Matrix4();
 /* doğa nesnesi örneği: hideAll=true ise gizli olarak ayrılır (yeniden büyüme için hazır bekler) */
 const putInst=(i,x,z,o,hideAll)=>{
  const gy=S.groundY(x+.5,z+.5),hh=hash(x,z,21),h2=hash(x,z,22),h3=hash(x,z,23);
  const key=o===O.TREE?(hh<.5?'treeA':'treeB'):KEYOF[o];
  if(!key)return false;
  const sc2=(o===O.TREE?.8+h2*.4:o===O.PALM||o===O.PALM0?.9+h2*.3:.9+h2*.3);
  p.set(x+.5+(hh-.5)*.2,gy-.04,z+.5+(h2-.5)*.2);e.set((h3-.5)*.05,hh*6.28,(h2-.5)*.05);q.setFromEuler(e);s3.set(sc2,sc2*(o===O.TREE?1:.95),sc2);
  m.compose(p,q,s3);
  const mk=(k,hide)=>{
   const ch=chunks.get(chunkKey(k,x,z));if(!ch)return null;
   const idx=ch.cnt++;
   if(idx>=ch.n){ch.cnt--;return null}
   const t=tintFor(k,hh,h2,h3),mm=hide?ZERO:m;
   ch.mesh.setMatrixAt(idx,mm);ch.mesh.setColorAt(idx,t);
   if(ch.lo){ch.lo.setMatrixAt(idx,mm);ch.lo.setColorAt(idx,t)}
   return {mesh:ch.mesh,lo:ch.lo,idx,mat:m.clone(),tint:[t.r,t.g,t.b],key:k};
  };
  const r=mk(key,hideAll);if(!r)return true;
  const ak=ALT[key];if(ak){const r2=mk(ak,true);if(r2){r.alt=r2;r2.alt=r}}
  inst.set(i,r);
  return true;
 };
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const i=z*W+x,o=G.obj[i];if(!o)continue;
  if(putInst(i,x,z,o,false))continue;
  if(STRUCT.has(o))buildStruct(G,i);
 }
 /* kesilmiş, yeniden büyümeyi bekleyen kareler: gizli örnek hazır tutulur (kayıt yüklemesinden sonra da artımlı güncelleme yeter) */
 for(const t of G.timers||[]){
  if(!t||t.from!==O.NONE||G.obj[t.i]||inst.has(t.i)||placedBy.has(t.i))continue;
  if(t.to===O.TREE||KEYOF[t.to]){const x=t.i%W;putInst(t.i,x,(t.i-x)/W,t.to,true)}
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
 const mat=(ORE[key]?matOre:matRock).clone();mat.color.setRGB(r.tint[0],r.tint[1],r.tint[2]);sc.mats.push(mat);
 const mesh=new THREE.Mesh(sc.MODEL[key+'_s'+st],mat);mesh.matrixAutoUpdate=false;mesh.matrix.copy(r.mat);mesh.castShadow=true;mesh.receiveShadow=true;
 stagedGroup.add(mesh);staged.set(i,{mesh,stage:st});
}
S.setDamage=(i,f)=>applyDamage(i,f,HG.G);
/* Artımlı senkron: yalnızca değişen karelerin örnekleri gizlenir/geri gösterilir (tam senkron yüzlerce ms sürer).
   Yapılar (ateş, duvar, kapı…) tek tek eklenir/kaldırılır; yeni doğa nesnesi türü gerekiyorsa false döner ve çağıran tam senkrona geçer. */
S.syncCells=(G,cells)=>{
 if(!placedGroup||!chunks.size)return false;
 const ops=[];
 const st=new Set();                                  /* yerleştirilen yapıların değişen kareleri */
 for(const i of cells){
  const o=G.obj[i],r=inst.get(i);
  if(STRUCT.has(o)){if(r)ops.push([i,r,null]);st.add(i);continue}       /* yeni/değişen yapı (kademe yükseltme dahil) */
  if(placedBy.has(i)){if(o)return false;st.add(i);continue}             /* yapı kalktı; yerine doğa nesnesi gelirse tam senkron */
  if(!o){if(r)ops.push([i,r,null]);continue}
  const key=o===O.TREE?(r&&(r.key==='treeA'||r.key==='treeB')?r.key:null):KEYOF[o];
  if(!key||!r)return false;
  if(r.key===key)ops.push([i,null,r]);
  else if(r.alt&&r.alt.key===key)ops.push([i,r,r.alt]);       /* meyveli ↔ meyvesiz çalı, palmiye */
  else return false;
 }
 const setM=(r,mm)=>{r.mesh.setMatrixAt(r.idx,mm);r.mesh.instanceMatrix.needsUpdate=true;if(r.lo){r.lo.setMatrixAt(r.idx,mm);r.lo.instanceMatrix.needsUpdate=true}};
 for(const [i,hide,show] of ops){
  const cur=staged.get(i);
  if(cur){stagedGroup.remove(cur.mesh);cur.mesh.material.dispose();staged.delete(i)}
  if(hide)setM(hide,ZERO);
  if(show){setM(show,show.mat);inst.set(i,show)}
  if(wobIdx===i)wobIdx=-1;
 }
 if(st.size){
  /* yönü komşulara bağlı yapılar (ince duvar, kapı) yeniden kurulur: yeni duvar komşusunun doğrultusunu değiştirebilir */
  const redo=new Set(st);
  for(const i of st)for(const n of [i-1,i+1,i-W,i+W]){const e=placedBy.get(n);if(e&&NBR.has(e.o))redo.add(n)}
  for(const i of redo){removeStruct(i);if(STRUCT.has(G.obj[i]))buildStruct(G,i)}
 }
 return true;
};
S.onBuild(buildInstances);
S.onSync(syncObjects);
const fr=new THREE.Frustum(),pm=new THREE.Matrix4(),pp=new THREE.Vector3();
S.onFrame((G,t,dt,info)=>{
 windU.uTime.value=t;
 /* parça görünürlüğü: görüş alanı veya gölge menzili içindekiler çizilir; uzaktakiler sade model kullanır */
 pm.multiplyMatrices(sc.cam.projectionMatrix,sc.cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
 const play=info.mode==='play',dm=((HG.cfg&&HG.cfg.dist)||100)/100,CULL=CULL_DIST*dm,LOD=LOD_DIST*Math.min(1,dm)*[.4,.55,.8,1][sc.quality|0];      /* düşük kalitede ayrıntılı model daha yakında bırakılır */pp.set(G.px||0,0,G.py||0);
 if(!play)pp.set(W/2,0,H/2);
 for(const c of chunks.values()){
  if(!c.mesh.count){c.mesh.visible=false;if(c.lo)c.lo.visible=false;continue}
  const d=c.box.distanceToPoint(pp);
  let vis=!play||(fr.intersectsBox(c.box)&&d<CULL)||d<34;
  if(!play)vis=true;
  const near=!play?false:d<LOD;
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
 if(wobIdx>=0&&(wobIdx!==info.hitI||info.hitT<=0)){const r=inst.get(wobIdx);if(r&&G.obj[wobIdx]&&!staged.has(wobIdx)){r.mesh.setMatrixAt(r.idx,r.mat);if(r.lo)r.lo.setMatrixAt(r.idx,r.mat);r.mesh.instanceMatrix.needsUpdate=true;if(r.lo)r.lo.instanceMatrix.needsUpdate=true}wobIdx=-1}
 if(info.hitI>=0&&info.hitT>0&&G.obj[info.hitI]&&!staged.has(info.hitI)){        /* yok edilen nesne (G.obj boş) yeniden gösterilmez */
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
