/* Hunger 3D - sahne: deniz: sal, köpek balığı, denizanası, yengeç, martılar, yunuslar, parlayan plankton, deniz feneri ışığı, fırtına dalgaları */
(()=>{
'use strict';
const {W,H,T,ANIMAL}=HG;
const S=HG.Scene,sc=HG.sc;
const {blob,merge,part,cyl,cone,box,alongPart}=sc.g;
const PI=Math.PI,V=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=HG.clamp;
const rnd=Math.random;
const VIEW=150;
let seed=900;
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};return part(blob(r,o.d===undefined?1:o.d,o.amp===undefined?.04:o.amp,++seed,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.j)};
const WHITE=new THREE.Color(0xeef2f2);
const tmpV=new THREE.Vector3();

/* ================= modeller ================= */
let sharkGeo=null,sharkTail=null,mat=null,matGlass=null,gullBody=null,gullWing=null,dolGeo=null,dolTail=null,raftGeo=null;

function buildSharkGeo(){
 const SK=0x5b6c78,SK2=0x4f5f6a;
 const cf=(x,y,z,nx,ny,nz,c)=>{if(ny<-.1)c.lerp(WHITE,Math.min(1,(-ny-.1)*2.4))};
 const b=merge([
  Bp(.5,SK,0,0,0,.55,.62,2.5,{d:2,amp:.03}),
  Bp(.3,SK,0,-.04,1.15,.5,.48,1.1,{d:2,amp:.02}),
  part(cone(.22,.64,3,1),SK2,0,.42,-.1,.35,1,1.2,-.45,0,0),
  part(cone(.07,.3,3,1),SK2,0,.3,-.85,.3,1,1,-.5,0,0),
  part(cone(.16,.7,3,1),SK2,.34,-.2,.3,.35,1,1.1,0,0,-(PI/2+.5)),
  part(cone(.16,.7,3,1),SK2,-.34,-.2,.3,.35,1,1.1,0,0,PI/2+.5),
  part(box(.34,.025,.5),0x2a2024,0,-.18,1.2),
  Bp(.036,0x0a0a0c,.19,.08,.95,1,1,1,{d:0,amp:0}),Bp(.036,0x0a0a0c,-.19,.08,.95,1,1,1,{d:0,amp:0}),
  ...[-.1,-.05,0,.05,.1].map((x,i)=>part(cone(.012,.05,3,1),0xf4f4ee,x,-.15,1.28+Math.abs(x)*.5,1,1,1,PI,0,0)),
  ...[0,1,2].map(i=>part(box(.012,.1,.012),0x34424c,.2+i*.001,.0,.55-i*.07,1,1,1,0,0,0))
 ],{ao:.8,jit:.05,cf});
 const t=merge([
  part(cone(.2,.82,3,1),SK2,0,.28,-.2,.35,1,1.1,-.9,0,0),
  part(cone(.14,.5,3,1),SK2,0,-.2,-.12,.35,1,1,.9,0,0),
  Bp(.1,SK,0,0,.2,.6,.6,1.4,{d:1,amp:.02})
 ],{ao:.8,jit:.04,cf});
 return [b,t];
}
function buildDolphinGeo(){
 const DK=0x6f8797,DK2=0x5a707f;
 const cf=(x,y,z,nx,ny,nz,c)=>{if(ny<-.05)c.lerp(WHITE,Math.min(1,(-ny-.05)*2.6))};
 const b=merge([
  Bp(.3,DK,0,0,0,.5,.5,1.9,{d:2,amp:.025}),
  Bp(.1,DK,0,-.05,.85,.5,.4,1.3,{d:1,amp:.015}),
  part(cone(.12,.4,3,1),DK2,0,.27,-.1,.3,1,1.2,-.5,0,0),
  part(cone(.09,.32,3,1),DK2,.18,-.14,.3,.3,1,1,0,0,-(PI/2+.5)),
  part(cone(.09,.32,3,1),DK2,-.18,-.14,.3,.3,1,1,0,0,PI/2+.5),
  Bp(.022,0x0a0a0c,.13,.05,.55,1,1,1,{d:0,amp:0}),Bp(.022,0x0a0a0c,-.13,.05,.55,1,1,1,{d:0,amp:0})
 ],{ao:.85,jit:.04,cf});
 const t=merge([Bp(.07,DK,0,0,.1,.7,.7,1.6,{d:1,amp:.01}),part(cone(.1,.34,3,1),DK2,.14,0,-.1,.3,1,.6,0,0,-(PI/2)),part(cone(.1,.34,3,1),DK2,-.14,0,-.1,.3,1,.6,0,0,PI/2)],{ao:.85,jit:.03,cf});
 return [b,t];
}
function buildGullGeo(){
 const GW=0xf4f4f0,GG=0xbfc3c8;
 const b=merge([
  Bp(.09,GW,0,0,0,.7,.6,1.6,{d:1,amp:.02}),Bp(.05,GW,0,.04,.17,1,1,1,{d:1,amp:.01}),
  part(cone(.012,.07,4,1),0xe6b030,0,.035,.26,1,1,1,PI/2,0,0),
  part(cone(.05,.14,3,1),GG,0,0,-.2,1.4,1,.5,-PI/2,0,0)
 ],{ao:.9,jit:.02});
 const w=merge([
  part(box(.34,.012,.14),GW,.17,0,0),part(box(.3,.012,.1),GG,.5,0,-.01),part(box(.12,.012,.06),0x3a3a40,.7,0,-.02)
 ],{jit:.02});
 return [b,w];
}
function buildRaftGeo(){
 const ps=[];
 const cols=[0x7a5530,0x8a6038,0x6b4423,0x7f5a34,0x6f4a28];
 for(let i=0;i<7;i++){
  const len=2.4+((i*37)%5)/20;
  ps.push(part(cyl(.1,.1,len,9,1),cols[i%5],(i-3)*.26,-.02,(i%2?.04:-.04),1,1,1,PI/2,0,0));
 }
 for(const z of [-.62,.62]){
  ps.push(part(box(1.9,.06,.12),0x4a3220,0,.075,z));
  ps.push(part(box(.1,.14,.16),0x3a2818,-.92,.04,z));ps.push(part(box(.1,.14,.16),0x3a2818,.92,.04,z));
 }
 ps.push(part(cyl(.045,.055,2.5,6),0x4a3220,0,1.25,-.9));                          /* direk */
 ps.push(part(cyl(.03,.03,1.5,5),0x4a3220,0,2.0,-.9,1,1,1,0,0,PI/2));
 ps.push(part(cyl(.03,.03,.8,5),0x4a3220,.95,.5,.5,1,1,1,0,0,.35));                /* kürek */
 ps.push(part(box(.34,.04,.3),0x6b4423,1.15,.05,.5));
 ps.push(part(cyl(.1,.1,.18,8),0x2a2a30,0,.22,1.05));                                 /* fener */
 return merge(ps,{ao:.8,jit:.06});
}

/* yengeç: standart hayvan oluşturucusu için model (hayvanlar.js kullanır) */
function crabModel(){
 const RD=0xc24a2a,RD2=0xa83a22,RD3=0xd9582f;
 const body=[Bp(.2,RD,0,.17,0,1.25,.5,1,{d:2,amp:.05}),Bp(.08,RD3,0,.22,.02,1.4,.7,1,{d:1,amp:.04})];
 for(const s of [-1,1]){
  body.push(part(cyl(.011,.011,.08,4),0x8a3320,s*.07,.28,.15),Bp(.026,0x111111,s*.07,.33,.15,1,1,1,{d:0,amp:0}));
  for(const k of [-1,0,1])body.push(alongPart(cyl(.012,.017,.22,4),RD2,V(s*.18,.15,k*.08),V(s*.9,-.85,k*.25),.22));
 }
 const claw=s=>{
  const pv=[s*.2,.2,.17],P=[
   alongPart(cyl(.02,.025,.16,5),RD2,V(s*.2,.2,.17),V(s*.5,.1,1),.16),
   Bp(.07,RD3,s*.27,.22,.35,1,.7,1.5,{d:1,amp:.04}),
   alongPart(cone(.03,.12,4,1),RD,V(s*.3,.22,.43),V(s*.35,.0,1),.12),
   alongPart(cone(.025,.1,4,1),RD,V(s*.22,.22,.43),V(-s*.2,.0,1),.1)
  ];
  const g=merge(P,{jit:.05});g.translate(-pv[0],-pv[1],-pv[2]);return [g,pv];
 };
 const [cl,pl]=claw(-1),[cr,pr]=claw(1);
 return {body:merge(body,{ao:.8,jit:.05}),legs:[],leg:null,armL:cl,armLP:pl,armR:cr,armRP:pr};
}

S.onInit(()=>{
 mat=sc.mat({roughness:.55});
 [sharkGeo,sharkTail]=buildSharkGeo();
 [dolGeo,dolTail]=buildDolphinGeo();
 [gullBody,gullWing]=buildGullGeo();
 raftGeo=buildRaftGeo();
 matGlass=new THREE.MeshStandardMaterial({color:0xcfe8ff,emissive:0x5ab4ff,emissiveIntensity:.9,transparent:true,opacity:.5,roughness:.2,side:THREE.DoubleSide,depthWrite:false});
 sc.ANIM.crab=crabModel();
 initRaft();initPlankton();initGulls();
});

/* ================= deniz canlıları (köpek balığı, denizanası) ================= */
const objs=new Map(),alive=new Set();
function makeSea(a){
 const def=ANIMAL[a.t],g=new THREE.Group(),o={g,a,rt:0};
 if(def.sea==='fish'){
  const b=new THREE.Mesh(sharkGeo,mat);b.castShadow=false;g.add(b);o.body=b;
  const t=new THREE.Mesh(sharkTail,mat);t.position.set(0,0,-1.22);g.add(t);o.tail=t;
  g.scale.setScalar(1.15);
 }else{
  const bell=new THREE.Mesh(new THREE.SphereGeometry(.34,14,9,0,PI*2,0,PI*.55),matGlass);bell.position.y=.2;g.add(bell);o.bell=bell;
  const core=new THREE.Mesh(new THREE.SphereGeometry(.17,10,7),new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:.55,depthWrite:false}));core.position.y=.24;core.scale.y=.6;g.add(core);
  o.tent=[];
  const tm=new THREE.MeshBasicMaterial({color:0xb8e4ff,transparent:true,opacity:.5,depthWrite:false});
  for(let i=0;i<9;i++){
   const t=new THREE.Mesh(new THREE.CylinderGeometry(.012,.004,i<4?.75:.5,4),tm),an=i/9*PI*2,r=.2;
   t.geometry.translate(0,-(i<4?.75:.5)/2,0);t.position.set(Math.cos(an)*r,.15,Math.sin(an)*r);g.add(t);o.tent.push(t);
  }
 }
 sc.scene.add(g);return o;
}
function seaFrame(G,t,dt,info){
 const L=G.animals||[],WY=sc.WY,play=info.mode==='play',cam=sc.cam.position;
 alive.clear();for(const a of L)alive.add(a);
 for(const [a,o] of objs)if(!alive.has(a)){sc.scene.remove(o.g);objs.delete(a)}
 for(const a of L){
  const def=ANIMAL[a.t];if(!def.sea)continue;
  const d2=(a.x-cam.x)**2+(a.z-cam.z)**2;
  let o=objs.get(a);
  if(d2>VIEW*VIEW||!play){if(o)o.g.visible=false;continue}
  if(!o){o=makeSea(a);objs.set(a,o)}
  o.g.visible=true;
  const by=a.by===undefined?WY-.6:a.by;
  if(def.sea==='fish'){
   const sp=Math.min(1,(a.spd||0)/4.5),amp=.12+.38*sp;
   let y=by+def.h*.5,rz=0,sy=1;
   if(a.dying){
    const u=Math.min(1,a.dying/1.3);
    rz=PI*u;y=by+def.h*.5+(WY-.05-(by+def.h*.5))*u;                     /* ölünce yüzeye çıkar ve ters döner */
    if(a.gone){const w=Math.min(1,(a.dying-5)/4);y-=Math.max(0,w)*1.2}
   }
   const hit=a.hitT>0?Math.sin(a.hitT/.25*PI):0;
   o.g.position.set(a.x,y,a.z);
   const pitch=a.dying?0:clamp(-(a.vy||0)*.25,-.5,.5);
   o.g.rotation.set(pitch,a.yaw,rz+(a.dying?0:Math.sin(t*1.3+a.id)*.03),'YXZ');
   o.g.scale.setScalar(1.15*(1+hit*.05));
   if(o.tail)o.tail.rotation.y=a.dying?0:Math.sin(t*(3+sp*5)+a.id)*amp;
   if(o.body)o.body.rotation.y=a.dying?0:Math.sin(t*(3+sp*5)+a.id-.8)*amp*.12;
   /* yüzeye yakın hareket eden köpek balığı su yüzeyinde iz bırakır */
   o.rt-=dt;
   if(!a.dying&&sp>.2&&by+def.h>WY-.7&&o.rt<=0&&sc.fx){o.rt=.55;sc.fx.ring(a.x,WY+.02,a.z,1.4,1)}
  }else{
   const pulse=Math.sin(t*3+a.id*1.7),hit=a.hitT>0?Math.sin(a.hitT/.25*PI):0;
   let y=by+def.h*.45+pulse*.05;
   if(a.dying){const u=Math.min(1,a.dying/1.2);y+= (WY-.15-y)*u;o.g.rotation.z=PI*.9*u}else o.g.rotation.z=Math.sin(t*.8+a.id)*.05;
   o.g.position.set(a.x,y,a.z);
   o.g.rotation.y=a.yaw;
   o.bell.scale.set(1-.12*pulse,1+.2*pulse,1-.12*pulse);
   o.g.scale.setScalar(1+hit*.1);
   matGlass.emissiveIntensity=.7+.3*Math.sin(t*2);
   for(let i=0;i<o.tent.length;i++){const q=o.tent[i];q.rotation.x=Math.sin(t*2+i+a.id)*.18-pulse*.07;q.rotation.z=Math.cos(t*1.7+i*1.3)*.18}
   if(a.gone){const w=Math.min(1,(a.dying-5)/4);o.g.visible=w<1}
  }
 }
}

/* ================= sal ================= */
let raftG=null,sail=null,lantern=null,raftWake=0,sailBase=null;
function initRaft(){
 raftG=new THREE.Group();
 const m=new THREE.Mesh(raftGeo,sc.mat({roughness:.9,pbr:true}));m.castShadow=true;m.receiveShadow=true;raftG.add(m);
 const sg=new THREE.PlaneGeometry(1.5,1.5,4,4);sg.translate(0,1.3,-.9);
 sail=new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0xcfc6ad,roughness:.95,side:THREE.DoubleSide}));
 sailBase=Float32Array.from(sg.attributes.position.array);
 sail.castShadow=true;raftG.add(sail);
 lantern=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:new THREE.Color(3,2,1),toneMapped:false}));
 lantern.position.set(0,.34,1.05);raftG.add(lantern);
 raftG.visible=false;sc.scene.add(raftG);
}
function raftFrame(G,t,dt,info){
 const on=info.mode==='play'&&G.onRaft;
 raftG.visible=on;if(!on)return;
 const WY=sc.WY,st=1+sc.rain*2.2,w=sc.wind||{x:0,z:0,s:.2};
 raftG.position.set(G.px,WY+.0+Math.sin(G.clock*1.4)*.025*st,G.py);
 raftG.rotation.set(Math.sin(G.clock*.9+1)*.018*st,G.raftYaw||0,Math.sin(G.clock*1.1)*.026*st,'YXZ');
 lantern.visible=info.L<.45;
 /* yelken: rüzgârla dalgalanır */
 const p=sail.geometry.attributes.position,k=.04+.1*(w.s||0);
 for(let i=0;i<p.count;i++){const x=sailBase[i*3],y=sailBase[i*3+1];p.setZ(i,sailBase[i*3+2]+Math.sin(t*2.2+y*3+x*2)*k*(Math.abs(x)*.8+(2.05-y)*.6))}
 p.needsUpdate=true;
 /* iz */
 raftWake-=dt;
 if(raftWake<=0&&(G.spdNow||0)>.8&&sc.fx){raftWake=.45;const y=G.raftYaw||0;sc.fx.ring(G.px-Math.sin(y)*1.2,WY+.02,G.py-Math.cos(y)*1.2,2,1.2)}
}

/* ================= martılar ================= */
let gulls=[],gullC=null,gullPick=0,gullSnd=8;
function initGulls(){
 const gm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide});
 for(let i=0;i<9;i++){
  const g=new THREE.Group(),b=new THREE.Mesh(gullBody,gm);g.add(b);
  const wr=new THREE.Mesh(gullWing,gm),wl=new THREE.Mesh(gullWing,gm);wl.scale.x=-1;g.add(wr,wl);
  g.visible=false;sc.scene.add(g);
  gulls.push({g,wr,wl,ang:rnd()*6.28,r:8+rnd()*16,h:10+rnd()*12,w:(.22+rnd()*.25)*(rnd()<.5?-1:1),ph:rnd()*6.28});
 }
}
function pickCoast(G,px,pz){
 if(!G.sdist)return null;
 for(let k=0;k<70;k++){
  const a=rnd()*6.283,d=8+rnd()*62,x=px+Math.cos(a)*d,z=pz+Math.sin(a)*d,tx=Math.floor(x),tz=Math.floor(z);
  if(tx<2||tz<2||tx>=W-2||tz>=H-2)continue;
  const i=tz*W+tx,sd=G.sdist[i];
  if(sd<=2&&G.tile[i]!==T.POND)return {x,z};
 }
 return null;
}
function gullFrame(G,t,dt,info){
 const play=info.mode==='play',n=[0,3,6,9][sc.quality|0];
 const day=info.L>.35&&sc.rain<.7;
 if(!play||!day||!n||G.cave){for(const q of gulls)q.g.visible=false;return}
 gullPick-=dt;
 if(!gullC||Math.hypot(gullC.x-G.px,gullC.z-G.py)>90){
  if(gullPick<=0){gullPick=3;gullC=pickCoast(G,G.px,G.py)}
  if(!gullC||Math.hypot(gullC.x-G.px,gullC.z-G.py)>90){for(const q of gulls)q.g.visible=false;gullC=null;return}
 }
 const WY=sc.WY;
 gulls.forEach((q,i)=>{
  if(i>=n){q.g.visible=false;return}
  q.g.visible=true;q.ang+=q.w*dt*.5;
  const x=gullC.x+Math.cos(q.ang)*q.r,z=gullC.z+Math.sin(q.ang)*q.r,y=WY+q.h+Math.sin(t*.5+q.ph)*1.6,dir=q.w>0?1:-1;
  const vx=-Math.sin(q.ang)*dir,vz=Math.cos(q.ang)*dir;
  q.g.position.set(x,y,z);q.g.rotation.set(0,Math.atan2(vx,vz),-dir*.35,'YXZ');
  const glide=Math.sin(t*.3+q.ph*3)>.25?.12:1,fl=Math.sin(t*(7+q.ph)+q.ph)*.65*glide-.05;
  q.wr.rotation.z=fl;q.wl.rotation.z=-fl;      /* sol kanat aynalı olduğundan ters işaret */
 });
 gullSnd-=dt;
 if(gullSnd<=0){
  gullSnd=7+rnd()*12;
  const q=gulls[(rnd()*Math.max(1,n))|0];
  if(q&&q.g.visible&&Math.hypot(q.g.position.x-G.px,q.g.position.z-G.py)<55)HG.snd('gull',{x:q.g.position.x,z:q.g.position.z,y:q.g.position.y});
 }
}

/* ================= yunuslar ================= */
let dolT=45+rnd()*40,dol=null;
function dolphinFrame(G,t,dt,info){
 const play=info.mode==='play',WY=sc.WY;
 if(!play||G.cave){if(dol){sc.scene.remove(dol.g);dol=null}return}
 if(!dol){
  dolT-=dt;
  const sd=G.sdist?G.sdist[Math.floor(G.py)*W+Math.floor(G.px)]:0;
  if(dolT>0||info.L<.3||(!G.onRaft&&!G.swim)||(sd<6&&!G.onRaft))return;
  dolT=80+rnd()*80;
  const g=new THREE.Group(),m2=sc.mat({roughness:.4}),ds=[];
  const n=3;
  for(let k=0;k<n;k++){
   const d=new THREE.Group(),b=new THREE.Mesh(dolGeo,m2),tl=new THREE.Mesh(dolTail,m2);tl.position.set(0,0,-.55);d.add(b,tl);
   g.add(d);ds.push({d,tl,k,ph:k*1.1});
  }
  sc.scene.add(g);
  const a=rnd()*6.283,dist=28+rnd()*10,cx=G.px+Math.cos(a)*dist,cz=G.py+Math.sin(a)*dist;
  const ta=Math.atan2(G.px-cx,G.py-cz)+(rnd()<.5?1:-1)*(PI/2-.35);
  dol={g,ds,x:cx,z:cz,dx:Math.sin(ta),dz:Math.cos(ta),t:0,snd:false};
  HG.snd('dolphin',{x:cx,z:cz,y:WY});
 }
 const o=dol;o.t+=dt;
 const v=7;o.x+=o.dx*v*dt;o.z+=o.dz*v*dt;
 const yaw=Math.atan2(o.dx,o.dz);
 for(const q of o.ds){
  const ph=o.t*2.3+q.ph,s=Math.sin(ph),side=(q.k-1)*2.6,back=q.k*-1.8;
  const x=o.x+o.dz*side+o.dx*back,z=o.z-o.dx*side+o.dz*back;
  const J=s>0?Math.sin(ph)*1.15:s*.35,y=WY-.35+J;
  const dy=s>0?Math.cos(ph)*1.15*2.3:Math.cos(ph)*.35*2.3;
  q.d.position.set(x,y,z);
  q.d.rotation.set(-Math.atan2(dy,v),yaw,0,'YXZ');
  q.tl.rotation.x=Math.sin(o.t*9+q.k)*.35;
  const prev=q.up===undefined?false:q.up,up=s>0&&y>WY-.2;
  if(up!==prev&&sc.fx)sc.fx.ring(x,WY+.02,z,1.5,.9);
  q.up=up;
  if(!o.snd&&q.k===1&&s>.9){o.snd=true;HG.snd('dolphin',{x,z,y:WY})}
 }
 if(o.t>26||Math.hypot(o.x-G.px,o.z-G.py)>95){sc.scene.remove(o.g);dol=null}
}

/* ================= parlayan plankton (gece) ================= */
let pl=null,plPos=null,plCol=null,plHome=null;
const PN=220;
function initPlankton(){
 plPos=new Float32Array(PN*3);plCol=new Float32Array(PN*3);plHome=new Float32Array(PN*2).fill(1e6);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(plPos,3));g.setAttribute('color',new THREE.BufferAttribute(plCol,3));
 pl=new THREE.Points(g,new THREE.PointsMaterial({size:.34,map:sc.tex.glow,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true,fog:false}));
 pl.frustumCulled=false;pl.visible=false;pl.renderOrder=4;sc.scene.add(pl);
}
function planktonFrame(G,t,dt,info){
 const play=info.mode==='play',nf=clamp((.42-info.L)/.28,0,1),cam=sc.cam.position,WY=sc.WY;
 const on=play&&nf>.02&&!G.cave&&cam.y>WY-.05&&sc.quality>0;
 pl.visible=on;if(!on)return;
 const R=30;let any=false;
 for(let i=0;i<PN;i++){
  let hx=plHome[i*2],hz=plHome[i*2+1];
  if(Math.hypot(hx-cam.x,hz-cam.z)>R){
   const a=rnd()*6.283,d=Math.sqrt(rnd())*R;hx=cam.x+Math.cos(a)*d;hz=cam.z+Math.sin(a)*d;
   const tx=Math.floor(hx),tz=Math.floor(hz),ok=tx>=0&&tz>=0&&tx<W&&tz<H&&(G.tile[tz*W+tx]<=T.SHAL);
   plHome[i*2]=hx;plHome[i*2+1]=hz;plCol[i*3]=plCol[i*3+1]=plCol[i*3+2]=0;
   plPos[i*3+1]=ok?WY+.03:-50;
  }
  const x=hx+Math.sin(t*.4+i)*.25,z=plHome[i*2+1]+Math.cos(t*.37+i*1.7)*.25;
  plPos[i*3]=x;plPos[i*3+2]=z;
  if(plPos[i*3+1]<-40){plCol[i*3]=plCol[i*3+1]=plCol[i*3+2]=0;continue}
  const dp=Math.hypot(x-G.px,z-G.py),wake=G.moving?clamp(1-dp/4,0,1):0,pulse=.5+.5*Math.sin(t*1.7+i*2.3);
  const k=nf*(.18+.5*pulse*pulse+wake*.9);
  plCol[i*3]=.1*k;plCol[i*3+1]=.9*k;plCol[i*3+2]=.7*k;any=true;
 }
 pl.geometry.attributes.position.needsUpdate=true;pl.geometry.attributes.color.needsUpdate=true;
}

/* ================= deniz feneri ışığı ================= */
let beacons=[],beamTex=null;
function makeBeamTex(){
 const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');
 const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(255,244,200,.95)');gr.addColorStop(.25,'rgba(255,236,170,.5)');gr.addColorStop(1,'rgba(255,230,160,0)');
 g.fillStyle=gr;g.fillRect(0,0,256,64);
 g.globalCompositeOperation='destination-in';
 const vg=g.createLinearGradient(0,0,0,64);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.5,'rgba(0,0,0,1)');vg.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=vg;g.fillRect(0,0,256,64);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
function buildBeacons(G){
 for(const b of beacons)sc.scene.remove(b.g);
 beacons=[];
 if(!beamTex)beamTex=makeBeamTex();
 for(const c of G.camps||[]){
  if(c.kind!=='lighthouse')continue;
  const ry=c.q*PI/2,cs=Math.round(Math.cos(ry)),sn=Math.round(Math.sin(ry));
  const x=c.x+.5+(-2)*sn,z=c.y+.5+(-2)*cs,y=S.groundY(x,z)+14.0;
  const g=new THREE.Group();g.position.set(x,y,z);
  const bm=new THREE.MeshBasicMaterial({map:beamTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false,opacity:0});
  const pg=new THREE.PlaneGeometry(90,7);pg.translate(45,0,0);
  const arm=new THREE.Group();
  for(const sgn of [0,PI]){
   const v=new THREE.Mesh(pg,bm);v.rotation.y=sgn;arm.add(v);
   const h=new THREE.Mesh(pg,bm);h.rotation.order='YXZ';h.rotation.set(PI/2,sgn,0);arm.add(h);
  }
  g.add(arm);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:sc.tex.glow,color:0xffe6a0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,toneMapped:false,opacity:0}));
  glow.scale.set(9,9,1);g.add(glow);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(.8,.7,.45),toneMapped:false,fog:false}));g.add(lamp);
  g.visible=false;sc.scene.add(g);
  beacons.push({g,arm,bm,glow,lamp,x,z,ph:c.id});
 }
}
S.onSync(buildBeacons);
function beaconFrame(G,t,dt,info){
 const play=info.mode==='play',cam=sc.cam.position,nf=clamp((.5-info.L)/.3,0,1);
 for(const b of beacons){
  const d=Math.hypot(b.x-cam.x,b.z-cam.z),vis=play&&d<380;
  b.g.visible=vis;if(!vis)continue;
  b.arm.rotation.y=t*.7+b.ph;
  b.bm.opacity=nf*.6;b.glow.material.opacity=nf*.9;
  b.lamp.material.color.setRGB(.7+nf*2.6,.62+nf*2.2,.4+nf*1.2);
 }
}

/* ================= fırtına dalgaları ================= */
function stormFrame(G,t,dt,info){
 const wm=sc.waterMat;if(!wm)return;
 const k=clamp(sc.rain*.8+((sc.wind&&sc.wind.s)||0)*.35,0,1),ns=.45+.5*k;
 if(Math.abs(wm.normalScale.x-ns)>.004){wm.normalScale.set(ns,ns)}
}

S.onFrame((G,t,dt,info)=>{
 if(!pl)return;
 seaFrame(G,t,dt,info);raftFrame(G,t,dt,info);gullFrame(G,t,dt,info);dolphinFrame(G,t,dt,info);planktonFrame(G,t,dt,info);beaconFrame(G,t,dt,info);stormFrame(G,t,dt,info);
});
})();
