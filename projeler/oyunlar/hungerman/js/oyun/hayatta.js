/* HungerMan - hayatta kalma değerleri: can, açlık, oksijen, yorgunluk */
export class Hayatta {
  constructor() { this.sifirla(); this.olaylar = { hasar: null, olum: null }; }
  sifirla() {
    this.can = 20; this.aclik = 20; this.oksijen = 10;
    this.yorgunluk = 0; this.iyiSayac = 0; this.acSayac = 0; this.oksSayac = 0; this.bogSayac = 0;
    this.olu = false; this.sonHasar = 0; this.zehir = 0;
  }
  yor(n) { this.yorgunluk += n; }
  /* zehirOlasilik: çürük et gibi yiyeceklerde mide bulantısı olasılığı; true dönerse bulantı başladı */
  ye(n, zehirOlasilik = 0) {
    this.aclik = Math.min(20, this.aclik + n);
    if (zehirOlasilik && Math.random() < zehirOlasilik) { this.zehir = 20; return true; }
    return false;
  }
  iyiles(n) { this.can = Math.min(20, this.can + n); }
  /* zirhli: canlı saldırısı ve ok gibi zırhın azalttığı hasarlar */
  hasar(n, sebep, zirhli = false) {
    if (this.olu || n <= 0) return;
    if (zirhli && this.zirhFn) { const p = Math.min(20, this.zirhFn()); n = n * (1 - p * 0.04); if (this.zirhYipran) this.zirhYipran(); }
    n = Math.round(n);
    if (n <= 0) return;
    this.can = Math.max(0, this.can - n);
    this.sonHasar = performance.now();
    this.olaylar.hasar && this.olaylar.hasar(n, sebep);
    if (this.can <= 0) { this.olu = true; this.olaylar.olum && this.olaylar.olum(sebep); }
  }
  /* basSuda: baş su altında; kosuyor, mesafe: yorgunluk için */
  guncelle(dt, basSuda) {
    if (this.olu) return;
    this.yor(dt * 0.045);
    if (this.zehir > 0) { this.zehir -= dt; this.yor(dt * 1.2); }
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
    if (basSuda) {
      this.oksSayac += dt;
      if (this.oksSayac >= 1.4) { this.oksSayac = 0; if (this.oksijen > 0) this.oksijen--; }
      if (this.oksijen <= 0) { this.bogSayac += dt; if (this.bogSayac >= 1) { this.bogSayac = 0; this.hasar(2, 'bogulma'); } }
    } else {
      this.oksSayac += dt;
      if (this.oksSayac >= 0.25) { this.oksSayac = 0; if (this.oksijen < 10) this.oksijen++; }
      this.bogSayac = 0;
    }
  }
  disaAktar() { return { can: this.can, aclik: this.aclik, oksijen: this.oksijen, yorgunluk: this.yorgunluk, zehir: Math.max(0, this.zehir) }; }
  iceAktar(o) { if (!o) return; this.can = o.can ?? 20; this.aclik = o.aclik ?? 20; this.oksijen = o.oksijen ?? 10; this.yorgunluk = o.yorgunluk ?? 0; this.zehir = o.zehir ?? 0; this.olu = this.can <= 0; }
}

export const OLUM_SEBEBI = { dusme: 'Yüksekten düştünüz.', aclik: 'Açlıktan öldünüz.', bogulma: 'Boğuldunuz.', zombi: 'Bir zombi tarafından öldürüldünüz.', kurt: 'Bir kurt tarafından öldürüldünüz.' };
