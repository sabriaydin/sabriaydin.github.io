/* Hunger 3D - yapay zekâ derinliği (güncelleme 70).
   Kurt sürüsü kuşatma düzeni, yırtıcıların ateş ışığından çekinmesi, uzun kovalamacada yorulma,
   yaralı hayvanın kan izi bırakması, yağmur ve rüzgârın sesi maskelemesi, gece sürü dinlenmesi.
   Özgün hayvan dosyası değiştirilmedi; yalnızca HG.updateAnimals sarmalanır (barış kipiyle aynı yöntem). */
(()=>{
'use strict';
const {G,ui}=HG;
const S=HG.Scene,sc=HG.sc,ANIMAL=HG.ANIMAL;
const guest=()=>!!(HG.netGuest&&HG.netGuest());
const play=()=>ui.state==='play'||!!(HG.coopPlay&&HG.coopPlay());

/* ---------- Ses maskelemesi: yağmur ve rüzgâr oyuncunun sesini bastırır ---------- */
function noiseMask(){
 const rain=sc.rain||0,wind=sc.wind?(sc.wind.s||0):0;
 HG.noiseMul=Math.max(.55,1-rain*.35-Math.min(.2,wind*.12));
}

/* ---------- Kurt sürüsü: kuşatma ----------
   Aynı anda saldıran kurtlar oyuncuya tek sıradan gelmez; çevresinde eşit açılara yayılır.
   Hayvanın kendi hareketi hayvanlar.js içinde kalır, burada yalnızca yaklaşırken yanal kayma uygulanır. */
const FLANK_MIN=5.5,FLANK_MAX=22;
function flank(dt){
 const L=G.animals;if(!L)return;
 const px=G.px,pz=G.py;
 const W=[];
 for(const a of L){
  if(a.dying||a.t!=='wolf'||!(a.charge>0))continue;
  const d=Math.hypot(a.x-px,a.z-pz);
  if(d<FLANK_MIN||d>FLANK_MAX)continue;
  W.push({a,d,b:Math.atan2(a.x-px,a.z-pz)});
 }
 if(W.length<2)return;
 W.sort((p,q)=>p.b-q.b);
 /* ortalama yön (açısal ortalama) çevresine eşit aralıklı yerleşim */
 let sx=0,sz=0;for(const w of W){sx+=Math.sin(w.b);sz+=Math.cos(w.b)}
 const mean=Math.atan2(sx,sz),gap=Math.min(1.15,2.2/W.length);
 for(let i=0;i<W.length;i++){
  const w=W[i],want=mean+(i-(W.length-1)/2)*gap;
  let dd=want-w.b;while(dd>Math.PI)dd-=6.2832;while(dd<-Math.PI)dd+=6.2832;
  if(Math.abs(dd)<.05)continue;
  const turn=Math.max(-1,Math.min(1,dd))*Math.min(1,1.5*dt)*Math.min(1,(w.d-FLANK_MIN)/6);
  const nb=w.b+turn,nx=px+Math.sin(nb)*w.d,nz=pz+Math.cos(nb)*w.d;
  if(HG.canStandAt&&HG.canStandAt(nx,nz)){w.a.x=nx;w.a.z=nz}
 }
}

/* ---------- Ateş ışığı: gece yırtıcıları aydınlık çembere girmez ---------- */
const SHY={wolf:1,shade:1,foe:1};
function fireShy(dt){
 const L=G.animals;if(!L||!HG.lightLevel)return;
 for(const a of L){
  if(a.dying||!(a.charge>0))continue;
  const def=ANIMAL[a.t];if(!def)continue;
  if(!(SHY[a.t]||def.foe))continue;
  const lit=HG.lightLevel(a.x,a.z,true);                 /* elde tutulan meşale sayılmaz: yalnızca ateş ve fener */
  if(lit<.55)continue;
  a.charge=0;a.panic=Math.max(a.panic||0,1.6);a.giveT=Math.max(a.giveT||0,3);
  a.scare={x:a.x+(a.x-G.px)*.01,z:a.z+(a.z-G.py)*.01};
  const f=sc.fires&&sc.fires.length?sc.fires[0]:null;
  if(f){const dx=a.x-f.x,dz=a.z-f.z,d=Math.hypot(dx,dz)||1;a.scare={x:f.x,z:f.z};a.x+=dx/d*dt*1.2;a.z+=dz/d*dt*1.2}
 }
}

/* ---------- Kovalamacada yorulma: uzun süre koşan yırtıcı vazgeçer ---------- */
function tire(dt){
 const L=G.animals;if(!L)return;
 for(const a of L){
  if(a.dying)continue;
  if(a.charge>0){
   a.chT=(a.chT||0)+dt;
   const lim=a.t==='wolf'?17:a.t==='bear'?12:14;
   if(a.chT>lim){a.charge=0;a.chT=0;a.giveT=Math.max(a.giveT||0,10+Math.random()*5);a.panic=0}
  }else if(a.chT)a.chT=Math.max(0,a.chT-dt*.5);
 }
}

/* ---------- Yaralı hayvan: kan izi ---------- */
{
 const h0=HG.hitAnimal;
 HG.hitAnimal=function(a,dmg,hit){
  const r=h0.apply(this,arguments);
  try{if(a&&!a.dying&&a.hp>0&&dmg>=4){const def=ANIMAL[a.t];if(def&&def.hp)a.blood=Math.max(a.blood||0,a.hp/def.hp<.55?9:5)}}catch(e){}
  return r;
 };
}
function bloodTrail(dt){
 const L=G.animals;if(!L||!S.burst)return;
 for(const a of L){
  if(!a.blood||a.dying)continue;
  a.blood-=dt;
  a.bT=(a.bT||0)-dt;
  if(a.bT<=0&&(a.spd||0)>1.2&&Math.hypot(a.x-G.px,a.z-G.py)<46){
   a.bT=.42+Math.random()*.3;
   try{S.burst(a.x,S.groundY(a.x,a.z)+.12,a.z,0x8c1f1a,2)}catch(e){}
  }
 }
}

/* ---------- Gece: sürü hayvanları yuvasında dinlenir, dolaşmaz ---------- */
const REST={sheep:1,cow:1,chicken:1,deer:1};
function nightRest(dt){
 const L=G.animals;if(!L)return;
 if(HG.daylight()>.3)return;
 for(const a of L){
  if(a.dying||!REST[a.t])continue;
  if(a.charge>0||a.panic>0||(a.alertT||0)>0)continue;
  if(Math.hypot(a.x-G.px,a.z-G.py)<12)continue;              /* oyuncu yaklaşınca normal davranır */
  a.moving=false;a.tm=Math.max(a.tm||0,1.5+Math.random());
 }
}

const u0=HG.updateAnimals;
HG.updateAnimals=function(dt){
 const r=u0.apply(this,arguments);
 try{
  if(play()&&!guest()){
   noiseMask();
   if(!HG.cfg.peace){flank(dt);fireShy(dt);tire(dt)}
   nightRest(dt);
  }
  if(play())bloodTrail(dt);
 }catch(e){if(HG.log)HG.log('zeka','hata: '+e.message,'uyari')}
 return r;
};
HG.ai={flank,fireShy};
})();
