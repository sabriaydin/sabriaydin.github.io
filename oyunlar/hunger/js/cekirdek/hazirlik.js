/* Hunger 3D - çok oyunculu (co-op) hazırlık katmanı.
   Bugün oyun tek oyunculudur; bu dosya ileride ağ katmanının takılabileceği ortak yolları tanımlar:
   oyuncu soyutlaması (HG.me, HG.players), olay yolu (HG.on / HG.emit), dünya değişiklik günlüğü (HG.journal),
   varlık kimlikleri (HG.eid), ev sahibi sorgusu (HG.isHost) ve dünya kodu (aynı kodla aynı ada üretilir).
   Yeni sistemler bu yolları kullanır; ağ katmanı eklendiğinde yalnızca bu dosyadaki tanımlar genişletilir. */
(()=>{
'use strict';
const KEY='hunger-oyuncu';

/* ---- Oyuncu kimliği: tarayıcıda saklanır ---- */
const prof={id:'',name:'Oyuncu'};
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s.id==='string'&&/^[a-z0-9]{4,12}$/.test(s.id)){prof.id=s.id;if(typeof s.name==='string'&&s.name.trim())prof.name=s.name.trim().slice(0,20)}
}catch(e){}
if(!prof.id){prof.id=Math.random().toString(36).slice(2,8).padEnd(6,'0');try{localStorage.setItem(KEY,JSON.stringify(prof))}catch(e){}}

/* ---- Oyuncu soyutlaması: yerel oyuncu HG.me; uzaktaki oyuncular (ileride) HG.remote içinde tutulur ---- */
const G=HG.G;
const me={
 id:prof.id,name:prof.name,remote:false,
 get x(){return G.px},get z(){return G.py},get y(){return G.pz===undefined?0:G.pz},
 get hp(){return G.hp},get alive(){return HG.ui.state!=='dead'&&G.hp>0}
};
HG.me=me;
HG.remote=[];                                           /* {id,name,x,z,y,hp,alive,remote:true} biçiminde uzak oyuncular */
HG.players=()=>HG.remote.length?[me,...HG.remote.filter(p=>p.alive!==false)]:[me];
/* En yakın oyuncu: {p,d} ya da hiç yoksa null. Yapay zekâ ve olaylar G.px/G.py yerine bunu kullanmalıdır. */
HG.nearestPlayer=(x,z,maxD)=>{
 let best=null,bd=maxD===undefined?Infinity:maxD;
 for(const p of HG.players()){const d=Math.hypot(p.x-x,p.z-z);if(d<=bd){bd=d;best=p}}
 return best?{p:best,d:bd}:null;
};
HG.playersNear=(x,z,r)=>HG.players().filter(p=>Math.hypot(p.x-x,p.z-z)<=r);

/* ---- Rol: tek oyunculuda yerel oyuncu her zaman ev sahibidir (dünya simülasyonunu yürütür) ---- */
HG.coop={mode:'solo',host:true};
HG.isHost=()=>HG.coop.host;

/* ---- Olay yolu ---- */
const L=Object.create(null);
HG.on=(name,fn)=>{(L[name]||(L[name]=[])).push(fn);return()=>{const a=L[name],i=a?a.indexOf(fn):-1;if(i>=0)a.splice(i,1)}};
HG.emit=(name,data)=>{
 const a=L[name];if(!a)return;
 for(const f of a.slice()){try{f(data)}catch(e){console.error('olay:'+name,e)}}
};

/* ---- Dünya değişiklik günlüğü: sıra numaralı, sınırlı uzunlukta. Ağ katmanı 'since' ile eksik olayları ister ---- */
const J=HG.journal={
 seq:0,buf:[],max:3000,
 push(t,d){
  const e=Object.assign({s:++J.seq,t,at:G.clock||0,by:prof.id},d);
  J.buf.push(e);
  if(J.buf.length>J.max*1.25)J.buf.splice(0,J.buf.length-J.max);
  HG.emit(t,e);
  return e;
 },
 cell(i,v,was){J.push('obj',{i,v,was})},                 /* HG.setObj her çağrıda yazar */
 since(seq){                                             /* seq'ten sonraki olaylar; günlük taştıysa null (tam eşitleme gerekir) */
  if(!J.buf.length)return J.seq===seq?[]:null;
  if(J.buf[0].s>seq+1)return null;
  return J.buf.filter(e=>e.s>seq);
 },
 reset(){J.seq=0;J.buf.length=0}
};

/* ---- Varlık kimlikleri: oyuncu kimliği + sayaç; sayaç kayıtla birlikte saklanır (G.x2.n) ---- */
HG.eid=pre=>{const x=G.x2||(G.x2={});x.n=(x.n||0)+1;return (pre||'e')+'-'+prof.id+'-'+x.n.toString(36)};

/* ---- Dünya kodu: dünya tohumunun okunur biçimi ("ABC-123"). Aynı kod, aynı adayı üretir ---- */
HG.worldCode=seed=>{
 const s=((seed===undefined?G.seed:seed)>>>0).toString(36).toUpperCase().padStart(6,'0');
 return s.slice(0,3)+'-'+s.slice(3);
};
HG.parseWorldCode=t=>{
 const c=String(t||'').toUpperCase().replace(/[^0-9A-Z]/g,'');
 if(!c||c.length>6)return null;
 const n=parseInt(c,36);
 return Number.isFinite(n)&&n>=0&&n<=2147483647?n:null;
};
})();
