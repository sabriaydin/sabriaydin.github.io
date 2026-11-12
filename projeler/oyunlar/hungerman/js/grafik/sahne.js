/* HungerMan - sahne: çizici, kamera, blok malzemeleri, gökyüzü (güneş, ay, yıldızlar, bulutlar), seçim kutusu, elde tutulan eşya */
import * as THREE from '../../lib/three.module.min.js';
import { atlas, catlaklar, simge } from './doku.js';
import { YUZ_DOKU, CIZIM, C_KUP, ESYALAR } from '../bloklar.js';
import { PY } from '../sabitler.js';
import { uretec } from '../rastgele.js';

export { THREE };
export const ISIK_SAYISI = 16;

const BLOK_VS = `
attribute vec2 isik;
varying vec2 vUv;
varying float vAo;
varying float vGok;
varying vec3 vDunya;
varying float vUzak;
void main() {
  vUv = uv; vAo = isik.x; vGok = isik.y;
  vec4 d = modelMatrix * vec4(position, 1.0);
  vDunya = d.xyz;
  vec4 mv = viewMatrix * d;
  vUzak = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const BLOK_FS = `
uniform sampler2D harita;
uniform float gun;
uniform vec3 gokRenk;
uniform vec3 sisRenk;
uniform float sisBas;
uniform float sisSon;
uniform float alfa;
uniform float zaman;
uniform float magara;
uniform vec4 isiklar[${ISIK_SAYISI}];
uniform float isikAdet;
varying vec2 vUv;
varying float vAo;
varying float vGok;
varying vec3 vDunya;
varying float vUzak;
void main() {
  vec2 uv = vUv;
  if (vAo > 1.5) { uv.x += sin(zaman * 0.7 + vDunya.z * 0.5) * 0.0012; uv.y += cos(zaman * 0.6 + vDunya.x * 0.5) * 0.0012; }
  #ifdef SU
    uv.x += sin(zaman * 1.3 + vDunya.z * 0.6) * 0.0015;
    uv.y += cos(zaman * 1.1 + vDunya.x * 0.6) * 0.0015;
  #endif
  vec4 t = texture2D(harita, uv);
  #ifndef SU
    if (t.a < 0.5) discard;
  #endif
  float m = 0.0;
  for (int i = 0; i < ${ISIK_SAYISI}; i++) {
    if (float(i) >= isikAdet) break;
    vec4 L = isiklar[i];
    if (L.w <= 0.0) continue;
    float d = distance(vDunya, L.xyz);
    float k = clamp(1.0 - d / (L.w * 0.9), 0.0, 1.0);
    m = max(m, k * k);
  }
  float ao = vAo;
  vec3 isik;
  if (ao > 1.5) { ao = ao - 1.0; isik = vec3(1.0); }   /* lav: kendi ışığıyla parlar */
  else {
    vec3 gokIsik = gokRenk * max(vGok * gun, magara);
    isik = max(gokIsik, vec3(1.0, 0.8, 0.55) * m * 1.05);
  }
  vec3 renk = t.rgb * ao * isik;
  float s = clamp((vUzak - sisBas) / (sisSon - sisBas), 0.0, 1.0);
  renk = mix(renk, sisRenk, s);
  gl_FragColor = vec4(renk, alfa);
}`;

const GOK_VS = `varying vec3 vY; void main(){ vY = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GOK_FS = `uniform vec3 ust; uniform vec3 ufuk; uniform vec3 gunesYon; uniform vec3 gunesHale; varying vec3 vY;
void main(){ float h = clamp(vY.y, -1.0, 1.0); vec3 c = mix(ufuk, ust, pow(clamp(h, 0.0, 1.0), 0.55)); if (h < 0.0) c = mix(ufuk, ufuk * 0.6, clamp(-h * 3.0, 0.0, 1.0));
float g = max(dot(vY, gunesYon), 0.0); c += gunesHale * pow(g, 12.0) * 0.6; gl_FragColor = vec4(c, 1.0); }`;

export class Sahne {
  constructor(tuval) {
    this.cizici = new THREE.WebGLRenderer({ canvas: tuval, antialias: false, powerPreference: 'high-performance' });
    this.cizici.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.cizici.info.autoReset = false;
    this.sahne = new THREE.Scene();
    this.kamera = new THREE.PerspectiveCamera(75, 1, 0.05, 1000);
    this.kamera.rotation.order = 'YXZ';
    this.sahne.add(this.kamera);
    const doku = new THREE.CanvasTexture(atlas());
    doku.magFilter = THREE.NearestFilter; doku.minFilter = THREE.NearestFilter; doku.generateMipmaps = false;
    this.atlasDoku = doku;
    const ortak = () => ({
      harita: { value: doku }, gun: { value: 1 }, gokRenk: { value: new THREE.Color(1, 1, 1) }, sisRenk: { value: new THREE.Color(0.7, 0.8, 1) },
      sisBas: { value: 80 }, sisSon: { value: 120 }, alfa: { value: 1 }, zaman: { value: 0 }, magara: { value: 0.07 },
      isiklar: { value: Array.from({ length: ISIK_SAYISI }, () => new THREE.Vector4(0, 0, 0, 0)) }, isikAdet: { value: 0 }
    });
    this.opakMalzeme = new THREE.ShaderMaterial({ uniforms: ortak(), vertexShader: BLOK_VS, fragmentShader: BLOK_FS });
    const su = ortak(); su.alfa.value = 0.74;
    this.suMalzeme = new THREE.ShaderMaterial({ uniforms: su, vertexShader: BLOK_VS, fragmentShader: BLOK_FS, transparent: true, depthWrite: false, defines: { SU: 1 } });
    this.malzemeler = [this.opakMalzeme, this.suMalzeme];
    this.dunyaGrubu = new THREE.Group();
    this.sahne.add(this.dunyaGrubu);
    this.gokyuzuKur();
    this.secimKur();
    this.elKur();
    this.boyut();
    addEventListener('resize', () => this.boyut());
  }

  boyut() {
    const w = innerWidth, h = innerHeight;
    this.cizici.setSize(w, h, false);
    this.kamera.aspect = w / h; this.kamera.updateProjectionMatrix();
    if (this.elKamera) { this.elKamera.aspect = w / h; this.elKamera.updateProjectionMatrix(); }
  }

  /* ---------- Gökyüzü ---------- */
  gokyuzuKur() {
    const g = new THREE.Group();
    this.gokMalzeme = new THREE.ShaderMaterial({
      uniforms: { ust: { value: new THREE.Color() }, ufuk: { value: new THREE.Color() }, gunesYon: { value: new THREE.Vector3(0, 1, 0) }, gunesHale: { value: new THREE.Color(0, 0, 0) } },
      vertexShader: GOK_VS, fragmentShader: GOK_FS, side: THREE.BackSide, depthWrite: false, fog: false
    });
    const kure = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), this.gokMalzeme);
    kure.renderOrder = -10; g.add(kure);
    /* Yıldızlar */
    const r = uretec(99), pts = [];
    for (let i = 0; i < 900; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); pts.push(Math.cos(a) * s * 450, Math.abs(u) * 450 + 10, Math.sin(a) * s * 450); }
    const yg = new THREE.BufferGeometry(); yg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.yildizMalzeme = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
    this.yildizlar = new THREE.Points(yg, this.yildizMalzeme); this.yildizlar.renderOrder = -9; g.add(this.yildizlar);
    /* Güneş ve ay: kare diskler */
    const kare = (renk, boy) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(boy, boy), new THREE.MeshBasicMaterial({ color: renk, transparent: true, depthWrite: false, fog: false })); m.renderOrder = -8; return m; };
    this.gunes = kare(0xfff3b8, 42); this.ay = kare(0xe6ecf5, 30);
    const hale = kare(0xffd27a, 90); hale.material.opacity = 0.18; this.gunes.add(hale); hale.position.z = -1;
    g.add(this.gunes, this.ay);
    this.gokGrubu = g;
    this.sahne.add(g);
    /* Bulutlar */
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const ctx = cv.getContext('2d'); const rr = uretec(7);
    const hucre = new Float32Array(64 * 64);
    for (let i = 0; i < 70; i++) { const cx = rr() * 64, cy = rr() * 64, rad = 2 + rr() * 5; for (let y = -8; y <= 8; y++) for (let x = -8; x <= 8; x++) if (x * x + y * y * 1.6 < rad * rad) hucre[((Math.floor(cy + y) + 64) % 64) * 64 + ((Math.floor(cx + x) + 64) % 64)] = 1; }
    ctx.fillStyle = '#fff';
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (hucre[y * 64 + x]) ctx.fillRect(x, y, 1, 1);
    const bd = new THREE.CanvasTexture(cv); bd.magFilter = THREE.NearestFilter; bd.minFilter = THREE.NearestFilter; bd.wrapS = bd.wrapT = THREE.RepeatWrapping; bd.repeat.set(4, 4);
    this.bulutMalzeme = new THREE.MeshBasicMaterial({ map: bd, transparent: true, opacity: 0.82, depthWrite: false, side: THREE.DoubleSide, alphaTest: 0.3, fog: false });
    this.bulut = new THREE.Mesh(new THREE.PlaneGeometry(3072, 3072), this.bulutMalzeme);
    this.bulut.rotation.x = -Math.PI / 2; this.bulut.renderOrder = -5;
    this.sahne.add(this.bulut);
  }

  /* Gün döngüsü: z = 0 gün doğumu, 0.25 öğle, 0.5 gün batımı, 0.75 gece yarısı */
  gokGuncelle(z, konum, suda, gorus, zamanSn) {
    const a = z * Math.PI * 2;
    const yuks = Math.sin(a);
    const gun = THREE.MathUtils.clamp(yuks * 2.2 + 0.35, 0.14, 1);
    const alacakaranlik = Math.max(0, 1 - Math.abs(yuks) * 4) * (Math.cos(a) > -2 ? 1 : 0);
    const gUst = new THREE.Color(0x6fa3ff), gUfuk = new THREE.Color(0xc4dcff);
    const nUst = new THREE.Color(0x03050c), nUfuk = new THREE.Color(0x0b1222);
    const sUfuk = new THREE.Color(0xf2955a);
    const k = THREE.MathUtils.smoothstep(yuks, -0.25, 0.25);
    const ust = nUst.clone().lerp(gUst, k), ufuk = nUfuk.clone().lerp(gUfuk, k);
    ufuk.lerp(sUfuk, alacakaranlik * 0.75);
    const gm = this.gokMalzeme.uniforms;
    gm.ust.value.copy(ust); gm.ufuk.value.copy(ufuk);
    const gy = new THREE.Vector3(Math.cos(a), yuks, 0.25).normalize();
    gm.gunesYon.value.copy(gy);
    gm.gunesHale.value.setRGB(1, 0.6, 0.3).multiplyScalar(alacakaranlik + 0.15 * k);
    this.yildizMalzeme.opacity = THREE.MathUtils.clamp(-yuks * 3, 0, 1) * 0.9;
    this.gokGrubu.position.copy(konum);
    this.gokGrubu.updateMatrixWorld(true);
    this.gunes.position.copy(gy).multiplyScalar(400); this.gunes.lookAt(konum);
    this.ay.position.copy(gy).multiplyScalar(-400); this.ay.lookAt(konum);
    /* Bulutlar oyuncuyu izler, doku kayar */
    this.bulut.position.set(konum.x, PY + 4, konum.z);
    const bk = this.bulutMalzeme.map;
    bk.offset.set((konum.x + zamanSn * 1.2) / 768 % 1, -(konum.z) / 768 % 1);
    this.bulutMalzeme.color.setScalar(0.1 + gun * 0.9).lerp(new THREE.Color(1, 0.75, 0.6), alacakaranlik * 0.4);
    /* Blok aydınlatması */
    const gokRenk = new THREE.Color(1, 1, 1).lerp(new THREE.Color(0.62, 0.7, 1), 1 - k).lerp(new THREE.Color(1, 0.82, 0.68), alacakaranlik * 0.5);
    const lav = suda === 'lav';
    /* suda === 'maske': dalış maskesi su altında görüşü uzatır */
    const maske = suda === 'maske';
    const sis = lav ? new THREE.Color(0.9, 0.32, 0.05) : suda ? new THREE.Color(0.08, 0.22, 0.44).multiplyScalar((maske ? 0.45 : 0.35) + gun * (maske ? 0.75 : 0.65)) : ufuk;
    const sisSon = lav ? 2.5 : maske ? 46 : suda ? 22 : gorus * 16 - 6, sisBas = lav ? 0 : maske ? 8 : suda ? 0 : sisSon * 0.62;
    for (const m of this.malzemeler) {
      const u = m.uniforms;
      u.gun.value = gun; u.gokRenk.value.copy(gokRenk); u.sisRenk.value.copy(sis); u.sisBas.value = sisBas; u.sisSon.value = sisSon; u.zaman.value = zamanSn;
    }
    this.cizici.setClearColor(sis);
    this.gokGrubu.visible = !suda; this.bulut.visible = !suda;
    this.kamera.far = Math.max(600, gorus * 16 + 40); this.kamera.updateProjectionMatrix();
    return gun;
  }

  isiklariAyarla(liste) {
    for (const m of this.malzemeler) {
      const a = m.uniforms.isiklar.value;
      for (let i = 0; i < ISIK_SAYISI; i++) { const L = liste[i]; if (L) a[i].set(L[0], L[1], L[2], L[3]); else a[i].set(0, 0, 0, 0); }
      m.uniforms.isikAdet.value = Math.min(liste.length, ISIK_SAYISI);
    }
  }

  /* ---------- Seçim kutusu ve çatlaklar ---------- */
  secimKur() {
    const kenar = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    this.secim = new THREE.LineSegments(kenar, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 }));
    this.secim.visible = false; this.sahne.add(this.secim);
    this.catlakDokular = catlaklar().map(c => { const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return t; });
    this.catlak = new THREE.Mesh(new THREE.BoxGeometry(1.006, 1.006, 1.006), new THREE.MeshBasicMaterial({ map: this.catlakDokular[0], transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    this.catlak.visible = false; this.sahne.add(this.catlak);
  }
  secimGoster(h, ilerleme) {
    if (!h) { this.secim.visible = false; this.catlak.visible = false; return; }
    this.secim.visible = true; this.secim.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5);
    if (ilerleme > 0) {
      this.catlak.visible = true; this.catlak.position.copy(this.secim.position);
      this.catlak.material.map = this.catlakDokular[Math.min(7, Math.floor(ilerleme * 8))];
    } else this.catlak.visible = false;
  }

  /* ---------- Elde tutulan eşya ---------- */
  /* El ayrı bir sahnede, kendi kamerasıyla ve derinlik temizlenerek en son çizilir; duvara yaklaşınca blokların içine girmez */
  elKur() {
    this.elSahne = new THREE.Scene();
    this.elKamera = new THREE.PerspectiveCamera(70, 1, 0.01, 10);
    this.elSahne.add(this.elKamera);
    this.el = new THREE.Group();
    this.el.position.set(0.42, -0.38, -0.62);
    this.elKamera.add(this.el);
    this.elKol = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.5), new THREE.MeshBasicMaterial({ color: 0xc89870 }));
    this.elKol.rotation.set(-0.25, 0.2, 0); this.elKol.position.set(0.04, -0.04, 0.1);
    this.elBlokMalzeme = new THREE.MeshBasicMaterial({ map: this.atlasDoku, alphaTest: 0.5 });
    this.elEsya = null; this.elId = -1;
    this.el.add(this.elKol);
    this.sallanma = 0;
  }
  elAyarla(id) {
    if (id === this.elId) return;
    this.elId = id;
    if (this.elEsya) { this.el.remove(this.elEsya); this.elEsya.geometry.dispose(); if (this.elEsya.material !== this.elBlokMalzeme) { this.elEsya.material.map && this.elEsya.material.map.dispose(); this.elEsya.material.dispose(); } this.elEsya = null; }
    this.elKol.visible = !id;
    if (!id) return;
    if (id < 256 && CIZIM[id] === C_KUP) {
      const g = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      /* BoxGeometry yüz sırası: +x, -x, +y, -y, +z, -z */
      const uv = g.attributes.uv;
      for (let f = 0; f < 6; f++) {
        const t = YUZ_DOKU[id * 6 + f], tx = t & 15, ty = t >> 4;
        for (let k = 0; k < 4; k++) {
          const i = f * 4 + k;
          uv.setXY(i, (tx + uv.getX(i)) / 16, 1 - (ty + 1 - uv.getY(i)) / 16);
        }
      }
      this.elEsya = new THREE.Mesh(g, this.elBlokMalzeme);
      this.elEsya.rotation.set(0.1, 0.75, 0);
      this.elEsya.position.set(0, 0.02, 0);
    } else {
      const t = new THREE.CanvasTexture(simge(id).cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
      this.elEsya = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
      const alet = ESYALAR[id] && ESYALAR[id].tur === 'alet';
      this.elEsya.rotation.set(0, alet ? -1.1 : -0.6, alet ? 0.35 : 0);
      this.elEsya.position.set(0.06, 0.06, 0);
    }
    this.el.add(this.elEsya);
  }
  /* sallanma: 0..1 vuruş animasyonu, yurume: adım fazı */
  elGuncelle(dt, vurus, yurume, isik, germe = 0) {
    const s = vurus > 0 ? Math.sin(vurus * Math.PI) : 0;
    const g = germe > 0 ? Math.min(1, germe) : 0;
    this.el.position.set(0.42 + Math.sin(yurume) * 0.012 - g * 0.22, -0.38 - Math.abs(Math.cos(yurume)) * 0.014 - s * 0.08 + g * 0.12, -0.62 + s * 0.06 + g * 0.08);
    this.el.rotation.set(-s * 0.9, -s * 0.25 + g * 0.5, g * 0.4 + (g >= 1 ? Math.sin(performance.now() / 40) * 0.01 : 0));
    const c = this.elKol.material.color; c.setRGB(0.78 * isik, 0.6 * isik, 0.44 * isik);
    this.elBlokMalzeme.color.setScalar(isik);
    if (this.elEsya && this.elEsya.material !== this.elBlokMalzeme) this.elEsya.material.color.setScalar(isik);
  }

  ciz() {
    const c = this.cizici;
    c.info.reset();
    c.render(this.sahne, this.kamera);
    if (this.el.visible) { c.autoClear = false; c.clearDepth(); c.render(this.elSahne, this.elKamera); c.autoClear = true; }
  }
}
