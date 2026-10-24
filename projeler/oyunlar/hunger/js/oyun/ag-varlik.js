/* Hunger 3D - co-op: canlılar, köylüler, savaş ve ortak uyku.
   Ev sahibi hayvanları, gölgeleri ve köylüleri yürütür; her canlı en yakın oyuncuyu hedef alır (oyuncu değişimi: G.px/G.py geçici olarak o oyuncunun değerlerine çevrilir).
   Konuk canlıların konumlarını ev sahibinden alır ve yumuşatarak gösterir; vuruşlarını ev sahibine bildirir, ona yönelen hasarı ev sahibinden alır. */
(()=>{
'use strict';
const {G,ui,look,ANIMAL,inp}=HG;
const sc=HG.sc,net=HG.net,FL=net.FL;
const now=()=>performance.now();
const r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100;
const isH=()=>HG.coop.mode==='host',isG=()=>HG.coop.mode==='guest';
const readyRecs=()=>HG.remote.filter(r=>r.P&&r.P.ready);
const active=()=>isG()?!!(net.hostP&&net.hostP.ready):(isH()&&readyRecs().length>0);
HG.coopActive=active;
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};
const fx=(P,k,a)=>{if(P)net.sendTo(P,{t:'fx',k,a})};

/* ============================================================ Ev sahibi: oyuncu değişimi ============================================================ */
const ctx={on:false,id:'',rec:null,none:false,s:null};
function hostXZ(){return ctx.on&&ctx.rec&&ctx.s?{x:ctx.s.px,z:ctx.s.py}:{x:G.px,z:G.py}}
function hostAlive(){const st=ctx.on&&ctx.s?ctx.s.st:ui.state;return st!=='dead'&&st!=='menu'&&G.hp>0}
/* Canlı oyuncular: {id,x,z,rec} (rec null ise ev sahibi) */
function players(){
 const L=[],h=hostXZ();
 if(hostAlive())L.push({id:'me',x:h.x,z:h.z,rec:null});
 for(const r of HG.remote)if(r.P&&r.P.ready&&r.alive&&r.hp>0)L.push({id:r.id,x:r.x,z:r.z,rec:r});
 return L;
}
/* Kare başına bir kez hesaplanan oyuncu listesi (yüzlerce canlı için yeniden ayrılmaz) */
let plC=null,plT=NaN;
function playersC(){if(plC&&plT===G.clock&&!ctx.on)return plC;const L=players();if(!ctx.on){plC=L;plT=G.clock}return L}
function pick(a){
 const L=playersC();if(!L.length)return null;
 let best=null,bd=1e9;
 for(const p of L){const d=Math.hypot(a.x-p.x,a.z-p.z);if(d<bd){bd=d;best=p}}
 if(a.tgt&&best&&best.id!==a.tgt){                                  /* hedef sık sık değişmesin */
  const cur=L.find(p=>p.id===a.tgt);
  if(cur&&Math.hypot(a.x-cur.x,a.z-cur.z)<bd*1.3+3)best=cur;
 }
 if(best)a.tgt=best.id;
 return best;
}
function begin(p){
 if(ctx.on)end();
 const s=ctx.s={st:ui.state,px:G.px,py:G.py,pz:G.pz,swim:G.swim,raft:G.onRaft,sh:G.sheltered,tl:G.torchLit,sp:G.sprint,mv:G.moving,head:G.head,yw:look.yaw,pt:look.pitch,nz:HG.noiseT,fear:sc.fear};
 ctx.on=true;ctx.id=p?p.id:'';ctx.rec=p&&p.rec||null;ctx.none=!p;
 if(p&&ui.state!=='play')ui.state='play';
 const r=ctx.rec;
 if(r){
  G.px=r.x;G.py=r.z;G.pz=r.y==null?undefined:r.y;
  G.swim=!!(r.fl&FL.SW);G.onRaft=!!(r.fl&FL.RF);G.sheltered=!!(r.fl&FL.SH);G.torchLit=!!(r.fl&FL.TL);
  G.sprint=!!(r.fl&FL.SP);G.moving=!!(r.fl&FL.MV);G.head=!!(r.fl&FL.HD);
  look.yaw=r.yaw;look.pitch=r.pitch;HG.noiseT=r.noiseT||0;
 }
}
function end(){
 if(!ctx.on)return;
 const s=ctx.s,r=ctx.rec;
 if(r){
  G.px=s.px;G.py=s.py;G.pz=s.pz;G.swim=s.swim;G.onRaft=s.raft;G.sheltered=s.sh;G.torchLit=s.tl;G.sprint=s.sp;G.moving=s.mv;G.head=s.head;
  look.yaw=s.yw;look.pitch=s.pt;r.noiseT=HG.noiseT;HG.noiseT=s.nz;sc.fear=s.fear;
 }
 if(ui.state==='play'&&s.st!=='play')ui.state=s.st;
 ctx.on=false;ctx.rec=null;ctx.s=null;ctx.id='';ctx.none=false;
}
/* hayvanlar.js döngüsü her canlıdan önce çağırır; son canlıdan sonra HG.coopExit çağrılır */
HG.coopEnter=a=>{
 if(ctx.on)end();
 if(!isH()||a.dying||!HG.remote.length)return;
 if(a.pet){const h=playersC().find(p=>!p.rec);begin(h||null);return}
 begin(pick(a));
};
HG.coopExit=end;
HG.coopPlay=()=>isH()&&active()&&playersC().length>0;
/* Başka bir oyuncuya (şu anki hedef dışında) r içinde mi? */
HG.coopOther=(a,r)=>{
 if(!isH()||!active())return false;
 for(const p of players())if(p.id!==ctx.id&&Math.hypot(a.x-p.x,a.z-p.z)<r)return true;
 return false;
};
HG.coopFoe=a=>{                                          /* gölge şu anki oyuncudan uzak ama bir başkasına yakınsa o oyuncunun sayılır */
 if(!isH()||!active())return false;
 if(Math.hypot(a.x-G.px,a.z-G.py)<=80)return false;
 return HG.coopOther(a,80);
};

/* ---- Oyuncuya yönelik etkiler: hedef konuksa konuğa iletilir ---- */
const FXK=['hurt','toast','feed','flag','addSan','xpGain','useStam'];
for(const k of FXK){
 const f=HG[k];if(typeof f!=='function')continue;
 HG[k]=function(){
  if(ctx.on&&ctx.rec){fx(ctx.rec.P,k,Array.prototype.slice.call(arguments));return}
  if(ctx.on&&ctx.none&&(k==='hurt'||k==='useStam'))return;
  if(k==='hurt'&&wake)cancelSleep();
  return f.apply(this,arguments);
 };
}
{
 const f=HG.onKill;
 HG.onKill=function(a,def){
  if(ctx.on&&ctx.rec){fx(ctx.rec.P,'kill',[a.t,a.fake?1:0]);return}
  return f.apply(this,arguments);
 };
}
{
 const f=HG.snd;
 HG.snd=function(k,pos,x){
  if(ctx.on&&ctx.id){
   if(ctx.rec){
    if(!pos){fx(ctx.rec.P,'snd',[k]);return}
    fx(ctx.rec.P,'snd',[k,r2(pos.x),r2(pos.z),pos.y===undefined?null:r2(pos.y)]);
    const h=hostXZ();if(Math.hypot(pos.x-h.x,pos.z-h.z)>90)return;
   }else if(pos){
    for(const r of readyRecs())if(Math.hypot(pos.x-r.x,pos.z-r.z)<90)fx(r.P,'snd',[k,r2(pos.x),r2(pos.z),pos.y===undefined?null:r2(pos.y)]);
   }
  }
  return f.call(this,k,pos,x);
 };
}
/* ---- Ev sahibi: gölge yönetmeni ve deniz canlıları her oyuncu için ayrı çalışır ---- */
{
 const uf=HG.updateFoes;
 HG.updateFoes=function(dt){
  if(!isH()||!active())return uf.call(this,dt);
  for(const p of players()){
   begin(p);
   const r=p.rec,ft=G.foeT,ws=G.watchSp;
   if(r){G.foeT=r.foeT;G.watchSp=r.watchSp}
   try{uf.call(this,dt)}finally{if(r){r.foeT=G.foeT;r.watchSp=G.watchSp;G.foeT=ft;G.watchSp=ws}end()}
  }
 };
 const us=HG.updateSea;
 HG.updateSea=function(dt){
  if(isG()){G.mask=HG.count('mask')>0;return}
  if(!isH()||!active())return us.call(this,dt);
  for(const p of players()){
   begin(p);
   const r=p.rec,st=G.seaT;
   if(r)G.seaT=r.seaT;
   try{us.call(this,dt)}finally{if(r){r.seaT=G.seaT;G.seaT=st}end()}
  }
 };
}
/* ---- Ev sahibi: konuğun vuruşu ---- */
const byId=id=>(G.animals||[]).find(a=>a.id===id);
net.on('hit',(m,P)=>{
 if(!isH()||!P.rec||!P.ready)return;
 const a=byId(m.id);if(!a||a.dying)return;
 const rec=P.rec;
 if(Math.hypot(a.x-rec.x,a.z-rec.z)>90)return;
 let d=+m.d;if(!(d>0))return;d=Math.min(d,400);
 let h=null;if(m.h&&isFinite(m.h.x)&&isFinite(m.h.y)&&isFinite(m.h.z))h={x:+m.h.x,y:+m.h.y,z:+m.h.z};
 begin({id:rec.id,x:rec.x,z:rec.z,rec});
 try{HG.hitAnimal(a,d,h)}finally{end()}
});
/* ---- Konuk: vuruş ev sahibine iletilir; yerel geri bildirim (sayı, kan, ses) olduğu gibi çalışır ---- */
{
 const h0=HG.hitAnimal;
 HG.hitAnimal=function(a,dmg,hit){
  if(!isG()||!a||!a.id||a.pet||!net.hostP)return h0.apply(this,arguments);
  if(a.dying)return;
  const hp0=a.hp;a.hp=hp0+1e6;                          /* yerelde ölmesin: ölüm ev sahibinden gelir */
  let z;
  try{z=h0.apply(this,arguments)}finally{a.hp=hp0}
  net.sendTo(net.hostP,{t:'hit',id:a.id,d:r2(dmg),h:hit?{x:r2(hit.x),y:r2(hit.y),z:r2(hit.z)}:0});
  return z;
 };
}
/* ---- Konuk: ev sahibinin ileti ettiği etkiler ---- */
net.on('fx',(m)=>{
 if(!isG())return;
 const a=Array.isArray(m.a)?m.a:[];
 try{
  switch(m.k){
   case 'hurt':HG.hurt(+a[0]||0,String(a[1]||'').slice(0,80),a[2]&&isFinite(a[2].x)?{x:+a[2].x,z:+a[2].z}:undefined,+a[3]||0);break;
   case 'toast':HG.toast(String(a[0]||'').slice(0,160));break;
   case 'feed':HG.feed(String(a[0]||'').slice(0,160));break;
   case 'flag':HG.flag(String(a[0]||'').slice(0,40));break;
   case 'addSan':HG.addSan(+a[0]||0);break;
   case 'xpGain':HG.xpGain(+a[0]||0);break;
   case 'useStam':HG.useStam(+a[0]||0);break;
   case 'snd':HG.snd(String(a[0]||''),a[1]!=null?{x:+a[1],z:+a[2],y:a[3]!=null?+a[3]:undefined}:undefined);break;
   case 'kill':if(ANIMAL[a[0]])HG.onKill({t:a[0],fake:!!a[1]},ANIMAL[a[0]]);break;
  }
 }catch(e){console.error('fx',m.k,e)}
});

/* ============================================================ Canlı anlık görüntüleri (ev sahibi → konuk) ============================================================ */
const R_IN=100,R_OUT=118;
function enc(a){
 let f=0;
 if(a.dying)f|=1;if(a.gone)f|=2;if(a.sheared)f|=4;if(a.atkT>0)f|=8;if(a.hitT>0)f|=16;if(a.fake)f|=32;if(a.alerted)f|=64;
 if(a.charge>0)f|=128;if(a.pet)f|=256;if(a.panic>0)f|=512;if(a.wind>.1)f|=1024;if(a.flinch>0)f|=2048;if(a.cph===0)f|=4096;
 const e=[a.id,a.t,r2(a.x),r2(a.z),r2(a.yaw),r1(a.spd||0),Math.round(a.hp),f];
 if(a.by!==undefined)e.push(r2(a.by));
 return e;
}
function sendEn(P,full){
 const rec=P.rec;if(!rec||!rec.init)return;
 const prev=P.en||(P.en=new Map()),seen=new Set(),out=[];
 if(full)prev.clear();
 for(const a of G.animals||[]){
  const d=Math.hypot(a.x-rec.x,a.z-rec.z);
  if(d>(prev.has(a.id)?R_OUT:R_IN))continue;
  seen.add(a.id);
  const e=enc(a),sig=e.join(',');
  if(prev.get(a.id)!==sig){prev.set(a.id,sig);out.push(e)}
 }
 const rm=[];
 for(const id of prev.keys())if(!seen.has(id)){rm.push(id);prev.delete(id)}
 if(!out.length&&!rm.length)return;
 if(!out.length){net.sendTo(P,{t:'en',l:[],rm});return}
 for(let i=0;i<out.length;i+=100)net.sendTo(P,{t:'en',l:out.slice(i,i+100),rm:i===0&&rm.length?rm:undefined});
}
/* ---- Konuk: canlıların kurulumu ve yumuşatılması ---- */
const GE=new Map();
function applyEn(m){
 const L=G.animals||(G.animals=[]);
 if(m.rm&&m.rm.length){
  const s=new Set(m.rm);for(const id of m.rm)GE.delete(id);
  for(let k=L.length-1;k>=0;k--)if(s.has(L[k].id))L.splice(k,1);
 }
 for(const e of m.l||[]){
  if(!Array.isArray(e))continue;
  const id=e[0];let a=GE.get(id);
  if(!a){
   if(!ANIMAL[e[1]])continue;
   a=HG.makeAnimals([{t:e[1],x:+e[2],z:+e[3],yaw:+e[4],hp:Math.max(1,+e[6]||1)}])[0];
   if(!a)continue;
   a.id=id;a.spd=+e[5]||0;GE.set(id,a);L.push(a);
  }
  a.nx=+e[2];a.nz=+e[3];a.nyaw=+e[4];a.nspd=+e[5]||0;a.hp=+e[6];
  const f=e[7]|0;
  if((f&1)&&!a.dying)a.dying=.001;else if(!(f&1)&&a.dying)a.dying=0;
  a.gone=!!(f&2);a.sheared=!!(f&4);
  if((f&8)&&!a._fa)a.atkT=.45;a._fa=!!(f&8);
  if((f&16)&&!a._fh)a.hitT=.25;a._fh=!!(f&16);
  a.fake=!!(f&32);a.alerted=!!(f&64);a.charge=(f&128)?5:0;a.pet=!!(f&256);a.panic=(f&512)?3:0;a.wind=(f&1024)?.3:0;a.flinch=(f&2048)?1:0;
  a.cph=(f&4096)?0:undefined;
  if(e[8]!==undefined&&e[8]!==null)a.by=+e[8];
 }
}
net.on('en',(m)=>{if(isG())applyEn(m)});
let fearAcc=0;
function guestEntities(dt){
 const L=G.animals;if(!L)return;
 const k=1-Math.exp(-dt*11),ks=Math.min(1,8*dt);
 let near=99,seenNear=false;
 const cos=HG.inView,los=HG.los,play=ui.state==='play';
 for(const a of L){
  const def=ANIMAL[a.t];if(!def)continue;
  if(a.nx!==undefined){
   const dx=a.nx-a.x,dz=a.nz-a.z;
   if(dx*dx+dz*dz>49){a.x=a.nx;a.z=a.nz}else{a.x+=dx*k;a.z+=dz*k}
   a.yaw+=angDiff(a.yaw,a.nyaw)*k;
  }
  a.kx=a.kz=0;
  a.spd+=((a.nspd||0)-a.spd)*ks;
  a.walk+=a.spd*dt*3.2;
  if(a.hitT>0)a.hitT-=dt;if(a.atkT>0)a.atkT-=dt;
  if(a.dying){a.dying+=dt;if(a.gone)a.dying+=dt}
  if(def.foe){
   a.born=Math.min(1,(a.born||0)+dt/1.5);
   if(!a.dying&&!a.fake){
    const dp=Math.hypot(a.x-G.px,a.z-G.py);
    const inV=dp<48&&cos(a.x,a.z,.66)&&los(G.px,G.py,a.x,a.z);
    a.seen=inV;
    if(inV&&!a.spotted){a.spotted=true;if(dp<40&&play)HG.snd('stinger')}
    if(!inV)a.spotted=a.spotted&&dp<60;
    if(dp<near){near=dp;seenNear=inV}
   }
  }
 }
 /* korku göstergesi (ev sahibindeki foeAI ile aynı ölçüt) */
 const tf=near<32?Math.min(1,Math.max(0,1-near/32))*(seenNear?1:.75):0;
 sc.fear+=(tf-sc.fear)*(1-Math.exp(-dt*(tf>sc.fear?1.6:.35)));
}
{
 const ua=HG.updateAnimals;
 HG.updateAnimals=function(dt){
  if(isG())return guestEntities(dt);
  return ua.call(this,dt);
 };
}

/* ============================================================ Köylüler ============================================================ */
const npcKey=(n,i)=>n.trader?'t':i;
const npcSig=n=>n.deals.map(d=>d.t+d.k+':'+d.lim).join('|');
function npcFlags(n){return (n.sleep?1:0)|(n.inside?2:0)|(n.anger>0?4:0)}
function sendNp(P,full){
 const prev=P.np||(P.np=new Map()),out=[];
 if(full)prev.clear();
 let tr=null;
 (G.npcs||[]).forEach((n,i)=>{
  const e=[npcKey(n,i),r2(n.x),r2(n.z),r2(n.yaw),r1(n.spd||0),npcFlags(n)];
  if(n.trader)tr={nm:n.name};
  const sig=e.join(',');
  if(prev.get(e[0])!==sig){prev.set(e[0],sig);out.push(e)}
 });
 const had=prev.has('t');
 if(!tr&&had){prev.delete('t');net.sendTo(P,{t:'np',l:out,tr:0});return}
 if(!out.length)return;
 net.sendTo(P,{t:'np',l:out,tr:tr||undefined});
}
function sendNd(P,full){
 const prev=P.nd||(P.nd=new Map()),out=[];
 if(full)prev.clear();
 (G.npcs||[]).forEach((n,i)=>{
  const k=npcKey(n,i),sig=npcSig(n);
  if(prev.get(k)!==sig){prev.set(k,sig);out.push([k,n.deals.map(d=>[d.t,d.k,d.lim]),Math.round(n.refresh||0)])}
 });
 if(out.length)net.sendTo(P,{t:'nd',l:out});
}
function mkTrader(nm,x,z){
 return {id:9001+((Math.random()*500)|0),vi:-1,prof:'trader',name:String(nm||'Cemil').slice(0,16),f:false,trader:true,house:{x,z,dX:x,dZ:z,ex:0,ey:1},x,z,hx:x,hz:z,yaw:0,walk:0,spd:0,tm:0,moving:false,tx:x,tz:z,inside:false,deals:[],refresh:0,sleep:false};
}
function npcByKey(k){
 if(k==='t')return (G.npcs||[]).find(n=>n.trader)||null;
 return (G.npcs||[])[k]||null;
}
net.on('np',(m)=>{
 if(!isG()||!G.npcs)return;
 for(const e of m.l||[]){
  if(!Array.isArray(e))continue;
  let n=npcByKey(e[0]);
  if(!n&&e[0]==='t'&&m.tr){n=mkTrader(m.tr.nm,+e[1],+e[2]);G.npcs.push(n)}
  if(!n)continue;
  n.nx=+e[1];n.nz=+e[2];n.nyaw=+e[3];n.nspd=+e[4];
  const f=e[5]|0;n.sleep=!!(f&1);n.inside=!!(f&2);n.anger=(f&4)?3:0;
  if(n.px0===undefined){n.x=n.nx;n.z=n.nz;n.yaw=n.nyaw;n.px0=1}
 }
 if(m.tr===0){
  const t=G.npcs.findIndex(n=>n.trader);
  if(t>=0){if(G.trading===G.npcs[t])HG.closeTrade();G.npcs.splice(t,1)}
 }
 if(m.tr&&m.tr.nm){const t=npcByKey('t');if(t)t.name=String(m.tr.nm).slice(0,16)}
});
net.on('nd',(m)=>{
 if(!isG()||!G.npcs)return;
 for(const e of m.l||[]){
  if(!Array.isArray(e)||!Array.isArray(e[1]))continue;
  const n=npcByKey(e[0]);if(!n)continue;
  const P=HG.PROF[n.prof];if(!P)continue;
  const d=e[1].filter(x=>Array.isArray(x)&&(x[0]==='o'?P.offers[x[1]]:P.buy[x[1]])).map(x=>({t:x[0],k:x[0]==='o'?+x[1]:x[1],lim:Math.max(0,+x[2]||0)}));
  n.deals=d;n.refresh=+e[2]||0;n._sd=npcSig(n);
  if(G.trading===n&&HG.renderTrade&&!document.getElementById('trade').hidden)HG.renderTrade();
 }
});
/* Konuk takasta bir hak harcadığında ev sahibine bildirir; ev sahibi en düşük hakkı korur */
net.on('ng',(m,P)=>{
 if(!isH()||!P.ready||!Array.isArray(m.d))return;
 const n=npcByKey(m.k);if(!n)return;
 m.d.forEach((x,i)=>{
  const d=n.deals[i];
  if(Array.isArray(x)&&d&&d.t===x[0]&&String(d.k)===String(x[1])&&isFinite(x[2]))d.lim=Math.max(0,Math.min(d.lim,+x[2]|0));
 });
});
function guestTradeWatch(){
 const n=G.trading;if(!n||!n.deals||!net.hostP)return;
 const s=npcSig(n);
 if(n._sd===undefined){n._sd=s;return}
 if(s!==n._sd){
  n._sd=s;
  const i=(G.npcs||[]).indexOf(n);
  net.sendTo(net.hostP,{t:'ng',k:npcKey(n,i),d:n.deals.map(d=>[d.t,d.k,d.lim])});
 }
}
let discT=0;
function guestNpcs(dt){
 const L=G.npcs;if(!L)return;
 G.nearNpc=null;let best=3.4;
 const k=1-Math.exp(-dt*9),ks=Math.min(1,8*dt);
 for(const n of L){
  if(n.nx!==undefined){
   const dx=n.nx-n.x,dz=n.nz-n.z;
   if(dx*dx+dz*dz>25){n.x=n.nx;n.z=n.nz}else{n.x+=dx*k;n.z+=dz*k;n.walk+=Math.hypot(dx*k,dz*k)*3}
   n.yaw+=angDiff(n.yaw,n.nyaw)*k;
  }
  n.spd+=((n.nspd||0)-n.spd)*ks;
  const dp=Math.hypot(G.px-n.x,G.py-n.z);
  if(dp<best){best=dp;G.nearNpc=n}
 }
 guestTradeWatch();
 discT-=dt;
 if(discT<=0){
  discT=2;
  (G.villages||[]).forEach((v,i)=>{if(!G.flags['v'+i]&&Math.hypot(v.cx-G.px,v.cy-G.py)<36){G.flags['v'+i]=1;HG.flag('vfound');HG.toast(v.name+' köyünü buldun.')}});
 }
 if(G.trading&&Math.hypot(G.trading.x-G.px,G.trading.z-G.py)>6)HG.closeTrade();
}
{
 const un=HG.updateNpcs;
 HG.updateNpcs=function(dt){
  if(isG())return guestNpcs(dt);
  return un.call(this,dt);
 };
}
/* Konuk, kendi tarayıcı kaydını ev sahibinin dünyasıyla ezmesin */
{
 const sv=HG.save;
 HG.save=function(){if(isG())return false;return sv.apply(this,arguments)};
}

/* ============================================================ Ortak uyku ============================================================ */
let wake=null;
function cancelSleep(){
 if(!wake)return;
 wake=null;ui.sleeping=false;
 const f=document.getElementById('fade');if(f)f.classList.remove('on');
 HG.toast('Uyku iptal edildi.');
}
function runWake(){const w=wake;wake=null;if(w)w()}
{
 const sl=HG.sleep;
 HG.sleep=function(bed){
  if(!active())return sl.apply(this,arguments);
  if(wake||ui.sleeping)return;
  const st=window.setTimeout;let w0=null;
  window.setTimeout=function(f,ms){if(ms===1000&&!w0){w0=f;return 0}return st.apply(window,arguments)};
  try{sl.apply(this,arguments)}finally{window.setTimeout=st}
  if(!ui.sleeping||!w0)return;
  wake=w0;
  HG.toast('Uyku: diğer oyuncu da uyuyunca sabah olur. İptal için Esc veya hareket tuşu.');
  checkWake();
 };
}
function allAsleep(){
 if(!(wake&&ui.sleeping))return false;
 for(const r of readyRecs())if(r.alive&&r.hp>0&&!(r.fl&FL.SL))return false;
 return true;
}
function checkWake(){
 if(!isH()||!wake)return;
 if(allAsleep()){net.send({t:'wake'});runWake()}
}
net.on('wake',()=>{if(isG())runWake()});
addEventListener('keydown',e=>{
 if(wake&&(e.code==='Escape'||e.code==='KeyW'||e.code==='KeyA'||e.code==='KeyS'||e.code==='KeyD'||e.code==='Space'))cancelSleep();
},true);

/* ============================================================ Duraklatma, harita ve uyku sırasında dünya akışı ============================================================ */
function worldOnly(dt){
 G.clock+=dt;
 try{
  HG.updateDrops(dt);HG.updateAnimals(dt);HG.updateSea(dt);HG.updateNpcs(dt);
 }finally{end()}
 net.pump(dt);
}
HG.coopIdle=function(dt){
 if(!active()||HG.busy)return;
 const st=ui.state;
 if(st==='dead'){worldOnly(dt);return}
 if(st!=='pause'&&st!=='play')return;
 const keys=Object.assign({},inp.keys),md=inp.mouseDown,ta=inp.touchAct,tj=inp.touchJump,joy=inp.joy?Object.assign({},inp.joy):null;
 for(const k in inp.keys)inp.keys[k]=false;
 inp.mouseDown=false;inp.touchAct=false;inp.touchJump=false;
 if(inp.joy){inp.joy.x=0;inp.joy.y=0}
 ui.state='play';
 try{HG.update(dt)}
 finally{
  for(const k in keys)inp.keys[k]=keys[k];
  inp.mouseDown=md;inp.touchAct=ta;inp.touchJump=tj;
  if(joy&&inp.joy){inp.joy.x=joy.x;inp.joy.y=joy.y}
  if(ui.state==='play')ui.state=st;
 }
};
{
 const u0=HG.update;
 HG.update=function(dt){
  try{u0.call(this,dt)}finally{end()}
  if(wake&&!active()&&isH())runWake();
 };
}

/* ============================================================ Başlangıç, taban ve zamanlayıcılar ============================================================ */
net.baselines.push(()=>{
 GE.clear();
 if(isG()){
  if(G.animals)G.animals.length=0;else G.animals=[];
  for(const n of G.npcs||[]){n._sd=npcSig(n);n.px0=undefined;n.nx=undefined}
  discT=0;
 }
});
net.initFns.push((P)=>{
 if(!isH()||!P.rec)return;
 P.en=null;P.np=null;P.nd=null;
 sendEn(P,true);sendNp(P,true);sendNd(P,true);
});
let enT=0,npT=0,ndT=0;
net.tick((dt)=>{
 if(isH()){
  enT-=dt;npT-=dt;ndT-=dt;
  if(enT<=0){enT=.125;for(const r of readyRecs())sendEn(r.P,false)}
  if(npT<=0){npT=.25;for(const r of readyRecs())sendNp(r.P,false)}
  if(ndT<=0){ndT=1;for(const r of readyRecs())sendNd(r.P,false)}
  checkWake();
 }
});
net.on('bye',()=>{if(wake&&isH())setTimeout(()=>{if(!active())runWake()},50)});
})();
