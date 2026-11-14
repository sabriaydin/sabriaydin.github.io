/* HungerMan - ortam sıcaklığı (0.22.0)
   Hissedilen sıcaklık (°C): biyom, mevsim, gün saati, yükseklik, yeraltı, yağış, su, ıslaklık, ısı kaynakları ve giysi yalıtımından hesaplanır.
   Vücut ısısı (oyun/hayatta.js) bu değere doğru yavaşça kayar. */
import { BY } from '../dunya/uretici.js';
import { DENIZ, diyarMi } from '../sabitler.js';

/* Biyomların ortalama gündüz sıcaklığı */
const BIYOM_ISI = {
  [BY.OKYANUS]: 16, [BY.DERIN]: 14, [BY.NEHIR]: 16, [BY.KUMSAL]: 22, [BY.KARLI_KUMSAL]: -2, [BY.DAG]: 6, [BY.TAYGA]: 2, [BY.COL]: 34,
  [BY.ORMAN]: 17, [BY.HUS]: 15, [BY.CAYIR]: 20, [BY.SAVAN]: 30, [BY.BATAKLIK]: 22, [BY.KARLI_OVA]: -8
};
const MEVSIM_ISI = [0, 7, -4, -12];   // ilkbahar, yaz, sonbahar, kış
/* Isı kaynakları: blok -> [en yakında eklenen °C, etki yarıçapı] (eksi değer soğutur) */
const KAYNAK = { 48: [20, 6], 46: [5, 3], 59: [24, 5], 521: [12, 4], 159: [3, 3], 219: [2, 2], 514: [3, 3], 595: [3, 3], 594: [6, 3], 189: [-7, 4], 197: [-5, 3] };
for (let k = 0; k < 4; k++) KAYNAK[564 + k] = [4, 3];
/* Zırh yalıtımı: deri sıcak tutar, metal az */
const YALITIM = id => (id >= 400 && id <= 403 ? 3 : id >= 404 && id <= 415 ? 1 : 0);

/* o: oyun nesnesi; dönen: { t: hissedilen, ortam, ates: yakında ısı kaynağı var mı } */
export function hissedilenSicaklik(o) {
  const p = o.oyuncu.konum, d = o.dunya, x = Math.floor(p.x), z = Math.floor(p.z), y = p.y;
  let t, ates = false;
  if (diyarMi(p.x)) t = 40;
  else {
    const k = d.uretici.kolon(x, z, {});
    t = BIYOM_ISI[k.b] ?? 15;
    const sicakBolge = k.b === BY.COL || k.b === BY.SAVAN;
    t += MEVSIM_ISI[o.mevsim || 0] * (sicakBolge ? 0.5 : 1);
    /* Gece soğuğu: çölde gece çok soğuktur */
    const gun = Math.min(1, Math.max(0, ((o.gunIsigi ?? 1) - 0.14) / 0.86));
    t += -(k.b === BY.COL ? 20 : sicakBolge ? 12 : 9) * (1 - gun) + 3 * gun;
    if (y > DENIZ + 28) t -= (y - DENIZ - 28) * 0.22;
    const ust = d.ustKati(x, z), kapali = ust > y + 2, yeralti = kapali && y < k.h - 4;
    if (yeralti) {
      const derin = Math.min(1, Math.max(0, (k.h - y) / 20));
      t += (11 - t) * (0.5 + 0.5 * derin);   // mağaralar serin ve dengeli
      if (y < 20) t += (20 - y) * 0.6;         // derinlerde yer ısısı
    } else if (kapali) t += 3;                 // çatı altı rüzgâr ve yağıştan korur
    else if (o.hava && o.hava.yogunluk > 0.3) t -= (o.hava.yagisTuru && o.hava.yagisTuru(p) === 2 ? 7 : 4) + (o.hava.firtina ? 2 : 0);
  }
  if (o.oyuncu.suda && !o.oyuncu.lavda) t -= 8;
  else if (o.hayatta.islak > 0) t -= 5;
  /* Isı kaynakları */
  let ek = 0;
  for (const m of d.yakinMesaleler(p.x, y + 1, p.z, 31)) {
    const ks = KAYNAK[d.blok(Math.floor(m[0]), Math.floor(m[1] - 0.6), Math.floor(m[2]))];
    if (!ks) continue;
    const u = Math.hypot(m[0] - p.x, m[1] - (y + 0.9), m[2] - p.z);
    if (u >= ks[1]) continue;
    ek += ks[0] * (1 - u / ks[1]);
    if (ks[0] >= 10 && u < ks[1] * 0.8) ates = true;
  }
  t += Math.max(-12, Math.min(30, ek));
  const ortam = t;
  /* Giysi yalıtımı */
  const yal = o.envanter.zirh.reduce((n, s) => n + (s ? YALITIM(s.id) : 0), 0);
  if (t < 18) t = Math.min(18, t + yal); else if (t > 28) t += yal * 0.15;
  return { t, ortam, ates };
}
