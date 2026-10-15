# Oyunlar

Her oyun kendi klasöründe durur: `oyunlar/<oyun-adi>/`. Ortak dosyalar `oyunlar/ortak/` içindedir (three.min.js).
Menü bağlantısı `assets/js/site.js` → Projeler → Oyunlar → `items` içinden eklenir (Projeler menüsü Oyunlar, Programlar ve Diğer alt menülerinden oluşur).

## Hunger 3D FPS (`oyunlar/hunger/`)

Dosyalar `index.html` içinde sırayla yüklenir. Bir değişiklik için yalnızca ilgili dosya düzenlenir.

| Konu | Dosya |
|---|---|
| Sayfa iskeleti, HUD, menüler | `index.html` |
| Tüm arayüz stilleri | `css/stil.css` |
| Sabitler (harita boyutu, gün süresi, erişim mesafesi) | `js/cekirdek/ad-alani.js` |
| Matematik/gürültü yardımcıları | `js/cekirdek/yardimcilar.js` |
| Ayarlar ve ayar menüsü (grafik, ses, kontrol, oyun; `hunger-ayar-v1`) | `js/cekirdek/ayarlar.js` |
| Eşyalar (ad, yığın, yenilebilirlik) | `js/veri/esyalar.js` |
| Üretim tarifleri, istasyonlar | `js/veri/tarifler.js` |
| Ağaç/kaya/maden dayanıklılığı, araç kademesi çarpanı (`POWER`) | `js/veri/dugumler.js` |
| Hayvan türleri (can, hız, düşen eşyalar, bölge aralığı `sp`, av/avcı, büyük baş), silah hasarı | `js/veri/hayvanlar.js` |
| Ada üretimi (arazi, dağlar, ağaç/maden sıklığı) | `js/dunya/uretim.js` |
| Envanter simgeleri (2B) | `js/gorsel/simgeler.js` |
| Renderer, renk/ton eşleme, kamera, FPS bakışı, kalite kademeleri | `js/sahne/cekirdek.js` |
| Prosedürel dokular (arazi detayı, su normal haritası, parlama; çim, kabuk, kaya, kum ve yaprak PBR dokuları) | `js/sahne/dokular.js` |
| Gökyüzü kubbesi (güneş, ay, bulut), güneş/ay ışığı, sis, yansıma ortamı, ateş ışıkları | `js/sahne/isik.js` |
| Arazi (yumuşak yükseklik, renk karışımı) ve su | `js/sahne/arazi.js` |
| Çimen tutamları (rüzgârda sallanır) | `js/sahne/cim.js` |
| Yüksek ayrıntılı 3B modeller (ağaç, kaya, maden, duvar, kapı…) | `js/sahne/modeller.js` |
| Dünya nesnelerinin sahneye yerleşimi (parçalı örnekleme, rüzgâr, alev) | `js/sahne/nesneler.js` |
| Birinci şahıs kollar ve elde tutulan eşya | `js/sahne/kol.js` |
| Parçacık efektleri | `js/sahne/efektler.js` |
| Nişan, yerleştirme hayaleti | `js/sahne/nisan.js` |
| Yerdeki eşyaların görünümü / ayrıntılı eşya modelleri | `js/sahne/dusenler.js`, `js/sahne/esya-modelleri.js` |
| Ağaç devrilme, maden parçalanma efekti | `js/sahne/devrilme.js` |
| Uçan/saplanan oklar | `js/sahne/oklar.js` |
| Son işleme: HDR, bloom, güneş ışınları, renk derecelendirme, vinyet | `js/sahne/sonisleme.js` |
| Hava durumu: bulut, yağmur, şimşek | `js/sahne/hava.js` |
| Ateş böcekleri, polen/toz parçacıkları | `js/sahne/atmosfer.js` |
| Yükseklik sisi, rüzgâr simülasyonu (yön, hamle, şiddet); yüzey detayı gölgelendiricisi (kabartma, pürüzlülük, üç düzlemli kaplama, yaprak boşlukları) | `js/sahne/gerceklik.js` |
| Oyun içi rehber (oynanış, hikâye, canavarlar, madenler, eşyalar, üretim) | `js/veri/rehber.js` (metinler), `js/oyun/rehber.js` (pencere) |
| Tuş atamaları (Ayarlar › Kontrol) | `js/cekirdek/tuslar.js` |
| Kayıt sistemi: otomatik kayıt, elle kayıt yuvaları, dosya indirme/yükleme, kayıtlar menüsü | `js/oyun/durum.js` (altyapı), `js/oyun/kayitlar.js` (pencere) |
| Başarımlar | `js/oyun/basarimlar.js` |
| Yaprak, duman, kıvılcım, adım tozu, su halkaları, soluk buharı | `js/sahne/parcaciklar.js` |
| Yüklenme ekranı (ilerleme çubuğu, ipuçları, "Oyuna Gir") | `index.html` (`#load`), `js/oyun/durum.js` (`startGame`), `js/oyun/dongu.js` (`init`), `js/sahne/cekirdek.js` (`buildAsync`) |
| Oyuncu fiziği (atalet, eğim, düşme hasarı), eşya sekmesi/yüzmesi, ok sürüklenmesi | `js/oyun/hayatta-kalma.js`, `js/oyun/dusenler.js`, `js/oyun/silah.js` |
| Köyler, köylüler, mesleğe özgü takas/satış (1-3 işlem, işlem hakkı, yenileme), köylü uykusu | `js/oyun/koyluler.js` (mantık), `js/sahne/koyluler.js` (model ve animasyon) |
| Köy evleri, avlu eşyaları, fenerler, patikalar, tabela | `js/sahne/koy-yapilari.js` |
| Deneyim, seviye, yetenekler, günlük penceresi (K) | `js/oyun/gelisim.js` |
| Köylü görevleri (getir, avla, Gölge avı, köy bul) | `js/oyun/gorevler.js` |
| Terk edilmiş kamplar: keşif, sandık, ganimet | `js/oyun/kamplar.js` (mantık), `js/sahne/kamplar.js` (model), `js/dunya/uretim.js` (yerleşim) |
| Bulunan kayıtlar (hikâye notları) | `js/veri/notlar.js` |
| Kan Ayı gecesi ve günlük deneyim | `js/oyun/olaylar.js`, `js/sahne/isik.js` (kızıl gökyüzü) |
| Sikke ekonomisi, satış, Uyku Tulumu ve uyku | `js/oyun/koyluler.js` (`HG.sleep`), `js/veri/esyalar.js` (coin, bag) |
| Hayvan modelleri / hayvan hareketi ve animasyonu | `js/sahne/hayvan-modelleri.js`, `js/sahne/hayvanlar.js` |
| Ses motoru: 3B ses, yankı, ortam sesleri, hava, hayvan, adım, müzik | `js/oyun/ses.js` |
| Gece-gündüz hesabı | `js/oyun/zaman.js` |
| Envanter işlemleri | `js/oyun/envanter.js` |
| Üretim mantığı | `js/oyun/uretim.js` |
| Kesme/toplama/yerleştirme/yeme-içme; alet kademesi (`gatherLv`) ve verim (`YIELD`), çıplak elle toplama engeli | `js/oyun/eylem.js` |
| Yere atılan eşyalar (fizik, toplama) | `js/oyun/dusenler.js` |
| Hayvan yapay zekâsı (bölgesel gezinme, kurt avı %40/%60, büyük baş karşılığı, iç içe geçme engeli), vurma, öldürme, düşen eşyalar | `js/oyun/hayvanlar.js` |
| Beden durumu: dayanıklılık, akıl sağlığı, kanama, meşale yakıtı, hasar geri bildirimi, bandaj | `js/oyun/vucut.js` |
| Gölge yaratıklar (korku), sahte gözlemciler, gerilim, gece yönetmeni | `js/oyun/dusmanlar.js` |
| Yay, ok fiziği, isabet ve geri toplama | `js/oyun/silah.js` |
| Eşyaya özgü saldırı gücü (`DMG`), vuruş bölgesi çarpanları (`ZONE`), canlı canı (%100) | `js/veri/hayvanlar.js`, `js/oyun/hayvanlar.js` (`zoneAt`, `hitAnimal`) |
| Mağara üretimi (odalar, tüneller, havuzlar, sandık odası, yaratık ve eşya yerleşimi) | `js/dunya/magara.js` (`HG.genCave`), giriş yerleşimi `js/dunya/uretim.js` |
| Mağaraya giriş/çıkış (yüzey ile mağara katı değişimi), kayıt uyumu | `js/oyun/magara.js` |
| Mağara girişi modeli, tavan, sarkıt-dikit, kristaller, karanlık atmosfer | `js/sahne/magara.js` |
| Harita: kabartma, keşif sisi, ızgara, pusula, ölçek, yakınlaştırma, hedef işareti | `js/oyun/harita.js` (çağrılar `js/oyun/arayuz.js` içindedir) |

Not: Harita 768×768 karedir (`js/cekirdek/ad-alani.js`). Eski 384×384 kayıtlar yeni haritanın ortasına gömülür (`HG.embedLegacy`, `js/dunya/uretim.js`).
| Açlık, susuzluk, üşüme, hareket, zıplama, sığınak; yüzme, dalış, nefes ve boğulma; canlılarla çarpışma | `js/oyun/hayatta-kalma.js` |
| Su altı sisi/yüzeyi/kabarcıklar, balık sürüleri, su bitkileri, mercan | `js/sahne/sualti.js` |
| Deniz oyun mantığı: sal (hız, dayanıklılık, kıyıya çıkış), dalış maskesi, köpek balığı/denizanası yapay zekâsı, canlı doğurma, bölgeye göre balık tutma, ada/resif keşfi | `js/oyun/deniz.js` |
| Deniz görselleri: köpek balığı, yunus, martı, yengeç, sal modeli ve izi, parlayan plankton, fener ışığı, fırtına dalgası | `js/sahne/deniz.js` |
| E tuşu hedef seçimi (bakılan yöne göre), nişan ipucu | `js/oyun/eylem.js` (`useCands`), `js/oyun/arayuz.js` |
| Rehber hedefler | `js/oyun/hedefler.js` |
| Yeni oyun, kayıt, yükleme | `js/oyun/durum.js` |
| HUD, envanter paneli, harita | `js/oyun/arayuz.js` |
| Klavye, fare, dokunmatik, envanter sürükle-bırak | `js/oyun/giris.js` |
| Ana döngü ve başlatma | `js/oyun/dongu.js` |

Not: Kayıt anahtarı `hunger-save-v5`; harita yapısı değişirse sürüm artırılmalıdır.
