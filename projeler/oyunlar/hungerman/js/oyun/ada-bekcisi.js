/* HungerMan - Ada Bekçisi (0.38.0)
   Lanetli Ada'daki kadim geçidi rastgele seçilen bir diyar yaratığı (Kor Ruhu ya da Kül Zombisi) korur.
   - Bekçi adaya bağlıdır: adadan uzaklaşamaz; kıyıya varınca geri çekilir, suya düşerse ya da çok uzaklaşırsa geçidin önüne döner.
   - Güçlendirilmiştir (daha çok can, hasar ve büyük gövde), güneşte yanmaz, gündüz kaybolmaz; boss çubuğunda adı ve canı görünür.
   - Öldürülünce yeni bekçi 30 dakika (oyun açıkken geçen gerçek süre) sonra doğar; kalan süre dünya kaydında saklanır.
   - Oyuncu adaya yaklaşınca (80 blok) doğar, çok uzaklaşınca (150 blok) sessizce kaldırılır (bu ölüm sayılmaz).
   Tek oyunculuda ve çok oyunculu sunucuda çalışır. */
import { TURLER } from '../varlik/turler.js';
import { lanetliAda } from '../dunya/ada-uretici.js';
import { DENIZ } from '../sabitler.js';

export const BEKCI_SURE = 30 * 60;   // saniye
const BEKCI_TURLERI = ['korruhu', 'kulzombi'];
const DOGMA_YAKIN = 80, KALDIR_UZAK = 150;

/* Bekçinin güçlendirilmiş tür tanımı */
function bekciTuru(turAd) {
  const T = TURLER[turAd];
  return {
    ...T, ad: `Ada Bekçisi · ${T.ad}`, can: T.can * 6, hasar: T.hasar + 3, gorus: 30, kosu: T.kosu * 1.15,
    gen: T.gen * 1.3, boy: T.boy * 1.3, gunesteYanar: false, xp: 90, bekci: true,
    dusur: r => [[515, 2 + Math.floor(r() * 3)], [471, 3 + Math.floor(r() * 4)], [472, 1 + Math.floor(r() * 2)], ...(r() < 0.5 ? [[264, 1 + Math.floor(r() * 2)]] : []), ...(r() < 0.35 ? [[473, 1]] : [])]
  };
}

export class AdaBekcisi {
  constructor(o) {
    Object.assign(this, o);   // uretici, varliklar, dunya, bildirim(m), ses
    this.kalan = 0;            // yeni bekçiye kalan süre (sn)
    this.v = null;
    this.sayac = 0;
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
      if (this.bildirim) this.bildirim('Ada Bekçisi yenildi. Yeni bekçi 30 dakika sonra uyanacak.');
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
      return;
    }
    /* Doğma: süre dolmuş ve bir oyuncu adaya yakınsa */
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 1;
    if (this.kalan > 0 || en > DOGMA_YAKIN || this.varliklar.dogurmaKapali) return;
    const B = A.bekci;
    if (!this.dunya.yuklu(Math.floor(B.x), Math.floor(B.z))) return;
    const turAd = BEKCI_TURLERI[Math.floor(Math.random() * BEKCI_TURLERI.length)];
    const yeni = this.varliklar.ekle(turAd, B.x, B.y, B.z);
    yeni.tur = bekciTuru(turAd); yeni.can = yeni.tur.can; yeni.bekci = true; yeni.ofkeli = true;
    yeni.m.kok.scale.setScalar(1.3);
    this.v = yeni;
    this.varliklar.dusenler.renkliParcacik([1, 0.4, 0.15], B.x, B.y + 1, B.z, 40);
    if (this.ses && this.ses.gokGurultusu) this.ses.gokGurultusu(0.4, false);
    if (this.bildirim && en < DOGMA_YAKIN) this.bildirim(`${yeni.tur.ad} kadim geçidi koruyor!`);
  }
  disaAktar() { return { kalan: Math.round(this.kalan) }; }
  iceAktar(o) { this.kalan = o && Number.isFinite(o.kalan) ? Math.max(0, Math.min(BEKCI_SURE, o.kalan)) : 0; }
}
