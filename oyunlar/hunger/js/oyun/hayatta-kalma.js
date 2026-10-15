/* Hunger 3D - hayatta kalma: hareket, çarpışma, açlık-susuzluk-soğuk, barınak, ölüm */
(()=>{
'use strict';
const {W,H,T,O,SOLID,G,ui,inp,look,A,Scene,clamp,flag,daylight,dayNo}=HG;

/* ---- Barınak: oyuncunun bulunduğu alan duvarlarla kapalı mı? ---- */
function calcShelter(){
 if(G.cave)return true;                 /* mağara kapalı alandır */
 const sx=Math.floor(G.px),sy=Math.floor(G.py),start=sy*W+sx,seen=new Set([start]),q=[start];
 while(q.length){
  const c=q.pop(),x=c%W,y=(c/W)|0;
  for(let d=0;d<4;d++){
   const nx=x+(d===0?1:d===1?-1:0),ny=y+(d===2?1:d===3?-1:0);
   if(nx<0||ny<0||nx>=W||ny>=H)return false;
   const ni=ny*W+nx;if(seen.has(ni)||G.obj[ni])continue;
   seen.add(ni);if(seen.size>40)return false;q.push(ni);
  }
 }
 return true;
}

/* ---- Çarpışma ---- */
function solidAt(x,y){
 if(x<0||y<0||x>=W||y>=H)return true;
 const i=y*W+x,t=G.tile[i];
 return SOLID(G.obj[i]);                       /* sular geçilebilir: sığ yerde yürünür, derinde yüzülür */
}
function canStand(x,y){const r=.27;return !(solidAt(Math.floor(x-r),Math.floor(y-r))||solidAt(Math.floor(x+r),Math.floor(y-r))||solidAt(Math.floor(x-r),Math.floor(y+r))||solidAt(Math.floor(x+r),Math.floor(y+r)))}

/* Canlılar ve köylüler katıdır: oyuncu içlerinden geçemez, yürüyerek itemez */
function creatureBlock(x,y){
 const px=G.px,py=G.py;
 for(const a of G.animals||[]){
  if(a.dying)continue;
  const dx=a.x-x,dz=a.z-y,lim=HG.ANIMAL[a.t].r+.28;
  if(dx>lim+.1||dx<-lim-.1||dz>lim+.1||dz<-lim-.1)continue;
  const d=Math.hypot(dx,dz);if(d<lim&&d<Math.hypot(a.x-px,a.z-py))return true;
 }
 for(const n of G.npcs||[]){
  const dx=n.x-x,dz=n.z-y,lim=.4+.28;
  if(dx>lim+.1||dx<-lim-.1||dz>lim+.1||dz<-lim-.1)continue;
  const d=Math.hypot(dx,dz);if(d<lim&&d<Math.hypot(n.x-px,n.z-py))return true;
 }
 return false;
}

/* ---- Hareket ---- */
/* zemin yüksekliği ve zıplama */
const GRAV=18,JUMP=7;
const EYE=HG.EYE;
function vertStep(dt){
 const gy=Scene.groundY(G.px,G.py),WY=HG.sc.WY,wd=WY-gy;
 if(G.pz===undefined){G.pz=gy;G.vz=0;G.air=false}
 /* yüzme: su 1,5 m'den derinse ve gövde suya değiyorsa; yüzeyde süzülür, Boşluk ile çıkılır, dal tuşu ile aşağı inilir */
 if(wd>1.5&&(G.swim||G.pz<WY-.9)){
  const surf=WY+.12-EYE;
  if(!G.swim){G.swim=true;if(G.vz<-3||G.air){HG.snd('splash');Scene.burst(G.px,WY,G.py,0x9fd0f0,8)}G.air=false;G.vz*=.25;G.pvx*=.6;G.pvy*=.6}
  let want;
  if(HG.keyDown('dive'))want=-1.8;
  else if(HG.keyDown('jump')||inp.touchJump)want=2.1;
  else want=G.pz<surf?Math.min(1.6,(surf-G.pz)*2.4):0;
  if(G.moving&&HG.keyDown('fwd')&&Math.abs(look.pitch)>.3)want+=Math.sign(look.pitch)*(Math.abs(look.pitch)-.3)*3.2;
  G.vz+=(want-G.vz)*(1-Math.exp(-5*dt));
  G.pz=clamp(G.pz+G.vz*dt,gy,Math.max(gy,surf));
  if(G.pz>=surf&&G.vz>0)G.vz=0;if(G.pz<=gy&&G.vz<0)G.vz=0;
  G.head=G.pz+EYE<WY-.02;
  return;
 }
 if(G.swim){G.swim=false;G.head=false;G.vz=0}
 if(!G.air&&(HG.keyDown('jump')||inp.touchJump)&&ui.state==='play'&&G.stam>=9){G.vz=JUMP;G.air=true;HG.useStam(9);HG.snd('jump')}
 if(G.air){
  G.vz-=GRAV*dt;G.pz+=G.vz*dt;
  if(G.pz<=gy&&G.vz<=0){
   const imp=-G.vz,tl=G.tile[Math.floor(G.py)*W+Math.floor(G.px)],wet=tl<=T.SHAL||tl===T.POND;
   G.pz=gy;G.air=false;
   if(imp>5){
    HG.snd(wet?'splash':'land');
    G.landN=(G.landN||0)+1;G.landImp=Math.min(1,imp/13);
    G.pvx*=.55;G.pvy*=.55;                                 /* inişte hız kesilir */
    if(imp>10.2&&!wet){                                      /* yaklaşık 3 m ve üzeri düşüşte hasar */
     HG.hurt(Math.round((imp-10.2)*7),'Yüksekten düşerek öldün.');
     HG.useStam(25);if(G.hp>0)HG.flag('fell');
    }
   }
   G.vz=0;
  }
 }else if(G.pz-gy>.3){G.air=true;G.vz=0}   /* uçurumdan düşme */
 else G.pz=gy;
}

/* Hareket: ivmelenme ve atalet, eğime göre hız, havada sınırlı kontrol, duvara sürtünme */
function moveStep(dt){
 const k=inp.keys,j=inp.joy;
 const kd=HG.keyDown;
 let ix=(kd('right')?1:0)-(kd('left')?1:0)+j.x;
 let iz=(kd('back')?1:0)-(kd('fwd')?1:0)+j.y;
 const m=Math.hypot(ix,iz);
 G.moving=m>.15;G.sprint=false;
 const sy=Math.sin(look.yaw),cy=Math.cos(look.yaw);
 G.fx=-sy;G.fy=-cy;                       /* bakılan yön (yerde) */
 if(G.pvx===undefined){G.pvx=0;G.pvy=0}
 const tl=G.tile[Math.floor(G.py)*W+Math.floor(G.px)];
 let tvx=0,tvy=0;
 if(G.moving){
  ix/=Math.max(m,1);iz/=Math.max(m,1);
  const vx=ix*cy+iz*sy,vy=-ix*sy+iz*cy;
  G.sprint=kd('sprint')&&G.hun>5&&iz<=0&&!G.tired&&!(HG.bow&&HG.bow.on);
  const wd0=Math.max(0,HG.sc.WY-Scene.groundY(G.px,G.py));
  let sp=(G.sprint?5.4:3.4)*(G.swim?(G.sprint?.62:.5):clamp(1-wd0*.34,.5,1))*(HG.bow&&HG.bow.on?.55:1)*(G.tired?.8:1)*Math.min(1,m);
  /* eğim: yokuş yukarı yavaşlar, aşağı hızlanır */
  const g0=G.pz!==undefined&&!G.air?G.pz:Scene.groundY(G.px,G.py),grade=(Scene.groundY(G.px+vx*.7,G.py+vy*.7)-g0)/.7;
  sp*=clamp(1-grade*.42,.55,1.2);
  tvx=vx*sp;tvy=vy*sp;
 }
 const acc=G.air?1.4:(G.swim?4:(G.moving?14:(tl===T.SHAL?9:11)));
 const f=1-Math.exp(-acc*dt);
 G.pvx+=(tvx-G.pvx)*f;G.pvy+=(tvy-G.pvy)*f;
 const speed=Math.hypot(G.pvx,G.pvy);G.spdNow=speed;
 if(speed<.03&&!G.moving){G.pvx=G.pvy=0;G.spdNow=0;return}
 const reach=speed*dt,lim=Math.max(.05,reach*1.7);   /* çok dik yokuşa tırmanılamaz, zıplanır */
 const ok=(x,y)=>canStand(x,y)&&!creatureBlock(x,y)&&(G.pz===undefined||Scene.groundY(x,y)-G.pz<=lim);
 const nx=G.px+G.pvx*dt;if(ok(nx,G.py))G.px=nx;else G.pvx*=.15;
 const ny=G.py+G.pvy*dt;if(ok(G.px,ny))G.py=ny;else G.pvy*=.15;
 if(!G.air){
  const w0=G.walk;G.walk+=dt*(speed/3.4);
  if(speed>.6&&Math.floor(G.walk*1.6)!==Math.floor(w0*1.6))HG.snd(tl<=T.SHAL||tl===T.POND||G.swim?'step_water':tl===T.SAND?'step_sand':tl===T.ROCK?'step_rock':'step')
 }
}

/* ---- Her kare ---- */
function update(dt){
 G.clock+=dt;
 moveStep(dt);
 vertStep(dt);
 /* eylem */
 if(inp.mouseDown||inp.touchAct)HG.stepAction(dt);else HG.stopAction()
 HG.updateDrops(dt);
 HG.updateAnimals(dt);HG.updateNpcs(dt);HG.updateCamps(dt);HG.updateCaves(dt);HG.mapExplore(dt);HG.updateEvents(dt);
 HG.updateWeapons(dt);
 HG.updateBody(dt);
 if(A.hitT>0)A.hitT-=dt;
 /* barınak */
 G.shelterCheck-=dt;
 if(G.shelterCheck<=0){G.shelterCheck=.4;G.sheltered=calcShelter()}
 /* istatistikler */
 const L=daylight(),cold=1-L;
 const eco=1-.12*HG.perk('eco');
 G.hun=clamp(G.hun-dt*.17*eco*(G.sprint?1.8:1),0,100);
 G.thr=clamp(G.thr-dt*.25*eco*(G.sprint?1.8:1),0,100);
 let fd=99;
 {const x0=Math.floor(G.px),y0=Math.floor(G.py);
  for(let y=y0-5;y<=y0+5;y++)for(let x=x0-5;x<=x0+5;x++){
   if(x<0||y<0||x>=W||y>=H)continue;
   if(G.obj[y*W+x]===O.FIRE){const d=Math.hypot(x+.5-G.px,y+.5-G.py);if(d<fd)fd=d}
  }}
 G.nearFire=fd<=4;
 let wr=-(cold*.62+.04);
 {const wd1=HG.sc.WY-Scene.groundY(G.px,G.py);if(G.swim)wr-=1.1;else if(wd1>.3)wr-=.45}
 if(G.sheltered)wr*=.25;
 if(wr<0)wr*=1-.15*HG.perk('cold');
 if(wr<0&&HG.count('coat'))wr*=.5;            /* deri mont çantadayken soğuk yarıya iner */
 if(G.nearFire)wr+=3.4*(1-fd/4.6);
 if(L>.55&&!G.sheltered)wr+=.55*L;
 if(G.sheltered&&L>.4)wr+=.3;
 G.warm=clamp(G.warm+wr*dt,0,100);
 if(G.sheltered&&L<.3&&!G.cave){G.shelterT+=dt;if(G.shelterT>8)flag('shelter')}
 let dmg=0;
 /* nefes: baş suyun altındayken tükenir, bitince boğulma hasarı başlar */
 if(G.o2===undefined)G.o2=100;
 if(G.head)G.o2=Math.max(0,G.o2-dt*(100/26)*(G.moving?1.25:1));else G.o2=Math.min(100,G.o2+dt*45);
 if(G.swim&&G.moving)G.stam=Math.max(0,G.stam-dt*(G.sprint?9:4));
 if(G.o2<=0){dmg+=7;G.cause='Boğularak öldün.';if(Math.random()<dt*1.2)HG.snd('hurt')}
 if(G.hun<=0){dmg+=1.2;G.cause='Açlıktan öldün.'}
 if(G.thr<=0){dmg+=1.8;G.cause='Susuzluktan öldün.'}
 if(G.warm<=0){dmg+=1.5;G.cause='Soğuktan donarak öldün.'}
 if(dmg>0)G.hp-=dmg*dt;
 else if(G.hun>35&&G.thr>35&&G.warm>35)G.hp=clamp(G.hp+.8*dt,0,100);
 if(G.hp<=0){die();return}
 /* meyve ve hindistan cevizinin yeniden büyümesi */
 for(let k=G.timers.length-1;k>=0;k--){const t=G.timers[k];if(G.clock>=t.at){const tx=t.i%W,tz=(t.i/W)|0;if(Math.hypot(G.px-tx-.5,G.py-tz-.5)<2.2){t.at=G.clock+15;continue}if(G.obj[t.i]===t.from&&!G.drops.some(d=>Math.hypot(d.x-tx-.5,d.z-tz-.5)<.9))HG.setObj(t.i,t.to);G.timers.splice(k,1)}}
 if(dayNo()>=7)flag('day7');
 /* otomatik kayıt */
 G.saveT+=dt;if(G.saveT>20){G.saveT=0;HG.save()}
}
function die(){
 ui.state='dead';
 try{localStorage.removeItem(HG.SAVE)}catch(e){}
 HG.$('#why').textContent=G.cause||'Hayatta kalamadın.';
 HG.$('#stat').textContent=dayNo()+'. güne kadar dayandın.';
 {const s=G.stats||{};HG.$('#stat2').textContent='Seviye '+G.lvl+' · Avlanan hayvan: '+(s.hunted||0)+' · Yok edilen Gölge: '+(s.shades||0)+'\nAçılan sandık: '+(s.chests||0)+' · Tamamlanan görev: '+(s.quests||0)+' · Atlatılan Kan Ayı: '+(s.blood||0)}
 HG.$('#dead').hidden=false;HG.$('#panel').hidden=true;
 for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false;
 if(document.exitPointerLock)document.exitPointerLock();
}
Object.assign(HG,{calcShelter,solidAt,canStand,canStandAt:canStand,update,die});
})();
