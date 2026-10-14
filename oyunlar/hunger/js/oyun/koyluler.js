/* Hunger 3D - köyler: köylülerin meslekleri, gezinmesi, takas dükkânı (stok zamanla yenilenir, bazen hiç olmaz) */
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
  buy:{wood:1,stone:1,bone:1,leather:2}},
 hunter:{n:'Avcı',hi:'Av mevsimi hiç bitmez.',offers:[
  {give:['arrow',5],cost:{bone:2},max:10,ev:[100,220],ch:.7},
  {give:['cmeat',2],cost:{meat:2},max:4,ev:[90,200],ch:.7},
  {give:['bow',1],cost:{leather:3,wood:2},max:1,ev:[500,900],ch:.35},
  {give:['arrow',6],cost:{coin:3},max:12,ev:[120,260],ch:.7}],
  buy:{leather:3,bone:2,meat:2,wool:2}},
 fisher:{n:'Balıkçı',hi:'Sular bugün cömert mi, bakalım.',offers:[
  {give:['wbottle',2],cost:{wood:1},max:4,ev:[80,180],ch:.75},
  {give:['cfish',2],cost:{stone:2},max:4,ev:[100,220],ch:.65},
  {give:['rod',1],cost:{wood:4},max:1,ev:[600,1000],ch:.3},
  {give:['bottle',2],cost:{sand:2},max:4,ev:[120,260],ch:.6},
  {give:['rod',1],cost:{coin:7},max:1,ev:[500,900],ch:.4}],
  buy:{fish:2,sand:1,wood:1,coconut:2}},
 smith:{n:'Demirci',hi:'Ocak sönmez, kömür getir.',offers:[
  {give:['copper_ingot',1],cost:{coal:4},max:2,ev:[200,420],ch:.5},
  {give:['iron_ingot',1],cost:{coal:6,stone:3},max:1,ev:[350,700],ch:.4},
  {give:['pick1',1],cost:{stone:3,wood:2},max:1,ev:[400,800],ch:.4},
  {give:['iron_ingot',1],cost:{coin:9},max:2,ev:[300,600],ch:.45},
  {give:['pick2',1],cost:{coin:26},max:1,ev:[900,1500],ch:.25},
  {give:['axe2',1],cost:{coin:24},max:1,ev:[900,1500],ch:.25}],
  buy:{coal:2,copper_ore:4,iron_ore:8,stone:1,copper_ingot:7,iron_ingot:12}},
 healer:{n:'Şifacı',hi:'Yaran varsa söyle.',offers:[
  {give:['bandage',2],cost:{wool:1},max:4,ev:[120,260],ch:.7},
  {give:['wbottle',1],cost:{berries:4},max:2,ev:[140,300],ch:.5},
  {give:['coat',1],cost:{leather:4,wool:2},max:1,ev:[700,1200],ch:.25},
  {give:['bandage',3],cost:{coin:4},max:6,ev:[120,260],ch:.6}],
  buy:{wool:3,berries:1,bone:1,milk:3}},
 woodcut:{n:'Oduncu',hi:'Odun varsa iş var.',offers:[
  {give:['torch',2],cost:{wood:2,coal:1},max:4,ev:[100,220],ch:.7},
  {give:['axe1',1],cost:{stone:3},max:1,ev:[500,900],ch:.4},
  {give:['door',1],cost:{wood:4},max:2,ev:[150,320],ch:.5},
  {give:['bag',1],cost:{coin:18},max:1,ev:[700,1200],ch:.35}],
  buy:{wood:2,coal:2,leather:2}},
 miner:{n:'Madenci',hi:'Dağ cömert, ama pahalı.',offers:[
  {give:['coal',4],cost:{wood:2},max:8,ev:[90,200],ch:.7},
  {give:['stone',5],cost:{wood:1},max:10,ev:[80,160],ch:.8},
  {give:['copper_ore',1],cost:{wood:6},max:2,ev:[300,600],ch:.4},
  {give:['iron_ore',1],cost:{wood:10},max:2,ev:[500,900],ch:.25},
  {give:['pick1',1],cost:{coin:5},max:1,ev:[500,900],ch:.4}],
  buy:{coal:2,stone:1,copper_ore:4,iron_ore:8,sand:1}}
};
let nid=1;
function makeNpcs(vils){
 const L=[];
 (vils||[]).forEach((v,vi)=>{
  for(const n of v.npcs){
   const P=PROF[n.prof];
   L.push({id:nid++,vi,prof:n.prof,name:n.name,f:!!n.f,house:v.houses[n.h],x:n.x,z:n.z,hx:n.x,hz:n.z,yaw:n.yaw,walk:0,spd:0,tm:rnd()*4,moving:false,tx:n.x,tz:n.z,inside:false,
    stock:P.offers.map(o=>({n:rnd()<.35?0:R(1,o.max),at:R(o.ev[0],o.ev[1])}))});
  }
 });
 return L;
}
const npcSave=()=>(G.npcs||[]).map(n=>n.stock.map(s=>[s.n,Math.round(s.at)]));
function npcLoad(arr){
 if(!Array.isArray(arr)||!G.npcs)return;
 G.npcs.forEach((n,i)=>{const a=arr[i];if(Array.isArray(a)&&a.length===n.stock.length)a.forEach((v,k)=>{n.stock[k].n=+v[0]||0;n.stock[k].at=+v[1]||0})});
}
function walkableN(x,z){
 const r=.3;
 for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]){
  const tx=Math.floor(x+dx),tz=Math.floor(z+dz);
  if(tx<1||tz<1||tx>=W-1||tz>=H-1)return false;
  const i=tz*W+tx;if(G.tile[i]<T.SAND||G.tile[i]===T.POND||(G.obj[i]&&G.obj[i]!==HG.O.DOOR&&G.obj[i]!==HG.O.VDOOR))return false;
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
  if(night||n.inside){
   /* gece evine çekilir, sabah çıkar */
   const ox=hs.dX+hs.ex*1.2,oz=hs.dZ+hs.ey*1.2,inH=Math.abs(n.x-hs.x)<2&&Math.abs(n.z-hs.z)<2;
   let tx,tz;
   if(night){
    if(inH){tx=hs.x-hs.ex*.3;tz=hs.z-hs.ey*.3;if(Math.hypot(tx-n.x,tz-n.z)<.35){tx=null}}
    else if(Math.hypot(ox-n.x,oz-n.z)>.7&&!(n.stage===1)){tx=ox;tz=oz}
    else{n.stage=1;tx=hs.x;tz=hs.z;if(Math.hypot(tx-n.x,tz-n.z)<.5){n.stage=0;tx=null}}
    n.inside=inH||n.stage===1;
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
  const d=angDiff(n.yaw,head);n.yaw+=clamp(d,-4*dt,4*dt);
  if(spd>0&&Math.abs(d)<1.2){
   const st=spd*dt,nx=n.x+Math.sin(n.yaw)*st,nz=n.z+Math.cos(n.yaw)*st;
   if(walkableN(nx,nz)&&Math.hypot(nx-G.px,nz-G.py)>.8){n.x=nx;n.z=nz;n.walk+=st*3}else{n.moving=false;n.tm=1}
  }else spd=0;
  n.spd+=(spd-n.spd)*Math.min(1,8*dt);
  if(dp<best){best=dp;G.nearNpc=n}
 }
 /* stok yenilenmesi: her ürünün kendi aralığı vardır; bazen hiç yenilenmez */
 restockT-=dt;
 if(restockT<=0){
  restockT=1;
  for(const n of L){
   const P=PROF[n.prof];
   n.stock.forEach((s,i)=>{
    if(G.clock<s.at)return;
    const o=P.offers[i];
    if(s.n<o.max&&rnd()<o.ch){s.n=Math.min(o.max,s.n+R(1,Math.max(1,Math.ceil(o.max/3))))}
    s.at=G.clock+R(o.ev[0],o.ev[1]);
   });
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
const cst=o=>{const c=Object.assign({},o.cost);if(c.coin)c.coin=Math.max(1,Math.round(c.coin*(1-.07*HG.perk('trade'))));return c};
const costText=c=>Object.keys(c).map(k=>`<span class="${count(k)>=c[k]?'ok':'no'}">${IT[k].n} ${count(k)}/${c[k]}</span>`).join(' · ');
const priceOf=(n,id)=>{const b=PROF[n.prof].buy[id],day=HG.dayNo?HG.dayNo():1;const m=.8+.4*HG.hash(day,n.vi*31+id.length*7+id.charCodeAt(0),77);return Math.max(1,Math.round(b*m*(1+.08*HG.perk('trade'))))};
function renderTrade(){
 const n=G.trading;if(!n)return;
 const P=PROF[n.prof];
 let h=HG.questHtml?HG.questHtml(n):'';
 h+='<h3>Takas</h3>';
 P.offers.forEach((o,i)=>{
  const s=n.stock[i],[id,q]=o.give,can=s.n>0&&Object.keys(cst(o)).every(k=>count(k)>=cst(o)[k]);
  h+=`<div class="rc${s.n?'':' lock'}"><img src="${ICON[id]}" alt=""><div><b>${IT[id].n}${q>1?' ×'+q:''}</b>${costText(cst(o))}<br><span class="${s.n?'ok':'no'}">${s.n?'Stok: '+s.n:'Tükendi'}</span></div><button type="button" data-o="${i}"${can?'':' disabled'}>Al</button></div>`;
 });
 const buy=PROF[n.prof].buy||{};
 h+='<h3>Satış (sikke kazan)</h3>';
 for(const id of Object.keys(buy)){
  const c=count(id),pr=priceOf(n,id);
  h+=`<div class="rc${c?'':' lock'}"><img src="${ICON[id]}" alt=""><div><b>${IT[id].n}</b><span class="${c?'ok':'no'}">Çantanda: ${c}</span><br><span>1 adet = ${pr} sikke</span></div><div class="sb"><button type="button" data-s="${id}"${c?'':' disabled'}>Sat</button><button type="button" class="ghost" data-sa="${id}"${c>1?'':' disabled'}>Hepsi</button></div></div>`;
 }
 $('#trL').innerHTML=h;
}
function openTrade(n){
 if(daylight()<.25){HG.toast(n.name+' uyuyor. Dükkân sabah açılır.');return}
 G.trading=n;
 $('#trT').textContent=n.name+' · '+PROF[n.prof].n;
 $('#trS').textContent=PROF[n.prof].hi+' · Sikken: '+count('coin');
 renderTrade();$('#trade').hidden=false;HG.snd('ui_open');HG.unlock(true);
}
function closeTrade(){
 if($('#trade').hidden)return;
 $('#trade').hidden=true;G.trading=null;HG.snd('ui_close');if(ui.state==='play'){ui.relock=true;HG.lock()}
}
function buy(i){
 const n=G.trading;if(!n)return;
 const o=PROF[n.prof].offers[i],s=n.stock[i];
 if(!s||s.n<=0)return;
 if(!Object.keys(cst(o)).every(k=>count(k)>=cst(o)[k])){HG.toast('Yeterli eşyan yok.');return}
 if(!canAdd(o.give[0],o.give[1])){HG.toast('Envanter dolu.');return}
 for(const k in cst(o))take(k,cst(o)[k]);
 add(o.give[0],o.give[1]);s.n--;
 if(s.n===0)s.at=G.clock+R(o.ev[0],o.ev[1]);
 HG.flag('traded');G.stats.traded++;HG.xpGain(1.5);HG.snd('craft');HG.feed('+'+o.give[1]+' '+IT[o.give[0]].n);
 renderTrade();
}
function sell(id,all){
 const n=G.trading;if(!n||!PROF[n.prof].buy[id])return;
 const c=all?count(id):Math.min(1,count(id));if(!c)return;
 if(!canAdd('coin',c*priceOf(n,id))){HG.toast('Envanter dolu.');return}
 take(id,c);add('coin',c*priceOf(n,id));HG.flag('traded');G.stats.traded++;HG.xpGain(.6*c);HG.snd('craft');HG.feed('+'+c*priceOf(n,id)+' '+IT.coin.n);
 $('#trS').textContent=PROF[n.prof].hi+' · Sikken: '+count('coin');renderTrade();
}
function talkNpc(){
 const n=G.nearNpc;if(!n||ui.state!=='play')return false;
 openTrade(n);return true;
}
/* ---- uyku tulumu: geceyi güvenli yerde geçirir ---- */
function sleep(){
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
  G.hun=Math.max(Math.min(G.hun,5),G.hun-22);G.thr=Math.max(Math.min(G.thr,5),G.thr-26);
  G.stam=100;G.san=Math.min(100,G.san+50);G.hp=Math.min(100,G.hp+15);
  if(G.sheltered||G.nearFire||nearVil)G.warm=Math.max(G.warm,70);
  for(const a of G.animals||[])if(HG.ANIMAL[a.t].foe&&!a.dying){a.gone=true;a.dying=.001}
  HG.flag('slept');HG.toast('Sabah oldu. Dinlenerek uyandın.');
  setTimeout(()=>{f.classList.remove('on');ui.sleeping=false},500);
 },1000);
}
function init(){
 const t=$('#trL');
 if(t)t.addEventListener('click',e=>{const b=e.target.closest('button[data-o]');if(b){buy(+b.dataset.o);$('#trS').textContent=PROF[G.trading.prof].hi+' · Sikken: '+count('coin');return}const q=e.target.closest('button[data-s]');if(q)sell(q.dataset.s,false);const w=e.target.closest('button[data-sa]');if(w)sell(w.dataset.sa,true)});
 const x=$('#trX');if(x)x.onclick=closeTrade;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
const makeNpcsW=vs=>makeNpcs(vs);
Object.assign(HG,{renderTrade,sleep,PROF,makeNpcs:makeNpcsW,npcSave,npcLoad,updateNpcs,talkNpc,closeTrade,openTrade});
})();
