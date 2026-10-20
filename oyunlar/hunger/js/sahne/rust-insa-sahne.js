/* Hunger 3D - Rust tarzı inşa sistemi sahnesi (60. güncelleme): parça modelleri (çıta, odun, taş, metal, zırhlı),
   kapılar ve açılma animasyonu, yerleştirme gölgesi (yeşil/sarı/kırmızı), çekiç vurgusu. Mantık: oyun/rust-insa.js */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,R=HG.RSD,RS=HG.RS;
const {merge,part,rbox,blob,fb3}=sc.g;
const PI=Math.PI;
const {F,FL,WL,DW,WN,HF,LW,ST,CS}=R;

/* ---- Köşe renk işlevleri ---- */
const grain=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*26,y*3,z*26,k),g2=fb3(x*8,y*1.5,z*8,k+3);c.multiplyScalar(.74+g*.34+g2*.22)};
const mortar=(row,len,k)=>(x,y,z,nx,ny,nz,c)=>{
 const r=Math.round(y/row),on=Math.abs(y-r*row)<.025,off=(r&1)?len/2:0,u=(x+z+off)/len,uj=Math.abs(u-Math.round(u))*len<.025;
 const n=fb3(x*7,y*7,z*7,k);
 c.multiplyScalar(.78+n*.36);if(on||uj)c.multiplyScalar(.6);
};
const steel=k=>(x,y,z,nx,ny,nz,c)=>{
 const rib=(Math.round((x+z)/.1)&1)?1.1:.84,r=fb3(x*8,y*8,z*8,k+5),b=fb3(x*60,y*3,z*60,k);
 c.multiplyScalar(rib*(.84+b*.28));
 if(r>.62){const q=Math.min(1,(r-.62)*3)*.5;c.r=c.r*(1-q)+.42*q;c.g=c.g*(1-q)+.2*q;c.b=c.b*(1-q)+.1*q}
};
const armor=k=>(x,y,z,nx,ny,nz,c)=>{
 const sx=Math.abs(x-Math.round(x/1)*1)<.025,sy=Math.abs(y-Math.round(y/1)*1)<.025,sz=Math.abs(z-Math.round(z/1)*1)<.025;
 const n=fb3(x*9,y*9,z*9,k);
 c.multiplyScalar(.8+n*.3);if(sx||sy||sz)c.multiplyScalar(.55);
};
const TC=[0xa88a5c,0x9a6b3c,0x8f8f98,0x7e858c,0x3e444b];
const PC=[0x9a6b3c,0x8e6035,0xa87a4c];
const SC=[0xa88a5c,0x947646,0xb39766,0x9b7f50];

/* Bölmeli kutu: köşe renkleri sık örgüyle okunur (0,1 m) */
const dbox=(w,h,d,cell)=>{
 cell=cell||.1;
 return new THREE.BoxGeometry(w,h,d,Math.max(1,Math.round(w/cell)),Math.max(1,Math.round(h/cell)),Math.max(1,Math.round(d/cell)));
};
const rnd=(k)=>{const v=Math.sin(k*127.1+311.7)*43758.5453;return v-Math.floor(v)};

/* Bir kutuyu seviyeye göre kaplar. mod: w duvar · f zemin · t basamak */
function skin(tr,b,seed,mode){
 const w=b[3]-b[0],h=b[4]-b[1],d=b[5]-b[2],cx=(b[0]+b[3])/2,cy=(b[1]+b[4])/2,cz=(b[2]+b[5])/2,o=[];
 const add=(g,c,x,y,z,cf,jit)=>{const p=part(g,c,x,y,z,1,1,1,0,0,0,jit===undefined?.08:jit);if(cf)p.cf=cf;o.push(p);return p};
 if(tr===0){
  add(rbox(w*.98,h*.94,d*.4,.2,1),0x5b4326,cx,cy,cz,null,.05);
  if(mode==='w'){
   const n=Math.max(2,Math.round(w/.17));
   for(let k=0;k<n;k++){
    const hh=h*(.93+rnd(seed+k)*.07),x=b[0]+(k+.5)*w/n;
    const p=part(rbox(.085,hh,d*.85,.45,1),SC[k&3],x,b[1]+hh/2,cz,1,1,1,0,0,(rnd(seed+k*3)-.5)*.05,.1);p.cf=grain(seed+k);o.push(p);
   }
   for(const f of [.16,.5,.84])add(rbox(w*.99,.07,d*1.15,.4,1),0x8a6c40,cx,b[1]+h*f,cz,grain(seed+90));
  }else if(mode==='t'){
   for(let k=0;k<3;k++)add(rbox(w*.98,h*.8,.2,.4,1),SC[k],cx,cy+.02,b[2]+(k+.5)*d/3,grain(seed+k));
  }else{
   const n=Math.max(3,Math.round(d/.2));
   for(let k=0;k<n;k++)add(rbox(w*(.97+rnd(seed+k)*.03),h*.55,d/n*.8,.45,1),SC[k&3],cx,b[4]-h*.28,b[2]+(k+.5)*d/n,grain(seed+k));
   for(const f of [.2,.8])add(rbox(.1,h*.5,d*.99,.4,1),0x6b5030,b[0]+w*f,b[1]+h*.25,cz,grain(seed+70));
  }
  return o;
 }
 if(tr===1){
  if(mode==='w'){
   const n=Math.max(1,Math.round(w/.3)),pw=w/n;
   for(let k=0;k<n;k++){
    const hh=h*(.985+rnd(seed+k)*.015);
    add(rbox(pw-.025,hh,d,.22,1),PC[k%3],b[0]+(k+.5)*pw,b[1]+hh/2,cz,grain(seed+k));
   }
   if(h>1.2)for(const f of [.2,.8])add(rbox(w*.97,.13,d+.05,.3,1),0x77512d,cx,b[1]+h*f,cz,grain(seed+50));
  }else if(mode==='t'){
   add(rbox(w,h,d-.02,.25,1),PC[seed%3],cx,cy,cz,grain(seed));
  }else{
   const n=Math.max(2,Math.round(d/.38)),pd=d/n;
   for(let k=0;k<n;k++)add(rbox(w,h,pd-.025,.25,1),PC[k%3],cx,cy,b[2]+(k+.5)*pd,grain(seed+k));
  }
  return o;
 }
 const cf=tr===2?mortar(.2,.5,seed):tr===3?steel(seed):armor(seed);
 const g=dbox(w,h,d,mode==='t'?.125:.1);
 add(g,TC[tr],cx,cy,cz,cf,tr===2?.1:.05);
 if(tr===2&&mode==='w'&&h>1.2)add(rbox(w*1.01,.08,d+.06,.3,1),0xa2a2aa,cx,b[4]+.02,cz,grain(seed+5));
 if(tr===3&&mode==='w'&&h>1.2)for(const f of [.04,.96])add(rbox(w,.07,d+.05,.3,1),0x474c53,cx,b[1]+h*f,cz,grain(seed+6));
 if(tr===4){
  const rv=(x,y,z,s)=>add(blob(.03,0,0,3),0xaab1b8,x,y,z,null,0);
  if(mode==='w'&&h>1.2){
   const nx=Math.max(1,Math.round(w/.5)),ny=Math.max(1,Math.round(h/.5));
   for(let a=0;a<nx;a++)for(const f of [.1,.9])for(const s of [-1,1])rv(b[0]+(a+.5)*w/nx,b[1]+h*f,cz+s*(d/2+.005));
   void ny;
   add(rbox(w*1.0,.1,d+.07,.3,1),0x2b2f34,cx,b[4]-.05,cz,null,.05);
   add(rbox(w*1.0,.1,d+.07,.3,1),0x2b2f34,cx,b[1]+.05,cz,null,.05);
  }else if(mode==='f'){
   for(const x of [-1.3,0,1.3])for(const z of [-1.3,0,1.3])rv(cx+x*w/3*0.98,b[4]+.005,cz+z*d/3*.98);
  }
 }
 return o;
}

/* ---- Parça geometrileri (önbellekli) ---- */
const GEO=new Map();
function stairsGeo(tr){
 const parts=[],n=12,rise=3/n,run=3/n;
 for(let k=0;k<n;k++){
  const x0=-1.5+k*run,top=(k+1)*rise;
  const tb=[x0,top-.14,-1.5,x0+run,top,1.5];
  for(const p of skin(tr,tb,400+k,'t'))parts.push(p);
  const c=part(rbox(run*.98,top-.14,2.9,.1,1),tr===0?0x5b4326:tr===1?0x6f4a28:tr===2?0x70707a:tr===3?0x5d646b:0x2a2e33,x0+run/2,(top-.14)/2,0,1,1,1,0,0,0,.05);
  parts.push(c);
 }
 return merge(parts,{ao:.86,jit:.06});
}
function geoFor(kind,tr){
 const key=kind+'_'+tr;let g=GEO.get(key);if(g)return g;
 let parts=[];
 if(kind==='found'){
  parts=skin(tr,[-1.5,-.35,-1.5,1.5,0,1.5],11,'f');
 }else if(kind==='floor'){
  parts=skin(tr,[-1.5,-.25,-1.5,1.5,0,1.5],21,'f');
  parts.push(part(rbox(2.9,.18,.18,.3,1),0x4e3a22,0,-.34,-1.2,1,1,1,0,0,0,.05),part(rbox(2.9,.18,.18,.3,1),0x4e3a22,0,-.34,1.2,1,1,1,0,0,0,.05));
 }else if(kind==='stairs'){
  g=stairsGeo(tr);GEO.set(key,g);return g;
 }else{
  R.shape(+kind).forEach((b,k)=>{for(const p of skin(tr,b,31+(+kind)*7+k,'w'))parts.push(p)});
 }
 g=merge(parts,{ao:kind==='found'||kind==='floor'?.9:.84,jit:.06});
 GEO.set(key,g);return g;
}
let skirtGeo=null;
const skirtMat=new Map();
function doorGeo(dt){
 const key='d'+dt;let g=GEO.get(key);if(g)return g;
 const o=[],W_=1.36,H_=2.08,T_=.08,add=(geo,c,x,y,z,cf,jit)=>{const p=part(geo,c,x,y,z,1,1,1,0,0,0,jit===undefined?.06:jit);if(cf)p.cf=cf;o.push(p);return p};
 if(dt===1){
  const n=5,pw=W_/n;
  for(let k=0;k<n;k++)add(rbox(pw-.02,H_,T_,.2,1),PC[k%3],.02+(k+.5)*pw,H_/2,0,grain(500+k));
  for(const y of [.4,1.68])add(rbox(W_*.96,.14,T_+.04,.3,1),0x77512d,.02+W_/2,y,0,grain(520));
  add(rbox(.07,.07,.12,.4,1),0x2b2b30,1.2,1.0,.05,null,0);
 }else if(dt===2){
  add(dbox(W_,H_,T_,.1),0x7e858c,.02+W_/2,H_/2,0,steel(540));
  for(const y of [.05,H_-.05])add(rbox(W_,.1,T_+.04,.3,1),0x474c53,.02+W_/2,y,0,grain(541));
  add(new THREE.TorusGeometry(.09,.02,6,12),0xb8bec6,1.15,1.0,.07,null,0);
 }else{
  add(dbox(W_,H_,T_+.02,.1),0x3e444b,.02+W_/2,H_/2,0,armor(560));
  for(const y of [.05,H_/2,H_-.05])add(rbox(W_,.1,T_+.06,.3,1),0x2b2f34,.02+W_/2,y,0,null,.04);
  for(const x of [.15,.55,.95,1.25])for(const y of [.3,.75,1.4,1.8])add(blob(.03,0,0,3),0xaab1b8,x,y,.06,null,0);
  add(rbox(.2,.28,.1,.3,1),0x1d2024,1.15,1.0,.07,null,.03);
  add(blob(.045,0,0,3),0xe6c24a,1.15,1.0,.12,null,0);
 }
 g=merge(o,{ao:.88,jit:.05});GEO.set(key,g);return g;
}

/* ---- Sahne nesneleri ---- */
let grp=null,gmat=null,ghostG=null,ghostSig='',ents=new Map(),lastVer=-1,doorAng=new Map(),skirt=null;
const kindOf=p=>p.t===F?'found':p.t===FL?'floor':p.t===ST?'stairs':String(p.t);

function place(g,p){
 if(p.t===F||p.t===FL){g.position.set(p.i*CS+CS/2,p.y,p.j*CS+CS/2);g.rotation.y=0}
 else if(p.t===ST){g.position.set(p.i*CS+CS/2,p.y,p.j*CS+CS/2);g.rotation.y=[0,-PI/2,PI,PI/2][p.d]}
 else{const [x,z]=R.origin(p);g.position.set(x,p.y,z);g.rotation.y=p.d===0?0:-PI/2}
 /* dik kenarlar köşede üst yüzeyleri çakışmasın diye çok az alçak çizilir */
 g.scale.set(1,p.d===1&&p.t>=WL&&p.t<=LW?.997:1,1);
}
function makeEnt(p,mat,ghost){
 const g=new THREE.Group();
 const m=new THREE.Mesh(geoFor(kindOf(p),p.tr),mat);
 m.castShadow=!ghost;m.receiveShadow=!ghost;g.add(m);
 if(p.t===F&&p.sk&&!ghost){
  if(!skirtGeo)skirtGeo=merge([part(dbox(3,1,3,.5),0x6f6256,0,-.5,0,1,1,1,0,0,0,.1)],{ao:.7,jit:.1});
  const s=new THREE.Mesh(skirtGeo,mat);s.scale.y=Math.max(.2,p.sk-.35);s.position.y=-.35;s.castShadow=false;s.receiveShadow=true;g.add(s);
 }
 let door=null;
 if(p.t===DW&&p.dt&&!ghost){
  const pv=new THREE.Group(),dm=new THREE.Mesh(doorGeo(p.dt),mat);dm.castShadow=true;dm.receiveShadow=true;pv.add(dm);
  const hx=p.fl?.7:-.7;pv.position.set(hx,0,0);if(p.fl)pv.scale.x=-1;
  g.add(pv);door={pv,target:p.dop?-1.5:0,ang:doorAng.has(p.id)?doorAng.get(p.id):(p.dop?-1.5:0)};
  pv.rotation.y=door.ang;
 }
 place(g,p);
 return {g,door,ver:p.ver,p};
}
function removeEnt(e){grp.remove(e.g)}
function syncMeshes(){
 if(RS.ver===lastVer)return;
 lastVer=RS.ver;
 const parts=R.parts(),alive=new Set(),mat=sc.MODEL.matPlain;
 for(const p of parts){
  alive.add(p.id);
  let e=ents.get(p.id);
  if(e&&e.ver===p.ver&&e.p===p){place(e.g,p);continue}
  if(e){if(e.door)doorAng.set(p.id,e.door.ang);removeEnt(e)}
  e=makeEnt(p,mat,false);grp.add(e.g);ents.set(p.id,e);
 }
 for(const [id,e] of ents)if(!alive.has(id)){removeEnt(e);ents.delete(id);doorAng.delete(id)}
}
function hideGhost(){if(ghostG)ghostG.visible=false}
function updateGhost(t){
 const g=RS.ghost;
 if(!g||!(g.mode==='plan'||g.mode==='hammer'||g.mode==='door')){hideGhost();return}
 let proxy,sig,col;
 if(g.mode==='plan'){
  proxy={t:g.t,tr:0,l:g.l,i:g.i,j:g.j,d:g.d,y:g.y,dt:0,dop:0,fl:0,id:-1};
  sig='p'+g.t;
  col=!g.ok?(g.warn?0xe0c050:0xe07b73):(g.t!==F&&g.stab<.4?0xe0c050:0x7be07b);
 }else{
  proxy=Object.assign({},g.piece,{dt:0,dop:0});
  sig='h'+g.piece.id+'_'+g.piece.ver+'_'+g.piece.d;
  col=g.mode==='door'?(g.ok?0x7be07b:0xe07b73):0x7bb8e0;
 }
 if(sig!==ghostSig||!ghostG){
  if(ghostG)grp.remove(ghostG);
  const e=makeEnt(proxy,gmat,true);ghostG=e.g;ghostG.renderOrder=11;ghostG.traverse(o=>{o.renderOrder=11;o.frustumCulled=false});
  grp.add(ghostG);ghostSig=sig;
 }
 place(ghostG,proxy);
 if(g.mode!=='plan')ghostG.scale.multiplyScalar(1.012);
 ghostG.visible=true;
 gmat.color.setHex(col);gmat.opacity=.36+Math.sin(t*5)*.07;
}

RS.meshCount=()=>ents.size;
S.onInit(()=>{
 grp=new THREE.Group();sc.scene.add(grp);
 gmat=new THREE.MeshBasicMaterial({color:0x7be07b,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide});
});
S.onFrame((G,t,dt,info)=>{
 if(!grp)return;
 syncMeshes();
 for(const e of ents.values())if(e.door){
  const d=e.door,tg=e.p.dop?-1.5:0;
  if(Math.abs(d.ang-tg)>.002){d.ang+=(tg-d.ang)*Math.min(1,dt*7);d.pv.rotation.y=d.ang}
 }
 if(info.mode==='play')updateGhost(t);else hideGhost();
});
})();
