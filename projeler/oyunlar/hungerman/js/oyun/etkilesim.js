/* HungerMan - etkileşim: bakılan bloğu bulma, kazma/kırma, blok koyma, yeme, toplama */
import { THREE } from '../grafik/sahne.js';
import { buyuSeviye, BLOKLAR, ESYALAR, KATI, SIVI, BITKI, CIZIM, C_YOK, C_KUP, OPAK, ETKILER, EKIN_SONRAKI } from '../bloklar.js';
import { SEKIL, YONLER, hucreKutulari, kutuIsin, sinirKutusu } from '../sekiller.js';
import { ezgiTuru } from './mekanik.js';

const ZEMIN_MEK = { kol: 1, dugme: 1, plaka: 1, tel: 1, ters: 1, gecik: 1 };   // 0.17.0: altındaki blok kırılınca düşen mekanik bloklar

const ERISIM = 5;
const TOPRAK = new Set([3, 4, 45, 137, 138]);   // ekim yapılabilen zeminler

export class Etkilesim {
  constructor(o) {
    Object.assign(this, o); // dunya, oyuncu, envanter, hayatta, dusenler, ses, sahne, arayuz, varliklar, olta, tekneler
    this.hedef = null;
    this.ilerleme = 0;
    this.kirilanAnahtar = '';
    this.sagBekleme = 0;
    this.solBekleme = 0;
    this.vurus = 0;
    this.kazmaSesSayac = 0;
    this.saldiriBekleme = 0; this.germe = 0; this.okUyari = 0; this.hedefCanli = null; this.hedefTekne = null; this.sagOnceki = false;
  }

  /* Işın izleme (DDA) */
  isin(goz, yon) {
    let x = Math.floor(goz.x), y = Math.floor(goz.y), z = Math.floor(goz.z);
    const sx = Math.sign(yon.x), sy = Math.sign(yon.y), sz = Math.sign(yon.z);
    const tdx = Math.abs(1 / yon.x), tdy = Math.abs(1 / yon.y), tdz = Math.abs(1 / yon.z);
    let tx = (sx > 0 ? x + 1 - goz.x : goz.x - x) * tdx, ty = (sy > 0 ? y + 1 - goz.y : goz.y - y) * tdy, tz = (sz > 0 ? z + 1 - goz.z : goz.z - z) * tdz;
    let nx = 0, ny = 0, nz = 0, t = 0;
    const erisim = this.erisim || ERISIM;   // erisim: geliştirici modunda uzatılabilir
    for (let i = 0; i < 160 && t <= erisim; i++) {
      const id = this.dunya.blok(x, y, z);
      if (id && CIZIM[id] !== C_YOK && !(SIVI[id] && !BITKI[id])) {
        /* Biçimli bloklar: kutularına isabet aranır (açık kapının boşluğundan geçilebilir) */
        if (SEKIL[id]) {
          const k = hucreKutulari(this.dunya, x, y, z, id), r = kutuIsin(goz, yon, x, y, z, k, erisim);
          if (r) return { x, y, z, id, nx: r.nx, ny: r.ny, nz: r.nz, t: r.t, py: goz.y + yon.y * r.t - y, kutu: sinirKutusu(k) };
        } else if (!BITKI[id] && !(BLOKLAR[id].mesale && CIZIM[id] !== C_KUP) || this.bitkiIsabet(goz, yon, x, y, z)) return { x, y, z, id, nx, ny, nz, t, py: goz.y + yon.y * t - y };
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
    let t0 = 0, t1 = this.erisim || ERISIM;
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

  olay(k) { if (this.arayuz.olay) this.arayuz.olay(k); }
  istat(k, n = 1) { if (this.arayuz.istat) this.arayuz.istat(k, n); }   // 0.22.0
  /* E tuşu (0.15.1): hedefteki nesneyle etkileşim (kapı, sandık, istasyon, yatak, köylü, tekne). Sağ tık da aynı işleri yapar. */
  etkiles() {
    if (this.tekneler.binilen) return false;
    /* 0.16.0: attan inme, oturaktan kalkma */
    if (this.binek && this.binek.biniyor) { this.binek.in(); return true; }
    if (this.binek && this.binek.oturak) { this.binek.kalk(); return true; }
    if (this.hedefCanli && this.varliklar.etkilesimVar(this.hedefCanli, this.envanter.seciliId())) { this.canliEtkiles(this.hedefCanli); return true; }
    if (this.hedefTekne) {
      if (this.tekneler.bin(this.hedefTekne, this.oyuncu) !== false) { this.olay('tekne'); this.arayuz.bildirim(`${this.hedefTekne.T.ad}: W/S hız, A/D dümen. İnmek için C tuşuna basınız.`, 'tekne'); }
      return true;
    }
    if (this.hedefCanli && this.hedefCanli.tur.koylu) { this.arayuz.koyluAc(this.hedefCanli); return true; }
    const h = this.hedef;
    if (!h) return false;
    const b = BLOKLAR[h.id];
    if (b.oturak && this.binek) return this.binek.otur(h.x, h.y, h.z);
    if (b.istasyon) { this.arayuz.envanterAc(b.istasyon); return true; }
    if (b.sandik) { this.arayuz.sandikAc(h.x, h.y, h.z); return true; }
    if (b.yatak) { this.arayuz.uyu(h); return true; }
    if (this.ac(h)) { this.vurus = 0.01; return true; }
    return false;
  }
  /* Evcil hayvan / at etkileşimi: tek oyunculuda ve sunucuda burada, istemcide sunucuda işlenir */
  canliEtkiles(v) {
    const eldeki = this.envanter.seciliId();
    if (this.varliklar.ayna) { if (this.agCanli) this.agCanli(v, eldeki); return; }
    this.canliSonuc(this.varliklar.canliEtkilesim(v, eldeki, this.oyuncuAdi), v);
  }
  canliSonuc(S, v) {
    if (S.tuket) { this.envanter.seciliAzalt(1); this.ses.ye(); this.vurus = 0.01; }
    /* 0.21.0: eldeki bir eşya başka bir eşyaya dönüşür (kova -> süt kovası); alet yıpranır */
    if (S.degistir) { this.envanter.seciliAzalt(1); this.envanter.ekle(S.degistir, 1); this.vurus = 0.01; }
    if (S.yipran) { this.aletYipran(); this.vurus = 0.01; }
    if (S.ses === 'sut') this.ses.sicrama(0.4); else if (S.ses === 'kirp') this.ses.zirhGiy();
    if (S.mesaj) this.arayuz.bildirim(S.mesaj);
    if (S.olay) this.olay(S.olay);
    if (S.bin && v && this.binek) { this.binek.bin(v); this.olay('binici'); }
  }
  aletBilgi() {
    const s = this.envanter.seciliYuva();
    const e = s && ESYALAR[s.id];
    return e && e.tur === 'alet' ? e.alet : null;
  }
  kirmaSuresi(id) {
    const b = BLOKLAR[id];
    if (!b || b.sertlik < 0) return Infinity;
    if (b.sertlik === 0 || this.aninda) return 0;   // aninda: geliştirici modunda anında kırma
    const a = this.aletBilgi();
    const dogru = a && b.alet === a.tur;
    const alabilir = b.seviye === 0 || (dogru && a.seviye >= b.seviye);
    let hiz = dogru ? a.hiz : 1;
    if (a && a.tur === 'kilic' && b.ses === 'bitki') hiz = 2;
    /* Verimlilik büyüsü: doğru aletle kazma hızı seviye başına %30 artar */
    if (dogru) hiz *= 1 + 0.3 * buyuSeviye(this.envanter.seciliYuva(), 'verim');
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
    /* Canlı, bloktan daha yakınsa hedef odur */
    const vb = this.varliklar ? this.varliklar.isin(goz, yon, 3.6) : null;
    this.hedefCanli = null;
    if (vb && (!this.hedef || vb.t < this.hedef.t)) { this.hedefCanli = vb.v; this.hedef = null; }
    /* Tekne: en yakın hedefse binme ve kırma */
    const tb = this.tekneler ? this.tekneler.isin(goz, yon, 4.5) : null;
    this.hedefTekne = null;
    if (tb && (!this.hedef || tb.t < this.hedef.t) && (!this.hedefCanli || tb.t < vb.t)) { this.hedefTekne = tb.tekne; this.hedef = null; this.hedefCanli = null; }
    if (this.izleyici) { this.hedefCanli = null; this.hedefTekne = null; this.ilerleme = 0; this.germe = 0; return; }   // 0.23.0: Hardcore izleyici kipi
    const sagYeni = g.sag && !this.sagOnceki;
    this.sagOnceki = g.sag;
    this.sagBekleme -= dt; this.solBekleme -= dt; this.saldiriBekleme -= dt; this.okUyari -= dt;
    if (this.vurus > 0) { this.vurus += dt * 3.2; if (this.vurus >= 1) this.vurus = 0; }

    const eldeki = this.envanter.seciliId();
    if (this.hedefTekne) {
      this.ilerleme = 0; this.kirilanAnahtar = ''; this.germe = 0;
      if (g.sag && this.sagBekleme <= 0 && !this.tekneler.binilen) {
        this.sagBekleme = 0.4;
        if (this.olta && this.olta.aktif) this.olta.kaldir();
        if (this.tekneler.bin(this.hedefTekne, this.oyuncu) !== false) { this.olay('tekne'); this.arayuz.bildirim(`${this.hedefTekne.T.ad}: W/S hız, A/D dümen. İnmek için C tuşuna basınız.`, 'tekne'); }
      } else if (g.sol && this.saldiriBekleme <= 0) { this.saldiriBekleme = 0.3; this.vurus = 0.01; this.tekneler.vur(this.hedefTekne); }
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* 0.16.0: evcil hayvan ve at etkileşimi (evcilleştirme, oturtma, eyer, binme) */
    if (g.sag && this.hedefCanli && this.sagBekleme <= 0 && this.varliklar.etkilesimVar(this.hedefCanli, eldeki)) {
      this.sagBekleme = 0.4; this.germe = 0;
      this.canliEtkiles(this.hedefCanli);
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Hayvan besleme: elindeki yemi seven hayvana sağ tık */
    if (g.sag && this.hedefCanli && this.sagBekleme <= 0 && this.varliklar.yemSever(this.hedefCanli, eldeki)) {
      this.sagBekleme = 0.4; this.germe = 0;
      const sonuc = this.varliklar.besle(this.hedefCanli, null);
      if (sonuc) { this.envanter.seciliAzalt(1); this.ses.ye(); this.vurus = 0.01; }
      else this.arayuz.bildirim('Bu hayvan şu anda beslenemez.');
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Köylü ile konuşma */
    if (g.sag && this.hedefCanli && this.hedefCanli.tur.koylu && this.sagBekleme <= 0) {
      this.sagBekleme = 0.4; this.germe = 0;
      this.arayuz.koyluAc(this.hedefCanli);
      this.sahne.secimGoster(null, 0);
      return;
    }
    /* Yay: sağ tık basılı tutulunca gerilir, bırakılınca ok atılır */
    const yayMi = !!(ESYALAR[eldeki] && ESYALAR[eldeki].tur === 'yay');
    if (yayMi) {
      if (g.sag) {
        if (this.envanter.say(287) > 0) { if (this.germe === 0) this.ses.yayGer(); this.germe = Math.min(1, this.germe + dt); }
        else if (this.okUyari <= 0) { this.okUyari = 2; this.arayuz.bildirim('Atılacak ok mevcut değil.'); }
      } else if (this.germe > 0) { if (this.germe > 0.15) this.okAt(goz, yon); this.germe = 0; }
    } else this.germe = 0;

    /* Saldırı */
    const h = this.hedef;
    if (g.sol && this.hedefCanli) {
      this.ilerleme = 0; this.kirilanAnahtar = '';
      if (this.saldiriBekleme <= 0) { this.saldir(this.hedefCanli); this.saldiriBekleme = 0.5; this.vurus = 0.01; }
    } else if (g.sol && h) {
      /* Kırma */
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

    /* Olta: her sağ tık bir kez atar ya da çeker (istasyon ve sandıklar yine açılır) */
    const eldeOlta = ESYALAR[eldeki] && ESYALAR[eldeki].tur === 'olta';
    const blokEtkin = h && (BLOKLAR[h.id].istasyon || BLOKLAR[h.id].sandik || BLOKLAR[h.id].yatak) && !g.egil;
    if (eldeOlta && !blokEtkin) {
      if (sagYeni && this.olta && this.olta.kullan()) this.vurus = 0.01;
    }
    /* Kullanma / koyma */
    else if (g.sag && !yayMi && this.sagBekleme <= 0) {
      this.acildi = false;
      if (this.kullan(g)) { this.sagBekleme = this.acildi ? 0.45 : 0.22; this.vurus = 0.01; }
      else this.sagBekleme = 0.05;
    }
    this.sahne.secimGoster(this.hedef, this.ilerleme);
  }

  saldir(v) {
    const a = this.aletBilgi();
    let hasar = a && a.tur !== 'yay' ? a.hasar : 1;
    const es = this.envanter.seciliYuva();
    /* Keskinlik: seviye başına +1 hasar (yarım kalp) */
    if (a && a.tur !== 'yay') hasar += buyuSeviye(es, 'keskin');
    if (this.hayatta.etki('guc')) hasar *= 1.5;
    const o = this.oyuncu;
    const kritik = !o.yerde && !o.suda && o.hiz.y < 0;
    if (kritik) { hasar *= 1.5; this.dusenler.renkliParcacik([1, 0.9, 0.5], v.konum.x, v.konum.y + v.tur.boy * 0.7, v.konum.z, 8); }
    /* Savurma: geri itme seviye başına %60 artar; Yağma: ganimet artar */
    const itme = (o.kosuyor ? 1.5 : 1) * (1 + 0.6 * buyuSeviye(es, 'savurma'));
    /* Güneş Kılıcı vurulan canlıyı tutuşturur */
    if (this.varliklar.hasarVer(v, hasar, o.konum, { itme, oyuncu: true, yagma: buyuSeviye(es, 'yagma'), ates: !!(es && (es.id === 458 || (ESYALAR[es.id] && ESYALAR[es.id].yakar))) })) {
      this.ses.vurus();
      if (a && a.tur !== 'yay' && this.envanter.aletYipran(a.tur === 'kilic' ? 1 : 2)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
      this.hayatta.yor(0.1);
    }
  }

  okAt(goz, yon) {
    const g = this.germe;
    const p = goz.clone().addScaledVector(yon, 0.5);
    const tam = g >= 1;
    /* Güç büyüsü: ok hasarı seviye başına %25 artar */
    const gb = 1 + 0.25 * buyuSeviye(this.envanter.seciliYuva(), 'guc');
    /* Buz Yayı: oklar vurduğu canlıyı yavaşlatır */
    const ek = this.envanter.seciliId() === 459 ? { yavas: true } : null;
    this.varliklar.okAt(p, yon.clone().multiplyScalar(8 + 30 * g), (2 + g * 6 + (tam && Math.random() < 0.25 ? 2 : 0)) * gb, false, null, ek);
    this.envanter.harca(287, 1);
    if (this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Yayınız kırıldı.'); }
    this.ses.yayAt();
    this.vurus = 0.01;
  }

  kir(h) {
    const b = BLOKLAR[h.id];
    if (this.solBekleme > 0 && b.sertlik === 0) return;
    const d = this.dunya, r = Math.random;
    const ust = d.blok(h.x, h.y + 1, h.z);
    /* Yan veya üstte su varsa boşluk suyla dolar */
    let yeni = 0;
    for (const [dx, dy, dz] of [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) { const n = d.blok(h.x + dx, h.y + dy, h.z + dz); if (n === 7 || n === 31) { yeni = 7; break; } if (n === 59) yeni = 59; }
    if (h.id === 31 || b.suIcinde) yeni = 7;
    if (!d.blokKoy(h.x, h.y, h.z, yeni)) return;
    /* Kapının diğer yarısı da kaldırılır */
    if (b.sekil === 'kapi') { const oy = h.y + (b.ust ? -1 : 1), ob = d.blok(h.x, oy, h.z); if (BLOKLAR[ob] && BLOKLAR[ob].sekil === 'kapi') d.blokKoy(h.x, oy, h.z, 0); }
    if (b.xp && this.alabilir(h.id)) this.hayatta.xpEkle(b.xp);
    if (b.ekin === 3) this.olay('hasat');
    this.istat('kirilan');
    if (b.sandik) for (const s of this.arayuz.sandikKirildi(h.x, h.y, h.z)) this.dusenler.birak(s.id, s.adet, h.x + 0.5, h.y + 0.5, h.z + 0.5, 0, 0, 0, s.dayanim, 0.5, s.buyu);
    this.ses.kir(b.ses);
    this.dusenler.parcacik(h.id, h.x, h.y, h.z);
    if (this.alabilir(h.id)) this.dusur(h.id, h.x, h.y, h.z, b.xp ? buyuSeviye(this.envanter.seciliYuva(), 'servet') : 0);
    const a = this.aletBilgi();
    if (a && b.sertlik > 0) {
      if (this.envanter.aletYipran(a.tur === 'kilic' ? 2 : 1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
    }
    this.hayatta.yor(0.025);
    /* Üstteki bitki/meşale desteksiz kalır */
    /* Üstteki kapı da düşer */
    if (BLOKLAR[ust] && BLOKLAR[ust].sekil === 'kapi' && !BLOKLAR[ust].ust) {
      d.blokKoy(h.x, h.y + 1, h.z, 0); if (BLOKLAR[d.blok(h.x, h.y + 2, h.z)].sekil === 'kapi') d.blokKoy(h.x, h.y + 2, h.z, 0);
      this.dusur(88, h.x, h.y + 1, h.z);
    }
    if ((BITKI[ust] || (BLOKLAR[ust] && ((BLOKLAR[ust].mesale && CIZIM[ust] !== C_KUP && !BLOKLAR[ust].gecit) || ZEMIN_MEK[BLOKLAR[ust].mekanik]))) && (!SIVI[ust] || BLOKLAR[ust].suIcinde)) {
      d.blokKoy(h.x, h.y + 1, h.z, BLOKLAR[ust].suIcinde ? 7 : 0);
      this.dusur(ust, h.x, h.y + 1, h.z);
      if (ust === 28 || ust === 29) { /* çalı tamamen düşer */ }
    }
  }

  /* servet: Servet büyüsü seviyesi (cevherlerde blok dışındaki ürünler çoğalır) */
  dusur(id, x, y, z, servet = 0) {
    const b = BLOKLAR[id];
    const liste = b.dusur ? b.dusur(Math.random) : [[id, 1]];
    for (const [e, n0] of liste) { const n = servet && e !== id ? n0 * (1 + Math.floor(Math.random() * (servet + 1))) : n0; if (n > 0) this.dusenler.birak(e, n, x + 0.5, y + 0.4, z + 0.5); }
  }

  /* ---------- 0.21.0: kova, makas, kovan ---------- */
  /* Bakış yönündeki ilk su bloğu (katı bloğa çarpınca durur) */
  suHedef() {
    const g = this.oyuncu.gozKonumu(), y = this.oyuncu.bakisYonu(), d = this.dunya;
    for (let t = 0; t < 5; t += 0.1) {
      const x = Math.floor(g.x + y.x * t), yy = Math.floor(g.y + y.y * t), z = Math.floor(g.z + y.z * t), id = d.blok(x, yy, z);
      if (id === 7) return { x, y: yy, z };
      if (KATI[id]) return null;
    }
    return null;
  }
  /* Kova: sudan su alınır (su kaynağı tükenmez); su kovası suyu koyar ve değdiği lavı obsidyene çevirir */
  kovaKullan(h, e) {
    const env = this.envanter, d = this.dunya;
    const degis = id => { env.seciliAzalt(1); env.ekle(id, 1); };
    if (e.kova) {
      const su = this.suHedef();
      if (!su) return false;
      degis(478); this.ses.sicrama(0.6); return true;
    }
    if (!h) return false;
    const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz, m = d.blok(x, y, z);
    if (m && !(BLOKLAR[m] && BLOKLAR[m].degistirilebilir && !SIVI[m])) return false;
    d.blokKoy(x, y, z, 7);
    let obs = 0;
    for (const [a, b, c] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (d.blok(x + a, y + b, z + c) === 59) { d.blokKoy(x + a, y + b, z + c, 515); obs++; }
    if (obs) { this.ses.yanma(); this.dusenler.renkliParcacik([0.7, 0.7, 0.75], x + 0.5, y + 0.5, z + 0.5, 12); this.arayuz.bildirim('Su lava değdi: lav obsidyene dönüştü.'); }
    degis(477); this.ses.sicrama(0.5); this.olay('kova');
    return true;
  }
  /* Makas: balkabağı oyulur (4 çekirdek düşer), dolu kovandan petek alınır */
  makasKullan(h) {
    const d = this.dunya, b = BLOKLAR[h.id];
    if (h.id === 559) {
      d.blokKoy(h.x, h.y, h.z, 560 + this.bakisYonu4());
      this.dusenler.birak(475, 4, h.x + 0.5 + h.nx * 0.6, h.y + 0.5, h.z + 0.5 + h.nz * 0.6);
      this.ses.kaz('odun'); this.aletYipran();
      return true;
    }
    if (b.kovan) return this.kovanHasat(h, 'makas');
    return false;
  }
  aletYipran() { if (this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); } }
  /* Dolu kovandan bal (şişeyle) ya da 3 petek (makasla); altında 5 blok içinde kamp ateşi yoksa arılar kızar (sunucuda) */
  kovanHasat(h, ile) {
    const b = BLOKLAR[h.id];
    if (b.bal < 5) { this.arayuz.bildirim(`Kovan henüz dolmadı (bal ${b.bal}/5). Arılar yakındaki çiçeklerden bal yapar.`); return true; }
    this.dunya.blokKoy(h.x, h.y, h.z, 569 + b.yon * 6);
    if (ile === 'sise') { this.envanter.seciliAzalt(1); this.envanter.ekle(482, 1); this.ses.ic(); }
    else { this.dusenler.birak(483, 3, h.x + 0.5 + h.nx * 0.7, h.y + 0.5, h.z + 0.5 + h.nz * 0.7); this.ses.kaz('toprak'); this.aletYipran(); }
    let ates = false;
    for (let k = 1; k <= 5 && !ates; k++) if (this.dunya.blok(h.x, h.y - k, h.z) === 48) ates = true;
    this.arayuz.bildirim(ates ? 'Kamp ateşinin dumanı arıları sakinleştirdi.' : 'Arılar kızdı! Kovanın 5 blok altına kamp ateşi yakılırsa arılar sakin kalır.');
    this.olay('aricilik');
    return true;
  }
  /* Şeker kamışı yeri: altında kamış ya da suya komşu kum, toprak, çimen */
  kamisYeri(x, y, z) {
    const d = this.dunya, alt = d.blok(x, y - 1, z);
    if (alt === 568) return true;
    if (![3, 4, 5, 45, 142, 143].includes(alt)) return false;
    for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = d.blok(x + a, y - 1, z + c); if (n === 7 || n === 22) return true; }
    return false;
  }

  kullan(g) {
    const h = this.hedef, env = this.envanter;
    const s = env.seciliYuva(), e = s && ESYALAR[s.id];
    /* İstasyonlar */
    if (h && BLOKLAR[h.id].istasyon && !g.egil) { this.arayuz.envanterAc(BLOKLAR[h.id].istasyon); return true; }
    /* ---------- 0.21.0: tarım ve hayvancılık ---------- */
    if (e && (e.kova || e.suKovasi)) { if (this.kovaKullan(h, e)) return true; }
    if (h && e && e.alet && e.alet.tur === 'makas' && this.makasKullan(h)) return true;
    if (h && e && s.id === 331 && BLOKLAR[h.id].kovan && this.kovanHasat(h, 'sise')) return true;
    /* 0.18.0: Çakmak: obsidyen çerçevenin içinde Diyar Geçidi açar */
    if (h && e && e.tur === 'cakmak' && this.gecit) {
      if (this.gecit.yak(h) && this.envanter.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
      return true;
    }
    /* Sandalye ve koltuk: oturulur (elde blok tutulurken ya da eğilirken blok konur) */
    if (h && BLOKLAR[h.id].oturak && !g.egil && !(e && e.tur === 'blok') && this.binek && this.binek.otur(h.x, h.y, h.z)) return true;
    /* Sandık */
    if (h && BLOKLAR[h.id].sandik && !g.egil) { this.arayuz.sandikAc(h.x, h.y, h.z); return true; }
    /* Yatak */
    if (h && BLOKLAR[h.id].yatak) { this.arayuz.uyu(h); return true; }
    /* Kapı, çit kapısı ve tuzak kapı açılıp kapanır (eğilirken blok konur) */
    if (h && !g.egil && this.ac(h)) { this.acildi = true; return true; }
    /* Böğürtlen toplama */
    if (h && h.id === 28) {
      this.dunya.blokKoy(h.x, h.y, h.z, 29);
      this.dusenler.birak(265, 2 + (Math.random() < 0.4 ? 1 : 0), h.x + 0.5, h.y + 0.6, h.z + 0.5);
      this.ses.topla();
      return true;
    }
    if (!e) return false;
    /* Tekne: bakılan su yüzeyine konur */
    if (e.tur === 'tekne') {
      if (!this.tekneler || this.tekneler.binilen) return false;
      const t = this.tekneler.koy(this.oyuncu.gozKonumu(), this.oyuncu.bakisYonu(), e.tekne, this.oyuncu.yaw);
      if (t) { env.seciliAzalt(1); this.ses.koy('odun'); this.arayuz.bildirim(`${t.T.ad} suya kondu. Binmek için sağ tıklayınız.`, 'tekne'); }
      else this.arayuz.bildirim('Tekne yalnızca açık su yüzeyine konabilir.', 'tekne');
      return true;
    }
    /* Yiyecek ve bakım */
    if (e.zirh) { env.zirhGiy(); this.ses.zirhGiy(); return true; }
    /* Kemik tozu: ekinleri ve fidanları hızla büyütür, çimende çiçek açtırır */
    if (e.gubre && h) {
      const d = this.dunya;
      let oldu = false;
      if (BLOKLAR[h.id].meyve) { for (let k = 0; k < 4 && !oldu; k++) oldu = d.meyveVer(h.x, h.y, h.z); oldu = true; }
      else if (BLOKLAR[h.id].kamis) { let x = h.y; while (d.blok(h.x, x + 1, h.z) === 568) x++; d.kamisBuyut(h.x, x, h.z); oldu = true; }
      else if (EKIN_SONRAKI[h.id]) { let n = EKIN_SONRAKI[h.id]; if (Math.random() < 0.5 && EKIN_SONRAKI[n]) n = EKIN_SONRAKI[n]; d.blokKoy(h.x, h.y, h.z, n); oldu = true; }
      else if (BLOKLAR[h.id].fidan) { if (Math.random() < 0.45) d.fidanBuyut(h.x, h.y, h.z, BLOKLAR[h.id].fidan); oldu = true; }
      else if (h.id === 4 && h.ny === 1) {
        for (let k = 0; k < 10; k++) {
          const x = h.x + Math.floor(Math.random() * 5) - 2, z = h.z + Math.floor(Math.random() * 5) - 2;
          if (d.blok(x, h.y, z) === 4 && d.blok(x, h.y + 1, z) === 0) d.blokKoy(x, h.y + 1, z, [25, 25, 25, 26, 27, 44][Math.floor(Math.random() * 6)]);
        }
        oldu = true;
      }
      if (oldu) { env.seciliAzalt(1); this.dusenler.renkliParcacik([0.45, 0.85, 0.35], h.x + 0.5, h.y + 1, h.z + 0.5, 10); this.ses.topla(); return true; }
      return false;
    }
    /* Çapa: toprak ve çimen tarla toprağına çevrilir */
    if (e.alet && e.alet.tur === 'capa') {
      if (!h || ![3, 4, 45, 57].includes(h.id) || h.ny === -1) return false;
      const d = this.dunya, ust = d.blok(h.x, h.y + 1, h.z);
      if (ust && !(BLOKLAR[ust].degistirilebilir)) return false;
      if (ust) d.blokKoy(h.x, h.y + 1, h.z, 0);
      d.blokKoy(h.x, h.y, h.z, this.suYakin(h.x, h.y, h.z) ? 138 : 137);
      this.ses.koy('toprak'); this.dusenler.parcacik(3, h.x, h.y, h.z, 4);
      if (env.aletYipran(1)) { this.ses.aletKirildi(); this.arayuz.bildirim('Aletiniz kırıldı.'); }
      return true;
    }
    /* Tohum ekme (havuç ve patates hem ekilir hem yenir) */
    if (e.ekin && h && TOPRAK.has(h.id) && h.ny === 1 && this.dunya.blok(h.x, h.y + 1, h.z) === 0) {
      this.dunya.blokKoy(h.x, h.y + 1, h.z, e.ekin); env.seciliAzalt(1); this.ses.koy('bitki');
      return true;
    }
    if (e.ekin && !e.yemek) return false;
    /* İksir: etkisi süre boyunca devam eder, boş şişe geri kalır */
    if (e.tur === 'iksir' && e.etki) {
      this.hayatta.etkiEkle(e.etki.tur, e.etki.sure); this.olay('iksir');
      env.seciliAzalt(1); env.ekle(331, 1); this.ses.ic();
      this.arayuz.bildirim(`${ETKILER[e.etki.tur].ad} etkisi başladı: 3 dakika.`, s.id);
      return true;
    }
    if ((e.tur === 'yiyecek' || e.yenir) && e.yemek) {
      if (this.hayatta.aclik >= 20 && !e.iyilestirme && !e.etki && !e.temizle && !e.zehirGider) { this.arayuz.bildirim('Açlık çubuğu dolu.'); return true; }
      if (e.etki) { this.hayatta.etkiEkle(e.etki.tur, e.etki.sure); this.arayuz.bildirim(`${ETKILER[e.etki.tur].ad} etkisi: ${e.etki.sure} saniye.`, s.id); }
      if (e.iyilestirme) this.hayatta.iyiles(e.iyilestirme);
      if (this.hayatta.ye(e.yemek, e.zehir || 0)) this.arayuz.bildirim('Mide bulantısı: açlık bir süre daha hızlı azalır.');
      if (e.pismis) this.olay('pisir');
      /* 0.22.0: sıcak çorba ısıtır, ayran serinletir */
      if (e.sicak) { this.hayatta.etkiEkle('sicak', e.sicak); if (this.hayatta.vucut < 36) this.arayuz.bildirim('Sıcak çorba içinizi ısıttı.'); }
      if (e.serin) this.hayatta.etkiEkle('serin', e.serin);
      this.istat('yemek');
      env.seciliAzalt(1);
      if (e.kap) { env.ekle(e.kap, 1); this.ses.ic(); } else this.ses.ye();
      this.yemeAnim = 1;   // 0.23.0: el ağza götürülür
      if (s.id === 269 || e.kase) env.ekle(270, 1);
      /* 0.21.0: süt olumsuz etkileri ve zehri, bal zehri giderir */
      if (e.temizle || e.zehirGider) { const H = this.hayatta; H.zehir = 0; H.agu = 0; if (e.temizle) for (const k in H.etkiler) if (ETKILER[k] && ETKILER[k].kotu && k !== 'kanama' && k !== 'kirik') delete H.etkiler[k]; this.arayuz.bildirim(e.temizle ? 'Olumsuz etkiler geçti.' : 'Zehir geçti.'); }
      if (s.id >= 484 && s.id <= 491) this.olay('ciftci');
      if (s.id >= 463 && s.id <= 470) this.olay('gurme');
      return true;
    }
    if (e.tur === 'iyilestir') {
      /* 0.22.0: bandaj ve şifa iksiri kanamayı durdurur */
      const kanama = this.hayatta.etki('kanama');
      if (this.hayatta.can >= 20 && !kanama) { this.arayuz.bildirim('Canınız dolu.'); return true; }
      this.hayatta.iyiles(e.iyilestir); env.seciliAzalt(1); this.ses.topla();
      if (kanama) { delete this.hayatta.etkiler.kanama; this.arayuz.bildirim('Kanama durdu.'); if (s.id === 268) this.olay('ilkYardim'); }
      return true;
    }
    /* 0.22.0: atel kırık bacağı sarar */
    if (e.tur === 'atel') {
      const H = this.hayatta;
      if (!H.etki('kirik')) { this.arayuz.bildirim('Kırık bir kemik yok.'); return true; }
      if (H.atel) { this.arayuz.bildirim('Bacak zaten atelle sarılı.'); return true; }
      H.etkiler.kirik = Math.min(H.etkiler.kirik, 30); H.atel = true;
      env.seciliAzalt(1); this.ses.zirhGiy(); this.olay('atel');
      this.arayuz.bildirim('Atel sarıldı: kemik 30 saniyede kaynar.');
      return true;
    }
    /* 0.22.0: Eve Dönüş Tılsımı */
    if (e.alet && e.alet.tur === 'tilsim') { if (this.arayuz.tilsim) this.arayuz.tilsim(); return true; }
    /* Blok koyma */
    if (e.tur === 'blok' && h) {
      let id = e.blok;
      const d = this.dunya, eb = BLOKLAR[id];
      /* Yarım blok üstüne aynı yarım blok: tam blok olur */
      if (eb.sekil === 'yarim') {
        const hb0 = BLOKLAR[h.id];
        if (hb0.sekil === 'yarim' && hb0.taban === id && ((!hb0.ust && h.ny === 1) || (hb0.ust && h.ny === -1))) return this.koyVeHarca(h.x, h.y, h.z, hb0.cift, env);
      }
      let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
      const hb = BLOKLAR[h.id];
      if (hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
      let mevcut = d.blok(x, y, z);
      if (eb.sekil === 'yarim') {
        const mb0 = BLOKLAR[mevcut];
        if (mb0 && mb0.sekil === 'yarim' && mb0.taban === id) return this.koyVeHarca(x, y, z, mb0.cift, env);
      }
      /* Biçimli blokların yönü ve durumu */
      const f = this.bakisYonu4();
      if (eb.sekil === 'merdiven' || eb.sekil === 'sandalye' || eb.sekil === 'koltuk') id = eb.taban + f;
      else if (eb.sekil === 'tablo') {
        const yi = YONLER.findIndex(([a, b]) => a === -h.nx && b === -h.nz);
        if (h.ny !== 0 || yi < 0 || !(KATI[h.id] && OPAK[h.id])) { this.arayuz.bildirim('Tablo katı bir duvarın yan yüzüne asılır.'); return true; }
        id = eb.taban + yi;
      }
      else if (eb.sekil === 'yarim') id = eb.taban + (h.ny === -1 || (h.ny === 0 && h.py > 0.5) ? 1 : 0);
      else if (eb.yuzlu) id = eb.taban + f;   // heykel başı: yüzü oyuncuya döner
      else if (eb.sekil === 'citKapi') id = 105 + (f === 0 || f === 2 ? 0 : 1) * 2;
      else if (eb.sekil === 'tuzak') id = 121 + f * 2;
      else if (eb.mekanik === 'ters') id = 243 + f * 2;   // 0.17.0: çıkış, oyuncunun baktığı yöndedir
      else if (eb.mekanik === 'gecik') id = 523 + f * 8;   // 0.20.0
      else if (eb.kovan) id = 569 + ((f + 2) % 4) * 6;   // 0.21.0: arı kovanının girişi oyuncuya bakar
      else if (eb.kamis && !this.kamisYeri(x, y, z)) { this.arayuz.bildirim('Şeker kamışı suya komşu kum, toprak ya da çimen üstüne veya başka bir kamışın üstüne konur.'); return true; }
      else if (eb.sekil === 'tirmanma') {
        const yi = YONLER.findIndex(([a, b]) => a === -h.nx && b === -h.nz);
        if (h.ny !== 0 || yi < 0 || !(KATI[h.id] && OPAK[h.id])) { this.arayuz.bildirim('Tırmanma merdiveni katı bir duvarın yan yüzüne konur.'); return true; }
        id = 110 + yi;
      } else if (eb.sekil === 'kapi') {
        const ust = d.blok(x, y + 1, z), alt = d.blok(x, y - 1, z);
        if ((mevcut && !BLOKLAR[mevcut].degistirilebilir) || (ust && !BLOKLAR[ust].degistirilebilir)) return false;
        if (!KATI[alt]) { this.arayuz.bildirim('Kapı katı bir zeminin üstüne konur.'); return true; }
        if (this.oyuncu.hucreyiKapliyor(x, y, z) || this.oyuncu.hucreyiKapliyor(x, y + 1, z)) return false;
        if (y + 1 >= 127) return false;
        d.blokKoy(x, y, z, 88 + f * 4); d.blokKoy(x, y + 1, z, 88 + f * 4 + 1);
        env.seciliAzalt(1); this.ses.koy('odun');
        return true;
      }
      mevcut = d.blok(x, y, z);
      const mb = BLOKLAR[mevcut];
      const suBitkisi = !!BLOKLAR[id].suIcinde;
      const bitki = (BITKI[id] && !suBitkisi) || BLOKLAR[id].mesale;
      if (mevcut !== 0 && !(mb.degistirilebilir) && !(SIVI[mevcut] && !BITKI[mevcut] && !bitki)) return false;
      if (y < 1 || y >= 127) return false;
      const alt = d.blok(x, y - 1, z);
      if (BLOKLAR[id].mesale && CIZIM[id] !== C_KUP && !(KATI[alt] && (OPAK[alt] || BLOKLAR[id].lamba))) { this.arayuz.bildirim('Meşale katı bir bloğun üstüne konur.'); return true; }
      if (ZEMIN_MEK[BLOKLAR[id].mekanik] && !(KATI[alt] && OPAK[alt])) { this.arayuz.bildirim(`${BLOKLAR[id].ad} katı bir bloğun üstüne konur.`); return true; }
      if (suBitkisi) {
        if (mevcut !== 7 || !KATI[alt]) { this.arayuz.bildirim('Bu bitki su altında katı bir zemine dikilir.'); return true; }
      } else if (BITKI[id]) {
        if (id === 36 || id === 153 ? !KATI[alt] : !TOPRAK.has(alt)) { this.arayuz.bildirim('Bu bitki toprak veya çimen üstüne dikilir.'); return true; }
        if (SIVI[mevcut]) return false;
      }
      if (KATI[id] && this.oyuncu.hucreyiKapliyor(x, y, z)) return false;
      if (!d.blokKoy(x, y, z, id)) return false;
      if (BLOKLAR[id].sandik) this.arayuz.sandikYerlesti(x, y, z);
      env.seciliAzalt(1); this.istat('konulan');
      this.ses.koy(BLOKLAR[id].ses);
      return true;
    }
    return false;
  }

  /* Bakış yönü dört yöne yuvarlanır: 0 kuzey (-z), 1 doğu, 2 güney, 3 batı */
  bakisYonu4() { const y = this.oyuncu.yaw, dx = -Math.sin(y), dz = -Math.cos(y); return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : (dz > 0 ? 2 : 0); }
  koyVeHarca(x, y, z, id, env) {
    if (!this.dunya.blokKoy(x, y, z, id)) return false;
    env.seciliAzalt(1); this.ses.koy(BLOKLAR[id].ses);
    return true;
  }
  /* Kapı, çit kapısı, tuzak kapı */
  ac(h) {
    const b = BLOKLAR[h.id], d = this.dunya;
    if (b.sekil === 'kapi') {
      const yeniA = b.acik ? 0 : 1, oy = h.y + (b.ust ? -1 : 1), ob = BLOKLAR[d.blok(h.x, oy, h.z)];
      d.blokKoy(h.x, h.y, h.z, 88 + b.yon * 4 + yeniA * 2 + b.ust);
      if (ob && ob.sekil === 'kapi') d.blokKoy(h.x, oy, h.z, 88 + ob.yon * 4 + yeniA * 2 + ob.ust);
      this.ses.kapi(yeniA);
      return true;
    }
    if (b.sekil === 'citKapi') {
      if (b.acik && this.oyuncu.hucreyiKapliyor(h.x, h.y, h.z)) return true;
      d.blokKoy(h.x, h.y, h.z, 105 + b.eksen * 2 + (b.acik ? 0 : 1)); this.ses.kapi(!b.acik); return true;
    }
    if (b.sekil === 'tuzak') { d.blokKoy(h.x, h.y, h.z, 121 + b.yon * 2 + (b.acik ? 0 : 1)); this.ses.kapi(!b.acik); return true; }
    /* 0.17.0: kol açılıp kapanır, düğmeye basılır (bir saniye sonra kendiliğinden kalkar), müzik kutusu ezgisini çalar */
    if (b.mekanik === 'kol') { d.blokKoy(h.x, h.y, h.z, b.acik ? 233 : 234); this.ses.kol(!b.acik); return true; }
    /* 0.20.0: Geciktiricinin gecikmesi sağ tıkla 1-4 adım arasında döner */
    if (b.mekanik === 'gecik') { d.blokKoy(h.x, h.y, h.z, 523 + b.yon * 8 + ((b.gecikme + 1) % 4) * 2 + b.acik); this.ses.kol(true); this.arayuz.bildirim(`Gecikme: ${((b.gecikme + 1) % 4) + 1} adım (${(((b.gecikme + 1) % 4) + 1) / 10} sn)`.replace('.', ',')); return true; }
    if (b.mekanik === 'dugme') { if (!b.acik) { d.blokKoy(h.x, h.y, h.z, 236); this.ses.dugme(); } return true; }
    if (b.mekanik === 'muzik') {
      const m = ezgiTuru(d.blok(h.x, h.y - 1, h.z)), V = this.varliklar;
      if (V && !V.ayna) V.efekt({ t: 'patlama', x: h.x + 0.5, y: h.y + 1.2, z: h.z + 0.5, c: [0.95, 0.5, 0.75], n: 6, ses: 'nota', m });
      else { this.ses.melodi(m, 1); this.dusenler.parcacik(251, h.x, h.y + 0.6, h.z, 4); }
      return true;
    }
    return false;
  }
  /* Tarlanın 4 blok çevresinde su var mı */
  suYakin(x, y, z) {
    for (let dy = 0; dy <= 1; dy++) for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { const b = this.dunya.blok(x + dx, y + dy, z + dz); if (b === 7 || b === 31) return true; }
    return false;
  }

  /* Elde tutulan eşyayı ileri at */
  at(hepsi) {
    const s = this.envanter.seciliYuva();
    if (!s) return;
    const n = hepsi ? s.adet : 1;
    const goz = this.oyuncu.gozKonumu(), yon = this.oyuncu.bakisYonu();
    this.dusenler.birak(s.id, n, goz.x + yon.x * 0.5, goz.y - 0.3 + yon.y * 0.5, goz.z + yon.z * 0.5, yon.x * 5, yon.y * 5 + 2, yon.z * 5, s.dayanim, 1.5, s.buyu);
    this.envanter.seciliAzalt(n);
    this.vurus = 0.01;
  }
}

export { THREE };
