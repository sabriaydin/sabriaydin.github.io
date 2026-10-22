/* Hunger 3D - elde tutulan eşya modelleri III (güncelleme 54).
   Daha önce elde renksiz bir çokgen olarak görünen yiyecek, giysi ve diğer eşyalar gerçek modellerle çizilir.
   Özgün dosyalara dokunulmaz: yalnızca sc.heldX kayıt defterine eklenir.
   Ölçek: gerçek boya yakın tutulur (bir elmanın çapı ~8 cm, bir ekmeğin boyu ~24 cm). */
(()=>{
'use strict';
const sc=HG.sc;
if(!sc||!sc.g)return;
const {cyl,cone,ico,box,rbox,blob}=sc.g;
const PI=Math.PI;
const X=sc.heldX=sc.heldX||{};
const sq=(geo,x,y,z)=>{geo.scale(x,y,z);return geo};

/* ---------- yiyecekler ---------- */
/* Yaban meyvesi: avuçta küçük bir salkım */
X.berries=(g,add)=>{
 const P=[[0,.055,0,.026],[.032,.05,.014,.022],[-.03,.052,-.012,.023],[.008,.085,-.028,.02],[-.014,.082,.026,.019]];
 for(const [x,y,z,r] of P){
  add(sq(ico(r,1),1,.92,1),0xb22633,x,y,z);
  add(cyl(.0025,.0025,.018,4),0x4a6a32,x,y+r*.9,z);
 }
 add(cyl(.004,.003,.05,4),0x4a6a32,0,.1,-.005,.3,0,.1);
};
/* Hindistan cevizi: kahverengi lifli kabuk, üç göz */
X.coconut=(g,add)=>{
 add(sq(ico(.072,1),1,1.08,.96),0x5b3a1c,0,.082,0);
 add(sq(ico(.062,1),1,1,1),0x4a2e15,0,.082,.03);
 for(const [x,z] of [[-.016,.058],[.016,.058],[0,.044]])add(cyl(.007,.007,.008,6),0x2a1a0c,x,.082,z,PI/2);
};
/* Çiğ et: kemikli but; koyu kırmızı, yağ damarlı */
X.meat=(g,add)=>{
 add(sq(blob(.072,2,.05,21,1,1,1),1.05,.9,1.5),0x9c3a35,0,.095,0);
 add(sq(blob(.052,2,.04,23,1,1,1),1,.95,1.2),0xb4514a,0,.095,.05);
 add(cyl(.013,.013,.1,7),0xe8e0cc,0,.085,-.105,PI/2);
 add(sq(ico(.021,0),1,1,.9),0xf0e8d4,0,.085,-.155);
 add(sq(blob(.03,1,.03,27,1,1,1),1.3,.5,1.1),0xd8b0a2,.03,.13,.01);
};
/* Pişmiş et: kızarmış yüzey, koyu kabuk */
X.cmeat=(g,add)=>{
 add(sq(blob(.07,2,.05,31,1,1,1),1.05,.88,1.45),0x6b3a1e,0,.092,0);
 add(sq(blob(.05,2,.04,33,1,1,1),1,.9,1.15),0x8a4f24,0,.092,.05);
 add(cyl(.013,.013,.1,7),0xe4dcc6,0,.082,-.1,PI/2);
 add(sq(ico(.02,0),1,1,.9),0xeee6d0,0,.082,-.148);
};
/* Süt şişesi: ağzı bezle kapatılmış cam şişe */
X.milk=(g,add)=>{
 add(cyl(.036,.04,.15,10),0xf2f0e8,0,.085,0);
 add(cyl(.018,.03,.035,10),0xf2f0e8,0,.175,0);
 add(cyl(.019,.019,.022,10),0xe8e4da,0,.2,0);
 add(cyl(.022,.022,.008,10),0xcfc7b4,0,.207,0);
 add(cyl(.041,.041,.006,10),0xdcd8cc,0,.012,0);
};
/* Midye: iki kabuk, aralık açık */
X.shell=(g,add)=>{
 for(const s of [1,-1])add(sq(ico(.045,1),1.25,.42,1),0x3a4a5c,0,.055+s*.018,0,0,0,s*.14);
 add(sq(ico(.032,0),1.2,.3,.95),0x8a93a0,0,.055,.004);
};
X.cshell=(g,add)=>{
 for(const s of [1,-1])add(sq(ico(.045,1),1.25,.42,1),0x6a5a4a,0,.055+s*.024,0,0,0,s*.3);
 add(sq(ico(.03,0),1.1,.4,.95),0xe8a060,0,.055,.004);
};
/* Deniz yosunu: ince uzun yapraklar */
X.kelp=(g,add)=>{
 for(let i=0;i<5;i++){
  const a=i/5*6.28,r=.016;
  add(sq(box(.028,.22,.006),1,1,1),i%2?0x3a6a4a:0x2f5a3c,Math.cos(a)*r,.12+(i%3)*.02,Math.sin(a)*r,.12*Math.cos(a),a,.1*Math.sin(a));
 }
 add(cyl(.009,.006,.05,6),0x2a4a30,0,.025,0);
};
/* Bal: kavanozda koyu altın sarısı */
X.honey=(g,add)=>{
 add(cyl(.042,.045,.11,10),0xd98f2a,0,.065,0);
 add(cyl(.0455,.0455,.012,10),0xe8e4da,0,.125,0);
 add(cyl(.047,.047,.006,10),0x8a5a30,0,.132,0);
 add(box(.05,.03,.002),0xf0e8d0,0,.075,.046);
};
/* Elma: sap ve yaprak */
X.apple=(g,add)=>{
 add(sq(blob(.042,2,.02,41,1,1,1),1,.95,1),0xc42d3a,0,.05,0);
 add(cyl(.0035,.003,.028,5),0x5a3a1c,0,.092,0,0,0,.18);
 add(sq(ico(.016,0),1.3,.25,.8),0x4a7a38,.016,.098,0,0,.5,.4);
};
/* Şifalı ot: demet hâlinde yapraklar */
X.herb=(g,add)=>{
 for(let i=0;i<6;i++){
  const a=i/6*6.28;
  add(sq(ico(.016,1),.55,1.5,.35),i%2?0x4f8a3c:0x3f7a34,Math.cos(a)*.016,.11+(i%2)*.018,Math.sin(a)*.016,.2*Math.sin(a),a,.2*Math.cos(a));
 }
 add(cyl(.008,.006,.07,6),0x6a7a3a,0,.035,0);
 add(cyl(.011,.011,.012,6),0xc9b07a,0,.056,0);
};
/* Bitki çayı: buharlı tahta kase */
X.tea=(g,add)=>{
 add(cyl(.042,.03,.045,12),0x8a5a30,0,.03,0);
 add(cyl(.039,.039,.006,12),0x6a4a28,0,.052,0);
 add(cyl(.036,.036,.004,12),0x8a6a2a,0,.049,0);
 add(sq(ico(.012,0),1,.4,1),0x9a7a3a,.012,.052,.008);
};
/* Ballı kek: dilimlenmiş, üstü bal akan */
X.cake=(g,add)=>{
 add(sq(rbox(.07,.05,.07,.3,2),1,1,1),0xc9a15a,0,.045,0);
 add(sq(rbox(.068,.012,.068,.3,2),1,1,1),0xe0b84a,0,.076,0);
 add(sq(ico(.014,0),1.2,.35,1.2),0xd9912a,.02,.083,.015);
 add(sq(ico(.011,0),1.2,.35,1.2),0xd9912a,-.022,.083,-.01);
};
/* Ekmek: kabuğu çizikli somun */
X.bread=(g,add)=>{
 add(sq(blob(.062,2,.025,51,1,1,1),1,.8,1.9),0xb4793a,0,.055,0);
 for(let i=-1;i<=1;i++)add(sq(box(.07,.008,.012),1,1,1),0x8a5a26,0,.098,i*.035,0,0,0);
 add(sq(blob(.05,2,.02,53,1,1,1),1,.5,1.7),0xc9924a,0,.075,0);
};
/* Et güveci: topraktan kase, içinde et parçaları */
X.stew=(g,add)=>{
 add(cyl(.052,.038,.06,12),0x7a4a32,0,.04,0);
 add(cyl(.05,.05,.007,12),0x5e3a26,0,.07,0);
 add(cyl(.046,.046,.005,12),0x7a4a22,0,.068,0);
 for(const [x,z] of [[.014,.01],[-.016,.012],[.004,-.018]])add(sq(ico(.012,0),1,.6,1),0x8a4a28,x,.071,z);
 add(sq(ico(.009,0),1,.5,1),0xd9a040,.024,.071,-.012);
};
/* Meyve suyu: ağzı yapraklı testi */
X.juice=(g,add)=>{
 add(cyl(.034,.042,.105,10),0xb4423a,0,.06,0);
 add(cyl(.02,.03,.03,10),0xb4423a,0,.126,0);
 add(cyl(.023,.023,.01,10),0x8a5a30,0,.145,0);
 add(cyl(.0045,.0045,.045,5),0x7a4a28,.042,.086,0,0,0,PI/2);
};
/* Kurutulmuş et: ince uzun şeritler */
X.jerky=(g,add)=>{
 for(let i=0;i<3;i++)add(sq(rbox(.016,.055,.006,.4,1),1,1,1),i%2?0x7a2f22:0x8a3a28,(i-1)*.022,.06,i%2?.006:0,0,0,(i-1)*.12);
 add(cyl(.0025,.0025,.07,4),0xc9b07a,0,.115,0,0,0,PI/2);
};
/* Kurutulmuş balık: düzleşmiş, ipe asılmış */
X.dfish=(g,add)=>{
 add(sq(blob(.04,2,.03,61,1,1,1),.45,1,2.1),0x9a8a6a,0,.09,0);
 add(sq(ico(.022,0),.3,1,1),0x8a7a5c,0,.09,-.085);
 add(sq(ico(.012,0),.4,.9,.7),0x6a5a40,0,.09,.075);
 add(cyl(.002,.002,.05,4),0xc9b07a,0,.15,.06);
};
/* Mantar: kalın sap, kubbe şapka */
X.mushroom=(g,add)=>{
 add(cyl(.016,.021,.075,9),0xe8e0cc,0,.045,0);
 add(sq(ico(.045,1),1,.55,1),0xa83a2e,0,.088,0);
 add(cyl(.044,.044,.006,12),0xe8ddc4,0,.078,0);
 for(const [x,z] of [[.018,.012],[-.016,.016],[.004,-.022]])add(sq(ico(.007,0),1,.3,1),0xf0e8d8,x,.102,z);
};
X.cmush=(g,add)=>{
 add(cyl(.015,.02,.07,9),0xb49a72,0,.042,0);
 add(sq(ico(.042,1),1,.5,1),0x6b3a22,0,.082,0);
 add(cyl(.04,.04,.006,12),0x8a6a46,0,.073,0);
};
/* Yumurta */
X.egg=(g,add)=>{add(sq(ico(.031,2),1,1.32,1),0xf0e2c8,0,.042,0)};
X.cegg=(g,add)=>{
 add(sq(ico(.031,2),1,1.32,1),0xf6f0e2,0,.042,0);
 add(sq(ico(.016,1),1,.25,1),0xe8c044,0,.082,0);
};

/* ---------- giysi ve zırh ---------- */
const garment=(add,body,trim,collar)=>{
 add(sq(rbox(.1,.085,.05,.35,2),1,1,1),body,0,.09,0);
 add(sq(rbox(.102,.02,.052,.35,2),1,1,1),trim,0,.142,0);
 add(sq(rbox(.045,.03,.045,.4,2),1,1,1),collar,0,.158,0);
 add(sq(rbox(.035,.055,.042,.4,2),1,1,1),body,-.072,.098,0,0,0,.25);
 add(sq(rbox(.035,.055,.042,.4,2),1,1,1),body,.072,.098,0,0,0,-.25);
 add(sq(box(.004,.07,.052),1,1,1),trim,0,.095,.001);
};
X.coat=(g,add)=>{garment(add,0x6b4a2a,0x4a3018,0x7a5a36);add(sq(ico(.008,0),1,1,.4),0xc9a15a,.016,.11,.027);add(sq(ico(.008,0),1,1,.4),0xc9a15a,.016,.075,.027)};
X.vest=(g,add)=>{garment(add,0x7a5430,0x53381c,0x8a6238);add(sq(box(.1,.012,.054),1,1,1),0x53381c,0,.11,0)};
X.furcoat=(g,add)=>{
 garment(add,0x5a4632,0x6e5a40,0xb8a890);
 for(let i=0;i<9;i++){const a=i/9*6.28;add(sq(ico(.012,1),1,.7,1),0xa08a6c,Math.cos(a)*.052,.15,Math.sin(a)*.03)}
};
X.cloak=(g,add)=>{
 add(sq(cone(.085,.18,10,1),1,1,.65),0x5a5a52,0,.06,0);
 add(sq(rbox(.05,.025,.035,.4,2),1,1,1),0x6a6a60,0,.155,0);
 add(cyl(.011,.011,.008,8),0xc9a15a,0,.168,.02,PI/2);
 add(sq(ico(.03,1),1.6,.25,1),0xe0d8a8,0,.03,0);
};
X.boots=(g,add)=>{
 for(const s of [-1,1]){
  add(sq(rbox(.028,.055,.03,.4,2),1,1,1),0x53381c,s*.034,.075,-.01);
  add(sq(rbox(.03,.022,.055,.35,2),1,1,1),0x45301a,s*.034,.03,.016);
  add(sq(box(.064,.012,.112),1,1,1),0x241a10,s*.034,.012,.014);
  add(sq(box(.058,.008,.02),1,1,1),0xc9a15a,s*.034,.115,-.012);
 }
};
X.iarmor=(g,add)=>{
 add(sq(rbox(.095,.095,.052,.3,2),1,1,1),0x8d939a,0,.095,0);
 add(sq(rbox(.098,.016,.054,.3,2),1,1,1),0xb0b6bc,0,.152,0);
 add(sq(rbox(.098,.016,.054,.3,2),1,1,1),0x6d737a,0,.05,0);
 add(sq(rbox(.04,.04,.046,.4,2),1,1,1),0x9aa0a8,-.07,.12,0,0,0,.3);
 add(sq(rbox(.04,.04,.046,.4,2),1,1,1),0x9aa0a8,.07,.12,0,0,0,-.3);
 add(sq(box(.006,.09,.055),1,1,1),0x5e646a,0,.095,0);
 for(const y of [.07,.105,.14])add(sq(ico(.006,0),1,1,.5),0x5e646a,-.04,y,.027);
};

/* ---------- diğer ---------- */
/* Hazine haritası: rulo kâğıt, kırmızı çarpı */
X.tmap=(g,add)=>{
 add(cyl(.042,.042,.13,12),0xe4d7ae,0,.07,0,0,0,PI/2);
 add(cyl(.043,.043,.004,12),0xcfbf93,-.067,.07,0,0,0,PI/2);
 add(cyl(.043,.043,.004,12),0xcfbf93,.067,.07,0,0,0,PI/2);
 add(sq(box(.1,.001,.03),1,1,1),0xc44a3a,0,.113,.0,0,.6,0);
 add(cyl(.0035,.0035,.145,6),0x8a5a30,0,.07,0,0,0,PI/2);
};
/* Şişedeki mesaj: tıpalı şişe, içinde rulo */
X.msg=(g,add)=>{
 add(cyl(.03,.034,.11,10),0x9ec9c4,0,.065,0);
 add(cyl(.016,.026,.03,10),0x9ec9c4,0,.132,0);
 add(cyl(.015,.015,.02,8),0x8a5a30,0,.152,0);
 add(cyl(.012,.012,.07,8),0xe4d7ae,0,.062,0,0,0,.25);
 add(cyl(.0121,.0121,.01,8),0xc44a3a,0,.062,0,0,0,.25);
};
/* Tohum: küçük bez kese */
X.seed=(g,add)=>{
 add(sq(blob(.04,2,.03,71,1,1,1),1,.95,1),0xcfc0a0,0,.045,0);
 add(cyl(.016,.022,.028,8),0xbfae8c,0,.085,0);
 add(cyl(.018,.018,.006,8),0x8a7a56,0,.098,0);
 for(const [x,z] of [[.02,.014],[-.018,.01],[.002,-.02]])add(sq(ico(.006,0),1,.6,1.4),0x8a6a3a,x,.108,z,.3,0,.4);
};
/* Köpek yavrusu: kucakta duran küçük köpek */
X.puppy=(g,add)=>{
 add(sq(blob(.05,2,.02,81,1,1,1),1,.85,1.4),0x9a7a52,0,.07,0);
 add(sq(ico(.034,1),1,.95,1),0xa98a60,0,.115,.055);
 add(sq(ico(.016,1),1.1,.7,1.3),0xb89a70,0,.1,.085);
 add(sq(ico(.008,0),1,1,.6),0x2a1a12,0,.102,.104);
 for(const s of [-1,1]){
  add(sq(ico(.012,1),.5,1.2,.9),0x8a6a46,s*.024,.142,.05,.2,0,s*.25);
  add(sq(ico(.0055,0),1,1,.7),0x1a1a1c,s*.013,.122,.082);
  add(cyl(.009,.008,.03,6),0x9a7a52,s*.022,.035,.03);
  add(cyl(.009,.008,.03,6),0x9a7a52,s*.022,.035,-.028);
 }
 add(cyl(.007,.004,.035,6),0xa98a60,0,.085,-.055,-.7);
};
})();
