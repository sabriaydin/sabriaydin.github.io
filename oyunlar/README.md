# Oyunlar

Her oyun kendi klasöründe durur: `oyunlar/<oyun-adi>/`. Ortak dosyalar `oyunlar/ortak/` içindedir (three.min.js).
Menü bağlantısı `assets/js/site.js` → Projeler → Oyunlar → `items` içinden eklenir (Projeler menüsü Oyunlar, Programlar ve Diğer alt menülerinden oluşur).

## Hunger 3D FPS (`oyunlar/hunger/`)

Dosyalar `index.html` içinde sırayla yüklenir. Bir değişiklik için yalnızca ilgili dosya düzenlenir.

| Konu | Dosya |
|---|---|
| Sayfa iskeleti, HUD, menüler (sayfa başlığı "Hunger") | `index.html` |
| Tüm arayüz stilleri | `css/stil.css` |
| Sabitler (harita boyutu, gün süresi, erişim mesafesi) | `js/cekirdek/ad-alani.js` |
| Matematik/gürültü yardımcıları | `js/cekirdek/yardimcilar.js` |
| Ayarlar ve ayar menüsü (grafik, ses, kontrol, oyun; `hunger-ayar-v1`; müzik varsayılanı %35, ses kaynakları için `ses/KREDI.txt` notu) | `js/cekirdek/ayarlar.js` |
| Eşyalar (ad, yığın, yenilebilirlik) | `js/veri/esyalar.js` |
| Üretim tarifleri, istasyonlar | `js/veri/tarifler.js` |
| Ağaç/kaya/maden dayanıklılığı, araç kademesi çarpanı (`POWER`); meyve çalıları katı değildir (içlerinden geçilir) | `js/veri/dugumler.js` |
| Hayvan türleri (can, hız, düşen eşyalar, bölge aralığı `sp`, av/avcı, büyük baş), silah hasarı | `js/veri/hayvanlar.js` |
| Ada üretimi (arazi, dağlar, ağaç/maden sıklığı); tatlı su göletlerinin içine ve kenarına ağaç/çalı konmaz (`HG.pondClean`) | `js/dunya/uretim.js` |
| Envanter simgeleri (2B; taş, kaya, balta/kazma/olta simgeleri yenilendi) | `js/gorsel/simgeler.js` |
| Renderer, renk/ton eşleme, kamera, FPS bakışı, kalite kademeleri; malzeme seçenekleri (`nocut`: palmiye yaprakları kesilmez) | `js/sahne/cekirdek.js` |
| Prosedürel dokular (arazi detayı, su normal haritası, parlama; çim (yaprak darbeleri), kabuk (lifli/çatlaklı), kaya (tabakalı), kum ve yaprak (damarlı) PBR dokuları) | `js/sahne/dokular.js` |
| Gökyüzü kubbesi (güneş, ay, bulut), güneş/ay ışığı, sis, yansıma ortamı, ateş ışıkları | `js/sahne/isik.js` |
| Arazi (yumuşak yükseklik, renk karışımı) ve su | `js/sahne/arazi.js` |
| Çimen tutamları ve çiçekler (eğik sap, yaprak, taç; rüzgârda sallanır) | `js/sahne/cim.js` |
| Yüksek ayrıntılı 3B modeller (çam/meşe/palmiye, kaya, maden, çalı, alet parçaları, duvar, kapı…); çam ve meşe gövdesinin kök kısmı: gövdeye bağlı yumuşak kök sivrilmesi (`rootTube`, `mkRoots`); gövde ve kök tüplerinin yüzey yönü düzeltildi (ağacın oyuncuya bakan yüzü kaybolmaz) ve yere yayılan ince kök kolları (`rootArm`) | `js/sahne/modeller.js` |
| Güncelleme 49 eşyaları (tohum, buğday, ekmek, güveç, meyve suyu, kurutulmuş yiyecek, mantar, yumurta, tüy, merhem, şişedeki mesaj, zırh, Demir Mızrak, Dürbün), yeni yapı tarifleri, tavuk türü | `js/veri/yenilikler.js` |
| Yeni eşya simgeleri | `js/gorsel/yeni-simgeler.js` |
| Yeni yapı modelleri (yatak, raf, varil, meşale direği, tuzak, tarla, ekin aşamaları, mantar), tavuk modeli, yerdeki ve elde tutulan yeni eşya modelleri | `js/sahne/yeni-modeller.js` |
| Yapıların üstündeki dinamik görseller (ekin aşaması, asılı yiyecek, varil suyu, tuzakta av), kayan yıldız, gökkuşağı, kuş sürüsü, dürbünde el gizleme | `js/sahne/yenilikler.js` |
| Yapı etkileşimleri ve durumları (yatak, raf, varil, tuzak, tarla), Dürbün yakınlaştırma, zırh ve zorluk (`HG.hurt` sarmalı), tavuk yumurtası, mantar yerleşimi, fotoğraf modu (P), Şişedeki Mesaj, Çiftçi/Aşçı yetenekleri, köylü ticareti ve kamp ganimeti eklemeleri; durum `G.ext` olarak kayda işlenir | `js/oyun/yenilikler.js` |
| Dünya nesnelerinin sahneye yerleşimi (parçalı örnekleme, kaliteye bağlı LOD mesafesi, rüzgâr, alev); kurulan yapılar (ateş, duvar, kapı, çit…) tek tek eklenir/kaldırılır, komşu duvar ve kapıların yönü yeniden hesaplanır (tam sahne yenilemesi gerekmez); kesilmiş ve yeniden büyümeyi bekleyen ağaç/kaya/maden için gizli örnek hazır tutulur (kayıt yüklendikten sonra da artımlı güncelleme) | `js/sahne/nesneler.js` (`buildStruct`, `removeStruct`, `S.syncCells`); Hasır Yatak, Kurutma Rafı, Yağmur Varili, Meşale Direği (ışık ve alev), Av Tuzağı ve Ekim Tarlası yapı olarak, Mantar örnekli (instanced) çizilir |
| Birinci şahıs kollar (gerçekçi el/parmak/ön kol, deri tonu) ve elde tutulan eşya; El Taşı iki elle tutulur; balta/kazma/olta modelleri; eller nesnelere, kayalara, duvarlara ve canlılara yaklaşınca geri çekilir (içinden geçmez) | `js/sahne/kol.js` |
| Parçacık efektleri | `js/sahne/efektler.js` |
| Nişan, yerleştirme hayaleti | `js/sahne/nisan.js` |
| Yerdeki eşyaların görünümü / ayrıntılı eşya modelleri (taş, kaya, kömür, maden, odun, alet) | `js/sahne/dusenler.js`, `js/sahne/esya-modelleri.js` |
| Ağaç devrilme (ayakta duran ağaçla aynı model ve doku), maden parçalanma efekti | `js/sahne/devrilme.js` |
| Uçan/saplanan oklar | `js/sahne/oklar.js` |
| Son işleme: HDR, bloom, güneş ışınları, renk derecelendirme, vinyet | `js/sahne/sonisleme.js` |
| Hava durumu: bulut, yağmur, şimşek | `js/sahne/hava.js` |
| Ateş böcekleri, polen/toz parçacıkları | `js/sahne/atmosfer.js` |
| Yükseklik sisi, rüzgâr simülasyonu (yön, hamle, şiddet); yüzey detayı gölgelendiricisi (kabartma, pürüzlülük, üç düzlemli kaplama, yaprak boşlukları; `PBR_NOCUT`); uzak/eğik bakışta arazi dokusunun karıncalanmasını önleyen piksel ayak izine bağlı kabartma ve pürüzlülük sönümlemesi (`pbf`) | `js/sahne/gerceklik.js` |
| Oyun içi rehber (oynanış, hikâye, canavarlar, madenler, eşyalar, üretim) | `js/veri/rehber.js` (metinler), `js/oyun/rehber.js` (pencere) |
| Tuş atamaları (Ayarlar › Kontrol; F1 artık konsolu açar, kontroller yalnızca Ayarlar menüsündedir) | `js/cekirdek/tuslar.js` |
| Kayıt sistemi: otomatik kayıt, elle kayıt yuvaları, dosya indirme/yükleme, kayıtlar menüsü (küçük ekran görüntülü kartlar, göreli süre, depolama özeti, Yükle/Ad değiştir/İndir/Sil düğmeleri; duraklatma menüsünden de açılır; Devam Et düğmesinde son kaydın özeti) | `js/oyun/durum.js` (altyapı, `meta.th` küçük görüntü), `js/oyun/kayitlar.js` (pencere, görüntü yakalama), `css/stil.css` (`.sl`), `index.html` (`#sv`) |
| Başarımlar | `js/oyun/basarimlar.js` |
| Yaprak, duman, kıvılcım, adım tozu, su halkaları, soluk buharı | `js/sahne/parcaciklar.js` |
| Yüklenme ekranı (ilerleme çubuğu, ipuçları, sol altta "Bir Sabri Aydın oyunu." yazısı; yükleme bitince oyun doğrudan başlar) | `index.html` (`#load`), `js/oyun/durum.js` (`startGame`), `js/oyun/dongu.js` (`init`), `js/sahne/cekirdek.js` (`buildAsync`) |
| Oyuncu fiziği (atalet, eğim, düşme hasarı), eşya sekmesi/yüzmesi, ok sürüklenmesi; konuma göre barınak sorgusu (`HG.shelterAt`) | `js/oyun/hayatta-kalma.js`, `js/oyun/dusenler.js`, `js/oyun/silah.js` |
| Köyler, köylüler, mesleğe özgü takas/satış (1-3 işlem, işlem hakkı, yenileme), köylü uykusu | `js/oyun/koyluler.js` (mantık), `js/sahne/koyluler.js` (model ve animasyon) |
| Köy evleri, avlu eşyaları, fenerler, patikalar, tabela | `js/sahne/koy-yapilari.js` |
| Deneyim, seviye, yetenekler, günlük penceresi (K) | `js/oyun/gelisim.js` |
| Köylü görevleri (getir, avla, Gölge avı, köy bul) | `js/oyun/gorevler.js` |
| Terk edilmiş kamplar: keşif, sandık, ganimet | `js/oyun/kamplar.js` (mantık), `js/sahne/kamplar.js` (model), `js/dunya/uretim.js` (yerleşim) |
| Bulunan kayıtlar (hikâye notları) | `js/veri/notlar.js` |
| Kan Ayı gecesi ve günlük deneyim | `js/oyun/olaylar.js`, `js/sahne/isik.js` (kızıl gökyüzü) |
| Sikke ekonomisi, satış, Uyku Tulumu ve uyku | `js/oyun/koyluler.js` (`HG.sleep`), `js/veri/esyalar.js` (coin, bag) |
| Hayvan modelleri / hayvan hareketi ve animasyonu (tavuk gagalaması dahil; Gölge saldırı hazırlığında kollar geri çekilir, tetikteki av hayvanı başını kaldırır, domuz hazırlık evresinde ön ayağıyla eşelenir) | `js/sahne/hayvan-modelleri.js`, `js/sahne/hayvanlar.js` |
| Ses motoru: 3B ses (HRTF), yankı, su altı alçak geçiren süzgeç, programla üretilen yedek sesler, ortam sesleri, hava, hayvan (tavuk dahil), adım, müzik, dürbün ve deklanşör sesi; gerçek ses katmanı önce denenir, yoksa yedek ses çalar (`HG.SES`); kalp atışı (`K.heart`, düşük canda ve korkuda) ve mide gurultusu (`K.stomach`) yumuşatıldı, her ses olayı `HG.sndHook` ile konsola bildirilir, ortam seviyeleri `HG.audioBeds()` | `js/oyun/ses.js` |
| Gerçek ses katmanı: kayıt havuzları (paket dosyaları), yüzeye göre adımlar, alet/ağaç/kaya/maden, dövüş, hayvan ve Gölge sesleri, kesintisiz ortam döngüleri (rüzgâr, fırtına, yaprak, dalga, yağmur, kuş, ateş), müzik yöneticisi (gündüz/gece parçaları, aralıklı çalma) | `js/oyun/ses-gercek.js` (`HG.sesGercek`), `index.html` |
| Ses kayıtları ve manifest (`dizin.json`), paketler (`paket-*.bin`), döngüler (`dongu-*.mp3`), müzik (`muzik-*.mp3`), kaynak ve lisans bilgisi (CC BY-SA 3.0 / CC BY 3.0 / CC0 / MIT; atıf gerekir) | `ses/` (`ses/KREDI.txt`) |
| Gece-gündüz hesabı | `js/oyun/zaman.js` |
| Envanter işlemleri | `js/oyun/envanter.js` |
| Üretim mantığı | `js/oyun/uretim.js` |
| Kesme/toplama/yerleştirme/yeme-içme; vuruş başına kaynak (Rust mantığı), E ile toplama ve basılı tutarak geri alma, yeni yapı/ürün etkileşimleri için kancalar (`HG.useExtra`, `HG.extHint`, `HG.extHeldHint`, `HG.extPickupBlock`, `HG.extGot`, `HG.extSand`), alet kademesi (`gatherLv`), verim (`YIELD`), çıplak elle toplama engeli | `js/oyun/eylem.js` (vuruş hasarı `HIT`: `js/veri/dugumler.js`) |
| İnşa sistemi: İnşa Planı (duvar/kapı/çit kurma), Çekiç (Odun/Taş/Metal yükseltme, yıkma ve %50 iade), sağ tık radyal menüsü (menü açıkken eşya değişirse seçim uygulanmaz), yerleştir tuşu/dokunmatik düğme plan ve çekiçle de çalışır, yerleştirme gölgesi | `js/oyun/insa.js` (parça kataloğu `PIECES`), `css/stil.css` (`#radial`), `js/gorsel/simgeler.js` (parça simgeleri), `js/sahne/modeller.js` (`wallt`, `wallm`, `doorm`, `fence`) |
| Yere atılan eşyalar (fizik, toplama) | `js/oyun/dusenler.js` |
| Hayvan yapay zekâsı (bölgesel gezinme, kurt avı %40/%60, büyük baş karşılığı, kovalama hızı oyuncunun koşusundan yavaş `cspd`, uzaklaşınca bırakma `giveUp`, iç içe geçme engeli, yabani hayvanlar kapıdan geçemez `SOLIDA`; gelişmiş davranış: kurt sürüsü (lider, kuşatma, geri çekilme `callPack`/`packTick`), yaban domuzu ve ayıda hazırlık-atılma-dinlenme evresi (`a.cph`, `chargeMove`), av hayvanlarında tetikte durumu ve sürü alarmı (`alarm`), zikzaklı kaçış, ses/gürültüye (`HG.noiseT`) ve rüzgâra duyarlılık, sürü merkezine gezinme), vurma, öldürme, düşen eşyalar | `js/oyun/hayvanlar.js` |
| Beden durumu: dayanıklılık, akıl sağlığı, kanama, meşale yakıtı, hasar geri bildirimi, bandaj | `js/oyun/vucut.js` |
| Gölge yaratıklar (korku), sahte gözlemciler, gerilim, gece yönetmeni; yapay zekâ: A* yol bulma (`findPath`, kare başına en çok 2 arama), engel arkasından dolanma, saldırı hazırlığı ve geri çekilme, atılma, kuşatma konumları, ışık kenarında dolanma, ışıktan kaçış | `js/oyun/dusmanlar.js` |
| Yay, ok fiziği, isabet ve geri toplama | `js/oyun/silah.js` |
| Eşyaya özgü saldırı gücü (`DMG`), vuruş bölgesi çarpanları (`ZONE`), canlı canı (%100) | `js/veri/hayvanlar.js`, `js/oyun/hayvanlar.js` (`zoneAt`, `hitAnimal`) |
| Mağara üretimi (odalar, tüneller, havuzlar, sandık odası, yaratık ve eşya yerleşimi) | `js/dunya/magara.js` (`HG.genCave`), giriş yerleşimi `js/dunya/uretim.js` |
| Mağaraya giriş/çıkış (yüzey ile mağara katı değişimi), kayıt uyumu | `js/oyun/magara.js` |
| Mağara girişi modeli, tavan, sarkıt-dikit, kristaller, karanlık atmosfer | `js/sahne/magara.js` |
| Harita: kabartma, keşif sisi, ızgara, pusula (harita üzerine binmez), küçük keşif etiketleri, ölçek, yakınlaştırma, hedef işareti | `js/oyun/harita.js` (çağrılar `js/oyun/arayuz.js` içindedir) |

Not: Harita 768×768 karedir (`js/cekirdek/ad-alani.js`). Eski 384×384 kayıtlar yeni haritanın ortasına gömülür (`HG.embedLegacy`, `js/dunya/uretim.js`).
| Açlık, susuzluk (susuzluk sıfırlanırsa koşma kapanır ve can çok yavaş azalır: ani ölüm yok), üşüme, hareket, zıplama, sığınak; yüzme, dalış, nefes ve boğulma; canlılarla çarpışma | `js/oyun/hayatta-kalma.js` |
| Su altı sisi/yüzeyi/kabarcıklar, balık sürüleri (gövde ekseni yönle uyumlu; tatlı su göllerinde hız, yarıçap ve dikey aralık gölün derinliğine göre sınırlı, balıklar suyun dışına çıkmaz), su bitkileri, mercan | `js/sahne/sualti.js` |
| Deniz oyun mantığı: sal (hız, dayanıklılık, kıyıya çıkış), dalış maskesi, köpek balığı/denizanası yapay zekâsı, canlı doğurma, bölgeye göre balık tutma, ada/resif keşfi | `js/oyun/deniz.js` |
| Deniz görselleri: köpek balığı, yunus, martı, yengeç, sal modeli ve izi, parlayan plankton, fener ışığı, fırtına dalgası | `js/sahne/deniz.js` |
| E tuşu hedef seçimi (bakılan yöne göre), nişan ipucu | `js/oyun/eylem.js` (`useCands`), `js/oyun/arayuz.js` |
| Rehber hedefler | `js/oyun/hedefler.js` |
| Yeni oyun, kayıt, yükleme (yarım kalmış kaya/ağaç/maden hasarı kayda dahildir; yeni oyun ve yüklemede alet/inşa bekleme sayaçları sıfırlanır; mantar ve eski kayıtlardaki tavuklar bir kez yerleştirilir (`HG.extStart`); bozuk veya eski kayıttaki tanımsız eşya ve geçersiz sayılar temizlenir) | `js/oyun/durum.js` (`startGame`, `snapshotRaw`) |
| HUD, envanter paneli, harita; imleç kilidi yokken "Fareyle bakmak için ekrana tıklayın" ipucu | `js/oyun/arayuz.js` |
| Klavye, fare, dokunmatik, envanter sürükle-bırak | `js/oyun/giris.js` |
| Ana döngü ve başlatma | `js/oyun/dongu.js` |

**Güncelleme 51 (büyük genişleme):**

| Konu | Dosya |
|---|---|
| Çok oyunculu (co-op) hazırlık katmanı: oyuncu soyutlaması (`HG.me`, `HG.players`), olay yolu (`HG.on`/`HG.emit`), dünya değişiklik günlüğü (`HG.journal`), varlık kimlikleri (`HG.eid`), dünya kodu (`HG.worldCode`) | `js/cekirdek/hazirlik.js` |
| Yeni eşyalar, tarifler, yapılar (Depo Sandığı, Tabela, Arı Kovanı, Balık Tuzağı, Hazine Haritası, Kürek, Kalkan, Çizme, Köpek Yavrusu, bal ürünleri, merhem, çay…), Ayı ve Köpek türleri, silah hasarı, rehber haberi | `js/veri/genisleme.js` |
| Yeni eşya simgeleri | `js/gorsel/genisleme-simgeler.js` |
| Yeni model ve görseller: sandık, tabela (yazılı levha), arı kovanı, balık tuzağı, ayı, köpek, Gezgin Tüccar görünümü, mezar haçı, kar yağışı | `js/sahne/genisleme-modeller.js` |
| Mantık I: ortak durum kaydı `G.x2` (`HG.x2reg`), yapı varlıkları (`HG.x2ent`), sandık, tabela, arı kovanı, balık tuzağı, bal, gömülü hazine ve kürek, harita işaretleri, ölüm kuralları (mezar çantası, doğma noktası, kalıcı ölüm), yerleştirme kancaları | `js/oyun/genisleme.js` |
| Mantık II: mevsimler (bahar-yaz-sonbahar-kış), ıslaklık, ateş (hastalık), çay/merhem/bal etkileri, kalkan siperi, barış kipi, çizme, durum satırı (`#x2s`) | `js/oyun/genisleme2.js` |
| Mantık III: köpek yoldaş, ayılar (kışın uyur), Gezgin Tüccar, köy itibarı ve indirim, söylentiler, elma ve şifalı ot toplama, günlük meydan okumalar, Günlük › Meydan sekmesi | `js/oyun/genisleme3.js` |
| Arayüz: sandık penceresi, tabela düzenleyici, tarif arama/süzgeci ve çoklu üretim (Shift ×5, Ctrl ×60), ses altyazıları, hasar sayıları, harita işaretleri (Shift+tık bayrak), oyun kolu desteği | `js/oyun/genisleme-arayuz.js`, `css/genisleme.css` |
| Güncelleme 52: El Taşı ücretsiz tarifi kaldırıldı (aleti olmayan oyuncu E ile kayadan toplar, kaya başına günde bir: `ACT[O.ROCK]`, `HG.extBare`); ölüm ekranı (`#bResp` Yeniden Doğ, `showDeath`); sahil doğma noktaları (`x2.sp`, `genCoast`); kısayollar sayfası kaldırıldı, sabit kontroller Ayarlar › Kontrol sayfasında (`js/cekirdek/tuslar.js`; F1 artık geliştirici konsolunu açar); bakır damarında kristal yok, ağaç gövdesi daha derine gömülü ve ayrı kök kolları kaldırıldı | `js/oyun/genisleme.js`, `js/oyun/eylem.js`, `js/veri/tarifler.js`, `js/veri/rehber.js`, `js/cekirdek/tuslar.js`, `js/cekirdek/ayarlar.js`, `js/oyun/genisleme-arayuz.js`, `js/sahne/modeller.js`, `index.html` |
| Güncelleme 53: Etkileşim odağı tekleştirildi; E ile etkileşim adayları (köylü, sandık, mağara) daha dar açıyla (cos > .85–.9) algılanır, nişanın değdiği nesne adaydan belirgin biçimde yakınsa aday listelenmez ve ipucunda aynı anda iki etkileşim gösterilmez (`useCands`, `hud` nişan ipucu) | `js/oyun/eylem.js`, `js/oyun/arayuz.js` |
| Envanter ve Üretim ayrı ekranlar: `I`/`Tab` Envanter, `C` Üretim (açıkken diğer tuş ekranı değiştirir, aynı tuş kapatır; sandık Envanter ekranında açılır). Üretim ekranı: istasyon çubuğu (yakında/uzak), malzeme özeti, kategori sayıları, arama, sık kullanılanlar (★), sıralama, ×5 ve Maks düğmeleri, Enter ile üretim, eksik malzeme ve istasyon uyarıları | `js/oyun/uretim-ekrani.js`, `css/uretim.css`, `index.html` (`#panel`, `#ptabs`, `#invScr`, `#crfScr`), `js/oyun/arayuz.js`, `js/oyun/giris.js`, `js/oyun/genisleme-arayuz.js` |
| Makro/otomatik tıklama koruması: yakın dövüş vuruş aralığı sabittir (`HG.atkGate`), tuşu bırakıp yeniden basarak atlatılamaz; saniyede 10+ basış veya milisaniye düzeyinde eşit aralıklı tıklama algılanırsa saldırı 4 saniye kapanır; yay için 600 ms bekleme | `js/oyun/koruma.js`, `js/oyun/eylem.js`, `js/oyun/silah.js` |
| Geliştirici konsolu (F1): oyunda olan her şeyin kaydı (ses olayları ve kaynağı, hasar, saldırı, hayvan, envanter farkı, üretim, dünya değişiklikleri, durum geçişleri, tuş/fare girdileri, bildirimler, koruma kararları, console çıktıları ve hatalar); kategori süzgeci, arama, akışı dondurma, kopyalama ve dosyaya kaydetme; yalnızca kayıt tutar. `HG.log(kategori, ileti, düzey)` ile yeni kayıt eklenir | `js/oyun/konsol.js`, `css/konsol.css`, `index.html`, `js/oyun/ses.js` (`HG.sndHook`) |
| Kayıt sistemi (yeniden yazıldı): Duraklat › Oyunu Kaydet iki tür sunar: Otomatik kayıt (tarayıcıda bir yuvaya bağlanır, sonra her 20 saniyede güncellenir; `HG.save` yalnızca bağlı yuvaya yazar) ve Manuel kayıt (dosya indirme). Kayıtlı Oyunlar (ana menü ve duraklatma menüsü): liste, yükle, ad değiştir, indir, sil, Dosyadan yükle (içe aktarır ve oyunu başlatır). Eski Oyunu kaydet / Kayıt dosyasını indir / Kayıtlar / Kayıt dosyası yükle düğmeleri kaldırıldı; kalıcı ölümde bağlı kayıt silinir | `js/oyun/durum.js`, `js/oyun/kayitlar.js`, `js/oyun/hayatta-kalma.js`, `index.html` (`#sd`, `#sv`) |
| Ana menü: Rehber düğmesi kaldırıldı; Yeni Oyun önce Dünya Oluştur penceresini açar (dünya adı, kod/Rastgele, zorluk, ölünce, başlangıç zamanı, hayvan yoğunluğu, başlangıç eşyaları, mevsimler, barış modu; `HG.applyNewWorld`); sol altta "Bir Sabri Aydın oyunu.", sağ altta sürüm (`HG.VERSION`, her güncellemede artırılır); sinematik kamera uçuşu, kıvılcım/ateş böceği/sis parçacıkları, sinema şeritleri, başlık parıltısı; ölüm ekranında yalnızca Yeniden Doğ ve Ana menüye dön | `js/oyun/menu.js`, `css/menu.css`, `js/sahne/cekirdek.js` (menü kamerası), `js/oyun/giris.js`, `js/oyun/genisleme.js`, `index.html` |
| Küçük kancalar eklenen özgün dosyalar (davranışları değişmedi; yalnızca `HG.ext*`/`HG.petAI`/`HG.repK`/`sc.npcLook` çağrıları): ayarlar (Oyun sekmesi satırları), sahne (çim, nesneler, köylüler, hayvanlar), harita, durum, hayatta kalma, envanter, eylem, giriş, gelişim, köylüler, hayvanlar, silah, ses, başarımlar, hedefler, rehber | `js/cekirdek/ad-alani.js`, `js/cekirdek/ayarlar.js`, `js/sahne/cim.js`, `js/sahne/nesneler.js`, `js/sahne/koyluler.js`, `js/sahne/hayvanlar.js`, `js/oyun/*.js` |

**Co-op (çok oyunculu) için kurallar** — yeni sistemler bunlara uyar:

- Tüm yeni oyun durumu `G.x2` altında tutulur; her anahtar `HG.x2reg(anahtar, varsayılan, temizleyici)` ile kaydedilir (kayıt anahtarı `x2`, yüklemede temizlenir). Doğrudan `G` üzerine yeni kalıcı alan eklenmez.
- Dünya nesnesi değişiklikleri yalnızca `HG.setObj` ile yapılır (bu çağrı `HG.journal` üzerinden `'obj'` olayı üretir). Yapıya bağlı veriler (`HG.x2ent`) hücre indeksine bağlıdır.
- Durum değişiklikleri `HG.journal.push('x2', {k: ...})` ile günlüğe yazılır; ağ katmanı yalnızca günlüğü iletir.
- Benzersiz kimlik gerekiyorsa `HG.eid(önek)` kullanılır; oyuncu bilgisi `HG.me` / `HG.players()` üzerinden okunur (tek oyuncuda dizi tek elemanlıdır).
- Dünya üretimi ve günlük görevler tohumludur (`HG.mulberry32`, tohum + gün); aynı dünya kodu aynı adayı kurar.
- Kare güncellemesi `HG.update` sarmalıyla eklenir; özgün dosyalara yalnızca küçük, ek kancalar yazılır.


Not: Kayıt anahtarı `hunger-save-v5`; harita yapısı değişirse sürüm artırılmalıdır.
