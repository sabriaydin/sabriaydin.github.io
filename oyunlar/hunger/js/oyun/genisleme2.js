/* Hunger 3D - büyük güncelleme (51) oyun mantığı II: yeni yetenekler, mevsimler ve kar, ıslaklık ve ateş (hastalık), giyim etkileri,
   kılıç-sopa-kalkan dövüşü, barış modu ve yeni yiyeceklerin etkileri.
   Özgün dosyalara yalnızca küçük kancalar eklenmiştir (HG.extAte, extPlaceOk/extPlaceMsg); geri kalanı HG.update, HG.hurt, HG.hud ve HG.weaponDamage zincirlenerek yapılır. */
(()=>{
'use strict';
const {O,IT,G,ui,Scene,clamp,count,held,flag,daylight}=HG;
const sc=HG.sc;
const X=HG.X2;
const stat=(k,n)=>{if(G.stats)G.stats[k]=(G.stats[k]||0)+(n===undefined?1:n)};
const num=(v,d)=>isFinite(v)?+v:d;
HG.x2stats.push('bears','blocks','fevers','cured','apples','herbs','rumors','daily','pets','petkills','trades2');

/* ---------- Yeni yetenekler ---------- */
HG.PERKS.push(
 ['beek','Arıcı','Her seviyede arılar %33 daha az sokar; Arı Kovanı %20 daha hızlı üretir.',3],
 ['blade','Kılıç Ustası','Kılıç, sopa ve kürekle vuruş hasarı her seviyede %12 artar.',3],
 ['guard','Siperci','Kalkan engellemelerinde her seviyede %15 daha az dayanıklılık harcanır ve %5 ek hasar azaltılır.',3]
);

/* ---------- Mevsimler: 24 günlük yıl, her mevsim 6 gün ---------- */
const SEASONS=[
 {id:0,n:'Bahar',crop:1.25,bee:1.2,thirst:0,cold:0,msg:'Bahar başladı: ekinler hızlı büyür, arılar çalışkandır.'},
 {id:1,n:'Yaz',crop:1,bee:1.5,thirst:.05,cold:0,msg:'Yaz başladı: gündüzler sıcak, susuzluk daha çabuk artar; arılar en verimli dönemde.'},
 {id:2,n:'Sonbahar',crop:.8,bee:.8,thirst:0,cold:.04,msg:'Sonbahar başladı: ağaçlardan daha çok elma düşer; ekinler yavaşlar, ayılar hazırlık yapar.'},
 {id:3,n:'Kış',crop:.3,bee:0,thirst:0,cold:.26,msg:'Kış başladı: soğuk belirgin biçimde artar, kar yağar; arılar ve ekinler durur, ayılar kış uykusuna yatar. Sıcak giysi ve ateş şart.'}
];
const NEUTRAL={id:-1,n:'',crop:1,bee:1,thirst:0,cold:0,msg:'',day:1,left:6};
HG.x2season=()=>{
 if(HG.cfg.season===false)return NEUTRAL;
 const d=HG.dayNo(),k=Math.floor(((d-1)%24)/6);
 return Object.assign({day:((d-1)%6)+1,left:6-((d-1)%6)},SEASONS[k]);
};
HG.seasonBee=()=>HG.x2season().bee;
HG.x2winter=()=>HG.x2season().id===3;
let lastSeason=-9,acc=0,snowK=0;
function seasonStep(dt){
 const s=HG.x2season();
 if(s.id!==lastSeason){
  if(lastSeason!==-9&&s.id>=0)HG.toast(s.msg);
  lastSeason=s.id;
 }
 if(G.cave){sc.snow=0;return}
 const L=daylight();
 if(s.cold&&!G.nearFire)G.warm=clamp(G.warm-dt*s.cold*HG.coldK()*(1-.15*HG.perk('cold'))*(G.sheltered?.2:1),0,100);
 if(s.thirst&&L>.4)G.thr=clamp(G.thr-dt*s.thirst*(G.sheltered?.3:1)*L,0,100);
 if(s.id===3)G.hun=clamp(G.hun-dt*.02,0,100);
 /* ekinler mevsime göre hızlanır veya yavaşlar (temel büyüme yenilikler.js'tedir) */
 acc+=dt;
 if(acc>=1){
  const f=acc;acc=0;
  if(s.crop!==1&&G.ext&&G.ext.s)for(const k in G.ext.s){const e=G.ext.s[k];if(e.o===O.PLOT&&e.g>=0&&e.g<300)e.g=clamp(e.g+f*(s.crop-1),0,300)}
 }
 /* kar yoğunluğu (sahne okur) */
 const want=s.id===3&&HG.cfg.snow!==false&&!G.sheltered?1:0;
 snowK+=(want-snowK)*Math.min(1,dt*.6);
 sc.snow=snowK<.01?0:snowK;
}

/* ---------- Islaklık (0-100) ve ateş (0-100) ---------- */
HG.x2reg('wet',()=>0,v=>clamp(num(v,0),0,100));
HG.x2reg('fever',()=>0,v=>clamp(num(v,0),0,100));
let wetMsgT=0,feverOn=false;
function bodyStep(dt){
 const x=X();
 if(HG.cfg.wetsys===false){x.wet=0;x.fever=0;return}
 const L=daylight(),rain=sc.rain||0,cold=1-L,wk=HG.wetK();
 const wd=Math.max(0,sc.WY-Scene.groundY(G.px,G.py));
 let gain=0;
 if(G.swim||G.head)gain+=16*wk;
 else if(!G.onRaft&&!G.cave&&wd>.3)gain+=6*wk;
 if(rain>.3&&!G.sheltered&&!G.cave&&!G.head)gain+=rain*1.5*wk;
 let dry=.15;
 if(G.nearFire)dry+=4*(1-Math.min(1,(G.fd===undefined?4:G.fd)/4.6));
 if(G.sheltered)dry+=.8;
 if(L>.55&&rain<.2&&!G.sheltered)dry+=.4;
 const was=x.wet;
 x.wet=clamp(x.wet+(gain>0?gain-dry*.3:-dry)*dt,0,100);
 if(x.wet>=40&&was<40&&G.clock>wetMsgT){wetMsgT=G.clock+90;flag('gotwet');HG.toast('Üzerin ıslandı: soğuk daha çabuk işler. Ateş başında kurulan.')}
 if(x.wet>5){
  const ex=(x.wet/100)*(.12+cold*.38)*HG.coldK()*(G.sheltered?.4:1)*(G.nearFire?0:1);
  G.warm=clamp(G.warm-ex*dt,0,100);
 }
 /* ateş: ıslak ve üşümüş beden hastalanır */
 if(x.wet>55&&G.warm<40)x.fever=Math.min(100,x.fever+2.4*dt);
 else if(x.wet<25&&G.warm>50)x.fever=Math.max(0,x.fever-1.1*dt);
 if(x.fever>=30&&!feverOn){feverOn=true;stat('fevers');flag('fever');HG.toast('Ateşin yükseliyor: Bitki Çayı iç, ateş başında kuru kal.')}
 else if(x.fever<12&&feverOn){feverOn=false;HG.toast('Ateşin düştü.')}
 if(x.fever>=30){
  G.hun=clamp(G.hun-dt*.05,0,100);
  if(!G.sprint)G.stam=Math.max(0,G.stam-dt*5*(x.fever/100));
  if(x.fever>=70){G.hp-=.25*dt;G.cause='Ateşten öldün.'}
 }
}
HG.onRespawnReset=()=>{const x=X();x.wet=0;x.fever=0;feverOn=false};
HG.x2starts.push(()=>{lastSeason=-9;acc=0;feverOn=false;snowK=0;sc.snow=0});
{
 /* Şifalı Merhem ateşi keser */
 const m0=HG.useMedical;
 HG.useMedical=function(){
  const h=held(),k=h&&h.it.heal?h.k:'bandage',n0=count(k),r=m0.apply(this,arguments);
  if(k==='salve'&&count(k)<n0){X().fever=0;stat('cured');flag('cured');HG.toast('Merhem ateşi kesti.')}
  return r;
 };
 /* Uyku ateşi indirir ve kurutur */
 const s0=HG.sleep;
 if(s0)HG.sleep=function(){
  const r=s0.apply(this,arguments);
  if(ui.sleeping){const x=X();if(x.fever>0){stat('cured');flag('cured')}x.fever=0;x.wet=0}
  return r;
 };
}
/* Yeni yiyeceklerin özel etkileri (eylem.js eatHeld sonundaki kanca) */
HG.extAte=(id,f)=>{
 const x=X();
 if(id==='tea'){x.fever=Math.max(0,x.fever-60);G.warm=clamp(G.warm+14,0,100);flag('tea');if(x.fever<12)stat('cured')}
 else if(id==='honey'){G.stam=clamp(G.stam+40,0,100);HG.addSan(2)}
 else if(id==='cake'){HG.addSan(6)}
 else if(id==='herb'){G.hp=clamp(G.hp+4,0,100);x.fever=Math.max(0,x.fever-8)}
 else if(id==='apple'){HG.addSan(.5)}
};

/* ---------- Kılıç Ustası: yakın dövüş silahlarının hasarı ---------- */
{
 const w0=HG.weaponDamage;
 HG.weaponDamage=function(){
  let v=w0.apply(this,arguments);const h=held();
  if(h&&(h.it.tool==='sword'||h.it.tool==='club'||h.it.tool==='shovel'))v*=1+.12*HG.perk('blade');
  return v;
 };
}

/* ---------- Kalkan: sağ tık basılı tutulurken (veya E ile 3 sn) önden gelen darbeyi keser ---------- */
let rmb=false,blockT=0;
{
 const cv=HG.$('#c');
 if(cv)cv.addEventListener('pointerdown',e=>{if(e.button===2)rmb=true},true);
 addEventListener('pointerup',e=>{if(e.button===2)rmb=false},true);
 addEventListener('pointercancel',()=>{rmb=false},true);
 addEventListener('blur',()=>{rmb=false});
}
const shieldHeld=()=>{const h=held();return h&&h.it.tool==='shield'?h:null};
const blocking=()=>!!shieldHeld()&&ui.state==='play'&&!ui.sleeping&&(rmb||G.clock<blockT);
HG.x2blocking=blocking;
HG.x2held.shield=(h,tg,src)=>{
 if(src==='mouse')return true;                        /* sağ tık: siper tutulurken başka eylem yapılmaz */
 blockT=G.clock+3;HG.toast('Siper alındı.');return true;
};
{
 const hr0=HG.hurt;
 HG.hurt=function(dmg,cause,src,bleedP){
  const fall=/düşerek/.test(cause||'');
  if(src&&HG.cfg.peace&&!/Arı/.test(cause||''))return;           /* barış modu: yaratıkların saldırıları zarar vermez */
  if(fall)dmg*=HG.fallK();
  else{
   if(HG.has('furcoat'))dmg*=.9;                                  /* Kürk Palto: hasar %10 azalır */
   if(src&&blocking()){
    const h=shieldHeld(),dx=src.x-G.px,dz=src.z-G.py,d=Math.hypot(dx,dz)||1,cs=(dx*G.fx+dz*G.fy)/d;
    if(cs>.2){
     const t2=IT[h.k].tier>=2,gd=HG.perk('guard'),red=Math.min(.95,(t2?.8:.6)+.05*gd),cost=dmg*(t2?.45:.7)*(1-.15*gd);
     if(G.stam>=cost*.5){
      HG.useStam(cost);dmg*=1-red;bleedP=(bleedP||0)*.3;
      stat('blocks');flag('blocked');HG.snd('clang');
      Scene.burst(G.px+G.fx*.7,Scene.groundY(G.px,G.py)+1.2,G.py+G.fy*.7,0xe8e2c8,6);
     }else{G.stam=0;G.tired=true;HG.toast('Dayanıklılığın bitti: siper düştü!')}
    }
   }
  }
  return hr0.call(this,dmg,cause,src,bleedP);
 };
}

/* ---------- Arayüz: durum satırı ve mevsim etiketi ---------- */
let stEl=null;
function ensureEl(){
 if(stEl)return;
 const hud=HG.$('#hud');if(!hud)return;
 stEl=document.createElement('div');stEl.id='x2s';hud.appendChild(stEl);
}
{
 const hd0=HG.hud;
 let key='';
 HG.hud=function(){
  hd0.apply(this,arguments);
  try{
   ensureEl();
   const x=G.x2;if(!x)return;
   const clk=HG.$('#clock'),s=HG.x2season();
   if(clk&&s.n&&clk.textContent&&!clk.textContent.endsWith(s.n))clk.textContent+=' · '+s.n;
   const parts=[];
   if(x.wet>=10)parts.push('<span class="w">Islak %'+Math.round(x.wet)+'</span>');
   if(x.fever>=10)parts.push('<span class="f">Ateş %'+Math.round(x.fever)+'</span>');
   if(blocking())parts.push('<span class="b">Siper</span>');
   if(HG.cfg.peace)parts.push('<span class="p">Barış</span>');
   const k=parts.join('');
   if(k!==key&&stEl){key=k;stEl.innerHTML=k}
  }catch(e){}
 };
}

/* ---------- Kare güncellemesi ---------- */
{
 const u0=HG.update;
 let err=false;
 HG.update=function(dt){
  u0.call(this,dt);
  if(ui.state!=='play'||!G.x2)return;
  try{
   seasonStep(dt);
   bodyStep(dt);
  }catch(e){if(!err){err=true;console.error('genisleme2',e)}}
 };
}
})();
