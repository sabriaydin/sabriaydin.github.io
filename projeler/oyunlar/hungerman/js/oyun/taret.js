/* HungerMan - Otomatik Taret (0.28.0)
   Çalışan (gücü yeten) taret, 16 blok içinde görüş hattındaki en yakın canavara ya da öfkeli hayvana döner ve 0,8 saniyede bir ok atar (4 hasar).
   Oyunculara, evcil hayvanlara ve köylülere ateş etmez. Ateş etme tek oyunculuda ve sunucuda yapılır; istemci yalnızca nişan alma
   görüntüsünü yerelde hesaplar (çalışma durumu sunucudan 'bo' iletisiyle gelir). */
import { THREE } from '../grafik/sahne.js';
import { BLOKLAR } from '../bloklar.js';

const MENZIL = 16, ATIS = 0.8, HIZ = 32, DONUS = 4.5;   // blok, sn, ok hızı, dönüş hızı (rad/sn)

export class Taretler {
  constructor(o) {
    Object.assign(this, o);   // dunya, varliklar, ses, yerel(): yerel oyuncu konumu, atesEder: tek oyunculu / sunucu mu
    this.durum = new Map();   // kök anahtarı -> { yaw, pitch, hedef, ara, bekleme }
  }
  /* Taretin kendi hücresi dışındaki görüş hattı */
  gorus(x0, y0, z0, ax, ay, az, bx, by, bz) {
    const d = Math.hypot(bx - ax, by - ay, bz - az), n = Math.ceil(d / 0.4);
    for (let i = 1; i < n; i++) {
      const t = i / n, x = Math.floor(ax + (bx - ax) * t), y = Math.floor(ay + (by - ay) * t), z = Math.floor(az + (bz - az) * t);
      if (x === x0 && y === y0 && z === z0) continue;
      if (this.dunya.kati(x, y, z)) return false;
    }
    return true;
  }
  /* calisiyor(k): taret gücü alıyor mu */
  guncelle(dt, calisiyor) {
    const d = this.dunya, V = this.varliklar, gorulen = new Set();
    for (const [k, [x, y, z]] of d.elektrikler) {
      const b = BLOKLAR[d.blok(x, y, z)];
      if (!b || b.cihaz !== 'taret' || b.parca) continue;
      gorulen.add(k);
      let s = this.durum.get(k);
      if (!s) { s = { yaw: -b.yon * Math.PI / 2, pitch: 0, hedef: null, ara: 0, bekleme: 0.5 }; this.durum.set(k, s); }
      s.aktif = !!calisiyor(k);
      if (!s.aktif) { s.hedef = null; s.pitch += (-0.35 - s.pitch) * Math.min(1, dt * 2); continue; }   // güçsüzken namlu aşağı eğilir
      const ox = x + 0.5, oy = y + 0.68, oz = z + 0.5;
      /* Hedef seçimi */
      s.ara -= dt;
      if (s.ara <= 0 || (s.hedef && (s.hedef.olu || s.hedef.konum.distanceTo(new THREE.Vector3(ox, oy, oz)) > MENZIL + 1))) {
        s.ara = 0.4; s.hedef = null;
        let en = MENZIL * MENZIL;
        for (const v of V.liste) {
          if (v.olu || !(v.tur.dusman || v.ofkeli) || v.evcil || v.tur.koylu) continue;
          const hy = v.konum.y + (v.tur.boy || 1.6) * 0.6, d2 = (v.konum.x - ox) ** 2 + (hy - oy) ** 2 + (v.konum.z - oz) ** 2;
          if (d2 < en && this.gorus(x, y, z, ox, oy, oz, v.konum.x, hy, v.konum.z)) { en = d2; s.hedef = v; }
        }
      }
      s.bekleme -= dt;
      if (!s.hedef) { s.yaw += dt * 0.6; s.pitch += (0 - s.pitch) * Math.min(1, dt * 2); continue; }   // hedef yokken yavaşça tarar
      /* Nişan alma: ok düşüşü için hedefin biraz üstüne */
      const v = s.hedef, hy = v.konum.y + (v.tur.boy || 1.6) * 0.6, dx = v.konum.x - ox, dz = v.konum.z - oz, yatay = Math.hypot(dx, dz);
      const dy = hy - oy + yatay * yatay * 0.006;
      const hedefYaw = Math.atan2(-dx, -dz), hedefPitch = Math.atan2(dy, yatay);
      let fark = ((hedefYaw - s.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      s.yaw += Math.sign(fark) * Math.min(Math.abs(fark), DONUS * dt);
      s.pitch += (hedefPitch - s.pitch) * Math.min(1, dt * 6);
      if (Math.abs(fark) < 0.12 && s.bekleme <= 0 && this.atesEder) {
        s.bekleme = ATIS;
        const yon = new THREE.Vector3(-Math.sin(s.yaw) * Math.cos(s.pitch), Math.sin(s.pitch), -Math.cos(s.yaw) * Math.cos(s.pitch));
        const p = new THREE.Vector3(ox, oy, oz).addScaledVector(yon, 0.62);
        V.okAt(p, yon.multiplyScalar(HIZ), 4, false, null);
        const yer = this.yerel && this.yerel();
        if (yer && yer.distanceTo(p) < 24) this.ses.yayAt();
      }
    }
    for (const k of this.durum.keys()) if (!gorulen.has(k)) this.durum.delete(k);
  }
  aci(k) { return this.durum.get(k) || null; }
}
