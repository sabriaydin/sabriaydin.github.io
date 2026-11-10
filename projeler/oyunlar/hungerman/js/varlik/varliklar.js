/* HungerMan - canlılar yöneticisi: doğma, kaybolma, yapay zekâ, fizik, hasar, oklar
   Çok oyunculu aşamada bu yönetici sunucu olan oyuncuda çalışacak; diğer oyunculara konumlar gönderilecek. */
import { THREE } from '../grafik/sahne.js';
import { MODELLER, okModeli } from './modeller.js';
import { TURLER, HAYVANLAR } from './turler.js';
import { KATI, SIVI, KESIK, BITKI } from '../bloklar.js';
import { PY } from '../sabitler.js';

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
  }

  temizle() {
    for (const v of this.liste) this.modelSil(v);
    for (const o of this.oklar) { this.grup.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose(); }
    this.liste = []; this.oklar = [];
    this.sahne.sahne.remove(this.grup);
  }
  modelSil(v) { this.grup.remove(v.m.kok); v.m.kok.traverse(n => { if (n.geometry) n.geometry.dispose(); }); v.m.malzeme.dispose(); }

  ekle(turAd, x, y, z) {
    const tur = TURLER[turAd];
    const m = MODELLER[tur.model]();
    const v = {
      id: SIRA++, turAd, tur, m, konum: new THREE.Vector3(x, y, z), hiz: new THREE.Vector3(), yaw: Math.random() * Math.PI * 2, hedefYaw: 0,
      can: tur.can, yerde: false, suda: false, engel: false, karar: Math.random() * 2, hedef: null, kacZaman: 0, kacKaynak: null,
      hasarZaman: 0, saldiriBek: 0, ofkeli: false, olu: false, olumZaman: 0, faz: 0, sesZaman: 3 + Math.random() * 10,
      isik: 1, isikSayac: 0, yaniyor: false, yanmaSayac: 0, zipSayac: 0, sikisma: 0
    };
    m.kok.position.copy(v.konum);
    if (m.kollar.length) for (const k of m.kollar) k.rotation.x = Math.PI / 2 * 0.92;
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
    for (const v of this.liste) { if (v.olu) continue; if (v.tur.dusman) zombi++; else hayvan++; }
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
        this.ekle('zombi', x + 0.5, y, z + 0.5);
        break;
      }
    }
  }

  /* ---------- Güncelleme ---------- */
  guncelle(dt, ctx) {
    const op = ctx.oyuncu.konum;
    this.dogurSayac -= dt;
    if (this.dogurSayac <= 0) { this.dogurSayac = 1.2; this.dogur(ctx); }
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const v = this.liste[i];
      const d2 = (v.konum.x - op.x) ** 2 + (v.konum.z - op.z) ** 2;
      const uzak = v.tur.dusman ? ZOMBI_UZAK : HAYVAN_UZAK;
      if (d2 > uzak * uzak || (v.olu && v.olumZaman > 0.9)) {
        if (v.olu) this.dusenler.renkliParcacik([0.85, 0.85, 0.85], v.konum.x, v.konum.y + v.tur.boy * 0.5, v.konum.z, 16);
        this.modelSil(v); this.liste.splice(i, 1);
        continue;
      }
      if (!this.dunya.yuklu(v.konum.x, v.konum.z)) continue;
      this.varlikGuncelle(v, dt, ctx);
    }
    this.ayir();
    this.okGuncelle(dt, ctx);
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
    const dx = op.x - p.x, dz = op.z - p.z, dy = op.y - p.y;
    const yatay = Math.hypot(dx, dz);
    let yx = 0, yz = 0, hiz = 0, kovaliyor = false;
    const saldirgan = T.dusman || (T.notr && v.ofkeli);
    if (saldirgan && !ctx.oyuncuOlu && yatay < (T.gorus || 20) && Math.abs(dy) < 10) {
      kovaliyor = true;
      if (yatay > 0.01) { yx = dx / yatay; yz = dz / yatay; }
      hiz = yatay > 0.7 ? T.kosu : 0;
      const temas = yatay < T.menzil + T.gen + 0.3 && op.y < p.y + T.boy && op.y + 1.8 > p.y;
      if (temas && v.saldiriBek <= 0) { v.saldiriBek = 1.0; ctx.oyuncuyaVur(T.hasar, v); }
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
    /* Zıplama */
    if (v.yerde && hiz > 0 && v.engel && !this.carpisiyor(v, p.x, p.y + 1.1, p.z)) v.hiz.y = 8.2;
    if (T.ziplar && v.yerde && hiz > 0) { v.zipSayac -= dt; if (v.zipSayac <= 0) { v.zipSayac = 0.45; v.hiz.y = 5.5; } }
    if (v.suda) { v.hiz.y = Math.min(v.hiz.y + 26 * dt, 2.2); }
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
      const d = Math.hypot(dx, dy, dz);
      if (d < 22) this.ses.canli(T.ses, 'normal', 1 - d / 24);
    }

    /* Model ve canlandırma */
    const yh = Math.hypot(v.hiz.x, v.hiz.z);
    v.faz += yh * dt * 5.5;
    const sal = Math.sin(v.faz) * Math.min(0.8, yh * 0.35);
    const B = m.bacaklar;
    if (B.length === 4) { B[0].rotation.x = sal; B[3].rotation.x = sal; B[1].rotation.x = -sal; B[2].rotation.x = -sal; }
    else if (B.length === 2) { B[0].rotation.x = sal; B[1].rotation.x = -sal; }
    if (m.kollar.length) { const t = performance.now() / 1000; m.kollar[0].rotation.x = Math.PI / 2 * 0.92 + Math.sin(t * 2 + v.id) * 0.06 - sal * 0.2; m.kollar[1].rotation.x = Math.PI / 2 * 0.92 - Math.sin(t * 2 + v.id) * 0.06 + sal * 0.2; }
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
    v.suda = !!SIVI[this.dunya.blok(Math.floor(p.x), Math.floor(p.y + v.tur.boy * 0.4), Math.floor(p.z))];
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
  hasarVer(v, n, kaynak, o = {}) {
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
    if (o.oyuncu) { this.sonVurulan = v; this.sonVurulanZaman = 3; }
    if (v.can <= 0) {
      v.olu = true; v.olumZaman = 0;
      this.ses.canli(v.tur.ses, 'olum', 1);
      if (!o.dusurme) for (const [id, adet] of v.tur.dusur(Math.random)) if (adet > 0) this.dusenler.birak(id, adet, v.konum.x, v.konum.y + 0.4, v.konum.z);
      return true;
    }
    this.ses.canli(v.tur.ses, 'acima', 1);
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

  /* ---------- Oklar ---------- */
  okAt(p, hiz, hasar) {
    const mesh = okModeli();
    mesh.position.copy(p);
    this.grup.add(mesh);
    this.oklar.push({ p: p.clone(), v: hiz.clone(), hasar, yas: 0, saplandi: false, mesh });
  }
  okGuncelle(dt, ctx) {
    const op = ctx.oyuncu.konum;
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
          const vur = this.isin(o.p, yon, o.v.length() * s + 0.1);
          if (vur) {
            const guc = o.v.length() / 30;
            this.hasarVer(vur.v, Math.max(1, Math.round(o.hasar * Math.min(1.2, guc + 0.2))), o.p.clone().addScaledVector(yon, -1), { itme: 0.6, oyuncu: true });
            this.ses.okIsabet();
            sil = true; break;
          }
          if (this.dunya.kati(Math.floor(yeni.x), Math.floor(yeni.y), Math.floor(yeni.z))) { o.saplandi = true; o.blok = [Math.floor(yeni.x), Math.floor(yeni.y), Math.floor(yeni.z)]; o.p.lerp(yeni, 0.5); o.v.set(0, 0, 0); this.ses.okSaplandi(); break; }
          o.p.copy(yeni);
        }
        if (!o.saplandi && o.v.lengthSq() > 0.01) o.mesh.lookAt(o.mesh.position.clone().sub(o.v));
      } else {
        /* Saplanan ok geri toplanabilir */
        if (o.p.distanceToSquared(new THREE.Vector3(op.x, op.y + 0.9, op.z)) < 1.6 && o.yas > 0.5) {
          if (ctx.okTopla()) sil = true;
        }
        /* Saplandığı blok kırılırsa ok düşer */
        if (o.blok && !this.dunya.kati(o.blok[0], o.blok[1], o.blok[2])) { o.saplandi = false; o.blok = null; o.v.set(0, -1, 0); }
      }
      o.mesh.position.copy(o.p);
      o.mesh.material.color.setScalar(ctx.isik);
      if (sil) { this.grup.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose(); this.oklar.splice(i, 1); }
    }
  }
}
