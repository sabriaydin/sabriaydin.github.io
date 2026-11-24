/* HungerMan - 0.41.0: yeni dünya üreticisinin (sürüm 2) ağaçları
   Kalın gövdeli dev meşe ve dev ladin, uzun huş, sonbahar ağaçları, mangrov, dev mantarlar ve çalılar.
   Diğer türler agac.js'e (eski üretici ve fidanlar) devredilir. Rastgele sayı sırası 'yaprak' ve 'govde' aşamalarında aynıdır
   (komşu parçalarda aynı ağaç aynı biçimde kurulur). kisim: 'yaprak' | 'govde' | 'hepsi' */
import { karma3 } from '../rastgele.js';
import { DOGA41 } from '../bloklar.js';
import { agacKur } from './agac.js';

const D = DOGA41;
/* Türlerin parça sınırını aşan en geniş yarıçapı (yerleşim taraması bu kadar dışarıdan başlar) */
export const AGAC_YARICAP = 8;

/* Yuvarlak taç: merkez (cx, cy, cz), yatay yarıçap rx, dikey yarıçap ry; dış kabukta seyrek boşluklar */
function tac(set, cx, cy, cz, rx, ry, yaprak, tohum) {
  const RX = Math.ceil(rx), RY = Math.ceil(ry);
  for (let dy = -RY; dy <= RY; dy++) for (let dz = -RX; dz <= RX; dz++) for (let dx = -RX; dx <= RX; dx++) {
    const d = (dx * dx + dz * dz) / (rx * rx) + (dy * dy) / (ry * ry);
    if (d > 1) continue;
    if (d > 0.7 && karma3(tohum, cx + dx, cy + dy, cz + dz) < 0.3) continue;
    set(cx + dx, cy + dy, cz + dz, yaprak, true);
  }
}

export function agacKur2(set, x, y, z, tur, r, kisim = 'hepsi', yaprakId = 0) {
  const yap = kisim !== 'govde', gov = kisim !== 'yaprak';
  switch (tur) {
    /* Dev meşe: 2 x 2 gövde, iki-dört dal, geniş ve kabarık taç */
    case 'dev_mese': {
      const boy = 9 + Math.floor(r() * 6), yaprak = yaprakId || 9;
      const dallar = 2 + Math.floor(r() * 3), dl = [];
      for (let i = 0; i < dallar; i++) dl.push([r() * Math.PI * 2, 3 + Math.floor(r() * 2), boy - 3 - Math.floor(r() * 3)]);
      const rx = 4.2 + r() * 1.3;
      if (yap) {
        tac(set, x, y + boy, z, rx, 3.2, yaprak, 101);
        for (const [a, uz, h] of dl) tac(set, x + Math.round(Math.cos(a) * (uz + 1)), y + h + 2, z + Math.round(Math.sin(a) * (uz + 1)), 2.6, 2, yaprak, 102);
      }
      if (gov) {
        for (let k = -1; k < boy; k++) for (const [ax, az] of [[0, 0], [1, 0], [0, 1], [1, 1]]) set(x + ax, y + k, z + az, 8, false);
        /* Kök çıkıntıları */
        for (const [ax, az] of [[-1, 0], [2, 1], [1, -1], [0, 2]]) set(x + ax, y, z + az, 8, false);
        for (const [a, uz, h] of dl) for (let k = 1; k <= uz; k++) set(x + Math.round(Math.cos(a) * k), y + h + (k >> 1), z + Math.round(Math.sin(a) * k), 8, false);
      }
      return;
    }
    /* Dev ladin: 2 x 2 gövde, 18-28 blok, katmanlı konik taç */
    case 'dev_ladin': {
      const boy = 18 + Math.floor(r() * 11), yaprak = 11, alt = Math.floor(boy * 0.35);
      if (yap) {
        const tepe = y + boy;
        set(x, tepe + 1, z, yaprak, true); set(x + 1, tepe + 1, z + 1, yaprak, true);
        for (let yy = tepe; yy >= y + alt; yy--) {
          const k = tepe - yy, ry = Math.min(5.2, 1 + k * 0.22) * (k % 3 === 2 ? 0.7 : 1);
          for (let dz = -6; dz <= 7; dz++) for (let dx = -6; dx <= 7; dx++) {
            const ex = dx - 0.5, ez = dz - 0.5;
            if (ex * ex + ez * ez > ry * ry + 0.5) continue;
            set(x + dx, yy, z + dz, yaprak, true);
          }
        }
      }
      if (gov) for (let k = -1; k < boy; k++) for (const [ax, az] of [[0, 0], [1, 0], [0, 1], [1, 1]]) set(x + ax, y + k, z + az, 10, false);
      return;
    }
    /* Uzun ladin ve uzun huş: olağan biçim, daha yüksek */
    case 'uzun_ladin': {
      const boy = 10 + Math.floor(r() * 5);
      if (yap) {
        const tepe = y + boy;
        set(x, tepe + 1, z, 11, true);
        for (let yy = tepe; yy >= y + 3; yy--) {
          const k = tepe - yy, ry = k === 0 ? 1 : Math.min(3.4, 1 + k * 0.28) * (k % 2 ? 1 : 0.7);
          for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) if (dx * dx + dz * dz <= ry * ry + 0.4) set(x + dx, yy, z + dz, 11, true);
        }
      }
      if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, 10, false);
      return;
    }
    case 'uzun_hus': case 'sonbahar_hus': {
      const boy = (tur === 'uzun_hus' ? 7 : 5) + Math.floor(r() * 4), yaprak = yaprakId || 13;
      if (yap) {
        const ust = y + boy;
        for (let yy = ust - 3; yy <= ust + 1; yy++) {
          const ry = yy >= ust ? 1 : 2;
          for (let dz = -ry; dz <= ry; dz++) for (let dx = -ry; dx <= ry; dx++) {
            if (Math.abs(dx) === ry && Math.abs(dz) === ry && (yy >= ust || karma3(77, x + dx, yy, z + dz) < 0.5)) continue;
            set(x + dx, yy, z + dz, yaprak, true);
          }
        }
      }
      if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, 12, false);
      return;
    }
    /* Sonbahar meşesi ve olağan meşe çeşitlemesi: yuvarlak taç */
    case 'sonbahar_mese': case 'yuvarlak_mese': {
      const boy = 5 + Math.floor(r() * 4), yaprak = yaprakId || 9, rx = 2.6 + r() * 1.2;
      if (yap) tac(set, x, y + boy, z, rx, 2.4, yaprak, 103);
      if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, 8, false);
      return;
    }
    /* Mangrov: gövde sudan yükselen kavisli köklerin üstünde durur; taç geniş, uçları sarkar.
       y: su yüzeyinin bir üstü; zemin: köklerin indiği taban yüksekliği */
    case 'mangrov': {
      const boy = 5 + Math.floor(r() * 4), taban = y + 1;
      const kokler = [];
      for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (r() < 0.75) kokler.push([ax, az, 2 + Math.floor(r() * 2)]);
      const rx = 3.4 + r() * 1.2;
      if (yap) {
        tac(set, x, taban + boy, z, rx, 2.2, D.mangrovYaprak, 104);
        for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) {
          if (dx * dx + dz * dz < 9 || dx * dx + dz * dz > 17 || karma3(105, x + dx, y, z + dz) > 0.35) continue;
          const uz = 1 + Math.floor(karma3(106, x + dx, y, z + dz) * 3);
          for (let k = 0; k < uz; k++) set(x + dx, taban + boy - 2 - k, z + dz, D.mangrovYaprak, true);
        }
      }
      if (gov) {
        for (let k = 0; k < boy; k++) set(x, taban + k, z, D.mangrovKutuk, false);
        /* Kökler: gövdenin altından dışa ve aşağı kavis; tabana (su dibine) kadar iner */
        for (const [ax, az, uz] of kokler) {
          let px = x, py = taban, pz = z;
          for (let k = 1; k <= uz; k++) { px = x + ax * k; pz = z + az * k; py = taban - k + 1; set(px, py, pz, D.mangrovKok, false); }
          for (let yy = py - 1; yy >= py - 9; yy--) if (set(px, yy, pz, D.mangrovKok, 'kok') === false) break;
        }
        set(x, taban - 1, z, D.mangrovKok, false);
      }
      return;
    }
    /* Dev kırmızı mantar: sap ve kubbe biçimli şapka */
    case 'dev_mantar_kirmizi': {
      const boy = 5 + Math.floor(r() * 4), R = 2 + Math.floor(r() * 2);
      if (yap) for (let dy = 0; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
        const d = Math.sqrt(dx * dx + dz * dz + dy * dy * 1.6);
        if (d > R + 0.5 || d < R - 0.6) continue;
        set(x + dx, y + boy - 1 + dy, z + dz, D.kirmiziMantarBlok, true);
      }
      if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, D.mantarSap, false);
      return;
    }
    /* Dev kahverengi mantar: yassı, geniş şapka */
    case 'dev_mantar_kahve': {
      const boy = 4 + Math.floor(r() * 4), R = 3 + Math.floor(r() * 2);
      if (yap) for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
        if (Math.abs(dx) === R && Math.abs(dz) === R) continue;
        set(x + dx, y + boy, z + dz, D.kahveMantarBlok, true);
      }
      if (gov) for (let k = 0; k < boy; k++) set(x, y + k, z, D.mantarSap, false);
      return;
    }
    /* Çalı: yere yakın, alçak yaprak öbeği (0.41.5: kütüksüz; çoğu bir, bazıları iki blok yüksekliğinde) */
    case 'cali': {
      const yaprak = yaprakId || 9, rx = 0.9 + r() * 0.8, iki = r() < 0.25;
      if (yap) { tac(set, x, y, z, rx, 0.6, yaprak, 107); if (iki) set(x, y + 1, z, yaprak, true); }
      return;
    }
    default: agacKur(set, x, y, z, tur, r, kisim);
  }
}
