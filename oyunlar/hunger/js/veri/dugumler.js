/* Hunger 3D - toplanabilir doğa nesneleri, alet gücü, nesne adları */
(()=>{
'use strict';
const {O}=HG;
const POWER=[0.55,1.25,2.0,3.0];       /* alet kademesi göstergesi: El Taşı, Taş, Bakır, Demir (rehber metinleri için) */
/* Rust mantığı: her vuruş düğümün canından düşer ve kaynağı hemen verir. Düğüm canı bitince ağaç devrilir, kaya/maden parçalanır.
   HIT: kademeye göre vuruş hasarı · hp: düğüm canı · y: kademeye göre vuruş başına kaynak (sarı zayıf noktaya vurulursa iki kat) ·
   bonus: son vuruşta ek kaynak · sec: her vuruşta ikincil kaynak · hot: zayıf nokta (r: gövdeden uzaklık, h0-h1: yükseklik, k: işaret türü) */
const HIT=[8,16,22,30];
const NODE={};
NODE[O.TREE]={hp:100,tool:'axe',req:0,id:'wood',y:[1,2,3,4],bonus:3,rm:O.NONE,regrow:[O.TREE,480],hot:{r:.42,h0:1.1,h1:2.3,k:'x'}};
NODE[O.ROCK]={hp:100,tool:'pick',req:0,id:'stone',y:[1,2,3,4],bonus:3,rm:O.NONE,regrow:[O.ROCK,640],hot:{r:.5,h0:.3,h1:.75,k:'star'}};
NODE[O.COAL]={hp:140,tool:'pick',req:1,id:'coal',y:[0,1,2,3],bonus:2,rm:O.NONE,msg:'Kömür için en az Taş Kazma gerekir.',regrow:[O.COAL,900],hot:{r:.5,h0:.3,h1:.75,k:'star'}};
NODE[O.COPPER]={hp:170,tool:'pick',req:1,id:'copper_ore',y:[0,1,2,3],sec:['stone',1],bonus:2,rm:O.NONE,msg:'Bakır için en az Taş Kazma gerekir.',regrow:[O.COPPER,1500],hot:{r:.5,h0:.3,h1:.75,k:'star'}};
NODE[O.IRON]={hp:200,tool:'pick',req:2,id:'iron_ore',y:[0,0,1,2],sec:['stone',1],bonus:2,rm:O.NONE,msg:'Demir için en az Bakır Kazma gerekir.',regrow:[O.IRON,2400],hot:{r:.5,h0:.3,h1:.75,k:'star'}};
/* toplanabilirler: E tuşu ile anında toplanır */
NODE[O.BUSH]={collect:true,give:()=>['berries',2+(Math.random()*2|0)],rm:O.BUSH0,regrow:[O.BUSH,110]};
NODE[O.PALM]={collect:true,give:()=>['coconut',1],rm:O.PALM0,regrow:[O.PALM,160]};
const SOLID=o=>o!==O.NONE&&o!==O.DOOR&&o!==O.DOORM&&o!==O.VDOOR&&o!==O.BUSH&&o!==O.BUSH0;     /* çalılar yürünerek geçilir */
/* Nişan ışını için nesnelerin yaklaşık yükseklikleri */
const OBJTOP={[O.TREE]:6,[O.PALM]:5,[O.PALM0]:5,[O.ROCK]:.9,[O.COAL]:.95,[O.COPPER]:.95,[O.IRON]:.95,[O.BUSH]:.8,[O.BUSH0]:.8,[O.FIRE]:.5,[O.BENCH]:1,[O.FURN]:1.6,[O.WALLW]:1.3,[O.WALLS]:1.3,[O.DOOR]:1.3,[O.WALLT]:1.3,[O.WALLM]:1.3,[O.DOORM]:1.3,[O.FENCE]:.85,[O.VWALL]:3,[O.VDEC]:1.3,[O.VDOOR]:.8};
const NAMES={[O.TREE]:'Ağaç',[O.PALM]:'Palmiye (hindistan cevizi var)',[O.PALM0]:'Palmiye (meyvesi yok)',[O.ROCK]:'Kaya',[O.COAL]:'Kömür damarı',[O.COPPER]:'Bakır damarı',[O.IRON]:'Demir damarı',[O.BUSH]:'Yaban meyvesi çalısı',[O.BUSH0]:'Çalı (meyve yok)',[O.FIRE]:'Kamp ateşi',[O.BENCH]:'Çalışma tezgâhı',[O.FURN]:'Ocak',[O.WALLW]:'Tahta duvar',[O.WALLS]:'Taş duvar',[O.DOOR]:'Kapı'};
NAMES[O.WALLT]='Çıta duvar';NAMES[O.WALLM]='Metal duvar';NAMES[O.DOORM]='Metal kapı';NAMES[O.FENCE]='Çit';
NAMES[O.VWALL]='Ev duvarı';NAMES[O.VDEC]='Köy eşyası';NAMES[O.VDOOR]='Kapı';
/* Üzerine zıplayarak çıkılabilen nesneler: yerden yükseklik (m). Diğer katı nesnelerin üzerine çıkılamaz. */
const STAND={[O.ROCK]:.82,[O.COAL]:.86,[O.COPPER]:.86,[O.IRON]:.86,[O.FENCE]:.85};
HG.STAND=STAND;HG.HIT=HIT;HG.POWER=POWER;HG.NODE=NODE;HG.SOLID=SOLID;HG.OBJTOP=OBJTOP;HG.NAMES=NAMES;
})();
