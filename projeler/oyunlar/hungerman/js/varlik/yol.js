/* HungerMan - 0.44.0: canlılar için yol bulma (A*)
   Hücre ızgarasında ayak hücreleri üzerinde arama yapılır. Bir hücrede durulabilmesi için gövdenin sığması (kapı, çit, cam gibi biçimli
   bloklar dahil çarpışma kutularıyla denetlenir) ve altında zemin ya da suyun bulunması gerekir. Komşu hücreye düz, bir basamak
   yukarı ya da en çok üç basamak aşağı geçilir; lav geçilmez, su pahalıdır. Hedefe ulaşılamazsa hedefe en çok yaklaşan
   noktaya giden yol döner (canlı en azından o yöne gider). Arama sınırlıdır: en çok DUGUM hücre açılır. */
import { cakisma } from '../sekiller.js';
import { SIVI, LAV } from '../bloklar.js';

const DUGUM = 520, YARICAP = 30;
const YON = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* İkili yığın (en küçük f önce) */
class Yigin {
  constructor() { this.a = []; }
  get bos() { return !this.a.length; }
  ekle(d) {
    const a = this.a; a.push(d); let i = a.length - 1;
    while (i > 0) { const u = (i - 1) >> 1; if (a[u].f <= a[i].f) break; [a[u], a[i]] = [a[i], a[u]]; i = u; }
  }
  al() {
    const a = this.a, en = a[0], son = a.pop();
    if (a.length) {
      a[0] = son; let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let k = i; if (l < a.length && a[l].f < a[k].f) k = l; if (r < a.length && a[r].f < a[k].f) k = r; if (k === i) break; [a[k], a[i]] = [a[i], a[k]]; i = k; }
    }
    return en;
  }
}

export class YolBulucu {
  constructor(dunya) { this.d = dunya; this.onbellek = new Map(); this.onbellekKare = -1; }
  /* Hücre bilgisi bir kare boyunca saklanır (aynı karede birçok canlı arama yapabilir) */
  temizle(kare) { if (kare !== this.onbellekKare) { this.onbellek.clear(); this.onbellekKare = kare; } }
  bos(x, y, z, boy) {
    const k = `${x},${y},${z},${boy}`;
    let r = this.onbellek.get(k);
    if (r === undefined) {
      const d = this.d, id = d.blok(x, y, z), id2 = d.blok(x, y + 1, z);
      r = !LAV[id] && !LAV[id2] && !cakisma(d, x + 0.2, y + 0.02, z + 0.2, x + 0.8, y + boy - 0.02, z + 0.8);
      this.onbellek.set(k, r);
    }
    return r;
  }
  /* Durulabilir hücre: gövde sığar ve altında zemin (ya da hücrede su) var. 0: olmaz, 1: kara, 2: su */
  dur(x, y, z, boy) {
    if (!this.bos(x, y, z, boy)) return 0;
    const d = this.d, id = d.blok(x, y, z);
    if (SIVI[id] && !LAV[id]) return 2;
    const u = cakisma(d, x + 0.3, y - 0.55, z + 0.3, x + 0.7, y - 0.001, z + 0.7, 1);
    return u != null && u >= y - 0.55 ? 1 : 0;
  }
  /* s: başlangıç, t: hedef (dünya koordinatı); boy: canlının boyu (blok). Dönen: [[x, y, z], ...] hücre listesi ya da null */
  bul(sx, sy, sz, tx, ty, tz, boy = 2, enFazla = DUGUM) {
    const B = Math.max(1, Math.ceil(boy - 0.05));
    let x0 = Math.floor(sx), y0 = Math.floor(sy + 0.05), z0 = Math.floor(sz);
    if (!this.dur(x0, y0, z0, B)) { if (this.dur(x0, y0 + 1, z0, B)) y0++; else if (!this.d.yuklu(x0, z0)) return null; }
    const hx = Math.floor(tx), hy = Math.floor(ty + 0.05), hz = Math.floor(tz);
    const anahtar = (x, y, z) => ((x - x0 + 512) * 1024 + (z - z0 + 512)) * 512 + (y & 511);
    const h = (x, y, z) => Math.abs(x - hx) + Math.abs(z - hz) + Math.abs(y - hy) * 1.5;
    const acik = new Yigin(), g = new Map(), ata = new Map();
    const k0 = anahtar(x0, y0, z0);
    g.set(k0, 0); acik.ekle({ x: x0, y: y0, z: z0, k: k0, f: h(x0, y0, z0) });
    let en = { x: x0, y: y0, z: z0, k: k0, hh: h(x0, y0, z0) }, n = 0;
    while (!acik.bos && n < enFazla) {
      const c = acik.al();
      const gc = g.get(c.k);
      if (c.f - h(c.x, c.y, c.z) > gc + 1e-6) continue;   // eski kayıt
      n++;
      const hh = h(c.x, c.y, c.z);
      if (hh < en.hh) en = { x: c.x, y: c.y, z: c.z, k: c.k, hh };
      if (c.x === hx && c.z === hz && Math.abs(c.y - hy) <= 1) { en = c; break; }
      const suda = SIVI[this.d.blok(c.x, c.y, c.z)];
      for (const [ax, az] of YON) {
        const nx = c.x + ax, nz = c.z + az;
        if (Math.abs(nx - x0) > YARICAP || Math.abs(nz - z0) > YARICAP || !this.d.yuklu(nx, nz)) continue;
        /* düz, bir yukarı (başın üstü boşsa), en çok üç aşağı */
        const adaylar = [];
        let t = this.dur(nx, c.y, nz, B);
        if (t) adaylar.push([c.y, t, 0]);
        else {
          if (this.bos(c.x, c.y + 1, c.z, B) && (t = this.dur(nx, c.y + 1, nz, B))) adaylar.push([c.y + 1, t, 0.5]);
          if (this.bos(nx, c.y, nz, B)) for (let k = 1; k <= 3; k++) { if (!this.bos(nx, c.y - k, nz, 1)) break; if ((t = this.dur(nx, c.y - k, nz, B))) { adaylar.push([c.y - k, t, 0.2 * k]); break; } }
        }
        /* suda yukarı-aşağı yüzülebilir */
        if (suda) { if ((t = this.dur(c.x, c.y + 1, c.z, B)) === 2 && !adaylar.length) adaylar.push([c.y + 1, t, 0.5]); }
        for (const [ny, tur, ek] of adaylar) {
          const k = anahtar(nx, ny, nz), yeni = gc + 1 + ek + (tur === 2 ? 1.5 : 0);
          if (yeni < (g.get(k) ?? Infinity)) { g.set(k, yeni); ata.set(k, c.k); acik.ekle({ x: nx, y: ny, z: nz, k, f: yeni + h(nx, ny, nz) }); }
        }
      }
      if (suda) {
        for (const dy of [1, -1]) {
          const ny = c.y + dy; if (!this.dur(c.x, ny, c.z, B)) continue;
          const k = anahtar(c.x, ny, c.z), yeni = gc + 2;
          if (yeni < (g.get(k) ?? Infinity)) { g.set(k, yeni); ata.set(k, c.k); acik.ekle({ x: c.x, y: ny, z: c.z, k, f: yeni + h(c.x, ny, c.z) }); }
        }
      }
    }
    if (en.k === k0) return null;
    /* Yol: hedeften başa doğru izlenir */
    const yol = [];
    const coz = k => { const y = k % 512, r = (k - y) / 512, z = r % 1024 - 512 + z0, x = (r - (r % 1024)) / 1024 - 512 + x0; return [x, y, z]; };
    let k = en.k;
    while (k !== undefined && k !== k0) { yol.push(coz(k)); k = ata.get(k); }
    yol.reverse();
    return yol;
  }
}
