/* HungerMan - biçimli bloklar: merdiven, yarım blok, kapı, tuzak kapı, çit, çit kapısı, cam bölme, tırmanma merdiveni, tarla, örs, simya masası
   Her blok, hücre içinde 0..1 aralığında kutulardan oluşur: [x0, y0, z0, x1, y1, z1, doku?].
   Aynı tanımlar meshleme (işçi), çarpışma (oyuncu ve canlılar), ışın izleme ve seçim kutusu için kullanılır. */
import { BLOKLAR, OPAK, CIZIM, C_KUP, C_SEKIL, KATI, T } from './bloklar.js';

const P = 1 / 16;
/* Yönler: 0 kuzey (-z), 1 doğu (+x), 2 güney (+z), 3 batı (-x) */
export const YONLER = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const SEKIL = new Uint8Array(256);
for (const b of BLOKLAR) if (b && b.cizim === C_SEKIL) SEKIL[b.id] = 1;

/* Hücrenin bir kenarına yaslanan ince panel */
function panel(f, k, y0 = 0, y1 = 1) {
  switch (f) {
    case 0: return [0, y0, 0, 1, y1, k];
    case 1: return [1 - k, y0, 0, 1, y1, 1];
    case 2: return [0, y0, 1 - k, 1, y1, 1];
    default: return [0, y0, 0, k, y1, 1];
  }
}

const CIT_AILE = id => id === 104 || (id >= 105 && id <= 108);
const BOLME_AILE = id => id === 109 || id === 34 || id === 182 || id === 188;
/* Çit ve cam bölme komşuya bağlanır mı */
function baglanir(id, n, f) {
  if (!n) return false;
  if (OPAK[n] && CIZIM[n] === C_KUP) return true;
  if (id === 177) return n === 177;
  if (id === 104) {
    if (n === 104) return true;
    /* Çit kapısı yalnızca kendi doğrultusundaki çitlere bağlanır */
    if (n >= 105 && n <= 108) return BLOKLAR[n].eksen === (f === 1 || f === 3 ? 0 : 1);
    return false;
  }
  return BOLME_AILE(n);
}

/* komsu(f): yatay komşu blok (f: 0..3); carp: çarpışma kutuları (çitler 1,5 blok yüksekliğindedir) */
/* 0.16.0: kuzeye (yon 0) göre tanımlanan kutuları blok merkezi çevresinde döndürür */
function dondur(l, f) {
  if (!f) return l;
  const n = ([x, z]) => (f === 1 ? [1 - z, x] : f === 2 ? [1 - x, 1 - z] : [z, 1 - x]);
  return l.map(k => {
    const [ax, az] = n([k[0], k[2]]), [bx, bz] = n([k[3], k[5]]);
    return [Math.min(ax, bx), k[1], Math.min(az, bz), Math.max(ax, bx), k[4], Math.max(az, bz), ...k.slice(6)];
  });
}
export function sekilKutulari(id, komsu, carp = false) {
  const b = BLOKLAR[id];
  if (!b) return [];
  switch (b.sekil) {
    case 'merdiven': {
      const ust = [[0, 0.5, 0, 1, 1, 0.5], [0.5, 0.5, 0, 1, 1, 1], [0, 0.5, 0.5, 1, 1, 1], [0, 0.5, 0, 0.5, 1, 1]][b.yon];
      return [[0, 0, 0, 1, 0.5, 1], ust];
    }
    case 'yarim': return [b.ust ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
    case 'kapi': return [panel(b.acik ? (b.yon + 1) % 4 : b.yon, 3 * P)];
    case 'tuzak': return [b.acik ? panel(b.yon, 3 * P) : [0, 0, 0, 1, 3 * P, 1]];
    case 'tirmanma': return [panel(b.yon, carp ? 3 * P : P)];
    case 'tarla': return [[0, 0, 0, 1, 15 * P, 1]];
    case 'karKatman': return [[0, 0, 0, 1, 2 * P, 1]];
    case 'fener': return [[5 * P, 0, 5 * P, 11 * P, 8 * P, 11 * P], [6 * P, 8 * P, 6 * P, 10 * P, 9 * P, 10 * P, T.demir_cubuk], [7 * P, 9 * P, 7.5 * P, 9 * P, 13 * P, 8.5 * P, T.demir_cubuk]];
    case 'tel': return carp ? [] : [[0, P, 7 * P, 1, 1.6 * P, 9 * P], [7 * P, P, 0, 9 * P, 1.6 * P, 1]];
    case 'nilufer': return carp ? [] : [[P, 0, P, 15 * P, 0.5 * P, 15 * P]];
    /* Sandık: gövde ve kapak (dokuda kapak çizgisi), önde demir kilit */
    case 'sandik': return carp ? [[P, 0, P, 15 * P, 14 * P, 15 * P]] : [[P, 0, P, 15 * P, 14 * P, 15 * P], [7 * P, 7 * P, 15 * P, 9 * P, 11 * P, 16 * P, T.demir_cubuk]];
    case 'cit': {
      const l = [], h = carp ? 1.5 : 1;
      l.push([6 * P, 0, 6 * P, 10 * P, h, 10 * P]);
      for (let f = 0; f < 4; f++) {
        if (!baglanir(id, komsu(f), f)) continue;
        if (carp) { l.push(f === 0 ? [6 * P, 0, 0, 10 * P, h, 6 * P] : f === 1 ? [10 * P, 0, 6 * P, 1, h, 10 * P] : f === 2 ? [6 * P, 0, 10 * P, 10 * P, h, 1] : [0, 0, 6 * P, 6 * P, h, 10 * P]); continue; }
        for (const [y0, y1] of [[6 * P, 9 * P], [12 * P, 15 * P]]) {
          l.push(f === 0 ? [7 * P, y0, 0, 9 * P, y1, 6 * P] : f === 1 ? [10 * P, y0, 7 * P, 1, y1, 9 * P] : f === 2 ? [7 * P, y0, 10 * P, 9 * P, y1, 1] : [0, y0, 7 * P, 6 * P, y1, 9 * P]);
        }
      }
      return l;
    }
    /* 0.16.0: mobilyalar (yon: arkalığın / duvarın bulunduğu taraf) */
    case 'sandalye': {
      if (carp) return dondur([[P, 0, P, 15 * P, 9 * P, 15 * P], [P, 0, P, 15 * P, 1, 4 * P]], b.yon);
      return dondur([
        [2 * P, 0, 2 * P, 4 * P, 7 * P, 4 * P], [12 * P, 0, 2 * P, 14 * P, 7 * P, 4 * P], [2 * P, 0, 12 * P, 4 * P, 7 * P, 14 * P], [12 * P, 0, 12 * P, 14 * P, 7 * P, 14 * P],
        [P, 7 * P, P, 15 * P, 9 * P, 15 * P],
        [2 * P, 9 * P, 2 * P, 4 * P, 1, 4 * P], [12 * P, 9 * P, 2 * P, 14 * P, 1, 4 * P],
        [4 * P, 13 * P, 2.5 * P, 12 * P, 15 * P, 3.5 * P], [4 * P, 10 * P, 2.5 * P, 12 * P, 11.5 * P, 3.5 * P]
      ], b.yon);
    }
    case 'masa':
      if (carp) return [[0, 0, 0, 1, 1, 1]];
      return [[0, 13 * P, 0, 1, 1, 1], [P, 0, P, 3 * P, 13 * P, 3 * P], [13 * P, 0, P, 15 * P, 13 * P, 3 * P], [P, 0, 13 * P, 3 * P, 13 * P, 15 * P], [13 * P, 0, 13 * P, 15 * P, 13 * P, 15 * P]];
    case 'koltuk': {
      if (carp) return dondur([[0, 0, 0, 1, 10 * P, 1], [0, 0, 0, 1, 1, 4 * P]], b.yon);
      const M = T.minder_k;
      return dondur([
        [P, 0, P, 3 * P, 2 * P, 3 * P], [13 * P, 0, P, 15 * P, 2 * P, 3 * P], [P, 0, 13 * P, 3 * P, 2 * P, 15 * P], [13 * P, 0, 13 * P, 15 * P, 2 * P, 15 * P],
        [0, 2 * P, 0, 1, 7 * P, 1],
        [2 * P, 7 * P, 3 * P, 14 * P, 10 * P, 15 * P, M], [2 * P, 7 * P, P, 14 * P, 18 * P, 4 * P, M],
        [0, 7 * P, 0, 2 * P, 13 * P, 1], [14 * P, 7 * P, 0, 1, 13 * P, 1], [0, 7 * P, 0, 1, 18 * P, P]
      ], b.yon);
    }
    case 'hali': return [[0, 0, 0, 1, P, 1]];
    case 'saksi': {
      if (carp) return [[5 * P, 0, 5 * P, 11 * P, 6 * P, 11 * P]];
      const Y = T.yun_y, C = T[b.cicek];
      return [[5 * P, 0, 5 * P, 11 * P, 6 * P, 11 * P], [6 * P, 6 * P, 6 * P, 10 * P, 6.4 * P, 10 * P, T.toprak],
        [7.5 * P, 6 * P, 7.5 * P, 8.5 * P, 11 * P, 8.5 * P, Y], [5.5 * P, 8 * P, 7.5 * P, 10.5 * P, 9 * P, 8.5 * P, Y],
        [6.5 * P, 11 * P, 6.5 * P, 9.5 * P, 13 * P, 9.5 * P, C], [7.25 * P, 12.5 * P, 7.25 * P, 8.75 * P, 13.5 * P, 8.75 * P, b.cicek === 'yun_s' ? T.yun_t : T.yun_s]];
    }
    case 'lamba':
      if (carp) return [[4.5 * P, 0, 4.5 * P, 11.5 * P, 12 * P, 11.5 * P]];
      return [[5 * P, 0, 5 * P, 11 * P, P, 11 * P, T.demir_cubuk], [7.5 * P, P, 7.5 * P, 8.5 * P, 7 * P, 8.5 * P, T.demir_cubuk], [4.5 * P, 7 * P, 4.5 * P, 11.5 * P, 12 * P, 11.5 * P]];
    case 'tablo': return carp ? [] : dondur([[P, P, 0, 15 * P, 15 * P, P]], b.yon);
    case 'tencere':
      if (carp) return [[2 * P, 0, 2 * P, 14 * P, 9 * P, 14 * P]];
      return [[3 * P, 0, 3 * P, 13 * P, 8 * P, 13 * P], [2 * P, 8 * P, 2 * P, 14 * P, 9 * P, 14 * P, T.tencere_ust],
        [0, 6 * P, 7 * P, 2 * P, 7 * P, 9 * P, T.demir_cubuk], [14 * P, 6 * P, 7 * P, 1, 7 * P, 9 * P, T.demir_cubuk]];
    /* 0.17.0: mekanik bloklar */
    case 'kol': {
      if (carp) return [];
      const l = [[5 * P, 0, 4 * P, 11 * P, 2 * P, 12 * P], [7 * P, 2 * P, 6 * P, 9 * P, 6 * P, 8 * P, T.kalas], [7 * P, 6 * P, 4.5 * P, 9 * P, 9 * P, 6.5 * P, T.kalas], [6.5 * P, 9 * P, 3.5 * P, 9.5 * P, 11 * P, 5.5 * P, b.acik ? T.kol_bas_a : T.kol_bas]];
      return b.acik ? dondur(l, 2) : l;
    }
    case 'dugme': return carp ? [] : [[5 * P, 0, 6 * P, 11 * P, (b.acik ? 1 : 2) * P, 10 * P]];
    case 'plaka': return carp ? [] : [[P, 0, P, 15 * P, (b.acik ? 0.5 : 1) * P, 15 * P]];
    case 'kablo': {
      if (carp) return [];
      const h = 0.6 * P, l = [[6 * P, 0, 6 * P, 10 * P, h, 10 * P]];
      for (let f = 0; f < 4; f++) {
        const n = komsu(f), nb = BLOKLAR[n];
        if (!nb || !(nb.mekanik || nb.sekil === 'kapi' || nb.sekil === 'citKapi' || nb.sekil === 'tuzak' || n === 157)) continue;
        l.push(f === 0 ? [7 * P, 0, 0, 9 * P, h, 7 * P] : f === 1 ? [9 * P, 0, 7 * P, 1, h, 9 * P] : f === 2 ? [7 * P, 0, 9 * P, 9 * P, h, 1] : [0, 0, 7 * P, 7 * P, h, 9 * P]);
      }
      return l;
    }
    case 'ters':
      if (carp) return [[0, 0, 0, 1, 2 * P, 1]];
      return dondur([[0, 0, 0, 1, 2 * P, 1], [7 * P, 2 * P, 3 * P, 9 * P, 6 * P, 5 * P, T.kalas], [6.5 * P, 6 * P, 2.5 * P, 9.5 * P, 8 * P, 5.5 * P, b.acik ? T.bakir_lamba_a : T.kol_bas], [7 * P, 2 * P, 11 * P, 9 * P, 4 * P, 13 * P, T.kalas]], b.yon);
    case 'algi': return [[0, 0, 0, 1, 6 * P, 1]];
    case 'kazik':
      /* Sivri kazık: kütük gövde, daralan uç */
      if (carp) return [[0, 0, 0, 1, 1, 1]];
      return [[0, 0, 0, 1, 10 * P, 1], [2 * P, 10 * P, 2 * P, 14 * P, 13 * P, 14 * P], [5 * P, 13 * P, 5 * P, 11 * P, 1, 11 * P]];
    case 'korkuluk': {
      /* Kum taşı korkuluk: kalın direk ve komşuya uzanan alçak duvar (çarpışma 1,5 blok) */
      const l = [], h = carp ? 1.5 : 1;
      l.push([4 * P, 0, 4 * P, 12 * P, h, 12 * P]);
      for (let f = 0; f < 4; f++) {
        if (!baglanir(id, komsu(f), f)) continue;
        const y1 = carp ? h : 13 * P;
        l.push(f === 0 ? [5 * P, 0, 0, 11 * P, y1, 4 * P] : f === 1 ? [12 * P, 0, 5 * P, 1, y1, 11 * P] : f === 2 ? [5 * P, 0, 12 * P, 11 * P, y1, 1] : [0, 0, 5 * P, 4 * P, y1, 11 * P]);
      }
      return l;
    }
    case 'citKapi': {
      /* eksen 0: kapı doğu-batı doğrultusunda durur, kuzey-güney yönünde geçiş verir */
      const r = (x0, y0, z0, x1, y1, z1) => (b.eksen === 0 ? [x0, y0, z0, x1, y1, z1] : [z0, y0, x0, z1, y1, x1]);
      if (carp) return b.acik ? [] : [r(0, 0, 6 * P, 1, 1.5, 10 * P)];
      const l = [r(0, 5 * P, 7 * P, 2 * P, 1, 9 * P), r(14 * P, 5 * P, 7 * P, 1, 1, 9 * P)];
      if (!b.acik) {
        l.push(r(2 * P, 6 * P, 7 * P, 14 * P, 9 * P, 9 * P), r(2 * P, 12 * P, 7 * P, 14 * P, 15 * P, 9 * P), r(7 * P, 9 * P, 7 * P, 9 * P, 12 * P, 9 * P));
      } else {
        /* Açık kanatlar içeri (güneye / doğuya) döner */
        l.push(r(0, 6 * P, 9 * P, 2 * P, 9 * P, 15 * P), r(0, 12 * P, 9 * P, 2 * P, 15 * P, 15 * P), r(14 * P, 6 * P, 9 * P, 1, 9 * P, 15 * P), r(14 * P, 12 * P, 9 * P, 1, 15 * P, 15 * P));
      }
      return l;
    }
    case 'bolme': {
      const l = [[7 * P, 0, 7 * P, 9 * P, 1, 9 * P]];
      const bag = [0, 1, 2, 3].map(f => baglanir(id, komsu(f), f));
      const hic = !bag.some(Boolean);
      for (let f = 0; f < 4; f++) {
        if (!bag[f] && !hic) continue;
        l.push(f === 0 ? [7 * P, 0, 0, 9 * P, 1, 7 * P] : f === 1 ? [9 * P, 0, 7 * P, 1, 1, 9 * P] : f === 2 ? [7 * P, 0, 9 * P, 9 * P, 1, 1] : [0, 0, 7 * P, 7 * P, 1, 9 * P]);
      }
      return l;
    }
    case 'ors': return [
      [2 * P, 0, 2 * P, 14 * P, 4 * P, 14 * P],
      [4 * P, 4 * P, 4 * P, 12 * P, 5 * P, 12 * P],
      [6 * P, 5 * P, 5 * P, 10 * P, 10 * P, 11 * P],
      [0, 10 * P, 3 * P, 1, 1, 13 * P]
    ];
    case 'simya': {
      const c = T.demir_cubuk, s = T.simya_sise;
      return carp ? [[P, 0, P, 15 * P, 2 * P, 15 * P], [7 * P, 2 * P, 7 * P, 9 * P, 14 * P, 9 * P]] : [
        [P, 0, P, 15 * P, 2 * P, 15 * P],
        [7 * P, 2 * P, 7 * P, 9 * P, 14 * P, 9 * P, c],
        [3 * P, 2 * P, 3 * P, 6 * P, 8 * P, 6 * P, s],
        [10 * P, 2 * P, 3 * P, 13 * P, 8 * P, 6 * P, s],
        [6.5 * P, 2 * P, 11 * P, 9.5 * P, 8 * P, 14 * P, s]
      ];
    }
  }
  return [[0, 0, 0, 1, 1, 1]];
}

/* Dünyadaki bir hücrenin kutuları (dünya koordinatında değil, hücre içinde) */
export function hucreKutulari(dunya, x, y, z, id, carp = false) {
  return sekilKutulari(id, f => dunya.blok(x + YONLER[f][0], y, z + YONLER[f][1]), carp);
}

/* Seçim ve çatlak için kutuların sınırı */
export function sinirKutusu(kutular) {
  const s = [1, 1, 1, 0, 0, 0];
  for (const k of kutular) for (let i = 0; i < 3; i++) { s[i] = Math.min(s[i], k[i]); s[i + 3] = Math.max(s[i + 3], k[i + 3]); }
  return s;
}

/* Bir kutu (dünya koordinatı) dünyadaki katı bloklarla ya da biçimli blok kutularıyla çakışıyor mu
   mod 0: var mı (true / false), 1: çakışanların en yüksek üst yüzü, 2: çakışanların en alçak alt yüzü */
export function cakisma(dunya, ax0, ay0, az0, ax1, ay1, az1, mod = 0) {
  const x0 = Math.floor(ax0), x1 = Math.floor(ax1 - 1e-6), z0 = Math.floor(az0), z1 = Math.floor(az1 - 1e-6);
  const y0 = Math.floor(ay0) - 1, y1 = Math.floor(ay1 - 1e-6);
  let ust = -Infinity, alt = Infinity, var_ = false;
  for (let by = y0; by <= y1; by++) for (let bz = z0; bz <= z1; bz++) for (let bx = x0; bx <= x1; bx++) {
    const id = dunya.blok(bx, by, bz);
    if (SEKIL[id]) {
      for (const k of hucreKutulari(dunya, bx, by, bz, id, true)) {
        if (bx + k[3] <= ax0 || bx + k[0] >= ax1 || by + k[4] <= ay0 || by + k[1] >= ay1 || bz + k[5] <= az0 || bz + k[2] >= az1) continue;
        if (!mod) return true;
        var_ = true; ust = Math.max(ust, by + k[4]); alt = Math.min(alt, by + k[1]);
      }
    } else if (by >= Math.floor(ay0) && (KATI[id] || dunya.sinirDisi(bx, bz))) {
      if (!mod) return true;
      var_ = true; ust = Math.max(ust, by + 1); alt = Math.min(alt, by);
    }
  }
  if (!mod) return false;
  return var_ ? (mod === 1 ? ust : alt) : null;
}

/* Işının hücredeki kutulara isabeti: { t, nx, ny, nz } ya da null */
export function kutuIsin(o, d, x, y, z, kutular, maks) {
  let en = null;
  const oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
  for (const k of kutular) {
    const a = [x + k[0], y + k[1], z + k[2]], b = [x + k[3], y + k[4], z + k[5]];
    let t0 = 0, t1 = maks, eks = -1, isaret = 0, ok = true;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(dd[i]) < 1e-9) { if (oo[i] < a[i] || oo[i] > b[i]) { ok = false; break; } continue; }
      let ta = (a[i] - oo[i]) / dd[i], tb = (b[i] - oo[i]) / dd[i];
      if (ta > tb) [ta, tb] = [tb, ta];
      if (ta > t0) { t0 = ta; eks = i; isaret = dd[i] > 0 ? -1 : 1; }
      t1 = Math.min(t1, tb);
      if (t0 > t1) { ok = false; break; }
    }
    if (!ok || (en && t0 >= en.t)) continue;
    const n = [0, 0, 0]; if (eks >= 0) n[eks] = isaret;
    en = { t: t0, nx: n[0], ny: n[1], nz: n[2] };
  }
  return en;
}
