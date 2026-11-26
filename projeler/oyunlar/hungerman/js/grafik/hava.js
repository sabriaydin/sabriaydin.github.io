/* HungerMan - hava durumu (0.33.0: bölgesel hava)
   Hava artık tüm dünyada aynı değildir: dünyanın üzerinde rüzgârla yavaşça sürüklenen ve zamanla büyüyüp dağılan yağış alanları (cepheler) vardır.
   Bir yerde güneş açıkken birkaç yüz blok ötede yağmur, daha ötede fırtına olabilir; yağış alanının kenarına yaklaşıldığında yağmur perdesi görünür.
   Oyuncunun bulunduğu yerdeki değerler (yogunluk, firtinaK, durum) gökyüzü, ses, ısı ve oyun kuralları için kullanılır.
   Parçacıklar (yağmur çizgileri, kar taneleri) tamamen ekran kartında hareket eder: her karede işlemci yükü yoktur.
   - Kaba doku (48 x 48 hücre, hücre 8 blok): zemin yüksekliği, yağmur ve kar yoğunluğu (biyoma göre: karlı yerlerde kar, çölde yağış yok).
   - İnce doku (96 x 96 sütun): kameranın çevresinde sütunların en üst bloğu; çatı ve ağaç altına yağmaz. Kareler arasında parça parça yenilenir.
   Durum tek oyunculuda ve sunucuda yürütülür; hava saati (t) ve elle ayarlanan hava çok oyunculu istemciye gönderilir. */
import { THREE } from './sahne.js';
import { BY, KARLI, karliZirve } from '../dunya/uretici.js';
import { KATI, SIVI } from '../bloklar.js';
import { PY, PB } from '../sabitler.js';

export const HAVA = ['acik', 'yagmur', 'firtina'];
export const HAVA_ADI = { acik: 'Açık', yagmur: 'Yağmurlu', firtina: 'Fırtınalı' };
/* Sütunun yağış türü: 2 kar, 1 yağmur, 0 yok (çöl) */
const karMi = k => KARLI.has(k.b) || k.te < -0.27 || (k.b === BY.DAG && karliZirve(k));
const KH = 8, KN = 48, FN = 96;   // kaba hücre boyu, kaba doku boyu, ince doku boyu
const RUZGAR = [0.55, 0.22];      // yağış alanlarının sürüklenme hızı (blok / sn)
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- Gürültü (değer gürültüsü) ---------- */
function karma(x, z, s) { let h = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ Math.imul(s, 982451653); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function gurultu(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = karma(xi, zi, s), b = karma(xi + 1, zi, s), c = karma(xi, zi + 1, s), d = karma(xi + 1, zi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* ---------- Parçacık gölgelendiricileri ---------- */
const VS = `
attribute vec4 tohum;
uniform vec3 kam; uniform float zaman, R, H, hiz, boy, tur, uzak, olcek;
uniform vec2 ruz;
uniform sampler2D kaba, ince;
varying float vA;
float sar(float b, float c, float L) { return b + L * floor((c - b) / L + 0.5); }
void main() {
  float x = sar(tohum.x * 2.0 * R + ruz.x * zaman, kam.x, 2.0 * R);
  float z = sar(tohum.z * 2.0 * R + ruz.y * zaman, kam.z, 2.0 * R);
  float y = sar(tohum.y * H - zaman * hiz * (0.85 + 0.3 * fract(tohum.x * 13.7)), kam.y + H * 0.15, H);
  if (tur > 1.5) { float f = tohum.x * 40.0 + tohum.z * 23.0; x += sin(zaman * 0.8 + f) * 0.6; z += cos(zaman * 0.6 + f) * 0.5; }
  vec2 kc = floor(vec2(x, z) / ${KH}.0);
  vec4 k = texture2D(kaba, (mod(kc, ${KN}.0) + 0.5) / ${KN}.0);
  float yog = tur < 1.5 ? k.g : k.b;
  float d = length(vec2(x, z) - kam.xz);
  float tepe = k.r * 255.0;
  if (uzak < 0.5 && d < ${FN / 2 - 2}.0) tepe = texture2D(ince, (mod(floor(vec2(x, z)), ${FN}.0) + 0.5) / ${FN}.0).r * 255.0;
  float gor = step(fract(tohum.x * 91.3 + tohum.z * 17.1), yog) * step(tepe + 1.0, y);
  vA = gor * (1.0 - smoothstep(R * 0.7, R, d)) * smoothstep(uzak > 0.5 ? 30.0 : 0.8, uzak > 0.5 ? 50.0 : 2.5, d);
  vec3 p = vec3(x, y, z) + tohum.w * vec3(-ruz.x * 0.05 * boy, boy, -ruz.y * 0.05 * boy);
  if (vA <= 0.001) p = vec3(kam.x, -1000.0, kam.z);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(olcek / max(0.5, -mv.z), 1.0, 6.0);
}`;
const FS_CIZGI = `
uniform vec3 renk; uniform float opak;
varying float vA;
void main() { if (vA <= 0.001) discard; gl_FragColor = vec4(renk, opak * vA); }`;
const FS_NOKTA = `
uniform vec3 renk; uniform float opak;
varying float vA;
void main() { vec2 c = gl_PointCoord - 0.5; float r = dot(c, c); if (vA <= 0.001 || r > 0.25) discard; gl_FragColor = vec4(renk, opak * vA * (1.0 - r * 2.4)); }`;

export class Hava {
  constructor(sahne, dunya) {
    this.sahne = sahne; this.dunya = dunya;
    this.tohum = dunya.uretici ? dunya.uretici.tohum | 0 : 1;
    this.t = ((this.tohum >>> 0) % 5000) * 3.7;   // hava saati (sn)
    this.zorla = null;   // elle ayarlanan hava: { d, k (kalan sn) }
    this.durum = 'acik'; this.sure = 0; this.hedefY = 0; this.hedefF = 0;
    this.yogunluk = 0; this.firtinaK = 0; this.simsekParla = 0; this.simsekSayac = 8;
    this.merkez = { x: 0, z: 0 };
    this.turOnbellek = new Map();
    this.grup = new THREE.Group(); this.grup.frustumCulled = false;
    sahne.sahne.add(this.grup);
    /* Dokular */
    this.kabaV = new Uint8Array(KN * KN * 4);
    this.kaba = new THREE.DataTexture(this.kabaV, KN, KN, THREE.RGBAFormat); this.kaba.magFilter = this.kaba.minFilter = THREE.NearestFilter; this.kaba.needsUpdate = true;
    this.inceV = new Uint8Array(FN * FN * 4);
    this.ince = new THREE.DataTexture(this.inceV, FN, FN, THREE.RGBAFormat); this.ince.magFilter = this.ince.minFilter = THREE.NearestFilter; this.ince.needsUpdate = true;
    this.inceAnahtar = new Float64Array(FN * FN).fill(NaN); this.inceSira = 0; this.kabaSayac = 0;
    /* Katmanlar: yakın yağmur, uzak yağmur perdesi, yakın kar, uzak kar */
    this.katmanlar = [
      this.katman('cizgi', 7000, { R: 40, H: 40, hiz: 19, boy: 0.62, tur: 1, uzak: 0, renk: 0xaab8cc, opak: 0.5 }),
      this.katman('cizgi', 6000, { R: 150, H: 110, hiz: 30, boy: 3.2, tur: 1, uzak: 1, renk: 0x9aa6b8, opak: 0.2 }),
      this.katman('nokta', 5000, { R: 36, H: 34, hiz: 1.9, boy: 0, tur: 2, uzak: 0, renk: 0xffffff, opak: 0.92, olcek: 34 }),
      this.katman('nokta', 4000, { R: 120, H: 80, hiz: 2.4, boy: 0, tur: 2, uzak: 1, renk: 0xf2f4f8, opak: 0.55, olcek: 30 })
    ];
    /* Yıldırım çizgisi */
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 6), 3));
    this.simsekMalzeme = new THREE.LineBasicMaterial({ color: 0xf2f6ff, transparent: true, opacity: 0, depthWrite: false });
    this.simsekCizgi = new THREE.LineSegments(sg, this.simsekMalzeme); this.simsekCizgi.frustumCulled = false; this.simsekCizgi.visible = false;
    this.grup.add(this.simsekCizgi);
    this.simsekOmur = 0;
    this.olaylar = { simsek: null };   // sunucu: yıldırım düştüğünde (x, y, z)
  }
  katman(tip, n, o) {
    const g = new THREE.BufferGeometry(), cizgi = tip === 'cizgi', v = cizgi ? 2 : 1;
    const t = new Float32Array(n * v * 4), p = new Float32Array(n * v * 3);
    for (let i = 0; i < n; i++) { const a = Math.random(), b = Math.random(), c = Math.random(); for (let j = 0; j < v; j++) t.set([a, b, c, j], (i * v + j) * 4); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('tohum', new THREE.BufferAttribute(t, 4));
    const u = { kam: { value: new THREE.Vector3() }, zaman: { value: 0 }, R: { value: o.R }, H: { value: o.H }, hiz: { value: o.hiz }, boy: { value: o.boy }, tur: { value: o.tur }, uzak: { value: o.uzak },
      olcek: { value: o.olcek || 0 }, ruz: { value: new THREE.Vector2() }, kaba: { value: this.kaba }, ince: { value: this.ince }, renk: { value: new THREE.Color(o.renk) }, opak: { value: o.opak } };
    const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: cizgi ? FS_CIZGI : FS_NOKTA, transparent: true, depthWrite: false });
    const nesne = cizgi ? new THREE.LineSegments(g, m) : new THREE.Points(g, m);
    nesne.frustumCulled = false; nesne.visible = false; nesne.taban = o.opak;
    this.grup.add(nesne);
    return nesne;
  }
  get yagiyor() { return this.durum !== 'acik'; }
  get firtina() { return this.durum === 'firtina'; }

  /* ---------- Bölgesel hava alanı ----------
     Döndürür: [yağış 0-1, fırtına 0-1]. Alanlar rüzgârla sürüklenir, uzun dalgalı bir gürültü de onları zamanla büyütüp küçültür. */
  alan(x, z) {
    if (this.zorla) { const d = this.zorla.d; return d === 'firtina' ? [1, 1] : d === 'yagmur' ? [1, 0] : [0, 0]; }
    const t = this.t, s = this.tohum;
    const ax = (x - t * RUZGAR[0]) / 620, az = (z - t * RUZGAR[1]) / 620;
    const a = gurultu(ax, az, s) * 0.68 + gurultu(ax * 2.3 + 17, az * 2.3 - 9, s ^ 0x55) * 0.32;
    const b = gurultu(x / 1700 + t / 2600, z / 1700 - t / 3300, s ^ 0x9e37);
    const v = a * 0.66 + b * 0.34 + (this.kis ? 0.03 : 0);
    return [smooth(0.57, 0.64, v), smooth(0.69, 0.75, v)];
  }
  /* ---------- 0.53.3: gök durumu ve rüzgâr (enerji üretimi için) ----------
     Bulutluluk, yağış alanlarıyla aynı gürültüden gelir: yağış alanının çevresi önce az, sonra çok bulutlu olur.
     gok(x, z): { bulut 0-1, yagis 0-1, firtina 0-1, ad, golge }; golge: geçen bulutların o anki gölgesi (0 açık, 1 tam gölge). */
  gok(x, z) {
    const [y, f] = this.alan(x, z);
    let bulut;
    if (this.zorla) bulut = this.zorla.d === 'acik' ? 0.05 : this.zorla.d === 'yagmur' ? 0.9 : 1;
    else {
      const t = this.t, s = this.tohum, ax = (x - t * RUZGAR[0]) / 620, az = (z - t * RUZGAR[1]) / 620;
      const v = (gurultu(ax, az, s) * 0.68 + gurultu(ax * 2.3 + 17, az * 2.3 - 9, s ^ 0x55) * 0.32) * 0.66 + gurultu(x / 1700 + t / 2600, z / 1700 - t / 3300, s ^ 0x9e37) * 0.34 + (this.kis ? 0.03 : 0);
      bulut = Math.max(y * 0.9, smooth(0.3, 0.57, v));
    }
    /* geçen bulutların gölgesi: bulutlarla aynı rüzgârla kayan ince gürültü */
    const g = gurultu((x - this.t * 3.2) / 55, (z - this.t * 1.3) / 55, (this.tohum || 1) ^ 0x6b3);
    const esik = 1 - bulut * 0.8, golge = bulut < 0.08 ? 0 : smooth(esik - 0.04, esik + 0.04, g) * (1 - smooth(0.75, 0.95, bulut));   // kapalı gökte gölge tek düzedir (geçirgenlikte)
    const ad = f > 0.5 ? 'Fırtınalı' : y > 0.5 ? 'Yağmurlu' : bulut > 0.72 ? 'Çok bulutlu' : bulut > 0.4 ? 'Parçalı bulutlu' : bulut > 0.15 ? 'Az bulutlu' : 'Açık';
    return { bulut, yagis: y, firtina: f, ad, golge };
  }
  /* Yerdeki rüzgâr hızı (m/sn): yavaş değişen temel rüzgâr (3-11), yağış ve fırtına cephesinde artar; esinti kısa süreli dalgalanmadır.
     Dönen: { ort: ortalama, hiz: esintili anlık hız, yon: esme yönü (radyan, x ekseninden) } */
  ruzgar(x, z) {
    const [y, f] = this.alan(x, z), t = this.t, s = this.tohum || 1;
    const ort = 3 + 8 * gurultu(x / 900 + t / 700, z / 900 - t / 900, s ^ 0x2b1) + y * 2 + f * 6;   // 0.53.5: 3-11 m/sn; yağışta +2, fırtınada +8
    const e = gurultu(x / 40 + t * 0.35, z / 40 - t * 0.2, s ^ 0x71) - 0.5, hiz = Math.max(0, ort * (1 + e * (0.3 + f * 0.25)));
    return { ort, hiz, yon: Math.atan2(RUZGAR[1], RUZGAR[0]) + (gurultu(t / 400, 3.1, s ^ 0x13) - 0.5) * 0.8 };
  }
  /* Elle hava ayarı (konsol, uyku, geliştirici): her yerde geçerli; süre dolunca bölgesel havaya dönülür */
  ayarla(durum, sure) {
    if (!HAVA.includes(durum)) return false;
    this.zorla = { d: durum, k: sure > 0 ? sure : 300 };
    if (durum === 'firtina') this.simsekSayac = 3 + Math.random() * 6;
    this.durumHesapla();
    return true;
  }
  disaAktar() { return { t: Math.round(this.t), z: this.zorla ? [this.zorla.d, Math.round(this.zorla.k)] : null }; }
  iceAktar(v) {
    if (!v) return;
    if (typeof v.t === 'number') { this.t = v.t; this.zorla = v.z && HAVA.includes(v.z[0]) ? { d: v.z[0], k: v.z[1] } : null; }
    else if (HAVA.includes(v.d) && v.d !== 'acik') this.zorla = { d: v.d, k: v.s > 0 ? v.s : 300 };   // eski kayıt: tüm dünyada aynı hava
  }
  /* Çok oyunculu: sunucunun gönderdiği hava saati ve elle ayarlanan hava */
  agVeri() { return [Math.round(this.t * 10) / 10, this.zorla ? this.zorla.d : 0, this.zorla ? Math.round(this.zorla.k) : 0]; }
  agUygula(m) {
    if (!Array.isArray(m)) return;
    if (Math.abs(m[0] - this.t) > 3) this.t = m[0];
    this.zorla = m[1] ? { d: m[1], k: m[2] } : null;
  }
  /* Oyuncunun yerindeki hava */
  durumHesapla() {
    const [y, f] = this.alan(this.merkez.x, this.merkez.z), tur = this.turAl(this.merkez.x, this.merkez.z);
    this.hedefY = tur === 0 ? 0 : y; this.hedefF = tur === 0 ? 0 : f;
    this.durum = this.hedefF > 0.5 ? 'firtina' : this.hedefY > 0.5 ? 'yagmur' : 'acik';
    this.sure = this.zorla ? this.zorla.k : 0;
  }

  /* Tek oyunculu ve sunucu: hava saati ilerler; fırtına alanlarında yıldırım düşer. merkezler: oyuncu konumları */
  zamanla(dt, merkezler) {
    if (!this.kilit) {
      this.t += dt;
      if (this.zorla) { this.zorla.k -= dt; if (this.zorla.k <= 0) this.zorla = null; }
    }
    this.simsekSayac -= dt;
    if (this.simsekSayac <= 0) {
      this.simsekSayac = 5 + Math.random() * 12;
      const m = merkezler[Math.floor(Math.random() * merkezler.length)];
      if (m) {
        const a = Math.random() * Math.PI * 2, r = 12 + Math.random() * 90;
        const x = Math.floor(m.x + Math.cos(a) * r), z = Math.floor(m.z + Math.sin(a) * r);
        if (this.alan(x, z)[1] > 0.6 && this.turAl(x, z) && this.dunya.yuklu(x, z)) {
          const y = this.ustBlok(x, z) + 1;
          if (this.olaylar.simsek) this.olaylar.simsek(x + 0.5, y, z + 0.5);
        }
      }
    }
  }

  /* Sütunun en üst katı ya da sıvı bloğu (parça dizisine doğrudan erişim) */
  ustBlok(x, z) {
    const p = this.dunya.parca(Math.floor(x / PB), Math.floor(z / PB));
    if (!p || !p.v) return 0;
    const v = p.v, b = (((z % PB) + PB) % PB) * PB + (((x % PB) + PB) % PB);
    for (let y = Math.min(PY - 1, p.ust ?? PY - 1); y > 0; y--) { const id = v[b + y * PB * PB]; if (KATI[id] || SIVI[id]) return y; }   // 0.51.2: en yüksek dolu katmandan başlar
    return 0;
  }
  /* Kaba hücrenin yağış türü ve zemin yüksekliği (önbellekli; kışın çöl ve savan dışında her yere kar) */
  hucre(cx, cz) {
    const k = cx * 100003 + cz;
    let c = this.turOnbellek.get(k);
    if (!c) {
      if (this.turOnbellek.size > 30000) this.turOnbellek.clear();
      const o = this.dunya.uretici.kolon(cx * KH + 4, cz * KH + 4, {});
      const tur = o.b === BY.COL ? 0 : karMi(o) || (this.kis && o.b !== BY.SAVAN) ? 2 : 1;
      c = [tur, Math.max(0, Math.min(250, o.h + 4))];
      this.turOnbellek.set(k, c);
    }
    return c;
  }
  turAl(x, z) { return this.hucre(Math.floor(x / KH), Math.floor(z / KH))[0]; }
  /* Kaba doku: kamera çevresindeki 48 x 48 hücre (toroidal dizin) */
  /* 0.50.0: kaba doku altı karede, sekizer satır güncellenir (önceden yarım saniyede bir tek karede 2304 hücre: ani takılma) */
  kabaGuncelle(c, j0 = 0, j1 = KN) {
    if (j0 === 0) { this.kabaB = [Math.floor(c.x / KH) - KN / 2, Math.floor(c.z / KH) - KN / 2]; if (this.kisOnce !== !!this.kis) { this.kisOnce = !!this.kis; this.turOnbellek.clear(); } }
    const V = this.kabaV, [bx, bz] = this.kabaB || [Math.floor(c.x / KH) - KN / 2, Math.floor(c.z / KH) - KN / 2];
    for (let j = j0; j < j1; j++) for (let i = 0; i < KN; i++) {
      const cx = bx + i, cz = bz + j, [tur, h] = this.hucre(cx, cz);
      const y = tur ? this.alan(cx * KH + 4, cz * KH + 4)[0] : 0;
      const o = ((((cz % KN) + KN) % KN) * KN + (((cx % KN) + KN) % KN)) * 4;
      V[o] = h; V[o + 1] = tur === 1 ? Math.round(y * 255) : 0; V[o + 2] = tur === 2 ? Math.round(y * 255) : 0; V[o + 3] = 255;
    }
    this.kaba.needsUpdate = true;
  }
  /* İnce doku: kamera çevresindeki 96 x 96 sütunun en üst bloğu; her karede bir bölümü yenilenir */
  inceGuncelle(c, butce) {
    const V = this.inceV, A = this.inceAnahtar, bx = Math.floor(c.x) - FN / 2, bz = Math.floor(c.z) - FN / 2;
    let n = 0, degisti = false;
    for (let s = 0; s < FN * FN && n < butce; s++) {
      const i = this.inceSira; this.inceSira = (this.inceSira + 1) % (FN * FN);
      const x = bx + (i % FN), z = bz + Math.floor(i / FN);
      const o = (((z % FN) + FN) % FN) * FN + (((x % FN) + FN) % FN), anahtar = x * 65536 + z;
      if (A[o] === anahtar && (s & 7)) continue;   // aynı sütun: sekizde bir yeniden okunur (yeni blok, kırılan çatı)
      A[o] = anahtar; V[o * 4] = this.dunya.yuklu(x, z) ? this.ustBlok(x, z) : 0; n++; degisti = true;
    }
    if (degisti) this.ince.needsUpdate = true;
  }

  /* Yıldırım görüntüsü: zikzak çizgi, gök parlaması ve uzaklığa göre gecikmeli gök gürültüsü */
  simsekGoster(x, y, z, dinleyici, ses) {
    const a = this.simsekCizgi.geometry.attributes.position.array;
    let px = x, py = Math.max(y + 60, PY + 20), pz = z, n = 0;
    const adim = (py - y) / 24;
    for (let i = 0; i < 24 && n < 48; i++) {
      const nx = i === 23 ? x : x + (Math.random() - 0.5) * 3.2, ny = py - adim, nz = i === 23 ? z : z + (Math.random() - 0.5) * 3.2;
      a.set([px, py, pz, nx, ny, nz], n * 6); n++;
      if (Math.random() < 0.22 && n < 48) { a.set([nx, ny, nz, nx + (Math.random() - 0.5) * 6, ny - adim * 1.5, nz + (Math.random() - 0.5) * 6], n * 6); n++; }
      px = nx; py = ny; pz = nz;
    }
    this.simsekCizgi.geometry.setDrawRange(0, n * 2);
    this.simsekCizgi.geometry.attributes.position.needsUpdate = true;
    this.simsekOmur = 0.32; this.simsekCizgi.visible = true;
    const d = dinleyici ? Math.hypot(dinleyici.x - x, dinleyici.z - z) : 50;
    this.simsekParla = Math.max(this.simsekParla, d < 160 ? 1 - d / 220 : 0.2);
    if (ses) setTimeout(() => ses.gokGurultusu(Math.max(0.15, 1 - d / 200), d < 30), Math.min(4000, d * 9));
  }

  /* Her karede: oyuncunun yerindeki havaya geçiş, dokular ve gölgelendirici değerleri, parlama */
  guncelle(dt, kamera, suda) {
    const c = kamera.position;
    this.merkez.x = c.x; this.merkez.z = c.z;
    this.durumHesapla();
    this.yogunluk += Math.sign(this.hedefY - this.yogunluk) * Math.min(Math.abs(this.hedefY - this.yogunluk), dt / 10);
    this.firtinaK += Math.sign(this.hedefF - this.firtinaK) * Math.min(Math.abs(this.hedefF - this.firtinaK), dt / 10);
    this.simsekParla = Math.max(0, this.simsekParla - dt * 3.2);
    if (this.simsekOmur > 0) {
      this.simsekOmur -= dt;
      this.simsekMalzeme.opacity = this.simsekOmur > 0 ? (Math.sin(this.simsekOmur * 60) > -0.3 ? 1 : 0.3) : 0;
      if (this.simsekOmur <= 0) this.simsekCizgi.visible = false;
    }
    this.kabaSayac -= dt;
    if (this.kabaSatir == null || this.kabaSatir >= KN) { if (this.kabaSayac <= 0) { this.kabaSayac = 0.5; this.kabaSatir = 0; } }
    if (this.kabaSatir < KN) { const j = this.kabaSatir; this.kabaSatir = Math.min(KN, j + 8); this.kabaGuncelle(c, j, this.kabaSatir); }
    /* 0.50.0: yağış yokken çatı dokusu yavaş yenilenir (önceden her karede 700 sütun okunuyordu) */
    this.inceGuncelle(c, this.yogunluk > 0.01 || this.hedefY > 0.01 ? 500 : 30);
    const k = 2.4 * (1 + this.firtinaK * 2), zs = this.t % 3600;
    for (const K of this.katmanlar) {
      K.visible = !suda;
      const u = K.material.uniforms;
      u.kam.value.copy(c); u.zaman.value = zs; u.ruz.value.set(RUZGAR[0] * k, RUZGAR[1] * k);
      u.opak.value = K.taban * (u.tur.value < 1.5 ? 0.7 + this.firtinaK * 0.3 : 1);
    }
  }
  /* Kamera açıkta mı (yağmur sesi boğuk mu) */
  acikta(p) { return this.ustBlok(Math.floor(p.x), Math.floor(p.z)) < p.y; }
  /* Bulunulan yerde yağış türü: 0 yok (çöl), 1 yağmur, 2 kar */
  yagisTuru(p) { return this.turAl(p.x, p.z); }

  temizle() {
    this.sahne.sahne.remove(this.grup);
    for (const m of [...this.katmanlar, this.simsekCizgi]) { m.geometry.dispose(); m.material.dispose(); }
    this.kaba.dispose(); this.ince.dispose();
  }
}
