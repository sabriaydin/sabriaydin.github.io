/* HungerMan - çok oyunculu ortak yardımcılar: oyuncu durum dizisi, yuvarlama, uzaktan gelen blok değişikliği efekti */
import { BLOKLAR, SIVI } from '../bloklar.js';
import { B } from './uzak-oyuncular.js';

export const r2 = n => Math.round(n * 100) / 100;
export const r3 = n => Math.round(n * 1000) / 1000;
export const v3 = p => [r2(p.x), r2(p.y), r2(p.z)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Yerel oyuncunun ağa gönderilen durumu: [x, y, z, yaw, pitch, eldeki, bayrak, tekne] */
export function durumDizisi(o) {
  const P = o.oyuncu, p = P.konum;
  let b = 0;
  if (P.egiliyor) b |= B.EGIL;
  if (P.kosuyor) b |= B.KOS;
  if (o.hayatta.olu) b |= B.OLU;
  if (o.yatakta || o.uyku > 0) b |= B.YATAK;
  if (o.etkilesim && o.etkilesim.vurus > 0) b |= B.VURUS;
  if (P.suda) b |= B.SUDA;
  if (P.basSuda) b |= B.BAS_SUDA;
  if (o.etkilesim && o.etkilesim.germe > 0) b |= B.GERME;
  const t = o.tekneler.binilen;
  return [r2(p.x), r2(p.y), r2(p.z), r3(P.yaw), r3(P.pitch), o.envanter.seciliId(), b, t && t.ni != null ? t.ni : -1];
}

/* Başka bir oyuncunun kırdığı / koyduğu blok yakındaysa ses ve parçacık */
export function blokEfekti(o, ses, x, y, z, id, eski) {
  const p = o.oyuncu.konum;
  if ((x + 0.5 - p.x) ** 2 + (y - p.y) ** 2 + (z + 0.5 - p.z) ** 2 > 18 * 18) return;
  if ((id === 0 || (SIVI[id] && !BLOKLAR[id].suIcinde)) && eski && BLOKLAR[eski] && !SIVI[eski]) {
    ses.kir(BLOKLAR[eski].ses);
    o.dusenler.parcacik(eski, x, y, z);
  } else if (id && BLOKLAR[id] && !SIVI[id] && !(BLOKLAR[id].ekin > 0) && !(BLOKLAR[id].tarla && BLOKLAR[eski] && BLOKLAR[eski].tarla)) ses.koy(BLOKLAR[id].ses);
}

/* Sandık yuvalarını ağ için diziye çevir / geri kur */
export const sandikDizi = y => y.map(s => (s ? [s.id, s.adet, s.dayanim ?? null] : null));
export const sandikKur = y => (y || []).map(s => (s ? { id: s[0], adet: s[1], ...(s[2] != null ? { dayanim: s[2] } : {}) } : null));
