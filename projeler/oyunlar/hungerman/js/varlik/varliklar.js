/* HungerMan - canlılar yöneticisi: doğma, kaybolma, yapay zekâ, fizik, hasar, oklar
   Çok oyunculuda yapay zekâ sunucu olan oyuncuda çalışır ve her canlı en yakın oyuncuya göre davranır;
   diğer oyuncularda (ayna) canlılar sunucudan gelen konumlarla gösterilir. */
import { THREE } from '../grafik/sahne.js';
import { MODELLER, okModeli } from './modeller.js';
import { TURLER, HAYVANLAR } from './turler.js';
import { BY } from '../dunya/uretici.js';
import { KATI, SIVI, KESIK, BITKI, LAV } from '../bloklar.js';
import { zindanAt, YUVA_TURLERI } from '../dunya/zindan-uretici.js';
import { karma3 } from '../rastgele.js';
import { PY, DENIZ } from '../sabitler.js';

let SIRA = 1;
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
    this.olaylar = { vurus: null, olum: null };
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
  modelSil(v) { this.grup.remove(v.m.kok); v.m.kok.traverse(n => { if (n.geometry) n.geometry.dispose(); }); v.m.malzeme.dispose(); }

  ekle(turAd, x, y, z, ek) {
    const tur = TURLER[turAd];
    const m = MODELLER[tur.model](ek && ek.meslek);
    const v = {
      id: SIRA++, turAd, tur, m, konum: new THREE.Vector3(x, y, z), hiz: new THREE.Vector3(), yaw: Math.random() * Math.PI * 2, hedefYaw: 0,
      can: tur.can, yerde: false, suda: false, engel: false, karar: Math.random() * 2, hedef: null, kacZaman: 0, kacKaynak: null,
      hasarZaman: 0, saldiriBek: 0, ofkeli: false, olu: false, olumZaman: 0, faz: 0, sesZaman: 3 + Math.random() * 10,
      isik: 1, isikSayac: 0, yaniyor: false, yanmaSayac: 0, zipSayac: 0, sikisma: 0
    };
    m.kok.position.copy(v.konum);
    if (m.kollar.length && !m.insan && !tur.uzak) for (const k of m.kollar) k.rotation.x = Math.PI / 2 * 0.92;
    this.grup.add(m.kok);
    this.liste.push(v);
    return v;
  }

  /* ---------- Dünya yardımcıları ---------- */
  kati(x, y, z) { return this.dunya.kati(Math.floor(x), Math.floor(y), Math.floor(z)); }
  carpisiyor(v, x, y, z) {
    const g = v.tur.gen, b = v.tur.boy;
    const x0 = Math.floor(x - g), x1 = Math.floor(x + g - 1e-6), y0 = Math.floor(y), y1 = Math.floor(y + b - 1e-6), z0 = Math.floor(z - g), z1 = Math.floor(z + g - 1e-6);
    for (let by = y0; by <= y1; by++) for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) if (this.dunya.kati(bx, by, bz)) return true;
    return false;
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
  dogur(ctx) {
    const op = ctx.oyuncu.konum;
    let hayvan = 0, zombi = 0;
    let su = 0, kopek = 0, hamsi = 0;
    for (const v of this.liste) { if (v.olu || (v.konum.x - op.x) ** 2 + (v.konum.z - op.z) ** 2 > 128 * 128) continue; if (v.tur.su) { su++; if (v.turAd === 'kopekbaligi') kopek++; if (v.turAd === 'hamsi') hamsi++; } else if (v.tur.dusman) zombi++; else if (!v.tur.koylu) hayvan++; }
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
        if (adaylar.length && zem && (zem.b === 4 || zem.b === 45 || zem.b === 5 || zem.b === 3)) {
          const tur = adaylar[Math.floor(Math.random() * adaylar.length)], T = TURLER[tur];
          const n = T.grup[0] + Math.floor(Math.random() * (T.grup[1] - T.grup[0] + 1));
          for (let i = 0; i < n; i++) {
            const gx = x + Math.floor(Math.random() * 5) - 2, gz = z + Math.floor(Math.random() * 5) - 2;
            const gz2 = this.zeminBul(gx, gz);
            if (gz2 && Math.abs(gz2.y - zem.y) < 3) this.ekle(tur, gx + 0.5, gz2.y, gz + 0.5);
          }
        }
      }
    }
    /* Zombiler: gece yüzeyde, her zaman karanlık mağaralarda; meşale yakınında doğmaz */
    const sinir = Math.min(18, 5 + ctx.gunSayisi);
    if (zombi < sinir) {
      for (let deneme = 0; deneme < 6; deneme++) {
        const gece = ctx.gunIsigi < 0.4;
        const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 26;
        const x = Math.floor(op.x + Math.cos(a) * r), z = Math.floor(op.z + Math.sin(a) * r);
        if (!this.dunya.yuklu(x, z)) continue;
        let y = null;
        if (gece && Math.random() < 0.6) {
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
        }
        if (y == null) continue;
        if ((x + 0.5 - op.x) ** 2 + (y - op.y) ** 2 + (z + 0.5 - op.z) ** 2 < 18 * 18) continue;
        if (this.mesaleYakin(x + 0.5, y, z + 0.5, 10)) continue;
        const s = Math.random(), yeralti = !this.gokAcik(x, y + 2, z);
        const tur = yeralti ? (s < 0.42 ? 'zombi' : s < 0.72 ? 'iskelet' : 'orumcek') : (s < 0.6 ? 'zombi' : s < 0.85 ? 'iskelet' : 'orumcek');
        this.ekle(tur, x + 0.5, y, z + 0.5);
        break;
      }
    }
  }

  /* ---------- Güncelleme ---------- */
  /* ctx.oyuncular verilirse (çok oyunculu sunucu) her oyuncu için ayrı bağlam bulunur */
  guncelle(dt, ctx) {
    if (this.ayna) { this.aynaGuncelle(dt, ctx); return; }
    const C = ctx.oyuncular || [ctx];
    this.dogurSayac -= dt;
    if (this.dogurSayac <= 0) { this.dogurSayac = 1.2; for (const c of C) this.dogur(c); }
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
      const uzak = v.tur.koylu ? 1e9 : v.tur.su ? 64 : v.tur.dusman ? ZOMBI_UZAK : HAYVAN_UZAK;
      if (d2 > uzak * uzak || (v.olu && v.olumZaman > 0.9)) {
        if (v.olu) this.dusenler.renkliParcacik([0.85, 0.85, 0.85], v.konum.x, v.konum.y + v.tur.boy * 0.5, v.konum.z, 16);
        this.modelSil(v); this.liste.splice(i, 1);
        continue;
      }
      if (!this.dunya.yuklu(v.konum.x, v.konum.z)) continue;
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
    if (T.su) { this.suCanlisi(v, dt, ctx); return; }
    const dx = op.x - p.x, dz = op.z - p.z, dy = op.y - p.y;
    const yatay = Math.hypot(dx, dz);
    let yx = 0, yz = 0, hiz = 0, kovaliyor = false;
    const saldirgan = (T.dusman && !(T.karanlikta && v.isik > 0.5 && !v.ofkeli)) || (T.notr && v.ofkeli);
    if (T.koylu) {
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
    if (saldirgan && !ctx.oyuncuOlu && yatay < (T.gorus || 20) && Math.abs(dy) < 10) {
      kovaliyor = true;
      if (yatay > 0.01) { yx = dx / yatay; yz = dz / yatay; }
      hiz = yatay > 0.7 ? T.kosu : 0;
      if (T.uzak) {
        /* Okçu: uygun mesafede durur, görüş varsa ok atar */
        const gor = this.gorusVar(p.x, p.y + 1.6, p.z, op.x, op.y + 1.4, op.z);
        if (yatay < 6) { yx = -yx; yz = -yz; hiz = T.hiz * 1.4; }
        else if (yatay < 13 && gor) hiz = 0;
        if (gor && yatay < T.menzil && v.saldiriBek <= 0) { v.saldiriBek = 1.6 + Math.random() * 1.2; this.mobOkAt(v, ctx); }
        v.nisan = gor && yatay < T.menzil;
      } else {
        const temas = yatay < T.menzil + T.gen + 0.3 && op.y < p.y + T.boy && op.y + 1.8 > p.y;
        if (temas && v.saldiriBek <= 0) { v.saldiriBek = 1.0; ctx.oyuncuyaVur(T.hasar, v); }
        /* Örümcek atılır */
        if (T.agu && v.yerde && yatay > 1.6 && yatay < 4 && v.saldiriBek < 0.4 && Math.random() < dt * 3) { v.hiz.y = 5.8; v.hiz.x = yx * 7; v.hiz.z = yz * 7; }
      }
    } else if (v.kacZaman > 0 && v.kacKaynak) {
      const ax = p.x - v.kacKaynak.x, az = p.z - v.kacKaynak.z, l = Math.hypot(ax, az) || 1;
      yx = ax / l; yz = az / l; hiz = T.kosu;
      if (v.karar <= 0) { v.karar = 0.6; const s = (Math.random() - 0.5) * 1.2; const c = Math.cos(s), sn = Math.sin(s); [yx, yz] = [yx * c - yz * sn, yx * sn + yz * c]; v.kacYon = [yx, yz]; }
      if (v.kacYon) [yx, yz] = v.kacYon;
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
    /* Yön ve hız */
    if (hiz > 0) v.hedefYaw = Math.atan2(-yx, -yz);
    else if (kovaliyor) v.hedefYaw = Math.atan2(-dx, -dz);
    let fark = v.hedefYaw - v.yaw;
    fark = Math.atan2(Math.sin(fark), Math.cos(fark));
    v.yaw += fark * Math.min(1, dt * 8);
    const k = Math.min(1, (v.yerde ? 10 : 3) * dt);
    if (v.hasarZaman <= 0.25) { v.hiz.x += (yx * hiz - v.hiz.x) * k; v.hiz.z += (yz * hiz - v.hiz.z) * k; }
    /* Örümcek duvara tırmanır */
    if (T.tirmanir && v.engel && hiz > 0) v.hiz.y = Math.max(v.hiz.y, 3.2);
    /* Zıplama */
    if (v.yerde && hiz > 0 && v.engel && !this.carpisiyor(v, p.x, p.y + 1.1, p.z)) v.hiz.y = 8.2;
    if (T.ziplar && v.yerde && hiz > 0) { v.zipSayac -= dt; if (v.zipSayac <= 0) { v.zipSayac = 0.45; v.hiz.y = 5.5; } }
    if (v.lavda) { v.hiz.y = Math.min(v.hiz.y + 14 * dt, 1.2); v.hiz.x *= 0.85; v.hiz.z *= 0.85; v.lavSayac = (v.lavSayac || 0) - dt; if (v.lavSayac <= 0) { v.lavSayac = 0.5; this.hasarVer(v, 4, null, { sessiz: true }); } }
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
      v.yaniyor = T.gunesteYanar && acik && ctx.gunIsigi > 0.55 && !v.suda;
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

  /* Model ve canlandırma (sunucu ve ayna ortak) */
  canlandir(v, dt, dx, dy, dz, kovaliyor, yh = Math.hypot(v.hiz.x, v.hiz.z)) {
    const T = v.tur, m = v.m, p = v.konum;
    v.faz += yh * dt * 5.5;
    const sal = Math.sin(v.faz) * Math.min(0.8, yh * 0.35);
    const B = m.bacaklar;
    if (B.length === 8) { for (let i = 0; i < 8; i++) B[i].rotation.y = B[i].userData.tabanY + Math.sin(v.faz * 1.6 + i * 1.7) * Math.min(0.35, yh * 0.12); }
    else if (B.length === 4) { B[0].rotation.x = sal; B[3].rotation.x = sal; B[1].rotation.x = -sal; B[2].rotation.x = -sal; }
    else if (B.length === 2) { B[0].rotation.x = sal; B[1].rotation.x = -sal; }
    if (T.uzak) { const h = v.nisan ? Math.PI / 2 * 0.95 : 0; m.kollar[0].rotation.x += (h - sal * 0.6 - m.kollar[0].rotation.x) * Math.min(1, dt * 8); m.kollar[1].rotation.x += (h + sal * 0.6 - m.kollar[1].rotation.x) * Math.min(1, dt * 8); }
    else if (m.insan) { m.kollar[0].rotation.x = -sal * 0.8; m.kollar[1].rotation.x = sal * 0.8; }
    else if (m.kollar.length && !T.uzak) { const t = performance.now() / 1000; m.kollar[0].rotation.x = Math.PI / 2 * 0.92 + Math.sin(t * 2 + v.id) * 0.06 - sal * 0.2; m.kollar[1].rotation.x = Math.PI / 2 * 0.92 - Math.sin(t * 2 + v.id) * 0.06 + sal * 0.2; }
    if (m.kanatlar.length) { const c = !v.yerde || v.kacZaman > 0 ? Math.sin(performance.now() / 50) * 0.6 + 0.6 : 0; m.kanatlar[0].rotation.z = -c; m.kanatlar[1].rotation.z = c; }
    if (m.kuyruk) m.kuyruk.rotation.x = -0.3 + Math.sin(performance.now() / 300 + v.id) * 0.15;
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
    const c = m.malzeme.color;
    if (v.hasarZaman > 0) c.setRGB(1, 0.35, 0.35);
    else if (v.yaniyor) c.setRGB(1, 0.7 + Math.sin(performance.now() / 60) * 0.1, 0.45);
    else c.setRGB(1, 1, 1);
    c.multiplyScalar(v.isik);
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
      if (T.dusman && ctx.oyuncuSuda && !ctx.oyuncuOlu && dd < T.gorus) {
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
    const c = m.malzeme.color;
    if (v.hasarZaman > 0) c.setRGB(1, 0.35, 0.35); else c.setRGB(1, 1, 1);
    c.multiplyScalar(v.isik);
  }

  /* Eksen eksen hareket ve çarpışma */
  hareket(v, dt) {
    const p = v.konum, h = v.hiz;
    const adim = Math.max(1, Math.ceil(Math.max(Math.abs(h.x), Math.abs(h.y), Math.abs(h.z)) * dt / 0.35));
    const s = dt / adim;
    let yerde = false; v.engel = false;
    for (let i = 0; i < adim; i++) {
      let ny = p.y + h.y * s;
      if (this.carpisiyor(v, p.x, ny, p.z)) { if (h.y < 0) { ny = Math.floor(ny) + 1; yerde = true; } else ny = Math.floor(ny + v.tur.boy) - v.tur.boy - 1e-4; if (this.carpisiyor(v, p.x, ny, p.z)) ny = p.y; h.y = 0; }
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
    v.can -= n;
    v.hasarZaman = 0.45;
    if (kaynak) {
      const ax = v.konum.x - kaynak.x, az = v.konum.z - kaynak.z, l = Math.hypot(ax, az) || 1;
      const itme = o.itme ?? 1;
      v.hiz.x = ax / l * 7 * itme; v.hiz.z = az / l * 7 * itme; if (v.yerde || v.suda) v.hiz.y = 5.5 * itme;
      if (!v.tur.dusman) { v.kacZaman = 6; v.kacKaynak = { x: kaynak.x, z: kaynak.z }; v.karar = 0; v.kacYon = null; }
      if (v.tur.notr) for (const w of this.liste) if (w.turAd === v.turAd && w.konum.distanceToSquared(v.konum) < 400) w.ofkeli = true;
    }
    if (o.oyuncu) { if (!o.vuran) { this.sonVurulan = v; this.sonVurulanZaman = 3; } if (this.olaylar.vurus) this.olaylar.vurus(v, o.vuran); }
    const sk = this.sesK(v.konum);
    if (v.can <= 0) {
      v.olu = true; v.olumZaman = 0;
      if (o.oyuncu && this.olaylar.olum) this.olaylar.olum(v, o.vuran);
      if (sk > 0) this.ses.canli(v.tur.ses, 'olum', sk);
      if (!o.dusurme) for (const [id, adet] of v.tur.dusur(Math.random)) if (adet > 0) this.dusenler.birak(id, adet, v.konum.x, v.konum.y + 0.4, v.konum.z);
      return true;
    }
    if (sk > 0) this.ses.canli(v.tur.ses, 'acima', sk);
    return true;
  }

  /* Bakılan canlı (AABB ışın testi) */
  isin(o, d, maks) {
    let en = null, enT = maks;
    for (const v of this.liste) {
      if (v.olu) continue;
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
    for (const y of this.dunya.yuvalar.values()) {
      let d2 = Infinity;
      for (const c of C) { const op = c.oyuncu.konum; d2 = Math.min(d2, (y.x + 0.5 - op.x) ** 2 + (y.y - op.y) ** 2 + (y.z + 0.5 - op.z) ** 2); }
      if (d2 > 18 * 18) continue;
      y.sayac -= dt;
      if (y.sayac > 0) continue;
      y.sayac = 8 + Math.random() * 10;
      if (this.mesaleYakin(y.x + 0.5, y.y, y.z + 0.5, 6)) continue;
      if (!y.tur) { const zd = zindanAt(this.uretici, y.x, y.y, y.z); y.tur = zd ? zd.tur : YUVA_TURLERI[Math.floor(karma3(7, y.x, y.y, y.z) * 3)]; }
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
  okAt(p, hiz, hasar, dusman = false, sahip = null) {
    if (this.ayna) { if (this.ag) this.ag.okAt(p, hiz, hasar); return null; }
    const mesh = okModeli();
    mesh.position.copy(p);
    this.grup.add(mesh);
    const o = { p: p.clone(), v: hiz.clone(), hasar, yas: 0, saplandi: false, mesh, dusman, sahip, ni: ++this.okSira };
    this.oklar.push(o);
    if (this.ag && this.ag.okEklendi) this.ag.okEklendi(o);
    return o;
  }
  /* İskeletin oyuncuya ok atışı: yer çekimine göre biraz yukarı nişan alınır */
  mobOkAt(v, ctx) {
    const op = ctx.oyuncu.konum;
    const p = new THREE.Vector3(v.konum.x, v.konum.y + 1.5, v.konum.z);
    const h = new THREE.Vector3(op.x - p.x, op.y + 1.2 - p.y, op.z - p.z);
    const d = h.length(), hizB = 22, t = d / hizB;
    h.y += 0.5 * 18 * t * t;
    h.x += (Math.random() - 0.5) * d * 0.06; h.z += (Math.random() - 0.5) * d * 0.06;
    h.normalize().multiplyScalar(hizB);
    p.addScaledVector(h.clone().normalize(), 0.6);
    this.okAt(p, h, v.tur.hasar, v);
    if (this.sesK(p) > 0.3) this.ses.yayAt();
  }
  okGuncelle(dt, C) {
    const ctx = C[0];
    for (let i = this.oklar.length - 1; i >= 0; i--) {
      const o = this.oklar[i];
      o.yas += dt;
      let sil = o.yas > 60;
      if (!o.saplandi) {
        o.v.y -= 18 * dt; o.v.multiplyScalar(1 - 0.15 * dt);
        if (SIVI[this.dunya.blok(Math.floor(o.p.x), Math.floor(o.p.y), Math.floor(o.p.z))]) o.v.multiplyScalar(1 - 3 * dt);
        const adim = Math.max(1, Math.ceil(o.v.length() * dt / 0.2));
        const s = dt / adim;
        for (let k = 0; k < adim && !o.saplandi && !sil; k++) {
          const yeni = o.p.clone().addScaledVector(o.v, s);
          /* Canlıya isabet */
          const yon = o.v.clone().normalize();
          /* Canavar okları yalnızca oyunculara isabet eder (aynada isabeti sunucu hesaplar) */
          if (o.dusman && !this.ayna) {
            const q = yeni, g = 0.35;
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
            this.hasarVer(vur.v, Math.max(1, Math.round(o.hasar * Math.min(1.2, guc + 0.2))), o.p.clone().addScaledVector(yon, -1), { itme: 0.6, oyuncu: true, vuran: o.sahip });
            if (this.sesK(o.p) > 0.3) this.ses.okIsabet();
            sil = true; break;
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
      o.mesh.material.color.setScalar(ctx.isik);
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
        v = this.ekle(meta[0], a[1], a[2], a[3], { meslek: meta[1] || undefined });
        v.id = id; v.yaw = a[4]; v.hedefYaw = a[4]; v.hedefP = new THREE.Vector3(a[1], a[2], a[3]); v.agBayrak = 0; v.aynaHiz = 0;
        if (v.tur.koylu && koyluCoz) koyluCoz(v, meta);
        this.harita.set(id, v);
      }
      v.hedefP.set(a[1], a[2], a[3]); v.hedefYaw = a[4];
      const b = a[5], once = v.agBayrak;
      v.agBayrak = b; v.can = a[6];
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
    for (const v of this.liste) {
      const T = v.tur, p = v.konum, m = v.m;
      v.agHasar = (v.agHasar || 0) - dt;
      if (v.olu) {
        v.olumZaman += dt;
        m.kok.rotation.z = Math.min(1, v.olumZaman / 0.35) * Math.PI / 2;
        m.malzeme.color.setRGB(1, 0.3, 0.3).multiplyScalar(v.isik);
        continue;
      }
      const ox = p.x, oy = p.y, oz = p.z, h = v.hedefP;
      if (p.distanceToSquared(h) > 100) p.copy(h); else p.lerp(h, Math.min(1, dt * 10));
      const id = 1 / Math.max(dt, 1e-3);
      v.hiz.set((p.x - ox) * id, (p.y - oy) * id, (p.z - oz) * id);
      v.aynaHiz += (Math.hypot(v.hiz.x, v.hiz.z) - v.aynaHiz) * Math.min(1, dt * 8);
      const b = v.agBayrak;
      v.yaniyor = !!(b & 4); v.nisan = !!(b & 8); v.hasarZaman = b & 2 ? 0.2 : 0; v.kacZaman = b & 32 ? 1 : 0; v.yerde = !(b & 32);
      m.kok.visible = !(b & 16);
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
  aynaOk(ni, p, v, dusman) {
    const mesh = okModeli();
    mesh.position.set(p[0], p[1], p[2]);
    this.grup.add(mesh);
    this.oklar.push({ p: new THREE.Vector3(p[0], p[1], p[2]), v: new THREE.Vector3(v[0], v[1], v[2]), hasar: 0, yas: 0, saplandi: false, mesh, dusman: !!dusman, ni });
  }
  aynaOkSil(ni) { const i = this.oklar.findIndex(o => o.ni === ni); if (i >= 0) this.okSil(i); }
}
