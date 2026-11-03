/* Hunger 3D - oynanış geliştirmeleri (güncelleme 60).
   1) Açlık ve soğuk için erken uyarılar (eskiden yalnızca susuzluk uyarı veriyordu),
   2) Hızlı ye: seçili eşyayı değiştirmeden çantadaki en uygun yiyeceği yer,
   3) Uzakta kalmış eski hayvan artıklarının (et, kemik, deri, tüy) zamanla kaybolması,
   4) Oyun bir kayıt yuvasına bağlı değilse düzenli hatırlatma.
   Özgün dosyalara dokunmaz; HG.update sarılır, yalnızca tuş dinlenir ve ileti gösterilir. */
(()=>{
'use strict';
const {G,ui,IT}=HG;

/* ---------- 1) Açlık / soğuk uyarıları ----------
   Her kademe, değer yeterince yükselene kadar bir kez söylenir; iletiler üst üste binmez. */
const W={hun:[0,0,0],warm:[0,0,0]};            /* her kademenin söylenip söylenmediği */
let msgGap=0;                                   /* iki uyarı arası bekleme (sn) */
function say(m,snd){HG.toast&&HG.toast(m);if(snd)try{HG.snd(snd)}catch(e){}msgGap=6}
function warnings(dt){
 msgGap=Math.max(0,msgGap-dt);
 const hk=HG.keyLabel&&HG.bind&&HG.bind.quickeat?HG.keyLabel(HG.bind.quickeat[0]):'V';
 const v=G.hun,h=W.hun;
 if(v>40)h[0]=h[1]=h[2]=0;
 else if(msgGap<=0){
  if(v<=0&&!h[2]){h[0]=h[1]=h[2]=1;say('Açlıktan can kaybediyorsun: hemen bir şey ye.','stomach')}
  else if(v<=12&&!h[1]){h[0]=h[1]=1;say('Çok açsın: yakında koşamaz ve can kaybedersin. ['+hk+'] ile hızlı ye.','stomach')}
  else if(v<=28&&!h[0]){h[0]=1;say('Karnın acıkıyor. ['+hk+'] ile hızlı yiyebilirsin.')}
 }
 const t=G.warm,w=W.warm;
 if(t>55)w[0]=w[1]=w[2]=0;
 else if(msgGap<=0){
  if(t<=0&&!w[2]){w[0]=w[1]=w[2]=1;say('Donuyorsun: hemen ısın; ateş yak veya barınağa gir.')}
  else if(t<=15&&!w[1]){w[0]=w[1]=1;say('Çok üşüyorsun: ateşin yanına git ya da barınağa gir.')}
  else if(t<=32&&!w[0]){w[0]=1;say('Üşümeye başladın. Sıcak kalmak için ateş yak veya giysi giy.')}
 }
}

/* ---------- 2) Hızlı ye ----------
   Çantadaki yiyecekler arasından açlığı en uygun doyuran seçilir: ihtiyaçtan az fazla doyuran,
   hasta etme riski taşımayan (pişmiş) yiyecek önce gelir. Seçili eşya ve kutu değişmez. */
function needsFood(f){return f.h>0&&G.hun<=100-f.h*.5}
function pickFood(){
 const miss=100-G.hun;let best=null,bs=-1e9;
 for(let i=0;i<G.inv.length;i++){
  const s=G.inv[i];if(!s||s.n<=0)continue;
  const it=IT[s.id],f=it&&it.food;if(!f||!needsFood(f))continue;
  const gain=f.h*(HG.cookK?HG.cookK(s.id):1);
  const risky=f.hp?1:0;
  /* puan: riskli olmayan önce; ihtiyacı karşılayanlar arasında en az fazlalık, karşılamayanlar arasında en çok doyuran */
  const over=gain-miss;
  const sc=(risky?-1000:0)+(over>=0?500-over:gain-miss);
  if(sc>bs){bs=sc;best={i,s,f,risky}}
 }
 return best;
}
let eatGap=0;
function quickEat(){
 if(ui.state!=='play'||ui.sleeping||HG.busy||!G.inv)return;
 if(G.head){HG.toast('Su altında yemek yenmez.');return}
 if(performance.now()<eatGap)return;
 const c=pickFood();
 if(!c){HG.toast(G.hun>=90?'Aç değilsin.':'Çantanda yiyecek yok.');return}
 eatGap=performance.now()+450;
 const prev=G.sel;
 G.sel=c.i;                                      /* eatHeld bu kutudaki eşyayı yer */
 try{HG.eatHeld()}finally{G.sel=prev}
 ui.dirty=true;
 HG.feed&&HG.feed('Hızlı ye: '+IT[c.s.id].n);
}
addEventListener('keydown',e=>{
 if(!HG.keyIs||!HG.keyIs('quickeat',e.code))return;
 if(e.repeat)return;
 if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
 if(ui.state!=='play')return;
 quickEat();
});

/* ---------- 3) Eski hayvan artıkları ----------
   Hayvanlar birbirini avladıkça yerde et, kemik, deri ve tüy birikiyordu; hiçbiri kaybolmadığı için
   uzun oturumlarda binlerce eşya her karede taranıyordu. Oyuncudan uzakta kalmış ve uzun süredir
   duran bu artıklar kaldırılır. Oyuncunun yakınındaki veya yeni bırakılan eşyalar etkilenmez. */
const CARRION=new Set(['meat','bone','feather','leather']);
const OLD=420,FAR=36;                            /* saniye · kare */
let cleanT=0,removed=0;
function cleanup(dt){
 cleanT+=dt;if(cleanT<8)return;cleanT=0;
 const L=G.drops;if(!L||L.length<40)return;
 let n=0;
 for(let k=L.length-1;k>=0;k--){
  const d=L[k];
  if(!d||!CARRION.has(d.id)||!(d.age>OLD)||d===G.nearDrop)continue;
  if(Math.hypot(d.x-G.px,d.z-G.py)<FAR)continue;
  L.splice(k,1);n++;
 }
 if(n)removed+=n;
}

/* ---------- 4) Kaydedilmiyor hatırlatması ---------- */
let playT=0,nextRemind=300;
function remind(dt){
 if(HG.coopActive&&HG.coopActive())return;
 playT+=dt;
 if(G.slot){playT=0;nextRemind=300;return}
 if(playT<nextRemind)return;
 nextRemind=playT+900;
 const b=HG.bind&&HG.bind.qsave,k=(b&&HG.keyLabel)?HG.keyLabel(b[0]):'F5';
 HG.toast&&HG.toast('Oyun henüz kaydedilmiyor. '+k+' tuşuyla kaydedin; sonrasında otomatik kayıt başlar.');
}

const u0=HG.update;
HG.update=function(dt){
 const r=u0.apply(this,arguments);
 if(ui.state==='play'&&!ui.sleeping){
  try{warnings(dt);cleanup(dt);remind(dt)}catch(e){try{HG.log&&HG.log('hata','gelistirme.js: '+(e&&e.message||e),'hata')}catch(x){}}
 }
 return r;
};
HG.gelistirme={quickEat,pickFood,durum:()=>({temizlenen:removed,uyari:{hun:W.hun.slice(),warm:W.warm.slice()}})};
})();
