/* HungerMan - canlılar yöneticisi: doğma, kaybolma, yapay zekâ, fizik, hasar, oklar
   Çok oyunculuda yapay zekâ sunucu olan oyuncuda çalışır ve her canlı en yakın oyuncuya göre davranır;
   diğer oyuncularda (ayna) canlılar sunucudan gelen konumlarla gösterilir. */
import { THREE } from '../grafik/sahne.js';
import { MODELLER, okModeli } from './modeller.js';
import { TURLER, HAYVANLAR } from './turler.js';
import { BY, KARLI } from '../dunya/uretici.js';
import { KATI, SIVI, KESIK, BITKI, LAV, BLOKLAR } from '../bloklar.js';
import { zindanAt, YUVA_TURLERI } from '../dunya/zindan-uretici.js';
import { madenAt } from '../dunya/maden-uretici.js';
import { karma3 } from '../rastgele.js';
import { PY, DENIZ, diyarMi } from '../sabitler.js';
import { cakisma } from '../sekiller.js';

let SIRA = 1;
/* 0.23.0: canlıların altındaki yumuşak gölge (zemine yatırılmış, kenarı silinen koyu daire) */
const GOLGE_GEO = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const GOLGE_MALZ = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, opacity: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
})();
const CICEK = new Set([26, 27, 44]);   // 0.21.0: arıların polen topladığı çiçekler
const MAX_HAYVAN = 18, HAYVAN_UZAK = 120, ZOMBI_UZAK = 72;

export class Varliklar {
  constructor(o) {
    Object.assign(this, o); // sahne, dunya, dusenler, ses, uretici
    this.liste = [];
    this.oklar = [];
    this.grup = new THREE.Group();
    this.sahne.sahne.add(this.grup);
    this.dogurSayac = 2;
    this.bakilan = null;
    this.sonVurulan = null; this.sonVurulanZaman = 0;
    this.olaylar = { vurus: null, olum: null, yavru: null };
    this.ayna = false;        // çok oyunculu istemci: yapay zekâ çalışmaz, sunucu verisi gösterilir
    this.ag = null;           // ağ kancaları
    this.dinleyici = null;    // çok oyunculuda seslerin uzaklığa göre kısılması için yerel oyuncunun konumu
    this.okSira = 0;
  }
  /* Ses düzeyi: çok oyunculuda dinleyiciye uzaklığa göre azalır (tek oyunculuda her zaman 1) */
  sesK(p, menzil = 32) { if (!this.dinleyici) return 1; const d = this.dinleyici.distanceTo(p); return d >= menzil ? 0 : 1 - d / menzil; }
  kaldir(v) { const i = this.liste.indexOf(v); if (i >= 0) { this.modelSil(v); this.liste.splice(i, 1); } }

  temizle() {
    for (const v of this.liste) this.modelSil(v);
    for (const o of this.oklar) { this.grup.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose(); }
    this.liste = []; this.oklar = [];
    this.sahne.sahne.remove(this.grup);
  }
  modelSil(v) { if (v.golge) this.grup.remove(v.golge); this.grup.remove(v.m.kok); v.m.kok.traverse(n => { if (n.geometry) n.geometry.dispose(); }); v.m.malzeme.dispose(); }

  ekle(turAd, x, y, z, ek) {
    const tur = TURLER[turAd];
    const renk = ek && ek.renk != null ? ek.renk : tur.renkler ? Math.floor(Math.random() * tur.renkler) : 0;
    const m = MODELLER[tur.model](ek && ek.meslek, renk);
    const v = {
      id: SIRA++, turAd, tur, m, konum: new THREE.Vector3(x, y, z), hiz: new THREE.Vector3(), yaw: Math.random() * Math.PI * 2, hedefYaw: 0,
      can: tur.can, yerde: false, suda: false, engel: false, karar: Math.random() * 2, hedef: null, kacZaman: 0, kacKaynak: null,
      hasarZaman: 0, saldiriBek: 0, ofkeli: false, olu: false, olumZaman: 0, faz: 0, sesZaman: 3 + Math.random() * 10,
      isik: 1, isikSayac: 0, yaniyor: false, yanmaSayac: 0, zipSayac: 0, sikisma: 0, renk
    };
    m.kok.position.copy(v.konum);
    if (m.kollar.length && !m.insan && !tur.uzak) for (const k of m.kollar) k.rotation.x = Math.PI / 2 * 0.92;
    this.grup.add(m.kok);
    this.liste.push(v);
    return v;
  }

  /* ---------- Dünya yardımcıları ---------- */
  kati(x, y, z) { return this.dunya.kati(Math.floor(x), Math.floor(y), Math.floor(z)); }
  /* Çarpışma: katı bloklar ve biçimli blok kutuları (mod 1: çakışanların en yüksek üst yüzü) */
  carpisiyor(v, x, y, z, mod = 0) {
    const g = v.tur.gen, b = v.tur.boy;
    return cakisma(this.dunya, x - g, y, z - g, x + g, y + b, z + g, mod);
  }
  /* Üstünde iki blok boşluk olan, yaprak olmayan en üst katı zemin */
  zeminBul(x, z) {
    const d = this.dunya;
    for (let y = PY - 2; y > 2; y--) {
      const b = d.blok(x, y, z);
      if (!b || BITKI[b]) continue;
      if (SIVI[b]) return null;
      if (KESIK[b] || !KATI[b]) return null;
      const u1 = d.blok(x, y + 1, z), u2 = d.blok(x, y + 2, z);
      if ((u1 && !BITKI[u1]) || (u2 && !BITKI[u2]) || SIVI[u1]) return null;
      return { y: y + 1, b };
    }
    return null;
  }
  gokAcik(x, y, z) { return this.dunya.ustKati(Math.floor(x), Math.floor(z)) < y; }
  mesaleYakin(x, y, z, r) {
    for (const m of this.dunya.mesaleler.values()) if ((m[0] - x) ** 2 + (m[1] - y) ** 2 + (m[2] - z) ** 2 < r * r) return true;
    return false;
  }

  /* ---------- Doğma ---------- */
  /* 0.18.0: Yeraltı Diyarı: hayvan doğmaz; kül zombileri ve kor ruhları gece gündüz doğar */
  diyarDogur(ctx) {
    const op = ctx.oyuncu.konum;
    let n = 0;
    for (const v of this.liste) if (!v.olu && v.tur.dusman && (v.konum.x - op.x) ** 2 + (v.konum.z - op.z) ** 2 < 100 * 100) n++;
    if (n >= 12) return;
    for (let deneme = 0; deneme < 8; deneme++) {
      const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 26;
      const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      const y0 = Math.floor(Math.max(34, Math.min(PY - 6, op.y - 14 + Math.random() * 28)));
      let y = null;
      for (let k = 0; k < 16; k++) { const t = y0 - k; if (t < 33) break; if (this.dunya.kati(x, t - 1, z) && !this.dunya.kati(x, t, z) && !this.dunya.kati(x, t + 1, z) && !SIVI[this.dunya.blok(x, t, z)]) { y = t; break; } }
      if (y == null || (x + 0.5 - op.x) ** 2 + (y - op.y) ** 2 + (z + 0.5 - op.z) ** 2 < 14 * 14) continue;
      if (Math.random() < 0.5) this.ekle('kulzombi', x + 0.5, y, z + 0.5);
      else if (!this.kati(x + 0.5, y + 2, z + 0.5)) this.ekle('korruhu', x + 0.5, y + 1.5, z + 0.5);
      break;
    }
  }
  dogur(ctx) {
    const op = ctx.oyuncu.konum;
    if (diyarMi(op.x)) { this.diyarDogur(ctx); return; }
    let hayvan = 0, zombi = 0;
    let su = 0, kopek = 0, hamsi = 0;
    for (const v of this.liste) { if (v.olu || (v.konum.x - op.x) ** 2 + (v.konum.z - op.z) ** 2 > 128 * 128) continue; if (v.tur.su) { su++; if (v.turAd === 'kopekbaligi') kopek++; if (v.turAd === 'hamsi') hamsi++; } else if (v.tur.dusman) zombi++; else if (!v.tur.koylu && !v.evcil) hayvan++; }
    /* Deniz canlıları: oyuncunun çevresindeki yeterince derin sularda */
    if (su < 14) {
      const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 26;
      const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
      if (this.dunya.yuklu(x, z)) {
        let derin = 0, y = DENIZ;
        while (y > 2 && SIVI[this.dunya.blok(x, y, z)] && !LAV[this.dunya.blok(x, y, z)]) { derin++; y--; }
        if (derin >= 2) {
          const b = this.uretici.kolon(x, z, {}).b, s = Math.random();
          let tur = s < 0.38 ? 'hamsi' : s < 0.8 ? 'cipura' : 'ahtapot';
          if (tur === 'hamsi' && hamsi >= 8) tur = Math.random() < 0.7 ? 'cipura' : 'ahtapot';
          if (tur === 'ahtapot' && derin < 4) tur = 'cipura';
          if (derin >= 12 && b === BY.DERIN && kopek < 2 && Math.random() < 0.18) tur = 'kopekbaligi';
          const T = TURLER[tur], n = Math.min(16 - su, T.grup[0] + Math.floor(Math.random() * (T.grup[1] - T.grup[0] + 1)));
          for (let i = 0; i < n; i++) {
            const gy = DENIZ - 1 - Math.random() * Math.max(0, derin - 2.2);
            const gx = x + 0.5 + (Math.random() - 0.5) * 3, gz = z + 0.5 + (Math.random() - 0.5) * 3;
            if (SIVI[this.dunya.blok(Math.floor(gx), Math.floor(gy), Math.floor(gz))]) this.ekle(tur, gx, gy, gz);
          }
        }
      }
    }
    /* Hayvanlar: oyuncudan uzakta, uygun biyomda gruplar hâlinde */
    if (hayvan < MAX_HAYVAN) {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 36;
      const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
      if (this.dunya.yuklu(x, z)) {
        const kol = this.uretici.kolon(x, z, {});
        const adaylar = HAYVANLAR.filter(t => TURLER[t].biyom.includes(kol.b));
        const zem = this.zeminBul(x, z);
        if (adaylar.length && zem && (zem.b === 4 || zem.b === 45 || zem.b === 5 || zem.b === 3 || zem.b === 142)) {
          let tur = adaylar[Math.floor(Math.random() * adaylar.length)];
          if (tur === 'kedi' && Math.random() < 0.7) tur = adaylar[0];   // kediler seyrek
          const T = TURLER[tur];
          const n = T.grup[0] + Math.floor(Math.random() * (T.grup[1] - T.grup[0] + 1));
          for (let i = 0; i < n; i++) {
            const gx = x + Math.floor(Math.random() * 5) - 2, gz = z + Math.floor(Math.random() * 5) - 2;
            const gz2 = this.zeminBul(gx, gz);
            if (gz2 && Math.abs(gz2.y - zem.y) < 3) this.ekle(tur, gx + 0.5, gz2.y, gz + 0.5);
          }
        }
      }
    }
    /* Canavarlar (0.15.1 dengesi):
       - Gece yüzeyde doğar; gündüz açık havada doğmaz.
       - Gündüz yağış (yağmur, kar, fırtına) varsa yüzeyde nadiren doğar.
       - Yeraltında (arazi yüzeyinin en az 5 blok altında, karanlık boşluklarda) her zaman doğar; ağaç gölgesi yeraltı sayılmaz.
       - Meşale ve ışık kaynaklarının yakınında doğmaz. */
    const gece = ctx.gunIsigi < 0.4;
    const yagis = !!(ctx.yagmur || ctx.firtina);
    /* 0.22.0: Kanlı Ay: iki kat canavar, meşaleler daha az korur */
    const kanli = !!ctx.kanliAy;
    const zc = ctx.zorlukCanavar || 1;   // 0.23.0: zorluk
    const sinir = Math.round((kanli ? Math.min(32, 2 * (5 + ctx.gunSayisi)) : Math.min(18, 5 + ctx.gunSayisi)) * zc);
    if (zombi < (gece ? sinir : Math.ceil(sinir / 2))) {
      for (let deneme = 0; deneme < 6; deneme++) {
        const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 26;
        const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
        if (!this.dunya.yuklu(x, z)) continue;
        let y = null;
        const yuzeyde = gece ? Math.random() < (kanli ? 0.85 : 0.6) : yagis && Math.random() < 0.12;
        if (yuzeyde) {
          const zem = this.zeminBul(x, z);
          if (zem) y = zem.y;
        } else {
          /* Mağara: oyuncunun yakın derinliklerinde boşluk ara */
          const yy = Math.floor(Math.max(5, Math.min(PY - 4, op.y - 16 + Math.random() * 30)));
          for (let k = 0; k < 10; k++) {
            const t = yy - k;
            if (t < 4) break;
            if (this.dunya.kati(x, t - 1, z) && !this.dunya.kati(x, t, z) && !this.dunya.kati(x, t + 1, z) && !SIVI[this.dunya.blok(x, t, z)] && !this.gokAcik(x, t + 2, z)) { y = t; break; }
          }
          /* Gerçekten yeraltında mı: arazi yüzeyinin altında olmalı (ağaç ve çatı altı sayılmaz) */
          if (y != null && y > this.uretici.kolon(x, z, {}).h - 5) y = null;
        }
        if (y == null) continue;
        if ((x + 0.5 - op.x) ** 2 + (y - op.y) ** 2 + (z + 0.5 - op.z) ** 2 < 18 * 18) continue;
        if (this.mesaleYakin(x + 0.5, y, z + 0.5, kanli ? 6 : 10)) continue;
        const s = Math.random(), yeralti = !this.gokAcik(x, y + 2, z);
        let tur = yeralti ? (s < 0.42 ? 'zombi' : s < 0.72 ? 'iskelet' : 'orumcek') : (s < 0.6 ? 'zombi' : s < 0.85 ? 'iskelet' : 'orumcek');
        /* 0.14.0: çöl ve savanda mumya, karlı bölgelerde buz iskeleti */
        if (!yeralti) {
          const b = this.uretici.kolon(x, z, {}).b;
          if (tur === 'zombi' && (b === BY.COL || b === BY.SAVAN) && Math.random() < 0.85) tur = 'mumya';
          else if (tur === 'iskelet' && KARLI.has(b) && Math.random() < 0.85) tur = 'buziskelet';
        }
        /* Yarasa sürüsü: mağaralarda ve gece açıkta */
        if (Math.random() < (yeralti ? 0.2 : 0.06)) {
          const T = TURLER.yarasa, n = T.grup[0] + Math.floor(Math.random() * (T.grup[1] - T.grup[0] + 1));
          for (let i = 0; i < n; i++) { const gx = x + 0.5 + (Math.random() - 0.5) * 2, gy = y + 1 + Math.random() * 1.5, gz = z + 0.5 + (Math.random() - 0.5) * 2; if (!this.kati(gx, gy, gz) && !this.kati(gx, gy + 0.5, gz)) this.ekle('yarasa', gx, gy, gz); }
          break;
        }
        const yeni = this.ekle(tur, x + 0.5, y, z + 0.5);
        if (kanli && !yeralti) this.kanliYap(yeni);
        break;
      }
      /* Boğulmuş zombi: gece yeterince derin suların dibinde, çok derin sularda her zaman */
      if (Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2, r = 16 + Math.random() * 22;
        const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
        if (this.dunya.yuklu(x, z)) {
          let y = DENIZ;
          while (y > 2 && SIVI[this.dunya.blok(x, y, z)] && !LAV[this.dunya.blok(x, y, z)]) y--;
          const derin = DENIZ - y;
          if (derin >= 3 && (gece || derin >= 10) && this.dunya.kati(x, y, z) && !this.mesaleYakin(x + 0.5, y + 1, z + 0.5, 10)) this.ekle('bogulmus', x + 0.5, y + 1, z + 0.5);
        }
      }
    }
  }

  /* ---------- Güncelleme ---------- */
  /* ctx.oyuncular verilirse (çok oyunculu sunucu) her oyuncu için ayrı bağlam bulunur */
  guncelle(dt, ctx) {
    if (this.ayna) { this.aynaGuncelle(dt, ctx); return; }
    GOLGE_MALZ.opacity = 0.15 + 0.25 * (ctx.gunIsigi ?? 1);
    const C = ctx.oyuncular || [ctx];
    this._C = C;
    this.dogurSayac -= dt;
    if (this.dogurSayac <= 0) { this.dogurSayac = C[0] && C[0].kanliAy ? 0.6 : 1.2; if (!this.dogurmaKapali) for (const c of C) this.dogur(c); }
    this.kovanlariGuncelle(dt, C);
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const v = this.liste[i];
      /* Yapay zekâ en yakın canlı oyuncuya göre, kaybolma en yakın oyuncuya göre */
      let c = C[0], cd = Infinity, d2 = Infinity;
      for (const k of C) {
        const q = (v.konum.x - k.oyuncu.konum.x) ** 2 + (v.konum.z - k.oyuncu.konum.z) ** 2;
        if (q < d2) d2 = q;
        const w = k.oyuncuOlu ? q + 1e7 : q;
        if (w < cd) { cd = w; c = k; }
      }
      /* Gündüz açıkta kalan yarasalar gibi sessizce kaldırılan canlılar */
      if (v.sil) { this.modelSil(v); this.liste.splice(i, 1); continue; }
      const uzak = v.tur.koylu || v.evcil || v.tur.boss ? 1e9 : v.tur.su ? 64 : v.tur.dusman ? ZOMBI_UZAK : HAYVAN_UZAK;
      if (d2 > uzak * uzak || (v.olu && (v.olumZaman > 0.9 || !this.dunya.yuklu(v.konum.x, v.konum.z)))) {
        if (v.olu) this.dusenler.renkliParcacik([0.85, 0.85, 0.85], v.konum.x, v.konum.y + v.tur.boy * 0.5, v.konum.z, 16);
        this.modelSil(v); this.liste.splice(i, 1);
        continue;
      }
      if (!this.dunya.yuklu(v.konum.x, v.konum.z) || this.donmus) continue;   // donmus: geliştirici modunda canlılar durur
      /* Binilen at: konumunu binen oyuncu belirler; yalnızca canlandırılır */
      if (v.binen) { this.canlandir(v, dt, 0, 0, 0, false, v.binenHiz || 0); continue; }
      this.varlikGuncelle(v, dt, c);
    }
    this.ayir();
    this.yuvaGuncelle(dt, C);
    this.okGuncelle(dt, C);
    this.sonVurulanZaman -= dt;
  }

  varlikGuncelle(v, dt, ctx) {
    const T = v.tur, p = v.konum, op = ctx.oyuncu.konum, m = v.m;
    if (v.olu) {
      v.olumZaman += dt;
      m.kok.rotation.z = Math.min(1, v.olumZaman / 0.35) * Math.PI / 2;
      m.malzeme.color.setRGB(1, 0.3, 0.3).multiplyScalar(v.isik);
      return;
    }
    v.hasarZaman -= dt; v.kacZaman -= dt; v.saldiriBek -= dt; v.karar -= dt; v.sesZaman -= dt;
    if (v.atesSure > 0) v.atesSure -= dt; if (v.yavasSure > 0) v.yavasSure -= dt;
    if (T.su) { this.suCanlisi(v, dt, ctx); return; }
    if (T.ucar) { this.ucanCanli(v, dt, ctx); return; }
    const dx = op.x - p.x, dz = op.z - p.z, dy = op.y - p.y;
    const yatay = Math.hypot(dx, dz);
    let yx = 0, yz = 0, hiz = 0, kovaliyor = false;
    /* barisci: geliştirici modunda canlılar oyunculara saldırmaz */
    const saldirgan = !this.barisci && ((T.dusman && !(T.karanlikta && v.isik > 0.5 && !v.ofkeli)) || (T.notr && v.ofkeli));
    if (T.koylu && v.koylu) {
      const k = v.koy, kapi = v.koylu.kapi;
      const gece = ctx.gunIsigi < 0.32;
      if (v.evde) {
        if (gece) { m.kok.visible = false; return; }
        v.evde = false; m.kok.visible = true; p.set(kapi.x + 0.5, kapi.y, kapi.z + 0.5); v.hiz.set(0, 0, 0);
      }
      let zombi = null, zd = 64;
      for (const w of this.liste) if (w.tur.dusman && !w.olu) { const q = w.konum.distanceToSquared(p); if (q < zd) { zd = q; zombi = w; } }
      if (zombi) { v.kacZaman = 1.5; v.kacKaynak = { x: zombi.konum.x, z: zombi.konum.z }; }
      if (v.kacZaman <= 0) {
        if (gece) {
          const hx = kapi.x + 0.5 - p.x, hz = kapi.z + 0.5 - p.z, l = Math.hypot(hx, hz);
          if (l < 1.1) { v.evde = true; m.kok.visible = false; return; }
          v.hedef = { x: kapi.x + 0.5, z: kapi.z + 0.5 }; v.karar = 5;
        } else if (yatay < 3.2 && Math.abs(dy) < 2.5 && !ctx.oyuncuOlu) {
          v.hedef = null; v.karar = 1.5; v.hedefYaw = Math.atan2(-dx, -dz);
        } else if (v.karar <= 0) {
          v.karar = 3 + Math.random() * 6;
          if (Math.random() < 0.3) v.hedef = null;
          else {
            const yakin = Math.random() < 0.4;
            const mx = yakin ? kapi.x : k.x, mz = yakin ? kapi.z : k.z, rr = yakin ? 6 : k.yaricap - 8;
            const hx = Math.floor(mx + (Math.random() * 2 - 1) * rr), hz = Math.floor(mz + (Math.random() * 2 - 1) * rr);
            const zem = this.dunya.yuklu(hx, hz) ? this.zeminBul(hx, hz) : null;
            v.hedef = zem && Math.abs(zem.y - p.y) <= 4 ? { x: hx + 0.5, z: hz + 0.5 } : null;
          }
        }
      }
    }
    const sadik = v.sahip && T.sadik ? this.sadikAI(v, dt) : null;
    if (sadik) { [yx, yz, hiz, kovaliyor] = sadik; v.hedef = null; v.kacZaman = 0; }
    else if (saldirgan && !ctx.oyuncuOlu && yatay < (T.gorus || 20) && Math.abs(dy) < 10) {
      kovaliyor = true;
      if (yatay > 0.01) { yx = dx / yatay; yz = dz / yatay; }
      hiz = yatay > 0.7 ? T.kosu : 0;
      if (T.uzak) {
        /* Okçu: uygun mesafede durur, görüş varsa ok atar */
        const gor = this.gorusVar(p.x, p.y + 1.6, p.z, op.x, op.y + 1.4, op.z);
        if (yatay < 6) { yx = -yx; yz = -yz; hiz = T.hiz * 1.4; }
        else if (yatay < 13 && gor) hiz = 0;
        if (gor && yatay < T.menzil && v.saldiriBek <= 0 && !v.yt) { v.saldiriBek = 1.6 + Math.random() * 1.2; this.mobOkAt(v, ctx); }
        v.nisan = gor && yatay < T.menzil;
        /* Germe: atıştan önceki 1,2 saniyede yay gerilir */
        v.ger = v.nisan ? Math.max(0, Math.min(1, 1 - v.saldiriBek / 1.2)) : 0;
      } else {
        const temas = yatay < T.menzil + T.gen + 0.3 && op.y < p.y + T.boy && op.y + 1.8 > p.y;
        if (temas && v.saldiriBek <= 0 && !v.yt) { v.saldiriBek = 1.0; ctx.oyuncuyaVur(T.hasar, v); }
        /* Örümcek atılır */
        if (T.agu && v.yerde && yatay > 1.6 && yatay < 4 && v.saldiriBek < 0.4 && Math.random() < dt * 3) { v.hiz.y = 5.8; v.hiz.x = yx * 7; v.hiz.z = yz * 7; }
      }
    } else if (v.kacZaman > 0 && v.kacKaynak) {
      const ax = p.x - v.kacKaynak.x, az = p.z - v.kacKaynak.z, l = Math.hypot(ax, az) || 1;
      yx = ax / l; yz = az / l; hiz = T.kosu;
      if (v.karar <= 0) { v.karar = 0.6; const s = (Math.random() - 0.5) * 1.2; const c = Math.cos(s), sn = Math.sin(s); [yx, yz] = [yx * c - yz * sn, yx * sn + yz * c]; v.kacYon = [yx, yz]; }
      if (v.kacYon) [yx, yz] = v.kacYon;
    } else if (T.yem && this.hayvanBakim(v, ctx, dt)) {
      /* Eş ya da yem tutan oyuncu izlenir */
      const t = v.izle, hx = t.x - p.x, hz = t.z - p.z, l = Math.hypot(hx, hz);
      if (l > t.r) { yx = hx / l; yz = hz / l; hiz = T.hiz * 1.35; } else v.hedefYaw = Math.atan2(-hx, -hz);
      v.hedef = null; v.karar = 0.5;
    } else {
      if (v.karar <= 0) {
        v.karar = 2 + Math.random() * 5;
        if (Math.random() < 0.38) v.hedef = null;
        else {
          const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 8;
          const hx = Math.floor(p.x + Math.cos(a) * r), hz = Math.floor(p.z + Math.sin(a) * r);
          const zem = this.dunya.yuklu(hx, hz) ? this.zeminBul(hx, hz) : null;
          v.hedef = zem && Math.abs(zem.y - p.y) <= 3 ? { x: hx + 0.5, z: hz + 0.5 } : null;
        }
      }
      if (v.hedef) {
        const hx = v.hedef.x - p.x, hz = v.hedef.z - p.z, l = Math.hypot(hx, hz);
        if (l < 0.6) v.hedef = null; else { yx = hx / l; yz = hz / l; hiz = T.hiz; }
      }
    }
    /* Uçurumdan kaçın (kovalamıyorken) */
    if (hiz > 0 && !kovaliyor && v.yerde) {
      const ix = Math.floor(p.x + yx * 0.9), iz = Math.floor(p.z + yz * 0.9);
      let dusus = 0;
      for (let k = 0; k < 4; k++) { if (this.dunya.kati(ix, Math.floor(p.y) - 1 - k, iz)) break; dusus++; }
      const su = SIVI[this.dunya.blok(ix, Math.floor(p.y) - 1, iz)] || SIVI[this.dunya.blok(ix, Math.floor(p.y), iz)];
      if (dusus >= 3 || (su && !v.suda && v.kacZaman <= 0)) { hiz = 0; v.hedef = null; v.karar = Math.min(v.karar, 0.3); v.kacYon = null; }
    }
    /* Boss yetenekleri; yavaşlık (Buz Yayı) */
    if (T.boss) hiz = this.bossYetenek(v, dt, ctx, kovaliyor, yatay, dx, dz, hiz);
    if (v.yavasSure > 0) hiz *= 0.5;
    /* Yön ve hız */
    /* Nişan alan okçu geri çekilirken de yüzünü hedefe döner */
    if (v.nisan && T.uzak && kovaliyor) v.hedefYaw = Math.atan2(-dx, -dz);
    else if (hiz > 0) v.hedefYaw = Math.atan2(-yx, -yz);
    else if (kovaliyor) v.hedefYaw = Math.atan2(-dx, -dz);
    let fark = v.hedefYaw - v.yaw;
    fark = Math.atan2(Math.sin(fark), Math.cos(fark));
    v.yaw += fark * Math.min(1, dt * 8);
    const k = Math.min(1, (v.yerde ? 10 : 3) * dt);
    if (v.hasarZaman <= 0.25 && !(v.atilma > 0)) { v.hiz.x += (yx * hiz - v.hiz.x) * k; v.hiz.z += (yz * hiz - v.hiz.z) * k; }
    /* Örümcek duvara tırmanır */
    if (T.tirmanir && v.engel && hiz > 0) v.hiz.y = Math.max(v.hiz.y, 3.2);
    /* Zıplama */
    if (v.yerde && hiz > 0 && v.engel && !this.carpisiyor(v, p.x, p.y + 1.1, p.z)) v.hiz.y = 8.2;
    if (T.ziplar && v.yerde && hiz > 0) { v.zipSayac -= dt; if (v.zipSayac <= 0) { v.zipSayac = 0.45; v.hiz.y = 5.5; } }
    if (v.lavda && !T.atesBagisik) { v.hiz.y = Math.min(v.hiz.y + 14 * dt, 1.2); v.hiz.x *= 0.85; v.hiz.z *= 0.85; v.lavSayac = (v.lavSayac || 0) - dt; if (v.lavSayac <= 0) { v.lavSayac = 0.5; this.hasarVer(v, 4, null, { sessiz: true }); } }
    else if (v.suda && T.dalgic) {
      /* Boğulmuş zombi suda batar; kovalarken hedefin yüksekliğine doğru yüzer */
      const hy = kovaliyor ? Math.max(-2.5, Math.min(2.5, (op.y - p.y) * 1.5)) : -1.2;
      v.hiz.y += (hy - v.hiz.y) * Math.min(1, dt * 4);
      if (kovaliyor && v.engel) v.hiz.y = Math.max(v.hiz.y, 2.4);
    }
    else if (v.suda) { v.hiz.y = Math.min(v.hiz.y + 26 * dt, 2.2); }
    else { v.hiz.y -= 28 * dt; if (T.yavasDus) v.hiz.y = Math.max(v.hiz.y, -3); if (v.hiz.y < -40) v.hiz.y = -40; }
    this.hareket(v, dt);
    /* Takılırsa yeni hedef */
    if (hiz > 0 && Math.hypot(v.hiz.x, v.hiz.z) < 0.2) { v.sikisma += dt; if (v.sikisma > 1.5) { v.sikisma = 0; v.hedef = null; v.karar = 0; v.kacYon = null; } } else v.sikisma = 0;

    /* Işık ve güneşte yanma */
    v.isikSayac -= dt;
    if (v.isikSayac <= 0) {
      v.isikSayac = 0.3;
      const acik = this.gokAcik(p.x, p.y + T.boy, p.z);
      let l = acik ? ctx.gunIsigi : 0.08;
      if (this.mesaleYakin(p.x, p.y + 1, p.z, 12)) {
        let en = 1e9; for (const t of this.dunya.mesaleler.values()) en = Math.min(en, Math.hypot(t[0] - p.x, t[1] - p.y - 1, t[2] - p.z));
        l = Math.max(l, Math.min(1, 1.1 * (1 - en / 12.5)));
      }
      v.isikHedef = Math.max(0.08, l);
      v.yaniyor = (T.gunesteYanar && acik && ctx.gunIsigi > 0.55 && !v.suda && !ctx.yagmur) || (v.atesSure > 0 && !v.suda);
      /* Güneşte yanmayan canavarlar (örümcek, mumya) açık havada gündüz bir süre sonra, oyuncudan uzaktaysa kaybolur */
      if (T.dusman && !T.gunesteYanar && !T.boss && v.turAd !== 'haydut' && acik && ctx.gunIsigi > 0.6 && !ctx.yagmur && !ctx.firtina) {
        v.gunduz = (v.gunduz || 0) + 0.3;
        if (v.gunduz > 25 && Math.hypot(ctx.oyuncu.konum.x - p.x, ctx.oyuncu.konum.z - p.z) > 16) v.sil = true;
      } else v.gunduz = 0;
    }
    v.isik += ((v.isikHedef || 1) - v.isik) * Math.min(1, dt * 5);
    if (v.yaniyor) {
      v.yanmaSayac -= dt;
      if (Math.random() < dt * 8) this.dusenler.renkliParcacik([0.25, 0.25, 0.25], p.x - 0.3 + Math.random() * 0.6, p.y + T.boy * Math.random(), p.z - 0.3 + Math.random() * 0.6, 1);
      if (v.yanmaSayac <= 0) { v.yanmaSayac = 1; this.hasarVer(v, 1, null, { sessiz: true }); }
    }

    /* Ses */
    if (v.sesZaman <= 0) {
      v.sesZaman = (T.dusman ? 4 : 8) + Math.random() * 10;
      const d = this.dinleyici ? this.dinleyici.distanceTo(p) : Math.hypot(dx, dy, dz);
      if (d < 22) this.ses.canli(T.ses, 'normal', 1 - d / 24);
    }

    this.canlandir(v, dt, dx, dy, dz, kovaliyor);
  }

  /* ---------- 0.16.0: evcil hayvanlar ve atlar ---------- */
  /* Sadık hayvan (köpek, kedi): sahibini izler, uzaklaşınca yanına gelir; köpek sahibine yaklaşan canavarlara saldırır.
     Dönüş: [yönX, yönZ, hız, kovalıyor] ya da null (sahibi oyunda değilse olağan dolaşma) */
  sadikAI(v, dt) {
    const T = v.tur, p = v.konum;
    if (v.oturuyor) return [0, 0, 0, false];
    const S = (this._C || []).find(c => c.ad === v.sahip && c.oyuncu);
    if (!S) return null;
    const op = S.oyuncu.konum;
    if (T.hasar && !S.oyuncuOlu && !this.barisci) {
      let h = v.avHedef;
      if (!h || h.olu || h.konum.distanceToSquared(p) > 24 * 24) {
        h = null; let en = 12 * 12;
        for (const w of this.liste) {
          if (!w.tur.dusman || w.olu || w.tur.boss || w.tur.ucar || w.tur.su) continue;
          const q = (w.konum.x - op.x) ** 2 + (w.konum.z - op.z) ** 2;
          if (q < en && Math.abs(w.konum.y - op.y) < 6) { en = q; h = w; }
        }
        v.avHedef = h;
      }
      if (h) {
        const hx = h.konum.x - p.x, hz = h.konum.z - p.z, l = Math.hypot(hx, hz) || 1;
        if (l < T.menzil + h.tur.gen + 0.45 && Math.abs(h.konum.y - p.y) < 2 && v.saldiriBek <= 0) {
          v.saldiriBek = 0.9;
          this.hasarVer(h, T.hasar, p, { itme: 0.8 });
          const k = this.sesK(p); if (k > 0) this.ses.canli(T.ses, 'normal', 0.7 * k);
        }
        return [hx / l, hz / l, l > 0.9 ? T.kosu : 0, true];
      }
    }
    const hx = op.x - p.x, hz = op.z - p.z, l = Math.hypot(hx, hz);
    if (l > 24 || Math.abs(op.y - p.y) > 12) { this.yaninaGel(v, op); return [0, 0, 0, false]; }
    if (l > 3.2) return [hx / l, hz / l, l > 8 ? T.kosu : T.hiz * 1.8, false];
    v.hedefYaw = Math.atan2(-hx, -hz);
    return [0, 0, 0, false];
  }
  /* Sahibinin yakınında boş bir yere ışınlanır */
  yaninaGel(v, op) {
    const d = this.dunya;
    for (let k = 0; k < 12; k++) {
      const x = Math.floor(op.x + (Math.random() - 0.5) * 4), z = Math.floor(op.z + (Math.random() - 0.5) * 4);
      if (!d.yuklu(x, z)) continue;
      for (let y = Math.floor(op.y) + 2; y >= Math.floor(op.y) - 3; y--) {
        if (d.kati(x, y - 1, z) && !d.kati(x, y, z) && !d.kati(x, y + 1, z) && !SIVI[d.blok(x, y, z)]) { v.konum.set(x + 0.5, y, z + 0.5); v.hiz.set(0, 0, 0); return true; }
      }
    }
    return false;
  }
  /* Oturma duruşu, tasma, eyer ve şahlanma (sunucu ve ayna ortak) */
  evcilCanlandir(v, dt) {
    const m = v.m, B = m.bacaklar, b = this.ayna ? (v.agBayrak || 0) : 0;
    const otur = this.ayna ? !!(b & 4096) : !!v.oturuyor;
    if (m.tasma && v.turAd === 'kedi') m.tasma.visible = this.ayna ? !!(b & 8192) : !!v.sahip;
    if (m.eyer) m.eyer.visible = this.ayna ? !!(b & 16384) : !!v.eyer;
    if (otur && B.length === 4) {
      B[2].rotation.x = B[3].rotation.x = 1.2; B[0].rotation.x = B[1].rotation.x = -0.1;
      m.govde.rotation.x = 0.42; m.kok.position.y -= v.tur.boy * 0.16;
      if (m.kuyruk) m.kuyruk.rotation.x = 0.9 + Math.sin(performance.now() / 160 + v.id) * 0.25;
    } else m.govde.rotation.x = 0;
    /* At şahlanır: ön ayaklar havaya kalkar */
    const sah = this.ayna ? ((b & 32768) ? 1 : 0) : Math.max(0, v.sahlan || 0);
    if (!this.ayna && v.sahlan > 0) v.sahlan -= dt;
    v.sahK = (v.sahK || 0) + ((sah > 0 ? 1 : 0) - (v.sahK || 0)) * Math.min(1, dt * 8);
    if (m.binek && v.sahK > 0.01) {
      const k = v.sahK;
      m.kok.rotation.order = 'YXZ'; m.kok.rotation.x = 0.75 * k;
      m.kok.position.y += 0.35 * k;
      B[0].rotation.x = B[1].rotation.x = -1.1 * k + Math.sin(performance.now() / 90) * 0.3 * k;
    } else if (m.binek) m.kok.rotation.x = 0;
  }
  /* İstemcide önceden sınama: bu eşyayla bu canlıya sağ tık bir evcil hayvan / at etkileşimi mi */
  etkilesimVar(v, eldeki) {
    if (!v || v.olu) return false;
    const T = v.tur, sahipli = this.ayna ? !!((v.agBayrak || 0) & 8192) : !!v.sahip;
    const yavru = this.ayna ? !!((v.agBayrak || 0) & 64) : v.yavru > 0;
    /* 0.21.0: kovayla inek sağılır, makasla koyun kırkılır */
    if (eldeki === 477 && v.turAd === 'inek' && !yavru) return true;
    if (eldeki === 481 && v.turAd === 'koyun' && !yavru) return !(this.ayna ? ((v.agBayrak || 0) & 65536) : v.kirkildi);
    if (v.turAd === 'kurt') return eldeki === 295;
    if (v.turAd === 'kedi' && !sahipli) return T.mama.includes(eldeki);
    return !!((T.sadik && sahipli) || T.binek);
  }
  /* Evcil hayvan / at etkileşimi (tek oyunculu ve sunucu). ad: etkileşen oyuncunun adı.
     Dönüş: { tuket: eldeki bir adet harcanır, mesaj, bin: ata binilir, olay } */
  canliEtkilesim(v, eldeki, ad) {
    const T = v.tur, p = v.konum, S = { tuket: false, mesaj: null, bin: false, olay: null };
    const duman = () => this.dusenler.renkliParcacik([0.62, 0.62, 0.62], p.x, p.y + T.boy + 0.2, p.z, 8);
    const kucuk = T.ad.toLocaleLowerCase('tr');
    if (v.olu) return S;
    /* 0.21.0: sağma ve kırkma */
    if (eldeki === 477 && v.turAd === 'inek' && !(v.yavru > 0)) { S.degistir = 479; S.mesaj = 'İnek sağıldı: süt kovası.'; S.olay = 'sut'; S.ses = 'sut'; return S; }
    if (eldeki === 481 && v.turAd === 'koyun' && !(v.yavru > 0) && !v.kirkildi) {
      v.kirkildi = true; v.yunSayac = 120 + Math.random() * 120;
      this.dusenler.birak(49, 1 + Math.floor(Math.random() * 3), p.x, p.y + 0.8, p.z);
      S.yipran = true; S.olay = 'kirkim'; S.ses = 'kirp'; return S;
    }
    /* Kurt kemikle evcilleşir ve köpeğe dönüşür */
    if (v.turAd === 'kurt' && eldeki === 295) {
      S.tuket = true;
      if (Math.random() < 0.34) {
        const k = this.ekle('kopek', p.x, p.y, p.z);
        k.yaw = v.yaw; k.sahip = ad; k.evcil = true;
        this.kaldir(v);
        this.kalpler(k, 8);
        S.mesaj = 'Kurt evcilleşti ve sadık bir köpek oldu. Sağ tık ya da E ile oturtulur veya kaldırılır.'; S.olay = 'kopek';
      } else { duman(); S.mesaj = 'Kurt kemiği aldı ama henüz güvenmiyor.'; }
      return S;
    }
    /* Kedi balıkla evcilleşir */
    if (v.turAd === 'kedi' && !v.sahip) {
      if (!T.mama.includes(eldeki)) return S;
      S.tuket = true;
      if (Math.random() < 0.34) { v.sahip = ad; v.evcil = true; this.kalpler(v, 8); S.mesaj = 'Kedi evcilleşti; artık sizi izliyor.'; S.olay = 'kedi'; }
      else { duman(); S.mesaj = 'Kedi balığı yedi; biraz daha güvenmesi gerekiyor.'; }
      return S;
    }
    if (v.sahip && v.sahip !== ad) { S.mesaj = `Bu ${kucuk} ${v.sahip} adlı oyuncuya ait.`; return S; }
    /* Sahibinin sadık hayvanı: mamayla iyileşir, aksi hâlde oturur / kalkar */
    if (T.sadik && v.sahip) {
      if (T.mama.includes(eldeki) && v.can < T.can) { v.can = Math.min(T.can, v.can + 4); S.tuket = true; this.kalpler(v, 4); return S; }
      v.oturuyor = !v.oturuyor; v.hedef = null;
      S.mesaj = v.oturuyor ? `${T.ad} oturuyor ve burada bekleyecek.` : `${T.ad} sizi izliyor.`;
      return S;
    }
    /* At */
    if (T.binek) {
      if (!v.sahip) {
        if (T.mama.includes(eldeki)) {
          S.tuket = true;
          v.ehli = Math.min(100, (v.ehli || 0) + (eldeki === 290 ? 100 : 15));
          this.kalpler(v, 3);
          if (v.ehli < 100) { S.mesaj = `Atın güveni arttı (%${v.ehli}). Boş elle sağ tık ile ehlileştirmeyi deneyiniz.`; return S; }
        } else {
          const sans = 0.15 + (v.ehli || 0) / 100 * 0.7;
          if (Math.random() >= sans) {
            v.sahlan = 1.1; v.ehli = Math.min(95, (v.ehli || 0) + 5); duman();
            const k = this.sesK(p); if (k > 0) this.ses.canli('at', 'acima', k);
            S.mesaj = `At şahlanıp sizi kabul etmedi (güven %${v.ehli}). Elma, buğday ya da havuçla güveni artırılabilir.`;
            return S;
          }
        }
        v.sahip = ad; v.evcil = true; v.kacZaman = 0; this.kalpler(v, 8);
        S.mesaj = 'At ehlileşti. Eyer takılınca binilir.'; S.olay = 'at';
        return S;
      }
      if (eldeki === 462 && !v.eyer) { v.eyer = true; S.tuket = true; S.mesaj = 'Eyer takıldı. Binmek için sağ tık ya da E; inmek için C.'; return S; }
      if (T.mama.includes(eldeki) && v.can < T.can) { v.can = Math.min(T.can, v.can + 4); S.tuket = true; this.kalpler(v, 3); return S; }
      if (!v.eyer) { S.mesaj = 'Binmek için ata eyer takılmalıdır.'; return S; }
      if (v.binen) { S.mesaj = 'Bu ata başka bir oyuncu biniyor.'; return S; }
      S.bin = true;
      return S;
    }
    return S;
  }

  /* ---------- Hayvancılık: besleme, çiftleşme, yavrular, yem ile takip ---------- */
  yemSever(v, id) { return !!(v && !v.olu && v.tur.yem && v.tur.yem.includes(id)); }
  /* besleyen: çok oyunculu sunucuda besleyen uzak oyuncu (yerel oyuncu için boş) */
  besle(v, besleyen) {
    if (this.ayna) {
      const b = v.agBayrak || 0;
      if (!(b & 64) && (b & (128 | 256))) return false;
      if (this.ag && this.ag.besle) this.ag.besle(v);
      this.kalpler(v, 4);
      return true;
    }
    if (v.olu) return false;
    if (v.yavru > 0) { v.yavru = Math.max(0.01, v.yavru - 60); this.kalpler(v, 3); return true; }
    if (v.ask > 0 || v.dinlen > 0) return false;
    v.ask = 30; v.besleyen = besleyen || null; v.evcil = true;
    this.kalpler(v, 6);
    return true;
  }
  kalpler(v, n) { this.dusenler.renkliParcacik([1, 0.32, 0.42], v.konum.x, v.konum.y + v.tur.boy * (v.yavru > 0 || (v.agBayrak & 64) ? 0.6 : 1) + 0.2, v.konum.z, n); }
  /* Yavru büyür, aşık hayvan eşini arar, yem tutan oyuncu izlenir; izlenecek nokta v.izle'ye yazılır */
  hayvanBakim(v, ctx, dt) {
    if (v.yavru > 0) { v.yavru -= dt; v.m.kok.scale.setScalar(v.yavru > 0 ? 0.55 : 1); if (v.yavru <= 0) v.yavru = 0; }
    /* 0.21.0: kırkılan koyunun yünü 2-4 dakikada uzar; tavuk 5-10 dakikada bir yumurtlar */
    if (v.kirkildi) { v.yunSayac -= dt; if (v.yunSayac <= 0) v.kirkildi = false; }
    if (v.turAd === 'tavuk' && !(v.yavru > 0)) {
      if (v.yumurtaSayac == null) v.yumurtaSayac = 60 + Math.random() * 360;
      v.yumurtaSayac -= dt;
      if (v.yumurtaSayac <= 0) { v.yumurtaSayac = 300 + Math.random() * 300; this.dusenler.birak(480, 1, v.konum.x, v.konum.y + 0.3, v.konum.z); if (this.sesK(v.konum) > 0.1) this.ses.canli('tavuk', 'normal', this.sesK(v.konum)); }
    }
    if (v.dinlen > 0) v.dinlen -= dt;
    v.izle = null;
    if (v.ask > 0) {
      v.ask -= dt;
      if (Math.random() < dt * 1.5) this.kalpler(v, 1);
      let es = null, ed = 64;
      for (const w of this.liste) { if (w === v || w.olu || w.turAd !== v.turAd || !(w.ask > 0) || w.yavru > 0) continue; const q = w.konum.distanceToSquared(v.konum); if (q < ed) { ed = q; es = w; } }
      if (es) {
        if (ed < 1.6) {
          v.ask = 0; es.ask = 0; v.dinlen = 300; es.dinlen = 300;
          const y = this.ekle(v.turAd, (v.konum.x + es.konum.x) / 2, Math.max(v.konum.y, es.konum.y), (v.konum.z + es.konum.z) / 2);
          y.yavru = 360; y.evcil = true; y.can = Math.ceil(y.tur.can / 2); y.m.kok.scale.setScalar(0.55);
          this.kalpler(y, 8);
          if (this.olaylar.yavru) this.olaylar.yavru(y, es.besleyen || v.besleyen);
          return false;
        }
        v.izle = { x: es.konum.x, z: es.konum.z, r: 0.6 };
        return true;
      }
    }
    if (ctx.eldeki && v.tur.yem.includes(ctx.eldeki) && !ctx.oyuncuOlu && v.kacZaman <= 0) {
      const op = ctx.oyuncu.konum, d = Math.hypot(op.x - v.konum.x, op.z - v.konum.z);
      if (d < 10 && Math.abs(op.y - v.konum.y) < 4) { v.izle = { x: op.x, z: op.z, r: 2.2 }; return true; }
    }
    return false;
  }
  /* Evcil (beslenmiş ya da doğmuş) hayvanlar kaybolmaz ve dünya ile kaydedilir */
  evcilDisa() { return this.liste.filter(v => v.evcil && !v.olu && !this.ayna).map(v => [v.turAd, Math.round(v.konum.x * 100) / 100, Math.round(v.konum.y * 100) / 100, Math.round(v.konum.z * 100) / 100, Math.round(v.yavru || 0), Math.ceil(v.can), v.sahip || '', v.oturuyor ? 1 : 0, v.renk || 0, v.eyer ? 1 : 0]); }
  evcilIce(l) {
    for (const a of l || []) {
      if (!TURLER[a[0]]) continue;
      const v = this.ekle(a[0], a[1], a[2], a[3], { renk: a[8] != null ? a[8] : undefined });
      v.evcil = true; v.yavru = a[4] || 0; v.can = Math.min(v.tur.can, a[5] || v.tur.can);
      if (a[6]) v.sahip = String(a[6]); v.oturuyor = !!a[7]; v.eyer = !!a[9];
      if (v.yavru > 0) v.m.kok.scale.setScalar(0.55);
    }
  }
  /* Yıldırım: çarptığı yerin yakınındaki canlılar hasar alır */
  yildirim(x, y, z) {
    for (const v of this.liste) if (!v.olu && (v.konum.x - x) ** 2 + (v.konum.y - y) ** 2 + (v.konum.z - z) ** 2 < 3.5 * 3.5) { v.hasarZaman = 0; this.hasarVer(v, 8, { x, z }, { itme: 1.2 }); }
  }

  /* Model ve canlandırma (sunucu ve ayna ortak) */
  canlandir(v, dt, dx, dy, dz, kovaliyor, yh = Math.hypot(v.hiz.x, v.hiz.z)) {
    const T = v.tur, m = v.m, p = v.konum;
    this.golgeGuncelle(v);
    v.faz += yh * dt * 5.5;
    const sal = Math.sin(v.faz) * Math.min(0.8, yh * 0.35);
    const B = m.bacaklar;
    if (B.length === 8) { for (let i = 0; i < 8; i++) B[i].rotation.y = B[i].userData.tabanY + Math.sin(v.faz * 1.6 + i * 1.7) * Math.min(0.35, yh * 0.12); }
    else if (B.length === 4) { B[0].rotation.x = sal; B[3].rotation.x = sal; B[1].rotation.x = -sal; B[2].rotation.x = -sal; }
    else if (B.length === 2) { B[0].rotation.x = sal; B[1].rotation.x = -sal; }
    if (T.uzak) {
      /* Okçu: nişan alırken iki kol ileri uzanır; sol el kirişi çeker, ok yaya yerleşir ve germe ilerledikçe geri gelir */
      const k = Math.min(1, dt * 8), h = v.nisan ? Math.PI / 2 * 0.97 : 0, g = v.nisan ? (v.ger || 0) : 0;
      m.kollar[1].rotation.x += (h + sal * 0.6 - m.kollar[1].rotation.x) * k;
      m.kollar[0].rotation.x += (h - sal * 0.6 - m.kollar[0].rotation.x) * k;
      m.kollar[0].rotation.z += ((v.nisan ? 0.55 + g * 0.25 : 0) - m.kollar[0].rotation.z) * k;
      m.kollar[0].position.z += ((v.nisan ? 0.06 + g * 0.22 : 0) - m.kollar[0].position.z) * k;
      if (m.yay) this.yayGer(m.yay, v.nisan ? g : 0);
    }
    else if (m.insan) { m.kollar[0].rotation.x = -sal * 0.8; m.kollar[1].rotation.x = sal * 0.8; }
    else if (m.kollar.length && !T.uzak) { const t = performance.now() / 1000; m.kollar[0].rotation.x = Math.PI / 2 * 0.92 + Math.sin(t * 2 + v.id) * 0.06 - sal * 0.2; m.kollar[1].rotation.x = Math.PI / 2 * 0.92 - Math.sin(t * 2 + v.id) * 0.06 + sal * 0.2; }
    if (m.kanatlar.length) { const c = !v.yerde || v.kacZaman > 0 ? Math.sin(performance.now() / 50) * 0.6 + 0.6 : 0; m.kanatlar[0].rotation.z = -c; m.kanatlar[1].rotation.z = c; }
    if (m.kuyruk) m.kuyruk.rotation.x = -0.3 + Math.sin(performance.now() / 300 + v.id) * 0.15;
    if (m.donen) { m.donen.rotation.y += dt * 2.6; m.donen.position.y = 0.2 + Math.sin(performance.now() / 240 + v.id) * 0.06; }
    /* Kafa oyuncuya döner */
    if (m.kafa) {
      const d = Math.hypot(dx, dz);
      let ky = 0, kx = 0;
      if (d < 8 || kovaliyor) { ky = Math.atan2(-dx, -dz) - v.yaw; ky = Math.atan2(Math.sin(ky), Math.cos(ky)); ky = Math.max(-0.9, Math.min(0.9, ky)); kx = Math.max(-0.5, Math.min(0.5, Math.atan2(dy + 1.2 - T.boy, d) * 0.6)); }
      m.kafa.rotation.y += (ky - m.kafa.rotation.y) * Math.min(1, dt * 6);
      m.kafa.rotation.x += (kx - m.kafa.rotation.x) * Math.min(1, dt * 6);
    }
    m.kok.position.copy(p);
    m.kok.rotation.y = v.yaw;
    if (v.anim) this.animUygula(v, dt);
    if (m.sadik || m.binek) this.evcilCanlandir(v, dt);
    /* 0.21.0: kırkılmış koyunun gövdesi incelir */
    if (v.turAd === 'koyun') { const k = this.ayna ? !!((v.agBayrak || 0) & 65536) : !!v.kirkildi; m.govde.scale.set(k ? 0.84 : 1, k ? 0.86 : 1, k ? 0.94 : 1); }
    const c = m.malzeme.color;
    if (v.hasarZaman > 0) c.setRGB(1, 0.35, 0.35);
    else if (v.yaniyor) c.setRGB(1, 0.7 + Math.sin(performance.now() / 60) * 0.1, 0.45);
    else if (this.ayna ? ((v.agBayrak || 0) & 131072) : v.kanli) c.setRGB(1, 0.42, 0.38);   // 0.22.0: Kanlı Ay canavarı
    else c.setRGB(1, 1, 1);
    c.multiplyScalar(T.atesBagisik ? Math.max(v.isik, T.atesTopu ? 1 : 0.6) : v.isik);   // 0.18.0: kor ruhu kendi ışığıyla parlar
  }

  /* Balık, ahtapot, köpekbalığı: suda üç boyutlu yüzer, karada çırpınır */
  suCanlisi(v, dt, ctx) {
    const T = v.tur, p = v.konum, m = v.m, op = ctx.oyuncu.konum, d = this.dunya;
    const sudaMi = (x, y, z) => { const b = d.blok(Math.floor(x), Math.floor(y), Math.floor(z)); return SIVI[b] === 1 && !LAV[b]; };
    const suda = sudaMi(p.x, p.y + T.boy * 0.5, p.z);
    if (suda) {
      v.kuru = 0;
      const dx = op.x - p.x, dy = op.y + 1 - p.y, dz = op.z - p.z, dd = Math.hypot(dx, dy, dz) || 1;
      let yx = 0, yy = 0, yz = 0, hiz = 0;
      if (T.dusman && !this.barisci && ctx.oyuncuSuda && !ctx.oyuncuOlu && dd < T.gorus) {
        yx = dx / dd; yy = dy / dd; yz = dz / dd; hiz = T.kosu;
        if (dd < T.menzil + 0.6 && v.saldiriBek <= 0) { v.saldiriBek = 1.5; ctx.oyuncuyaVur(T.hasar, v); const k = this.sesK(p); if (k > 0) this.ses.canli(T.ses, 'acima', 0.8 * k); }
      } else if (v.kacZaman > 0 || (!T.dusman && dd < (v.turAd === 'hamsi' ? 4.5 : 3) && ctx.oyuncuSuda)) {
        yx = -dx / dd; yy = -dy / dd * 0.5; yz = -dz / dd; hiz = T.kosu;
      } else {
        const h = v.hedef3;
        if (!h || v.karar <= 0 || Math.hypot(h.x - p.x, h.y - p.y, h.z - p.z) < 0.8) {
          v.karar = 2 + Math.random() * 4; v.hedef3 = null;
          for (let k = 0; k < 6; k++) {
            const tx = p.x + (Math.random() - 0.5) * 12, ty = p.y + (Math.random() - 0.5) * 5, tz = p.z + (Math.random() - 0.5) * 12;
            if (sudaMi(tx, ty, tz) && sudaMi(tx, ty + 0.6, tz)) { v.hedef3 = { x: tx, y: ty, z: tz }; break; }
          }
        }
        if (v.hedef3) { const hx = v.hedef3.x - p.x, hy = v.hedef3.y - p.y, hz = v.hedef3.z - p.z, l = Math.hypot(hx, hy, hz) || 1; yx = hx / l; yy = hy / l; yz = hz / l; hiz = T.hiz; }
      }
      const k = Math.min(1, 3 * dt);
      v.hiz.x += (yx * hiz - v.hiz.x) * k; v.hiz.y += (yy * hiz - v.hiz.y) * k; v.hiz.z += (yz * hiz - v.hiz.z) * k;
      if (!sudaMi(p.x, p.y + T.boy + 0.25, p.z)) v.hiz.y = Math.min(v.hiz.y, -0.4);
    } else {
      /* Sudan çıkan balık çırpınır ve can kaybeder */
      v.hiz.y -= 28 * dt; v.hiz.x *= 0.9; v.hiz.z *= 0.9;
      v.zipSayac -= dt;
      if (v.yerde && v.zipSayac <= 0) { v.zipSayac = 0.6; v.hiz.y = 4; v.hiz.x = (Math.random() - 0.5) * 3; v.hiz.z = (Math.random() - 0.5) * 3; }
      v.kuru = (v.kuru || 0) + dt;
      if (v.kuru > 1) { v.kuru = 0; this.hasarVer(v, 1, null, { sessiz: true }); }
    }
    this.hareket(v, dt);
    this.suCanlandir(v, dt, ctx, suda);
  }

  /* Deniz canlısı yönü, canlandırması ve ışığı (sunucu ve ayna ortak) */
  suCanlandir(v, dt, ctx, suda) {
    const m = v.m, p = v.konum;
    /* Yön ve canlandırma */
    const yh = Math.hypot(v.hiz.x, v.hiz.z);
    if (yh > 0.15) v.hedefYaw = Math.atan2(-v.hiz.x, -v.hiz.z);
    let fark = v.hedefYaw - v.yaw; fark = Math.atan2(Math.sin(fark), Math.cos(fark));
    v.yaw += fark * Math.min(1, dt * 6);
    const t = performance.now() / 1000;
    m.kok.rotation.order = 'YXZ';
    if (m.balik) {
      m.kok.rotation.x = Math.max(-0.6, Math.min(0.6, v.hiz.y / (yh + 0.5) * 0.6));
      if (m.kuyruk) m.kuyruk.rotation.y = Math.sin(t * (8 + yh * 4) + v.id) * 0.45;
      for (const [i, y] of m.kanatlar.entries()) y.rotation.z = Math.sin(t * 6 + i * 3) * 0.3;
      if (!suda) m.kok.rotation.z = Math.PI / 2;
      else m.kok.rotation.z = 0;
    }
    if (m.ahtapot) for (const b of m.bacaklar) { const w = Math.sin(t * 2.5 + b.userData.aci * 2) * 0.35 + 0.15; b.rotation.x = -Math.sin(b.userData.aci) * w; b.rotation.z = Math.cos(b.userData.aci) * w; }
    /* Işık: derinlik arttıkça kararır */
    v.isikSayac -= dt;
    if (v.isikSayac <= 0) {
      v.isikSayac = 0.3;
      let l = this.gokAcik(p.x, p.y + 1, p.z) ? ctx.gunIsigi : 0.08;
      if (suda) l *= Math.max(0.3, 1 - (DENIZ - p.y) * 0.035);
      if (this.mesaleYakin(p.x, p.y, p.z, 12)) l = Math.max(l, 0.6);
      v.isikHedef = Math.max(0.08, l);
    }
    v.isik += ((v.isikHedef || 1) - v.isik) * Math.min(1, dt * 5);
    m.kok.position.copy(p);
    m.kok.rotation.y = v.yaw;
    if (v.anim) this.animUygula(v, dt);
    const c = m.malzeme.color;
    if (v.hasarZaman > 0) c.setRGB(1, 0.35, 0.35); else c.setRGB(1, 1, 1);
    c.multiplyScalar(v.isik);
  }

  /* ---------- Bosslar (0.15.0): yetenekler, yardımcı çağırma, ışınlanma ---------- */
  /* Boss yetenekleri (0.15.1): her yetenek hazırlık (animasyon ve yerde uyarı işareti), uygulama ve toparlanma evrelerinden oluşur.
     Hazırlık sırasında boss durur; oyuncu uyarıyı görüp kaçabilir. Canı yarıya inince öfkelenir: hızlanır, yetenekleri sıklaşır ve güçlenir. */
  bossYetenek(v, dt, ctx, kovaliyor, yatay, dx, dz, hiz) {
    const T = v.tur, p = v.konum;
    const faz2 = v.can < T.can * 0.5;
    if (faz2 && !v.faz2) {
      v.faz2 = true; v.yetenek = 1.4;
      this.efekt({ t: 'patlama', x: p.x, y: p.y + T.boy * 0.6, z: p.z, c: [1, 0.45, 0.2], n: 50, ses: 'gok' });
      if (!v.yt) { v.yt = { ad: 'ofke', t: 0 }; this.animBaslat(v, 1); }
    }
    if (faz2) hiz *= 1.25;
    if (v.atilma > 0) v.atilma -= dt;
    if (v.yt) {
      const Y = v.yt; Y.t += dt;
      if (this.bossAdim(v, Y, ctx, faz2)) { v.yt = null; this.animBaslat(v, 0); }
      return Y.hareket ? hiz * Y.hareket : 0;
    }
    if (!kovaliyor) return hiz;
    v.yetenek = (v.yetenek ?? 2.5) - dt;
    if (v.yetenek > 0) return hiz;
    const sec = this.bossSec(v, yatay, faz2);
    if (!sec) { v.yetenek = 0.4; return hiz; }
    const op = ctx.oyuncu.konum;
    v.yt = { ad: sec[0], t: 0, hedef: [op.x, op.y, op.z] };
    v.yetenek = sec[1] * (faz2 ? 0.65 : 1);
    this.animBaslat(v, sec[2]);
    return 0;
  }
  /* [yetenek, bekleme, animasyon] seçer. Animasyonlar: 1 kollar yukarı, 2 fırlatma, 3 dönme, 4 eğilme, 5 yere vurma */
  bossSec(v, yatay, faz2) {
    const r = Math.random(), T = v.tur;
    switch (T.boss) {
      case 'firavun': {
        let yakin = 0; for (const w of this.liste) if (!w.olu && w.turAd === 'mumya' && w.konum.distanceToSquared(v.konum) < 400) yakin++;
        if (yatay < 5 && r < 0.55) return ['firtina', 4.5, 3];
        if (yakin < 2 && r < 0.5) return ['cagir', 5, 1];
        if (yatay > 4 && yatay < 20) return ['lanet', 2.6, 2];
        return yatay < 5 ? ['firtina', 4.5, 3] : null;
      }
      case 'buzbuyucu':
        if (yatay < 6) return ['isinlan', 2.5, 1];
        if (faz2 && r < 0.35) return ['halka', 3.5, 3];
        return ['dikenler', 3.2, 1];
      case 'reis':
        if (faz2 && !v.cagirdi) return ['cagir', 2, 1];
        if (yatay < 3.6) return ['savurma', 2.8, 3];
        if (yatay > 4 && yatay < 13) return ['hamle', 3.2, 4];
        return null;
      case 'muhafiz':
        if (yatay > 7 && yatay < 22 && r < 0.6) return ['kaya', 3, 2];
        if (yatay < 10) return ['sicra', 3.5, 1];
        return yatay < 22 ? ['kaya', 3, 2] : null;
    }
    return null;
  }
  /* Yeteneğin bir adımı; bittiğinde true döner */
  bossAdim(v, Y, ctx, faz2) {
    const T = v.tur, p = v.konum, op = ctx.oyuncu.konum, t = Y.t;
    const bir = ad => { if (Y[ad]) return false; Y[ad] = true; return true; };
    const yakinda = (x, z, r, dy = 2.5) => !ctx.oyuncuOlu && Math.hypot(op.x - x, op.z - z) < r && Math.abs(op.y - p.y) < dy;
    const tikla = (ad, aralik) => { const k = Math.floor(t / aralik); if (Y[ad] === k) return false; Y[ad] = k; return true; };
    const yuzDon = () => { v.hedefYaw = Math.atan2(-(op.x - p.x), -(op.z - p.z)); };
    yuzDon();
    switch (Y.ad) {
      case 'ofke':
        if (bir('a')) this.efekt({ t: 'halka', x: p.x, y: p.y + 0.2, z: p.z, r: 3, c: [1, 0.5, 0.2], n: 30 });
        return t > 1.1;
      /* Firavun */
      case 'cagir':
        if (t < 1 && tikla('i', 0.25)) this.efekt({ t: 'halka', x: p.x, y: p.y + 0.1, z: p.z, r: 2.5, c: [0.95, 0.82, 0.5], n: 18 });
        if (t > 1 && bir('a')) {
          if (T.boss === 'reis') { v.cagirdi = true; this.cagir(v, 'haydut', 2, 4); this.efekt({ t: 'patlama', x: p.x, y: p.y + 1, z: p.z, c: [0.6, 0.45, 0.3], n: 20, ses: 'bagir' }); }
          else { this.cagir(v, 'mumya', faz2 ? 3 : 2, 5); this.efekt({ t: 'patlama', x: p.x, y: p.y + 1.5, z: p.z, c: [0.95, 0.82, 0.5], n: 40, ses: 'kum' }); }
        }
        return t > 1.3;
      case 'firtina':
        /* Kum fırtınası: 0,9 sn uyarı halkası, ardından 3 sn boyunca çevresindekilere yarım saniyede bir hasar ve açlık */
        Y.hareket = t > 0.9 ? 0.35 : 0;
        if (t < 0.9 && tikla('i', 0.2)) this.efekt({ t: 'halka', x: p.x, y: p.y + 0.15, z: p.z, r: 5, c: [0.95, 0.8, 0.45], n: 28 });
        if (t >= 0.9 && tikla('f', 0.5)) {
          this.efekt({ t: 'girdap', x: p.x, y: p.y, z: p.z, r: 5, c: [0.92, 0.8, 0.52], n: 36, ses: t < 1.4 ? 'kum' : null });
          if (yakinda(p.x, p.z, 5.5, 3)) ctx.oyuncuyaVur(faz2 ? 3 : 2, v);
        }
        return t > 3.9;
      case 'lanet':
        /* Asanın ucundan oyuncuya altın lanet küreleri */
        if (t > 0.55 && bir('a')) {
          const c = this.elUcu(v), n = faz2 ? 3 : 1;
          for (let k = 0; k < n; k++) {
            const a = (k - (n - 1) / 2) * 0.22, h = new THREE.Vector3(op.x - c.x, op.y + 1.1 - c.y, op.z - c.z);
            const cs = Math.cos(a), sn = Math.sin(a), l = h.length() || 1;
            const hz = new THREE.Vector3((h.x * cs - h.z * sn) / l, h.y / l + 0.08, (h.x * sn + h.z * cs) / l).multiplyScalar(17);
            this.okAt(c.clone(), hz, 5, v, null, { tur: 'lanet' });
          }
          this.efekt({ t: 'patlama', x: c.x, y: c.y, z: c.z, c: [1, 0.85, 0.3], n: 12, ses: 'buyu' });
        }
        return t > 0.95;
      /* Buz Büyücüsü */
      case 'dikenler': {
        /* Hedeflenen yerlerde 1 sn sonra buz dikenleri yükselir */
        if (!Y.yerler) { Y.yerler = [Y.hedef]; if (faz2) for (let k = 0; k < 2; k++) { const a = Math.random() * Math.PI * 2; Y.yerler.push([Y.hedef[0] + Math.cos(a) * 2.6, Y.hedef[1], Y.hedef[2] + Math.sin(a) * 2.6]); } }
        if (t < 1 && tikla('i', 0.15)) for (const q of Y.yerler) this.efekt({ t: 'halka', x: q[0], y: q[1] + 0.1, z: q[2], r: 1.6, c: [0.6, 0.9, 1], n: 12 });
        if (t >= 1 && bir('a')) for (const q of Y.yerler) {
          this.efekt({ t: 'sutun', x: q[0], y: q[1], z: q[2], h: 2.6, c: [0.75, 0.95, 1], n: 34, ses: 'buz' });
          if (yakinda(q[0], q[2], 1.8, 2.6)) ctx.oyuncuyaVur(faz2 ? 7 : 6, v);
        }
        return t > 1.3;
      }
      case 'halka':
        /* Çevresine 12 buz kıymığı */
        if (t > 0.6 && bir('a')) {
          const c = new THREE.Vector3(p.x, p.y + 1.4, p.z);
          for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; this.okAt(c.clone(), new THREE.Vector3(Math.cos(a), 0.05, Math.sin(a)).multiplyScalar(18), 4, v, null, { tur: 'buz' }); }
          this.efekt({ t: 'patlama', x: c.x, y: c.y, z: c.z, c: [0.7, 0.92, 1], n: 30, ses: 'buz' });
        }
        return t > 0.9;
      case 'isinlan':
        if (t > 0.35 && bir('a')) this.isinlan(v, 8, 12);
        return t > 0.55;
      /* Haydut Reisi */
      case 'hamle':
        /* Eğilip hazırlanır, sonra hedefe doğru atılır; yolda çarptığı oyuncuya ağır hasar */
        if (t < 0.6) { if (tikla('i', 0.2)) this.efekt({ t: 'patlama', x: p.x, y: p.y + 0.2, z: p.z, c: [0.55, 0.45, 0.35], n: 6 }); return false; }
        if (bir('a')) {
          const hx = op.x - p.x, hz = op.z - p.z, l = Math.hypot(hx, hz) || 1;
          v.hiz.x = hx / l * 15; v.hiz.z = hz / l * 15; v.hiz.y = 3.5; v.atilma = 0.55;
          this.efekt({ t: 'patlama', x: p.x, y: p.y + 0.2, z: p.z, c: [0.55, 0.45, 0.35], n: 16, ses: 'bagir' });
        }
        if (v.atilma > 0 && !Y.vurdu && yakinda(p.x, p.z, 1.7, 2.2)) { Y.vurdu = true; ctx.oyuncuyaVur(faz2 ? 9 : 8, v); }
        return t > 1.3;
      case 'savurma':
        /* Baltayla dönerek savurur: 0,45 sn hazırlık, ardından çevresindeki oyuncuya hasar */
        Y.hareket = t > 0.45 ? 0.5 : 0;
        if (t > 0.6 && bir('a')) {
          this.efekt({ t: 'halka', x: p.x, y: p.y + 1, z: p.z, r: 3.2, c: [0.85, 0.85, 0.9], n: 26, ses: 'savur' });
          if (yakinda(p.x, p.z, 3.4)) ctx.oyuncuyaVur(faz2 ? 8 : 6, v);
        }
        return t > 1.3;
      /* Taş Muhafız */
      case 'sicra':
        /* Kollarını kaldırır, hedefin üstüne sıçrar; indiği yerde şok dalgası */
        if (t < 0.7) { if (tikla('i', 0.2)) this.efekt({ t: 'halka', x: Y.hedef[0], y: Y.hedef[1] + 0.1, z: Y.hedef[2], r: 4.5, c: [0.6, 0.6, 0.62], n: 22 }); return false; }
        if (bir('a')) {
          const hx = Y.hedef[0] - p.x, hz = Y.hedef[2] - p.z, l = Math.hypot(hx, hz);
          const s = Math.min(9, l / 0.95);
          v.hiz.x = l ? hx / l * s : 0; v.hiz.z = l ? hz / l * s : 0; v.hiz.y = 9.5; v.atilma = 1.1; v.yerde = false;
          this.animBaslat(v, 1);
        }
        if (t > 0.85 && v.yerde && bir('b')) {
          this.animBaslat(v, 5); v.atilma = 0;
          this.efekt({ t: 'halka', x: p.x, y: p.y + 0.1, z: p.z, r: 5, c: [0.55, 0.52, 0.5], n: 40, ses: 'gok' });
          this.efekt({ t: 'halka', x: p.x, y: p.y + 0.1, z: p.z, r: 2.5, c: [0.45, 0.42, 0.4], n: 20 });
          if (yakinda(p.x, p.z, 5.2, 2.6)) ctx.oyuncuyaVur(faz2 ? 8 : 7, v);
          Y.bitis = t + 0.45;
        }
        return Y.bitis ? t > Y.bitis : t > 3;
      case 'kaya':
        /* Kaya fırlatma: yay çizerek hedefe düşer */
        if (t > 0.7 && bir('a')) {
          const c = new THREE.Vector3(p.x, p.y + T.boy + 0.3, p.z);
          const hx = op.x - c.x, hz = op.z - c.z, d = Math.hypot(hx, hz) || 1, hizY = 15, sure = d / hizY;
          const vy = (op.y + 0.8 - c.y + 0.5 * 18 * sure * sure) / sure;
          this.okAt(c, new THREE.Vector3(hx / d * hizY, vy, hz / d * hizY), faz2 ? 8 : 7, v, null, { tur: 'kaya' });
          this.efekt({ t: 'patlama', x: c.x, y: c.y, z: c.z, c: [0.5, 0.5, 0.52], n: 10 });
        }
        return t > 1.1;
    }
    return true;
  }
  /* Bossun sağ elinin (silah / asa) dünya konumu */
  elUcu(v) {
    const m = v.m;
    if (m && m.kollar[1]) { m.kok.updateMatrixWorld(true); return m.kollar[1].localToWorld(new THREE.Vector3(0, -0.7, -0.6)); }
    return new THREE.Vector3(v.konum.x, v.konum.y + v.tur.boy * 0.7, v.konum.z);
  }
  /* Animasyon kodu: 0 yok, 1 kollar yukarı, 2 fırlatma, 3 dönme, 4 eğilme, 5 yere vurma (çok oyunculuda istemcilere bayrakla iletilir) */
  animBaslat(v, kod) {
    v.anim = kod; v.animT = 0;
    if (!kod && v.m) { for (const k of v.m.kollar) k.rotation.z = 0; if (v.m.govde) v.m.govde.rotation.x = 0; v.m.kok.position.y = v.konum.y; }
  }
  animUygula(v, dt) {
    const m = v.m, a = v.anim; v.animT = (v.animT || 0) + dt;
    const t = v.animT, K = m.kollar, e = Math.min(1, t / 0.2), L = (x, y) => x + (y - x) * e;
    if (!K.length) return;
    const taban = Math.PI / 2 * 0.92;
    if (a === 1) K.forEach((k, i) => { k.rotation.x = L(taban, Math.PI * 0.95 + Math.sin(t * 9) * 0.05); k.rotation.z = L(0, i ? -0.3 : 0.3); });
    else if (a === 2) { K[1].rotation.x = t < 0.55 ? Math.PI * (0.5 + 0.65 * Math.min(1, t / 0.55)) : Math.PI * 1.15 - Math.min(1, (t - 0.55) / 0.12) * Math.PI * 0.8; K[0].rotation.x = L(taban, Math.PI * 0.4); }
    else if (a === 3) { m.kok.rotation.y = v.yaw + t * (v.tur.boss === 'reis' ? 16 : 9); K.forEach((k, i) => { k.rotation.x = Math.PI / 2; k.rotation.z = L(0, i ? -1.2 : 1.2); }); }
    else if (a === 4) { if (m.govde) m.govde.rotation.x = L(0, 0.45); m.kok.position.y = v.konum.y - 0.18 * e; for (const k of K) k.rotation.x = L(taban, -0.6); }
    else if (a === 5) { const f = Math.min(1, t / 0.12); for (const k of K) k.rotation.x = Math.PI * 0.95 * (1 - f) + 0.15 * f; if (m.govde) m.govde.rotation.x = 0.3 * f; }
  }
  /* Görsel efekt: yerelde çizilir, çok oyunculu sunucuda istemcilere de iletilir */
  efekt(e) { this.efektOyna(e); if (this.efektYay) this.efektYay(e); }
  efektOyna(e) {
    const D = this.dusenler, c = e.c || [1, 1, 1], n = e.n || 12;
    if (e.t === 'patlama') D.renkliParcacik(c, e.x, e.y, e.z, n);
    else if (e.t === 'halka' || e.t === 'girdap') {
      const f = e.t === 'girdap' ? performance.now() / 300 : 0;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + f, r = e.t === 'girdap' ? e.r * (0.3 + 0.7 * ((i * 7) % n) / n) : e.r; D.renkliParcacik(c, e.x + Math.cos(a) * r, e.y + (e.t === 'girdap' ? 0.3 + (i % 5) * 0.45 : 0), e.z + Math.sin(a) * r, 1); }
    }
    else if (e.t === 'sutun') for (let i = 0; i < n; i++) D.renkliParcacik(c, e.x + (Math.random() - 0.5) * 0.9, e.y + (i / n) * (e.h || 2), e.z + (Math.random() - 0.5) * 0.9, 1);
    const k = e.ses ? this.sesK(new THREE.Vector3(e.x, e.y, e.z), 34) : 0;
    if (k > 0) {
      if (e.ses === 'gok') this.ses.gokGurultusu(0.4 * k, true);
      else if (e.ses === 'kum' && this.ses.ruzgar) this.ses.ruzgar(k);
      else if (e.ses === 'buyu' && this.ses.buyu) this.ses.buyu();
      else if (e.ses === 'buz' && this.ses.cam) this.ses.cam(k);
      else if (e.ses === 'bagir') this.ses.canli('haydut', 'normal', k);
      else if (e.ses === 'savur' && this.ses.savur) this.ses.savur(k);
      else if (e.ses === 'nota' && this.ses.melodi) this.ses.melodi(e.m | 0, k);   // 0.17.0: müzik kutusu
    }
  }
  /* Bossun çevresinde yardımcı canavar doğurur (yakında en çok 4 tane) */
  cagir(v, tur, n, r) {
    const p = v.konum;
    let yakin = 0; for (const w of this.liste) if (!w.olu && w.turAd === tur && w.konum.distanceToSquared(p) < 256) yakin++;
    for (let i = 0, k = 0; i < n && yakin < 4 && k < 16; k++) {
      const x = Math.floor(p.x + (Math.random() * 2 - 1) * r), z = Math.floor(p.z + (Math.random() * 2 - 1) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      let y = Math.floor(p.y);
      if (this.dunya.kati(x, y, z) || this.dunya.kati(x, y + 1, z)) continue;
      while (y > 1 && !this.dunya.kati(x, y - 1, z)) y--;
      if (Math.abs(y - p.y) > 3) continue;
      this.ekle(tur, x + 0.5, y, z + 0.5); i++; yakin++;
      this.dusenler.renkliParcacik([0.4, 0.38, 0.35], x + 0.5, y + 0.5, z + 0.5, 10);
    }
  }
  isinlan(v, rmin, rmax) {
    const p = v.konum;
    for (let k = 0; k < 12; k++) {
      const a = Math.random() * Math.PI * 2, r = rmin + Math.random() * (rmax - rmin);
      const x = Math.floor(p.x + Math.cos(a) * r), z = Math.floor(p.z + Math.sin(a) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      let y = Math.floor(p.y) + 3;
      while (y > 1 && !this.dunya.kati(x, y - 1, z)) y--;
      if (Math.abs(y - p.y) > 5 || this.dunya.kati(x, y, z) || this.dunya.kati(x, y + 1, z) || this.dunya.kati(x, y + 2, z) || SIVI[this.dunya.blok(x, y, z)]) continue;
      this.dusenler.renkliParcacik([0.7, 0.9, 1], p.x, p.y + 1, p.z, 18);
      p.set(x + 0.5, y, z + 0.5); v.hiz.set(0, 0, 0);
      this.dusenler.renkliParcacik([0.7, 0.9, 1], p.x, p.y + 1, p.z, 18);
      return true;
    }
    return false;
  }

  /* ---------- Uçan canlılar (yarasa): yer çekimi yoktur, dalgalı uçar, vurup uzaklaşır ---------- */
  ucanCanli(v, dt, ctx) {
    const T = v.tur, p = v.konum, op = ctx.oyuncu.konum;
    const dx = op.x - p.x, dy = op.y + 1.3 - p.y, dz = op.z - p.z, d = Math.hypot(dx, dy, dz) || 1;
    /* Gündüz açıkta kalan yarasa bir süre sonra kaybolur */
    if (!T.ari && ctx.gunIsigi > 0.6 && this.gokAcik(p.x, p.y + 1, p.z)) { v.gunduz = (v.gunduz || 0) + dt; if (v.gunduz > 12) { v.sil = true; return; } } else v.gunduz = 0;
    let yx = 0, yy = 0, yz = 0, hiz = 0, kovaliyor = false;
    const t = performance.now() / 1000 + v.id * 1.7;
    /* 0.21.0: kızgın arı 25 saniye sonra sakinleşir */
    if (T.ari && v.ofkeli) { v.ofkeSure = (v.ofkeSure ?? 25) - dt; if (v.ofkeSure <= 0) { v.ofkeli = false; v.ofkeSure = null; } }
    const ariY = T.ari && !v.ofkeli ? this.ariYon(v, dt, ctx) : null;
    if (v.sil) return;
    if (ariY) [yx, yy, yz, hiz] = ariY;
    else if (T.atesTopu && !this.barisci && !ctx.oyuncuOlu && d < T.gorus) {
      /* 0.18.0: Kor Ruhu oyuncunun 7-11 blok yakınında, biraz yukarıda süzülür; görünce art arda üç ateş topu atar */
      kovaliyor = true;
      const yatay = Math.hypot(dx, dz) || 1, yaklas = yatay > 11 ? 1 : yatay < 6 ? -1 : 0;
      yx = dx / yatay * yaklas + (-dz / yatay) * Math.sin(t * 0.7) * 0.6; yz = dz / yatay * yaklas + (dx / yatay) * Math.sin(t * 0.7) * 0.6;
      yy = (op.y + 3.5 - p.y) * 0.4 + Math.sin(t * 2.3) * 0.3; hiz = yaklas ? T.kosu : T.hiz;
      v.seriBek = (v.seriBek || 0) - dt;
      if (v.saldiriBek <= 0 && this.gorusVar(p.x, p.y + 1.2, p.z, op.x, op.y + 1.4, op.z)) { v.saldiriBek = 3 + Math.random() * 1.5; v.seri = 3; }
      if (v.seri > 0 && v.seriBek <= 0) { v.seri--; v.seriBek = 0.32; this.atesTopuAt(v, ctx); }
    } else if (!this.barisci && !ctx.oyuncuOlu && d < T.gorus && v.kacZaman <= 0 && (!T.ari || v.ofkeli)) {
      kovaliyor = true;
      yx = dx / d + Math.sin(t * 3.1) * 0.55; yy = dy / d + Math.sin(t * 4.3) * 0.45; yz = dz / d + Math.cos(t * 2.7) * 0.55; hiz = T.kosu;
      if (d < T.menzil + 0.6 && v.saldiriBek <= 0) {
        v.saldiriBek = 1.4 + Math.random(); ctx.oyuncuyaVur(T.hasar, v);
        v.kacZaman = 0.8 + Math.random() * 0.7; v.kacYon = [-dx / d + (Math.random() - 0.5), 0.7, -dz / d + (Math.random() - 0.5)];
      }
    } else if (v.kacZaman > 0 && v.kacYon) { [yx, yy, yz] = v.kacYon; hiz = T.kosu; }
    else {
      const h = v.hedef3;
      if (!h || v.karar <= 0 || Math.hypot(h.x - p.x, h.y - p.y, h.z - p.z) < 0.8) {
        v.karar = 1.5 + Math.random() * 3; v.hedef3 = null;
        for (let k = 0; k < 6; k++) {
          const tx = p.x + (Math.random() - 0.5) * 14, tz = p.z + (Math.random() - 0.5) * 14;
          let ty = p.y + (Math.random() - 0.5) * 6;
          const zem = this.dunya.ustKati(Math.floor(tx), Math.floor(tz));
          if (zem < ty && ty > zem + 7) ty = zem + 3 + Math.random() * 4;   // açıkta yere yakın uçar
          if (!this.kati(tx, ty, tz) && !this.kati(tx, ty + 0.5, tz) && !SIVI[this.dunya.blok(Math.floor(tx), Math.floor(ty), Math.floor(tz))]) { v.hedef3 = { x: tx, y: ty, z: tz }; break; }
        }
      }
      if (v.hedef3) { yx = v.hedef3.x - p.x; yy = v.hedef3.y - p.y; yz = v.hedef3.z - p.z; hiz = T.hiz; }
      yy += Math.sin(t * 5) * 0.3;
    }
    const l = Math.hypot(yx, yy, yz) || 1;
    const k = Math.min(1, 4 * dt);
    v.hiz.x += (yx / l * hiz - v.hiz.x) * k; v.hiz.y += (yy / l * hiz - v.hiz.y) * k; v.hiz.z += (yz / l * hiz - v.hiz.z) * k;
    if (SIVI[this.dunya.blok(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z))]) v.hiz.y = Math.max(v.hiz.y, 3);
    this.hareket(v, dt);
    v.yerde = false;
    if (v.engel && !kovaliyor) { v.hedef3 = null; v.karar = 0; }
    if (v.lavda && !T.atesBagisik) this.hasarVer(v, 4, null, { sessiz: true });
    /* Yön */
    if (Math.hypot(v.hiz.x, v.hiz.z) > 0.2) v.hedefYaw = kovaliyor ? Math.atan2(-dx, -dz) : Math.atan2(-v.hiz.x, -v.hiz.z);
    let fark = v.hedefYaw - v.yaw; fark = Math.atan2(Math.sin(fark), Math.cos(fark)); v.yaw += fark * Math.min(1, dt * 8);
    /* Işık */
    v.isikSayac -= dt;
    if (v.isikSayac <= 0) {
      v.isikSayac = 0.3;
      let li = this.gokAcik(p.x, p.y + 1, p.z) ? ctx.gunIsigi : 0.08;
      if (this.mesaleYakin(p.x, p.y, p.z, 12)) li = Math.max(li, 0.6);
      v.isikHedef = Math.max(0.08, li);
    }
    v.isik += ((v.isikHedef || 1) - v.isik) * Math.min(1, dt * 5);
    if (v.sesZaman <= 0) { v.sesZaman = 3 + Math.random() * 6; const sd = this.dinleyici ? this.dinleyici.distanceTo(p) : d; if (sd < 18) this.ses.canli(T.ses, 'normal', 1 - sd / 20); }
    this.canlandir(v, dt, dx, dy - 1.3, dz, kovaliyor);
  }

  /* Eksen eksen hareket ve çarpışma */
  hareket(v, dt) {
    const p = v.konum, h = v.hiz;
    const adim = Math.max(1, Math.ceil(Math.max(Math.abs(h.x), Math.abs(h.y), Math.abs(h.z)) * dt / 0.35));
    const s = dt / adim;
    let yerde = false; v.engel = false;
    for (let i = 0; i < adim; i++) {
      let ny = p.y + h.y * s;
      if (this.carpisiyor(v, p.x, ny, p.z)) { if (h.y < 0) { const u = this.carpisiyor(v, p.x, ny, p.z, 1); ny = u != null && u <= p.y + 1e-3 ? u : Math.floor(ny) + 1; yerde = true; } else ny = Math.floor(ny + v.tur.boy) - v.tur.boy - 1e-4; if (this.carpisiyor(v, p.x, ny, p.z)) ny = p.y; h.y = 0; }
      p.y = ny;
      const nx = p.x + h.x * s;
      if (this.carpisiyor(v, nx, p.y, p.z)) { h.x = 0; v.engel = true; } else p.x = nx;
      const nz = p.z + h.z * s;
      if (this.carpisiyor(v, p.x, p.y, nz)) { h.z = 0; v.engel = true; } else p.z = nz;
    }
    if (!yerde && h.y === 0 && this.carpisiyor(v, p.x, p.y - 0.03, p.z)) yerde = true;
    v.yerde = yerde;
    const ic = this.dunya.blok(Math.floor(p.x), Math.floor(p.y + v.tur.boy * 0.4), Math.floor(p.z));
    v.suda = !!SIVI[ic] && !LAV[ic];
    v.lavda = !!LAV[ic] || !!LAV[this.dunya.blok(Math.floor(p.x), Math.floor(p.y + 0.1), Math.floor(p.z))];
    if (v.yerde) { h.x *= 0.92; h.z *= 0.92; }
    if (p.y < -10) p.y = -100;
  }

  /* Canlılar birbirinin içine girmesin */
  ayir() {
    const L = this.liste;
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j];
      if (a.olu || b.olu) continue;
      const dx = b.konum.x - a.konum.x, dz = b.konum.z - a.konum.z, en = a.tur.gen + b.tur.gen;
      if (Math.abs(dx) > en || Math.abs(dz) > en || Math.abs(b.konum.y - a.konum.y) > 1.5) continue;
      const l = Math.hypot(dx, dz) || 0.01, k = (en - l) * 0.25;
      if (k <= 0) continue;
      a.hiz.x -= dx / l * k * 6; a.hiz.z -= dz / l * k * 6; b.hiz.x += dx / l * k * 6; b.hiz.z += dz / l * k * 6;
    }
  }

  /* ---------- Hasar ---------- */
  /* o.vuran: çok oyunculuda vuran uzak oyuncu (yerel oyuncu için boş) */
  hasarVer(v, n, kaynak, o = {}) {
    if (this.ayna) return this.aynaVur(v, n, kaynak, o);
    if (v.olu || (v.hasarZaman > 0 && !o.sessiz)) return false;
    /* 0.16.0: oyuncu kendi evcil hayvanına ve atına zarar vermez */
    if (o.oyuncu && v.sahip && v.sahip === (o.vuran ? o.vuran.ad : this.yerelAd)) return false;
    v.can -= n;
    v.hasarZaman = 0.45;
    if (o.ates && !v.tur.atesBagisik) v.atesSure = 4;
    if (o.yavas) v.yavasSure = 5;
    if (kaynak) {
      const ax = v.konum.x - kaynak.x, az = v.konum.z - kaynak.z, l = Math.hypot(ax, az) || 1;
      const itme = (o.itme ?? 1) * (v.tur.boss ? 0.25 : 1);
      v.hiz.x = ax / l * 7 * itme; v.hiz.z = az / l * 7 * itme; if (v.yerde || v.suda) v.hiz.y = 5.5 * itme;
      if (!v.tur.dusman) { v.kacZaman = 6; v.kacKaynak = { x: kaynak.x, z: kaynak.z }; v.karar = 0; v.kacYon = null; }
      if (v.tur.notr) for (const w of this.liste) if (w.turAd === v.turAd && w.konum.distanceToSquared(v.konum) < 400) w.ofkeli = true;
    }
    if (o.oyuncu) { if (!o.vuran) { this.sonVurulan = v; this.sonVurulanZaman = 3; } if (this.olaylar.vurus) this.olaylar.vurus(v, o.vuran); }
    const sk = this.sesK(v.konum);
    if (v.can <= 0) {
      v.olu = true; v.olumZaman = 0;
      if (o.oyuncu && this.olaylar.olum) this.olaylar.olum(v, o.vuran, o);
      if (v.bossAnahtar && this.olaylar.bossOldu) this.olaylar.bossOldu(v, o);
      if (sk > 0) this.ses.canli(v.tur.ses, 'olum', sk);
      /* Yağma büyüsü: her ganimete seviyeye göre ek adet şansı */
      const yg = o.yagma || 0;
      if (!o.dusurme && v.kanli) { for (const [id, adet] of v.tur.dusur(Math.random)) if (adet > 0) this.dusenler.birak(id, adet, v.konum.x, v.konum.y + 0.4, v.konum.z, 0, 0, 0, undefined, 0.5); if (Math.random() < 0.06) this.dusenler.birak(492, 1, v.konum.x, v.konum.y + 0.4, v.konum.z, 0, 0, 0, undefined, 0.5); }
      if (!o.dusurme) for (const [id, adet0, buyu] of v.tur.dusur(Math.random)) { const adet = buyu || v.tur.boss && adet0 === 1 && id >= 458 ? adet0 : adet0 + (yg && !v.tur.koylu ? Math.floor(Math.random() * (yg + 1)) : 0); if (adet > 0) this.dusenler.birak(id, adet, v.konum.x, v.konum.y + 0.4, v.konum.z, 0, 0, 0, undefined, 0.5, buyu); }
      return true;
    }
    if (sk > 0) this.ses.canli(v.tur.ses, 'acima', sk);
    return true;
  }

  /* Bakılan canlı (AABB ışın testi) */
  isin(o, d, maks) {
    let en = null, enT = maks;
    for (const v of this.liste) {
      if (v.olu || v.binen === 'yerel' || v.yerelBinek) continue;   // binilen at hedeflenmez
      const g = v.tur.gen + 0.05, p = v.konum;
      const a = [p.x - g, p.y, p.z - g], b = [p.x + g, p.y + v.tur.boy, p.z + g];
      const oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
      let t0 = 0, t1 = enT, ok = true;
      for (let i = 0; i < 3 && ok; i++) {
        if (Math.abs(dd[i]) < 1e-9) { if (oo[i] < a[i] || oo[i] > b[i]) ok = false; continue; }
        let ta = (a[i] - oo[i]) / dd[i], tb = (b[i] - oo[i]) / dd[i];
        if (ta > tb) [ta, tb] = [tb, ta];
        t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
        if (t0 > t1) ok = false;
      }
      if (ok && t0 < enT) { enT = t0; en = v; }
    }
    return en ? { v: en, t: enT } : null;
  }

  yakinDusman(p, r) { return this.liste.some(v => !v.olu && v.tur.dusman && v.konum.distanceToSquared(p) < r * r); }

  /* İki nokta arasında katı blok yoksa true */
  gorusVar(ax, ay, az, bx, by, bz) {
    const d = Math.hypot(bx - ax, by - ay, bz - az), n = Math.ceil(d / 0.5);
    for (let i = 1; i < n; i++) { const t = i / n; if (this.dunya.kati(Math.floor(ax + (bx - ax) * t), Math.floor(ay + (by - ay) * t), Math.floor(az + (bz - az) * t))) return false; }
    return true;
  }

  /* ---------- Canavar yuvaları: yakında ve karanlıkta canavar çıkarır ---------- */
  yuvaGuncelle(dt, C) {
    if (this.dogurmaKapali) return;   // geliştirici modu: canlı doğması durduruldu
    for (const y of this.dunya.yuvalar.values()) {
      let d2 = Infinity;
      for (const c of C) { const op = c.oyuncu.konum; d2 = Math.min(d2, (y.x + 0.5 - op.x) ** 2 + (y.y - op.y) ** 2 + (y.z + 0.5 - op.z) ** 2); }
      if (d2 > 18 * 18) continue;
      y.sayac -= dt;
      if (y.sayac > 0) continue;
      y.sayac = 8 + Math.random() * 10;
      if (this.mesaleYakin(y.x + 0.5, y.y, y.z + 0.5, 6)) continue;
      if (!y.tur && diyarMi(y.x)) y.tur = 'korruhu';   // 0.18.0: kül kalesi yuvası
      if (!y.tur) { const zd = zindanAt(this.uretici, y.x, y.y, y.z); y.tur = zd ? zd.tur : madenAt(this.uretici, y.x, y.y, y.z) ? 'orumcek' : YUVA_TURLERI[Math.floor(karma3(7, y.x, y.y, y.z) * 3)]; }
      let yakin = 0;
      for (const v of this.liste) if (!v.olu && v.tur.dusman && v.konum.distanceToSquared(new THREE.Vector3(y.x, y.y, y.z)) < 64) yakin++;
      if (yakin >= 4) continue;
      for (let n = 0, k = 0; n < 2 && k < 12; k++) {
        const x = y.x + Math.floor(Math.random() * 7) - 3, z = y.z + Math.floor(Math.random() * 7) - 3, yy = y.y + Math.floor(Math.random() * 3) - 1;
        if (this.dunya.kati(x, yy - 1, z) && !this.dunya.kati(x, yy, z) && !this.dunya.kati(x, yy + 1, z) && !SIVI[this.dunya.blok(x, yy, z)]) {
          this.ekle(y.tur, x + 0.5, yy, z + 0.5); n++;
          this.dusenler.renkliParcacik([0.3, 0.3, 0.32], x + 0.5, yy + 0.5, z + 0.5, 8);
        }
      }
    }
  }

  /* ---------- Oklar ---------- */
  /* sahip: oku atan uzak oyuncu (çok oyunculu sunucu); istemcide oyuncu okunu sunucu atar */
  /* ek: { yavas } Buz Yayı oku */
  okAt(p, hiz, hasar, dusman = false, sahip = null, ek = null) {
    if (this.ayna) { if (this.ag) this.ag.okAt(p, hiz, hasar, ek); return null; }
    const mesh = okModeli(ek && ek.tur);
    mesh.position.copy(p);
    this.grup.add(mesh);
    const o = { p: p.clone(), v: hiz.clone(), hasar, yas: 0, saplandi: false, mesh, dusman, sahip, ni: ++this.okSira, ek };
    this.oklar.push(o);
    if (this.ag && this.ag.okEklendi) this.ag.okEklendi(o);
    return o;
  }
  /* Yay kirişi ve ok: g 0 (gevşek) .. 1 (tam gerili). Kiriş iki parçadır; uçlardan geri çekilen noktaya uzanır */
  yayGer(Y, g) {
    const uY = -0.61, uZ = 0.36, cek = -0.6 + g * 0.24;   // uç noktaları ve kirişin çekilen orta noktası (kol ekseninde)
    Y.kiris.forEach((k, i) => {
      const s = i ? -1 : 1, dy = cek - uY, dz = -s * uZ, L = Math.hypot(dy, dz);
      k.position.set(0, uY + dy / 2, s * uZ + dz / 2);
      k.scale.set(1, 1, L);
      k.rotation.set(Math.atan2(-dy, dz), 0, 0);
    });
    Y.ok.visible = g > 0.02;
    Y.ok.position.set(0, cek + 0.0, 0);
  }
  /* İskeletin oyuncuya ok atışı: ok yayın bulunduğu elden çıkar; yer çekimine göre biraz yukarı nişan alınır */
  mobOkAt(v, ctx) {
    const op = ctx.oyuncu.konum;
    let p = new THREE.Vector3(v.konum.x, v.konum.y + 1.45, v.konum.z);
    if (v.m && v.m.kollar[1]) { v.m.kok.updateMatrixWorld(true); p = v.m.kollar[1].localToWorld(new THREE.Vector3(0, -0.8, 0)); }
    const h = new THREE.Vector3(op.x - p.x, op.y + 1.2 - p.y, op.z - p.z);
    const d = h.length(), hizB = 22, t = d / hizB;
    h.y += 0.5 * 18 * t * t;
    h.x += (Math.random() - 0.5) * d * 0.06; h.z += (Math.random() - 0.5) * d * 0.06;
    h.normalize().multiplyScalar(hizB);
    p.addScaledVector(h.clone().normalize(), 0.15);
    this.okAt(p, h, v.tur.hasar, v);
    /* Buz Büyücüsü üç ok birden atar */
    if (v.tur.boss === 'buzbuyucu') for (const a of [-0.14, 0.14]) { const c = Math.cos(a), sn = Math.sin(a); this.okAt(p.clone(), new THREE.Vector3(h.x * c - h.z * sn, h.y, h.x * sn + h.z * c), v.tur.hasar, v); }
    v.ger = 0;
    if (this.sesK(p) > 0.3) this.ses.yayAt();
  }
  /* 0.23.0: gölge: altındaki ilk katı bloğun üstüne konur; yükseldikçe küçülür, suda ve görünmezken gizlenir */
  golgeGuncelle(v) {
    const T = v.tur, p = v.konum;
    if (T.su || T.atesTopu) return;
    if (!v.golge) { v.golge = new THREE.Mesh(GOLGE_GEO, GOLGE_MALZ); v.golge.renderOrder = 1; this.grup.add(v.golge); }
    const g = v.golge;
    if (!v.m.kok.visible || v.suda || v.olu) { g.visible = false; return; }
    let y = Math.floor(p.y + 0.3), n = 0;
    while (n < 6 && !this.kati(p.x, y - 0.5, p.z)) { y--; n++; }
    if (n >= 6) { g.visible = false; return; }
    const yuk = Math.max(0, p.y - y), k = Math.max(0, 1 - yuk / 6) * (v.m.kok.scale.x || 1);
    g.visible = k > 0.05;
    g.position.set(p.x, y + 0.02, p.z);
    g.scale.setScalar(Math.max(0.35, (T.gen || 0.6) * 2.4) * k);
  }
  /* 0.22.0: Kanlı Ay canavarı: %50 fazla can, +1 hasar (oyuncuyaVur içinde), iki kat ganimet ve deneyim */
  kanliYap(v) { v.kanli = true; v.can = Math.round(v.can * 1.5); }
  /* ---------- 0.21.0: Arıcılık (tek oyunculu ve sunucu) ---------- */
  /* Kovanlar: oyuncuların 40 blok yakınındaki her kovandan gündüz ve yağmur yokken en çok 3 arı dışarı çıkar */
  kovanlariGuncelle(dt, C) {
    const d = this.dunya;
    if (!this.kovanDinle) {
      /* Dolu kovan hasat edilince ya da kovan kırılınca, altında 5 blok içinde kamp ateşi yoksa arılar kızar */
      this.kovanDinle = (x, y, z, id, eski) => {
        const eb = BLOKLAR[eski];
        if (!eb || !eb.kovan) return;
        const nb = BLOKLAR[id], hasat = nb && nb.kovan && eb.bal === 5 && nb.bal === 0;
        if (!hasat && nb && nb.kovan) return;
        for (let k = 1; k <= 5; k++) if (d.blok(x, y - k, z) === 48) return;
        const kk = x + ',' + y + ',' + z;
        let n = 0;
        for (const v of this.liste) if (v.tur.ari && !v.olu && (v.kovan === kk || v.konum.distanceToSquared({ x: x + 0.5, y, z: z + 0.5 }) < 144)) { v.ofkeli = true; v.ofkeSure = 25; n++; }
        for (; n < 2; n++) { const v = this.ekle('ari', x + 0.5 + (Math.random() - 0.5) * 2, y + 1.2, z + 0.5 + (Math.random() - 0.5) * 2); v.ofkeli = true; v.ofkeSure = 25; v.kovan = kk; }
      };
      d.dinleyiciler.push(this.kovanDinle);
    }
    this.kovanSayac = (this.kovanSayac || 0) - dt;
    if (this.kovanSayac > 0) return;
    this.kovanSayac = 1;
    const gun = C[0] ? C[0].gunIsigi : 1;
    if (!(gun > 0.45) || d.yagiyor) return;
    for (const [k, kv] of d.kovanlar) {
      if (!C.some(c => (c.oyuncu.konum.x - kv.x) ** 2 + (c.oyuncu.konum.z - kv.z) ** 2 < 1600)) continue;
      kv.sayac -= 1;
      if (kv.sayac > 0) continue;
      let disari = 0;
      for (const v of this.liste) if (v.kovan === k && !v.olu) disari++;
      if (disari >= 3) continue;
      const b = BLOKLAR[d.blok(kv.x, kv.y, kv.z)];
      if (!b || !b.kovan) continue;
      const [a, c] = [[0, -1], [1, 0], [0, 1], [-1, 0]][b.yon];
      if (d.blok(kv.x + a, kv.y, kv.z + c) !== 0) { kv.sayac = 10; continue; }
      const v = this.ekle('ari', kv.x + 0.5 + a * 0.8, kv.y + 0.3, kv.z + 0.5 + c * 0.8);
      v.kovan = k; v.disari = 0;
      kv.sayac = 5 + Math.random() * 8;
    }
  }
  /* Sakin arının yönü: çiçek bul, 2,5 saniye polen topla, kovana dön ve içine girerek balı artır */
  ariYon(v, dt, ctx) {
    const p = v.konum, d = this.dunya, kv = v.kovan && d.kovanlar.get(v.kovan);
    v.disari = (v.disari || 0) + dt;
    if (!kv) { v.evsiz = (v.evsiz || 0) + dt; if (v.evsiz > 60) v.sil = true; return null; }
    const kb = BLOKLAR[d.blok(kv.x, kv.y, kv.z)];
    if (!kb || !kb.kovan) { d.kovanlar.delete(v.kovan); return null; }
    const git = (x, y, z, h) => [x - p.x, y - p.y, z - p.z, h];
    /* Eve dönüş: polen taşıyorsa, akşam olduysa, yağıyorsa ya da 2 dakikadır dışarıdaysa */
    if (v.polen || ctx.gunIsigi < 0.35 || d.yagiyor || v.disari > 120) {
      const [a, c] = [[0, -1], [1, 0], [0, 1], [-1, 0]][kb.yon];
      const hx = kv.x + 0.5 + a * 0.85, hy = kv.y + 0.25, hz = kv.z + 0.5 + c * 0.85;
      if ((hx - p.x) ** 2 + (hy - p.y) ** 2 + (hz - p.z) ** 2 < 0.5) {
        if (v.polen && kb.bal < 5) d.blokKoy(kv.x, kv.y, kv.z, d.blok(kv.x, kv.y, kv.z) + 1, 'tik');
        v.sil = true;
        return null;
      }
      return git(hx, hy, hz, v.tur.hiz);
    }
    /* Çiçekte polen toplama */
    if (v.cicek) {
      const [cx, cy, cz] = v.cicek;
      if (!CICEK.has(d.blok(cx, cy, cz))) { v.cicek = null; return null; }
      const hx = cx + 0.5, hy = cy + 0.55, hz = cz + 0.5;
      if ((hx - p.x) ** 2 + (hy - p.y) ** 2 + (hz - p.z) ** 2 < 0.4) {
        v.konma = (v.konma || 0) + dt;
        if (v.konma > 2.5) { v.polen = true; v.cicek = null; v.konma = 0; this.dusenler.renkliParcacik([1, 0.85, 0.2], hx, hy, hz, 3); }
        return [0, 0, 0, 0];
      }
      return git(hx, hy, hz, v.tur.hiz);
    }
    /* Kovanın 10 blok çevresinde çiçek ara */
    v.araSayac = (v.araSayac || 0) - dt;
    if (v.araSayac <= 0) {
      v.araSayac = 1.5;
      for (let k = 0; k < 30 && !v.cicek; k++) {
        const x = kv.x + Math.floor((Math.random() - 0.5) * 21), z = kv.z + Math.floor((Math.random() - 0.5) * 21);
        for (let y = kv.y + 4; y >= kv.y - 8; y--) { const id = d.blok(x, y, z); if (CICEK.has(id)) { v.cicek = [x, y, z]; break; } if (id && !BITKI[id]) break; }
      }
    }
    return null;   // çiçek bulunana kadar kovan çevresinde dolaşır
  }
  /* 0.18.0: Kor Ruhunun ateş topu: yer çekimsiz, düz gider; isabet eden oyuncuyu tutuşturur */
  atesTopuAt(v, ctx) {
    const op = ctx.oyuncu.konum, p = new THREE.Vector3(v.konum.x, v.konum.y + 1.1, v.konum.z);
    const h = new THREE.Vector3(op.x - p.x + (Math.random() - 0.5) * 1.2, op.y + 1.1 - p.y + (Math.random() - 0.5) * 0.6, op.z - p.z + (Math.random() - 0.5) * 1.2).normalize();
    p.addScaledVector(h, 0.5);
    this.okAt(p, h.multiplyScalar(15), v.tur.hasar, v, null, { tur: 'ates' });
    if (this.sesK(p) > 0.2) this.ses.atesTopu();
  }
  okGuncelle(dt, C) {
    const ctx = C[0];
    for (let i = this.oklar.length - 1; i >= 0; i--) {
      const o = this.oklar[i];
      o.yas += dt;
      let sil = o.yas > 60;
      if (!o.saplandi) {
        const atesT = o.ek && o.ek.tur === 'ates';
        if (!atesT) o.v.y -= 18 * dt; if (!(o.ek && (o.ek.tur === 'kaya' || atesT))) o.v.multiplyScalar(1 - 0.15 * dt);
        if (SIVI[this.dunya.blok(Math.floor(o.p.x), Math.floor(o.p.y), Math.floor(o.p.z))]) o.v.multiplyScalar(1 - 3 * dt);
        const adim = Math.max(1, Math.ceil(o.v.length() * dt / 0.2));
        const s = dt / adim;
        for (let k = 0; k < adim && !o.saplandi && !sil; k++) {
          const yeni = o.p.clone().addScaledVector(o.v, s);
          /* Canlıya isabet */
          const yon = o.v.clone().normalize();
          /* Canavar okları yalnızca oyunculara isabet eder (aynada isabeti sunucu hesaplar) */
          if (o.dusman && !this.ayna) {
            const q = yeni, g = o.ek && o.ek.tur === 'kaya' ? 0.75 : 0.35;
            for (const c of C) {
              const op = c.oyuncu.konum;
              if (q.x > op.x - g && q.x < op.x + g && q.z > op.z - g && q.z < op.z + g && q.y > op.y && q.y < op.y + 1.8) {
                c.oyuncuyaVur(o.hasar, o.dusman, o.p); if (this.sesK(o.p) > 0.3) this.ses.okIsabet(); sil = true; break;
              }
            }
            if (sil) break;
          }
          const vur = o.dusman || this.ayna ? null : this.isin(o.p, yon, o.v.length() * s + 0.1);
          if (vur) {
            const guc = o.v.length() / 30;
            this.hasarVer(vur.v, Math.max(1, Math.round(o.hasar * Math.min(1.2, guc + 0.2))), o.p.clone().addScaledVector(yon, -1), { itme: 0.6, oyuncu: true, vuran: o.sahip, ok: true, yavas: !!(o.ek && o.ek.yavas) });
            if (this.sesK(o.p) > 0.3) this.ses.okIsabet();
            sil = true; break;
          }
          /* Boss mermileri (kaya, buz, lanet) bloğa çarpınca dağılır */
          if (o.ek && o.ek.tur && this.dunya.kati(Math.floor(yeni.x), Math.floor(yeni.y), Math.floor(yeni.z))) {
            const c = o.ek.tur === 'kaya' ? [0.5, 0.5, 0.52] : o.ek.tur === 'buz' ? [0.75, 0.95, 1] : o.ek.tur === 'ates' ? [1, 0.5, 0.15] : [1, 0.85, 0.3];
            this.dusenler.renkliParcacik(c, o.p.x, o.p.y, o.p.z, o.ek.tur === 'kaya' ? 14 : 6); sil = true; break;
          }
          if (this.dunya.kati(Math.floor(yeni.x), Math.floor(yeni.y), Math.floor(yeni.z))) { o.saplandi = true; o.blok = [Math.floor(yeni.x), Math.floor(yeni.y), Math.floor(yeni.z)]; o.p.lerp(yeni, 0.5); o.v.set(0, 0, 0); if (this.sesK(o.p) > 0.3) this.ses.okSaplandi(); break; }
          o.p.copy(yeni);
        }
        if (!o.saplandi && o.v.lengthSq() > 0.01) o.mesh.lookAt(o.mesh.position.clone().sub(o.v));
      } else {
        /* Saplanan ok geri toplanabilir */
        if (o.dusman && o.yas > 10) sil = true;
        else if (!o.dusman && !this.ayna && o.yas > 0.5) {
          for (const c of C) { const op = c.oyuncu.konum; if (o.p.distanceToSquared(new THREE.Vector3(op.x, op.y + 0.9, op.z)) < 1.6 && c.okTopla()) { sil = true; break; } }
        }
        /* Saplandığı blok kırılırsa ok düşer */
        if (o.blok && !this.dunya.kati(o.blok[0], o.blok[1], o.blok[2])) { o.saplandi = false; o.blok = null; o.v.set(0, -1, 0); }
      }
      o.mesh.position.copy(o.p);
      o.mesh.material.color.setScalar(o.ek && o.ek.tur === 'ates' ? 1 : ctx.isik);
      if (sil) { this.okSil(i); }
    }
  }
  okSil(i) {
    const o = this.oklar[i];
    this.grup.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose(); this.oklar.splice(i, 1);
    if (this.ag && this.ag.okSilindi && !this.ayna) this.ag.okSilindi(o);
  }

  /* ---------- Çok oyunculu: istemcide (ayna) canlılar ve oklar sunucudan gelen verilerle gösterilir ---------- */
  /* Vuruş sunucuya iletilir; yerelde yalnızca bekleme süresi ve hedef göstergesi işlenir */
  aynaVur(v, n, kaynak, o) {
    if (v.olu || v.agHasar > 0) return false;
    v.agHasar = 0.45;
    this.sonVurulan = v; this.sonVurulanZaman = 3;
    if (this.ag) this.ag.vur(v, n, kaynak, o);
    return true;
  }
  /* l: [[id, x, y, z, yaw, bayrak, can, meta?]]; bayrak: 1 ölü, 2 hasar, 4 yanıyor, 8 nişan, 16 gizli, 32 kanat */
  aynaUygula(l, koyluCoz) {
    if (!this.harita) this.harita = new Map();
    const gor = new Set();
    for (const a of l) {
      const id = a[0];
      let v = this.harita.get(id);
      if (!v) {
        const meta = a[7];
        if (!meta || !TURLER[meta[0]]) continue;
        v = this.ekle(meta[0], a[1], a[2], a[3], { meslek: meta[1] || undefined, renk: meta[4] != null ? meta[4] : undefined });
        v.id = id; v.yaw = a[4]; v.hedefYaw = a[4]; v.hedefP = new THREE.Vector3(a[1], a[2], a[3]); v.agBayrak = 0; v.aynaHiz = 0;
        if (v.tur.koylu && koyluCoz) koyluCoz(v, meta);
        this.harita.set(id, v);
      }
      v.hedefP.set(a[1], a[2], a[3]); v.hedefYaw = a[4];
      const b = a[5], once = v.agBayrak;
      v.agBayrak = b; v.can = a[6];
      const ak = (b >> 9) & 7; if (ak !== (v.anim || 0)) this.animBaslat(v, ak);
      v.m.kok.scale.setScalar(b & 64 ? 0.55 : 1);
      const k = this.sesK(v.konum, 26);
      if ((b & 2) && !(once & 2) && !(b & 1) && k > 0) this.ses.canli(v.tur.ses, 'acima', k);
      if ((b & 1) && !v.olu) { v.olu = true; v.olumZaman = 0; if (k > 0) this.ses.canli(v.tur.ses, 'olum', k); }
      gor.add(id);
    }
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const v = this.liste[i];
      if (gor.has(v.id)) continue;
      if (v.olu) this.dusenler.renkliParcacik([0.85, 0.85, 0.85], v.konum.x, v.konum.y + v.tur.boy * 0.5, v.konum.z, 16);
      if (this.sonVurulan === v) this.sonVurulan = null;
      this.modelSil(v); this.liste.splice(i, 1); this.harita.delete(v.id);
    }
  }
  aynaGuncelle(dt, ctx) {
    const op = ctx.oyuncu.konum;
    GOLGE_MALZ.opacity = 0.15 + 0.25 * (ctx.gunIsigi ?? 1);
    for (const v of this.liste) {
      const T = v.tur, p = v.konum, m = v.m;
      v.agHasar = (v.agHasar || 0) - dt;
      if (v.olu) {
        v.olumZaman += dt;
        m.kok.rotation.z = Math.min(1, v.olumZaman / 0.35) * Math.PI / 2;
        m.malzeme.color.setRGB(1, 0.3, 0.3).multiplyScalar(v.isik);
        continue;
      }
      /* İstemcinin bindiği at yerelde sürülür */
      if (v.yerelBinek) { v.agBayrak = (v.agBayrak || 0) & ~32768; this.canlandir(v, dt, 0, 0, 0, false, v.binenHiz || 0); continue; }
      const ox = p.x, oy = p.y, oz = p.z, h = v.hedefP;
      if (p.distanceToSquared(h) > 100) p.copy(h); else p.lerp(h, Math.min(1, dt * 10));
      const id = 1 / Math.max(dt, 1e-3);
      v.hiz.set((p.x - ox) * id, (p.y - oy) * id, (p.z - oz) * id);
      v.aynaHiz += (Math.hypot(v.hiz.x, v.hiz.z) - v.aynaHiz) * Math.min(1, dt * 8);
      const b = v.agBayrak;
      v.yaniyor = !!(b & 4); v.nisan = !!(b & 8); v.hasarZaman = b & 2 ? 0.2 : 0; v.kacZaman = b & 32 ? 1 : 0; v.yerde = !(b & 32);
      m.kok.visible = !(b & 16);
      if (T.uzak) v.ger = v.nisan ? Math.min(1, (v.ger || 0) + dt / 1.4) : 0;
      if (T.su) {
        const bl = this.dunya.blok(Math.floor(p.x), Math.floor(p.y + T.boy * 0.5), Math.floor(p.z));
        this.suCanlandir(v, dt, ctx, SIVI[bl] === 1 && !LAV[bl]);
        continue;
      }
      let f = v.hedefYaw - v.yaw; f = Math.atan2(Math.sin(f), Math.cos(f)); v.yaw += f * Math.min(1, dt * 10);
      /* Işık */
      v.isikSayac -= dt;
      if (v.isikSayac <= 0) {
        v.isikSayac = 0.3;
        let l = this.gokAcik(p.x, p.y + T.boy, p.z) ? ctx.gunIsigi : 0.08;
        if (this.mesaleYakin(p.x, p.y + 1, p.z, 12)) {
          let en = 1e9; for (const t of this.dunya.mesaleler.values()) en = Math.min(en, Math.hypot(t[0] - p.x, t[1] - p.y - 1, t[2] - p.z));
          l = Math.max(l, Math.min(1, 1.1 * (1 - en / 12.5)));
        }
        v.isikHedef = Math.max(0.08, l);
      }
      v.isik += ((v.isikHedef || 1) - v.isik) * Math.min(1, dt * 5);
      if ((b & 128) && Math.random() < dt * 1.5) this.kalpler(v, 1);
      if (v.yaniyor && Math.random() < dt * 8) this.dusenler.renkliParcacik([0.25, 0.25, 0.25], p.x - 0.3 + Math.random() * 0.6, p.y + T.boy * Math.random(), p.z - 0.3 + Math.random() * 0.6, 1);
      const dx = op.x - p.x, dy = op.y - p.y, dz = op.z - p.z;
      v.sesZaman -= dt;
      if (v.sesZaman <= 0) { v.sesZaman = (T.dusman ? 4 : 8) + Math.random() * 10; const d = Math.hypot(dx, dy, dz); if (d < 22) this.ses.canli(T.ses, 'normal', 1 - d / 24); }
      this.canlandir(v, dt, dx, dy, dz, T.dusman && Math.hypot(dx, dz) < 14, v.aynaHiz);
    }
    this.okGuncelle(dt, [ctx]);
    this.sonVurulanZaman -= dt;
  }
  /* Sunucunun attığı oku göster (isabeti sunucu hesaplar) */
  aynaOk(ni, p, v, dusman, tur) {
    /* Oku atan iskeletin yay germesi sıfırlanır */
    for (const w of this.liste) if (w.tur.uzak && (w.konum.x - p[0]) ** 2 + (w.konum.z - p[2]) ** 2 < 4) w.ger = 0;
    const mesh = okModeli(tur);
    mesh.position.set(p[0], p[1], p[2]);
    this.grup.add(mesh);
    this.oklar.push({ p: new THREE.Vector3(p[0], p[1], p[2]), v: new THREE.Vector3(v[0], v[1], v[2]), hasar: 0, yas: 0, saplandi: false, mesh, dusman: !!dusman, ni, ek: tur ? { tur } : null });
  }
  aynaOkSil(ni) { const i = this.oklar.findIndex(o => o.ni === ni); if (i >= 0) this.okSil(i); }
}
