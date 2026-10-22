/* Hunger 3D - üretim: istasyon yakınlığı, tarif denetimi, üretme */
(()=>{
'use strict';
const {W,H,O,RC,IT,G,ui,count,canAdd,add,take,flag}=HG;
function nearObj(code,r){
 const x0=Math.floor(G.px),y0=Math.floor(G.py);
 for(let y=y0-4;y<=y0+4;y++)for(let x=x0-4;x<=x0+4;x++){
  if(x<0||y<0||x>=W||y>=H)continue;
  if(G.obj[y*W+x]===code&&Math.hypot(x+.5-G.px,y+.5-G.py)<=r)return true;
 }
 return false;
}
const STC={fire:O.FIRE,bench:O.BENCH,furn:O.FURN};
/* 1: üretilebilir, 0: malzeme eksik, -1: istasyon yakında değil */
function canCraft(r){
 for(const k in r[2])if(count(k)<r[2][k])return 0;
 if(r[3]&&!nearObj(STC[r[3]],3.6))return -1;
 return 1;
}
function craft(i){
 const r=RC[i];if(!r||canCraft(r)!==1)return;
 const snap=JSON.stringify(G.inv);
 for(const k in r[2])take(k,r[2][k]);
 if(!canAdd(r[0],r[1])){G.inv=JSON.parse(snap);HG.toast('Envanter dolu.');return}
 add(r[0],r[1]);flag('made_'+r[0]);if(G.stats)G.stats.crafted++;HG.xpGain(3);HG.feed('Üretildi: '+IT[r[0]].n+(r[1]>1?' ×'+r[1]:''));HG.snd('craft');ui.dirty=true;
}
Object.assign(HG,{nearObj,canCraft,craft});
})();
