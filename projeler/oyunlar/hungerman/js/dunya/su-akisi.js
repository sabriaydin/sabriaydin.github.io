/* HungerMan - akan su (0.30.5)
   Kaynak su (7) tükenmez; altı boşsa aşağı düşer (şelale), altı katıysa ya da su kaynağıysa yanlara 7 bloğa kadar yayılır (her adımda bir seviye azalır).
   Akan su beslendiği komşuya göre seviyesini yeniler; kaynağı kesilince çekilir. İki kaynak arasında, altı dolu bir akan su kaynağa dönüşür.
   Akan su yoluna çıkan ot ve çiçekleri siler; lava değerse lav kaynak suyla obsidyene, akan suyla parke taşa döner.
   Yalnızca tek oyunculuda ve sunucuda çalışır; değişiklikler blokKoy ile kaydedilir ve istemcilere yayılır.
   Güncellemeler sıradan saniyede 4 adımda (Minecraft'taki gibi) ve adım başına sınırlı sayıda işlenir. */
import { BLOKLAR, KATI, SIVI, LAV, BITKI, SU_SEVIYE, AKAN_SU, DUSEN_SU } from '../bloklar.js';
import { PB, PY, DENIZ } from '../sabitler.js';
/* 0.41.8: derin yeraltındaki (deniz seviyesinin 10 blok altı ve aşağısı) üretilmiş sular, parça yüklenince kendiliğinden akmaz; yanlarında
   bir blok değişince akar (Minecraft'taki gibi). Önceden yeraltı gölleri ve nehirleri yeni dünyada binlerce blok değişikliği ve kayıt şişmesi yapıyordu. */
const DERIN = DENIZ - 10;

const ADIM = 0.25, BUTCE = 600;
const YAN = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const OBSIDYEN = 515, PARKE = 15;
const kaynakMi = id => SU_SEVIYE[id] === 8 && !(BLOKLAR[id] && BLOKLAR[id].dusen);   // kaynak su ve su içi bitkiler
const akanMi = id => !!(BLOKLAR[id] && BLOKLAR[id].akis);
/* Suyun girebileceği hücre: boşluk ya da suyun silip geçtiği bitkiler */
const gecilir = id => id === 0 || (!!BLOKLAR[id] && !KATI[id] && !SIVI[id] && !LAV[id] && (BITKI[id] || BLOKLAR[id].degistirilebilir));

/* Bir noktadaki akıntı yönü (oyuncuyu sürükler): yüksek seviyeden alçağa */
export function akisVektoru(d, x, y, z) {
  const id = d.blok(x, y, z), L = SU_SEVIYE[id];
  if (!L || !akanMi(id) || BLOKLAR[id].dusen) return null;
  let fx = 0, fz = 0;
  for (const [a, c] of YAN) {
    const n = d.blok(x + a, y, z + c), m = SU_SEVIYE[n];
    if (m) { fx += a * (L - m); fz += c * (L - m); }
    else if (gecilir(n)) { fx += a * L; fz += c * L; }
  }
  const l = Math.hypot(fx, fz);
  return l > 0.01 ? [fx / l, fz / l] : null;
}

export class SuAkisi {
  constructor(dunya) {
    this.d = dunya;
    this.sira = new Set();
    this.sayac = 0;
    this.dinle = (x, y, z, id, eski) => {
      if (SU_SEVIYE[id] || SU_SEVIYE[eski] || LAV[id] || this.suKomsu(x, y, z)) this.ekleKomsular(x, y, z);
    };
    dunya.dinleyiciler.push(this.dinle);
    /* Yeni yüklenen parçada boşluğa bakan su: kenarları sıraya alınır (mağara ağızlarındaki ve uçurumdaki sular akar) */
    dunya.parcaYuklendi = p => this.parcaTara(p);
  }
  kapat() {
    const i = this.d.dinleyiciler.indexOf(this.dinle); if (i >= 0) this.d.dinleyiciler.splice(i, 1);
    if (this.d.parcaYuklendi) this.d.parcaYuklendi = null;
    this.sira.clear();
  }
  suKomsu(x, y, z) {
    const d = this.d;
    if (SU_SEVIYE[d.blok(x, y + 1, z)]) return true;
    for (const [a, c] of YAN) if (SU_SEVIYE[d.blok(x + a, y, z + c)]) return true;
    return false;
  }
  ekle(x, y, z) { if (y > 0 && y < PY - 1) this.sira.add(x + ',' + y + ',' + z); }
  ekleKomsular(x, y, z) {
    this.ekle(x, y, z); this.ekle(x, y - 1, z); this.ekle(x, y + 1, z);
    for (const [a, c] of YAN) this.ekle(x + a, y, z + c);
  }
  parcaTara(p) {
    const v = p.v, x0 = p.cx * PB, z0 = p.cz * PB, d = this.d;
    for (let i = 0; i < v.length; i++) {
      if (!SU_SEVIYE[v[i]]) continue;
      const lx = i % PB, lz = Math.floor(i / PB) % PB, y = Math.floor(i / (PB * PB));
      if (y < DERIN) continue;
      const x = x0 + lx, z = z0 + lz;
      let acik = gecilir(v[i - PB * PB]) || (akanMi(v[i]) && !SU_SEVIYE[v[i + PB * PB]]);
      if (!acik) for (const [a, c] of YAN) {
        const nx = lx + a, nz = lz + c;
        const n = nx >= 0 && nx < PB && nz >= 0 && nz < PB ? v[i + a + c * PB] : d.blok(x + a, y, z + c);
        if (gecilir(n)) { acik = true; break; }
      }
      if (acik) this.ekle(x, y, z);
    }
    /* 0.41.3: komşu parçaların bu parçaya bakan kenarındaki sular da sıraya alınır: önceden yüklenmiş komşudaki su, bu parça
       yüklenince boşluğa akabilir (nehir ve şelaleler parça sınırında yarıda kalmaz) */
    const kenar = [[-1, 0, 0, 0], [PB, 0, PB - 1, 0], [0, -1, 0, 0], [0, PB, 0, PB - 1]];
    for (const [ox, oz, ix, iz] of kenar) for (let k = 0; k < PB; k++) {
      const x = x0 + (ox === -1 || ox === PB ? ox : k), z = z0 + (oz === -1 || oz === PB ? oz : k);
      if (!d.yuklu(x, z)) continue;
      const lx = ox === -1 || ox === PB ? ix : k, lz = oz === -1 || oz === PB ? iz : k;
      for (let y = DERIN; y < PY - 1; y++) {
        const ic = v[(y * PB + lz) * PB + lx];
        if (!gecilir(ic) && !(akanMi(ic) && SU_SEVIYE[ic] < 7)) continue;
        if (SU_SEVIYE[d.blok(x, y, z)]) this.ekle(x, y, z);
      }
    }
  }
  guncelle(dt) {
    if (!this.sira.size) return;
    this.sayac += dt;
    if (this.sayac < ADIM) return;
    this.sayac = 0;
    const l = [];
    for (const k of this.sira) { l.push(k); if (l.length >= BUTCE) break; }
    for (const k of l) this.sira.delete(k);
    for (const k of l) { const [x, y, z] = k.split(',').map(Number); this.isle(x, y, z); }
  }
  /* Yanlara yayılabilir mi: altı katı ya da kaynak su */
  tabanli(x, y, z) { const b = this.d.blok(x, y - 1, z); return KATI[b] === 1 || kaynakMi(b); }
  koy(x, y, z, id) { if (this.d.blokKoy(x, y, z, id, 'su')) this.ekleKomsular(x, y, z); }
  isle(x, y, z) {
    const d = this.d;
    if (!d.yuklu(x, z)) return;
    let c = d.blok(x, y, z);
    /* 1) Akan suyun seviyesi beslendiği komşulara göre yenilenir */
    if (akanMi(c)) {
      let hedef = 0;
      if (SU_SEVIYE[d.blok(x, y + 1, z)]) hedef = DUSEN_SU;
      else {
        let m = 0, kaynak = 0;
        for (const [a, cc] of YAN) {
          const n = d.blok(x + a, y, z + cc), L = SU_SEVIYE[n];
          if (!L) continue;
          if (kaynakMi(n)) kaynak++;
          /* Komşu yalnızca kendisi yanlara yayılabiliyorsa besler */
          if (!this.tabanli(x + a, y, z + cc)) continue;
          m = Math.max(m, (BLOKLAR[n].dusen ? 8 : L) - 1);
        }
        if (kaynak >= 2 && this.tabanli(x, y, z)) hedef = 7;
        else if (m > 0) hedef = AKAN_SU(Math.min(7, m));
      }
      if (hedef !== c) { this.koy(x, y, z, hedef); c = hedef; }
    }
    const L = SU_SEVIYE[c];
    if (!L) return;
    /* 2) Aşağı düşer */
    const alt = d.blok(x, y - 1, z);
    if (gecilir(alt) || (akanMi(alt) && !BLOKLAR[alt].dusen)) { this.koy(x, y - 1, z, DUSEN_SU); return; }
    if (LAV[alt]) { this.koy(x, y - 1, z, kaynakMi(c) ? OBSIDYEN : PARKE); return; }
    /* 3) Yanlara yayılır (altı katı ya da kaynak suyken) */
    if (!this.tabanli(x, y, z)) return;
    const yeni = (BLOKLAR[c].dusen ? 8 : L) - 1;
    if (yeni < 1) return;
    for (const [a, cc] of YAN) {
      const nx = x + a, nz = z + cc;
      if (!d.yuklu(nx, nz)) continue;
      const n = d.blok(nx, y, nz);
      if (gecilir(n) || (akanMi(n) && !BLOKLAR[n].dusen && SU_SEVIYE[n] < yeni)) this.koy(nx, y, nz, AKAN_SU(yeni));
      else if (LAV[n]) this.koy(nx, y, nz, kaynakMi(c) ? OBSIDYEN : PARKE);
    }
  }
}
