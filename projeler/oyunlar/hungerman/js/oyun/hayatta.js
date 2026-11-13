/* HungerMan - hayatta kalma değerleri: can, açlık, oksijen, yorgunluk, deneyim, iksir etkileri */
/* Deneyim: bir sonraki seviye için gereken puan */
export const seviyeIcin = L => (L < 15 ? 2 * L + 7 : L < 30 ? 5 * L - 38 : 9 * L - 158);

export class Hayatta {
  constructor() { this.xp = 0; this.etkiler = {}; this.buyuTohum = (Math.random() * 4294967295) >>> 0 || 1; this.sifirla(); this.olaylar = { hasar: null, olum: null, xp: null, seviye: null }; }
  /* Toplam deneyimden seviye ve ilerleme */
  get seviye() { let L = 0, x = this.xp; while (x >= seviyeIcin(L)) { x -= seviyeIcin(L); L++; } return L; }
  get ilerleme() { let L = 0, x = this.xp; while (x >= seviyeIcin(L)) { x -= seviyeIcin(L); L++; } return x / seviyeIcin(L); }
  xpEkle(n) {
    if (!(n > 0) || this.olu) return;
    const once = this.seviye;
    this.xp += n;
    if (this.olaylar.xp) this.olaylar.xp(n);
    if (this.seviye > once && this.olaylar.seviye) this.olaylar.seviye(this.seviye);
  }
  /* Örste seviye harcanır: ilerleme oranı korunur */
  seviyeHarca(n) {
    const L = this.seviye, o = this.ilerleme, h = Math.max(0, L - n);
    let t = 0; for (let i = 0; i < h; i++) t += seviyeIcin(i);
    this.xp = t + o * seviyeIcin(h);
  }
  /* İksir etkileri: tür -> kalan saniye */
  etkiEkle(tur, sure) { this.etkiler[tur] = Math.max(this.etkiler[tur] || 0, sure); }
  etki(tur) { return (this.etkiler[tur] || 0) > 0; }
  sifirla() {
    this.can = 20; this.aclik = 20; this.oksijen = 10;
    this.yorgunluk = 0; this.iyiSayac = 0; this.acSayac = 0; this.oksSayac = 0; this.bogSayac = 0;
    this.olu = false; this.sonHasar = 0; this.zehir = 0; this.agu = 0; this.aguSayac = 0; this.yanma = 0; this.yanmaSayac = 0; this.lavSayac = 0;
  }
  yor(n) { if (!this.tok) this.yorgunluk += n; }   // tok: geliştirici modunda açlık azalmaz
  /* zehirOlasilik: çürük et gibi yiyeceklerde mide bulantısı olasılığı; true dönerse bulantı başladı */
  ye(n, zehirOlasilik = 0) {
    this.aclik = Math.min(20, this.aclik + n);
    if (zehirOlasilik && Math.random() < zehirOlasilik) { this.zehir = 20; return true; }
    return false;
  }
  iyiles(n) { this.can = Math.min(20, this.can + n); }
  /* zirhli: canlı saldırısı ve ok gibi zırhın azalttığı hasarlar */
  hasar(n, sebep, zirhli = false) {
    if (this.olu || n <= 0 || this.olumsuz) return;   // olumsuz: geliştirici konsolundaki ölümsüzlük
    if ((sebep === 'lav' || sebep === 'yanma') && this.etki('ates')) return;
    if (zirhli && this.zirhFn) { const p = Math.min(20, this.zirhFn()); n = n * (1 - p * 0.04); if (this.zirhYipran) this.zirhYipran(); }
    /* Koruma büyüsü (giyilen zırhlardaki toplam seviye; en çok %64): açlık ve boğulma dışındaki hasarları azaltır */
    if (this.buyuFn && sebep !== 'aclik' && sebep !== 'bogulma') { const k = Math.min(16, this.buyuFn('koruma')); if (k) n *= 1 - k * 0.04; }
    n = Math.round(n);
    if (n <= 0) return;
    this.can = Math.max(0, this.can - n);
    this.sonHasar = performance.now();
    this.olaylar.hasar && this.olaylar.hasar(n, sebep);
    if (this.can <= 0) { this.olu = true; this.olaylar.olum && this.olaylar.olum(sebep); }
  }
  /* basSuda: baş su altında; o: { lavda, suda, maske } (dalış maskesi oksijeni üç kat yavaş harcatır) */
  guncelle(dt, basSuda, o = {}) {
    if (this.olu) return;
    for (const k in this.etkiler) { this.etkiler[k] -= dt; if (this.etkiler[k] <= 0) delete this.etkiler[k]; }
    /* Lav ve yanma: zırh korumaz */
    if (o.lavda) { this.yanma = 6; this.lavSayac -= dt; if (this.lavSayac <= 0) { this.lavSayac = 0.5; this.hasar(4, 'lav'); } }
    else this.lavSayac = 0;
    if (this.yanma > 0) {
      if (o.suda) this.yanma = 0;
      else { this.yanma -= dt; if (!o.lavda) { this.yanmaSayac -= dt; if (this.yanmaSayac <= 0) { this.yanmaSayac = 1; this.hasar(1, 'yanma'); } } }
    }
    /* Örümcek zehri: canı 1'in altına düşürmez */
    if (this.agu > 0) { this.agu -= dt; this.aguSayac -= dt; if (this.aguSayac <= 0) { this.aguSayac = 1.25; if (this.can > 1) this.hasar(1, 'agu'); } }
    this.yor(dt * 0.045);
    if (this.zehir > 0) { this.zehir -= dt; this.yor(dt * 1.2); }
    if (this.etki('aclik')) this.yor(dt * 1.4);   // mumyanın verdiği açlık etkisi
    while (this.yorgunluk >= 4) { this.yorgunluk -= 4; if (this.aclik > 0) this.aclik--; }
    /* Tok iken can yenilenir */
    if (this.aclik >= 17 && this.can < 20) {
      this.iyiSayac += dt;
      if (this.iyiSayac >= 3) { this.iyiSayac = 0; this.can = Math.min(20, this.can + 1); this.yor(1.5); }
    } else this.iyiSayac = 0;
    /* Açlık */
    if (this.aclik <= 0) {
      this.acSayac += dt;
      if (this.acSayac >= 4) { this.acSayac = 0; this.hasar(1, 'aclik'); }
    } else this.acSayac = 0;
    /* Oksijen */
    if (basSuda && !this.etki('nefes')) {
      this.oksSayac += dt;
      if (this.oksSayac >= (o.maske ? 4.2 : 1.4) * (1 + (o.solunum || 0))) { this.oksSayac = 0; if (this.oksijen > 0) this.oksijen--; }
      if (this.oksijen <= 0) { this.bogSayac += dt; if (this.bogSayac >= 1) { this.bogSayac = 0; this.hasar(2, 'bogulma'); } }
    } else {
      this.oksSayac += dt;
      if (this.oksSayac >= 0.25) { this.oksSayac = 0; if (this.oksijen < 10) this.oksijen++; }
      this.bogSayac = 0;
    }
  }
  disaAktar() { return { can: this.can, aclik: this.aclik, oksijen: this.oksijen, yorgunluk: this.yorgunluk, zehir: Math.max(0, this.zehir), xp: Math.round(this.xp * 10) / 10, etkiler: { ...this.etkiler }, buyuTohum: this.buyuTohum }; }
  iceAktar(o) {
    if (!o) return;
    this.can = o.can ?? 20; this.aclik = o.aclik ?? 20; this.oksijen = o.oksijen ?? 10; this.yorgunluk = o.yorgunluk ?? 0; this.zehir = o.zehir ?? 0; this.olu = this.can <= 0;
    this.xp = o.xp || 0; this.etkiler = o.etkiler && typeof o.etkiler === 'object' ? { ...o.etkiler } : {};
    if (o.buyuTohum) this.buyuTohum = o.buyuTohum >>> 0 || 1;
  }
}

export const OLUM_SEBEBI = { dusme: 'Yüksekten düştünüz.', aclik: 'Açlıktan öldünüz.', bogulma: 'Boğuldunuz.', zombi: 'Bir zombi tarafından öldürüldünüz.', kurt: 'Bir kurt tarafından öldürüldünüz.',
  iskelet: 'Bir iskeletin okuyla öldürüldünüz.', mumya: 'Bir mumya tarafından öldürüldünüz.', bogulmus: 'Bir boğulmuş zombi tarafından öldürüldünüz.', buziskelet: 'Bir buz iskeletinin okuyla öldürüldünüz.', yarasa: 'Bir yarasa sürüsü tarafından öldürüldünüz.', kopekbaligi: 'Bir köpekbalığı tarafından öldürüldünüz.', orumcek: 'Bir mağara örümceği tarafından öldürüldünüz.', lav: 'Lava düştünüz.', yanma: 'Yanarak öldünüz.', agu: 'Zehirlenerek öldünüz.', yildirim: 'Yıldırım çarptı.', tuzak: 'Bir tuzağa yakalandınız.', haydut: 'Bir haydut tarafından öldürüldünüz.', firavun: 'Firavun tarafından öldürüldünüz.', buzbuyucu: 'Buz Büyücüsü tarafından öldürüldünüz.', reis: 'Haydut Reisi tarafından öldürüldünüz.', muhafiz: 'Taş Muhafız tarafından ezildiniz.' };
