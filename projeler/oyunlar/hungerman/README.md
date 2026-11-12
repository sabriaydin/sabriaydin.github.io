# HungerMan

Tarayıcıda çalışan, her seferinde rastgele oluşan açık dünya hayatta kalma oyunu. Kurulum gerektirmez; dosyalar bir web sunucusundan (GitHub Pages dahil) yayınlandığında çalışır.

> Not: Oyun `file://` ile (dosyaya çift tıklayarak) açılırsa tarayıcı arka plan işçilerini engeller. Sitede yayınlandığında veya yerel bir sunucuyla açıldığında sorunsuz çalışır.

## 1. aşama (0.1.0)

- Tohumdan üretilen devasa dünya: kıyıları denizle çevrili büyük bir kıta (yaklaşık 3 500 x 3 500 blok; dünya sınırı 7 200 x 7 200 blok), nehirler, dağlar, adacıklar
- Biyomlar: okyanus, derin okyanus, nehir, kumsal, çayır, orman, huş ormanı, tayga, çöl, dağlar
- Meşe, huş ve ladin ağaçları; otlar, çiçekler, böğürtlen çalıları, mantarlar, deniz yosunu
- Kömür, bakır, demir, altın ve elmas cevherleri; kıvrımlı mağara tünelleri ve derinde geniş oyuklar
- Kazma, odunculuk, toplayıcılık; alet seviyeleri ve dayanımı (tahta, taş, bakır, demir, elmas)
- Üretim sistemi: el, Üretim Masası ve Fırın tarifleri (aramalı ve kategorili)
- Envanter (36 yuva), yere düşen eşyalar, eşya atma
- Can, açlık, oksijen; düşme hasarı, boğulma, açlıktan ölme; ölünce eşyalar yere düşer
- Gece-gündüz döngüsü (20 dakika), güneş, ay, yıldızlar, bulutlar; meşale ışığı
- Pusula, saat, F3 bilgi paneli, ayarlar (görüş mesafesi, görüş açısı, hassasiyet, ses)
- Otomatik kayıt (tarayıcının IndexedDB deposu), birden fazla dünya

## 2. aşama (0.2.0)

- Hayvanlar: inek, koyun, domuz, tavuk, tavşan ve kurt; biyomlarına göre gruplar hâlinde doğar, gezinir, vurulunca kaçar
- Kurtlar saldırıya uğrayana kadar zararsızdır; saldırılırsa sürü hâlinde karşılık verir
- Zombiler: geceleri yüzeyde, her zaman karanlık mağaralarda doğar; gün doğunca güneş altında yanar; meşale ve kamp ateşi çevresinde doğmaz
- Savaş: yakın dövüş (kılıç en güçlü silah), düşerken kritik vuruş, geri itme, yay ve ok (gerilerek atılır, saplanan ok geri toplanır)
- Zırh: deri, bakır, demir ve elmas; kask, göğüslük, pantolon, bot; hasarı en fazla %80 azaltır
- Yeni eşyalar: çiğ ve pişmiş etler, çürük et (mide bulantısı yapabilir), deri, tüy, yün, ip, çakmaktaşı
- Kamp ateşi (ışık verir, et pişirir), yatak (geceyi atlatır, doğma noktası belirler)
- Gösterge: zırh çubuğu, bakılan canlının adı ve canı

## 3. aşama (0.3.0)

- Köyler: dünya 384 x 384 bloklu bölgelere ayrılır, uygun bölgelerde tohuma göre köy kurulur (yaklaşık 25-30 köy). Kuyu, meydan, dört yönde yollar, küçük ve büyük evler, demirci, buğday tarlaları, pazar tezgâhları ve fener direkleri bulunur. Çöl ve tayga köyleri kendi malzemeleriyle yapılır. Yeni dünyalarda oyuncu bir köyün yanında doğar.
- Köylüler: çiftçi, kasap, demirci, oduncu, şifacı ve avcı; adları ve meslekleri köye göre sabittir. Gündüz köyde dolaşır, yanlarına gelindiğinde oyuncuya döner, zombilerden kaçar, geceleri evlerine çekilir.
- Ticaret: sikke ile alım-satım; her köylünün 5 takası vardır, takas hakları her sabah yenilenir.
- Görevler: getirme, avlanma (zombi, kurt) ve başka bir köye mektup götürme; aynı anda en fazla 3 görev; görev günlüğü (J) ve ekranda görev izleyici.
- İtibar: ticaret ve görevlerle yükselir, köylülere zarar vermekle düşer; fiyatları etkiler, çok düşükse köylüler ticaret yapmaz.
- Tarım: buğday tohumu (uzun ottan da düşer) toprak veya çimen üstüne ekilir ve olgunlaşır; buğdaydan ekmek ve saman balyası yapılır.
- Sandık: 27 yuvalı depolama; köy sandıklarında ganimet bulunur.
- Yeni eşyalar: sikke, ekmek, buğday, tohum, şifa iksiri, altın elma, mektup, kiremit, saman balyası, toprak yol.
- Pusula: yakındaki köyler (ev simgesi) ve görev hedefleri (sarı işaret) gösterilir.

## 4. aşama (0.4.0)

- Mağaralar: Y 10 ve altındaki boşluklar lav gölüdür; lav kendi ışığıyla parlar, yakar (4 hasar / 0,5 sn), içine düşen eşyaları yok eder. Lavdan çıkınca yanma birkaç saniye sürer; su yanmayı söndürür. Lav yanındaki blok kırılınca boşluğa lav dolar.
- Yarıklar: yer yer yüzeye kadar açılan, derinliklere inen kanyonlar.
- Parıltı kristalleri: derin mağaraların tavan ve tabanında, ışık saçan ve toplanabilen kristaller.
- Zindanlar: 56 x 56 bloklu hücrelerde yer yer bulunan, yosunlu taştan odalar; canavar yuvası ve değerli ganimet sandıkları (demir, altın, elmas, altın elma, yay, zırh, elmas kılıç vb.).
- Canavar yuvası: oyuncu yakındayken ve karanlıkta canavar çıkarır; çevresine meşale konunca durur; kırılınca sikke düşürür.
- Yeni düşmanlar: okçu iskelet (mesafeyi korur, görüş hattı varsa ok atar, güneşte yanar) ve mağara örümceği (duvara tırmanır, atılır, zehirler; aydınlıkta saldırmaz).
- Zehir: örümcek zehri canı 1 kalbin altına düşürmez; zehirliyken kalpler yeşile döner.
- Kemik ve kemik tozu: kemik tozu ekinleri hızla büyütür, fidanları ağaca dönüştürebilir, çimende çiçek açtırır.
- Mağara ortam sesleri (damla, lav fokurtusu), lav içinde turuncu görüş, yanma efekti.
- Yeni görevler: iskelet ve örümcek avı, kemik ve kristal getirme.
- Pusula yenilendi: derece göstergesi, çentikler, işaretlerin altında uzaklık, doğma noktası (★) ve son ölüm noktası (✖) işaretleri; görev ve ölüm işaretleri ekran dışındayken kenarda gösterilir.
- Saat/gün göstergesi yenilendi: gök yayında güneş veya ay, gün evresi (Şafak, Sabah, Öğle, İkindi, Akşam, Gece), gece uyarısı ve kalan süre, konum satırı (köy, biyom veya yeraltı derinliği).

## 5. aşama (0.5.0)

- Su altı ekosistemi: sığ okyanuslarda renkli mercan resifleri (blok ve dal mercanlar), deniz çayırı, deniz yosunu ve inci verebilen istiridyeler.
- Batık gemiler: 112 x 112 bloklu hücrelerde, derin okyanus tabanında kırık direkli ahşap gövdeler; kamarasında ve güvertesinde hazine sandıkları (sikke, inci, elmas, külçe, altın elma, dalış maskesi, palet, olta).
- Deniz canlıları: hamsi sürüleri, çipura, ahtapot ve derin açık denizde köpekbalığı. Balıklar üç boyutlu yüzer, oyuncudan kaçar, sudan çıkınca çırpınır; köpekbalığı sudaki oyuncuya saldırır.
- Balıkçılık: olta sağ tıkla atılır, şamandıra suda yüzer; balık vurunca şamandıra dalar ve o anda çekilirse av gelir (balık, ahtapot, çer çöp ya da hazine). Derin suda hazine olasılığı artar.
- Yeni yiyecekler: çiğ/pişmiş balık, çiğ/pişmiş ahtapot (kamp ateşi veya fırın).
- Dalış donanımı: dalış maskesi (oksijen üç kat yavaş azalır, su altında görüş uzar) ve palet (yüzme hızı artar, karada biraz yavaşlatır; C ile dalınır).
- Tekneler: sandal (çevik) ve yelkenli (hızlı). Suya konur, binilir (W/S hız, A/D dümen, C ile inilir), dalgada yalpalar, karaya oturur, vurularak kırılır; kürek ve yelken canlandırması, dalga sesleri. Tekneler kaydedilir.
- Limanlar: kıyıya yakın köylerin yolu kıyıya uzatılır; ahşap iskele, uç platformu ve fenerler, beyaz-kırmızı bantlı deniz feneri (döner merdiven, camlı ışık odası, geceleri dönen ışık huzmesi), balıkçı kulübesi ve demirli tekneler. Kıyı bölgelerinde limanlı balıkçı köyleri de kurulur.
- Balıkçı köylü: balık alır; olta, pişmiş balık, sandal, yelkenli, maske ve palet satar; balık, ahtapot, inci, köpekbalığı dişi ve köpekbalığı avı görevleri verir.
- Pusula: ⚓ liman ve ⛵ en yakın tekne işaretleri. Konum satırı tekne hızını ve su altı derinliğini gösterir.

## 6. aşama (0.6.0): Çok oyunculu

- Sunucu olma: oyun içinde duraklatma menüsündeki "Dünyayı Arkadaşlara Aç" düğmesi ya da ana menüde Çok Oyunculu > "Dünya Seç ve Aç". Dünyayı açan oyuncuya 6 karakterlik bir katılım kodu verilir (duraklatma menüsünde kopyalanabilir, Tab tuşuyla da görülür).
- Katılma: ana menüde Çok Oyunculu ekranından oyuncu adı ve katılım kodu girilir. En çok 8 oyuncu.
- Bağlantı doğrudan oyuncular arasında (WebRTC) kurulur; ayrı bir oyun sunucusu yoktur. İlk tanışma için PeerJS'in ücretsiz eşleştirme hizmeti kullanılır. Dünya, sunucu olan oyuncunun tarayıcısında kayıtlıdır.
- Ortak olanlar: blok değişiklikleri, canlılar (yapay zekâ sunucuda çalışır, her canlı en yakın oyuncuya göre davranır), yere düşen eşyalar, oklar, sandıklar (aynı anda tek oyuncu açabilir), tekneler (aynı anda tek oyuncu sürer), gece-gündüz ve köylüler.
- Kişisel olanlar: envanter, can ve açlık, görevler, köy itibarı, doğma noktası. Bunlar sunucuda oyuncu adıyla saklanır; aynı adla yeniden katılınca kalınan yerden devam edilir.
- Sunucu, diğer oyuncuların çevresindeki parçaları da (çizmeden) üretir; böylece uzaktaki oyuncunun çevresinde de hayvanlar, canavarlar ve köylüler yaşar.
- Diğer oyuncular insan modeliyle, isim etiketiyle ve ellerindeki eşyayla görünür; yürüme, koşma, eğilme, vurma ve tekne sürme canlandırılır. Pusulada renkli noktayla gösterilirler.
- Sohbet: T veya Enter. Oyuncu listesi ve katılım kodu: Tab (basılı tutulur). Katılma ve ayrılma bildirimleri sohbette görünür.
- Uyku: gece, tüm (canlı) oyuncular yatağa yattığında atlanır; yatakta beklerken hareket edilince kalkılır.
- Çok oyunculuda duraklatma menüsü dünyayı durdurmaz. Sekme arka plandayken de dünya işlemeye devam eder.
- Sunucu dünyayı kapatırsa ya da bağlantı koparsa diğer oyuncular bilgilendirilip ana menüye döner. Farklı sürümler, aynı ad ve dolu sunucu için açıklayıcı uyarılar verilir.
- Kendi eşleştirme sunucusunu kullanmak isteyenler için adres çubuğuna `?sinyal=adres:port` eklenebilir (örnek: `?sinyal=localhost:9000`).

## 7. aşama (0.7.0): Harita

- Keşif haritası: görüş mesafesine giren her yer üstten görünüm olarak kendiliğinden haritaya işlenir (en üstteki blok rengi, yükseklik gölgelemesi, su derinliği, sığ sularda taban ve kıyı çizgisi). Kırılan veya konan bloklar haritaya anında yansır.
- Harita, dünya kaydından ayrı olarak tarayıcı deposunda bölge bölge saklanır; dünya silinince haritası da silinir. Çok oyunculuda her oyuncunun haritası kendi tarayıcısında tutulur.
- Mini harita: sağ üstte yuvarlak, kuzey yukarıda; çevredeki köyler, limanlar, işaretler, görev hedefleri ve diğer oyuncular simgelerle görünür. Geceleri hafifçe kararır. Ayarlardan kapatılabilir.
- Büyük harita (M): sürükleyerek kaydırma, tekerlek veya +/− ile yakınlaştırma (1 blok = 1/8 pikselden 8 piksele kadar), "Konumum" düğmesi, ölçek çubuğu, kuzey göstergesi, yakında parça ızgarası ve dünya sınırı. İmlecin altındaki konum, biyom, yükseklik veya su derinliği ve uzaklık alt satırda gösterilir. Keşfedilen alan ve işaret sayısı başlıkta yazar.
- İşaretler: büyük haritada sol tıkla ad ve renk seçilerek işaret eklenir (en çok 30), işarete sol tıklanınca düzenlenir, sağ tıkla silinir. İşaretler pusulada ve mini haritada da görünür; kayıtla saklanır (çok oyunculuda sunucuda oyuncu adına).
- Pusula yenilendi: tuvalde çizilen, net çentikler; üst şeritte yönler (kuzey kırmızı) ve 30° aralıklı dereceler, alt şeritte vektör simgeli işaretler ve uzaklıklar. Çakışan uzaklık yazıları gizlenir, yakın işaretler önceliklidir; ekran dışındaki işaretler kenarda okla gösterilir.
- Saat ve gün göstergesi sadeleştirildi: tek satırlık yarı saydam şerit (gün ya da gecenin ilerleyişini gösteren küçük halka, güneş / hilal, saat, gün ve gün evresi), altında konum satırı ve yalnızca gerektiğinde görünen küçük gece uyarısı.

## 8. aşama (0.8.0): Düzenlemeler ve geliştirici konsolu

- Mini harita ile saat / gün şeridi ekranın sağ altına taşındı; hızlı erişim çubuğuyla aynı alt hizada, ortalanmış bir sütun olarak durur (üstten alta: gece uyarısı, konum, saat, mini harita). Görev izleyici sağ üste geçti.
- Pusulada yalnızca oyuncunun büyük haritada eklediği işaretler gösterilir; köy, liman, görev ve diğer işaretler mini haritada ve büyük haritada kalır.
- Yarıklar yeniden tasarlandı: tek blokluk düz çatlak yerine 8-18 blok genişliğinde, kıvrılarak ilerleyen, kenarlara doğru sığlaşan doğal kanyonlar. Tabanı lav seviyesinin üstündedir; su kenarında, köylerde ve ağaçların altında oluşmaz. (Dünya tohumdan üretildiği için mevcut dünyalardaki yarıklar da yeni biçimde görünür; oyuncunun yaptığı değişiklikler korunur.)
- Tekneler artık suyun üstünde yüzer; taban tahtası su yüzeyinin üstünde kalır, teknenin içi su dolu görünmez.
- Teknedeyken ekranda inme tuşu (C) için kısa bir hatırlatma görünür.
- Geliştirici konsolu (F8 veya 1 tuşunun solundaki tuş; Ayarlar'dan kapatılabilir): canlı bilgi satırı (FPS, konum, biyom, canlı ve parça sayısı, açık modlar), komut geçmişi (↑/↓), Tab ile komut ve ad tamamlama. Komutlar: yardim, ver, esyalar, envanter temizle, isinla (koordinat, ~ göreli, koy, liman, zindan, batik, dogum, isaret), zaman (saat, sabah/ogle/aksam/gece, hiz), gun, can, doy, iyiles, olumsuz, ucus, hiz, dogur, oldur, esya temizle, tekne, blok, bloklar, konum, tohum, gorus, kesfet, harita, kaydet, fps, hata, ag, sayac, temizle. Çok oyunculu istemcide dünyayı değiştiren komutlar kapalıdır.

## 9. aşama (0.9.0): Geliştirici modu

- Sağ altta sıralama: konum satırı, mini harita ve hemen altında saat / gün şeridi (şeridin alt kenarı hızlı erişim çubuğuyla aynı hizadadır).
- Komut izni: Yeni Dünya ekranındaki "Komutlara izin ver" seçeneği. İşaretlenmeyen dünyalarda konsolda yalnızca bilgi komutları (yardim, konum, tohum, sayac, blok bilgi, ag, gorus, harita, kaydet, fps, hata) çalışır. Dünya listesinde komutları açık dünyalar belirtilir.
- Geliştirici kodu (`hungermandev+`, 10. aşamada değişti): konsolda `gelistirici <kod>` ya da yalnızca kod yazılınca o dünyada geliştirici modu ve komutlar açılır, durum kayıtla saklanır. Kod, kaynakta açık metin olarak tutulmaz.
- Geliştirici modu penceresi (F9 ya da konsolda `gelistirici`): komut yazmadan kullanılan test penceresi.
  - Oyuncu: ölümsüzlük ve uçma anahtarları, hız / can / açlık kaydırıcıları, iyileşme, doyma, doğma noktasına gitme, envanteri boşaltma.
  - Eşyalar: aranabilir simge ızgarası; tıklanan eşyadan 1 / 16 / 64 adet (Shift + tık 64).
  - Dünya: saat kaydırıcısı ve hazır saatler, zaman hızı (0 = durdur), gün, görüş mesafesi, canlı doğmasını durdurma, çevreyi haritada keşfetme, yerdeki eşyaları temizleme, kaydetme.
  - Canlılar: tür düğmeleriyle doğurma (adet kaydırıcısı), düşman / hayvan / deniz canlısı / hepsini kaldırma, çevredeki canlı sayımı.
  - Işınlanma: en yakın köy, liman, zindan, batık, doğma noktası; X / Y / Z ile gitme; dört yöne 100 blok; haritadaki işaretlere gitme.
  - Bilgi: kare hızı, konum, biyom, zaman, canlı ve eşya sayıları, yüklü parça, harita, blok değişikliği, bellek, ağ ve açık modlar (canlı tablo); FPS, F3 paneli ve mini harita anahtarları; tohumu kopyalama.
- Penceredeki işlemler konsol komutlarıyla yürür; aynı izin kuralları geçerlidir ve işlemler konsol kaydına yazılır. Çok oyunculu istemcide dünyayı değiştiren işlemler kapalıdır; komut izni sunucu olan oyuncunun dünyasından gelir.

## 12. aşama (0.12.0): Geliştirici penceresi yenilendi

- Düzen: sekmeler sol tarafa alındı, her sekme başlıklı bölümlere ayrıldı; hızlı işlemler çubuğu kaldırıldı. Anahtarlar pencere her açıldığında gerçek durumu gösterir.
- Oyuncu: ölümsüzlük, uçma, duvardan geçme, anında kırma, sınırsız eşya, açlık azalmasın; can, açlık, hareket hızı, blok erişim mesafesi; hasar ve durum sınaması (hasar, mide bulantısı, örümcek zehri, yanma, öldürme); deneyim (ekle, sıfırla); süresi seçilebilen iksir etkileri; doğma noktasını bulunulan yere ayarlama.
- Eşyalar: hazır setler (tüccar seti eklendi), tüm eşyaları onarma, eldeki yığını doldurma, eldekini silme, envanteri boşaltma, eşya verme.
- Dünya: saat, zaman hızı, zamanı durdurma, gün; hava ve hava kilidi; çevreyi düzleme, ekinleri ve fidanları büyütme; bakılan blok (eşyasını verme, kaldırma, başka blokla değiştirme); tekne koyma ve kaldırma; yerdeki eşyaları temizleme, parçaları yeniden çizme, kaydetme.
- Harita (yeni): çevreyi keşfetme (2048 bloğa kadar), **tüm haritayı görünür yapma**, ilerleme çubuğu ve durdurma, haritayı sıfırlama, işaret ekleme / silme. Keşif ayrı işçilerde arka planda yapılır; oyun akıcı kalır.
- Canlılar: barış (canlılar saldırmaz), doğmayı durdurma, dondurma; yavru olarak doğurma; çevredeki hayvanları besleme, yavruları büyütme; kaldırma; canlı sayımı.
- Işınlanma: yerler, **biyomlar**, koordinat, yakındaki köyler, oyuncular (çok oyunculu), harita işaretleri, yüzeye çıkma, önceki konuma dönme.
- Köy ve Görev (yeni): en yakın köyün itibarı, takasları yenileme, ölen köylüleri geri getirme; etkin görevleri teslime hazır yapma ya da bırakma; sikke.
- Görüntü: tam aydınlık, sisi kapatma, tel kafes, parça sınırları, eli ve göstergeyi gizleme; FPS, F3 paneli, mini harita; görüş açısı ve görüş mesafesi; ekran görüntüsünü indirme.
- Bilgi: kare süresi grafiği, teknik bilgi tablosu, bilgileri panoya kopyalama.
- Yeni konsol komutları: `kesfet tumu`, `kesfet dur`, `harita temizle`, `isinla biyom <ad>`, `isinla oyuncu <ad>`, `isinla olum`, `isinla geri`, `dogum`, `aclik`, `tok`, `hasar`, `durum`, `erisim`, `onar`, `eldeki`, `baris`, `hayvan`, `dogur <tür> <adet> yavru`, `tekne temizle`, `duzle`, `buyut`, `yenile`, `itibar`, `koy`, `gorev`, `aydinlik`, `sis`, `goruntu`, `hava kilit`, `xp sifirla`.

## 11. aşama (0.11.0): Oynanışı zenginleştiren güncelleme

**Hava durumu**
- Açık, yağmurlu ve fırtınalı hava; durum belirli sürelerle kendiliğinden değişir. Tayga, dağlar ve karlı kumsalda kar yağar, çölde yağış olmaz.
- Yağmur ve kar parçacıkları her sütunun en üst bloğuna kadar düşer; çatı altına yağmaz.
- Yağışta gökyüzü griye döner, ışık azalır, sis yaklaşır, açıktaki yüzeyler ıslak ve koyu görünür; yağmur sesi çatı altında boğuklaşır.
- Fırtınada şimşek çakar, gök gürültüsü uzaklığa göre gecikmeli duyulur; yıldırım düştüğü yerin yakınındaki canlılara ve oyunculara hasar verir.
- Fırtınada canavarlar gündüz de ortaya çıkar; yağmur, zombi ve iskeletlerin güneşte yanmasını önler.
- Fırtınada yatakta uyunabilir; uyanınca hava açılır.
- Saat göstergesinde hava simgesi görünür. Hava durumu kayıtla saklanır ve çok oyunculuda sunucudan eşitlenir.

**İnşa blokları**
- Merdiven (meşe, parke taş, taş tuğla): bakış yönüne göre konur. Yarım blok (aynı üç malzeme): yüzün alt ya da üst yarısına göre alt ya da üst yarım; iki yarım blok birleşince tam blok olur.
- Ahşap kapı (iki blok yüksekliğinde), tuzak kapı ve çit kapısı: sağ tıkla açılır ve kapanır; eğilirken yanlarına blok konur.
- Meşe çit ve cam bölme komşu bloklara kendiliğinden bağlanır; çitin üstünden atlanamaz.
- Tırmanma merdiveni: katı bir duvarın yan yüzüne konur; ileri tuşu ya da Boşluk ile çıkılır, C ile tutunulur, aksi hâlde yavaşça inilir.
- Yedi renkte yün ve boyalar (gelincik, karahindiba, peygamber çiçeği, deniz yosunu, kömür, ahtapot ve böğürtlenden).
- Yarım bloklara ve merdivenlere yürüyerek çıkılır; çarpışma ve seçim kutusu blokların biçimine göredir.

**Hayvancılık ve tarım**
- İnek ve koyun buğday, domuz havuç ya da patates, tavuk tohum, tavşan havuç ya da karahindiba sever. Hayvanlar yemi tutan oyuncuyu izler.
- Beslenen iki hayvan buluşup yavru yapar (5 dakika dinlenme); yavrular küçüktür ve büyür, beslenince daha hızlı büyür. Beslenen hayvanlar ve yavrular kaybolmaz ve dünya ile kaydedilir.
- Havuç ve patates ekinleri; fırınlanmış patates. Köy tarlalarında buğday, havuç ve patates yetişir.
- Çapa (beş malzeme) toprağı ve çimeni tarla toprağına çevirir. Tarlada ekinler 1,5 kat, ıslak tarlada 3 kat hızlı büyür; tarla, 4 blok çevresinde su varsa ya da üstüne yağmur yağarsa ıslanır.
- Köylülere yeni takaslar: çiftçi (havuç, patates, çapa, çit), demirci (örs), oduncu (kapı, tırmanma merdiveni), şifacı (cam şişe, iksirler, simya masası), balıkçı (su altında nefes iksiri).

**Deneyim, örs ve iksirler**
- Deneyim: canavar ve hayvan avlamak, cevher kazmak, balık tutmak, ticaret, hayvan yetiştirmek, eritme ve iksir yapmak deneyim kazandırır. Hızlı erişim çubuğunun üstünde deneyim çubuğu ve seviye görünür. Ölümde deneyimin yarısı kaybedilir.
- Örs: aletler, zırhlar, yay ve olta kendi malzemesiyle (her malzeme dayanımın dörtte biri, 1 seviye) ya da aynı türden ikinci bir eşyayla (2 seviye) onarılır.
- Simya masası yakınında cam şişe ile iksir üretilir: hız, gece görüşü, su altında nefes, ateşe dayanıklılık, güç (3 dakika). Etkiler sol üstte kalan süreleriyle görünür ve kayıtla saklanır.

**Geliştirici**
- Konsol: `hava <acik | yagmur | firtina> [süre]`, `hava simsek`, `xp <puan>`, `xp seviye <sayı>`, `etki <hiz | gece | nefes | ates | guc> [süre]`, `etki temizle`.
- Geliştirici penceresi: hava düğmeleri, deneyim ve etki düğmeleri, yapı blokları, çiftçi ve simya setleri.

## 0.10.1: Deniz feneri düzeltmesi

- Deniz fenerinin dönen ışığı ve parlayan çekirdeği, ışık odasındaki parıltı kristaline bağlandı: kristal kırılınca ışık hemen söner, yeniden konunca yanar. Uzaktaki (yüklü olmayan) fenerler için kayıtlı blok değişikliklerine bakılır.
- Işık odasının içindeyken huzme ve çekirdek gizlenir; göz kamaştırmaz.

## 10. aşama (0.10.0): Düzeltmeler ve geliştirici penceresi

- El ve elde tutulan eşya ayrı bir çizim geçişinde, kendi kamerasıyla ve derinlik temizlenerek çizilir; duvara yaklaşınca blokların içine girmez. Elin görüş açısı sabittir (koşarken genişleyen görüş açısından etkilenmez).
- Pusula inceltildi (30 piksel) ve okunaklı, düz bir yazı tipine geçirildi; çentikler ve işaretler yeni yüksekliğe göre yeniden yerleştirildi.
- Tekneden inme yalnızca C tuşuyladır (Shift ile inme kaldırıldı).
- Geliştirici kodu: `hungermandev+` (büyük / küçük harf fark etmez).
- Geliştirici penceresi geliştirildi:
  - Her sekmede görünen hızlı işlemler çubuğu: ölümsüz, uçma, duvardan geçme, anında kırma, sınırsız eşya; gündüz, gece, düşmanları kaldır, kaydet.
  - Oyuncu: duvardan geçme, anında kırma, sınırsız eşya (koyma, üretim, ticaret ve görevlerde azalmaz, aletler yıpranmaz); hazır setler (başlangıç, elmas donanım, inşaat, denizci, madenci).
  - Eşyalar: kategori seçimi (bloklar, aletler, zırh, yiyecek, diğer), numarayla arama, 1 / 8 / 16 / 64 adet, üzerine gelinen eşyanın adı.
  - Canlılar: canlıları dondurma; hayvan ve düşman düğmeleri ayrı gruplarda; canlı sayımı.
  - Işınlanma: son ölüm noktası; büyük haritada Ctrl + tık ile tıklanan yere ışınlanma.
  - Görüntü (yeni): tel kafes görünümü, eli gizleme, göstergeyi gizleme (ekran görüntüsü için), FPS, F3 paneli, mini harita, görüş açısı.
  - Performans: gerçek kare süresi grafiği (60 ve 30 FPS çizgileriyle), ortalama ve en kötü kare süresi, çizim çağrısı, üçgen, geometri ve doku sayıları, bakılan blok, ışık kaynağı sayısı, bellek sınırı.
  - Son açılan sekme hatırlanır.

## Sonraki aşamalar

Yeni aşamalar istek üzerine belirlenir.

## Klasör yapısı

```
index.html            Menüler ve oyun ekranı
css/oyun.css          Arayüz stilleri
lib/                  Three.js (r169, MIT lisansı), PeerJS (1.5.4, MIT lisansı; yalnız çok oyunculuda yüklenir)
js/ana.js             Giriş noktası: menüler, girdi, oyun döngüsü, kayıt
js/sabitler.js        Ortak sabitler (parça boyutu, deniz seviyesi, gün süresi)
js/rastgele.js        Tohumlu rastgele sayı ve gürültü fonksiyonları
js/bloklar.js         Blok, eşya ve alet tanımları
js/sekiller.js        Biçimli bloklar (merdiven, yarım blok, kapı, çit...): kutular, çarpışma, ışın isabeti
js/dunya/uretici.js   Dünya üretimi (kıta, biyom, ağaç, cevher, mağara)
js/dunya/koy-uretici.js Köy yerleşimi ve yapıları
js/dunya/zindan-uretici.js Zindan odaları
js/dunya/batik-uretici.js Batık gemiler
js/dunya/meshleyici.js Blokları çizilebilir geometriye çevirir
js/dunya/isci.js      Arka plan işçisi (üretim ve meshleme)
js/dunya/dunya.js     Parça yükleme / boşaltma, blok okuma-yazma
js/grafik/sahne.js    Çizici, gökyüzü, ışıklar, seçim kutusu, eldeki eşya
js/grafik/doku.js     Kodla çizilen dokular ve eşya simgeleri
js/grafik/fener.js    Deniz fenerlerinin dönen ışık huzmesi
js/grafik/hava.js     Hava durumu: yağmur, kar, fırtına ve şimşek
js/oyun/*             Oyuncu, etkileşim, envanter, üretim, hayatta kalma, düşen eşyalar, olta, tekneler
js/varlik/*           Hayvanlar, deniz canlıları, düşmanlar ve köylüler: türler, modeller, yapay zekâ, oklar
js/koy/*              Köy yönetimi, meslekler ve takaslar, görevler
js/ag/*               Çok oyunculu: bağlantı (baglanti), sunucu, istemci, diğer oyuncuların görünümü, ortak yardımcılar
js/harita/harita.js   Keşif haritası: parçaların üstten görünümü, bölge tuvalleri
js/harita/harita-hesap.js Parçanın üstten görünümünün hesabı (ana iş parçacığı ve işçi ortak kullanır)
js/harita/kesif.js, kesif-isci.js Geliştirici modunda toplu harita keşfi (arka plan işçileri)
js/arayuz/*           Gösterge, envanter, köylü, büyük harita ve mini harita ekranları, vektör simgeler
js/sistem/harita-kayit.js Haritanın tarayıcı deposundaki kaydı
js/sistem/*           Ses ve kayıt
```

Tüm görseller ve sesler kodla üretilir; dışarıdan görsel veya ses dosyası kullanılmaz.
