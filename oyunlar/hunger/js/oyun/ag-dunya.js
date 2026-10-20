/* Hunger 3D - co-op dünya eşitlemesi.
   İki taraf da aynı haritayı taşır; değişiklikler olay olarak karşıya iletilir:
   - nesne değişikliği (HG.setObj günlüğü), düğüm hasarı (G.dmg), yeniden büyüme sayaçları (konuk → ev sahibi)
   - ortak durum tabloları: sandık/tabela/kovan (G.x2.s), tarla/kurutma rafı (G.ext.s), kamp sandıkları (G.x2.cc), kaya günlüğü, hazine listesi
   - Rust tarzı inşa parçaları (HG.RS.net), yerdeki eşyalar (benzersiz kimlikle), açılmış kamplar
   Konuk, ev sahibinin kaydıyla başlar ve ardından kişisel durumu (çanta, can, gelişim) sıfırlanır (HG.netBoot). */
(()=>{
'use strict';
const {G,ui,W,H,O,SLOTS}=HG;
const net=HG.net;
const now=()=>performance.now();
const r2=v=>Math.round(v*100)/100;
const live=()=>net.peers.some(P=>P.ready);
const isGuest=()=>HG.coop.mode==='guest';
const isHost=()=>HG.coop.mode==='host';

/* ============================================================ Konuğun başlangıcı ============================================================ */
/* Dünyayı belirleyen (ortak) G.x2 alanları; geri kalanı kişiseldir */
const SHARED=['s','rl','tr','cc','rs','insa','sp','wid'];
HG.netBoot=function(){
 if(HG.coop.mode!=='guest')return;
 const x=G.x2||{},keep={};
 for(const k of SHARED)if(x[k]!==undefined)keep[k]=x[k];
 const es=G.ext&&G.ext.s;
 HG.progInit();                                   /* gelişim, istatistik, G.x2, G.ext sıfırlanır */
 Object.assign(G.x2,keep);G.x2.init=1;
 if(G.ext){if(es)G.ext.s=es;G.ext.init=1}
 Object.assign(G,{hp:100,hun:92,thr:92,warm:100,stam:100,san:100,bleed:0,o2:100,torchFuel:360,torchLit:false,tired:false,arrows:[],
  inv:Array(SLOTS).fill(null),sel:0,flags:{},timers:[],wp:null,onRaft:false,cave:null,saveT:0});
 G.inv[0]={id:'rock',n:1};
 G.slot=null;
 if(HG.netCharLoad)HG.netCharLoad();
};

/* ============================================================ Nesneler ============================================================ */
let applying=false;
const objQ=new Map(),lp=new Map();
HG.on('obj',e=>{
 if(applying||G.cave||!live())return;
 objQ.set(e.i,e.v);
 if(e.v)lp.set(e.i,now());
});
const FELL=new Set([O.TREE,O.PALM,O.PALM0]),CRUMBLE=new Set([O.ROCK,O.COAL,O.COPPER,O.IRON]);
function visuals(i,was,v,rx,rz){
 if(v!==0)return;
 const x=i%W,y=(i/W)|0;
 try{
  if(FELL.has(was))HG.Scene.fell(x,y,was,rx===undefined?G.px:rx,rz===undefined?G.py:rz);
  else if(CRUMBLE.has(was))HG.Scene.crumble(x+.5,y+.5,was);
 }catch(e){}
}
function applyObj(l,P){
 if(!Array.isArray(l)||G.cave)return;
 const rx=P&&P.rec?P.rec.x:undefined,rz=P&&P.rec?P.rec.z:undefined;
 applying=true;
 try{
  for(let k=0;k+1<l.length;k+=2){
   const i=l[k],v=l[k+1];
   if(!(i>=0&&i<W*H)||G.obj[i]===v)continue;
   visuals(i,G.obj[i],v,rx,rz);
   HG.setObj(i,v);
  }
 }finally{applying=false}
 G.shelterCheck=0;
}
net.on('o',(m,P)=>applyObj(m.l,P));
net.on('ofull',(m)=>{
 let s;try{s=JSON.parse(m.raw)}catch(e){return}
 const b=HG.decObj({objr:s.objr},W*H);if(!b)return;
 const l=[];for(let i=0;i<b.length;i++)if(G.obj[i]!==b[i])l.push(i,b[i]);
 applying=true;try{for(let k=0;k<l.length;k+=2)HG.setObj(l[k],l[k+1])}finally{applying=false}
 G.objDirty=true;G.shelterCheck=0;
});

/* ---- düğüm hasarı ---- */
const lastD=new Map();
function pollDmg(){
 const d=G.dmg||{},out=[];
 for(const k in d){const f=Math.round(d[k]*1000);if(lastD.get(+k)!==f){lastD.set(+k,f);out.push(+k,f)}}
 for(const k of lastD.keys())if(!(k in d)){lastD.delete(k);out.push(k,0)}
 if(out.length)net.send({t:'d',l:out});
}
net.on('d',(m)=>{
 if(!Array.isArray(m.l)||G.cave)return;
 if(!G.dmg)G.dmg={};
 for(let k=0;k+1<m.l.length;k+=2){
  const i=m.l[k],f=m.l[k+1];
  if(f>0){
   G.dmg[i]=f/1000;lastD.set(i,f);
   const o=G.obj[i];
   if(o&&!FELL.has(o)){try{HG.Scene.setDamage(i,f/1000)}catch(e){}}
  }else{delete G.dmg[i];lastD.delete(i)}
 }
});

/* ---- yeniden büyüme sayaçları: konuk, ev sahibine bildirir ---- */
net.on('tm',(m)=>{
 if(!isHost()||!Array.isArray(m.l))return;
 for(const q of m.l)if(Array.isArray(q)&&q[0]>=0&&q[0]<W*H)G.timers.push({i:q[0],at:q[1],to:q[2],from:q[3]});
});

/* ============================================================ Ortak durum tabloları ============================================================ */
/* skip: yeni anahtarlar, bu taraf yapıyı kendisi yerleştirmediyse sessizce benimsenir (yerleştirme anında her iki taraf da varsayılan kayıt açar) */
const TB=[
 {n:'xs',map:true,skip:true,get:()=>HG.X2().s,set:v=>{HG.X2().s=v}},
 {n:'es',map:true,skip:true,get:()=>G.ext&&G.ext.s,set:v=>{if(G.ext)G.ext.s=v}},
 {n:'cc',map:true,get:()=>HG.X2().cc,set:v=>{HG.X2().cc=v}},
 {n:'rl',map:true,get:()=>HG.X2().rl,set:v=>{HG.X2().rl=v}},
 {n:'tr',get:()=>HG.X2().tr,set:v=>{HG.X2().tr=v}}
];
const TBN={};for(const t of TB){TBN[t.n]=t;t.last=t.map?new Map():''}
const sig=v=>JSON.stringify(v);
function tbBaseline(){
 for(const t of TB){
  if(t.map){t.last=new Map();const c=t.get()||{};for(const k in c)t.last.set(k,sig(c[k]))}
  else t.last=sig(t.get());
 }
}
function pollTables(){
 const tn=now();
 for(const [k,v] of lp)if(tn-v>20000)lp.delete(k);
 for(const t of TB){
  const c=t.get();if(!c)continue;
  if(!t.map){const s=sig(c);if(s!==t.last){t.last=s;net.send({t:'tb',n:t.n,v:c})}continue}
  const u={},d=[];let any=false;
  for(const k in c){
   const s=sig(c[k]);
   if(t.last.get(k)===s)continue;
   if(t.skip&&!t.last.has(k)){const q=lp.get(+k);if(!(q&&tn-q<12000)){t.last.set(k,s);continue}}
   t.last.set(k,s);u[k]=c[k];any=true;
  }
  for(const k of t.last.keys())if(!(k in c)){t.last.delete(k);d.push(k);any=true}
  if(any)net.send({t:'tb',n:t.n,u,d});
 }
}
function setEntry(cur,k,val){
 const old=cur[k];
 if(old&&typeof old==='object'&&val&&typeof val==='object'&&!Array.isArray(old)){          /* açık pencerelerin tuttuğu nesne korunur */
  for(const q of Object.keys(old))delete old[q];
  Object.assign(old,val);
 }else cur[k]=val;
}
function applyTable(m){
 const t=TBN[m.n];if(!t)return;
 if(!t.map){if(m.v!==undefined){t.set(m.v);t.last=sig(m.v);ui.dirty=true}return}
 let cur=t.get();if(!cur){t.set({});cur=t.get();if(!cur)return}
 if(m.full){for(const k of Object.keys(cur))if(!(k in (m.u||{})))delete cur[k]}
 for(const k in (m.u||{})){setEntry(cur,k,m.u[k]);t.last.set(k,sig(cur[k]))}
 for(const k of m.d||[]){delete cur[k];t.last.delete(k)}
 ui.dirty=true;
}
net.on('tb',applyTable);
net.on('tbfull',(m)=>{
 let b;try{b=JSON.parse(m.raw)}catch(e){return}
 for(const n in b)applyTable({n,full:true,u:TBN[n]&&TBN[n].map?b[n]:undefined,v:TBN[n]&&TBN[n].map?undefined:b[n]});
});

/* ============================================================ Rust tarzı inşa parçaları ============================================================ */
let lastRs=null,rsVer=-1;
const recKey=r=>{const [t,,l,i,j,d]=r;return t<=1?'c'+l+','+i+','+j:t<=6?'e'+l+','+d+','+i+','+j:'s'+l+','+i+','+j};
function pollRs(){
 const R=HG.RS;if(!R||!R.net)return;
 if(lastRs&&R.ver===rsVer)return;
 rsVer=R.ver;
 const cur=R.net.dump();
 if(!lastRs){lastRs=cur;return}
 const ups=[],dels=[];
 for(const [k,r] of cur){const o=lastRs.get(k);if(!o||o.join()!==r.join())ups.push(r)}
 for(const k of lastRs.keys())if(!cur.has(k))dels.push(k);
 lastRs=cur;
 if(ups.length||dels.length)net.send({t:'rs',u:ups,d:dels});
}
net.on('rs',(m)=>{
 const R=HG.RS;if(!R||!R.net||G.cave)return;
 if(!lastRs)lastRs=R.net.dump();
 R.net.apply(m.u,m.d);
 for(const r of m.u||[])lastRs.set(recKey(r),r);
 for(const k of m.d||[])lastRs.delete(k);
 G.shelterCheck=0;
});
net.on('rsfull',(m)=>{
 const R=HG.RS;if(!R||!R.net)return;
 let list;try{list=JSON.parse(m.raw)}catch(e){return}
 const have=R.net.dump(),keys=new Set(list.map(recKey)),dels=[];
 for(const k of have.keys())if(!keys.has(k))dels.push(k);
 R.net.apply(list,dels);
 lastRs=R.net.dump();rsVer=R.ver;
 G.shelterCheck=0;
});

/* ============================================================ Yerdeki eşyalar ============================================================ */
const dropU=new Map();
let dn=0;
const dpre=()=>isHost()?'h':'g';
const packDrop=d=>({u:d.u,id:d.id,n:d.n,x:r2(d.x),y:r2(d.y),z:r2(d.z),vx:r2(d.vx||0),vy:r2(d.vy||0),vz:r2(d.vz||0),r:d.rest?1:0,f:d.fl?1:0});
function mkDrop(q){
 if(!HG.IT[q.id]||!(q.n>0))return null;
 return {id:q.id,n:q.n,x:q.x,z:q.z,y:q.y,vx:q.vx||0,vz:q.vz||0,vy:q.vy||0,age:q.r?5:0,rest:!!q.r,fl:!!q.f,u:q.u};
}
function pollDrops(){
 const L=G.drops||[],add=[],upd=[],del=[],seen=new Set();
 for(const d of L){
  if(!d.u){d.u=dpre()+(++dn).toString(36);dropU.set(d.u,{n:d.n,rest:!!d.rest});add.push(packDrop(d));seen.add(d.u);continue}
  seen.add(d.u);
  const k=dropU.get(d.u);
  if(!k){dropU.set(d.u,{n:d.n,rest:!!d.rest});continue}
  if(k.n!==d.n){k.n=d.n;upd.push({u:d.u,n:d.n})}
  if(d.rest&&!k.rest){k.rest=true;upd.push({u:d.u,x:r2(d.x),y:r2(d.y),z:r2(d.z),r:1})}
 }
 for(const u of dropU.keys())if(!seen.has(u)){dropU.delete(u);del.push(u)}
 if(add.length||upd.length||del.length)net.send({t:'dr',a:add,u:upd,d:del});
}
function applyDrops(m){
 if(!G.drops)G.drops=[];
 const L=G.drops;
 for(const q of m.a||[]){
  if(!q||!q.u||dropU.has(q.u))continue;
  const d=mkDrop(q);if(!d)continue;
  L.push(d);dropU.set(d.u,{n:d.n,rest:!!d.rest});
 }
 for(const q of m.u||[]){
  const d=L.find(x=>x.u===q.u);if(!d)continue;
  const k=dropU.get(q.u);
  if(q.n!==undefined){d.n=q.n;if(k)k.n=q.n}
  if(q.r){d.x=q.x;d.y=q.y;d.z=q.z;d.vx=d.vy=d.vz=0;d.rest=true;if(k)k.rest=true}
 }
 for(const u of m.d||[]){
  const i=L.findIndex(x=>x.u===u);
  if(i>=0)L.splice(i,1);
  dropU.delete(u);
 }
}
net.on('dr',applyDrops);
net.on('drfull',(m)=>{
 let b;try{b=JSON.parse(m.raw)}catch(e){return}
 G.drops=[];dropU.clear();
 applyDrops({a:b});
});
/* Konuğun yerden alma isteği: ev sahibi karar verir */
net.on('pk',(m,P)=>{
 if(!isHost())return;
 const L=G.drops||[],i=L.findIndex(d=>d.u===m.u);
 if(i<0){net.sendTo(P,{t:'pkno',u:m.u});return}
 const d=L[i];L.splice(i,1);
 net.sendTo(P,{t:'pkok',u:m.u,id:d.id,n:d.n});
});
net.on('pkno',(m)=>{
 const L=G.drops||[],i=L.findIndex(d=>d.u===m.u);
 if(i>=0)L.splice(i,1);
 dropU.delete(m.u);G.nearDrop=null;
});
net.on('pkok',(m)=>{
 const L=G.drops||[],i=L.findIndex(d=>d.u===m.u);
 if(i>=0)L.splice(i,1);
 dropU.delete(m.u);G.nearDrop=null;
 if(!HG.IT[m.id])return;
 const left=HG.add(m.id,m.n);
 if(left<m.n){
  HG.flag('got_'+m.id);HG.feed('+'+(m.n-left)+' '+HG.IT[m.id].n);HG.snd('get');
  if(HG.extGot)HG.extGot(m.id,m.n-left);
 }
 if(left>0){
  HG.toast('Envanter dolu.');
  HG.spawnDrop(m.id,left,{x:G.px,z:G.py,y:(G.pz===undefined?HG.Scene.groundY(G.px,G.py):G.pz)+1,vx:0,vz:0});
 }
});
{
 const pk0=HG.pickupNearest;
 HG.pickupNearest=function(){
  if(!isGuest()||!live())return pk0.apply(this,arguments);
  const d=G.nearDrop;
  if(!d||!(G.drops||[]).includes(d))return false;
  if(!d.u||!dropU.has(d.u))return pk0.apply(this,arguments);
  if(d.pend&&now()-d.pend<1500)return true;
  d.pend=now();net.send({t:'pk',u:d.u});
  return true;
 };
}

/* ============================================================ Kamplar ============================================================ */
let lastCamps='';
const campSig=()=>(G.camps||[]).map(c=>c.open?1:0).join('');
function pollCamps(){const s=campSig();if(s!==lastCamps){lastCamps=s;net.send({t:'cp',s})}}
net.on('cp',(m)=>{
 (G.camps||[]).forEach((c,i)=>{if(m.s[i]==='1')c.open=true});
 lastCamps=campSig();
});

/* ============================================================ Mağara yasağı ============================================================ */
{
 const uc=HG.useCave;
 HG.useCave=function(){
  if(HG.coopLive()&&G.nearCave&&!G.nearCave.exit){HG.toast('Co-op oyunda mağaralara girilemez.');return true}
  return uc.apply(this,arguments);
 };
 const ec=HG.enterCave;
 HG.enterCave=function(){
  if(HG.coopLive()){HG.toast('Co-op oyunda mağaralara girilemez.');return false}
  return ec.apply(this,arguments);
 };
}

/* ============================================================ Ev sahibinden konuğa ilk aktarım ============================================================ */
net.initFns.push(P=>{
 /* kayıt alındığından beri yapılan nesne değişiklikleri */
 const ev=HG.journal.since(P.seq0||0);
 if(ev){
  const m=new Map();
  for(const e of ev)if(e.t==='obj')m.set(e.i,e.v);
  const l=[];for(const [i,v] of m)l.push(i,v);
  if(l.length)net.sendTo(P,{t:'o',l});
 }else net.sendBig(P,'ofull',{objr:HG.encObj(G.obj)});
 /* düğüm hasarı */
 {const out=[];const d=G.dmg||{};for(const k in d)out.push(+k,Math.round(d[k]*1000));if(out.length)net.sendTo(P,{t:'d',l:out})}
 /* ortak tablolar */
 {const b={};for(const t of TB)b[t.n]=t.get();net.sendBig(P,'tbfull',b)}
 /* inşa parçaları */
 if(HG.RS&&HG.RS.net){const m=HG.RS.net.dump();net.sendBig(P,'rsfull',Array.from(m.values()))}
 /* yerdeki eşyalar */
 {pollDrops();net.sendBig(P,'drfull',(G.drops||[]).filter(d=>d.u).map(packDrop))}
 net.sendTo(P,{t:'cp',s:campSig()});
});
net.baselines.push(()=>{
 tbBaseline();
 lastRs=null;rsVer=-1;
 lastD.clear();for(const k in (G.dmg||{}))lastD.set(+k,Math.round(G.dmg[k]*1000));
 dropU.clear();dn=0;
 if(isGuest())G.drops=[];                                   /* konuk: kayıttaki eşyalar ev sahibinin 'drfull' iletisiyle gelir */
 else for(const d of G.drops||[])delete d.u;
 lastCamps=campSig();
 objQ.clear();lp.clear();
 if(HG.RS&&HG.RS.net)lastRs=HG.RS.net.dump();
});

/* ============================================================ Her kare ============================================================ */
let objT=0,pollT=0,dropT=0;
net.tick((dt)=>{
 objT-=dt;
 if(objT<=0){
  objT=.08;
  if(objQ.size){const l=[];for(const [i,v] of objQ)l.push(i,v);objQ.clear();net.send({t:'o',l})}
 }
 pollT-=dt;
 if(pollT<=0){
  pollT=.35;
  try{pollDmg();pollTables();pollRs();pollCamps()}catch(e){console.error('ağ eşitleme',e)}
 }
 dropT-=dt;
 if(dropT<=0){dropT=.15;try{pollDrops()}catch(e){console.error('ağ eşyalar',e)}}
 /* konuk: yeniden büyüme sayaçlarını ev sahibine bırakır */
 if(isGuest()&&G.timers&&G.timers.length){
  net.send({t:'tm',l:G.timers.map(q=>[q.i,q.at,q.to,q.from])});
  G.timers.length=0;
 }
});
})();
