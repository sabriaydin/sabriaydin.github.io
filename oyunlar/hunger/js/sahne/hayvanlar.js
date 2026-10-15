/* Hunger 3D - sahne: hayvanların çizimi ve canlandırması (yürüme, kaçma, vurulma, ölme) */
(()=>{
'use strict';
const {ANIMAL}=HG;
const S=HG.Scene,sc=HG.sc;
const objs=new Map();
let mat=null,matF=null;
const VIEW=120;                                  /* bu mesafeden uzak hayvanlar çizilmez */
const clamp=HG.clamp,q=new THREE.Quaternion(),qp=new THREE.Quaternion(),qz=new THREE.Quaternion(),ax=new THREE.Vector3(1,0,0),AY=new THREE.Vector3(0,1,0),AZ=new THREE.Vector3(0,0,1),alive=new Set();   /* kare başına yeni nesne ayrılmaz */

function make(a){
 const M=sc.ANIM[a.t],def=ANIMAL[a.t];
 if(!M)return null;
 if(!mat)mat=sc.mat({roughness:.85});
 const g=new THREE.Group(),o={g,legs:[],a};
 if(def.foe&&!matF)matF=sc.mat({roughness:.55});
 o.body=new THREE.Mesh(M.body,def.foe?matF:mat);o.body.castShadow=true;o.body.receiveShadow=true;g.add(o.body);
 if(M.bodyS){o.bodyS=new THREE.Mesh(M.bodyS,mat);o.bodyS.castShadow=true;o.bodyS.receiveShadow=true;g.add(o.bodyS);o.bodyS.visible=false}
 M.legs.forEach((p,i)=>{
  const l=new THREE.Mesh(M.leg,mat);l.position.set(p[0],p[1],p[2]);l.castShadow=true;g.add(l);o.legs.push(l);
 });
 /* ayrı hareket eden parçalar: baş, kuyruk (hayvanlar için grupta; gölgede kollar gövdede) */
 for(const role of ['head','tail','armL','armR']){
  if(!M[role])continue;
  const m=new THREE.Mesh(M[role],def.foe?matF:mat),pv=M[role+'P']||[0,0,0];
  m.position.set(pv[0],pv[1],pv[2]);m.castShadow=true;m.receiveShadow=true;
  (def.foe?o.body:g).add(m);o[role]=m;
 }
 if(M.extra)M.extra(o);
 sc.scene.add(g);return o;
}
S.onFrame((G,t,dt,info)=>{
 const L=G.animals||[];
 alive.clear();for(const a of L)alive.add(a);
 for(const [a,o] of objs)if(!alive.has(a)){sc.scene.remove(o.g);objs.delete(a)}
 const play=info.mode==='play',px=play?G.px:HG.W/2,pz=play?G.py:HG.H/2,cam=sc.cam.position;
 for(const a of L){
  const d2=(a.x-cam.x)**2+(a.z-cam.z)**2;
  let o=objs.get(a);
  if(d2>VIEW*VIEW){if(o)o.g.visible=false;continue}
  if(!o){o=make(a);if(!o)continue;objs.set(a,o)}
  o.g.visible=true;
  const def=ANIMAL[a.t],gy=S.groundY(a.x,a.z);
  /* eğime uyum: ön ve arka zemin farkından eğim */
  const fx=Math.sin(a.yaw),fz=Math.cos(a.yaw),r=def.r*.8;
  const pitch=-Math.atan2(S.groundY(a.x+fx*r,a.z+fz*r)-S.groundY(a.x-fx*r,a.z-fz*r),r*2);
  o.pitch=(o.pitch||0)+(pitch-(o.pitch||0))*Math.min(1,8*dt);
  /* vurulma: kısa sıçrama ve sıkışma */
  const hit=a.hitT>0?Math.sin(a.hitT/.25*Math.PI):0;
  let y=gy+hit*.08,rz=0,sy=1;
  if(a.dying&&def.foe){
   const u=Math.min(1,a.dying/1.1);y=gy+u*.7;sy=1-u;
  }else if(a.dying){
   const u=Math.min(1,a.dying/.5),sg=(a.id%2?1:-1);
   /* devrilme: aşırıya kaçıp geri sekme, yere çarpınca zıplama, son titreşim */
   rz=sg*Math.PI/2*(u<1?Math.sin(u*Math.PI/2)*(1+.08*Math.sin(u*Math.PI)):1-Math.exp(-(a.dying-.5)*9)*.07*Math.cos((a.dying-.5)*22)+.0);
   y=gy+Math.sin(u*Math.PI/2)*def.r*.35+(a.dying>.5?Math.exp(-(a.dying-.5)*7)*Math.abs(Math.sin((a.dying-.5)*14))*def.r*.25:0);
   o.dyingTw=a.dying>.5&&a.dying<2.2?Math.sin(a.dying*38)*Math.exp(-(a.dying-.5)*1.8)*.5:0;
   if(a.gone){const w=Math.min(1,(a.dying-5)/4);y-=Math.max(0,w)*.6;sy=1-Math.max(0,w)*.9}
  }
  if(def.foe){
   const b=a.born===undefined?1:a.born;sy=Math.min(sy,.15+.85*b);
   y+=Math.sin(t*1.4+a.id)*.03;
   o.body.rotation.x+=((a.spd>1?.28:0)-o.body.rotation.x)*Math.min(1,6*dt);
   o.body.rotation.z=Math.sin(t*(1.2+a.id%3*.3)+a.id)*.05+(a.flinch>0?Math.sin(t*50)*.08:0);
   if(o.eyes)for(const e of o.eyes)e.visible=!a.dying&&b>.4&&Math.sin(t*9+a.id*3)>-.92;
  }
  o.g.position.set(a.x,y,a.z);
  o.g.rotation.set(0,0,0);
  q.setFromAxisAngle(AY,a.yaw);qp.setFromAxisAngle(ax,o.pitch+(o.extraPitch||0));
  qz.setFromAxisAngle(AZ,rz);
  o.g.quaternion.copy(q).multiply(qp).multiply(qz);
  const s=1-hit*.05;o.g.scale.set(s,Math.max(.05,sy)*(1+hit*.04),s);
  /* gövde: kırkılmış koyun */
  if(o.bodyS){o.body.visible=!a.sheared;o.bodyS.visible=!!a.sheared}
  /* ---- hareket: yürüyüş, tırıs, dört nala, tavşan sıçraması, baş ve kuyruk ---- */
  const M=sc.ANIM[a.t],mvk=Math.min(1,a.spd/Math.max(.5,def.walk*2.2)),run=a.spd>def.walk*1.8,amp=mvk*.85,ph=a.walk*2.2;
  const idle=!a.dying&&a.spd<.15&&!(a.panic>0)&&!(a.charge>0),by=a.dying?0:Math.abs(Math.sin(ph))*amp*(run?.06:.03);
  o.body.position.y=by;if(o.bodyS)o.bodyS.position.y=by;
  const hop=a.t==='rabbit'&&!a.dying?Math.abs(Math.sin(a.walk*1.6))*.16*mvk:0;
  if(hop){o.g.position.y+=hop}
  o.legs.forEach((l,i)=>{
   if(a.dying){l.rotation.x=(o.dyingTw||0)*(i%2?1:-1)+(a.dying>.3&&!def.foe?.3*(i<2?1:-1):0);return}
   if(a.t==='rabbit'){l.rotation.x=(i<2?-1:1)*Math.sin(a.walk*1.6)*.9*mvk;return}
   if(run){l.rotation.x=Math.sin(ph+(i<2?0:2.3))*amp*1.15;return}
   l.rotation.x=Math.sin(ph)*amp*((i===0||i===3)?1:-1);
  });
  /* gövde eğimi: dört nalda ve sıçramada öne arkaya sallanır */
  o.extraPitch=a.dying?0:(run?Math.sin(ph+.6)*.05*mvk:0)+(hop?Math.cos(a.walk*1.6)*.22*mvk:0);
  const br=1+Math.sin(t*1.7+a.id*2)*.007;
  o.g.scale.y*=br;
  if(a.dying){
   if(o.head){o.head.position.set(M.headP[0],M.headP[1],M.headP[2]);o.head.rotation.set(.35,0,0)}
   if(o.tail)o.tail.position.set(M.tailP[0],M.tailP[1],M.tailP[2]);
  }else{
   if(o.head){
    /* otlama (sakin hayvanlar), tetikte baş kaldırma, saldırıda öne atılma, oyuncuya bakma */
    const P=M.headP,graze=(a.t==='sheep'||a.t==='cow'||a.t==='deer')&&idle?(()=>{const f=((t*.06+a.id*.37)%1);return f<.4?Math.sin(Math.PI*f/.4):0})():0;
    const dxp=G.px-a.x,dzp=G.py-a.z,dpp=Math.hypot(dxp,dzp);
    let rel=0;if(idle&&dpp<14&&!graze){let d=Math.atan2(dxp,dzp)-a.yaw;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;rel=clamp(d,-.7,.7)*clamp((14-dpp)/6,0,1)}
    const alert=(def.flee&&dpp<def.flee*1.4)||a.panic>0?-.22:0;
    const atk=a.atkT>0?Math.sin(Math.min(1,a.atkT/.45)*Math.PI):0;
    const chew=graze?Math.sin(t*9+a.id)*.04:0;
    const hp=graze*.85+alert+atk*.55+Math.sin(ph*2)*.07*mvk*(run?1:.4)+(a.t==='boar'&&a.charge>0?.2:0)+chew+Math.sin(t*.9+a.id)*.012;
    o.head.position.set(P[0],P[1]+by,P[2]+atk*.3);
    o.head.rotation.set(hp,(o.head.rotation.y||0)+(rel-(o.head.rotation.y||0))*Math.min(1,5*dt),Math.sin(t*.7+a.id)*.015);
   }
   if(o.tail){
    const P=M.tailP;let yw=0,pt=0;
    if(a.t==='sheep'||a.t==='cow'){yw=Math.sin(t*(idle?2.2:5)+a.id)*.3}
    else if(a.t==='wolf'){pt=a.charge>0?-.55:(a.panic>0||run?-.15:.35);yw=Math.sin(t*3+a.id)*(a.charge>0?.1:.2)}
    else if(a.t==='deer'){pt=run?-.5:0;yw=Math.sin(t*(run?10:2.5)+a.id)*.25}
    else if(a.t==='boar'){yw=Math.sin(t*4+a.id)*.35;pt=-.2}
    o.tail.position.set(P[0],P[1]+by,P[2]);o.tail.rotation.set(pt,yw,0);
   }
  }
  /* gölge kolları: yürürken sallanır, yaklaşırken ileri uzanır, saldırıda savrulur */
  if(o.armL&&o.armR){
   const reach=(a.seen?0:1)*clamp(1-Math.hypot(G.px-a.x,G.py-a.z)/16,0,1),atk=a.atkT>0?Math.sin(Math.min(1,a.atkT/.5)*Math.PI):0;
   o.armL.rotation.set(-Math.sin(ph)*amp*.5-reach*1.1-atk*1.4,0,.12+Math.sin(t*1.7+a.id)*.05);
   o.armR.rotation.set(Math.sin(ph)*amp*.5-reach*1.1-atk*1.4,0,-.12-Math.sin(t*1.3+a.id)*.05);
   if(a.seen&&!a.dying){o.body.position.x=Math.sin(t*70+a.id)*.012}else o.body.position.x=0;
  }
 }
});
})();
