/* Hunger 3D - güncelleme 49 modelleri: yeni yapılar (yatak, kurutma rafı, yağmur varili, meşale direği, tuzak, tarla), tavuk,
   yerdeki eşya modelleri ve elde tutulan eşya modelleri. Özgün model dosyalarına dokunmaz; mevcut yardımcıları (sc.g) kullanır. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {cyl,cone,ico,box,merge,part,alongPart,blob,rbox,fb3}=sc.g;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const PI=Math.PI;
const grain=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*30,y*3,z*30,k),g2=fb3(x*9,y*1.5,z*9,k+3);c.multiplyScalar(.78+g*.3+g2*.2)};
const wood=(geo,c,x,y,z,k,rx,ry,rz)=>{const p=part(geo,c,x,y,z,1,1,1,rx||0,ry||0,rz||0,.1);p.cf=grain(k||1);return p};
const soil=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*14,y*6,z*14,k),g2=fb3(x*40,y*10,z*40,k+4);c.multiplyScalar(.7+g*.5+g2*.22)};
const feather=k=>(x,y,z,nx,ny,nz,c)=>{const s=fb3(x*30,y*24,z*30,k);c.multiplyScalar(.8+s*.34)};
let seed=300;
const bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};const p=part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.05:o.amp,o.s||(++seed),sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.jit);if(o.cf)p.cf=o.cf;return p};

/* ================= yapı modelleri (ızgara karesine oturur, taban y=0) ================= */
S.onInit(()=>{
 const M=sc.MODEL;
 /* Hasır yatak: ahşap çerçeve, saman şilte, yün örtü ve tüy yastık */
 M.bed=merge([
  ...[[-.37,-.4],[.37,-.4],[-.37,.4],[.37,.4]].map((q,i)=>wood(rbox(.1,.3,.1,.3,2),0x5a3a1e,q[0],.15,q[1],10+i)),
  wood(rbox(.06,.1,.9,.3,2),0x6b4423,-.37,.28,0,14),wood(rbox(.06,.1,.9,.3,2),0x6b4423,.37,.28,0,15),
  wood(rbox(.84,.4,.06,.3,2),0x6b4423,0,.44,-.43,16),wood(rbox(.84,.2,.05,.3,2),0x6b4423,0,.34,.43,17),
  (()=>{const p=part(rbox(.74,.16,.84,.45,4),0xd6bf7a,0,.37,0,1,1,1,0,0,0,.14);p.cf=(x,y,z,nx,ny,nz,c)=>{const s=fb3(x*8,y*30,z*40,22);c.multiplyScalar(.8+s*.35)};return p})(),
  (()=>{const p=part(rbox(.78,.06,.52,.4,3),0xa3433a,0,.47,.15,1,1,1,0,0,0,.1);p.cf=(x,y,z,nx,ny,nz,c)=>{const s=Math.sin(x*26)*.5+.5;c.multiplyScalar(.82+s*.2+fb3(x*20,y*20,z*20,5)*.14)};return p})(),
  bp(.16,0xf1ede2,0,.5,-.3,1.5,.6,1,{amp:.1})
 ],{ao:.8});
 /* Kurutma rafı: iki direk, üst çubuk, alt çubuk ve askılar (asılı yiyecek ayrı çizilir) */
 M.rack=merge([
  wood(rbox(.09,1.5,.09,.3,2),0x6b4423,-.44,.75,0,20),wood(rbox(.09,1.5,.09,.3,2),0x6b4423,.44,.75,0,21),
  wood(rbox(1.04,.08,.08,.3,2),0x7a5230,0,1.45,0,22),wood(rbox(.96,.06,.06,.3,2),0x5a3a1e,0,.62,0,23),
  wood(rbox(.08,.06,.52,.3,2),0x5a3a1e,-.44,.03,0,24),wood(rbox(.08,.06,.52,.3,2),0x5a3a1e,.44,.03,0,25),
  alongPart(cyl(.022,.022,.5,5),0x5a3a1e,V(-.44,.5,0),V(.45,1,0),.5),alongPart(cyl(.022,.022,.5,5),0x5a3a1e,V(.44,.5,0),V(-.45,1,0),.5),
  ...[-.33,-.11,.11,.33].map(x=>part(cyl(.012,.012,.1,5),0x3a3d42,x,1.36,0)),
  ...[-.33,-.11,.11,.33].map(x=>part(new THREE.TorusGeometry(.022,.006,5,8),0x3a3d42,x,1.29,0))
 ],{ao:.8});
 /* Yağmur varili: bombeli tahta gövde, demir çemberler, açık ağız */
 {
  const prof=[[.001,0],[.31,0],[.34,.08],[.38,.3],[.4,.5],[.38,.72],[.34,.92],[.32,1]].map(p=>new THREE.Vector2(p[0],p[1]));
  const lathe=new THREE.LatheGeometry(prof,18);
  const body=part(lathe,0x9a6a38,0,0,0,1,1,1,0,0,0,.1);
  body.cf=(x,y,z,nx,ny,nz,c)=>{const a=Math.atan2(z,x),st=Math.abs(Math.sin(a*9));c.multiplyScalar(.7+.3*Math.pow(st,.3));c.multiplyScalar(.82+fb3(x*12,y*5,z*12,31)*.3)};
  M.barrel=merge([
   body,
   part(cyl(.3,.3,.02,18),0x1b1209,0,.9,0),
   part(new THREE.TorusGeometry(.325,.024,5,22),0x3a3d42,0,.97,0,1,1,1,PI/2,0,0),
   ...[.16,.82].map(y=>{const r=y<.5?.37:.36;return part(new THREE.TorusGeometry(r,.022,5,22),0x474c53,0,y,0,1,1,1,PI/2,0,0)}),
   part(new THREE.TorusGeometry(.4,.02,5,22),0x474c53,0,.5,0,1,1,1,PI/2,0,0)
  ],{ao:.8});
 }
 /* Meşale direği: ahşap direk, taş kaide, demir kaide ve kömürleşmiş baş */
 M.tpost=merge([
  wood(cyl(.045,.06,1.75,7),0x6b4423,0,.875,0,30),
  ...Array.from({length:6},(_,i)=>{const a=i*PI/3;return bp(.1,i%2?0x7d7d83:0x6c6c72,Math.cos(a)*.15,.05,Math.sin(a)*.15,1,.7,1,{d:1,amp:.2})}),
  part(cyl(.1,.07,.12,8),0x2b2018,0,1.8,0),part(cyl(.012,.012,.2,5),0x3a3d42,0,1.68,0),part(new THREE.TorusGeometry(.065,.012,5,10),0x3a3d42,0,1.7,0,1,1,1,PI/2,0,0),
  bp(.07,0x15100c,0,1.87,0,1,.8,1,{d:1,amp:.2})
 ],{ao:.8});
 /* Av tuzağı: bükülmüş fidan, ilmik, tetik çubuğu */
 M.snare=merge([
  wood(new THREE.TorusGeometry(.32,.022,6,14,PI),0x7a5230,0,0,-.05,40,0,0,0),
  alongPart(cyl(.022,.03,.18,5),0x6b4423,V(-.32,0,-.05),V(0,1,0),.18),alongPart(cyl(.022,.03,.18,5),0x6b4423,V(.32,0,-.05),V(0,1,0),.18),
  alongPart(cyl(.006,.006,.34,3),0xd9c08a,V(0,.32,-.05),V(0,-1,.55),.34),
  part(new THREE.TorusGeometry(.15,.01,5,16),0xd9c08a,0,.025,.19,1,1,1,PI/2,0,0),
  alongPart(cyl(.014,.014,.3,4),0x6b4423,V(-.12,.02,.38),V(1,.25,0),.3),
  bp(.025,0xc42d3a,0,.03,.19,1,1,1,{d:1,amp:0})
 ],{ao:.85});
 /* Ekim tarlası: sürülmüş toprak, kenar kütükleri ve sıralar */
 M.plot=merge([
  (()=>{const p=part(rbox(.94,.14,.94,.25,3),0x4a2f18,0,.07,0,1,1,1,0,0,0,.2);p.cf=soil(50);return p})(),
  ...[-.3,-.1,.1,.3].map((z,i)=>{const p=part(rbox(.84,.07,.11,.45,2),0x5a3a1e,0,.17,z,1,1,1,0,0,0,.2);p.cf=soil(60+i);return p}),
  wood(rbox(1.0,.1,.07,.3,2),0x7a5230,0,.08,-.47,70),wood(rbox(1.0,.1,.07,.3,2),0x7a5230,0,.08,.47,71),
  wood(rbox(.07,.1,.94,.3,2),0x6b4423,-.47,.08,0,72),wood(rbox(.07,.1,.94,.3,2),0x6b4423,.47,.08,0,73)
 ],{ao:.85});

 /* Mantar öbeği: dünyada örnekli (instanced) çizilir; üç mantar, farklı boy ve şapka renginde */
 {
  const cap=(x,z,h,r,c,k)=>[
   part(cyl(r*.2,r*.28,h,7),0xe8dcc0,x,h/2,z,1,1,1,0,0,0,.08),
   (()=>{const p=bp(r,c,x,h+r*.05,z,1,.55,1,{d:2,amp:.07,s:k});p.cf=(px,py,pz,nx,ny,nz,col)=>{if(ny>.55&&fb3(px*40,py*40,pz*40,k)>.72)col.setHex(0xe9dcc0)};return p})(),
   part(cyl(r*.9,r*.8,.012,9),0xcdb98d,x,h-.002,z)
  ];
  M.shroom=merge([...cap(0,0,.2,.13,0x8a4a22,601),...cap(.15,.08,.13,.085,0xa8643a,602),...cap(-.1,.14,.09,.06,0x7a3f1c,603)],{ao:.75});
 }

 /* ---- ekin aşamaları (tarlada üç düzey) ve raf/tuzak/varil parçaları ---- */
 {
  const st=[];
  /* aşama 1: filiz */
  st[1]=merge([...[-.3,-.1,.1,.3].flatMap((z,i)=>[-.28,0,.28].map((x,j)=>part(cone(.025,.14,4,1),0x6cc45a,x,.24,z,1,1,1,(i+j)%2?.2:-.2,j*1.2,0)))],{ao:1,jit:.1});
  /* aşama 2: genç sapların */
  st[2]=merge([...[-.3,-.1,.1,.3].flatMap((z,i)=>[-.3,-.1,.1,.3].map((x,j)=>alongPart(cyl(.008,.012,.42,4),0x5aa84a,V(x,.2,z),V((i-1.5)*.05,1,(j-1.5)*.05),.42)))],{ao:1,jit:.1});
  /* aşama 3: olgun buğday başakları */
  st[3]=merge([...[-.3,-.1,.1,.3].flatMap((z,i)=>[-.3,-.1,.1,.3].flatMap((x,j)=>{
   const d=V((i-1.5)*.05,1,(j-1.5)*.05).normalize(),tip=V(x,.2,z).addScaledVector(d,.62);
   return [alongPart(cyl(.007,.01,.62,4),0xc9a24a,V(x,.2,z),d,.62),part(blob(.032,1,.1,seed+i*4+j,.55,2.6,.55),0xe0bf5a,tip.x,tip.y,tip.z)];
  }))],{ao:1,jit:.12});
  M.crop=st;
  /* kurutma askısındaki parça (çiğ: pembe-kırmızı, kurumuş: koyu kahve) */
  const strip=(c,c2)=>merge([part(rbox(.14,.3,.04,.35,2),c,0,-.16,0,1,1,1,0,0,0,.14),part(rbox(.1,.26,.045,.35,2),c2,0,-.17,0,1,1,1,0,0,0,.1),part(cyl(.006,.006,.08,3),0xd9c08a,0,-.02,0)],{jit:.1});
  M.rackRaw=strip(0xb83a3e,0xd86a68);M.rackFish=strip(0x7fa0b8,0xc7dbe8);M.rackDry=strip(0x4a2012,0x70361f);
  /* varil suyu: ince disk (yükseklik her karede ayarlanır) */
  M.barrelWater=new THREE.CylinderGeometry(.3,.3,.012,18);
  /* tuzakta yakalanan av: küçük tavşan benzeri gövde */
  M.snareCatch=merge([bp(.1,0x8a7a68,0,.12,0,1,.9,1.3,{amp:.08}),bp(.06,0x8a7a68,0,.17,.12,1,1,1,{amp:.05}),bp(.03,0x8a7a68,.025,.26,.1,.6,1.8,.6,{d:1}),bp(.03,0x8a7a68,-.025,.26,.1,.6,1.8,.6,{d:1}),bp(.04,0xf3efe8,0,.14,-.14,1,1,1,{d:1})],{ao:.8});
  M.cropMat=sc.mat({roughness:.8});
 }

 /* ================= Tavuk ================= */
 {
  const body=0xa95a28,wing=0x86421e,breast=0xc97a3a,hack=0xd9a05b,tailC=0x2a1a12,tailG=0x2f4a3a,comb=0xcf2e2a,beak=0xe8b84a,legC=0xe0b040;
  const cf=feather(31);
  const eyes=[];for(const s of [-1,1])eyes.push(bp(.012,0x120d0a,s*.045,.55,.225,1,1,1,{d:0,amp:0,jit:0}));
  const bodyParts=[
   bp(.17,body,0,.3,0,1,.95,1.35,{cf}),bp(.13,breast,0,.3,.1,1,1,1,{cf}),bp(.12,body,0,.33,-.12,1,1,1.2,{cf}),
   bp(.1,wing,.15,.34,-.02,.5,.9,1.4,{cf,rz:.25}),bp(.1,wing,-.15,.34,-.02,.5,.9,1.4,{cf,rz:-.25}),
   bp(.075,hack,0,.42,.14,.85,1.5,.9,{cf})
  ];
  const headParts=[
   bp(.062,body,0,.54,.2,1,1,1.1,{cf:feather(33)}),
   part(cone(.022,.07,4,1),beak,0,.53,.27,1,1,1,PI/2,0,0),
   bp(.03,comb,0,.6,.2,.4,1.4,1.7,{d:1,amp:.04}),bp(.018,comb,0,.5,.255,.6,1.7,.6,{d:1,amp:.03}),
   ...eyes
  ];
  const tailParts=[
   bp(.1,tailC,0,.47,-.3,.3,1.5,.8,{rx:-.5,cf}),bp(.09,tailG,.05,.46,-.29,.3,1.4,.8,{rx:-.45,rz:.35,cf}),bp(.09,tailG,-.05,.46,-.29,.3,1.4,.8,{rx:-.45,rz:-.35,cf}),
   bp(.08,tailC,.09,.43,-.27,.3,1.3,.8,{rx:-.4,rz:.6,cf}),bp(.08,tailC,-.09,.43,-.27,.3,1.3,.8,{rx:-.4,rz:-.6,cf})
  ];
  const pivot=(list,pv)=>{const g=merge(list,{jit:.05});g.translate(-pv[0],-pv[1],-pv[2]);return g};
  const hp=[0,.5,.17],tp=[0,.38,-.24];
  const legGeo=merge([
   part(cyl(.012,.014,.2,5),legC,0,-.1,0),part(cyl(.022,.016,.03,5),0xc79a2a,0,-.015,.01),
   ...[-.35,0,.35].map(a=>alongPart(cyl(.008,.007,.065,4),legC,V(0,-.19,.005),V(Math.sin(a),0,Math.cos(a)),.065)),
   alongPart(cyl(.007,.006,.04,4),legC,V(0,-.19,0),V(0,.1,-1),.04)
  ],{jit:.04});
  sc.ANIM.chicken={body:merge(bodyParts,{ao:.8,jit:.05}),head:pivot(headParts,hp),headP:hp,tail:pivot(tailParts,tp),tailP:tp,leg:legGeo,legs:[[.05,.2,.02],[-.05,.2,.02]]};
 }
});

/* ================= yerdeki eşya modelleri ================= */
{
 const B=sc.dropB;
 if(B){
  const bottleP=(body,neck,liq)=>[part(cyl(.07,.075,.2,14),body,0,.1,0),part(cyl(.05,.07,.06,14),body,0,.22,0),part(cyl(.03,.035,.1,12),neck,0,.3,0),part(cyl(.036,.034,.04,10),0x9a6a3c,0,.37,0),part(cyl(.072,.072,.05,14),liq,0,.12,0)];
  B.seed=()=>[[0,0,0],[.07,.01,.05],[-.06,.01,.06],[.03,.01,-.07],[-.04,.01,-.04]].map((q,i)=>part(blob(.026,1,.12,380+i,1,.7,1.7),0x6b4a22,q[0],.02,q[2],1,1,1,0,i*1.3,0));
  B.wheat=()=>{
   const ps=[];
   for(let i=0;i<6;i++){const z=(i-2.5)*.04,d=V(1,0,(i-2.5)*.05).normalize();ps.push(alongPart(cyl(.006,.006,.46,4),0xc9a24a,V(-.23,.02+(i%2)*.012,z),d,.46));ps.push(part(blob(.03,1,.1,390+i,2.4,.5,.5),0xe0bf5a,.17,.025+(i%2)*.012,z+(i-2.5)*.012))}
   ps.push(part(cyl(.015,.015,.03,6),0x8a6a3a,0,.03,0,1,1,1,0,0,PI/2));
   return ps;
  };
  B.bread=()=>[part(blob(.12,2,.08,400,1.4,.62,.85),0xc4833c,0,.07,0),part(blob(.1,1,.08,401,1.4,.25,.8),0x8a5424,0,.03,0),...[-.07,0,.07].map(x=>part(rbox(.012,.015,.1,.3,2),0xe0a85a,x,.125,0,1,1,1,0,.3,0))];
  B.bowl=()=>[part(cyl(.1,.065,.075,14),0x8f5f30,0,.04,0),part(cyl(.087,.087,.01,14),0x3a2412,0,.078,0)];
  B.stew=()=>[part(cyl(.1,.065,.075,14),0x8f5f30,0,.04,0),part(cyl(.088,.088,.012,14),0xa6481f,0,.077,0),part(blob(.022,1,.1,410,1,.8,1),0xe8d29a,-.03,.088,.01),part(blob(.02,1,.1,411),0x7a3a18,.035,.088,-.02),part(blob(.016,1,.1,412),0x5aa04a,.0,.088,.04)];
  B.juice=()=>bottleP(0xb33a52,0xcfe8ee,0x7a1230);
  B.jerky=()=>[[-.02,0,.3],[.01,.025,-.2],[-.01,.05,.12]].map((q,i)=>part(rbox(.24,.02,.07,.3,2),[0x5a2a18,0x70361f,0x4a2012][i],q[0],.02+q[1],(i-1)*.04,1,1,1,0,q[2],0));
  B.dfish=()=>[part(blob(.1,2,.08,420,1.8,.3,.6),0xc9a468,0,.035,0),part(cone(.06,.09,4,1),0xb58f50,-.2,.035,0,1,1,1,0,0,PI/2),part(blob(.01,0,0,421),0x3a2a14,.14,.06,.05)];
  B.mushroom=()=>[0,1].map(i=>[part(cyl(.022,.03,.09-i*.02,8),0xe8dcc0,i*.1-.04,.045,i*.05),part(blob(.065-i*.015,2,.1,430+i,1,.55,1),0x7a4a24,i*.1-.04,.1-i*.02,i*.05)]).flat();
  B.cmush=()=>[0,1].map(i=>[part(cyl(.022,.03,.09-i*.02,8),0xcdbb8c,i*.1-.04,.045,i*.05),part(blob(.065-i*.015,2,.1,440+i,1,.55,1),0x4a2a12,i*.1-.04,.1-i*.02,i*.05)]).flat();
  B.egg=()=>[part(blob(.048,2,.02,450,.82,1,.82),0xf1e6cc,0,.05,0)];
  B.cegg=()=>[part(blob(.048,2,.02,451,.82,1,.82),0xfbf7ec,-.04,.05,0),part(blob(.044,2,.02,452,.82,1,.82),0xf5efe0,.05,.046,.03)];
  B.feather=()=>[alongPart(cyl(.004,.004,.32,4),0xb8ae96,V(-.16,.012,0),V(1,0,.1),.32),part(blob(.05,1,.1,460,3.3,.2,1.1),0xece6d6,0,.012,0,1,1,1,0,-.1,0)];
  B.salve=()=>[part(cyl(.05,.052,.07,12),0x8fae6a,0,.035,0),part(cyl(.056,.056,.028,12),0x7a5230,0,.084,0),part(cyl(.058,.058,.008,12),0xd9463c,0,.103,0)];
  B.msg=()=>[alongPart(cyl(.04,.04,.2,10),0xbfe6f0,V(-.12,.04,0),V(1,0,0),.2),alongPart(cyl(.03,.026,.06,8),0x9a6a3c,V(.08,.04,0),V(1,0,0),.06),alongPart(cyl(.022,.022,.15,8),0xf1e6c4,V(-.09,.04,0),V(1,0,0),.15)];
  B.vest=()=>[part(rbox(.32,.05,.36,.3,2),0x8f5d31,0,.03,0),part(rbox(.06,.05,.36,.3,2),0x5a3a1c,0,.058,0),...[-.12,.0,.12].map(z=>part(blob(.014,1,0,470+z*100),0xd9c08a,0,.085,z))];
  B.iarmor=()=>[part(rbox(.32,.07,.36,.35,3),0x8d939a,0,.04,0),part(rbox(.06,.06,.36,.3,2),0x5b6168,0,.08,0),...[[-.1,-.12],[.1,-.12],[-.1,.12],[.1,.12]].map((q,i)=>part(blob(.016,1,0,480+i),0xd6dbe0,q[0],.085,q[1]))];
  B.spear2=()=>[alongPart(cyl(.016,.02,1,6),0x8a5a30,V(-.5,.02,0),V(1,0,0),1),alongPart(cone(.034,.22,4,1),0xc3c9d0,V(.5,.02,0),V(1,0,0),.22,1,.4),alongPart(cyl(.022,.022,.06,6),0x3a3d42,V(.42,.02,0),V(1,0,0),.06)];
  B.spyglass=()=>[alongPart(cyl(.026,.03,.18,10),0x5a3a1c,V(-.2,.035,0),V(1,0,0),.18),alongPart(cyl(.032,.034,.17,10),0xb08d3a,V(-.03,.036,0),V(1,0,0),.17),alongPart(cyl(.04,.04,.1,10),0xd9b24a,V(.14,.04,0),V(1,0,0),.1)];
  B.bed=()=>[part(rbox(.4,.1,.3,.3,2),0x6b4423,0,.05,0),part(rbox(.36,.07,.27,.4,3),0xd6bf7a,0,.13,0),part(rbox(.32,.03,.16,.4,2),0xa3433a,.02,.17,.05),part(blob(.06,1,.1,490,1.5,.6,1),0xf1ede2,-.12,.19,0)];
  B.rack=()=>[part(rbox(.04,.34,.04,.3,2),0x6b4423,-.16,.17,0),part(rbox(.04,.34,.04,.3,2),0x6b4423,.16,.17,0),part(rbox(.38,.035,.035,.3,2),0x7a5230,0,.33,0),...[-.09,.03,.12].map(x=>part(rbox(.04,.1,.015,.3,2),0x4a2012,x,.26,0))];
  B.barrel=()=>[part(cyl(.1,.08,.26,12),0x9a6a38,0,.13,0),part(cyl(.1,.1,.012,12),0x3f90d6,0,.255,0),part(cyl(.108,.108,.014,12),0x474c53,0,.07,0),part(cyl(.108,.108,.014,12),0x474c53,0,.2,0)];
  B.tpost=()=>[alongPart(cyl(.02,.027,.5,6),0x6b4423,V(-.25,.03,0),V(1,0,0),.5),part(cyl(.04,.03,.05,7),0x2b2018,.27,.04,0,1,1,1,0,0,PI/2),part(blob(.03,1,.15,500),0x15100c,.31,.04,0)];
  B.snare=()=>[part(new THREE.TorusGeometry(.12,.012,5,10,PI),0x7a5230,0,0,0),part(new THREE.TorusGeometry(.07,.006,4,10),0xd9c08a,0,.012,.1,1,1,1,PI/2,0,0)];
  B.plot=()=>[part(rbox(.3,.05,.3,.3,2),0x4a2f18,0,.025,0),...[-.07,.07].map(z=>part(rbox(.26,.03,.05,.4,2),0x5a3a1e,0,.06,z)),part(rbox(.32,.04,.03,.3,2),0x7a5230,0,.03,-.15),part(rbox(.32,.04,.03,.3,2),0x7a5230,0,.03,.15)];
 }
}

/* ================= elde tutulan eşya modelleri: sap +Y ekseninde, uç yukarıda ================= */
{
 const X=sc.heldX=sc.heldX||{};
 const sq=(geo,x,y,z)=>{geo.scale(x,y,z);return geo};
 X.spear=(g,add)=>{add(cyl(.016,.02,1.15,6),0x8a5a30,0,.3,0);add(cone(.032,.2,4,1),0xe9e1cc,0,.98,0);add(cyl(.02,.02,.06,6),0x4a3a22,0,.87,0)};
 X.spear2=(g,add)=>{add(cyl(.016,.02,1.15,6),0x8a5a30,0,.3,0);add(cone(.036,.24,4,1),0xc3c9d0,0,1,0);add(cyl(.024,.024,.06,6),0x3a3d42,0,.87,0);add(cyl(.02,.02,.04,6),0x3a3d42,0,.12,0)};
 X.shears=(g,add)=>{add(box(.014,.26,.01),0xbcc2c8,-.012,.2,0,0,0,.1);add(box(.014,.26,.01),0xbcc2c8,.012,.2,0,0,0,-.1);add(new THREE.TorusGeometry(.04,.008,5,12),0x8a4a22,-.04,.02,0,0,0,0);add(new THREE.TorusGeometry(.04,.008,5,12),0x8a4a22,.04,.02,0,0,0,0)};
 X.spyglass=(g,add)=>{add(cyl(.03,.036,.22,10),0x5a3a1c,0,.1,0);add(cyl(.036,.04,.24,10),0xb08d3a,0,.32,0);add(cyl(.046,.046,.07,10),0xd9b24a,0,.5,0);add(cyl(.036,.036,.01,10),0x7ec8e8,0,.54,0);add(cyl(.04,.04,.012,10),0x3a2a14,0,-.01,0)};
 X.bread=(g,add)=>{add(sq(ico(.1),1.5,.7,.9),0xc4833c,0,.1,0)};
 X.bowl=(g,add)=>{add(cyl(.1,.065,.075,12),0x8f5f30,0,.08,0);add(cyl(.087,.087,.012,12),0x3a2412,0,.12,0)};
 X.stew=(g,add)=>{X.bowl(g,add);add(cyl(.088,.088,.012,12),0xa6481f,0,.124,0);add(ico(.022),0xe8d29a,-.03,.14,0);add(ico(.02),0x7a3a18,.04,.14,.01)};
 X.juice=(g,add)=>{add(cyl(.05,.055,.18,10),0xbfe6f0,0,.1,0);add(cyl(.042,.042,.08,10),0xb33a52,0,.07,0);add(cyl(.022,.028,.07,10),0xcfe8ee,0,.23,0);add(cyl(.026,.024,.03,8),0x9a6a3c,0,.275,0)};
 X.jerky=(g,add)=>{add(box(.2,.02,.07),0x5a2a18,0,.1,0,0,.2,0);add(box(.2,.02,.07),0x70361f,0,.13,.02,0,-.15,0)};
 X.dfish=(g,add)=>{add(sq(ico(.09),1.8,.3,.6),0xc9a468,0,.1,0);add(cone(.05,.08,4),0xb58f50,-.18,.1,0,0,0,PI/2)};
 X.mushroom=(g,add)=>{add(cyl(.022,.03,.1,8),0xe8dcc0,0,.07,0);add(sq(ico(.065),1,.55,1),0x7a4a24,0,.14,0)};
 X.cmush=(g,add)=>{add(cyl(.022,.03,.1,8),0xcdbb8c,0,.07,0);add(sq(ico(.065),1,.55,1),0x4a2a12,0,.14,0)};
 X.egg=(g,add)=>{add(sq(ico(.05),.82,1,.82),0xf1e6cc,0,.1,0)};
 X.cegg=(g,add)=>{add(sq(ico(.05),.82,1,.82),0xfbf7ec,0,.1,0)};
 X.feather=(g,add)=>{add(cyl(.004,.004,.34,4),0xb8ae96,0,.15,0);add(sq(ico(.05),.25,3.6,.12),0xece6d6,0,.17,0)};
 X.seed=(g,add)=>{for(const [x,z] of [[0,0],[.05,.04],[-.04,.05]])add(sq(ico(.022),.7,1.4,.7),0x6b4a22,x,.1,z)};
 X.wheat=(g,add)=>{for(let i=0;i<4;i++){add(cyl(.006,.006,.4,4),0xc9a24a,(i-1.5)*.02,.2,0,0,0,(i-1.5)*.05);add(sq(ico(.03),.6,2.6,.6),0xe0bf5a,(i-1.5)*.02-(i-1.5)*.02,.4,0)}};
 X.salve=(g,add)=>{add(cyl(.05,.052,.07,12),0x8fae6a,0,.06,0);add(cyl(.056,.056,.028,12),0x7a5230,0,.11,0)};
 X.msg=(g,add)=>{add(cyl(.036,.036,.2,10),0xbfe6f0,0,.12,0);add(cyl(.026,.024,.05,8),0x9a6a3c,0,.25,0);add(cyl(.02,.02,.14,8),0xf1e6c4,0,.12,0)};
 X.vest=(g,add)=>{add(box(.3,.34,.06),0x8f5d31,0,.18,0);add(box(.05,.34,.07),0x5a3a1c,0,.18,0)};
 X.iarmor=(g,add)=>{add(box(.3,.34,.07),0x8d939a,0,.18,0);add(box(.05,.34,.08),0x5b6168,0,.18,0);add(ico(.014),0xd6dbe0,-.09,.28,.04);add(ico(.014),0xd6dbe0,.09,.28,.04)};
 X.bed=(g,add)=>{add(box(.36,.1,.27),0x6b4423,0,.1,0);add(box(.32,.07,.24),0xd6bf7a,0,.17,0);add(box(.14,.04,.2),0xf1ede2,-.1,.225,0)};
 X.rack=(g,add)=>{add(box(.03,.3,.03),0x6b4423,-.14,.16,0);add(box(.03,.3,.03),0x6b4423,.14,.16,0);add(box(.32,.03,.03),0x7a5230,0,.31,0)};
 X.barrel=(g,add)=>{add(cyl(.11,.09,.26,12),0x9a6a38,0,.14,0);add(cyl(.12,.12,.014,12),0x474c53,0,.08,0);add(cyl(.12,.12,.014,12),0x474c53,0,.2,0)};
 X.tpost=(g,add)=>{add(cyl(.02,.028,.5,6),0x6b4423,0,.25,0);add(cyl(.045,.032,.06,7),0x2b2018,0,.52,0)};
 X.snare=(g,add)=>{add(new THREE.TorusGeometry(.12,.012,5,10,PI),0x7a5230,0,.1,0);add(new THREE.TorusGeometry(.07,.006,4,10),0xd9c08a,0,.1,.02,PI/2,0,0)};
 X.plot=(g,add)=>{add(box(.3,.06,.3),0x4a2f18,0,.1,0);add(box(.26,.03,.05),0x5a3a1e,0,.14,-.06);add(box(.26,.03,.05),0x5a3a1e,0,.14,.06)};
}
})();
