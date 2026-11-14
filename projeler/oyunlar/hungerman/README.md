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
index.html            Menüler ve oyun ekranı
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
