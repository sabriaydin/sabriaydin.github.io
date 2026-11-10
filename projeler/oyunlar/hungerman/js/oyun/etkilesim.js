/* HungerMan - etkileşim: bakılan bloğu bulma, kazma/kırma, blok koyma, yeme, toplama */
import { THREE } from '../grafik/sahne.js';
import { BLOKLAR, ESYALAR, KATI, SIVI, BITKI, CIZIM, C_YOK, OPAK } from '../bloklar.js';

const ERISIM = 5;
const TOPRAK = new Set([3, 4, 45]);

export class Etkilesim {
  constructor(o) {
    Object.assign(this, o); // dunya, oyuncu, envanter, hayatta, dusenler, ses, sahne, arayuz
    this.hedef = null;
    this.ilerleme = 0;
    this.kirilanAnahtar = '';
    this.sagBekleme = 0;
    this.solBekleme = 0;
    this.vurus = 0;
    this.kazmaSesSayac = 0;
  }

  /* Işın izleme (DDA) */
  isin(goz, yon) {
    let x = Math.floor(goz.x), y = Math.floor(goz.y), z = Math.floor(goz.z);
    const sx = Math.sign(yon.x), sy = Math.sign(yon.y), sz = Math.sign(yon.z);
    const tdx = Math.abs(1 / yon.x), tdy = Math.abs(1 / yon.y), tdz = Math.abs(1 / yon.z);
    let tx = (sx > 0 ? x + 1 - goz.x : goz.x - x) * tdx, ty = (sy > 0 ? y + 1 - goz.y : goz.y - y) * tdy, tz = (sz > 0 ? z + 1 - goz.z : goz.z - z) * tdz;
    let nx = 0, ny = 0, nz = 0, t = 0;
    for (let i = 0; i < 64 && t <= ERISIM; i++) {
      const id = this.dunya.blok(x, y, z);
      if (id && CIZIM[id] !== C_YOK && !(SIVI[id] && !BITKI[id])) {
        if (!BITKI[id] && !BLOKLAR[id].mesale || this.bitkiIsabet(goz, yon, x, y, z)) return { x, y, z, id, nx, ny, nz, t };
      }
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; nx = -sx; ny = 0; nz = 0; }
      else if (ty < tz) { y += sy; t = ty; ty += tdy; nx = 0; ny = -sy; nz = 0; }
      else { z += sz; t = tz; tz += tdz; nx = 0; ny = 0; nz = -sz; }
    }
    return null;
  }
  /* Bitkiler hücrenin ortasındaki daha küçük bir kutu olarak seçilir */
  bitkiIsabet(o, d, x, y, z) {
    const a = [x + 0.2, y, z + 0.2], b = [x + 0.8, y + 0.85, z + 0.8];
    let t0 = 0, t1 = ERISIM;
    const oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(dd[i]) < 1e-9) { if (oo[i] < a[i] || oo[i] > b[i]) return false; continue; }
      let ta = (a[i] - oo[i]) / dd[i], tb = (b[i] - oo[i]) / dd[i];
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
    return true;
  }

  aletBilgi() {
    const s = this.envanter.seciliYuva();
    const e = s && ESYALAR[s.id];
    return e && e.tur === 'alet' ? e.alet : null;
  }
  kirmaSuresi(id) {
    const b = BLOKLAR[id];
    if (!b || b.sertlik < 0) return Infinity;
    if (b.sertlik === 0) return 0;
    const a = this.aletBilgi();
    const dogru = a && b.alet === a.tur;
    const alabilir = b.seviye === 0 || (dogru && a.seviye >= b.seviye);
    let hiz = dogru ? a.hiz : 1;
    if (a && a.tur === 'kilic' && b.ses === 'bitki') hiz = 2;
    let s = b.sertlik * (alabilir ? 1.5 : 5) / hiz;
    if (this.oyuncu.basSuda) s *= 3;
    else if (!this.oyuncu.yerde && !this.oyuncu.suda) s *= 2;
    return s;
  }
  alabilir(id) {
    const b = BLOKLAR[id], a = this.aletBilgi();
    return b.seviye === 0 || (a && b.alet === a.tur && a.seviye >= b.seviye);
  }

  guncelle(dt, g) {
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.hedef = this.isin(goz, yon);
    this.sagBekleme -= dt; this.solBekleme -= dt;
    if (this.vurus > 0) { this.vurus += dt * 3.2; if (this.vurus >= 1) this.vurus = 0; }

    /* Kırma */
    const h = this.hedef;
    if (g.sol && h) {
      const k = h.x + ',' + h.y + ',' + h.z + ',' + h.id;
      if (k !== this.kirilanAnahtar) { this.kirilanAnahtar = k; this.ilerleme = 0; }
      const sure = this.kirmaSuresi(h.id);
      if (sure === 0) { if (this.solBekleme <= 0) { this.kir(h); this.solBekleme = 0.2; } }
      else if (sure !== Infinity) {
        this.ilerleme += dt / sure;
        this.kazmaSesSayac -= dt;
        if (this.kazmaSesSayac <= 0) { this.kazmaSesSayac = 0.26; this.ses.kaz(BLOKLAR[h.id].ses); if (Math.random() < 0.5) this.dusenler.parcacik(h.id, h.x, h.y, h.z, 3); }
        if (this.ilerleme >= 1) { this.kir(h); this.ilerleme = 0; this.kirilanAnahtar = ''; this.solBekleme = 0.12; }
      }
      if (this.vurus === 0) this.vurus = 0.01;
    } else { this.ilerleme = 0; this.kirilanAnahtar = ''; if (g.sol && this.vurus === 0) this.vurus = 0.01; }

    /* Kullanma / koyma */
    if (g.sag && this.sagBekleme <= 0) {
      if (this.kullan(g)) { this.sagBekleme = 0.22; this.vurus = 0.01; }
      else this.sagBekleme = 0.05;
    }
    this.sahne.secimGoster(this.hedef, this.ilerleme);
  }

  kir(h) {
    const b = BLOKLAR[h.id];
    if (this.solBekleme > 0 && b.sertlik === 0) return;
    const d = this.dunya, r = Math.random;
    const ust = d.blok(h.x, h.y + 1, h.z);
    /* Yan veya üstte su varsa boşluk suyla dolar */
    let yeni = 0;
    for (const [dx, dy, dz] of [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) { const n = d.blok(h.x + dx, h.y + dy, h.z + dz); if (n === 7 || n === 31) { yeni = 7; break; } }
    if (h.id === 31) yeni = 7;
    if (!d.blokKoy(h.x, h.y, h.z, yeni)) return;
    this.ses.kir(b.ses);
    this.dusenler.parcacik(h.id, h.x, h.y, h.z);
    if (this.alabilir(h.id)) this.dusur(h.id, h.x, h.y, h.z);
    const a = this.aletBilgi();
    if (a && b.sertlik > 0) {
      if (this.envanter.aletYipran(a.tur === 'kilic' ? 2 : 1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
    }
    this.hayatta.yor(0.025);
    /* Üstteki bitki/meşale desteksiz kalır */
    if ((BITKI[ust] || (BLOKLAR[ust] && BLOKLAR[ust].mesale)) && !SIVI[ust]) {
      d.blokKoy(h.x, h.y + 1, h.z, 0);
      this.dusur(ust, h.x, h.y + 1, h.z);
      if (ust === 28 || ust === 29) { /* çalı tamamen düşer */ }
    }
  }

  dusur(id, x, y, z) {
    const b = BLOKLAR[id];
    const liste = b.dusur ? b.dusur(Math.random) : [[id, 1]];
    for (const [e, n] of liste) if (n > 0) this.dusenler.birak(e, n, x + 0.5, y + 0.4, z + 0.5);
  }

  kullan(g) {
    const h = this.hedef, env = this.envanter;
    const s = env.seciliYuva(), e = s && ESYALAR[s.id];
    /* İstasyonlar */
    if (h && BLOKLAR[h.id].istasyon && !g.egil) { this.arayuz.envanterAc(BLOKLAR[h.id].istasyon); return true; }
    /* Böğürtlen toplama */
    if (h && h.id === 28) {
      this.dunya.blokKoy(h.x, h.y, h.z, 29);
      this.dusenler.birak(265, 2 + (Math.random() < 0.4 ? 1 : 0), h.x + 0.5, h.y + 0.6, h.z + 0.5);
      this.ses.topla();
      return true;
    }
    if (!e) return false;
    /* Yiyecek ve bakım */
    if ((e.tur === 'yiyecek' || e.yenir) && e.yemek) {
      if (this.hayatta.aclik >= 20) { this.arayuz.bildirim('Açlık çubuğu dolu.'); return true; }
      this.hayatta.ye(e.yemek); env.seciliAzalt(1); this.ses.ye();
      if (s.id === 269) env.ekle(270, 1);
      return true;
    }
    if (e.tur === 'iyilestir') {
      if (this.hayatta.can >= 20) { this.arayuz.bildirim('Canınız dolu.'); return true; }
      this.hayatta.iyiles(e.iyilestir); env.seciliAzalt(1); this.ses.topla();
      return true;
    }
    /* Blok koyma */
    if (e.tur === 'blok' && h) {
      const id = e.blok, d = this.dunya;
      let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
      const hb = BLOKLAR[h.id];
      if (hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
      const mevcut = d.blok(x, y, z);
      const mb = BLOKLAR[mevcut];
      const bitki = BITKI[id] || BLOKLAR[id].mesale;
      if (mevcut !== 0 && !(mb.degistirilebilir) && !(SIVI[mevcut] && !BITKI[mevcut] && !bitki)) return false;
      if (y < 1 || y >= 127) return false;
      const alt = d.blok(x, y - 1, z);
      if (BLOKLAR[id].mesale && !(KATI[alt] && OPAK[alt])) { this.arayuz.bildirim('Meşale katı bir bloğun üstüne konur.'); return true; }
      if (BITKI[id]) {
        if (id === 36 ? !KATI[alt] : !TOPRAK.has(alt)) { this.arayuz.bildirim('Bu bitki toprak veya çimen üstüne dikilir.'); return true; }
        if (SIVI[mevcut]) return false;
      }
      if (KATI[id] && this.oyuncu.hucreyiKapliyor(x, y, z)) return false;
      if (!d.blokKoy(x, y, z, id)) return false;
      env.seciliAzalt(1);
      this.ses.koy(BLOKLAR[id].ses);
      return true;
    }
    return false;
  }

  /* Elde tutulan eşyayı ileri at */
  at(hepsi) {
    const s = this.envanter.seciliYuva();
    if (!s) return;
    const n = hepsi ? s.adet : 1;
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.dusenler.birak(s.id, n, goz.x + yon.x * 0.5, goz.y - 0.3 + yon.y * 0.5, goz.z + yon.z * 0.5, yon.x * 5, yon.y * 5 + 2, yon.z * 5, s.dayanim, 1.5);
    this.envanter.seciliAzalt(n);
    this.vurus = 0.01;
  }
}

export { THREE };
