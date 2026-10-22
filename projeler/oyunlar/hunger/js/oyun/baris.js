/* Hunger 3D - Barış modu (güncelleme 66).
   Eskiden Barış modu yalnızca saldıran canlının verdiği hasarı engelliyordu (genisleme2.js › HG.hurt); Gölge, kurt, ayı, köpek balığı ve
   denizanası yine ortaya çıkıyordu. Artık Barış modunda bu canlılar hiç bulunmaz: haritada olanlar kaldırılır, yenileri çıkmaz.
   Yaban domuzu ve diğer hayvanlar saldırıya geçmez (kovalamaz, karşılık vermez). Arı sokması bu moddan etkilenmez (yanan meşale korur).
   Özgün dosyalara dokunmaz; HG.updateFoes zincirlenir (hayvanlar.js bunu her karede çağırır). */
(()=>{
'use strict';
const {G,ANIMAL}=HG;
const sc=HG.sc;
const HOSTILE={wolf:1,bear:1,shark:1,jelly:1};              /* Gölge (foe) ayrıca ele alınır */
/* Barış modunda bulunmaması gereken canlı türü mü? (Gölge, kurt, ayı, köpek balığı, denizanası) */
HG.hostileAnimal=t=>{const d=ANIMAL[t];return !!d&&(!!d.foe||!!HOSTILE[t])};
const guest=()=>!!(HG.netGuest&&HG.netGuest());

function sweep(){
 const L=G.animals;
 if(!Array.isArray(L))return;
 for(let k=L.length-1;k>=0;k--){
  const a=L[k],d=ANIMAL[a.t];if(!d)continue;
  if(d.foe){if(!a.dying){a.gone=true;a.dying=.001}}                       /* Gölge: kısa bir erime efektiyle kaybolur */
  else if(HOSTILE[a.t])L.splice(k,1);
  else if(a.charge>0){a.charge=0;a.retal=undefined;a.cph=undefined;a.panic=Math.max(a.panic||0,5)}      /* kovalama biter: hayvan kaçar */
 }
}

const u0=HG.updateFoes;
HG.updateFoes=function(dt){
 if(HG.cfg.peace){
  if(!guest())sweep();                                        /* co-op: canlıları ev sahibi yönetir; konuk yalnızca korku ölçüsünü sıfırlar */
  sc.fear=(sc.fear||0)*Math.exp(-(dt||0)*1.2);
  return;
 }
 return u0.apply(this,arguments);
};
})();
