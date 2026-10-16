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
| Ağaç/kaya/maden dayanıklılığı, araç kademesi çarpanı (`POWER`); meyve çalıları katı değildir (içlerinden geçilir) | `js/veri/dugumler.js` |
| Hayvan türleri (can, hız, düşen eşyalar, bölge aralığı `sp`, av/avcı, büyük baş), silah hasarı | `js/veri/hayvanlar.js` |
| Ada üretimi (arazi, dağlar, ağaç/maden sıklığı); tatlı su göletlerinin içine ve kenarına ağaç/çalı konmaz (`HG.pondClean`) | `js/dunya/uretim.js` |
| Envanter simgeleri (2B; taş, kaya, balta/kazma/olta simgeleri yenilendi) | `js/gorsel/simgeler.js` |
| Renderer, renk/ton eşleme, kamera, FPS bakışı, kalite kademeleri; malzeme seçenekleri (`nocut`: palmiye yaprakları kesilmez) | `js/sahne/cekirdek.js` |
| Prosedürel dokular (arazi detayı, su normal haritası, parlama; çim (yaprak darbeleri), kabuk (lifli/çatlaklı), kaya (tabakalı), kum ve yaprak (damarlı) PBR dokuları) | `js/sahne/dokular.js` |
| Gökyüzü kubbesi (güneş, ay, bulut), güneş/ay ışığı, sis, yansıma ortamı, ateş ışıkları | `js/sahne/isik.js` |
| Arazi (yumuşak yükseklik, renk karışımı) ve su | `js/sahne/arazi.js` |
| Çimen tutamları ve çiçekler (eğik sap, yaprak, taç; rüzgârda sallanır) | `js/sahne/cim.js` |
| Yüksek ayrıntılı 3B modeller (çam/meşe/palmiye, kaya, maden, çalı, alet parçaları, duvar, kapı…); çam ve meşe gövdesinin kök kısmı: gövdeye bağlı yumuşak kök sivrilmesi (`rootTube`, `mkRoots`) ve yere yayılan ince kök kolları (`rootArm`) | `js/sahne/modeller.js` |
| Güncelleme 49 eşyaları (tohum, buğday, ekmek, güveç, meyve suyu, kurutulmuş yiyecek, mantar, yumurta, tüy, merhem, şişedeki mesaj, zırh, Demir Mızrak, Dürbün), yeni yapı tarifleri, tavuk türü | `js/veri/yenilikler.js` |
| Yeni eşya simgeleri | `js/gorsel/yeni-simgeler.js` |
| Yeni yapı modelleri (yatak, raf, varil, meşale direği, tuzak, tarla, ekin aşamaları, mantar), tavuk modeli, yerdeki ve elde tutulan yeni eşya modelleri | `js/sahne/yeni-modeller.js` |
| Yapıların üstündeki dinamik görseller (ekin aşaması, asılı yiyecek, varil suyu, tuzakta av), kayan yıldız, gökkuşağı, kuş sürüsü, dürbünde el gizleme | `js/sahne/yenilikler.js` |
| Yapı etkileşimleri ve durumları (yatak, raf, varil, tuzak, tarla), Dürbün yakınlaştırma, zırh ve zorluk (`HG.hurt` sarmalı), tavuk yumurtası, mantar yerleşimi, fotoğraf modu (P), Şişedeki Mesaj, Çiftçi/Aşçı yetenekleri, köylü ticareti ve kamp ganimeti eklemeleri; durum `G.ext` olarak kayda işlenir | `js/oyun/yenilikler.js` |
| Dünya nesnelerinin sahneye yerleşimi (parçalı örnekleme, kaliteye bağlı LOD mesafesi, rüzgâr, alev); kurulan yapılar (ateş, duvar, kapı, çit…) tek tek eklenir/kaldırılır, komşu duvar ve kapıların yönü yeniden hesaplanır (tam sahne yenilemesi gerekmez); kesilmiş ve yeniden büyümeyi bekleyen ağaç/kaya/maden için gizli örnek hazır tutulur (kayıt yüklendikten sonra da artımlı güncelleme) | `js/sahne/nesneler.js` (`buildStruct`, `removeStruct`, `S.syncCells`); Hasır Yatak, Kurutma Rafı, Yağmur Varili, Meşale Direği (ışık ve alev), Av Tuzağı ve Ekim Tarlası yapı olarak, Mantar örnekli (instanced) çizilir |
| Birinci şahıs kollar (gerçekçi el/parmak/ön kol, deri tonu) ve elde tutulan eşya; El Taşı iki elle tutulur; balta/kazma/olta modelleri | `js/sahne/kol.js` |
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
| Tuş atamaları (Ayarlar › Kontrol) | `js/cekirdek/tuslar.js` |
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
| Hayvan modelleri / hayvan hareketi ve animasyonu (tavuk gagalaması dahil) | `js/sahne/hayvan-modelleri.js`, `js/sahne/hayvanlar.js` |
| Ses motoru: 3B ses, yankı, ortam sesleri, hava, hayvan (tavuk dahil), adım, müzik, dürbün ve deklanşör sesi | `js/oyun/ses.js` |
| Gece-gündüz hesabı | `js/oyun/zaman.js` |
| Envanter işlemleri | `js/oyun/envanter.js` |
| Üretim mantığı | `js/oyun/uretim.js` |
| Kesme/toplama/yerleştirme/yeme-içme; vuruş başına kaynak (Rust mantığı), E ile toplama ve basılı tutarak geri alma, yeni yapı/ürün etkileşimleri için kancalar (`HG.useExtra`, `HG.extHint`, `HG.extHeldHint`, `HG.extPickupBlock`, `HG.extGot`, `HG.extSand`), alet kademesi (`gatherLv`), verim (`YIELD`), çıplak elle toplama engeli | `js/oyun/eylem.js` (vuruş hasarı `HIT`: `js/veri/dugumler.js`) |
| İnşa sistemi: İnşa Planı (duvar/kapı/çit kurma), Çekiç (Odun/Taş/Metal yükseltme, yıkma ve %50 iade), sağ tık radyal menüsü (menü açıkken eşya değişirse seçim uygulanmaz), yerleştir tuşu/dokunmatik düğme plan ve çekiçle de çalışır, yerleştirme gölgesi | `js/oyun/insa.js` (parça kataloğu `PIECES`), `css/stil.css` (`#radial`), `js/gorsel/simgeler.js` (parça simgeleri), `js/sahne/modeller.js` (`wallt`, `wallm`, `doorm`, `fence`) |
| Yere atılan eşyalar (fizik, toplama) | `js/oyun/dusenler.js` |
| Hayvan yapay zekâsı (bölgesel gezinme, kurt avı %40/%60, büyük baş karşılığı, kovalama hızı oyuncunun koşusundan yavaş `cspd`, uzaklaşınca bırakma `giveUp`, iç içe geçme engeli, yabani hayvanlar kapıdan geçemez `SOLIDA`), vurma, öldürme, düşen eşyalar | `js/oyun/hayvanlar.js` |
| Beden durumu: dayanıklılık, akıl sağlığı, kanama, meşale yakıtı, hasar geri bildirimi, bandaj | `js/oyun/vucut.js` |
| Gölge yaratıklar (korku), sahte gözlemciler, gerilim, gece yönetmeni | `js/oyun/dusmanlar.js` |
| Yay, ok fiziği, isabet ve geri toplama | `js/oyun/silah.js` |
| Eşyaya özgü saldırı gücü (`DMG`), vuruş bölgesi çarpanları (`ZONE`), canlı canı (%100) | `js/veri/hayvanlar.js`, `js/oyun/hayvanlar.js` (`zoneAt`, `hitAnimal`) |
| Mağara üretimi (odalar, tüneller, havuzlar, sandık odası, yaratık ve eşya yerleşimi) | `js/dunya/magara.js` (`HG.genCave`), giriş yerleşimi `js/dunya/uretim.js` |
| Mağaraya giriş/çıkış (yüzey ile mağara katı değişimi), kayıt uyumu | `js/oyun/magara.js` |
| Mağara girişi modeli, tavan, sarkıt-dikit, kristaller, karanlık atmosfer | `js/sahne/magara.js` |
| Harita: kabartma, keşif sisi, ızgara, pusula (harita üzerine binmez), küçük keşif etiketleri, ölçek, yakınlaştırma, hedef işareti | `js/oyun/harita.js` (çağrılar `js/oyun/arayuz.js` içindedir) |

Not: Harita 768×768 karedir (`js/cekirdek/ad-alani.js`). Eski 384×384 kayıtlar yeni haritanın ortasına gömülür (`HG.embedLegacy`, `js/dunya/uretim.js`).
| Açlık, susuzluk, üşüme, hareket, zıplama, sığınak; yüzme, dalış, nefes ve boğulma; canlılarla çarpışma | `js/oyun/hayatta-kalma.js` |
| Su altı sisi/yüzeyi/kabarcıklar, balık sürüleri, su bitkileri, mercan | `js/sahne/sualti.js` |
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
| Arayüz: sandık penceresi, tabela düzenleyici, kısayol panosu (F1), tarif arama/süzgeci ve çoklu üretim (Shift ×5, Ctrl ×60), ses altyazıları, hasar sayıları, harita işaretleri (Shift+tık bayrak), oyun kolu desteği | `js/oyun/genisleme-arayuz.js`, `css/genisleme.css` |
| Küçük kancalar eklenen özgün dosyalar (davranışları değişmedi; yalnızca `HG.ext*`/`HG.petAI`/`HG.repK`/`sc.npcLook` çağrıları): ayarlar (Oyun sekmesi satırları), sahne (çim, nesneler, köylüler, hayvanlar), harita, durum, hayatta kalma, envanter, eylem, giriş, gelişim, köylüler, hayvanlar, silah, ses, başarımlar, hedefler, rehber | `js/cekirdek/ad-alani.js`, `js/cekirdek/ayarlar.js`, `js/sahne/cim.js`, `js/sahne/nesneler.js`, `js/sahne/koyluler.js`, `js/sahne/hayvanlar.js`, `js/oyun/*.js` |

**Co-op (çok oyunculu) için kurallar** — yeni sistemler bunlara uyar:

- Tüm yeni oyun durumu `G.x2` altında tutulur; her anahtar `HG.x2reg(anahtar, varsayılan, temizleyici)` ile kaydedilir (kayıt anahtarı `x2`, yüklemede temizlenir). Doğrudan `G` üzerine yeni kalıcı alan eklenmez.
- Dünya nesnesi değişiklikleri yalnızca `HG.setObj` ile yapılır (bu çağrı `HG.journal` üzerinden `'obj'` olayı üretir). Yapıya bağlı veriler (`HG.x2ent`) hücre indeksine bağlıdır.
- Durum değişiklikleri `HG.journal.push('x2', {k: ...})` ile günlüğe yazılır; ağ katmanı yalnızca günlüğü iletir.
- Benzersiz kimlik gerekiyorsa `HG.eid(önek)` kullanılır; oyuncu bilgisi `HG.me` / `HG.players()` üzerinden okunur (tek oyuncuda dizi tek elemanlıdır).
- Dünya üretimi ve günlük görevler tohumludur (`HG.mulberry32`, tohum + gün); aynı dünya kodu aynı adayı kurar.
- Kare güncellemesi `HG.update` sarmalıyla eklenir; özgün dosyalara yalnızca küçük, ek kancalar yazılır.


Not: Kayıt anahtarı `hunger-save-v5`; harita yapısı değişirse sürüm artırılmalıdır.
