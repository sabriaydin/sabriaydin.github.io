/* Hunger 3D - hile koruması (güncelleme 70).
   Üç katman:
   1) Yerel denetim: can/dayanıklılık/akıl üst sınırı, yığın sınırını aşan veya tanınmayan eşya, sürekli olağan dışı
      hız, zeminden kopuk (uçan) oyuncu ve geriye akan saat düzenli aralıkla denetlenir; bulunan bozukluk düzeltilir.
   2) Kayıt bütünlüğü: her kayda imza (`ck`) yazılır; elle düzenlenmiş kayıt yüklenince dünya "işaretli" olur.
   3) Co-op: ev sahibi, konuğun konum, hasar ve eşya alma paketlerini doğrular; sınır dışı paket geri alınır,
      ısrar eden oyuncu oyundan çıkarılır.
   İşaretli dünyada yeni başarım açılmaz. Makro/otomatik tıklama koruması ayrı dosyadadır (js/oyun/koruma.js). */
(()=>{
'use strict';
const {G,ui,IT}=HG;
const net=HG.net;
const CH=HG.cheat={n:0,why:'',marked:false,net:{}};

function mark(why,quiet){
 CH.n++;CH.why=why;
 if(!G.cheat){
  G.cheat=1;CH.marked=true;
  if(!quiet){
   HG.toast&&HG.toast('Dürüstlük denetimi: olağan dışı durum düzeltildi ('+why+'). Bu dünyada yeni başarım açılmaz.');
   HG.snd&&HG.snd('ui');
  }
 }
 HG.log&&HG.log('koruma','Hile denetimi: '+why,'uyari');
}
HG.cheatMark=mark;

/* ============================================================ 1) Yerel denetim ============================================================ */
const LIM={hp:100,stam:100,san:100,warm:100,hun:100,thr:100,o2:100};
let acc=0,grace=3,fastT=0,flyT=0,lastX=0,lastY=0,lastT=0,lastClock=0;

function audit(dt){
 /* yükleme, ölüm, mağara geçişi ve uyku sonrası kısa süre denetim yapılmaz (konum yasal olarak sıçrar) */
 if(HG.busy||ui.state!=='play'||ui.sleeping){grace=1.2;lastT=0;return}
 if(grace>0){grace-=dt;lastT=0;lastClock=G.clock;return}
 let bad='';
 /* a) durum çubukları */
 for(const k in LIM){
  const v=G[k];
  if(typeof v==='number'&&(!isFinite(v)||v>LIM[k]+.6)){G[k]=LIM[k];bad=bad||'durum değeri'}
 }
 if(typeof G.lvl==='number'&&(G.lvl>60||G.lvl<1)){G.lvl=Math.max(1,Math.min(60,G.lvl|0));bad=bad||'seviye'}
 /* b) çanta: tanınmayan eşya veya yığın sınırını aşan kutu */
 if(Array.isArray(G.inv)){
  for(const s of G.inv){
   if(!s)continue;
   const it=IT[s.id];
   if(!it){s.id=null;s.n=0;bad=bad||'tanınmayan eşya';continue}
   if(!(s.n>0)){s.id=null;s.n=0;continue}
   const mx=it.s||1;
   if(s.n>mx){s.n=mx;bad=bad||'yığın sınırı'}
  }
 }
 /* c) hız: anlık sıçrama değil, sürekli olağan dışı hız aranır */
 const now=performance.now()/1000;
 if(lastT){
  const d=Math.hypot(G.px-lastX,G.py-lastY),el=Math.max(.001,now-lastT);
  const v=d/el,max=(G.onRaft?7.5:9.5)+(G.cave?8:0);
  if(v>max&&el<1.5)fastT+=el;else fastT=Math.max(0,fastT-el*2);
  if(fastT>1.4){fastT=0;bad=bad||'hareket hızı'}
 }
 lastX=G.px;lastY=G.py;lastT=now;
 /* d) uçma: zemin veya yapı desteği olmadan havada durmak */
 if(!G.air&&!G.swim&&!G.onRaft&&G.pz!==undefined&&HG.supportY){
  const sy=HG.supportY(G.px,G.py,G.pz);
  if(G.pz>sy+1.2)flyT+=dt;else flyT=0;
  if(flyT>2){flyT=0;G.pz=sy;bad=bad||'zeminle bağ'}
 }else flyT=0;
 /* e) saat: geriye akan veya sıçrayan oyun saati */
 if(lastClock&&(G.clock<lastClock-.5||G.clock>lastClock+90)){bad=bad||'oyun saati'}
 lastClock=G.clock;
 if(bad)mark(bad);
}

/* ============================================================ 2) Kayıt bütünlüğü ============================================================ */
/* Kısa, hızlı imza: alan adlarına değil değerlere bakar; kaydı elle düzenleyen imzayı yeniden üretemez. */
function hashStr(s){
 let h=0x811c9dc5;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h+((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)))>>>0}
 return h>>>0;
}
function ckOf(s){
 const inv=Array.isArray(s.inv)?s.inv.map(k=>k&&k.id?k.id+':'+k.n:'-').join(','):'';
 const fl=s.flags&&typeof s.flags==='object'?Object.keys(s.flags).length:0;
 const parts=[s.seed,Math.round((s.px||0)*8),Math.round((s.py||0)*8),Math.round(s.hp||0),Math.round(s.hun||0),
  Math.round(s.thr||0),Math.round(s.clock||0),fl,inv,(s.prog&&s.prog.lvl)||0,(s.prog&&s.prog.xp)||0,s.ic?1:0];
 return hashStr('hg7|'+parts.join('|')).toString(36);
}
{
 const s0=HG.snapshotRaw;
 if(s0)HG.snapshotRaw=function(name){
  const s=s0.apply(this,arguments);
  try{s.ic=G.cheat?1:0;s.ck=ckOf(s)}catch(e){}
  return s;
 };
}
let suspect=false;
{
 /* startGame kendi iç readSlot'unu kullandığı için kayıt, oyun kurulmadan önce burada ayrıca okunup imzası denetlenir */
 const g0=HG.startGame;
 if(g0)HG.startGame=async function(load,slotId){
  suspect=false;
  try{
   if(load&&!HG.netSnap&&HG.listSlots&&HG.readSlot){
    const ls=HG.listSlots()||[],pick=slotId?ls.find(x=>x.id===slotId):ls[0];
    const s=pick?HG.readSlot(pick.id):null;
    if(s&&typeof s==='object'){
     if(typeof s.ck==='string')suspect=(ckOf(s)!==s.ck);        /* imzasız eski kayıtlar hoş görülür */
     if(s.ic)suspect=true;
    }
   }
  }catch(e){suspect=false}
  const r=await g0.apply(this,arguments);
  try{
   if(load&&suspect){
    G.cheat=1;CH.marked=true;
    HG.toast&&HG.toast('Bu kayıt dışarıdan düzenlenmiş görünüyor: dünya işaretlendi, yeni başarım açılmaz.');
    HG.log&&HG.log('koruma','Kayıt imzası tutmuyor','uyari');
   }
  }catch(e){}
  grace=3;
  return r;
 };
}
/* İşaretli dünyada başarım açılmaz */
{
 const c0=HG.checkAch;
 if(c0)HG.checkAch=function(){if(G.cheat)return false;return c0.apply(this,arguments)};
}

/* Hasar tavanı: en güçlü silah bile bu değerin altındadır; aşan her çağrı kırpılır.
   Bu kırpma hasar uygulanmadan önce çalışır, böylece hileli bir vuruş hayvanı tek seferde öldüremez. */
const DMG_CAP=(()=>{
 try{const D=HG.DMG;let mx=D.arrowMax||60;for(const k in D.item)mx=Math.max(mx,D.item[k]);return Math.max(60,mx*1.35+5)}catch(e){return 90}
})();
{
 const hi0=HG.hitAnimal;
 if(hi0)HG.hitAnimal=function(a,dmg,hit){
  if(typeof dmg==='number'&&(!isFinite(dmg)||dmg>DMG_CAP)){
   HG.log&&HG.log('koruma','Hasar tavanı uygulandı: '+dmg,'uyari');
   dmg=DMG_CAP;
  }
  return hi0.call(this,a,dmg,hit);
 };
}

/* ============================================================ 3) Co-op doğrulaması ============================================================ */
const isHost=()=>!!(HG.coop&&HG.coop.mode==='host');
function peerState(P){
 const id=(P&&P.id)||'?';
 return CH.net[id]||(CH.net[id]={bad:0,x:0,z:0,t:0,hits:[],last:0,warn:0});
}
function strike(P,why,max){
 const st=peerState(P);
 st.bad++;
 HG.log&&HG.log('koruma','Co-op doğrulama ('+((P&&P.name)||'oyuncu')+'): '+why+' ×'+st.bad,'uyari');
 if(st.bad===Math.ceil((max||8)/2))HG.toast&&HG.toast(((P&&P.name)||'Oyuncu')+': olağan dışı veri (' +why+ ').');
 if(st.bad>=(max||8)){
  st.bad=0;
  HG.toast&&HG.toast(((P&&P.name)||'Oyuncu')+' doğrulamayı geçemedi ve oyundan çıkarıldı ('+why+').');
  try{net.kick&&net.kick(P)}catch(e){}
 }
}
if(net&&net.on){
 /* a) Konum: ev sahibi, konuğun iki paket arasında kat edebileceği en büyük mesafeyi denetler.
       Sınırı aşan paket geri alınır (oyuncu son geçerli yerinde kalır). */
 net.on('p',(m,P)=>{
  if(!isHost()||!P||!P.rec)return;
  const r=P.rec,st=peerState(P),t=performance.now();
  if(!st.t||t-st.t>3000||(r.fl&(net.FL.DD|net.FL.SL))){st.t=t;st.x=r.x;st.z=r.z;return}
  const el=Math.max(.02,(t-st.t)/1000),d=Math.hypot(r.x-st.x,r.z-st.z);
  const max=(9.5+2)*el+.6;                                   /* en hızlı koşu + pay */
  if(d>max){
   r.x=st.x;r.z=st.z;r.rx=st.x;r.rz=st.z;                     /* paket yok sayılır */
   strike(P,'ışınlanma',10);
  }else{st.x=r.x;st.z=r.z}
  st.t=t;
 });
 /* b) Hasar: tek vuruşun üst sınırı, mesafe ve saniyedeki vuruş sayısı denetlenir; fazlası hayvana geri verilir */
 net.on('hit',(m,P)=>{
  if(!isHost()||!P||!P.rec)return;
  const d=+m.d;if(!(d>0))return;
  const st=peerState(P),t=performance.now();
  st.hits=st.hits.filter(x=>t-x<1000);st.hits.push(t);
  let why='';
  if(st.hits.length>7)why='vuruş sıklığı';
  if(d>140)why=why||'hasar miktarı';
  const a=(G.animals||[]).find(q=>q.id===m.id);
  if(a&&Math.hypot(a.x-P.rec.x,a.z-P.rec.z)>60)why=why||'vuruş mesafesi';
  if(!why)return;
  if(a&&!a.dying){const def=HG.ANIMAL[a.t];const cap=Math.min(d,40);a.hp=Math.min(def&&def.hp?def.hp:100,a.hp+(d-cap))}   /* fazla hasar geri alınır */
  strike(P,why,8);
 });
 /* c) Eşya alma: yerdeki eşyanın oyuncuya uzaklığı denetlenir (son konumları ayrı tutulur) */
 const dropPos=new Map();
 net.on('pk',(m,P)=>{
  if(!isHost()||!P||!P.rec)return;
  const d=dropPos.get(m.u);
  if(d&&Math.hypot(d.x-P.rec.x,d.z-P.rec.z)>6.5)strike(P,'eşya alma mesafesi',6);
 });
 /* yerdeki eşyaların konumu her saniye anlık olarak saklanır (paket geldiğinde eşya listeden çıkmış olur) */
 setInterval(()=>{
  if(!isHost())return;
  dropPos.clear();
  for(const q of G.drops||[])if(q&&q.u!==undefined)dropPos.set(q.u,{x:q.x,z:q.z});
 },700);
}

/* ---- kare ---- */
const u0=HG.update;
HG.update=function(dt){
 const r=u0.apply(this,arguments);
 acc+=dt;
 if(acc>=.5){const d=acc;acc=0;try{audit(d)}catch(e){}}
 return r;
};
})();
