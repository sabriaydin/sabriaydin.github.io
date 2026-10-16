/* Hunger 3D - silahlar: yay (ger-bırak), ok fiziği, isabet, geri toplama */
(()=>{
'use strict';
const {W,H,T,O,SOLID,OBJTOP,G,ui,inp,Scene,ANIMAL,held,count,take,clamp}=HG;
const sc=HG.sc;
const bow=HG.bow={draw:0,on:false,kick:0,noAmmo:0};
const GRAV=12,DRAW_T=.85,MAXLIFE=7;
const dir=new THREE.Vector3(),pos=new THREE.Vector3();

function fire(draw){
 take('arrow',1);HG.ui.dirty=true;
 sc.cam.getWorldDirection(dir);sc.cam.getWorldPosition(pos);
 const spread=(1-draw)*.06+.004;
 dir.x+=(Math.random()-.5)*spread;dir.y+=(Math.random()-.5)*spread;dir.z+=(Math.random()-.5)*spread;dir.normalize();
 const sp=20+34*draw;
 G.arrows.push({x:pos.x+dir.x*.6,y:pos.y+dir.y*.6-.08,z:pos.z+dir.z*.6,vx:dir.x*sp,vy:dir.y*sp,vz:dir.z*sp,life:MAXLIFE,draw,stuck:false,t:0});
 if(G.arrows.length>40)G.arrows.shift();
 bow.kick=1;HG.snd('bowfire');HG.flag('shot');
}
function recover(x,y,z,chance){
 if(Math.random()<chance)HG.spawnDrop('arrow',1,{x,z,y:y+.3,vx:0,vz:0});
}
function hitTarget(ar,ox,oy,oz){
 /* doğru parçası - dikey kapsül (küre zinciri) testi; vuruş noktası da döner */
 let best=null,bt=2;
 const dx=ar.x-ox,dy=ar.y-oy,dz=ar.z-oz;
 for(const a of G.animals||[]){
  if(a.dying||a.pet)continue;                  /* evcil köpek okla vurulmaz */
  const def=ANIMAL[a.t];
  if((a.x-ox)**2+(a.z-oz)**2>(Math.hypot(dx,dz)+def.r+2)**2)continue;
  const gy=a.by!==undefined?a.by:Scene.groundY(a.x,a.z),rr=Math.max(def.r*1.1,def.h*.3)+.12;
  for(const f of [.3,.55,.8]){
   const cy=gy+def.h*f,vx=a.x-ox,vy=cy-oy,vz=a.z-oz,L2=dx*dx+dy*dy+dz*dz||1e-6;
   let t=(vx*dx+vy*dy+vz*dz)/L2;t=clamp(t,0,1);
   const px=ox+dx*t-a.x,py=oy+dy*t-cy,pz=oz+dz*t-a.z;
   if(px*px+py*py+pz*pz<rr*rr&&t<bt){bt=t;best={a,x:ox+dx*t,y:oy+dy*t,z:oz+dz*t}}
  }
 }
 return best;
}
/* Köylüler: oklar içlerinden geçmez; vurulan köylü bir süre küser ve uzaklaşır */
function hitNpc(ar,ox,oy,oz){
 const dx=ar.x-ox,dy=ar.y-oy,dz=ar.z-oz,L2=dx*dx+dy*dy+dz*dz||1e-6;
 for(const n of G.npcs||[]){
  if(n.inside)continue;
  if((n.x-ox)**2+(n.z-oz)**2>(Math.hypot(dx,dz)+1.5)**2)continue;
  const gy=Scene.groundY(n.x,n.z);
  for(const f of [.25,.55,.85]){
   const cy=gy+1.7*f,vx=n.x-ox,vy=cy-oy,vz=n.z-oz;
   const t=clamp((vx*dx+vy*dy+vz*dz)/L2,0,1);
   const px=ox+dx*t-n.x,py=oy+dy*t-cy,pz=oz+dz*t-n.z;
   if(px*px+py*py+pz*pz<.3*.3)return n;
  }
 }
 return null;
}
function updateArrows(dt){
 const L=G.arrows;
 for(let k=L.length-1;k>=0;k--){
  const a=L[k];
  if(a.stuck){a.sT=(a.sT||0)+dt;a.life-=dt;if(a.life<=0)L.splice(k,1);continue}
  a.life-=dt;a.t+=dt;
  if(a.life<=0){L.splice(k,1);continue}
  const n=Math.max(1,Math.ceil(Math.hypot(a.vx,a.vy,a.vz)*dt/.45)),h=dt/n;
  for(let s=0;s<n&&!a.stuck;s++){
   const ox=a.x,oy=a.y,oz=a.z;
   const W_=HG.sc.wind,dr=Math.exp(-.12*h);   /* hava direnci + rüzgâr sürüklenmesi */
   a.vx=a.vx*dr+(W_?W_.x*W_.s*.35*h:0);a.vz=a.vz*dr+(W_?W_.z*W_.s*.35*h:0);a.vy*=dr;
   a.vy-=GRAV*h;a.x+=a.vx*h;a.y+=a.vy*h;a.z+=a.vz*h;
   const tx=Math.floor(a.x),tz=Math.floor(a.z);
   if(tx<0||tz<0||tx>=W||tz>=H){L.splice(k,1);break}
   const i=tz*W+tx,gy=Scene.groundY(a.x,a.z),tile=G.tile[i];
   /* canlılar */
   const tg=hitTarget(a,ox,oy,oz);
   if(tg){
    const an=tg.a,def=ANIMAL[an.t];
    const zone=HG.hitAnimal(an,HG.arrowDamage(a.draw),tg);HG.hitMarker(an.hp<=0,zone);
    HG.snd('arrowflesh',{x:an.x,z:an.z,y:gy+def.h*.5});
    recover(an.x,gy,an.z,.55);
    L.splice(k,1);break;
   }
   /* köylüler */
   const nv=hitNpc(a,ox,oy,oz);
   if(nv){
    L.splice(k,1);nv.anger=90;
    HG.snd('arrowflesh',{x:nv.x,z:nv.z,y:gy+1});HG.toast(nv.name+' sana kızdı. Bir süre konuşmak istemeyecek.');
    break;
   }
   /* su */
   if((tile<=T.SHAL||tile===T.POND)&&a.y<sc.WY){HG.snd('splash',{x:a.x,z:a.z,y:a.y});Scene.burst(a.x,sc.WY,a.z,0x9fd0f0,5);L.splice(k,1);break}
   /* nesne ve zemin */
   const o=G.obj[i];
   if(o&&SOLID(o)&&a.y<gy+(OBJTOP[o]||1)&&a.y>gy-.3){
    a.stuck=true;a.life=14;a.x=ox;a.y=oy;a.z=oz;HG.snd('arrowhit',{x:a.x,z:a.z,y:a.y});
    recover(a.x-a.vx*.02,gy,a.z-a.vz*.02,.5);
    Scene.burst(a.x,a.y,a.z,o===O.TREE?0x6a4a2a:0x9a9a9a,4);
    break;
   }
   if(a.y<=gy+.04){
    a.stuck=true;a.life=14;a.y=gy+.04;HG.snd('arrowhit',{x:a.x,z:a.z,y:a.y});
    recover(a.x,gy,a.z,.6);Scene.burst(a.x,gy+.05,a.z,0x7a6a4a,3);
    break;
   }
  }
 }
}
let msgT=0;
function updateBow(dt){
 const h=held(),isBow=!!(h&&h.it.tool==='bow'),panel=!HG.$('#panel').hidden;
 bow.kick=Math.max(0,bow.kick-dt*5);
 if(!isBow||ui.state!=='play'||panel){bow.on=false;bow.draw=0;return}
 const down=(inp.mouseDown||inp.touchAct);
 if(down){
  if(count('arrow')>0){
   if(!bow.on){bow.on=true;HG.snd('bowdraw')}
   bow.draw=Math.min(1,bow.draw+dt/DRAW_T);
  }else{msgT-=dt;if(msgT<=0){msgT=1.5;HG.toast('Ok yok. Odun ve taştan ok üretin.')}}
 }else if(bow.on){
  if(bow.draw>.18)fire(bow.draw);
  bow.on=false;bow.draw=0;
 }
}
function updateWeapons(dt){
 if(!G.arrows)G.arrows=[];
 updateBow(dt);updateArrows(dt);
}
Object.assign(HG,{updateWeapons});
})();
