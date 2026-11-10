/* HungerMan - canlı türleri: özellikler, yaşadıkları biyomlar, düşürdükleri eşyalar */
import { BY } from '../dunya/uretici.js';

const ar = (r, a, b) => a + Math.floor(r() * (b - a + 1));

export const TURLER = {
  inek: { ad: 'İnek', model: 'inek', gen: 0.45, boy: 1.4, can: 10, hiz: 1.2, kosu: 3.4, biyom: [BY.CAYIR, BY.HUS, BY.ORMAN], grup: [2, 4],
    dusur: r => [[271, ar(r, 1, 3)], [282, ar(r, 0, 2)]], ses: 'inek' },
  koyun: { ad: 'Koyun', model: 'koyun', gen: 0.45, boy: 1.3, can: 8, hiz: 1.2, kosu: 3.4, biyom: [BY.CAYIR, BY.HUS, BY.TAYGA, BY.DAG], grup: [2, 4],
    dusur: r => [[277, ar(r, 1, 2)], [49, 1]], ses: 'koyun' },
  domuz: { ad: 'Domuz', model: 'domuz', gen: 0.42, boy: 0.9, can: 10, hiz: 1.3, kosu: 3.5, biyom: [BY.CAYIR, BY.ORMAN], grup: [2, 3],
    dusur: r => [[273, ar(r, 1, 3)]], ses: 'domuz' },
  tavuk: { ad: 'Tavuk', model: 'tavuk', gen: 0.22, boy: 0.72, can: 4, hiz: 1.1, kosu: 3.2, biyom: [BY.CAYIR, BY.ORMAN, BY.HUS], grup: [2, 4],
    dusur: r => [[275, 1], [283, ar(r, 0, 2)]], ses: 'tavuk', yavasDus: true },
  tavsan: { ad: 'Tavşan', model: 'tavsan', gen: 0.2, boy: 0.55, can: 3, hiz: 1.8, kosu: 5.2, biyom: [BY.COL, BY.TAYGA, BY.CAYIR], grup: [1, 3],
    dusur: r => [[279, 1], ...(r() < 0.3 ? [[282, 1]] : [])], ses: 'tavsan', ziplar: true },
  kurt: { ad: 'Kurt', model: 'kurt', gen: 0.3, boy: 0.85, can: 8, hiz: 1.5, kosu: 5.0, biyom: [BY.TAYGA, BY.ORMAN], grup: [2, 4], notr: true, hasar: 4, menzil: 1.1, gorus: 20,
    dusur: r => (r() < 0.5 ? [[282, 1]] : []), ses: 'kurt' },
  zombi: { ad: 'Zombi', model: 'zombi', gen: 0.3, boy: 1.95, can: 20, hiz: 1.0, kosu: 2.6, dusman: true, hasar: 3, menzil: 1.0, gorus: 26, gunesteYanar: true,
    dusur: r => { const o = [[281, ar(r, 0, 2)]]; const s = r(); if (s < 0.025) o.push([261, 1]); else if (s < 0.06) o.push([259, 1]); else if (s < 0.08) o.push([257, 2]); return o; }, ses: 'zombi' }
};
export const HAYVANLAR = ['inek', 'koyun', 'domuz', 'tavuk', 'tavsan', 'kurt'];
export const OLUM_KAYNAK = { zombi: 'zombi', kurt: 'kurt' };
