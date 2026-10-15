/* Hunger 3D - oyun içi rehber metinleri. {eylem} biçimindeki ifadeler, oyuncunun atadığı tuş adıyla değiştirilir. */
(()=>{
'use strict';
const GUIDE={};
/* Her bölüm: [başlık, metin] */
GUIDE.play=[
 ['Amaç','Issız bir adada hayatta kalmak. Açlık, susuzluk, soğuk ve geceleri dolaşan yaratıklara karşı dayanmak; adayı tanımak, köylülerle ilişki kurmak ve eskiden kalan notlardan adanın sırrını çözmek.'],
 ['Başlangıç','İlk iş ağaç kesmek ve taş toplamaktır. Eliniz boşken ağaca bakıp sol tuşu basılı tutarak odun toplayabilirsiniz. Odun ve taşla Taş Balta ile Taş Kazma üretin ({craft} veya {inv}). Ardından kamp ateşi yapın: ateş ısıtır, aydınlatır ve yemek pişirir.'],
 ['Durum çubukları','<b>Sağlık:</b> sıfırlanırsa oyun biter; açlık, susuzluk ve sıcaklık yeterliyken yavaşça dolar.<br><b>Açlık / Susuzluk:</b> zamanla ve koşarken azalır. Yiyecek yiyin, tatlı su gölünden şişe doldurun ya da hindistan cevizi içine bakın.<br><b>Sıcaklık:</b> geceleri, yağmurda ve suda düşer. Ateş yanında, barınakta ve deri montla korunursunuz.<br><b>Dayanıklılık:</b> koşmak ve zıplamak harcar, durunca dolar. Tükenince yürüyüş yavaşlar.<br><b>Nefes:</b> yalnızca baş suyun altındayken görünür; yaklaşık 26 saniye yeter, bitince boğulma hasarı başlar.<br><b>Akıl:</b> karanlıkta ve yalnızken düşer. Düşük akılda ekranda bozulmalar, fısıltılar ve sahte siluetler görülür. Ateş başında ya da aydınlıkta dinlenmek akılı yeniler.'],
 ['Gün ve gece','Bir gün yaklaşık 7 dakikadır. Gece sıcaklık düşer, kurtlar ve Gölgeler çıkar. Akşam olmadan ateş, barınak ve meşale hazırlığı yapın. Her 5. gece Kan Ayı doğar: gökyüzü kızarır ve düşman sayısı artar.'],
 ['Barınak','Duvar ve kapıyla tamamen çevrilmiş, en fazla yaklaşık 40 karelik kapalı bir alan barınak sayılır. Barınakta soğuk azalır, yağmur hissedilmez ve Gölgeler içeri giremez. Bir kare bile açık kalırsa barınak sayılmaz; kapıyı kapalı tutun.'],
 ['Yüzme ve dalış','Derin suda yüzülür: Boşluk yüzeye çıkarır, <b>X</b> (ayarlardan değişir) suya daldırır; ileri yürürken yukarı veya aşağı bakmak da yönü belirler. Su altında nefes çubuğu azalır, yüzeye çıkınca yenilenir. Su altında balık sürüleri, su bitkileri ve mercanlar yaşar; balıklar yaklaşınca dağılır.'],
 ['Yemek ve su','Çiğ et ve balık hastalık yapar; ateşte pişirin. Meyve, hindistan cevizi ve süt bedava yiyecektir. Boş şişeyi tatlı su gölüne bakıp sol tıkla doldurun. Deniz suyu içilmez.'],
 ['Üretim ve ilerleme','Taş aletler → ocak ve tezgâh → bakır aletler → demir aletler. Bakır ve demir cevheri ocakta kömürle eritilir; külçeler tezgâhta alete dönüşür. Daha iyi balta ve kazma hem hızlı hem fazla verim sağlar. Ayrıntı için Madenler ve Üretim sekmelerine bakın.'],
 ['Köyler ve ticaret','Haritada dağınık köyler bulunur. Her köylü yalnızca mesleğiyle ilgili eşyalarla işlem yapar; elindeki 1-3 işlemin hakkı bitince o işlem kapanır, hepsi bitince bir süre sonra yenileri belirir. Takas ve satış asgari kazanç sağlar. Köylüler geceleri evlerinde uyur. Gece köy fenerleri güvenli bir alan sağlar. Bulduğunuz köyler haritaya işlenir.'],
 ['Gelişim','Eylemler deneyim kazandırır. Seviye atlayınca yetenek puanı verilir ({jr}: Günlük). Başarımlar ayrıca deneyim sağlar.'],
 ['Kayıt','Oyun her 20 saniyede ve sekme gizlendiğinde otomatik kaydedilir. Duraklatma menüsünden elle kayıt alabilir, kayıt dosyasını bilgisayara indirebilirsiniz. {qsave} hızlı kayıt yapar. Ana menüde Kayıtlar bölümünden kayıtları yönetebilir ve dosyadan kayıt yükleyebilirsiniz.']
];
GUIDE.story=[
 ['Kuzey Araştırma Seferi','Adanın hiçbir haritada yeri yoktur. Kuzey Araştırma Seferi\'nin gemisi gece yarısı kayalıklara oturdu; altı kişi kıyıya çıkabildi. Telsiz sustu, yardım gelmedi.'],
 ['İlk geceler','Mürettebat tatlı su gölünü buldu ve ateş yaktı. Karanlıkta ormandan ayak sesleri geldi; ışık çemberinin içine hiçbir şey girmedi. Gölgelerin ışıktan çekindiği, gün doğunca eridiği anlaşıldı.'],
 ['Köylüler','Doğuda küçük yerleşimler vardı. Köylüler yabancılara mesafeliydi ama takasa açıktı. Evlerin önündeki fenerleri hiçbir zaman söndürmezler; bu kural çok eskidir ve gece uzadığında Gölgelerin cesaret bulduğunu söylerler.'],
 ['Kan Ayı','Her beşinci gece gökyüzü kızarır ve Gölgeler sayıca çoğalır. Mürettebatın üçüncü üyesi böyle bir akşam yürüyüşünden dönmedi; geriye bir fener ve ayak izleri kaldı.'],
 ['Sizin hikâyeniz','Seferden geriye kalan sandıklar adadaki kamplarda durur. İçlerinde eşya ve sefer defterinin sayfaları vardır. Kamplardan 14 not toplanabilir; notlar sırayla adanın ne olduğunu ve Gölgelerin kaynağını anlatır. Bulunan notlar Günlük ({jr}) içindeki Kayıtlar sekmesinde saklanır.'],
 ['Son kayıt','Seferin son notu şöyle der: ışık yanda tutulmalı, gölgelere sırt çevrilmemeli. Hayatta kalmak için tek kural budur.']
];
GUIDE.foes=[
 ['Gölge','<b>Tehlike: yüksek.</b> Geceleri ve karanlıkta belirir. Doğrudan bakıldığında yerinde donar, bakış kayınca hızla yaklaşır. Işıktan ve ateşten kaçar, gün ışığında erir. Kapıdan ve duvardan geçemez. Vuruşu ağır hasar ve kanama verir. <i>Karşı koyma:</i> meşale taşıyın, yüzünü ona dönük tutun, ok veya mızrakla uzaktan vurun, kapalı barınağa çekilin.'],
 ['Kurt','<b>Tehlike: orta.</b> Geceleri sürü hâlinde dolaşır, yaklaşık 13 metreden saldırıya geçer. Isırığı kanama yapar. Ateş ve meşaleden çekinir. <i>Karşı koyma:</i> meşale tutun, mızrak veya yay kullanın, gece açıkta dolaşmayın.'],
 ['Yaban domuzu','<b>Tehlike: orta.</b> Gündüz de dolaşır. Yaklaştığınızda üzerinize hamle yapar, vuruşu serttir. Yavaş gezen, uzaktan vurulabilen bir hayvandır. <i>Karşı koyma:</i> ok ile uzaktan vurun ya da mızrakla karşılayıp geri çekilin.'],
 ['Sahte gözlemciler','Akıl düşükken kenarda beliren, yaklaşınca kaybolan siluetlerdir. Gerçek değildir ve zarar vermez; yine de gerginlik yaratır. Ateş başında dinlenmek veya aydınlığa çıkmak akıl düzeyini yükseltir.'],
 ['Kan Ayı gecesi','Her 5. gecede gökyüzü kırmızıya döner ve Gölge sayısı artar. O gece açıkta kalmayın; köy fenerleri veya kapalı bir barınak güvenli yerlerdir. Geceyi atlatmak başarım ve deneyim kazandırır.'],
 ['Kanama ve bandaj','Gölge ve kurt saldırıları kanamaya yol açar; kanama sağlığı azaltır. Bandaj eldeyken sol tıkı basılı tutarak sarın.']
];
GUIDE.map=[
 ['Ada','Harita 384×384 karelik tek bir adadır. Kıyıda kum, içeride çimenlik ve orman, kuzey ile doğuda kayalık dağlar bulunur. Ortadaki tatlı su gölünden içilebilir. Göletler ve sığ sular yürünerek geçilir, derin sularda yüzülür; her iki durumda da hareket yavaşlar ve sıcaklık düşer.'],
 ['Haritayı kullanma','{map} ile tam ekran haritayı açın. Sağ üstteki mini harita sizi merkezde gösterir. Kırmızı ok sizsiniz ve baktığınız yönü gösterir. Harita gölgelendirilmiş kabartma olarak çizilir; dağlar, ormanlar ve kıyılar ayırt edilir.'],
 ['Keşif sisi','Gidilmeyen yerler karanlık sisle örtülüdür. Yürüdükçe çevrenizdeki alan açılır; keşfedilen oran harita altında yüzde olarak yazar. Keşif durumu kayda işlenir.'],
 ['Yakınlaştırma ve hedef','Tam ekran haritada tekerlekle yakınlaştırın, sürükleyerek kaydırın, çift tıkla görünümü sıfırlayın. Haritaya tıklamak hedef bayrağı koyar; mini haritada yön oku ve mesafe görünür. Aynı yere tekrar tıklamak bayrağı kaldırır. Izgara harfleri ve rakamları sektör adını verir; pusula kuzeyi gösterir, ölçek çubuğu metre cinsindendir.'],
 ['Köyler','Haritada sarı kare ile işaretlenir ve ancak yaklaşıldığında keşfedilir. Her köyün bir adı, evleri, fenerleri, çeşitli meslekten köylüleri ve görev tahtası vardır. Gece lambalar yanar ve köy güvenli bölgedir.'],
 ['Kamplar','Eşkenar dörtgen işaret terk edilmiş seferi kamplarını gösterir. Her kampta bir sandık ve bir not bulunur. Açılmış sandıklar gri görünür.'],
 ['Mağaralar','Dağ eteklerinde rastgele yerlerde mağara girişleri bulunur. Yaklaşıldığında haritaya kemerli işaretle eklenir. Ayrıntı için Mağaralar sekmesine bakın.'],
 ['Dağlar ve madenler','Kayalık bölgelerde kömür, bakır ve demir damarları yer alır. Kömür ve bakır daha alçakta, demir yüksek dağlarda bulunur. Ayrıntı için Madenler sekmesine bakın.'],
 ['Hayvanlar','Koyun ve inek çayırlarda, tavşan ve geyik ormanda, kurt ve domuz ormanın derinliklerinde bulunur. Her tür kendi bölgesinde seyrek yaşar; farklı türler birbirine denk gelebilir. Kurtlar yakındaki av hayvanını kovalar ve %40 ihtimalle yakalar; av %60 ihtimalle kaçar ve kovalamaca biter. İnek ve geyik gibi büyük baş hayvanlar yalnızca ilk vuruşta %40 ihtimalle birkaç kez karşılık verir, sonra kaçar. Canlılar katıdır: üzerlerinden geçilmez, yürüyerek itilemez.']
];
GUIDE.ores=[
 ['Genel bilgi','Madenler kayanın içinde damarlar hâlinde durur. Kazarken kaya parça parça küçülür ve sonunda dağılır; dağılan damar bir süre sonra yeniden oluşur. Damarın rengi ve görünümü cevher türünü belli eder.'],
 ['Kömür','<b>Görünüm:</b> koyu gri kayada parlak siyah bantlar. <b>Gereken kazma:</b> Taş Kazma veya üstü. <b>Kullanım:</b> meşale, ocak yakıtı, eritme. Nispeten alçak kayalıklarda çoktur, yaklaşık 15 dakikada yenilenir.'],
 ['Bakır','<b>Görünüm:</b> kayada turuncu bakır damarları ve yeşil patina (malakit) lekeleri. <b>Gereken kazma:</b> Taş Kazma veya üstü. <b>Kullanım:</b> ocakta kömürle Bakır Külçe olur; bakır alet, makas ve külçe ile ticaret. Orta yükseklikte bulunur, yaklaşık 25 dakikada yenilenir.'],
 ['Demir','<b>Görünüm:</b> kayada pas kırmızısı bantlar ve koyu hematit benekleri. <b>Gereken kazma:</b> Bakır Kazma veya üstü. <b>Kullanım:</b> ocakta kömürle Demir Külçe olur; en güçlü alet ve silah. Yalnızca yüksek dağlarda çıkar, yaklaşık 40 dakikada yenilenir.'],
 ['Kazma kademeleri','Taş Kazma → kömür ve bakır. Bakır Kazma → demir. Demir Kazma → tüm madenlerde en hızlı kazı. Yanlış kademeyle kazmaya çalışırsanız ekranda bir uyarı çıkar.'],
 ['Eritme','Ocak yakınında, elde cevher ve kömür varken Üretim listesinden külçe üretin: 1 cevher + 1 kömür = 1 külçe. Ocak için 12 taş gerekir.'],
 ['İpucu','Dağlarda yüksek kesimlere çıkmadan önce yiyecek, su ve meşale alın. Yüksekten düşmek hasar verir; yokuşta yavaşlarsınız, tırmanılamayacak kadar dik yerlerde zıplayarak ilerleyin.']
];
GUIDE.tips=[
 ['Meşale','Eliniz boşken kullanın: elde yanan meşale aydınlatır, kurtları ve Gölgeleri uzak tutar. Yaklaşık 6 dakika yanar; yağmurda daha çabuk tükenir. Odun ve kömürle üretilir.'],
 ['Yay ve ok','Yayı eline alıp sol tıkı basılı tutarak gerin, bırakınca ateşler. Ger süresi arttıkça menzil ve hasar artar. Ok gerekir; isabet etmeyen oklar çoğu zaman toplanabilir. Rüzgâr ve mesafe oku sürükler; uzak hedeflerde hafif yukarı nişan alın.'],
 ['Mızrak','Hayvanlara ve düşmanlara karşı en güçlü yakın silahlardan biridir. Odun, kemik ve deriden üretilir.'],
 ['Hasar ve elde tutulan eşya','Her eşyanın kendine özgü saldırı gücü vardır: çıplak el en zayıfı, mızrak ve demir balta en güçlüleridir. Taş ve bakır aletler arada kalır. Ok hasarı ger süresine göre değişir; tam gerilmiş ok en sert vuruştur.'],
 ['Vuruş bölgeleri','Hasar vurulan bedene göre değişir: <b>kafa</b> iki katından fazla, <b>gövde</b> normal, <b>kol</b> azaltılmış, <b>bacak</b> en düşük hasarı verir. Bacağa vurulan hayvan paniğe kapılıp kaçar. Kafadan vurmak başarım kazandırır.'],
 ['Can yüzdesi','Hayvanların ve yaratıkların sağlığı yüzde olarak tutulur. Bakıp durduğunuz canlının sağlık yüzdesi nişan ipucunda görünür. Gölgeler vuruşlara karşı dayanıklıdır; en çok kafadan ve ışıktan zarar görürler.'],
 ['Bandaj','Kanamayı durdurur ve biraz sağlık verir. Eldeyken sol tıkı basılı tutun.'],
 ['Olta','Suya bakıp sol tıkı basılı tutun. Balık çiğ yenmemelidir; ateşte pişirin.'],
 ['Makas','Koyuna bakıp sol tıkı basılı tutarak yün kırkın. Yün bir süre sonra yeniden büyür.'],
 ['Uyku tulumu','Gece, barınakta, ateş yanında veya köyde kullanıldığında sabaha kadar uyutur. Dayanıklılık ve akıl yenilenir, açlık ve susuzluk artar.'],
 ['Deri mont','Çantada taşınırken soğuktan korur.']
];

GUIDE.caves=[
 ['Giriş','Dağ eteklerinde karanlık kemerli kaya geçitler vardır; kafatası dikmeleri girişi belli eder. Yaklaşıp {use} ile içeri girilir. Mağara her girişte aynı düzende yeniden kurulur; yalnızca sandığın açık olması kalıcıdır.'],
 ['İç yapı','Mağaralar rastgele üretilir: geniş odalar, dolambaçlı tüneller, çıkmaz sokaklar ve yeraltı havuzları. Gün ışığı yoktur; Gölgeler burada gece gündüz fark etmeksizin dolaşır. Yanınızda meşale, bandaj ve ok bulundurun.'],
 ['Karanlık ve ışık','Meşalesiz görüş birkaç metredir. Işıldayan kristaller (turkuaz, mor, mavi) yol gösterir; kırmızı kristaller sandık odasını belli eder. Mavi-beyaz ışık sütunu çıkıştır; yanında sönmeyen bir ateş vardır, güvenli sığınaktır. Yönünüzü haritadan takip edin; mağaranın kendi planı keşfettikçe açılır.'],
 ['Tehlikeler','Gölge sayısı, mağaranın uzaklığına ve derinliğine göre artar. Sandık odasının yanında nöbetçi Gölgeler bulunur. Bakıldığında donarlar, bakış kayınca yaklaşırlar. Kafadan vurulduklarında daha çok yaralanır ve bir süre geri çekilirler. Dar tünellerde sırtınızı açık bırakmayın.'],
 ['Ganimet','Az ama değerlidir: çıkmaz tünel uçlarında altın külçe veya kızıl mücevher, kenarlarda kömür-bakır-demir damarları, en derinde mühürlü sandık. Altın ve mücevher demirci ve madenciye yüksek fiyata satılır; sandıktan demir alet, ok ve meşale çıkabilir.'],
 ['Kayıt','Mağaradayken kaydedilen oyun, girişin önünden devam eder. Sandık açıksa açık kalır; mağaradaki yaratıklar ve cevherler ise her girişte yenilenir.']
];

/* Başarımlar: [kimlik, ad, açıklama, deneyim, koşul(G)] — koşullar basarimlar.js içinde */
HG.GUIDE=GUIDE;
})();
