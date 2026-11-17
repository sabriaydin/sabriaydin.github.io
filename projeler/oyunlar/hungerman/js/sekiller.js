/* HungerMan - biçimli bloklar: merdiven, yarım blok, kapı, tuzak kapı, çit, çit kapısı, cam bölme, tırmanma merdiveni, tarla, örs, simya masası
   Her blok, hücre içinde 0..1 aralığında kutulardan oluşur: [x0, y0, z0, x1, y1, z1, doku?].
   Aynı tanımlar meshleme (işçi), çarpışma (oyuncu ve canlılar), ışın izleme ve seçim kutusu için kullanılır. */
import { BLOKLAR, OPAK, CIZIM, C_KUP, C_SEKIL, KATI, T, BLOK_UST } from './bloklar.js';
import { CIHAZ, cihazHucreKutulari } from './cihazlar.js';

const P = 1 / 16;
/* Yönler: 0 kuzey (-z), 1 doğu (+x), 2 güney (+z), 3 batı (-x) */
export const YONLER = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const SEKIL = new Uint8Array(BLOK_UST);
for (const b of BLOKLAR) if (b && b.cizim === C_SEKIL) SEKIL[b.id] = 1;
const CIHAZ_KUTU = [];
for (const b of BLOKLAR) if (b && b.sekil === 'cihaz') CIHAZ_KUTU[b.id] = cihazHucreKutulari(CIHAZ[b.cihaz], b.parca);

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
/* 0.31.0: cam bölme ailesi (renkli camlar dahil) blok tanımındaki bolmeAile ile belirlenir */
const BOLME_AILE = id => !!(BLOKLAR[id] && BLOKLAR[id].bolmeAile);
const sekliOlan = (n, s) => !!(BLOKLAR[n] && BLOKLAR[n].sekil === s);
/* Çit, duvar ve cam bölme komşuya bağlanır mı */
function baglanir(id, n, f) {
  if (!n) return false;
  if (OPAK[n] && CIZIM[n] === C_KUP) return true;
  if (id === 177) return n === 177;
  const b = BLOKLAR[id];
  /* 0.31.0: duvarlar duvarlara, cam bölmelere ve kendi doğrultusundaki çit kapılarına bağlanır */
  if (b.sekil === 'duvar') return sekliOlan(n, 'duvar') || BOLME_AILE(n) || (sekliOlan(n, 'citKapi') && BLOKLAR[n].eksen === (f === 1 || f === 3 ? 0 : 1));
  if (b.sekil === 'cit') {
    if (sekliOlan(n, 'cit')) return true;   // 0.31.0: tüm ahşap çitler birbirine bağlanır
    /* Çit kapısı yalnızca kendi doğrultusundaki çitlere bağlanır */
    if (n >= 105 && n <= 108) return BLOKLAR[n].eksen === (f === 1 || f === 3 ? 0 : 1);
    return false;
  }
  return BOLME_AILE(n) || sekliOlan(n, 'duvar');
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
      /* 0.31.0: ters merdiven: tam yarım üstte, basamak altta */
      if (b.ust) return [[0, 0.5, 0, 1, 1, 1], [ust[0], 0, ust[2], ust[3], 0.5, ust[5]]];
      return [[0, 0, 0, 1, 0.5, 1], ust];
    }
    case 'yarim': return [b.ust ? [0, 0.5, 0, 1, 1, 1] : [0, 0, 0, 1, 0.5, 1]];
    case 'kapi': return [panel(b.acik ? (b.yon + 1) % 4 : b.yon, 3 * P)];
    case 'tuzak': return [b.acik ? panel(b.yon, 3 * P) : [0, 0, 0, 1, 3 * P, 1]];
    case 'tirmanma': return [panel(b.yon, carp ? 3 * P : P)];
    case 'tarla': return [[0, 0, 0, 1, 15 * P, 1]];
    /* 0.22.0: mezar taşı: toprak taban, dikili taş */
    case 'mezar': return carp ? [[P, 0, 2 * P, 15 * P, 15 * P, 14 * P]] : [[P, 0, 2 * P, 15 * P, 2 * P, 14 * P, T.toprak], [3 * P, 2 * P, 6 * P, 13 * P, 14 * P, 10 * P], [4 * P, 14 * P, 6 * P, 12 * P, 15 * P, 10 * P]];
    case 'karKatman': return [[0, 0, 0, 1, 2 * P, 1]];
    case 'gecit': return carp ? [] : [b.eksen ? [6 * P, 0, 0, 10 * P, 1, 1] : [0, 0, 6 * P, 1, 1, 10 * P]];
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
      const tel = n => BLOKLAR[n] && BLOKLAR[n].mekanik === 'tel', dolu = n => KATI[n] && OPAK[n];
      const ustAcik = !dolu(komsu(12));
      for (let f = 0; f < 4; f++) {
        const n = komsu(f), nb = BLOKLAR[n];
        /* 0.20.0: bir basamak yukarıdaki tele yandaki bloğun yüzünden tırmanır; aşağıdaki tele kenara kadar uzanır */
        const yukari = ustAcik && tel(komsu(4 + f)) && dolu(n), asagi = !dolu(n) && tel(komsu(8 + f));
        if (!yukari && !asagi && !(nb && (nb.mekanik || nb.sekil === 'kapi' || nb.sekil === 'citKapi' || nb.sekil === 'tuzak' || n === 157))) continue;
        l.push(f === 0 ? [7 * P, 0, 0, 9 * P, h, 7 * P] : f === 1 ? [9 * P, 0, 7 * P, 1, h, 9 * P] : f === 2 ? [7 * P, 0, 9 * P, 9 * P, h, 1] : [0, 0, 7 * P, 7 * P, h, 9 * P]);
        if (yukari) l.push(f === 0 ? [7 * P, 0, 0, 9 * P, 1, h] : f === 1 ? [1 - h, 0, 7 * P, 1, 1, 9 * P] : f === 2 ? [7 * P, 0, 1 - h, 9 * P, 1, 1] : [0, 0, 7 * P, h, 1, 9 * P]);
      }
      return l;
    }
    case 'ters':
      if (carp) return [[0, 0, 0, 1, 2 * P, 1]];
      return dondur([[0, 0, 0, 1, 2 * P, 1], [7 * P, 2 * P, 3 * P, 9 * P, 6 * P, 5 * P, T.kalas], [6.5 * P, 6 * P, 2.5 * P, 9.5 * P, 8 * P, 5.5 * P, b.acik ? T.bakir_lamba_a : T.kol_bas], [7 * P, 2 * P, 11 * P, 9 * P, 4 * P, 13 * P, T.kalas]], b.yon);
    /* 0.20.0: Geciktirici: önde sabit çıkış ucu, arkada gecikmeye göre kayan ikinci uç */
    case 'gecik': {
      if (carp) return [[0, 0, 0, 1, 2 * P, 1]];
      const ba = b.acik ? T.bakir_lamba_a : T.kol_bas, z = (7 + 2 * b.gecikme) * P;
      return dondur([[0, 0, 0, 1, 2 * P, 1], [7 * P, 2 * P, 3 * P, 9 * P, 5 * P, 5 * P, T.kalas], [6.5 * P, 5 * P, 2.5 * P, 9.5 * P, 7 * P, 5.5 * P, ba],
        [7 * P, 2 * P, z, 9 * P, 5 * P, z + 2 * P, T.kalas], [6.5 * P, 5 * P, z - 0.5 * P, 9.5 * P, 7 * P, z + 2.5 * P, ba]], b.yon);
    }
    case 'algi': return [[0, 0, 0, 1, 6 * P, 1]];
    /* 0.24.0: elektrik blokları */
    /* 0.26.0: Şalter: gövde, ön kapak, gösterge ışığı ve sağda yukarı (açık) / aşağı (kapalı) kol; çeşit 1 ayaklıdır */
    case 'salter': {
      const zb = b.cesit ? 6 : 9, y = b.cesit ? 4 : 2;   // gövdenin arka yüzü: duvar şalterinde duvara dayalı, ayaklıda ortada
      const L = [[3 * P, y * P, zb * P, 13 * P, (y + 11) * P, (zb + 7) * P]];
      if (carp) return dondur(b.cesit ? [...L, [4 * P, 0, 5 * P, 12 * P, P, 13 * P]] : L, b.yon);
      L.push([3.5 * P, (y + 0.5) * P, (zb - 0.4) * P, 12.5 * P, (y + 10.5) * P, zb * P, T.salter_on]);
      L.push([5 * P, (y + 8.5) * P, (zb - 0.7) * P, 7 * P, (y + 9.5) * P, (zb - 0.4) * P, b.acik ? T.led_yesil : T.led_kirmizi]);
      L.push([13 * P, (y + 4.5) * P, (zb + 1) * P, 14.5 * P, (y + 6.5) * P, (zb + 3) * P, T.demir_cubuk]);   // kol göbeği
      if (b.acik) L.push([13.3 * P, (y + 6) * P, (zb + 1.4) * P, 14.2 * P, (y + 10) * P, (zb + 2.6) * P, T.demir_cubuk], [12.9 * P, (y + 9.6) * P, (zb + 1) * P, 14.6 * P, (y + 11.2) * P, (zb + 3) * P, T.led_kirmizi]);
      else L.push([13.3 * P, (y + 1) * P, (zb + 1.4) * P, 14.2 * P, (y + 5) * P, (zb + 2.6) * P, T.demir_cubuk], [12.9 * P, (y - 0.2) * P, (zb + 1) * P, 14.6 * P, (y + 1.4) * P, (zb + 3) * P, T.led_kirmizi]);
      if (b.cesit) L.push([4 * P, 0, 5 * P, 12 * P, P, 13 * P, T.panel_yan], [7 * P, P, 8.5 * P, 9 * P, 4 * P, 10.5 * P, T.demir_cubuk]);
      return dondur(L, b.yon);
    }
    /* 0.28.0: Yakıtlı Jeneratör: kızak, motor gövdesi, yakıt tankı, egzoz borusu, önde kontrol paneli */
    case 'jenerator': {
      if (carp) return dondur([[P, 0, 2 * P, 15 * P, 13 * P, 14 * P]], b.yon);
      const D = T.demir_cubuk;
      return dondur([[P, 0, 2 * P, 15 * P, 1.5 * P, 3.5 * P, D], [P, 0, 12.5 * P, 15 * P, 1.5 * P, 14 * P, D], [2 * P, 1.5 * P, 3 * P, 14 * P, 2.5 * P, 13 * P, T.batarya_kasa],
        [2 * P, 2.5 * P, 3 * P, 14 * P, 10.5 * P, 13 * P], [3 * P, 10.5 * P, 4 * P, 13 * P, 13 * P, 12 * P, T.batarya_ust], [7 * P, 13 * P, 7 * P, 9 * P, 13.6 * P, 9 * P, D],
        [12 * P, 10.5 * P, 10 * P, 13.5 * P, 15 * P, 11.5 * P, D], [4 * P, 4 * P, 2.6 * P, 12 * P, 9 * P, 3 * P, T.jen_on], [b.acik ? 13 * P : 13 * P, 4 * P, 1.4 * P, 15 * P, 6 * P, 2.6 * P, b.acik ? T.led_yesil : T.led_kirmizi]], b.yon);
    }
    /* 0.29.0: Elektrikli Ocak: kaide, emaye gövde, ocak gözlü üst tabla, önde düğme şeridi ve camlı fırın kapağı */
    case 'eocak': {
      if (carp) return dondur([[P, 0, 2 * P, 15 * P, 14 * P, 15 * P]], b.yon);
      const D = T.demir_cubuk, K = T.batarya_ust;
      return dondur([[1.5 * P, 0, 2.5 * P, 14.5 * P, P, 14.5 * P, D], [P, P, 2 * P, 15 * P, 13 * P, 15 * P], [P, 13 * P, 2 * P, 15 * P, 14 * P, 15 * P, b.acik ? T.eocak_ust_a : T.eocak_ust],
        [2 * P, 10.8 * P, 1.6 * P, 14 * P, 12.6 * P, 2 * P, K],
        [3 * P, 11.2 * P, 1.1 * P, 4.2 * P, 12.2 * P, 1.6 * P, D], [5.2 * P, 11.2 * P, 1.1 * P, 6.4 * P, 12.2 * P, 1.6 * P, D], [7.4 * P, 11.2 * P, 1.1 * P, 8.6 * P, 12.2 * P, 1.6 * P, D], [9.6 * P, 11.2 * P, 1.1 * P, 10.8 * P, 12.2 * P, 1.6 * P, D],
        [12.4 * P, 11.4 * P, 1.3 * P, 13.4 * P, 12 * P, 1.6 * P, b.acik ? T.led_kirmizi : K],
        [2 * P, 1.6 * P, 1.5 * P, 14 * P, 10.2 * P, 2 * P], [4 * P, 3.4 * P, 1.2 * P, 12 * P, 8.2 * P, 1.5 * P, b.acik ? T.ocak_cam_a : T.ocak_cam],
        [3.4 * P, 9 * P, 0.9 * P, 4 * P, 9.6 * P, 1.5 * P, D], [12 * P, 9 * P, 0.9 * P, 12.6 * P, 9.6 * P, 1.5 * P, D], [3 * P, 9 * P, 0.4 * P, 13 * P, 9.6 * P, 0.9 * P, D]], b.yon);
    }
    /* 0.29.0: Isıtıcı: iki ayak üstünde ince panel radyatör, önde ısıtma ızgarası (çalışırken kızarır), üstte ayar düğmesi */
    case 'eisitici': {
      if (carp) return dondur([[2 * P, 0, 4 * P, 14 * P, 14 * P, 12 * P]], b.yon);
      const D = T.demir_cubuk, K = T.batarya_ust;
      return dondur([[2 * P, 0, 4 * P, 4 * P, P, 12 * P, D], [12 * P, 0, 4 * P, 14 * P, P, 12 * P, D], [2.5 * P, P, 7 * P, 3.5 * P, 2 * P, 9 * P, D], [12.5 * P, P, 7 * P, 13.5 * P, 2 * P, 9 * P, D],
        [2 * P, 2 * P, 6 * P, 14 * P, 13 * P, 10 * P], [3 * P, 3 * P, 5.6 * P, 13 * P, 11.5 * P, 6 * P, b.acik ? T.isitici_izgara_a : T.isitici_izgara],
        [2.5 * P, 13 * P, 6.5 * P, 13.5 * P, 13.6 * P, 9.5 * P, D], [10.5 * P, 13.6 * P, 7.2 * P, 12 * P, 14.6 * P, 8.8 * P, K],
        [3.6 * P, 12 * P, 5.6 * P, 4.6 * P, 12.6 * P, 6 * P, b.acik ? T.led_kirmizi : K]], b.yon);
    }
    /* 0.28.0: Hareket Algılayıcı: duvar plakası ya da ayak üstünde kubbeli algılayıcı başı (ışığı algılarken yanar) */
    case 'algilayici': {
      const D = T.demir_cubuk;
      if (b.cesit === 0) {
        if (carp) return dondur([[5 * P, 5 * P, 12 * P, 11 * P, 11 * P, 1]], b.yon);
        return dondur([[5 * P, 5 * P, 15 * P, 11 * P, 11 * P, 1, T.salter_govde], [6 * P, 6 * P, 13 * P, 10 * P, 10 * P, 15 * P], [7 * P, 7 * P, 12.4 * P, 9 * P, 9 * P, 13 * P]], b.yon);
      }
      if (carp) return [[5 * P, 0, 5 * P, 11 * P, 9 * P, 11 * P]];
      return dondur([[5 * P, 0, 5 * P, 11 * P, P, 11 * P, D], [7.5 * P, P, 7.5 * P, 8.5 * P, 4 * P, 8.5 * P, D], [6 * P, 4 * P, 6 * P, 10 * P, 8 * P, 10 * P, T.salter_govde], [6.5 * P, 4.5 * P, 5.4 * P, 9.5 * P, 7.5 * P, 6 * P]], b.yon);
    }
    /* 0.28.0: Sulama Fıskiyesi: taban, boru, dönen başlık ve kollar */
    case 'fiskiye':
      if (carp) return [];
      return [[6 * P, 0, 6 * P, 10 * P, P, 10 * P], [7.5 * P, P, 7.5 * P, 8.5 * P, 6 * P, 8.5 * P], [6.5 * P, 6 * P, 6.5 * P, 9.5 * P, 7.5 * P, 9.5 * P, T.batarya_ust],
        [3.5 * P, 6.5 * P, 7.6 * P, 12.5 * P, 7 * P, 8.4 * P], [7.6 * P, 6.5 * P, 3.5 * P, 8.4 * P, 7 * P, 12.5 * P], [7 * P, 7.5 * P, 7 * P, 9 * P, 8 * P, 9 * P, b.acik ? T.led_yesil : T.led_kirmizi]];
    /* 0.27.0: Dağıtıcı ve Birleştirici: alçak metal kutu, üstte yön oku etiketi */
    case 'dagitici':
      if (carp) return [[2 * P, 0, 2 * P, 14 * P, 5 * P, 14 * P]];
      return dondur([[2 * P, 0, 2 * P, 14 * P, 4.5 * P, 14 * P], [3 * P, 4.5 * P, 3 * P, 13 * P, 5 * P, 13 * P, T.salter_on], [7 * P, 5 * P, 4 * P, 9 * P, 5.3 * P, 8 * P, b.birlestir ? T.led_yesil : T.led_kirmizi]], b.yon);
    /* 0.26.0: Elektrikli Lamba: çeşit 0 zemin (ayak, direk, cam küre), 1 tavan (sarkan abajur), 2 duvar (aplik) */
    case 'elamba': {
      const D = T.demir_cubuk, K = T.lamba_kap;
      if (b.cesit === 1) {
        if (carp) return [[4 * P, 4 * P, 4 * P, 12 * P, 1, 12 * P]];
        return [[6 * P, 15 * P, 6 * P, 10 * P, 1, 10 * P, D], [7.6 * P, 9 * P, 7.6 * P, 8.4 * P, 15 * P, 8.4 * P, T.kablo_kilif], [6.5 * P, 8.5 * P, 6.5 * P, 9.5 * P, 9.5 * P, 9.5 * P, D],
          [4 * P, 6 * P, 4 * P, 12 * P, 8.5 * P, 12 * P, K], [5 * P, 8.5 * P, 5 * P, 11 * P, 9 * P, 11 * P, K], [6 * P, 4.5 * P, 6 * P, 10 * P, 6 * P, 10 * P]];
      }
      if (b.cesit === 2) {
        if (carp) return dondur([[5 * P, 4 * P, 5 * P, 11 * P, 12 * P, 1]], b.yon);
        return dondur([[6 * P, 4 * P, 15 * P, 10 * P, 12 * P, 1, D], [7.5 * P, 7.5 * P, 10 * P, 8.5 * P, 8.5 * P, 15 * P, D], [5 * P, 5 * P, 5 * P, 11 * P, 11 * P, 11 * P], [6 * P, 11 * P, 6 * P, 10 * P, 12 * P, 10 * P, K], [6 * P, 4 * P, 6 * P, 10 * P, 5 * P, 10 * P, K]], b.yon);
      }
      if (carp) return [[5 * P, 0, 5 * P, 11 * P, 15 * P, 11 * P]];
      return [[5 * P, 0, 5 * P, 11 * P, P, 11 * P, D], [6 * P, P, 6 * P, 10 * P, 1.5 * P, 10 * P, K], [7.5 * P, 1.5 * P, 7.5 * P, 8.5 * P, 9 * P, 8.5 * P, D], [6.5 * P, 9 * P, 6.5 * P, 9.5 * P, 10 * P, 9.5 * P, K],
        [5 * P, 10 * P, 5 * P, 11 * P, 15 * P, 11 * P], [6 * P, 15 * P, 6 * P, 10 * P, 16 * P, 10 * P, K]];
    }
    /* 0.25.0: çok bloklu cihaz hücresi: cihazın çarpışma kutularının bu hücreye düşen parçası */
    case 'cihaz': return dondur(CIHAZ_KUTU[id] || [], b.yon);
    case 'ekablo': {   // elektrik kablosu: elektrikli komşulara uzanır; üstteki ve alttaki elektrikli bloğa dikey bağlanır
      if (carp) return [];
      const h = 1.6 * P, el = n => !!(BLOKLAR[n] && BLOKLAR[n].elektrik), l = [[6.5 * P, 0, 6.5 * P, 9.5 * P, h, 9.5 * P]];
      for (let f = 0; f < 4; f++) if (el(komsu(f))) l.push(f === 0 ? [7 * P, 0, 0, 9 * P, h, 7 * P] : f === 1 ? [9 * P, 0, 7 * P, 1, h, 9 * P] : f === 2 ? [7 * P, 0, 9 * P, 9 * P, h, 1] : [0, 0, 7 * P, 7 * P, h, 9 * P]);
      if (el(komsu(12))) l.push([7 * P, h, 7 * P, 9 * P, 1, 9 * P]);
      return l;
    }
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
    /* 0.34.0: kompost kutusu: tahta çerçeve, içi doluluk seviyesine göre yükselir */
    case 'kompost': {
      if (carp) return [[0, 0, 0, 1, 1, 1]];
      const W = T.kompost_yan, h = 2 * P + Math.min(8, b.kompost) * 1.5 * P;
      return [[0, 0, 0, 1, 1, 2 * P, W], [0, 0, 14 * P, 1, 1, 1, W], [0, 0, 2 * P, 2 * P, 1, 14 * P, W], [14 * P, 0, 2 * P, 1, 1, 14 * P, W], [2 * P, 0, 2 * P, 14 * P, h, 14 * P]];
    }
    /* ---------- 0.31.0: yapı ve dekorasyon ---------- */
    case 'duvar': {
      const bag = [0, 1, 2, 3].map(f => baglanir(id, komsu(f), f)), h = carp ? 1.5 : 14 * P;
      const ustu = komsu(12), duz = ((bag[0] && bag[2] && !bag[1] && !bag[3]) || (bag[1] && bag[3] && !bag[0] && !bag[2])) && !(ustu && (sekliOlan(ustu, 'duvar') || KATI[ustu]));
      if (duz && !carp) return [bag[0] ? [5 * P, 0, 0, 11 * P, h, 1] : [0, 0, 5 * P, 1, h, 11 * P]];
      const l = [[4 * P, 0, 4 * P, 12 * P, carp ? 1.5 : 1, 12 * P]];
      for (let f = 0; f < 4; f++) if (bag[f]) l.push(f === 0 ? [5 * P, 0, 0, 11 * P, h, 4 * P] : f === 1 ? [12 * P, 0, 5 * P, 1, h, 11 * P] : f === 2 ? [5 * P, 0, 12 * P, 11 * P, h, 1] : [0, 0, 5 * P, 4 * P, h, 11 * P]);
      return l;
    }
    /* Duvar rafı: duvara (yon tarafına) yaslanan tahta, demir dirsekler ve üstünde kitaplar */
    case 'raf': {
      if (carp) return [];
      const K = T.kitap_sirt, C = T.demir_cubuk;
      return dondur([[0, 7 * P, 0, 1, 8 * P, 6 * P], [P, 3 * P, 0, 2 * P, 7 * P, 5 * P, C], [14 * P, 3 * P, 0, 15 * P, 7 * P, 5 * P, C],
        [1.5 * P, 8 * P, 0.5 * P, 3.5 * P, 13 * P, 5 * P, K], [3.5 * P, 8 * P, 0.5 * P, 5 * P, 12 * P, 5 * P, K], [5 * P, 8 * P, 0.5 * P, 7 * P, 14 * P, 5 * P, K],
        [7.2 * P, 8 * P, 1 * P, 9 * P, 11 * P, 4.5 * P, T.vazo], [10 * P, 8 * P, 0.5 * P, 14.5 * P, 10 * P, 5 * P, K]], b.yon);
    }
    /* Perde: kapalıyken kıvrımlı tam panel, açıkken iki yanda toplanır; üstte demir korniş */
    case 'perde': {
      if (carp) return [];
      const l = [[0, 15 * P, 0.5 * P, 1, 16 * P, 1.5 * P, T.demir_cubuk]];
      if (b.acik) l.push([0, 0, 0, 3 * P, 15 * P, 3 * P], [13 * P, 0, 0, 1, 15 * P, 3 * P]);
      else for (let i = 0; i < 8; i++) l.push([i * 2 * P, 0, 0, (i + 1) * 2 * P, 15 * P, (i % 2 ? 1 : 2) * P]);
      return dondur(l, b.yon);
    }
    /* Avize: tavana zincirle asılı, dört kollu, mumlu */
    case 'avize': {
      if (carp) return [];
      const C = T.demir_cubuk, M = T.mum_govde, A = T.mum_alev, G = T.altin_blok, l = [[7.5 * P, 11 * P, 7.5 * P, 8.5 * P, 1, 8.5 * P, C], [6 * P, 7 * P, 6 * P, 10 * P, 11 * P, 10 * P, G],
        [2 * P, 8 * P, 7.5 * P, 14 * P, 9 * P, 8.5 * P, C], [7.5 * P, 8 * P, 2 * P, 8.5 * P, 9 * P, 14 * P, C]];
      for (const [x, z] of [[2.5, 8], [13.5, 8], [8, 2.5], [8, 13.5]]) l.push([(x - 1) * P, 9 * P, (z - 1) * P, (x + 1) * P, 12 * P, (z + 1) * P, M], [(x - 0.5) * P, 12 * P, (z - 0.5) * P, (x + 0.5) * P, 13.5 * P, (z + 0.5) * P, A]);
      return l;
    }
    /* Şömine: taş tuğla ocak, içi isli; yanarken kütükler ve alev */
    case 'somine': {
      if (carp) return [[0, 0, 0, 1, 1, 1]];
      const I = T.somine_ic, l = [[0, 0, 0, 1, 2 * P, 1], [0, 2 * P, 2 * P, 3 * P, 12 * P, 1], [13 * P, 2 * P, 2 * P, 1, 12 * P, 1], [3 * P, 2 * P, 12 * P, 13 * P, 12 * P, 1],
        [3 * P, 2 * P, 11 * P, 13 * P, 12 * P, 12 * P, I], [3 * P, 2 * P, 2 * P, 13 * P, 2.5 * P, 11 * P, I], [0, 12 * P, 0, 1, 14 * P, 1, T.kesme_tas], [2 * P, 14 * P, 3 * P, 14 * P, 1, 14 * P],
        [4 * P, 2.5 * P, 6 * P, 12 * P, 4 * P, 8 * P, T.mese_yan], [5 * P, 2.5 * P, 4 * P, 7 * P, 4 * P, 10 * P, T.mese_yan]];
      if (b.acik) l.push([4 * P, 3 * P, 4 * P, 12 * P, 10 * P, 10 * P, T.kamp_atesi]);
      return dondur(l, b.yon);
    }
    case 'sehpa':
      if (carp) return [[P, 0, P, 15 * P, 8 * P, 15 * P]];
      return [[P, 6 * P, P, 15 * P, 8 * P, 15 * P], [2 * P, 0, 2 * P, 4 * P, 6 * P, 4 * P], [12 * P, 0, 2 * P, 14 * P, 6 * P, 4 * P], [2 * P, 0, 12 * P, 4 * P, 6 * P, 14 * P], [12 * P, 0, 12 * P, 14 * P, 6 * P, 14 * P],
        [3 * P, 2 * P, 3 * P, 13 * P, 3 * P, 13 * P]];
    case 'vazo': {
      if (carp) return [[5 * P, 0, 5 * P, 11 * P, 10 * P, 11 * P]];
      const Y = T.yun_y;
      if (b.bosVazo) return [[5 * P, 0, 5 * P, 11 * P, 7 * P, 11 * P], [6 * P, 7 * P, 6 * P, 10 * P, 10 * P, 10 * P]];   // 0.35.0: boş vazo
      return [[5 * P, 0, 5 * P, 11 * P, 7 * P, 11 * P], [6 * P, 7 * P, 6 * P, 10 * P, 10 * P, 10 * P], [7.5 * P, 10 * P, 7.5 * P, 8.5 * P, 14 * P, 8.5 * P, Y], [6 * P, 10 * P, 9 * P, 7 * P, 13 * P, 10 * P, Y],
        [6.5 * P, 13.5 * P, 6.5 * P, 9.5 * P, 15.5 * P, 9.5 * P, T.yun_k], [5 * P, 12 * P, 9 * P, 7 * P, 13.5 * P, 11 * P, T.yun_s], [9 * P, 11 * P, 5.5 * P, 11 * P, 12.5 * P, 7.5 * P, T.mavi_cicek]];
    }
    /* ---------- 0.36.1: iki bloklu yatak ----------
       Kuzeye (yön 0) göre: baş parçası kuzeyde (başlık, yastık, yorganın kıvrık ucu), ayak parçası güneyde (yorgan, ayaklık).
       Ahşap çerçeve ve dört köşe direği, yanlarda karyola kirişi, üstte çizgili döşek ve beyaz çarşaf; yorgan yanlardan sarkar. */
    case 'yatak2': {
      if (carp) return dondur(b.parca ? [[0.5 * P, 0, 0, 15.5 * P, 9 * P, 1], [0.5 * P, 0, 0, 15.5 * P, 14.5 * P, 2.5 * P]] : [[0.5 * P, 0, 0, 15.5 * P, 9 * P, 1]], b.yon);
      const A = T.yatak_ahsap, Y = T.yatak_yorgan, C = T.yatak_carsaf, D = T.yatak_dosek, S = T.yatak_yastik, l = [];
      if (b.parca) {
        l.push([0.5 * P, 0, 0.5 * P, 2.5 * P, 15 * P, 2.5 * P, A], [13.5 * P, 0, 0.5 * P, 15.5 * P, 15 * P, 2.5 * P, A],   // başlık direkleri
          [2.5 * P, 4 * P, 1 * P, 13.5 * P, 13 * P, 2 * P, A], [0.2 * P, 15 * P, 0.2 * P, 15.8 * P, 16 * P, 2.8 * P, A],    // başlık paneli ve üst kapak
          [5 * P, 8 * P, 0.8 * P, 11 * P, 11 * P, 1 * P, A],                                                                // oyma
          [1 * P, 3 * P, 2.5 * P, 2 * P, 6 * P, 1, A], [14 * P, 3 * P, 2.5 * P, 15 * P, 6 * P, 1, A],                       // yan kirişler
          [2 * P, 3 * P, 2 * P, 14 * P, 7 * P, 1, D], [2 * P, 7 * P, 2 * P, 14 * P, 8 * P, 1, C],                          // döşek ve çarşaf
          [3 * P, 8 * P, 2.6 * P, 13 * P, 10.5 * P, 7 * P, S], [3.5 * P, 10.5 * P, 3.2 * P, 12.5 * P, 11.2 * P, 6.4 * P, S], // yastık
          [1.6 * P, 8 * P, 9 * P, 14.4 * P, 9 * P + 0.6 * P, 1, Y], [1.6 * P, 8.6 * P, 8 * P, 14.4 * P, 9.4 * P, 10 * P, C], // yorgan ve kıvrık çarşaf ucu
          [1.4 * P, 4.5 * P, 9 * P, 1.6 * P, 9.2 * P, 1, Y], [14.4 * P, 4.5 * P, 9 * P, 14.6 * P, 9.2 * P, 1, Y]);           // yanlardan sarkan yorgan
      } else {
        l.push([0.5 * P, 0, 13.5 * P, 2.5 * P, 10 * P, 15.5 * P, A], [13.5 * P, 0, 13.5 * P, 15.5 * P, 10 * P, 15.5 * P, A], // ayaklık direkleri
          [2.5 * P, 3 * P, 14 * P, 13.5 * P, 9 * P, 15 * P, A], [0.2 * P, 10 * P, 13.2 * P, 15.8 * P, 11 * P, 15.8 * P, A],  // ayaklık paneli ve kapak
          [1 * P, 3 * P, 0, 2 * P, 6 * P, 13.5 * P, A], [14 * P, 3 * P, 0, 15 * P, 6 * P, 13.5 * P, A],                      // yan kirişler
          [2 * P, 3 * P, 0, 14 * P, 7 * P, 14 * P, D], [2 * P, 7 * P, 0, 14 * P, 8 * P, 13.6 * P, C],                        // döşek ve çarşaf
          [1.6 * P, 8 * P, 0, 14.4 * P, 8.6 * P, 13.8 * P, Y],                                                               // yorgan
          [1.4 * P, 4.5 * P, 0, 1.6 * P, 8.6 * P, 13.8 * P, Y], [14.4 * P, 4.5 * P, 0, 14.6 * P, 8.6 * P, 13.8 * P, Y],      // yanlardan sarkan yorgan
          [1.6 * P, 5 * P, 13.6 * P, 14.4 * P, 8.6 * P, 13.8 * P, Y]);                                                       // ayak ucunda sarkan yorgan
      }
      return dondur(l, b.yon);
    }
    /* Eski tek bloklu yatak (0.36.1 öncesi kayıtlar ve yapılar): küçük karyola */
    case 'yatakTek': {
      if (carp) return [[P, 0, 0, 15 * P, 9 * P, 1]];
      const A = T.yatak_ahsap, Y = T.yatak_yorgan, C = T.yatak_carsaf, D = T.yatak_dosek, S = T.yatak_yastik;
      return [[1 * P, 0, 0.5 * P, 3 * P, 12 * P, 2.5 * P, A], [13 * P, 0, 0.5 * P, 15 * P, 12 * P, 2.5 * P, A], [3 * P, 4 * P, 1 * P, 13 * P, 11 * P, 2 * P, A],
        [1 * P, 0, 14 * P, 3 * P, 8 * P, 15.5 * P, A], [13 * P, 0, 14 * P, 15 * P, 8 * P, 15.5 * P, A], [3 * P, 3 * P, 14.5 * P, 13 * P, 7 * P, 15 * P, A],
        [2 * P, 3 * P, 2.5 * P, 14 * P, 6 * P, 14 * P, D], [2 * P, 6 * P, 2.5 * P, 14 * P, 7 * P, 14 * P, C], [3.5 * P, 7 * P, 3 * P, 12.5 * P, 9 * P, 6 * P, S],
        [1.6 * P, 7 * P, 7 * P, 14.4 * P, 7.6 * P, 14.2 * P, Y], [1.4 * P, 4 * P, 7 * P, 1.6 * P, 7.6 * P, 14.2 * P, Y], [14.4 * P, 4 * P, 7 * P, 14.6 * P, 7.6 * P, 14.2 * P, Y]];
    }
    /* ---------- 0.36.0: mutfak ---------- */
    /* Değirmen taşı: taş kaide, üstte iki öğütme taşı ve döndürme kolu */
    case 'degirmen':
      if (carp) return [[0, 0, 0, 1, 12 * P, 1]];
      return [[P, 0, P, 15 * P, 6 * P, 15 * P], [2 * P, 6 * P, 2 * P, 14 * P, 9 * P, 14 * P], [2.5 * P, 9 * P, 2.5 * P, 13.5 * P, 12 * P, 13.5 * P], [7 * P, 12 * P, 7 * P, 9 * P, 13 * P, 9 * P, T.kalas], [8 * P, 12 * P, 7.5 * P, 13 * P, 13 * P, 8.5 * P, T.kalas], [12 * P, 13 * P, 7.5 * P, 13 * P, 16 * P, 8.5 * P, T.kalas]];
    /* Çilekli pasta: dilim yendikçe kısalır */
    case 'pasta': {
      const x1 = (15 - (b.dilim || 0) * 3.5) * P;
      return [[P, 0, P, x1, 8 * P, 15 * P]];
    }
    /* Semaver: pirinç gövde, musluk, üstte demlik */
    case 'semaver':
      if (carp) return [[4 * P, 0, 4 * P, 12 * P, 15 * P, 12 * P]];
      return [[5 * P, 0, 5 * P, 11 * P, P, 11 * P], [4 * P, P, 4 * P, 12 * P, 10 * P, 12 * P], [5 * P, 10 * P, 5 * P, 11 * P, 11 * P, 11 * P], [7.5 * P, 4 * P, 12 * P, 8.5 * P, 5 * P, 14 * P],
        [6 * P, 11 * P, 6 * P, 10 * P, 14 * P, 10 * P, T.tabak], [7.5 * P, 14 * P, 7.5 * P, 8.5 * P, 15 * P, 8.5 * P], [3 * P, 7 * P, 7.5 * P, 4 * P, 9 * P, 8.5 * P], [12 * P, 7 * P, 7.5 * P, 13 * P, 9 * P, 8.5 * P]];
    /* Ekmek sepeti: hasır sepet, içinde ekmekler */
    case 'sepet':
      if (carp) return [[3 * P, 0, 3 * P, 13 * P, 5 * P, 13 * P]];
      return [[3 * P, 0, 3 * P, 13 * P, P, 13 * P], [3 * P, P, 3 * P, 13 * P, 5 * P, 4 * P], [3 * P, P, 12 * P, 13 * P, 5 * P, 13 * P], [3 * P, P, 4 * P, 4 * P, 5 * P, 12 * P], [12 * P, P, 4 * P, 13 * P, 5 * P, 12 * P],
        [4 * P, P, 5 * P, 12 * P, 6 * P, 8 * P, T.cuval_un], [5 * P, P, 8.5 * P, 11 * P, 5.5 * P, 11 * P, T.cuval_un]];
    /* Piknik sepeti: kapaklı hasır sandık, kulp */
    case 'piknik':
      if (carp) return [[2 * P, 0, 4 * P, 14 * P, 9 * P, 12 * P]];
      return [[2 * P, 0, 4 * P, 14 * P, 8 * P, 12 * P], [1.5 * P, 8 * P, 3.5 * P, 14.5 * P, 9 * P, 12.5 * P, T.kalas], [4 * P, 9 * P, 7.5 * P, 5 * P, 12 * P, 8.5 * P, T.kalas], [11 * P, 9 * P, 7.5 * P, 12 * P, 12 * P, 8.5 * P, T.kalas], [4 * P, 12 * P, 7.5 * P, 12 * P, 13 * P, 8.5 * P, T.kalas]];
    /* Tandır: kil kubbe, üstte ağız, yanında ateş deliği */
    case 'tandir':
      if (carp) return [[0, 0, 0, 1, 14 * P, 1]];
      return [[P, 0, P, 15 * P, 10 * P, 15 * P], [2 * P, 10 * P, 2 * P, 14 * P, 13 * P, 14 * P], [4 * P, 13 * P, 4 * P, 6 * P, 14 * P, 12 * P], [10 * P, 13 * P, 4 * P, 12 * P, 14 * P, 12 * P], [6 * P, 13 * P, 4 * P, 10 * P, 14 * P, 6 * P], [6 * P, 13 * P, 10 * P, 10 * P, 14 * P, 12 * P],
        [6 * P, 1 * P, 0.5 * P, 10 * P, 5 * P, P, T.kamp_atesi]];
    /* Yemek tabağı: yassı tabak, üstünde yemek */
    case 'tabak':
      if (carp) return [];
      return [[3 * P, 0, 3 * P, 13 * P, P, 13 * P], [5 * P, P, 5 * P, 11 * P, 2.5 * P, 11 * P, T.pasta_ic]];
    /* Fesleğen saksısı: pişmiş kil saksı, yeşil yapraklar */
    case 'feslegen':
      if (carp) return [];
      return [[5 * P, 0, 5 * P, 11 * P, 6 * P, 11 * P, T.tandir], [4 * P, 6 * P, 4 * P, 12 * P, 11 * P, 12 * P], [6 * P, 11 * P, 6 * P, 10 * P, 13 * P, 10 * P]];
    /* Sarımsak örgüsü: duvara asılı örgü */
    case 'sarimsak':
      if (carp) return [];
      return dondur([[7.5 * P, 13 * P, 0, 8.5 * P, 16 * P, P, T.kalas], [6 * P, 9 * P, 0.2 * P, 10 * P, 13 * P, 4 * P], [5 * P, 5 * P, 0.2 * P, 11 * P, 9 * P, 4.5 * P], [6 * P, P, 0.2 * P, 10 * P, 5 * P, 4 * P]], b.yon);
    /* Baharat rafı: duvar rafı, üstünde dört renkli kavanoz */
    case 'baharat':
      if (carp) return [];
      return dondur([[0, 5 * P, 0, 1, 6 * P, 5 * P], [P, 2 * P, 0, 2 * P, 5 * P, 4 * P, T.demir_cubuk], [14 * P, 2 * P, 0, 15 * P, 5 * P, 4 * P, T.demir_cubuk],
        [1 * P, 6 * P, 0.5 * P, 15 * P, 11 * P, 4 * P, T.baharat]], b.yon);
    /* Kavanozlar: iki boy turşu ve salça kavanozu */
    case 'kavanoz':
      if (carp) return [];
      return [[3 * P, 0, 4 * P, 8 * P, 8 * P, 9 * P], [9 * P, 0, 7 * P, 13 * P, 6 * P, 11 * P], [3.5 * P, 8 * P, 4.5 * P, 7.5 * P, 9 * P, 8.5 * P, T.kalas], [9.5 * P, 6 * P, 7.5 * P, 12.5 * P, 7 * P, 10.5 * P, T.kalas]];
    case 'balKavanoz':
      if (carp) return [];
      return [[5 * P, 0, 5 * P, 11 * P, 8 * P, 11 * P], [5.5 * P, 8 * P, 5.5 * P, 10.5 * P, 9 * P, 10.5 * P]];
    /* Çuval: dolgun çuval, bağlı ağız */
    case 'cuval':
      if (carp) return [[2 * P, 0, 2 * P, 14 * P, 13 * P, 14 * P]];
      return [[2 * P, 0, 2 * P, 14 * P, 10 * P, 14 * P], [3 * P, 10 * P, 3 * P, 13 * P, 12 * P, 13 * P], [5 * P, 12 * P, 5 * P, 11 * P, 13 * P, 11 * P], [6 * P, 13 * P, 6 * P, 10 * P, 14 * P, 10 * P]];
    case 'mum':
      if (carp) return [];
      return [[5.5 * P, 0, 5.5 * P, 10.5 * P, P, 10.5 * P, T.demir_cubuk], [7 * P, P, 7 * P, 9 * P, 7 * P, 9 * P], [7.5 * P, 7 * P, 7.5 * P, 8.5 * P, 9 * P, 8.5 * P, T.mum_alev]];
    /* Sancak: duvara asılı kumaş, altta koyu şerit, ortada altın arma, üstte tahta çubuk */
    case 'sancak': {
      if (carp) return [];
      return dondur([[P, 15 * P, 0, 15 * P, 16 * P, 2 * P, T.kalas], [2 * P, 0, 0.5 * P, 14 * P, 15 * P, 1.5 * P], [2 * P, 0, 0.4 * P, 14 * P, 2 * P, 1.6 * P, b.renk8 === 7 ? T.yun : T.yun_si],
        [6 * P, 7 * P, 0.3 * P, 10 * P, 11 * P, 1.7 * P, T.altin_blok], [7 * P, 6 * P, 0.25 * P, 9 * P, 12 * P, 1.75 * P, T.altin_blok]], b.yon);
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
  return sekilKutulari(id, f => (f >= 12 ? dunya.blok(x, y + (f === 12 ? 1 : -1), z) : dunya.blok(x + YONLER[f & 3][0], y + (f < 4 ? 0 : f < 8 ? 1 : -1), z + YONLER[f & 3][1])), carp);
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
