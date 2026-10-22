/* Hunger 3D - inşa sistemi (58. güncelleme) modelleri: pencereli duvar, geçit, çit kapısı, alçak taş duvar, tel örgü çit;
   yönlendirme (komşu yapılara göre veya elle), kurulum animasyonu ve toz efekti. Özgün model dosyalarına dokunmaz. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,O=HG.O,W=HG.W,H=HG.H;
const {cyl,box,merge,part,rbox,blob,fb3}=sc.g;
const PI=Math.PI;
const grain=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*30,y*3,z*30,k),g2=fb3(x*9,y*1.5,z*9,k+3);c.multiplyScalar(.78+g*.3+g2*.2)};
const brick=(row,len,k)=>(x,y,z,nx,ny,nz,c)=>{
 const r=Math.floor(y/row),ox=(r%2)*len*.5,u=((x+z+ox)%len+len)%len/len,n=fb3(x*9,y*9,z*9,k);
 c.multiplyScalar(.8+n*.34);if(u<.04||((y%row)+row)%row/row<.07)c.multiplyScalar(.66);
};
const steel=k=>(x,y,z,nx,ny,nz,c)=>{const b=fb3(x*70,y*3,z*70,k),r=fb3(x*8,y*8,z*8,k+5);c.multiplyScalar(.82+b*.3);if(r>.64){const q=Math.min(1,(r-.64)*3);c.r=c.r*(1-q*.4)+.25*q*.4;c.g=c.g*(1-q*.4)+.1*q*.4;c.b=c.b*(1-q*.4)+.05*q*.4}};
const wd=(w,h,d,c,x,y,z,k,rz)=>{const p=part(rbox(w,h,d,.3,2),c,x,y,z,1,1,1,0,0,rz||0,.1);p.cf=grain(k);return p};
const st=(w,h,d,c,x,y,z,k)=>{const p=part(rbox(w,h,d,.2,3),c,x,y,z,1,1,1,0,0,0,.18);p.cf=brick(.14,.3,k);return p};
const mt=(w,h,d,c,x,y,z,k)=>{const p=part(rbox(w,h,d,.3,2),c,x,y,z,1,1,1,0,0,0,.05);p.cf=steel(k);return p};
const bolt=(x,y,z)=>part(blob(.022,1,0,3),0x9aa1a9,x,y,z);

S.onInit(()=>{
 const M=sc.MODEL;
 /* ---- Pencereli duvar: alt dolgu, üst kuşak, yan sütunlar ve ortada pencere boşluğu ---- */
 M.winw=merge([
  wd(1.0,.34,.2,0xa67848,0,.17,0,201),wd(1.0,.34,.2,0x98693c,0,.5,0,202),
  wd(1.0,.26,.2,0xae7e4c,0,1.17,0,203),
  wd(.2,.4,.2,0x8a5e36,-.4,.87,0,204),wd(.2,.4,.2,0x8a5e36,.4,.87,0,205),
  wd(1.06,.07,.26,0x7a5432,0,1.31,0,206),wd(.64,.05,.24,0x6a4527,0,.69,0,207),
  wd(.04,.38,.1,0x6a4527,0,.88,0,208),wd(.62,.04,.1,0x6a4527,0,.88,0,209),
  wd(.05,.4,.05,0x7a5432,-.31,.88,.1,210),wd(.05,.4,.05,0x7a5432,.31,.88,.1,211)
 ],{ao:.8});
 M.wins=merge([
  st(1.0,.36,.24,0x8a8a92,0,.18,0,221),st(1.0,.3,.24,0x7d7d86,0,.5,0,222),
  st(1.0,.24,.24,0x94949c,0,1.18,0,223),
  st(.2,.42,.24,0x84848c,-.4,.86,0,224),st(.2,.42,.24,0x84848c,.4,.86,0,225),
  st(1.06,.08,.3,0xa0a0a8,0,1.31,0,226),st(.66,.07,.3,0x9a9aa2,0,.67,0,227),
  wd(.04,.36,.06,0x5a5a62,0,.88,0,228),wd(.04,.36,.06,0x5a5a62,-.16,.88,0,229),wd(.04,.36,.06,0x5a5a62,.16,.88,0,230)
 ],{ao:.78,jit:.1});
 M.winm=merge([
  mt(1.0,.36,.2,0x6b727a,0,.18,0,241),mt(1.0,.26,.2,0x6b727a,0,1.17,0,242),
  mt(.14,.42,.22,0x474c53,-.43,.87,0,243),mt(.14,.42,.22,0x474c53,.43,.87,0,244),
  mt(1.06,.09,.24,0x474c53,0,1.3,0,245),mt(.74,.06,.24,0x474c53,0,.67,0,246),
  ...[-.24,-.08,.08,.24].map((x,i)=>mt(.035,.4,.05,0x2e3238,x,.88,0,247+i)),
  ...[-.43,.43].flatMap(x=>[bolt(x,.7,.12),bolt(x,1.05,.12),bolt(x,.7,-.12),bolt(x,1.05,-.12)])
 ],{ao:.8});
 /* ---- Geçit: kapısız çerçeve ---- */
 M.archw=merge([
  wd(.15,1.46,.2,0x7a5430,-.43,.73,0,261),wd(.15,1.46,.2,0x7a5430,.43,.73,0,262),
  wd(1.06,.15,.22,0x6a4527,0,1.42,0,263),wd(1.0,.06,.14,0x8a6038,0,1.28,0,264),
  wd(.28,.05,.16,0x6a4527,-.3,1.22,0,265,PI/4),wd(.28,.05,.16,0x6a4527,.3,1.22,0,266,-PI/4)
 ],{ao:.82});
 M.archs=merge([
  st(.22,.5,.3,0x7d7d86,-.4,.25,0,271),st(.22,.5,.3,0x8a8a92,.4,.25,0,272),
  st(.22,.5,.3,0x8a8a92,-.4,.75,0,273),st(.22,.5,.3,0x7d7d86,.4,.75,0,274),
  st(.22,.5,.3,0x7d7d86,-.4,1.25,0,275),st(.22,.5,.3,0x8a8a92,.4,1.25,0,276),
  (()=>{const p=part(new THREE.TorusGeometry(.4,.1,6,14,PI),0x94949c,0,1.05,0,1,1,1,0,0,0,.08);p.cf=brick(.14,.3,277);return p})(),
  st(.2,.18,.32,0xa0a0a8,0,1.55,0,278)
 ],{ao:.78,jit:.08});
 /* ---- Çit kapısı: alçak, yürünebilir ---- */
 M.gate=merge([
  wd(.12,.98,.12,0x7a5430,-.46,.49,0,281),wd(.12,.98,.12,0x7a5430,.46,.49,0,282),
  wd(.8,.07,.06,0x8a6038,0,.3,0,283),wd(.8,.07,.06,0x80583a,0,.66,0,284),
  wd(.9,.05,.05,0x6a4527,0,.48,.0,285,.62),
  wd(.07,.72,.06,0x84603a,-.34,.46,0,286),wd(.07,.72,.06,0x84603a,.34,.46,0,287),
  part(blob(.04,1,0,3),0x6a6a74,-.42,.3,.05),part(blob(.04,1,0,5),0x6a6a74,-.42,.66,.05)
 ],{ao:.82});
 M.gatem=merge([
  mt(.12,1.0,.12,0x3d4248,-.46,.5,0,291),mt(.12,1.0,.12,0x3d4248,.46,.5,0,292),
  mt(.8,.06,.07,0x4a4f56,0,.18,0,293),mt(.8,.06,.07,0x4a4f56,0,.86,0,294),
  ...[-.32,-.16,0,.16,.32].map((x,i)=>mt(.035,.7,.04,0x6b727a,x,.52,0,295+i)),
  part(new THREE.TorusGeometry(.05,.012,6,12),0xb8bec6,.28,.52,.06),bolt(-.42,.2,.07),bolt(-.42,.84,.07)
 ],{ao:.82});
 /* ---- Alçak taş duvar ve tel örgü çit ---- */
 M.fences=merge([
  st(1.0,.3,.34,0x7d7d86,0,.15,0,301),st(1.0,.28,.32,0x8a8a92,0,.44,0,302),st(1.0,.2,.3,0x94949c,0,.7,0,303),
  st(1.04,.07,.36,0xa0a0a8,0,.835,0,304)
 ],{ao:.78,jit:.12});
 {
  const wire=[];
  for(let i=0;i<7;i++){const x=-.45+i*.15;wire.push(mt(.012,.62,.012,0x9aa1a9,x,.5,0,310+i))}
  for(const y of [.22,.4,.58,.76])wire.push(mt(1.0,.014,.014,0x9aa1a9,0,y,0,320));
  M.fencem=merge([
   mt(.09,.95,.09,0x474c53,-.46,.475,0,330),mt(.09,.95,.09,0x474c53,.46,.475,0,331),mt(1.0,.05,.06,0x474c53,0,.9,0,332),
   ...wire
  ],{ao:.82});
 }
 /* ---- Kayıtlar ---- */
 const ST=sc.STRUCT,NB=sc.NBR;
 const T=[[O.WINW,'winw'],[O.WINS,'wins'],[O.WINM,'winm'],[O.ARCHW,'archw'],[O.ARCHS,'archs'],[O.GATE,'gate'],[O.GATEM,'gatem'],[O.FENCES,'fences'],[O.FENCEM,'fencem']];
 const CONN=new Set([O.WALLW,O.WALLS,O.WALLT,O.WALLM,O.DOOR,O.DOORM,O.FENCE,...T.map(a=>a[0])]);
 sc.insaConn=CONN;
 const G=HG.G;
 const auto=(hh,x,z)=>{
  const cn=(xx,zz)=>xx>=0&&zz>=0&&xx<W&&zz<H&&CONN.has(G.obj[zz*W+xx]);
  const ax=cn(x-1,z)||cn(x+1,z),az=cn(x,z-1)||cn(x,z+1);
  return az&&!ax?PI/2:ax?0:(hh<.5?0:PI/2);
 };
 for(const [o,m] of T){ST.add(o);NB.add(o);sc.structModel[o]=m;sc.structRot[o]=auto}
});

/* ---- Elle verilen yön: HG.insaRotOf(kare) -> 0 | 1 | undefined ---- */
sc.rotOver=i=>{const q=HG.insaRotOf&&HG.insaRotOf(i);return q===0||q===1?q*PI/2:undefined};

/* ---- Kurulum animasyonu (büyüyerek belirme) ve toz ---- */
const pops=[];
sc.insaPop=(i,strong)=>{pops.push({i,t:0,seen:false,s:strong?1:.6})};
sc.insaDust=(x,z,col,n,up)=>{
 if(!sc.fx||!sc.fx.puff)return;
 const gy=S.groundY(x,z);
 for(let k=0;k<(n||6);k++){
  const a=Math.random()*6.28,r=.15+Math.random()*.3;
  sc.fx.puff({x:x+Math.cos(a)*r,y:gy+.1+Math.random()*.25,z:z+Math.sin(a)*r,vx:Math.cos(a)*.5,vy:(up?.9:.35)+Math.random()*.4,vz:Math.sin(a)*.5,life:.55+Math.random()*.3,s0:.12,s1:.4+Math.random()*.2,a:.55,col:col||0xd9cdb0,wind:.3,g:-.2});
 }
};
S.onFrame((G,t,dt)=>{
 for(let k=pops.length-1;k>=0;k--){
  const p=pops[k],e=sc.structAt&&sc.structAt(p.i);
  if(!e){p.t+=dt;if(p.t>1.2)pops.splice(k,1);continue}
  if(!p.seen){p.seen=true;p.t=0}
  p.t+=dt;
  const u=Math.min(1,p.t/.28),s=u>=1?1:(1-p.s)*0+ (p.s+(1-p.s)*u+Math.sin(u*PI)*.08);
  for(const ob of e.objs)if(ob.isMesh&&!ob.userData.keepScale)ob.scale.set(1,s,1);
  if(u>=1){for(const ob of e.objs)if(ob.isMesh)ob.scale.set(1,1,1);pops.splice(k,1)}
 }
});
})();
