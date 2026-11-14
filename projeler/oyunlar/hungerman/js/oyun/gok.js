/* HungerMan - gök olayları (0.22.0)
   - Kanlı Ay: her mevsimin son gecesi (7, 14, 21... gün). Canavarlar kalabalık ve güçlüdür, uyunamaz. Sabaha kadar hayatta kalan ödüllendirilir.
   - Yıldız yağmuru: bazı açık gecelerde gökyüzünde sık sık yıldız kayar; o gece meteor düşme olasılığı yüksektir.
   - Meteor: açık gecelerde oyuncunun 35-80 blok uzağına düşer; krater açar, çekirdeğinde Yıldız Parçası veren Gök Taşı bulunur.
   - Kuzey ışıkları: karlı biyomlarda ve dağlarda ya da kışın açık gecelerde.
   Kanlı Ay ve yıldız yağmuru gün sayısından ve tohumdan hesaplanır (çok oyunculuda istemci de aynı sonucu bulur); meteoru sunucu düşürür. */
import { BLOKLAR, SIVI, KATI } from '../bloklar.js';
import { karma2 } from '../rastgele.js';
import { KARLI, BY } from '../dunya/uretici.js';
import { DENIZ, PY, diyarMi } from '../sabitler.js';

export const kanliAyGunu = gun => gun >= 7 && gun % 7 === 0;
export const yildizYagmuruGunu = (gun, tohum) => gun >= 2 && !kanliAyGunu(gun) && karma2((tohum ^ 0x51a7) >>> 0, gun, 7) < 0.16;
const KORUNAN = new Set([1, 515]);   // ana kaya, obsidyen
const AGAC = new Set([8, 9, 10, 11, 12, 13, 144, 145]);   // kütük ve yapraklar

export class GokOlaylari {
  constructor(o) {
    Object.assign(this, o);   // oyun(), sahne, ses, bildirim(m), koyYakin(x, z), yayinla(m) (sunucu: istemcilere gönderir), olay(k)
    this.kanli = 0; this.aurora = 0; this.kayanSayac = 3; this.meteorlar = []; this.meteorGece = -1; this.meteorZaman = 2; this.uyari = -1;
  }
  /* Bu an Kanlı Ay gecesi mi (gün batımından sabaha) */
  kanliAyMi(o) { return kanliAyGunu(o.gun) && o.zaman >= 0.5 && !diyarMi(o.oyuncu.konum.x); }
  guncelle(dt) {
    const o = this.oyun(); if (!o) return;
    const p = o.oyuncu.konum, diyar = diyarMi(p.x), H = o.hava;
    const acik = !diyar && H.yogunluk < 0.25, gece = o.zaman > 0.53 && o.zaman < 0.97;
    /* Kanlı Ay: yaklaşınca uyarı, gece boyunca kızıl gökyüzü */
    const kanliGun = kanliAyGunu(o.gun);
    if (kanliGun && o.zaman >= 0.38 && o.zaman < 0.5 && this.uyari !== o.gun) {
      this.uyari = o.gun;
      this.bildirim('Kanlı Ay yükseliyor! Bu gece canavarlar daha kalabalık ve güçlü olacak; uyunamaz.');
      this.ses.kanliAy();
    }
    const kh = this.kanliAyMi(o) ? Math.min(1, (o.zaman - 0.5) / 0.04) * Math.min(1, (1 - o.zaman) / 0.03) : 0;
    this.kanli += (kh - this.kanli) * Math.min(1, dt * 0.8);
    if (kh > 0.5 && !o.hayatta.olu) o.kanliIzlendi = o.gun;
    /* Kuzey ışıkları */
    let ah = 0;
    if (acik && gece && !o.oyuncu.basSuda) {
      const b = o.biyom;
      const soguk = KARLI.has(b) || b === BY.DAG || b === BY.KARLI_KUMSAL || o.mevsim === 3 || p.y > DENIZ + 60;
      if (soguk) ah = 0.55 + 0.45 * Math.sin(o.sure * 0.05 + o.gun);
    }
    this.aurora += (ah - this.aurora) * Math.min(1, dt * 0.25);
    if (this.aurora > 0.5) this.olay('aurora');
    /* Kayan yıldızlar */
    const yagmur = yildizYagmuruGunu(o.gun, o.tohum);
    if (acik && gece && !o.oyuncu.basSuda) {
      this.kayanSayac -= dt;
      if (this.kayanSayac <= 0) {
        this.kayanSayac = yagmur ? 0.25 + Math.random() * 1.2 : 5 + Math.random() * 14;
        this.sahne.kayanYildiz();
        if (Math.random() < 0.3) this.ses.kayanYildiz();
      }
    }
    if (yagmur && gece && acik && this.yagmurBildirim !== o.gun) { this.yagmurBildirim = o.gun; this.bildirim('Bu gece yıldız yağmuru var! Meteor düşebilir.'); }
    /* Meteor: tek oyunculuda ve sunucuda, açık bir gecede bir kez denenir */
    if (!o.istemci && !diyar && gece && acik) {
      if (this.meteorGece !== o.gun) { this.meteorGece = o.gun; this.meteorZaman = Math.random() < (yagmur ? 0.9 : 0.3) ? 0.56 + Math.random() * 0.36 : 2; }
      if (o.zaman >= this.meteorZaman) { this.meteorZaman = 2; this.meteorDusur(o); }
    }
    /* Düşmekte olan meteorlar */
    for (let i = this.meteorlar.length - 1; i >= 0; i--) {
      const m = this.meteorlar[i];
      m.t += dt;
      if (m.t >= m.sure && !m.carpti) { m.carpti = true; this.carpma(o, m); }
      if (m.t > m.sure + 0.2) this.meteorlar.splice(i, 1);
    }
    this.sahne.gokOlaylari(dt, { kanli: this.kanli, aurora: this.aurora, meteorlar: this.meteorlar, sure: o.sure });
  }
  /* Sunucu: oyunculardan birinin yakınında uygun bir düşüş yeri seçer */
  meteorDusur(o, kesin) {
    const konumlar = [o.oyuncu.konum, ...(o.ag && o.ag.konumlar ? o.ag.konumlar() : [])].filter(q => !diyarMi(q.x));
    if (!konumlar.length) return false;
    const d = o.dunya;
    for (let deneme = 0; deneme < 14; deneme++) {
      const merkez = konumlar[Math.floor(Math.random() * konumlar.length)], a = Math.random() * Math.PI * 2, r = kesin ? 18 + Math.random() * 10 : 35 + Math.random() * 45;
      const x = Math.floor(merkez.x + Math.cos(a) * r), z = Math.floor(merkez.z + Math.sin(a) * r);
      if (!d.yuklu(x, z) || this.koyYakin(x, z)) continue;
      let y = d.ustKati(x, z);
      while (y > 2 && AGAC.has(d.blok(x, y, z))) y--;   // ağaçların içinden geçer
      if (y < DENIZ || SIVI[d.blok(x, y + 1, z)] || y > PY - 12) continue;
      const m = { x: x + 0.5, y: y + 1, z: z + 0.5, aci: Math.random() * Math.PI * 2, sure: 3.2, t: 0 };
      this.meteorBaslat(m);
      if (this.yayinla) this.yayinla({ t: 'met', p: [m.x, m.y, m.z], a: Math.round(m.aci * 100) / 100 });
      return true;
    }
    return false;
  }
  /* Görsel ve ses (istemcide de çağrılır) */
  meteorBaslat(m) {
    m.t = m.t || 0; m.sure = m.sure || 3.2;
    this.meteorlar.push(m);
    if (this.istat) this.istat('meteor');
    const o = this.oyun(), p = o.oyuncu.konum, uz = Math.hypot(m.x - p.x, m.z - p.z);
    this.ses.meteorUguldu(Math.max(0.15, 1 - uz / 160));
    this.bildirim(uz < 160 ? `Gökyüzünden bir meteor düşüyor! (${Math.round(uz)} blok)` : 'Uzaklarda bir meteor düştü.');
  }
  /* Çarpma: krater ve gök taşı (yalnızca sunucuda), sarsıntı, ses ve hasar (her oyuncu kendi için) */
  carpma(o, m) {
    const p = o.oyuncu.konum, uz = Math.hypot(m.x - p.x, m.y - p.y, m.z - p.z);
    this.ses.meteorCarpma(Math.max(0.1, 1 - uz / 140));
    o.sarsinti = Math.max(o.sarsinti || 0, Math.max(0, 1 - uz / 80) * 1.2);
    o.meteorNoktasi = { x: Math.floor(m.x), z: Math.floor(m.z), son: o.sure + 900 };
    if (uz < 7 && !o.hayatta.olu) o.hayatta.hasar(Math.round(10 * (1 - uz / 7)) + 2, 'meteor');
    if (uz < 60) this.sahne.parlama(Math.max(0.25, 1 - uz / 60));
    for (let i = 0; i < 6; i++) o.dusenler.renkliParcacik([1, 0.55 + Math.random() * 0.3, 0.15], m.x + (Math.random() - 0.5) * 3, m.y + 0.5 + Math.random() * 2, m.z + (Math.random() - 0.5) * 3, 10);
    if (o.istemci) return;
    const d = o.dunya, cx = Math.floor(m.x), cy = Math.floor(m.y), cz = Math.floor(m.z), R = 3.3;
    for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) for (let dy = -4; dy <= 5; dy++) {
      const x = cx + dx, y = cy + dy, z = cz + dz;
      if (y < 2 || !d.yuklu(x, z)) continue;
      const b = d.blok(x, y, z), B = BLOKLAR[b];
      if (!b || KORUNAN.has(b) || (B && (B.sandik || B.yatak || B.mezar || B.istasyon))) continue;
      const u = Math.hypot(dx, (dy + 1) * 1.25, dz);
      if (u < R) d.blokKoy(x, y, z, 0);
      else if (u < R + 1.3 && KATI[b] && !KATI[d.blok(x, y + 1, z)] && Math.random() < 0.75) d.blokKoy(x, y, z, Math.random() < 0.18 ? 521 : Math.random() < 0.5 ? 6 : 3);   // kavrulmuş kenar
    }
    /* Çekirdek: gök taşı ve kızgın magma */
    const by = cy - 3;
    const cekirdek = [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]];
    for (const [a, b, c] of cekirdek) if (Math.random() < 0.85 || (a === 0 && c === 0)) d.blokKoy(cx + a, by + b, cz + c, 594);
    for (const [a, c] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) if (Math.random() < 0.4) d.blokKoy(cx + a, by, cz + c, 521);
  }
}
