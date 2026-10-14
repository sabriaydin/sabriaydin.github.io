/* Hunger 3D - oyun saati, gündüz ışığı, gün sayısı */
(()=>{
'use strict';
const {DAY,smooth,G}=HG;
/* Başlangıç 07:12; bir oyun günü 420 saniye. tod: 0..1 (0.25 = gün doğumu) */
const tod=()=>(G.clock/DAY+.30)%1;
const daylight=()=>{const s=Math.sin((tod()-.25)*Math.PI*2);return smooth(-.45,.35,s)};
const dayNo=()=>Math.floor(G.clock/DAY+.30)+1;
Object.assign(HG,{tod,daylight,dayNo});
})();
