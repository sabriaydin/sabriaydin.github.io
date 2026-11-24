/* HungerMan - biyomlar ve iklim (dünya üreticilerinin ortak tanımları) */
import { DENIZ } from '../sabitler.js';

export const BIYOMLAR = ['Okyanus', 'Derin Okyanus', 'Nehir', 'Kumsal', 'Karlı Kumsal', 'Dağlar', 'Tayga', 'Çöl', 'Orman', 'Huş Ormanı', 'Çayır', 'Savan', 'Bataklık', 'Karlı Ova',
  /* 0.41.0: yeni üreticinin (sürüm 2) alt biyomları; kolon().ab alanında verilir, kolon().b ana biyomdur (iklim, canlılar, hava ve yapılar ana biyoma göredir) */
  'Çiçekli Çayır', 'Sık Orman', 'Sonbahar Ormanı', 'Kayalık Tepeler', 'Karlı Zirveler', 'Mangrov', 'Mantar Adası', 'Kızıl Kayalıklar', 'Göl', 'Taşlı Kıyı', 'Yalıyar'];
export const BY = { OKYANUS: 0, DERIN: 1, NEHIR: 2, KUMSAL: 3, KARLI_KUMSAL: 4, DAG: 5, TAYGA: 6, COL: 7, ORMAN: 8, HUS: 9, CAYIR: 10, SAVAN: 11, BATAKLIK: 12, KARLI_OVA: 13,
  CICEKLI: 14, SIK: 15, SONBAHAR: 16, KAYALIK: 17, KARLI_ZIRVE: 18, MANGROV: 19, MANTAR: 20, KIZIL: 21, GOL: 22, TASLI_KIYI: 23, YALIYAR: 24 };
/* Bir sütunun gösterilecek biyomu (alt biyom varsa o) */
export const biyomAdi = k => BIYOMLAR[k.ab ?? k.b];
/* Karla kaplı biyomlar (kar yağar, ağaçların üstünde kar katmanı oluşur) */
export const KARLI = new Set([BY.TAYGA, BY.KARLI_KUMSAL, BY.KARLI_OVA]);

/* İklim (0.13.0): sıcaklık ve nem geniş ölçekli, yumuşak gürültülerdir; yükseldikçe sıcaklık düşer.
   Biyom, sıcaklık kuşağı ve neme göre seçilir. Komşu kuşaklar birbirine uygun olduğundan çöl ile karlı bölgeler yan yana gelmez:
   soğuk (tayga, karlı ova) · serin (huş ormanı, çayır) · ılıman (orman, çayır, bataklık) · ılık (orman, çayır, savan) · sıcak (orman, savan, çöl) */
export const SICAK = { SOGUK: -0.3, SERIN: -0.08, ILIK: 0.22, SICAK: 0.4 };

/* Dağ zirvesi karla kaplı mı: yalnız serin iklimlerde ya da çok yüksek ve ılıman yerlerde */
export const karliZirve = o => (o.h > DENIZ + 56 && o.te < -0.05) || (o.h > DENIZ + 70 && o.te < 0.08);
/* Sıcaklık (yükseklik etkisi dahil) ve nemden kara biyomu */
export function iklimBiyomu(te, nem) {
  if (te < SICAK.SOGUK) return nem > -0.1 ? BY.TAYGA : BY.KARLI_OVA;
  if (te < SICAK.SERIN) return nem > 0.1 ? BY.HUS : BY.CAYIR;
  if (te < SICAK.ILIK) return nem > 0.02 ? BY.ORMAN : BY.CAYIR;
  if (te < SICAK.SICAK) return nem > 0.3 ? BY.ORMAN : nem > -0.12 ? BY.CAYIR : BY.SAVAN;
  return nem > 0.32 ? BY.ORMAN : nem > 0.0 ? BY.SAVAN : BY.COL;
}

