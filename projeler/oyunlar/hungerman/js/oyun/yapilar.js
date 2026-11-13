/* HungerMan - yapı olayları (0.15.0): boss uyanması, haydut kampı muhafızları, ok tuzakları
   Tek oyunculuda ve çok oyunculu sunucuda çalışır; tüm oyuncuların konumlarına bakar.
   Yenilen bosslar dünya kaydında saklanır ve bir daha ortaya çıkmaz. */
import { THREE } from '../grafik/sahne.js';
import { yapilarAlan, YAPI_ADI } from '../dunya/yapi-uretici.js';
import { zindanlarAlan } from '../dunya/zindan-uretici.js';
import { TURLER } from '../varlik/turler.js';
import { karma3 } from '../rastgele.js';

/* Derin zindanların bir kısmında Taş Muhafız bekler */
export function zindanBossu(u, zd) { return !!zd.boss; }

export class YapiOlaylari {
  constructor(o) {
    Object.assign(this, o); // uretici, varliklar, dunya, ses, bildirim(m), olay(ad, veri)
    this.yenilen = new Set();
    this.kamplar = new Set();      // bu oturumda haydutları çıkmış kamplar
    this.tuzakBek = new Map();     // ok atıcı -> bekleme
    this.sayac = 0;
  }
  /* Belirli bir anahtarın bossu hayatta mı */
  bossVar(anahtar) { return this.varliklar.liste.some(v => v.bossAnahtar === anahtar && !v.olu); }
  bossDogur(anahtar, tur, p) {
    const v = this.varliklar.ekle(tur, p[0] + 0.5, p[1], p[2] + 0.5);
    v.bossAnahtar = anahtar;
    this.varliklar.dusenler.renkliParcacik([0.6, 0.5, 0.8], p[0] + 0.5, p[1] + 1, p[2] + 0.5, 30);
    if (this.ses) this.ses.gokGurultusu(0.5, false);
    if (this.olay) this.olay('bossUyandi', v);
  }
  bossOldu(v) {
    if (!v.bossAnahtar || this.yenilen.has(v.bossAnahtar)) return;
    this.yenilen.add(v.bossAnahtar);
    if (this.olay) this.olay('bossOldu', v);
  }

  /* konumlar: oyuncuların ayak konumları (THREE.Vector3) */
  guncelle(dt, konumlar) {
    for (const [k, t] of this.tuzakBek) { if (t - dt <= 0) this.tuzakBek.delete(k); else this.tuzakBek.set(k, t - dt); }
    for (const p of konumlar) this.tuzak(p);
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 0.5;
    if (this.varliklar.dogurmaKapali) return;
    const u = this.uretici;
    for (const p of konumlar) {
      for (const Y of yapilarAlan(u, p.x - 32, p.z - 32, p.x + 32, p.z + 32)) {
        const B = Y.boss;
        if (B && !this.yenilen.has(Y.anahtar) && !this.bossVar(Y.anahtar) && Math.hypot(p.x - B.p[0] - 0.5, p.z - B.p[2] - 0.5) < B.yakin && p.y >= B.alt && p.y <= B.ust && this.dunya.yuklu(B.p[0], B.p[2]))
          this.bossDogur(Y.anahtar, B.tur, B.p);
        /* Kamp: yaklaşan oyuncuya haydutlar çıkar (reis yenilmişse çıkmaz) */
        if (Y.tur === 'kamp' && !this.kamplar.has(Y.anahtar) && !this.yenilen.has(Y.anahtar) && Math.hypot(p.x - Y.x, p.z - Y.z) < 26 && this.dunya.yuklu(Y.x, Y.z)) {
          this.kamplar.add(Y.anahtar);
          for (const h of Y.haydutlar) this.varliklar.ekle('haydut', h[0] + 0.5, h[1], h[2] + 0.5);
          if (this.olay) this.olay('kamp', Y);
        }
      }
      /* Derin zindanlar: Taş Muhafız */
      for (const zd of zindanlarAlan(u, p.x - 20, p.z - 20, p.x + 20, p.z + 20)) {
        if (!zindanBossu(u, zd)) continue;
        const a = 'z' + zd.x + ',' + zd.y + ',' + zd.z;
        if (this.yenilen.has(a) || this.bossVar(a)) continue;
        if (Math.hypot(p.x - zd.x, p.z - zd.z) < 10 && Math.abs(p.y - zd.y - 1) < 5 && this.dunya.yuklu(zd.x, zd.z)) this.bossDogur(a, 'muhafiz', [zd.x, zd.y + 1, zd.z]);
      }
    }
  }

  /* Ok tuzağı: tuzak teline basılınca 7 blok içindeki ok atıcılar (aynı ya da bir üst sıra, aynı doğrultuda) baktıkları yöne ok atar */
  tuzak(p) {
    const d = this.dunya, x = Math.floor(p.x), y = Math.floor(p.y + 0.05), z = Math.floor(p.z);
    if (!d.yuklu(x, z) || !(d.blok(x, y, z) === 158)) return;
    for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let k = 1; k <= 7; k++) for (const dy of [0, 1]) {
      const bx = x + ax * k, by = y + dy, bz = z + az * k, id = d.blok(bx, by, bz);
      if (id !== 157) continue;
      const anahtar = bx + ',' + by + ',' + bz;
      if (this.tuzakBek.has(anahtar)) continue;
      this.tuzakBek.set(anahtar, 1.3);
      const c = new THREE.Vector3(bx + 0.5 - ax * 0.65, by + 0.5, bz + 0.5 - az * 0.65);
      /* Ok, atıcının baktığı yöne (tele dik doğrultuda) düz fırlar; oyuncuya nişan almaz (0.15.1) */
      const h = new THREE.Vector3(-ax + (Math.random() - 0.5) * 0.04, 0.03, -az + (Math.random() - 0.5) * 0.04).normalize().multiplyScalar(22);
      this.varliklar.okAt(c, h, 3, { turAd: 'tuzak', tur: { agu: false }, konum: c });
      if (this.ses) this.ses.yayAt();
    }
  }

  disaAktar() { return [...this.yenilen]; }
  iceAktar(l) { this.yenilen = new Set(Array.isArray(l) ? l.filter(k => typeof k === 'string') : []); }
}

export { YAPI_ADI, TURLER };
