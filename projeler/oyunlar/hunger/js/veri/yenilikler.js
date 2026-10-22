/* Hunger 3D - yeni içerik verileri (güncelleme 49): eşyalar, tarifler, tavuk, silah hasarı, zırh.
   Mevcut tablolara ekleme yapar; esyalar.js, tarifler.js, hayvanlar.js içindeki özgün tanımlara dokunmaz. */
(()=>{
'use strict';
const {O,IT,RC,ANIMAL,DMG,PLACE_ITEM}=HG;
const R=(a,b)=>a+((Math.random()*(b-a+1))|0);

/* ---------- Eşyalar ---------- */
Object.assign(IT,{
 /* ekim zinciri */
 seed:{n:'Tohum',s:40,d:'Ekim Tarlasına elle ekilir. Yaban meyvesinden elde edilir.'},
 wheat:{n:'Buğday',s:40,d:'Ekim Tarlasında yetişir. Ateşte ekmeğe dönüşür.'},
 bread:{n:'Ekmek',s:20,food:{h:34,t:-3},d:'Yenir: +34 açlık, -3 susuzluk.'},
 /* yemekler */
 bowl:{n:'Kase',s:10,d:'Güveç için gerekir. Yemek yenince geri gelir.'},
 stew:{n:'Et Güveci',s:5,food:{h:60,t:14,ret:'bowl'},d:'Yenir: +60 açlık, +14 susuzluk. Kase geri döner.'},
 juice:{n:'Meyve Suyu',s:10,food:{h:7,t:40,ret:'bottle'},d:'İçilir: +7 açlık, +40 susuzluk. Şişe geri gelir.'},
 jerky:{n:'Kurutulmuş Et',s:20,food:{h:40,t:-4},d:'Yenir: +40 açlık, -4 susuzluk. Kurutma Rafında hazırlanır.'},
 dfish:{n:'Kurutulmuş Balık',s:20,food:{h:32,t:-3},d:'Yenir: +32 açlık, -3 susuzluk. Kurutma Rafında hazırlanır.'},
 mushroom:{n:'Mantar',s:20,food:{h:6,t:0},d:'Ormanın gölgesinde yetişir. Yenir: +6 açlık. Ateşte pişirmek çok daha doyurucudur.'},
 cmush:{n:'Pişmiş Mantar',s:20,food:{h:20,t:0},d:'Yenir: +20 açlık'},
 egg:{n:'Yumurta',s:12,food:{h:8,t:0,hp:-3},d:'Çiğ yenirse sağlığa zarar verir. Ateşte haşlanır.'},
 cegg:{n:'Haşlanmış Yumurta',s:12,food:{h:26,t:0},d:'Yenir: +26 açlık'},
 feather:{n:'Tüy',s:50,d:'Hasır Yatak ve ok yapımında kullanılır. Tavuklardan düşer.'},
 salve:{n:'Şifalı Merhem',s:5,heal:true,hp:32,d:'Kanamayı durdurur ve çok sağlık verir. Elde basılı tutarak sürün.'},
 msg:{n:'Şişedeki Mesaj',s:5,d:'Sahile vuran mühürlü bir şişe. Elde tutup E ile okuyun; mesaj Günlük\'te saklanır.'},
 /* zırh: çantada taşınırken geçerli (yalnızca en iyisi sayılır) */
 vest:{n:'Deri Yelek',s:1,armor:.2,d:'Çantada taşınırken alınan hasarı %20 azaltır. Zırhlar birikmez, en iyisi geçerlidir.'},
 iarmor:{n:'Demir Göğüslük',s:1,armor:.4,d:'Çantada taşınırken alınan hasarı %40 azaltır. Zırhlar birikmez, en iyisi geçerlidir.'},
 /* silah ve gözlem aleti */
 spear2:{n:'Demir Mızrak',s:1,tool:'spear',tier:2,d:'Mızraktan çok daha güçlü; hayvanlara ve Gölgelere karşı etkilidir.'},
 spyglass:{n:'Dürbün',s:1,tool:'spyglass',tier:1,d:'Elde tutup E veya sağ tıkla yakınlaştırın; tekrar basınca kapanır.'},
 /* yerleştirilen yapılar */
 bed:{n:'Hasır Yatak',s:5,place:O.BED,d:'Gece üzerine bakıp E ile uyunur. Uyku tulumundan daha dinlendiricidir; yağmur ve soğuktan korunmak için çatı altına kurun.'},
 rack:{n:'Kurutma Rafı',s:5,place:O.RACK,d:'Çiğ et ve balık elde tutulup E ile asılır; kuruyunca E ile alınır. Yağmur altında kurumaz.'},
 barrel:{n:'Yağmur Varili',s:5,place:O.BARREL,d:'Yağmur yağarken dolar. Boş şişeyle E ile şişe doldurulur, şişesizse doğrudan içilir.'},
 tpost:{n:'Meşale Direği',s:10,place:O.TORCHP,d:'Sönmeyen sabit ışık verir. Gölgeleri uzak tutar, geceyi aydınlatır.'},
 snare:{n:'Av Tuzağı',s:5,place:O.SNARE,d:'Yere kurulur, zamanla küçük av yakalar. Yem (yaban meyvesi) süreyi kısaltır. Avı E ile alın.'},
 plot:{n:'Ekim Tarlası',s:5,place:O.PLOT,d:'Üzerine bakıp elde tohumla E: ekim. Olgunlaşınca E ile hasat edilir; yağmur büyümeyi hızlandırır.'}
});
for(const k of ['bed','rack','barrel','tpost','snare','plot'])PLACE_ITEM[IT[k].place]=k;

/* ---------- Tarifler: [çıktı, adet, {gerekenler}, istasyon] ---------- */
RC.push(
 ['seed',3,{berries:2}],['bowl',1,{wood:2}],
 ['bread',1,{wheat:3},'fire'],['stew',1,{bowl:1,meat:1,berries:2},'fire'],['stew',1,{bowl:1,cmeat:1,mushroom:2},'fire'],
 ['cmush',1,{mushroom:2},'fire'],['cegg',1,{egg:1},'fire'],
 ['juice',1,{berries:4,bottle:1},'bench'],['salve',1,{wool:1,berries:3,mushroom:1},'bench'],
 ['arrow',6,{wood:1,stone:1,feather:2}],
 ['vest',1,{leather:6},'bench'],['iarmor',1,{iron_ingot:8,leather:3},'bench'],
 ['spear2',1,{wood:3,iron_ingot:2,bone:2},'bench'],['spyglass',1,{copper_ingot:2,bottle:1,leather:1},'bench'],
 ['bed',1,{wood:8,wool:4,feather:3},'bench'],['rack',1,{wood:8,stone:2}],['barrel',1,{wood:10,leather:1}],
 ['tpost',1,{wood:4,coal:2}],['snare',1,{wood:4,leather:1,bone:1}],['plot',1,{wood:6,stone:4}]
);

/* ---------- Silah hasarı ---------- */
DMG.item.spear2=46;

/* ---------- Tavuk ---------- */
ANIMAL.chicken={n:'Tavuk',snd:'chicken',hp:100,weak:1.2,xpv:3,walk:.8,run:3.8,r:.24,h:.5,flee:5,want:9,sp:14,roam:5,prey:true,egg:true,
 drops:()=>[['meat',1],['feather',R(1,3)]]};

/* ---------- Eşya sınıfları ---------- */
/* Zırh en iyi taşınan parçadır: sonuç 0-0.4 arası bir hasar azaltma oranıdır */
HG.armorOf=()=>{let m=0;for(const s of HG.G.inv||[])if(s&&IT[s.id]&&IT[s.id].armor)m=Math.max(m,IT[s.id].armor);return m};
})();
