// SİTE AYARLARI: metinleri, kategorileri ve bağlantıları buradan düzenle
window.SITE = {
  name: 'Sabri Aydın',
  description: 'Teknoloji, kodlama ve video oyunları üzerine kişisel blog.',

  // Footer'ın ilk sütunundaki metin
  about: 'Teknoloji, kodlama ve video oyunları üzerine notlar. Beğendiğim şeyleri burada paylaşıyorum.',

  // Kategoriler: 'kısa-ad': 'Menüde görünen ad'
  // Yazıdaki kategori satırında (kategori) soldaki kısa adı kullan. Yeni kategori için buraya bir satır ekle.
  // Listede en yeni yazı üstte görünür (sıralama yazının tarihine ve saatine göre yapılır).
  categories: {
    windows: 'Windows Rehber',
    html: 'HTML Rehberi',
    htmlaraclari: 'HTML Araçları',
    linuxos: 'Linux İşletim Sistemleri',
    batch: 'Batch Rehberi',
    batchornek: 'Batch Uygulamaları',
    sistemaraclari: 'Sistem ve Bakım Araçları',
    medya: 'Medya Programları',
    ofis: 'Ofis ve Üretkenlik',
    guvenlik: 'Güvenlik ve Gizlilik',
    gelistirici: 'Geliştirici Araçları',
    eklentiler: 'Tarayıcı Eklentileri',
    araclar: 'Araçlar'
  },

  // Menüdeki alt kategori grupları: Kategoriler > Grup > Kategori
  // name: menüde görünen grup adı, key: adres için kısa ad, items: gruba giren kategorilerin kısa adları
  // Hiçbir gruba girmeyen kategoriler (ör. batch) menüde tek başına görünür. Grupları silersen menü düz liste olur.
  groups: [
    { key: 'windows', name: 'Windows', items: ['windows'] },
    { key: 'linux', name: 'Linux', items: ['linuxos'] },
    { key: 'html', name: 'HTML', items: ['html', 'htmlaraclari'] },
    { key: 'batch', name: 'Batch', items: ['batch', 'batchornek'] }
  ],

  // Ana menüde Kategoriler'in yanında görünen ek açılır menüler (Kategoriler içinde tekrar gösterilmez)
  // name: menüde görünen ad
  // link: açılır liste yerine doğrudan o kategoriye giden tek bir menü bağlantısı olur (örn. link: 'araclar').
  // items: sırayla gösterilir. Düz yazı ('eklentiler') tek kategoridir; { name, url } doğrudan bir bağlantıdır; { key, name, items } ise kendi alt kategorileri olan bir gruptur.
  // Menüler burada yazıldığı sırayla Kategoriler'in sağına dizilir.
  menus: [
    {
      name: 'Programlar',
      items: [
        { key: 'ucretsiz', name: 'Ücretsiz Programlar', items: ['sistemaraclari', 'medya', 'ofis', 'guvenlik', 'gelistirici'] },
        'eklentiler'
      ]
    },
    { name: 'Araçlar', link: 'araclar' },
    // Projeler: kategori değil, doğrudan bağlantılardan oluşan alt menüler. url alanına her projenin gerçek adresini yaz (Hunger hariç örnek adrestir).
    {
      name: 'Projeler',
      items: [
        { name: 'Oyunlar', items: [
          { name: 'Hunger (Tarayıcı Tabanlı)', url: 'oyunlar/hunger/' }
        ] },
        { name: 'Programlar', items: [
          { name: 'Parola Defteri', url: 'https://github.com/' },
          { name: 'IPRadar', url: 'https://github.com/' }
        ] },
        { name: 'Diğer', items: [
          { name: 'GTA SA: Mod Paketi', url: 'https://github.com/' }
        ] }
      ]
    }
  ],

  // Footer'ın son sütunundaki bağlantılar (istediğin kadar ekleyebilir veya silebilirsin)
  links: [
    { text: 'GitHub', url: 'https://github.com/' },
    { text: 'E-posta', url: 'mailto:ornek@eposta.com' }
  ]
};
