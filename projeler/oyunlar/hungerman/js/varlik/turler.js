/* HungerMan - canlı türleri: özellikler, yaşadıkları biyomlar, düşürdükleri eşyalar */
import { BY } from '../dunya/uretici.js';
import { ESYA39, ESYA52 } from '../bloklar.js';

const ar = (r, a, b) => a + Math.floor(r() * (b - a + 1));

export const TURLER = {
  inek: { ad: 'İnek', model: 'inek', gen: 0.45, boy: 1.4, can: 10, hiz: 1.2, kosu: 3.4, biyom: [BY.CAYIR, BY.HUS, BY.ORMAN], grup: [2, 4],
    dusur: r => [[271, ar(r, 1, 3)], [282, ar(r, 0, 2)]], ses: 'inek', yem: [291, 367, 370], xp: 2 },
  koyun: { ad: 'Koyun', model: 'koyun', gen: 0.45, boy: 1.3, can: 8, hiz: 1.2, kosu: 3.4, biyom: [BY.CAYIR, BY.HUS, BY.TAYGA, BY.DAG], grup: [2, 4],
    dusur: r => [[277, ar(r, 1, 2)], [49, 1]], ses: 'koyun', yem: [291, 370, 267], xp: 2 },
  domuz: { ad: 'Domuz', model: 'domuz', gen: 0.42, boy: 0.9, can: 10, hiz: 1.3, kosu: 3.5, biyom: [BY.CAYIR, BY.ORMAN], grup: [2, 3],
    dusur: r => [[273, ar(r, 1, 3)]], ses: 'domuz', yem: [328, 329, 367, 376, 266], xp: 2 },
  tavuk: { ad: 'Tavuk', model: 'tavuk', gen: 0.22, boy: 0.72, can: 4, hiz: 1.1, kosu: 3.2, biyom: [BY.CAYIR, BY.ORMAN, BY.HUS], grup: [2, 4],
    dusur: r => [[275, 1], [283, ar(r, 0, 2)]], ses: 'tavuk', yavasDus: true, yem: [292, 368, 364, 373], xp: 1 },
  tavsan: { ad: 'Tavşan', model: 'tavsan', gen: 0.2, boy: 0.55, can: 3, hiz: 1.8, kosu: 5.2, biyom: [BY.COL, BY.TAYGA, BY.CAYIR], grup: [1, 3],
    dusur: r => [[279, 1], ...(r() < 0.3 ? [[282, 1]] : [])], ses: 'tavsan', ziplar: true, yem: [328, 27, 370, 374], xp: 1 },
  kurt: { ad: 'Kurt', kacar: true, model: 'kurt', gen: 0.3, boy: 0.85, can: 8, hiz: 1.5, kosu: 5.0, biyom: [BY.TAYGA, BY.ORMAN], grup: [2, 4], notr: true, hasar: 4, menzil: 1.1, gorus: 20,
    dusur: r => (r() < 0.5 ? [[282, 1]] : []), ses: 'kurt', xp: 3 },
  zombi: { ad: 'Zombi', model: 'zombi', gen: 0.3, boy: 1.95, can: 20, hiz: 1.0, kosu: 2.6, dusman: true, hasar: 3, menzil: 1.0, gorus: 26, gunesteYanar: true,
    dusur: r => { const o = [[281, ar(r, 0, 2)]]; const s = r(); if (s < 0.025) o.push([261, 1]); else if (s < 0.06) o.push([259, 1]); else if (s < 0.08) o.push([257, 2]); return o; }, ses: 'zombi', xp: 5 },
  iskelet: { ad: 'İskelet', model: 'iskelet', gen: 0.3, boy: 1.95, can: 20, hiz: 1.0, kosu: 2.4, dusman: true, uzak: true, hasar: 3, menzil: 15, gorus: 22, gunesteYanar: true,
    dusur: r => [[295, ar(r, 0, 2)], [287, ar(r, 0, 2)]], ses: 'iskelet', xp: 5 },
  orumcek: { ad: 'Mağara Örümceği', kacar: true, model: 'orumcek', gen: 0.55, boy: 0.8, can: 16, hiz: 1.4, kosu: 4.6, dusman: true, karanlikta: true, hasar: 2, agu: true, menzil: 0.9, gorus: 18, tirmanir: true,
    dusur: r => [[284, ar(r, 0, 2)], ...(r() < 0.25 ? [[295, 1]] : [])], ses: 'orumcek', xp: 5 },
  /* 0.14.0: biyoma özgü canavarlar ve yarasa */
  mumya: { ad: 'Mumya', model: 'mumya', aile: 'zombi', gen: 0.3, boy: 1.95, can: 20, hiz: 0.95, kosu: 2.5, dusman: true, hasar: 3, menzil: 1.0, gorus: 26, etki: ['aclik', 10],
    dusur: r => { const o = [[281, ar(r, 0, 2)]]; if (r() < 0.35) o.push([5, 1]); if (r() < 0.03) o.push([263, 1]); return o; }, ses: 'mumya', xp: 5 },
  bogulmus: { ad: 'Boğulmuş Zombi', model: 'bogulmus', aile: 'zombi', gen: 0.3, boy: 1.95, can: 20, hiz: 1.0, kosu: 2.6, dusman: true, hasar: 3, menzil: 1.0, gorus: 24, gunesteYanar: true, dalgic: true,
    dusur: r => { const o = [[281, ar(r, 0, 2)]]; const s = r(); if (s < 0.06) o.push([299, 1]); else if (s < 0.14) o.push([259, 1]); return o; }, ses: 'bogulmus', xp: 5 },
  buziskelet: { ad: 'Buz İskeleti', model: 'buziskelet', aile: 'iskelet', gen: 0.3, boy: 1.95, can: 20, hiz: 1.0, kosu: 2.4, dusman: true, uzak: true, hasar: 3, menzil: 15, gorus: 22, gunesteYanar: true, etki: ['yavas', 6],
    dusur: r => [[295, ar(r, 0, 2)], [287, ar(r, 0, 2)], ...(r() < 0.2 ? [[22, 1]] : [])], ses: 'buziskelet', xp: 5 },
  yarasa: { ad: 'Yarasa', model: 'yarasa', gen: 0.22, boy: 0.5, can: 6, hiz: 2.4, kosu: 5.2, dusman: true, ucar: true, hasar: 1, menzil: 0.8, gorus: 14, grup: [3, 6],
    dusur: r => (r() < 0.3 ? [[282, 1]] : []), ses: 'yarasa', xp: 2 },
  /* 0.15.0: haydutlar ve bosslar (boss: yetenek türü; kaybolmaz, geri itmeye dirençlidir) */
  haydut: { ad: 'Haydut', kacar: true, model: 'haydut', gen: 0.3, boy: 1.9, can: 22, hiz: 1.1, kosu: 3.2, dusman: true, hasar: 4, menzil: 1.0, gorus: 24,
    dusur: r => { const o = [[288, ar(r, 1, 4)], [293, ar(r, 0, 2)], [287, ar(r, 0, 3)]]; if (r() < 0.15) o.push([261, 1]); return o; }, ses: 'haydut', xp: 6 },
  firavun: { ad: 'Firavun', model: 'firavun', gen: 0.45, boy: 2.6, can: 140, hiz: 1.1, kosu: 2.9, dusman: true, boss: 'firavun', hasar: 6, menzil: 1.4, gorus: 30, etki: ['aclik', 12],
    dusur: r => [[458, 1], [263, ar(r, 4, 8)], [264, ar(r, 1, 3)], [288, ar(r, 10, 20)], [290, 1]], ses: 'firavun', xp: 60 },
  buzbuyucu: { ad: 'Buz Büyücüsü', model: 'buzbuyucu', gen: 0.35, boy: 2.3, can: 110, hiz: 1.0, kosu: 2.6, dusman: true, boss: 'buzbuyucu', uzak: true, hasar: 4, menzil: 18, gorus: 26, etki: ['yavas', 8],
    dusur: r => [[459, 1], [22, ar(r, 4, 8)], [264, ar(r, 1, 2)], [61, ar(r, 2, 5)], [288, ar(r, 8, 16)]], ses: 'buyucu', xp: 50 },
  reis: { ad: 'Haydut Reisi', model: 'reis', gen: 0.38, boy: 2.15, can: 150, hiz: 1.2, kosu: 3.4, dusman: true, boss: 'reis', hasar: 7, menzil: 1.3, gorus: 30,
    dusur: r => [[460, 1], [288, ar(r, 15, 30)], [261, ar(r, 3, 6)], [290, ar(r, 1, 2)], [264, ar(r, 0, 2)]], ses: 'reis', xp: 50 },
  /* 0.39.0: Lanetli Ada'nın tek bekçisi: mutasyon geçirmiş dev Kül Zombisi. Adaya bağlıdır (oyun/ada-bekcisi.js); yetenekleri: yere vuruş, magma yağmuru, kül fırtınası, hamle, kül zombisi çağırma */
  kuldev: { ad: 'Kül Devi', model: 'kuldev', aile: 'zombi', gen: 0.62, boy: 3.05, can: 260, hiz: 0.85, kosu: 2.3, dusman: true, boss: 'kuldev', atesBagisik: true, hasar: 8, menzil: 1.9, gorus: 30, yakar: 4,
    dusur: r => [[ESYA39.anahtar, 2], [515, ar(r, 3, 6)], [471, ar(r, 4, 8)], [472, ar(r, 1, 3)], [264, ar(r, 1, 3)], [288, ar(r, 15, 30)]], ses: 'kuldev', xp: 120 },
  muhafiz: { ad: 'Taş Muhafız', model: 'muhafiz', gen: 0.6, boy: 2.8, can: 180, hiz: 0.8, kosu: 1.9, dusman: true, boss: 'muhafiz', hasar: 9, menzil: 1.6, gorus: 24,
    dusur: r => [[461, 1, { koruma: 3 }], [261, ar(r, 4, 8)], [264, ar(r, 2, 4)], [61, ar(r, 3, 6)], [288, ar(r, 10, 20)]], ses: 'muhafiz', xp: 70 },
  hamsi: { ad: 'Hamsi', model: 'hamsi', gen: 0.12, boy: 0.25, can: 2, hiz: 2.0, kosu: 4.8, su: true, grup: [4, 8], dusur: () => [[297, 1]], ses: 'balik', xp: 1 },
  cipura: { ad: 'Çipura', model: 'cipura', gen: 0.18, boy: 0.4, can: 4, hiz: 1.5, kosu: 4.2, su: true, grup: [1, 2], dusur: r => [[297, ar(r, 1, 2)]], ses: 'balik', xp: 1 },
  ahtapot: { ad: 'Ahtapot', model: 'ahtapot', gen: 0.32, boy: 0.9, can: 8, hiz: 0.9, kosu: 3.6, su: true, grup: [1, 1], dusur: r => [[451, ar(r, 1, 2)]], ses: 'ahtapot', xp: 2 },
  kopekbaligi: { ad: 'Köpekbalığı', model: 'kopekbaligi', gen: 0.55, boy: 0.8, can: 24, hiz: 1.8, kosu: 5.4, su: true, dusman: true, hasar: 4, menzil: 1.3, gorus: 16, grup: [1, 1],
    dusur: r => [[297, ar(r, 1, 3)], ...(r() < 0.6 ? [[450, 1]] : [])], ses: 'kopekbaligi', xp: 6 },
  /* 0.16.0: evcil hayvanlar ve binek (sadik: sahibini izler, oturtulabilir; binek: ehlileştirilip eyerle binilir) */
  kopek: { ad: 'Köpek', model: 'kopek', gen: 0.3, boy: 0.85, can: 20, hiz: 1.6, kosu: 5.6, sadik: true, hasar: 4, menzil: 1.1, dusur: () => [], ses: 'kopek', mama: [271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281], xp: 0 },
  kedi: { ad: 'Kedi', model: 'kedi', gen: 0.22, boy: 0.6, can: 10, hiz: 1.3, kosu: 5.2, sadik: true, renkler: 5, biyom: [BY.CAYIR, BY.ORMAN, BY.HUS], grup: [1, 1], dusur: () => [], ses: 'kedi', mama: [297, 298], xp: 1 },
  at: { ad: 'At', model: 'at', gen: 0.55, boy: 1.6, can: 30, hiz: 1.4, kosu: 5.6, binek: true, renkler: 5, biyom: [BY.CAYIR, BY.SAVAN], grup: [2, 4],
    dusur: r => [[282, ar(r, 0, 2)]], ses: 'at', mama: [291, 266, 328, 290], xp: 2 },
  /* 0.18.0: Yeraltı Diyarı canavarları (ateşe ve lava dayanıklı; yakar: isabet eden oyuncuyu tutuşturur) */
  korruhu: { ad: 'Kor Ruhu', model: 'korruhu', gen: 0.35, boy: 1.5, can: 14, hiz: 1.4, kosu: 2.8, dusman: true, ucar: true, atesTopu: true, atesBagisik: true, hasar: 3, menzil: 1.2, gorus: 24, yakar: 2, grup: [1, 1],   // 0.30.6: zayıflatıldı
    dusur: r => [[471, ar(r, 0, 3)], ...(r() < 0.4 ? [[472, 1]] : [])], ses: 'korruhu', xp: 10 },
  kulzombi: { ad: 'Kül Zombisi', model: 'kulzombi', aile: 'zombi', gen: 0.3, boy: 1.95, can: 24, hiz: 1.05, kosu: 2.9, dusman: true, atesBagisik: true, lavYuzer: true, hasar: 4, menzil: 1.0, gorus: 26, yakar: 3,
    dusur: r => { const o = [[281, ar(r, 0, 2)]]; if (r() < 0.12) o.push([263, 1]); if (r() < 0.1) o.push([472, 1]); return o; }, ses: 'kulzombi', xp: 6 },
  /* 0.21.0: Arı: kovanından çıkar, çiçeklerden polen toplayıp kovanı bala doyurur; kızdırılırsa sokar ve zehirler */
  ari: { ad: 'Arı', model: 'ari', gen: 0.2, boy: 0.45, can: 6, hiz: 2.0, kosu: 4.4, ucar: true, ari: true, notr: true, hasar: 2, agu: true, menzil: 0.7, gorus: 18,
    dusur: () => [], ses: 'ari', xp: 1 },
  /* 0.51.0: Gezgin Tüccar (doğal olarak doğmaz; koy/gezgin.js sabahları getirir) */
  gezgin: { ad: 'Gezgin Tüccar', model: 'gezgin', gen: 0.3, boy: 1.9, can: 20, hiz: 0.6, kosu: 3.0, gezgin: true, dusur: () => [], ses: 'koylu' },
  /* 0.52.0: Bereket güncellemesi: yeni hayvanlar ve balıklar */
  keci: { ad: 'Keçi', model: 'keci', gen: 0.4, boy: 1.2, can: 8, hiz: 1.3, kosu: 3.8, biyom: [BY.DAG, BY.SAVAN], grup: [2, 3],
    dusur: r => [[ESYA52.keciEti, ar(r, 1, 2)], ...(r() < 0.4 ? [[282, 1]] : [])], ses: 'keci', yem: [291, 370, 328], xp: 2 },
  ordek: { ad: 'Ördek', model: 'ordek', gen: 0.22, boy: 0.62, can: 4, hiz: 1.0, kosu: 3.0, biyom: [BY.NEHIR, BY.BATAKLIK, BY.KUMSAL], grup: [2, 4],
    dusur: r => [[ESYA52.ordekEti, 1], [283, ar(r, 0, 2)]], ses: 'ordek', yavasDus: true, yem: [292, 368, ESYA52.pirinc], xp: 1 },
  hindi: { ad: 'Hindi', model: 'hindi', gen: 0.3, boy: 0.95, can: 6, hiz: 1.1, kosu: 3.2, biyom: [BY.ORMAN, BY.CAYIR], grup: [2, 3],
    dusur: r => [[ESYA52.hindiEti, ar(r, 1, 2)], [283, ar(r, 1, 2)]], ses: 'hindi', yem: [292, 368, 364], xp: 2 },
  geyik: { ad: 'Geyik', model: 'geyik', gen: 0.42, boy: 1.7, can: 12, hiz: 1.4, kosu: 5.4, biyom: [BY.ORMAN, BY.HUS, BY.TAYGA], grup: [1, 3],
    dusur: r => [[ESYA52.geyikEti, ar(r, 1, 3)], ...(r() < 0.35 ? [[ESYA52.boynuz, 1]] : []), ...(r() < 0.4 ? [[282, 1]] : [])], ses: 'geyik', yem: [291, 266, 370], xp: 3 },
  yaban: { ad: 'Yaban Domuzu', kacar: true, model: 'yaban', gen: 0.42, boy: 0.95, can: 14, hiz: 1.3, kosu: 4.4, biyom: [BY.ORMAN], grup: [1, 3], notr: true, hasar: 3, menzil: 1.1, gorus: 16,
    dusur: r => [[ESYA52.yabanEti, ar(r, 1, 3)], ...(r() < 0.4 ? [[282, 1]] : [])], ses: 'yaban', yem: [329, 328, 266], xp: 3 },
  tilki: { ad: 'Tilki', model: 'tilki', gen: 0.24, boy: 0.62, can: 8, hiz: 1.5, kosu: 5.4, biyom: [BY.TAYGA], grup: [1, 2],
    dusur: r => (r() < 0.6 ? [[ESYA52.tilkiKurku, 1]] : []), ses: 'tilki', yem: [275, 279, 374, 378], xp: 2 },
  ayi: { ad: 'Boz Ayı', kacar: true, model: 'ayi', gen: 0.62, boy: 1.5, can: 34, hiz: 1.1, kosu: 4.4, biyom: [BY.TAYGA], grup: [1, 1], notr: true, hasar: 6, menzil: 1.4, gorus: 18,
    dusur: r => [[ESYA52.ayiPostu, 1], ...(r() < 0.5 ? [[483, ar(r, 1, 2)]] : [])], ses: 'ayi', xp: 6 },
  deve: { ad: 'Deve', model: 'deve', gen: 0.5, boy: 2.2, can: 20, hiz: 1.1, kosu: 3.6, biyom: [BY.COL, BY.SAVAN], grup: [1, 3],
    dusur: r => [[ESYA52.deveYunu, ar(r, 1, 3)], ...(r() < 0.4 ? [[282, 1]] : [])], ses: 'deve', yem: [291, 568, 266], xp: 2 },
  levrek: { ad: 'Levrek', model: 'levrek', gen: 0.18, boy: 0.4, can: 4, hiz: 1.6, kosu: 4.4, su: true, grup: [1, 3], dusur: r => [[ESYA52.levrek, 1]], ses: 'balik', xp: 1 },
  palamut: { ad: 'Palamut', model: 'palamut', gen: 0.16, boy: 0.35, can: 3, hiz: 2.0, kosu: 5.0, su: true, grup: [3, 6], dusur: r => [[ESYA52.palamut, 1]], ses: 'balik', xp: 1 },
  koylu: { ad: 'Köylü', model: 'koylu', gen: 0.3, boy: 1.9, can: 20, hiz: 1.0, kosu: 3.2, koylu: true, dusur: () => [], ses: 'koylu' }
};
export const HAYVANLAR = ['inek', 'koyun', 'domuz', 'tavuk', 'tavsan', 'kurt', 'at', 'kedi', 'keci', 'ordek', 'hindi', 'geyik', 'yaban', 'tilki', 'ayi', 'deve'];   // 0.52.0: yeni hayvanlar
export const DENIZ_CANLILARI = ['hamsi', 'cipura', 'ahtapot', 'kopekbaligi', 'levrek', 'palamut'];
export const OLUM_KAYNAK = { zombi: 'zombi', kurt: 'kurt' };
/* Dünyada doğan düşman canavarlar (görev, başarım ve sayım için) */
export const CANAVARLAR = ['zombi', 'iskelet', 'orumcek', 'mumya', 'bogulmus', 'buziskelet', 'yarasa', 'kopekbaligi', 'haydut', 'firavun', 'buzbuyucu', 'reis', 'muhafiz', 'korruhu', 'kulzombi'];
export const BOSSLAR = ['firavun', 'buzbuyucu', 'reis', 'muhafiz'];
