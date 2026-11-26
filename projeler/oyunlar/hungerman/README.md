# HungerMan

Tarayıcıda çalışan, her seferinde rastgele oluşan açık dünya hayatta kalma oyunu. Kurulum gerektirmez; dosyalar bir web sunucusundan (GitHub Pages dahil) yayınlandığında çalışır.

> Tanıtım sitesi: klasörün `index.html` dosyası oyunun tanıtım sitesidir (rehber, güncellemeler, sık sorulanlar); oyun `oyna.html` sayfasında açılır. Yeni bir sürüm yayınlandığında `site/gecmis.js` dosyasının başına o sürümün kısa notu eklenir.

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
- Geliştirici konsolu (F8 veya 1 tuşunun solundaki tuş; Ayarlar'dan kapatılabilir): canlı bilgi satırı (FPS, konum, biyom, canlı ve parça sayısı, açık modlar), komut geçmişi (↑/↓), Tab ile komut ve ad tamamlama. Komutlar: yardim, ver, esyalar, envanter temizle, isinla (koordinat, ~ göreli, koy, liman, zindan, maden, batik, dogum, isaret), zaman (saat, sabah/ogle/aksam/gece, hiz), gun, can, doy, iyiles, olumsuz, ucus, hiz, dogur, oldur, esya temizle, tekne, blok, bloklar, konum, tohum, gorus, kesfet, harita, kaydet, fps, hata, ag, sayac, temizle. Çok oyunculu istemcide dünyayı değiştiren komutlar kapalıdır.

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

## 53.0 (0.53.0): Şebeke güncellemesi (39 yeni elektrik cihazı, parçası ve malzemesi)

- Yeni üreticiler (gerçek boyutlarında, çok bloklu): Buhar Jeneratörü (3 × 2 × 3; kömür / odun yakar, yanında su ister, basınç 10 saniyede dolar, en çok 60 E/sn), Jeotermal Jeneratör (2 × 2 × 3; altındaki ve yanındaki lav başına 15 E/sn, en çok 45, Yeraltı Diyarı'nda da çalışır), Güneş Takip Sistemi (2 × 2 × 3; paneli güneşe döner, en çok 28 E/sn), Paratoner (1 × 1 × 6; fırtınada 48 blok içindeki yıldırımları çeker, her yıldırım 5.000 E depolar).
- Depolama ve şebeke: Enerji Depolama Konteyneri (4 × 2 × 3; 150.000 E, 250 E/sn), Elektrik Direği (1 × 1 × 7; bir giriş, iki çıkış; iki direk arasında 32 blokluk parça, 64 blokluk kablo), Güç Ölçer (geçen gücü ekranında gösterir), Sigorta (10 / 25 / 50 / 100 E/sn sınırı aşılınca atar).
- Devre parçaları: Zamanlayıcı (1 / 2 / 5 / 10 sn), Gün Işığı Algılayıcı (gece / gündüz), VE, VEYA ve ÖZEL VEYA kapıları, Röle ve Engelleyici (güç + sinyal girişi), Elektrikli Düğme (5 sn). Kapıların iki girişi ayrı ayrı izlenir.
- Ev: Televizyon (2 × 1 × 2; dört kanal: doğa belgeseli, haber, maç, hava durumu; sağ tıkla kanal), Çamaşır Makinesi (renkli yün ve halıyı beyaza döndürür), Klima (duvara asılır; 7 blok içinde sıcaklığı 22 °C'ye çeker), LED Sokak Lambası (1 × 1 × 5).
- Güvenlik: Güvenlik Kepengi (2 × 1 × 3; güç gelince yukarı sarılır, kesilince iner; altında biri varken inmez), Güvenlik Kamerası (tarar) ve Güvenlik Monitörü (64 blok içindeki kameraların canlı görüntüsü; sağ tıkla kamera değişir), Alarm Sireni (döner ışık ve siren), Elektrikli Çit Ünitesi ve Elektrikli Çit (değen canavarlar çarpılıp savrulur).
- Atölye: Ark Ergitme Ocağı (2 × 2 × 3; yakıtsız, iki parti, 1,5 sn), Elektrikli Kereste Tezgâhı (kütükten 6 kalas), Taş Kırıcı (ham cevherden iki toz: cevher verimi iki katı), Maden Matkabı (3 × 3 × 4; kuyu kazar ve her kattaki 2 blok çevresindeki cevherleri çıkarır), Sıvı Pompası (su ve lavı boşaltır). Makinelerde üst sıra girdi, alt sıralar çıktı yuvasıdır.
- Yeni parçalar: Elektrik Motoru, Lityum Hücre, Seramik İzolatör, Mantık Çipi, Ekran Paneli; Demir / Bakır / Altın Tozu.
- Elektrik ağı: kablo kaybı artık talebe eklenir; uzun tüketici zincirlerinin sonundaki cihazlar da beslenir.
- Yeni başarım grubu "Şebeke" (7 başarım); gezgin tüccar elektrik parçaları satar; geliştirici penceresine üç Şebeke hazır seti eklendi.
- R ile yerleştirme yönü çevrildiğinde çıkan "Yerleştirme yönü çevrildi" bildirimi kaldırıldı (yön önizlemeden görülür).

## 52.0 (0.52.0): Bereket güncellemesi (213 yeni eşya ve blok)

Kimlikler 2200'den başlayan ayrı bir aralıktan ayrılır (bloklar.js, ayir52); eski aralık 2073'ten devam eder. Eski kayıtlar etkilenmez.

- **Yeni hayvanlar (8):** Keçi (dağ, savan, kayalık; kovayla sağılır: Keçi Sütü Kovası), Ördek (bataklık, kumsal, göl, mangrov; yumurtlar), Hindi (orman, çayır), Geyik (orman, huş, tayga; boynuz düşürebilir), Yaban Domuzu (orman, sık orman; nötr, kızdırılınca saldırır), Tilki (tayga, sonbahar ormanı; kürk), Boz Ayı (tayga, sık orman; nötr ve güçlü; post ve bal peteği), Deve (çöl, savan; deve yünü). Her birinin modeli, sesi, yemi (çoğaltma) ve ganimeti vardır; otçullar kurtlardan kaçar.
- **Yeni balıklar (2):** Levrek ve Palamut denizde ve göllerde yüzer.
- **Yeni ekinler (6):** Çeltik (pirinç), Patlıcan, Ayçiçeği, Çay, Kahve, Kakao. Tohumlar yabanda bulunur: saz pirinç, çalılar çay fidesi ve patlıcan tohumu, savan çalısı kahve çekirdeği ve ayçiçeği, mangrov yaprağı kakao, uzun ot nadiren ayçiçeği ve patlıcan tohumu verir. Gezgin tüccar da satar.
- **Yeni malzemeler:** Ayçiçek Yağı, Kakao Tozu, Kahve Tozu (değirmende), Krema, Mayonez, Ketçap, Sucuk, Keçi Peyniri, Çikolata; hayvan ürünleri (7 çiğ ve 7 pişmiş et/balık, Geyik Boynuzu, Tilki Kürkü, Ayı Postu, Deve Yünü).
- **Yeni yemekler ve içecekler (53):** pilav, karnıyarık, imam bayıldı, patlıcan kebabı, menemen, sucuklu yumurta, pizza, hamburger, sandviç, tost, patates kızartması, dört çorba, üç salata, sushi, hindi dolması, portakallı ördek, geyik yahnisi, gözlemeler, çay, Türk kahvesi, filtre kahve, sütlü kahve, sıcak çikolata, milkshake, smoothie, elma suyu, iki dondurma, brownie, çikolatalı kek, waffle, pankek, krep, cheesecake, tiramisu, künefe, revani, irmik helvası, aşure, ızgara köfte, ızgara sebze, tavuk şiş, mısır ekmeği, kakaolu puding ve daha fazlası. Her biri bir ya da iki etki verir (aşçılık seviyesiyle uzar); çorbalar ve sıcak içecekler ısıtır, dondurma ve soğuk içecekler serinletir.
- **Elektrikli cihazlar (17):** 8 renkte LED Panel (çalışırken ışık verir; beyaz, mavi ve mor soğuk ışıktır), Projektör (22 blok menzilli güçlü ışık, yönlü), Vantilatör (çevresini 9 °C'ye kadar serinletir), Blender, Kahve Makinesi, Tost Makinesi, Mikrodalga, Dondurma Makinesi, Elektrikli Izgara (çalışırken yeni pişirme istasyonlarıdır; üretim penceresinde görünür) ve Radyo (çalışırken sağ tıkla müzik çalar). Hepsi kabloyla bağlanır; yönlü cihazların önü oyuncuya bakar.
- **Yapı blokları (86):** Kuvars (blok, cilalı, tuğla, sütun), Traverten, Andezit, Kızıl Kumtaşı (düz, oymalı), Kumtaşı Tuğla, Deniz Taşı (tuğla, koyu, ışıklı Deniz Feneri Taşı), Obsidyen Tuğla, ışık veren Işıltaş Tuğla, kırmızı / sarı / siyah tuğla, Taş Karo, Terrazzo, Arnavut Kaldırımı, Tuğla Yol, Balıksırtı Parke, Koyu Ahşap Lambri, Kütük Kaplama, Kiremit ve Mavi Kiremit Çatı, Bakır / Demir / Elmas / Kömür / Kemik / Bal blokları ve bakırın yıpranmış, yeşillenmiş ve kesme hâlleri, Akvaryum, Buzlu Cam, Ahşap Çerçeveli Cam, 8 renk Sıva ve 8 renk Boyalı Kalas (eldeki boyayla renk değiştirir), Kâğıt / Taş / Demir Fener; 9 malzemenin merdiveni ve yarım bloğu, 7 malzemenin duvarı.
- Üretim: yeni taşlar Taş Kesme Tezgâhında, maden blokları dokuz külçeden (geri de çözülür), et ve balıklar kamp ateşinde, fırında ya da ızgarada pişer. Mikrodalga, fırınlanmış patates, patlamış mısır, haşlanmış yumurta ve sütlacı kömürsüz yapar.

## 51.2 (0.51.2): Akıcılık ve performans

- **Kare süresi dengesi:** işçilerden gelen sonuçlar (üretilen parça, mesh) artık geldiği anda değil, oyun döngüsünde kare başına en çok 2,5 ms ve sınırlı geometri boyutuyla, oyuncuya yakın olandan başlayarak işlenir. Hızlı giderken birkaç sonucun aynı anda gelip bir kareyi uzatması (takılma) önlendi. Yükleme ekranında sonuçlar beklemeden işlenir. Ölçümde işçi sonuçlarının ana iş parçacığındaki toplam süresi yaklaşık yarıya indi (en uzun sonuç 27 ms'den 12 ms'ye).
- **Parça taraması işçide:** yeni parçadaki ışık kaynakları, ekinler, yüzeye yakın sular ve en yüksek dolu katman işçide bulunur; ana iş parçacığı 65 536 bloğun hepsi yerine yalnızca bu dizinlere bakar (ışık kaynağı taraması ve akan su taraması).
- **İş dağıtımı:** çevre taraması yalnızca bir şey değişince (oyuncu başka parçaya geçince, görüş değişince, parça verisi gelince, blok değişince) yapılır; acil parça taraması yalnızca acil parça varken; uzak parçaları boşaltma döngüsü yalnızca parça değişince.
- **Işık kaynakları ızgarası:** ışık kaynakları 16 × 16 blokluk ızgarada da tutulur; canlıların meşale yakınlığı, canlı aydınlatması, en yakın 32 ışık ve lav sesi araması tüm listeyi (yeraltında binlerce lav ışığı) taramaz.
- **Blok okuma:** son okunan parça önbellekte tutulur; en üst katı blok araması parçayı bir kez bulur ve parçanın en yüksek dolu katmanından başlar (önceden 255 ayrı okuma). Yağış ve kar sütun araması da öyle.
- **Pusula:** 360 derecelik çentik ve yazı şeridi bir kez hazırlanır, bakış değişince yalnızca ilgili dilim kopyalanır.
- **Gölgelendirici ön derlemesi:** dünya açılınca sahnedeki ve oyunda kullanılan başlıca malzeme türlerinin gölgelendiricileri (destekleyen tarayıcıda arka planda) derlenir; ilk kez görülen canlı, eşya ya da parçacıkta yaşanan kısa donmalar azalır.
- **Otomatik çözünürlük:** tek bir takılmada çözünürlük oynamaz (düşürmek için art arda iki, yükseltmek için üç ölçüm gerekir; her değişiklik tuvali yeniden boyutlandırıyordu).
- Ekran yenileme hızı ölçümü halka arabellekle ve daha seyrek yapılır.

## 51.1 (0.51.1): Görüntü ayarları ve gezgin tüccar testi

- Ayarlar > Görüntü sekmesi bölümlere ayrıldı (Kare hızı ve akıcılık, Çözünürlük ve keskinlik, Dünya, Kamera ve renk); sekmenin başında ekranın algılanan yenileme hızı, anlık kare hızı, çizim çözünürlüğü ve ölçek görünür
- Ekran yenileme hızı (kare hızı sınırı): "Ekranla eşit" (algılanan Hz ile) ya da 30-240 FPS; tarayıcı ekranın hızında çizer, seçilen sınırın üstündeki kareler atlanır. Yenileme hızı kare aralıklarından ölçülür ve en yakın yaygın değere (60, 75, 120, 144, 165, 240...) yuvarlanır
- Ham fare girdisi (işletim sisteminin fare hızlandırması atlanır; desteklemeyen tarayıcıda normal kilide dönülür)
- Düşük güç kipi artık ayrı bir seçenek olarak da açılıp kapatılabilir
- Otomatik çözünürlük hedefi (30-240 FPS; önceden 60'a sabitti), piksel yoğunluğu üst sınırı (1×, 1,5×, 2×, ekranın tamamı; önceden 1,5× sabitti), kenar yumuşatma (MSAA; oyun yeniden yüklenince uygulanır)
- Işık kalitesi (en yakın 12 ya da 32 ışık), parçacıklar (kapalı, az, normal), bulutlar, hafif sis (sis görüş sınırına yakın başlar, pus azalır), bitkilerin rüzgârda salınması
- Koşarken görüş açısı genişlemesi kapatılabilir; kontrast ve renk doygunluğu ayarları
- Grafik ön ayarları piksel yoğunluğunu, ışık kalitesini ve parçacıkları da belirler
- Geliştirici Modu > Köy ve Görev > Gezgin tüccar: tüccar gerçek hâliyle (takas listesi, bir günlük süre, küsme) getirilebilir, takasları yenilenebilir, durumu gösterilebilir ve gönderilebilir; konsolda `gezgin getir | yenile | durum | gonder`

## 51.0 (0.51.0): Yayın öncesi (geliştirme planı 10. aşama)
- **Baştan sona oyun sınaması:** her zorlukta (Kolay, Normal, Zor, Hardcore) yeni bir dünyada Yolculuk'un 8 bölümü sırayla tamamlandı. Üretim penceresinden üretim (kalas, masa, çubuk, kazma, taş kazma, demir külçe, tam demir zırh), zırh giyme, zombi öldürme, köye varma, ticaret, 12. seviyenin altına inme, dört boss (Firavun, Buz Büyücüsü, Haydut Reisi, Taş Muhafız), Kanlı Ay gecesi, Lanetli Ada, Yeraltı Diyarı, Kor Ruhu ve Kül Kalesi oyunun kendi sistemleriyle yapıldı; uzun süren ya da elle yapılması gereken birkaç adım (pişirme, uyku, köy görevi, zindan ve tapınak sandığı, büyüleme, tekne) başarımla işaretlendi. Bosslar sınamada tek vuruşla yenildi (dövüş dengesi ayrıca denenmedi). Dört zorlukta da bütün bölümler bitti, ödüller verildi, hata çıkmadı; Hardcore'da ölüm dünyayı bitirdi.
- **Ulaşılabilirlik taraması:** 2.097 eşya ve 549 tarifin ham maddelerden (blok ve canlı ganimetleri, olta, sağma, kırkma, köylü satışları) üretilebilirliği tarandı; dünyada doğal olarak bulunan bloklar ve görev eşyaları dışında ulaşılamayan eşya yoktur.
- **Yolculuk düzeltmesi:** "Demir külçe elde et" adımı, külçe çantada beklemeden hemen zırha dönüştürülürse tamamlanmıyordu; artık tam demir zırh da adımı tamamlar. "Elmas bul" için elmas zırh da sayılır.
- **Denge:**
  - Koşarken açlık metre başına 0,1 yerine 0,07, koşarak zıplama 0,2 yerine 0,15 (oyunda doygunluk sistemi olmadığı için koşarken açlık birkaç dakikada bitiyordu).
  - Ekonomi taraması (126 alış, 31 satış takası; doğrudan ve tarif üzerinden alım-satım kârı): tek kâr döngüsü bulundu (oduncudan kalas alıp çubuk yapıp yine oduncuya satmak); oduncu çubuğu 32 yerine 64 adede 1 sikkeye alır. Tarif çoğaltma döngüsü yoktur.
  - Canavar güçleri (zombi 20 can / 3 hasar, haydut 22 / 4, bosslar 110-260 can) ve zırh hesabı (puan başına %4, en çok %80) değiştirilmedi.
- **Gezgin Tüccar** (`js/koy/gezgin.js`, `js/arayuz/gezgin-ekrani.js`): tek oyunculu dünyalarda 2. günden sonra bazı sabahlar (%35) oyuncunun 14-22 blok yakınında belirir, bir gün kalır. Mor kaftanlı, sarı şapkalı, sırtında heybe. Her gelişinde havuzdan 7 takas seçilir (stoklu): meyve fidanları, tohumlar, Eve Dönüş Tılsımı, eyer, dalış maskesi, ışıltaş, parıltı kristali, altın elma satar; elması 6, inciyi 4, yıldız parçasını 5 sikkeye, iki altın külçeyi 2 sikkeye alır (köylülerden iyi). Shift ile toplu takas. Saldırılınca küsüp gider.
- **Metin denetimi:** eşya adları ve özellikleri, başarımlar, Yolculuk, öğretici, ipuçları ve köylü sözleri tarandı (çift boşluk, noktalama, resmî olmayan emir kipleri, İngilizce sözcük, aynı ad). Oyundaki "Devam etmek için tıklayın" yazıları "tıklayınız" oldu.
- **Geliştirici araçları:** konsolu kapalı oluşturulan bir dünyada F8, ` (ters tırnak) ve F9 hiçbir pencere açmaz, komutlar çalışmaz (eşya verme denendi); geliştirici modu yalnızca geliştirici koduyla açılır. Sınama ve hata ayıklama için tarayıcı konsolundaki `HungerMan` nesnesi bilerek bırakılmıştır.
- **Sorun bildirme:** duraklatma menüsünde "Sorun Bildir": açıklama kutusu ve rapora eklenecek bilgiler (sürüm, tarayıcı, ekran kartı, ekran, ayarlar, dünya tohumu / günü / zorluğu / konumu, son ekran hatası ve son 15 uyarı). Rapor kopyalanır ya da .txt olarak indirilir; kendiliğinden hiçbir yere gönderilmez.
- **Tanıtım sitesi:** güncellemeler sayfasına "Bilinen sorunlar" ve "Geri bildirim" bölümleri; SSS'ye hata bildirme sorusu; rehbere Gezgin Tüccar; galeriye iki yeni ekran görüntüsü (kumsalda gün batımı, gezgin tüccar); ana sayfaya 12 saniyelik tanıtım videosu (`site/gorsel/tanitim.mp4`, 960×540, yaklaşık 1 MB).

## 50.0 (0.50.0): Performans, kayıt ve çok oyunculu (geliştirme planı 9. aşama)
- **Ölçüm** (`js/sistem/olcum.js`): konsolda `olcum ac`, `olcum rapor`, `olcum kapat`. Açıkken oyunun 36 işi sarılır ve kare başına ortalama / en uzun süreleri tutulur; rapor: kare içi iş süresi (ortalama, %95, en uzun), çizim çağrısı, üçgen, geometri, doku, JS belleği ve en pahalı 10 iş. Kapalıyken yük getirmez.
- **Ölçüm sonuçları** (yazılımla çizen sınama tarayıcısı, aynı tohum, koşarak uçuş; mutlak değerler gerçek ekran kartından yüksektir, oranlar karşılaştırma içindir):
  - Görüş 4 (Düşük): kare içi iş 25,7 → 15,1 ms; bellek 74-80 MB; çizilen üçgen 336 bin → 253 bin.
  - Görüş 8 (Yüksek): kare içi iş 35,2 → 23,9 ms; bellek 185-190 MB; çizilen üçgen 966 bin → 771 bin.
  - Ölçümle bulunan en pahalı işler: çizim, yağış dokusunun her karede 700 sütun okuması, her karede yeniden çizilen pusula, harita keşfinde tek karede 14 parça hesabı, uzak canlıların yapay zekâsı.
- **Çizim:**
  - Yeraltı geometrisi: her parçanın, en alçak yüzeyinin 3 blok altında kalan yüzleri ayrı bir geometriye yazılır. Oyuncu yer üstündeyken (başının üstünde gökyüzü varken) bulunduğu ve komşu parçalar dışındaki parçaların yeraltı geometrisi çizilmez; yeraltında, binada ya da ağaç altında hepsi çizilir. Sınamada yeraltı geometrisi toplamın yaklaşık yarısıydı; yüzeyde çizilen üçgen 224 binden 98 bine indi.
  - Uzak canlılar: sis sınırının ötesindekiler çizilmez (önceden siste karartı gibi görünüyorlardı); 40 bloktan uzaktakilerin yapay zekâsı iki karede bir işlenir.
  - Pusula yalnızca bakış yönü ya da işaretler değişince yeniden çizilir. Yağış çatı dokusu yağış yokken saniyede birkaç sütun okur; kaba yağış dokusu altı kareye bölünür. Harita keşfi kare başına en çok 4 parça hesaplar.
- **Yükleme:** hızlı giderken (saniyede 6,5 bloktan hızlı: at, tekne, uçuş) gidilen yöndeki parçalar önce üretilir (uzaklık yöne göre 0,55-1,45 ile tartılır). Yeni dünyanın açılışı sınamada 2,1 saniye.
- **Kayıt:**
  - Her dünyanın son üç yedek kopyası tutulur (~yedek, ~yedek2, ~yedek3): dünya hatasız açıldığında ve oynarken her 15 dakikada bir yeni kopya eklenir, en eskisi silinir. Kayıt okunamazsa kopyalar en yeniden en eskiye denenir; uyarı bildirimi gösterilir.
  - Blok değişiklikleri kayıtta tek bir 32 bitlik sayıya paketlenir (dizin × 4096 + blok); sınamada değişiklik verisi 4,5 KB'den 1,8 KB'ye indi. Eski kayıtlar açılır; çok oyunculu aktarım değişmedi.
- **Çok oyunculu:**
  - Diğer oyuncuların ve canlıların konumu, son iki paketten hesaplanan hızla kısa bir süre ileri tahmin edilerek yumuşak izlenir (paketler arasında takılma azalır).
  - Kendiliğinden yeniden bağlanma: bağlantı koparsa 5 saniye sonra yeniden bağlanılır; deneme bağlantı aşamasında başarısız olursa 6 ve 9 saniye sonra yeniden denenir (en çok 3 deneme).
  - 8 oyunculu yük sınaması (sunucu ve 7 istemci aynı makinede): yedisi de katıldı, her istemci 7 uzak oyuncuyu gördü; sunucuda ağ işi kare başına 4,8 ms. Koparılan istemci kendiliğinden yeniden bağlandı.
- **Telefon ön ayarı:** Ayarlar > Görüntü > Grafik ön ayarı > Telefon: görüş 4 parça, %50 çözünürlük ve düşük güç kipi (piksel oranı en çok 1, en yakın 12 ışık, en çok 160 parçacık, uzak canlılar 28 bloktan sonra seyrek işlenir). Dokunmatik cihazlarda ilk açılışta kendiliğinden seçilir.

## 49.0 (0.49.0): Arayüz ve ilk deneyim (geliştirme planı 8. aşama)
- **Öğretici:** ilk günün adımları yeniden düzenlendi: Hareket, Odun, Üretim Masası, İlk alet, Işık, **Sığınak** (yeni: çatısı ve en az üç yanında duvarı olan bir yerde durmak), **Yatak** (yeni: yakında yatak ya da yatakta uyumak), Yemek, İlk gece, ardından Fırın, Kıyafet, Tarla, Köyler (toplam 13 adım).
  - Metinler atanmış tuşları gösterir (önceden envanter için yanlışlıkla "E" yazıyordu); dokunmatik kontrollerde dokunmatik anlatım çıkar.
  - Panelde ilerleme çubuğu, "Bu adımı geç" ve "Öğreticiyi kapat" düğmeleri; fare oyunda kilitli olduğu için aynı düğmeler duraklatma menüsünde de bulunur.
  - Eski dünyaların öğretici adımı yeni sıraya çevrilir.
- **Bağlamsal ipuçları** (`js/arayuz/ipuclari.js`): su, lav, köylü, mağara, gece, sizi fark eden canavar, açlık, vücut ısısı ve düşük can ile ilk karşılaşmada sol altta kısa bir bilgi kartı (11 saniye, tıklanınca kapanır). Her ipucu bir kez gösterilir; görülenler tarayıcıda saklanır. Ayarlar > Oynanış'tan kapatılabilir; "İpuçlarını yeniden göster" ile sıfırlanır.
- **Envanter ve üretim:**
  - Sürükle-bırak: eşya düğme basılıyken başka bir yuvaya sürüklenip bırakılabilir (tıkla-al / tıkla-bırak da sürer); dokunmatikte parmakla sürüklenir.
  - Eksik malzemenin altında nereden bulunacağı yazar (kırılınca düşüren bloklar, düşüren canlılar, satan köylüler); üretilebilen malzemelerde önceden olduğu gibi tarif bağlantısı vardır.
- **Gösterge:**
  - Sade gösterge (varsayılan açık): can ve açlık doluyken, değişmedikçe ve tehlike yokken can, açlık ve zırh satırı ile deneyim çubuğu soluklaşır; bir şey değişince ya da canavar yaklaşınca belirginleşir.
  - Uyarı bildirimleri kırmızı çerçeveli, uyarı işaretli ve daha uzun süreli: açlık, üşüme / donma / bunalma / sıcak çarpması, can 3 kalbin altına inince.
- **Dokunmatik:** kayan kol (ekranın sol alt bölümünde nereye dokunulursa kol orada açılır), ayrı dokunmatik bakış hassasiyeti, düğme boyutu (%80-140), koşu eşiği yumuşatıldı.
- **Oyun kumandası** (`js/sistem/kumanda.js`, Gamepad API): bir tuşa basınca kumanda kipi açılır. Sol çubuk yürüme (sonuna kadar ya da L3: koşu), sağ çubuk bakış, A zıpla, B eğil, X etkileşim, Y envanter, RT kır, LT kullan, LB / RB eşya, Başlat duraklat, Geri harita, yön tuşları görevler / eşya at / Tarif Kitabı / yön çevir. Menülerde ve pencerelerde ekran imleci (sol çubuk ya da yön tuşları sürer, A sol tık, X sağ tık, B kapat / geri, sağ çubuk kaydırır). Fare kullanılınca kumanda kipi kapanır. Ayarlar > Kontroller: kumanda bakış hızı.
- **Erişilebilirlik** (Ayarlar'da yeni sekme): yazı boyutu (%90-140), renk körlüğü düzeltmesi (protanopi, döteranopi, tritanopi; oyun görüntüsüne, göstergelere ve pencerelere uygulanır), kamera sallanması, ekran sarsıntısını ve parlamaları azaltma (şimşek ve meteor parlaması dörtte bir, hasar parlaması ve meteor sarsıntısı kapalı, iniş ve vuruş sarsıntısı azaltılmış), ses altyazıları.
- **Sınama:** öğretici (tuş adları, adım geçme, eski kayıt çevirisi), sığınak denetimi, su ipucu ve kaydı, sade gösterge ve açlık uyarısı, malzeme kaynağı metni ve tarif ayrıntısı, gerçek fareyle sürükle-bırak, sahte kumandayla kilitleme / yürüme / bakış / envanter açıp kapama / duraklatma ve devam, renk körlüğü süzgeci, yazı boyutu, kayan dokunmatik kol denendi; uzun oturum taraması tekrarlandı.

## 48.0 (0.48.0): Görsel ve his (geliştirme planı 7. aşama)
- **Canlı animasyonları:**
  - Yürürken gövde hafifçe seker; koşarken adımlar açılır, gövde öne eğilir ve ayak altından toz kalkar.
  - Saldırı hazırlığında canlı siner; vuruş anında kollar hızla iner ve gövde öne atılır. Kolsuz canlılar (kurt, örümcek) vuruşta öne doğru dalar.
  - Hasar alan canlı geriye savrulur; kırmızı renk birden kaybolmak yerine yavaşça söner.
  - Ölüm: canlı yana devrilir, yere çarpıp hafifçe seker, toprağa gömülerek solar ve dumana dönüşür (0,9 yerine 1,45 saniye).
  - Oyuncu uzaktayken canlılar ara sıra etrafa bakınır; duran hayvanlar zaman zaman başını yere eğer.
- **Parçacıklar:** parçacık çizimi yenilendi; her parçacığın kendi boyutu ve saydamlığı var, sönerken solar.
  - Blok kırılınca daha iri parçalar saçılır, yere çarpıp seker ve küçülerek kaybolur; kırılan bloktan toz kalkar.
  - Koşma tozu yumuşak, büyüyerek dağılan bir bulut; sert inişte ayak altından toz halkası.
  - Suya düşünce damlalar sıçrar ve yüzeyde köpük halkası yayılır.
  - Kıvılcımlar titreşerek parlar, duman büyüyerek dağılır.
- **Işık:**
  - Işık kaynakları yumuşak geçişle yanar ve söner: yeni konan meşale yavaşça parlar, kırılan söner; yaklaşırken ışık listesi değişince ani parlama ya da kararma olmaz.
  - Lav ve magma ışığı turuncu ve yavaşça dalgalanır.
  - Elde tutulan her ışıklı blok (fener, buz feneri, parıltı kristali, ışıklı mantar, lamba, ışıltaş vb.) çevresini aydınlatır; önceden yalnızca meşale aydınlatıyordu.
  - Yeni eşya **El Feneri** (Üretim Masası: 2 bakır külçe, 1 cam, 1 parıltı kristali): elde tutulunca bakılan yönü 24 blok uzağa kadar dar bir ışık konisiyle aydınlatır.
  - Gün doğumu ve batımında güneşin bulunduğu ufuk turuncu-pembe, karşı ufuk morumsu renk alır; alçalan güneş kızarır, bulutlar pembeleşir, ortam ışığı ısınır.
- **Su ve gökyüzü:**
  - Su yüzeyi gökyüzünü yansıtır (yatık bakışta daha çok ve daha az saydam); güneş ve ay dalgalarda parıldar. Mağara suyu gökyüzünü yansıtmaz.
  - Kıyıya değen su yüzeyinde dalgalanan köpük oluşur.
  - Bulutlar hava durumuna göre değişir: açık havada seyrek, yağmur yaklaştıkça gök kapanır; fırtınada bulutlar hızlı akar.
- **Dokular:** taş, toprak, çimen, kum, çakıl, kar, kil ve kum taşı bloklarında blok başına hafif renk farkı; üst yüzlerde doku dört yönden birine döndürülür. Geniş düzlüklerde doku tekrarı belirgin olmaz.
- **Uzak görüş:** sis yumuşak başlayarak koyulaşır; uzaktaki dağlarda hafif pus (hava perspektifi) oluşur, görüş sınırındaki geçiş daha az fark edilir.
- Elde meşale ya da ışık varken buz ışığı yakındaysa el ve yerdeki eşyaların her zaman tam aydınlık görünmesi giderildi.
- **Sınama:** irkilme, ölüm (devrilme, solma, kaldırılma), vuruş hareketi, toz / sıçrama / kırılma parçacıkları, meşalenin yumuşak yanması ve sönmesi, lav ışığı, elde fener ışığı, El Feneri ve tarifi, yağmurda bulut eşiği denendi; kumsal (öğle ve gün batımı), çayır ve dağ görüntüleri incelendi; uzun oturum taraması tekrarlandı.

## 47.0 (0.47.0): Ses ve müzik (geliştirme planı 6. aşama)
- **Gerilim katmanı:** oyuncuyu fark eden canavarlar yaklaştıkça alttan alçak bir uğultu yükselir; yoğunluk arttıkça (yakında birkaç canavar) hızlanan bir davul eklenir (0,85 → 0,5 saniye). Katman hızlı yükselir, tehlike geçince yavaşça söner; çalan müzik parçası en çok %55 kısılır. Boss savaşında kendi parçası çaldığı için zayıflar. Müzik düzeyine bağlıdır; Ayarlar > Ses'ten kapatılabilir.
- **Uyarı sesleri:**
  - Canavar oyuncuyu fark ettiği anda sesini çıkarır (aynı canavar 12 saniyede bir).
  - Okçu iskelet yayını germeye başlayınca kirişin gerilme sesi duyulur.
  - Can 3 kalbin altındayken kalp atışı (1,5 kalbin altında hızlanır).
  - Açlık 6'nın altına inince, vücut ısısı tehlikeye girince ve tutuşulunca kısa bir uyarı tonu; açlıkta ayrıca bildirim.
- **Malzeme sesleri:** metal (Örs, Fener, Altın Blok, Demir Parmaklık, Buzdolabı, Metal Varil, Demir Levha, elektrikli cihazlar) ve buz blokları kendi adım, kazma, kırma ve koyma seslerini kullanır; yaprak ve yün kazılırken ve kırılırken hışırdar (önceden sentez sesine düşüyordu).
- **Ortam:** çatı altında yağmur sesi çatının malzemesine göre değişir (metal ve cam çınlar, ahşap ve yaprak orta, taş en boğuk); fırtınada alçakta da rüzgâr uğuldar.
- **Ses kanalları:** Ayarlar > Ses: "Ana ses düzeyi"nin altında ayrı kaydırıcılar: Eylem ve dövüş sesleri, Canlı sesleri, Ortam sesleri (yağmur, rüzgâr, kuşlar), Arayüz sesleri. Ayrıca "Tek kanallı ses (mono)" ve "Ses altyazıları".
- **Altyazılar:** yakında duyulan canlı sesleri, gök gürültüsü yazıyla gösterilir ("◀ Zombi inliyor", "Koyun meliyor ▶"); yön soldan ya da sağdan geldiğini gösterir, aynı satır yinelenince süresi uzar, en çok 5 satır.
- **Seyreltme:** kendiliğinden çıkan canlı sesleri en çok 0,7 saniyede birdir; çok hayvanın bulunduğu yerde art arda ses birikmez.
- **Sınama:** ses kanalları, malzeme sesleri, üç zombi fark ettiğinde gerilim katmanının açılması, altyazı, kanal ayarının uygulanıp kaydedilmesi, düşük canda kalp atışı ve açlık uyarısı denendi; uzun oturum taraması tekrarlandı.

## 46.0 (0.46.0): Oynanış döngüsü ve ilerleme (geliştirme planı 5. aşama)
- **Yolculuk** (`js/oyun/yolculuk.js`): oyunun başından Yeraltı Diyarı'na uzanan, sırayla açılan 8 bölüm: İlk Gün, İlk Gece, İnsanlar, Demir Çağı, Derinlikler, Efsaneler, Lanetli Ada, Ateşin Eşiği. Her bölümün 3-4 adımı başarımlara bağlıdır (bir adım, listedeki başarımlardan biri kazanılınca tamamlanır). Bölüm bitince ödülü verilir (deneyim ve eşya; çanta doluysa yere bırakılır) ve sonraki bölüm açılır.
  - Ödüller: İlk Gün 8 meşale, 3 ekmek; İlk Gece 3 bandaj, 4 pişmiş domuz eti; İnsanlar 12 sikke, 4 ekmek; Demir Çağı altın elma, şifa iksiri; Derinlikler 2 elmas, 3 parıltı kristali; Efsaneler 2 altın elma, Eve Dönüş Tılsımı; Lanetli Ada 2 şifa iksiri, 2 altın elma; Ateşin Eşiği 5 elmas, 3 altın elma (ve 8 ile 80 arasında deneyim).
  - Görev günlüğünde (J) yeni "Yolculuk" sekmesi: biten bölümler, şu anki bölümün adımları (sıradaki adımın ipucuyla) ve ödülü, kapalı bölümler. Eski "Görevler" listesi "Köy Görevleri" sekmesindedir.
  - Ekrandaki görev izleyicinin başında Yolculuk'un sıradaki adımı gösterilir (Ayarlar > Arayüz'den kapatılabilir).
  - Durum başarımlarla birlikte kaydedilir. Eski dünyalarda kazanılmış başarımlara göre bölüm belirlenir; geçmiş bölümlerin ödülleri yeniden verilmez.
- **Söylentiler haritada:** köylülerin anlattığı söylentiler (özel yapılar, batık gemiler, zindanlar, Lanetli Ada, uzak köyler) artık daha sık anlatılır (%30 yerine %42) ve haritaya "?" ile başlayan yaklaşık bir işaret olarak eklenir (50 blokluk ızgaraya yuvarlanır; aynı yer için tek işaret, işaret sınırı 30).
- **Gece olayları** (3. günden sonra, Kanlı Ay geceleri hariç; gece başında bildirilir):
  - Sisli Gece (%14): yaklaşık bir dakikada yoğunlaşan sis (yeraltında yok); canavarlar %30 fazla ama görüş menzilleri %45 kısa.
  - Sakin Gece (%12): canavarlar yarı yarıya azdır.
  - Yıldız Yağmuru (%8): gece boyunca 2-3 meteor düşer.
- **Zırhlı canavarlar:** 4. günden sonra gece doğan canavarların bir kısmı (her gün %2,5 artarak en çok %25) zırhlıdır: çelik tonunda görünür, %15 hızlıdır, bir fazla hasar verir, yarı geri itilir, iki kat deneyim ve ek ganimet (demir ya da bakır külçe, sikke) bırakır.
- Köy baskınları kapalı kalır. Ekonomi dengesi (sikke kaynakları ve harcama yerleri) 0.51'deki son denge çalışmasına bırakıldı.
- **Sınama:** yeni dünyada Yolculuk başlangıcı ve görev izleyici, İlk Gün bölümünün ödülü (8 meşale, 3 ekmek), önceden kazanılmış başarımlarla üç bölümün birden geçilmesi (sikke ödülü dahil), Yolculuk sekmesi, kayıt ve yeniden açmada bölümün korunması, söylenti işaretinin bir kez eklenmesi, sisli gecenin başlaması ve sisin yoğunlaşması, zırhlı canavar; uzun oturum taraması tekrarlandı.

## 45.0 (0.45.0): Savaş (geliştirme planı 4. aşama)
- **Silah profilleri** (`SILAHLAR`, `js/oyun/etkilesim.js`): önceden bütün silahların vuruş arası 0,5 saniye ve erişimi 3,6 bloktu. Artık her silahın temposu, erişimi, itmesi ve özelliği ayrıdır:

  | Silah | Vuruş arası | Erişim | İtme | Özelliği |
  | --- | --- | --- | --- | --- |
  | El | 0,4 sn | 3,2 | 0,8 | |
  | Kılıç | 0,55 sn | 3,6 | 1 | Yerdeyken ve koşmuyorken yandaki düşmanlara %35 süpürme |
  | Hançer | 0,38 sn | 3,0 | 0,6 | Fark etmemiş ya da arkası dönük canlıya 2 kat (boss hariç) |
  | Mızrak | 0,85 sn | 4,7 | 1,3 | Uzun erişim |
  | Savaş Çekici | 1,15 sn | 3,4 | 2,1 | Hedefin çevresine %50 hasar, sarsıntı |
  | Balta | 0,8 sn | 3,4 | 1,3 | |
  | Kazma / Kürek | 0,65 / 0,6 sn | 3,5 | 0,9 | |

- **Denge (saniyedeki hasar, tek hedef):** demir kılıç 12,7, elmas kılıç 14,5, obsidyen kılıç 16,4, hançer 13,2 (sırttan 26,3), mızrak 9,4, savaş çekici 8,3 (+ alan), demir balta 7,5. Silahların vuruş hasarları değişmedi.
- **Vuruş hissi:** isabette çok kısa zaman yavaşlaması (hafif silahta 0,03, çekiçte 0,08 saniye; kritik ve sırttan vuruşta uzun), kıvılcım; ağır ve kritik vuruş daha tok duyulur; çekiç kamerayı sarsar. Çok oyunculuda dünya yavaşlatılmaz.
- **Saldırı hazırlığı:** yakın dövüşçü canavarlar vurmadan önce kısa bir hazırlık yapar (0,38 saniye, örümcek 0,22, boss 0,45; kollu canavarlarda kollar kalkar). Hazırlık bitince hedef hâlâ menzildeyse vurulur, yoksa savrulma boşa gider.
- **Savunma:** elde kılıç, hançer, mızrak, çekiç ya da balta varken kullanılacak bir şeye bakmadan sağ tık basılı tutulur; silah ekranın ortasında yatay tutulur. Önden (±75°) gelen yakın ve ok saldırılarının hasarı %65 azalır, silah yıpranır; savunurken yavaş yürünür, koşulamaz ve saldırılamaz. Saldırıdan en çok 0,3 saniye önce başlayan savunma **savuşturma** olur: hasar alınmaz, saldıran 1,6 saniye sersemler ve geri itilir.
- **Atılma:** geri, sol ya da sağ yön tuşuna 0,26 saniye içinde iki kez basılınca o yöne atılınır (yaklaşık 2,2 blok); atılmanın ilk 0,3 saniyesinde gelen saldırılar boşa gider. 1,1 saniyede bir yapılabilir, biraz acıktırır.
- **Özel oklar:** Ateşli Ok (4 ok + 1 kömür, Üretim Masası) vurduğu canlıyı tutuşturur; Zehirli Ok (4 ok + 1 çürük et) 6 saniye boyunca saniyede 1 hasar verir (boss ve iskeletlere yarı hızda). Hızlı erişim çubuğundaki ilk özel ok yayla önce atılır; yoksa sıradan ok, o da yoksa çantadaki özel ok. Tam gerilmiş, ateşli ve zehirli oklar uçarken iz bırakır.
- **Hasar sayıları:** Ayarlar > Arayüz > "Hasar sayılarını göster" (varsayılan kapalı): vurulan canlının üstünde yükselip kaybolan sayı; kritik ve sırttan vuruş sarı ve büyük.
- Ayarlar > Kontroller'deki tuş listesine ve sitedeki rehbere savunma, atılma ve silahlar eklendi.
- **Sınama:** silah profilleri ve hasarları, kılıç süpürmesi (yandakilere 2), hançerin sırttan vuruşu (5 → 10), çekicin alan hasarı (yandakilere 5), saldırı hazırlığı, savunmalı ve savunmasız alınan hasar (3 → 1), savuşturma (hasar 0, saldıran 1,6 sn sersem), atılma (2,2 blok, beklemede tekrar atılamaz), zehirli ve ateşli ok ile hasar sayıları ölçüldü; uzun oturum taraması tekrarlandı.

## 44.0 (0.44.0): Canlılar ve yapay zekâ (geliştirme planı 3. aşama)
- **Yol bulma (`js/varlik/yol.js`):** canavarlar artık oyuncuya düz çizgide yürümez; görüş yoksa, arada yükseklik farkı ya da engel varsa A* ile yol bulur. Duvarların etrafından dolanır, bir blokluk basamakları zıplayarak çıkar, en çok üç blok aşağı iner, lavdan geçmez, suyu son çare olarak kullanır. Kapı, çit ve cam gibi biçimli bloklar çarpışma kutularıyla hesaba katılır (kapalı kapıdan geçilmez). Ulaşılamayan hedefte en çok yaklaşılan noktaya gidilir. Arama sınırlıdır (en çok 520 hücre, 30 blok yarıçap, karede en çok 3 arama).
- **Algı:** canavarlar önceden duvarların arkasından da oyuncuyu "biliyordu". Artık oyuncuyu görüş menzilinde ve görüş hattı açıkken görür, gürültüsünü duyar ya da vurulunca fark eder; fark ettikten sonra 8 saniye izler, görmediği sürece son gördüğü yere gider ve orada kimseyi bulamazsa vazgeçer.
  - Gürültü: dururken 4, yürürken 7, koşarken 12, kazarken ya da vururken 10 blok; eğilerek yürürken 2,5 blok (eğilen oyuncu kazarken 6). Eğilen oyuncu %45 daha yakından görülür.
  - Kanlı Ay'da görme ve duyma menzili %40 artar.
- **Çevreleme:** oyuncuyu birden çok yakın dövüşçü canavar kovalarken her biri kendi yaklaşma yönüne göre farklı bir açıya (0, ±70°, ±140°) kayar; oyuncu iki-üç yönden sarılır.
- **Okçular** nişan alırken yana adım atar (sabit hedef olmazlar).
- **Geri çekilme:** canı dörtte birin altına inen haydut, mağara örümceği ve öfkeli kurt bir kez 3,5 saniye kaçar.
- **Hayvanlar:** sürüden fazla uzaklaşmaz (dolaşırken sürünün ortasına döner), gece çoğunlukla dinlenir; inek, koyun, domuz, tavuk, tavşan ve at yakındaki yabani kurttan kaçar.
- **Bosslar** yuvalarından 30 bloktan fazla uzaklaşmaz; oyuncu kaçınca yuvalarına döner ve 6 saniye dinlendikten sonra yavaşça iyileşir (saniyede canının %3'ü). Kül Devi kendi ada kuralına bağlı kalır.
- **Canavar sayısı:** ilk geceler daha sakin: yakındaki canavar sınırı 1. gece 4, 5. gece 10, 10. geceden sonra 18 (önceden 1. gece 6). Kanlı Ay ve zorluk çarpanları sürer.
- **Sınama:** havada kurulan alanda duvarın arkasındaki oyuncuya dolanarak ulaşma, üç basamaklı kuleye çıkma, duvar arkasında eğilen oyuncuyu fark etmeme ve koşanı duyma, dört zombinin oyuncuyu farklı yönlerden (−177°, −122°, −64°, 121°) sarması, koyunun kurttan kaçması ve Firavun'un yuvasına dönmesi ölçüldü; uzun oturum taraması tekrarlandı.

## 43.0 (0.43.0): Fizik ve hareket (geliştirme planı 2. aşama)
- **Hareket:** yerde hızlanma ve durma ayrıldı; tuş bırakılınca daha çabuk ve kararlı durulur (yürürken yaklaşık 0,2 blok). Havada tuşa basılmıyorsa hız korunur (önceden havada kendiliğinden yavaşlanıyordu).
- **Koşarak zıplama:** bakılan yöne küçük bir hız eklenir; koşarak yaklaşık 4,5 blok atlanır.
- **Kenar payı:** kenardan çıktıktan sonraki 0,12 saniye içinde de zıplanabilir; yere değmeden hemen önce basılan zıplama iniş anında uygulanır. İki kare arasında basılıp bırakılan zıplama artık kaybolmaz.
- **Baş çarpması:** zıplarken baş bir blok kenarına az bir payla takılırsa oyuncu yana kaydırılır ve yükselmeye devam eder.
- **İniş:** yüksekten inişte kamera hızla orantılı kısa bir çökme yapar ve zemine göre iniş sesi çalar ("Yürürken kamera sallanması" kapalıysa çökme hafiftir).
- **Geri itme:** vuruşun gücüne ve saldıranın iriliğine göre değişir (sıradan vuruşta yaklaşık 2, boss vuruşunda 4 blok); zırh savrulmayı biraz azaltır. Savrulurken kontrol kısa süre zayıflar; önceden itme bir anda sönüyordu.
- **Su:** tuşa basılmadan suda yavaşça batılır (saniyede yaklaşık 1,4 blok; önceden hızla dibe iniliyordu), C ile hızlı dalınır. Yüksekten suya girişte hız yumuşakça kesilir.
- **Yerdeki eşyalar:** suda yüzeye çıkar, akan suda sürüklenir; yüklü olmayan parçada bekler (önceden boşluğa düşüp kayboluyordu); bloğun içinde kalırsa üste çıkar.
- **Tekneler** akan suda akış yönüne yavaşça sürüklenir.
- Canlıların ve yerdeki eşyaların sürtünmesi kare hızından bağımsız hâle getirildi (düşük kare hızında savrulma daha uzun sürüyordu).
- **Ölçüm:** havada kurulan sınama alanında yürüme, durma, koşarak zıplama, kenar sonrası zıplama, suya düşüş, suda batma, eşyanın yüzmesi, geri itme ve iniş çökmesi ölçüldü; uzun oturum taraması tekrarlandı, hata çıkmadı.

## 42.0 (0.42.0): Hatalar ve kararlılık (geliştirme planı 1. aşama)
- **Kayıt güvenliği:** dünyanın yedek kopyası (`~yedek`) artık açılıştan önce değil, dünya hatasız yüklendikten sonra yazılır; bozuk bir kayıt yedeğin üzerine yazılmaz. Kayıt okunamaz ya da dünya kurulurken hata çıkarsa dünya son başarılı açılıştaki hâliyle açılır ve bildirim gösterilir; yedek de yoksa Dünyalar ekranına dönülür ve hata açıklanır (önceden yükleme ekranında kalınabiliyordu).
- Kayıtlar sıraya girer; aynı anda iki kayıt yazılmaz. "Kaydet ve Çık" sürmekte olan kaydın ardından en güncel durumu yazar.
- Kayıt verisi hazırlanırken çıkan hata artık sessizce yutulmaz: ekranda bildirilir ve konsola KRİTİK olarak yazılır. Depolama alanı dolduğunda ayrı bir uyarı verilir.
- Envanter penceresi açıkken imleçte taşınan eşya kayda girer; sekme bu sırada kapanırsa eşya kaybolmaz.
- **Oyun döngüsü:** karede çıkan hata konsola ayrıntısıyla (yeriyle) yazılır ve aynı hata her karede yeniden bildirilmez. Tek bir canlıda çıkan hata artık bütün karenin durmasına yol açmaz; o canlı kaldırılır ve hata kaydedilir.
- **Sıkışma:** oyuncu bloğun içinde kalırsa (üstüne kum düşmesi, ışınlanma, kapalı alanda doğma) yanlarda yer yoksa yukarıdaki ilk boş yere çıkar. Canlılar için de aynı kural eklendi.
- **Dünyanın altına düşme:** oyuncu aynı sütunun yüzeyine konur. Önceden 200 yüksekliğe konuyor ve düşüş hasarıyla ölüyordu.
- Tekneden inerken birikmiş düşüş mesafesi sıfırlanır (inişte beklenmeyen düşme hasarı alınmaz).
- **Çok oyunculu:** sandık açıkken içeriği değişince sunucuya hemen bildirilir ve oyuncu kaydı da gönderilir. Bağlantı sandık açıkken koparsa önceden sandıktan alınan eşyalar hem sandıkta hem çantada kalabiliyor (çoğalma) ya da sandığa konanlar kaybolabiliyordu. İmleçteki eşya istemci kaydına da girer.
- **Denetim:** uzun oturum taraması (yürüyüş, pencereler, gece savaşı, düşen kum, köy, liman, zindan, batık, tapınak, kule, kamp, Lanetli Ada, fırtına, Kanlı Ay, meteor, Yeraltı Diyarı'na gidiş-dönüş, hızlandırılmış 6 gün, 2400 blokluk gezinti, ölüm, yeniden doğma, kaydet ve yeniden açma) iki ayrı tohumda yapıldı: sayfa hatası 0, bellek kullanımı oturum boyunca sabit (sızıntı yok), kayıt ve yeniden açmada blok değişiklikleri eksiksiz. Bozuk kayıt, imleçte eşya, dünyanın altına düşme ve bloğa gömülme senaryoları ayrıca sınandı.
- Köy baskınları kapalı kalır (ileride ayrıca değerlendirilecektir).

## 41.12 (0.41.12): Dünya oluşumu hata taraması ve akan su canlandırması
Tohum 4122432088 başta olmak üzere üç tohumda doğma noktası çevresindeki yaklaşık 1900 parça otomatik olarak tarandı; bulunan hatalar düzeltildi:
- Havada asılı su duvarları (mağaralar): yeraltı gölleri ve nehirleri parça parça dolduruluyordu; parça sınırlarında havada duran su katmanları ve lava değen su yığınları oluşuyordu (tarama: 701 hücre). Mağaralara artık su doldurulmaz; yeraltı nehri kanalları kuru tünel olarak kalır (tarama: 0).
- Yamaçlarda tek blokluk dikey yarıklar ve tarak görünümü, kum taşı ve taş çizgileri: uçurum altı oyukları sütun sütun oyulduğu için oluşuyordu. Bu oyma kaldırıldı.
- Havada asılı ince toprak tabakaları: mağara girişlerinde geniş oyuklar yüzeyin hemen altına kadar çıkıyor, 1-3 blokluk tavan bırakıyordu (tarama: 109). Geniş boşluklar yüzeyin en az 8 blok altında kalır; yüzeye 4 bloktan fazla yaklaşan tünelin üstü tamamen açılır (tarama: 0).
- Lav denizleri: geniş mağara salonları lav düzeyine (y 10) kadar iniyor, salonların tabanı baştan sona lavla doluyordu. Geniş boşluklar artık y 12'nin üstündedir; lav yalnız derin tünellerin dibinde kalır.
- Havada asılı kum, çakıl ve kızıl kum (mağara tavanları, yamaçlar): altı boş olanlar kum taşına, taşa ve pişmiş kile döner (tarama: 127 → 0).
- Yamaçtaki dev meşe ve dev ladinlerin 2 x 2 gövdesinin alçak taraftaki köşeleri havada kalıyordu; gövde zemine kadar uzar.
- Mağaralarda dört yanı boş tek taş blokları ve maden ile zindan oyulduktan sonra altı boşalan dikitler, sarkıtlar ve mantarlar kaldırılır.
- Göllerde nilüfer sıklığı yarıya indirildi.
- Akan su canlandırması: akan ve düşen suyun yan yüzlerinde doku sürekli aşağı kayar; şelaleler ve nehir basamakları sabit bir su duvarı gibi değil, akan su olarak görünür.
- Yalnızca yeni yüklenen bölgelerde geçerlidir (akan su canlandırması her yerde).

## 41.11 (0.41.11): Devrik kütük düzeltmesi
- Komşu hücrelere yerleşen iki devrik kütük birbirine değip ya da kesişip L veya T biçiminde birleşebiliyordu (kesişme hücresinde ötekinin halkalı ucu yandan görünüyordu). Her kütük artık kendi hücresinin içinde, kenarlardan bir blok içeride kalır; üç tohumda 10 800 parçalık denetimde kesişme yok.
- Yalnızca yeni yüklenen bölgelerde geçerlidir.

## 41.10 (0.41.10): Gerçekçi ses
- Konumlu ses: canlı sesleri (normal, acıma, ölüm, saldırı), ok ve ateş topu sesleri, Ada Bekçisi'nin adımları, diğer oyuncuların blok kırma ve koyma sesleri ve mağaradaki lav sesi artık kaynağın konumuna göre çalar:
  - Uzaklık: ses uzaklıkla yumuşakça azalır, menzil dışında hiç çalmaz; uzaktaki seslerin tizleri havada sönümlenir.
  - Engel: oyuncunun başı ile kaynak arasındaki katı bloklar sayılır; her blok sesi yaklaşık yarıya indirir ve boğuklaştırır. 2-3 blok altındaki bir canlı boğuk duyulur, 10 blok toprağın altındaki bir canlı duyulmaz; duvarın arkasındaki ses boğuk gelir.
  - Yön: ses kaynağın bulunduğu yöne göre sağ ve sol kulağa dağıtılır (stereo).
- Su altında bütün sesler boğuklaşır; mağarada ve yeraltında sesler hafifçe yankılanır (Yeraltı Diyarı'nda daha az).
- Ölçüm: 8 blok yandaki zombi açık ve sağdan, 3 blok alttaki boğuk ve kısık, 11 blok alttaki hiç duyulmaz.

## 41.9 (0.41.9): Su sesleri
- Şelale kaydı kaldırıldı (`ses/efekt/selale_0.mp3` artık kullanılmaz, silinebilir); nehir ve şelale yakınında yalnızca hafif akarsu sesi çalar.
- Akarsu sesi yaklaşık üçte bire, tekne sürerken duyulan dalga sesi yarıya indirildi; su sesleri duyulacak kadar, gürültü yapmayacak düzeydedir.

## 41.8 (0.41.8): Genel iyileştirmeler (su, ışık, başarım)
- Su sızıntıları giderildi: yeni bir dünyada ilk dakikalarda göl, nehir ve deniz suyu yanındaki mağara ve oyuklara boşalıyor, yeraltı gölleri ve nehirleri mağaralara taşıyor, lavla karşılaşıp obsidyen ve parke taşa dönüşüyordu (ölçümde ilk 90 saniyede yaklaşık 13 000 blok değişikliği). Artık su olan bir sütunun yanında mağara, yarık ve oyuk suyun tabanının altında kalır; derin yeraltındaki üretilmiş sular yanlarında bir blok değişene kadar durgundur (Minecraft'taki gibi). Aynı ölçümde değişiklik sayısı yaklaşık 90'a indi (yalnızca şelalelerin dibindeki doğal akış). Su akışı kuyruğu yeni parçalar yüklenirken birikmez; kayıt dosyası gereksiz yere büyümez.
- Akan su ve düşen bloklar, komşu parçayı yalnızca tam kenardaysa yeniden çizdirir (sık su değişikliklerinde gereksiz yeniden çizim ve takılma olmaz).
- Işık: deniz ve göl tabanı ile sık orman zemini yeni ışık sisteminde fazla kararıyordu; su ve yaprak altı önceki aydınlığına döndürüldü.
- Denetim: yeni dünya oluşturma, biyomlar arası ışınlanma, gece, yağmur, fırtına, zaman hızlandırma, kaydetme ve yeniden açma senaryolarında hata çıkmadı; yeni dünyanın üretici sürümü ve oyuncu değişiklikleri yeniden açılışta korunur.

## 41.7 (0.41.7): Doğal kayalar
- Çayır ve ormanlarda rastgele duran parke taşı ve yosunlu parke taşı yığınları kaldırıldı (parke taş işlenmiş bir yapı malzemesidir, doğada bulunmaz).
- Kayalar artık yalnız taşlık arazide bulunur: kayalık tepeler, dağlar, taşlı kıyı, yalıyar ve (seyrek) tayga ile savan. Doğal taştan, yer yer granitten (savanda kum taşından) yapılır; daha iri, yassı ve yarı gömülüdür; taygada ve nemli kayalık tepelerde üstü yer yer yosunludur.
- Yalnızca yeni yüklenen bölgelerde görünür.

## 41.6 (0.41.6): Özel çalı modeli
- Çalılar artık yere konmuş ağaç yaprağı blokları değildir: kendine özgü biçimli yeni bir bitkidir. Üst üste binen yuvarlak yaprak kümelerinden oluşan alçak bir tümsek biçimindedir; dokusu ışık alan ve gölgede kalan yaprak kümeleri, ince dallar ve küçük boşluklar içerir. İçinden geçilir; makasla hızlı kırılır, kırılınca çubuk ve seyrek olarak meşe fidanı düşer.
- Beş tür: Çalı (çayır ve ormanlar), Büyük Çalı (ormanda, daha yüksek ve dolgun), Ladin Çalısı (tayga ve dağlar), Savan Çalısı (savan ve çöl kenarları), Sonbahar Çalısı (sonbahar ormanı). Yer yer ikili öbekler hâlinde bulunur.
- Yalnızca yeni yüklenen bölgelerde görünür.

## 41.5 (0.41.5): Daha seyrek çiçekler
- Çiçekli çayırda yerin yaklaşık üçte biri çiçekti; artık çiçekler seyrek öbeklerde toplanır (öbek içinde en çok %10, öbek dışında %1,5; ortalama yaklaşık %2). Çayırda çiçek oranı %5'ten %1,5'e, huş ormanında %2'den %1'e indi.
- Çalılar küçük ağaç gibi görünüyordu (içinde kütük, iki-üç blok yüksekliğinde); artık kütüksüz, çoğu bir blok yüksekliğinde alçak yaprak öbekleridir ve daha seyrektir (çayırda üçte bire indi).
- Bu ayar yalnızca yeni yüklenen bölgelerde görünür; daha önce oluşmuş bölgelerdeki çiçekler ve çalılar yerinde kalır.

## 41.4 (0.41.4): Düşen kum ve çakıl
- Kum, çakıl ve kızıl kum Minecraft'taki gibi havada asılı kalmaz: altı boş bir yere konduğunda ya da altındaki blok kırıldığında yer çekimiyle düşen bir küp olarak aşağı iner ve ilk katı zeminin üstüne yerleşir. Üst üste duran bloklar sırasını koruyarak düşer.
- Düşerken boşluktan, sudan ve lavdan, ot ve çiçek gibi bitkilerden geçer (yerine yerleştiği bitki silinir); meşale gibi katı olmayan bloklara tutunur.
- Dünya üretimindeki kum ve çakıl, bir değişiklikle tetiklenene kadar yerinde kalır (Minecraft'taki gibi). Tek oyunculuda ve sunucuda çalışır; değişiklikler kayda geçer ve diğer oyunculara iletilir.

## 41.3 (0.41.3): Yeni ışık sistemi, akan su ve nehir düzeltmeleri
- Gökyüzü ışığı yeniden yazıldı (0-15 ışık düzeyi): gökyüzünü gören hücreler tam aydınlıktır; ışık her yöne (yanlara, aşağı ve yukarı) taşkın dolgusuyla yayılır ve her blokta bir düzey azalır. Tek blokluk oyuklar, mağara ağızları, çıkıntı ve ağaç altları artık zifiri karanlık değildir; içeri doğru yaklaşık 15 blokta kademeli olarak kararır. Su ve yapraklar ışığı azaltarak geçirir.
- Işık, parçanın her yönde 8 blok ötesini de kapsayan hacimde hesaplanır: komşu parçadaki açıklıktan gelen ışık sayılır, parça sınırlarında aydınlık farkı oluşmaz. Sınıra 4 bloktan yakın blok değişiklikleri komşu parçanın ışığını da yeniler.
- En karanlık yerlerin taban ışığı biraz yükseltildi (derin mağaralar yine karanlıktır, ancak tamamen siyah değildir).
- Akan su: bir parça yüklendiğinde, komşu parçanın bu parçaya bakan kenarındaki sular da akışa alınır. Önceden parça sınırında suyun havada asılı kalması ve nehirlerin sınırda yarıda kesilmesi düzeltildi.
- Nehir basamaklarında üretim sırasında şelale (düşen su sütunu) oluşturulur; üst basamağın suyu havada asılı bir duvar gibi kalmaz.
- Nehirler kıyı şeridini de keserek denize ulaşır (kıyıdaki ince kara şeridinde yarıda kalmaz); kıyıya yakın bölgelerde nehirlerin takımada hesabı nedeniyle kesilmesi düzeltildi.

## 41.2 (0.41.2): Arazi, su ve biyom düzeltmeleri
- Kızıl kayalıkların yüksek tepeleri yanlışlıkla "Dağlar" sayılıyor, renk katmanları ve kızıl kum görünmüyordu; düzeltildi. Dağ biyomu artık yalnız dağlık bölgede ya da çok yüksekte başlar (yüksek platolar ve tepeler kendi biyomunda kalır).
- Çöldeki kum tepeleri ve kıyı şeridi basamaklanmaz (basamaklı kum tepeleri oluşmuyor). Çok yüksek zirveler yumuşakça sıkıştırılır; en üst sınırda düz kesik tepe oluşmaz.
- Karlı zirveler ile karla kaplı dağ yüzeyi aynı kurala bağlandı (karlı yüzeyde biyom adı da "Karlı Zirveler").
- Kayalık tepeler ve yalıyarların zemini ana biyoma uyar: çölde kum, savanda kuru çimen, soğukta karlı çimen (önceden her yerde yeşil çimendi). Kızıl kayalık tepelerinde kızıl kum ağırlıklı, seyrek kuru çimen öbekleri.
- Nehirler: arazinin belirgin biçimde alçaldığı yerlerde su seviyesi yerel araziye iner (yükseltilmiş nehir setleri oluşmaz); göl kıyısına gelen nehir göl seviyesine bağlanır; takımadaların küçük adalarına nehir oyulmaz.
- Göl ve nehir kıyılarında kum (soğukta ve dağlarda çakıl) şeridi oluşur.
- Mangrovlar yalnız kıyıya yakın sıcak bataklıklarda bulunur.
- Biyom ve alt biyom sınırları küçük bir gürültüyle girintili çıkıntılı geçiş yapar (düz çizgi hâlinde değişmez).

## 41.1 (0.41.1): Mağara ağzı aydınlatması, uzak arazi kaldırıldı
- Gökyüzü ışığı artık yalnızca yukarıdan aşağı değil, yanlara ve aşağıya da azalarak yayılır: mağara ağızları, uçurum altı oyukları ve çıkıntı altları zifiri karanlık görünmez; içeri doğru kademeli olarak kararır.
- Uzak arazi (seyrek ızgaralı uzak görünüm) kaldırıldı: arazi yeniden görüş mesafesi kadar tam çizilir, ötesi sisle gizlenir. Ayarlardaki "Uzak arazi" seçeneği kaldırıldı; `js/grafik/uzak-arazi.js` ve `js/dunya/uzak-isci.js` artık kullanılmaz (silinebilir).

## 41.0 (0.41.0): Yeni dünya üreticisi, büyük dünya ve atmosfer
Yeni dünyalar yeni üreticiyle (sürüm 2) kurulur; eski dünyalar eski üreticiyle açılmaya devam eder (dünya kaydında `uretici` alanı; kaydı olmayan dünyalar sürüm 1 sayılır, arazileri değişmez).
- Büyük dünya: yükseklik 128'den 256'ya (eski dünyalarda arazi alttaki 128 blokta kalır), kıta yarıçapı 2600'den 4000'e (çap yaklaşık 8000 blok), dünya sınırı 3600'den 5400'e çıktı. Bulutlar 196 yüksekliğe taşındı; haritada yükseklik ölçeklenir.
- Arazi biçimi: çok katlı sırt gürültüsüyle sivri zirveler ve keskin sırtlar (zirveler 200 yüksekliği aşar), basamaklı vadiler ve uçurumlar, dik kenarlı platolar, engebeli kayalık tepeler, sıcak ve kurak bölgelerde renk katmanlı basamaklı kızıl kayalıklar (mesa), savanda alçak platolar, daha uzun ve derin kanyonlar, doğal taş kemerler, dik yamaçların altında oyuklar ve çıkıntılar. Dik yamaçlarda kaya (taş, granit) görünür.
- Su: dağlardan denize uzanan kıvrımlı nehirler; yüksek arazide su seviyesi basamaklarla iner ve basamaklarda şelale oluşur. Yüksek arazide sabit seviyeli göller (kıyılarında saz, yüzeyinde nilüfer; çok soğukta donar). Kıyılar üç türlüdür: dik yalıyarlar, çakıllı ve kayalık taşlı kıyılar, geniş kumsallar. Kıyı açıklarında takımadalar, açık denizde mantar adaları.
- Biyomlar: çiçekli çayır, sık orman, sonbahar ormanı, kayalık tepeler, karlı zirveler, mangrov, mantar adası, kızıl kayalıklar, göl, taşlı kıyı ve yalıyar alt biyomları eklendi (iklim, hava ve canlılar ana biyoma göredir; konum satırında alt biyomun adı görünür). Çimen, yaprak ve suyun rengi iklime göre (kuru bölgelerde sarımsı, soğukta mavimsi, bataklıkta koyu, sıcak denizde turkuaz) biyom sınırlarında yumuşakça geçiş yaparak değişir.
- Bitki örtüsü: 2 × 2 gövdeli dev meşe ve dev ladin, uzun ladin ve uzun huş, yuvarlak taçlı meşe, sonbahar ağaçları (kızıl, turuncu ve sarı yapraklar), mangrov ağaçları (sudan yükselen kökler), dev kırmızı ve kahverengi mantarlar, çalılar, devrik kütükler (üstünde mantar), yosunlu ve çıplak kayalar, çakıl ve toprak lekeleri, mantar kümeleri, orman açıklıkları, çayırlarda ağaç kümeleri; çiçekli çayırda öbek öbek papatya, lale, lavanta, gelincik ve karahindiba.
- Yeni bloklar: kızıl kum, miselyum, üç renk sonbahar yaprağı, mangrov kütüğü, yaprağı ve kökü, kırmızı ve kahverengi mantar blokları, mantar sapı, kırmızı mantar, papatya, lale, lavanta, saz, devrik kütükler. Mangrov kütüğü kalasa çevrilir ve yakıttır.
- Yeraltı: kıvrımlı tünellere ek olarak derinlerde geniş mağara salonları, yeraltı gölleri ve yeraltı nehirleri, yüzeye açılan mağara ağızları; granit, kireçtaşı ve bazalt kütleleri. Cevherler derinliğe ve biyoma göre dağılır (dağlarda yüksekte kömür ve demir, kayalık tepelerde bakır, kızıl kayalıklarda altın); bazı bölgelerde mağara duvarlarında görünen kalın demir (bazaltla) ve bakır (granitle) damarları bulunur.
- Atmosfer: ormanda ve çayırda gündüz kuş cıvıltıları, gece çekirgeler ve baykuşlar, taygada ve dağlarda gece kurt ulumaları, çölde çöl rüzgârı ve gece çakallar, yükseklerde dağ rüzgârı, kıyıda martılar, nehir kıyısında dere ve şelale yakınında şelale sesi (gerçek kayıtlar; ses/LISANS.md). Bataklık ve mangrovda sis, gece bataklık, orman ve çayırlarda ateş böcekleri, çölde gündüz sıcak hava dalgalanması.
- Biyoma özgü canlılar: mantar adalarında yalnızca inekler bulunur ve yüzeyde canavar doğmaz; çiçekli çayırda at ve tavşan, sonbahar ve sık ormanda domuz ve kurt, kayalık tepelerde koyun; bataklıkta zombilerin bir kısmı boğulmuş zombidir, karlı zirvelerde buz iskeletleri doğar.
- Başarım: Parça üretiminde mağara, taş ve damar gürültüleri 4 blokluk ızgarada örneklenip ara değerlenir; meshleme yalnızca parçanın dolu yüksekliğine kadar yapılır.

## 40.9 (0.40.9): Yeni ana menü arka planı (yüksek çözünürlük)
- Ana menü arka planı yeniden çekildi: önceki görüntü, oyunun otomatik çözünürlük ayarı düşük çözünürlüğe indiği ve uzak parçalar yüklenmeden çekildiği için bulanık ve kısa görüşlüydü.
- Yeni görüntü %100 çözünürlükte, iki kat büyüklükte (5120 × 2560) çekilip yumuşatılarak 3200 × 1600'e küçültüldü; 16 parçalık görüş mesafesindeki bütün parçalar yüklendikten sonra çekildi. Manzara: öğleden sonra ışığında ormanlık bir tepe, arkasında taş bir dağ, sağda deniz ve bloklu bulutlar.
- Kor parçacıkları gündüz manzarasına uygun, havada süzülen polen parçacıklarıyla değiştirildi; koyulaşma da yeni manzaraya göre hafifletildi.

## 40.8 (0.40.8): Yeni ana menü arka planı
- Ana menüdeki "Açık dünya hayatta kalma" yazısı kaldırıldı.
- Ana menünün arka planı yenilendi: CSS bulut ve tepeler yerine oyunun kendi motoruyla çekilmiş gün batımı manzarası (`gorsel/menu-arka.webp`; tepeden denize ve kumsala bakış). Resim yavaşça kayar ve yakınlaşır; okunurluk için üstte ve ortada hafif koyulaşma vardır, alttan kor parçacıkları yükselir. Hareketi azaltma tercihi açık cihazlarda animasyonlar kapanır.
- Dünyalar, çok oyunculu ve ayarlar ekranlarında aynı manzara sabit ve koyulaştırılmış olarak kullanılır.

## 40.7 (0.40.7): Seyrek arı kovanları
- Arı kovanları çok sık çıkıyordu: çayır, orman ve huş ormanındaki meşe ve huşların %7'sinde bulunuyordu. Bu oran %1,2'ye düşürüldü; kovanlar artık yaklaşık altı kat daha seyrek.

## 40.6 (0.40.6): Profesyonel olay kaydı
- Konsoldaki olay kayıtları hizalı sütunlarla yazılır: oyun zamanı (ör. G3 14:20), düzey, tür, olay adı, ayrıntı alanları (ör. `tür Zombi · sebep oyuncu · konum -1403 52 268`) ve tekrar sayısı. Satırın üzerine gelince gerçek saat görünür.
- **Düzeyler:** AYRINTI (canlı doğması, kaldırılması, canlıların aldığı hasar, doğal blok değişimleri), BİLGİ, UYARI (oyuncunun aldığı hasar, fırtına, itibar düşüşü) ve KRİTİK (oyuncu ölümü, Kanlı Ay, boss doğması ve yenilmesi, Ada Bekçisi). Uyarı ve kritik satırlar renkli kenarla ayrılır.
- **Araç çubuğu:** kayıtlarda arama, en düşük düzey seçimi, tür seçimi (açılır listede onay kutuları), toplam olay, uyarı ve kritik sayacı, Duraklat (görünüm kaymaz, kayıt sürer), Temizle ve Dışa aktar (bütün olaylar sekmeyle ayrılmış .log dosyası olarak indirilir).
- Bellekte en çok 5000 olay tutulur; dışa aktarma ekrandan silinmiş eski satırları da içerir.
- `kayit disa` komutu da kaydı dışa aktarır.

## 40.5 (0.40.5): Konsolda dünya olay kaydı
- Geliştirici konsoluna (F8) dünyada olan her şey oyun saatiyle ve renkli türüyle yazılır:
  - **Oyuncu:** alınan hasar ve sebebi, ölüm, yeniden doğma, doğma noktası (yatak) ayarlanması, bulunulan yerin değişmesi (biyom, köy, yeraltı, Lanetli Ada, diyar).
  - **Blok:** kırılan, konan ve değiştirilen her blok, koordinatıyla (çok oyunculuda diğer oyuncuların yaptıkları da).
  - **Canlı:** doğan, ölen (sebebiyle) ve dünyadan kaldırılan canlılar; Ada Bekçisi'nin uyanması.
  - **Savaş:** canlıların aldığı her hasar, kaynağı ve kalan canı.
  - **Eşya:** yerden toplanan eşyalar.
  - **Dünya:** yeni gün, zaman dilimleri, hava değişimi, Kanlı Ay, kadim geçidin açılıp kapanması, diyara geçiş.
  - **Köy:** itibar değişimleri.
  - **Bildirim:** ekranda çıkan bütün bildirimler (üretim, başarım, görev, takas vb.).
  - **Ağ:** sohbet ve sistem mesajları.
  - **Doğal:** sıvı akışı, ekin büyümesi, mevsim ve elektrik kaynaklı blok değişimleri (çok sık olduğu için başta kapalıdır).
- Art arda gelen aynı olay tek satırda sayılır (×n). Konsol yukarı kaydırılıp okunurken yeni olaylar okumayı bölmez.
- Yeni komut: `kayit` (durum), `kayit ac` / `kayit kapat` (tümü), `kayit <tür> ac|kapat`, `kayit temizle`. Seçimler tarayıcıda saklanır.

## 40.4 (0.40.4): Gerçekçi düşme hasarı
- Düşme hasarı yükseklikle hızla artar: 3 bloğa kadar hasar yoktur; 4 blok yaklaşık 1 kalp, 6 blok 2,5 kalp, 8 blok yaklaşık 5 kalp, 10 blok 7 kalp alır; 12 bloktan düşüş tam canlı oyuncuyu öldürür (önceden ölmek için yaklaşık 23 blok gerekiyordu).
- Yumuşak zemin hasarı azaltır: yün, halı, yatak, minder ve saman balyası %80, yapraklar %50, kar %40. Suya düşüş hasarsızdır; tüy düşüşü büyüsü de hasarı azaltmaya devam eder.
- Bacak kırılması 7 bloktan yüksek düşüşlerde yarı olasılıkla, 9 bloktan yüksekte kesin olur.
- Hayvanlar, canavarlar, köylüler ve bosslar da aynı kurala göre düşme hasarı alır (uçan canlılar, deniz canlıları ve süzülerek inen tavuk hariç).

## 40.3 (0.40.3): Doğma noktası yalnızca yatak
- Yeni dünyada oyuna başlanan yer artık doğma noktası değildir. Doğma noktası yalnızca son kullanılan yataktır (köyde konaklamada köylünün kapısı).
- Ölüm ekranında **Yeniden Doğ** her seferinde rastgele, güvenli bir konumda doğurur (düz kara, köy ve özel yapılardan uzak). **Son Kayıt Noktasında Doğ** son kullanılan yatakta doğurur; yatak yoksa pasiftir.
- Ölüm ekranından Ana Menü'ye dönülürse oyun yatakta, yatak yoksa rastgele bir konumda devam eder.
- Eve Dönüş Tılsımı yalnızca son kullanılan yatağa ışınlar; yatak yoksa kullanılamaz ve tükenmez.
- Pusula ve haritadaki yıldız işareti artık yatağı gösterir; başlangıç yeri işaretlenmez.
- Köyde konaklanınca kaydedilen kapı önü noktası ölümde yanlışlıkla iptal ediliyordu; düzeltildi.
- Konsol: `dogum` komutu doğma noktasını (yatak) gösterir, `isinla dogum` yatağa ışınlar.

## 40.2 (0.40.2): Ses denetimi ve düzey dengesi
- Bütün ses kayıtları (292 dosya) tek tek denetlendi; bulunan sorunlar giderildi:
  - Baştaki sessizlik kırpıldı (ör. gök gürültüsü şimşekten 0,5 saniye geç, mağara uğultusu 1 saniye geç başlıyordu).
  - Sondaki uzun sessizlikler kırpıldı (dosyalar kısaldı).
  - Ateş ve lav kayıtlarındaki doğru akım kayması giderildi.
  - Kırpılmış (bozuk) tepeler içeren adım, kapı, vuruş, hasar ve tencere kayıtlarının düzeyi düşürüldü.
  - Kılıç savurma sesi neredeyse duyulmayacak kadar kısıktı; düzeltildi.
- Ses düzeyleri türüne göre doğal bir dengeye getirildi. En yüksekten en düşüğe: patlama ve gök gürültüsü; Kanlı Ay, tılsım, Kül Devi ve Taş Muhafız; canlıların acıma ve ölüm sesleri; vuruş, kazma ve canlı ortam sesleri; kapı, sandık ve köylü; küçük hayvanlar ve yağmur; adım, damla, dalga ve arayüz tıklamaları.
- Aynı anda çok ses çalınca oluşan cızırtıyı önlemek için ana çıkışa sıkıştırıcı eklendi.
- Dalga, lav, mağara, rüzgâr ve meteor gibi uzun kayıtların üst üste binip birikmesi engellendi (sandalla giderken dalga kayıtları üst üste biniyordu).
- Hasar ve büyüleme kayıtlarının üstüne ayrıca çalan sentez sesler kaldırıldı.

## 40.1 (0.40.1): Pencere açılma sesleri
- Envanter, istasyon, harita, başarım, görev ve tarif kitabı gibi pencereler açılırken çalan ses kaldırıldı. Sandık ve tencere açılma sesleri (nesne sesi) korunmuştur.

## 40.0 (0.40.0): Gerçek sesler
- Kodla üretilen seslerin neredeyse tamamı gerçek ses kayıtlarıyla değiştirildi (174 yeni kayıt). Hepsi ücretsizdir; CC0, CC BY, MIT ve yalnızca yağmur döngüsü CC BY-SA lisanslıdır; yazarlar ve kaynaklar `ses/LISANS.md` dosyasındadır.
- **Canlı sesleri:** inek, koyun, domuz, tavuk, tavşan, kurt, köpek, kedi, at, köylü, zombi, boğulmuş zombi, kül zombisi, mumya, iskelet, buz iskeleti, örümcek, yarasa, haydut, balık, ahtapot, köpekbalığı ve kor ruhu; bosslardan Firavun, Buz Büyücüsü, Haydut Reisi, Taş Muhafız ve Kül Devi. Her canlının ayrı ortam, acıma ve ölüm sesi vardır; örümcek, Buz Büyücüsü ve Kül Devi'nin ayrıca saldırı sesi vardır. Türlerin ortak kayıtları perdeyle ayrılır (ör. buz iskeleti daha ince, Kül Devi daha derin).
- **Doğa:** yağmur döngüsü, gök gürültüsü (uzaklığa göre boğuklaşır), rüzgâr, mağarada damla ve lav, deniz dalgası, kürek, diyar mağara uğultusu.
- **Eşya ve eylemler:** eşya toplama, yemek yeme, iksir içme, suya düşme, aletin kırılması, yay ve ok, olta (atma, şamandıra, makara, yakalama), çakmak, ateş, ateş topu, inek sağma, koyun kırkma, yumurtlama, düğme, örs, cam kırılması, savurma.
- **Olaylar:** geçidin açılması ve sönmesi, geçiş, Kanlı Ay, meteorun düşmesi ve patlaması, havai fişek, tılsım, köylüyle takas.
- Müzik kutusu ezgileri gerçek piyano, bas gitar, zil, flüt ve davul kayıtlarıyla çalar.
- Yalnızca kaydı bulunmayan birkaç ince ses (arı vızıltısı, kalp atışı, titreme, kayan yıldız, geçit uğultusu) kodla üretilir. Kayıt yüklenemezse her sesin yerine eski sentez biçimi çalar.

## 39.2 (0.39.2): Kül zombisi lavda yüzer
- Kül zombisi lava düşünce dibe batmaz; yüzeye çıkıp yüzer ve kenara gelince lavdan çıkar.
- Lavdaki ilk 10 saniye hasar almaz; 10 saniyeden uzun kalırsa yanmaya ve hasar almaya başlar. Lavdan çıkınca süre sıfırlanır.

## 39.1 (0.39.1): Hata düzeltmesi
- Eli boşken bir bloğa sağ tıklanınca çıkan "s is null" hatası giderildi.
- Hata kutusu hızlı erişim çubuğunun üstüne binmeyecek şekilde ekranın üst ortasına taşındı.

## 39.0 (0.39.0): Kayıt noktası, Büyülü Anahtar, Kül Devi ve yeni Geliştirici Modu
- **Doğma yeri:** oyuncu ilk girişte ve yeniden doğarken haydut kampı, çöl ve orman tapınağı, buzul kulesi, zindan gibi özel yapıların 200 blok yakınında doğmaz.
- **Ölüm ekranı:** sırasıyla Son Kayıt Noktasında Doğ, Yeniden Doğ ve Ana Menü düğmeleri. Son kullanılan yatak (gündüz tıklansa da) son kayıt noktası olur; kayıt noktası yoksa ya da yatak kırılmışsa düğme görünür ama pasiftir. Yatak kırılınca kayıt noktası iptal edilir ve bildirilir. Dünyanın doğma noktası yatakla değişmez.
- **Büyülü Anahtar:** çakmak artık geçidi yakmaz. Ada Bekçisi öldürülünce iki tek kullanımlık Büyülü Anahtar bırakır; anahtarla geçide sağ tıklanınca geçit açılır ve anahtar harcanır. Lanetli Ada'daki geçit ve diyardaki dönüş kapısı birlikte 30 dakika açık kalır, sonra kapanır; süre dünya kaydında saklanır.
- **Kül Devi:** adayı yalnızca adaya özgü, mutasyon geçirmiş dev bir kül zombisi korur (3 blok boy, 260 can, ateşe bağışık). Saldırıları: yere vuruş (uyarı halkası, sarsıntı ve geri itme), yay çizen magma yağmuru, kül fırtınası (dönerek çekme), hamle ve yarı canda kül zombisi çağırma. Ağır adımlarla yeri sarsar ve kül tozu kaldırır; adadan ayrılamaz.
- Lanetli Ada'ya yaklaşınca ekranın kararması kaldırıldı.
- Magma bloğu ve ışıltaşın (ve diğer küp ışık kaynaklarının) titreyip sallanır gibi görünmesi kaldırıldı.
- **Geliştirici Modu baştan yazıldı:** oyunun pencere temasında; düğme bulutları yerine ayarlar ekranındaki gibi satırlar (başlık, açıklama ve sağda tek denetim). Sekmeler: Oyuncu, Eşyalar, Dünya, Canlılar, Işınlanma, Köy ve Görev, Görünüm, Bilgi.
  - Hazır setler amaca göre yeniden düzenlendi ve her biri envantere sığar: Başlangıç, Madenci, Elmas donanım, Obsidyen donanım, Diyar yolculuğu, İnşaatçı, Ev döşeme, Çiftçi, Aşçı, Denizci ve kâşif, Büyü ve simya, Elektrik.
  - Eşya ver: arama, kategori ve adet seçimi; son verilenler kaldırıldı.
  - Yeni: kadim geçit durumu ve aç / kapat, Ada Bekçisi durumu ve süre sıfırlama, son kayıt noktası bilgisi. Tehlikeli işlemler iki tıkla onaylanır.
- Konsol: `gecit [durum|ac|kapat]` ve `bekci [durum|sifirla]` komutları.

## 38.5 (0.38.5): Çakmak uyarısı
- Çakmakla Lanetli Ada dışında bir yere tıklanınca çıkan "Geçit burada açılamaz" uyarısı kaldırıldı.

## 38.4 (0.38.4): Çapa ve ekim
- Bütün çapalar (demir ve elmas dahil) artık yalnızca tıklanan tek bloğu tarla toprağına çevirir; malzeme yalnızca dayanıklılığı belirler.
- Tohum, fide ve çekirdekler yalnızca çapayla işlenmiş tarla toprağına ekilir; toprak ya da çimene ekilmeye çalışılınca uyarı verilir. Havuç, patates ve soğan çapalanmamış zemine tıklanınca ekilmez, yenir.

## 38.3 (0.38.3): Mobilya görüntü düzeltmesi
- Yemek Masası'nın üstündeki örtü masa yüzeyiyle aynı düzlemde çizildiği için titreşerek bozuk görünüyordu; örtü masa tablasının parçası yapıldı.
- Aynı sorun (üst üste gelen yüzeylerin titreşmesi) bütün çok bloklu ve tek bloklu mobilyalarda genel olarak giderildi: portmantodaki şapka bandı, bahçe cücesinin kemeri, teleskop, pazar tezgâhı ve diğerleri.

## 38.2 (0.38.2): Kaydırma çubukları
- Üretim listesi başta olmak üzere bütün pencerelerdeki tarayıcı varsayılanı beyaz kaydırma çubukları, oyunun koyu temasına uygun ince ve yuvarlak çubuklarla değiştirildi (üzerine gelince turuncu vurgulanır).

## 38.1 (0.38.1): Elde tutma ve işlevsel çakmak
- Envanterdeki karakter önizlemesinde eşya artık yumrukta tutulur: aletler ve silahlar sapından kavranır, ucu ileri ve yukarı bakar; eşya birinci şahıstaki gibi kalınlıklı piksel modeliyle çizilir.
- **Çakmak:** odun yığınını tutuşturup kamp ateşine çevirir; sönük şömineyi yakar; oyma balkabağını balkabağı fenerine çevirir; ot, çalı, sarmaşık ve örümcek ağını 3 × 3 alanda yakarak temizler; buzu eritip suya, karı ve kar katmanını yok eder; canlıları tutuşturur (ateşe dayanıklılar ve köylüler hariç); kadim geçidi yeniden yakar. Kıvılcım sesi eklendi, dayanıklılık 64'ten 128'e çıktı.

## 38.0 (0.38.0): Lanetli Ada ve Ada Bekçisi
- Lanetli Ada artık harita merkezinden ve ana karadan çok uzakta, kıtanın dışındaki ıssız açık okyanusta doğar (merkeze yaklaşık 2950-3300 blok; çevresinde en az 250 blok kara bulunmayan derin deniz). Her dünyada yalnızca bir tane vardır ve Yeraltı Diyarı'nın tek girişi buradaki kadim geçittir.
- Yeni tasarım: daha büyük ada, dik obsidyen ve kül tuğlası yarlar, kül kumu kıyı şeridi, yüzeyde ışıldayan magma çatlakları; ortada 11 × 11 kül tuğlası tapınak avlusu, dört köşede kor mangallı direkler, yıkık duvarlar, iki yanı kor kaideli kadim geçit ve arkasında hazine sandığı; güneyde avludan inen yol, obsidyen iskele ve fenerler; kıyıda eğik obsidyen sivri kayalar, çatallı kurumuş ağaçlar, kızıl mantarlar, örümcek ağları ve iskelet yuvası.
- **Ada Bekçisi:** geçidi rastgele seçilen bir diyar yaratığı (Kor Ruhu ya da Kül Zombisi) korur. Bekçi güçlendirilmiştir (6 kat can, daha fazla hasar, büyük gövde), güneşte yanmaz, boss çubuğunda görünür ve değerli ganimet bırakır.
- Bekçi adaya bağlıdır: kıyıya varınca geri çekilir, suya düşer ya da adadan uzaklaşırsa geçidin önüne döner.
- Bekçi öldürülünce yenisi 30 dakika sonra doğar; kalan süre dünya kaydında saklanır.
- Eski dünyalarda ada yeni konumunda üretilir; eski konumdaki ada parçaları, üzerinde değişiklik yapılmamışsa denize döner.

## 37.0 (0.37.0): 115 yeni eşya ve blok
- **Çok bloklu mobilya ve yapılar (27):** Kanepe (3 blok), İkili Deri Koltuk, Park Bankı, Yemek Masası, Çalışma Masası (çekmeceli, sandık), Gardırop ve Büyük Gardırop (2 blok yüksek, sandık), Dede Saati, Piyano (çalar), Buzdolabı (sandık), Küvet, Çift Kişilik Yatak (2 × 2), Ranza, Uyku Tulumu, Hamak, Bilardo Masası (3 × 2), Ayaklı Lamba, Sokak Lambası (3 blok), Bayrak Direği (4 blok), Su Kuyusu, Pazar Tezgâhı (tenteli, sandık), Bahçe Çardağı (3 × 3 × 3), Şövalye Heykeli, Mermer Çeşme (3 × 3), Boy Aynası, Portmanto, Teleskop.
- **Tek bloklu dekor (29):** Tabure, Bar Taburesi, Yer Minderi, Sallanan Sandalye (oturulur), Daktilo, Gramofon (çalar), Dünya Küresi, Şamdan ve Gaz Lambası (ışık), Kum Saati, Duvar Saati (duvara asılır), Kitap Yığını, Kaktüs, Deve Tabanı, Bonsai, Şemsiyelik, Kapı Paspası, Çöp Kovası, Metal Varil ve Çamaşır Sepeti ve Posta Kutusu (sandık), Kuş Kafesi, Bahçe Cücesi, Lavabo, Dikiş Makinesi, Mangal (pişirme istasyonu), Odun Yığını, Ahşap Tabela, Taş Kesme Tezgâhı (yeni istasyon).
- **Yapı blokları (28) ve çeşitleri (13):** Mermer, Cilalı Mermer, Mermer Tuğla, Mermer Sütun, Granit, Cilalı Granit, Bazalt, Cilalı Bazalt, Kayrak, Kayrak Kiremit, Kireçtaşı, Kerpiç, Eski Tuğla, Çatlak ve Yosunlu Taş Tuğla, Beyaz Fayans, Mozaik Zemin, İznik Çinisi, Ahşap Lambri, Kamış Demeti, Hasır Örgü, Saman Çatı, Demir / Bakır / Paslı Bakır Levha, Cam Tuğla, Altın Süslemeli Taş, Ahşap Kasa; Mermer, Granit, Bazalt, Kayrak ve Eski Tuğla merdiven ve yarım blokları; Mermer Tuğla, Eski Tuğla ve Granit duvarları.
- **Eşyalar (18):** Kağıt, Kitap, Mürekkep, Çivi, Halat, Tuğla; Hançer, Mızrak, Savaş Çekici; Obsidyen Kazma, Balta, Kürek, Kılıç ve Çapa (en güçlü alet seti); Dürbün (sağ tıkla yakınlaştırır), Cep Saati (saati ve mevsimi gösterir), Havai Fişek.
- Tüm mobilya ve dekor gerçek boyutlarında tasarlandı; kurulurken bütün parçaları kapsayan önizleme gösterilir (uygunsa yeşil, değilse kırmızı) ve R tuşu döndürür. Ön yüz oyuncuya bakar. Herhangi bir parçası kırılınca nesnenin tamamı kalkar ve eşyası bir kez düşer; dolaplı olanların içeriği de düşer.
- Kanepe, koltuk, bank, tabure ve sandalyelere oturulur; çift kişilik yatak, ranza, uyku tulumu ve hamakta uyunur.
- Taş Kesme Tezgâhı yeni üretim istasyonudur: mermer, granit, bazalt, kayrak, fayans, mozaik ve çini burada üretilir. Mangal kamp ateşi yerine geçer.
- Blok kimliği üst sınırı 4096'ya çıkarıldı; mevcut kayıtlar etkilenmez.

## 36.1 (0.36.1): Yeni yatak
- Yatak baştan tasarlandı ve iki blok uzunluğunda oldu: koyu ahşap karyola, dört köşe direği, oymalı başlık ve ayaklık, yan kirişler, çizgili döşek, beyaz çarşaf, kabarık yastık, yanlardan ve ayak ucundan sarkan kapitone yorgan.
- Yerleştirirken iki bloğu kaplayan önizleme gösterilir (uygunsa yeşil, değilse kırmızı); R tuşu yatağı döndürür. Ayak hedeflenen yere, baş bakış yönüne konur; iki blok boş yer ve katı zemin gerekir.
- Herhangi bir parçası kırılınca yatağın tamamı kalkar ve bir Yatak düşer.
- Köy evleri, kulübeler, buzul kulesi ve haydut kampı çadırları yeni iki bloklu yataklarla üretilir; eski kayıtlardaki tek bloklu yataklar küçük karyola olarak görünür.

## 36.0 (0.36.0): Mutfak ve yemek etkileri
- **50 yeni eşya ve blok:** 9 malzeme (Un, Tuz, Tereyağı, Kaymak, Hamur, Salça, Pul Biber, Kıyma, Bulgur), 23 yemek ve tatlı, Tarif Defteri ve 17 mutfak bloğu.
- **Mutfak blokları:** Değirmen Taşı (yeni istasyon: un, pul biber, kıyma öğütür), Mutfak Tezgâhı (üretim masası yerine geçer), Tandır (fırın yerine geçer, ısı ve ışık verir), Kiler Dolabı, Turşu Fıçısı ve Piknik Sepeti (sandık), Çilekli Pasta (yere konur, 4 dilimde yenir), Semaver, Ekmek Sepeti, Yemek Tabağı, Fesleğen Saksısı, Sarımsak Örgüsü ve Baharat Rafı (duvara asılır), Kavanozlar, Bal Kavanozu, Un ve Tuz Çuvalı.
- **Yeni yemekler:** Pide, Simit, Börek, Mantı, Lahmacun, Tavuk Sote, Adana Kebap, Balık Ekmek, Hamsi Tava, Kumpir, Bulgur Pilavı, Cacık, Sütlaç, Lokum, Kurabiye, Elmalı Turta, Dondurma, Bitki Çayı, Salep, Turşu, Peynirli Omlet, Kahvaltı Tabağı, Kuzu Tandır. Her yemek bir ya da iki etki verir.
- **Yeni yemek etkileri:** Maden Gücü (kazma ve kesme %35 hızlı), Direnç (alınan hasar %20 az), Şans (cevher ve ganimette fazladan ürün), Hafiflik (düşme hasarı yarıya iner), Odak (deneyim %50 fazla).
- **Aşçılık seviyesi (0-10):** yemek üretildikçe yükselir; her seviye yemek etkilerini %8 uzatır, 3. seviyeden sonra üretimde fazladan ürün olasılığı doğar. Karakter panelinde ve Tarif Defteri ile görülür.
- Su kovası kullanılan tariflerde boş kova geri verilir. Öğretici adımında yanan fırının kimliği düzeltildi.
- Geliştirici penceresine Mutfak ve Etkili yemekler setleri eklendi.

## 35.1 (0.35.1): Köy baskınları kapatıldı
- Köy baskınları şimdilik devre dışıdır (kod korunur; `js/koy/baskin.js` içindeki `BASKIN_ACIK` true yapılınca yeniden açılır). İlgili başarım listeden kaldırıldı.

## 35.0 (0.35.0): Köy uzmanlıkları, baskınlar ve kapsamlı düzeltmeler
- **Köy uzmanlıkları:** her köy tek bir alanda ünlüdür: Tarım köyü, Demirci köyü, Ticaret kasabası, Bilgelik köyü, Çoban obası, Oduncu kampı, Balıkçı limanı. Uzmanlık biyoma uygun seçilir ve köyün binalarını, mesleklerini (yalnızca 2-3 meslek; ticaret kasabasında hepsi), meydan süslerini, fiyatlarını ve köye özgü takaslarını belirler.
  - Önde gelen meslekte alış %30, diğer uzmanlık mesleklerinde %15 ucuz; satışta daha az mal istenir.
  - Köye özgü takaslar başka köylerde bulunmaz (ör. demirci köyünde zincir zırh, bilgelik köyünde tılsım ve büyü masası, çoban obasında kürk kıyafetler, limanda tekne ve dalış takımı).
  - Demirci köyünün demircisi elinizdeki aleti, zırhı ya da kıyafeti sikke karşılığında onarır.
  - Ticaret kasabasında takas hakkı 12'dir ve her köylü her gün değişen iki gezgin tüccar malı satar.
  - Köye girişte, köylü penceresinde, konum göstergesinde ve haritada uzmanlık yazar; köylüler başka köylerin uzmanlıkları hakkında söylenti verir.
- **Köy baskınları:** gece köydeyken baskın olabilir; iki dalga canavar püskürtülürse itibar, sikke ve nadir eşya kazanılır. Kaçılırsa ya da sabah olursa köylüler kaçar ve o gün ticaret yapılmaz.
- **Görev günlüğü:** görevlerin takibi kapatılıp açılabilir (pusula, harita ve göstergede gizlenir).
- **İstasyonlar:** istasyona sağ tıklanınca yalnızca o istasyonun tarifleri listelenir; üstteki istasyon simgelerine tıklanarak filtre değiştirilir. İstasyon menzili 4'ten 6 bloğa çıktı.
- **Fırın:** çalışırken ön yüzünde alev görünür ve ışık verir. Bölge yüklü değilken ya da pencere başka oyuncudayken geçen süre (en çok 15 dakika) telafi edilir.
- **Grafik:** renkli camın içi de renkli görünür; meyve ağacı yapraklarına kar yağar; eldeki Yapı Planı küçültüldü; birinci kişide giyilen üst kıyafet ya da zırh kolda kol ağzı olarak görünür; çöl cüppesinin altındaki pantolon çizilmez.
- **Düzeltmeler:** ekinlerin ara evreleri eşya listesinden gizlendi; Mektup ve Köy Kolisi atılamaz, sandığa konamaz; uyuyunca hava tüm dünyada açılmaz; Yapı Planı dünyayla da kaydedilir; tırpan domates, biber ve çileği sökmez, toplar; kompost her atıkla bir seviye dolar ve doluluk gösterilir.
- **Denge:** giysilerin soğuktan koruma değerleri yaklaşık yarıya indirildi. Kıyafetler yıpranır, örste yün, deri, ip ya da kumaşla onarılır, Kırılmazlık büyüsü alabilir.
- **Tarım:** kışın açıktaki ekinler, yakınında ışık / ısı kaynağı yoksa ara sıra bir evre geriler (don). Hayvanlar yeni ürünlerle de beslenir (mısır, lahana, karpuz, çilek, tohumlar).
- **Yeni içerik:** Kumaş (pamuktan) ve kumaştan kıyafetler; Lahana Sarması, Soğan Çorbası, Mısır Ekmeği, Zeytinyağlı Biber; Vazo (çiçek konur, çiçek alınır); Duvar Rafı artık eşya saklar.
- **Başarımlar:** 14 yeni başarım (köylü seviyeleri, zincir görev, Kahraman itibarı, dört uzmanlık gezme, baskın, tarım, giyim, yapı).
- **Öğretici:** fırın, kıyafet, tarla ve köy ticareti adımları eklendi.

## 34.1 (0.34.1): Düzeltmeler
- Kıyafetin üstüne zırh giyildiğinde parçaların iç içe girmesi giderildi: zırhlar kıyafeti örtecek biçimde biraz daha geniş çizilir; kask giyiliyken başlık kıyafeti gizlenir.
- Karakter bilgisindeki giysi değerleri (soğuktan koruma, serinlik) tek satırda kalır; serinlik değeri alt satıra kaymaz.
- Köy yapılarındaki bozulmaların sebebi: dört yolun köşelerinde iki binanın aynı alana kurulabilmesi; sonradan yazılan bina öncekinin duvarlarını siliyor, iç içe geçmiş yapılar oluşuyordu. Binaların kapladığı alanlar artık denetlenir; çakışan bina kurulmaz. Düzeltme, daha önce keşfedilen köylerde de geçerlidir (oyuncunun değiştirdiği bloklar korunur); bu köylerde bazı binalar ve köylüler değişebilir.

## 34.0 (0.34.0): Tarım
- **Yeni ekinler (4 evre):** Domates, Biber, Mısır, Soğan, Lahana, Pamuk ve Çilek; Karpuz (sap, yanına karpuz verir). Tohumlar uzun ottan düşer, çiftçilerden alınır; soğan kendisiyle ekilir.
- **Ekine özgü mevsim:** her ekinin iyi büyüdüğü mevsim vardır; çoğu kışın büyümez, soğan ve lahana kışın yavaş büyür. Eşya açıklamasında gösterilir.
- **Tekrar hasat:** olgun domates, biber ve çilek sağ tıkla toplanır; bitki 3. evreye döner ve yeniden ürün verir.
- **Meyve ağaçları:** Elma, Kiraz, Portakal ve Zeytin. Çayırlarda elma ve kiraz, savanlarda zeytin ve portakal ağaçları kendiliğinden bulunur (yeni keşfedilen bölgelerde). Meyveli yapraklar sağ tıkla toplanır; meyve mevsimine göre zamanla yeniden olur. Yapraklardan fidan düşer; fidanlar dikilip büyütülür. Çiftçiler Usta ve Üstat seviyesinde fidan satar.
- **Çapa:** demir çapa önüne doğru 3, elmas çapa 3 × 3 blok tarla açar.
- **Ekim:** Shift basılıyken tohum, çevredeki 3 × 3 tarlaya birden ekilir.
- **Biçme:** Demir Tırpan (3 × 3) ve Elmas Tırpan (5 × 5) olgun ekinleri biçer, düşen ya da çantadaki tohumla yeniden eker, otları temizler.
- **Kompost Kutusu ve Gübre:** bitkisel atıklar (tohum, sebze, meyve, yaprak) konunca dolar; dolunca Gübre verir. Gübre, kemik tozu gibi ekinleri ve fidanları hızla büyütür.
- **Yeni yiyecekler:** Menemen (tencere), Çoban Salatası, Közlenmiş Mısır (kamp ateşi), Patlamış Mısır (fırın), Portakal Suyu, Meyve Salatası, Karpuz Dilimi; Zeytinyağı; pamuktan ip.

## 33.0 (0.33.0): İstasyonlar, bölgesel hava, kıyafetler
- **İşleyen istasyonlar:** Fırın ve Kamp Ateşine sağ tıklanınca kendi penceresi açılır (Shift + sağ tık: üretim penceresi). Fırının girdi, yakıt ve çıktı yuvaları vardır; yakıt (kömür, kütük, kalas, çubuk) yandıkça malzemeler partiler hâlinde pişer / erir. Kamp ateşi çiğ yiyecekleri yakıtsız pişirir. İlerleme oku, alev göstergesi ve durum metni gösterilir; oyuncu yanında beklemek zorunda değildir (parça yüklü kaldığı sürece işlem sürer). Kırılınca içindekiler düşer. Diğer istasyonların tarifleri yine üretim penceresinden yapılır.
- **Bölgesel hava:** hava artık tüm dünyada aynı değildir; rüzgârla sürüklenen, büyüyüp dağılan yağış ve fırtına alanları vardır. Bir yerde güneşliyken birkaç yüz blok ötede yağmur ya da fırtına olabilir; yağış alanının kenarında yağmur perdesi uzaktan görünür. Konsoldaki `hava` komutu her yerde geçerli, süreli bir hava ayarlar.
- **Yağış görünümü ve başarım:** yağmur ve kar kameranın çevresindeki dar bir alan yerine geniş bir alana (uzak perde katmanıyla) yağar. Parçacıklar tamamen ekran kartında hareket eder; karlı bölgelerdeki kare hızı düşüşü giderildi.
- **Ağaçlar** yalnızca fırtınada sallanır (otlar ve çiçekler hafif rüzgârda salınmaya devam eder).
- **Kıyafetler:** envantere zırh yuvalarına ek olarak 4 kıyafet yuvası (başlık, üst, alt, ayakkabı) eklendi; kıyafetler zırhın altına giyilir. Karakter artık yalnızca donla başlar.
  - Yeni kıyafetler: Yün Bere, Hasır Şapka, Kürk Başlık, Keten Gömlek, Yün Kazak, Deri Ceket, Kürklü Mont, Çöl Cüppesi, Keten Pantolon, Yün Pantolon, Kürklü Pantolon, Şort, Sandalet, Deri Ayakkabı, Kürklü Çizme (üretim penceresinde yeni **Giyim** kategorisi).
  - **Isı etkileri:** her kıyafetin ve zırhın soğuktan koruma, serinlik ve sıcakta ek ısınma değerleri vardır. Soğukta kalın giysiler korur; çıplak beden daha çok üşür. Sıcakta (ör. çölde) kalın giysiler ve metal zırhlar ısıtır, keten, hasır ve çöl cüppesi serinletir. Değerler eşya açıklamasında ve karakter bilgisinde görünür.
- **Yeni zırhlar (farklı görünümlü):** Zincir (başlıklı örgü, uzun zırh gömleği), Altın (taçlı, kakmalı), Kürk (kalın, çok sıcak tutan) ve Obsidyen (boynuzlu, mor ışıklı, en dayanıklı).
- Kıyafetler ve zırhlar envanter önizlemesinde ve çok oyunculuda diğer oyuncuların üzerinde görünür; birinci kişide kol, giyilen üst kıyafetin ya da göğüs zırhının rengini alır.

## 32.0 (0.32.0): Köylüler, ticaret ve görevler
- **Köylü seviyeleri:** köylüler takas ve görevlerle deneyim kazanır; Çırak → Kalfa (12) → Usta (36) → Üstat (80). Her seviyede mesleğe özgü yeni ve daha değerli takaslar açılır (ör. üstat demirci elmas göğüslük ve kılıç, üstat şifacı Eve Dönüş Tılsımı satar).
- **Yeni meslekler:** Mimar (yapı ve dekorasyon blokları, Yapı Planı, avize, şömine), Kütüphaneci (kitaplık, mum, kristal, büyü masası, iksir, tılsım), Çoban (yün, boya, halı, perde, sancak, makas, yatak) ve Aşçı (ekmek, çorba, kek, baklava, tencere). Köylerin evlerindeki köylülerin bir kısmı bu mesleklere geçer; her köyde her yeni meslekten en çok bir tane bulunur.
- **Arz ve talep:** çok alınan eşya pahalanır, çok satılan eşya için daha fazla mal istenir (en çok %60); fark her sabah yarıya iner. Her köylünün bir **günün fırsatı** (%25 indirim) ve her köyün bir **ihtiyacı** (istenen mal %35 az, ek deneyim) vardır.
- **Yeni ticaret penceresi:** meslek simgesi, köylünün seviyesi ve deneyim çubuğu, itibar kademesi ve ayrıcalıkları; iki sütunlu takas kartları (stok çubuğu, fiyat değişimi, fırsat ve ihtiyaç rozetleri, kilitli takaslar ve açılma koşulu), Shift + Takas ile toplu takas, çantadan satılabilecek eşyalar.
- **Yeni görev türleri:** Teslimat (süreli koli; süre dolarsa iptal ve itibar kaybı), Keşif (özel yapı, batık gemi ya da Lanetli Ada bulma), Koruma (köyün içinde canavar avlama), İnşaat (köye çit, meşale, fener ya da saksı koyma).
- **Zincir görevler (Tanıdık itibarında):** Kayıp Kervan, Köyün Feneri, Hasat Bayramı ve Eski Tapınağın Sırrı; 3 adımlı, hikâyeli, son adımda büyük ödüllü.
- **Görev ödülleri:** zorluk yıldızı (1-3), deneyim, yıldıza göre nadir eşya; ek hedef: görev kabul edildiği gün tamamlanırsa +%50 sikke ve +2 itibar.
- **İtibar kademeleri:** Güvenilmez, Mesafeli, Yabancı, Tanıdık (zincir görevler), Dost (özel takas, köyde konaklama: doğma noktası köye ayarlanır, gece ise uyunur), Kahraman (en çok %40 indirim, köylülerden günlük hediye).
- **Konuşmalar:** gün saatine, yağış ve kara, itibar kademesine göre değişen sözler; köylüler yakındaki yapılar hakkında söylenti verir (yön ve uzaklıkla).
- Pusula, harita, görev günlüğü (J) ve görev izleyici yeni görev türlerini gösterir. Yeni eşya: Köy Kolisi.

## 31.0 (0.31.0): Yapı ve Dekorasyon
- **Altyapı:** doku atlası 16 x 16'dan 32 x 32 döşemeye (512 piksel), blok kimlik sınırı 1024'ten 2048'e çıkarıldı. Eski kayıtlar değişmeden açılır.
- **Yeni yapı blokları:** Akasya Kalası (akasya kütüğünden), Cilalı Taş (fırında taştan), Parke Zemin (hasır örgü), Kareli Zemin (siyah-beyaz karo).
- **Merdiven ve yarım blok:** Ladin, Huş, Akasya, Taş, Kesme Taş, Yosunlu Parke Taş, Kiremit, Kül Tuğlası, Cilalı Taş ve Beton için. Merdivenler bir bloğun alt yüzüne ya da yan yüzün üst yarısına konunca ters (tavana yaslanan) olur; eski Meşe, Parke Taş, Taş Tuğla, Kum Taşı ve Buz Tuğla merdivenleri de ters konabilir.
- **Duvarlar:** Parke Taş, Taş Tuğla, Yosunlu Parke Taş, Kiremit, Kül Tuğlası, Kum Taşı, Cilalı Taş ve Taş. Komşu duvarlara, dolu bloklara, cam bölmelere ve çit kapılarına bağlanır; düz sıralarda direksiz, köşelerde direkli görünür.
- **Çitler:** Ladin, Huş ve Akasya Çit; tüm ahşap çitler birbirine bağlanır.
- **Renkli bloklar:** 7 renk Renkli Cam ve Renkli Cam Bölme, 8 renk Pişmiş Kil (kil fırında pişirilir) ve 8 renk Beton (kum ve çakıldan). Yeni Beyaz Boya kemik tozundan yapılır.
- **Boyama:** eldeki boyayla sağ tıklanan yün, halı, cam, cam bölme, pişmiş kil, beton, perde ve sancak o renge boyanır (beyaz boya beyaza / doğal rengine döndürür).
- **Mobilya ve süs:** Duvar Rafı (kitaplı), Perde (8 renk; sağ tıkla açılır / kapanır), Avize (tavana asılır, çok parlak), Şömine (sağ tıkla yakılır / söndürülür; yanarken ışık, ısı, kıvılcım), Dolap (27 yuvalı saklama), Sehpa, Çiçekli Vazo, Mum, Sancak (8 renk, duvara asılır).
- **Yapı Planı:** elde tutulurken iki köşeye sağ tıklanınca aradaki yapı (en çok 32 x 32 x 32) kopyalanır; ardından bakılan yerde yeşil çerçeveyle önizlenir, R ile döndürülür, sağ tıkla kurulur. Kurulum için gereken bloklar çantadan harcanır (geliştirici modunda harcanmaz), eksik malzeme listelenir; dolu hücreler atlanır. C + sağ tık planı temizler. Plan tarayıcıda saklandığından başka dünyalarda da kullanılır.
- Üretim penceresine **Yapı** kategorisi, geliştirici penceresine "Yapı ve dekorasyon" seti eklendi.

## 30.7 (0.30.7): Değiştirilebilir tuşlar, dünya kartı düzeltmesi
- Ayarlar > Kontroller: 22 eylemin tuşu değiştirilebilir (Hareket, Eylemler, Pencereler, Diğer). Tuşa tıklanıp yeni tuşa basılır; Esc vazgeçer, sağ tık varsayılana döndürür; başka eylemdeki tuş seçilirse iki eylemin tuşları yer değiştirir. "Varsayılan tuşlar" düğmesi; değiştirilmiş eylemler işaretlenir. Esc, 1-9 ve fare düğmeleri sabittir. Dokunmatik kontroller de atanmış tuşları kullanır.
- Dünyalar ekranı: "Sil" düğmesi "Onayla"ya dönünce alt satıra kayıp kartı bozuyordu; düğmeler tek satırda ve sabit genişlikte. "Önceki oturum" düğmesinin kalan kodu da kaldırıldı.

## 30.6 (0.30.6): Lanetli Ada, Kor Ruhu dengesi, çimen ve balkabağı
- **Lanetli Ada:** Yeraltı Diyarı'nın dünyadaki tek girişi. Issız Deniz'in (başlangıçtan 900-2600 blok uzakta, çevresi en az 50 blok açık deniz olan derin bir nokta) ortasında, kül kumu, kor taşı, obsidyen ve kül tuğlasından küçük, karanlık bir ada: ortada yanan kadim geçit, kıyıda obsidyen sivri kayalar, kurumuş ağaçlar, örümcek ağları, iskelet yuvası ve bir sandık. Her dünyada bir tanedir; konumu tohumdan belirlenir. Yaklaştıkça ekran kararır ve uğultu duyulur.
- Çakmakla başka yerde geçit açılamaz; çakmak yalnızca adadaki geçidi (ya da diyardaki karşılığını) çerçevesi bozulup sönerse yeniden yakar. Bütün geçitler ada ile diyardaki karşılığı arasında işler (eski kayıtlardaki geçitler de).
- "Geçit Bekçisi" başarımı: Lanetli Ada'ya ayak basmak. Konsola `isinla ada`, geliştirici penceresine "Lanetli Ada" düğmesi eklendi.
- **Kor Ruhu zayıflatıldı:** can 14, ateş topu hasarı 3 (yakma 2 sn), seride iki ateş topu ve seriler arası 5-7 sn, ilk atıştan önce 1,5 sn uyarı, ateş topu yavaşladı (kaçınılabilir), görüş 24 blok, tek tek doğar; diyarda yakında en çok 2 kor ruhu bulunur ve doğanların çoğu Kül Zombisidir.
- Çimenli toprağın üstündeki beyaz, pembe ve sarı çiçek pikselleri kaldırıldı.
- Balkabağı tarlaları daha seyrek ve küçük.

## 30.5 (0.30.5): Akan su, kapı arkası saldırı, güvenli yeniden doğma
- **Akan su:** kaynak su tükenmez; altı boşsa aşağı düşer (şelale), altı katıysa yanlara 7 bloğa kadar yayılır, her adımda seviyesi azalır ve yüzeyi eğimli görünür. Kaynağı kesilen akan su çekilir; iki kaynak arasındaki akan su kaynağa dönüşür. Akış yolundaki ot ve çiçekleri siler; lava değince lav obsidyene (kaynak su) ya da parke taşa (akan su) döner. Akan su oyuncuyu akış yönüne sürükler. Uçurum ve mağara ağızlarındaki küp biçimli eski sular da akmaya başlar. Akan su kovayla alınamaz. Tek oyunculuda ve sunucuda işlenir.
- Kazılan blok artık kendiliğinden su kaynağına dönüşmez; açılan boşluğu akış doldurur.
- **Düzeltme:** canavarlar kapalı kapının, çitin, camın ya da duvarın arkasından yakın saldırı yapamaz (saldırı yolunda engel aranır).
- **Yeniden doğma:** doğma noktasının 24 blok çevresindeki canavarlar kaldırılır, öfkeli hayvanlar sakinleşir; doğduktan sonra 5 saniye hasar alınmaz (çok oyunculuda da).
- Geliştirici konsolu sessiz açılıp kapanır.
- Dünyalar ekranındaki "Önceki oturum" düğmesi kaldırıldı.

## 30.4 (0.30.4): Bilgi baloncukları, sandık ekranı, dünya ayarları
- Üretim penceresindeki istasyon simgelerinin ve kategori sekmelerinin üzerine gelince bilgi baloncuğu açılır (istasyonun adı ve yakında olup olmadığı; kategorideki tarif ve yapılabilir sayısı). Sandık işlem düğmelerinde de baloncuk vardır.
- Dünya ayarları (zorluk, denge, vücut ısısı, geliştirici konsolu) dünya oluşturulduktan sonra değiştirilemez; duraklatma menüsündeki Dünya Ayarları kaldırıldı.
- "Nasıl Oynanır" ekranı ana menüden ve duraklatma menüsünden kaldırıldı (ayrıntılı rehber sonra hazırlanacak).
- Geliştirici penceresi, Işınlanma sekmesi: yeni "Yeraltı Diyarı" bölümü: Diyara geç / Dünyaya dön ve En yakın Kül Kalesi. Konsola `isinla kale` eklendi (dünyadayken 8:1 oranlı konuma en yakın kale).
- Sandık ekranı yeniden tasarlandı: simgeli başlık (çeşit ve eşya sayısı), doluluk çubuğu, çerçeveli 27 yuvalık ızgara, simgeli işlem düğmeleri, cihaz haznelerinde kural notu ve "İçindekiler" özeti (eşya başına toplam; tıklanan eşyanın tamamı çantaya alınır).

## 30.3 (0.30.3): Envanter ve üretim hata düzeltmeleri
- Kategoriler arası geçiş takılıyordu: açık envanter her karede rastgele (saniyede birkaç kez) baştan çiziliyor, tıklanan düğme fare basılıyken yerinden sökülüyordu. Pencere artık yarım saniyede bir yenilenir ve yalnızca içeriği değişen bölümler yeniden kurulur.
- Üretim ayrıntısındaki "tarif ›", "Bununla yapılanlar" ve "Son üretilenler" düğmeleri ile Tarif Kitabı'ndaki tarif bağlantıları ekran geçişi sanılıp bütün ekranları gizleyebiliyordu; düzeltildi.
- Miktar kutusuna yazarken odak kaybolmaz; arama kutusu dışına tıklanınca ya da Enter / Esc ile odak bırakılır, Q ve diğer kısayollar yeniden çalışır.

## 30.2 (0.30.2): Üretim üst bölümü yeniden tasarlandı
- Başlık altında "yapılabilir tarif" özeti; istasyonlar simgeyle gösterilir (yakındakiler yeşil işaretli, çalışan elektrikli ocak turuncu).
- Büyüteç simgeli arama çubuğu, Öneri / A–Z / Adet sıralama düğmeleri ve anahtar biçiminde "Yapılabilenler" süzgeci.
- Kategori sekmeleri tek sıralık simgeli şeride dönüştü (simge, kısa ad, köşede yapılabilir sayısı).

## 30.1 (0.30.1): Üretim paneli
- Araç çubuğu: tarif ya da malzeme adıyla arama, sıralama (önerilen, ad, yapılabilir miktar), "Yapılabilenler" süzgeci.
- Sekmelerde yapılabilir tarif sayısı; yeni "Favoriler" sekmesi (favoriler tarayıcıda saklanır).
- Sade liste: malzeme simgeleri ve sayıları, eksik istasyon uyarısı, kaç kez yapılabileceği; Üret düğmesine Shift + tık olabildiğince çok üretir.
- Ayrıntı paneli: büyük simge, kategori ve çantadaki sayı, istasyon durumu, eşya özellikleri (hasar, dayanım, zırh, besin vb.), seçilen miktara göre malzeme tablosu, eksik malzemenin tarifine geçiş, miktar seçici (−, +, En çok), "Üret × N", "Takip et", "Bununla yapılanlar" ve "Son üretilenler" kısayolları.

## 30. aşama (0.30.0): Envanter ekranı ve canlı karakter önizlemesi
- Karakter bölümü: dikey zırh yuvaları, ortada canlı 3B karakter önizlemesi, yanında durum paneli.
- Önizleme: giyilen zırhlar karakterin üzerinde malzeme rengiyle görünür (büyülü zırh parıldar; dalış maskesi ve palet kendine özgü), eldeki eşya sağ elde durur. Kafa ve gövde fare imlecini izler (Minecraft gibi); önizleme sürüklenerek döndürülür, çift tıkla öne döner. Pencere kapalıyken çizim durur.
- Durum paneli: can, açlık, seviye, zırh (hasar azaltma), vücut ısısı (durumuyla), su altında oksijen ve etkin iksirler (kalan süreyle); pencere açıkken canlı güncellenir.
- Eşya arama (uyan yuvalar vurgulanır), çanta doluluğu, bölüm başlıkları.
- Kısayollar: imleç bir yuvanın üzerindeyken 1-9 çubuktaki yuvayla değiştirir, X bir tane, Shift + X yığını atar; çift tık aynı eşyaları imleçteki yığında toplar.

## 29.2 (0.29.2): Ana menü ekranları
- Dünyalar ekranı genişletildi: dünya sayısı, üstte Yeni Dünya ve Yedekten Yükle, ad ya da tohuma göre arama, sıralama (son oynanan, ad, gün, oluşturma) ve iki sütunlu dünya kartları (renkli simge, zorluk ve kural rozetleri, gün, son oynama, tıklanınca kopyalanan tohum).
- Yeni Dünya ekranı iki sütunlu geniş düzene geçti: Dünya (ad, tohum, rastgele tohum düğmesi), açıklamalı zorluk kartları, Kurallar ve her zaman görünen Denge bölümü. Dar ekranlarda tek sütuna iner.

## 29.1 (0.29.1): Dünya ayarları ve ayar düzeltmeleri
- Vücut ısısı ve geliştirici konsolu (F8) artık dünya ayarıdır: dünya oluşturulurken seçilir (vücut ısısı açık, konsol kapalı başlar), sonradan Dünya Ayarları'ndan değiştirilir. "Komutlara izin ver" yalnızca konsol açıkken seçilebilir. Eski dünyalarda önceki genel ayar geçerlidir.
- Düzeltme: "Bakılan nesnenin adını göster", "Mini haritayı göster" ve "Öğretici ipuçları" ilk açılışta çalıştığı hâlde seçili görünmüyordu.
- Düzeltme: "Varsayılanlara dön" mobil cihaz bilgisini siliyor ve öğretici seçimini sıfırlamıyordu; grafik ön ayarı açılışta işaretlenmiyordu; fare hassasiyeti ondalık virgülle gösterilir.

## 29. aşama (0.29.0): Ocak ve ısıtıcı tasarımı, taret cephanesi, Rust tarzı kablo kontrolleri, kategorili ayarlar
- Elektrikli Ocak: fırın bölmeli mutfak ocağı (ocak gözlü tabla, düğme şeridi, camlı fırın kapağı); yönlüdür. Pişirme haznesi vardır: çalışırken içine konan çiğ yiyecekleri ve fırın malzemelerini 5 saniyede bir parti pişirir (kömür gerekmez). Yakınındayken fırın ve kamp ateşi yerine geçmeye devam eder.
- Isıtıcı: ayaklı panel radyatör; çalışırken ön ızgarası kızarır. Ocak ve ısıtıcının bağlantı noktaları arka altta.
- Otomatik Taret: arbalet başlı yeni tasarım (çatal, kundak, yaylar, kiriş, yüklü ok, ok şarjörü, ok sandığı). Oklar sınırsız değildir: ok haznesi sağ tıkla elle doldurulur, her atış 1 ok harcar. Durum lambası (ışık saçmaz): tehlikede kırmızı, aksi hâlde yeşil, güçsüzken sönük.
- Taret, konulduğu yönün iki yanına 90° (toplam 180°) tarar; bu alan dışındaki tehditleri görmez. Arkadan gelen tehdit görüş alanına girince ya da 2 bloğa kadar yaklaşınca sezilir.
- Hazne kuralları: jeneratöre yalnızca yakıt, tarete yalnızca ok, ocağa yalnızca pişirilebilen malzeme konur (sandık ekranında ve sunucuda).
- Kablo kontrolleri (Rust tarzı): elde kablo varken sol tık yerleştirir (başla, ara nokta, bağla), sağ tık son ara noktayı geri alır (yoksa iptal eder); kabloya sağ tık söker. Kablo eldeyken blok kırılmaz.
- Bağlantı noktaları elde kablo yokken renksiz, koyu gri metal soket olarak görünür.
- Hata düzeltmesi: geliştirici penceresinde hava durumu düğmelerinin hemen üstündeki "Zaman hızı" kaydırıcısına yanlışlıkla tıklanınca zaman 100 kata kadar hızlanıyordu. Kaydırıcı yerine 0 / 1 / 2 / 5 / 10 / 30 / 60× düğmeleri konuldu; zaman durdurma artık çalışıyor; zaman hızı 1× değilken saat göstergesinde uyarı görünür.
- Ayarlar kategorilere ayrıldı (Görüntü, Ses, Kontroller, Arayüz, Oynanış). Yeni ayarlar: parlaklık, arayüz boyutu, arka planda sesi kapatma, elektrikli cihaz bilgi paneli; "Varsayılanlara dön".

## 28. aşama (0.28.0): Jeneratör, otomatik taret, hareket algılayıcı, sulama fıskiyesi
- **Yakıtlı Jeneratör:** kızaklı motor, yakıt tankı, egzoz ve kontrol paneli. Sağ tık yakıt deposunu (sandık) açar; kömür 40, kütük 15, kalas 4, çubuk 1 saniye yanar. Çıkışına talep varken en çok 20 E/sn üretir ve yakıt harcar (talep yokken yakıt korunur); çalışırken egzozdan duman çıkar ve paneldeki ışık yeşil yanar. Bilgi panelinde kalan yakıt süresi görünür.
- **Otomatik Taret (giriş + geçiş çıkışı, 8 E/sn):** çalışırken 16 blok içinde görüş hattındaki en yakın canavara ya da öfkeli hayvana döner, namluyu eğer ve 0,8 saniyede bir ok atar (4 hasar). Oyunculara, evcil hayvanlara ve köylülere ateş etmez; hedef yokken yavaşça tarar, gücü kesilince namlusu aşağı eğilir. Çok oyunculuda ateşi sunucu yapar.
- **Hareket Algılayıcı (0,5 E/sn):** duvara ya da ayağıyla zemine konur. 7 blok içinde canlı varken gücü çıkışına geçirir ve algılayıcı başı kırmızı yanar. Sağ tık kipi değiştirir: herkes / yalnızca oyuncular / yalnızca canavarlar. Örnek: hareketle yanan lamba, yaklaşan canavarda çalışan taret.
- **Sulama Fıskiyesi (2 E/sn):** çalışırken 2 saniyede bir 9 × 9 alandaki kuru tarlaları ıslatır ve ekinlerin büyümesini hızlandırır; çevresine su serper.
- Tarifler Üretim Masasında (Elektrik kategorisi); Geliştirici Modu elektrik seti yeni cihazları içerir.

## 27. aşama (0.27.0): Giriş / çıkış noktaları, yönlü güç akışı, kablo sarkması
- **Bağlantı noktaları:** her elektrikli cihazın ayrı giriş (mavi) ve çıkış (turuncu) soketleri vardır; dolu soketin ortası koyudur. Üreticilerde yalnızca çıkış; bataryada giriş (şarj) ve çıkış; şalter, lamba, ocak ve ısıtıcıda giriş ve geçiş çıkışı bulunur. Her sokete tek kablo takılır.
- **Yeni bloklar:** Dağıtıcı (1 giriş, 3 çıkış; gücü bağlı cihazların talebine göre böler) ve Birleştirici (2 giriş, 1 çıkış; güçleri toplar).
- **Yönlü güç akışı (Rust gibi):** güç yalnızca kablolarla, çıkıştan girişe akar; yan yana duran cihazlar artık birbirine bağlı sayılmaz. Talep çıkışlardan geriye hesaplanır; üretici üretimini verir, batarya talep kadar (en çok çıkış hızı: küçük 10, orta 25, büyük 60 E/sn) verir ve girişinden aynı hızla şarj olur. Tüketici gelen güç yeterliyse çalışır ve artanı geçiş çıkışına verir; yetmezse söner. Şalter açıkken geçirir. Kablonun her bloğu taşıdığı gücü %0,1 azaltır.
- **Kablo çekme:** kablo, bakılan sokete sağ tıklanarak başlar ve karşı türden boş bir sokete sağ tıklanarak biter (çıkıştan ya da girişten başlanabilir). Bakılan soket çerçeveyle vurgulanır, adı ve türü altta yazar.
  - Kablo çekilirken varsayılan olarak gergin ve düzdür. **Shift + fare tekerleği** çekilen parçanın sarkmasını 0,1 blok adımlarla ayarlar (0 ile 3 blok); her parçanın sarkması ayrı saklanır.
  - **Shift basılı tutulurken** eklenen ara nokta son noktadan eksen boyunca hizalanır: düz yatay ya da dikey kablo çekilir.
- **Bilgi paneli:** cihazın girişine gelen ve çıkışından verilen güç, talep, bağlı soket sayısı; bataryada şarj ve boşalma hızı; durum (Çalışıyor, Enerji yetersiz, Şarj ediliyor, Boşalıyor, Dolu, Bağlı değil…).
- 0.26.0 kabloları yüklenirken uçlarının boş çıkış ve giriş soketlerine bağlanır; eski yer kabloları artık iletmez (kırılınca kablo verir).

## 26. aşama (0.26.0): Gerçekçi şalter, lamba ve bataryalar; Rust tarzı kablolar
- **Şalter:** metal pano: ön kapak (yıldırım uyarı etiketi), gösterge ışığı (açıkken yeşil, kapalıyken kırmızı) ve sağda yukarı (açık) / aşağı (kapalı) inen kırmızı uçlu kol. Duvara ya da ayağıyla zemine konur; zemindeki şalter R ile çevrilir. Kablolar alttan girer.
- **Elektrikli Lamba:** konulduğu yüzeye göre biçim alır: zeminde ayaklı cam küre, tavanda kordonla sarkan emaye abajur, duvarda aplik. Yanınca camı aydınlanır.
- **Bataryalar:** Küçük batarya akü biçimindedir (kapak, kırmızı ve gri kutup başları, taşıma kulpu, tehlike şeridi); Orta batarya ev tipi duvar bataryası (etiket, havalandırma ızgaraları, üst bağlantı kutusu); Büyük batarya iki kapaklı endüstriyel dolap (havalandırmalar, etiketler, kulplar, tehlike şeridi, üst fan). Doluluk, ayrı ayrı yanan LED bölmeleriyle gösterilir (yeşil, düşükken sarı, çok düşükken kırmızı).
- **Kablolar (Rust tarzı):** Elektrik Kablosu artık bir araçtır. Bir cihaza sağ tıklanınca kablo onun bağlantı noktasından çekilmeye başlar; yüzeylere sağ tıklanarak ara tutturma noktaları eklenir; başka bir cihaza sağ tıklanınca bağlanır. Kablo, noktalar arasında sarkarak çizilir; çekilirken önizleme (uygunsa yeşil, değilse kırmızı) ve altta uzunluk, harcanacak kablo ve kısayollar görünür.
  - Sınırlar: bir parça en çok 16, bütün kablo en çok 40 blok; bir cihaza en çok 6 kablo; her 3 blok için 1 Elektrik Kablosu harcanır; kablonun her bloğu üretimi %0,1 azaltır.
  - R çekmeyi iptal eder. Elde kablo varken bakılan kablo turuncu vurgulanır; sağ tık onu söker. C + sağ tık bir cihazın bütün kablolarını söker. Sökülen kablolar envantere geri döner; ucundaki cihaz kırılan kablo kopar ve kabloları yere düşer.
  - Elde kablo varken şaltere sağ tık şalteri çevirmez, kablo çeker.
  - Kablolar dünya kaydına yazılır; çok oyunculuda sunucu tutar ve bütün oyunculara dağıtır.
- 0.24.0'ın küp şalteri ve yer kablosu eski kayıtlarda çalışmaya devam eder; kırılınca yeni eşyalar düşer.

## 25. aşama (0.25.0): Gerçek boyutlu cihazlar, yerleştirme önizlemesi, Geliştirici Modu işlevleri
- **Çok bloklu cihazlar** (cihazlar.js): üreticiler ve bataryalar gerçek boyutlarındadır; her hücre ayrı bir bloktur, görünüşü ve dönen parçaları ayrı bir modelle çizilir (grafik/cihaz-cizici.js).
  - Güneş Paneli 2 × 1: ayaklar üstünde öne eğik panel; en çok 10 E/sn, gölgede kalan hücre oranında azalır.
  - Rüzgâr Türbini 2 × 2 taban, 8 blok yükseklik: beton taban, daralan kule, gövde ve 7 blok çaplı üç kanatlı pervane. En çok 30 E/sn; pervane üretime göre hızlanır. Pervanenin döndüğü alana katı blok konamaz; alan kapanırsa türbin durur.
  - Su Çarkı 3 × 3: ayaklar, mil, jeneratör ve dönen kepçeli çark; alt sırasına değen her su bloğu için 1,5 E/sn (en çok 16), kışın yarı yarıya. Suyun içine ya da kıyısına kurulur.
  - Bataryalar: Küçük 1 × 1, Orta 1 × 1 × 2, Büyük 2 × 1 × 2; önlerindeki ışıklı gösterge doluluğu gösterir (çok oyunculuda sunucudan gelir).
  - Herhangi bir hücre kırılınca bütün cihaz kalkar ve eşyası düşer; seçim çerçevesi bütün cihazı sarar.
  - Cihazların üstüne blok konmaz; zemin katı ve düz olmalı, cihazın kaplayacağı alan boş olmalıdır.
- **Yerleştirme önizlemesi ve R tuşu:** elde cihaz ya da yönlü blok (merdiven, sandalye, koltuk, kapı, tuzak kapı, çit kapısı, ters çevirici, geciktirici, kovan, oyma balkabağı) varken konulacağı yer yarı saydam gösterilir: uygunsa yeşil, değilse kırmızı. R tuşu yönü 90° çevirir. Ayarlardan kapatılabilir.
- 0.24.0'ın tek bloklu üretici ve bataryaları "Eski Elektrik Bloğu" olur; kırılınca yeni cihazın eşyasını verir.
- **Geliştirici Modu işlevleri:**
  - Denetçi (sağ panel): bakılan blok (kimlik, konum, sertlik, alet, eşyası, elektrik ağı) ya da canlı (can, tür, konum, uzaklık); hızlı işlemler: eşyasını ver, kır, konumu kopyala; canlıyı iyileştir, öldür, kaldır, bir tane daha doğur.
  - Kenara yaslama: pencere sağa yaslanır, oyun görünür kalır; sekmeler simge çubuğuna dönüşür.
  - İşlem geçmişi: çalıştırılan komutlar ve sonuçları saatleriyle listelenir; her komut tek tıkla tekrar çalıştırılır.
  - Arama: sonuçlarda ↑ ↓ ile gezinilir, Enter seçili işlemi çalıştırır; sekme adı da aranır. Alt + 1-9 sekmeler arasında geçer.
  - Durum kayıtları (Oyuncu sekmesi): konum, bakış, can, açlık, envanter, zaman ve hava üç kayıt yuvasına alınır ve geri yüklenir.
  - Eşya verme: özel adet (1-999), son verilen eşyalar, Mekanik ve Elektrik kategorileri; bakılan cihazın eşyası doğru verilir.

## 24. aşama (0.24.0): Elektrik sistemi ve yeni Geliştirici Modu
- **Elektrik ağı:** elektrikli bloklar birbirine bitişik olunca aynı ağı oluşturur; uzaktaki cihazlar Elektrik Kablosuyla bağlanır. Ağ her 0,5 saniyede hesaplanır. Birimler: üretim ve tüketim E/sn, depo E.
- **Üreticiler:** Güneş Paneli (gündüz en çok 5 E/sn; üstü açık olmalı, bulut ve yağış azaltır), Rüzgâr Türbini (en çok 12 E/sn; yükseklik, rüzgâr ve fırtınayla artar, pervanesi döner), Su Türbini (yanındaki her su bloğu için 2 E/sn, en çok 8; kışın yarı yarıya; çarkı döner).
- **Bataryalar:** Küçük (1.500 E), Orta (6.000 E), Büyük (24.000 E). Artan enerji bataryalara eşit doluluk oranıyla dağıtılır; yan yüzdeki gösterge doluluğu gösterir. Kırılan bataryanın enerjisi kaybolur.
- **İletim:** Elektrik Kablosu (her kablo üretimi %0,2 azaltır, en çok %25). Şalter ağı açar / keser; sağ tıkla ya da kol ve bakır tel sinyaliyle kullanılır.
- **Tüketiciler:** Elektrikli Lamba (0,5 E/sn), Elektrikli Ocak (4 E/sn; çalışırken fırın ve kamp ateşi yerine geçer, bu tariflerde kömür harcanmaz), Isıtıcı (3 E/sn; çevresini ısıtır). Enerji yetmezse ağdaki tüm tüketiciler söner.
- **Bilgi paneli:** elektrikli bir bloğa bakılınca sol altta cihazın ve ağın üretimi, tüketimi, deposu ve durumu (çalışıyor, şarj ediliyor, enerji yetersiz) görünür.
- **Yapım:** Devre Kartı ve Bakır Bobin yeni ara malzemelerdir; bütün tarifler Üretim Masasındadır (tarif listesinde "Elektrik" kategorisi).
- Çok oyunculuda ağlar sunucuda hesaplanır; istemci bilgi panelinin verisini sunucudan alır.
- **Geliştirici Modu penceresi yenilendi:** sol kenar çubuğunda simgeli sekmeler ve kısayollar, üstte sekme başlığı, genel arama ve dünya rozeti, ölçü kutucuklarından oluşan canlı şerit (konum, biyom, zaman, kare hızı, can, vücut ısısı), kart düzeninde bölümler, alt durum çubuğu. Yeni **Elektrik** sekmesi: bakılan ağın durumu, yüklü ağların toplamı, bataryaları doldurma / boşaltma, elektrik seti.

## 23.3 (0.23.3): Tek özel yapı
- Çöl Tapınağı, Orman Tapınağı, Buzul Kulesi ve Haydut Kampı artık dünyada yalnızca birer tane bulunur: her tür için dünyanın merkezine en yakın uygun yer seçilir. Uygun biyom yoksa o yapı o dünyada bulunmaz. `isinla tapinak | ormantapinak | kule | kamp` komutu bu tek yapıya götürür.
- Eski dünyalarda fazladan yapılar kaybolur; oyuncunun değiştirdiği bloklar yerinde kalır. Keşif haritası yeniden keşfedilir.

## 23.2 (0.23.2): Canlı can çubuğu
- Bakılan ya da vurulan canlının üstte görünen can çubuğu sadeleştirildi: kutu ve kalın çerçeve kaldırıldı; ince, yuvarlak köşeli bir çubuk ve gölgeli küçük ad kaldı. Dost canlılarda yeşil, düşmanlarda kırmızıdır; alınan hasar açık renkli bir iz olarak kısa bir gecikmeyle erir.

## 23.1 (0.23.1): Bakılan nesnenin adı
- Bakılan bloğun adı ekranın üstünden sol alt köşeye taşındı; yalnızca ad gösterilir (açıklama satırı kaldırıldı), küçük ve yarı saydamdır. Dokunmatik kipte sol alttaki kol yüzünden üst ortada gösterilir. Ayarlardan kapatılabilir.

## 23. aşama (0.23.0): Sorun giderme ve büyük iyileştirme

**Bildirilen sorunlar**
- **Ateş ve meşale animasyonu:** kamp ateşi ve meşale alevi saniyede 8 kare titrer; lav yavaşça akar, magma nabız gibi parlar. Kamp ateşinden kıvılcım ve duman, meşalelerden ara sıra kıvılcım yükselir.
- **Soluk yer eşyaları:** yere düşen eşyaların dokusu doğru renk uzayında işaretlenmediği için soluk görünüyordu. Eşyalar artık düz resim yerine üç boyutlu çizilir (küp bloklar küçük küp, diğerleri kalınlaştırılmış model), yavaşça döner.
- **Elde tutulan eşyalar:** aletler sapından kavranmış duruşta; vuruşta çapraz savurma, blok ve eşyalarda öne itme, eşya değiştirirken aşağı inip kalkma, yemek yerken ağza götürme, nefes salınımı ve koşarken daha belirgin sallanma eklendi.
- **Geliştirici Modu:** tekrar eden bölümler kaldırıldı (Işınlanma sekmesindeki harita işaretleri, Harita sekmesindeki mini harita anahtarı, Eşyalar sekmesindeki başarımlar, Köy sekmesindeki ticaret). Yeni "Hayatta Kalma" sekmesi (hasar ve durumlar, vücut ısısı kaydırıcısı, gök olayları, başarımlar), "★ Sık kullanılan" sekmesi (her düğme ve anahtar sağ tıkla sabitlenir), tüm sekmelerde arama (Ctrl + F) ve konum, biyom, saat, kare hızı, can ve vücut ısısını gösteren canlı bilgi şeridi eklendi.
- **Köylü sayısı:** her binada en çok bir köylü; demirci ve balıkçı her zaman bulunur; köye göre toplam 4-7 köylü.
- **Belirsiz nesneler:** bakılan bloğun adı sol alt köşede, küçük ve yarı saydam yazılır (0.23.1). Üretim Masası yeniden çizildi: üstte 3×3 üretim ızgarası, yanlarda çekiç, testere, kerpeten ve gönye. Üç haneli renk kodlarının yanlış çözülmesi giderildi (üretim masasındaki ve ana kayadaki kırmızı lekeler bu hatadandı).
- **Ölüm:** karakter yere yığılır: kamera yere iner ve yana devrilir, görüntü kızarıp kararır, ölüm ekranı 1,8 saniye sonra açılır. Ölüyken yerdeki eşyalar oyuncuya çekilmez (eski sürümde ölüm ekranında eşyalar geri toplanıyordu). Eşyalar mezar taşında saklanır. Çok oyunculuda ölen oyuncu diğerlerinin ekranında yere devrilir.

**Zorluk ve denge**
- Yeni dünya oluşturulurken Kolay, Normal, Zor ya da Hardcore seçilir:

| Zorluk | Canavar hasarı | Açlık hızı | Canavar sayısı | Kanama olasılığı | Soğuk/sıcak hasarı |
|---|---|---|---|---|---|
| Kolay | ×0,6 | ×0,7 | ×0,6 | ×0,5 | Yok |
| Normal | ×1 | ×1 | ×1 | ×1 | Var |
| Zor | ×1,4 | ×1,25 | ×1,35 | ×1,5 | Var |
| Hardcore | Zor ile aynı, tek can | | | | |

- Denge ayarları: Kanlı Ay sıklığı (kapalı, 3, 5, 7, 10, 14 günde bir), meteor sıklığı (kapalı, az, normal, sık), vücut ısısı değişim hızı (yavaş, normal, hızlı).
- Duraklatma menüsündeki **Dünya Ayarları** ile sonradan değiştirilir (Hardcore'a geçilemez, Hardcore'dan çıkılamaz). Çok oyunculuda sunucunun ayarları geçerlidir ve değişiklik istemcilere iletilir.
- Hardcore: ölünce dünya sona erer; "İzleyici Olarak Dolaş" ile uçarak ve duvarlardan geçerek dolaşılır, hiçbir şeye dokunulamaz. Dünya yeniden açılınca da izleyici kipinde açılır. Dünyalar listesinde Hardcore dünyalar işaretlenir.

**Görsel kalite**
- Rüzgâr: otlar, çiçekler, ekinler ve fidanlar ile yapraklar rüzgârda salınır; yağmurda ve fırtınada salınım güçlenir.
- Su yüzeyi dalgalanır.
- Canlıların altında yumuşak gölge (yükseldikçe küçülür; geceleri soluklaşır).
- Koşarken ayak tozu; ateşlerden kıvılcım ve duman.
- Fotoğraf modu: F1 göstergeleri ve eli gizler, F2 ekran görüntüsünü kaydeder.
- Grafik ön ayarları (Düşük, Orta, Yüksek, Ultra): görüş mesafesi ve çizim çözünürlüğünü birlikte ayarlar.

**Arayüz**
- Envanterde "Sırala": çantadaki yığınlar birleşir; aletler, zırhlar, yiyecekler, malzemeler ve bloklar sırayla dizilir.
- Sandıkta "Tümünü al", "Çantayı boşalt", "Benzerlerini koy" ve "Sırala" düğmeleri (mezar taşında da çalışır).
- Ayrıntılı ipuçları: iksir ve yemek etkisi, ışık düzeyi, aletin kazabildiği madenler, renkli dayanım çubuğu, yığın bilgisi.
- Öğretici: yeni dünyada 7 adımlık rehber (hareket, odun, üretim masası, ilk alet, meşale, yemek, ilk gece); adım tamamlanınca kendiliğinden geçer. Ayarlardan kapatılabilir.

**Çok oyunculu**
- Sohbet komutları: /f <ad> <mesaj> (özel mesaj), /oyuncular, /konum, /ben <eylem>, /zar, /yardim; sunucu /at <ad> ile ya da duraklatma menüsündeki düğmeyle oyuncu çıkarabilir.
- Bağlantı beklenmedik biçimde koparsa 5 saniye sonra kendiliğinden yeniden bağlanılır (en çok 3 deneme); "Yeniden Bağlan" düğmesi de bulunur. Oyuncu bilgileri sunucuda saklandığından kalınan yerden devam edilir.

**Kalıcılık**
- Dünyalar listesinde "Yedekle": dünya, sıkıştırılmış tek bir dosya (.hmdunya) olarak indirilir. "Yedekten Yükle" dosyayı yeni bir dünya olarak ekler.
- Her açılışta dünyanın bir önceki hâli ayrıca saklanır; "Önceki oturum" düğmesiyle (iki tıkla onaylanarak) o hâle dönülür.

**Diğer düzeltmeler**
- Ölüm animasyonu ve ölüm ekranı süresi gerçek zamana göre ölçülür.
- Gök Taşı demir kazma gerektirir (önceki sürümde taş kazma yetiyordu; yardım metni demir diyordu).

**Bu sürümde yapılmayanlar:** gerçek gölge haritası (dinamik gölge yerine canlı gölgeleri eklendi), uzak parçalarda düşük ayrıntılı çizim, takım ve oyuncular arası ticaret sistemi. Dünya üretimi ve parça çizimi (meshleme) zaten arka plan işçilerinde (Web Worker) yapılmaktadır.

## 22. aşama (0.22.0): Büyük hayatta kalma güncellemesi

**Vücut ısısı**
- Sağ alttaki gösterge vücut sıcaklığını (°C), eğilimini (▲ ▼) ve hissedilen hava sıcaklığını gösterir.
- Hissedilen sıcaklık; biyom, mevsim, gün saati (çölde geceler çok soğuk), yükseklik, mağara derinliği, yağış ve kar, suda olma ve ıslaklık (sudan çıktıktan sonra 40 saniye), çatı altı ve ısı kaynaklarından hesaplanır.
- Isı kaynakları: kamp ateşi, meşale, lav, magma, fener, balkabağı feneri, ışıltaş, yıldız feneri, gök taşı; buz feneri ve buz kristali soğutur.
- Deri zırh parça başına 3, diğer zırhlar 1 derece yalıtım sağlar. Sıcak çorbalar 150 saniye **Isınma**, ayran 150 saniye **Serinlik** etkisi verir; ateşe dayanıklılık iksiri sıcağı keser.
- 36 °C altında **üşüme** (titreme, açlık hızlanır, ekran kenarı buzlanır), 34,5 °C altında **donma** (yavaşlama, can kaybı); 38 °C üstünde **bunalma**, 39,5 °C üstünde **sıcak çarpması** (can kaybı).
- Ayarlar › Vücut ısısı ile kapatılabilir. Geliştirici konsolu: `isi [derece]`.

**Yaralanma**
- Zombi, kurt, örümcek, haydut, mumya, köpekbalığı ve bossların saldırıları kanatabilir (zırh olasılığı azaltır): 40 saniye boyunca 4 saniyede bir 1 can; can 1 kalbin altına düşmez. Bandaj ya da şifa iksiri durdurur.
- 6 kalp ve üstü düşüş hasarı bacağı kırabilir (9 ve üstünde kesin): 3 dakika yavaş yürünür, koşulamaz. **Atel** (3 çubuk, 1 ip) sarılınca kemik 30 saniyede kaynar ve yavaşlık azalır.
- Hasarın geldiği yön ekranın ortasında kırmızı bir yayla gösterilir.

**Mezar taşı**
- Ölünce eşyalar yere saçılmaz; ölüm yerindeki mezar taşında (27 yuva; fazlası için yanına ikinci mezar) saklanır. Lavda ya da suda ölünürse mezar ilk güvenli yere konur.
- Pusuladaki ✖ mezarı gösterir; mezara sağ tıklanarak eşyalar alınır, boşalan mezar kaybolur. Çok oyunculuda da çalışır.
- Ölüm ekranında bu hayatın süresi, en uzun hayat ve yenilen canavar sayısı yazar.

**Kanlı Ay**
- Her mevsimin son gecesi (7, 14, 21... gün) ay kızarır, gökyüzü ve sis kızıla döner; akşamdan önce uyarı ve korna sesi duyulur.
- Canavarlar iki kat kalabalık ve sık doğar, %50 fazla canlı ve 1 fazla hasarlıdır, kızıl görünür; meşaleler 6 blok içinde korur. Uyunamaz; boss müziği çalar.
- Kanlı Ay canavarları iki kat ganimet ve deneyim, %6 olasılıkla yıldız parçası bırakır. Sabaha kadar hayatta kalana 25 deneyim ve başarım verilir.

**Gök olayları**
- Açık gecelerde yıldız kayar; bazı geceler **yıldız yağmuru** olur (bildirilir).
- **Meteor**: açık gecelerin bir kısmında (yıldız yağmurunda çoğunda) 35-80 blok uzağa ateş topu düşer: uğultu, çarpma sesi, sarsıntı ve parlama. Krater açar; dibinde **Gök Taşı** (demir kazma; 1-2 Yıldız Parçası) ve magma bulunur. Düşüş yeri pusulada 15 dakika ✦ ile gösterilir. Köylere düşmez.
- **Kuzey ışıkları**: karlı biyomlarda, dağlarda, çok yüksekte ve kışın açık gecelerde kuzey göğünde dalgalanır.
- **Eve Dönüş Tılsımı** (3 yıldız parçası, 2 altın külçe, 1 ip; 8 kullanım): sağ tık 3 saniye basılı tutulup kımıldanmazsa doğma noktasına ışınlar (diyarda çalışmaz). **Yıldız Feneri** (4 yıldız parçası, cam): ışık düzeyi 15.
- Geliştirici konsolu: `kanliay`, `meteor`.

**İstatistikler**: oynama süresi, bu hayat, en uzun hayat, ölüm, yenilen canavar, yürünen yol, kırılan ve konulan blok, yenen yemek, atlatılan Kanlı Ay, görülen meteor, alınan hasar. Başarımlar penceresinin (L) başında gösterilir.

**Başarımlar** (“Hayatta Kalma”): Kızıl Gece, Ay Avcısı, Gökten Gelen, Eve Dönüş, Kutup Işıkları, Ateş Başında, İlk Yardım, Sağlam Adım, Geri Dönüş, Ölümsüz Gibi.

**Hata düzeltmeleri ve iyileştirmeler**
- Köy verisi olmayan köylü (örneğin konsolla doğurulan) canlı güncellemesini durduruyordu; düzeltildi.
- Kare hızı göstergesi 20'nin altını gösteremiyordu (yavaş cihazlarda yanlış değer); gerçek süreyle ölçülür.
- Ayar kaydındaki geçersiz değerler (örneğin 4'ten küçük görüş mesafesi) dünyanın yüklenmesini engelliyordu; değerler geçerli aralığa çekilir.
- Doku ve simge çiziminde tuvalden piksel geri okuması kaldırıldı (daha hızlı açılış, tarayıcı uyarıları giderildi).
- Süt kovası kanamayı ve kırığı iyileştirmez (yalnızca zehir ve olumsuz etkiler).
- Gece bulutları gökyüzünün tonunu alır; gri lekeler görünmez.
- Sistemli tarama: 482 eşya simgesi, 218 tarif, 334 blok, 29 canlı türü, tüm konsol komutları, pencereler ve kayıt/yükleme sınandı.

## 21. aşama (0.21.0): Tarım ve hayvancılık

**Yeni ekinler**
- **Balkabağı:** çayır ve ormanlarda küçük öbekler hâlinde bulunur. Balkabağından 4 çekirdek elde edilir; çekirdek tarlaya ekilir, olgunlaşan sap yanındaki boş toprağa ya da çimene balkabağı verir (sap kalır, yeniden ürün verir). Makasla oyulan balkabağı bakılan yöne yüz çizer; oyma balkabağı ile meşaleden ışık düzeyi 15 olan **Balkabağı Feneri** yapılır.
- **Şeker kamışı:** su kenarlarında yetişir; yalnızca suya komşu kum, toprak ya da çimene ya da başka bir kamışın üstüne dikilir, 3 boya kadar uzar. Kamıştan şeker elde edilir.

**Hayvancılık**
- **Kova** (3 demir külçe, Üretim Masası): su kaynağından su alır (kaynak tükenmez), inekten süt sağar. Su kovası suyu koyar; lava değen su lavı obsidyene çevirir.
- **Süt Kovası** içilince zehir, örümcek zehri ve olumsuz etkiler geçer; kova geri kalır.
- **Makas** (2 demir külçe): koyunu kırkar (1-3 yün; yün 2-4 dakikada yeniden uzar, kırkılmış koyun daha ince görünür), balkabağını oyar, kovandan petek alır. Örste demirle onarılır.
- **Tavuklar** 5-10 dakikada bir yumurtlar.

**Arıcılık**
- Çayır, orman ve huş ormanlarındaki meşe ve huş ağaçlarının gövdesine **arı kovanları** asılıdır. Gündüz ve yağmur yokken her kovandan en çok 3 arı çıkar.
- Arılar kovanın 10 blok çevresindeki çiçeklere (gelincik, karahindiba, peygamber çiçeği) konar, polen toplayınca kovana döner; her dönüş kovanın bal düzeyini 1 artırır (en çok 5). Dolu kovanın ön yüzünde bal görünür.
- Dolu kovandan cam şişeyle **Bal Şişesi** (zehri giderir), makasla 3 **Bal Peteği** alınır. Kovanın 5 blok altında kamp ateşi yoksa çevredeki arılar 25 saniye boyunca kızar ve sokar (zehirler). Kovan kırılınca da arılar kızar.
- **Arı Kovanı** 6 kalas ve 3 bal peteğiyle üretilir.

**Yeni yiyecekler** (kaplar geri verilir)
- Tencere: Peynir (süt kovası), Yoğurt (süt kovası, 2 kase; yenilenme), Omlet (2 yumurta, peynir; güç), Haşlanmış Yumurta.
- El ile: Ayran (yoğurt, 2 cam şişe; hız).
- Üretim Masası: Kek (süt kovası, 2 şeker, yumurta, 3 buğday; tokluk).
- Fırın: Balkabağı Turtası (balkabağı, şeker, yumurta), Baklava (3 buğday, bal şişesi, şeker; hız).

**Başarımlar** (“Çiftlik”): Su Taşıyıcı, Taze Süt, Kırkım Zamanı, Gece Feneri, Tatlı Kazanç, Çiftlik Mutfağı.

**Teknik**
- Dünya üretimi değiştiğinden keşif haritası önbelleği yenilenir. Kırkılmış koyun ve arılar çok oyunculuda da görünür.

## 20. aşama (0.20.0): Bilinen eksiklerin giderilmesi

- **Geciktirici** (3 taş, bakır tel, 2 meşale; Üretim Masası, Mekanik): arkasından gelen gücü önüne 1-4 adım (0,1-0,4 saniye) gecikmeyle geçirir, gücü tersine çevirmez. Sağ tıklanınca gecikme bir adım artar (4'ten sonra 1'e döner); arkadaki uç gecikmeye göre kayar. Çıkışı, konulurken bakılan yöndedir. Ters çevirici ile birlikte kurulan saat devrelerinin hızı artık ayarlanabilir; arka arkaya geciktiriciler uzun gecikmeler verir.
- **Bakır tel görünümü:** bir basamak yukarıdaki tele, yandaki bloğun yüzünden tırmanan dikey bir iz çizilir; aşağıdaki tele uzanan kol da gösterilir. Güç iletimi değişmedi.
- **Mevsime göre gün uzunluğu:** bir günün toplam süresi aynı kalır; yazın gündüz %62,5, kışın %37,5 sürer, ilkbahar ve sonbaharda gece ile gündüz eşittir. Çok oyunculuda istemci de aynı hızla ilerler.
- **Diyar Geçidi dokusu** artık boşluksuzdur; geçidin arkası görünmez.
- **Dokunmatik çanta:** yuvaya kısa dokunuş eşyayı alır ya da bırakır (sol tık); basılı tutma (0,4 saniye) yığını ikiye böler ya da taşınan yığından bir tane bırakır (sağ tık). Destekleyen cihazlarda kısa titreşim verilir.
- **Geliştirici konsolu:** `diyar` komutu dünya ile Yeraltı Diyarı arasında geçirir (karşı tarafta 8:1 oranlı konuma; yakında geçit yoksa kurulur). `isinla` komutu diyardayken diyarın sınırlarını kullanır.

## 19. aşama (0.19.0): Gerçek sesler ve müzik, dokunmatik kontroller, performans

**Ses efektleri (gerçek kayıtlar)**
- Kenney ses paketlerinden (Impact Sounds, RPG Audio, Interface Sounds, Music Jingles; CC0) 118 kayıt `ses/efekt` klasöründedir.
- Adımlar zemine göre (çimen ve toprak, taş, ahşap, kar, kum ve yün), kazma, kırma ve koyma bloğun türüne göre (taş, ahşap, toprak, cam), vuruş, hasar, kapı açılıp kapanma, sandık gıcırtısı, para (takas), kumaş (zırh giyme), kitap (Tarif Kitabı ve görev günlüğü), tencere, kol, metal kırılması, arayüz tıklamaları ve pencereler, başarım, görev, seviye atlama, büyüleme ve ölüm ezgileri gerçek kayıtlardır.
- Her ses birkaç değişkeden rastgele seçilir ve perdesi hafifçe oynatılır; böylece tekrar eden sesler mekanik duyulmaz.
- Kayıtlar arka planda yüklenir; yüklenene kadar ya da yüklenemezse aynı ses Web Audio ile üretilir.
- Hayvan, canavar, yağmur, gök gürültüsü, rüzgâr, su, lav, büyü, geçit ve mekanik blok sesleri oyun içinde üretilmeye devam eder.

**Müzik**
- Tanner Helland'ın (CC BY 4.0) dokuz parçası `ses/muzik` klasöründedir: gündüz (The Forest Awakes, Familiar Roads), gece (A Memory Away, From Here), mağara (Deeper), çöl ve savan (King of the Desert), Yeraltı Diyarı (Dark Knight), boss savaşı (Retribution), ana menü (Daybreak).
- Oyunda müzik sürekli çalmaz: bir parça bitince 1-3 dakika sessizlik olur, ardından o anki duruma uyan parça yavaşça açılır. Boss savaşında ve Yeraltı Diyarı'nda kendi parçası hemen başlar ve döner; durumdan çıkınca yavaşça susar.
- Parçalar akış hâlinde çalınır (belleğe tümüyle yüklenmez); sekme gizlenince müzik duraklar.
- Ayarlar'a ayrı **Müzik düzeyi** kaydırıcısı eklendi. Lisanslar `ses/LISANS.md` dosyasında ve Nasıl Oynanır › Emeği geçenler bölümündedir.

**Dokunmatik kontroller**
- Telefon ve tabletlerde kendiliğinden açılır (Ayarlar › Dokunmatik kontroller ile açılıp kapatılır).
- Sol altta sanal kol: yürüme; sonuna kadar ileri itilince koşu. Ekranın geri kalanında parmak kaydırılarak bakılır (iki parmak aynı anda kullanılabilir).
- Ekrana kısa dokunma kullanır ya da blok koyar; parmağı basılı tutma kırar ve saldırır.
- Sağ altta Kır, Kullan, Eğil ve Zıpla; sol üstte Çanta, Etkileşim (E), At, Harita, Kitap ve Duraklat düğmeleri. Alt çubuktaki yuvalara dokunarak eşya seçilir.
- Oyuna girişte tam ekran ve yatay yön denenir; dikey tutulunca yatay çevirme uyarısı gösterilir. Mini harita, saat ve etkiler küçük ekranlara göre yerleşir.

**Performans**
- **Çözünürlük** ayarı: Otomatik, %50, %67, %85, %100. Otomatikte kare hızı 2 saniye boyunca 45'in altında kalırsa çizim çözünürlüğü düşer, 57'nin üstüne çıkınca yeniden yükselir.
- En yakın ışık kaynakları listesi önbelleğe alındı: oyuncu kımıldamadıkça ve ışıklar değişmedikçe yeniden sıralanmaz (Yeraltı Diyarı'nın lav denizi binlerce ışık kaynağı içerir).
- Telefon ve tabletlerde ilk açılışta görüş mesafesi en çok 5 parça olarak başlar.

## 18. aşama (0.18.0): Mevsimler ve Yeraltı Diyarı

**Mevsimler**
- Yıl 28 gündür; her mevsim 7 gün sürer: İlkbahar, Yaz, Sonbahar, Kış. Saatin yanında mevsim ve mevsimin kaçıncı günü olduğu yazar; mevsim değişince bildirilir.
- Çimen, yaprak ve otların renkleri mevsimle değişir: ilkbaharda taze yeşil ve meşe ile huş yapraklarında çiçekler; sonbaharda turuncu, kızıl ve sarı yapraklar; kışın solgun çimen ve seyrek, kurumuş yapraklar.
- **Kış:** çöl ve savan dışında yağış kar olarak düşer; açıktaki zemin ve ağaçlar karla örtülür (yağışta daha hızlı), göl ve nehirlerin yüzeyi donar. Karlı olmayan bölgelerde kar ve buz ilkbaharla birlikte erir. Mevsimlik kar ve buz kayıt dosyasını büyütmez.
- **Ekin ve fidan büyümesi:** ilkbaharda 1,4 kat, yazın 1,15 kat, sonbaharda 0,85 kat, kışın 0,25 kat.
- İlkbaharda çimenlerin üstünde yer yer gelincik ve karahindiba açar.

**Yeraltı Diyarı**
- **Obsidyen:** derin mağaralardaki lav göllerinin yüzeyinde kabuklar hâlinde bulunur; elmas kazmayla kazılır. Demirci köylüsü de sikke karşılığında satar.
- **Çakmak** (demir külçe + çakmaktaşı): obsidyenden kurulan dikdörtgen bir çerçevenin (iç kısmı en az 2 × 3, en çok 21 × 21; köşeler gerekmez) içine sağ tıklanınca mor **Diyar Geçidi** açılır. Çerçeveden bir blok kırılınca geçit söner.
- Geçidin içinde 2,5 saniye durulunca diyara geçilir. Diyardaki 1 blok dünyadaki 8 bloğa karşılık gelir; dönüşte de aynı oranla dünyaya çıkılır. Varılan yerin 20 blok çevresinde bir geçit varsa ona çıkılır; yoksa obsidyen platformlu yeni bir geçit kurulur.
- Diyar, tabanı ve tavanı ana kayayla kapalı dev mağaralardan oluşur: kor taşı, 31. katmana kadar uzanan lav denizi, tavandan sarkan **Işıltaş** kümeleri, ayakları yavaşlatan **Kül Kumu** düzlükleri, eğilmeden üstünde durulunca yakan **Magma** kıyıları, **Kızıl Mantar** ve **Kor Cevheri** (demir kazmayla; Kor Kristali verir).
- Kızıl sis, sıcak ve loş ortam ışığı, uğultu ve lav sesleri vardır; gökyüzü, hava durumu ve mini harita yoktur. Diyarda uyunamaz.
- **Kül Kalesi:** lav denizinin üstünde, kül tuğlasından burç; dört yöne uzanan, ışıltaş fenerli ve sütunlu köprüler, köprü uçlarında gözetleme kuleleri, parmaklıklı pencereler, mazgallı dam, köşe kuleleri. Burcun ortasında bir Kor Ruhu yuvası ve ganimet sandıkları (kor kristali, ışıltaş tozu, altın, elmas, obsidyen, iksir, elmas eşyalar, Kor Kılıcı) bulunur.
- **Canavarlar:** Kor Ruhu (süzülür, art arda üç ateş topu atar, isabet edeni tutuşturur, kendi ışığıyla parlar) ve Kül Zombisi (vuruşu tutuşturur). İkisi de ateşe ve lava dayanıklıdır; diyarda gece gündüz doğarlar.
- **Yeni tarifler:** Işıltaş (4 ışıltaş tozu), Kül Tuğlası (kor taşı, Fırın), Oymalı Kül Tuğlası, Kor Kılıcı (3 kor kristali, elmas, çubuk; vurulan canlıyı tutuşturur), Ateşe Dayanıklılık İksiri (kor kristaliyle, Simya Masası).
- **Başarımlar** (“Diyar ve Mevsimler”): Geçit Bekçisi, Ateşin Eşiği, Kül Kalesi, Ruh Avcısı, Işık Toplayıcı, Ateşle Oynamak, Dört Mevsim.

**Teknik**
- Blok kimlikleri 16 bite genişletildi (yeni bloklar 512'den başlar); eski kayıtlar sorunsuz açılır.
- Kendi ışığıyla parlayan bloklar (geçit, ışıltaş, magma) karanlıkta da parlak çizilir. Bakır lamba ve ışıltaş gibi küp biçimli ışık blokları artık altındaki blok kırılınca düşmez ve tam blok olarak seçilir.
- Dünya üretimi değiştiğinden keşif haritası önbelleği yenilenir.

## 17. aşama (0.17.0): Mekanik bloklar ve Tarif Kitabı

**Güç kaynakları** (Üretim Masası, yeni “Mekanik” sekmesi)
- **Kol** (çubuk + parke taş): sağ tık ya da E ile açılıp kapanır.
- **Düğme** (taş): basılınca bir saniye güç verir, sonra kendiliğinden kalkar.
- **Basınç Plakası** (2 kalas): üstünde oyuncu ya da canlı durdukça güç verir.
- **Işık Algılayıcı** (3 cam, 3 kalas, bakır külçe): gündüz, üstü açıkken güç verir.

**İletim**
- **Bakır Tel** (1 bakır külçeden 8): gücü 15 bloğa kadar taşır; yanlardaki tellere bağlanır, bir blok yukarı ve aşağı basamaklanır. Güçlüyken parlak turuncu görünür. Katı bir bloğun üstüne konur.
- Kaynağın ve telin altındaki katı blok da güç alır; bu blokların yanındaki makineler çalışır.
- **Ters Çevirici** (3 taş, 2 tel, meşale): arkasından güç gelmezse önüne güç verir; çıkışı koyarken bakılan yöndedir. Bir adım gecikmeyle çalışır: arka arkaya iki tane geciktirici, kendi arkasına bağlanan tel halkası **saat devresi** olur.

**Güçle çalışanlar**
- **Bakır Lamba** (4 bakır külçe, cam, meşale): güç aldıkça yanar (en parlak ışık).
- **Kapı, çit kapısı, tuzak kapı:** güç gelince açılır, gidince kapanır; yalnızca güç değiştiğinde etkilenir, elle de kullanılabilir.
- **Ok Atıcı:** güç geldiği anda, gücün geldiği yönün tersine ok atar.
- **Müzik Kutusu** (8 kalas, bakır tel): güç gelince ya da sağ tıklanınca ezgi çalar. Çalgı altındaki bloğa göre değişir: ahşap ve diğerleri piyano, taş bas, cam ve buz zil, yün flüt, kum, çakıl, toprak ve kil davul.
- Devreler tek oyunculuda ve sunucuda hesaplanır; blok değişiklikleri bütün oyunculara iletilir. Basınç plakaları bütün oyuncuları algılar.

**Tarif Kitabı (B)**
- Bütün eşyalar arama kutusu ve sekmelerle (Aletler, Savaş, Bloklar, Malzemeler, Yiyecek, Mobilya, Mekanik, Doğada) süzülür. Malzemesi envanterde olan eşyalar yeşil noktayla işaretlenir.
- Seçilen eşyanın tarifleri (istasyonu, envanterdeki malzeme durumu ve kaç kez yapılabileceği), **kullanıldığı tarifler** (tıklanınca o eşyaya geçilir, geri düğmesiyle dönülür), **nereden bulunduğu** (kırılan bloklar, canavar ve hayvan düşüşleri, köylü takasları, olta) ve yiyecek, alet ve zırh bilgileri gösterilir.
- Kitap açılınca eldeki eşya seçili gelir.
- **Takip et:** seçilen tarifin malzemeleri ekranın solunda envanterle birlikte güncellenir; hepsi tamamlanınca “Hazır” yazar. Takip ayarlarla saklanır.

## 16. aşama (0.16.0): Evcil hayvanlar, binekler, yemek pişirme, mobilyalar

**Evcil hayvanlar**
- **Köpek:** Kurda kemik verilir; her denemede yaklaşık üçte bir olasılıkla evcilleşir ve kırmızı tasmalı bir köpeğe dönüşür. Sahibini izler, uzaklaşınca yanına ışınlanır, sahibine yaklaşan canavarlara saldırır.
- **Kedi:** Çayır, orman ve huş ormanlarında seyrek görülür (beş renk). Çiğ ya da pişmiş balıkla evcilleşir, mavi tasma takar ve sahibini izler.
- Evcil hayvana sağ tık ya da **E**: oturur / kalkar. Mamasıyla (köpek: et, kedi: balık) iyileşir. Sahibi kendi hayvanına zarar veremez.

**At**
- Çayır ve savanda sürüler hâlinde (beş renk: doru, yağız, kır, al, alaca).
- **Ehlileştirme:** Boş elle sağ tık; at şahlanıp reddedebilir. Elma, buğday, havuç ya da altın elma güvenini artırır ve başarı olasılığını yükseltir.
- **Eyer** (5 deri + 1 demir külçe + 2 ip, Üretim Masası) takılan ata sağ tık ya da E ile binilir; **C** ya da E ile inilir.
- **Sürüş:** At binicinin baktığı yöne döner; W ileri, S geri, A/D yana, **Shift dörtnala**, **Boşluk zıplama** (yaklaşık iki blok). Bir bloklu basamakları kendiliğinden aşar; yüzebilir; nal sesleri vardır.
- Çok oyunculuda her oyuncu kendi atını sürer; at ve binicinin duruşu diğer oyunculara görünür.
- Evcil hayvanlar ve atlar (sahibi, rengi, eyeri, oturma durumu) dünya ile kaydedilir.

**Yemek pişirme**
- **Tencere** (5 demir külçe): yeni üretim istasyonu. Kâseli yemekler yenince kâse geri kalır.
- **Balık Çorbası** (balık, patates, kâse): Su Altında Nefes 60 sn.
- **Etli Güveç** (sığır eti, patates, havuç, kâse): Yenilenme 20 sn.
- **Tavuk Çorbası** (tavuk, havuç, kâse): Yenilenme 10 sn.
- **Kuzu Haşlama** (koyun eti, patates, kâse): Tokluk 90 sn.
- **Sebze Çorbası** (havuç, patates, mantar, kâse): Yenilenme 12 sn.
- **Şiş Kebap** (çiğ et ve çubuk, Kamp Ateşi): Güç 30 sn.
- **Köfte Ekmek** (biftek ve ekmek, Kamp Ateşi ya da Tencere): Tokluk 120 sn.
- **Reçelli Ekmek** (ekmek ve 3 böğürtlen): Hız 30 sn.
- Yeni etkiler: **Yenilenme** (can her 2,5 saniyede 1 artar), **Tokluk** (açlık azalmaz). Etkili yemekler açlık doluyken de yenebilir.

**Mobilyalar** (Üretim Masası, yeni “Mobilya” sekmesi)
- **Sandalye** ve **Koltuk**: sağ tık ya da E ile oturulur; hareket edince ya da C ile kalkılır. Arkalık, koyan oyuncunun karşısına gelir.
- **Masa**, **Masa Lambası** (masanın üstüne konabilen ışık kaynağı), sekiz renkte **Halı**, üç çeşit **Saksı** (gelincik, karahindiba, peygamber çiçeği), duvara asılan üç **Tablo** (manzara, deniz, çiçekler).

**Başarımlar:** yeni “Yuva ve Dostlar” grubu: Sadık Dost, Mırnav, Seyis, Atlı, Aşçı, Gurme, Ev Sahibi.

## 0.15.4: Buzul Kulesi yeniden tasarlandı

Buzul Kulesi, Buz Büyücüsü'nün yuvarlak kulesi olarak baştan tasarlandı (taban 27 blok çapında, tepe 45 blok yüksekliğinde).

- **Teras:** taş döşeme, yer yer kar; buz fenerli alçak duvar, buz kemerli giriş kapısı, uçlarında buz kristali parlayan dört buz kümesi.
- **Gövde:** 15 blok çapında, buz tuğladan; her katta sıkışmış buz ve kar taneli oymalı buz bantları, mavi vitray pencereler; dışta sekiz kademeli payanda ve uçlarında buz fenerleri.
- **Sarmal merdiven:** duvar boyunca dolanan, katlar arasında kesintisiz buz tuğla merdiven; zeminden tepeye zıplamadan çıkılır.
- **Katlar:**
  - Giriş salonu: donmuş çeşme, kristal kandiller, buz fenerli avize.
  - Kütüphane: duvar boyunca kitaplıklar, mavi halı üzerinde büyü masası, okuma kürsüleri.
  - Simya odası: iki simya masası, malzeme fıçıları, kristal sergisi, yatak.
  - Gözlem ve hazine odası: kristal küre, iki sandık.
- **Tepe (boss alanı):** kademeli taşmalar (altlarında buz sarkıtları) üzerinde 23 blok çapında açık savaş alanı; büyü çemberi deseni, mazgallı korkuluk, sekiz buz sivrisi, buz fenerleri; üstünde süzülen **Buz Kalbi** kristali ve çevresinde dönen buz parçaları. Merdiven boşluğu demir parmaklıkla çevrilidir.
- Toplam 5 sandık.
- **Soğuk ışık:** Buz Feneri ve Buz Kristali mavi-beyaz ışık verir; meşale, fener ve ateşin sıcak ışığıyla birlikte toplanır.
- **Yeni bloklar** (tümü üretilebilir): Buz Tuğla, Sıkışmış Buz, Oymalı Buz Tuğla, Buz Tuğla Merdiven, Buz Tuğla Yarım Blok, Kitaplık, Mavi Vitray, Buz Feneri, Buz Kristali, Buz Sarkıtı.
- Yapıların çevresindeki ağaçlar artık 30 blok yüksekliğe kadar temizlenir (havada asılı ağaç tepesi kalmaz).
- Üretim değiştiği için eski dünyalarda harita kaydı sıfırlanır.

## 0.15.3: Haydut Kampı yeniden tasarlandı

Haydut Kampı, Kızıl Pençe haydutlarının tahkimli yuvası olarak baştan tasarlandı (yaklaşık 37 blok çapında, halka biçimli).

- **Dış savunma:** dibinde sivri kazıklar bulunan hendek, kapı önünde ahşap köprü; uçları sivriltilmiş kütüklerden halka biçimli çit ve çit üstünde aralıklı meşaleler.
- **Kapı kulesi:** iki ahşap kule (içinden tırmanma merdiveni), kapının üstünden geçen mazgallı yürüyüş yolu, kara-kızıl sancaklar, fenerler.
- **Gözetleme kuleleri:** arka köşelerde iki kule; dikmeler, çapraz parmaklıklar, tırmanma merdiveni, korkuluklu nöbet yeri, piramit çatı ve flama.
- **Reis otağı:** ahşap kürsü üzerinde kırmızı-krem çizgili büyük çadır, saçak ve direkleri, sancaklar; içeride taht, halı, altın, fıçılar, masa ve iki ganimet sandığı.
- **Meydan:** taş halkalı büyük kamp ateşi ve şiş, oturaklar, kütük tabureler, fener direkleri. Haydut Reisi burada bekler.
- **Yatakhane çadırları:** yataklı iki bez çadır (birinde sandık), odun yığını.
- **Demirci tezgâhı:** örs, fırın, üretim masası, su fıçısı, sandık.
- **Ganimet ambarı:** fıçı ve saman yığınları, sandık.
- **Hazine kafesi:** demir parmaklıklar ardında sandık ve altın blok.
- **Okçuluk alanı:** hedef tahtaları, atış çizgisi.
- Toplam 7 sandık; 6 haydut (meydanda, kulelerde, kapı yolunda ve ambarda).
- **Yeni bloklar** (tümü üretilebilir): Çadır Bezi, Çizgili Çadır Bezi, Fıçı, Demir Parmaklık, Hedef, Sivri Kazık.
- Üretim değiştiği için eski dünyalarda harita kaydı sıfırlanır.

## 0.15.2: Çöl Tapınağı yeniden tasarlandı

Çöl Tapınağı, Mısır tapınaklarının düzeninde güneyden kuzeye ilerleyen bir yapı topluluğu olarak baştan tasarlandı (yaklaşık 29 x 50 blokluk tapınak alanı, 18 blok derinlikte mezar salonu).

- **Ön avlu:** firavun başlı iki sfenks, hiyeroglifli ve altın tepeli iki dikilitaş, kum taşı tören yolu.
- **Pilon (anıtsal giriş):** eğimli kenarlı iki kule, ön ve arka yüzde kanatlı güneş kursu, dört sancak direği ve flamalar. Giriş geçidinde ok tuzağı. Batı kulesinin içinden iki kollu merdivenle korkuluklu terasa çıkılır; doğu kulesinde nöbetçi odası bulunur.
- **Açık avlu:** iki yanda revaklar, nilüferli iki havuz, dört hurma ağacı, ateş kapları.
- **Sütunlu salon:** yüksek orta nef ve alçak yan nefler, papirüs başlıklı sütunlar, ışık pencereleri, altın yıldızlı mavi tavan, kapının iki yanında bekçi heykelleri.
- **Kutsal oda:** piramit biçimli çatı ve altın tepelik, tahtında oturan dev firavun heykeli, ortada ateşli sunak. Sunağın çevresindeki korkuluklu kuyudan sarmal merdivenle aşağı inilir.
- **Mezar salonu (boss alanı):** 21 x 21 ve 10 blok yüksekliğinde; altı büyük sütun, güneş mozaikli zemin, duvar ocakları, ateş kapları ve fenerlerle aydınlık. Güneyde lahitli kürsü, bekçi heykelleri ve altın çerçeveli kabartma; Firavun burada uyanır.
- **Hazine odaları:** mezar salonunun iki yanında altın yığınları ve sandıklar; doğudakinin girişinde ok tuzağı.
- Toplam 10 sandık (teras, nöbetçi odası, kutsal oda, hazine odaları, kürsü).
- **Yeni bloklar** (tümü üretilebilir): Oymalı Kum Taşı, Düz Kum Taşı, Hiyeroglifli Kum Taşı, Kum Taşı Sütun, Kum Taşı Merdiven, Kum Taşı Yarım Blok, Kum Taşı Korkuluk, Turuncu Pişmiş Toprak, Mavi Çini, Çizgili Çini, Altın Blok (9 altın külçe), Firavun Heykeli Başı (konunca yüzü oyuncuya döner).
- Işık: bir anda kullanılan ışık kaynağı sayısı 16'dan 32'ye çıkarıldı; çok sayıda fener ve ateşle aydınlatılan büyük salonlar artık bütünüyle aydınlık görünür.
- `isinla tapinak` komutu oyuncuyu tapınak alanının önüne ışınlar.
- Üretim değiştiği için eski dünyalarda harita kaydı sıfırlanır; yeni tapınak henüz değiştirilmemiş alanlarda ve yeni dünyalarda görünür.

## 0.15.1: Düzeltmeler, boss mekanikleri ve yapı tasarımları

- **Tuşlar:** Envanter ve üretim **Q**, etkileşim (kapı, sandık, köylü, istasyon, yatak, tekne) **E**, eşya atma **G**.
- **Liman** yalnızca deniz kıyısındaki köylerde kurulur; nehir kenarında liman oluşmaz.
- Buzul ve karlı bölgelere komşu kıyılarda kumsal yerine **karlı kumsal** oluşur.
- **Köy adları** birbirinden belirgin biçimde farklı seçilir (benzer kökten türeyen adlar kaldırıldı). **Köy sayısı yarıya indirildi.**
- **Canavar doğma dengesi:** Gündüz açık arazide canavar doğmaz; yalnızca yağmurlu/fırtınalı havada seyrek doğar. Gece yüzeyde, her zaman karanlık yeraltında doğar. Gündüz sınır yarıya iner; güneşte yanmayan canavarlar gün doğunca uzaktaysa kaybolur.
- **Ağaçlar:** Akasya gövdesi kıvrımlı ama kesintisiz; taç yaprakları gövdeye bitişik ve daha yuvarlak.
- **Kapı:** Kapı oyuncunun üstüne kapanırsa oyuncu boş yere itilir; sıkışma giderildi.
- **Tırmanma merdiveni:** W tuşu bakış yönüne göre çalışır (yukarı bakınca tırmanır, aşağı bakınca iner); Boşluk tuşu her zaman tırmandırır.
- **Deniz feneri:** İçeride tırmanma merdiveni yerine orta direğin çevresinde dönen **sarmal taş merdiven**; içeride fener ışığı.
- **Sandal:** Pruva yanları gövdeye bitişik.
- **Ok tuzakları** oyuncuya nişan almaz; ok atıcı baktığı yöne düz ok atar.
- **Yay:** Birinci şahıs görünümünde yay doğru yönde tutulur; gerilirken kiriş ve ok geri çekilir, yay ekranın ortasına gelir, bırakınca kiriş titrer.
- **Boss mekanikleri:** Her yetenek bir hazırlık evresiyle (animasyon ve yerde uyarı halkası) başlar; oyuncu uyarıyı görüp kaçabilir. Canı yarıya inen boss öfkelenir: hızlanır, yetenekleri sıklaşır ve güçlenir.
  - **Firavun:** kum fırtınası (çevresine sürekli hasar), asasından altın lanet küreleri, mumya çağırma.
  - **Buz Büyücüsü:** oyuncunun altından yükselen buz dikenleri, çevresine buz kıymığı halkası, yaklaşan oyuncudan ışınlanma.
  - **Haydut Reisi:** eğilip hedefe atılma, baltayla dönerek savurma, haydut çağırma.
  - **Taş Muhafız:** hedefin üstüne sıçrayıp şok dalgası, yay çizerek düşen kaya fırlatma (sütunlar siper olur).
  - Yeni boss sesleri ve görsel efektler; çok oyunculuda animasyon ve efektler tüm oyunculara iletilir.
- **Boss alanları ve yapı tasarımları:**
  - **Çöl Tapınağı:** köşe kuleleri, giriş kemeri, sütunlu ve fenerli salon, sarmal merdivenli kuyu, 19 x 19 sütunlu ve aydınlık yeraltı arenası, lahit.
  - **Buzul Kulesi:** sekizgen gövde, buz kuşakları, mavi sancaklar, her katta fener, tepede mazgallı ve buz sivrili açık boss alanı.
  - **Haydut Kampı:** kütük çit, iki kapı, gözetleme kulesi, dört çadır, sancak direkleri, kamp ateşi, sandıklar.
  - **Derin zindan:** 17 x 17, 8 blok yüksekliğinde sütunlu muhafız salonu; asılı ve zemin fenerleri, duvar kristalleri.
- Yeni blok: **Fener** (demir kafesli asılı ışık; Üretim Masasında 1 demir külçe + 1 meşale → 2 fener). Yapıların içi fener ve kristallerle aydınlatıldı.
- Üretim değiştiği için eski dünyalarda harita kaydı sıfırlanır; yeni yapılar ve ayarlar en iyi yeni bir dünyada görünür.

## 15. aşama (0.15.0): Yeni yapılar ve boss savaşları

- Özel yapılar (biyoma göre; köylerden uzakta, düz arazide):
  - **Çöl Tapınağı** (çöl): basamaklı çatılı kum taşı salon, girişte ok tuzağı, ortadaki kuyudan inilen karanlık hazine odası. Bossu **Firavun**.
  - **Orman Tapınağı** (orman, bataklık): yosunlu taş ve sarmaşıklar; koridorda ve bodrumdaki sandıkların önünde ok tuzakları.
  - **Buzul Kulesi** (karlı bölgeler, soğuk dağlar): 25 blok yüksekliğinde sekizgen kule, katlar arası tırmanma merdiveni, her katta sandık. Tepede **Buz Büyücüsü**.
  - **Haydut Kampı** (çayır, savan, huş ormanı): çitle çevrili kamp, çadırlar, kamp ateşi; yaklaşınca haydutlar saldırır. Büyük çadırda **Haydut Reisi**.
  - Derin zindanların (Y < 30) bir kısmında **Taş Muhafız**.
- Yeni bloklar: **Ok Atıcı** ve **Tuzak Teli**. Tele basılınca 7 blok içindeki ok atıcılar ok atar; tel kırılınca tuzak etkisizleşir.
- Bosslar oyuncu yaklaşınca uyanır; ekranın üstünde boss can çubuğu görünür. Geri itmeye dirençlidirler, canları yarıya inince hızlanırlar:
  - Firavun: güçlü vuruş ve açlık etkisi, mumya çağırır.
  - Buz Büyücüsü: üçlü buz oku (yavaşlık), yaklaşan oyuncudan ışınlanarak uzaklaşır.
  - Haydut Reisi: uzaktan hamleyle atılır, canı yarıya inince haydut çağırır.
  - Taş Muhafız: ağır vuruş, yere vurarak çevresine hasar verir.
- Yenilen bosslar dünya kaydında saklanır ve bir daha çıkmaz. Boss uyanması ve yenilmesi çok oyunculuda tüm oyunculara duyurulur.
- Efsanevi ganimetler: **Güneş Kılıcı** (vurulan canlıyı tutuşturur), **Buz Yayı** (okları canlıları yavaşlatır), **Reis Baltası**, **Muhafız Göğüslüğü** (Koruma III ile düşer). Örste elmas / ip / demir ile onarılır.
- Yapı sandıklarının kendine özgü ganimetleri vardır.
- Başarımlara “Bosslar” grubu ve yapı sandıkları eklendi (toplam 51).
- Yeni canlı: Haydut (gündüz de saldırır, güneşte yanmaz; sikke düşürür).
- Geliştirici: `isinla tapinak | ormantapinak | kule | kamp`, `boss [liste | sifirla]`; pencerede yapı ışınlanma düğmeleri ve “Boss ganimetleri” hazır seti.
- Üretim değiştiği için eski dünyalarda harita kaydı sıfırlanır; yapılar henüz değiştirilmemiş alanlarda görünür.

## 14. aşama (0.14.0): Yeni canavarlar, büyü sistemi, başarımlar

- Yeni canavarlar: **Mumya** (çöl ve savan; güneşte yanmaz, vuruşu açlık etkisi verir), **Boğulmuş Zombi** (gece derin suların dibinde, çok derin sularda her zaman; suda batar ve hedefe doğru yüzer; inci ya da bakır düşürebilir), **Buz İskeleti** (karlı bölgeler; okları yavaşlık etkisi verir), **Yarasa** (mağaralarda ve gece açıkta sürüler hâlinde; dalgalı uçar, vurup uzaklaşır; gündüz açıkta kaybolur). Mumya ve boğulmuş zombi zombi görevlerine, buz iskeleti iskelet görevlerine sayılır.
- Olumsuz etkiler: Yavaşlık (hareket %40 yavaş) ve Açlık (açlık hızla azalır); göstergede kırmızı kenarla gösterilir.
- **Büyü Masası** (2 elmas, 2 parıltı kristali, 4 kesme taş; üretim masasında): aletler, silahlar ve zırhlar deneyim seviyesi (2 / 5 / 9) ve parıltı kristali (1 / 2 / 3) karşılığında büyülenir. Seçenekler her büyülemeden sonra yenilenir.
- Büyüler: Keskinlik (hasar), Savurma (geri itme), Yağma (ganimet), Verimlilik (kazma hızı), Servet (cevher ürünü), Güç (ok hasarı), Cazibe (balık bekleme süresi), Koruma (hasar azaltma, toplam en çok %64), Solunum (oksijen), Tüy Düşüşü (düşme hasarı), Kırılmazlık (yıpranma).
- Örs: aynı türden iki eşya birleştirilirken büyüler de birleşir (eşit seviyeli iki büyü bir seviye yükselir); onarımda büyüler korunur.
- Büyülü eşyalar envanterde mor parıltıyla, elde hafif mor ışıltıyla gösterilir; ipucunda büyüler listelenir. Büyüler kayıtta, sandıklarda, yere düşen eşyalarda ve çok oyunculuda korunur.
- **Başarımlar**: 40 başarım (Başlangıç, Madencilik, Mücadele, Zanaat, Keşif, Köyler). L tuşu ya da duraklatma menüsündeki “Başarımlar” ile açılır; kazanılan başarım sağ üstte gösterilir. Çok oyunculuda her oyuncunun başarımları sunucuda oyuncu adıyla saklanır.
- Yağmurda gökyüzü daha belirgin griye döner, bulutlar koyulaşır.
- Geliştirici: `buyu <büyü> [seviye] | hepsi | temizle | liste`, `basarim [liste | ver | hepsi | sifirla]`; `etki` komutuna yavas ve aclik eklendi. Pencerede “Büyü” hazır seti, Eşyalar sekmesinde Büyü ve Başarımlar bölümleri.

## 13. aşama (0.13.0): Düzeltmeler, biyomlar ve mağaralar

- Biyomlar yeniden düzenlendi: iklim (sıcaklık ve nem) geniş ölçekli ve yumuşak geçişlidir; çöl ile karlı bölgeler yan yana gelmez, aralarında ılıman kuşak bulunur. Sıcak dağlarda kar zirvesi oluşmaz. Yeni biyomlar: Savan (akasya ağaçları, kuru çimen), Bataklık (bataklık ağaçları, sarmaşık, nilüfer), Karlı Ova (seyrek ladinler).
- Karlı bölgelerdeki ve soğuk dağlardaki ağaçların ve yaprakların üstünde ince kar katmanı bulunur.
- Köy adları her köy için ayrı üretilir; aynı dünyada aynı ad tekrar etmez. Köy karşılama bildirimi yalnızca köy zemini seviyesinde çıkar (mağaralarda ya da çok yüksekte çıkmaz).
- Oyuncu köyde değil, rastgele seçilen düz ve boş bir arazide (çayır, orman, huş ormanı, savan) başlar.
- Sudan karaya çıkış: Boşluk ile birlikte karaya doğru yüzülünce bir blok yüksekliğindeki kıyıya çıkılır.
- Deniz feneri: içeride arka duvarda zeminden ışık odasına kadar tırmanma merdiveni; giriş kapısı; ışık odasının tabanında merdiven boşluğu. Köy evlerinin giriş boşluklarına kapı takıldı.
- Eldeki eşyalar: aletler ve eşyalar üç boyutlu (hacimli piksel) olarak ve doğru renklerle çizilir; soluk görünüm giderildi.
- Yağmur her yerde yağar (yalnızca karlı bölgelerde kar yağar); yağmur alanı genişletildi, bulutlar yağmurda koyulaşır.
- Mağaralar: yosunlu bölgeler (yosun bloğu, sarmaşık, eğrelti, ışıklı mantar), damlataşı bölgeleri (sarkıt, dikit), derinlerde mantar ve örümcek ağları.
- Terk edilmiş madenler (yeni): yeraltında ahşap direkli koridorlar, kalas köprüler, meşaleler, örümcek ağları, ganimet sandıkları ve örümcek yuvası.
- Yeni bloklar: kar katmanı, kuru çimenli toprak, bataklık çimeni, akasya kütüğü / yaprağı / fidanı, nilüfer, sarmaşık (tırmanılabilir), örümcek ağı (yavaşlatır, kılıçla kesilince ip düşürür), yosun bloğu, sarkıt, dikit, damlataşı, ışıklı mantar (ışık verir).
- İskelet: yay elde, iki kolla nişan alır; kiriş germe ve ok animasyonu; ok yaydan çıkar; nişan alırken yüzü hedefe döner.
- Sandık: kapak çizgisi, demir köşeler ve kilitli yeni model.
- Geliştirici modu: `kesfet tumu` haritadaki kesik çizgili karenin (dünya sınırı) tamamını doldurur; açık deniz hızlı işlenir; büyük haritada bellek kullanımı azaltıldı. Yeni komut: `isinla maden` (pencerede "En yakın maden").
- Eski kayıtlar: üretim değiştiği için harita kaydı otomatik sıfırlanır; değiştirilmemiş alanlarda arazi ve biyomlar yeni üretime göre değişir. Yeni dünya önerilir.

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
index.html            Tanıtım sitesinin ana sayfası (menüdeki HungerMan bağlantısı buraya gelir)
rehber.html           Oyun rehberi
guncellemeler.html    Güncelleme geçmişi (site/gecmis.js'den çizilir)
404.html              Bulunamadı sayfası
site/                 Tanıtım sitesinin stili (stil.css), betiği (site.js), güncelleme geçmişi (gecmis.js) ve ekran görüntüleri (gorsel/)
oyna.html             Oyunun kendisi: menüler ve oyun ekranı
css/oyun.css          Arayüz stilleri
lib/                  Three.js (r169, MIT lisansı), PeerJS (1.5.4, MIT lisansı; yalnız çok oyunculuda yüklenir)
ses/efekt/            Ses efekti kayıtları (Kenney, CC0)
ses/muzik/            Müzik parçaları (Tanner Helland, CC BY 4.0)
ses/LISANS.md         Ses ve müzik lisansları
js/ana.js             Giriş noktası: menüler, girdi, oyun döngüsü, kayıt
js/sabitler.js        Ortak sabitler (parça boyutu, deniz seviyesi, gün süresi)
js/rastgele.js        Tohumlu rastgele sayı ve gürültü fonksiyonları
js/bloklar.js         Blok, eşya ve alet tanımları
js/sekiller.js        Biçimli bloklar (merdiven, yarım blok, kapı, çit...): kutular, çarpışma, ışın isabeti
js/dunya/uretici.js   Dünya üretimi (kıta, biyom, ağaç, cevher, mağara)
js/dunya/uretici-v1.js Eski dünyaların (sürüm 1) dondurulmuş üreticisi
js/dunya/biyom.js     Biyomlar, alt biyomlar ve iklim
js/dunya/agac.js, agac2.js Ağaç kurucular (eski türler ve fidanlar; dev ağaçlar, mangrov, dev mantarlar, çalılar)
js/oyun/kum-dusmesi.js Düşen kum ve çakıl
js/oyun/ortam.js, js/grafik/atesbocegi.js Biyom atmosferi: ortam sesleri, sis, ateş böcekleri, sıcak dalgası
js/dunya/koy-uretici.js Köy yerleşimi ve yapıları
js/dunya/zindan-uretici.js Zindan odaları
js/dunya/maden-uretici.js Terk edilmiş madenler
js/oyun/basarimlar.js  Başarım listesi, olaylar ve düzenli denetim
js/dunya/yapi-uretici.js Çöl ve orman tapınakları, buzul kulesi, haydut kampı
js/oyun/yapilar.js     Boss uyanması, haydutlar, ok tuzakları, yenilen bosslar
js/arayuz/basarim-ekrani.js Başarımlar penceresi ve kazanma kutusu
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
