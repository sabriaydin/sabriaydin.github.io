/* HungerMan - 0.41.0: biyom atmosferi
   Ortam sesleri: ormanda ve çayırda gündüz kuş cıvıltıları, gece çekirgeler ve baykuşlar; taygada ve dağlarda gece kurt ulumaları,
   çölde ve kızıl kayalıklarda çöl rüzgârı ve gece çakallar; yükseklerde dağ rüzgârı; kıyıda martılar; nehir kıyısında dere,
   şelale yakınında hafif akarsu sesi. Görsel: bataklık ve mangrovda sis, gece ateş böcekleri; çölde gündüz sıcak hava dalgalanması.
   Ses düzeyleri biyomun ağırlığına (yakın sütunların payı) ve oyuncunun konumuna göre yumuşakça değişir. */
import { BY } from '../dunya/biyom.js';
import { DENIZ } from '../sabitler.js';
import { DUSEN_SU } from '../bloklar.js';
import { AtesBocekleri } from '../grafik/atesbocegi.js';

const ORMAN = new Set([BY.ORMAN, BY.SIK, BY.SONBAHAR, BY.HUS, BY.BATAKLIK, BY.MANGROV]);
const CAYIR = new Set([BY.CAYIR, BY.CICEKLI, BY.SAVAN]);
const SOGUK = new Set([BY.TAYGA, BY.KARLI_OVA, BY.KARLI_ZIRVE]);
const COL = new Set([BY.COL, BY.KIZIL]);
const KIYI = new Set([BY.KUMSAL, BY.TASLI_KIYI, BY.YALIYAR, BY.KARLI_KUMSAL]);
const ISLAK = new Set([BY.BATAKLIK, BY.MANGROV]);
const ORNEK = [[0, 0], [12, 0], [-12, 0], [0, 12], [0, -12], [9, 9], [-9, -9], [9, -9], [-9, 9]];

export class Ortam {
  constructor(sahne) {
    this.s = sahne;
    this.bocek = new AtesBocekleri(sahne);
    this.sayac = { kus: 3, gece: 6, uluma: 30, marti: 8, uzun: 0, tara: 0 };
    this.agirlik = {};   // biyom grubu -> 0..1 (çevredeki sütunların payı)
    this.sis = 0; this.sicak = 0; this.akarsu = 0; this.selale = 0;
  }
  /* Çevredeki sütunlardan biyom gruplarının payı (saniyede bir) */
  tara(o, P) {
    const U = o.dunya.uretici, k = {}, a = { orman: 0, cayir: 0, soguk: 0, col: 0, kiyi: 0, islak: 0, nehir: 0, dag: 0 };
    for (const [dx, dz] of ORNEK) {
      U.kolon(Math.floor(P.x) + dx, Math.floor(P.z) + dz, k);
      const ab = k.ab ?? k.b;
      if (ORMAN.has(ab)) a.orman++;
      if (CAYIR.has(ab)) a.cayir++;
      if (SOGUK.has(ab) || SOGUK.has(k.b)) a.soguk++;
      if (COL.has(ab)) a.col++;
      if (KIYI.has(ab) || (k.c > -0.12 && k.c < 0.05)) a.kiyi++;
      if (ISLAK.has(ab)) a.islak++;
      if (k.nh || k.gl) a.nehir++;
      if (k.b === BY.DAG) a.dag++;
    }
    for (const q in a) a[q] /= ORNEK.length;
    this.agirlik = a;
    /* Yakında düşen su (şelale) ve akan su */
    const d = o.dunya, x0 = Math.floor(P.x), y0 = Math.floor(P.y), z0 = Math.floor(P.z);
    let en = 99;
    for (let dy = -6; dy <= 8; dy += 2) for (let dz = -12; dz <= 12; dz += 2) for (let dx = -12; dx <= 12; dx += 2) {
      if (d.blok(x0 + dx, y0 + dy, z0 + dz) === DUSEN_SU) en = Math.min(en, Math.hypot(dx, dy, dz));
    }
    this.selale = en < 99 ? Math.max(0, 1 - en / 16) : 0;
    const g = o.oyuncu.gozKonumu();
    this.yeralti = d.ustKati(x0, z0) > g.y + 3;
  }
  guncelle(o, dt, ses, { gun, diyar, yagis, zamanSn }) {
    const yeralti = !!this.yeralti;
    const P = o.oyuncu.konum;
    this.sayac.tara -= dt;
    if (this.sayac.tara <= 0) { this.sayac.tara = 1; if (!diyar) this.tara(o, P); }
    const a = this.agirlik, acik = !diyar && !yeralti && !o.oyuncu.basSuda;
    const gece = gun < 0.4, gunduz = gun > 0.55;
    /* Görsel: sis, sıcak dalgası, ateş böcekleri */
    const sisH = acik ? (a.islak || 0) * (gece ? 1 : 0.7) * (1 - yagis * 0.3) : 0;
    this.sis += (sisH - this.sis) * Math.min(1, dt * 0.4);
    this.s.ortamSis = this.sis;
    const sicakH = acik && gunduz && yagis < 0.1 ? (a.col || 0) : 0;
    this.sicak += (sicakH - this.sicak) * Math.min(1, dt * 0.4);
    this.s.sicakDalga = this.sicak;
    const bocekH = acik && gece && yagis < 0.2 && o.mevsim !== 3 ? Math.min(1, (a.islak || 0) * 1.2 + (a.orman || 0) * 0.35 + (a.cayir || 0) * 0.25 + (a.nehir || 0) * 0.5) : 0;
    this.bocek.guncelle(dt, P, bocekH, (x, z) => o.dunya.ustKati(x, z), zamanSn);
    if (!acik || o.hayatta.olu) return;
    const S = this.sayac, sus = yagis > 0.3;
    /* Kuşlar (gündüz, ormanda ve çayırda) */
    S.kus -= dt;
    if (S.kus <= 0) {
      const w = (a.orman || 0) + (a.cayir || 0) * 0.6;
      S.kus = 4 + Math.random() * 9 / Math.max(0.3, w);
      if (gunduz && !sus && w > 0.1 && P.y < DENIZ + 110) ses.ortam(Math.random() < 0.12 && (a.soguk || a.cayir) ? 'karga' : 'kus', (0.35 + Math.random() * 0.4) * Math.min(1, w + 0.2));
    }
    /* Gece: çekirgeler (sürekli), baykuşlar */
    S.gece -= dt;
    if (S.gece <= 0) {
      S.gece = 18 + Math.random() * 26;
      if (gece && !sus && (a.orman || 0) > 0.3) ses.ortam('baykus', 0.4 + Math.random() * 0.3);
    }
    if (gece && !sus && ((a.cayir || 0) + (a.orman || 0) + (a.islak || 0)) > 0.3 && !(a.soguk > 0.5)) ses.ortam('cekirge', 0.28 + 0.25 * Math.min(1, (a.cayir || 0) + (a.islak || 0)), true);
    /* Gece uzaktan uluma: taygada kurtlar, çölde çakallar */
    S.uluma -= dt;
    if (S.uluma <= 0) {
      S.uluma = 35 + Math.random() * 55;
      if (gece && (a.soguk > 0.3 || a.dag > 0.5)) ses.ortam('kurt_uluma', 0.25 + Math.random() * 0.2);
      else if (gece && a.col > 0.3) ses.ortam('cakal', 0.3 + Math.random() * 0.2);
    }
    /* Kıyıda martılar */
    S.marti -= dt;
    if (S.marti <= 0) { S.marti = 7 + Math.random() * 16; if (gunduz && !sus && a.kiyi > 0.3 && Math.abs(P.y - DENIZ) < 20) ses.ortam('marti', 0.3 + Math.random() * 0.3); }
    /* Uzun döngüler: dağ rüzgârı (yükseklikle artar), çöl rüzgârı, dere ve şelale */
    const yuk = Math.max(0, Math.min(1, (P.y - (DENIZ + 60)) / 90));
    if (yuk > 0.05) ses.ortam('dag_ruzgar', 0.25 + 0.6 * yuk, true);
    if (a.col > 0.4 && !gece) ses.ortam('col_ruzgar', 0.35 * a.col, true);
    /* 0.41.9: şelale için ayrı kayıt kullanılmaz; nehir ve şelale yakınında yalnızca hafif akarsu sesi duyulur */
    const su = Math.max(this.selale, (a.nehir || 0) > 0.2 ? a.nehir : 0);
    if (su > 0.05) ses.ortam('dere', 0.06 + 0.1 * su, true);
  }
}
