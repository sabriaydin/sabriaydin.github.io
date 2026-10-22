/* Hunger 3D - büyük güncelleme (51) oyun mantığı I: ortak durum (G.x2), Depo Sandığı, Tabela, Arı Kovanı, Balık Kapanı, yabani arı kovanı,
   Kürek ve hazine avı, harita işaretleri, ölüm ve yeniden doğma (cenaze çantası) ile dünya kodu.
   Özgün dosyalara dokunmaz; yalnızca yenilikler.js'in kancalarını (useExtra, extHint, extHeldHint, extPickupBlock, extGot, extSand, extStart) zincirler.
   Çok oyunculuya hazırlık: tüm durum G.x2 içindedir, değişiklikler HG.journal'a yazılır, konum sorguları HG.nearestPlayer ile yapılır. */
(()=>{
'use strict';
const {W,H,T,O,IT,G,ui,Scene,clamp,count,take,add,canAdd,gain,held,setObj,flag,PLACE_ITEM}=HG;
const sc=HG.sc,rnd=Math.random,R=(a,b)=>a+rnd()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1));
const CHEST_N=24;                                    /* depo kutusu sayısı: çanta kadar (cenaze çantası tüm çantayı alır) */

/* ---------- Ortak durum: G.x2 (kayıtla birlikte saklanır). Alt sistemler kendi alanlarını HG.x2reg ile kaydeder ---------- */
const REG={};
HG.x2reg=(k,def,clean)=>{REG[k]={def,clean}};
const X=()=>{
 const x=G.x2||(G.x2={});
 if(x.n===undefined)x.n=0;if(x.init===undefined)x.init=0;
 for(const k in REG)if(x[k]===undefined)x[k]=REG[k].def();
 return x;
};
HG.X2=X;
HG.x2stats=['honey','trapfish','treasure','deaths','digs'];                 /* G.stats'a eklenen sayaçlar (diğer dosyalar ekler) */
HG.x2seeds=[];HG.x2starts=[];HG.x2save=[];                                /* başlangıç tohumlamaları · her başlangıç · kayıt öncesi eşitleme */
HG.x2act={};HG.x2held={};HG.x2hint={};                                      /* yapıya E · eşyaya E · yapı ipucu kayıtları */
const num=(v,d)=>isFinite(v)?+v:d;
const ensureStats=()=>{if(G.stats)for(const k of HG.x2stats)if(!(G.stats[k]>0))G.stats[k]=0};

/* ---------- Yapı durumları: G.x2.s[kare] ---------- */
const STATEFUL=new Set([O.CHEST,O.SIGN,O.APIARY,O.FTRAP,O.HIVEW]);
function cleanFish(c){return Array.isArray(c)?c.filter(p=>Array.isArray(p)&&IT[p[0]]&&p[1]>0).map(p=>[p[0],p[1]|0]):null}
function cleanEnt(v){
 if(!v||typeof v!=='object')return null;
 const o=v.o;
 if(o===O.CHEST){
  const it=Array(CHEST_N).fill(null);
  if(Array.isArray(v.it))for(let k=0;k<CHEST_N;k++){const q=v.it[k];if(q&&IT[q.id]&&q.n>0)it[k]=Object.assign({id:q.id,n:Math.min(IT[q.id].s,q.n|0)},q.d>0&&HG.BAL.dur[q.id]?{d:Math.round(q.d)}:{})}
  return {o,it,gr:v.gr?1:0,t:num(v.t,0)};
 }
 if(o===O.SIGN)return {o,tx:typeof v.tx==='string'?v.tx.slice(0,48):''};
 if(o===O.APIARY)return {o,a:clamp(num(v.a,0),0,100),h:clamp(v.h|0,0,6),c:clamp(v.c|0,0,4),k:v.k|0};
 if(o===O.HIVEW)return {o,at:num(v.at,0)};
 if(o===O.FTRAP)return {o,t:num(v.t,260),b:v.b?1:0,c:cleanFish(v.c)};
 return null;
}
function newEnt(o){
 if(o===O.CHEST)return {o,it:Array(CHEST_N).fill(null),gr:0,t:0};
 if(o===O.SIGN)return {o,tx:''};
 if(o===O.APIARY)return {o,a:0,h:0,c:0,k:0};
 if(o===O.HIVEW)return {o,at:0};
 return {o,t:Math.round(R(200,360)),b:0,c:null};
}
function ent(i,o){
 const x=X();let e=x.s[i];
 if(e&&e.o!==o)e=null;
 if(!e)e=x.s[i]=newEnt(o);
 return e;
}
HG.x2ent=ent;
HG.x2reg('s',()=>({}),v=>{
 const out={};
 if(v&&typeof v==='object')for(const k in v){const i=+k;if(Number.isInteger(i)&&i>=0&&i<W*H){const c=cleanEnt(v[k]);if(c)out[k]=c}}
 return out;
});
HG.x2reg('home',()=>null,v=>v&&isFinite(v.x)&&isFinite(v.z)?{x:+v.x,z:+v.z}:null);
HG.x2reg('spawn',()=>null,v=>v&&Number.isInteger(v.i)&&v.i>=0&&v.i<W*H?{i:v.i}:null);
HG.x2reg('marks',()=>[],v=>Array.isArray(v)?v.filter(m=>m&&isFinite(m.x)&&isFinite(m.z)&&(m.k==='m'||m.k==='t')).slice(0,8).map(m=>({k:m.k,x:+m.x,z:+m.z,r:m.k==='t'?clamp(num(m.r,18),6,40):0,q:Number.isInteger(m.q)?m.q:-1})):[]);
HG.x2reg('tr',()=>[],v=>Array.isArray(v)?v.filter(q=>q&&isFinite(q.x)&&isFinite(q.z)).slice(0,60).map(q=>({x:+q.x,z:+q.z,f:q.f?1:0})):[]);
{
 const pI=HG.progInit,pS=HG.progSave,pL=HG.progLoad;
 HG.progInit=()=>{pI();const x=G.x2={n:0,init:0};for(const k in REG)x[k]=REG[k].def();ensureStats()};
 HG.progSave=()=>{for(const f of HG.x2save)try{f()}catch(e){console.error('x2save',e)}return Object.assign(pS(),{x2:X()})};
 HG.progLoad=s=>{
  pL(s);
  const e=s&&s.x2&&typeof s.x2==='object'?s.x2:{},x={n:Number.isInteger(e.n)&&e.n>=0?e.n:0,init:e.init?1:0};
  for(const k in REG)x[k]=REG[k].clean(e[k]);
  G.x2=x;ensureStats();
 };
}

/* ---------- Yardımcılar ---------- */
function give(id,n,i){
 if(canAdd(id,n)){gain(id,n);return true}
 const x=i%W+.5,z=((i/W)|0)+.5;
 HG.spawnDrop(id,n,{x,z,y:Scene.groundY(x,z)+.6,vx:0,vz:0});HG.toast('Envanter dolu: eşya yere bırakıldı.');
 return false;
}
HG.x2give=give;
const stat=(k,n)=>{if(G.stats)G.stats[k]=(G.stats[k]||0)+(n===undefined?1:n)};
const idxOf=(x,z)=>Math.floor(z)*W+Math.floor(x);
const villageNear=(x,y,r)=>(G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<r);
function treesAround(x,y,r){let n=0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const k=(y+dy)*W+x+dx;if(k>=0&&k<W*H&&G.obj[k]===O.TREE)n++}return n}
function burst(i,c,n){const x=i%W+.5,z=((i/W)|0)+.5;Scene.burst(x,Scene.groundY(x,z)+.5,z,c,n)}
const torchLit=()=>{const h=held();return !!(h&&h.it.tool==='torch'&&G.torchLit)};
/* Arı sokması: elde yanan meşale veya Arıcı yeteneği korur */
function sting(src){
 if(torchLit())return false;
 const lv=HG.perk('beek');
 if(lv&&rnd()<.34*lv)return false;
 HG.hurt(6,'Arı sokmasından öldün.',src,0);HG.toast('Arılar soktu! Elde yanan meşale koruyucudur.');
 return true;
}
const bee=()=>HG.seasonBee?HG.seasonBee():1;

/* ---------- Yapıların zamanla işleyişi ---------- */
const TH=40;                                           /* kovanda bir ürün için gereken birim */
function nearBushes(e,i){
 if(e.nbT>G.clock-30&&e.nb!==undefined)return e.nb;
 let n=0;const x0=i%W,y0=(i/W)|0;
 for(let y=y0-5;y<=y0+5;y++)for(let x=x0-5;x<=x0+5;x++){if(x<0||y<0||x>=W||y>=H)continue;const o=G.obj[y*W+x];if(o===O.BUSH||o===O.BUSH0)n++}
 e.nb=n;e.nbT=G.clock;return n;
}
function fishRoll(i){
 const x0=i%W,y0=(i/W)|0;let sea=false,pond=false;
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const t=G.tile[(y0+dy)*W+x0+dx];if(t===T.POND)pond=true;else if(t<=T.SHAL)sea=true}
 if(sea){
  const r=rnd(),out=[];
  out.push(r<.34?['sardine',RI(1,3)]:r<.62?['fish',RI(1,2)]:r<.8?['bass',1]:r<.95?['crab',RI(1,2)]:['tuna',1]);
  if(rnd()<.3)out.push(rnd()<.5?['shell',RI(1,2)]:['kelp',1]);
  return out;
 }
 return [['fish',pond?RI(1,3):1]];
}
function stepStructs(dt){
 if(G.cave||(HG.netGuest&&HG.netGuest()))return;                 /* co-op: yapı üretimini yalnızca ev sahibi yürütür */
 const x=X(),rain=sc.rain||0,L=HG.daylight();
 for(const k in x.s){
  const e=x.s[k],i=+k;
  if(G.obj[i]!==e.o){delete x.s[k];continue}
  if(e.o===O.APIARY){
   const dayK=L>.45?1:L>.25?.3:0,wet=rain>.3?0:1;
   if(!dayK||!wet||(e.h>=6&&e.c>=4))continue;
   const rate=dayK*(.45+Math.min(8,nearBushes(e,i))*.07)*bee()*(1+.2*HG.perk('beek'));
   e.a+=rate*dt;
   while(e.a>=TH){
    e.a-=TH;e.k=(e.k|0)+1;
    if(e.k%3===0&&e.c<4)e.c++;else if(e.h<6)e.h++;else if(e.c<4)e.c++;else{e.a=0;break}
   }
  }else if(e.o===O.FTRAP){
   if(!e.c){e.t-=dt;if(e.t<=0){e.c=fishRoll(i);e.t=0}}
  }
 }
}
let scanT=0;
function scanNear(dt){
 scanT-=dt;if(scanT>0||G.cave)return;scanT=3;
 const x0=Math.floor(G.px),y0=Math.floor(G.py);
 for(let y=Math.max(0,y0-12);y<=Math.min(H-1,y0+12);y++)for(let xx=Math.max(0,x0-12);xx<=Math.min(W-1,x0+12);xx++){
  const o=G.obj[y*W+xx];if(o===O.APIARY||o===O.FTRAP||o===O.CHEST)ent(y*W+xx,o);
 }
}

/* ---------- Geri alma: içi dolu yapılar alınamaz ---------- */
function pickStruct(i){
 const o=G.obj[i],id=PLACE_ITEM[o];
 if(!id||(HG.extPickupBlock&&HG.extPickupBlock(i,o)))return false;
 if(!gain(id,1))return false;
 setObj(i,O.NONE);delete X().s[i];G.shelterCheck=0;HG.snd('craft');
 return true;
}
HG.x2pick=pickStruct;
const chestCount=e=>e.it.reduce((a,q)=>a+(q?1:0),0);
HG.x2chestCount=chestCount;
{
 const p0=HG.extPickupBlock;
 HG.extPickupBlock=(i,o)=>{
  const e=X().s[i];
  if(e&&e.o===o){
   if(o===O.CHEST){
    if(e.gr){HG.toast('Cenaze çantası taşınamaz; eşyalarını alın.');return true}
    if(chestCount(e)){HG.toast('Önce sandığı boşaltın.');return true}
   }
   if(o===O.APIARY&&(e.h||e.c)){HG.toast('Önce kovandaki ürünü alın.');return true}
   if(o===O.FTRAP&&e.c){HG.toast('Önce yakalananı alın.');return true}
  }
  return p0?p0(i,o):false;
 };
}

/* ---------- E ile etkileşimler ---------- */
const ACT=HG.x2act,HINT=HG.x2hint;
ACT[O.CHEST]=i=>{ent(i,O.CHEST);if(HG.openStore){HG.openStore(i);return true}return false};
/* El Taşı: ücretsiz tarif kaldırıldı. Elinde hiç alet (El Taşı, balta, kazma) olmayan oyuncu E ile yerdeki bir kayadan taş toplar; kaya başına günde bir kez */
HG.x2reg('rl',()=>({}),v=>{const o={};let n=0;if(v&&typeof v==='object')for(const k in v){const i=+k;if(Number.isInteger(i)&&i>=0&&i<W*H&&Number.isInteger(v[k])&&n++<300)o[i]=v[k]}return o});
const hasTool=()=>G.inv.some(s=>s&&IT[s.id]&&(IT[s.id].tool==='axe'||IT[s.id].tool==='pick'||s.id==='rock'));
const looseBusy=i=>X().rl[i]===HG.dayNo();
ACT[O.ROCK]=i=>{
 if(hasTool())return false;
 if(looseBusy(i)){HG.toast('Bu kayada uygun taş kalmadı; yarın tekrar bakın.');return true}
 if(!canAdd('rock',1)){HG.toast('Çanta dolu.');return true}
 const x=X(),d=HG.dayNo();
 for(const k in x.rl)if(x.rl[k]!==d)delete x.rl[k];
 x.rl[i]=d;gain('rock',1);HG.snd('get');HG.toast('Kayadan elverişli bir taş kopardın: El Taşı.');flag('looserock');
 HG.journal&&HG.journal.push('x2',{k:'rock',i});
 return true;
};
HG.extBare=(o,i)=>{
 if(o!==O.ROCK||hasTool())return null;
 return looseBusy(i)?{block:'Bu kayada uygun taş kalmadı; yarın tekrar bakın.',name:HG.NAMES[o]}:{hint:'[E] Yerden El Taşı topla',name:HG.NAMES[o]};
};
ACT[O.SIGN]=i=>{ent(i,O.SIGN);if(HG.openSign){HG.openSign(i);return true}return false};
ACT[O.APIARY]=i=>{
 const e=ent(i,O.APIARY);
 if(!e.h&&!e.c)return false;                          /* boşsa E basılı tutulunca geri alınır */
 const st=sting({x:i%W+.5,z:((i/W)|0)+.5});
 if(e.h){give('honey',e.h,i);stat('honey',e.h)}
 if(e.c)give('comb',e.c,i);
 HG.xpGain(2*(e.h+e.c));flag('honeyfarm');HG.snd('get');burst(i,0xe8b030,5);
 e.h=0;e.c=0;e.a=0;
 HG.journal&&HG.journal.push('x2',{k:'apiary',i});
 return true;
};
ACT[O.HIVEW]=i=>{
 const e=ent(i,O.HIVEW);
 if(G.clock<e.at){HG.toast('Kovan boş: arılar yeniden bal yapıyor.');return true}
 sting({x:i%W+.5,z:((i/W)|0)+.5});
 const h=RI(2,3),c=RI(1,2);
 give('honey',h,i);give('comb',c,i);stat('honey',h);flag('wildhive');
 e.at=G.clock+420;HG.xpGain(5);HG.snd('get');burst(i,0xe8b030,8);
 HG.journal&&HG.journal.push('x2',{k:'hive',i});
 return true;
};
const BAIT=['berries','shell','kelp'];
ACT[O.FTRAP]=(i,h)=>{
 const e=ent(i,O.FTRAP);
 if(e.c){
  for(const [id,n] of e.c){give(id,n,i);stat('trapfish',n)}
  e.c=null;e.t=Math.round(R(200,360));e.b=0;flag('trapfish');HG.xpGain(4);HG.snd('get');
  HG.journal&&HG.journal.push('x2',{k:'ftrap',i});
  return true;
 }
 if(h&&BAIT.includes(h.k)&&!e.b){
  take(h.k,1);e.b=1;e.t=Math.min(e.t,Math.round(R(80,140)));HG.snd('craft');HG.toast('Yem bırakıldı: kapan daha çabuk dolar.');return true;
 }
 return false;
};
HINT[O.CHEST]=i=>{const e=X().s[i];if(!e||e.o!==O.CHEST)return {hint:'[E] Aç',name:HG.NAMES[O.CHEST]};return e.gr?{hint:'[E] Eşyalarını geri al',name:'Cenaze çantası · '+chestCount(e)+' eşya'}:{hint:'[E] Aç',name:HG.NAMES[O.CHEST]+' · '+chestCount(e)+'/'+CHEST_N}};
HINT[O.SIGN]=i=>{const e=X().s[i],t=e&&e.tx?'“'+(e.tx.length>34?e.tx.slice(0,33)+'…':e.tx)+'”':'boş';return {hint:'[E] Yaz / düzenle',name:'Tabela · '+t}};
HINT[O.APIARY]=i=>{
 const e=ent(i,O.APIARY),nm='Arı kovanı · bal '+e.h+'/6 · balmumu '+e.c+'/4';
 if(e.h||e.c)return {hint:'[E] Ürünü al'+(torchLit()?'':' · elde yanan meşale sokmayı önler'),name:nm};
 const L=HG.daylight(),why=(sc.rain||0)>.3?'Yağmur: üretim durdu':L<=.25?'Gece: arılar dinleniyor':'Arılar çalışıyor';
 return {hint:why+' · [E] basılı tut: geri al',name:nm};
};
HINT[O.HIVEW]=i=>{
 const e=ent(i,O.HIVEW);
 return G.clock>=e.at?{hint:'[E] Bal topla'+(torchLit()?'':' · arılar sokabilir (meşale korur)'),name:HG.NAMES[O.HIVEW]}:{hint:'Boş · arılar yeniden dolduruyor',name:HG.NAMES[O.HIVEW]};
};
HINT[O.FTRAP]=(i,h)=>{
 const e=ent(i,O.FTRAP),nm=HG.NAMES[O.FTRAP]+(e.c?' · yakalama var':e.b?' · yemli':' · yemsiz');
 if(e.c)return {hint:'[E] Yakalananı al',name:nm};
 if(h&&BAIT.includes(h.k)&&!e.b)return {hint:'[E] Yem bırak: '+IT[h.k].n,name:nm};
 return {hint:'Balık bekliyor · [E] basılı tut: geri al',name:nm};
};
{
 const h0=HG.extHint;
 HG.extHint=(tg,o,h,i)=>{const f=HINT[o];if(f){const r=f(i,h,o);if(r!==undefined)return r}return h0?h0(tg,o,h,i):null};
 const hh0=HG.extHeldHint;
 HG.extHeldHint=(tg,h)=>{
  if(tg&&tg.an&&tg.an.pet&&HG.petHint)return HG.petHint(tg.an,h);          /* köpeğe bakarken yenilebilir eşya: besleme ipucu (basılı tutulunca yenmez) */
  if(tg&&!tg.an&&!G.head&&h){
   const i=tg.y*W+tg.x,o=G.obj[i],f=HINT[o];
   if(f){const r=f(i,h,o);if(r&&!r.block)return Object.assign({kind:'eat',need:1.1},r);return r||null}
  }
  return hh0?hh0(tg,h):null;
 };
 const u0=HG.useExtra;
 HG.useExtra=function(src){
  const h=held(),tg=G.tg;
  if(tg&&!G.head){
   if(tg.an){if(tg.an.pet&&HG.petUse&&HG.petUse(tg.an,h,src))return true}
   else{const i=tg.y*W+tg.x,f=ACT[G.obj[i]];if(f&&f(i,h,src))return true}
  }
  if(h){const f=HG.x2held[h.k];if(f&&f(h,tg,src))return true}
  return u0?u0.apply(this,arguments):false;
 };
 /* Kürekle zemine bakınca kazma ipucu */
 const a0=HG.actionFor;
 HG.actionFor=function(tg){
  const r=a0.apply(this,arguments),h=held();
  if(h&&h.k==='shovel'&&tg&&!tg.an&&!G.head&&!G.obj[tg.y*W+tg.x]&&(!r||!r.block)){
   const tl=G.tile[tg.y*W+tg.x];
   if(tl===T.GRASS||tl===T.SAND)return {hint:'[E] Kaz · hazine ara',name:tl===T.SAND?'Kum':'Toprak'};
  }
  if(!r&&tg&&tg.an&&tg.an.pet&&HG.petHint)return HG.petHint(tg.an,h);
  return r;
 };
}
/* Yerleştirme koşulları: Balık Kapanı su kenarındaki kuma kurulur */
HG.extPlaceOk=(x,y,key)=>{
 if(key==='ftrap'){
  const i=y*W+x;if(G.tile[i]!==T.SAND)return false;
  return [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{const t=G.tile[(y+dy)*W+x+dx];return t<=T.SHAL||t===T.POND});
 }
 return true;
};
HG.extPlaceMsg=key=>key==='ftrap'?'Balık Kapanı su kenarındaki kuma kurulur.':null;

/* ---------- Yabani arı kovanları ve gömülü hazineler (yeni oyunda ve eski kayıtta bir kez) ---------- */
function seedHives(){
 const r=HG.mulberry32(((G.seed|0)^0x2b1e5)>>>0),target=Math.max(6,Math.round(W*H/42000));
 let c=0,g=0;
 while(c<target&&g++<target*90){
  const x=4+((r()*(W-8))|0),y=4+((r()*(H-8))|0),i=y*W+x;
  if(G.tile[i]!==T.GRASS||G.obj[i]||G.hgt[i]>3)continue;
  if(Math.hypot(x-G.px,y-G.py)<25||villageNear(x,y,14))continue;
  if(treesAround(x,y,2)<3)continue;
  if(HG.pondNear&&HG.pondNear(G.tile,W,i))continue;
  G.obj[i]=O.HIVEW;c++;
 }
}
function seedTreasure(){
 const r=HG.mulberry32(((G.seed|0)^0x7e57a1)>>>0),target=Math.round(W*H/65000),list=[];
 let g=0;
 while(list.length<target&&g++<target*220){
  const x=6+((r()*(W-12))|0),y=6+((r()*(H-12))|0),i=y*W+x,t=G.tile[i];
  if((t!==T.GRASS&&t!==T.SAND)||G.obj[i]||G.hgt[i]>3)continue;
  if(Math.hypot(x-G.px,y-G.py)<30||villageNear(x,y,10))continue;
  if(list.some(q=>Math.hypot(q.x-x-.5,q.z-y-.5)<40))continue;
  if(HG.pondNear&&HG.pondNear(G.tile,W,i))continue;
  list.push({x:x+.5,z:y+.5,f:0});
 }
 X().tr=list;
}
HG.x2seeds.push(seedHives,seedTreasure);
{
 const s0=HG.extStart;
 HG.extStart=()=>{
  if(s0)s0();
  const x=X();
  if(!x.home)x.home={x:G.px,z:G.py};
  if(!x.init){x.init=1;for(const f of HG.x2seeds)try{f()}catch(e){console.error('x2seed',e)}}
  for(const f of HG.x2starts)try{f()}catch(e){console.error('x2start',e)}
 };
}

/* ---------- Harita işaretleri: elle konan bayraklar (M penceresinde Shift+tık) ve hazine bölgeleri ---------- */
HG.addMark=(px,pz,k,r,q)=>{
 const x=X();
 if(x.marks.length>=8){const j=x.marks.findIndex(m=>m.k==='m');x.marks.splice(j>=0?j:0,1)}
 x.marks.push({k,x:px,z:pz,r:k==='t'?(r||18):0,q:q===undefined?-1:q});
 HG.journal&&HG.journal.push('x2',{k:'mark',x:px,z:pz});
};
HG.removeMark=j=>{const x=X();if(j>=0&&j<x.marks.length)x.marks.splice(j,1)};

/* ---------- Kürek ve Hazine Haritası ---------- */
let digAt=0;
const HOT=[[4,'Toprak çok sıcak: hazine hemen yakında.'],[8,'Toprak sıcak: hazineye yaklaşıyorsunuz.'],[14,'Toprak ılık: hazine uzak değil.']];
function lootTreasure(i,q,idx){
 const x=X();q.f=1;
 x.marks=x.marks.filter(m=>!(m.k==='t'&&m.q===idx));
 const L=[['coin',RI(12,28)],['gold',RI(1,2)]];
 if(rnd()<.45)L.push(['gem',1]);
 const r=rnd();L.push(r<.2?['sword2',1]:r<.45?['pearl',1]:r<.7?['honey',2]:['coral',1]);
 for(const [id,n] of L)give(id,n,i);
 stat('treasure');HG.xpGain(25);flag('treasure');HG.snd('quest');
 const cx=i%W+.5,cz=((i/W)|0)+.5;Scene.burst(cx,Scene.groundY(cx,cz)+.4,cz,0xffd23f,16);
 HG.toast('Gömülü hazine bulundu!');
 HG.journal&&HG.journal.push('x2',{k:'treasure',i});
}
HG.x2held.shovel=(h,tg)=>{
 if(!tg||tg.an||G.head)return false;
 const i=tg.y*W+tg.x,tl=G.tile[i];
 if(G.obj[i]||(tl!==T.GRASS&&tl!==T.SAND))return false;
 if(G.clock<digAt)return true;
 digAt=G.clock+1;HG.armSwing&&HG.armSwing(.4);HG.useStam(3);stat('digs');
 HG.snd(tl===T.SAND?'step_sand':'hit');
 const hx=tg.hx!==undefined?tg.hx:tg.x+.5,hy=tg.hy!==undefined?tg.hy:.2,hz=tg.hz!==undefined?tg.hz:tg.y+.5;
 Scene.burst(hx,hy,hz,tl===T.SAND?0xd9c58b:0x6a4a2a,6);
 const x=X(),cx=tg.x+.5,cz=tg.y+.5;
 let best=-1,bd=Infinity;
 x.tr.forEach((q,k)=>{if(q.f)return;const d=Math.hypot(q.x-cx,q.z-cz);if(d<bd){bd=d;best=k}});
 if(best>=0&&bd<1.2){lootTreasure(i,x.tr[best],best);return true}
 if(tl===T.SAND&&rnd()<.5)gain('sand',1);
 const r=rnd();
 if(tl===T.GRASS){
  if(r<.07){gain('herb',1);HG.toast('Toprakta şifalı ot buldun.');return true}
  if(r<.11){gain('bone',1);HG.toast('Toprakta bir kemik buldun.');return true}
  if(r<.14){gain('coin',RI(1,3));HG.toast('Toprakta eski sikkeler buldun.');return true}
 }else if(rnd()<.03&&gain('tmap',1)){HG.toast('Kumda eski bir Hazine Haritası buldun!');return true}
 if(best>=0&&bd<=14){for(const [d,t] of HOT)if(bd<=d){HG.toast(t);return true}}
 HG.toast('Hiçbir şey çıkmadı.');
 return true;
};
HG.x2held.tmap=()=>{
 const x=X();
 let best=-1,bd=Infinity;
 x.tr.forEach((q,k)=>{
  if(q.f||x.marks.some(m=>m.k==='t'&&m.q===k))return;
  const d=Math.hypot(q.x-G.px,q.z-G.py);if(d<bd){bd=d;best=k}
 });
 if(best<0){HG.toast('Bu haritada gösterilecek yeni bir hazine kalmadı.');return true}
 const q=x.tr[best],a=rnd()*6.283,off=rnd()*10;
 HG.addMark(q.x+Math.cos(a)*off,q.z+Math.sin(a)*off,'t',18,best);
 take('tmap',1);flag('tmapread');HG.snd('quest');
 HG.toast('Hazine Haritası okundu: yaklaşık bölge haritada işaretlendi (M).');
 return true;
};
{
 const s0=HG.extSand;
 HG.extSand=()=>{
  if(s0)s0();
  if(rnd()<.015&&gain('tmap',1))HG.toast('Kumda eski bir Hazine Haritası buldun!');
 };
}

/* ---------- Doğma noktası ve ölüm ---------- */
HG.on('obj',e=>{
 if(!G.x2||G.cave)return;
 const x=X();
 if(e.v===O.BED){
  x.spawn={i:e.i};
  if(ui.state==='play')HG.toast('Doğma noktası bu yatağa taşındı.');
 }else if(e.was===O.BED&&e.v!==O.BED&&x.spawn&&x.spawn.i===e.i)x.spawn=null;
 if(STATEFUL.has(e.v))ent(e.i,e.v);
});
{
 const sl0=HG.sleep;
 if(sl0)HG.sleep=function(bed){
  const r=sl0.apply(this,arguments);
  if(bed&&ui.sleeping&&!G.cave){
   const x=X(),x0=Math.floor(G.px),y0=Math.floor(G.py);let bi=-1,bd=99;
   for(let y=y0-4;y<=y0+4;y++)for(let xx=x0-4;xx<=x0+4;xx++){
    if(xx<0||y<0||xx>=W||y>=H||G.obj[y*W+xx]!==O.BED)continue;
    const d=Math.hypot(xx+.5-G.px,y+.5-G.py);if(d<bd){bd=d;bi=y*W+xx}
   }
   if(bi>=0&&(!x.spawn||x.spawn.i!==bi)){x.spawn={i:bi};HG.toast('Doğma noktası bu yatağa taşındı.')}
  }
  return r;
 };
}
/* İlk adım: güvenli konum her saniye hatırlanır (suda ölünce cenaze çantası buraya yakın kurulur) */
let safeT=0,safe=null;
function trackSafe(dt){
 safeT-=dt;if(safeT>0||G.cave)return;safeT=1;
 const i=idxOf(G.px,G.py);
 if(!G.swim&&!G.onRaft&&!G.air&&G.tile[i]>=T.SAND&&G.tile[i]!==T.POND)safe={x:G.px,z:G.py};
}
/* Çevrede boş, yürünebilir kara karesi arar (yüzey dizilerinde) */
function findLand(sf,cx,cz,maxR){
 for(let r=0;r<=maxR;r++){
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   const x=cx+dx,y=cz+dy;
   if(x<2||y<2||x>=W-2||y>=H-2)continue;
   const i=y*W+x,t=sf.tile[i];
   if(t>=T.SAND&&t!==T.POND&&!sf.obj[i]&&sf.hgt[i]<=4)return {x,z:y,i};
  }
 }
 return null;
}
function makeGrave(){
 const items=G.inv.map(s=>s?(s.d!==undefined?{id:s.id,n:s.n,d:s.d}:{id:s.id,n:s.n}):null);          /* d: alet dayanıklılığı */
 if(!items.some(Boolean))return null;
 const sf=G.cave?G.cave.surf:G,x=X();
 let cx,cz;
 if(G.cave){
  const c=sf.caves&&sf.caves[G.cave.id],f=c&&HG.frontOf?HG.frontOf(c):null;
  cx=f?f.x:sf.px;cz=f?f.y:sf.py;
 }else if(G.onRaft||G.swim||G.tile[idxOf(G.px,G.py)]<T.SAND){const s=safe||x.home||{x:G.px,z:G.py};cx=s.x;cz=s.z}
 else{cx=G.px;cz=G.py}
 const p=findLand(sf,Math.floor(cx),Math.floor(cz),26)||(x.home&&findLand(sf,Math.floor(x.home.x),Math.floor(x.home.z),30));
 if(!p)return null;
 if(G.cave){sf.obj[p.i]=O.CHEST;HG.journal&&HG.journal.cell(p.i,O.CHEST,0)}else setObj(p.i,O.CHEST);
 x.s[p.i]={o:O.CHEST,it:items,gr:1,t:G.clock};
 HG.journal&&HG.journal.push('x2',{k:'grave',i:p.i});
 return p;
}
let pendRs=false,gateInfoPre=null,spawnCoast=false;
const DEAD_PANELS=['#trade','#jr','#gd','#bigmap','#sv','#pause','#panel'];
function resetUi(){
 for(const id of DEAD_PANELS){const e=HG.$(id);if(e)e.hidden=true}
 try{HG.extClose&&HG.extClose(true)}catch(e){}
 G.trading=null;ui.sleeping=false;
 try{HG.settings&&HG.settings.close();HG.stopAction();HG.bow.on=false;HG.bow.draw=0}catch(e){}
 for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;HG.inp.touchAct=false;
 ui.picked=null;
}
function standNear(cx,cz,r){
 for(let k=0;k<=r;k++){
  for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==k)continue;
   const x=Math.floor(cx)+dx,y=Math.floor(cz)+dy;
   if(x<2||y<2||x>=W-2||y>=H-2)continue;
   const i=y*W+x,t=G.tile[i];
   if(t<T.SAND||t===T.POND||G.obj[i])continue;
   if(HG.canStandAt&&!HG.canStandAt(x+.5,y+.5))continue;
   return {x:x+.5,z:y+.5};
  }
 }
 return null;
}
/* Sahil doğma noktaları: kıyıdaki boş kum kareleri; dünya tohumundan türetilir (aynı kod, aynı noktalar). Yatak yoksa yeniden doğma bunlar ve başlangıç arasından seçilir */
HG.x2reg('sp',()=>[],v=>Array.isArray(v)?v.filter(q=>q&&isFinite(q.x)&&isFinite(q.z)).slice(0,16).map(q=>({x:+q.x,z:+q.z})):[]);
function genCoast(){
 const r=HG.mulberry32(((G.seed|0)^0x5eac0a57)>>>0||1),c=[];
 for(let y=6;y<H-6;y+=3)for(let x=6;x<W-6;x+=3){
  const i=y*W+x;
  if(G.tile[i]!==T.SAND||G.obj[i]||G.hgt[i]>2)continue;
  let wet=false;
  for(let dy=-3;dy<=3&&!wet;dy+=3)for(let dx=-3;dx<=3;dx+=3){const t=G.tile[(y+dy)*W+x+dx];if(t<T.SAND){wet=true;break}}
  if(!wet)continue;
  c.push([x,y]);
 }
 for(let k=c.length-1;k>0;k--){const j=(r()*(k+1))|0;[c[k],c[j]]=[c[j],c[k]]}
 const want=Math.max(6,Math.round(W*H/70000)),out=[];
 for(const [x,y] of c){
  if(out.length>=want)break;
  if(out.some(q=>Math.hypot(q.x-x,q.z-y)<70))continue;
  const p=standNear(x+.5,y+.5,2);
  if(p)out.push({x:p.x,z:p.z});
 }
 return out;
}
function doRespawn(){
 pendRs=false;
 const x=X();
 let p=null;
 if(x.spawn&&G.obj[x.spawn.i]===O.BED)p=standNear(x.spawn.i%W+.5,((x.spawn.i/W)|0)+.5,3);
 let coast=false;
 if(!p){
  if(!x.sp.length)x.sp=genCoast();
  const pts=x.sp.slice();if(x.home)pts.push(x.home);
  if(pts.length){const q=pts[(Math.random()*pts.length)|0];p=standNear(q.x,q.z,10);coast=!!p&&q!==x.home}
 }
 if(!p&&x.home)p=standNear(x.home.x,x.home.z,10);
 if(!p)p={x:G.px,z:G.py};
 spawnCoast=coast;
 G.px=p.x;G.py=p.z;G.pz=undefined;G.vz=0;G.air=false;G.pvx=G.pvy=0;G.tg=null;G.swim=false;G.head=false;G.shelterCheck=0;
 for(const a of G.animals||[]){
  const def=HG.ANIMAL[a.t];if(a.dying||a.pet)continue;
  if(Math.hypot(a.x-G.px,a.z-G.py)<(def.foe?34:22)){if(def.foe){a.gone=true;a.dying=.001}else{a.charge=0;a.panic=0;a.giveT=20}}
 }
 x.invT=G.clock+6;
 G.cause='';
 HG.emit('respawn',{x:G.px,z:G.py});
 HG.save&&HG.save();
}
const SOFT=document.getElementById('fade');
HG.onDie=()=>{
 const mode=HG.cfg.death||'bed',x=X(),cause=G.cause||'Hayatta kalamadın.';
 const tip=HG.$('#deadTip');
 if(mode==='perm'){
  const r0=HG.$('#bResp');if(r0)r0.hidden=true;
  if(tip)tip.textContent='Kalıcı ölüm açık: kayıt silindi. Ana menüye dönüp yeni bir dünya oluşturabilirsiniz.';
  return false;
 }
 stat('deaths');
 resetUi();
 let grave=null;
 if(mode==='bed'){
  grave=makeGrave();
  for(let k=0;k<G.inv.length;k++)G.inv[k]=null;
  G.inv[0]={id:'rock',n:1};G.sel=0;
  G.xp=Math.floor((G.xp||0)*.75);
 }
 G.hp=60;G.hun=Math.max(G.hun,50);G.thr=Math.max(G.thr,50);G.warm=Math.max(G.warm,80);G.san=Math.max(G.san,70);G.stam=100;G.bleed=0;G.o2=100;G.tired=false;
 if(HG.onRespawnReset)HG.onRespawnReset();
 x.invT=G.clock+999;
 ui.dirty=true;
 if(SOFT){SOFT.classList.add('on');setTimeout(()=>SOFT.classList.remove('on'),900)}
 HG.snd('ui_open');
 HG.feed(cause);
 
 if(G.cave){pendRs=true;pendGate=true;gateInfoPre={cause,mode,grave:!!grave};HG.leaveCave();}
 else{doRespawn();showDeath(cause,mode,!!grave)}
 return true;
};
/* Ölüm ekranı: ölüm işlemleri (mezar, doğma, kayıt) yapılır; oyuncu "Yeniden Doğ" düğmesine basana kadar oyun bekler */
let pendGate=false,gateInfo=null;
function showDeath(cause,mode,grave){
 pendGate=false;
 gateInfo={cause,mode,grave};
 for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;HG.inp.touchAct=false;
 for(const id of DEAD_PANELS){const e=HG.$(id);if(e)e.hidden=true}
 /* Ölüm görüntüsü: arka planda ayakta duran sağlıklı bir oyuncu görünmesin. Ölüm anındaki kamera
    saklanır, yere devrilmiş gibi alçaltılıp yana yatırılır; eller ve göstergeler gizlenir. */
 {const c=HG.sc&&HG.sc.cam;
  if(c)HG.deathCam={px:c.position.x,py:c.position.y,pz:c.position.z,rx:c.rotation.x,ry:c.rotation.y,t:0};
  const gm=HG.$('#game');if(gm)gm.classList.add('dead');}
 ui.state='dead';
 HG.$('#why').textContent=cause;
 HG.$('#stat').textContent=HG.dayNo()+'. güne kadar dayandın.';
 {const s=G.stats||{};HG.$('#stat2').textContent='Seviye '+G.lvl+' · Avlanan hayvan: '+(s.hunted||0)+' · Yok edilen Gölge: '+(s.shades||0)+'\nAçılan sandık: '+(s.chests||0)+' · Tamamlanan görev: '+(s.quests||0)+' · Atlatılan Kan Ayı: '+(s.blood||0)+'\nYürünen mesafe: '+Math.round(s.walked||0)+' m · Yüzülen mesafe: '+Math.round(s.swum||0)+' m'}
 const tip=HG.$('#deadTip');
 if(tip)tip.textContent=mode==='bed'?(grave?'Eşyaların cenaze çantasında; haritada işaretli. Yatağında, yoksa sahilde veya başlangıç noktasında yeniden doğacaksın.':'Yatağında, yoksa sahilde veya başlangıç noktasında yeniden doğacaksın.'):'Yeniden doğacaksın; eşyaların yanında kalır.';
 const r=HG.$('#bResp');if(r)r.hidden=false;
 HG.$('#dead').hidden=false;
 if(document.exitPointerLock)document.exitPointerLock();
 HG.snd('ui_open');
}
{
 const r=HG.$('#bResp');
 if(r)r.onclick=()=>{
  if(ui.state!=='dead'||!gateInfo)return;
  gateInfo=null;
  HG.$('#dead').hidden=true;r.hidden=true;
  HG.deathCam=null;{const gm=HG.$('#game');if(gm)gm.classList.remove('dead')}
  ui.state='play';HG.snd('ui_close');
  HG.toast(spawnCoast?'Sahilde uyandın.':'Doğma noktasında uyandın.');
  ui.relock=true;HG.lock&&HG.lock();
 };
}
/* Cenaze çantası boşaldığında kaldırılır */
HG.x2graveCheck=i=>{
 const e=X().s[i];
 if(e&&e.o===O.CHEST&&e.gr&&!chestCount(e)){setObj(i,O.NONE);delete X().s[i];G.shelterCheck=0;HG.toast('Cenaze çantası boşaldı.')}
};
{
 const hr0=HG.hurt;
 HG.hurt=function(dmg,cause,src,bleedP){
  if(G.x2&&G.clock<(G.x2.invT||0))return;
  return hr0.call(this,dmg,cause,src,bleedP);
 };
 const u0=HG.update;
 let err=false;
 HG.update=function(dt){
  u0.call(this,dt);
  if(ui.state!=='play')return;
  try{
   if(pendRs&&!G.cave&&!HG.busy){doRespawn();if(pendGate){const i=gateInfoPre||{};showDeath(i.cause||'Hayatta kalamadın.',i.mode||'bed',!!i.grave)}}
   if(G.x2&&G.x2.invT>G.clock+10&&!pendRs)G.x2.invT=G.clock+6;
   stepStructs(dt);scanNear(dt);trackSafe(dt);
  }catch(e){if(!err){err=true;console.error('genisleme',e)}}
 };
}

/* ---------- Dünya kodu: menüde girilir, duraklatma ekranında gösterilir; ölüm ekranında aynı adada yeniden başlanır ---------- */
function setupWorldCode(){
 const menu=HG.$('#menu'),inp=HG.$('#wcode'),pause=HG.$('#pause'),pc=HG.$('#wcodeP'),same=HG.$('#bSame');
 if(inp){
  inp.addEventListener('input',()=>{inp.classList.remove('bad');const v=inp.value.toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,6);inp.value=v.length>3?v.slice(0,3)+'-'+v.slice(3):v});
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Enter'){e.preventDefault();const b=HG.$('#bNew');if(b)b.click()}});
  inp.addEventListener('keyup',e=>e.stopPropagation());
 }
 if(menu&&inp)menu.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('#bNew'))return;
  const t=inp.value.trim();
  if(!t){HG.pendingSeed=null;return}
  const sd=HG.parseWorldCode(t);
  if(sd===null){e.stopImmediatePropagation();e.preventDefault();inp.classList.add('bad');HG.toast('Dünya kodu geçersiz: 6 karakter (örn. ABC-123).');inp.focus();return}
  HG.pendingSeed=sd;
 },true);
 if(pause&&pc){
  const fill=()=>{if(G.seed!==undefined)pc.textContent='Dünya kodu: '+HG.worldCode()+' · kopyalamak için tıklayın'};
  new MutationObserver(()=>{if(!pause.hidden)fill()}).observe(pause,{attributes:true,attributeFilter:['hidden']});
  pc.addEventListener('click',()=>{
   const c=HG.worldCode();
   try{navigator.clipboard.writeText(c).then(()=>HG.toast('Dünya kodu kopyalandı: '+c),()=>HG.toast('Dünya kodu: '+c))}catch(e){HG.toast('Dünya kodu: '+c)}
  });
 }
 if(same)same.addEventListener('click',()=>{HG.initAudio&&HG.initAudio();HG.pendingSeed=G.seed;HG.startGame(false)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupWorldCode);else setupWorldCode();
{
 const r0=HG.extStatRows;
 HG.extStatRows=s=>(r0?r0(s):[]).concat([['Dünya kodu',HG.worldCode()],['Bal toplanan',s.honey||0],['Kapanla yakalanan',s.trapfish||0],['Bulunan hazine',s.treasure||0],['Kazılan yer',s.digs||0],['Ölüm sayısı',s.deaths||0]]);
}
})();
