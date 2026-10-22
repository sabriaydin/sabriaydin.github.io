/* Hunger 3D - elde tutulan eşya modelleri II (güncelleme 70).
   Daha önce elde renkli bir küre olarak görünen eşyalar (odun, kömür, cevher, külçe, balık, yengeç, mercan,
   meyve, şişe, maske, sikke, çanta) ve yerleştirilen yapıların küçük önizlemeleri (ateş, tezgâh, ocak, duvar, kapı)
   gerçek modellerle çizilir. Özgün dosyalara dokunulmaz: yalnızca sc.heldX kayıt defterine eklenir.
   Model düzeni: sap/taban +Y ekseninde, uç yukarıda; ölçek yaklaşık 0,1-0,3 m. */
(()=>{
'use strict';
const sc=HG.sc;
if(!sc||!sc.g)return;
const {cyl,cone,ico,box,rbox,blob}=sc.g;
const PI=Math.PI;
const X=sc.heldX=sc.heldX||{};
const sq=(geo,x,y,z)=>{geo.scale(x,y,z);return geo};

/* ---------- ham malzemeler ---------- */
/* Odun: uçları halkalı üç kütük, ipsiz demet */
X.wood=(g,add)=>{
 const log=(x,y,z,rz,len,r,c)=>{
  add(cyl(r,r*.95,len,8),c,x,y,z,PI/2,0,rz);
  add(cyl(r*.9,r*.9,.012,8),0xd9c49a,x+Math.sin(rz)*0,y,z+len/2,PI/2,0,rz);
  add(cyl(r*.9,r*.9,.012,8),0xc9b084,x,y,z-len/2,PI/2,0,rz);
 };
 log(0,.085,0,.06,.34,.045,0x7a4f29);
 log(-.055,.085,.02,-.1,.3,.04,0x8a5a31);
 log(.05,.15,-.01,.03,.28,.038,0x6b4423);
};
/* Kömür: köşeli, mat siyah parçalar; kenarlarda hafif parlak kırık yüzeyler */
X.coal=(g,add)=>{
 add(sq(ico(.062,0),1,.8,.95),0x1a1a1f,0,.1,0);
 add(sq(ico(.045,0),1.1,.75,1),0x24242b,.06,.08,.03,.4,.6,.2);
 add(sq(ico(.036,0),1,.8,1.1),0x121216,-.05,.09,-.03,.2,1.1,.5);
};
/* Kum: avuçta konik yığın, üstünde ince taneler */
X.sand=(g,add)=>{
 add(cyl(.11,.02,.1,12),0xdac68c,0,.05,0);
 add(cyl(.115,.105,.015,12),0xc9b47c,0,.012,0);
 for(const [x,z] of [[.03,.02],[-.04,.03],[.01,-.04]])add(ico(.009,0),0xe8d9a8,x,.1,z);
};
/* Cevher: damarlı taş (bakır yeşil-turuncu, demir kahve-gri) */
const ore=(c0,c1)=>(g,add)=>{
 add(sq(ico(.072,1),1,.86,.95),c0,0,.1,0);
 for(const [x,y,z,r] of [[.045,.13,.02,.022],[-.04,.08,.03,.018],[.02,.06,-.045,.016],[-.02,.15,-.02,.014]])
  add(ico(r,0),c1,x,y,z);
};
X.copper_ore=ore(0x6a6258,0xc8743a);
X.iron_ore=ore(0x6e6a66,0xb99a80);
/* Külçe: üstü dar, altı geniş trapez blok + damga */
const ingot=(c,cd)=>(g,add)=>{
 add(cyl(.085,.11,.055,4,1),c,0,.06,0,0,PI/4,0);
 add(box(.1,.012,.05),cd,0,.088,0);
 add(box(.03,.006,.018),cd,0,.095,0);
};
X.copper_ingot=ingot(0xd9854a,0xb4652f);
X.iron_ingot=ingot(0xbcc2c8,0x8f969c);
/* Sikke: avuçta üç üst üste madenî para */
X.coin=(g,add)=>{
 add(cyl(.045,.045,.012,14),0xd9985a,0,.04,0);
 add(cyl(.045,.045,.012,14),0xc9883f,.012,.053,.01,0,0,.08);
 add(cyl(.045,.045,.012,14),0xe0a868,-.01,.066,-.008,0,0,-.06);
 add(cyl(.028,.028,.014,12),0xb4762f,-.01,.067,-.008);
};
/* Çanta (mezar çantası): gövde, kapak, toka ve askı */
X.bag=(g,add)=>{
 add(rbox(.18,.2,.11,.35,2),0x4a6a8a,0,.12,0);
 add(rbox(.19,.07,.12,.4,2),0x3c5872,0,.21,0);
 add(box(.04,.05,.02),0xc9a23a,0,.19,.06);
 add(cyl(.012,.012,.26,6),0x2f465c,0,.2,-.055,0,0,PI/2);
};

/* ---------- deniz ürünleri ---------- */
/* Balık: yanlardan basık gövde, kuyruk çatalı, sırt ve karın yüzgeci, göz */
function fishModel(len,body,belly,eye){
 return (g,add)=>{
  const L=len;
  add(sq(ico(L*.5,2),1,.62,.32),body,0,.1,0);                       /* gövde */
  add(sq(ico(L*.3,1),1,.42,.3),belly,0,.085,0);                     /* karın */
  add(sq(cone(L*.3,L*.42,3),1,1,.3),body,-L*.62,.1,0,0,0,PI/2);     /* kuyruk */
  add(sq(cone(L*.18,L*.3,3),1,1,.25),body,L*.08,.1+L*.26,0,0,0,0);  /* sırt yüzgeci */
  add(sq(cone(L*.12,L*.2,3),1,1,.25),belly,L*.02,.1-L*.24,0,PI,0,0);/* karın yüzgeci */
  add(ico(L*.055,0),0xf2efe6,L*.36,.12,.055);
  add(ico(L*.03,0),eye||0x1a1410,L*.38,.12,.07);
  add(ico(L*.055,0),0xf2efe6,L*.36,.12,-.055);
  add(ico(L*.03,0),eye||0x1a1410,L*.38,.12,-.07);
 };
}
X.fish=fishModel(.4,0x6fa0c0,0xcfe0ea);
X.sardine=fishModel(.3,0x6f8ea8,0xdfe8ee);
X.bass=fishModel(.42,0x5e7a62,0xcdd8c4);
X.tuna=fishModel(.52,0x243e66,0xc8d4e0);
/* Pişmiş balık: koyulaşmış deri, ızgara izleri, yanında limon dilimi yok (ada koşulları) */
X.cfish=(g,add)=>{
 fishModel(.4,0xb07a35,0xd8b27a)(g,add);
 for(const x of [-.06,.02,.1])add(box(.012,.09,.06),0x5a3a18,x,.14,0,0,0,.25);
};
/* Yengeç: kabuk, iki kıskaç, altı bacak, sapta gözler */
const crab=(c,cd)=>(g,add)=>{
 add(sq(ico(.1,1),1.15,.55,1),c,0,.1,0);
 add(sq(ico(.07,1),1.1,.3,.9),cd,0,.085,.01);
 for(const s of [-1,1]){
  add(cyl(.016,.016,.11,5),c,s*.1,.1,.06,0,0,s*.9);                 /* kıskaç kolu */
  add(sq(ico(.045,1),1.1,.5,.7),cd,s*.16,.12,.1,0,s*.4,0);
  add(sq(ico(.03,0),1,.3,.6),c,s*.19,.125,.12,0,s*.4,0);
  for(let i=0;i<3;i++){
   add(cyl(.009,.007,.09,4),cd,s*.095,.085,-.02-i*.045,0,0,s*1.1);
   add(cyl(.007,.005,.05,4),cd,s*.135,.055,-.02-i*.045,0,0,s*.5);
  }
  add(cyl(.008,.008,.035,5),c,s*.03,.15,.05);
  add(ico(.014,0),0x14100c,s*.03,.17,.05);
 }
};
X.crab=crab(0xc24a2a,0xa33c20);
X.ccrab=crab(0xb8381a,0xd4603a);
/* Mercan: tabandan ayrılan dallar */
X.coral=(g,add)=>{
 add(sq(ico(.05,1),1.2,.5,1.2),0xd4597a,0,.03,0);
 const br=(x,z,h,t)=>{add(cyl(.016,.022,h,6),0xe86a8a,x,.03+h/2,z,t,0,x*2);add(ico(.022,0),0xf089a4,x+t*.04,.03+h,z)};
 br(.02,0,.16,.1);br(-.035,.02,.12,-.15);br(.01,-.04,.1,.05);br(-.01,.045,.13,.08);
};
/* Dalış maskesi: cam, çerçeve, burunluk ve kayış */
X.mask=(g,add)=>{
 add(rbox(.17,.085,.05,.4,2),0x2b3a44,0,.12,0);
 add(sq(ico(.06,1),1.05,.6,.25),0x7fd0e8,0,.125,.03);
 add(cyl(.035,.03,.04,8),0x2b3a44,0,.075,.015);
 add(cyl(.012,.012,.2,6),0x1f2a32,0,.12,-.035,0,0,PI/2);
};
/* Şişe: cam gövde, boyun, mantar tıpa; dolu olanda su düzeyi */
const bottle=(water)=>(g,add)=>{
 add(cyl(.045,.05,.17,10),0xbfe6f0,0,.095,0);
 if(water)add(cyl(.04,.045,.1,10),0x5fb0e0,0,.065,0);
 add(cyl(.022,.03,.06,8),0xcfe8ee,0,.21,0);
 add(cyl(.024,.022,.03,8),0x9a6a3c,0,.25,0);
 add(cyl(.052,.052,.012,10),0xa9d4de,0,.012,0);
};
X.bottle=bottle(false);
X.wbottle=bottle(true);

/* ---------- yerleştirilen yapıların elde görünen küçük modelleri ---------- */
X.fire=(g,add)=>{
 for(let i=0;i<5;i++){const a=i/5*6.283;add(cyl(.016,.012,.17,5),0x8a5a30,Math.sin(a)*.045,.07,Math.cos(a)*.045,.45,-a,0)}
 for(const [x,z] of [[.08,0],[-.06,.06],[-.02,-.08]])add(sq(ico(.028,0),1,.7,1),0x6b6660,x,.02,z);
 add(sq(ico(.035,0),1,1.4,1),0xff7a2a,0,.16,0);
};
X.bench=(g,add)=>{
 add(box(.26,.02,.14),0xa47544,0,.16,0);
 add(box(.26,.012,.145),0x8a6038,0,.172,0);
 for(const [x,z] of [[-.11,.055],[.11,.055],[-.11,-.055],[.11,-.055]])add(cyl(.013,.013,.16,5),0x7a5530,x,.08,z);
 add(box(.07,.012,.05),0x8d939a,-.05,.182,.02);
 add(cyl(.012,.012,.08,5),0x6b4423,.08,.185,-.02,0,0,PI/2);
};
X.furn=(g,add)=>{
 add(rbox(.2,.2,.18,.2,2),0x77777f,0,.11,0);
 add(box(.1,.09,.02),0x2a2520,0,.08,.09);
 add(sq(ico(.03,0),1,.8,.5),0xff8a3a,0,.08,.095);
 add(cyl(.035,.045,.05,8),0x5e5e66,0,.235,0);
};
const wall=(c,cd)=>(g,add)=>{
 add(box(.24,.22,.035),c,0,.13,0);
 add(box(.24,.014,.045),cd,0,.24,0);
 add(box(.014,.22,.045),cd,-.113,.13,0);
 add(box(.014,.22,.045),cd,.113,.13,0);
};
X.wallw=wall(0xa67848,0x7d5630);
X.walls=wall(0x8c8c94,0x6d6d75);
X.door=(g,add)=>{
 add(box(.2,.26,.03),0x6b4a29,0,.15,0);
 add(box(.2,.02,.04),0x4f3620,0,.27,0);
 add(box(.2,.02,.04),0x4f3620,0,.03,0);
 add(cyl(.016,.016,.02,8),0xc9a23a,.07,.15,.025,PI/2);
};
})();
