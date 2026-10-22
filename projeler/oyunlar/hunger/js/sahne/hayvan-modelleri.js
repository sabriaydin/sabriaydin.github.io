/* Hunger 3D - sahne: hayvan modelleri (gövde + bağımsız hareket eden bacaklar), pürüzsüz ve boyalı */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {blob,rbox,merge,part,cyl,cone,alongPart,fb3}=sc.g;
const AM=sc.ANIM={};
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const col=h=>new THREE.Color(h);
let seed=100;
/* kısayol: gürültülü küre parçası; o: {d,amp,s,rx,ry,rz,cf,jit} */
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{
 o=o||{};
 const p=part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.05:o.amp,o.s||(++seed),sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.jit);
 if(o.cf)p.cf=o.cf;return p;
};
/* tüy dokusu: ince çizgilenme, karın açığı, sırt koyuluğu */
function fur(o){
 o=o||{};const bel=o.belly!==undefined?col(o.belly):null,bk=o.back!==undefined?col(o.back):null,st=o.st===undefined?.28:o.st,fq=o.fq||16;
 return (x,y,z,nx,ny,nz,c)=>{
  const s=fb3(x*fq,y*fq*.8,z*fq,31);c.multiplyScalar(1-st*.5+st*s);
  if(bel&&ny<-.2)c.lerp(bel,Math.min(1,(-ny-.2)*2.2));
  if(bk&&ny>.55)c.lerp(bk,Math.min(1,(ny-.55)*1.8)*(o.bk||.6));
  if(o.x)o.x(x,y,z,nx,ny,nz,c);
 };
}
/* göz: koyu küre + küçük parıltı (iki yanda) */
function eyes(x,y,z,r,iris){
 const out=[];
 for(const s of [-1,1]){
  out.push(Bp(r,iris||0x16110e,s*x,y,z,1,1,1,{d:1,amp:0}));
  out.push(Bp(r*.32,0xffffff,s*x+s*r*.25,y+r*.4,z+r*.55,1,1,1,{d:0,amp:0,jit:0}));
 }
 return out;
}
/* bacak: kalça orijinde; uyluk, diz/bilek eklemi, ince alt bacak ve çatal toynak */
function leg(len,r,c,hoof,o){
 o=o||{};const cf=o.cf||fur({st:.2});
 const ps=[
  Bp(r*1.7,c,0,-len*.2,0,1,1.8,1.25,{d:1,amp:.04,cf}),
  part(cyl(r*1.0,r*.72,len*.5,8,1),c,0,-len*.45,0),
  Bp(r*.85,c,0,-len*.5,r*.1,1,1,1,{d:1,amp:.04,cf}),
  part(cyl(r*.68,r*.5,len*.46,8,1),o.low||c,0,-len*.74,r*.05),
  Bp(r*.62,o.low||c,0,-len*.93,r*.12,1,.8,1.2,{d:1,amp:.03}),
  Bp(r*.85,hoof,0,-len+r*.32,r*.38,.9,.7,1.45,{d:1,amp:.04,jit:.05})
 ];
 ps[1].cf=cf;ps[3].cf=cf;
 return merge(ps,{jit:.06});
}
/* parçalama: baş, kuyruk (ve kollar) ayrı geometri olur; menteşe noktası orijine taşınır, böylece ayrı hareket ettirilebilir */
const PEND={};
const pos3=p=>[p.m.elements[12],p.m.elements[13],p.m.elements[14]];
function pivotGeo(list,pv){
 if(!list.length)return null;
 const g=merge(list,{jit:.05});g.translate(-pv[0],-pv[1],-pv[2]);return g;
}
function SPLIT(name,list,opt,rule){
 const head=[],tail=[],body=[];
 for(const p of list){const [x,y,z]=pos3(p);if(rule.head(x,y,z))head.push(p);else if(rule.tail&&rule.tail(x,y,z))tail.push(p);else body.push(p)}
 PEND[name]={head:pivotGeo(head,rule.hp),headP:rule.hp,tail:pivotGeo(tail,rule.tp),tailP:rule.tp};
 return merge(body,opt);
}
S.onInit(()=>{
 /* ---- Koyun ---- */
 {
  const dark=0x3b3633,wool=0xf0ede4,skin=0xe6b9a2,pinkN=0xd49a98;
  const wcf=(x,y,z,nx,ny,nz,c)=>{const v=fb3(x*9,y*9,z*9,40);c.multiplyScalar(.9+v*.18);if(ny<-.25)c.multiplyScalar(.86)};
  const hcf=fur({st:.3,fq:22});
  const head=[
   Bp(.17,dark,0,1.0,.88,.9,1.02,1.25,{cf:hcf}),Bp(.1,dark,0,.93,1.04,.85,.85,1.35,{cf:hcf}),Bp(.05,pinkN,0,.935,1.15,1.1,.8,.7,{d:1}),
   Bp(.07,0x2a2523,0,.87,1.0,.9,.7,1.2,{d:1}),
   ...eyes(.105,1.04,.99,.026,0x6b5a1a),
   Bp(.075,dark,.19,1.03,.82,1.7,.34,1,{d:1,rz:.55,cf:hcf}),Bp(.075,dark,-.19,1.03,.82,1.7,.34,1,{d:1,rz:-.55,cf:hcf}),
   Bp(.012,0x151010,.03,.945,1.19,1,1,1,{d:0,amp:0}),Bp(.012,0x151010,-.03,.945,1.19,1,1,1,{d:0,amp:0}),
   Bp(.11,wool,0,1.14,.76,1,.8,1,{amp:.22,cf:wcf})
  ];
  const bodyW=[Bp(.56,wool,0,.82,0,1,.82,1.3,{d:3,amp:.2,cf:wcf})];
  [[.3,.98,.5],[-.3,.98,.5],[.34,.9,-.45],[-.34,.9,-.45],[0,1.2,.1],[0,1.1,-.5],[0,1.05,.6],[.4,.72,.1],[-.4,.72,.1],[0,.62,.2]].forEach((q,i)=>bodyW.push(Bp(.28,wool,q[0],q[1],q[2],1,.9,1,{amp:.25,cf:wcf})));
  bodyW.push(Bp(.24,wool,0,.98,.68,1,1,1.1,{amp:.22,cf:wcf}),Bp(.09,wool,0,.82,-.74,1,1,1,{amp:.2,cf:wcf}));
  AM.sheep={
   body:SPLIT('sheep',[...bodyW,...head],{ao:.72,jit:.05},{head:(x,y,z)=>z>=.74&&y>.85,hp:[0,.95,.62],tail:(x,y,z)=>z<=-.68&&y>.7,tp:[0,.82,-.7]}),
   bodyS:merge([Bp(.45,skin,0,.76,0,1,.78,1.25,{d:3,amp:.07,cf:fur({st:.12,fq:10})}),Bp(.26,skin,0,.8,.45,1,.95,1),Bp(.25,skin,0,.8,-.4,1,.95,1),...head.slice(0,-1).map(p=>p),Bp(.07,skin,0,.76,-.58,1,1,1)],{ao:.8,jit:.05}),
   leg:leg(.55,.05,dark,0x16120f,{cf:fur({st:.25,fq:24})}),legs:[[.2,.58,.38],[-.2,.58,.38],[.2,.58,-.38],[-.2,.58,-.38]]
  };
 }
 /* ---- İnek ---- */
 {
  const white=0xf1eee8,pink=0xe6a8a0,horn=0xe9e0c8,blk=0x161313;
  const patch=(x,y,z,nx,ny,nz,c)=>{const v=fb3(x*1.3+3,y*1.3,z*1.3,21);if(v>.54)c.setRGB(.065,.058,.058);else if(v>.51)c.lerp(grey,.5)};
  const cow0=fur({st:.18,fq:18,belly:0xd9d4c8}),grey=new THREE.Color(.3,.28,.26);
  const cf=(x,y,z,nx,ny,nz,c)=>{cow0(x,y,z,nx,ny,nz,c);patch(x,y,z,nx,ny,nz,c)};
  const P=(r,x,y,z,sx,sy,sz,o)=>Bp(r,white,x,y,z,sx,sy,sz,Object.assign({cf,amp:.05},o||{}));
  const ps=[
   P(.78,0,1.2,0,.85,.75,1.6,{d:3,amp:.06}),P(.55,0,1.25,-.8,1,.95,1),P(.58,0,1.28,.7,1,1,1),P(.38,0,1.66,.55,.8,.55,1.1),
   P(.2,.4,1.55,-.78,1,.7,1),P(.2,-.4,1.55,-.78,1,.7,1),
   P(.33,0,1.52,1.18,1,1,1.45),P(.27,0,1.43,1.4,.9,.9,1.3),
   P(.27,0,1.5,1.62,.92,.95,1.3),
   Bp(.16,pink,0,1.37,1.99,1.1,.85,1.1,{cf:fur({st:.08})}),Bp(.12,pink,0,1.34,2.1,1.1,.75,.7,{d:1}),
   Bp(.022,blk,.06,1.37,2.2,1,1,1,{d:0,amp:0}),Bp(.022,blk,-.06,1.37,2.2,1,1,1,{d:0,amp:0}),
   ...eyes(.2,1.58,1.68,.042),
   Bp(.1,white,.32,1.56,1.52,1.3,.45,1,{d:1,rz:.35,cf}),Bp(.1,white,-.32,1.56,1.52,1.3,.45,1,{d:1,rz:-.35,cf}),
   Bp(.055,pink,.32,1.56,1.53,1,.3,.7,{d:1,rz:.35}),Bp(.055,pink,-.32,1.56,1.53,1,.3,.7,{d:1,rz:-.35}),
   alongPart(cone(.055,.16,6,1),horn,V(.15,1.71,1.55),V(.9,.7,0),.16),alongPart(cone(.04,.16,6,1),horn,V(.32,1.78,1.55),V(.4,1,0),.16),
   alongPart(cone(.055,.16,6,1),horn,V(-.15,1.71,1.55),V(-.9,.7,0),.16),alongPart(cone(.04,.16,6,1),horn,V(-.32,1.78,1.55),V(-.4,1,0),.16),
   Bp(.1,0xd8cbb0,0,1.72,1.52,1.1,.6,1,{cf:fur()}),
   Bp(.2,white,0,1.2,1.3,.5,1.1,.8,{cf}),
   Bp(.22,pink,0,.8,-.5,1.05,.85,1.1,{cf:fur({st:.1})}),
   ...[[.07,-.38],[-.07,-.38],[.07,-.6],[-.07,-.6]].map(q=>alongPart(cone(.022,.09,6,1),0xd48f88,V(q[0],.66,q[1]),V(0,-1,0),.09)),
   alongPart(cyl(.026,.034,.95,6),white,V(0,1.62,-1.32),V(0,-1,-.2),.95),Bp(.08,blk,0,.62,-1.5,.8,1.6,.8,{d:1})
  ];
  AM.cow={
   body:SPLIT('cow',ps,{ao:.76,jit:.04},{head:(x,y,z)=>z>=1.4&&y>1.2,hp:[0,1.5,1.2],tail:(x,y,z)=>z<=-1.3,tp:[0,1.62,-1.3]}),
   leg:leg(.9,.095,0xe8e3da,0x241c1a,{cf,low:0xdcd6ca}),legs:[[.36,.9,.74],[-.36,.9,.74],[.36,.9,-.8],[-.36,.9,-.8]]
  };
 }
 /* ---- Tavşan ---- */
 {
  const fur0=0x9d8468,light=0xd8c9b0,cf=fur({belly:0xe0d4bc,back:0x7d6648,st:.34,fq:30});
  const w=[];
  for(const s of [-1,1]){
   w.push(alongPart(cyl(.0025,.002,.12,3),0xe8e0d0,V(s*.035,.345,.41),V(s*1,.08,.35),.12));
   w.push(alongPart(cyl(.0025,.002,.11,3),0xe8e0d0,V(s*.035,.335,.41),V(s*1,-.15,.3),.11));
  }
  AM.rabbit={
   body:SPLIT('rabbit',[
    Bp(.19,fur0,0,.27,0,1,.95,1.35,{cf}),Bp(.13,fur0,.1,.26,-.1,1,1.1,1.2,{cf}),Bp(.13,fur0,-.1,.26,-.1,1,1.1,1.2,{cf}),
    Bp(.11,fur0,0,.3,.14,1,1,1.2,{cf}),Bp(.1,fur0,0,.37,.27,.9,.95,1.2,{cf}),
    Bp(.055,light,0,.345,.37,.9,.8,1.1,{cf:fur()}),Bp(.026,0xd88a8a,0,.35,.43,1,.8,.8,{d:1,amp:0}),
    Bp(.05,fur0,.05,.34,.33,1,.9,1,{cf}),Bp(.05,fur0,-.05,.34,.33,1,.9,1,{cf}),
    ...eyes(.062,.41,.31,.022),
    Bp(.05,fur0,.045,.57,.24,.45,2.9,.8,{rx:-.28,rz:.12,cf}),Bp(.05,fur0,-.045,.57,.24,.45,2.9,.8,{rx:-.28,rz:-.12,cf}),
    Bp(.034,0xe7a9a2,.045,.57,.255,.3,2.5,.5,{d:1,rx:-.28,rz:.12}),Bp(.034,0xe7a9a2,-.045,.57,.255,.3,2.5,.5,{d:1,rx:-.28,rz:-.12}),
    Bp(.075,0xf3efe8,0,.31,-.3,1,1,1,{amp:.18,cf:fur({st:.15})}),...w],{ao:.8,jit:.05},{head:(x,y,z)=>z>=.23&&y>=.3,hp:[0,.33,.2],tail:(x,y,z)=>z<=-.28,tp:[0,.3,-.28]}),
   leg:leg(.2,.04,light,0x7a6850,{cf:fur({st:.22,fq:30})}),legs:[[.09,.22,.14],[-.09,.22,.14],[.1,.22,-.16],[-.1,.22,-.16]]
  };
 }
 /* ---- Geyik ---- */
 {
  const coat=0xa3693a,belly=0xe6d3b4,ant=0xd7c7a3,dk=0x6b4226;
  const spC=col(0xf0e2c8),spots=(x,y,z,nx,ny,nz,c)=>{if(ny>.15&&fb3(x*11,y*11,z*11,44)>.7&&y>1.1&&Math.abs(x)<.45)c.lerp(spC,.55)};
  const cf=fur({belly,back:dk,bk:.55,st:.22,fq:18,x:spots});
  const P=(r,x,y,z,sx,sy,sz,o)=>Bp(r,coat,x,y,z,sx,sy,sz,Object.assign({cf,amp:.05},o||{}));
  const antl=[];
  for(const s of [-1,1]){
   antl.push(alongPart(cyl(.016,.03,.6,6),ant,V(s*.08,2.36,1.0),V(s*.5,1,-.2),.6));
   antl.push(alongPart(cyl(.013,.02,.34,6),ant,V(s*.22,2.67,.93),V(s*.9,1,.3),.34));
   antl.push(alongPart(cyl(.012,.02,.34,6),ant,V(s*.26,2.8,.88),V(s*.1,1,-.6),.34));
   antl.push(alongPart(cyl(.011,.018,.24,6),ant,V(s*.22,2.55,1.0),V(s*.3,1,.9),.24));
   antl.push(alongPart(cyl(.01,.016,.22,6),ant,V(s*.3,2.74,.9),V(s*.6,1,.1),.22));
   antl.push(alongPart(cone(.014,.1,5,1),ant,V(s*.3,2.84,.88),V(s*.1,1,-.5),.1));
   antl.push(Bp(.03,dk,s*.08,2.34,1.0,1,.8,1,{d:1}));
  }
  AM.deer={
   body:SPLIT('deer',[
    P(.56,0,1.32,0,.78,.72,1.6,{d:3,amp:.05}),P(.4,0,1.42,.6,.8,.95,1),P(.42,0,1.36,-.5,.85,.9,1.05),
    P(.22,0,1.6,.8,.7,.7,1.2),
    alongPart(cyl(.12,.2,.85,10,1),coat,V(0,1.5,.7),V(0,1,.55),.85),
    P(.19,0,1.85,.88,.9,1.1,1.1),P(.14,0,2.1,1.0,.9,1,1.1),
    P(.17,0,2.22,1.1,.95,.95,1.35),P(.09,0,2.14,1.31,.8,.78,1.3),
    Bp(.028,0x1a110c,0,2.16,1.44,1.2,.9,.9,{d:1,amp:0}),
    ...eyes(.092,2.27,1.15,.03),
    Bp(.09,coat,.17,2.33,.97,.42,1.8,.7,{rz:.75,cf,d:1}),Bp(.09,coat,-.17,2.33,.97,.42,1.8,.7,{rz:-.75,cf,d:1}),
    Bp(.055,0xe9d9c0,.17,2.33,.99,.3,1.5,.5,{rz:.75,d:1}),Bp(.055,0xe9d9c0,-.17,2.33,.99,.3,1.5,.5,{rz:-.75,d:1}),
    Bp(.1,0xf1ece0,0,1.4,-.9,1,1.15,.7,{cf:fur({st:.1})}),
    alongPart(cone(.06,.2,6,1),coat,V(0,1.55,-.97),V(0,.6,-1),.2),
    Bp(.14,0xd9c9a8,0,1.9,.78,1.1,1.2,1,{cf:fur({st:.3,fq:22})}),
    ...antl],{ao:.8,jit:.05},{head:(x,y,z)=>y>=1.95&&z>=.8,hp:[0,1.85,.85],tail:(x,y,z)=>z<=-.9&&y>1.3,tp:[0,1.5,-.92]}),
   leg:leg(1.1,.05,coat,0x241810,{cf,low:0x7a5230}),legs:[[.2,1.15,.62],[-.2,1.15,.62],[.2,1.15,-.55],[-.2,1.15,-.55]]
  };
 }
 /* ---- Kurt ---- */
 {
  const fr=0x6c6b6e,dk=0x37363b,lt=0xb9b4ac;
  const mk=col(0xcfcac0),mask=(x,y,z,nx,ny,nz,c)=>{if(z>1.05&&ny<.2)c.lerp(mk,.6)};
  const cf=fur({belly:lt,back:dk,bk:.6,st:.34,fq:20,x:mask});
  const P=(r,x,y,z,sx,sy,sz,o)=>Bp(r,fr,x,y,z,sx,sy,sz,Object.assign({cf,amp:.07},o||{}));
  const ear=s=>[Bp(.07,dk,s*.1,1.27,.9,.5,1.3,.55,{d:1,rz:s*.25,rx:-.1,cf}),Bp(.04,0xcaa49a,s*.1,1.25,.93,.35,1,.3,{d:1,rz:s*.25,rx:-.1})];
  AM.wolf={
   body:SPLIT('wolf',[
    P(.42,0,.86,0,.78,.86,1.75,{d:3}),P(.33,0,.97,.5,1,1.1,1.05),
    P(.3,0,.97,.78,1.05,1.05,.9,{amp:.2}),                  /* boyun tüy yelesi */
    P(.2,0,1.03,1.0,.95,.95,1.15),
    Bp(.13,dk,0,.97,1.25,.85,.8,1.75,{cf}),Bp(.085,lt,0,.89,1.24,.8,.55,1.6,{cf}),
    Bp(.04,0x0a0a0a,0,1.0,1.5,1.1,.8,.8,{d:1,amp:0}),
    ...ear(1),...ear(-1),
    Bp(.032,0xe3b94a,.075,1.06,1.13,1,.8,1,{d:1,amp:0,rz:.3}),Bp(.032,0xe3b94a,-.075,1.06,1.13,1,.8,1,{d:1,amp:0,rz:-.3}),
    Bp(.014,0x090909,.075,1.06,1.155,1,1,1,{d:0,amp:0,jit:0}),Bp(.014,0x090909,-.075,1.06,1.155,1,1,1,{d:0,amp:0,jit:0}),
    P(.24,0,.72,.5,.8,.7,1.2,{amp:.05}),
    alongPart(cone(.1,.58,7,1),fr,V(0,.9,-.84),V(0,-.5,-1),.58,1,1.2),Bp(.07,dk,0,.55,-1.28,.9,.9,1.5,{cf}),
    alongPart(cone(.012,.07,4,1),0xe9e4d8,V(.022,.9,1.46),V(0,-.8,.3),.07),alongPart(cone(.012,.07,4,1),0xe9e4d8,V(-.022,.9,1.46),V(0,-.8,.3),.07)
   ],{ao:.78,jit:.07},{head:(x,y,z)=>z>=.88&&y>=.88,hp:[0,.97,.78],tail:(x,y,z)=>z<=-.8,tp:[0,.9,-.84]}),
   leg:leg(.58,.062,fr,dk,{cf,low:0x8a8780}),legs:[[.17,.66,.55],[-.17,.66,.55],[.17,.66,-.55],[-.17,.66,-.55]]
  };
 }
 /* ---- Gölge: uzun, ince, kara siluet; gözleri parlar ---- */
 {
  const sk=0x0e0e15,sk2=0x181822;
  /* kumaş: dikey yırtık çizgileri, koyu etek, ara sıra solgun damar parıltısı */
  const rag=(x,y,z,nx,ny,nz,c)=>{const t=fb3(x*7,y*2.4,z*7,7),v=fb3(x*11,y*11,z*11,12);c.multiplyScalar(.62+.7*t);c.multiplyScalar(.7+.3*Math.min(1,y/1.2));if(v>.72){c.r+=(v-.72)*.9;c.g+=(v-.72)*.1}};
  const bone=(x,y,z,nx,ny,nz,c)=>{c.multiplyScalar(.8+.4*fb3(x*20,y*20,z*20,3))};
  const robe=part(cone(.34,1.5,12,1),sk,0,.74,0,1,1,1,0,0,0,.1);robe.cf=rag;
  const chest=part(blob(.26,2,.1,1,.62,2.0,.5),sk2,0,1.35,0,1,1,1,0,0,0,.1);chest.cf=rag;
  const extra=[];
  /* etek şeritleri */
  for(let i=0;i<10;i++){const a=i/10*6.283+.3,ln=.45+((i*37)%7)/12;extra.push(alongPart(cone(.06+(i%3)*.012,ln,4,1),sk,V(Math.cos(a)*.3,.55,Math.sin(a)*.3),V(Math.cos(a)*.18,-1,Math.sin(a)*.18+.05),ln,1,.35))}
  /* kaburgalar ve sırt dikenleri */
  for(let i=0;i<5;i++){const y=1.62-i*.085,w=.19-i*.012;extra.push(part(cyl(.011,.011,w*2,5),0x5a5a68,0,y,.095+i*.004,1,1,1,0,0,Math.PI/2));extra.push(part(cyl(.011,.011,.3,5),0x5a5a68,0,y,.04,1,1,1,0,0,0))}
  for(let i=0;i<6;i++)extra.push(alongPart(cone(.028-i*.002,.15,4,1),0x2c2c38,V(0,1.7-i*.14,-.15),V(0,.45,-1),.15));
  /* boynuzlar ve çene */
  for(const sg of [-1,1]){
   extra.push(alongPart(cone(.024,.4,5,1),0x2a2a30,V(sg*.07,2.22,-.02),V(sg*.55,1,-.35),.4));
   extra.push(alongPart(cone(.014,.2,4,1),0x2a2a30,V(sg*.17,2.43,-.12),V(sg*1.2,.9,-.1),.2));
  }
  extra.push(part(blob(.1,1,.05,6,.7,.7,1.1),sk2,0,2.06,.15));
  extra.push(part(blob(.05,1,.04,8,1.7,.6,.9),0x08080c,0,1.99,.2));
  const arms=[],aL=[],aR=[];
  for(const s of [-1,1]){const arms=s<0?aL:aR;
   arms.push(alongPart(cyl(.03,.05,1.05,6),sk,V(s*.2,1.82,0),V(s*.2,-1,.15),1.05));
   arms.push(alongPart(cyl(.012,.03,.4,5),sk,V(s*.34,.8,.15),V(s*.15,-1,.35),.4));
   for(const k of [-1,-.33,.33,1])arms.push(alongPart(cone(.011,.34,4,1),0x20202a,V(s*.36+k*.022,.42,.2),V(s*.1+k*.14,-1,.55),.34));
  }
  AM.shade={
   body:merge([robe,chest,part(blob(.15,2,.08,2,.85,1.35,1),sk,0,2.12,.02),part(cyl(.04,.06,.2,6),sk,0,1.98,0)].concat(extra),{ao:.9,jit:.08}),
   armL:pivotGeo(aL,[-.2,1.82,0]),armR:pivotGeo(aR,[.2,1.82,0]),armLP:[-.2,1.82,0],armRP:[.2,1.82,0],
   leg:null,legs:[],
   extra:o=>{
    const em=new THREE.MeshBasicMaterial({color:new THREE.Color(3.4,.5,.35),toneMapped:false});
    const g=new THREE.SphereGeometry(.04,7,6);
    o.eyes=[-1,1].map(s=>{
     const e=new THREE.Mesh(g,em);e.position.set(s*.06,2.14,.14);o.body.add(e);
     const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xff3020,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:.9}));
     gl.scale.set(.3,.3,1);e.add(gl);return e;
    });
   }
  };
 }

 /* ---- Yaban domuzu ---- */
 {
  const fr=0x4a392e,dark=0x2a201a,pinkS=0xc89c8c;
  const cf=fur({belly:0x6b5444,back:dark,bk:.6,st:.4,fq:26});
  const P=(r,x,y,z,sx,sy,sz,o)=>Bp(r,fr,x,y,z,sx,sy,sz,Object.assign({cf,amp:.1},o||{}));
  const bristles=[];
  for(let i=0;i<10;i++){const z=-.65+i*.17,y=1.28+Math.sin(i/9*Math.PI)*.08;bristles.push(alongPart(cone(.035,.2+Math.sin(i/9*Math.PI)*.08,4,1),dark,V(0,y-.05,z),V(0,1,.35),.22));}
  AM.boar={
   body:SPLIT('boar',[
    P(.62,0,.85,0,.9,.8,1.5,{d:3}),P(.46,0,1.0,.58,1.05,1.08,1),P(.4,0,.84,-.55,1,.95,1),
    P(.35,0,.86,1.02,.95,.92,1.25),P(.2,0,.82,1.34,.9,.85,1.25),
    Bp(.12,pinkS,0,.76,1.58,1.1,.9,.75,{cf:fur({st:.08}),d:2}),
    Bp(.022,0x1a0f0c,.04,.77,1.66,1,1,1,{d:0,amp:0}),Bp(.022,0x1a0f0c,-.04,.77,1.66,1,1,1,{d:0,amp:0}),
    alongPart(cone(.045,.3,6,1),0xeee3c8,V(.12,.7,1.5),V(.55,1,.35),.3),alongPart(cone(.045,.3,6,1),0xeee3c8,V(-.12,.7,1.5),V(-.55,1,.35),.3),
    ...eyes(.13,.9,1.3,.022),
    Bp(.09,fr,.19,1.08,1.0,.65,1.5,.7,{rz:.35,rx:-.25,cf,d:1}),Bp(.09,fr,-.19,1.08,1.0,.65,1.5,.7,{rz:-.35,rx:-.25,cf,d:1}),
    ...bristles,
    Bp(.05,dark,0,.95,-.9,.7,.7,1,{d:1}),alongPart(cyl(.012,.016,.18,5),dark,V(0,.9,-.92),V(0,.4,-1),.18)
   ],{ao:.78,jit:.09},{head:(x,y,z)=>z>=.95&&y<1.2,hp:[0,.86,.9],tail:(x,y,z)=>z<=-.85,tp:[0,.92,-.88]}),
   leg:leg(.5,.085,fr,0x16100c,{cf,low:0x3a2d24}),legs:[[.26,.55,.6],[-.26,.55,.6],[.26,.55,-.55],[-.26,.55,-.55]]
  };
 }
for(const k in PEND)Object.assign(AM[k],PEND[k]);
});
})();
