/* Hunger 3D - hayvan tanımları (can, hız, düşen eşyalar) */
(()=>{
'use strict';
const R=(a,b)=>a+((Math.random()*(b-a+1))|0);
/* sp: aynı türün kümeleri arası en az mesafe (bölge), roam: gezinme yarıçapı, prey/pred: av/avcı, big: büyük baş (ilk vuruşta %40 karşılık verir)
   flee: kaçma mesafesi (0 = saldırıya uğramadıkça kaçmaz), aggr: yakınlaşınca saldırır, want: haritadaki hedef sayı,
   cspd: kovalama hızı (oyuncunun koşusundan yavaştır; dayanıklılığı biten oyuncuya yetişir), giveUp: bu mesafeden uzaklaşan oyuncuyu bırakır */
const ANIMAL={
 sheep:{n:'Koyun',snd:'sheep',hp:100,weak:1.0,xpv:4,walk:.9,run:3.4,r:.6,h:.9,flee:0,want:17,sp:20,roam:8,prey:true,shear:true,
  drops:a=>[['meat',R(1,2)],...(a.sheared?[]:[['wool',R(1,3)]])]},
 cow:{n:'İnek',snd:'cow',hp:100,weak:0.8,xpv:5,walk:.8,run:3.0,r:.85,h:1.3,flee:0,want:12,sp:24,roam:9,prey:true,big:true,dmg:7,cd:1.6,cspd:3,giveUp:10,milk:true,
  drops:()=>[['meat',R(2,3)],['leather',R(1,2)],['bone',R(1,2)]]},
 rabbit:{n:'Tavşan',snd:'rabbit',hp:100,weak:1.6,xpv:3,walk:1.1,run:5.4,r:.3,h:.4,flee:8,want:22,sp:12,roam:6,prey:true,
  drops:()=>[['meat',1],['leather',1]]},
 deer:{n:'Geyik',snd:'deer',hp:100,weak:1.0,xpv:4,walk:1.2,run:6.4,r:.65,h:1.5,flee:12,want:13,sp:28,roam:14,prey:true,big:true,dmg:6,cd:1.5,cspd:4.6,giveUp:12,
  drops:()=>[['meat',R(2,3)],['leather',R(1,2)],['bone',R(1,2)]]},
 wolf:{n:'Kurt',snd:'wolf',hp:100,weak:0.85,xpv:5,walk:1.2,run:7.4,r:.55,h:.85,flee:0,aggr:13,dmg:5,bleed:.12,cd:2.4,chase:5,cspd:5,giveUp:18,want:8,sp:40,roam:20,pred:true,night:true,fearLight:true,
  drops:()=>[['meat',R(1,2)],['leather',1],['bone',R(1,2)]]},
 shade:{n:'Gölge',snd:'shade',foe:true,hp:100,weak:0.6,xpv:16,walk:1.4,run:4.8,r:.6,h:2,want:0,dmg:14,bleed:.6,drops:()=>[]},
 boar:{n:'Yaban Domuzu',snd:'boar',hp:100,weak:0.7,xpv:5,walk:1.0,run:5.6,r:.6,h:.85,flee:0,aggr:4.5,dmg:11,cd:1.6,chase:6,cspd:4.7,giveUp:13,want:9,sp:30,roam:10,prey:true,
  drops:()=>[['meat',R(2,3)],['leather',1],['bone',R(1,2)]]},
 /* deniz ve kıyı canlıları (dyn): oyuncunun çevresinde gerektikçe oluşur, kayda geçmez */
 shark:{n:'Köpek Balığı',snd:'shark',sea:'fish',dyn:true,hp:100,weak:.8,xpv:14,walk:1.5,run:7.6,r:.8,h:.8,flee:0,aggr:22,dmg:13,bleed:.45,cd:2.1,want:0,
  drops:()=>[['meat',R(3,4)],['bone',R(2,3)]]},
 jelly:{n:'Denizanası',snd:'jelly',sea:'jelly',dyn:true,hp:100,weak:2.2,xpv:4,walk:.3,run:.8,r:.4,h:.6,flee:0,dmg:5,cd:1.6,want:0,
  drops:()=>[]},
 crab:{n:'Yengeç',snd:'crab',dyn:true,beach:true,hp:100,weak:1.5,xpv:3,walk:.55,run:2.6,r:.26,h:.22,flee:6,want:0,sp:8,roam:4,
  drops:()=>[['crab',1]]}
};
/* silah hasarı: elde olan eşyaya göre */
/* Silah hasarı: hedefin sağlığı %100 üzerinden. Eşyaya özgü taban değerler; vurulan bölge ve hedefin zayıflığı ile çarpılır. */
const DMG={hand:1.2,other:2,item:{rock:3,wood:3,stone:3,bone:4,coal:2,bottle:2,torch:6,rod:3,shears:3,bow:2,axe1:18,axe2:22,axe3:28,pick1:14,pick2:18,pick3:23,spear:34,hammer:10,plan:1},arrowMin:18,arrowMax:60};
/* Vücut bölgeleri: hasar çarpanları */
const ZONE={head:{n:'Kafa',m:2.2},torso:{n:'Gövde',m:1},arm:{n:'Kol',m:.75},leg:{n:'Bacak',m:.6}};
HG.ANIMAL=ANIMAL;HG.DMG=DMG;HG.ZONE=ZONE;
})();
