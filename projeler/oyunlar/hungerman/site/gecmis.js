/* HungerMan güncelleme geçmişi
   Yeni sürüm eklerken ilgili grubun "y" listesinin en başına yazın. Yeni bir ara sürüm (0.42 gibi) için listenin başına yeni grup ekleyin.
   g: grup sürümü, b: grubun başlığı, y: yamalar { s: sürüm, b: başlık, m: maddeler } */
window.GECMIS = [
{ g: '0.43', b: 'Hareket', y: [
  { s: '0.43.0', b: 'Fizik ve hareket', m: [
    'Tuşu bırakınca karakter artık kayıp gitmiyor, net duruyor. Havada ise hızınız korunuyor.',
    'Koşarak zıplayınca biraz daha uzağa gidiyorsunuz.',
    'Kenardan çıktığınız anda zıplamaya bir an geç kalsanız da zıplıyorsunuz. Hızlıca basılan zıplama da kaybolmuyor.',
    'Zıplarken başınız bir köşeye takılırsa yana kayıp yükselmeye devam ediyorsunuz.',
    'Yüksekten inince kamera hafifçe çöküyor, ayak sesi duyuluyor.',
    'Vuruşlar sizi gücüne göre savuruyor; boss darbeleri gerçekten fırlatıyor.',
    'Suda yavaşça batıyorsunuz, dalmak için C. Suya düşen eşyalar yüzeye çıkıp akıntıyla sürükleniyor, tekneler de akıntıya kapılıyor.'
  ]}
]},
{ g: '0.42', b: 'Kararlılık', y: [
  { s: '0.42.0', b: 'Hatalar ve kararlılık', m: [
    'Bir dünyanın kaydı bozulursa oyun artık takılıp kalmıyor; dünya son sorunsuz açılıştaki hâliyle açılıyor.',
    'Yedek kopya artık dünya düzgünce açıldıktan sonra alınıyor, bozuk kayıt yedeğin üstüne yazılmıyor.',
    'Envanter açıkken elinizde tuttuğunuz eşya, sekme kapansa bile kaybolmuyor.',
    'Bloğun içine sıkışan oyuncu ve canlılar yukarıdaki boş yere çıkıyor. Dünyanın altına düşen oyuncu yüzeye konuyor.',
    'Tek bir canlıdaki hata artık bütün oyunu dondurmuyor.',
    'Çok oyunculuda sandık açıkken bağlantı koparsa eşyalar çoğalmıyor ya da kaybolmuyor.'
  ]}
]},
{ g: '0.41', b: 'Yeni dünya', y: [
  { s: '0.41.12', b: 'Dünya oluşumunda hata avı ve akan su', m: [
    'Mağaralarda havada asılı duran su duvarları artık yok. Yeraltı gölleri parça parça dolduruluyordu, sınırlarda su katmanları kalıyordu.',
    'Yamaçlardaki tek blokluk yarıklar ve tarak gibi görünen kaya yüzleri düzeltildi.',
    'Mağara girişlerinde yüzeyin hemen altında havada kalan ince toprak tabakaları giderildi.',
    'Geniş mağara salonları lav düzeyine kadar inip lav denizi oluşturuyordu. Salonlar artık daha yukarıda, lav sadece derin tünellerde.',
    'Havada duran kum, çakıl ve tek tük taş blokları üretimde temizleniyor.',
    'Aşağı akan suyun yüzeyi artık akıyormuş gibi kayıyor. Şelaleler sonunda donmuş perde gibi durmuyor.'
  ]},
  { s: '0.41.11', b: 'Devrik kütükler', m: [
    'Yan yana düşen iki devrik kütük birbirine girip L ya da T biçimi oluşturabiliyordu. Her kütük artık kendi alanında kalıyor.'
  ]},
  { s: '0.41.10', b: 'Sesler yerini buldu', m: [
    'Canlı sesleri, oklar, ateş topları ve diğer oyuncuların blok sesleri artık nereden geliyorsa oradan duyuluyor. Sağdaki zombi sağ kulaktan gelir.',
    'Araya giren bloklar sesi kısıyor. Birkaç blok aşağıdaki örümceği boğuk duyarsınız, on blok aşağıdakini hiç duymazsınız.',
    'Su altında her şey boğuklaşıyor, mağarada sesler hafifçe yankılanıyor.'
  ]},
  { s: '0.41.9', b: 'Daha sakin su', m: [
    'Şelale sesi kaldırıldı. Nehir ve şelale kenarında sadece hafif bir akarsu sesi var.',
    'Akarsu sesi üçte bire, tekne sürerken duyulan dalga sesi yarıya indi.'
  ]},
  { s: '0.41.8', b: 'Ufak ama gerekli düzeltmeler', m: [
    'Yeni dünyada ilk dakikalarda göl ve nehir suyunun yandaki mağaralara boşalması durduruldu.',
    'Sık su değişikliklerinde gereksiz yeniden çizim ve takılmalar azaldı.',
    'Göl tabanı ve sık orman zemini yeni ışık sisteminde fazla kararıyordu, eski aydınlığına döndü.'
  ]},
  { s: '0.41.7', b: 'Doğal kayalar', m: [
    'Çayırlarda rastgele duran parke taşı yığınları kaldırıldı. Parke taş işlenmiş malzeme, doğada yeri yok.',
    'Kayalar artık sadece taşlık arazide çıkıyor ve doğal taştan, granitten ya da kum taşından oluşuyor.'
  ]},
  { s: '0.41.6', b: 'Yeni çalı modeli', m: [
    'Çalılar yere bırakılmış yaprak blokları gibi duruyordu. Yerlerine kendi modeli olan alçak, kümeli bir bitki geldi.',
    'Beş tür var: Çalı, Büyük Çalı, Ladin Çalısı, Savan Çalısı ve Sonbahar Çalısı.'
  ]},
  { s: '0.41.5', b: 'Daha az çiçek', m: [
    'Çiçekli çayırda yerin neredeyse üçte biri çiçekti. Artık seyrek öbekler hâlinde çıkıyorlar.',
    'Çalılar da daha seyrek ve kütüksüz.'
  ]},
  { s: '0.41.4', b: 'Kum ve çakıl düşüyor', m: [
    'Altı boşalan kum, çakıl ve kızıl kum aşağı düşüp ilk katı zemine yerleşiyor.',
    'Düşerken ottan, çiçekten ve sudan geçer. Meşale gibi katı olmayan bloklara tutunur.'
  ]},
  { s: '0.41.3', b: 'Işık sistemi baştan yazıldı', m: [
    'Gökyüzü ışığı artık her yöne yayılıyor. Mağara ağızları ve çıkıntı altları zifiri karanlık kalmıyor.',
    'Işık komşu parçalardan gelen aydınlığı da hesaba katıyor, parça sınırlarında ton farkı oluşmuyor.',
    'Nehirlerin parça sınırında yarıda kesilmesi ve havada kalan sular düzeltildi.'
  ]},
  { s: '0.41.2', b: 'Arazi ve biyom düzeltmeleri', m: [
    'Kızıl kayalıkların tepeleri yanlışlıkla dağ sayılıyordu.',
    'Çöldeki kum tepeleri basamak basamak olmuyor, çok yüksek zirveler düz kesik durmuyor.',
    'Kayalık tepelerin zemini bulunduğu iklime uyuyor: çölde kum, soğukta karlı çimen.'
  ]},
  { s: '0.41.1', b: 'Uzak arazi kaldırıldı', m: [
    'Uzaktaki dağları kaba gösteren uzak arazi katmanı kaldırıldı. Dünya yine görüş mesafesi kadar tam çiziliyor, ötesi sise karışıyor.',
    'Mağara ağızları daha aydınlık.'
  ]},
  { s: '0.41.0', b: 'Yeni dünya üreticisi', m: [
    'Dünya iki kat yükseldi (256 blok) ve epey genişledi. Kıtanın çapı yaklaşık 8000 blok.',
    'Sivri zirveler, keskin sırtlar, basamaklı vadiler, platolar. Bazı dağlar 200 bloğu aşıyor.',
    'Dağlardan denize inen kıvrımlı nehirler, basamaklarda şelaleler, yüksek göller.',
    'Yeni alt biyomlar: Çiçekli Çayır, Sık Orman, Sonbahar Ormanı, Kayalık Tepeler, Karlı Zirveler, Mangrov, Mantar Adası, Kızıl Kayalıklar, Göl, Taşlı Kıyı, Yalıyar.',
    'Dev meşeler ve dev ladinler, devrik kütükler, ateş böcekleri, bataklık sisi, kuş ve kurt sesleri.',
    'Eski dünyalar eski üreticiyle açılmaya devam eder, hiçbir şey bozulmaz.'
  ]}
]},
{ g: '0.40', b: 'Gerçek sesler', y: [
  { s: '0.40.9', b: 'Ana menü arka planı yenilendi', m: ['Ana menüdeki manzara yüksek çözünürlükte yeniden çekildi, bulanıklık gitti.'] },
  { s: '0.40.8', b: 'Yeni ana menü', m: ['Menünün arka planında artık oyunun kendi motoruyla çekilmiş bir gün batımı manzarası var.'] },
  { s: '0.40.7', b: 'Arı kovanları seyreldi', m: ['Kovanlar ağaçların yüzde 7\'sinde çıkıyordu, yüzde 1,2\'ye indi.'] },
  { s: '0.40.6', b: 'Düzenli olay kaydı', m: ['Konsoldaki olaylar hizalı sütunlarla yazılıyor; arama, düzey ve tür süzgeci eklendi.'] },
  { s: '0.40.5', b: 'Konsolda dünya kaydı', m: ['Dünyada olan biten her şey oyun saatiyle konsola yazılıyor. Yeni komut: kayit.'] },
  { s: '0.40.4', b: 'Düşme hasarı', m: [
    '3 bloğa kadar hasar yok, sonrası hızla artıyor. 12 bloktan düşmek tam canlı oyuncuyu öldürür.',
    'Yün, saman balyası, yaprak ve kar düşüşü yumuşatır. Suya düşmek hasarsız.',
    'Yüksekten düşünce bacak kırılabilir.'
  ]},
  { s: '0.40.3', b: 'Doğma noktası yatak', m: ['Doğma noktası artık sadece son kullanılan yatak. Yatak yoksa güvenli, rastgele bir yerde doğarsınız.'] },
  { s: '0.40.2', b: 'Ses dengesi', m: ['Bütün kayıtlar tek tek dinlendi, düzeyleri dengelendi. Aynı anda çok ses çalınca çıkan cızırtı giderildi.'] },
  { s: '0.40.1', b: 'Pencere sesleri', m: ['Envanter ve harita gibi pencereler açılırken çalan ses kaldırıldı.'] },
  { s: '0.40.0', b: 'Gerçek sesler', m: ['Kodla üretilen seslerin neredeyse tamamı gerçek kayıtlarla değişti. Hayvanlar, canavarlar, yağmur, gök gürültüsü, eşyalar ve arayüz yeniden seslendirildi.'] }
]},
{ g: '0.39', b: 'Büyülü Anahtar ve Kül Devi', y: [
  { s: '0.39.2', b: 'Kül zombisi lavda yüzer', m: ['Kül zombisi lava düşünce batmıyor, yüzüp kenardan çıkıyor.'] },
  { s: '0.39.1', b: 'Hata düzeltmesi', m: ['Eli boşken bloğa sağ tıklayınca çıkan hata giderildi.'] },
  { s: '0.39.0', b: 'Kayıt noktası, Büyülü Anahtar, Kül Devi', m: [
    'Ölüm ekranında artık iki seçenek var: son kayıt noktasında ya da rastgele bir yerde doğmak.',
    'Geçit çakmakla açılmıyor. Ada Bekçisi\'ni yenince düşen Büyülü Anahtar gerekiyor.',
    'Lanetli Ada\'yı Kül Devi koruyor: üç blok boyunda, 260 canlı, ateşe bağışık bir dev.'
  ]}
]},
{ g: '0.38', b: 'Lanetli Ada', y: [
  { s: '0.38.5', b: 'Çakmak uyarısı', m: ['Gereksiz "Geçit burada açılamaz" uyarısı kaldırıldı.'] },
  { s: '0.38.4', b: 'Çapa ve ekim', m: ['Tohumlar artık sadece çapalanmış tarla toprağına ekiliyor.'] },
  { s: '0.38.3', b: 'Mobilya titremesi', m: ['Üst üste binen yüzeyler yüzünden titreyen mobilya dokuları düzeltildi.'] },
  { s: '0.38.2', b: 'Kaydırma çubukları', m: ['Beyaz tarayıcı çubukları yerine oyunun temasına uyan ince çubuklar.'] },
  { s: '0.38.1', b: 'İşlevsel çakmak', m: ['Çakmak kamp ateşi, şömine ve balkabağı fenerini yakıyor; otu ve örümcek ağını tutuşturuyor.'] },
  { s: '0.38.0', b: 'Lanetli Ada ve Ada Bekçisi', m: [
    'Ada artık kıtadan çok uzakta, ıssız açık denizde.',
    'Obsidyen yarlar, kül kumu kıyılar, magma çatlakları ve ortasında bir tapınak avlusu.',
    'Geçidi güçlendirilmiş bir diyar yaratığı bekliyor.'
  ]}
]},
{ g: '0.37', b: '115 yeni eşya ve blok', y: [
  { s: '0.37.0', b: 'Mobilya, dekor ve yapı blokları', m: [
    'Kanepe, gardırop, yemek masası gibi çok bloklu mobilyalar.',
    'Daktilo, gramofon, dünya küresi, duvar saati gibi küçük süsler.',
    'Mermer, granit, bazalt, kayrak, kerpiç ve çeşitleri.',
    'Hançer, mızrak, savaş çekici ve en güçlü alet seti olan obsidyen aletler. Dürbün de geldi.'
  ]}
]},
{ g: '0.36', b: 'Mutfak', y: [
  { s: '0.36.1', b: 'Yeni yatak', m: ['Yatak iki blok uzunluğunda, oymalı başlıklı bir karyolaya dönüştü. R ile döndürülüyor.'] },
  { s: '0.36.0', b: 'Mutfak ve yemek etkileri', m: [
    'Un, tuz, tereyağı, hamur, salça gibi malzemeler ve Değirmen Taşı, Tandır, Mutfak Tezgâhı.',
    'Pide, simit, börek, mantı, lahmacun, Adana kebap, sütlaç, lokum ve dahası.',
    'Yemekler etki veriyor: Maden Gücü, Direnç, Şans, Hafiflik, Odak.'
  ]}
]},
{ g: '0.35', b: 'Köy uzmanlıkları', y: [
  { s: '0.35.1', b: 'Baskınlar kapatıldı', m: ['Köy baskınları şimdilik kapalı.'] },
  { s: '0.35.0', b: 'Her köy bir işte usta', m: [
    'Köyler artık tek bir alanda ünlü: tarım, demircilik, ticaret, bilgelik, çobanlık, odunculuk, balıkçılık.',
    'İstasyona sağ tıklayınca sadece o istasyonun tarifleri listeleniyor.'
  ]}
]},
{ g: '0.34', b: 'Tarım', y: [
  { s: '0.34.1', b: 'Düzeltmeler', m: ['Kıyafetle zırhın iç içe girmesi ve köy evlerinin üst üste kurulması giderildi.'] },
  { s: '0.34.0', b: 'Yeni ekinler ve meyve ağaçları', m: [
    'Domates, biber, mısır, soğan, lahana, pamuk, çilek ve karpuz.',
    'Her ekinin sevdiği bir mevsim var, çoğu kışın büyümüyor.',
    'Elma, kiraz, portakal ve zeytin ağaçları.'
  ]}
]},
{ g: '0.33', b: 'İstasyonlar ve hava', y: [
  { s: '0.33.0', b: 'İşleyen istasyonlar, bölgesel hava, kıyafetler', m: [
    'Fırın ve kamp ateşinin kendi yakıt ve pişirme yuvaları var.',
    'Hava artık her yerde aynı değil. Yağmur bulutları rüzgârla sürükleniyor; birkaç yüz blok ötede güneş olabilir.',
    'Soğuğa ve sıcağa karşı kıyafetler.'
  ]}
]},
{ g: '0.32', b: 'Köylüler', y: [
  { s: '0.32.0', b: 'Köylü seviyeleri, ticaret, görevler', m: [
    'Köylüler takas yaptıkça ustalaşıyor: Çırak, Kalfa, Usta, Üstat. Her seviyede yeni takaslar açılıyor.',
    'Yeni meslekler: Mimar, Kütüphaneci, Çoban.',
    'Çok alınan eşya pahalanıyor. Her köylünün bir günün fırsatı var.'
  ]}
]},
{ g: '0.31', b: 'Yapı ve dekorasyon', y: [
  { s: '0.31.0', b: 'Yeni yapı blokları, merdiven ve yarım bloklar', m: [
    'Akasya kalası, cilalı taş, parke ve kareli zemin gibi yeni bloklar.',
    'Birçok malzeme için merdiven ve yarım blok.'
  ]}
]},
{ g: '0.30', b: 'Envanter ve Lanetli Ada', y: [
  { s: '0.30.7', b: 'Tuşlar değiştirilebilir', m: ['Ayarlar > Kontroller bölümünden 22 eylemin tuşu değiştirilebiliyor.'] },
  { s: '0.30.6', b: 'Lanetli Ada', m: ['Yeraltı Diyarı\'nın dünyadaki tek girişi: Issız Deniz\'deki Lanetli Ada.'] },
  { s: '0.30.5', b: 'Akan su', m: ['Su artık akıyor: altı boşsa düşüyor, değilse yanlara yayılıyor.', 'Canavarlar kapalı kapının arkasından vuramıyor.'] },
  { s: '0.30.4', b: 'Bilgi baloncukları', m: ['İstasyon simgelerinde ipuçları. Dünya ayarları oluşturulduktan sonra değişmiyor.'] },
  { s: '0.30.3', b: 'Envanter hataları', m: ['Kategoriler arası geçişte takılma ve kaybolan düğmeler düzeltildi.'] },
  { s: '0.30.2', b: 'Üretim üst bölümü', m: ['Arama çubuğu, sıralama düğmeleri ve simgeli kategori şeridi.'] },
  { s: '0.30.1', b: 'Üretim paneli', m: ['Tarif arama, favoriler ve Shift + tıkla toplu üretim.'] },
  { s: '0.30.0', b: 'Yeni envanter ekranı', m: ['Ortada giydiğiniz zırhla birlikte dönen canlı bir karakter önizlemesi ve yanında durum paneli.'] }
]},
{ g: '0.29', b: 'Ocak ve ısıtıcı', y: [
  { s: '0.29.2', b: 'Ana menü ekranları', m: ['Dünyalar ekranında arama ve sıralama; yeni dünya ekranı iki sütuna geçti.'] },
  { s: '0.29.1', b: 'Dünya ayarları', m: ['Vücut ısısı ve geliştirici konsolu dünya oluşturulurken seçiliyor.'] },
  { s: '0.29.0', b: 'Ocak, ısıtıcı, taret cephanesi', m: ['Elektrikli ocak ve ısıtıcı yeni tasarımlarıyla geldi. Taret artık ok harcıyor.'] }
]},
{ g: '0.28', b: 'Jeneratör ve taret', y: [
  { s: '0.28.0', b: 'Jeneratör, otomatik taret, hareket algılayıcı, fıskiye', m: [
    'Kömür ya da odunla çalışan jeneratör.',
    'Yakındaki canavarlara ok atan otomatik taret.',
    'Canlı yaklaşınca devreyi açan hareket algılayıcı ve tarlaları sulayan fıskiye.'
  ]}
]},
{ g: '0.27', b: 'Elektrik bağlantıları', y: [
  { s: '0.27.0', b: 'Giriş ve çıkış soketleri', m: ['Her cihazın ayrı giriş ve çıkışı var, güç kablolarla tek yönde akıyor. Dağıtıcı ve birleştirici eklendi.'] }
]},
{ g: '0.26', b: 'Şalter ve lambalar', y: [
  { s: '0.26.0', b: 'Gerçekçi şalter, lamba ve bataryalar', m: ['Lamba konduğu yüzeye göre biçim alıyor: ayaklı, sarkıt ya da aplik. Kablolar sarkıyor.'] }
]},
{ g: '0.25', b: 'Çok bloklu cihazlar', y: [
  { s: '0.25.0', b: 'Gerçek boyutlu cihazlar', m: ['Güneş paneli ve türbin gibi cihazlar gerçek boyutlarında. Yerleştirirken önizleme çıkıyor, R ile döndürülüyor.'] }
]},
{ g: '0.24', b: 'Elektrik', y: [
  { s: '0.24.0', b: 'Elektrik sistemi', m: ['Güneş paneli, rüzgâr ve su türbini; üç boy batarya; kablolar.'] }
]},
{ g: '0.23', b: 'Büyük temizlik', y: [
  { s: '0.23.3', b: 'Tek özel yapı', m: ['Her tapınak, kule ve kamp dünyada artık yalnızca bir tane.'] },
  { s: '0.23.2', b: 'Sade can çubuğu', m: ['Canlıların üstündeki can çubuğu inceldi.'] },
  { s: '0.23.1', b: 'Bakılan nesne', m: ['Bakılan bloğun adı sol alt köşeye taşındı.'] },
  { s: '0.23.0', b: 'Sorun giderme', m: ['Alev ve meşale titriyor, lav akıyor. Yerdeki eşyaların soluk renkleri düzeldi. Elde tutulan aletler daha doğal duruyor.'] }
]},
{ g: '0.22', b: 'Hayatta kalma', y: [
  { s: '0.22.0', b: 'Vücut ısısı', m: [
    'Sağ altta vücut sıcaklığı ve hissedilen hava sıcaklığı.',
    'Biyom, mevsim, saat, yükseklik, yağmur ve ıslaklık sıcaklığı etkiliyor. Çölde geceler soğuk.',
    'Ateş, meşale, lav ve fener ısıtıyor.'
  ]}
]},
{ g: '0.21', b: 'Tarım ve hayvancılık', y: [
  { s: '0.21.0', b: 'Balkabağı, şeker kamışı, kova', m: ['Balkabağı ve şeker kamışı yetiştirme. Kovayla su taşıma ve inek sağma.'] }
]},
{ g: '0.20', b: 'Eksikler', y: [
  { s: '0.20.0', b: 'Bilinen eksiklerin giderilmesi', m: ['Geciktirici bloğu, mevsime göre değişen gün uzunluğu: yazın gündüzler uzun, kışın kısa.'] }
]},
{ g: '0.19', b: 'Ses ve dokunmatik', y: [
  { s: '0.19.0', b: 'Gerçek sesler, müzik ve dokunmatik kontroller', m: ['Adım ve kazma sesleri zemine göre değişiyor. Telefon ve tablet için dokunmatik kontroller.'] }
]},
{ g: '0.18', b: 'Mevsimler', y: [
  { s: '0.18.0', b: 'Mevsimler ve Yeraltı Diyarı', m: [
    'Yıl 28 gün, her mevsim 7 gün. Sonbaharda yapraklar kızarıyor, kışın kar yağıyor ve göller donuyor.',
    'Yeraltı Diyarı ilk kez açıldı.'
  ]}
]},
{ g: '0.17', b: 'Mekanizmalar', y: [
  { s: '0.17.0', b: 'Mekanik bloklar ve Tarif Kitabı', m: ['Kol, düğme, basınç plakası ve bakır tel. Bütün tarifleri gösteren Tarif Kitabı (B).'] }
]},
{ g: '0.16', b: 'Evcil hayvanlar', y: [
  { s: '0.16.0', b: 'Evcil hayvanlar, binekler, yemek pişirme, mobilya', m: ['Kurda kemik verip köpek, balıkla kedi edinme. Ata binme. İlk mobilyalar.'] }
]},
{ g: '0.15', b: 'Bosslar', y: [
  { s: '0.15.4', b: 'Buzul Kulesi yeniden', m: ['Sarmal merdivenli, vitray pencereli yeni kule.'] },
  { s: '0.15.3', b: 'Haydut Kampı yeniden', m: ['Hendekli, kazıklı, kuleli bir kamp.'] },
  { s: '0.15.2', b: 'Çöl Tapınağı yeniden', m: ['Sfenksler, dikilitaşlar ve havuzlu avlu.'] },
  { s: '0.15.1', b: 'Düzeltmeler', m: ['Envanter Q, etkileşim E, eşya atma G oldu.'] },
  { s: '0.15.0', b: 'Yeni yapılar ve boss savaşları', m: ['Çöl Tapınağı, Orman Tapınağı, Buzul Kulesi ve Haydut Kampı; her birinin sonunda bir boss.'] }
]},
{ g: '0.14', b: 'Büyü', y: [
  { s: '0.14.0', b: 'Yeni canavarlar, büyü, başarımlar', m: ['Mumya, Boğulmuş Zombi, Buz İskeleti ve Yarasa. Büyü Masası ve ilk başarımlar.'] }
]},
{ g: '0.13', b: 'Biyomlar', y: [
  { s: '0.13.0', b: 'Biyomlar ve mağaralar düzenlendi', m: ['İklim geniş ve yumuşak geçişli. Çöl ile karlı bölge artık yan yana gelmiyor.'] }
]},
{ g: '0.12', b: 'Geliştirici penceresi', y: [
  { s: '0.12.0', b: 'Geliştirici penceresi yenilendi', m: ['Sekmeler solda, her şey başlıklı bölümlerde.'] }
]},
{ g: '0.11', b: 'Hava durumu', y: [
  { s: '0.11.0', b: 'Yağmur, kar ve fırtına', m: ['Yağmur çatı altına yağmıyor, fırtınada gökyüzü kararıyor.'] }
]},
{ g: '0.10', b: 'Düzeltmeler', y: [
  { s: '0.10.1', b: 'Deniz feneri', m: ['Fenerin ışığı kristale bağlandı; kristal kırılınca sönüyor.'] },
  { s: '0.10.0', b: 'Düzeltmeler ve geliştirici penceresi', m: ['El artık duvarların içine girmiyor. Tekneden inmek sadece C ile.'] }
]},
{ g: '0.9', b: 'Geliştirici modu', y: [
  { s: '0.9.0', b: 'Geliştirici modu', m: ['Komut izni yeni dünya ekranında seçiliyor. Komut yazmadan test yapmayı sağlayan pencere (F9).'] }
]},
{ g: '0.8', b: 'Konsol', y: [
  { s: '0.8.0', b: 'Geliştirici konsolu ve kanyonlar', m: ['F8 ile açılan konsol. Tek blokluk çatlaklar yerine kıvrılan, geniş kanyonlar.'] }
]},
{ g: '0.7', b: 'Harita', y: [
  { s: '0.7.0', b: 'Keşif haritası', m: ['Gezdiğiniz her yer haritaya işleniyor. Mini harita, büyük harita (M) ve işaretler.'] }
]},
{ g: '0.6', b: 'Çok oyunculu', y: [
  { s: '0.6.0', b: 'Arkadaşlarla oynama', m: ['Dünyanızı 6 karakterlik bir kodla açıp 8 kişiye kadar birlikte oynayabilirsiniz. Ayrı bir sunucu gerekmiyor.'] }
]},
{ g: '0.5', b: 'Deniz', y: [
  { s: '0.5.0', b: 'Su altı ve tekneler', m: ['Mercan resifleri, batık gemiler, balıklar ve köpekbalıkları. Olta, dalış maskesi, palet, sandal ve yelkenli. Limanlar ve deniz fenerleri.'] }
]},
{ g: '0.4', b: 'Derinlikler', y: [
  { s: '0.4.0', b: 'Mağaralar, zindanlar, iskeletler', m: ['Lav gölleri, kanyonlar, parıltı kristalleri, zindanlar. Okçu iskelet ve mağara örümceği.'] }
]},
{ g: '0.3', b: 'Köyler', y: [
  { s: '0.3.0', b: 'Köyler, ticaret, görevler', m: ['Köylüler, sikkeyle takas, görevler ve itibar. Buğday ekimi ve sandıklar.'] }
]},
{ g: '0.2', b: 'Canlılar', y: [
  { s: '0.2.0', b: 'Hayvanlar, zombiler, savaş', m: ['İnek, koyun, domuz, tavuk, tavşan, kurt. Geceleri zombiler. Kılıç, yay, zırh ve yatak.'] }
]},
{ g: '0.1', b: 'Başlangıç', y: [
  { s: '0.1.0', b: 'İlk sürüm', m: ['Tohumdan üretilen kıta, nehirler, dağlar, mağaralar. Kazma, odun kesme, üretim, açlık ve gece-gündüz.'] }
]}
];
