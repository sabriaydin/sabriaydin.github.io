/* Hunger 3D - makro / otomatik tıklama koruması.
   Saldırı hızı tıklama hızına bağlı değildir: darbe aralığı sabittir (HG.atkGate). Ayrıca ardışık tıklama akışı incelenir;
   insan elinin üretemeyeceği hızda veya milisaniye düzeyinde eşit aralıklı tıklamalar algılanırsa saldırı kısa süre kapatılır.
   Özgün dosyalara yalnızca HG.atkGate ve HG.macroBlocked çağrıları eklenmiştir (eylem.js, silah.js). */
(()=>{
'use strict';
const {ui,inp}=HG;
const M=HG.macro={until:0,count:0,why:''};
const ts=[];                                   /* son fare basışlarının zamanları (olay zaman damgası) */
let atkNext=0;                                 /* bir sonraki yakın dövüş vuruşunun en erken zamanı */

const blocked=()=>performance.now()<M.until;
/* Yakın dövüş vuruşu için ortak bekleme: hedef değiştirme, tuşu bırakıp yeniden basma gibi yollarla atlatılamaz */
function atkGate(sec){
 const n=performance.now();
 if(n<M.until||n<atkNext)return false;
 atkNext=n+sec*1000-8;                         /* kare zamanlamasına küçük pay */
 return true;
}

function judge(){
 const n=ts.length;
 /* 1) bir saniyede 10 ve üzeri basış: insan eli için olağan dışı hız */
 const last=ts[n-1];let c=0;
 for(let i=n-1;i>=0&&last-ts[i]<=1000;i--)c++;
 if(c>=10)return 'tıklama hızı';
 /* 2) son 8 aralık 300 ms altında ve birbirine milisaniye düzeyinde eşit: otomatik tıklayıcı */
 if(n>=9){
  const iv=[];for(let i=n-8;i<n;i++)iv.push(ts[i]-ts[i-1]);
  const mean=iv.reduce((a,b)=>a+b,0)/iv.length;
  const sd=Math.sqrt(iv.reduce((a,b)=>a+(b-mean)*(b-mean),0)/iv.length);
  if(mean<300&&sd<3.5)return 'eşit aralıklı tıklama';
 }
 return '';
}

/* Tuval üzerindeki sol tık basışları oyun işleyicilerinden önce (yakalama evresi) denetlenir */
addEventListener('pointerdown',e=>{
 if(e.button!==0||e.pointerType==='touch'||ui.state!=='play')return;
 const tg=e.target;if(!tg||tg.id!=='c')return;
 /* betikle üretilmiş (güvenilmeyen) olaylar yok sayılır */
 if(e.isTrusted===false){e.stopImmediatePropagation();e.preventDefault();return}
 if(blocked()){e.stopImmediatePropagation();e.preventDefault();inp.mouseDown=false;return}
 if(!ui.locked)return;
 ts.push(e.timeStamp);if(ts.length>14)ts.shift();
 const why=judge();
 if(why){
  M.until=performance.now()+4000;M.count++;M.why=why;ts.length=0;
  e.stopImmediatePropagation();e.preventDefault();inp.mouseDown=false;
  HG.toast&&HG.toast('Makro algılandı ('+why+'): saldırı 4 saniye kapatıldı.');
  HG.log&&HG.log('koruma','Makro algılandı: '+why+' (saldırı 4 sn kapalı)','uyari');
 }
},true);

HG.atkGate=atkGate;HG.macroBlocked=blocked;
})();
