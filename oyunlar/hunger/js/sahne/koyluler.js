/* Hunger 3D - sahne: köylü modelleri (mesleğe göre giysi ve araç) ve canlandırması */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const {blob,rbox,merge,part,cyl,cone,alongPart,fb3,box}=sc.g;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const objs=new Map(),cache={};
let mat=null,seed=300;
const Bp=(r,c,x,y,z,sx,sy,sz,o)=>{o=o||{};const p=part(blob(r,o.d===undefined?2:o.d,o.amp===undefined?.03:o.amp,++seed,sx||1,sy||1,sz||1),c,x,y,z,1,1,1,o.rx,o.ry,o.rz,o.jit);if(o.cf)p.cf=o.cf;return p};
const SKIN=[0xe0b48a,0xc99468,0xf0c8a0],HAIR=[0x3a2a1c,0x6a4a2a,0x1c1612,0xb08a4a,0x8a8a8a];
const LOOK={
 farmer:{tun:0x8a6a3a,leg:0x4a3a2a,hat:0xd9c070},
 hunter:{tun:0x3f5a35,leg:0x3a3226,hat:0x2f4a2a},
 fisher:{tun:0x3f6a8a,leg:0x33404a,hat:0xd9b030},
 smith:{tun:0x55555d,leg:0x2a2a30,hat:0x2a2a2a},
 healer:{tun:0xe8e4da,leg:0xb8b2a2,hat:0xe8e4da},
 woodcut:{tun:0xa83a2e,leg:0x3a3226,hat:0x6b4a29},
 miner:{tun:0x6a6a72,leg:0x3a3a42,hat:0xd9b030}
};
sc.npcLook=LOOK;                    /* büyük güncelleme (51): yeni meslekler (gezgin tüccar) kendi görünümünü buraya ekler */
function build(prof,v,f){
 const L=LOOK[prof],skin=SKIN[v%3],hair=HAIR[(v*7+prof.length)%5];
 const plaid=(x,y,z,nx,ny,nz,c)=>{if(Math.floor(x*18)%2===0||Math.floor(y*18)%2===0)c.multiplyScalar(.78)};
 const tcf=prof==='woodcut'?plaid:null;
 const torso=[
  part(rbox(.46,.62,.26,.35,3),L.tun,0,1.17,0),Bp(.13,skin,0,1.64,0,.95,1.08,1,{amp:.02}),part(cyl(.05,.06,.1,7),skin,0,1.5,0),
  Bp(.138,hair,0,1.68,-.02,1,.8,1.05,{amp:.04}),
  Bp(.015,0x1a1210,.045,1.65,.12,1,1,1,{d:0,amp:0}),Bp(.015,0x1a1210,-.045,1.65,.12,1,1,1,{d:0,amp:0}),Bp(.018,0xc89080,0,1.61,.13,1,.8,1,{d:1,amp:0}),
  part(rbox(.5,.1,.3,.4,2),0x3a2a1c,0,.88,0)
 ];
 if(tcf)torso[0].cf=tcf;
 /* mesleğe özgü eşyalar */
 if(prof==='farmer'){torso.push(part(cyl(.26,.26,.02,12),L.hat,0,1.77,0),part(cyl(.12,.13,.1,10),L.hat,0,1.82,0))}
 else if(prof==='hunter'){torso.push(Bp(.16,L.hat,0,1.68,-.03,1,1.05,1.05,{amp:.03}),part(cone(.12,.2,6),L.hat,0,1.62,-.18,1,1,1,-.9),
  part(cyl(.012,.012,.9,5),0x8a5a30,.12,1.3,-.16,1,1,1,0,0,.2),part(cyl(.07,.08,.3,8),0x6a4a2a,-.1,1.25,-.17))}
 else if(prof==='fisher'){torso.push(part(cyl(.2,.22,.03,12),L.hat,0,1.78,0),Bp(.13,L.hat,0,1.8,0,1,.6,1,{amp:.02}))}
 else if(prof==='smith'){torso.push(part(rbox(.4,.55,.04,.3,2),0x222226,0,1.08,.14),Bp(.14,hair,0,1.7,0,1,.5,1,{amp:.02}))}
 else if(prof==='healer'){torso.push(part(box(.1,.02,.02),0xd9463c,0,1.3,.14),part(box(.02,.1,.02),0xd9463c,0,1.3,.14),part(rbox(.16,.14,.07,.4,2),0x7a5a30,.28,.9,0))}
 else if(prof==='woodcut'){torso.push(Bp(.135,hair,0,1.7,0,1,.6,1,{amp:.03}),part(cyl(.12,.12,.14,8),0x2a2018,0,1.08,.14,1,1,1,PI2,0,0))}
 else if(prof==='miner'){torso.push(Bp(.16,L.hat,0,1.74,0,1.05,.75,1.1,{amp:.01}),part(cyl(.2,.2,.02,10),L.hat,0,1.7,0),part(cyl(.03,.03,.05,6),0xfff0b0,0,1.78,.17,1,1,1,PI2,0,0))}
 else if(sc.npcExtra)sc.npcExtra(prof,torso,{part,cyl,cone,box,rbox,Bp,PI2,L,skin,hair});
 /* görünüm: yaka, kemer tokası, bot; kadınlarda etek ve uzun saç, erkeklerde bazen sakal */
 torso.push(part(rbox(.3,.05,.2,.4,2),0xe8e4da,0,1.5,.01),part(box(.07,.07,.02),0xc9a23a,0,.88,.15));
 if(f){torso.push(part(cyl(.2,.34,.52,10),L.tun,0,.7,0),Bp(.15,hair,0,1.6,-.07,1.05,1.3,.9,{amp:.04}),Bp(.05,hair,.1,1.5,-.08,1,2.2,1,{d:1,amp:.01}),Bp(.05,hair,-.1,1.5,-.08,1,2.2,1,{d:1,amp:.01}))}
 else if((v+prof.length)%3===0)torso.push(Bp(.09,hair,0,1.56,.1,1.2,.9,.7,{amp:.03}));
 const legs=merge([part(cyl(.09,.075,.44,8),L.leg,0,-.22,0),part(cyl(.075,.065,.4,8),L.leg,0,-.64,.0),Bp(.085,0x2a1e14,0,-.82,.05,1,.7,1.5,{d:1,amp:.02})],{jit:.05});
 const arm=(right)=>{
  const ps=[part(cyl(.058,.048,.34,7),L.tun,0,-.17,0),part(cyl(.045,.04,.3,7),L.tun,0,-.45,.0),Bp(.05,skin,0,-.64,0,1,1,1,{d:1,amp:.01})];
  if(tcf)ps[0].cf=ps[1].cf=tcf;
  if(right){
   if(prof==='smith'){ps.push(part(cyl(.02,.02,.4,6),0x6b4423,0,-.66,.1,1,1,1,PI2,0,0),part(box(.08,.08,.16),0x55555d,0,-.66,.3))}
   else if(prof==='woodcut'){ps.push(part(cyl(.02,.025,.8,6),0x8a5a30,0,-.62,.1,1,1,1,PI2,0,0),part(box(.04,.18,.22),0x7d838c,0,-.6,.5),part(box(.03,.18,.05),0xa6acb4,0,-.6,.62))}
   else if(prof==='miner'){ps.push(part(cyl(.02,.025,.8,6),0x8a5a30,0,-.62,.1,1,1,1,PI2,0,0),part(box(.05,.05,.5),0x8d8d92,0,-.6,.5))}
   else if(prof==='fisher'){ps.push(part(cyl(.012,.02,1.3,5),0x8a5a30,0,-.6,.2,1,1,1,PI2*.7,0,0))}
   else if(prof==='farmer'){ps.push(part(cyl(.02,.02,1.2,6),0x8a5a30,0,-.62,.0,1,1,1,0,0,0),part(box(.2,.02,.02),0x8d8d92,0,.0-.62+.6,0),
    ...[-.08,0,.08].map(x=>part(cone(.012,.16,4),0x8d8d92,x,-.62+.7,0)))}
   else if(prof==='hunter'){ps.push(part(cyl(.013,.013,.5,5),0xa87440,0,-.64,.1,1,1,1,PI2,0,0),part(cone(.022,.06,4),0xc3c9d0,0,-.64,.38,1,1,1,PI2,0,0))}
  }
  return merge(ps,{jit:.05});
 };
 return {torso:merge(torso,{ao:.8,jit:.05}),legs,armL:arm(false),armR:arm(true)};
}
const PI2=Math.PI/2;
function make(n){
 if(!mat)mat=sc.mat({roughness:.85});
 const key=n.prof+(n.id%3)+(n.f?'f':'m');
 if(!cache[key])cache[key]=build(n.prof,n.id,!!n.f);
 const M=cache[key],g=new THREE.Group(),o={g};
 const mk=(geo,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m};
 o.torso=mk(M.torso,0,0,0);g.add(o.torso);
 o.legL=mk(M.legs,-.1,.88,0);o.legR=mk(M.legs,.1,.88,0);
 o.armL=mk(M.armL,-.3,1.42,0);o.armR=mk(M.armR,.3,1.42,0);
 g.add(o.legL,o.legR,o.armL,o.armR);
 sc.scene.add(g);return o;
}
sc.npcMake=make;
S.onFrame((G,t,dt,info)=>{
 const L=G.npcs||[];
 const alive=new Set(L);
 for(const [n,o] of objs)if(!alive.has(n)){sc.scene.remove(o.g);objs.delete(n)}
 if(info.mode!=='play'){for(const o of objs.values())o.g.visible=false;return}
 const cam=sc.cam.position;
 for(const n of L){
  const d2=(n.x-cam.x)**2+(n.z-cam.z)**2;let o=objs.get(n);
  if(d2>110*110){if(o)o.g.visible=false;continue}
  if(!o){o=make(n);objs.set(n,o)}
  o.g.visible=true;
  const gy=S.groundY(n.x,n.z),ph=n.walk*2.2,amp=Math.min(1,n.spd/.8)*.7;
  o.g.position.set(n.x,gy,n.z);o.g.rotation.order='YXZ';o.g.rotation.y=n.yaw;
  if(n.sleep){
   /* uyuyan köylü: sırtüstü yatar, yavaş nefes alır */
   const hr=n.house&&n.house.ry!==undefined?n.house.ry:n.yaw,gh=n.house?S.groundY(n.house.x,n.house.z):gy;
   /* yatağın üstünde, baş ucu yastığa doğru yatar */
   o.g.rotation.y=hr;o.g.rotation.x=-Math.PI/2;o.g.position.set(n.x+Math.sin(hr)*.85,gh+.72+Math.sin(t*1.1+n.id)*.008,n.z+Math.cos(hr)*.85);
   o.legL.rotation.set(0,0,0);o.legR.rotation.set(0,0,0);o.armL.rotation.set(0,0,.05);o.armR.rotation.set(0,0,-.05);o.torso.rotation.set(0,0,0);o.torso.scale.y=1+Math.sin(t*1.1+n.id)*.012;
   continue;
  }
  o.g.rotation.x=0;
  o.legL.rotation.x=Math.sin(ph)*amp;o.legR.rotation.x=-Math.sin(ph)*amp;
  const talk=G.trading===n;
  o.armL.rotation.x=-Math.sin(ph)*amp*.8+Math.sin(t*1.3+n.id)*.02;
  o.armR.rotation.x=talk?-.5+Math.sin(t*2.4)*.25:Math.sin(ph)*amp*.8+Math.sin(t*1.1+n.id)*.02;
  o.armR.rotation.z=talk?-.25:-.04;o.armL.rotation.z=.04;
  const br=1+Math.sin(t*1.8+n.id)*.008;o.torso.scale.y=br;o.torso.position.y=Math.abs(Math.sin(ph))*amp*.03;
  /* oyuncuya bakma (baş-gövde dönüşü), el sallama ve mesleğe göre iş animasyonu */
  const idle=n.spd<.15,dxp=G.px-n.x,dzp=G.py-n.z,dp=Math.hypot(dxp,dzp);
  let rel=0;if(idle&&dp<13){rel=Math.atan2(dxp,dzp)-n.yaw;while(rel>Math.PI)rel-=6.283;while(rel<-Math.PI)rel+=6.283;rel=Math.max(-.8,Math.min(.8,rel))*Math.min(1,(13-dp)/5)}
  o.tw=(o.tw||0)+(rel-(o.tw||0))*Math.min(1,4*dt);o.torso.rotation.y=o.tw;
  if(idle&&!talk){
   if(dp<9&&dp>2.5&&!o.waved){o.waved=true;o.wv=2.2}
   if(dp>16)o.waved=false;
   if(o.wv>0){o.wv-=dt;const u=Math.min(1,o.wv/.3,(2.2-o.wv)/.3);o.armL.rotation.x=-2.5*u;o.armL.rotation.z=.25+Math.sin(t*10)*.35*u}
   else if(dp>5){
    const w=t*(n.prof==='smith'?3.2:2.2)+n.id*1.7,sw=Math.max(0,Math.sin(w));
    if(n.prof==='smith'){o.armR.rotation.x=-1.1-sw*.9;o.armL.rotation.x=-.6+Math.sin(w+1)*.1;o.torso.rotation.x=sw*.06}
    else if(n.prof==='woodcut'||n.prof==='miner'){o.armR.rotation.x=-.4-sw*2.0;o.armL.rotation.x=-.3-sw*1.2;o.torso.rotation.x=sw*.1}
    else if(n.prof==='farmer'){const b=(Math.sin(w*.7)+1)*.5;o.torso.rotation.x=b*.45;o.armR.rotation.x=-b*.6;o.armL.rotation.x=-b*.5}
    else if(n.prof==='fisher'){o.armR.rotation.x=-.9+Math.sin(w*.4)*.15;o.armL.rotation.x=-.5}
    else if(n.prof==='healer'){o.armR.rotation.x=-.9+Math.sin(w*.8)*.2;o.armR.rotation.z=-.3}
    else if(n.prof==='hunter'){o.armR.rotation.x=-.3+Math.sin(w*.3)*.1;o.torso.rotation.y+=Math.sin(w*.25)*.25}
   }
  }
  if(!idle||talk||dp<=5)o.torso.rotation.x=0;
 }
});
})();
