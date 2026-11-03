/* Hunger 3D - gerçek ses kayıtları katmanı.
   ses/ klasöründeki kayıtları yükler ve olay adlarına bağlar. Kayıtlar beş pakette toplanmıştır
   (adım, alet, dövüş, hayvan, doğal); paketler koşut indirilir, çözme işlemi küçük öbekler halinde
   yapılır ve arada ana iş parçacığı serbest bırakılır; böylece oyun yüklenirken takılmaz.
   Bir kayıt yoksa ya da çözülemezse motor o sesin üretilen sürümünü çalar.
   Kayıt sahipleri ve lisanslar: ses/KREDI.txt */
(()=>{
'use strict';
const S=HG.Ses,{G,O}=HG;
const R=S.R;
const BASE='ses/';
let man=null,durum='bekle',yuklenen=0,hatali=0,oran=0;
const HAVUZ={},DONGU={},sonSec={};

/* ---------------------------------------------------------- yükleme ---------------------------------------------------------- */
const bekle=ms=>new Promise(r=>setTimeout(r,ms));
function coz(ab){
 return new Promise((res,rej)=>{
  try{const p=S.ac().decodeAudioData(ab,res,rej);if(p&&p.catch)p.catch(rej)}catch(e){rej(e)}
 });
}
/* paketteki kayıtları grup grup çözer: önce oyunun ilk saniyesinde gereken sesler */
const ONCELIK=['adim','dovus','arac','hayvan','dogal'];
const DONGU_ONCELIK=['ruzgar','dalga','yagmur','kus','yaprak','ates1','ates2','ates3','kiyi','firtina','kus2','kus3','kayalik','yagmur2'];

async function yukle(){
 try{
  const r=await fetch(BASE+'dizin.json');if(!r.ok)throw 0;
  man=await r.json();
 }catch(e){durum='yok';return}
 durum='yukleniyor';
 /* grup → o gruptaki kayıtların listesi (ad, konum, uzunluk, süre) */
 const grup={};
 for(const ad in man.pool)for(const p of man.pool[ad]){
  (grup[p[0]]||(grup[p[0]]=[])).push({ad,off:p[1],len:p[2],sure:p[3]||0});
 }
 const toplam=Object.values(grup).reduce((a,b)=>a+b.length,0)+Object.keys(man.loop||{}).length;
 let bitti=0;
 /* paketler koşut indirilir, sırayla çözülür */
 const indir={};
 for(const g of ONCELIK){
  const bilgi=man.grp[g];if(!bilgi)continue;
  indir[g]=fetch(BASE+bilgi.f).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).catch(()=>null);
 }
 for(const g of ONCELIK){
  const bin=await (indir[g]||Promise.resolve(null));
  const liste=grup[g]||[];
  if(!bin){hatali+=liste.length;bitti+=liste.length;oran=bitti/toplam;continue}
  for(let i=0;i<liste.length;i+=6){
   const oba=liste.slice(i,i+6);
   await Promise.all(oba.map(async it=>{
    try{
     let b;
     try{b=await coz(bin.slice(it.off,it.off+it.len))}
     catch(e){/* kesilmiş çerçeve: biraz fazla veriyle yeniden denenir */
      b=await coz(bin.slice(it.off,Math.min(bin.byteLength,it.off+it.len+2304)));
     }
     (HAVUZ[it.ad]||(HAVUZ[it.ad]=[])).push(b);yuklenen++;
    }catch(e){hatali++}
    bitti++;
   }));
   /* tarayıcı bu biçimi hiç çözemiyorsa boşuna uğraşılmaz: üretilen seslerle devam edilir */
   if(yuklenen===0&&hatali>=24){durum='yok';return}
   oran=bitti/toplam;
   await bekle(0);
  }
 }
 /* döngüsel ortam sesleri: ayrı dosyalar, koşut indirilir */
 const dl={};
 for(const ad in man.loop)dl[ad]=fetch(BASE+man.loop[ad].f).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).catch(()=>null);
 for(const ad of DONGU_ONCELIK){
  if(!man.loop[ad])continue;
  const ab=await dl[ad];
  if(ab){try{DONGU[ad]=await coz(ab);yuklenen++}catch(e){hatali++}}else hatali++;
  bitti++;oran=bitti/toplam;
  await bekle(0);
 }
 durum='hazir';
}
let baslatildi=false;
function basla(){
 if(baslatildi||!S.ac())return;
 baslatildi=true;
 yukle().catch(()=>{durum='yok'});
}

/* ---------------------------------------------------------- çalma yardımcıları ---------------------------------------------------------- */
/* aynı kayıt üst üste seçilmez: tekrar duygusu azalır */
function sec(ad){
 const a=HAVUZ[ad];if(!a||!a.length)return null;
 if(a.length===1)return a[0];
 let i=(Math.random()*a.length)|0;
 if(i===sonSec[ad])i=(i+1+((Math.random()*(a.length-1))|0))%a.length;
 sonSec[ad]=i;return a[i];
}
/* tek kayıt: perde ve seviye hafifçe değişir, kullanılan düğümler bitince serbest bırakılır */
let enUzun=0;                                      /* son olayda çalan en uzun kaydın bitiş süresi */
function at(dst,buf,o){
 o=o||{};
 const ac=S.ac(),s=ac.createBufferSource(),g=ac.createGain();
 s.buffer=buf;
 s.playbackRate.value=(o.rate||1)*(1+R(-1,1)*(o.r===undefined?.06:o.r));
 enUzun=Math.max(enUzun,(o.t||0)+buf.duration/s.playbackRate.value);
 g.gain.value=(o.g===undefined?1:o.g)*(1+R(-1,1)*.08);
 s.connect(g);
 let n=g;
 if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;g.connect(f);n=f}
 n.connect(dst);
 s.onended=()=>{try{s.disconnect();g.disconnect();if(n!==g)n.disconnect()}catch(e){}};
 s.start(ac.currentTime+(o.t||0));
 return s;
}
/* üretilen sesi kısık bir katman olarak ekler: kaydın gövdesini kalınlaştırır */
function kat(dst,k,gain){
 const fn=S.K[k];if(!fn)return;
 const g=S.ac().createGain();g.gain.value=gain;g.connect(dst);
 try{fn(g)}catch(e){}
}

/* ---------------------------------------------------------- zemin ---------------------------------------------------------- */
function zemin(k){
 if(k==='step_water')return 'step_water';
 if(k==='step_rock') return 'step_rock';
 if(k==='step_sand') return 'step_sand';
 if(k==='step_raft') return 'step_wood';
 if(k==='step_snow') return 'step_sand';          /* kar kaydı yok: kuma en yakın; üstüne kar katmanı eklenir */
 if(G.cave)return 'step_rock';
 if(G.sheltered)return 'step_wood';
 /* aynı karede hep aynı zemin duyulsun diye konumdan türetilen sabit bir dağılım */
 const h=((Math.floor(G.px)*73856093)^(Math.floor(G.py)*19349663))>>>0;
 return h%5===0?'step_dirt':'step_grass';
}

/* ---------------------------------------------------------- olay → kayıt eşlemesi ---------------------------------------------------------- */
const SES={                                        /* tür: [havuz öneki, seviye, perde] */
 sheep:['sheep',.62,1],cow:['cow',.62,1],boar:['boar',.6,1],chicken:['chicken',.55,1],rabbit:['rabbit',.5,1],
 wolf:['wolf',.6,1],bear:['bear',.66,1],deer:['deer',.58,1],shade:['shade',.6,1]
};
const IRI={cow:1,bear:1,boar:1,deer:1};
function play(k,dst,o){
 if(!S.ac()||durum==='bekle')return false;
 const x=o.x;
 enUzun=0;
 /* adımlar: koşarken daha sert, suda ve tahtada farklı seviye */
 if(k.indexOf('step')===0){
  const nm=zemin(k),b=sec(nm);if(!b)return false;
  const kos=G.sprint&&G.moving;
  at(dst,b,{g:(nm==='step_water'?.8:nm==='step_wood'?.7:.5)*(kos?1.3:1),r:.08,rate:k==='step_snow'?1.15:1});
  if(k==='step_snow')kat(dst,'step_snow',.55);
  return true;
 }
 switch(k){
  case 'hit':{const b=sec(x===O.TREE?'chop':'hammer');if(!b)return false;at(dst,b,{g:x===O.TREE?.95:.85,r:.05});return true}
  case 'rock':
  case 'ore':{const b=sec(k==='ore'&&x!==O.COAL?'mine_metal':'mine_stone');if(!b)return false;at(dst,b,{g:.9,r:.05});return true}
  case 'crack':
  case 'creak':{const b=sec('treecrack');if(!b)return false;at(dst,b,{g:.95,r:.04});return true}
  case 'thud':{const b=sec('treecrash');if(!b)return false;at(dst,b,{g:.95,r:.04});kat(dst,'thud',.55);const lf=sec('leaves');if(lf)at(dst,lf,{g:.5,r:.06,t:.04});return true}
  case 'leaves':{const b=sec('leaves');if(!b)return false;at(dst,b,{g:.6,r:.07});return true}
  case 'crumble':{const b=sec('rockbreak');if(!b)return false;at(dst,b,{g:.95,r:.05});at(dst,b,{g:.7,r:.08,t:.09,rate:.8});kat(dst,'crumble',.5);return true}
  case 'pick':{const b=sec('flesh');if(!b)return false;at(dst,b,{g:.95,r:.07});return true}
  case 'craft':{const b=sec('hammer');if(!b)return false;at(dst,b,{g:.8,r:.05});at(dst,b,{g:.7,r:.05,t:.16});const c=sec('saw');if(c)at(dst,c,{g:.5,t:.34});kat(dst,'craftChime',.8);return true}
  case 'ignite':{const b=sec('ignite');if(!b)return false;at(dst,b,{g:.9,r:.05});kat(dst,'ignite',.35);return true}
  case 'arrowhit':{const b=sec(Math.random()<.7?'arrowwood':'arrowdirt');if(!b)return false;at(dst,b,{g:.9,r:.06});return true}
  case 'arrowflesh':{const b=sec('flesh');if(!b)return false;at(dst,b,{g:1,r:.06,rate:.9});return true}
  case 'bowfire':{const b=sec('arrowfly');if(!b)return false;at(dst,b,{g:.75,r:.05,t:.02});kat(dst,'bowfire',.85);return true}
  case 'clang':{const b=sec('shield');if(!b)return false;at(dst,b,{g:.95,r:.05});kat(dst,'clang',.4);return true}
  case 'hurt':{const b=sec('hurt');if(!b)return false;at(dst,b,{g:.95,r:.07});kat(dst,'hurt',.45);return true}
  case 'splash':{const b=sec('splash');if(!b)return false;at(dst,b,{g:.85,r:.08});kat(dst,'splash',.4);return true}
  case 'eat': case 'drink': case 'drip':{const b=sec(k);if(!b)return false;at(dst,b,{g:k==='drip'?.8:.9,r:.06});return true}
  case 'thunder':{const b=sec('thunder');if(!b)return false;at(dst,b,{g:.95,r:.04});return true}
  case 'bark': case 'call_dog':{const b=sec('dog_bark');if(!b)return false;at(dst,b,{g:.7,r:.06,rate:1.12});return true}
  case 'cry_dog': case 'die_dog':{const b=sec(k==='cry_dog'?'wolf_cry':'wolf_die');if(!b)return false;at(dst,b,{g:.6,r:.05,rate:1.3});return true}
  case 'hiss':{const b=sec('shade_hiss');if(!b)return false;at(dst,b,{g:.8,r:.06});kat(dst,'hiss',.4);return true}
 }
 /* hayvan sesleri */
 const m=/^(call|cry|die|atk)_(\w+)$/.exec(k);
 if(m){
  const v=SES[m[2]];if(!v)return false;
  if(m[2]==='wolf'){
   /* kurt: çağrı uzun uluma, saldırı kısa ve alçak hırıltı */
   if(m[1]==='call'){const b=sec('wolf_call');if(!b)return false;at(dst,b,{g:.62,r:.04});return true}
   if(m[1]==='atk'){const b=sec('wolf_cry');if(!b)return false;at(dst,b,{g:.7,r:.05,rate:.88});return true}
  }
  const nm=m[1]==='atk'?v[0]+'_cry':v[0]+'_'+m[1];
  const b=sec(nm);if(!b)return false;
  at(dst,b,{g:v[1],r:.07,rate:v[2]*(m[1]==='atk'?.94:1)});
  if(m[1]==='die'&&IRI[m[2]])kat(dst,'thud',.45);
  if(m[2]==='shade'&&m[1]==='call')kat(dst,'whisper',.35);
  return true;
 }
 return false;
}

/* ---------------------------------------------------------- dış arayüz ---------------------------------------------------------- */
S.kayit={
 basla,play,
 sure:()=>enUzun,
 sayim:()=>{const o={};for(const a in HAVUZ)o[a]=HAVUZ[a].length;return o},
 dongu:ad=>DONGU[ad]||null,
 var:ad=>!!DONGU[ad]||!!(HAVUZ[ad]&&HAVUZ[ad].length),
 durum:()=>({durum,yuklenen,hatali,oran})
};
/* konsol ve eski çağrılarla uyum */
HG.sesGercek={
 has:ad=>S.kayit.var(ad),
 muzikOk:()=>!!(S.muzik&&S.muzik.calisiyor()),
 durum:()=>{
  const d=S.kayit.durum(),m=S.muzik?S.muzik.durum():{};
  return {state:d.durum,nLoaded:d.yuklenen,nFailed:d.hatali,havuz:Object.keys(HAVUZ).length,dongu:Object.keys(DONGU).length,muzik:m};
 }
};
})();
