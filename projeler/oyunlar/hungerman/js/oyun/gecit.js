/* HungerMan - Diyar Geçidi (0.18.0)
   Obsidyenden dikdörtgen bir çerçeve (iç kısmı en az 2 × 3, en çok 21 × 21) kurulur; içine Çakmakla sağ tıklanınca geçit açılır.
   Geçidin içinde 2,5 saniye durulunca dünya ile Yeraltı Diyarı arasında geçilir (diyardaki 1 blok dünyadaki 8 bloktur).
   Varılan yerde 20 blok çevrede bir geçit varsa ona çıkılır; yoksa obsidyen bir platform ve yeni bir geçit kurulur.
   Çerçevesinden bir blok kırılınca geçit söner. */
import { BLOKLAR, KATI, OPAK, SIVI } from '../bloklar.js';
import { PY, DENIZ, DIYAR_X, DIYAR_SINIR, DUNYA_SINIRI, diyarMi } from '../sabitler.js';

const OBS = 515, GECIT = 516, BEKLE = 2.5;
const gecitMi = id => !!(BLOKLAR[id] && BLOKLAR[id].gecit);

export class Gecit {
  constructor(o) {
    Object.assign(this, o);   // dunya, oyuncu, ses, bildirim(m), gec(hedef)
    this.sayac = 0; this.cikmali = false; this.sesSayac = 0;
  }

  /* ---------- Açma ---------- */
  /* h: tıklanan blok (normaliyle); geçit açılırsa true */
  yak(h) {
    const d = this.dunya, x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz;
    if (d.blok(x, y, z) !== 0) return false;
    for (const e of [0, 1]) {
      const l = this.cerceve(x, y, z, e);
      if (!l) continue;
      for (const [a, b, c] of l) d.blokKoy(a, b, c, GECIT + e, 'gecit');
      this.ses.gecitAcil();
      if (this.olay) this.olay('gecit');
      return true;
    }
    this.bildirim('Geçit için obsidyenden dikdörtgen bir çerçeve gerekir (iç kısmı en az 2 × 3 blok).');
    return false;
  }
  /* Çerçevenin içindeki boş hücreler (eksen 0: x-y düzlemi, 1: z-y düzlemi); uygun değilse null */
  cerceve(x, y, z, e) {
    const d = this.dunya, ac = (u, w) => (e ? [x, w, u] : [u, w, z]);
    const u0 = e ? z : x, gor = new Set(), kuyruk = [[u0, y]], l = [];
    let au = u0, bu = u0, aw = y, bw = y;
    while (kuyruk.length) {
      const [u, w] = kuyruk.pop(), k = u + ',' + w;
      if (gor.has(k)) continue;
      gor.add(k);
      const [a, b, c] = ac(u, w), id = d.blok(a, b, c);
      if (id === OBS) continue;
      if (id !== 0 || l.length > 441) return null;
      l.push([a, b, c]);
      au = Math.min(au, u); bu = Math.max(bu, u); aw = Math.min(aw, w); bw = Math.max(bw, w);
      if (bu - au > 20 || bw - aw > 20) return null;
      kuyruk.push([u + 1, w], [u - 1, w], [u, w + 1], [u, w - 1]);
    }
    const gen = bu - au + 1, boy = bw - aw + 1;
    if (gen < 2 || boy < 3 || l.length !== gen * boy) return null;
    /* Kenarlar obsidyen olmalı (köşeler gerekmez) */
    for (let u = au; u <= bu; u++) for (const w of [aw - 1, bw + 1]) if (d.blok(...ac(u, w)) !== OBS) return null;
    for (let w = aw; w <= bw; w++) for (const u of [au - 1, bu + 1]) if (d.blok(...ac(u, w)) !== OBS) return null;
    return l;
  }
  /* Geçide komşu bir blok değişince: çerçeve bozulduysa bağlı bütün geçit blokları söner (tek oyunculu ve sunucu) */
  degisti(x, y, z, id, eski) {
    if (id === OBS || gecitMi(id) || !(eski === OBS || gecitMi(eski))) return;
    const d = this.dunya, kuyruk = [], gor = new Set();
    for (const [a, b, c] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (gecitMi(d.blok(x + a, y + b, z + c))) kuyruk.push([x + a, y + b, z + c]);
    while (kuyruk.length && gor.size < 600) {
      const [a, b, c] = kuyruk.pop(), k = a + ',' + b + ',' + c;
      if (gor.has(k) || !gecitMi(d.blok(a, b, c))) continue;
      gor.add(k);
      d.blokKoy(a, b, c, 0, 'gecit');
      kuyruk.push([a + 1, b, c], [a - 1, b, c], [a, b + 1, c], [a, b - 1, c], [a, b, c + 1], [a, b, c - 1]);
    }
    if (gor.size) this.ses.gecitSon();
  }

  /* ---------- İçinde durma ---------- */
  /* Geçidin içinde mi (ayak ya da baş hizası) */
  icinde() {
    const p = this.oyuncu.konum, d = this.dunya, x = Math.floor(p.x), z = Math.floor(p.z);
    return gecitMi(d.blok(x, Math.floor(p.y + 0.1), z)) || gecitMi(d.blok(x, Math.floor(p.y + 1.4), z));
  }
  /* Her karede; geçiş zamanı gelince true döner. Dönen değer 0..1: ekran efekti */
  guncelle(dt) {
    const ic = this.icinde();
    if (!ic) { this.cikmali = false; this.sayac = Math.max(0, this.sayac - dt * 2); return this.sayac / BEKLE; }
    if (this.cikmali) return 0;
    if (this.sayac === 0) this.ses.gecitUgultu();
    this.sayac += dt;
    this.sesSayac -= dt;
    if (this.sesSayac <= 0) { this.sesSayac = 1.1; this.ses.gecitUgultu(); }
    if (this.sayac >= BEKLE) {
      this.sayac = 0; this.cikmali = true;
      const p = this.oyuncu.konum, diyara = !diyarMi(p.x);
      this.gec(diyara ? { x: DIYAR_X + Math.floor(p.x / 8), z: Math.floor(p.z / 8), diyara } : { x: Math.floor((p.x - DIYAR_X) * 8), z: Math.floor(p.z * 8), diyara });
    }
    return Math.min(1, this.sayac / BEKLE);
  }
  /* Varış noktası sınırlar içinde */
  static sinirla(h) {
    const S = h.diyara ? DIYAR_SINIR - 12 : DUNYA_SINIRI - 40, X = h.diyara ? DIYAR_X : 0;
    h.x = Math.max(X - S, Math.min(X + S, h.x)); h.z = Math.max(-S, Math.min(S, h.z));
    return h;
  }

  /* ---------- Varış: parçalar yüklenince çağrılır ---------- */
  yerlestir(h) {
    const d = this.dunya, P = this.oyuncu;
    /* Çevrede geçit var mı */
    let en = null, ed = Infinity;
    for (let dz = -20; dz <= 20; dz++) for (let dx = -20; dx <= 20; dx++) {
      if (dx * dx + dz * dz > 400) continue;
      for (let y = 2; y < PY - 2; y++) if (gecitMi(d.blok(h.x + dx, y, h.z + dz)) && !gecitMi(d.blok(h.x + dx, y - 1, h.z + dz))) { const m = dx * dx + dz * dz; if (m < ed) { ed = m; en = [h.x + dx, y, h.z + dz]; } }
    }
    if (en) { P.konum.set(en[0] + 0.5, en[1], en[2] + 0.5); this.cikmali = true; return; }
    /* Yoksa kurulur */
    const [bx, by, bz] = this.yerBul(h);
    const K = (x, y, z, id) => d.blokKoy(x, y, z, id, 'gecit');
    for (let y = by; y <= by + 4; y++) for (let z = bz - 2; z <= bz + 2; z++) for (let x = bx - 2; x <= bx + 3; x++) K(x, y, z, 0);
    for (let z = bz - 1; z <= bz + 1; z++) for (let x = bx - 1; x <= bx + 2; x++) K(x, by - 1, z, OBS);
    for (let y = by - 1; y <= by + 3; y++) { K(bx - 1, y, bz, OBS); K(bx + 2, y, bz, OBS); }
    for (const x of [bx, bx + 1]) { K(x, by - 1, bz, OBS); K(x, by + 3, bz, OBS); }
    for (let y = by; y <= by + 2; y++) for (const x of [bx, bx + 1]) K(x, y, bz, GECIT);
    P.konum.set(bx + 1, by, bz + 1.5);
    this.cikmali = true;
  }
  /* Geçit kurulacak yer: hedefin yakınında, zemini katı ve üstü boş bir nokta */
  yerBul(h) {
    const d = this.dunya;
    const uygun = (x, y, z) => {
      if (!KATI[d.blok(x, y - 1, z)] || SIVI[d.blok(x, y - 1, z)]) return false;
      for (let k = 0; k < 4; k++) if (d.blok(x, y + k, z) !== 0 || d.blok(x + 1, y + k, z) !== 0) return false;
      return true;
    };
    if (h.diyara) {
      for (let r = 0; r <= 14; r += 2) for (let dz = -r; dz <= r; dz += 2) for (let dx = -r; dx <= r; dx += 2) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        for (let k = 0; k < 60; k++) { const y = 64 + (k % 2 ? -1 : 1) * Math.ceil(k / 2); if (y > 34 && y < PY - 8 && uygun(h.x + dx, y, h.z + dz)) return [h.x + dx, y, h.z + dz]; }
      }
      return [h.x, 64, h.z];   // bulunamazsa kayanın içine oyulur
    }
    /* Dünya: arazi yüzeyinin üstü (suda deniz seviyesinde platform) */
    return [h.x, Math.max(d.uretici.kolon(h.x, h.z, {}).h + 1, DENIZ + 1), h.z];
  }
}
