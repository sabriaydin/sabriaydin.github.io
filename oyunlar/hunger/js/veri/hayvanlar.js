/* Hunger 3D - hayvan tanımları (can, hız, düşen eşyalar) */
(()=>{
'use strict';
const R=(a,b)=>a+((Math.random()*(b-a+1))|0);
/* flee: kaçma mesafesi (0 = saldırıya uğramadıkça kaçmaz), aggr: yakınlaşınca saldırır, want: haritadaki hedef sayı */
const ANIMAL={
 sheep:{n:'Koyun',snd:'sheep',hp:8,walk:.9,run:3.4,r:.6,h:.9,flee:0,want:26,shear:true,
  drops:a=>[['meat',R(1,2)],...(a.sheared?[]:[['wool',R(1,3)]])]},
 cow:{n:'İnek',snd:'cow',hp:14,walk:.8,run:3.0,r:.85,h:1.3,flee:0,want:18,milk:true,
  drops:()=>[['meat',R(2,3)],['leather',R(1,2)],['bone',R(1,2)]]},
 rabbit:{n:'Tavşan',snd:'rabbit',hp:3,walk:1.1,run:5.4,r:.3,h:.4,flee:8,want:34,
  drops:()=>[['meat',1],['leather',1]]},
 deer:{n:'Geyik',snd:'deer',hp:9,walk:1.2,run:6.4,r:.65,h:1.5,flee:12,want:20,
  drops:()=>[['meat',R(2,3)],['leather',R(1,2)],['bone',R(1,2)]]},
 wolf:{n:'Kurt',snd:'wolf',hp:14,walk:1.2,run:7.4,r:.55,h:.85,flee:0,aggr:13,dmg:5,bleed:.12,cd:2.4,chase:5,want:12,night:true,fearLight:true,
  drops:()=>[['meat',R(1,2)],['leather',1],['bone',R(1,2)]]},
 shade:{n:'Gölge',snd:'shade',foe:true,hp:22,walk:1.4,run:4.8,r:.6,h:2,want:0,dmg:14,bleed:.6,drops:()=>[]},
 boar:{n:'Yaban Domuzu',snd:'boar',hp:12,walk:1.0,run:5.6,r:.6,h:.85,flee:0,aggr:4.5,dmg:11,cd:1.6,chase:6,want:14,
  drops:()=>[['meat',R(2,3)],['leather',1],['bone',R(1,2)]]}
};
/* silah hasarı: elde olan eşyaya göre */
const DMG={hand:1,axe:[0,2,2.6,3.4],pick:[0,1.8,2.2,2.8],spear:[0,4.5],rod:.8,torch:1.6,bow:.5,other:1};
HG.ANIMAL=ANIMAL;HG.DMG=DMG;
})();
