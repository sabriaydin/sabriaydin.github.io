/* HungerMan - Ada Bekçisi (0.38.0; 0.39.0: tek bekçi Kül Devi)
   Lanetli Ada'daki kadim geçidi yalnızca adaya özgü Kül Devi (mutasyon geçirmiş dev Kül Zombisi) korur.
   - Bekçi adaya bağlıdır: adadan uzaklaşamaz; kıyıya varınca geri çekilir, suya düşerse ya da çok uzaklaşırsa geçidin önüne döner.
   - Ağır gövdelidir: itilmez, yürürken yeri sarsar ve kül tozu kaldırır; yetenekleri varlik/varliklar.js'teki boss sistemindedir.
   - Öldürülünce iki Büyülü Anahtar bırakır; yeni bekçi 30 dakika (oyun açıkken geçen gerçek süre) sonra doğar; kalan süre dünya kaydında saklanır.
   - Oyuncu adaya yaklaşınca (80 blok) doğar, çok uzaklaşınca (150 blok) sessizce kaldırılır (bu ölüm sayılmaz).
   Tek oyunculuda ve çok oyunculu sunucuda çalışır. */
import { lanetliAda } from '../dunya/ada-uretici.js';
import { DENIZ } from '../sabitler.js';

export const BEKCI_SURE = 30 * 60;   // saniye
const BEKCI_TUR = 'kuldev';
const DOGMA_YAKIN = 80, KALDIR_UZAK = 150;

export class AdaBekcisi {
  constructor(o) {
    Object.assign(this, o);   // uretici, varliklar, dunya, bildirim(m), ses
    this.kalan = 0;            // yeni bekçiye kalan süre (sn)
    this.v = null;
    this.sayac = 0; this.adim = 0;
  }
  get A() { return lanetliAda(this.uretici); }
  canli() { return !!(this.v && !this.v.olu && this.varliklar.liste.includes(this.v)); }

  /* konumlar: dünyadaki (diyar dışı) oyuncuların ayak konumları */
  guncelle(dt, konumlar) {
    if (this.kalan > 0) this.kalan = Math.max(0, this.kalan - dt);
    const A = this.A, v = this.v;
    /* Ölüm: süre başlar */
    if (v && v.olu) {
      this.v = null; this.kalan = BEKCI_SURE;
      if (this.bildirim) this.bildirim('Kül Devi yenildi ve iki Büyülü Anahtar bıraktı. Yeni bekçi 30 dakika sonra uyanacak.');
      return;
    }
    if (v && !this.varliklar.liste.includes(v)) this.v = null;
    let en = Infinity;
    for (const p of konumlar) en = Math.min(en, Math.hypot(p.x - A.x, p.z - A.z));
    /* Bekçi adaya bağlıdır */
    if (this.canli()) {
      const p = this.v.konum, dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz), B = A.bekci;
      if (en > KALDIR_UZAK) { this.varliklar.kaldir(this.v); this.v = null; return; }
      if (d > A.r + 4 || p.y < DENIZ - 1 || (this.v.suda && d > A.r - 6) || p.y > A.ust + 14) {
        p.set(B.x, B.y, B.z); this.v.hiz.set(0, 0, 0);
        this.varliklar.dusenler.renkliParcacik([1, 0.45, 0.2], B.x, B.y + 1, B.z, 18);
      } else if (d > A.r - 5) {
        const k = 4 / (d || 1); this.v.hiz.x = -dx * k; this.v.hiz.z = -dz * k;
      }
      /* Ağır adımlar: yürürken kül tozu ve yakındaki oyuncuya hafif sarsıntı */
      const yh = Math.hypot(this.v.hiz.x, this.v.hiz.z);
      if (this.v.yerde && yh > 0.6) {
        this.adim -= dt * yh;
        if (this.adim <= 0) {
          this.adim = 1.4;
          this.varliklar.dusenler.renkliParcacik([0.4, 0.37, 0.35], p.x, p.y + 0.1, p.z, 6);
          if (this.sarsinti) this.sarsinti(0.12, p);
          if (this.ses && this.ses.agirAdim && en < 32) { const f = () => this.ses.agirAdim(1); if (this.ses.konumlu) this.ses.konumlu(p.x, p.y + 1, p.z, f, 32); else f(); }   // 0.41.10: konumlu
        }
      }
      return;
    }
    /* Doğma: süre dolmuş ve bir oyuncu adaya yakınsa */
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 1;
    if (this.kalan > 0 || en > DOGMA_YAKIN || this.varliklar.dogurmaKapali) return;
    const B = A.bekci;
    if (!this.dunya.yuklu(Math.floor(B.x), Math.floor(B.z))) return;
    const yeni = this.varliklar.ekle(BEKCI_TUR, B.x, B.y, B.z);
    yeni.bekci = true; yeni.ofkeli = true;
    this.v = yeni;
    this.varliklar.dusenler.renkliParcacik([1, 0.4, 0.15], B.x, B.y + 1, B.z, 40);
    if (this.ses && this.ses.gokGurultusu) this.ses.gokGurultusu(0.4, false);
    if (this.bildirim && en < DOGMA_YAKIN) this.bildirim(`Ada Bekçisi ${yeni.tur.ad} kadim geçidi koruyor!`);
  }
  disaAktar() { return { kalan: Math.round(this.kalan) }; }
  iceAktar(o) { this.kalan = o && Number.isFinite(o.kalan) ? Math.max(0, Math.min(BEKCI_SURE, o.kalan)) : 0; }
}
