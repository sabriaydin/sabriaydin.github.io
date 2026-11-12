/* Hunger 3D - köyler: köylülerin meslekleri, gezinmesi, takas dükkânı.
   Her köylü yalnızca mesleğiyle ilgili eşyalarla işlem yapar; envanterinde 1-3 rastgele işlem bulunur, her işlemin küçük bir hakkı vardır.
   Hakkı biten işlem devre dışı kalır; hepsi bitince bir süre sonra 1-3 yeni rastgele işlem belirir. Takas ve satış oyuncuya asgari fayda sağlar. */
(()=>{
'use strict';
const {W,H,T,SOLID,IT,ICON,G,ui,count,take,add,canAdd,clamp,daylight,$}=HG;
const rnd=Math.random,R=(a,b)=>a+((rnd()*(b-a+1))|0);
/* give: [eşya, adet]  cost: ödenecek eşyalar  max: en çok stok  ev: yenilenme aralığı (oyun saniyesi)  ch: yenilenme olasılığı */
const PROF={
 farmer:{n:'Çiftçi',hi:'Taze ürünüm var, ama her zaman değil.',offers:[
  {give:['berries',3],cost:{wood:2},max:6,ev:[70,160],ch:.8},
  {give:['milk',1],cost:{wood:3},max:2,ev:[140,300],ch:.55},
  {give:['wool',2],cost:{stone:2},max:4,ev:[120,260],ch:.6},
  {give:['cmeat',2],cost:{coin:3},max:3,ev:[160,320],ch:.5}],
  buy:{berries:1,wool:2,milk:3}},
 hunter:{n:'Avcı',hi:'Av mevsimi hiç bitmez.',offers:[
  {give:['arrow',5],cost:{bone:2},max:10,ev:[100,220],ch:.7},
  {give:['cmeat',2],cost:{meat:2},max:4,ev:[90,200],ch:.7},
  {give:['bow',1],cost:{leather:3,wood:2},max:1,ev:[500,900],ch:.35},
  {give:['arrow',6],cost:{coin:3},max:12,ev:[120,260],ch:.7}],
  buy:{leather:3,bone:2,meat:2}},
 fisher:{n:'Balıkçı',hi:'Sular bugün cömert mi, bakalım.',offers:[
  {give:['wbottle',2],cost:{wood:1},max:4,ev:[80,180],ch:.75},
  {give:['cfish',2],cost:{stone:2},max:4,ev:[100,220],ch:.65},
  {give:['rod',1],cost:{wood:4},max:1,ev:[600,1000],ch:.3},
  {give:['bottle',2],cost:{sand:2},max:4,ev:[120,260],ch:.6},
  {give:['rod',1],cost:{coin:7},max:1,ev:[500,900],ch:.4},
  {give:['mask',1],cost:{coin:9},max:1,ev:[700,1200],ch:.3},
  {give:['raft',1],cost:{wood:12,leather:2},max:1,ev:[800,1400],ch:.25}],
  buy:{fish:2,coconut:2,shell:2,kelp:1,pearl:16,sardine:2,bass:3,tuna:6,crab:3,coral:6}},
 smith:{n:'Demirci',hi:'Ocak sönmez, kömür getir.',offers:[
  {give:['copper_ingot',1],cost:{coal:4},max:2,ev:[200,420],ch:.5},
  {give:['iron_ingot',1],cost:{coal:6,stone:3},max:1,ev:[350,700],ch:.4},
  {give:['pick1',1],cost:{stone:3,wood:2},max:1,ev:[400,800],ch:.4},
  {give:['iron_ingot',1],cost:{coin:9},max:2,ev:[300,600],ch:.45},
  {give:['pick2',1],cost:{coin:26},max:1,ev:[900,1500],ch:.25},
  {give:['axe2',1],cost:{coin:24},max:1,ev:[900,1500],ch:.25}],
  buy:{coal:2,copper_ore:4,iron_ore:8,copper_ingot:7,iron_ingot:12}},
 healer:{n:'Şifacı',hi:'Yaran varsa söyle.',offers:[
  {give:['bandage',2],cost:{wool:1},max:4,ev:[120,260],ch:.7},
  {give:['wbottle',1],cost:{berries:4},max:2,ev:[140,300],ch:.5},
  {give:['bandage',3],cost:{coin:4},max:6,ev:[120,260],ch:.6}],
  buy:{wool:3,berries:1,milk:3}},
 woodcut:{n:'Oduncu',hi:'Odun varsa iş var.',offers:[
  {give:['torch',2],cost:{wood:2,coal:1},max:4,ev:[100,220],ch:.7},
  {give:['axe1',1],cost:{stone:3},max:1,ev:[500,900],ch:.4},
  {give:['door',1],cost:{wood:4},max:2,ev:[150,320],ch:.5},
  {give:['bag',1],cost:{coin:18},max:1,ev:[700,1200],ch:.35}],
  buy:{wood:2}},
 miner:{n:'Madenci',hi:'Dağ cömert, ama pahalı.',offers:[
  {give:['coal',4],cost:{wood:2},max:8,ev:[90,200],ch:.7},
  {give:['stone',5],cost:{wood:1},max:10,ev:[80,160],ch:.8},
  {give:['copper_ore',1],cost:{wood:6},max:2,ev:[300,600],ch:.4},
  {give:['iron_ore',1],cost:{wood:10},max:2,ev:[500,900],ch:.25},
  {give:['pick1',1],cost:{coin:5},max:1,ev:[500,900],ch:.4}],
  buy:{coal:2,stone:1,copper_ore:4,iron_ore:8,gold:26,gem:42}}
};
let nid=1;
/* Tek seferlik eşyalar (alet, silah) için hak 1'dir */
const ONE=new Set(['bow','rod','pick1','pick2','axe1','axe2','bag','coat','door','raft','mask','spear2','spyglass','vest','iarmor','bed','barrel']);
function rollDeals(prof){
 const P=PROF[prof],pool=[];
 P.offers.forEach((o,i)=>pool.push({t:'o',k:i}));
 Object.keys(P.buy).forEach(id=>pool.push({t:'b',k:id}));
 for(let i=pool.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]]}
 const cnt=R(1,3),out=[];
 for(const e of pool){
  if(out.length>=cnt)break;
  /* aynı eşyayı veren iki işlem birlikte çıkmaz */
  const id=e.t==='o'?P.offers[e.k].give[0]:e.k;
  if(out.some(d=>(d.t==='o'?P.offers[d.k].give[0]:d.k)===id))continue;
  out.push({t:e.t,k:e.k,lim:e.t==='o'?(ONE.has(id)?1:R(1,2)):R(1,3)});
 }
 return out;
}
function makeNpcs(vils){
 const L=[];
 (vils||[]).forEach((v,vi)=>{
  for(const n of v.npcs){
   const P=PROF[n.prof];
   L.push({id:nid++,vi,prof:n.prof,name:n.name,f:!!n.f,house:v.houses[n.h],x:n.x,z:n.z,hx:n.x,hz:n.z,yaw:n.yaw,walk:0,spd:0,tm:rnd()*4,moving:false,tx:n.x,tz:n.z,inside:false,
    deals:rollDeals(n.prof),refresh:0,sleep:false});
  }
 });
 return L;
}
const npcSave=()=>(G.npcs||[]).map(n=>({d:n.deals.map(d=>[d.t,d.k,d.lim]),r:Math.round(n.refresh||0)}));
function npcLoad(arr){
 if(!Array.isArray(arr)||!G.npcs)return;
 G.npcs.forEach((n,i)=>{
  const a=arr[i],P=PROF[n.prof];
  if(!a||!Array.isArray(a.d))return;          /* eski kayıt biçimi: yeni işlemler kalır */
  const d=a.d.filter(e=>Array.isArray(e)&&(e[0]==='o'?P.offers[e[1]]:P.buy[e[1]])).map(e=>({t:e[0],k:e[0]==='o'?+e[1]:e[1],lim:Math.max(0,+e[2]||0)}));
  if(d.length){n.deals=d;n.refresh=+a.r||0}
 });
}
function walkableN(x,z){
 const r=.3;
 for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]){
  const tx=Math.floor(x+dx),tz=Math.floor(z+dz);
  if(tx<1||tz<1||tx>=W-1||tz>=H-1)return false;
  const i=tz*W+tx;if(G.tile[i]<T.SAND||G.tile[i]===T.POND||(G.obj[i]&&G.obj[i]!==HG.O.DOOR&&G.obj[i]!==HG.O.DOORM&&G.obj[i]!==HG.O.VDOOR))return false;
 }
 return true;
}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};
let restockT=0,discT=0;
function updateNpcs(dt){
 const L=G.npcs;if(!L)return;
 G.nearNpc=null;let best=3.4;
 for(const n of L){
  const dx=G.px-n.x,dz=G.py-n.z,dp=Math.hypot(dx,dz);
  const talk=G.trading===n;
  let spd=0,head=n.yaw;
  const night=daylight()<.25,hs=n.house;
  n.sleep=false;
  if(night||n.inside){
   /* gece evine çekilir, sabah çıkar */
   const ox=hs.dX+hs.ex*1.2,oz=hs.dZ+hs.ey*1.2,inH=Math.abs(n.x-hs.x)<2&&Math.abs(n.z-hs.z)<2;
   let tx,tz;
   if(night){
    if(inH){tx=hs.x-hs.ex*.3;tz=hs.z-hs.ey*.3;if(Math.hypot(tx-n.x,tz-n.z)<.35){tx=null}}
    else if(Math.hypot(ox-n.x,oz-n.z)>.7&&!(n.stage===1)){tx=ox;tz=oz}
    else{n.stage=1;tx=hs.x;tz=hs.z;if(Math.hypot(tx-n.x,tz-n.z)<.5){n.stage=0;tx=null}}
    n.inside=inH||n.stage===1;
    n.sleep=inH&&tx==null;                /* yatağında uyuyor */
   }else{
    if(inH){n.stage=2;tx=ox;tz=oz;if(Math.hypot(tx-n.x,tz-n.z)<.5){n.stage=0;n.inside=false;tx=null}}
    else{n.inside=false;tx=null}
   }
   if(tx!=null){head=Math.atan2(tx-n.x,tz-n.z);spd=1.1}
   else if(dp<4&&!night)head=Math.atan2(dx,dz);
  }else if(talk||dp<4){head=Math.atan2(dx,dz)}
  else{
   n.tm-=dt;
   if(n.tm<=0){
    if(n.moving){n.moving=false;n.tm=2+rnd()*6}
    else{const a=rnd()*6.28,r=.8+rnd()*1.8;n.tx=n.hx+Math.cos(a)*r;n.tz=n.hz+Math.sin(a)*r;n.moving=true;n.tm=3+rnd()*3}
   }
   if(n.moving){const tx=n.tx-n.x,tz=n.tz-n.z;if(Math.hypot(tx,tz)<.25){n.moving=false;n.tm=1+rnd()*3}else{head=Math.atan2(tx,tz);spd=.8}}
  }
  /* kızgın köylü oyuncudan uzaklaşır */
  if(n.anger>0){n.anger-=dt;if(dp<10&&!n.inside&&!night){head=Math.atan2(-dx,-dz);spd=1.8}}
  const d=angDiff(n.yaw,head);n.yaw+=clamp(d,-4*dt,4*dt);
  if(spd>0&&Math.abs(d)<1.2){
   const st=spd*dt,nx=n.x+Math.sin(n.yaw)*st,nz=n.z+Math.cos(n.yaw)*st;
   if(walkableN(nx,nz)&&Math.hypot(nx-G.px,nz-G.py)>.8){n.x=nx;n.z=nz;n.walk+=st*3}else{n.moving=false;n.tm=1}
  }else spd=0;
  n.spd+=(spd-n.spd)*Math.min(1,8*dt);
  if(dp<best){best=dp;G.nearNpc=n}
 }
 /* köylüler birbirinin içine geçmez */
 for(let i=0;i<L.length;i++){const a=L[i];if(a.sleep)continue;for(let j=i+1;j<L.length;j++){const b=L[j];if(b.sleep)continue;const dx=b.x-a.x,dz=b.z-a.z;if(dx>1||dx<-1||dz>1||dz<-1)continue;const d=Math.hypot(dx,dz);if(d>=.7||d<1e-3)continue;const k=(.7-d)*.5/d;if(walkableN(a.x-dx*k,a.z-dz*k)){a.x-=dx*k;a.z-=dz*k}if(walkableN(b.x+dx*k,b.z+dz*k)){b.x+=dx*k;b.z+=dz*k}}}
 /* işlemleri biten köylünün envanteri bir süre sonra yeni rastgele işlemlerle yenilenir */
 restockT-=dt;
 if(restockT<=0){
  restockT=1;
  for(const n of L){
   if(n.deals.some(d=>d.lim>0)){n.refresh=0;continue}
   if(!n.refresh)n.refresh=G.clock+R(300,540);
   if(G.clock>=n.refresh){n.deals=rollDeals(n.prof);n.refresh=0}
  }
  if(G.trading&&!$('#trade').hidden)renderTrade();
 }
 /* köy keşfi: haritada işaretlenir */
 discT-=dt;
 if(discT<=0){
  discT=2;
  (G.villages||[]).forEach((v,i)=>{if(!G.flags['v'+i]&&Math.hypot(v.cx-G.px,v.cy-G.py)<36){G.flags['v'+i]=1;HG.flag('vfound');HG.toast(v.name+' köyünü buldun.')}});
 }
 if(G.trading&&Math.hypot(G.trading.x-G.px,G.trading.z-G.py)>6)closeTrade();
}
/* ---- takas penceresi ---- */
const cst=o=>{const c={};for(const k in o.cost)c[k]=k==='coin'?Math.max(1,Math.round(o.cost[k]*1.3*(1-.07*HG.perk('trade'))*(HG.repK?HG.repK():1))):Math.ceil(o.cost[k]*1.25);return c};
const costText=c=>Object.keys(c).map(k=>`<span class="${count(k)>=c[k]?'ok':'no'}">${IT[k].n} ${count(k)}/${c[k]}</span>`).join(' · ');
const priceOf=(n,id)=>{const b=PROF[n.prof].buy[id],day=HG.dayNo?HG.dayNo():1;const m=.8+.4*HG.hash(day,n.vi*31+id.length*7+id.charCodeAt(0),77);return Math.max(1,Math.round(b*m*.55*(1+.08*HG.perk('trade'))*(HG.repK?HG.repK(true):1)))};
/* karşılama: günün saatine göre */
const greet=()=>{const h=HG.tod()*24;return h<11?'Günaydın.':h<17?'İyi günler.':'İyi akşamlar.'};
const subText=n=>greet()+' '+PROF[n.prof].hi+' · Sikken: '+count('coin');
const left=n=>n.deals.reduce((a,d)=>a+(d.lim>0?1:0),0);
function renderTrade(){
 const n=G.trading;if(!n)return;
 const P=PROF[n.prof];
 let h=HG.questHtml?HG.questHtml(n):'';
 const offs=n.deals.map((d,i)=>[d,i]).filter(x=>x[0].t==='o'),buys=n.deals.map((d,i)=>[d,i]).filter(x=>x[0].t==='b');
 if(offs.length){
  h+='<h3>Takas</h3>';
  for(const [d,i] of offs){
   const o=P.offers[d.k],[id,q]=o.give,can=d.lim>0&&Object.keys(cst(o)).every(k=>count(k)>=cst(o)[k]);
   h+=`<div class="rc${d.lim?'':' lock'}"><img src="${ICON[id]}" alt=""><div><b>${IT[id].n}${q>1?' ×'+q:''}</b>${costText(cst(o))}<br><span class="${d.lim?'ok':'no'}">${d.lim?'Kalan hak: '+d.lim:'Hak doldu'}</span></div><button type="button" data-o="${i}"${can?'':' disabled'}>Al</button></div>`;
  }
 }
 if(buys.length){
  h+='<h3>Satış (sikke kazan)</h3>';
  for(const [d,i] of buys){
   const id=d.k,c=count(id),pr=priceOf(n,id),k=Math.min(c,d.lim);
   h+=`<div class="rc${d.lim&&c?'':' lock'}"><img src="${ICON[id]}" alt=""><div><b>${IT[id].n}</b><span class="${c?'ok':'no'}">Çantanda: ${c}</span><br><span>1 adet = ${pr} sikke · ${d.lim?'Kalan hak: '+d.lim+' adet':'Hak doldu'}</span></div><div class="sb"><button type="button" data-s="${i}"${k?'':' disabled'}>Sat</button><button type="button" class="ghost" data-sa="${i}"${k>1?'':' disabled'}>Hepsi</button></div></div>`;
  }
 }
 if(!left(n))h+='<div class="rc lock"><div><span class="no">Şimdilik başka işlem yok. Bir süre sonra yeniden gelin.</span></div></div>';
 $('#trL').innerHTML=h;
}
function openTrade(n){
 if(daylight()<.25){HG.toast(n.name+' uyuyor. Dükkân sabah açılır.');return}
 if(n.anger>0){HG.toast(n.name+' sana kızgın. Bir süre konuşmak istemiyor.');return}
 G.trading=n;
 $('#trT').textContent=n.name+' · '+PROF[n.prof].n;
 $('#trS').textContent=subText(n);
 renderTrade();$('#trade').hidden=false;HG.snd('ui_open');HG.unlock(true);
}
function closeTrade(){
 if($('#trade').hidden)return;
 $('#trade').hidden=true;G.trading=null;HG.snd('ui_close');if(ui.state==='play'){ui.relock=true;HG.lock()}
}
function buy(i){
 const n=G.trading;if(!n)return;
 const d=n.deals[i];if(!d||d.t!=='o'||d.lim<=0)return;
 const o=PROF[n.prof].offers[d.k],c=cst(o);
 if(!Object.keys(c).every(k=>count(k)>=c[k])){HG.toast('Yeterli eşya yok.');return}
 if(!canAdd(o.give[0],o.give[1])){HG.toast('Envanter dolu.');return}
 for(const k in c)take(k,c[k]);
 add(o.give[0],o.give[1]);d.lim--;
 HG.flag('traded');G.stats.traded++;HG.xpGain(1.5);HG.snd('craft');HG.feed('+'+o.give[1]+' '+IT[o.give[0]].n);
 renderTrade();
}
function sell(i,all){
 const n=G.trading;if(!n)return;
 const d=n.deals[i];if(!d||d.t!=='b'||d.lim<=0)return;
 const id=d.k,have=count(id),c=Math.min(all?have:1,d.lim,have);if(!c)return;
 const pr=priceOf(n,id);
 if(!canAdd('coin',c*pr)){HG.toast('Envanter dolu.');return}
 take(id,c);add('coin',c*pr);d.lim-=c;HG.flag('traded');G.stats.traded++;HG.xpGain(.6*c);HG.snd('craft');HG.feed('+'+c*pr+' '+IT.coin.n);
 $('#trS').textContent=subText(n);renderTrade();
}
function talkNpc(){
 const n=G.nearNpc;if(!n||ui.state!=='play')return false;
 openTrade(n);return true;
}
/* ---- uyku tulumu: geceyi güvenli yerde geçirir ---- */
function sleep(bed){
 if(ui.sleeping)return;
 if(G.blood){HG.toast('Kan Ayı gecesinde uyunamaz. Sabaha kadar dayanmak gerekir.');return}
 if(daylight()>.35){HG.toast('Henüz akşam olmadı. Uyumak için gece olmalı.');return}
 const nearVil=(G.villages||[]).some(v=>Math.hypot(v.cx-G.px,v.cy-G.py)<14);
 if(!(G.sheltered||G.nearFire||nearVil)){HG.toast('Açıkta uyumak güvenli değil: barınak, kamp ateşi veya köy yakınında kullan.');return}
 for(const a of G.animals||[]){
  if(a.dying)continue;const def=HG.ANIMAL[a.t],d=Math.hypot(a.x-G.px,a.z-G.py);
  if((def.foe&&!a.fake&&d<40)||(a.t==='wolf'&&d<30&&!G.sheltered)){HG.toast('Yakında tehlike var, uyuyamazsın.');return}
 }
 ui.sleeping=true;const f=$('#fade');f.classList.add('on');HG.snd('ui_open');
 setTimeout(()=>{
  const fr=G.clock/HG.DAY,k=Math.floor(fr);let tg=(k+.02)*HG.DAY;if(tg<=G.clock)tg=(k+1.02)*HG.DAY;
  G.clock=tg;
  G.hun=Math.max(Math.min(G.hun,5),G.hun-(bed?15:22));G.thr=Math.max(Math.min(G.thr,5),G.thr-(bed?18:26));
  G.stam=100;G.san=Math.min(100,G.san+(bed?75:50));G.hp=Math.min(100,G.hp+(bed?30:15));
  if(G.sheltered||G.nearFire||nearVil)G.warm=Math.max(G.warm,bed?85:70);
  for(const a of G.animals||[])if(HG.ANIMAL[a.t].foe&&!a.dying){a.gone=true;a.dying=.001}
  HG.flag('slept');if(bed)HG.flag('slept_bed');HG.toast(bed?'Sabah oldu. Yatakta iyice dinlendin.':'Sabah oldu. Dinlenerek uyandın.');
  setTimeout(()=>{f.classList.remove('on');ui.sleeping=false},500);
 },1000);
}
function init(){
 const t=$('#trL');
 if(t)t.addEventListener('click',e=>{const b=e.target.closest('button[data-o]');if(b){buy(+b.dataset.o);$('#trS').textContent=subText(G.trading);return}const q=e.target.closest('button[data-s]');if(q)sell(+q.dataset.s,false);const w=e.target.closest('button[data-sa]');if(w)sell(+w.dataset.sa,true)});
 const x=$('#trX');if(x)x.onclick=closeTrade;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
const makeNpcsW=vs=>makeNpcs(vs);
Object.assign(HG,{renderTrade,sleep,PROF,makeNpcs:makeNpcsW,npcSave,npcLoad,updateNpcs,talkNpc,closeTrade,openTrade});
})();
