/* Hunger 3D - toplanabilir doğa nesneleri, alet gücü, nesne adları */
(()=>{
'use strict';
const {O}=HG;
const POWER=[0.55,1.25,2.0,3.0];       /* toplama hızı: El Taşı, Taş, Bakır, Demir */
/* düğümler: hp (saniye, güç=1), alet türü, gereken kademe, verilen */
const NODE={};
NODE[O.TREE]={hp:3.5,tool:'axe',req:0,give:()=>['wood',3+(Math.random()*3|0)],rm:O.NONE,regrow:[O.TREE,480]};
NODE[O.ROCK]={hp:3,tool:'pick',req:0,give:()=>['stone',2+(Math.random()*2|0)],rm:O.NONE,regrow:[O.ROCK,640]};
NODE[O.COAL]={hp:5,tool:'pick',req:1,give:()=>['coal',2+(Math.random()*2|0)],rm:O.NONE,msg:'Kömür için en az Taş Kazma gerekir.',regrow:[O.COAL,900]};
NODE[O.COPPER]={hp:6,tool:'pick',req:1,give:()=>['copper_ore',1+(Math.random()*2|0)],rm:O.NONE,msg:'Bakır için en az Taş Kazma gerekir.',regrow:[O.COPPER,1500]};
NODE[O.IRON]={hp:8,tool:'pick',req:2,give:()=>['iron_ore',1+(Math.random()*2|0)],rm:O.NONE,msg:'Demir için en az Bakır Kazma gerekir.',regrow:[O.IRON,2400]};
NODE[O.BUSH]={hp:.7,tool:null,req:0,give:()=>['berries',2+(Math.random()*2|0)],rm:O.BUSH0,regrow:[O.BUSH,110]};
NODE[O.PALM]={hp:1.1,tool:null,req:0,give:()=>['coconut',1],rm:O.PALM0,regrow:[O.PALM,160]};
const SOLID=o=>o!==O.NONE&&o!==O.DOOR&&o!==O.VDOOR&&o!==O.BUSH&&o!==O.BUSH0;     /* çalılar yürünerek geçilir */
/* Nişan ışını için nesnelerin yaklaşık yükseklikleri */
const OBJTOP={[O.TREE]:6,[O.PALM]:5,[O.PALM0]:5,[O.ROCK]:.9,[O.COAL]:.95,[O.COPPER]:.95,[O.IRON]:.95,[O.BUSH]:.8,[O.BUSH0]:.8,[O.FIRE]:.5,[O.BENCH]:1,[O.FURN]:1.6,[O.WALLW]:1.3,[O.WALLS]:1.3,[O.DOOR]:1.3,[O.VWALL]:3,[O.VDEC]:1.3,[O.VDOOR]:.8};
const NAMES={[O.TREE]:'Ağaç',[O.PALM]:'Palmiye (hindistan cevizi var)',[O.PALM0]:'Palmiye (meyvesi yok)',[O.ROCK]:'Kaya',[O.COAL]:'Kömür damarı',[O.COPPER]:'Bakır damarı',[O.IRON]:'Demir damarı',[O.BUSH]:'Yaban meyvesi çalısı',[O.BUSH0]:'Çalı (meyve yok)',[O.FIRE]:'Kamp ateşi',[O.BENCH]:'Çalışma tezgâhı',[O.FURN]:'Ocak',[O.WALLW]:'Tahta duvar',[O.WALLS]:'Taş duvar',[O.DOOR]:'Kapı'};
NAMES[O.VWALL]='Ev duvarı';NAMES[O.VDEC]='Köy eşyası';NAMES[O.VDOOR]='Kapı';
HG.POWER=POWER;HG.NODE=NODE;HG.SOLID=SOLID;HG.OBJTOP=OBJTOP;HG.NAMES=NAMES;
})();
