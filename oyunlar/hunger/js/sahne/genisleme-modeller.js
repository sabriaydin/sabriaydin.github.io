/* Hunger 3D - büyük güncelleme (51) modelleri: Depo Sandığı, Tabela, Arı Kovanı, Balık Kapanı, yabani arı kovanı, ayı, köpek,
   yerdeki eşya modelleri ve elde tutulan eşya modelleri. Özgün model dosyalarına dokunmaz; mevcut yardımcıları (sc.g) kullanır. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,O=HG.O;
const {cyl,cone,ico,box,merge,part,alongPart,blob,rbox,fb3}=sc.g;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const PI=Math.PI;
let seed=700;
const bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};const p=part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.05:o.amp,o.s||(++seed),sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.jit);if(o.cf)p.cf=o.cf;return p};
const grain=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*30,y*3,z*30,k),g2=fb3(x*9,y*1.5,z*9,k+3);c.multiplyScalar(.78+g*.3+g2*.2)};
const wood=(geo,c,x,y,z,k,rx,ry,rz)=>{const p=part(geo,c,x,y,z,1,1,1,rx||0,ry||0,rz||0,.1);p.cf=grain(k||1);return p};
const plank=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*26,y*2,z*26,k),g2=fb3(x*8,y*1.2,z*8,k+5);c.multiplyScalar(.76+g*.3+g2*.22);const s=Math.abs(Math.sin(y*30));if(s<.07)c.multiplyScalar(.6)};
const bark=k=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*14,y*3,z*14,k),g2=fb3(x*38,y*7,z*38,k+4);c.multiplyScalar(.62+g*.5+g2*.3)};
const wick=k=>(x,y,z,nx,ny,nz,c)=>{const a=Math.sin(x*70+z*70)*.5+.5,b=Math.sin(y*60+z*50)*.5+.5;c.multiplyScalar(.7+a*.2+b*.18+fb3(x*20,y*20,z*20,k)*.18)};
const furCf=(k,st)=>(x,y,z,nx,ny,nz,c)=>{const s=fb3(x*16,y*13,z*16,k);c.multiplyScalar(1-(st||.28)*.5+(st||.28)*s)};
const half=(r,h,seg)=>new THREE.CylinderGeometry(r,r,h,seg||16,1,false,0,PI);

/* ================= yapı modelleri (ızgara karesine oturur, taban y=0, ön yüz +z) ================= */
S.onInit(()=>{
 const M=sc.MODEL;
 /* Depo sandığı: tahta gövde, yarım silindir kapak, demir şeritler, kilit */
 M.chest=merge([
  (()=>{const p=part(rbox(.8,.42,.58,.3,2),0x8a5a30,0,.21,0,1,1,1,0,0,0,.1);p.cf=plank(81);return p})(),
  (()=>{const p=part(half(.29,.8,16),0x7a4f2a,0,.42,0,1,1,1,0,0,PI/2,.1);p.cf=plank(83);return p})(),
  ...[-.26,.26].flatMap(x=>[
   part(rbox(.07,.46,.62,.3,2),0x3a3d42,x,.23,0,1,1,1,0,0,0,.05),
   part(half(.3,.07,16),0x474c53,x,.42,0,1,1,1,0,0,PI/2,.05)
  ]),
  part(rbox(.14,.16,.045,.3,2),0x5b6168,0,.4,.3,1,1,1,0,0,0,.04),part(rbox(.09,.1,.05,.3,2),0xd9b24a,0,.4,.31),part(box(.018,.05,.05),0x2a1a08,0,.395,.337),
  ...[[-.37,-.26],[.37,-.26],[-.37,.26],[.37,.26]].map(q=>part(rbox(.06,.12,.06,.3,2),0x474c53,q[0],.06,q[1])),
  part(rbox(.78,.03,.03,.3,2),0x5a3a1c,0,.1,.29),part(rbox(.78,.03,.03,.3,2),0x5a3a1c,0,.32,.29)
 ],{ao:.8});
 /* Tabela: direk, çerçeve ve tahta (yazı ayrı bir sprite ile çizilir) */
 M.sign=merge([
  wood(cyl(.05,.06,1.1,7),0x5a3a1e,0,.55,0,91),
  wood(rbox(.9,.5,.05,.3,2),0x6b4423,0,1.05,-.03,92),
  (()=>{const p=part(rbox(.84,.44,.05,.3,2),0xc9a063,0,1.05,0,1,1,1,0,0,0,.08);p.cf=plank(93);return p})(),
  ...[[-.38,.2],[.38,.2],[-.38,-.2],[.38,-.2]].map(q=>part(cyl(.018,.018,.03,6),0x3a3d42,q[0],1.05+q[1],.03,1,1,1,PI/2,0,0)),
  bp(.1,0x7d7d83,0,.04,0,1.3,.5,1.3,{d:1,amp:.2})
 ],{ao:.85});
 /* Arı kovanı: ayaklı tabla, iki gövde, beşik çatı, giriş aralığı ve çevresinde arılar */
 {
  const sl=k=>(x,y,z,nx,ny,nz,c)=>{const s=Math.abs(Math.sin(y*38));c.multiplyScalar(.82+fb3(x*24,y*4,z*24,k)*.3);if(s<.1)c.multiplyScalar(.72)};
  const bees=[[.18,.4,.38],[.3,.55,.36],[-.12,.5,.4],[-.28,.38,.34],[.05,.7,.37]].map((q,i)=>bp(.022,i%2?0x2a1a08:0xf0c030,q[0],q[1],q[2],1,.8,1.3,{d:1,amp:.02,jit:0}));
  M.apiary=merge([
   ...[[-.3,-.22],[.3,-.22],[-.3,.22],[.3,.22]].map((q,i)=>wood(rbox(.08,.3,.08,.3,2),0x5a3a1c,q[0],.15,q[1],101+i)),
   wood(rbox(.78,.05,.62,.3,2),0x6b4423,0,.32,0,105),
   (()=>{const p=part(rbox(.66,.3,.54,.35,2),0xdbb866,0,.5,0,1,1,1,0,0,0,.08);p.cf=sl(106);return p})(),
   (()=>{const p=part(rbox(.66,.3,.54,.35,2),0xe4c47a,0,.8,0,1,1,1,0,0,0,.08);p.cf=sl(107);return p})(),
   part(rbox(.22,.035,.04,.3,1),0x241608,0,.4,.275),part(rbox(.26,.025,.05,.3,1),0x6b4423,0,.355,.3),
   part(cone(.55,.34,4,1),0x7a5230,0,1.15,0,1,1,.9,0,PI/4,0,.1),
   wood(rbox(.78,.04,.06,.3,2),0x5a3a1c,0,.98,.26,108),
   bp(.07,0x7d7d83,0,1.33,0,1,.7,1,{d:1,amp:.2}),
   ...bees
  ],{ao:.8});
 }
 /* Balık kapanı: yatay sepet (hasır), huni ağzı, çemberler ve iki kazık */
 M.ftrap=merge([
  (()=>{const p=part(cyl(.2,.2,.64,12,1),0x9a7340,0,.22,0,1,1,1,PI/2,0,0,.05);p.cf=wick(111);return p})(),
  ...[-.24,0,.24].map(z=>part(new THREE.TorusGeometry(.205,.014,5,14),0x5a3d1a,0,.22,z)),
  (()=>{const p=part(cone(.2,.26,12,1),0x8a6330,0,.22,.45,1,1,1,PI/2,0,0,.04);p.cf=wick(112);return p})(),
  part(cyl(.07,.13,.12,10),0x241608,0,.22,.54,1,1,1,PI/2,0,0),
  (()=>{const p=bp(.2,0x8a6330,0,.22,-.32,1,1,.55,{d:1,amp:.04});p.cf=wick(113);return p})(),
  alongPart(cyl(.022,.03,.7,5),0x5a3a1c,V(-.34,-.05,.2),V(.2,1,0),.7),alongPart(cyl(.022,.03,.7,5),0x5a3a1c,V(.34,-.05,.2),V(-.2,1,0),.7)
 ],{ao:.82});
 /* Yabani arı kovanı: içi oyuk ayakta bir kütük, yan deliğinden sarkan petek ve arılar */
 {
  const bees=[[.05,.95,.4],[.2,1.1,.36],[-.14,1.02,.4],[.3,.88,.34],[-.28,1.16,.3],[.0,1.24,.36],[.22,.74,.38]].map((q,i)=>bp(.02,i%2?0x2a1a08:0xf0c030,q[0],q[1],q[2],1,.8,1.3,{d:1,amp:.02,jit:0}));
  M.hivew=merge([
   (()=>{const p=part(cyl(.3,.36,1.5,10,2),0x5d4128,0,.75,0,1,1,1,0,0,0,.14);p.cf=bark(121);return p})(),
   (()=>{const p=part(cyl(.37,.3,.1,10),0x4a3320,0,1.55,0,1,1,1,0,0,0,.1);p.cf=bark(122);return p})(),
   bp(.14,0x1a1008,0,1.05,.28,.9,1.4,.5,{d:2,amp:.04,jit:0}),
   bp(.17,0xe0a82a,0,.9,.3,.85,1.7,.7,{d:2,amp:.08,cf:(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.85+fb3(x*30,y*30,z*30,7)*.3)}}),
   bp(.05,0xffcc4a,.06,.55,.34,.8,1.8,.8,{d:1,amp:.04}),bp(.04,0xffcc4a,-.07,.62,.33,.8,1.6,.8,{d:1,amp:.04}),
   ...[[-.3,.1,.05],[.28,.06,-.1],[.1,.04,.3],[-.1,.05,-.32]].map(q=>bp(.12,0x7d7d83,q[0],q[1],q[2],1,.6,1,{d:1,amp:.2})),
   ...bees
  ],{ao:.78});
 }
 const ST=sc.STRUCT;
 for(const o of [O.CHEST,O.SIGN,O.APIARY,O.FTRAP,O.HIVEW])ST.add(o);
 sc.structModel[O.CHEST]='chest';sc.structModel[O.SIGN]='sign';sc.structModel[O.APIARY]='apiary';sc.structModel[O.FTRAP]='ftrap';sc.structModel[O.HIVEW]='hivew';
 sc.structRot[O.CHEST]=hh=>Math.floor(hh*4)*PI/2;
 sc.structRot[O.SIGN]=hh=>(hh-.5)*.7;
 sc.structRot[O.APIARY]=hh=>Math.floor(hh*4)*PI/2;
 sc.structRot[O.FTRAP]=hh=>hh*6.28;
 sc.structRot[O.HIVEW]=hh=>hh*6.28;

 /* ================= ayı ve köpek ================= */
 const pivot=(list,pv)=>{const g=merge(list,{jit:.05});g.translate(-pv[0],-pv[1],-pv[2]);return g};
 /* bacak: kalça orijinde, aşağı doğru uzanır */
 const legG=(len,r,c,paw,claw)=>{
  const ps=[bp(r*1.7,c,0,-len*.2,0,1,1.8,1.25,{d:1,amp:.04,cf:furCf(5,.2)}),part(cyl(r*1.05,r*.75,len*.55,8,1),c,0,-len*.5,0),bp(r*.95,paw,0,-len+r*.4,r*.5,1,.62,1.5,{d:1,amp:.04,jit:.04})];
  if(claw)for(const x of [-.5,0,.5])ps.push(alongPart(cone(r*.12,r*.5,4,1),claw,V(x*r*.6,-len+r*.3,r*1.3),V(0,-.25,1),r*.5));
  return merge(ps,{jit:.06});
 };
 /* ayı */
 {
  const c=0x4a2f1c,c2=0x5e3f26,lt=0x8a6a48,cf=furCf(41,.32);
  const body=[
   bp(.56,c,0,.88,0,1,.95,1.45,{d:3,cf}),bp(.44,c2,0,1.1,.42,1,1,1,{cf}),bp(.5,c,0,.84,-.5,1,.95,1,{cf}),bp(.34,c,0,.74,.6,1,.9,1,{cf})
  ];
  const hp=[0,1.02,.84],tp=[0,.9,-.98];
  const head=[
   bp(.27,c,0,1.04,.98,1,.95,1.08,{cf:furCf(43,.3)}),bp(.15,lt,0,.93,1.24,.9,.78,1.35,{cf:furCf(44,.2)}),bp(.052,0x0a0806,0,.97,1.43,1.1,.8,.8,{d:1,amp:0}),
   bp(.075,c,.17,1.27,.9,1,1,.7,{d:1}),bp(.075,c,-.17,1.27,.9,1,1,.7,{d:1}),bp(.04,0x8a5a3a,.17,1.27,.94,1,1,.6,{d:1,amp:0}),bp(.04,0x8a5a3a,-.17,1.27,.94,1,1,.6,{d:1,amp:0}),
   bp(.024,0x090706,.1,1.1,1.2,1,1,1,{d:0,amp:0,jit:0}),bp(.024,0x090706,-.1,1.1,1.2,1,1,1,{d:0,amp:0,jit:0}),
   bp(.045,0xf1e6d0,.07,.82,1.38,.6,1.5,.6,{d:1,amp:0}),bp(.045,0xf1e6d0,-.07,.82,1.38,.6,1.5,.6,{d:1,amp:0})
  ];
  sc.ANIM.bear={
   body:merge(body,{ao:.78,jit:.07}),head:pivot(head,hp),headP:hp,tail:pivot([bp(.1,c,0,.9,-1.0,1.1,1.1,1,{d:1,cf})],tp),tailP:tp,
   leg:legG(.66,.14,c2,0x2e1c10,0xe4dcc8),legs:[[.32,.7,.55],[-.32,.7,.55],[.32,.7,-.55],[-.32,.7,-.55]]
  };
 }
 /* köpek */
 {
  const c=0xc58a4a,c2=0x8a5a2c,lt=0xecd9b4,cf=furCf(51,.26);
  const body=[
   bp(.2,c,0,.42,0,.95,.9,1.75,{d:3,cf}),bp(.17,c,0,.45,.2,1,1.05,1,{cf}),bp(.17,c,0,.42,-.22,1,.95,1,{cf}),
   bp(.13,lt,0,.34,.08,.9,.6,1.8,{cf}),bp(.1,c2,0,.55,.02,1,.5,2,{cf,d:1}),
   part(new THREE.TorusGeometry(.092,.014,5,12),0xd9463c,0,.5,.3),bp(.02,0xd9b24a,0,.41,.39,1,1,.6,{d:1,amp:0,jit:0})
  ];
  const hp=[0,.52,.32],tp=[0,.5,-.32];
  const head=[
   bp(.115,c,0,.57,.4,1,.95,1.1,{cf:furCf(53,.2)}),bp(.068,lt,0,.53,.53,.9,.8,1.35,{cf:furCf(54,.15)}),bp(.028,0x1a0f0c,0,.555,.62,1.1,.8,.8,{d:1,amp:0}),
   bp(.065,c2,.1,.6,.36,.5,1.6,.9,{rz:.35,d:1,cf}),bp(.065,c2,-.1,.6,.36,.5,1.6,.9,{rz:-.35,d:1,cf}),
   bp(.022,0x120d0a,.055,.6,.48,1,1,1,{d:0,amp:0,jit:0}),bp(.022,0x120d0a,-.055,.6,.48,1,1,1,{d:0,amp:0,jit:0}),
   bp(.018,0xe87a8a,0,.5,.57,.9,.6,1.4,{d:1,amp:0})
  ];
  const tail=[bp(.04,c,0,.56,-.42,.7,.7,2.4,{rx:-.7,d:1,cf}),bp(.03,lt,0,.66,-.5,.7,.7,1.4,{rx:-.9,d:1})];
  sc.ANIM.dog={
   body:merge(body,{ao:.8,jit:.05}),head:pivot(head,hp),headP:hp,tail:pivot(tail,tp),tailP:tp,
   leg:legG(.34,.052,c,lt,null),legs:[[.115,.34,.26],[-.115,.34,.26],[.115,.34,-.24],[-.115,.34,-.24]]
  };
 }
});

/* ================= yerdeki eşya modelleri ================= */
{
 const B=sc.dropB;
 if(B){
  const bottleP=(body,neck,liq)=>[part(cyl(.07,.075,.2,14),body,0,.1,0),part(cyl(.05,.07,.06,14),body,0,.22,0),part(cyl(.03,.035,.1,12),neck,0,.3,0),part(cyl(.036,.034,.04,10),0x9a6a3c,0,.37,0),part(cyl(.072,.072,.05,14),liq,0,.12,0)];
  const blade=(len,wd,c,x,z,rz)=>alongPart(box(wd,len,.012),c,V(x,.02,z),V(Math.cos(rz||0),0,Math.sin(rz||0)),len);
  B.crate=()=>[part(rbox(.36,.2,.26,.3,2),0x8a5a30,0,.1,0),part(half(.13,.36,12),0x7a4f2a,0,.2,0,1,1,1,0,0,PI/2),part(rbox(.04,.22,.28,.3,2),0x3a3d42,-.12,.11,0),part(rbox(.04,.22,.28,.3,2),0x3a3d42,.12,.11,0),part(rbox(.05,.06,.02,.3,2),0xd9b24a,0,.2,.135)];
  B.sign=()=>[part(cyl(.02,.025,.46,6),0x5a3a1c,0,.2,0,1,1,1,0,0,PI/2*.9),part(rbox(.3,.17,.025,.3,2),0xc9a063,.12,.15,0,1,1,1,0,.3,0),part(rbox(.32,.19,.02,.3,2),0x6b4423,.12,.15,-.012,1,1,1,0,.3,0)];
  B.apiary=()=>[part(rbox(.26,.12,.22,.3,2),0xdbb866,0,.1,0),part(rbox(.26,.12,.22,.3,2),0xe4c47a,0,.22,0),part(cone(.22,.12,4,1),0x7a5230,0,.34,0,1,1,.9,0,PI/4,0),part(rbox(.3,.03,.26,.3,2),0x6b4423,0,.025,0),part(rbox(.09,.02,.02,.3,1),0x241608,0,.1,.115)];
  B.ftrap=()=>[part(cyl(.08,.08,.26,10),0x9a7340,0,.09,0,1,1,1,PI/2,0,0),part(cone(.08,.1,10,1),0x8a6330,0,.09,.17,1,1,1,PI/2,0,0),part(new THREE.TorusGeometry(.082,.007,4,10),0x5a3d1a,0,.09,-.06)];
  B.honey=()=>[part(cyl(.062,.07,.14,14),0xe8a82a,0,.07,0),part(cyl(.065,.065,.035,14),0x8b5a2b,0,.157,0),part(cyl(.07,.07,.015,14),0xf3efe0,0,.1,0),part(cyl(.025,.025,.04,8),0xffb52a,0,.19,0)];
  B.comb=()=>[[0,0],[.08,.045],[-.08,.045],[0,.09],[.08,-.045]].map((q,i)=>part(cyl(.045,.045,.03,6),i%2?0xf0c030:0xe0a820,q[0],.02,q[1],1,1,1,0,.3,0));
  B.apple=()=>[part(blob(.07,2,.03,610,1,.9,1),0xc8281f,0,.07,0),part(cyl(.006,.006,.04,4),0x4a2f18,0,.145,0),part(blob(.016,1,.1,611,1.6,.3,.8),0x5aa04a,.02,.14,0,1,1,1,0,0,.4)];
  B.herb=()=>{const ps=[];for(let i=0;i<5;i++){const a=i*1.25;ps.push(alongPart(cyl(.004,.004,.2,4),0x3a7a30,V(0,.01,0),V(Math.cos(a)*.5,1,Math.sin(a)*.5),.2));ps.push(part(blob(.04,1,.1,620+i,1,.18,2),0x4a9a3e,Math.cos(a)*.09,.19,Math.sin(a)*.09,1,1,1,0,-a,.5))}ps.push(part(blob(.018,1,.05,630),0xf4f0e0,0,.24,0));return ps};
  B.tea=()=>bottleP(0xbfe6f0,0xcfe8ee,0x8a7a2a);
  B.cake=()=>[part(cyl(.11,.11,.07,16),0xc4833c,0,.04,0),part(cyl(.108,.108,.014,16),0xffcc4a,0,.082,0),part(blob(.022,1,.05,640),0xc42d3a,0,.11,0)];
  B.fur=()=>[part(blob(.15,2,.1,650,1.5,.14,1.2),0x7a4a24,0,.03,0,1,1,1,0,.3,0),part(blob(.1,2,.1,651,1.4,.12,1),0x8a5a2c,.03,.045,.02,1,1,1,0,.5,0)];
  B.shovel=()=>[alongPart(cyl(.015,.018,.6,6),0x8a5a30,V(-.38,.02,0),V(1,0,0),.6),part(rbox(.2,.012,.14,.3,2),0xaab0b8,.34,.025,0),part(box(.04,.025,.1),0x3a3d42,.23,.03,0)];
  B.club=()=>[alongPart(cyl(.018,.03,.5,6),0x8f5d31,V(-.3,.03,0),V(1,0,0),.5),alongPart(cyl(.052,.036,.3,7),0x7a4f2a,V(.18,.05,0),V(1,0,0),.3),part(ico(.012),0xaab0b8,.28,.1,.03)];
  B.sword2=()=>[blade(.62,.05,0xe2834a,-.05,0),part(box(.04,.03,.2),0x7a3a14,-.08,.025,0),alongPart(cyl(.016,.016,.16,6),0x6b3a20,V(-.24,.02,0),V(1,0,0),.16),part(ico(.026),0xd9b24a,-.26,.02,0)];
  B.sword3=()=>[blade(.7,.05,0xc3c9d0,-.05,0),part(box(.04,.03,.22),0x3a3d42,-.08,.025,0),alongPart(cyl(.016,.016,.16,6),0x2a2a30,V(-.24,.02,0),V(1,0,0),.16),part(ico(.026),0xd6dbe0,-.26,.02,0)];
  B.shield=()=>[part(cyl(.19,.19,.04,18),0x8f5d31,0,.03,0),part(new THREE.TorusGeometry(.19,.015,5,18),0x474c53,0,.05,0,1,1,1,PI/2,0,0),part(cyl(.06,.06,.03,12),0xaab0b8,0,.065,0),part(box(.38,.012,.06),0x3a3d42,0,.052,0)];
  B.shield2=()=>[part(cyl(.2,.2,.03,6),0x8d939a,0,.025,0,1,1,1,0,PI/6,0),part(cyl(.07,.07,.03,12),0xd9463c,0,.055,0),part(box(.4,.012,.05),0x3a3d42,0,.045,0),part(box(.05,.012,.38),0x3a3d42,0,.045,0)];
  B.furcoat=()=>[part(rbox(.32,.06,.38,.35,3),0x7a4a24,0,.04,0),part(blob(.1,2,.1,660,2,.5,.8),0xefe6d2,0,.09,-.14),part(rbox(.07,.07,.2,.3,2),0x5a3418,-.19,.05,.05),part(rbox(.07,.07,.2,.3,2),0x5a3418,.19,.05,.05)];
  B.cloak=()=>[part(rbox(.34,.05,.4,.35,3),0x2f6a7a,0,.03,0),part(blob(.1,2,.1,670,1.6,.5,.8),0x1d3a44,0,.07,-.14),part(blob(.022,1,0,671),0xd9b24a,0,.07,-.06)];
  B.boots=()=>[-.07,.07].map(x=>[part(rbox(.09,.2,.1,.3,2),0x7a4a24,x,.1,0),part(rbox(.09,.07,.17,.3,2),0x7a4a24,x,.04,.07),part(rbox(.095,.03,.2,.3,2),0x2a1608,x,.015,.06)]).flat();
  B.tmap=()=>[part(rbox(.28,.012,.2,.4,2),0xe8d29a,0,.012,0,1,1,1,0,.2,0),part(cyl(.022,.022,.22,8),0xd9bf80,-.12,.03,0,1,1,1,PI/2,.2,0),part(box(.04,.014,.014),0xc42d3a,.04,.022,.02,1,1,1,0,.6,0),part(box(.04,.014,.014),0xc42d3a,.04,.022,.02,1,1,1,0,-.6,0)];
  B.puppy=()=>[part(blob(.07,2,.05,680,1,.9,1.4),0xc58a4a,0,.08,0),part(blob(.05,2,.04,681,1,1,1),0xc58a4a,0,.12,.09),part(blob(.022,1,.04,682,.8,1.3,.8),0x6b3f20,.04,.14,.09),part(blob(.022,1,.04,683,.8,1.3,.8),0x6b3f20,-.04,.14,.09),part(blob(.016,1,0,684),0x1a0f0c,0,.115,.14)];
 }
}

/* ================= elde tutulan eşya modelleri: sap +Y ekseninde, uç yukarıda ================= */
{
 const X=sc.heldX=sc.heldX||{};
 const sq=(geo,x,y,z)=>{geo.scale(x,y,z);return geo};
 X.crate=(g,add)=>{add(box(.3,.2,.22),0x8a5a30,0,.14,0);add(half(.11,.3,10),0x7a4f2a,0,.24,0,0,0,PI/2);add(box(.035,.24,.23),0x3a3d42,-.1,.15,0);add(box(.035,.24,.23),0x3a3d42,.1,.15,0);add(box(.06,.06,.02),0xd9b24a,0,.24,.115)};
 X.sign=(g,add)=>{add(cyl(.02,.026,.5,6),0x5a3a1c,0,.2,0);add(box(.34,.2,.025),0x6b4423,0,.42,-.012);add(box(.3,.17,.03),0xc9a063,0,.42,0)};
 X.apiary=(g,add)=>{add(box(.22,.1,.18),0xdbb866,0,.08,0);add(box(.22,.1,.18),0xe4c47a,0,.18,0);add(cone(.19,.11,4),0x7a5230,0,.29,0,0,PI/4,0);add(box(.07,.015,.015),0x241608,0,.08,.092)};
 X.ftrap=(g,add)=>{add(cyl(.085,.085,.28,10),0x9a7340,0,.14,0,PI/2,0,0);add(cone(.085,.1,10),0x8a6330,0,.14,.18,PI/2,0,0);add(cyl(.087,.087,.012,10),0x5a3d1a,0,.14,-.04,PI/2,0,0)};
 X.honey=(g,add)=>{add(cyl(.06,.068,.14,12),0xe8a82a,0,.1,0);add(cyl(.064,.064,.03,12),0x8b5a2b,0,.185,0);add(cyl(.068,.068,.014,12),0xf3efe0,0,.13,0)};
 X.comb=(g,add)=>{for(const [x,z,c] of [[0,0,0xf0c030],[.07,.04,0xe0a820],[-.07,.04,0xe0a820],[0,.09,0xf0c030]])add(cyl(.045,.045,.03,6),c,x,.1,z,0,.3,0)};
 X.apple=(g,add)=>{add(sq(ico(.07),1,.9,1),0xc8281f,0,.1,0);add(cyl(.006,.006,.04,4),0x4a2f18,0,.18,0);add(sq(ico(.016),1.8,.3,.8),0x5aa04a,.02,.17,0)};
 X.herb=(g,add)=>{for(let i=0;i<5;i++){const a=i*1.25;add(cyl(.004,.004,.2,4),0x3a7a30,Math.cos(a)*.02,.14,Math.sin(a)*.02,Math.sin(a)*.25,0,-Math.cos(a)*.25);add(sq(ico(.04),1,.2,2),0x4a9a3e,Math.cos(a)*.07,.25,Math.sin(a)*.07,Math.sin(a)*.5,-a,.4)}add(ico(.018),0xf4f0e0,0,.3,0)};
 X.tea=(g,add)=>{add(cyl(.05,.055,.18,10),0xbfe6f0,0,.1,0);add(cyl(.042,.042,.08,10),0x8a7a2a,0,.07,0);add(cyl(.022,.028,.07,10),0xcfe8ee,0,.23,0);add(cyl(.026,.024,.03,8),0x9a6a3c,0,.275,0)};
 X.cake=(g,add)=>{add(cyl(.1,.1,.07,14),0xc4833c,0,.1,0);add(cyl(.098,.098,.014,14),0xffcc4a,0,.14,0);add(ico(.02),0xc42d3a,0,.16,0)};
 X.fur=(g,add)=>{add(box(.3,.03,.24),0x7a4a24,0,.12,0,0,.2,0);add(sq(ico(.12),1.6,.2,1.2),0x8a5a2c,0,.15,0,0,.4,0)};
 X.shovel=(g,add)=>{add(cyl(.016,.02,.9,6),0x8a5a30,0,.32,0);add(box(.08,.025,.025),0x3a2a1a,0,.78,0);add(box(.13,.2,.016),0xaab0b8,0,-.2,0);add(box(.05,.06,.02),0x3a3d42,0,-.08,0)};
 X.club=(g,add)=>{add(cyl(.018,.026,.5,6),0x8f5d31,0,.15,0);add(cyl(.05,.034,.3,7),0x7a4f2a,0,.52,0);add(ico(.012),0xaab0b8,.04,.55,.03)};
 const sword=(add,bl,edge,guard,grip,gold)=>{add(box(.05,.62,.012),bl,0,.45,0);add(box(.018,.6,.014),edge,0,.45,0);add(box(.04,.05,.012),bl,0,.78,0);add(box(.2,.03,.04),guard,0,.12,0);add(cyl(.016,.018,.16,6),grip,0,.03,0);add(ico(.026),gold,0,-.07,0)};
 X.sword2=(g,add)=>sword(add,0xc8743a,0xf3b78a,0x7a3a14,0x6b3a20,0xd9b24a);
 X.sword3=(g,add)=>sword(add,0xc3c9d0,0xf1f4f8,0x3a3d42,0x2a2a30,0xd6dbe0);
 X.shield=(g,add)=>{add(cyl(.2,.2,.03,18),0x8f5d31,0,.2,0,PI/2,0,0);add(new THREE.TorusGeometry(.2,.014,5,18),0x474c53,0,.2,0);add(cyl(.055,.055,.03,12),0xaab0b8,0,.2,.03,PI/2,0,0);add(box(.4,.045,.012),0x3a3d42,0,.2,.02)};
 X.shield2=(g,add)=>{add(cyl(.21,.21,.025,6),0x8d939a,0,.2,0,PI/2,0,PI/6);add(cyl(.065,.065,.03,12),0xd9463c,0,.2,.025,PI/2,0,0);add(box(.42,.03,.012),0x3a3d42,0,.2,.02);add(box(.03,.4,.012),0x3a3d42,0,.2,.02)};
 X.furcoat=(g,add)=>{add(box(.3,.34,.08),0x7a4a24,0,.18,0);add(box(.04,.34,.09),0x5a3418,0,.18,0);add(sq(ico(.09),2.2,.5,.9),0xefe6d2,0,.34,0)};
 X.cloak=(g,add)=>{add(box(.3,.34,.08),0x2f6a7a,0,.18,0);add(box(.2,.12,.09),0x1d3a44,0,.32,0);add(ico(.02),0xd9b24a,0,.3,.05)};
 X.boots=(g,add)=>{for(const x of [-.07,.07]){add(box(.09,.2,.1),0x7a4a24,x,.14,0);add(box(.09,.07,.17),0x7a4a24,x,.07,.06);add(box(.095,.03,.2),0x2a1608,x,.03,.05)}};
 X.tmap=(g,add)=>{add(cyl(.026,.026,.3,8),0xd9bf80,0,.14,0,0,0,PI/2);add(box(.3,.012,.2),0xe8d29a,0,.17,.1,.5,0,0);add(box(.04,.012,.012),0xc42d3a,0,.19,.12,.5,.6,0);add(box(.04,.012,.012),0xc42d3a,0,.19,.12,.5,-.6,0)};
 X.puppy=(g,add)=>{add(sq(ico(.09),1,.9,1.4),0xc58a4a,0,.14,0);add(ico(.06),0xc58a4a,0,.2,.12);add(sq(ico(.025),.8,1.3,.8),0x6b3f20,.05,.22,.12);add(sq(ico(.025),.8,1.3,.8),0x6b3f20,-.05,.22,.12);add(ico(.018),0x1a0f0c,0,.19,.18)};
}

/* ================= gezgin tüccar görünümü ================= */
if(sc.npcLook)sc.npcLook.trader={tun:0x2f5a4a,leg:0x3a3226,hat:0xc07a2a};
sc.npcExtra=(prof,torso,u)=>{
 if(prof!=='trader')return;
 const {part,cyl,rbox,PI2,L}=u;
 torso.push(
  part(rbox(.42,.5,.24,.3,2),0x7a4a24,0,1.15,-.25),part(rbox(.34,.18,.2,.3,2),0x5a3418,0,1.43,-.27),
  part(cyl(.08,.08,.46,8),0x9a8a6a,0,.88,-.27,1,1,1,0,0,PI2),
  part(cyl(.31,.31,.02,14),L.hat,0,1.77,0),part(cyl(.13,.16,.15,10),L.hat,0,1.84,0),part(cyl(.165,.165,.03,10),0x6a3a14,0,1.79,0),
  part(cyl(.11,.12,.07,10),0xd9463c,0,1.5,0),
  part(cyl(.035,.035,.09,6),0xffd070,.27,.86,.06),part(cyl(.012,.012,.1,4),0x3a3226,.27,.96,.06)
 );
};

/* ================= dinamik görseller: tabela yazısı, cenaze haçı, kış karı ================= */
{
 let grp=null,snow=null,snowMat=null,snowVis=0,tAcc=0;
 const vis=new Map();                          /* kare -> {sig,obj,tex}: tabela ve cenaze görselleri */
 const SNOWN=3000;
 const SVS=`
attribute vec4 aS;
uniform vec3 uCam;uniform float uTime,uPx;
varying float vA;
void main(){
 float bx=34.,by=20.,bz=34.;
 float y=mod(aS.y*by-uTime*(1.1+aS.w*.9),by);
 float x=mod(aS.x*bx-uCam.x+bx*.5+sin(uTime*.7+aS.w*20.)*.7,bx)-bx*.5;
 float z=mod(aS.z*bz-uCam.z+bz*.5+cos(uTime*.6+aS.w*17.)*.7,bz)-bz*.5;
 vec3 p=vec3(uCam.x+x,uCam.y+y-by*.4,uCam.z+z);
 float dist=length(p-uCam);
 vA=(1.-smoothstep(12.,18.,dist))*smoothstep(.5,1.5,dist);
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
 gl_PointSize=uPx*(.6+aS.w*.9)/(1.+dist*.05);
}`;
 const SFS=`uniform float uAlpha;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;gl_FragColor=vec4(.95,.97,1.,vA*uAlpha*(1.-d*1.7));}`;

 S.onInit(()=>{
  grp=new THREE.Group();grp.name='genisleme-gorsel';sc.scene.add(grp);
  /* cenaze haçı: ahşap haç ve toprak yığını (sandığın arkasında durur) */
  const M=sc.MODEL;
  M.graveX=merge([
   wood(rbox(.07,.95,.07,.3,2),0x5a3a1e,0,.48,0,141),wood(rbox(.46,.07,.07,.3,2),0x5a3a1e,0,.72,0,142),
   bp(.2,0x4a3a2a,0,.04,.42,1.3,.35,1.6,{d:1,amp:.12})
  ],{ao:.8});
  const n=SNOWN,pos=new Float32Array(n*3),aS=new Float32Array(n*4);
  for(let i=0;i<n;i++){aS[i*4]=Math.random();aS[i*4+1]=Math.random();aS[i*4+2]=Math.random();aS[i*4+3]=Math.random()}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(aS,4));
  snowMat=new THREE.ShaderMaterial({
   uniforms:{uCam:{value:new THREE.Vector3()},uTime:{value:0},uPx:{value:7},uAlpha:{value:0}},
   vertexShader:SVS,fragmentShader:SFS,transparent:true,depthWrite:false,fog:false
  });
  snow=new THREE.Points(g,snowMat);snow.frustumCulled=false;snow.renderOrder=21;snow.visible=false;sc.scene.add(snow);
 });
 S.onQuality(q=>{if(snow)snow.geometry.setDrawRange(0,[700,1400,2200,SNOWN][q])});

 function signTex(text){
  const cv=document.createElement('canvas');cv.width=256;cv.height=128;
  const g=cv.getContext('2d');
  g.clearRect(0,0,256,128);
  g.fillStyle='#2a1a0a';g.textAlign='center';g.textBaseline='middle';
  /* kelimeler satırlara bölünür; yazı sığana kadar küçültülür */
  const words=text.split(' ');
  let size=34,lines=[];
  for(;size>=14;size-=2){
   g.font='700 '+size+'px system-ui,sans-serif';
   lines=[];let ln='';
   for(const w of words){
    const t=ln?ln+' '+w:w;
    if(g.measureText(t).width<=236||!ln)ln=t;else{lines.push(ln);ln=w}
   }
   if(ln)lines.push(ln);
   if(lines.length*size*1.08<=118&&lines.every(l=>g.measureText(l).width<=240))break;
  }
  const lh=size*1.08,y0=64-(lines.length-1)*lh/2;
  lines.forEach((l,i)=>g.fillText(l,128,y0+i*lh));
  const tex=new THREE.CanvasTexture(cv);
  tex.anisotropy=4;if(THREE.sRGBEncoding!==undefined)tex.encoding=THREE.sRGBEncoding;
  return tex;
 }
 function drop(c){
  if(c.obj)grp.remove(c.obj);
  if(c.tex)c.tex.dispose();
  if(c.mat)c.mat.dispose();
  if(c.geo)c.geo.dispose();
 }
 function makeSign(i,e){
  const x=i%HG.W,z=(i-x)/HG.W,hh=HG.hash(x,z,21),rot=(hh-.5)*.7,gy=S.groundY(x+.5,z+.5);
  const tex=signTex(e.tx),geo=new THREE.PlaneGeometry(.8,.4);
  const mat=new THREE.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const m=new THREE.Mesh(geo,mat);m.position.set(0,1.05,.034);
  const g=new THREE.Group();g.position.set(x+.5,gy,z+.5);g.rotation.y=rot;g.add(m);grp.add(g);
  return {obj:g,tex,mat,geo};
 }
 function makeGrave(i){
  const x=i%HG.W,z=(i-x)/HG.W,hh=HG.hash(x,z,21),gy=S.groundY(x+.5,z+.5);
  const m=new THREE.Mesh(sc.MODEL.graveX,sc.MODEL.matPlain);m.castShadow=true;m.receiveShadow=true;
  const g=new THREE.Group();g.position.set(x+.5,gy,z+.5);g.rotation.y=Math.floor(hh*4)*PI/2;m.position.set(0,0,-.45);g.add(m);grp.add(g);
  return {obj:g};
 }
 function syncVis(G){
  const X=G.x2,seen=new Set();
  if(X&&X.s&&!G.cave){
   for(const k in X.s){
    const e=X.s[k],i=+k;
    if(!e)continue;
    const isSign=e.o===O.SIGN&&e.tx,isGrave=e.o===O.CHEST&&e.gr;
    if(!isSign&&!isGrave)continue;
    if(G.obj[i]!==e.o)continue;
    const x=i%HG.W,z=(i-x)/HG.W;
    if(Math.abs(x+.5-G.px)>(isGrave?60:20)||Math.abs(z+.5-G.py)>(isGrave?60:20))continue;
    seen.add(i);
    const sig=isSign?'s'+e.tx:'g';
    let c=vis.get(i);
    if(c&&c.sig!==sig){drop(c);vis.delete(i);c=null}
    if(!c){c=isSign?makeSign(i,e):makeGrave(i);c.sig=sig;vis.set(i,c)}
   }
  }
  for(const [i,c] of vis)if(!seen.has(i)){drop(c);vis.delete(i)}
 }
 S.onFrame((G,t,dt,info)=>{
  const play=info.mode==='play';
  if(grp)grp.visible=play;
  if(play){
   tAcc-=dt;
   if(tAcc<=0){tAcc=.35;try{syncVis(G)}catch(e){}}
  }else if(vis.size){for(const c of vis.values())drop(c);vis.clear()}
  if(!snow)return;
  const tv=(play&&!G.sheltered&&!G.cave&&!G.head)?(sc.snow||0):0;
  snowVis+=(tv-snowVis)*(1-Math.exp(-dt*1.5));
  snow.visible=snowVis>.01;
  if(snow.visible){
   const u=snowMat.uniforms;u.uCam.value.copy(sc.cam.position);u.uTime.value=t;u.uAlpha.value=.85*snowVis;
   u.uPx.value=7*(sc.R&&sc.R.getPixelRatio?sc.R.getPixelRatio():1);
  }
 });
}
})();
