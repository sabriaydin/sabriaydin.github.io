/* HungerMan - Yapı Planı (0.31.0)
   Elde Yapı Planı varken:
   - Plan boşsa: sağ tık birinci köşeyi, ikinci sağ tık karşı köşeyi seçer; aradaki yapı plana kopyalanır (en çok 32 x 32 x 32).
   - Plan doluysa: bakılan yere yerleşimin çerçevesi gösterilir; sağ tık yapıyı kurar. R tuşu planı 90° döndürür.
     Kurulum için gereken bloklar çantadan harcanır (geliştirici modunda harcanmaz); dolu hücreler atlanır.
   - Eğilerek (C) sağ tık: plan ya da seçili köşe temizlenir.
   Plan tarayıcıda saklanır; bu sayede başka dünyalarda da kullanılabilir. */
import { THREE } from '../grafik/sahne.js';
import { BLOKLAR, ESYALAR, KATI, SIVI } from '../bloklar.js';

const SAKLA = 'hungerman_yapiPlani';
const UST = 32;

/* Bir bloğun döndürülmüş karşılığı: yön (yon) bir artırılır; çit kapısında eksen değişir */
let DONME = null;
const DISARI = new Set(['id', 'yon', 'gizli', 'onYon', 'taban', 'harita', 'eksen', 'ters', 'kok', 'boya', 'dusur']);
const imza = b => JSON.stringify(Object.entries(b).filter(([k, v]) => typeof v !== 'function' && !DISARI.has(k)));
function donmeKur() {
  DONME = new Map();
  const yonlu = new Map(), eksenli = new Map();
  for (const b of BLOKLAR) {
    if (!b) continue;
    if (b.yon != null) yonlu.set(imza(b) + '|' + b.yon, b.id);
    if (b.eksen != null) eksenli.set(imza(b) + '|' + b.eksen, b.id);
  }
  for (const b of BLOKLAR) {
    if (!b) continue;
    let y = null;
    if (b.yon != null) y = yonlu.get(imza(b) + '|' + ((b.yon + 1) % 4));
    else if (b.eksen != null) y = eksenli.get(imza(b) + '|' + (1 - b.eksen));
    if (y != null) DONME.set(b.id, y);
  }
}
export function dondurId(id, r) { if (!DONME) donmeKur(); for (let i = 0; i < r; i++) id = DONME.get(id) ?? id; return id; }

/* Bloğun kurulması için harcanan eşya (0: harcanmaz, -1: plana alınmaz) */
export function planEsyasi(id) {
  const b = BLOKLAR[id];
  if (!b || !id) return -1;
  if (SIVI[id] || b.cihaz || b.sertlik < 0 || b.gecit || id === 58 || b.ekin || b.sonraki) return -1;
  if (b.sekil === 'kapi' && b.ust) return 0;
  const tab = b.taban != null && ESYALAR[b.taban] && !ESYALAR[b.taban].gizli ? b.taban : id, e = ESYALAR[tab];
  return e && !e.gizli ? tab : -1;
}

export class YapiPlani {
  constructor(etk) {
    this.e = etk;   // Etkilesim
    this.kose = null;
    this.plan = null;
    try { const p = JSON.parse(localStorage.getItem(SAKLA) || 'null'); if (p && Array.isArray(p.b)) this.plan = p; } catch (e) { /* tarayıcı depolaması kapalı */ }
    this.kutu = null;
  }
  kaydet() { try { if (this.plan) localStorage.setItem(SAKLA, JSON.stringify(this.plan)); else localStorage.removeItem(SAKLA); } catch (e) { /* yok sayılır */ } }
  /* Döndürülmüş boyutlar */
  boyut(r) { const p = this.plan; return r % 2 ? [p.d, p.h, p.w] : [p.w, p.h, p.d]; }
  /* Kurulumun alt köşesi: bakılan hücrenin yanı, plan yatayda ortalanır */
  yer(h) {
    if (!h || !this.plan) return null;
    const hb = BLOKLAR[h.id];
    let x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (hb && hb.degistirilebilir) { x = h.x; y = h.y; z = h.z; }
    const r = this.e.donus % 4, [w, , d] = this.boyut(r);
    return { x: x - Math.floor((w - 1) / 2), y, z: z - Math.floor((d - 1) / 2), r };
  }
  /* Plandaki blokların dünya konumları */
  hucreler(Y) {
    const p = this.plan, r = Y.r, l = [];
    for (const [x, y, z, id] of p.b) {
      const [dx, dz] = r === 1 ? [p.d - 1 - z, x] : r === 2 ? [p.w - 1 - x, p.d - 1 - z] : r === 3 ? [z, p.w - 1 - x] : [x, z];
      l.push([Y.x + dx, Y.y + y, Y.z + dz, dondurId(id, r)]);
    }
    return l;
  }
  /* Sağ tık */
  kullan(h, g) {
    const E = this.e, A = E.arayuz;
    if (g && g.egil) {
      if (this.kose) { this.kose = null; A.bildirim('Yapı Planı: seçilen köşe temizlendi.'); }
      else if (this.plan) { this.plan = null; this.kaydet(); A.bildirim('Yapı Planı temizlendi: yeni bir yapı seçilebilir.'); }
      E.ses.tik && E.ses.tik();
      return true;
    }
    if (!this.plan) {
      if (!h) return false;
      if (!this.kose) { this.kose = [h.x, h.y, h.z]; A.bildirim(`Yapı Planı: birinci köşe (${h.x}, ${h.y}, ${h.z}). Karşı köşeye sağ tıklayınız.`); E.ses.koy('odun'); return true; }
      return this.kopyala(this.kose, [h.x, h.y, h.z]);
    }
    return this.kur(h);
  }
  kopyala(a, b) {
    const E = this.e, A = E.arayuz, d = E.dunya;
    const x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]), z0 = Math.min(a[2], b[2]);
    const w = Math.abs(a[0] - b[0]) + 1, h = Math.abs(a[1] - b[1]) + 1, dd = Math.abs(a[2] - b[2]) + 1;
    if (w > UST || h > UST || dd > UST) { A.bildirim(`Yapı Planı en çok ${UST} x ${UST} x ${UST} blok olabilir (seçilen: ${w} x ${h} x ${dd}).`); return true; }
    const l = [];
    for (let y = 0; y < h; y++) for (let z = 0; z < dd; z++) for (let x = 0; x < w; x++) {
      const id = d.blok(x0 + x, y0 + y, z0 + z);
      if (id && planEsyasi(id) >= 0) l.push([x, y, z, id]);
    }
    this.kose = null;
    if (!l.length) { A.bildirim('Seçilen alanda plana alınabilecek blok mevcut değil.'); return true; }
    this.plan = { w, h, d: dd, b: l, ad: `${w} x ${h} x ${dd}` };
    this.kaydet();
    E.ses.koy('odun');
    A.bildirim(`Yapı Planı kaydedildi: ${w} x ${h} x ${dd}, ${l.length} blok. Kurmak için bir yere sağ tıklayınız; R ile döndürülür.`);
    return true;
  }
  /* Gereken eşyalar: Map(eşya -> adet) ve kurulacak hücreler */
  hesap(Y) {
    const d = this.e.dunya, gerek = new Map(), kurulacak = [];
    for (const c of this.hucreler(Y)) {
      const [x, y, z, id] = c;
      if (y < 1 || y >= 127) continue;
      const q = d.blok(x, y, z), qb = BLOKLAR[q];
      if (q !== 0 && !(qb && qb.degistirilebilir) && !(SIVI[q] && q !== 59)) continue;
      const es = planEsyasi(id);
      if (es < 0) continue;
      kurulacak.push(c);
      if (es > 0) gerek.set(es, (gerek.get(es) || 0) + 1);
    }
    return { gerek, kurulacak };
  }
  kur(h) {
    const E = this.e, A = E.arayuz, d = E.dunya, env = E.envanter, Y = this.yer(h);
    if (!Y) return false;
    const { gerek, kurulacak } = this.hesap(Y);
    if (!kurulacak.length) { A.bildirim('Bu alanda kurulacak boş hücre mevcut değil.'); return true; }
    const bedava = !!E.aninda;
    if (!bedava) {
      const eksik = [];
      for (const [es, n] of gerek) { const v = env.say(es); if (v < n) eksik.push(`${ESYALAR[es].ad} ${n - v}`); }
      if (eksik.length) { A.bildirim(`Eksik malzeme: ${eksik.slice(0, 4).join(', ')}${eksik.length > 4 ? ` ve ${eksik.length - 4} çeşit daha` : ''}.`); return true; }
    }
    /* Alttan üste kurulur (kapının alt yarısı üstten önce) */
    kurulacak.sort((p, q) => p[1] - q[1]);
    const P = E.oyuncu;
    let n = 0;
    for (const [x, y, z, id] of kurulacak) {
      if (KATI[id] && P.hucreyiKapliyor(x, y, z)) continue;
      if (!d.blokKoy(x, y, z, id)) continue;
      const es = planEsyasi(id);
      if (!bedava && es > 0) env.harca(es, 1);
      if (BLOKLAR[id].sandik && A.sandikYerlesti) A.sandikYerlesti(x, y, z);
      n++;
    }
    E.ses.koy('tas');
    A.bildirim(`Yapı kuruldu: ${n} blok yerleştirildi.`);
    return true;
  }
  /* Çerçeve önizlemesi (her karede) */
  guncelle(etkin) {
    const E = this.e, sahne = E.sahne && E.sahne.sahne;
    if (!sahne) return;
    const e = ESYALAR[E.envanter.seciliId()];
    let kutu = null;
    if (etkin && e && e.tur === 'plan' && E.hedef && !E.hedefCanli) {
      if (this.plan) {
        const Y = this.yer(E.hedef), [w, h, d] = this.boyut(Y.r);
        kutu = { x: Y.x, y: Y.y, z: Y.z, w, h, d, c: 0x5ee08a };
      } else if (this.kose) {
        const k = this.kose, b = E.hedef, x0 = Math.min(k[0], b.x), y0 = Math.min(k[1], b.y), z0 = Math.min(k[2], b.z);
        const w = Math.abs(k[0] - b.x) + 1, h = Math.abs(k[1] - b.y) + 1, d = Math.abs(k[2] - b.z) + 1;
        kutu = { x: x0, y: y0, z: z0, w, h, d, c: w > UST || h > UST || d > UST ? 0xff5a4a : 0x4fb0ff };
      }
    }
    if (!kutu) { if (this.kutu) this.kutu.visible = false; return; }
    if (!this.kutu) {
      const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
      this.kutu = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x5ee08a, depthTest: false, transparent: true, opacity: 0.9 }));
      this.kutu.renderOrder = 6;
      sahne.add(this.kutu);
    }
    const K = this.kutu, s = 0.02;
    K.visible = true;
    K.material.color.setHex(kutu.c);
    K.scale.set(kutu.w + s, kutu.h + s, kutu.d + s);
    K.position.set(kutu.x + kutu.w / 2, kutu.y + kutu.h / 2, kutu.z + kutu.d / 2);
  }
  /* Bilgi satırı (HUD ipucu) */
  ipucu() {
    if (this.plan) return `Yapı Planı (${this.plan.ad}, ${this.plan.b.length} blok)<span>Sağ tık: kur · R: döndür · C + sağ tık: planı temizle</span>`;
    if (this.kose) return 'Yapı Planı<span>Karşı köşeye sağ tıklayınız · C + sağ tık: köşeyi temizle</span>';
    return 'Yapı Planı<span>Kopyalanacak yapının bir köşesine sağ tıklayınız</span>';
  }
}
