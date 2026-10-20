/* Hunger 3D - toplanabilir doğa nesneleri, alet gücü, nesne adları */
(()=>{
'use strict';
const {O}=HG;
const POWER=[0.55,1.25,2.0,3.0];       /* alet kademesi göstergesi: El Taşı, Taş, Bakır, Demir (rehber metinleri için) */
/* Rust mantığı: her vuruş düğümün canından düşer ve kaynağı hemen verir. Düğüm canı bitince ağaç devrilir, kaya/maden parçalanır.
   HIT: kademeye göre vuruş hasarı · hp: düğüm canı · tot: düğümün tamamından alınacak taban kaynak (Taş kademesinde) ·
   bonus: son vuruşta ek kaynak · sec: [eşya, toplam] ikincil kaynak · Kaynak miktarı alet kademesiyle çarpılır (YIELD, eylem.js):
   alet ne kadar düşük kaliteliyse düğümden o kadar az kaynak çıkar. */
const HIT=[8,16,22,30];
const NODE={};
NODE[O.TREE]={hp:100,tool:'axe',req:0,id:'wood',tot:16,bonus:3,rm:O.NONE,regrow:[O.TREE,480]};
NODE[O.ROCK]={hp:100,tool:'pick',req:0,id:'stone',tot:16,bonus:3,rm:O.NONE,regrow:[O.ROCK,640]};
NODE[O.COAL]={hp:140,tool:'pick',req:1,id:'coal',tot:12,bonus:2,rm:O.NONE,msg:'Kömür için en az Taş Kazma gerekir.',regrow:[O.COAL,900]};
NODE[O.COPPER]={hp:170,tool:'pick',req:1,id:'copper_ore',tot:10,sec:['stone',6],bonus:2,rm:O.NONE,msg:'Bakır için en az Taş Kazma gerekir.',regrow:[O.COPPER,1500]};
NODE[O.IRON]={hp:200,tool:'pick',req:2,id:'iron_ore',tot:8,sec:['stone',5],bonus:2,rm:O.NONE,msg:'Demir için en az Bakır Kazma gerekir.',regrow:[O.IRON,2400]};
/* toplanabilirler: E tuşu ile anında toplanır */
NODE[O.SHROOM]={collect:true,give:()=>['mushroom',1+(Math.random()*2|0)],rm:O.NONE,regrow:[O.SHROOM,420]};
NODE[O.BUSH]={collect:true,give:()=>['berries',2+(Math.random()*2|0)],rm:O.BUSH0,regrow:[O.BUSH,110]};
NODE[O.PALM]={collect:true,give:()=>['coconut',1],rm:O.PALM0,regrow:[O.PALM,160]};
const SOLID=o=>o!==O.NONE&&o!==O.DOOR&&o!==O.DOORM&&o!==O.ARCHW&&o!==O.ARCHS&&o!==O.GATE&&o!==O.GATEM&&o!==O.VDOOR&&o!==O.BUSH&&o!==O.BUSH0&&o!==O.SNARE&&o!==O.PLOT&&o!==O.SHROOM;     /* çalılar, mantar, tuzak ve tarla yürünerek geçilir */
/* Nişan ışını için nesnelerin yaklaşık yükseklikleri */
const OBJTOP={[O.TREE]:6,[O.PALM]:5,[O.PALM0]:5,[O.ROCK]:.9,[O.COAL]:.95,[O.COPPER]:.95,[O.IRON]:.95,[O.BUSH]:.8,[O.BUSH0]:.8,[O.FIRE]:.5,[O.BENCH]:1,[O.FURN]:1.6,[O.WALLW]:1.3,[O.WALLS]:1.3,[O.DOOR]:1.3,[O.WALLT]:1.3,[O.WALLM]:1.3,[O.DOORM]:1.3,[O.FENCE]:.85,[O.WINW]:1.3,[O.WINS]:1.3,[O.WINM]:1.3,[O.ARCHW]:1.5,[O.ARCHS]:1.5,[O.GATE]:.95,[O.GATEM]:.95,[O.FENCES]:.85,[O.FENCEM]:.95,[O.VWALL]:3,[O.VDEC]:1.3,[O.VDOOR]:.8,[O.BED]:.55,[O.RACK]:1.5,[O.BARREL]:1.1,[O.TORCHP]:2,[O.SNARE]:.15,[O.PLOT]:.12,[O.SHROOM]:.25};
const NAMES={[O.TREE]:'Ağaç',[O.PALM]:'Palmiye (hindistan cevizi var)',[O.PALM0]:'Palmiye (meyvesi yok)',[O.ROCK]:'Kaya',[O.COAL]:'Kömür damarı',[O.COPPER]:'Bakır damarı',[O.IRON]:'Demir damarı',[O.BUSH]:'Yaban meyvesi çalısı',[O.BUSH0]:'Çalı (meyve yok)',[O.FIRE]:'Kamp ateşi',[O.BENCH]:'Çalışma tezgâhı',[O.FURN]:'Ocak',[O.WALLW]:'Tahta duvar',[O.WALLS]:'Taş duvar',[O.DOOR]:'Kapı'};
NAMES[O.WINW]='Pencereli duvar (odun)';NAMES[O.WINS]='Pencereli duvar (taş)';NAMES[O.WINM]='Pencereli duvar (metal)';NAMES[O.ARCHW]='Geçit (odun)';NAMES[O.ARCHS]='Geçit (taş)';NAMES[O.GATE]='Çit kapısı';NAMES[O.GATEM]='Metal çit kapısı';NAMES[O.FENCES]='Alçak taş duvar';NAMES[O.FENCEM]='Tel örgü çit';
NAMES[O.WALLT]='Çıta duvar';NAMES[O.WALLM]='Metal duvar';NAMES[O.DOORM]='Metal kapı';NAMES[O.FENCE]='Çit';
NAMES[O.BED]='Hasır yatak';NAMES[O.RACK]='Kurutma rafı';NAMES[O.BARREL]='Yağmur varili';NAMES[O.TORCHP]='Meşale direği';NAMES[O.SNARE]='Av tuzağı';NAMES[O.PLOT]='Ekim tarlası';NAMES[O.SHROOM]='Mantar';
NAMES[O.VWALL]='Ev duvarı';NAMES[O.VDEC]='Köy eşyası';NAMES[O.VDOOR]='Kapı';
/* Üzerine zıplayarak çıkılabilen nesneler: yerden yükseklik (m). Diğer katı nesnelerin üzerine çıkılamaz. */
const STAND={[O.ROCK]:.82,[O.COAL]:.86,[O.COPPER]:.86,[O.IRON]:.86,[O.FENCE]:.85,[O.FENCES]:.85,[O.FENCEM]:.9,[O.BED]:.5};
/* Yürünebilen ama kapı gibi canavar ve hayvanları durduran yapılar (inşa sistemi) */
HG.INSA_PASS=o=>o===O.ARCHW||o===O.ARCHS||o===O.GATE||o===O.GATEM;
HG.STAND=STAND;HG.HIT=HIT;HG.POWER=POWER;HG.NODE=NODE;HG.SOLID=SOLID;HG.OBJTOP=OBJTOP;HG.NAMES=NAMES;
})();
