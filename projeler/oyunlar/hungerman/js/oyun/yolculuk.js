/* HungerMan - 0.46.0: Yolculuk (ilerleme yolu)
   Oyunun başından Yeraltı Diyarı'na uzanan, sırayla açılan bölümler. Her bölüm birkaç adımdan oluşur; adımlar başarımlara bağlıdır
   (bir adım, listedeki başarımlardan biri kazanılınca tamamlanır). Bölümün bütün adımları bitince ödülü verilir ve sonraki bölüm açılır.
   Görev günlüğünde (J) "Yolculuk" sekmesinde ve ekrandaki görev izleyicide sıradaki adım gösterilir.
   Durum dünya kaydında (çok oyunculuda oyuncu kaydında, başarımlarla birlikte) saklanır. */

/* adim: [metin, [başarım anahtarları], ipucu] */
export const BOLUMLER = [
  { ad: 'İlk Gün', aciklama: 'Elinizde hiçbir şey yok. Önce alet, sonra güvenli bir köşe.', adimlar: [
    ['Bir ağaçtan kütük topla', ['odun'], 'Ağaca bakıp sol tıkı basılı tutunuz.'],
    ['Üretim Masası yap', ['masa'], 'Q ile envanteri açınız: kütük → kalas → masa.'],
    ['Bir kazma üret', ['kazma'], 'Masanın yanında 3 kalas ve 2 çubukla.'],
    ['Taş kazmaya geç', ['tasKazma'], 'Tahta kazmayla taş kırınız; 3 parke taşı yeter.']
  ], odul: { xp: 8, esya: [[46, 8], [293, 3]] } },
  { ad: 'İlk Gece', aciklama: 'Hava kararmadan karnınızı doyurun ve başınızı sokacak bir yer bulun.', adimlar: [
    ['Pişmiş bir yiyecek ye', ['pisir'], 'Eti kamp ateşinde ya da fırında pişiriniz.'],
    ['Bir yatakta uyu', ['uyku'], 'Yatak için üç yün gerekir; koyunları arayınız.'],
    ['Bir canavar yen', ['canavar'], 'Geceleri zombiler çıkar. Kılıç işinizi kolaylaştırır.']
  ], odul: { xp: 12, esya: [[268, 3], [274, 4]] } },
  { ad: 'İnsanlar', aciklama: 'Kıtada yalnız değilsiniz. Köyler ticaret, görev ve güvenlik demek.', adimlar: [
    ['Bir köye ulaş', ['koy'], 'Mini haritadaki ev simgelerine bakınız; köylüler söylentilerle yol da gösterir.'],
    ['Bir köylüyle ticaret yap', ['ticaret'], 'Köylüye E ile konuşunuz.'],
    ['Bir köy görevini tamamla', ['gorev'], 'Görevler sikke, deneyim ve itibar kazandırır.']
  ], odul: { xp: 15, esya: [[288, 12], [293, 4]] } },
  { ad: 'Demir Çağı', aciklama: 'Derine inmeye hazırlanın.', adimlar: [
    ['Demir külçe elde et', ['demir', 'zirh'], 'Ham demiri fırında eritiniz. Demir 70. seviyenin altında bulunur.'],
    ['Tam takım demir zırh giy', ['zirh'], 'Kask, göğüslük, pantolon ve bot.'],
    ['12. seviyenin altına in', ['derin'], 'F3 ile yüksekliğinizi görebilirsiniz. Lava dikkat ediniz.']
  ], odul: { xp: 20, esya: [[290, 1], [289, 1]] } },
  { ad: 'Derinlikler', aciklama: 'Elmaslar ve unutulmuş yapılar.', adimlar: [
    ['Elmas bul', ['elmas', 'elmasZirh'], 'Elmas 16. seviyenin altındadır.'],
    ['Bir zindan, batık ya da maden keşfet', ['zindan', 'batik', 'maden'], 'Köylülerin söylentileri yerlerini işaret eder.'],
    ['Bir eşyayı büyüle', ['buyu'], 'Büyü Masası: 2 elmas, 2 parıltı kristali, 4 kesme taş.']
  ], odul: { xp: 30, esya: [[264, 2], [61, 3]] } },
  { ad: 'Efsaneler', aciklama: 'Dünyada dört eski yapı ve onları koruyan dört güç var.', adimlar: [
    ['Özel bir yapının sandığını aç', ['tapinak', 'ormanTapinak', 'kule', 'kamp'], 'Çöl Tapınağı, Orman Tapınağı, Buzul Kulesi ya da Haydut Kampı.'],
    ['Bir bossu yen', ['firavun', 'buzbuyucu', 'reis', 'muhafiz'], 'Bosslar canları yarıya inince hızlanır. Hazırlıklı gidiniz.'],
    ['Kanlı Ay gecesini atlat', ['kanliAy'], 'Her mevsimin son gecesi gökyüzü kızarır.']
  ], odul: { xp: 40, esya: [[290, 2], [493, 1]] } },
  { ad: 'Lanetli Ada', aciklama: 'Yeraltı Diyarı\'nın tek kapısı, kıtadan çok uzakta, açık denizde.', adimlar: [
    ['Bir tekneye bin', ['tekne'], 'Sandal ya da yelkenli yapınız; balıkçı köylüler de satar.'],
    ['Lanetli Ada\'ya ayak bas', ['gecit'], 'Ada ıssız denizin ortasındadır; söylentilere kulak veriniz.'],
    ['Yeraltı Diyarı\'na gir', ['diyar'], 'Kül Devi\'nin bıraktığı Büyülü Anahtar geçidi açar.']
  ], odul: { xp: 50, esya: [[289, 2], [290, 2]] } },
  { ad: 'Ateşin Eşiği', aciklama: 'Diyarın derinliklerinde kül kaleleri yükselir.', adimlar: [
    ['Bir Kor Ruhu yen', ['korruhu'], 'Ateş topları tutuşturur; Ateşe Dayanıklılık İksiri korur.'],
    ['Bir Kül Kalesi\'ne ulaş', ['kale'], 'Kaleler diyarın lav denizleri arasındadır.'],
    ['Dört farklı bossu yen', ['bossHepsi'], 'Firavun, Buz Büyücüsü, Haydut Reisi ve Taş Muhafız.']
  ], odul: { xp: 80, esya: [[264, 5], [290, 3]] } }
];

export class Yolculuk {
  constructor(basarimlar) {
    this.b = basarimlar;
    this.bolum = 0;          // şu anki bölüm
    this.biten = [];         // ödülü verilmiş bölümler
    this.tamamlandi = null;  // (bolum, odul) => ödül ve bildirim
    this.degisti = null;
  }
  adimBitti(a) { return a[1].some(k => this.b.var(k)); }
  get bitti() { return this.bolum >= BOLUMLER.length; }
  /* Şu anki bölümün ilk bitmemiş adımı */
  siradaki() {
    if (this.bitti) return null;
    const B = BOLUMLER[this.bolum];
    return B.adimlar.find(a => !this.adimBitti(a)) || null;
  }
  /* Düzenli denetim: bölüm bitince ödül verilir ve sonraki bölüme geçilir (önceden kazanılmış başarımlarla birkaç bölüm birden geçilebilir) */
  denetle() {
    let degisti = false;
    while (!this.bitti && BOLUMLER[this.bolum].adimlar.every(a => this.adimBitti(a))) {
      const B = BOLUMLER[this.bolum];
      if (!this.biten.includes(this.bolum)) { this.biten.push(this.bolum); if (this.tamamlandi) this.tamamlandi(B, this.bolum); }
      this.bolum++; degisti = true;
    }
    if (degisti && this.degisti) this.degisti();
    return degisti;
  }
  disaAktar() { return { bolum: this.bolum, biten: this.biten }; }
  iceAktar(o) {
    if (o && Number.isFinite(o.bolum)) { this.bolum = Math.max(0, Math.min(BOLUMLER.length, o.bolum | 0)); this.biten = Array.isArray(o.biten) ? o.biten.filter(Number.isFinite) : []; }
    else {
      /* Eski kayıt: kazanılmış başarımlara göre bölüm belirlenir; ödüller yeniden verilmez */
      this.bolum = 0; this.biten = [];
      while (this.bolum < BOLUMLER.length && BOLUMLER[this.bolum].adimlar.every(a => this.adimBitti(a))) { this.biten.push(this.bolum); this.bolum++; }
    }
  }
}
