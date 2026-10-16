/* Hunger 3D - büyük güncelleme (51) oyun mantığı III: evcil köpek, ayılar, Gezgin Tüccar, köy itibarı, söylentiler, doğadan toplama
   (elma, şifalı ot), günlük meydan okumalar ve Günlük'teki "Meydan" sekmesi.
   Özgün dosyalara yalnızca küçük kancalar eklenmiştir (HG.petAI, HG.extAnimalAct, HG.repK, HG.extGain, sc.npcLook, sc.npcExtra). */
(()=>{
'use strict';
const {W,H,T,O,IT,G,ui,Scene,clamp,count,take,canAdd,gain,held,flag,ANIMAL,DAY}=HG;
const sc=HG.sc,rnd=Math.random,R=(a,b)=>a+rnd()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1));
const X=HG.X2;
const stat=(k,n)=>{if(G.stats)G.stats[k]=(G.stats[k]||0)+(n===undefined?1:n)};
const num=(v,d)=>isFinite(v)?+v:d;
const idxOf=(x,z)=>Math.floor(z)*W+Math.floor(x);
const villageNear=(x,y,r)=>(G.villages||[]).some(v=>Math.hypot(v.cx-x,v.cy-y)<r);
function treesAround(x,y,r){let n=0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const k=(y+dy)*W+x+dx;if(k>=0&&k<W*H&&G.obj[k]===O.TREE)n++}return n}
const DIRS=['kuzey','kuzeydoğu','doğu','güneydoğu','güney','güneybatı','batı','kuzeybatı'];
const dirName=(dx,dz)=>DIRS[Math.round((((Math.atan2(dx,-dz)*180/Math.PI)+360)%360)/45)%8];
const dayNo=()=>HG.dayNo();
/* Boş, yürünebilir kara noktası arar (yüzeyde) */
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
HG.x2stand=standNear;

/* =====================================================================
   Evcil köpek
   ===================================================================== */
HG.x2reg('pet',()=>null,v=>v&&typeof v==='object'&&isFinite(v.x)&&isFinite(v.z)?{hp:clamp(num(v.hp,100),1,100),mode:v.mode==='stay'?'stay':'follow',x:+v.x,z:+v.z,down:clamp(num(v.down,0),0,90)}:null);
const findDog=()=>(G.animals||[]).find(a=>a.pet)||(G.cave&&G.cave.surf&&(G.cave.surf.animals||[]).find(a=>a.pet))||null;
function spawnDog(px,pz,st){
 const a=HG.makeAnimals([{t:'dog',x:px,z:pz,yaw:rnd()*6.28,hp:st?st.hp:100}])[0];
 a.pet=true;a.mode=st&&st.mode==='stay'?'stay':'follow';a.down=st?st.down||0:0;a.biteCd=0;a.scanT=0;a.tpT=0;
 (G.animals||(G.animals=[])).push(a);
 return a;
}
HG.x2save.push(()=>{
 const x=X(),d=findDog();
 if(d)x.pet={hp:Math.max(1,Math.round(d.hp)),mode:d.mode,x:+d.x.toFixed(1),z:+d.z.toFixed(1),down:Math.round(d.down||0)};
});
HG.x2starts.push(()=>{
 const x=X();
 if(x.pet&&!findDog()){
  let p=standNear(x.pet.x,x.pet.z,6);
  if(!p||Math.hypot(p.x-G.px,p.z-G.py)>80)p=standNear(G.px+1.5,G.py+1.5,8);
  if(p)spawnDog(p.x,p.z,x.pet);
 }
});
HG.on('respawn',()=>{
 const d=findDog();if(!d||G.cave)return;
 const p=standNear(G.px+1.5,G.py+1.5,8);
 if(p){d.x=p.x;d.z=p.z;d.down=0;d.hp=Math.max(d.hp,60);d.target=null}
});
const HOSTILE=a=>{
 if(a.dying||a.pet||a.gone)return false;
 const d=ANIMAL[a.t];
 if(d.foe)return true;
 if(a.charge>0)return true;
 return !!(d.aggr&&Math.hypot(a.x-G.px,a.z-G.py)<12);
};
/* Köpek yapay zekâsı (oyun/hayvanlar.js updateAnimals içindeki def.pet kolu çağırır) */
HG.petAI=(a,def,dt,L)=>{
 const dp=Math.hypot(G.px-a.x,G.py-a.z);
 a.biteCd=Math.max(0,(a.biteCd||0)-dt);a.tpT=Math.max(0,(a.tpT||0)-dt);
 if(a.down>0){
  a.down-=dt;
  if(a.down<=0){a.down=0;a.hp=Math.max(a.hp,40);HG.toast('Köpek toparlandı.')}
  return {head:a.yaw,spd:0};
 }
 /* çok uzaklaşırsa oyuncunun yanına gelir */
 if(!G.cave&&(dp>34||(dp>16&&(G.swim||G.onRaft)&&a.tpT<=0))&&a.tpT<=0){
  a.tpT=3;const p=standNear(G.px,G.py,10);
  if(p){a.x=p.x;a.z=p.z;a.moving=false;return {head:a.yaw,spd:0}}
 }
 /* düşman ara ve saldır */
 if(a.mode!=='stay'){
  a.scanT-=dt;
  if(a.scanT<=0){
   a.scanT=.5;let best=null,bd=15;
   for(const q of L){if(!HOSTILE(q))continue;const d=Math.hypot(q.x-a.x,q.z-a.z);if(d<bd&&Math.hypot(q.x-G.px,q.z-G.py)<20){bd=d;best=q}}
   a.target=best;
  }
  const tr=a.target;
  if(tr&&!tr.dying&&!tr.gone){
   const dx=tr.x-a.x,dz=tr.z-a.z,d=Math.hypot(dx,dz),td=ANIMAL[tr.t];
   if(d<def.r+td.r+.55){
    if(a.biteCd<=0){
     a.biteCd=1;
     const big=td.h>1.1||tr.t==='bear';
     tr.hp-=big?3.5:6;tr.hitT=.25;
     HG.snd('bark',{x:a.x,z:a.z});
     Scene.burst(tr.x,Scene.groundY(tr.x,tr.z)+td.h*.5,tr.z,td.foe?0x20202a:0xa01818,3);
     a.hp-=(td.dmg||6)*.35;
     if(tr.hp<=0){stat('petkills');HG.killAnimal(tr);a.target=null}
     if(a.hp<=0){a.hp=1;a.down=90;a.mode='stay';a.target=null;HG.toast('Köpek yaralandı; bir süre dinlenecek. Et ile besleyerek ayağa kaldırabilirsiniz.')}
    }
    return {head:Math.atan2(dx,dz),spd:0};
   }
   return {head:Math.atan2(dx,dz),spd:def.run};
  }
 }
 if(a.mode==='stay')return {head:dp<8?Math.atan2(G.px-a.x,G.py-a.z):a.yaw,spd:0};
 if(dp>2.8)return {head:Math.atan2(G.px-a.x,G.py-a.z),spd:dp>10?def.run:dp>5.5?def.run*.6:def.walk*1.3};
 return {head:a.yaw,spd:0};
};
const FOOD={meat:30,fish:25,sardine:20,bass:25,tuna:35,crab:20,cmeat:100,cfish:100,ccrab:100,jerky:100,dfish:100};
HG.petUse=(a,h)=>{
 if(h&&FOOD[h.k]!==undefined){
  if(a.hp>=100&&!(a.down>0)){HG.toast('Köpek tok.');return true}
  take(h.k,1);a.hp=Math.min(100,a.hp+FOOD[h.k]);
  if(a.down>0){a.down=0;a.hp=Math.max(a.hp,35);HG.toast('Köpek ayağa kalktı.')}else HG.toast('Köpeği besledin.');
  HG.snd('eat');HG.snd('bark',{x:a.x,z:a.z});flag('petfed');return true;
 }
 a.mode=a.mode==='stay'?'follow':'stay';
 HG.toast(a.mode==='stay'?'Köpek burada bekleyecek.':'Köpek seni takip edecek.');
 HG.snd('bark',{x:a.x,z:a.z});return true;
};
HG.petHint=(a,h)=>({hint:h&&FOOD[h.k]!==undefined?'[E] Köpeği besle':'[E] '+(a.mode==='stay'?'Takip etmesini söyle':'Beklemesini söyle'),name:'Köpek · %'+Math.ceil(a.hp)+(a.down>0?' · yaralı':a.mode==='stay'?' · bekliyor':'')});
HG.extAnimalAct=(an,h)=>an.pet?HG.petHint(an,h):null;
{
 /* Dost köpeğe vurulmaz */
 const h0=HG.hitAnimal;
 HG.hitAnimal=function(a){if(a&&a.pet)return;return h0.apply(this,arguments)};
}
HG.x2held.puppy=(h,tg)=>{
 if(findDog()||X().pet){HG.toast('Zaten bir köpeğin var.');return true}
 if(G.cave){HG.toast('Köpek yavrusu açık havada bırakılır.');return true}
 const p=standNear(G.px+G.fx*1.6,G.py+G.fy*1.6,5);
 if(!p){HG.toast('Buraya bırakılamaz.');return true}
 take('puppy',1);spawnDog(p.x,p.z,null);stat('pets');flag('pet');
 HG.snd('bark',{x:p.x,z:p.z});HG.toast('Köpek arkadaşın oldu! E ile beklet veya çağır, et ile besle.');
 return true;
};

/* =====================================================================
   Ayılar
   ===================================================================== */
function bearSpot(minD){
 for(let g=0;g<600;g++){
  const x=4+((rnd()*(W-8))|0),y=4+((rnd()*(H-8))|0),i=y*W+x;
  if(G.tile[i]!==T.GRASS||G.obj[i]||G.hgt[i]>3)continue;
  if(Math.hypot(x-G.px,y-G.py)<minD||villageNear(x,y,25))continue;
  if(treesAround(x,y,3)<4)continue;                                 /* ormanlık: 7x7 alanda en az 4 ağaç */
  if(HG.pondNear&&HG.pondNear(G.tile,W,i))continue;
  return {x:x+.5,z:y+.5};
 }
 return null;
}
const bearTarget=()=>Math.max(3,Math.round(W*H/90000));
HG.x2seeds.push(()=>{
 const list=[];
 for(let k=0;k<bearTarget();k++){const p=bearSpot(60);if(p&&!list.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<50))list.push({t:'bear',x:p.x,z:p.z,yaw:rnd()*6.28})}
 G.animals.push(...HG.makeAnimals(list));
});
let bearT=60,hibT=0;
function bearStep(dt){
 if(G.cave)return;
 bearT-=dt;
 if(bearT<=0){
  bearT=90;
  const bears=(G.animals||[]).filter(a=>a.t==='bear'&&!a.dying);
  if(bears.length<bearTarget()*.6){
   const p=bearSpot(80);
   if(p)G.animals.push(...HG.makeAnimals([{t:'bear',x:p.x,z:p.z,yaw:rnd()*6.28}]));
  }
 }
 /* kışın ayılar kış uykusuna yatar: saldırmaz, yerinden oynamaz (vurulursa uyanır) */
 hibT-=dt;
 if(hibT<=0){
  hibT=2;
  if(HG.x2winter())for(const a of G.animals||[])if(a.t==='bear'&&!a.dying&&!(a.charge>0)){a.giveT=Math.max(a.giveT||0,12);a.moving=false;a.tm=Math.max(a.tm||0,4)}
 }
}
{
 const k0=HG.onKill;
 HG.onKill=function(a,def){
  const first=!a._k;
  const r=k0.apply(this,arguments);
  if(first&&a.t==='bear'){stat('bears');flag('bear');HG.xpGain(20)}
  return r;
 };
}

/* =====================================================================
   Gezgin Tüccar
   ===================================================================== */
HG.PROF.trader={n:'Gezgin Tüccar',hi:'Uzak diyarlardan getirdim; fazla kalmam.',offers:[
 {give:['tmap',1],cost:{coin:12},max:2,ev:[500,900],ch:.5},
 {give:['puppy',1],cost:{coin:20},max:1,ev:[900,1500],ch:.3},
 {give:['shovel',1],cost:{copper_ingot:1,wood:2},max:1,ev:[700,1200],ch:.35},
 {give:['sword2',1],cost:{coin:30},max:1,ev:[900,1500],ch:.25},
 {give:['shield',1],cost:{coin:18},max:1,ev:[800,1400],ch:.3},
 {give:['boots',1],cost:{coin:16},max:1,ev:[800,1400],ch:.3},
 {give:['apiary',1],cost:{coin:22},max:1,ev:[900,1500],ch:.25},
 {give:['honey',3],cost:{coin:5},max:4,ev:[200,400],ch:.5},
 {give:['herb',3],cost:{coin:3},max:4,ev:[200,400],ch:.5}],
 buy:{gold:30,gem:46,pearl:18,comb:5,honey:5,fur:8,coral:7}};
const TNAMES=['Cemil','Hızır','Nuri','Selim','Kerem','Orhan'];
function rollTraderDeals(){
 const P=HG.PROF.trader,idx=P.offers.map((_,i)=>i);
 for(let i=idx.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[idx[i],idx[j]]=[idx[j],idx[i]]}
 const pick=idx.slice(0,5),out=[];
 if(!pick.includes(0))pick[4]=0;                                   /* Hazine Haritası her zaman bulunur */
 for(const k of pick){const id=P.offers[k].give[0];out.push({t:'o',k,lim:id==='honey'||id==='herb'?RI(2,3):id==='tmap'?RI(1,2):1})}
 const buys=Object.keys(P.buy).sort(()=>rnd()-.5).slice(0,4);
 for(const id of buys)out.push({t:'b',k:id,lim:RI(3,6)});
 return out;
}
HG.x2reg('tn',()=>null,v=>isFinite(v)?+v:null);
HG.x2reg('trader',()=>null,v=>{
 if(!v||typeof v!=='object'||!isFinite(v.x)||!isFinite(v.z))return null;
 const P=HG.PROF.trader,deals=Array.isArray(v.deals)?v.deals.filter(e=>Array.isArray(e)&&(e[0]==='o'?P.offers[e[1]]:P.buy[e[1]])).map(e=>[e[0],e[0]==='o'?+e[1]:e[1],Math.max(0,+e[2]||0)]):[];
 return {x:+v.x,z:+v.z,left:clamp(num(v.left,DAY),0,DAY*3),nm:typeof v.nm==='string'?v.nm.slice(0,16):'Cemil',deals};
});
let tNpc=null;
const normDeal=d=>Array.isArray(d)?{t:d[0],k:d[1],lim:d[2]}:{t:d.t,k:d.k,lim:d.lim};
function traderNpc(t){
 const n={id:9001+((rnd()*500)|0),vi:-1,prof:'trader',name:t.nm,f:false,trader:true,house:{x:t.x,z:t.z,dX:t.x,dZ:t.z,ex:0,ey:1},x:t.x,z:t.z,hx:t.x,hz:t.z,yaw:rnd()*6.28,walk:0,spd:0,tm:rnd()*4,moving:false,tx:t.x,tz:t.z,inside:false,
  deals:t.deals.length?t.deals.map(normDeal):rollTraderDeals(),refresh:0,sleep:false};
 return n;
}
function addTrader(){
 const x=X(),t=x.trader;if(!t||!G.npcs)return;
 if(G.npcs.some(n=>n.trader))return;
 tNpc=traderNpc(t);G.npcs.push(tNpc);
}
function arrive(){
 const x=X();
 let p=null;
 for(let k=0;k<40&&!p;k++){
  const a=rnd()*6.283,r=35+rnd()*40,q=standNear(G.px+Math.cos(a)*r,G.py+Math.sin(a)*r,3);
  if(q&&G.tile[idxOf(q.x,q.z)]===T.GRASS&&Math.hypot(q.x-G.px,q.z-G.py)>30)p=q;
 }
 if(!p){x.tn=G.clock+40;return}
 x.trader={x:p.x,z:p.z,left:2*DAY,nm:TNAMES[(rnd()*TNAMES.length)|0],deals:rollTraderDeals().map(d=>[d.t,d.k,d.lim])};
 addTrader();flag('traderseen');
 HG.toast('Gezgin bir tüccar adaya geldi: konumu haritada işaretlendi (M).');HG.snd('quest');
}
function depart(){
 const x=X();
 if(tNpc){const i=G.npcs.indexOf(tNpc);if(G.trading===tNpc)HG.closeTrade();if(i>=0)G.npcs.splice(i,1)}
 else if(G.npcs)G.npcs=G.npcs.filter(n=>!n.trader);
 tNpc=null;x.trader=null;x.tn=G.clock+R(3,6)*DAY;
 HG.toast('Gezgin tüccar yoluna devam etti.');
}
HG.x2save.push(()=>{
 const x=X();
 if(x.trader&&tNpc){x.trader.x=+tNpc.x.toFixed(1);x.trader.z=+tNpc.z.toFixed(1);x.trader.deals=tNpc.deals.map(d=>[d.t,d.k,d.lim])}
});
HG.x2starts.push(()=>{
 const x=X();tNpc=null;
 if(x.tn===null)x.tn=G.clock+R(1.2,2.4)*DAY;
 if(x.trader)addTrader();
});
function traderStep(dt){
 if(G.cave||!G.npcs)return;
 const x=X();
 if(x.trader){
  if(!tNpc||!G.npcs.includes(tNpc)){tNpc=G.npcs.find(n=>n.trader)||null;if(!tNpc)addTrader()}
  x.trader.left-=dt;
  if(x.trader.left<=0)depart();
 }else if(x.tn!==null&&G.clock>=x.tn)arrive();
}
{
 /* Tüccarın görevi ve kayıt satırı yoktur */
 const q0=HG.questHtml;
 HG.questHtml=n=>n&&n.trader?'':q0(n);
}

/* =====================================================================
   Köy itibarı ve söylentiler
   ===================================================================== */
HG.x2reg('rep',()=>({}),v=>{const o={};if(v&&typeof v==='object')for(const k in v){const i=+k;if(Number.isInteger(i)&&i>=0&&i<64&&isFinite(v[k]))o[k]=clamp(+v[k],0,100)}return o});
HG.x2reg('rumors',()=>[],v=>Array.isArray(v)?v.filter(s=>typeof s==='string').map(s=>s.slice(0,160)).slice(-12):[]);
const LV=[20,50,80],LVN=['Yabancı','Tanıdık','Dost','Hemşeri'],DISC=[0,.05,.1,.15];
const repLevel=vi=>{const p=(X().rep[vi]||0);return p>=LV[2]?3:p>=LV[1]?2:p>=LV[0]?1:0};
HG.repLevel=repLevel;
/* Takasta ödenecek bedel çarpanı (sell=true: satış fiyatı çarpanı) */
HG.repK=sell=>{const n=G.trading;if(!n||!(n.vi>=0))return 1;const d=DISC[repLevel(n.vi)];return sell?1+d:1-d};
const GIFT=[null,['coin',6],['tmap',1],['apiary',1]];
function addRep(vi,pts){
 if(!(vi>=0)||!G.villages||!G.villages[vi])return;
 const x=X(),was=repLevel(vi);
 x.rep[vi]=Math.min(100,(x.rep[vi]||0)+pts);
 const lv=repLevel(vi);
 if(lv>was){
  const g=GIFT[lv];
  HG.toast(G.villages[vi].name+' köylüleri sana '+LVN[lv].toLowerCase()+' gözüyle bakıyor: fiyatlar %'+Math.round(DISC[lv]*100)+' lehine.');
  HG.snd('quest');flag('rep'+lv);
  if(g)HG.x2give(g[0],g[1],idxOf(G.px,G.py));
 }
}
HG.addRep=addRep;
let lastTraded=0,lastQuests=0,lastTrading=null;
function repStep(){
 const st=G.stats;if(!st)return;
 if(st.traded>lastTraded){
  const d=st.traded-lastTraded;lastTraded=st.traded;
  const n=G.trading;if(n){if(n.vi>=0)addRep(n.vi,2*Math.min(d,3));else stat('trades2',d)}
 }
 if(st.quests>lastQuests){
  lastQuests=st.quests;const n=G.trading||G.nearNpc;if(n&&n.vi>=0)addRep(n.vi,10);
 }
 if(G.trading&&G.trading!==lastTrading&&!G.trading.trader)talkRumor(G.trading);
 lastTrading=G.trading;
}
HG.x2starts.push(()=>{lastTraded=G.stats?G.stats.traded||0:0;lastQuests=G.stats?G.stats.quests||0:0;lastTrading=null});
const rumDay={};
function rumorText(n){
 const x=X(),opts=[];
 const far=v=>Math.round(v/25)*25;
 /* gömülü hazine: gerçek bir yere işaret eder */
 const ts=x.tr.map((q,k)=>[q,k]).filter(([q,k])=>!q.f&&!x.marks.some(m=>m.k==='t'&&m.q===k));
 if(ts.length){
  ts.sort((a,b)=>Math.hypot(a[0].x-G.px,a[0].z-G.py)-Math.hypot(b[0].x-G.px,b[0].z-G.py));
  const [q,k]=ts[Math.min(ts.length-1,(rnd()*2)|0)],d=Math.hypot(q.x-G.px,q.z-G.py);
  opts.push({t:`Eskiden biri ${dirName(q.x-G.px,q.z-G.py)} yönünde, yaklaşık ${far(d)} adım ötede bir şey gömmüş. Kürekle bakmaya değer.`,f:()=>{const a=rnd()*6.283,o=rnd()*14;HG.addMark(q.x+Math.cos(a)*o,q.z+Math.sin(a)*o,'t',26,k)}});
 }
 const camps=(G.camps||[]).filter(c=>!G.flags['c'+c.id]);
 if(camps.length){const c=camps.sort((a,b)=>Math.hypot(a.x-G.px,a.y-G.py)-Math.hypot(b.x-G.px,b.y-G.py))[0];opts.push({t:`${dirName(c.x-G.px,c.y-G.py)} tarafında, ${far(Math.hypot(c.x-G.px,c.y-G.py))} adım kadar ötede terk edilmiş bir kamp varmış.`})}
 const cvs=(G.caves||[]).filter(c=>!G.flags['cave'+c.id]);
 if(cvs.length){const c=cvs.sort((a,b)=>Math.hypot(a.x-G.px,a.y-G.py)-Math.hypot(b.x-G.px,b.y-G.py))[0];opts.push({t:`${dirName(c.x-G.px,c.y-G.py)} yönündeki kayalıklarda bir mağara girişi görmüşler.`})}
 const bears=(G.animals||[]).filter(a=>a.t==='bear'&&!a.dying);
 if(bears.length){const b=bears.sort((a,c)=>Math.hypot(a.x-G.px,a.z-G.py)-Math.hypot(c.x-G.px,c.z-G.py))[0];opts.push({t:`${dirName(b.x-G.px,b.z-G.py)} taraftaki sık ormanda bir ayı dolaşıyor. Tek başına gitme.`})}
 if(x.trader)opts.push({t:`Gezgin tüccar ${dirName(x.trader.x-G.px,x.trader.z-G.py)} tarafında konaklamış; birkaç gün kalır.`});
 const s=HG.x2season();
 if(s.id>=0)opts.push({t:s.id===2?`Kış yaklaşıyor: ${s.left} gün sonra kar yağmaya başlar. Sıcak giysi hazırla.`:s.id===3?'Kışın ayılar uykuda olur ve arılar çalışmaz; ateşten uzaklaşma.':`${s.n} ${s.left} gün daha sürer.`});
 opts.push({t:'Köpek yavrusu isteyen gezgin tüccara baksın; çoğu zaman bir tanesi yanındadır.'});
 return opts[(rnd()*opts.length)|0];
}
function talkRumor(n){
 const key=n.id,d=dayNo();
 if(rumDay[key]===d||rnd()>.45)return;
 rumDay[key]=d;
 const r=rumorText(n);if(!r)return;
 const x=X();
 if(r.f)r.f();
 const line=n.name+': '+r.t;
 x.rumors.push(line);if(x.rumors.length>12)x.rumors.shift();
 stat('rumors');flag('rumor');
 setTimeout(()=>HG.toast('Söylenti: '+r.t),400);
}

/* =====================================================================
   Doğadan toplama: elma, şifalı ot
   ===================================================================== */
{
 const f0=Scene.fell;
 Scene.fell=function(x,y,o){
  const r=f0.apply(this,arguments);
  try{
   if(o===O.TREE&&!G.cave){
    const s=HG.x2season(),p=.08*(s.id===2?3:1)*(1+.2*HG.perk('gath'));
    if(rnd()<p){const gx=x+.5,gz=y+.5;HG.spawnDrop('apple',RI(1,2),{x:gx,z:gz,y:Scene.groundY(gx,gz)+1.4,vx:(rnd()-.5),vz:(rnd()-.5)});HG.toast('Ağaçtan elma düştü.')}
   }
  }catch(e){}
  return r;
 };
 const g0=HG.extGot;
 HG.extGot=(id,n)=>{
  if(g0)g0(id,n);
  if(!(n>0))return;
  if((id==='berries'&&rnd()<.3)||(id==='mushroom'&&rnd()<.25)){if(canAdd('herb',1))gain('herb',1)}
 };
}

/* =====================================================================
   Günlük meydan okumalar (her gün 3 görev; tohum ve güne göre aynıdır)
   ===================================================================== */
const FISH=['fish','sardine','bass','tuna','crab'];
const CH=[
 {k:'wood',t:n=>n+' odun topla',m:[24,40],ev:'wood',r:.35},
 {k:'stone',t:n=>n+' taş topla',m:[20,34],ev:'stone',r:.35},
 {k:'coal',t:n=>n+' kömür topla',m:[8,14],ev:'coal',r:.55},
 {k:'berries',t:n=>n+' yaban meyvesi topla',m:[8,14],ev:'berries',r:.4},
 {k:'fish',t:n=>n+' balık veya yengeç yakala',m:[3,6],ev:FISH,r:.6},
 {k:'honey',t:n=>n+' bal topla',m:[2,4],ev:'honey',r:.9},
 {k:'craft',t:n=>n+' eşya üret',m:[5,9],st:'crafted',r:.45},
 {k:'hunt',t:n=>n+' hayvan avla',m:[2,4],st:'hunted',r:.8},
 {k:'walk',t:n=>n+' m yürü',m:[250,500],st:'walked',r:.2,round:50},
 {k:'dig',t:n=>n+' kez kaz (Kürek)',m:[4,7],st:'digs',r:1},
 {k:'herb',t:n=>n+' şifalı ot topla',m:[3,6],ev:'herb',r:.8}
];
HG.x2reg('daily',()=>null,v=>{
 if(!v||typeof v!=='object'||!Number.isInteger(v.d)||!Array.isArray(v.list))return null;
 const list=v.list.filter(e=>e&&CH.some(c=>c.k===e.k)&&isFinite(e.g)&&e.g>0).slice(0,3).map(e=>({k:e.k,g:+e.g,p:Math.max(0,num(e.p,0)),b:num(e.b,0),rw:clamp(num(e.rw,6),1,60),done:e.done?1:0}));
 return list.length?{d:v.d,list}:null;
});
function rollDaily(){
 const x=X(),d=dayNo();
 const r=HG.mulberry32((((G.seed|0)^Math.imul(d,7919))>>>0)||1);
 const pool=CH.slice();
 for(let i=pool.length-1;i>0;i--){const j=(r()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]]}
 const list=pool.slice(0,3).map((c,k)=>{
  let g=Math.round(c.m[0]+r()*(c.m[1]-c.m[0]));if(c.round)g=Math.round(g/c.round)*c.round;
  const st=c.st?(G.stats[c.st]||0):0;
  return {k:c.k,g,p:0,b:st,rw:Math.max(4,Math.round((4+k*5)*(1+c.r*.4)+2)),done:0};
 });
 x.daily={d,list};
}
const chOf=k=>CH.find(c=>c.k===k);
const dprog=e=>{const c=chOf(e.k);return Math.min(e.g,c.st?Math.max(0,(G.stats[c.st]||0)-e.b):e.p)};
HG.x2dailyProg=dprog;HG.x2dailyText=e=>chOf(e.k).t(e.g);
function dailyStep(){
 const x=X();
 if(!x.daily||x.daily.d!==dayNo()){const first=!x.daily;rollDaily();if(!first)HG.toast('Yeni günlük meydan okumalar var (K › Meydan).')}
 for(const e of x.daily.list){
  if(e.done||dprog(e)<e.g)continue;
  e.done=1;stat('daily');flag('daily');
  HG.x2give('coin',e.rw,idxOf(G.px,G.py));HG.xpGain(10+e.rw);HG.snd('quest');
  HG.toast('Günlük meydan okuma tamamlandı: '+HG.x2dailyText(e)+' (+'+e.rw+' sikke)');
 }
}
HG.extGain=(id,n)=>{
 if(!(n>0))return;
 if(id==='herb')stat('herbs',n);else if(id==='apple')stat('apples',n);
 const x=G.x2;if(!x||!x.daily)return;
 for(const e of x.daily.list){
  if(e.done)continue;
  const c=chOf(e.k);if(!c||!c.ev)continue;
  if(Array.isArray(c.ev)?c.ev.includes(id):c.ev===id)e.p+=n;
 }
};

/* =====================================================================
   Günlük › Meydan sekmesi
   ===================================================================== */
HG.extTabHtml=esc=>{
 const x=X(),s=HG.x2season();
 let h='';
 const bar=(p,g)=>`<i><b style="width:${Math.round(Math.min(1,p/g)*100)}%"></b></i>`;
 if(s.id>=0)h+=`<div class="jl"><b>${s.n} · ${s.day}. gün</b><span>${s.id===3?'Soğuk, kar, uyuyan ayılar.':s.id===2?'Elma mevsimi; kış yaklaşıyor.':s.id===1?'Sıcak günler, susuzluk artar.':'Ekinler ve arılar hızlı.'} Mevsim değişimine ${s.left} gün.</span></div>`;
 h+='<h3>Günlük meydan okumalar</h3>';
 if(x.daily)for(const e of x.daily.list){
  const p=dprog(e);
  h+=`<div class="pk"><div><b>${esc(HG.x2dailyText(e))}${e.done?' ✓':''}</b><span>${Math.floor(p)}/${e.g} · ödül ${e.rw} sikke</span>${bar(p,e.g)}</div></div>`;
 }
 const vs=G.villages||[],seen=vs.map((v,i)=>[v,i]).filter(([v,i])=>G.flags['v'+i]);
 h+='<h3>Köy itibarı</h3>';
 if(seen.length)for(const [v,i] of seen){const p=x.rep[i]||0,lv=repLevel(i);h+=`<div class="pk"><div><b>${esc(v.name)} · ${LVN[lv]}</b><span>${Math.floor(p)}/100 · ticarette %${Math.round(DISC[lv]*100)} indirim</span>${bar(p,100)}</div></div>`}
 else h+='<p class="mut">Henüz bir köy bulunmadı.</p>';
 h+='<h3>Gezgin tüccar ve evcil hayvan</h3>';
 h+=`<div class="pk"><div><b>Gezgin tüccar</b><span>${x.trader?esc(x.trader.nm)+' adada: '+dirName(x.trader.x-G.px,x.trader.z-G.py)+' yönünde, yaklaşık '+Math.round(Math.hypot(x.trader.x-G.px,x.trader.z-G.py))+' m · '+Math.ceil(x.trader.left/DAY*10)/10+' gün kalır':'Şimdilik adada değil.'}</span></div></div>`;
 const d=findDog();
 h+=`<div class="pk"><div><b>Köpek</b><span>${d?'Sağlık %'+Math.ceil(d.hp)+' · '+(d.down>0?'yaralı':d.mode==='stay'?'bekliyor':'seni takip ediyor'):x.pet?'Kayıtlı ama yakında değil.':'Yok. Gezgin tüccardan Köpek Yavrusu alınabilir.'}</span></div></div>`;
 const f=x.tr.filter(q=>q.f).length;
 h+=`<div class="pk"><div><b>Gömülü hazine</b><span>Bulunan: ${f}/${x.tr.length} · haritada işaretli bölge: ${x.marks.filter(m=>m.k==='t').length}</span></div></div>`;
 h+=`<div class="pk"><div><b>Dünya kodu</b><span>${esc(HG.worldCode())} · aynı kodla aynı ada kurulur.</span></div></div>`;
 return h;
};
{
 const n0=HG.extNotesHtml;
 HG.extNotesHtml=esc=>{
  let h=n0?n0(esc):'';
  const x=X();
  if(x.rumors.length){h+='<h3>Duyulan söylentiler</h3>';for(const r of x.rumors.slice().reverse())h+=`<div class="nt"><span>${esc(r)}</span></div>`}
  return h;
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
   bearStep(dt);traderStep(dt);repStep();dailyStep();
  }catch(e){if(!err){err=true;console.error('genisleme3',e)}}
 };
}
})();
