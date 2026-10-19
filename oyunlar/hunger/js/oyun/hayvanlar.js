/* Hunger 3D - hayvanlar: yapay zekâ (gezinme, kaçma, saldırı), vurma, süt, yün, yeniden doğma */
(()=>{
'use strict';
const {W,H,T,O,SOLID,ANIMAL,DMG,G,Scene,fbm,clamp}=HG;
let nextId=1;
const FAR2=70*70;                       /* bu mesafeden uzaktaki hayvanlar seyrek güncellenir */
const GRID=new Map();
const rnd=Math.random;
let frame=0;

function makeAnimals(list){
 return (list||[]).filter(a=>ANIMAL[a.t]).map(a=>({
  id:nextId++,t:a.t,x:a.x,z:a.z,yaw:a.yaw||0,hp:a.hp||ANIMAL[a.t].hp,home:{x:a.x,z:a.z},tx:a.x,tz:a.z,
  moving:false,tm:rnd()*3,panic:0,charge:0,hitT:0,cd:0,walk:rnd()*6,spd:0,dying:a.dead?5:0,milkAt:0,shearAt:0,sheared:!!a.sheared,avoid:0,avoidT:0
 }));
}
/* Yabani hayvanlar kapıyı açamaz: kapılı barınak ve ağıl onları dışarıda tutar (gölgelerle aynı kural) */
const SOLIDA=o=>SOLID(o)||o===O.DOOR||o===O.DOORM||o===O.VDOOR;
function walkable(x,z){
 const r=.35,pts=[[0,0],[r,0],[-r,0],[0,r],[0,-r]];
 for(const [dx,dz] of pts){
  const tx=Math.floor(x+dx),tz=Math.floor(z+dz);
  if(tx<1||tz<1||tx>=W-1||tz>=H-1)return false;
  const i=tz*W+tx,t=G.tile[i];
  if(t<T.SAND||t===T.POND||SOLIDA(G.obj[i]))return false;
 }
 return true;
}
/* Hayvan katı bir karenin veya içilebilir suyun içindeyse çevresindeki en yakın yürünebilir noktaya taşınır */
function unstick(a){
 if(ANIMAL[a.t].sea)return;
 const i=Math.floor(a.z)*W+Math.floor(a.x);
 if(i<0||i>=W*H)return;
 if(!(SOLIDA(G.obj[i])||G.tile[i]<T.SAND||G.tile[i]===T.POND))return;
 for(let r=1;r<=8;r++)for(let k=0;k<12;k++){
  const an=k/12*6.2832+r,x=a.x+Math.cos(an)*r,z=a.z+Math.sin(an)*r;
  if(walkable(x,z)){a.x=x;a.z=z;a.moving=false;a.tm=1;return}
 }
 if(a.home&&walkable(a.home.x,a.home.z)){a.x=a.home.x;a.z=a.home.z}
}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};

/* ---- Gelişmiş davranış yardımcıları: yön düzeltme, sürü, alarm, ses algısı, kurt sürüsü ---- */
const NEAR=[];
/* r yarıçapındaki canlılar (ızgara ile) */
function near(a,r){
 NEAR.length=0;
 const c=Math.ceil(r/3),cx=(a.x/3)|0,cz=(a.z/3)|0,r2=r*r;
 for(let ox=-c;ox<=c;ox++)for(let oz=-c;oz<=c;oz++){
  const b=GRID.get((cx+ox)*512+cz+oz);if(!b)continue;
  for(const q of b)if(q!==a&&!q.dying&&(q.x-a.x)*(q.x-a.x)+(q.z-a.z)*(q.z-a.z)<r2)NEAR.push(q);
 }
 return NEAR;
}
/* Önü kapalıysa (ağaç, kaya, su, duvar) en yakın açık yöne döner; yön seçimi tutarlıdır (titremez) */
function steer(a,def,head,spd){
 const L=def.r+.9+Math.min(2.2,spd*.35),s=a.stS||1;
 const ok=h=>{const sn=Math.sin(h),cs=Math.cos(h);return walkable(a.x+sn*L,a.z+cs*L)&&walkable(a.x+sn*L*.5,a.z+cs*L*.5)};
 if(ok(head))return head;
 for(const o of [.5,1,1.5,2.1]){
  if(ok(head+o*s)){a.stS=s;return head+o*s}
  if(ok(head-o*s)){a.stS=-s;return head-o*s}
 }
 return head;
}
/* Oyuncunun yaydığı gürültü: koşu ve alet/silah sesi hayvanların fark etme mesafesini büyütür, durmak küçültür */
function noiseK(){return (G.sprint&&G.moving?1.4:G.moving?1:.7)+((HG.noiseT||0)>performance.now()?.6:0)}
/* Sürü hayvanları (aynı türden olanlar bir arada gezer) */
const HERD={sheep:1,cow:1,deer:1,chicken:1};
function herdCenter(a){
 const L=near(a,14);let n=0,x=0,z=0;
 for(const q of L)if(q.t===a.t){n++;x+=q.x;z+=q.z}
 if(!n)return null;
 x/=n;z/=n;
 return {x,z,k:Math.hypot(x-a.x,z-a.z)>9?.85:.55};
}
/* Alarm: bir av hayvanı tehlikeyi fark edince yakındaki sürüsü de aynı yönden kaçar */
function alarm(a,sx,sz){
 const def=ANIMAL[a.t];if(!def.prey||def.aggr)return;
 const now=performance.now();
 for(const b of near(a,16)){
  if(!ANIMAL[b.t].prey)continue;
  if(b.t!==a.t&&Math.hypot(b.x-a.x,b.z-a.z)>8)continue;
  if(b.panic>3.5)continue;
  b.panic=Math.max(b.panic,2.5+rnd()*2);b.scare={x:sx,z:sz};b.alT=now;b.alertT=0;
 }
}
/* Kaçarken yön sapması: tavşan ve tavuk zikzak çizer, geyik hafifçe */
function zig(a){
 const k=a.t==='rabbit'?.8:a.t==='chicken'?.55:a.t==='deer'?.22:0;
 return k?Math.sin(performance.now()*.008+a.id*2)*k:0;
}
/* Kurt sürüsü: aynı anda yalnızca "lider" kurt saldırır, diğerleri oyuncuyu çevreler; vurup geri çekilirler */
let leadId=0,leadT=0,packCall=0;
function packTick(wolves,dt){
 leadT-=dt;
 let cur=null,n=0;
 for(const w of wolves)if(w.charge>0){n++;if(w.id===leadId)cur=w}
 for(const w of wolves)w.pk=n;
 if(!cur||leadT<=0||cur.retreatT>0){
  let best=null,bd=1e9;
  for(const w of wolves){if(!(w.charge>0)||w.retreatT>0)continue;const d=Math.hypot(w.x-G.px,w.z-G.py);if(d<bd){bd=d;best=w}}
  leadId=best?best.id:0;leadT=3+rnd()*2;
 }
}
/* Bir kurt avlanmaya başlayınca veya vurulunca yakındaki sürü uluyup katılır */
function callPack(a){
 const now=performance.now();
 if(now-packCall<12000)return;packCall=now;
 let any=false;
 for(const w of G.animals){
  if(w===a||w.t!=='wolf'||w.dying||w.charge>0||w.giveT>0)continue;
  if(Math.hypot(w.x-a.x,w.z-a.z)>45)continue;
  w.charge=ANIMAL.wolf.chase+3;w.cd=Math.max(w.cd,.9+rnd()*.6);any=true;
 }
 if(any)HG.snd('call_wolf',{x:a.x,z:a.z});
}
/* Saldırı öncesi hazırlık süresi: yaban domuzu eşinir, ayı kükrer; sonra atılır ve toparlanır */
const WIND={boar:.8,bear:1.1},DASH={boar:1.5,bear:1.25};
function chargeMove(a,def,dt,dp,dx,dz){
 const base=Math.atan2(dx,dz),cs=def.cspd||Math.min(def.run,4.9),close=dp<def.r+.75;
 if(a.t==='wolf'){
  if(a.retreatT>0){a.retreatT-=dt;return {head:base+Math.PI+(a.id%2?.6:-.6),spd:def.run*.8}}          /* vurup çekilir */
  if(a.pk>1&&leadId!==a.id){                                                                          /* sıra bekleyen kurt oyuncuyu çevreler */
   const side=a.id%2?1:-1,want=6.5,off=Math.PI/2-clamp((dp-want)*.25,-.7,.7);
   return {head:base+side*off,spd:dp<want+4?def.run*.55:cs*1.1};
  }
  const flank=a.pk>1?(a.id%2?1:-1)*.55*clamp((dp-3)/9,0,1):0;                                         /* lider yandan yaklaşır */
  return {head:base+flank,spd:close?0:cs};
 }
 const wd=WIND[a.t];
 if(!wd)return {head:base,spd:close?0:cs};
 if(a.cph===undefined){a.cph=0;a.ct=wd;a.cd=Math.max(a.cd,wd+.1);HG.snd('call_'+def.snd,{x:a.x,z:a.z})}
 if(a.cph===0){                                                                                       /* hazırlık: durur, oyuncuya döner */
  a.ct-=dt;if(a.ct<=0){a.cph=1;a.ct=.95;a.dh=base;a.cd=0}
  return {head:base,spd:0};
 }
 if(a.cph===1){                                                                                       /* atılma: doğrultu sabit, dönüş zayıf */
  a.ct-=dt;a.dh+=clamp(angDiff(a.dh,base),-1.2*dt,1.2*dt);
  if(a.ct<=0||a.struck){a.cph=2;a.ct=a.struck?1.4:1.1}
  return {head:a.dh,spd:cs*DASH[a.t]};
 }
 a.ct-=dt;if(a.ct<=0){a.cph=undefined}                                                                /* toparlanma: savunmasız */
 return {head:base,spd:0};
}

/* Avcı (kurt) ile av arasındaki ilişki: yakalama %40, kaçış %60; kaçışta kovalamaca sona erer */
function killPrey(p){
 const def=ANIMAL[p.t];p.dying=.001;p.hp=0;
 for(const [id,n] of def.drops(p))HG.spawnDrop(id,n,{x:p.x+(rnd()-.5)*.8,z:p.z+(rnd()-.5)*.8,y:Scene.groundY(p.x,p.z)+.6,vx:(rnd()-.5)*2,vz:(rnd()-.5)*2});
 HG.snd('die_'+(def.snd||'sheep'),{x:p.x,z:p.z});
}
function huntStep(a,def,dt,L){
 if(a.huntCd>0)a.huntCd-=dt;
 let p=a.prey;
 if(p&&(p.dying||Math.hypot(p.x-a.x,p.z-a.z)>26||(a.huntT||0)>14||!L.includes(p))){if(!p.dying)a.huntCd=20+rnd()*15;p=a.prey=null}   /* av uzaklaştı: kovalamaca biter */
 if(!p){
  if(a.huntCd>0)return null;
  a.scanT=(a.scanT||0)-dt;if(a.scanT>0)return null;a.scanT=1.4+rnd();
  let bd=17;
  for(const q of L){if(q.dying||!ANIMAL[q.t].prey)continue;const d=Math.hypot(q.x-a.x,q.z-a.z);if(d<bd){bd=d;p=q}}
  if(!p)return null;
  a.prey=p;a.huntT=0;alarm(p,a.x,a.z);
 }
 a.huntT=(a.huntT||0)+dt;
 const dx=p.x-a.x,dz=p.z-a.z,d=Math.hypot(dx,dz);
 if(d<def.r+ANIMAL[p.t].r+.55){
  a.prey=null;a.huntCd=30+rnd()*25;
  if(rnd()<.4)killPrey(p);
  else{p.fleeW=a;p.fleeT=4;p.panic=0;if(p.charge)p.charge=0}
  return {head:a.yaw,spd:0};
 }
 return {head:Math.atan2(dx,dz),spd:d>10?def.walk*2.2:def.run*.95};         /* uzaktan sinsice sokulur, yakında atılır */
}
/* oyuncu çemberi: canlılar oyuncunun içine girmez */
function updateAnimals(dt){
 const L=G.animals;if(!L)return;
 HG.updateFoes(dt);
 const wolves=[];for(const w of L)if(w.t==='wolf'&&!w.dying)wolves.push(w);
 const DT=dt,play=HG.ui.state==='play',dark=HG.daylight()<.55,FRM=++frame,nk=noiseK();
 packTick(wolves,dt);
 for(let k=L.length-1;k>=0;k--){
  const a=L[k],def=ANIMAL[a.t];
  /* uzaktaki hayvanlar seyrek güncellenir (oyuncu görmez): birikmiş süre tek adımda işlenir */
  if(!a.dying&&!def.foe&&!a.charge&&!a.kx&&!a.kz){
   const fx=G.px-a.x,fz=G.py-a.z;
   if(fx*fx+fz*fz>FAR2){a.lodT=(a.lodT===undefined?rnd()*.2:a.lodT)+DT;if(a.lodT<.2)continue}
  }
  const dt=a.lodT>0?Math.min(.3,a.lodT):DT;a.lodT=0;a.fs=FRM;
  if(a.kx||a.kz){                       /* vuruş sonrası itilme: hız sönümlenerek kayar */
   const nx=a.x+a.kx*dt,nz=a.z+a.kz*dt,wkb=def.sea?HG.swimmable[def.sea]:walkable;
   if(wkb(nx,a.z))a.x=nx;else a.kx*=-.2;
   if(wkb(a.x,nz))a.z=nz;else a.kz*=-.2;
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
  /* güvenlik: bir nesnenin veya suyun içinde kalan hayvan en yakın uygun yere alınır */
  a.stuckT=(a.stuckT||0)-dt;
  if(a.stuckT<=0){a.stuckT=2+rnd();if(!def.foe)unstick(a)}
  if(a.sheared&&G.clock>a.shearAt)a.sheared=false;
  const dx=G.px-a.x,dz=G.py-a.z,dp=Math.hypot(dx,dz);
  a.callT=(a.callT===undefined?8+rnd()*30:a.callT)-dt;
  if(a.callT<=0){a.callT=18+rnd()*40;const cr=a.t==='wolf'?70:22;if(dp<cr&&dp>2&&a.t!=='rabbit'&&!def.foe&&(a.t!=='wolf'||HG.daylight()<.5))HG.snd('call_'+def.snd,{x:a.x,z:a.z})}
  a.hitT=Math.max(0,a.hitT-dt);a.cd-=dt;if(a.giveT>0)a.giveT-=dt;
  let spd=0,head=a.yaw;
  /* av hayvanları yakındaki kurttan kaçar */
  if(def.prey&&wolves.length){
   let nw=null,nd=11;
   for(const w of wolves){const d=Math.hypot(w.x-a.x,w.z-a.z);if(d<nd){nd=d;nw=w}}
   if(nw&&((nw.prey===a&&nd<10)||nd<7)){a.fleeW=nw;a.fleeT=2.2;if(!a.alT||performance.now()-a.alT>6000){a.alT=performance.now();alarm(a,nw.x,nw.z)}}
  }
  if(a.fleeT>0)a.fleeT-=dt;
  if(!(a.charge>0))a.cph=undefined;a.alerted=false;
  const fr=def.flee&&def.prey?def.flee*nk:def.flee;                         /* fark etme mesafesi gürültüyle değişir */
  if(!fr||dp>fr*1.8)a.alertT=0;
  const ll=def.fearLight?HG.lightLevel(a.x,a.z):0;
  if(def.sea){const r=HG.seaAI(a,def,dt,dp,dx,dz,play);head=r.head;spd=r.spd}
  else if(def.foe){const r=HG.foeAI(a,def,dt);head=r.head;spd=r.spd}
  else if(def.pet&&HG.petAI){const r=HG.petAI(a,def,dt,L);head=r.head;spd=r.spd}
  else if(def.fearLight&&ll>.1){a.charge=0;head=Math.atan2(-dx,-dz);spd=def.run}
  else if(def.night&&(a.hp<def.hp*.3||(!dark&&dp<14))){head=Math.atan2(-dx,-dz);spd=def.run}
  else if(a.fleeT>0&&a.fleeW&&!a.dying&&!(a.charge>0)){head=Math.atan2(a.x-a.fleeW.x,a.z-a.fleeW.z)+zig(a);spd=def.run}
  else if(a.charge>0){
   a.charge-=dt;a.struck=false;
   const cm=chargeMove(a,def,dt,dp,dx,dz);head=cm.head;spd=cm.spd;                    /* kovalama hızı oyuncunun koşusundan düşüktür */
   if(dp<def.r+1.0&&a.cd<=0&&play){
    a.cd=def.cd||1.2;a.atkT=.45;a.struck=true;HG.snd('atk_'+(def.snd||a.t),{x:a.x,z:a.z});HG.hurt(def.dmg,def.n+' saldırısında öldün.',{x:a.x,z:a.z},def.bleed||.35);HG.toast(def.n+' saldırdı!');
    if(a.t==='wolf'){a.retreatT=1.1+rnd()*.8;if(leadId===a.id)leadT=0}                  /* kurt vurur ve çekilir */
    else if(WIND[a.t]){a.cph=2;a.ct=1.4}                                                /* domuz/ayı toparlanır */
    /* büyük baş hayvanlar yalnızca birkaç kez karşılık verir, sonra kaçar */
    if(a.retal!==undefined&&--a.retal<=0){a.retal=undefined;a.charge=0;a.panic=10}
   }
   if(dp>(def.giveUp||14)){a.charge=0;a.retal=undefined;a.giveT=9+rnd()*4}      /* uzaklaşan oyuncu bırakılır, bir süre yeniden kovalanmaz */
  }else if(a.panic>0||(fr&&dp<fr)){
   if(a.panic>0){a.panic-=dt;if(a.panic<=0)a.scare=null}
   const sx=a.scare?a.scare.x:G.px,sz=a.scare?a.scare.z:G.py;
   head=Math.atan2(a.x-sx,a.z-sz)+zig(a);spd=def.run;
   if(def.prey&&!(performance.now()-(a.alT||0)<6000)){a.alT=performance.now();alarm(a,sx,sz)}      /* sürü de aynı yönden kaçar */
  }else if(fr&&def.prey&&play&&dp<fr*1.5&&(a.alertT||0)<6){
   a.alertT=(a.alertT||0)+dt;a.alerted=true;head=Math.atan2(dx,dz);spd=0;                         /* tetikte: donar, oyuncuya bakar; yaklaşılırsa kaçar */
  }else if(def.aggr&&dp<def.aggr&&play&&(!def.night||dark)&&!(a.giveT>0)){a.charge=def.chase||7;a.cd=Math.max(a.cd,.7);if(a.t==='wolf')callPack(a)}
  else if(def.pred&&(()=>{const r=huntStep(a,def,dt,L);if(!r)return false;head=r.head;spd=r.spd;return true})()){}
  else{
   a.tm-=dt;
   if(a.tm<=0){
    if(a.moving){a.moving=false;a.tm=1.5+rnd()*4.5}
    else{
     const hc=HERD[a.t]?herdCenter(a):null;
     for(let g=0;g<4;g++){
      const ang=rnd()*6.28,r=2+rnd()*((def.roam||7)-2);let tx=a.home.x+Math.cos(ang)*r,tz=a.home.z+Math.sin(ang)*r;
      if(hc){tx+=(hc.x-tx)*hc.k;tz+=(hc.z-tz)*hc.k}                                    /* sürü birlikte hareket eder */
      a.tx=tx;a.tz=tz;if(def.sea||walkable(tx,tz))break;
     }
     a.moving=true;a.tm=3+rnd()*4;
    }
   }
   if(a.moving){
    const tx=a.tx-a.x,tz=a.tz-a.z;
    if(Math.hypot(tx,tz)<.5){a.moving=false;a.tm=1+rnd()*3}else{head=Math.atan2(tx,tz);spd=def.walk}
   }
  }
  /* önü kapalıysa yön düzeltilir; atılma anında doğrultu korunur */
  if(spd>0&&!def.foe&&!def.sea&&!def.pet&&a.cph!==1)head=steer(a,def,head,spd);
  /* engelden kaçınma */
  if(a.avoidT>0){a.avoidT-=dt;head+=a.avoid}
  if(spd>0){
   const d=angDiff(a.yaw,head),turn=(spd>def.walk*1.5?7:3.5)*dt;
   a.yaw+=clamp(d,-turn,turn);
   const step=spd*dt*(Math.abs(d)>1.4?.2:1),nx=a.x+Math.sin(a.yaw)*step,nz=a.z+Math.cos(a.yaw)*step;
   const wk0=def.foe?HG.walkableFoe:def.sea?HG.swimmable[def.sea]:walkable,pm=def.foe?1.0:def.r+.45,d0=Math.hypot(a.x-G.px,a.z-G.py);
   const wk=(x,z)=>wk0(x,z)&&!(Math.hypot(x-G.px,z-G.py)<pm&&Math.hypot(x-G.px,z-G.py)<d0);
   if(wk(nx,nz)){a.x=nx;a.z=nz}
   else if(wk(nx,a.z))a.x=nx;else if(wk(a.x,nz))a.z=nz;
   else{a.avoid=(rnd()<.5?-1:1)*(1.1+rnd()*.6);a.avoidT=.7;if(!a.panic&&!a.charge){a.moving=false;a.tm=.6}}
   a.walk+=step*3.2;
  }
  a.atkT=Math.max(0,(a.atkT||0)-dt);
  a.spd+=(spd-a.spd)*Math.min(1,8*dt);
 }
 /* iç içe geçme engeli: canlılar birbirinden en az yarıçapları toplamı kadar uzak durur (ızgara ile yalnızca komşular denetlenir) */
 {
  for(const b of GRID.values())b.length=0;
  for(const a of L){if(a.dying)continue;const k=((a.x/3)|0)*512+((a.z/3)|0);let b=GRID.get(k);if(!b)GRID.set(k,b=[]);b.push(a)}
  for(let pass=0;pass<2;pass++)for(const a of L){
   if(a.dying||a.fs!==FRM)continue;const da=ANIMAL[a.t],cx=(a.x/3)|0,cz=(a.z/3)|0;
   for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){
    const bk=GRID.get((cx+ox)*512+cz+oz);if(!bk)continue;
    for(const b of bk){
     if(b===a||b.dying||(b.fs===FRM&&b.id<a.id))continue;
     const dx=b.x-a.x,dz=b.z-a.z;if(dx>3||dx<-3||dz>3||dz<-3)continue;
     const mn=(da.r+ANIMAL[b.t].r)*1.2+.22,d2=dx*dx+dz*dz;if(d2>=mn*mn)continue;
     const d=Math.sqrt(d2)||.001,push=(mn-d)*.5,ux=d<.002?1:dx/d,uz=d<.002?0:dz/d;
     const wa=da.foe?HG.walkableFoe:da.sea?HG.swimmable[da.sea]:walkable,wb=ANIMAL[b.t].foe?HG.walkableFoe:ANIMAL[b.t].sea?HG.swimmable[ANIMAL[b.t].sea]:walkable;
     const oa=wa(a.x-ux*push,a.z-uz*push),ob=wb(b.x+ux*push,b.z+uz*push);
     if(oa){a.x-=ux*push;a.z-=uz*push}
     if(ob){b.x+=ux*push;b.z+=uz*push}
     if(oa&&!ob&&wa(a.x-ux*push,a.z-uz*push)){a.x-=ux*push;a.z-=uz*push}
     else if(ob&&!oa&&wb(b.x+ux*push,b.z+uz*push)){b.x+=ux*push;b.z+=uz*push}
    }
   }
  }
 }
 /* yeniden doğma: haritadaki sayı hedefin altına düşerse uzak bir otlakta yeni hayvan çıkar */
 G.animTimer=(G.animTimer||0)-dt;
 if(G.animTimer<=0){
  G.animTimer=22;const SCL=G.entSC||W*H/65536;
  const cnt={};for(const a of L)if(!a.dying)cnt[a.t]=(cnt[a.t]||0)+1;
  for(const t in ANIMAL){
   if((cnt[t]||0)>=ANIMAL[t].want*SCL*.8)continue;
   for(let g=0;g<40;g++){
    const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x;
    if(G.tile[i]!==T.GRASS||G.obj[i]||Math.hypot(x-G.px,y-G.py)<50||G.hgt[i]>3)continue;
    if((G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<16))continue;
    if(L.some(q=>!q.dying&&(q.t===t?Math.hypot(q.x-x,q.z-y)<(ANIMAL[t].sp||16)*.6:Math.hypot(q.x-x,q.z-y)<4)))continue;
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
 for(const [id,n] of def.drops(a))HG.spawnDrop(id,n,{x:a.x+(rnd()-.5)*.8,z:a.z+(rnd()-.5)*.8,y:(def.sea?HG.sc.WY:Scene.groundY(a.x,a.z))+.6,vx:(rnd()-.5)*2,vz:(rnd()-.5)*2});
 HG.flag('hunted');HG.snd('die_'+(def.snd||'sheep'),{x:a.x,z:a.z});
}
/* Vurulan bölge: vuruş noktası canlının yerel eksenlerine çevrilir (ileri, yan, yükseklik oranı) */
function zoneAt(a,def,hit){
 if(!hit)return 'torso';
 const gy=a.by!==undefined?a.by:Scene.groundY(a.x,a.z),yf=(hit.y-gy)/def.h,sx=Math.sin(a.yaw),cz=Math.cos(a.yaw);
 const dx=hit.x-a.x,dz=hit.z-a.z,fw=dx*sx+dz*cz,lat=Math.abs(dx*cz-dz*sx);
 if(def.foe){                                   /* insansı gövde: kafa, kol, gövde, bacak */
  if(yf>.8)return 'head';
  if(yf<.42)return 'leg';
  if(lat>def.r*.6)return 'arm';
  return 'torso';
 }
 if(fw>def.r*.5&&yf>.42)return 'head';          /* dört ayaklı: ön ve üst kısım baştır */
 if(yf<.34)return 'leg';
 return 'torso';
}
/* dmg: eşyanın taban hasarı (sağlık yüzdesi); hit: vuruş noktası {x,y,z} */
function hitAnimal(a,dmg,hit){
 if(a.dying)return;
 const def=ANIMAL[a.t],zone=zoneAt(a,def,hit),zm=HG.ZONE[zone].m;
 const real=dmg*zm*(def.weak||1);
 HG.noiseT=performance.now()+1300;if(a.t==='wolf'&&a.hp-real>0)callPack(a);else alarm(a,G.px,G.py);
 a.hp-=real;a.hitT=.25;a.giveT=0;if(a.hp>0)HG.snd('cry_'+(def.snd||'sheep'),{x:a.x,z:a.z});
 a.lastZone=zone;G.lastHit={a,t:performance.now(),zone,m:zm,dmg:real};
 const dx=a.x-G.px,dz=a.z-G.py,l=Math.hypot(dx,dz)||1,kb=(def.foe?3:5.5)/Math.max(.6,def.h+.3)*(zone==='head'?1.3:1);
 a.kx=dx/l*kb;a.kz=dz/l*kb;
 if(def.foe){a.flinch=zone==='head'?3.2:2.2;if(a.fake){a.dying=.001;a.gone=true}}
 else if(def.big){
  /* büyük baş: yalnızca ilk vuruşta %40 ihtimalle birkaç kez saldırır, sonra (veya hiç) kaçar */
  if(!a.hurtOnce&&a.hp>0&&rnd()<.4){a.retal=2+((rnd()*2)|0);a.charge=14}
  else if(!(a.retal>0)){a.charge=0;a.panic=8}
  a.hurtOnce=true;
 }
 else if(def.aggr)a.charge=10;else a.panic=5;
 if(zone==='leg'&&!def.foe&&a.hp>0)a.panic=Math.max(a.panic,8);
 const hy=hit?hit.y:(a.by!==undefined?a.by:Scene.groundY(a.x,a.z))+def.h*.6;
 Scene.burst(hit?hit.x:a.x,hy,hit?hit.z:a.z,def.foe?0x20202a:0xa01818,zone==='head'?8:5);
 if(a.hp<=0){if(zone==='head')HG.flag('headshot');killAnimal(a)}
 return zone;
}
/* elde tutulan eşyanın taban saldırı gücü (eşyaya özgü) */
function weaponDamage(){return weaponDamage0()*(1+.15*HG.perk('hunt'))}
function weaponDamage0(){
 const h=HG.held();if(!h)return DMG.hand;
 const v=DMG.item[h.k];return v===undefined?DMG.other:v;
}
function arrowDamage(draw){return (DMG.arrowMin+(DMG.arrowMax-DMG.arrowMin)*Math.pow(draw,1.3))*(1+.15*HG.perk('hunt'))}
Object.assign(HG,{walkable,makeAnimals,updateAnimals,hitAnimal,killAnimal,weaponDamage,arrowDamage,zoneAt});
})();
