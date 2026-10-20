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

/* ---- Özgün dokular: her seviye için işlemsel (canvas) doku; köşe renkleri yalnızca gölge ve ton verir ---- */
const noiseCf=k=>(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.86+fb3(x*5,y*5,z*5,k)*.28)};
let seedv=7;const rr=()=>{seedv=(seedv*16807)%2147483647;return seedv/2147483647};
function drawTex(tr){
 const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');
 const R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 const dots=(n,cols,a,sz)=>{for(let k=0;k<n;k++){g.globalAlpha=a*(.4+rr()*.6);g.fillStyle=cols[(rr()*cols.length)|0];g.fillRect(rr()*N,rr()*N,sz*(.5+rr()),sz*(.5+rr()))}g.globalAlpha=1};
 seedv=11+tr*97;
 if(tr===0){                                   /* çıta: demet halinde kabuklu dallar (u boyunca) */
  R('#4a3820',0,0,N,N);
  for(let y=0;y<N;){const h=7+rr()*6;const c=['#a88a5c','#947646','#b39766','#8a6c40'][(rr()*4)|0];R(c,0,y+1,N,h-2);R('rgba(255,235,190,.22)',0,y+1,N,2);R('rgba(40,25,10,.4)',0,y+h-2,N,2);
   for(let k=0;k<5;k++){g.strokeStyle='rgba(60,40,15,.35)';g.lineWidth=1;g.beginPath();const yy=y+2+rr()*(h-4);g.moveTo(rr()*N,yy);g.lineTo(rr()*N,yy+(rr()-.5)*2);g.stroke()}
   if(rr()<.45){const kx=rr()*N;g.fillStyle='rgba(50,30,10,.55)';g.beginPath();g.ellipse(kx,y+h/2,3,h*.35,0,0,7);g.fill()}
   y+=h}
 }else if(tr===1){                             /* odun: tahta damarı (u boyunca), budaklar, çivi izleri */
  R('#7a5636',0,0,N,N);
  for(let y=0;y<N;y+=2){g.strokeStyle='rgba('+(rr()<.5?'60,35,15':'190,140,90')+','+(.1+rr()*.22)+')';g.lineWidth=1+rr();g.beginPath();g.moveTo(0,y);for(let x=0;x<=N;x+=16)g.lineTo(x,y+Math.sin(x*.07+y)*1.6);g.stroke()}
  for(let k=0;k<3;k++){const kx=rr()*N,ky=rr()*N;for(let q=4;q>0;q--){g.strokeStyle='rgba(50,28,10,'+(.18+.1*q)+')';g.lineWidth=1.4;g.beginPath();g.ellipse(kx,ky,q*3.2,q*1.5,0,0,7);g.stroke()}}
  dots(60,['#5a3a1c','#a87a4c'],.35,1.5);
  R('rgba(30,18,8,.35)',0,N-3,N,3);
 }else if(tr===2){                             /* taş: derzli tuğla/kesme taş sıraları, benekli yüzey */
  R('#4e4e56',0,0,N,N);
  const rows=4,rh=N/rows;
  for(let r=0;r<rows;r++){const off=(r&1)?N/4:0;for(let b=-1;b<3;b++){const x=b*N/2+off,w=N/2-3;const base=110+((rr()*40)|0);g.fillStyle='rgb('+base+','+base+','+(base+8)+')';g.fillRect(x+1.5,r*rh+1.5,w,rh-3);
   g.fillStyle='rgba(255,255,255,.14)';g.fillRect(x+1.5,r*rh+1.5,w,2);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x+1.5,r*rh+rh-4.5,w,2)}}
  dots(260,['#2a2a30','#c4c4cc','#6e6e78'],.4,1.8);
  for(let k=0;k<4;k++){g.strokeStyle='rgba(20,20,26,.35)';g.lineWidth=1;g.beginPath();let x=rr()*N,y=rr()*N;g.moveTo(x,y);for(let q=0;q<4;q++){x+=(rr()-.5)*14;y+=rr()*8;g.lineTo(x,y)}g.stroke()}
 }else if(tr===3){                             /* metal: oluklu sac (nervürler u boyunca), pas ve çizikler */
  R('#6a6c6e',0,0,N,N);
  for(let y=0;y<N;y+=16){const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,'#a2a5a8');gr.addColorStop(.5,'#6c6e70');gr.addColorStop(1,'#3e4042');g.fillStyle=gr;g.fillRect(0,y,N,16)}
  for(let k=0;k<26;k++){const rx=rr()*N,ry=rr()*N,rs=4+rr()*14;const gr=g.createRadialGradient(rx,ry,0,rx,ry,rs);gr.addColorStop(0,'rgba(120,58,24,.65)');gr.addColorStop(1,'rgba(120,58,24,0)');g.fillStyle=gr;g.fillRect(rx-rs,ry-rs,rs*2,rs*2)}
  for(let k=0;k<20;k++){g.strokeStyle='rgba(235,240,245,.28)';g.lineWidth=1;g.beginPath();const x=rr()*N,y=rr()*N;g.moveTo(x,y);g.lineTo(x+8+rr()*26,y+(rr()-.5)*3);g.stroke()}
  dots(80,['#2e3338','#c4cbd2'],.25,1.2);
 }else{                                        /* zırhlı: koyu çelik plakalar, perçin, çizik, sarı uyarı izi */
  R('#14171a',0,0,N,N);R('#3a4047',3,3,N-6,N-6);
  const gr=g.createLinearGradient(0,0,N,N);gr.addColorStop(0,'rgba(255,255,255,.10)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fillRect(3,3,N-6,N-6);
  R('rgba(255,255,255,.12)',3,3,N-6,2);R('rgba(0,0,0,.4)',3,N-6,N-6,3);
  for(const [x,y] of [[12,12],[N-12,12],[12,N-12],[N-12,N-12],[N/2,12],[N/2,N-12],[12,N/2],[N-12,N/2]]){g.fillStyle='#0e1012';g.beginPath();g.arc(x,y,4.4,0,7);g.fill();g.fillStyle='#8f979f';g.beginPath();g.arc(x-.4,y-.4,3.2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x-1.2,y-1.2,1,0,7);g.fill()}
  for(let k=0;k<12;k++){g.strokeStyle='rgba(215,222,230,.2)';g.lineWidth=1;g.beginPath();const x=20+rr()*88,y=20+rr()*88;g.moveTo(x,y);g.lineTo(x+rr()*24-8,y+rr()*18-9);g.stroke()}
  g.save();g.beginPath();g.rect(N/2-22,N/2-6,44,12);g.clip();for(let x=-20;x<N;x+=12){g.fillStyle='#d4a017';g.beginPath();g.moveTo(x+N/2-22,N/2+6);g.lineTo(x+N/2-22+6,N/2+6);g.lineTo(x+N/2-22+12,N/2-6);g.lineTo(x+N/2-22+6,N/2-6);g.fill()}g.restore();
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1;g.strokeRect(N/2-22,N/2-6,44,12);
  dots(90,['#0e1012','#9aa2aa'],.2,1.2);
 }
 return cv;
}
const TILE=[.5,.6,1,.5,1],SWAP=[true,true,false,true,false];
const tierMats=[];
function tierMat(tr){
 if(tierMats[tr])return tierMats[tr];
 const t=new THREE.CanvasTexture(drawTex(tr));
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
 const m=new THREE.MeshStandardMaterial({map:t,vertexColors:true,roughness:tr>=3?.52:.92,metalness:tr>=3?.35:0});
 tierMats[tr]=m;return m;
}
/* Kutu izdüşümlü UV: metre başına doku; tahta/çıta/metalde doku yönü dik yüzeylerde yukarı-aşağı döner */
function addUV(g,tr){
 const p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2),k=1/TILE[tr],sw=SWAP[tr];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
  let u,v;
  if(ay>=ax&&ay>=az){u=x;v=z}
  else{const h=ax>az?z:x;if(sw){u=y;v=h}else{u=h;v=y}}
  uv[i*2]=u*k;uv[i*2+1]=v*k;
 }
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 return g;
}
const lift=c=>{const r=c>>16&255,g=c>>8&255,b=c&255,f=.3;return ((r+(255-r)*f)<<16)|((g+(255-g)*f)<<8)|(b+(255-b)*f)|0};     /* doku zaten renk taşır: boya açılır */
const TC=[0xd8c8a8,0xd9bd98,0xe0e0e6,0xcfd0d2,0xc4c8cc];
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
 const add=(g,c,x,y,z,cf,jit)=>{const p=part(g,tr<2?lift(c):c,x,y,z,1,1,1,0,0,0,jit===undefined?.08:jit);if(cf)p.cf=cf;o.push(p);return p};
 if(tr===0){
  add(rbox(w*.98,h*.94,d*.4,.2,1),0x5b4326,cx,cy,cz,null,.05);
  if(mode==='w'){
   const n=Math.max(2,Math.round(w/.17));
   for(let k=0;k<n;k++){
    const hh=h*(.93+rnd(seed+k)*.07),x=b[0]+(k+.5)*w/n;
    const p=part(rbox(.085,hh,d*.85,.45,1),lift(SC[k&3]),x,b[1]+hh/2,cz,1,1,1,0,0,(rnd(seed+k*3)-.5)*.05,.1);p.cf=grain(seed+k);o.push(p);
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
 const cf=noiseCf(seed);
 const g=dbox(w,h,d,.5);
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
  const c=part(rbox(run*.98,top-.14,2.9,.1,1),tr===0?lift(0x5b4326):tr===1?lift(0x6f4a28):tr===2?0x70707a:tr===3?0x5d646b:0x2a2e33,x0+run/2,(top-.14)/2,0,1,1,1,0,0,0,.05);
  parts.push(c);
 }
 return addUV(merge(parts,{ao:.86,jit:.06}),tr);
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
 g=addUV(merge(parts,{ao:kind==='found'||kind==='floor'?.9:.84,jit:.06}),tr);
 GEO.set(key,g);return g;
}
let skirtGeo=null;
const skirtMat=new Map();
function doorGeo(dt){
 const key='d'+dt;let g=GEO.get(key);if(g)return g;
 const o=[],W_=1.36,H_=2.08,T_=.08,add=(geo,c,x,y,z,cf,jit)=>{const p=part(geo,dt===1?lift(c):c,x,y,z,1,1,1,0,0,0,jit===undefined?.06:jit);if(cf)p.cf=cf;o.push(p);return p};
 if(dt===1){
  const n=5,pw=W_/n;
  for(let k=0;k<n;k++)add(rbox(pw-.02,H_,T_,.2,1),PC[k%3],.02+(k+.5)*pw,H_/2,0,grain(500+k));
  for(const y of [.4,1.68])add(rbox(W_*.96,.14,T_+.04,.3,1),0x77512d,.02+W_/2,y,0,grain(520));
  add(rbox(.07,.07,.12,.4,1),0x2b2b30,1.2,1.0,.05,null,0);
 }else if(dt===2){
  add(dbox(W_,H_,T_,.5),0x9aa1a9,.02+W_/2,H_/2,0,noiseCf(540));
  for(const y of [.05,H_-.05])add(rbox(W_,.1,T_+.04,.3,1),0x474c53,.02+W_/2,y,0,grain(541));
  add(new THREE.TorusGeometry(.09,.02,6,12),0xb8bec6,1.15,1.0,.07,null,0);
 }else{
  add(dbox(W_,H_,T_+.02,.5),0x8a9097,.02+W_/2,H_/2,0,noiseCf(560));
  for(const y of [.05,H_/2,H_-.05])add(rbox(W_,.1,T_+.06,.3,1),0x2b2f34,.02+W_/2,y,0,null,.04);
  for(const x of [.15,.55,.95,1.25])for(const y of [.3,.75,1.4,1.8])add(blob(.03,0,0,3),0xaab1b8,x,y,.06,null,0);
  add(rbox(.2,.28,.1,.3,1),0x1d2024,1.15,1.0,.07,null,.03);
  add(blob(.045,0,0,3),0xe6c24a,1.15,1.0,.12,null,0);
 }
 g=addUV(merge(o,{ao:.88,jit:.05}),dt===1?1:dt===2?3:4);GEO.set(key,g);return g;
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
 const m=new THREE.Mesh(geoFor(kindOf(p),p.tr),ghost?mat:tierMat(p.tr));
 m.castShadow=!ghost;m.receiveShadow=!ghost;g.add(m);
 if(p.t===F&&p.sk&&!ghost){
  if(!skirtGeo)skirtGeo=merge([part(dbox(3,1,3,.5),0x6f6256,0,-.5,0,1,1,1,0,0,0,.1)],{ao:.7,jit:.1});
  const s=new THREE.Mesh(skirtGeo,mat);s.scale.y=Math.max(.2,p.sk-.35);s.position.y=-.35;s.castShadow=false;s.receiveShadow=true;g.add(s);
 }
 let door=null;
 if(p.t===DW&&p.dt&&!ghost){
  const pv=new THREE.Group(),dm=new THREE.Mesh(doorGeo(p.dt),tierMat(p.dt===1?1:p.dt===2?3:4));dm.castShadow=true;dm.receiveShadow=true;pv.add(dm);
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
