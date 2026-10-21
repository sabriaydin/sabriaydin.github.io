/* Hunger 3D - zorluk ve alet dayanıklılığı (güncelleme 64).
   Denge tabloları js/veri/denge.js içindedir. Burada: alet kademesi verimi, alet aşınması ve kırılması, Çalışma Tezgâhında onarım, dayanıklılık ipuçları.
   Dayanıklılık, çanta kutusunun d alanında tutulur (d yoksa alet tam dayanıklıdır). El Taşı hiç aşınmaz; böylece elde alet kalmayan oyuncu çıkmaza girmez. */
(()=>{
'use strict';
const {G,ui,IT,O,W,BAL,count,take,add,held}=HG;
const DUR=BAL.dur;

/* ---------- Alet kademesi verimi (eylem.js içindeki dizi yerinde güncellenir) ---------- */
if(HG.YIELD)BAL.yield.forEach((v,i)=>{HG.YIELD[i]=v});

/* ---------- Dayanıklılık yardımcıları ---------- */
const curD=s=>s&&DUR[s.id]?(s.d===undefined?DUR[s.id]:s.d):0;
HG.durMax=id=>DUR[id]||0;
/* Yüzde (0-100); dayanıklılığı olmayan eşya için -1 */
HG.durPct=s=>{const m=s&&DUR[s.id];return m?Math.max(0,Math.min(100,Math.round(curD(s)/m*100))):-1};
const wearOn=()=>HG.cfg.wear!==false;

/* Yeni eşya eklerken dayanıklılığı da taşır (sandık, yere atılan eşya, cenaze çantası) */
HG.addD=(id,n,d)=>{
 const prev=new Set(G.inv.filter(Boolean));
 const left=add(id,n);
 if(d!==undefined&&DUR[id])for(const s of G.inv)if(s&&!prev.has(s)&&s.id===id)s.d=d;
 return left;
};

/* ---------- Aşınma ---------- */
let warned=null;
function breakTool(s,i){
 const id=s.id;
 G.inv[i]=null;ui.dirty=true;
 if(HG.stopAction)HG.stopAction();
 try{HG.snd('crack',{x:G.px,z:G.py})}catch(e){}
 HG.toast(IT[id].n+' kırıldı.');HG.feed('Kırıldı: '+IT[id].n);
 if(HG.flag)HG.flag('toolbroke');
 if(G.stats)G.stats.broken=(G.stats.broken||0)+1;
}
/* Elde tutulan alet n birim aşınır. Döner: alet kırıldıysa true */
HG.wear=(n)=>{
 if(!wearOn())return false;
 const i=G.sel,s=G.inv[i],mx=s&&DUR[s.id];
 if(!mx)return false;
 const was=HG.durPct(s),cur=curD(s)-(n||1);
 if(cur<=0){breakTool(s,i);return true}
 s.d=cur;ui.dirty=true;
 const now=HG.durPct(s);
 if(was>20&&now<=20&&warned!==s){warned=s;HG.toast(IT[s.id].n+' aşındı (%'+now+'). Çalışma Tezgâhına bakıp E ile onarın.')}
 else if(was>8&&now<=8)HG.toast(IT[s.id].n+' kırılmak üzere (%'+now+').');
 return false;
};

/* ---------- Çalışma Tezgâhında onarım ---------- */
const matText=m=>Object.keys(m).map(k=>m[k]+' '+IT[k].n).join(' + ');
function repairInfo(h){
 if(!h||!DUR[h.k])return null;
 const mx=DUR[h.k],cur=curD(h.s),f=BAL.fix[h.k];
 if(cur>=mx||!f)return null;
 const mat=f[0];
 return {mat,mx,cur,add:Math.ceil(mx*f[1]),ok:Object.keys(mat).every(k=>count(k)>=mat[k])};
}
function aimBench(tg){return !!(tg&&!tg.an&&!G.head&&G.obj[tg.y*W+tg.x]===O.BENCH)}
function doRepair(h,tg){
 if(!aimBench(tg))return false;
 const r=repairInfo(h);
 if(!r)return false;
 if(!r.ok)return false;                                   /* malzeme yoksa E, tezgâhı geri alma işlevine kalır; ipucu eksikleri yazar */
 for(const k in r.mat)take(k,r.mat[k]);
 h.s.d=Math.min(r.mx,r.cur+r.add);
 if(h.s.d>=r.mx)delete h.s.d;
 warned=null;if(HG.flag)HG.flag('repaired');
 HG.snd('craft');HG.toast(h.it.n+' onarıldı: dayanıklılık %'+HG.durPct(h.s));ui.dirty=true;
 return true;
}
if(HG.x2held)for(const id in DUR)HG.x2held[id]=(h,tg)=>doRepair(h,tg);

/* ---------- Eylem ipuçları: tezgâhta onarım, düğüme bakarken dayanıklılık ---------- */
{
 const a0=HG.actionFor;
 HG.actionFor=function(tg){
  const r=a0.apply(this,arguments),h=held();
  if(h&&DUR[h.k]&&tg&&!tg.an&&!G.head){
   if(aimBench(tg)){
    const q=repairInfo(h);
    if(q)return {hint:q.ok?'[E] Aleti onar · '+matText(q.mat):'Onarım için gerekli: '+matText(q.mat),name:HG.NAMES[O.BENCH]+' · '+h.it.n+' %'+HG.durPct(h.s)};
   }else if(r&&r.kind==='node'&&wearOn()){
    return Object.assign({},r,{hint:r.hint+' · alet %'+HG.durPct(h.s)});
   }
  }
  return r;
 };
}
})();
