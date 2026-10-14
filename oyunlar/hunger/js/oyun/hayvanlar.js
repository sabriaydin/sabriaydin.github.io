/* Hunger 3D - hayvanlar: yapay zekâ (gezinme, kaçma, saldırı), vurma, süt, yün, yeniden doğma */
(()=>{
'use strict';
const {W,H,T,SOLID,ANIMAL,DMG,G,Scene,fbm,clamp}=HG;
let nextId=1;
const rnd=Math.random;

function makeAnimals(list){
 return (list||[]).filter(a=>ANIMAL[a.t]).map(a=>({
  id:nextId++,t:a.t,x:a.x,z:a.z,yaw:a.yaw||0,hp:a.hp||ANIMAL[a.t].hp,home:{x:a.x,z:a.z},tx:a.x,tz:a.z,
  moving:false,tm:rnd()*3,panic:0,charge:0,hitT:0,cd:0,walk:rnd()*6,spd:0,dying:a.dead?5:0,milkAt:0,shearAt:0,sheared:!!a.sheared,avoid:0,avoidT:0
 }));
}
function walkable(x,z){
 const r=.35,pts=[[0,0],[r,0],[-r,0],[0,r],[0,-r]];
 for(const [dx,dz] of pts){
  const tx=Math.floor(x+dx),tz=Math.floor(z+dz);
  if(tx<1||tz<1||tx>=W-1||tz>=H-1)return false;
  const i=tz*W+tx,t=G.tile[i];
  if(t<T.SAND||t===T.POND||SOLID(G.obj[i]))return false;
 }
 return true;
}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};

function updateAnimals(dt){
 const L=G.animals;if(!L)return;
 HG.updateFoes(dt);
 for(let k=L.length-1;k>=0;k--){
  const a=L[k],def=ANIMAL[a.t];
  if(a.kx||a.kz){                       /* vuruş sonrası itilme: hız sönümlenerek kayar */
   const nx=a.x+a.kx*dt,nz=a.z+a.kz*dt;
   if(walkable(nx,a.z))a.x=nx;else a.kx*=-.2;
   if(walkable(a.x,nz))a.z=nz;else a.kz*=-.2;
   const f=Math.exp(-7*dt);a.kx*=f;a.kz*=f;if(Math.abs(a.kx)+Math.abs(a.kz)<.05)a.kx=a.kz=0;
  }
  if(a.dying){
   if(def.foe){a.dying+=dt;if(a.dying>1.3)L.splice(k,1);continue}
   a.dying+=dt;
   /* leş, çevresindeki eşyalar toplanana kadar kalır */
   if(a.dying>3&&(G.clock-(a.lootT||0))>1){
    a.lootT=G.clock;let has=false;
    for(const d of G.drops||[])if(Math.hypot(d.x-a.x,d.z-a.z)<3.2){has=true;break}
    if(!has)a.gone=true;
   }
   if(a.gone){a.dying+=dt*2;if(a.dying>9)L.splice(k,1)}
   continue;
  }
  if(a.sheared&&G.clock>a.shearAt)a.sheared=false;
  const dx=G.px-a.x,dz=G.py-a.z,dp=Math.hypot(dx,dz);
  a.callT=(a.callT===undefined?8+rnd()*30:a.callT)-dt;
  if(a.callT<=0){a.callT=18+rnd()*40;const cr=a.t==='wolf'?70:22;if(dp<cr&&dp>2&&a.t!=='rabbit'&&!def.foe&&(a.t!=='wolf'||HG.daylight()<.5))HG.snd('call_'+def.snd,{x:a.x,z:a.z})}
  a.hitT=Math.max(0,a.hitT-dt);a.cd-=dt;
  let spd=0,head=a.yaw;
  const play=HG.ui.state==='play',dark=HG.daylight()<.55;
  const ll=def.fearLight?HG.lightLevel(a.x,a.z):0;
  if(def.foe){const r=HG.foeAI(a,def,dt);head=r.head;spd=r.spd}
  else if(def.fearLight&&ll>.1){a.charge=0;head=Math.atan2(-dx,-dz);spd=def.run}
  else if(def.night&&(a.hp<def.hp*.3||(!dark&&dp<14))){head=Math.atan2(-dx,-dz);spd=def.run}
  else if(a.charge>0){
   a.charge-=dt;head=Math.atan2(dx,dz);spd=dp<def.r+.75?0:def.run;
   if(dp<def.r+1.0&&a.cd<=0&&play){a.cd=def.cd||1.2;a.atkT=.45;HG.hurt(def.dmg,def.n+' saldırısında öldün.',{x:a.x,z:a.z},def.bleed||.35);HG.toast(def.n+' saldırdı!')}
   if(dp>20)a.charge=0;
  }else if(a.panic>0||(def.flee&&dp<def.flee)){
   if(a.panic>0)a.panic-=dt;
   head=Math.atan2(-dx,-dz);spd=def.run;
  }else if(def.aggr&&dp<def.aggr&&play&&(!def.night||dark)){a.charge=def.chase||7}
  else{
   a.tm-=dt;
   if(a.tm<=0){
    if(a.moving){a.moving=false;a.tm=1.5+rnd()*4.5}
    else{const ang=rnd()*6.28,r=2+rnd()*5;a.tx=a.home.x+Math.cos(ang)*r;a.tz=a.home.z+Math.sin(ang)*r;a.moving=true;a.tm=3+rnd()*4}
   }
   if(a.moving){
    const tx=a.tx-a.x,tz=a.tz-a.z;
    if(Math.hypot(tx,tz)<.5){a.moving=false;a.tm=1+rnd()*3}else{head=Math.atan2(tx,tz);spd=def.walk}
   }
  }
  /* engelden kaçınma */
  if(a.avoidT>0){a.avoidT-=dt;head+=a.avoid}
  if(spd>0){
   const d=angDiff(a.yaw,head),turn=(spd>def.walk*1.5?7:3.5)*dt;
   a.yaw+=clamp(d,-turn,turn);
   const step=spd*dt*(Math.abs(d)>1.4?.2:1),nx=a.x+Math.sin(a.yaw)*step,nz=a.z+Math.cos(a.yaw)*step;
   const wk=def.foe?HG.walkableFoe:walkable;
   if(wk(nx,nz)){a.x=nx;a.z=nz}
   else if(wk(nx,a.z))a.x=nx;else if(wk(a.x,nz))a.z=nz;
   else{a.avoid=(rnd()<.5?-1:1)*(1.1+rnd()*.6);a.avoidT=.7;if(!a.panic&&!a.charge){a.moving=false;a.tm=.6}}
   a.walk+=step*3.2;
  }
  /* saldıranlar oyuncunun içine giremez: en az bu mesafede dururlar */
  {const mn=def.foe?1.15:def.r+.6,ex=a.x-G.px,ez=a.z-G.py,ed=Math.hypot(ex,ez);
   if(ed<mn&&ed>1e-4&&!a.dying){const px2=G.px+ex/ed*mn,pz2=G.py+ez/ed*mn;if((def.foe?HG.walkableFoe:walkable)(px2,pz2)){a.x=px2;a.z=pz2}}}
  a.atkT=Math.max(0,(a.atkT||0)-dt);
  a.spd+=(spd-a.spd)*Math.min(1,8*dt);
 }
 /* yeniden doğma: haritadaki sayı hedefin altına düşerse uzak bir otlakta yeni hayvan çıkar */
 G.animTimer=(G.animTimer||0)-dt;
 if(G.animTimer<=0){
  G.animTimer=22;const SCL=W*H/65536;
  const cnt={};for(const a of L)if(!a.dying)cnt[a.t]=(cnt[a.t]||0)+1;
  for(const t in ANIMAL){
   if((cnt[t]||0)>=ANIMAL[t].want*SCL*.8)continue;
   for(let g=0;g<40;g++){
    const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x;
    if(G.tile[i]!==T.GRASS||G.obj[i]||Math.hypot(x-G.px,y-G.py)<50||G.hgt[i]>3)continue;
    if((G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<16))continue;
    const f=fbm(x/12,y/12,G.seed+33);
    if((t==='deer'||t==='boar'||t==='wolf')&&f<.5)continue;
    if((t==='sheep'||t==='cow')&&f>.55)continue;
    L.push(...makeAnimals([{t,x:x+.5,z:y+.5,yaw:rnd()*6.28}]));break;
   }
  }
 }
}
function killAnimal(a){
 const def=ANIMAL[a.t];
 a.dying=.001;a.hp=0;HG.onKill(a,def);
 if(def.foe){
  a.gone=true;Scene.burst(a.x,Scene.groundY(a.x,a.z)+1,a.z,0x15151c,14);
  if(!a.fake){HG.flag('shade_killed');HG.addSan(8)}
  HG.snd('die_shade',{x:a.x,z:a.z});return;
 }
 for(const [id,n] of def.drops(a))HG.spawnDrop(id,n,{x:a.x+(rnd()-.5)*.8,z:a.z+(rnd()-.5)*.8,y:Scene.groundY(a.x,a.z)+.6,vx:(rnd()-.5)*2,vz:(rnd()-.5)*2});
 HG.flag('hunted');HG.snd('die_'+(def.snd||'sheep'),{x:a.x,z:a.z});
}
function hitAnimal(a,dmg){
 if(a.dying)return;
 const def=ANIMAL[a.t];
 a.hp-=dmg;a.hitT=.25;if(a.hp>0)HG.snd('cry_'+(def.snd||'sheep'),{x:a.x,z:a.z});
 const dx=a.x-G.px,dz=a.z-G.py,l=Math.hypot(dx,dz)||1,kb=(def.foe?3:5.5)/Math.max(.6,def.h+.3);
 a.kx=dx/l*kb;a.kz=dz/l*kb;
 if(def.foe){a.flinch=2.2;if(a.fake){a.dying=.001;a.gone=true}}else if(def.aggr)a.charge=10;else a.panic=5;
 Scene.burst(a.x,Scene.groundY(a.x,a.z)+def.h*.6,a.z,def.foe?0x20202a:0xa01818,5);
 if(a.hp<=0)killAnimal(a);
}
/* elde tutulan eşyanın saldırı gücü */
function weaponDamage(){return weaponDamage0()*(1+.15*HG.perk('hunt'))}
function weaponDamage0(){
 const h=HG.held();if(!h)return DMG.hand;
 const t=h.it.tool;
 if(t==='axe'||t==='pick'||t==='spear')return DMG[t][h.it.tier]||DMG.other;
 if(t==='torch'||t==='bow')return DMG[t];
 if(t==='rod')return DMG.rod;
 return DMG.other;
}
Object.assign(HG,{walkable,makeAnimals,updateAnimals,hitAnimal,killAnimal,weaponDamage});
})();
