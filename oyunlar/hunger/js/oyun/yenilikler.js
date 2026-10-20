/* Hunger 3D - güncelleme 49 oyun mantığı: Hasır Yatak, Kurutma Rafı, Yağmur Varili, Meşale Direği, Av Tuzağı, Ekim Tarlası,
   tavuk ve yumurta, mantar, Dürbün, zırh, zorluk, fotoğraf modu, Şişedeki Mesaj, yeni yetenekler, köylü ticareti ve kamp ganimeti.
   Özgün dosyalara yalnızca küçük kancalar eklenmiştir (HG.useExtra, HG.extHint, HG.extPickupBlock, HG.extGot, HG.extSand, HG.extStart, HG.cookK, HG.diffK). */
(()=>{
'use strict';
const {W,H,T,O,IT,G,ui,Scene,clamp,count,take,add,canAdd,gain,held,flag,daylight,ANIMAL}=HG;
const sc=HG.sc;
const rnd=Math.random,R=(a,b)=>a+rnd()*(b-a);

/* ---------- Şişedeki mesajlar: sahilde kum kazarken nadiren çıkar; Günlük › Kayıtlar bölümünde saklanır ---------- */
const BMSG=[
 {t:'Şişedeki Mesaj · 1',x:'Adaya düştüğümüzde üç kişiydik. Ben kuzeye gidiyorum; sen güneyde kal. Gölgeler denizi geçemiyor, kıyıya yakın dur.'},
 {t:'Şişedeki Mesaj · 2',x:'Kurutma rafı fikrini bir köylüden öğrendim: et gölgede asılınca haftalarca bozulmuyor. Yalnız yağmur altında kurumaz, rafı çatı altına kur.'},
 {t:'Şişedeki Mesaj · 3',x:'Tohumu yaban meyvesinden çıkardım. Tarla küçük ama sabırla bakınca buğday veriyor. Yağmur ekini iki kat hızlı büyütüyor.'},
 {t:'Şişedeki Mesaj · 4',x:'Tavuklar kurtlardan ödü kopacak kadar korkuyor ama otlakta rahat yaşıyor. Yumurtalarını gezinirken bırakıyorlar; çiğ yersen midene dokunur.'},
 {t:'Şişedeki Mesaj · 5',x:'Mantarlar yalnızca ağaç gölgesinde çıkıyor. Çiğ pek doyurmuyor; ateşte pişince ayakta tutuyor. Bir kısmını merhem için sakla.'},
 {t:'Şişedeki Mesaj · 6',x:'Dürbünle denizin ortasında küçük bir ada gördüm, üzerinde duman vardı. Oraya salla gitmek gerekecek.'},
 {t:'Şişedeki Mesaj · 7',x:'Kan Ayı gecesi Meşale Direğinin dibinde oturdum. Işık çemberinin dışında ayak sesleri duydum ama hiçbir şey içeri girmedi.'},
 {t:'Şişedeki Mesaj · 8',x:'Bu son şişe. Adadan kurtulan olursa bizi unutmasın: Kuzey Araştırma Seferi, altı kişi. Biri elinde hâlâ ışık taşıyorsa umut var.'}
];
HG.BMSG=BMSG;

/* ---------- Durum: yapıların içi, bulunan mesajlar, başlangıç işareti (kayıtta saklanır) ---------- */
const mkExt=()=>({s:{},msgs:[],init:0});
const X=()=>G.ext||(G.ext=mkExt());
{
 const pI=HG.progInit,pS=HG.progSave,pL=HG.progLoad;
 HG.progInit=()=>{pI();G.ext=mkExt();if(G.stats)Object.assign(G.stats,{mush:0,eggs:0,harvest:0,dried:0,trapped:0,msgs:0,photos:0})};
 HG.progSave=()=>Object.assign(pS(),{ext:G.ext||mkExt()});
 HG.progLoad=s=>{
  pL(s);
  const e=s&&s.ext&&typeof s.ext==='object'?s.ext:null,x=mkExt();
  if(e){
   x.init=e.init?1:0;
   if(Array.isArray(e.msgs))x.msgs=e.msgs.filter((n,i,a)=>Number.isInteger(n)&&n>=0&&n<BMSG.length&&a.indexOf(n)===i);
   if(e.s&&typeof e.s==='object')for(const k in e.s){const v=e.s[k],i=+k;if(v&&typeof v==='object'&&Number.isInteger(i)&&i>=0&&i<W*H){const c=cleanEnt(v);if(c)x.s[k]=c}}
  }
  G.ext=x;
  if(G.stats)for(const k of ['mush','eggs','harvest','dried','trapped','msgs','photos'])if(!G.stats[k])G.stats[k]=0;
 };
}

/* ---------- Yapı durumları ---------- */
const CAP=8,GROW=300;                       /* varil kapasitesi · ekinin olgunlaşma süresi (sn) */
const DRY={meat:['jerky',150,1],fish:['dfish',120,1],sardine:['dfish',120,1],bass:['dfish',120,1],tuna:['dfish',120,2]};
const STATEFUL=new Set([O.RACK,O.BARREL,O.SNARE,O.PLOT]);
/* Kayıttan okunan yapı durumu doğrulanır: bozuk kayıt döngüyü bozmasın */
function cleanEnt(v){
 const o=v.o,num=(q,d)=>isFinite(q)?+q:d;
 if(o===O.RACK)return Array.isArray(v.it)?{o,it:v.it.filter(q=>q&&IT[q.k]&&isFinite(q.t)).slice(0,4).map(q=>({k:q.k,n:q.n>0?q.n|0:1,t:Math.max(0,+q.t),r:IT[q.r]?q.r:'meat'}))}:null;
 if(o===O.BARREL)return {o,w:clamp(num(v.w,0),0,CAP)};
 if(o===O.SNARE)return {o,t:num(v.t,240),b:v.b?1:0,c:Array.isArray(v.c)?v.c.filter(p=>Array.isArray(p)&&IT[p[0]]&&p[1]>0).map(p=>[p[0],p[1]|0]):null};
 if(o===O.PLOT)return {o,g:Math.min(GROW,num(v.g,-1))};
 return null;
}
function newEnt(o){
 if(o===O.RACK)return {o,it:[]};
 if(o===O.BARREL)return {o,w:0};
 if(o===O.SNARE)return {o,t:Math.round(R(240,420)),b:0,c:null};
 return {o,g:-1};
}
function ent(i,o){
 const x=X();let e=x.s[i];
 if(e&&e.o!==o)e=null;
 if(!e)e=x.s[i]=newEnt(o);
 return e;
}
const COV=new Map();
function covered(i){
 const c=COV.get(i);
 if(c&&Math.abs(G.clock-c.t)<3)return c.v;
 const v=HG.shelterAt(i%W,(i/W)|0);COV.set(i,{t:G.clock,v});return v;
}
function give(id,n,i){
 if(canAdd(id,n)){gain(id,n);return true}
 const x=i%W+.5,z=((i/W)|0)+.5;
 HG.spawnDrop(id,n,{x,z,y:Scene.groundY(x,z)+.6,vx:0,vz:0});HG.toast('Envanter dolu: eşya yere bırakıldı.');
 return false;
}
const roll=()=>{const r=rnd();return r<.5?[['meat',1]]:r<.8?[['meat',1],['leather',1]]:r<.93?[['meat',2],['bone',1]]:[['leather',1],['feather',2]]};
const pct=(a,b)=>Math.max(0,Math.min(100,Math.round(a/b*100)));
function burst(i,c,n){Scene.burst(i%W+.5,Scene.groundY(i%W+.5,((i/W)|0)+.5)+.5,((i/W)|0)+.5,c,n)}

function stepStructs(dt){
 if((HG.netGuest&&HG.netGuest()))return;                              /* co-op: yapı üretimini yalnızca ev sahibi yürütür */
 const x=X(),rain=sc.rain||0;
 for(const k in x.s){
  const e=x.s[k],i=+k;
  if(G.obj[i]!==e.o){delete x.s[k];COV.delete(i);continue}
  if(e.o===O.RACK){
   if(e.it.length&&!(rain>.35&&!covered(i)))for(const q of e.it)if(q.t>0)q.t=Math.max(0,q.t-dt);
  }else if(e.o===O.BARREL){
   if(rain>.3&&e.w<CAP&&!covered(i))e.w=Math.min(CAP,e.w+dt*.07*rain);
  }else if(e.o===O.SNARE){
   if(!e.c){e.t-=dt;if(e.t<=0){e.c=roll();e.t=0}}
  }else if(e.o===O.PLOT){
   if(e.g>=0&&e.g<GROW)e.g=Math.min(GROW,e.g+dt*(rain>.35&&!covered(i)?2:1)*(1+.15*HG.perk('farm')));
  }
 }
}
/* Yakındaki yeni yerleştirilmiş yapıların durumu oluşturulur (güvenlik ağı) */
let scanT=0;
function scanNear(dt){
 scanT-=dt;if(scanT>0)return;scanT=2;
 const x0=Math.floor(G.px),y0=Math.floor(G.py);
 for(let y=Math.max(0,y0-10);y<=Math.min(H-1,y0+10);y++)for(let xx=Math.max(0,x0-10);xx<=Math.min(W-1,x0+10);xx++){
  const o=G.obj[y*W+xx];if(STATEFUL.has(o))ent(y*W+xx,o);
 }
}
/* Artımlı senkron: değişen kareler arasındaki yeni yapılar için durum açılır */
{
 const sc0=Scene.syncCells;
 if(sc0)Scene.syncCells=function(g,cells){for(const i of cells){const o=g.obj[i];if(STATEFUL.has(o))ent(i,o)}return sc0.apply(this,arguments)};
}

/* ---------- E ile etkileşimler (nişan alınan yapıya göre) ---------- */
const ACT={};
ACT[O.BED]=()=>{
 if(daylight()>.35)return false;           /* gündüz: yatak geri alınabilir */
 HG.sleep(true);return true;
};
ACT[O.RACK]=(i,h)=>{
 const e=ent(i,O.RACK),ready=e.it.filter(q=>q.t<=0);
 if(ready.length){
  for(const q of ready)give(q.k,q.n||1,i);
  e.it=e.it.filter(q=>q.t>0);G.stats.dried=(G.stats.dried||0)+ready.length;flag('dried');HG.xpGain(3*ready.length);HG.snd('get');return true;
 }
 if(h&&DRY[h.k]){
  if(e.it.length>=4){HG.toast('Raf dolu.');return true}
  const d=DRY[h.k],k=h.k;take(k,1);e.it.push({k:d[0],n:d[2],t:d[1],r:k});HG.snd('craft');
  HG.toast('Rafa asıldı: '+IT[k].n+'. '+(sc.rain>.35&&!covered(i)?'Yağmur dinince kurumaya başlar.':'Kurumaya başladı.'));return true;
 }
 if(e.it.length){
  const t=e.it.reduce((a,q)=>Math.max(a,q.t),0);
  HG.toast('Kuruyor: '+Math.ceil(t)+' sn kaldı.'+(sc.rain>.35&&!covered(i)?' Yağmur kurumayı durduruyor.':''));return true;
 }
 return false;
};
ACT[O.BARREL]=(i,h)=>{
 const e=ent(i,O.BARREL);
 if(h&&h.k==='bottle'){
  if(e.w<1){HG.toast('Varilde yeterli su yok.');return true}
  if(!canAdd('wbottle',1)){HG.toast('Envanter dolu.');return true}
  take('bottle',1);add('wbottle',1);e.w-=1;HG.snd('splash');HG.toast('Şişe dolduruldu.');flag('barrel_fill');return true;
 }
 if(e.w>=1&&G.thr<96){
  e.w-=1;G.thr=clamp(G.thr+28,0,100);HG.snd('drink');flag('drank');HG.addSan(.5);return true;
 }
 return false;
};
ACT[O.SNARE]=(i,h)=>{
 const e=ent(i,O.SNARE);
 if(e.c){
  for(const [id,n] of e.c)give(id,n,i);
  e.c=null;e.t=Math.round(R(240,420));e.b=0;G.stats.trapped=(G.stats.trapped||0)+1;flag('trapped');HG.xpGain(4);HG.snd('get');return true;
 }
 if(h&&h.k==='berries'&&!e.b){
  take('berries',1);e.b=1;e.t=Math.min(e.t,Math.round(R(70,130)));HG.snd('craft');HG.toast('Yem bırakıldı: av daha çabuk gelir.');return true;
 }
 return false;
};
ACT[O.PLOT]=(i,h)=>{
 const e=ent(i,O.PLOT);
 if(e.g<0){
  if(h&&h.k==='seed'){take('seed',1);e.g=0;HG.snd('craft');burst(i,0x6a4a2a,6);flag('planted');HG.toast('Tohum ekildi.');return true}
  return false;
 }
 if(e.g>=GROW){
  const fm=HG.perk('farm');
  let n=3+(rnd()<.5?1:0)+(fm&&rnd()<.2*fm?1:0);
  give('wheat',n,i);give('seed',1+(rnd()<.5?1:0),i);
  e.g=-1;G.stats.harvest=(G.stats.harvest||0)+1;flag('harvest');HG.xpGain(6);HG.snd('get');burst(i,0xe0bf5a,8);
  return true;
 }
 HG.toast('Ekin büyüyor: %'+pct(e.g,GROW)+'. '+(sc.rain>.35&&!covered(i)?'Yağmur büyümeyi hızlandırıyor.':'Yağmur büyümeyi hızlandırır.'));return true;
};

/* Dürbün: elde tutarken E veya sağ tık yakınlaştırır */
function zoomToggle(){
 sc.zoomOn=!sc.zoomOn;HG.snd('zoom');flag('zoomed');
}
/* Şişedeki mesajı okuma */
function readMsg(){
 const x=X(),left=BMSG.map((_,i)=>i).filter(i=>!x.msgs.includes(i));
 if(!left.length){HG.toast('Bu mesajların hepsini okudun.');return}
 const n=left[(rnd()*left.length)|0];
 take('msg',1);x.msgs.push(n);G.stats.msgs=(G.stats.msgs||0)+1;HG.xpGain(6);HG.snd('quest');
 HG.toast('Mesaj okundu ve Günlük\'e eklendi.');
 HG.toggleJournal(true,'not');
}

HG.useExtra=src=>{
 const h=held(),tg=G.tg;
 let sandAim=false;
 if(tg&&!tg.an&&!G.head){
  const i=tg.y*W+tg.x,o=G.obj[i],f=ACT[o];
  if(f&&f(i,h,src))return true;
  sandAim=!o&&G.tile[i]===T.SAND;
 }
 if(h&&h.it.tool==='spyglass'&&!G.head&&(src==='mouse'||!sandAim)){zoomToggle();return true}
 if(h&&h.k==='msg'){readMsg();return true}
 return false;
};
HG.extHint=(tg,o,h,i)=>{
 const nm=HG.NAMES[o];
 if(o===O.BED)return daylight()<=.35?{hint:'[E] Yatakta uyu',name:nm}:null;
 if(o===O.RACK){
  const e=ent(i,o),ready=e.it.filter(q=>q.t<=0).length,name=nm+' · '+e.it.length+'/4';
  if(ready)return {hint:'[E] Kuruyanları al',name};
  if(h&&DRY[h.k])return e.it.length>=4?{block:'Raf dolu.',name}:{hint:'[E] Asıp kurut: '+h.it.n,name};
  if(e.it.length)return {hint:'[E] Kuruma süresine bak',name};
  return null;
 }
 if(o===O.BARREL){
  const e=ent(i,o),name=nm+' · su '+Math.floor(e.w)+'/'+CAP;
  if(h&&h.k==='bottle')return e.w>=1?{hint:'[E] Şişeyi doldur',name}:{hint:'Varil boş · yağmurla dolar',name};
  if(e.w>=1&&G.thr<96)return {hint:'[E] Su iç · basılı tut: geri al',name};
  return {hint:'Yağmurla dolar · [E] basılı tut: geri al',name};
 }
 if(o===O.SNARE){
  const e=ent(i,o),name=nm+(e.c?' · av var':e.b?' · yemli':' · yemsiz');
  if(e.c)return {hint:'[E] Avı al',name};
  if(h&&h.k==='berries'&&!e.b)return {hint:'[E] Yem bırak (yaban meyvesi)',name};
  return {hint:'Av bekliyor · [E] basılı tut: geri al',name};
 }
 if(o===O.PLOT){
  const e=ent(i,o);
  if(e.g<0)return h&&h.k==='seed'?{hint:'[E] Tohum ek',name:nm}:{hint:'Tohum gerekir · [E] basılı tut: geri al',name:nm};
  if(e.g>=GROW)return {hint:'[E] Hasat et',name:nm+' · olgun'};
  return {hint:'Büyüyor',name:nm+' · %'+pct(e.g,GROW)};
 }
 return null;
};
/* Elde yiyecek varken de raf ve tuzak ipucu görünür (E bu durumda önce yapıya işler); sol tıkla yeme sürer */
HG.extHeldHint=(tg,h)=>{
 if(!tg||tg.an||G.head||!h)return null;
 const i=tg.y*W+tg.x,o=G.obj[i];
 let xh=null;
 if(o===O.RACK){const e=ent(i,o);if(e.it.some(q=>q.t<=0)||DRY[h.k])xh=HG.extHint(tg,o,h,i)}
 else if(o===O.SNARE){const e=ent(i,o);if(e.c||(h.k==='berries'&&!e.b))xh=HG.extHint(tg,o,h,i)}
 return xh&&!xh.block?Object.assign({kind:'eat',need:1.1},xh):xh;
};
/* İçi dolu yapı geri alınamaz */
HG.extPickupBlock=(i,o)=>{
 const e=X().s[i];if(!e||e.o!==o)return false;
 if(o===O.RACK&&e.it.length){HG.toast('Önce raftaki yiyecekleri alın.');return true}
 if(o===O.SNARE&&e.c){HG.toast('Önce yakalanan avı alın.');return true}
 return false;
};
/* Toplama sayaçları */
HG.extGot=(id,n)=>{
 if(!G.stats||!(n>0))return;
 if(id==='mushroom')G.stats.mush=(G.stats.mush||0)+n;
 else if(id==='egg')G.stats.eggs=(G.stats.eggs||0)+n;
};
/* Kum kazarken nadiren sahile vurmuş bir şişe çıkar */
HG.extSand=()=>{
 const x=X();
 if(x.msgs.length+count('msg')>=BMSG.length)return;
 if(rnd()<.03&&gain('msg',1))HG.toast('Kumda mühürlü bir şişe buldun!');
};

/* ---------- Yetenekler, aşçılık ve zorluk ---------- */
HG.PERKS.push(['farm','Çiftçi','Her seviyede ekinler %15 daha hızlı büyür; hasatta %20 ihtimalle fazladan ürün çıkar.',3],
 ['cook','Aşçı','Her seviyede pişmiş, kurutulmuş ve hazırlanmış yiyecekler %12 daha doyurucu olur.',3]);
const COOKED=new Set(['cmeat','cfish','ccrab','cshell','bread','stew','cmush','cegg','jerky','dfish','juice']);
HG.cookK=id=>COOKED.has(id)?1+.12*HG.perk('cook'):1;
const DIFF=[{k:.75,d:.75},{k:1,d:1},{k:1.3,d:1.3}];
const dif=()=>DIFF[+HG.cfg.diff]||DIFF[1];
HG.diffK=()=>dif().k;
{
 const h0=HG.hurt;
 HG.hurt=function(dmg,cause,src,bleedP){
  const fall=/düşerek/.test(cause||'');
  dmg*=(fall?1:1-HG.armorOf())*dif().d;
  return h0.call(this,dmg,cause,src,bleedP);
 };
}

/* ---------- Köylü ticareti ve kamp ganimeti ---------- */
{
 const P=HG.PROF;
 if(P){
  P.farmer.offers.push({give:['seed',4],cost:{berries:2},max:6,ev:[90,200],ch:.7},{give:['bread',2],cost:{coin:3},max:3,ev:[160,320],ch:.5},{give:['egg',3],cost:{wood:2},max:4,ev:[120,260],ch:.6});
  Object.assign(P.farmer.buy,{wheat:2,egg:2,seed:1,mushroom:1,bread:3});
  P.hunter.offers.push({give:['jerky',2],cost:{meat:2},max:4,ev:[120,260],ch:.6},{give:['vest',1],cost:{leather:5},max:1,ev:[700,1200],ch:.3},{give:['spear2',1],cost:{coin:30},max:1,ev:[900,1500],ch:.2});
  Object.assign(P.hunter.buy,{feather:1,jerky:3});
  P.fisher.offers.push({give:['dfish',2],cost:{stone:2},max:4,ev:[120,260],ch:.55},{give:['spyglass',1],cost:{coin:14},max:1,ev:[800,1400],ch:.25});
  Object.assign(P.fisher.buy,{dfish:3});
  P.healer.offers.push({give:['salve',1],cost:{wool:1,mushroom:2},max:3,ev:[160,320],ch:.55},{give:['juice',1],cost:{berries:4},max:2,ev:[140,300],ch:.5});
  Object.assign(P.healer.buy,{mushroom:2,salve:8});
  P.woodcut.offers.push({give:['bed',1],cost:{coin:14},max:1,ev:[800,1400],ch:.25},{give:['barrel',1],cost:{wood:8},max:1,ev:[400,800],ch:.35},{give:['tpost',1],cost:{wood:4,coal:2},max:2,ev:[300,600],ch:.4});
  P.smith.offers.push({give:['iarmor',1],cost:{coin:34},max:1,ev:[1000,1600],ch:.2});
 }
}

/* ---------- Başlangıç: mantarlar ve (eski kayıtlarda) tavuklar bir kez yerleştirilir ---------- */
function seedMush(){
 const r=HG.mulberry32(((G.seed|0)^0x5f3a9c1)>>>0);
 const target=Math.round(W*H/5200);
 let c=0,g=0;
 while(c<target&&g++<target*70){
  const x=3+((r()*(W-6))|0),y=3+((r()*(H-6))|0),i=y*W+x;
  if(G.tile[i]!==T.GRASS||G.obj[i]||G.hgt[i]>3)continue;
  if(Math.hypot(x-G.px,y-G.py)<6)continue;
  let tr=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(G.obj[(y+dy)*W+x+dx]===O.TREE)tr++;
  if(tr<2)continue;
  if((G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<12))continue;
  if(HG.pondNear&&HG.pondNear(G.tile,W,i))continue;
  G.obj[i]=O.SHROOM;c++;
 }
}
function seedChickens(){
 const def=ANIMAL.chicken,want=Math.round(def.want*(G.entSC||W*H/65536)),list=[];
 let g=0;
 while(list.length<want&&g++<want*90){
  const x=2+((rnd()*(W-4))|0),y=2+((rnd()*(H-4))|0),i=y*W+x;
  if(G.tile[i]!==T.GRASS||G.obj[i]||G.hgt[i]>3||Math.hypot(x-G.px,y-G.py)<14)continue;
  if((G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<16))continue;
  if(list.some(q=>Math.hypot(q.x-x,q.z-y)<(def.sp||14)))continue;
  list.push({t:'chicken',x:x+.5,z:y+.5,yaw:rnd()*6.28});
 }
 G.animals.push(...HG.makeAnimals(list));
}
HG.extStart=()=>{
 const x=X();
 if(x.init)return;
 x.init=1;
 seedMush();
 if(!(G.animals||[]).some(a=>a.t==='chicken'))seedChickens();
};

/* ---------- Tavuklar: yumurta ve ara sıra ötme ---------- */
let eggT=0;
function chickens(dt){
 if((HG.netGuest&&HG.netGuest()))return;
 eggT-=dt;if(eggT>0)return;
 const step=1-eggT;eggT=1;
 for(const a of G.animals||[]){
  if(a.t!=='chicken'||a.dying||a.gone)continue;
  const d=Math.hypot(a.x-G.px,a.z-G.py);
  a.eggT=(a.eggT===undefined?R(120,420):a.eggT)-step;
  if(a.eggT<=0){
   if(d<70&&(G.drops||[]).filter(q=>q.id==='egg'&&Math.hypot(q.x-a.x,q.z-a.z)<5).length<2){
    a.eggT=R(320,620);
    HG.spawnDrop('egg',1,{x:a.x,z:a.z,y:Scene.groundY(a.x,a.z)+.35,vx:(rnd()-.5)*.6,vz:(rnd()-.5)*.6});
    HG.snd('call_chicken',{x:a.x,z:a.z});
   }else a.eggT=R(40,100);
  }
  if(d<26&&rnd()<.012)HG.snd('call_chicken',{x:a.x,z:a.z});
 }
}

/* ---------- Fotoğraf modu (P): arayüzü gizler; tıklama veya Enter ile PNG kaydedilir ---------- */
let photo=false,shotReq=false;
const game=document.getElementById('game'),cvs=document.getElementById('c');
function setPhoto(v){
 if(v===photo)return;
 photo=v;if(game)game.classList.toggle('photo',photo);
 if(photo){HG.toast('Fotoğraf modu: tıkla veya Enter ile kaydet · P ile çık.');A_stop()}
}
function A_stop(){HG.inp.mouseDown=false;HG.inp.touchAct=false;HG.stopAction&&HG.stopAction()}
function flash(){
 if(!game)return;
 const d=document.createElement('div');d.style.cssText='position:absolute;inset:0;background:#fff;opacity:.85;pointer-events:none;z-index:60;transition:opacity .35s';
 game.appendChild(d);requestAnimationFrame(()=>{d.style.opacity='0'});setTimeout(()=>d.remove(),500);
}
function capture(){
 try{
  cvs.toBlob(b=>{
   if(!b){HG.toast('Fotoğraf alınamadı.');return}
   const a=document.createElement('a'),n=new Date(),p=v=>String(v).padStart(2,'0');
   a.href=URL.createObjectURL(b);a.download='hunger-'+n.getFullYear()+p(n.getMonth()+1)+p(n.getDate())+'-'+p(n.getHours())+p(n.getMinutes())+p(n.getSeconds())+'.png';
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  },'image/png');
  G.stats.photos=(G.stats.photos||0)+1;flag('photo');HG.snd('shutter');flash();HG.toast('Fotoğraf kaydedildi.');
 }catch(e){HG.toast('Fotoğraf alınamadı.')}
}
{
 const r0=Scene.render;
 Scene.render=function(){const r=r0.apply(this,arguments);if(shotReq){shotReq=false;capture()}return r};
 const busy=()=>['#panel','#jr','#gd','#sv','#trade','#bigmap','#set'].some(s=>{const el=document.querySelector(s);return el&&!el.hidden});
 addEventListener('keydown',e=>{
  if(e.repeat||ui.state!=='play')return;
  if(HG.keyCapturing&&HG.keyCapturing())return;
  if(e.code==='Escape'&&photo){setPhoto(false);return}
  if(busy())return;
  if(HG.keyIs('photo',e.code))setPhoto(!photo);
  else if(photo&&(e.code==='Enter'||e.code==='NumpadEnter'))shotReq=true;
 });
 if(cvs)cvs.addEventListener('pointerdown',e=>{
  if(!photo||ui.state!=='play')return;
  e.stopImmediatePropagation();
  if(!ui.locked){HG.lock&&HG.lock();return}
  if(e.button===0)shotReq=true;
 },true);
 const oa=HG.onActPress,uh=HG.useHeld,sa=HG.stepAction;
 HG.onActPress=function(){if(photo)return;return oa.apply(this,arguments)};
 HG.useHeld=function(){if(photo){shotReq=true;return}return uh.apply(this,arguments)};
 HG.stepAction=function(dt){if(photo){A_stop();return}return sa.call(this,dt)};
}

/* ---------- Kare güncellemesi ---------- */
{
 const u0=HG.update;
 let err=false;
 HG.update=function(dt){
  u0.call(this,dt);
  if(ui.state!=='play')return;
  try{
   if(photo)A_stop();
   const h=held();
   if(sc.zoomOn&&(!h||h.it.tool!=='spyglass'||G.head))sc.zoomOn=false;
   sc.zoomK=(sc.zoomK||0)+((sc.zoomOn?1:0)-(sc.zoomK||0))*Math.min(1,9*dt);
   if(sc.zoomK<.002&&!sc.zoomOn)sc.zoomK=0;
   stepStructs(dt);scanNear(dt);chickens(dt);
  }catch(e){if(!err){err=true;console.error('yenilikler',e)}}
 };
}

/* ---------- Günlük: istatistik satırları ve Şişedeki Mesaj kayıtları ---------- */
HG.extStatRows=s=>[['Toplanan mantar',s.mush||0],['Toplanan yumurta',s.eggs||0],['Yapılan hasat',s.harvest||0],['Kurutulan yiyecek',s.dried||0],['Tuzakla yakalanan av',s.trapped||0],['Bulunan şişe mesajı',X().msgs.length+'/'+BMSG.length],['Alınan fotoğraf',s.photos||0]];
HG.extNotesHtml=esc=>{
 const x=X();
 let h=`<p class="mut">Şişedeki mesaj: ${x.msgs.length}/${BMSG.length}. Sahilde kum kazarken nadiren çıkar.</p>`;
 for(const i of x.msgs)h+=`<div class="nt"><b>${esc(BMSG[i].t)}</b><span>${esc(BMSG[i].x)}</span></div>`;
 return h;
};
})();
