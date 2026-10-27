/* Hunger 3D - ses motoru (çekirdek).
   Tüm sesler tek bir yoldan geçer:
     kaynak → ses (voice) zinciri → kanal (efekt / ortam / gerilim / müzik) → dünya süzgeci → ana ses → sınırlayıcı → çıkış
   Görevleri: ses bağlamını kurmak, kanalları ve yankı odalarını yönetmek, aynı anda çalan ses sayısını sınırlamak,
   sesleri 3B konumlandırmak, uzaklığa göre boğuklaştırmak ve önemli olaylarda müziği kısmak (ducking).
   Ses üretimi burada değildir: üretilen sesler js/ses/kitaplik.js, kayıtlar js/ses/kayit.js,
   ortam sesleri js/ses/ortam.js, müzik js/ses/muzik.js dosyalarındadır.
   Dış arayüz: HG.snd(ad, {x,z,y}?, ek?), HG.initAudio(), HG.audioFrame(G,dt,mod) */
(()=>{
'use strict';
const {ui,look}=HG;
const R=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

let AC=null,ready=false;
let limiter,glue,world,worldLP,ambLP,musDuck,tensBus,sfxBus,ambBus,musBus;
let verbA,verbB,retA,retB,dampA,dampB,sndA,sndB,ambSnd;
let white=null,pink=null;
let lx=0,ly=2,lz=0;
const frames=[];                                  /* her karede çağrılacak alt sistemler (ortam, müzik) */

/* ---------------------------------------------------------- yardımcılar ---------------------------------------------------------- */
const tc=(p,v,tau)=>{try{p.setTargetAtTime(v,AC.currentTime,tau||.7)}catch(e){}};
function setPos(p,x,y,z){
 if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z}
 else p.setPosition(x,y,z);
}
/* beyaz / pembe gürültü tamponu: üretilen seslerin ham maddesi */
function mkNoise(sec,isPink){
 const n=(AC.sampleRate*sec)|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){
  const a=b.getChannelData(c);let b0=0,b1=0,b2=0;
  for(let i=0;i<n;i++){
   const w=Math.random()*2-1;
   if(isPink){b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;a[i]=(b0+b1+b2+w*.1848)*.2}
   else a[i]=w;
  }
 }
 return b;
}
/* yankı odası tamponu: önce birkaç erken yansıma, sonra sönen kuyruk */
function mkIR(sec,dec,taps,dark){
 const n=(AC.sampleRate*sec)|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){
  const a=b.getChannelData(c);let lp=0;
  for(let i=0;i<n;i++){
   const x=(Math.random()*2-1)*Math.pow(1-i/n,dec);
   lp+=(x-lp)*(dark?.42-.3*i/n:.78-.6*i/n);
   a[i]=lp*1.5;
  }
  for(let k=0;k<taps;k++){                        /* erken yansımalar: odanın boyutunu duyurur */
   const i=((.004+Math.random()*.085)*AC.sampleRate)|0;
   if(i<n)a[i]+=(Math.random()<.5?-1:1)*(.5-k*.045)*(.7+Math.random()*.6);
  }
 }
 return b;
}

/* ---------------------------------------------------------- olay kataloğu ----------------------------------------------------------
   Her ses bir öbeğe girer. Öbek; önceliği (ses sayısı dolduğunda hangisinin kesileceğini),
   duyulma uzaklığını, art arda çalma sınırını ve çıkacağı kanalı belirler. */
const CAT={
 arayuz: {p:78,d:0,  lim:35, ayni:4, bus:'sfx', dur:1.2},
 oyuncu: {p:64,d:14, lim:0,  ayni:3, bus:'sfx', dur:2},
 eylem:  {p:68,d:48, lim:0,  ayni:3, bus:'sfx', dur:3},
 dovus:  {p:86,d:75, lim:0,  ayni:4, bus:'sfx', dur:2.5},
 hayvan: {p:54,d:90, lim:0,  ayni:3, bus:'sfx', dur:3.5},
 cevre:  {p:26,d:110,lim:0,  ayni:4, bus:'amb', dur:4},
 gerilim:{p:88,d:0,  lim:0,  ayni:2, bus:'tens',dur:4},
 olay:   {p:98,d:999,lim:0,  ayni:2, bus:'sfx', dur:8}
};
/* ada göre öbek; listede olmayan ad ekteki kurallarla bulunur */
const OZEL={
 heart:'gerilim',whisper:'gerilim',stinger:'gerilim',breath:'oyuncu',stomach:'oyuncu',
 thunder:'olay',bloodmoon:'olay',levelup:'olay',quest:'olay',shark_warn:'olay',bell:'olay',
 splash:'eylem',jump:'oyuncu',land:'oyuncu',eat:'oyuncu',drink:'oyuncu',bandage:'oyuncu',get:'oyuncu',
 chest:'eylem',ignite:'eylem',leaves:'eylem',craftChime:'eylem',
 pop:'cevre',drip:'cevre',bird:'cevre',cricket:'cevre',owl:'cevre',gull:'cevre',
 dolphin:'cevre',whale:'cevre',cave_creak:'cevre',buzz:'cevre',
 hurt:'dovus',clang:'dovus',hitmark:'dovus',pick:'dovus',scratch:'dovus',hiss:'hayvan',bark:'hayvan'
};
/* art arda çalma sınırı (saniye): aynı ses bu süre dolmadan yeniden çalmaz */
const LIM={step:.16,step_rock:.16,step_sand:.16,step_water:.16,step_raft:.16,step_snow:.16,
 ui:.035,ui_open:.08,ui_close:.08,hitmark:.05,cricket:.05,pop:.05,get:.06,hit:.1,rock:.1,ore:.1};
/* müziği kısan sesler: [kısma miktarı, süre] */
const DUCK={thunder:[.72,2.2],bloodmoon:[.8,3.5],stinger:[.75,2],levelup:[.5,1.6],quest:[.45,1.4],
 crumble:[.4,1],thud:[.4,1],shark_warn:[.6,1.8],chest:[.35,1]};

function kat(k){
 if(OZEL[k])return OZEL[k];
 if(k.indexOf('ui')===0)return 'arayuz';
 if(k.indexOf('step')===0)return 'oyuncu';
 if(/^(call|cry|die|atk)_/.test(k))return 'hayvan';
 if(/^(bow|arrow)/.test(k))return 'dovus';
 if(/^(hit|rock|ore|crack|crumble|creak|thud|craft|shear|milk|clang)$/.test(k))return k==='clang'?'dovus':'eylem';
 return 'eylem';
}

/* ---------------------------------------------------------- kuruluş ---------------------------------------------------------- */
function initAudio(){
 if(!AC){
  try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  try{build();ready=true}catch(e){console.warn('ses kurulamadı',e);return}
 }
 if(AC.state==='suspended'&&!document.hidden){try{AC.resume()}catch(e){}}
}
function build(){
 /* çıkış: önce yapıştırıcı sıkıştırma, sonra tepe sınırlayıcı (kırpılma ve ani patlamaları önler) */
 limiter=AC.createDynamicsCompressor();
 limiter.threshold.value=-2.5;limiter.knee.value=0;limiter.ratio.value=20;limiter.attack.value=.002;limiter.release.value=.14;
 limiter.connect(AC.destination);
 const out=AC.createGain();out.gain.value=.0001;out.connect(limiter);    /* ana ses */
 glue=AC.createDynamicsCompressor();
 glue.threshold.value=-19;glue.knee.value=22;glue.ratio.value=2.6;glue.attack.value=.006;glue.release.value=.26;
 glue.connect(out);
 /* dünya: su altında ve mağarada tüm dünya sesleri boğuklaşır */
 worldLP=AC.createBiquadFilter();worldLP.type='lowpass';worldLP.frequency.value=22000;worldLP.Q.value=.4;
 worldLP.connect(glue);
 world=AC.createGain();world.gain.value=1;world.connect(worldLP);
 /* kanallar */
 sfxBus=AC.createGain();sfxBus.connect(world);
 ambBus=AC.createGain();ambLP=AC.createBiquadFilter();ambLP.type='lowpass';ambLP.frequency.value=22000;
 ambBus.connect(ambLP);ambLP.connect(world);
 tensBus=AC.createGain();tensBus.connect(world);
 musDuck=AC.createGain();musDuck.gain.value=1;musDuck.connect(out);     /* müzik dünya süzgecine girmez: su altında da net kalır */
 musBus=AC.createGain();musBus.connect(musDuck);
 /* iki yankı odası: kısa (oda / orman) ve uzun (mağara / vadi). Aradaki her ortam ikisinin karışımıdır. */
 verbA=AC.createConvolver();verbA.buffer=mkIR(.95,3.1,6,false);
 verbB=AC.createConvolver();verbB.buffer=mkIR(3.4,1.9,3,true);
 dampA=AC.createBiquadFilter();dampA.type='lowpass';dampA.frequency.value=9000;
 dampB=AC.createBiquadFilter();dampB.type='lowpass';dampB.frequency.value=3200;
 retA=AC.createGain();retB=AC.createGain();
 verbA.connect(dampA);dampA.connect(retA);retA.connect(world);
 verbB.connect(dampB);dampB.connect(retB);retB.connect(world);
 sndA=AC.createGain();sndA.gain.value=.06;sfxBus.connect(sndA);sndA.connect(verbA);
 sndB=AC.createGain();sndB.gain.value=0;  sfxBus.connect(sndB);sndB.connect(verbB);
 ambSnd=AC.createGain();ambSnd.gain.value=.05;ambBus.connect(ambSnd);ambSnd.connect(verbA);
 const mSnd=AC.createGain();mSnd.gain.value=.3;musBus.connect(mSnd);mSnd.connect(verbA);
 B.out=out;
 white=mkNoise(2,false);pink=mkNoise(6,true);
}
const B={};
/* sekme arka plana geçince ses bağlamı durur (pil ve işlemci tasarrufu), dönünce sürer */
document.addEventListener('visibilitychange',()=>{
 if(!AC)return;
 try{if(document.hidden){if(AC.state==='running')AC.suspend()}else if(AC.state==='suspended')AC.resume()}catch(e){}
});

/* ---------------------------------------------------------- ses (voice) yönetimi ----------------------------------------------------------
   Aynı anda çalabilecek ses sayısı sınırlıdır. Sınır dolduğunda yeni ses, kendisinden daha önemsiz
   ve daha eski bir sesin yerini alır; daha önemsizse hiç çalmaz. Zincirler havuzda tutulur, yeniden kullanılır. */
const MAX=26;
const bos=[],canli=[];
function zincir(){
 const g=AC.createGain(),lp=AC.createBiquadFilter();
 lp.type='lowpass';lp.Q.value=.35;
 let pan=null;
 if(AC.createPanner){
  pan=AC.createPanner();
  pan.panningModel='HRTF';pan.distanceModel='inverse';
  pan.refDistance=3;pan.rolloffFactor=1.15;pan.maxDistance=200;
  g.connect(pan);pan.connect(lp);
 }else g.connect(lp);
 return {g,pan,lp,bagli:null,t:0,p:0,k:'',zaman:0};
}
function birak(v){
 if(!v.bagli)return;
 clearTimeout(v.sayac);
 try{v.lp.disconnect()}catch(e){}
 v.bagli=null;
 const i=canli.indexOf(v);if(i>=0)canli.splice(i,1);
 if(bos.length<MAX)bos.push(v);
}
/* yerini yeni bir sese bırakan ses: hemen listeden düşer, sesi kısılır, zinciri kısa süre sonra havuza döner */
function kes(v){
 const i=canli.indexOf(v);if(i>=0)canli.splice(i,1);
 try{v.g.gain.cancelScheduledValues(AC.currentTime);v.g.gain.setTargetAtTime(.0001,AC.currentTime,.02)}catch(e){}
 clearTimeout(v.sayac);
 v.sayac=setTimeout(()=>birak(v),140);
}
const sameCount=k=>{let n=0;for(const v of canli)if(v.k===k)n++;return n};
function al(k,pos,m,dist){
 if(sameCount(k)>=m.ayni)return null;
 if(canli.length>=MAX){
  let worst=null;
  for(const v of canli)if(!worst||v.p<worst.p||(v.p===worst.p&&v.zaman<worst.zaman))worst=v;
  if(!worst||worst.p>m.p)return null;
  kes(worst);
 }
 const v=bos.pop()||zincir();
 v.k=k;v.p=m.p;v.zaman=AC.currentTime;
 v.g.gain.cancelScheduledValues(AC.currentTime);v.g.gain.value=1;
 const bus=m.bus==='amb'?ambBus:m.bus==='tens'?tensBus:sfxBus;
 if(pos&&v.pan){
  setPos(v.pan,pos.x,pos.y!==undefined?pos.y:ly,pos.z);
  /* uzaklık ve hava: uzaktaki ses tizini yitirir */
  v.lp.frequency.value=clamp(19000/(1+dist*dist*.0055),700,20000);
 }else{
  if(v.pan)setPos(v.pan,lx,ly,lz);
  v.lp.frequency.value=20000;
 }
 v.lp.connect(bus);v.bagli=bus;
 canli.push(v);
 v.bitis=AC.currentTime+m.dur;
 v.sayac=setTimeout(()=>birak(v),(m.dur*1000)|0);
 return v;
}
/* uzun bir kayıt çalıyorsa zinciri erken bırakmayız */
function uzat(v,sure){
 if(!v||!v.bagli)return;
 const yeni=AC.currentTime+sure+.25;
 if(yeni<=v.bitis)return;
 clearTimeout(v.sayac);
 v.bitis=yeni;
 v.sayac=setTimeout(()=>birak(v),((yeni-AC.currentTime)*1000)|0);
}

/* ---------------------------------------------------------- müziği kısma (ducking) ---------------------------------------------------------- */
let duckV=1,duckT=0;
function duck(amount,time){
 const v=1-amount;
 if(v<duckV){duckV=v;duckT=time}
 else if(time>duckT)duckT=time;
}

/* ---------------------------------------------------------- çalma ---------------------------------------------------------- */
const K={};                                        /* üretilen sesler: kitaplik.js doldurur */
const son={};                                      /* ada göre son çalma zamanı */
function snd(k,pos,x){
 if(!ready||ui.mute||!AC||AC.state!=='running')return;
 const C=HG.cfg;if(C&&C.master<=0)return;
 /* karda yürürken adım sesi kar sürümüne döner (oyun kodu değişmeden) */
 if(k==='step'&&HG.sc.snow>.45&&!HG.G.cave&&!HG.G.sheltered)k='step_snow';
 const c=kat(k),m=CAT[c];
 const lim=LIM[k]||m.lim;
 const now=AC.currentTime;
 if(lim&&son[k]&&now-son[k]<lim)return;
 let dist=0;
 if(m.d<=0)pos=null;                               /* arayüz ve iç sesler: konumsuz, hep ortadan duyulur */
 if(pos&&isFinite(pos.x)){
  dist=Math.hypot(pos.x-lx,pos.z-lz);
  if(dist>m.d)return;                              /* duyulmayacak kadar uzak: hiç kurulmaz */
 }else pos=null;
 const v=al(k,pos,m,dist);
 if(!v)return;
 son[k]=now;
 const d=DUCK[k];if(d)duck(d[0],d[1]);
 const kay=HG.Ses.kayit;
 if(kay){
  try{if(kay.play(k,v.g,{pos,x,dist,kat:c})){uzat(v,kay.sure());hook(k,pos,'kayıt');return}}
  catch(e){if(HG.audioDebug)console.error('kayıt',k,e.message)}
 }
 const fn=K[k];
 if(!fn){birak(v);return}
 try{fn(v.g);hook(k,pos,'sentetik')}
 catch(e){birak(v);if(HG.audioDebug)console.error('ses',k,e.message)}
}
const hook=(k,pos,src)=>{if(HG.sndHook)try{HG.sndHook(k,pos,src)}catch(e){}};

/* ---------------------------------------------------------- kare güncellemesi ---------------------------------------------------------- */
let env={ic:0,magara:0,orman:0,acik:1,suAlti:0};
function audioFrame(G,dt,mode){
 if(!ready||AC.state!=='running')return;
 const C=HG.cfg,play=mode==='play',t=performance.now()*.001;
 /* dinleyici: oyuncunun kulağı */
 lx=G.px;lz=G.py;ly=play&&G.pz!==undefined?G.pz+HG.EYE:2;
 const li=AC.listener,yaw=look.yaw,fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 if(li.positionX){
  li.positionX.value=lx;li.positionY.value=ly;li.positionZ.value=lz;
  li.forwardX.value=fx;li.forwardY.value=0;li.forwardZ.value=fz;li.upX.value=0;li.upY.value=1;li.upZ.value=0;
 }else{li.setPosition(lx,ly,lz);li.setOrientation(fx,0,fz,0,1,0)}
 /* kanal seviyeleri */
 const sessiz=ui.mute||C.master<=0;
 tc(B.out.gain,sessiz?.0001:(mode==='pause'?.38:1)*(C.master/100)+.0001,.14);
 tc(sfxBus.gain,C.sfx/100,.1);
 tc(ambBus.gain,C.amb/100,.1);
 tc(musBus.gain,C.mus/100,.1);
 tc(tensBus.gain,C.tens/100,.1);
 /* müziği kısma geri dönüşü */
 if(duckT>0){duckT-=dt;if(duckT<=0)duckV=1}
 else duckV=1;
 tc(musDuck.gain,duckV,duckV<1?.08:.45);
 /* ortam: mağara, barınak, orman ve su altı karışımı */
 const cave=play&&!!G.cave,sh=play&&!!G.sheltered,head=play&&!!G.head;
 env.magara+= (((cave?1:0)-env.magara)*Math.min(1,dt*2.5));
 env.ic+=     (((sh&&!cave?1:0)-env.ic)*Math.min(1,dt*2.5));
 env.suAlti+= (((head?1:0)-env.suAlti)*Math.min(1,dt*6));
 const orman=HG.Ses.orman||0;
 tc(worldLP.frequency,head?480:cave?15000:22000,.12);
 tc(sndA.gain,.05+.09*orman+.42*env.ic+.12*env.magara,.5);
 tc(sndB.gain,.62*env.magara+.05*(1-env.ic)*(1-env.magara)*(1-orman),.6);
 tc(ambSnd.gain,.04+.2*env.ic+.1*env.magara,.5);
 tc(dampA.frequency,env.ic?4200:9000,.5);
 tc(dampB.frequency,env.magara?2600:1500,.5);
 tc(ambLP.frequency,cave?5200:sh?3400:22000,.5);
 /* alt sistemler: ortam sesleri ve müzik */
 for(const f of frames){
  try{f({G,dt,t,mode,play,cave,sh,head,env})}
  catch(e){if(HG.audioDebug)console.error('ses kare',e.message)}
 }
}

/* ---------------------------------------------------------- dış arayüz ---------------------------------------------------------- */
HG.Ses={
 ac:()=>AC,
 hazir:()=>ready,
 K,
 tc,setPos,R,clamp,
 gurultu:(p)=>p?pink:white,
 kanal:n=>n==='amb'?ambBus:n==='mus'?musBus:n==='tens'?tensBus:sfxBus,
 verb:()=>({a:verbA,b:verbB}),
 kare:f=>frames.push(f),                           /* alt sistem kaydı */
 duck,
 dinleyici:()=>({x:lx,y:ly,z:lz}),
 /* konumlu çıkış isteyen alt sistemler için (ateş, ortam tek seslileri) */
 yerlesim:(x,y,z)=>{
  const p=AC.createPanner();
  p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=2.5;p.rolloffFactor=1.3;p.maxDistance=120;
  setPos(p,x,y,z);return p;
 },
 sesSayisi:()=>({calan:canli.length,havuz:bos.length,sinir:MAX}),
 orman:0,deniz:0,ruzgar:0                          /* ortam.js doldurur; motor yankıda kullanır */
};
HG.snd=snd;HG.initAudio=initAudio;HG.audioFrame=audioFrame;
HG.audioState=()=>AC?AC.state:'yok';
})();
