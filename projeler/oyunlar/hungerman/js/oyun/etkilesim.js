/* HungerMan - etkileşim: bakılan bloğu bulma, kazma/kırma, blok koyma, yeme, toplama */
import { THREE } from '../grafik/sahne.js';
import { buyuSeviye, BLOKLAR, ESYALAR, KATI, SIVI, BITKI, CIZIM, C_YOK, OPAK, ETKILER, EKIN_SONRAKI } from '../bloklar.js';
import { SEKIL, YONLER, hucreKutulari, kutuIsin, sinirKutusu } from '../sekiller.js';

const ERISIM = 5;
const TOPRAK = new Set([3, 4, 45, 137, 138]);

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
        } else if (!BITKI[id] && !BLOKLAR[id].mesale || this.bitkiIsabet(goz, yon, x, y, z)) return { x, y, z, id, nx, ny, nz, t, py: goz.y + yon.y * t - y };
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
    if (this.varliklar.hasarVer(v, hasar, o.konum, { itme, oyuncu: true, yagma: buyuSeviye(es, 'yagma'), ates: !!(es && es.id === 458) })) {
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
    if ((BITKI[ust] || (BLOKLAR[ust] && BLOKLAR[ust].mesale)) && (!SIVI[ust] || BLOKLAR[ust].suIcinde)) {
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

  kullan(g) {
    const h = this.hedef, env = this.envanter;
    const s = env.seciliYuva(), e = s && ESYALAR[s.id];
    /* İstasyonlar */
    if (h && BLOKLAR[h.id].istasyon && !g.egil) { this.arayuz.envanterAc(BLOKLAR[h.id].istasyon); return true; }
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
      if (EKIN_SONRAKI[h.id]) { let n = EKIN_SONRAKI[h.id]; if (Math.random() < 0.5 && EKIN_SONRAKI[n]) n = EKIN_SONRAKI[n]; d.blokKoy(h.x, h.y, h.z, n); oldu = true; }
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
      if (this.hayatta.aclik >= 20 && !e.iyilestirme) { this.arayuz.bildirim('Açlık çubuğu dolu.'); return true; }
      if (e.iyilestirme) this.hayatta.iyiles(e.iyilestirme);
      if (this.hayatta.ye(e.yemek, e.zehir || 0)) this.arayuz.bildirim('Mide bulantısı: açlık bir süre daha hızlı azalır.');
      if (e.pismis) this.olay('pisir');
      env.seciliAzalt(1); this.ses.ye();
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
      if (eb.sekil === 'merdiven') id = eb.taban + f;
      else if (eb.sekil === 'yarim') id = eb.taban + (h.ny === -1 || (h.ny === 0 && h.py > 0.5) ? 1 : 0);
      else if (eb.sekil === 'citKapi') id = 105 + (f === 0 || f === 2 ? 0 : 1) * 2;
      else if (eb.sekil === 'tuzak') id = 121 + f * 2;
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
      if (BLOKLAR[id].mesale && !(KATI[alt] && OPAK[alt])) { this.arayuz.bildirim('Meşale katı bir bloğun üstüne konur.'); return true; }
      if (suBitkisi) {
        if (mevcut !== 7 || !KATI[alt]) { this.arayuz.bildirim('Bu bitki su altında katı bir zemine dikilir.'); return true; }
      } else if (BITKI[id]) {
        if (id === 36 || id === 153 ? !KATI[alt] : !TOPRAK.has(alt)) { this.arayuz.bildirim('Bu bitki toprak veya çimen üstüne dikilir.'); return true; }
        if (SIVI[mevcut]) return false;
      }
      if (KATI[id] && this.oyuncu.hucreyiKapliyor(x, y, z)) return false;
      if (!d.blokKoy(x, y, z, id)) return false;
      if (BLOKLAR[id].sandik) this.arayuz.sandikYerlesti(x, y, z);
      env.seciliAzalt(1);
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
