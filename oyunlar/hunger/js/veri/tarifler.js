/* Hunger 3D - üretim tarifleri */
(()=>{
'use strict';
/* Tarif: [üretilen eşya, adet, {gerekenler}, istasyon(isteğe bağlı)] */
const STN={fire:'Kamp Ateşi',bench:'Çalışma Tezgâhı',furn:'Ocak'};
const RC=[
 ['axe1',1,{wood:3,stone:3}],['pick1',1,{wood:3,stone:4}],['rod',1,{wood:4,stone:1}],
 ['fire',1,{wood:5,stone:3}],['bench',1,{wood:10,stone:2}],['furn',1,{stone:12}],
 ['plan',1,{wood:10}],['hammer',1,{wood:12,stone:8}],['door',1,{wood:8}],['mdoor',1,{iron_ingot:6},'bench'],['adoor',1,{iron_ingot:10,copper_ingot:4},'bench'],
 ['cfish',1,{fish:1},'fire'],['cfish',1,{sardine:2},'fire'],['cfish',1,{bass:1},'fire'],['cfish',2,{tuna:1},'fire'],['ccrab',1,{crab:1},'fire'],['cmeat',1,{meat:1},'fire'],['cshell',1,{shell:2},'fire'],
 ['spear',1,{wood:3,bone:2,leather:1}],
 ['bow',1,{wood:4,leather:1}],['arrow',4,{wood:1,stone:1}],['torch',2,{wood:2,coal:1}],['bandage',2,{wool:2}],
 ['bag',1,{wool:4,leather:2},'bench'],['raft',1,{wood:14,leather:2,wool:3},'bench'],['mask',1,{bottle:2,leather:2},'bench'],['shears',1,{copper_ingot:2,leather:1,wood:1},'bench'],['coat',1,{leather:5,wool:3},'bench'],
 ['copper_ingot',1,{copper_ore:1,coal:1},'furn'],['iron_ingot',1,{iron_ore:1,coal:1},'furn'],['bottle',1,{sand:2,coal:1},'furn'],
 ['axe2',1,{wood:3,copper_ingot:3},'bench'],['pick2',1,{wood:3,copper_ingot:4},'bench'],
 ['axe3',1,{wood:3,iron_ingot:3},'bench'],['pick3',1,{wood:3,iron_ingot:4},'bench']
];
HG.STN=STN;HG.RC=RC;
})();
