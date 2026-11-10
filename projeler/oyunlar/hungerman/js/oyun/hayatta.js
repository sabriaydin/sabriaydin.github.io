/* HungerMan - hayatta kalma değerleri: can, açlık, oksijen, yorgunluk */
export class Hayatta {
  constructor() { this.sifirla(); this.olaylar = { hasar: null, olum: null }; }
  sifirla() {
    this.can = 20; this.aclik = 20; this.oksijen = 10;
    this.yorgunluk = 0; this.iyiSayac = 0; this.acSayac = 0; this.oksSayac = 0; this.bogSayac = 0;
    this.olu = false; this.sonHasar = 0;
  }
  yor(n) { this.yorgunluk += n; }
  ye(n) { this.aclik = Math.min(20, this.aclik + n); }
  iyiles(n) { this.can = Math.min(20, this.can + n); }
  hasar(n, sebep) {
    if (this.olu || n <= 0) return;
    this.can = Math.max(0, this.can - n);
    this.sonHasar = performance.now();
    this.olaylar.hasar && this.olaylar.hasar(n, sebep);
    if (this.can <= 0) { this.olu = true; this.olaylar.olum && this.olaylar.olum(sebep); }
  }
  /* basSuda: baş su altında; kosuyor, mesafe: yorgunluk için */
  guncelle(dt, basSuda) {
    if (this.olu) return;
    this.yor(dt * 0.045);
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
  disaAktar() { return { can: this.can, aclik: this.aclik, oksijen: this.oksijen, yorgunluk: this.yorgunluk }; }
  iceAktar(o) { if (!o) return; this.can = o.can ?? 20; this.aclik = o.aclik ?? 20; this.oksijen = o.oksijen ?? 10; this.yorgunluk = o.yorgunluk ?? 0; this.olu = this.can <= 0; }
}

export const OLUM_SEBEBI = { dusme: 'Yüksekten düştünüz.', aclik: 'Açlıktan öldünüz.', bogulma: 'Boğuldunuz.' };
