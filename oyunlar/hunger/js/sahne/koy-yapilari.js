/* Hunger 3D - sahne: köy yapıları (evler, çatılar, avlu eşyaları, kuyu, fenerler, patikalar, tabela) */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {blob,rbox,merge,part,cyl,cone,box}=sc.g;
const PI=Math.PI;
let seed=900,mat=null,plm=null,glowMat=null,glowGeo=null;
const vills=[];           /* {g, d:[{mesh,cx,cz}], houses:[{mesh,glow,smoke:[..]}], lamps, cx, cz} */
sc.lamps=[];sc.vills=vills;

const ROOF={farmer:0xb99a4a,hunter:0x7a4a2a,fisher:0xb0a070,smith:0x4a4a50,healer:0xa84a3a,woodcut:0x7a3a2a,miner:0x5a5a62};
const WALL={farmer:0xd8c9a4,hunter:0xb89a6e,fisher:0xc9d3d6,smith:0x8d8d92,healer:0xe9e2d2,woodcut:0xa8794a,miner:0x7f7f86};
const SHUT={farmer:0x4a7a3a,hunter:0x3f5a35,fisher:0x2f6a8a,smith:0x2a2a30,healer:0xb83a3a,woodcut:0x6b2a1e,miner:0x8a6a2a};
const BLANK={farmer:0xb85a4a,hunter:0x4a6a3a,fisher:0x3a6a9a,smith:0x6a4a3a,healer:0xe8e4da,woodcut:0xa83a2e,miner:0x8a7a3a};
const TIMB=0x4a3322,WOOD=0x8a5a30,WOODL=0xb8864f,STONE=0x8d8d92,STONED=0x6a6a70;
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};return part(blob(r,o.d===undefined?1:o.d,o.amp===undefined?.03:o.amp,++seed,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.j)};

/* üçgen prizma (çatı alınlığı): taban 2*hw, yükseklik h, kalınlık t; x ekseni boyunca */
function gable(hw,h,t){
 const sh=new THREE.Shape();sh.moveTo(-hw,0);sh.lineTo(hw,0);sh.lineTo(0,h);sh.lineTo(-hw,0);
 const g=new THREE.ExtrudeGeometry(sh,{depth:t,bevelEnabled:false});return g;
}
const roofCf=(x,y,z,nx,ny,nz,c)=>{if(Math.floor(y*4.2)%2===0)c.multiplyScalar(.82)};
const plankCf=(x,y,z,nx,ny,nz,c)=>{if(Math.floor((x+z)*3.4)%2===0)c.multiplyScalar(.86)};
const stoneCf=(x,y,z,nx,ny,nz,c)=>{const a=Math.floor(x*2.6)+Math.floor(y*3.4)*3+Math.floor(z*2.6)*5;c.multiplyScalar(.8+((a*37)&7)/18)};
const logCf=(x,y,z,nx,ny,nz,c)=>{if(Math.floor(y*3.2)%2===0)c.multiplyScalar(.84)};

/* ---------- ev ---------- */
function houseGeo(h){
 const st=h.stone,wc=WALL[h.prof],P=[];
 const wcf=st?stoneCf:null;
 const W_=(w,hh,d,x,y,z,c)=>{const p=part(box(w,hh,d),c||wc,x,y,z);if(wcf)p.cf=wcf;P.push(p);return p};
 /* kaide taşları */
 P.push(Object.assign(part(box(4.7,.65,.5),STONE,0,.12,-2.05),{cf:stoneCf}),Object.assign(part(box(.5,.65,4.7),STONE,-2.05,.12,0),{cf:stoneCf}),Object.assign(part(box(.5,.65,4.7),STONE,2.05,.12,0),{cf:stoneCf}),
  Object.assign(part(box(1.75,.65,.5),STONE,-1.425,.12,2.05),{cf:stoneCf}),Object.assign(part(box(1.75,.65,.5),STONE,1.425,.12,2.05),{cf:stoneCf}));
 /* duvarlar */
 W_(4.5,2.5,.4,0,1.25,-2);W_(.4,2.5,4.5,-2,1.25,0);W_(.4,2.5,4.5,2,1.25,0);
 W_(1.7,2.5,.4,-1.4,1.25,2);W_(1.7,2.5,.4,1.4,1.25,2);W_(1.1,.5,.4,0,2.25,2);
 /* ahşap çerçeve */
 for(const sx of [-1,1])for(const sz of [-1,1])P.push(part(box(.34,2.62,.34),TIMB,sx*2.05,1.31,sz*2.05));
 if(!st){
  for(const y of [.72,2.48])P.push(part(box(4.7,.14,.46),TIMB,0,y,-2),part(box(.46,.14,4.7),TIMB,-2,y,0),part(box(.46,.14,4.7),TIMB,2,y,0),
   part(box(1.7,.14,.46),TIMB,-1.4,y,2),part(box(1.7,.14,.46),TIMB,1.4,y,2));
  for(const z of [-1,1])P.push(part(box(.46,1.8,.14),TIMB,-2,1.6,z*1.0),part(box(.46,1.8,.14),TIMB,2,1.6,z*1.0));
  P.push(part(box(.14,1.8,.46),TIMB,0,1.6,-2),part(box(.14,1.8,.46),TIMB,-1.7,1.6,2),part(box(.14,1.8,.46),TIMB,1.7,1.6,2));
 }
 /* kapı çerçevesi ve açık kapı kanadı */
 P.push(part(box(.14,2.05,.5),TIMB,-.6,1.02,2),part(box(.14,2.05,.5),TIMB,.6,1.02,2),part(box(1.34,.14,.5),TIMB,0,2.04,2));
 const leaf=part(box(.9,1.95,.07),WOOD,0,0,0);leaf.cf=plankCf;
 leaf.m=new THREE.Matrix4().compose(new THREE.Vector3(-.6+.45*Math.cos(1.25),.98,2.12+.45*Math.sin(1.25)),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-1.25,0)),new THREE.Vector3(1,1,1));
 P.push(leaf,part(cyl(.03,.03,.05,6),0xd9b030,.35,1.0,2.2));
 /* basamak */
 P.push(Object.assign(part(box(1.7,.16,.7),STONE,0,.06,2.6),{cf:stoneCf}));
 /* pencereler: yanlarda ve ön duvarda */
 const win=(x,y,z,ry)=>{
  /* çerçeve + cam + panjur + çiçek sandığı (yerel +z yönüne bakar, ry ile döner) */
  const c=Math.cos(ry),s=Math.sin(ry),T=(lx,ly,lz,w,hh,d,col)=>part(box(w,hh,d),col,x+lx*c+lz*s,y+ly,z-lx*s+lz*c,1,1,1,0,ry,0);
  P.push(T(0,0,.2,.78,.78,.08,TIMB),T(0,0,.24,.62,.62,.06,0x6fa0c0),T(0,0,.27,.04,.62,.05,TIMB),T(0,0,.27,.62,.04,.05,TIMB),
   T(-.5,0,.24,.22,.74,.05,SHUT[h.prof]),T(.5,0,.24,.22,.74,.05,SHUT[h.prof]),
   T(0,-.5,.34,.84,.14,.22,0x6b4423),Bp(.09,0xe86a8a,x+(-.28)*c+.36*s,y-.38,z+.28*s+.36*c,1,.8,1,{d:0}),Bp(.09,0xf6c84a,x+.0*c+.36*s,y-.38,z+.36*c,1,.8,1,{d:0}),Bp(.09,0xe8e4da,x+.28*c+.36*s,y-.38,z-.28*s+.36*c,1,.8,1,{d:0}));
 };
 win(-1.4,1.5,2,0);win(1.4,1.5,2,0);
 win(2.2,1.5,0,PI/2);win(-2.2,1.5,0,-PI/2);
 /* çatı */
 const A=Math.atan2(1.7,2.9),L=Math.hypot(2.9,1.7)+.15;
 const rc=ROOF[h.prof];
 for(const sg of [1,-1]){
  const r=part(box(6.1,.2,L),rc,0,3.3,sg*1.5,1,1,1,sg*A);r.cf=roofCf;P.push(r);
  P.push(part(box(6.1,.1,.14),TIMB,0,2.48,sg*3.03,1,1,1,sg*A*0),part(box(6.1,.08,.1),TIMB,0,3.3-.05,sg*1.5,1,1,1,sg*A));
 }
 P.push(part(box(6.15,.16,.34),TIMB,0,4.15,0,1,1,1,0,0,0));
 for(const sx of [-1,1]){const g=part(gable(2.9,1.7,.4),wc,(sx>0?1.8:-2.2),2.5,0,1,1,1,0,PI/2,0);if(st)g.cf=stoneCf;P.push(g)}
 /* bacası */
 const chx=h.stone?-1.2:1.3;
 P.push(Object.assign(part(box(.7,2.6,.7),STONED,chx,3.5,-1.1),{cf:stoneCf}),part(box(.86,.14,.86),STONE,chx,4.85,-1.1));
 /* tabela (mesleğe özgü) */
 const bx=2.2,bz=2.7;
 P.push(part(cyl(.05,.06,2.3,6),TIMB,bx-.5,1.15,bz),part(box(.7,.05,.05),TIMB,bx-.2,2.3,bz),part(box(.62,.5,.05),WOODL,bx-.05,2.0,bz+.0));
 const emb={farmer:0xe8c84a,hunter:0x4a6a3a,fisher:0x3a8aca,smith:0x3a3a42,healer:0xd9463c,woodcut:0xa83a2e,miner:0xd9b030}[h.prof];
 if(h.prof==='healer')P.push(part(box(.32,.09,.03),emb,bx-.05,2.0,bz+.04),part(box(.09,.32,.03),emb,bx-.05,2.0,bz+.04));
 else if(h.prof==='smith')P.push(part(box(.34,.1,.03),emb,bx-.05,2.06,bz+.04),part(box(.14,.12,.03),emb,bx-.05,1.95,bz+.04));
 else P.push(part(cyl(.17,.17,.03,10),emb,bx-.05,2.0,bz+.04,1,1,1,PI/2,0,0));
 /* iç mekân */
 const fl=part(box(4.0,.1,4.0),0x9a6a3c,0,.05,0);fl.cf=plankCf;P.push(fl);
 P.push(part(box(1.5,.02,1.1),BLANK[h.prof],0,.12,.5));
 /* yatak */
 P.push(part(box(1.0,.32,1.9),WOOD,1.15,.28,-.85),part(box(.9,.16,1.7),BLANK[h.prof],1.15,.5,-.8),Bp(.2,0xeee8dc,1.15,.62,-1.5,1.3,.55,.9,{d:1}));
 /* masa, sandalye, raf, sandık */
 P.push(part(box(1.0,.07,.8),WOODL,-1.1,.82,-1.0),...[[-.42,-.32],[.42,-.32],[-.42,.32],[.42,.32]].map(([a,b])=>part(box(.07,.8,.07),WOOD,-1.1+a,.4,-1.0+b)),
  part(box(.4,.07,.4),WOOD,-1.1,.5,-.2),part(box(.4,.45,.07),WOOD,-1.1,.8,-.04));
 P.push(part(cyl(.07,.06,.14,8),0xc9a15a,-1.3,.9,-1.05),part(cyl(.05,.05,.1,8),0xd9d5c8,-.9,.9,-.9));
 P.push(part(box(1.5,.07,.3),WOOD,-.2,1.5,-1.75),part(box(1.5,.07,.3),WOOD,-.2,1.0,-1.75));
 for(let i=0;i<4;i++){P.push(part(cyl(.06,.06,.2,7),[0x6a8a4a,0xb86a3a,0xc9a15a,0x8a5a8a][i],-.7+i*.34,1.12,-1.75),part(cyl(.05,.05,.16,7),[0xb89a6e,0xd9d5c8,0x6a8a4a,0xc9a15a][i],-.7+i*.34,1.62,-1.75))}
 P.push(part(box(.8,.5,.5),0x6b4423,-1.55,.3,.8),part(box(.82,.08,.52),TIMB,-1.55,.56,.8));
 /* ocak */
 P.push(Object.assign(part(box(1.0,.9,.5),STONE,chx>0?1.3:-1.2,.5,-1.65),{cf:stoneCf}));
 /* sarkıt fener (iç) */
 P.push(part(cyl(.01,.01,.5,4),0x222226,0,2.3,0),part(box(.2,.26,.2),0x2a2a30,0,1.95,0));
 return merge(P,{ao:.82,jit:.07});
}
/* gece yanan pencereler ve iç fener (ışık yayan parça) */
function glowGeoOf(h){
 const P=[];
 for(const [x,z,ry] of [[-1.4,2.28,0],[1.4,2.28,0],[2.28,0,PI/2],[-2.28,0,-PI/2]])P.push(part(box(.6,.6,.03),0xffc060,x,1.5,z,1,1,1,0,ry,0));
 P.push(part(box(.14,.2,.14),0xffd890,0,1.95,0),part(box(.5,.3,.04),0xff9a3a,(h.stone?-1.2:1.3),.55,-1.4));
 return merge(P,{jit:0});
}

/* ---------- avlu eşyaları ---------- */
function decor(e,P,glowP,lamps){
 const c=Math.cos(e.ry||0),s=Math.sin(e.ry||0),ry0=e.ry||0;
 const gy=S.groundY(e.x,e.z);
 const p=(geo,col,lx,ly,lz,sx,sy,sz,rx,ry,rz,cf)=>{const q=part(geo,col,e.x+lx*c+lz*s,gy+ly,e.z-lx*s+lz*c,sx,sy,sz,rx||0,(ry||0)+ry0,rz||0);if(cf)q.cf=cf;P.push(q);return q};
 const bp=(r,col,lx,ly,lz,sx,sy,sz,o)=>{const q=Bp(r,col,0,0,0,sx,sy,sz,o);q.m=new THREE.Matrix4().compose(new THREE.Vector3(e.x+lx*c+lz*s,gy+ly,e.z-lx*s+lz*c),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry0+((o&&o.ry)||0),0)),new THREE.Vector3(1,1,1));P.push(q)};
 const hsh=(a)=>{let x=Math.sin((e.x*12.9898+e.z*78.233+a*37.7))*43758.5453;return x-Math.floor(x)};
 switch(e.k){
 case 'lamp':
  p(cyl(.07,.1,2.5,7),TIMB,0,1.25,0);p(box(.5,.05,.05),TIMB,.2,2.4,0);p(cyl(.03,.03,.3,5),0x222226,.42,2.25,0);
  p(box(.3,.4,.3),0x2a2a30,.42,2.4,0);p(box(.18,.26,.18),0xffcf6a,.42,2.4,0);
  glowP.push(part(box(.2,.28,.2),0xffd890,e.x+.42*c,gy+2.4,e.z-.42*s));
  lamps.push({x:e.x+.42*c,z:e.z-.42*s,y:gy+2.4});
  break;
 case 'crop':
  bp(.3,0x5a4a2a,0,.06,0,1,.2,1,{d:1});
  for(let i=0;i<6;i++){const a=hsh(i)*6.28,r=.08+hsh(i+9)*.28;p(cone(.045,.75,4),i%2?0xd9b84a:0xc9a23a,Math.cos(a)*r,.42,Math.sin(a)*r,1,1,1,(hsh(i+3)-.5)*.2,0,(hsh(i+5)-.5)*.2)}
  break;
 case 'scarecrow':
  p(cyl(.05,.06,2.1,6),WOOD,0,1.05,0);p(cyl(.04,.04,1.5,6),WOOD,0,1.55,0,1,1,1,0,0,PI/2);
  p(rbox(.45,.6,.22,.3,2),0x8a6a3a,0,1.45,0);bp(.17,0xd8c08a,0,1.95,0,1,1.05,1);p(cyl(.34,.34,.03,10),0xd9c070,0,2.1,0);p(cyl(.15,.17,.16,9),0xd9c070,0,2.2,0);
  p(box(.5,.05,.05),0xd9c070,.8,1.5,0);p(box(.5,.05,.05),0xd9c070,-.8,1.5,0);
  break;
 case 'hay':
  p(cyl(.5,.5,.95,12),0xd9b84a,0,.5,0,1,1,1,0,0,PI/2,(x,y,z,nx,ny,nz,col)=>{if(Math.floor((x+z)*9)%2===0)col.multiplyScalar(.88)});
  p(cyl(.51,.51,.04,12),0x8a6a2a,0,.5,.3,1,1,1,0,0,PI/2);p(cyl(.51,.51,.04,12),0x8a6a2a,0,.5,-.3,1,1,1,0,0,PI/2);
  break;
 case 'rack':
  p(cyl(.05,.06,1.9,6),WOOD,-.9,.95,0);p(cyl(.05,.06,1.9,6),WOOD,.9,.95,0);p(cyl(.04,.04,2,6),WOOD,0,1.8,0,1,1,1,0,0,PI/2);p(cyl(.04,.04,2,6),WOOD,0,1.2,0,1,1,1,0,0,PI/2);
  for(let i=0;i<3;i++){
   if(e.pelts)p(rbox(.5,.9,.06,.4,2),[0x8a6a4a,0xb89a6e,0x6a4a2a][i],-.55+i*.55,1.25,0.02);
   if(e.fish)for(let j=0;j<2;j++)bp(.09,0xb9c8d0,-.6+i*.6,1.62-j*.45,0,.6,2.3,.5,{d:1});
  }
  break;
 case 'dummy':
  p(cyl(.06,.07,1.6,6),WOOD,0,.8,0);p(rbox(.5,.7,.3,.3,2),0xb89a6e,0,1.3,0);bp(.17,0xd8c08a,0,1.85,0,1,1,1);p(cyl(.04,.04,1.2,6),WOOD,0,1.5,0,1,1,1,0,0,PI/2);
  p(cyl(.18,.18,.03,10),0xd9463c,0,1.3,.17,1,1,1,0,PI/2,PI/2);p(cyl(.1,.1,.035,10),0xf2f2f2,0,1.3,.18,1,1,1,0,PI/2,PI/2);
  p(cyl(.012,.012,.5,4),0xc9a15a,.12,1.35,.15,1,1,1,0,PI/2,PI/2);
  break;
 case 'crate':
  p(box(.72,.62,.72),WOODL,0,.31,0,1,1,1,0,0,0,plankCf);p(box(.76,.07,.76),TIMB,0,.58,0);p(box(.76,.07,.76),TIMB,0,.06,0);
  p(box(.5,.45,.5),WOOD,.45,.23,.7,1,1,1,0,.5,0,plankCf);
  break;
 case 'boat':
  bp(.5,0x7a4a2a,0,.32,0,3.0,.55,1.0,{d:2,amp:.015});bp(.42,0x3a2414,0,.4,0,2.75,.4,.8,{d:2,amp:.01});
  p(box(.9,.05,.18),WOODL,0,.58,0);p(cyl(.015,.015,1.6,5),WOOD,.4,.75,.45,1,1,1,0,.3,PI/2.6);p(cyl(.015,.015,1.6,5),WOOD,-.4,.75,-.45,1,1,1,0,.3,PI/2.6);
  break;
 case 'barrel':
  p(cyl(.32,.3,.78,10),WOOD,0,.4,0,1,1,1,0,0,0,plankCf);p(cyl(.335,.335,.05,10),0x2a2a30,0,.18,0);p(cyl(.335,.335,.05,10),0x2a2a30,0,.62,0);
  break;
 case 'forge':
  p(box(1.3,.9,1.0),STONE,0,.45,0,1,1,1,0,0,0,stoneCf);p(box(1.0,.05,.7),0x2a2a30,0,.92,0);p(box(.8,.5,.3),STONED,0,1.2,-.35,1,1,1,0,0,0,stoneCf);
  p(box(.6,1.6,.5),STONED,0,1.7,-.45,1,1,1,0,0,0,stoneCf);
  glowP.push(part(box(.7,.07,.5),0xff6a1a,e.x+0,gy+.94,e.z+0));
  p(box(.34,.28,.6),0x2a2a30,1.2,.62,.2);p(box(.2,.3,.34),0x2a2a30,1.2,.4,.2);p(cyl(.12,.14,.08,8),0x2a2a30,1.2,.76,.5,1,1,1,0,0,PI/2);
  p(cyl(.3,.32,.5,10),WOOD,1.2,.25,.2,1,1,1,0,0,0,plankCf);
  p(cyl(.015,.015,.8,5),0x4a3322,-.5,1.05,.6,1,1,1,0,0,PI/2.4);p(box(.14,.1,.22),0x6a6a72,-.5,.85,.95);
  break;
 case 'weapons':
  p(cyl(.05,.06,1.6,6),WOOD,-.7,.8,0);p(cyl(.05,.06,1.6,6),WOOD,.7,.8,0);p(box(1.5,.07,.1),WOOD,0,1.2,0);p(box(1.5,.07,.1),WOOD,0,.6,0);
  for(let i=0;i<4;i++){const x=-.5+i*.33;p(cyl(.015,.015,1.0,5),0x8a5a30,x,.9,.07);
   if(e.picks){p(box(.38,.05,.05),0x8d8d92,x,1.38,.07)}else p(box(.06,.3,.02),0xc3c9d0,x,1.47,.07)}
  break;
 case 'coal':
  for(let i=0;i<5;i++)bp(.17+hsh(i)*.1,0x242428,(hsh(i+1)-.5)*.8,.1+hsh(i+4)*.12,(hsh(i+2)-.5)*.6,1,.8,1,{d:1,amp:.06});
  break;
 case 'flowers':
  for(let i=0;i<5;i++){const a=hsh(i)*.9-.45,b=hsh(i+7)*.9-.45;p(cyl(.012,.012,.4,4),0x4a8a3a,a,.2,b);bp(.07,[0xe86a8a,0xf6c84a,0xffffff,0xa86ae8,0xe86a3a][(i+((e.x*3)|0))%5],a,.42,b,1,.7,1,{d:0,amp:.02})}
  bp(.2,0x4a7a32,0,.1,0,1.4,.5,1.2,{d:1,amp:.06});
  break;
 case 'pots':
  for(let i=0;i<3;i++){const x=(i-1)*.5;p(cyl(.17,.12,.3,9),0xb8643a,x,.15,(i%2)*.2);bp(.16,0x4a8a3a,x,.4,(i%2)*.2,1,.9,1,{d:1,amp:.05});bp(.05,0xe86a8a,x,.52,(i%2)*.2,1,1,1,{d:0})}
  break;
 case 'logs':
  for(const [x,y,z] of [[0,.2,0],[0,.2,.42],[0,.58,.2]])p(cyl(.2,.2,1.5,9),0x6a4a2a,x,y,z,1,1,1,0,0,PI/2,logCf);
  for(const [x,y,z] of [[0,.2,0],[0,.2,.42],[0,.58,.2]]){p(cyl(.19,.19,.02,9),0xc9a56a,.76,y,z,1,1,1,0,0,PI/2);p(cyl(.19,.19,.02,9),0xc9a56a,-.76,y,z,1,1,1,0,0,PI/2)}
  break;
 case 'stump':
  p(cyl(.35,.42,.55,10),0x6a4a2a,0,.28,0,1,1,1,0,0,0,logCf);p(cyl(.34,.34,.02,10),0xc9a56a,0,.56,0);
  p(cyl(.02,.025,.7,5),0x8a5a30,.1,.8,0,1,1,1,0,0,.3);p(box(.04,.18,.22),0xc3c9d0,.3,1.1,0,1,1,1,0,0,.3);
  break;
 case 'cart':
  p(box(1.5,.1,.9),WOOD,0,.55,0,1,1,1,0,0,0,plankCf);p(box(1.5,.35,.08),WOOD,0,.77,.44);p(box(1.5,.35,.08),WOOD,0,.77,-.44);p(box(.08,.35,.9),WOOD,.71,.77,0);p(box(.08,.35,.9),WOOD,-.71,.77,0);
  for(const z of [-.5,.5])p(cyl(.35,.35,.07,12),WOOD,0,.35,z,1,1,1,0,PI/2,PI/2);
  p(cyl(.03,.03,1.2,5),WOOD,1.3,.55,0,1,1,1,0,0,PI/2.2);
  for(let i=0;i<4;i++)bp(.15+hsh(i)*.08,[0x6a6a72,0x8d8d92,0x4a3a2a,0xb06a3a][i],(hsh(i)-.5)*.9,.85,(hsh(i+3)-.5)*.5,1,.8,1,{d:1,amp:.08});
  break;
 case 'rocks':
  for(let i=0;i<4;i++)bp(.22+hsh(i)*.2,[0x7a7a82,0x6a6a72,0x8d8d92,0x5a5a62][i],(hsh(i+1)-.5)*1.0,.18,(hsh(i+2)-.5)*.8,1.1,.8,1,{d:1,amp:.09});
  break;
 case 'well':
  for(let i=0;i<12;i++){const a=i/12*6.283;p(box(.4,.5,.3),STONE,Math.cos(a)*.85,.3,Math.sin(a)*.85,1,1,1,0,-a+PI/2,0,stoneCf)}
  p(cyl(.8,.8,.08,16),0x2a5a8a,0,.3,0);
  p(box(.12,2.0,.12),TIMB,-.95,1.3,0);p(box(.12,2.0,.12),TIMB,.95,1.3,0);p(box(2.1,.1,.12),TIMB,0,2.3,0);
  p(cyl(.03,.03,.9,5),WOOD,0,2.1,0,1,1,1,0,0,PI/2);p(cyl(.012,.012,.9,4),0xb89a6e,0,1.7,0);
  p(cyl(.16,.13,.22,8),WOOD,0,1.2,0);
  for(const sg of [1,-1])p(box(2.4,.08,1.3),0x7a4a2a,0,2.58,sg*.55,1,1,1,sg*.45,0,0,roofCf);
  break;
 case 'tuft':{
  const col=[0xe86a8a,0xf6c84a,0xffffff,0xa86ae8,0xe86a3a][(e.c||0)%5];
  for(let i=0;i<3;i++)p(cone(.035,.32+hsh(i)*.14,4),0x4a8a3a,(hsh(i)-.5)*.2,.17,(hsh(i+2)-.5)*.2,1,1,1,(hsh(i+4)-.5)*.5,0,(hsh(i+6)-.5)*.5);
  if(e.c<4)bp(.05,col,0,.36,0,1,.7,1,{d:0,amp:.01});
  break}
 }
}

/* tabela için metin dokusu */
function signTex(text){
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;const x=cv.getContext('2d');
 x.fillStyle='#8a5a30';x.fillRect(0,0,512,128);
 for(let i=0;i<9;i++){x.fillStyle=i%2?'rgba(0,0,0,.08)':'rgba(255,255,255,.06)';x.fillRect(0,i*14.5,512,14.5)}
 x.strokeStyle='#3a2414';x.lineWidth=8;x.strokeRect(4,4,504,120);
 x.fillStyle='#f4e8c8';x.font='bold 54px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,68);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t;
}

/* ---------- kurulum ---------- */
function clearAll(){
 for(const v of vills){sc.scene.remove(v.g);v.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material.map)o.material.map.dispose()})}
 vills.length=0;sc.lamps.length=0;
}
function build(G){
 clearAll();
 if(!mat){mat=sc.mat({roughness:.9});glowMat=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false})}
 if(!glowGeo)glowGeo=new THREE.PlaneGeometry(1,1);
 const smokeTex=sc.tex&&sc.tex.glow;
 for(const vl of G.villages||[]){
  const g=new THREE.Group(),V={g,cx:vl.cx+.5,cz:vl.cy+.5,houses:[],lamps:[],glow:[],smoke:[]};
  /* evler */
  for(const h of vl.houses){
   const hm=new THREE.Mesh(houseGeo(h),mat);hm.castShadow=true;hm.receiveShadow=true;
   const gy=S.groundY(h.x,h.z);hm.position.set(h.x,gy,h.z);hm.rotation.y=h.ry;g.add(hm);
   const gm=new THREE.Mesh(glowGeoOf(h),new THREE.MeshBasicMaterial({vertexColors:false,color:0xffffff,toneMapped:false}));
   /* glowGeoOf renk bilgisini köşe renginde taşır: vertexColors açık malzeme */
   gm.material.vertexColors=true;gm.position.copy(hm.position);gm.rotation.y=h.ry;gm.visible=false;g.add(gm);
   /* baca dumanı */
   const sm=[];
   if(smokeTex)for(let i=0;i<4;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0xb8b8b8,transparent:true,depthWrite:false,opacity:0,fog:true}));
    const chx=h.stone?-1.2:1.3,cs=Math.cos(h.ry),sn=Math.sin(h.ry);
    sp.userData={bx:h.x+chx*cs+(-1.1)*sn,bz:h.z-chx*sn+(-1.1)*cs,by:gy+4.95,ph:i/4};
    sp.scale.set(.8,.8,1);g.add(sp);sm.push(sp);
   }
   V.houses.push({mesh:hm,glow:gm,smoke:sm,x:h.x,z:h.z});
  }
  /* avlu ve dekor: tek birleşik geometri */
  const P=[],GP=[],LP=[];
  for(const e of vl.extras)if(e.k!=='sign')decor(e,P,GP,LP);
  /* yer: meydan ve patikalar */
  const gyc=S.groundY(V.cx,V.cz);
  const cob=(x,y,z,nx,ny,nz,c2)=>{c2.multiplyScalar(.82+((Math.floor(x*2.3)*7+Math.floor(z*2.3)*13)&7)/22)};
  const plaza=part(cyl(3.6,3.7,.1,28),0x9a9488,V.cx,gyc+.01,V.cz);plaza.cf=cob;P.push(plaza);
  P.push(part(cyl(1.0,1.05,.16,16),STONED,V.cx,gyc+.05,V.cz));
  for(const h of vl.houses){
   const sx=h.dX+h.ex*1.4,sz=h.dZ+h.ey*1.4,ex2=V.cx,ez2=V.cz;
   const n=Math.max(2,Math.floor(Math.hypot(ex2-sx,ez2-sz)/.75));
   for(let i=0;i<=n;i++){
    const t=i/n,x=sx+(ex2-sx)*t+Math.sin(i*2.1+h.x)*.18,z=sz+(ez2-sz)*t+Math.cos(i*1.7+h.z)*.18;
    if(Math.hypot(x-V.cx,z-V.cz)<3.2)continue;
    const q=part(cyl(.52,.56,.06,9),0x8a7a5a,x,S.groundY(x,z)+.015,z,1,1,1);q.cf=(a,b,c0,nx,ny,nz,c2)=>c2.multiplyScalar(.85+((Math.floor(a*5)+Math.floor(c0*5))&3)/14);P.push(q);
   }
  }
  if(P.length){const dm=new THREE.Mesh(merge(P,{ao:.85,jit:.08}),mat);dm.castShadow=true;dm.receiveShadow=true;g.add(dm);V.deco=dm}
  if(GP.length){const gm=new THREE.Mesh(merge(GP,{jit:0}),new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}));g.add(gm);V.forge=gm}
  /* lamba parıltıları */
  for(const l of LP){
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0xffb050,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:.0}));
   sp.scale.set(5.5,5.5,1);sp.position.set(l.x,l.y,l.z);sp.visible=false;g.add(sp);V.lamps.push(sp);V.glow.push(l);sc.lamps.push(l);
  }
  /* köy girişi tabelası */
  const sg=vl.extras.find(e=>e.k==='sign');
  if(sg){
   const gy=S.groundY(sg.x,sg.z),sP=[];
   sP.push(part(cyl(.07,.09,2.3,6),TIMB,sg.x-1.3,gy+1.15,sg.z),part(cyl(.07,.09,2.3,6),TIMB,sg.x+1.3,gy+1.15,sg.z),part(box(2.8,.12,.14),TIMB,sg.x,gy+2.3,sg.z));
   const sm2=new THREE.Mesh(merge(sP,{jit:.06}),mat);sm2.castShadow=true;g.add(sm2);
   const tx=signTex(sg.text),bm=new THREE.MeshStandardMaterial({map:tx,roughness:.85});
   const b1=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.6),bm),b2=b1.clone();
   b1.position.set(sg.x,gy+1.85,sg.z+.09);b2.position.set(sg.x,gy+1.85,sg.z-.09);b2.rotation.y=PI;g.add(b1,b2);
  }
  sc.scene.add(g);vills.push(V);
 }
}
S.onSync(build);

S.onFrame((G,t,dt,info)=>{
 if(!vills.length)return;
 const play=info.mode==='play',cam=sc.cam.position,night=info.L<.42,k=Math.min(1,Math.max(0,(.42-info.L)/.25));
 for(const V of vills){
  const d2=(V.cx-cam.x)**2+(V.cz-cam.z)**2,vis=play&&d2<170*170;
  V.g.visible=vis;if(!vis)continue;
  const near=d2<70*70;
  for(const h of V.houses){
   h.glow.visible=night&&near;
   const on=(!G.npcs||G.npcs.length===0)?false:true;
   for(const sp of h.smoke){
    const u=sp.userData,tt=((t*.12+u.ph)%1);
    sp.visible=near;if(!near)continue;
    const wd=sc.wind||{x:0,z:0,s:0},wk=tt*tt*(2+wd.s*7);
    sp.position.set(u.bx+tt*1.4+Math.sin(t+u.ph*9)*.15+wd.x*wk,u.by+tt*3.2,u.bz+Math.cos(t*.7+u.ph*7)*.15+wd.z*wk);
    const s=.7+tt*2.1;sp.scale.set(s,s,1);sp.material.opacity=on?(1-tt)*.32*Math.min(1,tt*6):0;
   }
  }
  for(const sp of V.lamps){sp.visible=k>0&&near;if(sp.visible){sp.material.opacity=.55*k*(.94+Math.sin(t*3+sp.position.x)*.06)}}
  if(V.forge)V.forge.visible=near;
 }
});
})();
