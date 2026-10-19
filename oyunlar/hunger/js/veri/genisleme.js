/* Hunger 3D - büyük güncelleme (51) verileri: yeni eşyalar, tarifler, yapılar, ayı ve köpek, silah hasarı.
   Mevcut tablolara ekleme yapar; esyalar.js, tarifler.js, hayvanlar.js, dugumler.js içindeki özgün tanımlara dokunmaz. */
(()=>{
'use strict';
const {O,IT,RC,ANIMAL,DMG,PLACE_ITEM,NAMES,OBJTOP}=HG;
const R=(a,b)=>a+((Math.random()*(b-a+1))|0);

/* ---------- Eşyalar ---------- */
Object.assign(IT,{
 /* yerleştirilen yapılar */
 crate:{n:'Depo Sandığı',s:5,place:O.CHEST,d:'Yerleştirilince E ile açılır: 24 kutuluk depo. İçi doluyken geri alınamaz.'},
 sign:{n:'Tabela',s:10,place:O.SIGN,d:'Yerleştirilip E ile üzerine yazı yazılır; yakından okunur. Yol ve depo işaretlemek için kullanılır.'},
 apiary:{n:'Arı Kovanı',s:5,place:O.APIARY,d:'Zamanla bal ve balmumu üretir; çalılık çevrede, gündüz ve yağmursuz havada daha hızlı. Ürünü E ile alın; elde yanan meşale varken arılar sokmaz.'},
 ftrap:{n:'Balık Kapanı',s:5,place:O.FTRAP,d:'Su kenarındaki kuma kurulur; zamanla balık ve yengeç yakalar. Ürünü E ile alın.'},
 /* yiyecek ve malzeme */
 honey:{n:'Bal',s:20,food:{h:24,t:-3},d:'Yenir: +24 açlık, -3 susuzluk; dayanıklılığı da yeniler. Yabani kovandan ve Arı Kovanından elde edilir.'},
 comb:{n:'Balmumu',s:50,d:'Arı Kovanı, Mumlu Pelerin ve Şifalı Merhem üretiminde kullanılır.'},
 apple:{n:'Elma',s:20,food:{h:12,t:8},d:'Yenir: +12 açlık, +8 susuzluk. Ağaç kesilirken nadiren düşer; sonbaharda daha sık.'},
 herb:{n:'Şifalı Ot',s:30,food:{h:2,t:2},d:'Çalılardan ve mantar toplarken bulunur. Bitki Çayı, Bandaj ve Merhem yapımında kullanılır.'},
 tea:{n:'Bitki Çayı',s:10,food:{h:3,t:36,ret:'bottle'},d:'İçilir: +36 susuzluk; ateşi düşürür ve ısıtır. Şişe geri gelir.'},
 cake:{n:'Ballı Kek',s:10,food:{h:52,t:-5},d:'Yenir: +52 açlık, -5 susuzluk. Ateşte pişirilir.'},
 fur:{n:'Kürk',s:50,d:'Ayıdan elde edilir. Kürk Palto üretiminde kullanılır.'},
 /* aletler ve silahlar */
 shovel:{n:'Kürek',s:1,tool:'shovel',tier:1,d:'Kuma veya toprağa bakıp E ile kazın. Hazine Haritasındaki gömülü yeri bulmak için gerekir.'},
 club:{n:'Sopa',s:1,tool:'club',tier:1,d:'Basit yakın dövüş silahı: ellerden ve El Taşından çok daha etkilidir.'},
 sword2:{n:'Bakır Kılıç',s:1,tool:'sword',tier:2,d:'Hızlı ve keskin yakın dövüş silahı. Kılıç Ustası yeteneğiyle daha da güçlenir.'},
 sword3:{n:'Demir Kılıç',s:1,tool:'sword',tier:3,d:'En güçlü yakın dövüş silahı; ayıya ve Gölgelere karşı etkilidir.'},
 shield:{n:'Tahta Kalkan',s:1,tool:'shield',tier:1,d:'Elde tutarken sağ tıkı basılı tutarak siper alın: önden gelen darbeyi %60 azaltır, her engellemede dayanıklılık harcar.'},
 shield2:{n:'Demir Kalkan',s:1,tool:'shield',tier:2,d:'Elde tutarken sağ tıkı basılı tutarak siper alın: önden gelen darbeyi %80 azaltır, dayanıklılığı daha az harcar.'},
 /* giyim: çantada taşınırken geçerli */
 furcoat:{n:'Kürk Palto',s:1,d:'Çantada taşınırken soğuğu büyük oranda keser, ıslanmayı azaltır ve hasarı %10 düşürür. Deri Montun yerini alır.'},
 cloak:{n:'Mumlu Pelerin',s:1,d:'Çantada taşınırken yağmurda ve suda ıslanmayı büyük oranda önler.'},
 boots:{n:'Deri Çizme',s:1,d:'Çantada taşınırken düşme hasarını %40 azaltır.'},
 /* hazine ve arkadaş */
 tmap:{n:'Hazine Haritası',s:5,d:'Elde tutup E ile okunur: gömülü bir hazinenin yaklaşık yerini haritada işaretler. Kürekle kazılır.'},
 puppy:{n:'Köpek Yavrusu',s:1,d:'Elde tutup bir yere bakarak E: köpek arkadaşınız olur. Düşmanlara saldırır; et ile beslenir.'}
});
for(const k of ['crate','sign','apiary','ftrap'])PLACE_ITEM[IT[k].place]=k;

/* ---------- Tarifler: [çıktı, adet, {gerekenler}, istasyon] ---------- */
RC.push(
 ['crate',1,{wood:12,stone:2}],['sign',2,{wood:3}],['apiary',1,{wood:8,comb:3},'bench'],['ftrap',1,{wood:8,leather:2}],
 ['tea',1,{wbottle:1,herb:2},'fire'],['cake',1,{wheat:2,honey:1,egg:1},'fire'],
 ['bandage',2,{wool:1,herb:2}],['salve',1,{herb:3,comb:1},'bench'],
 ['shovel',1,{wood:3,copper_ingot:2},'bench'],['club',1,{wood:6,bone:1}],
 ['sword2',1,{copper_ingot:4,wood:2,leather:1},'bench'],['sword3',1,{iron_ingot:5,wood:2,leather:2},'bench'],
 ['shield',1,{wood:8,leather:2},'bench'],['shield2',1,{iron_ingot:4,wood:4,leather:2},'bench'],
 ['furcoat',1,{fur:5,leather:2,wool:2},'bench'],['cloak',1,{wool:3,comb:2,leather:1},'bench'],['boots',1,{leather:4,wool:1},'bench']
);

/* ---------- Nesne adları ve nişan yükseklikleri ---------- */
NAMES[O.CHEST]='Depo sandığı';NAMES[O.SIGN]='Tabela';NAMES[O.APIARY]='Arı kovanı';NAMES[O.FTRAP]='Balık kapanı';NAMES[O.HIVEW]='Yabani arı kovanı';
Object.assign(OBJTOP,{[O.CHEST]:.75,[O.SIGN]:1.35,[O.APIARY]:1.05,[O.FTRAP]:.6,[O.HIVEW]:1.7});

/* ---------- Silah hasarı (sağlık yüzdesi) ---------- */
Object.assign(DMG.item,{shovel:9,club:24,sword2:40,sword3:56,shield:6,shield2:8,puppy:1,tmap:1});

/* ---------- Ayı ve köpek ----------
   Ayı: ormanda dolaşır, yaklaşana saldırır; kürk ve çok et verir. Haritadaki sayısını js/oyun/genisleme2.js yönetir (want: 0).
   Köpek: oyuncunun arkadaşıdır (dyn: kayda animals içinde yazılmaz; G.x2.pet saklanır). */
ANIMAL.bear={n:'Ayı',snd:'bear',hp:100,weak:.55,xpv:14,walk:1.1,run:5.6,r:.8,h:1.5,flee:0,aggr:7,dmg:19,bleed:.4,cd:1.8,chase:8,cspd:4.6,giveUp:16,want:0,sp:60,roam:12,
 drops:()=>[['meat',R(3,5)],['leather',R(2,3)],['bone',R(2,3)],['fur',R(2,4)]]};
ANIMAL.dog={n:'Köpek',snd:'dog',dyn:true,pet:true,hp:100,weak:1,xpv:0,walk:1.5,run:7.2,r:.4,h:.62,flee:0,want:0,sp:10,roam:3,drops:()=>[]};

/* ---------- Giyim ve zırh sorguları ---------- */
HG.has=id=>HG.count(id)>0;
/* Soğuğa karşı çarpan: Kürk Palto .4, Deri Mont .5, giyim yok 1 */
HG.coldK=()=>HG.has('furcoat')?.4:HG.has('coat')?.5:1;
/* Islanma çarpanı: Mumlu Pelerin .3, Kürk Palto .65 */
HG.wetK=()=>HG.has('cloak')?.3:HG.has('furcoat')?.65:1;
/* Düşme hasarı çarpanı */
HG.fallK=()=>HG.has('boots')?.6:1;

/* ---------- Oyun içi rehber: Yeni sistemler ---------- */
HG.GUIDE.news=[
 ['Mevsimler','Yıl 24 gündür; her mevsim 6 gün sürer: Bahar, Yaz, Sonbahar, Kış. Bahar ekinleri ve arıları hızlandırır; Yaz susuzluğu artırır; Sonbaharda ağaçlardan daha çok elma düşer; Kışın kar yağar, soğuk çok sert olur, ekinler yavaşlar, arılar çalışmaz, ayılar uykuya yatar. Mevsimler Ayarlar > Oyun bölümünden kapatılabilir. Mevsim adı sağ alttaki saatin yanında görünür.'],
 ['Islaklık ve ateş','Yüzmek, sığ suda yürümek ve yağmur sizi ıslatır; ıslakken soğuk daha hızlı işler. Ateş başında, barınakta veya güneşte kurursunuz. Uzun süre ıslak ve üşümüş kalırsanız ateşiniz çıkar: açlık, dayanıklılık ve sağlık zarar görür. Bitki Çayı, Şifalı Merhem veya uyku ateşi düşürür. Mumlu Pelerin ıslanmayı azaltır.'],
 ['Depo Sandığı','Üretim panelinden Depo Sandığı üretip yere kurun. E ile 24 kutuluk depo açılır. Çanta kutusuna Shift + tıklamak eşyayı hızlıca sandığa koyar; "Hepsini al", "Çantayı boşalt" ve "Aynılarını koy" düğmeleri vardır. İçinde eşya varken sandık geri alınamaz.'],
 ['Tabela','Tabela yerleştirin, E ile 48 karaktere kadar yazı yazın. Yazı yakından okunur; yol ve depo işaretlemek için idealdir. İşiniz bitince "Tabelayı geri al" ile söküp taşıyabilirsiniz.'],
 ['Arıcılık','Ormanda ağaçlarda yabani arı kovanları bulunur: elinizde yanan bir meşale varken E ile bal ve balmumu alın (meşalesiz arılar sokar). Balmumuyla Arı Kovanı üretip çalılık bir yere kurun; gündüz, yağmursuz ve çevrede çalı varken daha hızlı bal yapar. Kışın çalışmaz.'],
 ['Balık Kapanı','Su kenarındaki kuma kurulur. Zamanla balık ve yengeç yakalar; ürün E ile alınır. Elinizde yem (çiğ yemiş, deniz kabuğu, yosun) varsa kapan daha çabuk dolar.'],
 ['Kürek ve hazine','Kürekle kum ve toprak kazılır; hazine yakınındayken kürek "sıcak/ılık" ipucu verir. Hazine Haritası veya köylü söylentisi haritada yaklaşık bir bölge işaretler. Harita (M) üzerinde Shift + tıkla kendi bayraklarınızı koyabilirsiniz.'],
 ['Ölüm ve yeniden doğma','Varsayılan: öldüğünüzde yatağınızda (yoksa başlangıç noktanızda) yeniden uyanırsınız. Eşyalarınız ölüm yerinizin yakınında bir Cenaze Çantasına girer; haritada kırmızı haçla işaretlenir. Bir süre dokunulmazsınız. Ayarlar > Oyun > "Ölünce" bölümünden eşyaların kalması veya kalıcı ölüm seçilebilir.'],
 ['Köpek ve ayı','Gezgin Tüccar Köpek Yavrusu satar. Köpek sizi takip eder, tehlikeli yaratıklara saldırır; yaralanınca yatar, ette beslenince kalkar. E ile "bekle/takip et" komutu verilir. Ayılar dağlık ve ormanlık yerlerde yaşar; çok güçlüdür, kışın uyur, derisi ve kürkü değerlidir.'],
 ['Gezgin Tüccar','Birkaç günde bir adanın uzak bir yerine uğrar ve iki gün kalır; günlükteki Meydan sekmesinde yönü yazılır. Hazine Haritası, Köpek Yavrusu, Kürek, Bakır Kılıç, Kalkan, Bot, Arı Kovanı satar; altın, mücevher, inci, balmumu ve kürk alır.'],
 ['İtibar ve söylentiler','Köylülerle ticaret ve görevler köy itibarınızı artırır. Seviye yükseldikçe fiyatlarda indirim, ilk seviyelerde küçük armağanlar alırsınız. Ticaret penceresi açıldığında köylüler bazen gerçek bir söylenti anlatır: yabani kovan, gömülü hazine, tehlikeli yer.'],
 ['Günlük meydan okumalar','Her gün 3 görev verilir (örneğin odun topla, balık tut, hayvan avla). Tamamlayınca sikke ve deneyim kazanılır. Günlük > Meydan sekmesinde ilerleme görünür.'],
 ['Kalkan ve silahlar','Kalkan elde tutulurken sağ tık basılı tutulursa siper alınır (E de açıp kapatır); önden gelen darbeyi %60 (demir kalkanda %80) azaltır ve dayanıklılık harcar. Sopa, Bakır Kılıç ve Demir Kılıç yeni yakın dövüş silahlarıdır. Kılıç Ustası yeteneği bunları güçlendirir, Siperci kalkanı, Arıcı arıcılığı geliştirir.'],
 ['Arayüz kolaylıkları','F1: Ayarlar › Kontrol (tuşlar ve sabit kontroller tek sayfada). Üretim panelinde arama kutusu ve kategori düğmeleri; Shift + Üret: 5 kez, Ctrl + Üret: elden geldiğince. Ayarlar > Erişilebilirlik: ses altyazıları, hasar sayıları ve oyun kolu desteği. Dünya Kodu: aynı kodla aynı adayı yeniden kurun (ana menüdeki kutuya yazın veya duraklatma ekranından kopyalayın).']
];
})();
