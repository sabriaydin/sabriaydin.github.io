/* Hunger 3D - denge verileri (güncelleme 64): kaynak azaltma, zorluk ve alet dayanıklılığı.
   Önceki tablolara (dugumler.js, hayvanlar.js, tarifler.js, esyalar.js, yenilikler.js, genisleme.js) yalnızca değer değişikliği uygular;
   tabloların yapısı ve sıralaması aynı kalır. Çalışma anındaki mantık js/oyun/zorluk.js içindedir.
   Dünya üretimi (uretim.js) değiştirilmemiştir: azaltma, üretimden SONRA konuma bağlı sabit bir sınamayla (rastgele sayı kullanmadan) yapılır;
   böylece köy, kamp ve mağara yerleri aynı tohumda eskisiyle aynı kalır. */
(()=>{
'use strict';
const {O,NODE,ANIMAL,IT,RC}=HG;
const R=(a,b)=>a+((Math.random()*(b-a+1))|0),P=p=>Math.random()<p;

const BAL=HG.BAL={
 /* haritadan kaldırılan doğal kaynak payı */
 thin:{[O.TREE]:.30,[O.PALM]:.25,[O.ROCK]:.40,[O.COAL]:.35,[O.COPPER]:.15,[O.BUSH]:.35,[O.SHROOM]:.40},      /* demir damarı seyreltilmez: bazı haritalarda zaten yalnızca 0-5 damar vardır; azalma verim, yeniden büyüme ve külçe maliyetinden gelir */
 keep:14,                          /* başlangıç noktası çevresinde (kare) azaltma yapılmaz: ilk dakikalar çıkmaza girmesin */
 animThin:.30,                     /* eski kayıtlardaki doğal hayvanların kaldırılan payı */
 animEvery:75,animFrac:.55,        /* hayvan yeniden doğma: denetim aralığı (sn) · hedefin bu oranının altına inince yenisi çıkar (eskiden 22 sn · %80) */
 milk:240,shear:360,               /* süt ve yün bekleme süresi (sn) (eskiden 150 · 240) */
 craftK:1.25,                      /* üretim süresi çarpanı */
 hunK:1.12,thrK:1.1,               /* açlık ve susuzluk hızı çarpanı */
 shroomK:.6,                       /* yeni dünyada mantar sayısı çarpanı */
 yield:[.5,1,1.4,2],               /* alet kademesine göre verim (El Taşı, Taş, Bakır, Demir); eskiden .6 · 1 · 1.6 · 2.4 */
 startStat:86,                     /* yeni oyunda başlangıç açlık ve susuzluk (eskiden 92) */
 /* alet dayanıklılığı: toplama aletlerinde her vuruş, silahlarda hayvana her vuruş bir birim götürür. El Taşı hiç aşınmaz. */
 dur:{axe1:70,pick1:70,axe2:160,pick2:160,axe3:340,pick3:340,spear:45,spear2:110,club:60,sword2:110,sword3:220},
 /* onarım: Çalışma Tezgâhına bakıp E: [gereken malzemeler, geri gelen pay] */
 fix:{
  axe1:[{wood:1,stone:1},.4],pick1:[{wood:1,stone:1},.4],axe2:[{copper_ingot:1},.3],pick2:[{copper_ingot:1},.3],axe3:[{iron_ingot:1},.3],pick3:[{iron_ingot:1},.3],
  spear:[{bone:1,wood:1},.4],spear2:[{iron_ingot:1},.3],club:[{wood:2},.4],sword2:[{copper_ingot:1},.3],sword3:[{iron_ingot:1},.3]
 },
 /* eski kayıt göçü ve seyreltmede dokunulan doğal hayvanlar (kurt ve evcil hayvanlar hariç) */
 nat:['sheep','cow','rabbit','deer','boar','chicken']
};

/* ---------- Toplanabilir düğümler: verim azaldı, yeniden büyüme uzadı ---------- */
const set=(o,p)=>{if(NODE[o])Object.assign(NODE[o],p)};
set(O.TREE,{tot:12,bonus:2,regrow:[O.TREE,720]});
set(O.ROCK,{tot:11,bonus:2,regrow:[O.ROCK,1000]});
set(O.COAL,{tot:8,bonus:1,regrow:[O.COAL,1400]});
set(O.COPPER,{tot:7,sec:['stone',4],bonus:1,regrow:[O.COPPER,2200]});
set(O.IRON,{tot:5,sec:['stone',3],bonus:1,regrow:[O.IRON,3400]});
set(O.SHROOM,{give:()=>['mushroom',P(.4)?2:1],regrow:[O.SHROOM,720]});
set(O.BUSH,{give:()=>['berries',1+(Math.random()*2|0)],regrow:[O.BUSH,260]});
set(O.PALM,{regrow:[O.PALM,320]});
if(NODE[O.PALM]&&NODE[O.PALM].chop)Object.assign(NODE[O.PALM].chop,{tot:9,bonus:1,regrow:[O.PALM,720]});   /* NODE[O.PALM0] aynı nesnedir */

/* ---------- Hayvanlar: sayı ve ganimet azaldı ---------- */
const WANT={sheep:11,cow:8,rabbit:14,deer:8,wolf:7,boar:6,chicken:6};
for(const k in WANT)if(ANIMAL[k])ANIMAL[k].want=WANT[k];
const L=(...a)=>a.filter(q=>q[1]>0);
if(ANIMAL.sheep)ANIMAL.sheep.drops=a=>L(['meat',P(.4)?2:1],['wool',a.sheared?0:R(1,2)]);
if(ANIMAL.cow)ANIMAL.cow.drops=()=>L(['meat',R(1,3)],['leather',P(.4)?2:1],['bone',P(.3)?2:1]);
if(ANIMAL.rabbit)ANIMAL.rabbit.drops=()=>L(['meat',1],['leather',P(.6)?1:0]);
if(ANIMAL.deer)ANIMAL.deer.drops=()=>L(['meat',R(1,3)],['leather',P(.4)?2:1],['bone',P(.3)?2:1]);
if(ANIMAL.wolf)ANIMAL.wolf.drops=()=>L(['meat',P(.4)?2:1],['leather',P(.7)?1:0],['bone',P(.3)?2:1]);
if(ANIMAL.boar)ANIMAL.boar.drops=()=>L(['meat',R(1,3)],['leather',P(.8)?1:0],['bone',P(.4)?2:1]);

/* ---------- Tarif maliyetleri: [eşya, istasyon] → yeni malzemeler ---------- */
const COST=[
 ['axe1','',{wood:4,stone:3}],['pick1','',{wood:4,stone:5}],['rod','',{wood:4,stone:2}],
 ['fire','',{wood:6,stone:4}],['bench','',{wood:14,stone:4}],['furn','',{stone:18}],
 ['plan','',{wood:14}],['hammer','',{wood:14,stone:10}],['door','',{wood:10}],
 ['bow','',{wood:5,leather:2}],
 ['raft','bench',{wood:18,leather:2,wool:3}],['coat','bench',{leather:6,wool:4}],
 ['copper_ingot','furn',{copper_ore:2,coal:1}],['iron_ingot','furn',{iron_ore:2,coal:2}],['bottle','furn',{sand:3,coal:1}],
 ['axe2','bench',{wood:4,copper_ingot:3}],['pick2','bench',{wood:4,copper_ingot:4}],
 ['axe3','bench',{wood:4,iron_ingot:3}],['pick3','bench',{wood:4,iron_ingot:4}],
 ['vest','bench',{leather:7}],['rack','',{wood:10,stone:3}],['barrel','',{wood:12,leather:1}],
 ['plot','',{wood:8,stone:5}],['crate','',{wood:14,stone:3}]
];
/* aynı eşyanın birden çok tarifi varsa yalnızca eşya ve istasyonu eşleşen İLK tarif güncellenir */
for(const [id,st,m] of COST){
 const r=RC.find(q=>q[0]===id&&(q[3]||'')===st);
 if(r)r[2]=m;
}
/* yaygın okun (4'lü) adedi azaldı */
{const r=RC.find(q=>q[0]==='arrow'&&q[1]===4);if(r)r[1]=3}

/* ---------- Yiyecek: doyurucu yemekler biraz azaldı (açıklama metni de güncellenir) ---------- */
for(const k in IT){
 const f=IT[k].food;if(!f||!(f.h>=20))continue;
 const old=f.h;f.h=Math.round(old*.88);
 if(typeof IT[k].d==='string')IT[k].d=IT[k].d.replace(new RegExp('\\+'+old+' açlık'),'+'+f.h+' açlık');
}
if(IT.berries&&IT.berries.food&&IT.berries.food.h===9){
 IT.berries.food.h=8;if(typeof IT.berries.d==='string')IT.berries.d=IT.berries.d.replace(/\+9 açlık/,'+8 açlık');
}

/* ---------- Doğal kaynak seyreltme (konuma bağlı sabit sınama; rastgele sayı üretecini etkilemez) ---------- */
/* obj: nesne ızgarası · (sx, sy): başlangıç noktası · k: Dünya Oluştur'daki Kaynak yoğunluğu çarpanı (Az 1,45 · Normal 1 · Bol 0,4). thinWorld döner: kaldırılan nesne sayısı. */
HG.thinOK=(x,y,v,sx,sy,k)=>{
 const f=BAL.thin[v];
 return !!f&&Math.hypot(x-sx,y-sy)>=BAL.keep&&HG.hash(x,y,900+v)<Math.min(.9,f*(k||1));
};
HG.thinWorld=(obj,sx,sy,k)=>{
 const N=HG.W;let c=0;
 for(let i=0;i<obj.length;i++){
  const v=obj[i];if(!v||!BAL.thin[v])continue;
  if(HG.thinOK(i%N,(i/N)|0,v,sx,sy,k)){obj[i]=O.NONE;c++}
 }
 return c;
};
/* eski (azaltma öncesi) kayıt: bir kez, yüklenen dünyaya uygulanır. Yeniden büyüme sayaçları ve hayvanlar da aynı oranda azalır. */
HG.migrateBalance=()=>{
 const G=HG.G,N=HG.W,sp=G.sp0||{x:G.px,y:G.py};
 const n=HG.thinWorld(G.obj,sp.x,sp.y);
 if(Array.isArray(G.timers))G.timers=G.timers.filter(t=>{
  if(!t||!BAL.thin[t.to])return true;
  return !HG.thinOK(t.i%N,(t.i/N)|0,t.to,sp.x,sp.y);
 });
 let a=0;
 if(Array.isArray(G.animals)){
  const before=G.animals.length;
  G.animals=G.animals.filter(q=>!(BAL.nat.includes(q.t)&&!q.pet&&HG.hash(Math.floor(q.x),Math.floor(q.z),977)<BAL.animThin));
  a=before-G.animals.length;
 }
 G.thin=1;G.thinInfo={obj:n,an:a};
 return G.thinInfo;
};
})();
