/* Hunger 3D - güncelleme notları (Ana menü › Güncelleme Notları). Yeni güncelleme: dizinin başına yeni bir kayıt ekleyin. */
HG.NOTES=[
{
"n": 68,
"t": "Yeni oyuncu modeli ve Co-op ayrıntıları",
"x": "Co-op'ta diğer oyuncunun modeli baştan yapıldı: eklemli gövde (bel, boyun, omuz-dirsek-bilek, kalça-diz-ayak bileği), yüzlü baş (göz, kaş, burun, kulak, ağız), dört farklı saç modeli, deri/kumaş/deri-kayış dokulu malzemeler (birinci kişi kollarıyla aynı), sırt çantası ve uyku tulumu, kemer ve kese. Hareketler: gerçek yürüme-koşma döngüsü (diz yalnız ileri savrulurken bükülür, kollar bacakların tersine), zıplama ve düşüş duruşu, nefes alma, göz kırpma, bakış yönüne göre baş eğimi, yüzme kulaçları, yay germe, alet vuruşu, uyku ve ölüm. Co-op ince ayrıntıları: oyuncunun elinde tuttuğu eşya (alet, meşale, yay, malzeme) diğer oyuncuda görünür, adım sesleri duyulur (sal üstünde farklı), ad etiketinde can çubuğu gösterilir. Oyuncunun başındaki beyaz disk kaldırıldı."
},
{
"n": 67,
"t": "Menüler ve Güncelleme Notları",
"x": "Ana menüde \"Co-op'a Katıl\" düğmesi \"Oyuna Katıl\" adını aldı ve Yeni Oyun'un hemen altına taşındı. Duraklatma menüsü gerçek oyunlardaki gibi yeniden düzenlendi: sol tarafta büyük başlık, dünya adı ve kodu, dikey düğme listesi, ok tuşlarıyla gezinme, Esc ile devam. Ana menüye Güncelleme Notları düğmesi eklendi; tüm güncellemeler açılır liste olarak okunabilir."
},
{
"n": 66,
"t": "Dünya Oluştur ve Barış modu",
"x": "Dünya Oluştur penceresi geliştirildi ve mantık hataları giderildi. Barış modu: yalnızca saldıran canlının hasarını engelliyordu; artık Gölge, kurt, ayı, köpek balığı ve denizanası bulunmaz (haritadakiler kaldırılır, yenileri çıkmaz, mağaradaki Gölgeler dahil), yaban domuzu ve diğer hayvanlar kovalamaz veya karşılık vermez; arı sokması geçerlidir. Barış modunda Hedefler listesinden Gölge ve ayı adımları çıkarılır, köy görevleri Gölge/kurt/köpek balığı avı istemez (eski tehlikeli görev yenilenir). Dünya kuralları (zorluk, ölünce, mevsimler, barış) artık kayıtla birlikte saklanır ve kayıt yüklenince uygulanır (eski kayıtlarda geçerli ayarlar korunur; co-op konuğu ev sahibinin kurallarını alır). Pencere: her seçeneğe seçime göre değişen açıklama, seçimlerin özet satırı, Varsayılan düğmesi, dünya kodu için anlık denetim (eksik karakter sayacı, geçerli aralığın dışındaki kodlar için açık hata; 6 karakterden kısa kod artık kabul edilmez), Mevsimler ve Barış modu açıklamaları, hizalama düzeltmesi ve alt düğme satırı her zaman görünür. Ayarlar'daki Barış modu açıklaması gerçek davranışa göre güncellendi; sürüm 1.85."
},
{
"n": 65,
"t": "Yükleme ekranı",
"x": "Yükleme ekranının sol altındaki \"Bir Sabri Aydın oyunu.\" yazısı kaldırıldı (ana menüdeki alt yazı değişmedi)"
},
{
"n": 64,
"t": "Denge ve zorluk",
"x": "Denge ve zorluk: doğal kaynaklar konuma bağlı sabit sınamayla seyreltildi (ağaç %30, palmiye %25, kaya %40, kömür %35, bakır %15, çalı %35, mantar %40; başlangıç çevresindeki 14 kare korunur, demir damarı seyreltilmez); düğüm verimi azaldı, yeniden büyüme uzadı; hayvan sayısı ve ganimeti azaldı, yeniden doğma yavaşladı; süt/yün bekleme süresi uzadı; tarif maliyetleri arttı (üretim süresi ×1,25, külçe 2 cevher, fırın 18 taş vb.); alet kademesi verimi .5/1/1,4/2; açlık ve susuzluk hızı arttı. Alet dayanıklılığı: baltalar, kazmalar, mızraklar, gürz ve kılıçlar vuruşla aşınır, kırılır; Çalışma Tezgâhına bakıp E ile malzeme karşılığında onarılır (El Taşı hiç aşınmaz); dayanıklılık çubuğu ve ipucu eklendi. Dünya Oluştur'a Kaynak yoğunluğu (Az/Normal/Bol) seçeneği; eski kayıtlar bir kez yeni dengeye geçirilir. Ana menü: düğmeler tek sütunda alt alta, opak (saydam düğme yok), yön tuşlarıyla gezinme ve ilk düğmeye odak. Çanta paneline kaynak özeti şeridi, odak çerçevesi, yeni ayarlar (menü efektleri, alet aşınması, dayanıklılık çubuğu), yeni başarımlar (Tamirci, Sert Kullanım, Ortak Çaba), yeni ipuçları ve güncellenen Rehber metinleri. Co-op: davet bağlantısı (?coop=KOD) ve kopyalama düğmesi, ev sahibinin oyuncuyu çıkarması (aynı kimlikle yeniden katılma engeli), aynı ad çakışmasında numara eki, sohbet hız sınırı/temizleme/komutlar (/yardim /ping /konum), gelen konum paketi doğrulaması, durağan oyuncuda konum trafiğinin azaltılması, konuğun çanta ve gelişiminin dünya başına saklanması, HUD'da arkadaşın mesafe ve yönü, haritada arkadaş ve ortak hedef işareti, düşme/ayağa kalkma bildirimi, yerdeki eşyada dayanıklılığın iki yönde taşınması."
},
{
"n": 63,
"t": "İki oyunculu co-op",
"x": "İki oyunculu co-op (WebRTC/PeerJS, ev sahibi yetkili). Duraklat › Co-op oyun aç ile 6 karakterlik kod üretilir; ikinci oyuncu ana menü › Co-op'a Katıl ile kodu girerek bağlanır (kendi sunucu gerekmez; GitHub Pages yeterlidir, bağlantı kurulumu için herkese açık PeerJS aracı ve STUN sunucusu kullanılır). Ev sahibi dünya anlık görüntüsünü gönderir; blok/nesne/yer eşyası değişiklikleri, hayvanlar (100 birim yakınlık, ~8 Hz), köylüler ve tüccar, gün saati, sohbet (Enter) ve oyuncu modeli (ad etiketi, yürüme/yüzme/uyku/saldırı) iki yönde eşitlenir. Düşman ve hayvanlar en yakın oyuncuyu hedefler; hasar, bildirim, açlık ve deneyim etkileri ilgili oyuncuya yönlendirilir; konuk vuruşları ev sahibinde doğrulanır. Duraklatma, harita ve ölüm dünyayı durdurmaz; uyku için iki oyuncunun da yatması gerekir. En fazla 2 oyuncu; mağaralar co-op'ta kapalıdır; konuk oyunu tarayıcıya kaydedilmez (kalıcı ölüm kuralı 'yatakta uyanma'ya çevrilir); iki taraf aynı HG.VERSION (1.83) ile açılmalıdır"
},
{
"n": 62,
"t": "İnşa dokuları ve temel düzeltmesi",
"x": "İnşa parçalarına özgün dokular eklendi (çıta: kabuklu dal demetleri, odun: damarlı tahta ve budak, taş: derzli tuğla sıraları, metal: oluklu pasaklı sac, zırhlı: perçinli koyu plaka); her seviye kendi dokulu malzemesini kullanır, kapılar da seviyesine göre dokulanır. Balta elindeyken kayaya, kazma elindeyken ağaca bakınca artık yanlış yönlendiren Çıplak el uyarısı yerine doğru alet uyarısı gösterilir (oyun/eylem.js) Temel üzerinde kendiliğinden kaya, ağaç, çalı veya mantar çıkması düzeltildi: yeniden büyüme sayaçları temel kareleri için iptal edilir; mevcut kayıtlarda temel üstüne çıkmış doğa nesneleri 2 saniyede bir temizlenir"
},
{
"n": 61,
"t": "Palmiyeler ve 27 dakikalık gün",
"x": "Palmiyeler artık baltayla (veya El Taşı ile) kesilir ve odun verir; meyveli palmiyede E ile hindistan cevizi toplama korunur, kesilen palmiye 480 sn sonra yeniden büyür. Gün döngüsü 27 dakikaya çıkarıldı: 20 dk gündüz, 7 dk gece (HG.DAY 1620; gündüz 0.25-0.75, gece 0.75-1.25 görsel evresine eşlenir, başlangıç saatleri ve gün sayacı buna uyarlandı)"
},
{
"n": 60,
"t": "İnşa sistemi baştan yazıldı",
"x": "İnşa sistemi baştan yazıldı (Rust mantığı). Kare tabanlı 1×1 duvar/çit yerine 3 m ızgarada yapışma noktalı parçalar: Temel (komşu temellere yapışır, eğimde yükselir, suya kurulmaz), Zemin (kat), Duvar, Kapı Çerçevesi, Pencereli Duvar, Yarım ve Alçak Duvar, Merdiven (3 m çıkış). Parçalar Çıta olarak kurulur; Çekiç ile Odun/Taş/Metal/Zırhlı seviyeye yükseltilir (yeni seviye bedeli ödenir). Denge sistemi (temel %100; destek yıkılınca üstündekiler çöker, %5 altı kurulamaz). Kapılar ayrı eşya (Tahta/Metal/Zırhlı), çerçeveye takılır, E ile açılıp kapanır, animasyonlu. Yık: 10 dakika içinde tam iade, sonra %25. Katlı yapılarda gerçek çarpışma, merdiven tırmanışı, duvar/zemin altından geçiş, düşman ve hayvanların duvara takılması, eşyaların üst katta durması ve barınak hesabı (tavan + kapalı kapı). Eski kare parçalar korunur, çekiçle sökülür. R: döndür, T: pipet. Kaldırılan: eski G/V/B/Z/Y/L inşa kısayolları"
},
{
"n": 59,
"t": "Köylerdeki görünmez engel",
"x": "Köylerdeki görünmez engel düzeltildi: fener direkleri kare köşesine (tam sayı koordinat) çiziliyordu, çarpışma ise karenin tamamını kaplıyordu; bu yüzden direğin yanındaki boş görünen kare geçilemiyordu. Direk artık karenin ortasında durur (dunya/uretim.js, dünya tohumdan yeniden üretildiği için eski kayıtlarda da geçerlidir). Denetim: 96 köyde kapı önü erişimi, kapalı cep, arazi basamağı ve 2710 VDEC karesinin görseli (yalnızca fener sorunluydu)"
},
{
"n": 58,
"t": "İnşa sistemi büyük güncellemesi",
"x": "İnşa sistemi büyük güncellemesi (50+ madde). Yeni parçalar: Pencereli duvar (Odun/Taş/Metal), Geçit (Odun/Taş; kapısız çerçeve, yürünür, canavar ve hayvanı durdurur, barınağı kapatır), Çit kapısı (Odun/Metal; yürünür, alanı kapatmaz), Çit'e Taş (alçak taş duvar) ve Metal (tel örgü) seviyesi; 9 yeni 3B model (sahne/insa-modeller.js), 13 yeni simge (gorsel/insa-simgeler.js), yeni nesne kodları 35-43 (ad-alani.js, cim.js, dugumler.js: SOLID/OBJTOP/NAMES/STAND, HG.INSA_PASS), harita renkleri malzemeye göre. Kurulum: seviye seçimi (G, Shift+tekerlek), parça seçimi (Ctrl+tekerlek), elle yön (V; otomatik yön komşuya uyar, sc.rotOver/HG.insaRotOf), basılı tutup süpürerek sürekli kurma, kurulamama nedeni ipucu (dolu, su, üzerinde duruyor, hayvan/köylü var, harita dışı), 'mevcut/gerekli' malzeme göstergesi, yanında duvar yok uyarısı, pipet (T), kılavuz ızgarası (Y), kurulum büyüme animasyonu ve toz efekti. Gölge: ince parça biçimi ve yönü, kenar çizgisi, nabız. Çekiç: menü 6 öğe (Odun, Taş, Metal, Sonraki, Döndür, Yık), B basılıyken toplu yükseltme/yıkma/döndürme (bağlı aynı tür, en çok 40; malzeme yettiği kadar), kurulumdan 30 sn içinde yıkılırsa %100 iade. Geri al (Z): 30 işlem; kurma, yükseltme, yıkma, döndürme, toplu işlem. Bilgi: inşa bilgi paneli (L), sayaçlar, 10/25/50/100/200 parça eşiklerinde XP, barınak oluştu/bozuldu bildirimi, yeni bayraklar (built_stone, built_metal, build10…200). Durum G.x2.insa (HG.x2reg): seçili parça, seviyeler, çekiç menüsü, yönler, sayaçlar, ızgara; insa.js artık genisleme.js sonrasında yüklenir. Yeni tuşlar cekirdek/tuslar.js (ayarlardan değiştirilir); rehber ve eşya açıklamaları güncellendi. Ortak dosyalar: nesneler.js (3 satır: sc.structAt, sc.NBR, sc.rotOver), nisan.js (gölge), giris.js (tuş ve tekerlek), hayatta-kalma.js (HG.updateInsa, OPENOBJ), dusmanlar.js/hayvanlar.js/koyluler.js (HG.INSA_PASS), harita.js, stil.css, index.html"
},
{
"n": 57,
"t": "Ganimet sandıkları",
"x": "Terk edilmiş kamp/enkaz/mağara sandıkları artık eşyaları çantaya doğrudan vermez: ilk açılışta ganimet sandığın 24 kutuluk deposuna konur (G.x2.cc, kayıtla saklanır), Depo Sandığı penceresi çanta ile yan yana açılır, oyuncu istediğini alır; boşaltılıp kapatılan sandık tükenmiş sayılır (HG.openCampStore, HG.campChestClosed). Köylüler geceleyin evdeki yatağa yatar (bedOf) ve yatak modeli yeniden çizildi (ayaklar, baş ve ayak tahtası, şilte, battaniye, yastık)"
},
{
"n": 56,
"t": "Üretim süresi",
"x": "Üretim süresi (Rust mantığı): malzeme hemen harcanır, eşya sıraya girer ve süre dolunca çantaya eklenir; süre malzeme miktarı ve değerine göre 1.5-11 sn (HG.craftTime), pişirme/ergitme kısa; sıra kayıtla saklanır (G.x2.cq), sıradakiler iptal edilip malzeme iade edilebilir; oyun içi gösterge #cqhud, üretim ekranında #cqbar. Envanterde eşya açıklaması paneli genişletiyordu: #info genişliği 332 px ve yüksekliği sabit"
},
{
"n": 55,
"t": "Köylüler ve kapılar",
"x": "Köylüler akşam kapı kasasına takılmıyor (kapı eksenini izleyerek girer/çıkar, gece engelde kayar; sabah kapıdan çıkış aynı eksende); köy tezgâhlarından biri ev köşe duvarını eziyordu, ev dışına alındı (js/dunya/uretim.js: O.BENCH konumu)"
},
{
"n": 54,
"t": "Kazma ipucu ve envanter paneli",
"x": "Kazma/kesme ipucundan verim çarpanı kaldırıldı; envanterde eşya açıklama alanı sabit yükseklikte (#info min-height) olduğundan eşyaya tıklayınca panel büyümez"
},
{
"n": 53,
"t": "Etkileşim odağı tekleştirildi",
"x": "Etkileşim odağı tekleştirildi; E ile etkileşim adayları (köylü, sandık, mağara) daha dar açıyla (cos > .85–.9) algılanır, nişanın değdiği nesne adaydan belirgin biçimde yakınsa aday listelenmez ve ipucunda aynı anda iki etkileşim gösterilmez (useCands, hud nişan ipucu)"
},
{
"n": 52,
"t": "El Taşı tarifi kaldırıldı",
"x": "El Taşı ücretsiz tarifi kaldırıldı (aleti olmayan oyuncu E ile kayadan toplar, kaya başına günde bir: ACT[O.ROCK], HG.extBare); ölüm ekranı (#bResp Yeniden Doğ, showDeath); sahil doğma noktaları (x2.sp, genCoast); kısayollar sayfası kaldırıldı, sabit kontroller Ayarlar › Kontrol sayfasında (js/cekirdek/tuslar.js; F1 artık geliştirici konsolunu açar); bakır damarında kristal yok, ağaç gövdesi daha derine gömülü ve ayrı kök kolları kaldırıldı"
},
{
"n": 51,
"t": "Büyük genişleme",
"x": "Çok oyunculu için hazırlık katmanı (oyuncu soyutlaması, olay yolu, dünya değişiklik günlüğü, dünya kodu). Yeni eşyalar ve yapılar: Depo Sandığı, Tabela, Arı Kovanı, Balık Tuzağı, Hazine Haritası, Kürek, Kalkan, Çizme, Köpek Yavrusu, bal ürünleri, merhem, çay. Ayı ve Köpek türleri. Mevsimler, ıslaklık, ateş (hastalık), barış kipi, ölüm kuralları (mezar çantası, doğma noktası, kalıcı ölüm). Köpek yoldaş, kışın uyuyan ayılar, Gezgin Tüccar, köy itibarı ve indirim, söylentiler, günlük meydan okumalar. Sandık penceresi, tabela düzenleyici, tarif arama ve çoklu üretim, ses altyazıları, hasar sayıları, harita işaretleri, oyun kolu desteği."
},
{
"n": 49,
"t": "Yeni eşyalar ve tarifler",
"x": "Yeni eşyalar: eşyaları (tohum, buğday, ekmek, güveç, meyve suyu, kurutulmuş yiyecek, mantar, yumurta, tüy, merhem, şişedeki mesaj, zırh, Demir Mızrak, Dürbün), yeni yapı tarifleri, tavuk türü"
},
{
"n": 0,
"t": "Önceki sürümler (1–48)",
"x": "İlk sürümlerden itibaren oyunun temeli kuruldu: ada üretimi, gündüz/gece döngüsü, hayatta kalma göstergeleri, envanter ve üretim, Rust tarzı inşa, köyler ve ticaret, hayvanlar ve avcılık, dalış ve sal, tarım, rehber hedefleri, kayıt sistemi ve ayarlar. Bu aşamalar tek tek kayda geçirilmediği için ayrı ayrı listelenmemiştir."
}
];
