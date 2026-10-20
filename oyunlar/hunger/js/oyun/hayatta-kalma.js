/* Hunger 3D - hayatta kalma: hareket, çarpışma, açlık-susuzluk-soğuk, barınak, ölüm */
(()=>{
'use strict';
const {W,H,T,O,SOLID,G,ui,inp,look,A,Scene,clamp,flag,daylight,dayNo}=HG;

/* ---- Barınak: oyuncunun bulunduğu alan duvarlarla kapalı mı? ---- */
/* Ağaç, palmiye ve çalılar duvar sayılmaz: yalnızca yapı, kaya ve kapı gibi kapatıcı nesneler alanı sınırlar.
   Hesap ayrılmış bir dizi üzerinde yapılır (her çağrıda yeni bellek ayrılmaz). */
const OPENOBJ=new Set([O.TREE,O.PALM,O.PALM0,O.BUSH,O.BUSH0,O.FENCE,O.SHROOM,O.SNARE,O.PLOT,O.SIGN,O.FTRAP,O.HIVEW,O.APIARY]);      /* alçak çit de alanı kapatmaz */
let SEEN=null,STAMP=0;const QUE=new Int32Array(64);
function calcShelter(wx,wy){
 const at=wx!==undefined;                /* konum verilirse o karenin çatı altında olup olmadığı sorulur (yapılar için) */
 if(!at&&G.cave)return true;                 /* mağara kapalı alandır */
 if(!SEEN)SEEN=new Uint32Array(W*H);
 if(++STAMP>=4294967295){SEEN.fill(0);STAMP=1}
 const sx=Math.floor(at?wx:G.px),sy=Math.floor(at?wy:G.py),start=sy*W+sx;
 let qh=0,qt=0;QUE[qt++]=start;SEEN[start]=STAMP;
 while(qh<qt){
  const c=QUE[qh++],x=c%W,y=(c/W)|0;
  for(let d=0;d<4;d++){
   const nx=x+(d===0?1:d===1?-1:0),ny=y+(d===2?1:d===3?-1:0);
   if(nx<0||ny<0||nx>=W||ny>=H)return false;
   const ni=ny*W+nx;if(SEEN[ni]===STAMP)continue;
   const o=G.obj[ni];if(o&&!OPENOBJ.has(o))continue;
   SEEN[ni]=STAMP;if(qt>=40)return false;QUE[qt++]=ni;
  }
 }
 return true;
}

let thMsgT=0,thWarn=false;                      /* susuzluk uyarı sayaçları */
/* ---- Çarpışma ---- */
/* Kaya ve madenlerin üzerine çıkılabilir: ayak yüksekliği (pz) tepenin en fazla STEP altındaysa kare engel sayılmaz */
const STEP=.42;
function solidAt(x,y,pz){
 if(x<0||y<0||x>=W||y>=H)return true;
 const i=y*W+x,o=G.obj[i];
 if(!SOLID(o))return false;                    /* sular geçilebilir: sığ yerde yürünür, derinde yüzülür */
 const st=pz!==undefined&&HG.STAND[o];
 if(st)return pz<Scene.groundY(x+.5,y+.5)+st-STEP;
 return true;
}
function canStand(x,y,pz){const r=.27;return !(solidAt(Math.floor(x-r),Math.floor(y-r),pz)||solidAt(Math.floor(x+r),Math.floor(y-r),pz)||solidAt(Math.floor(x-r),Math.floor(y+r),pz)||solidAt(Math.floor(x+r),Math.floor(y+r),pz))}
/* Ayağın altındaki zemin: arazi veya üzerine çıkılmış kaya/maden tepesi */
function supportY(x,y,pz){
 let gy=Scene.groundY(x,y);
 if(pz===undefined)return gy;
 const r=.27;
 for(let k=0;k<4;k++){
  const cx=Math.floor(x+(k&1?r:-r)),cy=Math.floor(y+(k&2?r:-r));
  if(cx<0||cy<0||cx>=W||cy>=H)continue;
  const st=HG.STAND[G.obj[cy*W+cx]];if(!st)continue;
  const top=Scene.groundY(cx+.5,cy+.5)+st;
  if(top>gy&&pz>=top-STEP-.02)gy=top;
 }
 return gy;
}

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
 const gy=supportY(G.px,G.py,G.pz),WY=HG.sc.WY,wd=WY-gy;
 if(G.pz===undefined){G.pz=gy;G.vz=0;G.air=false}
 /* salda: gövde su yüzeyinde dalgayla hafifçe sallanır; yüzme, zıplama ve su altı yoktur */
 if(G.onRaft){
  if(wd<.2){HG.dismountRaft();return}
  G.pz=WY+.06+Math.sin(G.clock*1.4)*.025*(1+HG.sc.rain*2.2);G.vz=0;G.air=false;G.swim=false;G.head=false;G.divT=0;
  return;
 }
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
  /* ilk yüzme/dalış bayrakları ve su altında kalma süresi */
  HG.flag('swam');
  if(G.head){HG.flag('dived');G.divT=(G.divT||0)+dt;if(G.divT>=20)HG.flag('deepbreath')}else G.divT=0;
  return;
 }
 if(G.swim){G.swim=false;G.head=false;G.vz=0;G.divT=0}
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
 if(!G.moving||G.tired)G.sprintOn=false;          /* 'koşmayı aç/kapat' ayarı için */
 const sy=Math.sin(look.yaw),cy=Math.cos(look.yaw);
 G.fx=-sy;G.fy=-cy;                       /* bakılan yön (yerde) */
 if(G.pvx===undefined){G.pvx=0;G.pvy=0}
 const tl=G.tile[Math.floor(G.py)*W+Math.floor(G.px)];
 let tvx=0,tvy=0;
 if(G.moving){
  ix/=Math.max(m,1);iz/=Math.max(m,1);
  const vx=ix*cy+iz*sy,vy=-ix*sy+iz*cy;
  G.sprint=(HG.cfg.sprintT?!!G.sprintOn:kd('sprint'))&&G.hun>5&&G.thr>0&&iz<=0&&!G.tired&&!(HG.bow&&HG.bow.on);
  /* susuzluk: koşmak engellenir (tuşa basılıyorsa kısa aralıklarla uyarı verilir) */
  if(G.thr<=0&&(HG.cfg.sprintT?G.sprintOn:kd('sprint'))&&iz<=0){const nw=performance.now();if(nw>thMsgT){thMsgT=nw+6000;HG.toast('Susuzsun: koşamazsın. Su iç.')}}
  const wd0=Math.max(0,HG.sc.WY-Scene.groundY(G.px,G.py));
  let sp=(G.sprint?5.4:3.4)*(G.swim?(G.sprint?.62:.5):clamp(1-wd0*.34,.5,1))*(HG.bow&&HG.bow.on?.55:1)*(G.tired?.8:1)*Math.min(1,m);
  /* eğim: yokuş yukarı yavaşlar, aşağı hızlanır */
  const g0=G.pz!==undefined&&!G.air?G.pz:Scene.groundY(G.px,G.py),grade=(Scene.groundY(G.px+vx*.7,G.py+vy*.7)-g0)/.7;
  if(G.onRaft)sp=HG.raftSpeed(G.sprint,m);
  else sp*=clamp(1-grade*.42,.55,1.2);
  tvx=vx*sp;tvy=vy*sp;
 }
 const acc=G.onRaft?2.4:G.air?1.4:(G.swim?4:(G.moving?14:(tl===T.SHAL?9:11)));
 const f=1-Math.exp(-acc*dt);
 G.pvx+=(tvx-G.pvx)*f;G.pvy+=(tvy-G.pvy)*f;
 const speed=Math.hypot(G.pvx,G.pvy);G.spdNow=speed;
 if(G.stats){const dd=speed*dt;if(G.swim)G.stats.swum=(G.stats.swum||0)+dd;else if(G.onRaft)G.stats.sailed=(G.stats.sailed||0)+dd;else if(!G.air)G.stats.walked=(G.stats.walked||0)+dd}
 if(speed<.03&&!G.moving){G.pvx=G.pvy=0;G.spdNow=0;return}
 const reach=speed*dt,lim=Math.max(.05,reach*1.7);   /* çok dik yokuşa tırmanılamaz, zıplanır */
 const ok=(x,y)=>canStand(x,y,G.pz)&&!creatureBlock(x,y)&&(G.onRaft?HG.raftWater(x,y):(G.pz===undefined||Scene.groundY(x,y)-G.pz<=lim));
 const nx=G.px+G.pvx*dt;if(ok(nx,G.py))G.px=nx;else G.pvx*=.15;
 const ny=G.py+G.pvy*dt;if(ok(G.px,ny))G.py=ny;else G.pvy*=.15;
 if(!G.air){
  const w0=G.walk;G.walk+=dt*(speed/3.4);
  if(G.onRaft&&speed>.4){let d=Math.atan2(G.pvx,G.pvy)-(G.raftYaw||0);while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;G.raftYaw=(G.raftYaw||0)+d*Math.min(1,1.6*dt)}
  if(speed>.6&&Math.floor(G.walk*1.6)!==Math.floor(w0*1.6))HG.snd(G.onRaft?'step_raft':tl<=T.SHAL||tl===T.POND||G.swim?'step_water':tl===T.SAND?'step_sand':tl===T.ROCK?'step_rock':'step')
 }
}

/* Yeniden büyüyen nesne, üzerinde canlı bulunan kareye çıkmaz (hayvan veya köylü nesnenin içinde kalırdı) */
function occupied(tx,tz){
 const cx=tx+.5,cz=tz+.5;
 for(const a of G.animals||[])if(!a.dying&&Math.abs(a.x-cx)<1.2&&Math.abs(a.z-cz)<1.2)return true;
 for(const n of G.npcs||[])if(Math.abs(n.x-cx)<1.2&&Math.abs(n.z-cz)<1.2)return true;
 return false;
}
/* ---- Her kare ---- */
function update(dt){
 G.clock+=dt;
 moveStep(dt);
 vertStep(dt);
 /* eylem */
 HG.stepUse(dt);
 if(inp.mouseDown||inp.touchAct)HG.stepAction(dt);else HG.stopAction()
 HG.updateDrops(dt);
 HG.updateAnimals(dt);HG.updateSea(dt);HG.updateDiscover(dt);HG.updateNpcs(dt);HG.updateCamps(dt);HG.updateCaves(dt);HG.mapExplore(dt);HG.updateEvents(dt);
 HG.updateWeapons(dt);
 HG.updateBody(dt);
 if(A.hitT>0)A.hitT-=dt;
 /* barınak */
 G.shelterCheck-=dt;
 if(G.shelterCheck<=0){G.shelterCheck=.4;G.sheltered=calcShelter()}
 /* istatistikler */
 const L=daylight(),cold=1-L;
 const eco=(1-.12*HG.perk('eco'))*(HG.diffK?HG.diffK():1);
 G.hun=clamp(G.hun-dt*.17*eco*(G.sprint?1.8:1),0,100);
 G.thr=clamp(G.thr-dt*.25*eco*(G.sprint?1.8:1),0,100);
 /* en yakın ateş: saniyede 4 kez aranır */
 G.fireT=(G.fireT||0)-dt;
 if(G.fireT<=0||G.fd===undefined){
  G.fireT=.25;let fd0=99;
  const x0=Math.floor(G.px),y0=Math.floor(G.py);
  for(let y=y0-5;y<=y0+5;y++)for(let x=x0-5;x<=x0+5;x++){
   if(x<0||y<0||x>=W||y>=H)continue;
   if(G.obj[y*W+x]===O.FIRE){const d=Math.hypot(x+.5-G.px,y+.5-G.py);if(d<fd0)fd0=d}
  }
  G.fd=fd0;
 }
 const fd=G.fd;
 G.nearFire=fd<=4;
 let wr=-(cold*.62+.04);
 {const wd1=HG.sc.WY-Scene.groundY(G.px,G.py);if(G.swim)wr-=1.1;else if(wd1>.3&&!G.onRaft)wr-=.45}
 if(G.sheltered)wr*=.25;
 if(wr<0)wr*=1-.15*HG.perk('cold');
 if(wr<0&&HG.count('coat'))wr*=.5;            /* deri mont çantadayken soğuk yarıya iner */
 if(wr<0&&HG.count('furcoat'))wr*=HG.count('coat')?.8:.4;            /* kürk palto: soğuğu daha çok keser (montla birlikte %60) */
 if(G.nearFire)wr+=3.4*(1-fd/4.6);
 if(L>.55&&!G.sheltered)wr+=.55*L;
 if(G.sheltered&&L>.4)wr+=.3;
 G.warm=clamp(G.warm+wr*dt,0,100);
 if(G.sheltered&&L<.3&&!G.cave){G.shelterT+=dt;if(G.shelterT>8)flag('shelter')}
 let dmg=0;
 /* nefes: baş suyun altındayken tükenir, bitince boğulma hasarı başlar */
 if(G.o2===undefined)G.o2=100;
 if(G.head)G.o2=Math.max(0,G.o2-dt*(100/26)*(G.moving?1.25:1)*(G.mask?.7:1)/(1+.2*HG.perk('dive')));else G.o2=Math.min(100,G.o2+dt*45);
 if(G.o2<28&&!G.o2w){G.o2w=true;HG.toast('Nefes tükeniyor: yüzeye çıkın!')}else if(G.o2>60)G.o2w=false;
 if(G.swim&&G.moving)G.stam=Math.max(0,G.stam-dt*(G.sprint?9:4)*(1-.2*HG.perk('dive')));
 if(G.o2<=0){dmg+=7;G.cause='Boğularak öldün.';if(Math.random()<dt*1.2)HG.snd('hurt')}
 if(G.hun<=0){dmg+=1.2;G.cause='Açlıktan öldün.'}
 if(G.thr<=0){dmg+=.09;G.cause='Susuzluktan öldün.'}            /* susuzluk can götürür ama çok yavaş: ani ölüm olmaz */
 if(G.thr<=0&&!thWarn){thWarn=true;HG.toast('Susuzluk başladı: koşamazsın ve canın yavaş yavaş azalır. Su bul.')}else if(G.thr>5)thWarn=false;
 if(G.warm<=0){dmg+=1.5;G.cause='Soğuktan donarak öldün.'}
 if(dmg>0)G.hp-=dmg*dt;
 else if(G.hun>35&&G.thr>35&&G.warm>35)G.hp=clamp(G.hp+.8*dt,0,100);
 if(G.hp<=0){die();return}
 /* meyve ve hindistan cevizinin yeniden büyümesi */
 for(let k=G.timers.length-1;k>=0;k--){const t=G.timers[k];if(G.clock>=t.at){const tx=t.i%W,tz=(t.i/W)|0;if((t.to===O.TREE||t.to===O.BUSH||t.to===O.PALM)&&HG.pondNear(G.tile,W,t.i)){G.timers.splice(k,1);continue}if(Math.hypot(G.px-tx-.5,G.py-tz-.5)<2.2||occupied(tx,tz)){t.at=G.clock+12;continue}if(G.obj[t.i]===t.from&&!G.drops.some(d=>Math.hypot(d.x-tx-.5,d.z-tz-.5)<.9))HG.setObj(t.i,t.to);G.timers.splice(k,1)}}
 if(dayNo()>=7)flag('day7');
 /* otomatik kayıt */
 G.saveT+=dt;if(G.saveT>20){G.saveT=0;HG.save()}
}
function die(){
 if(HG.onDie&&HG.onDie())return;                     /* yeniden doğma sistemi (js/oyun/dogma.js) ölümü karşılayabilir */
 ui.state='dead';
 /* açık pencereler kapatılır; yay, eylem ve yüzme durumu sıfırlanır */
 for(const id of ['#trade','#jr','#gd','#bigmap','#sv','#pause'])HG.$(id)&&(HG.$(id).hidden=true);
 G.trading=null;ui.sleeping=false;try{HG.settings&&HG.settings.close();HG.stopAction();HG.bow.on=false;HG.bow.draw=0;HG.$('#fade').classList.remove('on')}catch(e){}
 try{localStorage.removeItem(HG.SAVE);if(G.slot)HG.deleteSlot(G.slot)}catch(e){}       /* kalıcı ölüm: eski otomatik kayıt ve oyunun bağlı olduğu tarayıcı kaydı silinir */
 HG.$('#why').textContent=G.cause||'Hayatta kalamadın.';
 HG.$('#stat').textContent=dayNo()+'. güne kadar dayandın.';
 {const s=G.stats||{};HG.$('#stat2').textContent='Seviye '+G.lvl+' · Avlanan hayvan: '+(s.hunted||0)+' · Yok edilen Gölge: '+(s.shades||0)+'\nAçılan sandık: '+(s.chests||0)+' · Tamamlanan görev: '+(s.quests||0)+' · Atlatılan Kan Ayı: '+(s.blood||0)+'\nYürünen mesafe: '+Math.round(s.walked||0)+' m · Yüzülen mesafe: '+Math.round(s.swum||0)+' m'}
 HG.$('#dead').hidden=false;HG.$('#panel').hidden=true;
 for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false;
 if(document.exitPointerLock)document.exitPointerLock();
}
Object.assign(HG,{shelterAt:(x,y)=>calcShelter(x,y),calcShelter,solidAt,canStand,supportY,canStandAt:canStand,update,die});
})();
