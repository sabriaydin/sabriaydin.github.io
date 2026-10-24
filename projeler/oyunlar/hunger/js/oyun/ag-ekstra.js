/* Hunger 3D - co-op ek özellikleri (güncelleme 64).
   Haritada arkadaş ve ortak hedef işareti · düşme/ayağa kalkma bildirimi · ortak hedef paylaşımı · "Ortak Çaba" başarımı ·
   konuğun kişisel durumunun (çanta, can, gelişim) dünya başına saklanıp yeniden katılınca geri yüklenmesi.
   Özgün co-op dosyalarına dokunmaz; yalnızca ağ katmanının olay ve kancalarını kullanır. */
(()=>{
'use strict';
const {G,ui,IT,clamp}=HG;
const net=HG.net;
const r2=v=>Math.round(v*100)/100;
const live=()=>HG.coopLive()&&net.peers.some(P=>P.ready);

/* ---------- Haritada arkadaş ve ortak hedef işareti ---------- */
{
 const m0=HG.extMapMarks;
 HG.extMapMarks=function(g,tx,ty,k,sz,seen){
  if(m0)m0.apply(this,arguments);
  if(!live()||G.cave)return;
  const s=Math.max(3.2,sz*.9);
  for(const r of HG.remote){
   if(!r.P||!r.P.ready)continue;
   const x=tx(r.x),y=ty(r.z);
   g.fillStyle=r.alive?'#59a8ff':'#8a8a92';g.strokeStyle='#fff';g.lineWidth=1.6;g.beginPath();g.arc(x,y,s,0,7);g.fill();g.stroke();
   if(sz>=4.5){g.font='700 11px system-ui,sans-serif';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;const t=String(r.name||'?').slice(0,12);g.strokeText(t,x,y-s-4);g.fillText(t,x,y-s-4)}
  }
  const w=net.pwp;
  if(w){
   const x=tx(w.x),y=ty(w.y),f=Math.max(5,sz*1.2);
   g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-f*2);g.stroke();
   g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-f*2);g.stroke();
   g.fillStyle='#ffb347';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-f*2);g.lineTo(x+f*1.3,y-f*1.5);g.lineTo(x,y-f);g.closePath();g.fill();g.stroke();
  }
 };
}

/* ---------- "Ortak Çaba" başarımı ---------- */
HG.on('coop-join',()=>{if(HG.flag)HG.flag('coopplay')});
HG.on('coop',e=>{if(e&&e.mode==='guest'&&HG.flag)HG.flag('coopplay')});

/* ---------- Düşme ve ayağa kalkma bildirimi ---------- */
const wasAlive=new Map();
net.tick(()=>{
 for(const r of HG.remote){
  if(!r.P||!r.P.ready)continue;
  const was=wasAlive.get(r.P.id);
  if(was===undefined){wasAlive.set(r.P.id,r.alive);continue}
  if(was&&!r.alive){wasAlive.set(r.P.id,false);HG.toast(r.name+' düştü.');net.chatLine('',r.name+' düştü.',true)}
  else if(!was&&r.alive){wasAlive.set(r.P.id,true);net.chatLine('',r.name+' yeniden ayakta.',true)}
 }
});

/* ---------- Ortak hedef: haritada işaretlenen hedef arkadaşa da gösterilir ---------- */
let lastWp='';
net.tick(()=>{
 const sig=G.wp?Math.round(G.wp.x)+','+Math.round(G.wp.y):'';
 if(sig===lastWp)return;
 lastWp=sig;
 if(G.wp)net.send({t:'wp',x:r2(G.wp.x),y:r2(G.wp.y)});
});
net.on('wp',(m,P)=>{
 if(!(m.x>=0&&m.x<HG.W&&m.y>=0&&m.y<HG.H))return;
 net.pwp={x:m.x,y:m.y,by:P.name||'Oyuncu'};
 const d=Math.round(Math.hypot(m.x-G.px,m.y-G.py));
 HG.toast((P.name||'Oyuncu')+' bir hedef işaretledi ('+d+' m). Harita: M');
 net.chatLine('',(P.name||'Oyuncu')+' bir hedef işaretledi ('+d+' m).',true);
});
const clearWp=()=>{net.pwp=null;lastWp=''};
HG.on('coop-leave',clearWp);HG.on('coop-lost',clearWp);HG.on('coop',e=>{if(e&&e.mode==='solo')clearWp()});

/* ---------- Konuğun kişisel durumunun saklanması ---------- */
const CK=wid=>'hunger-coop-kisi-'+wid;
const VIT=['hp','hun','thr','warm','stam','san'];
function charSnap(){
 const o={v:1,wid:net.wid,ts:Date.now(),sel:G.sel|0,xp:G.xp,lvl:G.lvl,pts:G.pts,perks:G.perks,notes:G.notes,quests:G.quests,stats:G.stats,flags:G.flags,ach:G.ach||null};
 o.inv=G.inv.map(s=>s?(s.d!==undefined?{id:s.id,n:s.n,d:s.d}:{id:s.id,n:s.n}):null);
 for(const k of VIT)o[k]=G[k];
 return o;
}
HG.netCharSave=()=>{
 if(HG.coop.mode!=='guest'||!net.wid||ui.state==='menu'||!G.inv||ui.state==='dead')return false;
 try{localStorage.setItem(CK(net.wid),JSON.stringify(charSnap()));return true}catch(e){return false}
};
HG.netCharLoad=()=>{
 if(HG.coop.mode!=='guest'||!net.wid)return false;
 let s=null;
 try{s=JSON.parse(localStorage.getItem(CK(net.wid))||'null')}catch(e){}
 if(!s||s.v!==1||s.wid!==net.wid||typeof s!=='object')return false;
 /* çanta: tanımsız eşya ve geçersiz sayılar ayıklanır */
 if(Array.isArray(s.inv)){
  const inv=Array(HG.SLOTS).fill(null),dur=HG.BAL.dur;
  for(let i=0;i<HG.SLOTS&&i<s.inv.length;i++){
   const x=s.inv[i];
   if(x&&typeof x==='object'&&IT[x.id]&&x.n>0){
    const o={id:x.id,n:Math.min(IT[x.id].s,Math.floor(x.n))};
    if(x.d>0&&dur[x.id])o.d=Math.min(dur[x.id],Math.round(x.d));
    inv[i]=o;
   }
  }
  if(inv.some(Boolean))G.inv=inv;
 }
 G.sel=clamp(s.sel|0,0,HG.HOT-1);
 for(const k of VIT)if(isFinite(s[k]))G[k]=clamp(+s[k],0,100);
 if(!(G.hp>0))G.hp=60;
 if(isFinite(s.lvl)){G.lvl=clamp(s.lvl|0,1,30);G.xp=Math.max(0,+s.xp||0);G.pts=Math.max(0,s.pts|0)}
 if(s.perks&&typeof s.perks==='object')G.perks=s.perks;
 if(Array.isArray(s.notes))G.notes=s.notes;
 if(s.quests&&typeof s.quests==='object')G.quests=s.quests;
 if(s.stats&&typeof s.stats==='object')G.stats=Object.assign(G.stats||{},s.stats);
 if(s.flags&&typeof s.flags==='object')G.flags=s.flags;
 if(s.ach&&typeof s.ach==='object')G.ach=s.ach;
 ui.dirty=true;
 HG.toast('Bu dünyadaki önceki karakteriniz geri yüklendi (çanta ve gelişim).');
 return true;
};
let saveT=0;
net.tick(dt=>{saveT-=dt;if(saveT<=0){saveT=10;HG.netCharSave()}});
addEventListener('beforeunload',()=>{HG.netCharSave()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)HG.netCharSave()});
{
 const l0=net.leave;
 net.leave=function(){HG.netCharSave();return l0.apply(this,arguments)};
}
})();
