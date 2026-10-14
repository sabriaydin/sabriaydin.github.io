/* Hunger 3D - three.js sahnesi: arazi, nesneler, karakter, gece-gündüz ışığı */
(()=>{
'use strict';
const {W,H,T,O,hash,clamp,smooth}=HG;
const S=HG.Scene={};
let R,scene,cam,sun,moon,hemi,lantern,stars,terrain,water,player,marker,ghost,mode='menu';
let fpsAcc=0,fpsN=0,quality=2;
let VH=null,inst=new Map(),meshes={},placedGroup=null,fires=[],fireLights=[],flames=[],pool=[];
let yaw=0,pitch=1.0,dist=13,tdist=13,camPos=new THREE.Vector3(),camInit=false,wobIdx=-1;
const TH=[-1.3,-.5,.05,.14,.32,-.5],WY=-.16;
const col=c=>new THREE.Color(c);
const mat=(extra)=>new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,roughness:.92,metalness:0},extra||{}));

/* --- geometri yardımcıları --- */
const M4=(x,y,z,sx,sy,sz,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy||1,sz||1));
const part=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz)=>({geo,c,m:M4(x,y,z,sx,sy,sz,rx,ry,rz)});
const alongPart=(geo,c,from,dir,len,sx,sz)=>{
 const d=dir.clone().normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d),p=from.clone().addScaledVector(d,len/2);
 return {geo,c,m:new THREE.Matrix4().compose(p,q,new THREE.Vector3(sx||1,1,sz||1))};
};
function merge(parts){
 const pos=[],nor=[],cl=[];
 for(const p of parts){
  const g=(p.geo.index?p.geo.toNonIndexed():p.geo.clone());g.applyMatrix4(p.m);
  const pa=g.attributes.position,na=g.attributes.normal,c=col(p.c);
  for(let i=0;i<pa.count;i++){pos.push(pa.getX(i),pa.getY(i),pa.getZ(i));nor.push(na.getX(i),na.getY(i),na.getZ(i));cl.push(c.r,c.g,c.b)}
  g.dispose();
 }
 const o=new THREE.BufferGeometry();
 o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 o.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
 return o;
}
const cyl=(a,b,h,n)=>new THREE.CylinderGeometry(a,b,h,n||6),cone=(r,h,n)=>new THREE.ConeGeometry(r,h,n||6),ico=(r)=>new THREE.IcosahedronGeometry(r,0),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);

/* --- nesne modelleri --- */
const MODEL={};
function buildModels(){
 MODEL.treeA=merge([
  part(cyl(.12,.17,1,6),0x6b4423,0,.5,0),
  part(cone(.75,1.1,7),0x2a6a2b,0,1.4,0),part(cone(.6,1,7),0x327a33,0,2,0),part(cone(.4,.9,7),0x3d8c3a,0,2.55,0)
 ]);
 MODEL.treeB=merge([
  part(cyl(.13,.18,1.2,6),0x6f4a28,0,.6,0),
  part(ico(.78),0x3a7d34,0,1.7,0,1,.88,1),part(ico(.55),0x4a9340,.35,1.35,.12),part(ico(.5),0x2f6e2d,-.3,1.5,-.25),part(ico(.4),0x58a04b,.05,2.2,.05)
 ]);
 const fr=[];
 const top=new THREE.Vector3(.38,2.25,0);
 const trunk=[];
 for(let i=0;i<5;i++)trunk.push(part(cyl(.1-i*.005,.13-i*.005,.55,6),i%2?0x8a6a3c:0x7a5a30,i*.095,.28+i*.45,0,1,1,1,0,0,-.17));
 const mkPalm=(nuts)=>{
  const ps=trunk.slice();
  for(let i=0;i<7;i++){
   const a=i/7*Math.PI*2,d=new THREE.Vector3(Math.cos(a)*.9,-.35,Math.sin(a)*.9);
   ps.push(alongPart(cone(.3,1.5,4),i%2?0x3f8f3a:0x4aa043,top,d,1.5,1,.28));
  }
  ps.push(part(ico(.17),0x3a7a33,top.x,top.y,top.z));
  if(nuts){ps.push(part(ico(.12),0x5b3a1c,top.x+.14,top.y-.15,top.z+.05),part(ico(.12),0x6e4723,top.x-.1,top.y-.17,top.z+.1),part(ico(.12),0x4c2f16,top.x,top.y-.18,top.z-.14))}
  return merge(ps);
 };
 MODEL.palm=mkPalm(true);MODEL.palm0=mkPalm(false);
 const rockP=(c1,c2)=>[part(ico(.5),c1,0,.3,0,1,.72,.9,.3,.5,0),part(ico(.3),c2,.28,.18,.15,1,.8,1),part(ico(.22),c2,-.3,.14,-.1)];
 MODEL.rock=merge(rockP(0x8d8d92,0x77777c));
 const ore=(c)=>merge(rockP(0x5f5f68,0x4c4c55).concat([part(ico(.13),c,.22,.5,.2),part(ico(.11),c,-.15,.45,.3),part(ico(.14),c,.05,.6,-.15),part(ico(.1),c,.38,.28,-.2),part(ico(.1),c,-.38,.22,.18)]));
 MODEL.coal=ore(0x16161b);MODEL.copper=ore(0xc8743a);MODEL.iron=ore(0xc2a287);
 const bush=(b)=>{
  const ps=[part(ico(.45),0x2f7a30,0,.34,0,1,.8,1),part(ico(.33),0x3f9140,.22,.42,.08),part(ico(.28),0x2a6a2b,-.25,.3,-.1)];
  if(b)for(const [x,y,z] of [[.28,.4,.3],[-.2,.5,.3],[.1,.62,-.1],[.4,.3,-.12],[-.38,.3,.12],[0,.35,.45]])ps.push(part(ico(.07),0xc42d3a,x,y,z));
  return merge(ps);
 };
 MODEL.bush=bush(true);MODEL.bush0=bush(false);
 /* yerleştirilen yapılar */
 MODEL.fireBase=merge([
  part(cyl(.07,.07,.8,6),0x6b4423,0,.1,0,1,1,1,0,.6,Math.PI/2),part(cyl(.07,.07,.8,6),0x5a3a1e,0,.16,0,1,1,1,0,-.6,Math.PI/2),
  ...Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return part(ico(.11),i%2?0x8a8a90:0x6c6c72,Math.cos(a)*.38,.08,Math.sin(a)*.38,1,.8,1)}),
  part(cyl(.25,.25,.04,8),0x1b1008,0,.02,0)
 ]);
 MODEL.bench=merge([
  part(box(.95,.1,.6),0xb08050,0,.78,0),part(box(.95,.04,.62),0xc49058,0,.84,0),
  ...[[-.4,-.24],[.4,-.24],[-.4,.24],[.4,.24]].map(p=>part(box(.1,.75,.1),0x5a3a1e,p[0],.38,p[1])),
  part(box(.9,.05,.05),0x4a2f18,0,.25,.24),part(box(.9,.05,.05),0x4a2f18,0,.25,-.24),
  part(box(.3,.06,.08),0xbfc3c8,.2,.9,.05),part(box(.06,.16,.06),0x6b4423,.28,.92,.05),part(box(.14,.1,.1),0x77777f,-.25,.9,-.05)
 ]);
 MODEL.furn=merge([
  part(box(.92,1,.92),0x6e6e76,0,.5,0),part(box(.96,.1,.96),0x8d8d95,0,1.02,0),
  part(box(.3,.55,.3),0x66666e,.22,1.3,-.2),part(box(.34,.06,.34),0x8d8d95,.22,1.6,-.2),
  part(box(.5,.45,.1),0x14100e,0,.4,.46),
  ...[.25,.5,.75].map(y=>part(box(.94,.03,.94),0x50505a,0,y,0))
 ]);
 MODEL.wallw=merge([part(box(1,1.3,1),0xa67848,0,.65,0),part(box(1.04,.1,1.04),0x6b4727,0,.35,0),part(box(1.04,.1,1.04),0x6b4727,0,.95,0),part(box(1.04,.08,1.04),0xc08a52,0,1.3,0),
  ...[-.37,-.12,.13,.38].map(x=>part(box(.02,1.2,1.02),0x7d5530,x,.65,0))]);
 MODEL.walls=merge([part(box(1,1.3,1),0x8c8c94,0,.65,0),part(box(1.04,.08,1.04),0xa8a8b0,0,1.3,0),
  ...[.3,.65,1].map(y=>part(box(1.03,.04,1.03),0x606068,0,y,0)),part(box(.04,.35,1.03),0x606068,.2,.48,0),part(box(.04,.35,1.03),0x606068,-.25,.83,0)]);
 MODEL.door=merge([
  part(box(.12,1.3,.16),0x4a2f18,-.46,.65,0),part(box(.12,1.3,.16),0x4a2f18,.46,.65,0),part(box(1.04,.12,.16),0x4a2f18,0,1.3,0),
  part(box(.82,1.18,.1),0x7a5430,0,.6,0),part(box(.7,.45,.12),0x6b4a29,0,.32,0),part(box(.7,.45,.12),0x6b4a29,0,.88,0),part(ico(.05),0xd2b24a,.28,.65,.09)
 ]);
 MODEL.matPlain=mat();
}

/* --- arazi --- */
function groundY(x,z){
 const fx=clamp(x,0,W-.001),fz=clamp(z,0,H-.001),ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz,w=W+1;
 const a=VH[iz*w+ix],b=VH[iz*w+ix+1],c=VH[(iz+1)*w+ix+1],d=VH[(iz+1)*w+ix];
 return a*(1-tx)*(1-tz)+b*tx*(1-tz)+c*tx*tz+d*(1-tx)*tz;
}
function buildTerrain(G){
 if(terrain){scene.remove(terrain);terrain.geometry.dispose()}
 if(water){scene.remove(water);water.geometry.dispose()}
 const w=W+1;VH=new Float32Array(w*(H+1));
 for(let z=0;z<=H;z++)for(let x=0;x<=W;x++){
  let s=0,n=0;
  for(let dz=-1;dz<=0;dz++)for(let dx=-1;dx<=0;dx++){const tx=x+dx,tz=z+dz;if(tx<0||tz<0||tx>=W||tz>=H)continue;s+=TH[G.tile[tz*W+tx]];n++}
  let h=s/n;if(h>-.05)h+=(hash(x,z,7)-.5)*.16;
  VH[z*w+x]=h;
 }
 const pos=new Float32Array(W*H*18),cl=new Float32Array(W*H*18);
 const cG=[col(0x4f8c3f),col(0x5a9a46),col(0x477f3a),col(0x63a24d)],cS=[col(0xdac68c),col(0xe4d29a),col(0xcfba7e)],cR=[col(0x7d7a74),col(0x6e6b66),col(0x8a867f)],
       cSh=col(0xc9b87c),cDp=col(0x2d4a5a),cP=col(0x6a7a5a);
 const wp=[],wc=[];
 const wcol={0:col(0x1a4e7c),1:col(0x3f9fc8),5:col(0x58b8cc)};
 let k=0;
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const t=G.tile[z*W+x],hh=hash(x,z,3);
  let c;
  if(t===T.GRASS)c=cG[(hh*4)|0];else if(t===T.SAND)c=cS[(hh*3)|0];else if(t===T.ROCK)c=cR[(hh*3)|0];
  else c=t===T.SHAL?cSh:t===T.DEEP?cDp:cP;
  const A=VH[z*w+x],B=VH[z*w+x+1],C=VH[(z+1)*w+x+1],D=VH[(z+1)*w+x];
  const v=[x,A,z, x,D,z+1, x+1,B,z, x+1,B,z, x,D,z+1, x+1,C,z+1];
  for(let i=0;i<18;i+=3){pos[k]=v[i];pos[k+1]=v[i+1];pos[k+2]=v[i+2];const sh=.94+hash(x*3+i,z,11)*.12;cl[k]=c.r*sh;cl[k+1]=c.g*sh;cl[k+2]=c.b*sh;k+=3}
  if(t<=T.SHAL||t===T.POND){
   const wc2=wcol[t];
   wp.push(x,WY,z, x,WY,z+1, x+1,WY,z, x+1,WY,z, x,WY,z+1, x+1,WY,z+1);
   for(let i=0;i<6;i++)wc.push(wc2.r,wc2.g,wc2.b);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));g.computeVertexNormals();
 terrain=new THREE.Mesh(g,mat());terrain.receiveShadow=true;scene.add(terrain);
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(wc,3));wg.computeVertexNormals();
 water=new THREE.Mesh(wg,mat({transparent:true,opacity:.78,roughness:.25,metalness:.1,depthWrite:false}));water.renderOrder=1;water.receiveShadow=true;scene.add(water);
}

/* --- nesne örnekleri --- */
const INSTKEYS=['treeA','treeB','palm','palm0','rock','coal','copper','iron','bush','bush0'];
function buildInstances(G){
 for(const k in meshes){scene.remove(meshes[k]);meshes[k].dispose&&meshes[k].dispose()}
 meshes={};
 let nT=0,nP=0,nB=0,nR=0,nC=0,nCu=0,nI=0;
 for(let i=0;i<W*H;i++){const o=G.obj[i];if(o===O.TREE)nT++;else if(o===O.PALM||o===O.PALM0)nP++;else if(o===O.BUSH||o===O.BUSH0)nB++;else if(o===O.ROCK)nR++;else if(o===O.COAL)nC++;else if(o===O.COPPER)nCu++;else if(o===O.IRON)nI++}
 const cap={treeA:nT,treeB:nT,palm:nP,palm0:nP,rock:nR,coal:nC,copper:nCu,iron:nI,bush:nB,bush0:nB};
 const m=mat();
 for(const k of INSTKEYS){
  const im=new THREE.InstancedMesh(MODEL[k],m,Math.max(1,cap[k]));im.count=0;im.castShadow=true;im.receiveShadow=false;im.frustumCulled=false;
  scene.add(im);meshes[k]=im;
 }
}
const KEYOF={[O.PALM]:'palm',[O.PALM0]:'palm0',[O.ROCK]:'rock',[O.COAL]:'coal',[O.COPPER]:'copper',[O.IRON]:'iron',[O.BUSH]:'bush',[O.BUSH0]:'bush0'};
function flameGroup(){
 const g=new THREE.Group();
 const m1=new THREE.MeshBasicMaterial({color:0xe8541c}),m2=new THREE.MeshBasicMaterial({color:0xf6a623}),m3=new THREE.MeshBasicMaterial({color:0xffe08a});
 const a=new THREE.Mesh(cone(.22,.7,6),m1);a.position.y=.45;const b=new THREE.Mesh(cone(.15,.55,6),m2);b.position.y=.4;const c=new THREE.Mesh(cone(.09,.35,6),m3);c.position.y=.3;
 g.add(a,b,c);return g;
}
S.sync=(G)=>{
 if(placedGroup){scene.remove(placedGroup)}
 placedGroup=new THREE.Group();scene.add(placedGroup);
 inst.clear();fires=[];flames=[];
 const cnt={};for(const k of INSTKEYS)cnt[k]=0;
 const m=new THREE.Matrix4();
 const plm=MODEL.matPlain;
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const i=z*W+x,o=G.obj[i];if(!o)continue;
  const gy=groundY(x+.5,z+.5),hh=hash(x,z,21),h2=hash(x,z,22);
  let key=null;
  if(o===O.TREE)key=hh<.5?'treeA':'treeB';else key=KEYOF[o];
  if(key){
   const mesh=meshes[key],idx=cnt[key]++;
   if(idx>=mesh.instanceMatrix.count){cnt[key]--;continue}
   const sc=(o===O.TREE?.75+h2*.4:.9+h2*.3);
   m.compose(new THREE.Vector3(x+.5+(hh-.5)*.2,gy,z+.5+(h2-.5)*.2),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,hh*6.28,0)),new THREE.Vector3(sc,sc*(o===O.TREE?1:.95),sc));
   mesh.setMatrixAt(idx,m);inst.set(i,{mesh,idx,mat:m.clone()});
   continue;
  }
  let geo=null;
  if(o===O.FIRE)geo=MODEL.fireBase;else if(o===O.BENCH)geo=MODEL.bench;else if(o===O.FURN)geo=MODEL.furn;
  else if(o===O.WALLW)geo=MODEL.wallw;else if(o===O.WALLS)geo=MODEL.walls;else if(o===O.DOOR)geo=MODEL.door;
  if(!geo)continue;
  const me=new THREE.Mesh(geo,plm);me.position.set(x+.5,gy,z+.5);me.castShadow=true;me.receiveShadow=true;
  if(o===O.DOOR){const isW=c=>{const q=G.obj[c];return q===O.WALLW||q===O.WALLS};const alongX=(x>0&&isW(i-1))||(x<W-1&&isW(i+1));me.rotation.y=alongX?0:Math.PI/2}
  if(o===O.BENCH||o===O.FURN)me.rotation.y=(hh<.5?0:Math.PI)*0+0;
  placedGroup.add(me);
  if(o===O.FIRE){const f=flameGroup();f.position.set(x+.5,gy+.05,z+.5);placedGroup.add(f);fires.push({x:x+.5,z:z+.5,y:gy});flames.push({g:f,ph:hh*10})}
  if(o===O.FURN){const gl=new THREE.Mesh(box(.42,.3,.04),new THREE.MeshBasicMaterial({color:0xff7a1a}));gl.position.set(x+.5,gy+.4,z+.5+.49);placedGroup.add(gl)}
 }
 for(const k of INSTKEYS){const mesh=meshes[k];mesh.count=cnt[k];mesh.instanceMatrix.needsUpdate=true}
 wobIdx=-1;
};

/* --- oyuncu --- */
let pl={};
function pmat(c){return new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:.85})}
function pbox(w,h,d,c,x,y,z,parent){const m=new THREE.Mesh(box(w,h,d),pmat(c));m.position.set(x,y,z);m.castShadow=true;(parent||pl.root).add(m);return m}
function buildPlayer(){
 const root=new THREE.Group();pl={root};
 pbox(.52,.62,.3,0xa82e27,0,1.08,0,root);pbox(.54,.16,.32,0x7d201b,0,.82,0,root);
 pbox(.34,.34,.34,0xe0b48a,0,1.6,0,root);pbox(.37,.13,.37,0x3a2a1c,0,1.8,0,root);pbox(.37,.3,.1,0x3a2a1c,0,1.66,-.15,root);
 pbox(.06,.06,.03,0x14110e,-.08,1.62,.18,root);pbox(.06,.06,.03,0x14110e,.08,1.62,.18,root);
 const leg=(x)=>{const g=new THREE.Group();g.position.set(x,.76,0);root.add(g);pbox(.21,.66,.23,0x262a3d,0,-.33,0,g);pbox(.22,.1,.27,0x15161f,0,-.64,.02,g);return g};
 pl.lL=leg(-.14);pl.lR=leg(.14);
 const arm=(x)=>{const g=new THREE.Group();g.position.set(x,1.34,0);root.add(g);pbox(.15,.58,.15,0xe0b48a,0,-.26,0,g);pbox(.16,.18,.16,0xa82e27,0,-.02,0,g);return g};
 pl.aL=arm(-.35);pl.aR=arm(.35);
 pl.hand=new THREE.Group();pl.hand.position.set(0,-.58,.05);pl.aR.add(pl.hand);
 pl.heldId='__';
 root.traverse(o=>{if(o.isMesh)o.castShadow=true});
 return root;
}
const heldCache={};
function heldModel(id){
 if(heldCache[id]!==undefined)return heldCache[id];
 const it=HG.IT[id],g=new THREE.Group();
 const add=(geo,c,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,pmat(c));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;g.add(m)};
 const tc=[0,0x8d8d92,0xc8743a,0xc3c9d0];
 if(it.tool==='axe'){add(cyl(.03,.035,.8,5),0x8a5a30,0,.25,0);add(box(.07,.2,.3),tc[it.tier],0,.6,.12)}
 else if(it.tool==='pick'){add(cyl(.03,.035,.8,5),0x8a5a30,0,.25,0);add(box(.07,.09,.62),tc[it.tier],0,.62,0);add(cone(.05,.14,4),tc[it.tier],0,.62,.36,Math.PI/2);add(cone(.05,.14,4),tc[it.tier],0,.62,-.36,-Math.PI/2)}
 else if(it.tool==='rod'){add(cyl(.015,.025,1.1,5),0x8a5a30,0,.4,.2,.5);add(cyl(.004,.004,.7,3),0xdddddd,0,.55,.7,.2)}
 else if(it.place){const c={fire:0x8a5a30,bench:0xa47544,furn:0x77777f,wallw:0xa67848,walls:0x8c8c94,door:0x6b4a29}[id];add(box(.26,.26,.26),c,0,.16,.05)}
 else{const c={wood:0x7a4f29,stone:0x8d8d92,coal:0x1a1a1f,sand:0xdac68c,copper_ore:0xc8743a,iron_ore:0xb99a80,copper_ingot:0xd9854a,iron_ingot:0xbcc2c8,berries:0xc42d3a,coconut:0x5b3a1c,fish:0x6fa0c0,cfish:0xb07a35,bottle:0xbfe6f0,wbottle:0x5fb0e0}[id]||0xcccccc;add(ico(.12),c,0,.12,.05)}
 return heldCache[id]=g;
}
function setHeld(id){
 if(pl.heldId===id)return;pl.heldId=id;
 while(pl.hand.children.length)pl.hand.remove(pl.hand.children[0]);
 if(id)pl.hand.add(heldModel(id));
}

/* --- parçacıklar --- */
function buildPool(){
 const gm=new THREE.BoxGeometry(.09,.09,.09);
 for(let i=0;i<40;i++){const m=new THREE.Mesh(gm,new THREE.MeshBasicMaterial({color:0xffffff}));m.visible=false;scene.add(m);pool.push({m,l:0,vx:0,vy:0,vz:0})}
}
S.burst=(x,y,z,c,n)=>{
 let k=0;
 for(const p of pool){if(p.l>0)continue;p.l=.6;p.m.visible=true;p.m.material.color.setHex(c);p.m.position.set(x+(Math.random()-.5)*.4,y+(Math.random()-.5)*.3,z+(Math.random()-.5)*.4);p.vx=(Math.random()-.5)*2.4;p.vy=1.6+Math.random()*2;p.vz=(Math.random()-.5)*2.4;if(++k>=n)break}
};

/* --- başlatma --- */
S.init=(canvas)=>{
 R=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();scene.background=col(0x8ec9ee);scene.fog=new THREE.Fog(0x8ec9ee,24,80);
 cam=new THREE.PerspectiveCamera(50,1,.1,400);
 hemi=new THREE.HemisphereLight(0xbfe0ff,0x3f4a2a,.6);scene.add(hemi);
 sun=new THREE.DirectionalLight(0xfff2dc,1.2);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-24;sc.right=24;sc.top=24;sc.bottom=-24;sc.near=1;sc.far=140;sun.shadow.bias=-.0007;sun.shadow.normalBias=.03;
 scene.add(sun,sun.target);
 moon=new THREE.DirectionalLight(0x6f8cff,.0);scene.add(moon,moon.target);
 lantern=new THREE.PointLight(0xffd9a0,0,7,2);scene.add(lantern);
 for(let i=0;i<3;i++){const l=new THREE.PointLight(0xff8a3c,0,13,1.6);scene.add(l);fireLights.push(l)}
 const sp=[];for(let i=0;i<500;i++){const a=Math.random()*Math.PI*2,b=Math.acos(Math.random()*.95+.02),r=170;sp.push(Math.sin(b)*Math.cos(a)*r,Math.cos(b)*r,Math.sin(b)*Math.sin(a)*r)}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
 stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));stars.frustumCulled=false;scene.add(stars);
 buildModels();
 player=buildPlayer();scene.add(player);
 marker=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.9,fog:false}));marker.visible=false;scene.add(marker);
 ghost=new THREE.Mesh(new THREE.BoxGeometry(.96,1.2,.96),new THREE.MeshBasicMaterial({color:0x7be07b,transparent:true,opacity:.35,depthWrite:false}));ghost.visible=false;scene.add(ghost);
 buildPool();
 S.resize();
};
S.build=(G)=>{buildTerrain(G);buildInstances(G);S.sync(G);camInit=false};
S.setMode=(m)=>{mode=m;camInit=false};
S.resize=()=>{const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};
S.rot=(d)=>{yaw+=d};
S.yaw=()=>yaw;
S.zoom=(d)=>{tdist=clamp(tdist+d*1.2,5,20)};
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.5),hit=new THREE.Vector3(),v2=new THREE.Vector2();
S.pick=(sx,sy)=>{
 v2.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1);ray.setFromCamera(v2,cam);
 return ray.ray.intersectPlane(plane,hit)?{x:hit.x,z:hit.z}:null;
};
S.project=(x,y,z)=>{
 const v=new THREE.Vector3(x,y,z).project(cam);
 if(v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2)return null;
 return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight};
};

/* --- her kare --- */
const lerpA=(a,b,t)=>{let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t};
const cNight=col(0x060a1a),cDay=col(0x8ec9ee),cDusk=col(0xf09050),tmp=new THREE.Color();
const wm=new THREE.Matrix4(),wq=new THREE.Quaternion(),wv=new THREE.Vector3(),ws=new THREE.Vector3();
S.render=(G,now,dt,info)=>{
 const t=now*.001,L=info.L,tod=info.tod;
 const play=info.mode==='play';
 /* gök rengi ve ışıklar */
 const ss=clamp(1-Math.abs(L-.5)*2,0,1);
 tmp.copy(cNight).lerp(cDay,L).lerp(cDusk,ss*.55);
 scene.background.copy(tmp);scene.fog.color.copy(tmp);
 scene.fog.near=play?24:60;scene.fog.far=play?80:260;
 const a=(tod-.25)*Math.PI*2,px=play?G.px:W/2,pz=play?G.py:H/2,py=play?groundY(px,pz):0;
 const off=new THREE.Vector3(Math.cos(a)*45,Math.sin(a)*45+6,22);
 sun.position.set(px+off.x,py+off.y,pz+off.z);sun.target.position.set(px,py,pz);
 sun.intensity=Math.max(0,1.25*smooth(0,.5,L))*(Math.sin(a)>-.05?1:0);
 sun.color.setHex(0xffb070).lerp(new THREE.Color(0xfff4e0),smooth(.2,.9,L));
 moon.position.set(px-off.x*.6,py+30,pz-off.z*.6);moon.target.position.set(px,py,pz);moon.intensity=.34*(1-L);
 hemi.intensity=.22+.5*L;hemi.color.setHex(0x2a3a6a).lerp(new THREE.Color(0xbfe0ff),L);
 stars.material.opacity=Math.pow(1-L,2);stars.position.copy(cam.position);
 water.position.y=Math.sin(t*1.2)*.025;
 /* alevler ve ateş ışıkları */
 for(const f of flames){const s=1+Math.sin(t*13+f.ph)*.08+Math.sin(t*7+f.ph*2)*.06;f.g.scale.set(1+Math.sin(t*9+f.ph)*.08,s*1.1,1+Math.cos(t*8+f.ph)*.08)}
 const sorted=fires.map(f=>({f,d:(f.x-px)**2+(f.z-pz)**2})).sort((p,q)=>p.d-q.d);
 for(let i=0;i<fireLights.length;i++){
  const l=fireLights[i],s=sorted[i];
  if(s&&s.d<900){l.position.set(s.f.x,s.f.y+.9,s.f.z);l.intensity=(1.2+(1-L)*2.2)*(1+Math.sin(t*12+i)*.07+Math.sin(t*5.3)*.05)}else l.intensity=0;
 }
 /* oyuncu */
 if(play){
  player.visible=true;
  const gy=groundY(G.px,G.py);player.position.set(G.px,gy,G.py);
  player.rotation.y=lerpA(player.rotation.y,Math.atan2(G.fx,G.fy),1-Math.exp(-14*dt));
  setHeld(info.held);
  const ph=G.moving?Math.sin(G.walk*10):0,amp=G.moving?.85:0;
  pl.lL.rotation.x=ph*amp;pl.lR.rotation.x=-ph*amp;pl.aL.rotation.x=-ph*amp*.8;
  if(info.act)pl.aR.rotation.x=-1.25+Math.sin(t*15)*.75;
  else pl.aR.rotation.x=info.held?-.55+ph*amp*.4:ph*amp*.8;
  pl.root.position.y=G.moving?Math.abs(ph)*.05:0;
  pl.hand.rotation.x=info.held?-.9:0;
  lantern.position.set(G.px,gy+2,G.py);lantern.intensity=.9*(1-L);
 }else{player.visible=false;lantern.intensity=0}
 /* kamera */
 dist+=(tdist-dist)*(1-Math.exp(-8*dt));
 let tgt,cpos;
 if(play){
  tgt=new THREE.Vector3(G.px,groundY(G.px,G.py)+1.1,G.py);
  const cp=Math.cos(pitch);cpos=new THREE.Vector3(tgt.x+Math.sin(yaw)*cp*dist,tgt.y+Math.sin(pitch)*dist,tgt.z+Math.cos(yaw)*cp*dist);
 }else{
  const ay=info.clock*.05,r=62;tgt=new THREE.Vector3(W/2,0,H/2);cpos=new THREE.Vector3(W/2+Math.sin(ay)*r,34,H/2+Math.cos(ay)*r);
 }
 if(!camInit){camPos.copy(cpos);camInit=true}else camPos.lerp(cpos,1-Math.exp(-(play?12:3)*dt));
 const gc=groundY(camPos.x,camPos.z);if(camPos.y<gc+.6)camPos.y=gc+.6;
 cam.position.copy(camPos);cam.lookAt(tgt);
 /* hedef işareti */
 const tg=info.target;
 if(play&&tg){
  const gy=groundY(tg.x+.5,tg.y+.5);
  marker.visible=true;marker.position.set(tg.x+.5,gy+.5,tg.y+.5);
  marker.material.opacity=tg.ok?.95:.3;marker.material.color.setHex(info.place?(info.place.ok?0x7be07b:0xe07b73):0xffffff);
  const pulse=1+Math.sin(t*6)*.015;marker.scale.set(pulse,1,pulse);
  if(info.place){ghost.visible=true;ghost.position.set(tg.x+.5,gy+.6,tg.y+.5);ghost.material.color.setHex(info.place.ok?0x7be07b:0xe07b73)}else ghost.visible=false;
 }else{marker.visible=false;ghost.visible=false}
 /* vurulan nesne sallanması */
 if(wobIdx>=0&&(wobIdx!==info.hitI||info.hitT<=0)){const r=inst.get(wobIdx);if(r){r.mesh.setMatrixAt(r.idx,r.mat);r.mesh.instanceMatrix.needsUpdate=true}wobIdx=-1}
 if(info.hitI>=0&&info.hitT>0){
  const r=inst.get(info.hitI);
  if(r){
   const amt=Math.sin(t*90)*.07*(info.hitT/.18);
   r.mat.decompose(wv,wq,ws);
   const q2=wq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(amt,0,amt*.8)));
   wm.compose(wv,q2,ws);r.mesh.setMatrixAt(r.idx,wm);r.mesh.instanceMatrix.needsUpdate=true;wobIdx=info.hitI;
  }
 }
 /* parçacıklar */
 for(const p of pool){if(p.l<=0)continue;p.l-=dt;if(p.l<=0){p.m.visible=false;continue}p.vy-=9*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt}
 R.render(scene,cam);
 /* düşük başarımda otomatik kalite düşürme */
 if(play&&dt>0){
  fpsAcc+=dt;fpsN++;
  if(fpsAcc>=3){
   const avg=fpsAcc/fpsN;fpsAcc=0;fpsN=0;
   if(avg>.045&&quality>0){
    quality--;
    if(quality===1){R.shadowMap.enabled=false;sun.castShadow=false}
    else{R.setPixelRatio(1);S.resize()}
    scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}});
   }
  }
 }
};
})();
