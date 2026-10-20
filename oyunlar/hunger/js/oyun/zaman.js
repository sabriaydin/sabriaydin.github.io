/* Hunger 3D - oyun saati, gündüz ışığı, gün sayısı */
(()=>{
'use strict';
const {DAY,smooth,G}=HG;
/* Bir oyun günü 1620 saniye (27 dk): 20 dk gündüz + 7 dk gece. tod: 0..1 görsel evre (0.25 gün doğumu, 0.75 gün batımı);
   gündüz 0.25-0.75 aralığına 20 dk, gece 0.75-1.25 aralığına 7 dk ile eşlenir. Başlangıç gün doğumundan kısa süre sonradır. */
const DFR=20/27,U0=.1*DFR;
const tod=()=>{const u=(G.clock/DAY+U0)%1;return (.25+(u<DFR?.5*u/DFR:.5+.5*(u-DFR)/(1-DFR)))%1};
const daylight=()=>{if(G.cave)return 0;const s=Math.sin((tod()-.25)*Math.PI*2);return smooth(-.45,.35,s)};
const dayNo=()=>Math.floor(G.clock/DAY+U0)+1;
Object.assign(HG,{tod,daylight,dayNo});
})();
