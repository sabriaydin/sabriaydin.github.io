/* HungerMan - sahne: çizici, kamera, blok malzemeleri, gökyüzü (güneş, ay, yıldızlar, bulutlar), seçim kutusu, elde tutulan eşya */
import * as THREE from '../../lib/three.module.min.js';
import { atlas, catlaklar, simge } from './doku.js';
import { YUZ_DOKU, CIZIM, C_KUP, ESYALAR } from '../bloklar.js';
import { PY } from '../sabitler.js';
import { uretec } from '../rastgele.js';

export { THREE };
export const ISIK_SAYISI = 32;   // 0.15.2: aydınlatılmış büyük salonlar için 16'dan 32'ye

/* 0.23.0: rüzgâr: bitkilerin üst köşeleri (ışık değeri -1'in altında) ve yapraklar (-1 ile 0 arası) salınır; su yüzeyi dalgalanır */
const BLOK_VS = `
attribute vec2 isik;
uniform float zaman;
uniform float ruzgar;
varying vec2 vUv;
varying float vAo;
varying float vGok;
varying vec3 vDunya;
varying float vUzak;
void main() {
  float a = isik.x, sal = 0.0;
  if (a < -1.0) { sal = 1.0; a = -a - 1.0; } else if (a < 0.0) { sal = 0.3; a = -a; }
  vUv = uv; vAo = a; vGok = isik.y;
  vec4 d = modelMatrix * vec4(position, 1.0);
  if (sal > 0.0) {
    float t = zaman * (1.3 + ruzgar * 1.2), g = (0.55 + ruzgar) * sal;
    d.x += (sin(t + d.x * 0.7 + d.z * 0.35) * 0.06 + sin(t * 2.3 + d.z) * 0.015) * g;
    d.z += cos(t * 0.9 + d.z * 0.6 + d.x * 0.3) * 0.05 * g;
  }
  #ifdef SU
    float fy = fract(position.y);
    if (fy > 0.5) d.y += (sin(zaman * 1.6 + d.x * 0.9 + d.z * 0.4) * 0.03 + cos(zaman * 1.1 + d.z * 0.8) * 0.02) * (0.6 + ruzgar) - 0.05;
  #endif
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
uniform float islak;
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
  float m = 0.0, mc = 0.0;
  for (int i = 0; i < ${ISIK_SAYISI}; i++) {
    if (float(i) >= isikAdet) break;
    vec4 L = isiklar[i];
    if (L.w == 0.0) continue;
    float d = distance(vDunya, L.xyz);
    float k = clamp(1.0 - d / (abs(L.w) * 0.9), 0.0, 1.0);
    /* 0.15.1: birden çok ışık kaynağı toplanır; 0.15.4: eksi güç soğuk (buz) ışığıdır */
    if (L.w > 0.0) m += k * k; else mc += k * k;
  }
  m = min(m, 1.0); mc = min(mc, 1.0);
  float ao = vAo;
  vec3 isik;
  if (ao > 1.5) { ao = ao - 1.0; isik = vec3(1.0); }   /* lav: kendi ışığıyla parlar */
  else {
    vec3 gokIsik = gokRenk * max(vGok * gun, magara);
    isik = max(gokIsik, min(vec3(1.0, 0.8, 0.55) * m * 1.05 + vec3(0.66, 0.84, 1.08) * mc, vec3(1.08)));
  }
  vec3 renk = t.rgb * ao * isik;
  /* Yağmur: açıktaki yüzeyler ıslak ve koyu görünür */
  renk *= mix(vec3(1.0), vec3(0.76, 0.8, 0.88), islak * clamp(vGok, 0.0, 1.0));
  float s = clamp((vUzak - sisBas) / (sisSon - sisBas), 0.0, 1.0);
  renk = mix(renk, sisRenk, s);
  gl_FragColor = vec4(renk, alfa);
}`;

const GOK_VS = `varying vec3 vY; void main(){ vY = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GOK_FS = `uniform vec3 ust; uniform vec3 ufuk; uniform vec3 gunesYon; uniform vec3 gunesHale; varying vec3 vY;
void main(){ float h = clamp(vY.y, -1.0, 1.0); vec3 c = mix(ufuk, ust, pow(clamp(h, 0.0, 1.0), 0.55)); if (h < 0.0) c = mix(ufuk, ufuk * 0.6, clamp(-h * 3.0, 0.0, 1.0));
float g = max(dot(vY, gunesYon), 0.0); c += gunesHale * pow(g, 12.0) * 0.6; gl_FragColor = vec4(c, 1.0); }`;

/* 0.22.0: kuzey ışıkları: silindir perdede dalgalanan yeşil-mor ışık şeritleri (toplamalı karışım) */
const AURORA_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const AURORA_FS = `uniform float z; uniform float guc; varying vec2 vUv;
float h1(float n){ return fract(sin(n) * 43758.5453); }
float gr(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main(){
  float x = vUv.x * 48.0;
  float dalga = gr(x * 0.3 + z * 0.12) * 0.6 + gr(x * 1.1 - z * 0.35) * 0.4;
  float bant = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.3 + dalga * 0.55, 1.0, vUv.y));
  float cizgi = 0.5 + 0.5 * sin(x * 5.0 + gr(x * 1.7 + z * 0.6) * 7.0 + z * 0.7);
  float kuzey = 0.3 + 0.7 * smoothstep(-0.3, 0.9, cos(vUv.x * 6.2832));
  float yogun = bant * (0.35 + 0.65 * cizgi) * (0.3 + 0.7 * gr(x * 0.18 - z * 0.05)) * kuzey * guc;
  vec3 renk = mix(vec3(0.15, 1.0, 0.5), vec3(0.55, 0.3, 1.0), smoothstep(0.3, 0.95, vUv.y));
  renk = mix(renk, vec3(0.2, 0.85, 1.0), gr(x * 0.45 + z * 0.2) * 0.45);
  gl_FragColor = vec4(renk * 1.8, clamp(yogun * 1.3, 0.0, 1.0));
}`;
/* Yumuşak ışık lekesi dokusu (meteor ateş topu ve izi) */
function isikDokusu() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,220,120,0.9)'); g.addColorStop(0.55, 'rgba(255,120,30,0.45)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

export class Sahne {
  constructor(tuval) {
    this.cizici = new THREE.WebGLRenderer({ canvas: tuval, antialias: false, powerPreference: 'high-performance' });
    this.olcek = 1;   // 0.19.0: çözünürlük ölçeği (performans)
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
      sisBas: { value: 80 }, sisSon: { value: 120 }, alfa: { value: 1 }, zaman: { value: 0 }, ruzgar: { value: 0.3 }, magara: { value: 0.07 }, islak: { value: 0 },
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

  /* 0.19.0: çizim çözünürlüğü ölçeği (0,5 - 1) */
  olcekAyarla(k) {
    k = Math.max(0.5, Math.min(1, k));
    if (Math.abs(k - this.olcek) < 0.01) return;
    this.olcek = k;
    this.cizici.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5) * k);
    this.boyut();
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
    /* 0.22.0: kuzey ışıkları ve kayan yıldızlar (oyuncuyu izleyen gök grubunda) */
    this.auroraMalzeme = new THREE.ShaderMaterial({ uniforms: { z: { value: 0 }, guc: { value: 0 } }, vertexShader: AURORA_VS, fragmentShader: AURORA_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    this.aurora = new THREE.Mesh(new THREE.CylinderGeometry(380, 380, 160, 72, 1, true), this.auroraMalzeme);
    this.aurora.position.y = 190; this.aurora.renderOrder = -7; this.aurora.visible = false; this.aurora.frustumCulled = false; g.add(this.aurora);
    this.kayanlar = [];
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute([1, 1, 1, 0, 0, 0], 3));
      const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      l.visible = false; l.renderOrder = -7; l.frustumCulled = false; l.yas = 1; g.add(l); this.kayanlar.push(l);
    }
    this.gokGrubu = g;
    /* Meteor: ateş topu ve kıvılcım izi (dünya koordinatlarında) */
    const idok = isikDokusu();
    this.meteorTopu = new THREE.Sprite(new THREE.SpriteMaterial({ map: idok, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    this.meteorTopu.visible = false; this.sahne.add(this.meteorTopu);
    this.meteorIzi = [];
    for (let i = 0; i < 48; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: idok, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, color: 0xffa040 })); s.visible = false; s.yas = 9; this.sahne.add(s); this.meteorIzi.push(s); }
    this.izSira = 0; this.kanliK = 0;
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
  /* hava: { y: yağış yoğunluğu 0..1, f: fırtına 0..1, simsek: şimşek parlaması 0..1, gece: gece görüşü } */
  gokGuncelle(z, konum, suda, gorus, zamanSn, hava = {}) {
    const a = z * Math.PI * 2;
    const yuks = Math.sin(a);
    const hy = hava.y || 0, hf = hava.f || 0, sm = hava.simsek || 0;
    let gun = THREE.MathUtils.clamp(yuks * 2.2 + 0.35, 0.14, 1);
    gun = Math.max(0.1, gun * (1 - 0.32 * hy - 0.22 * hf));
    gun = Math.max(gun, sm * 0.95);
    const alacakaranlik = Math.max(0, 1 - Math.abs(yuks) * 4) * (Math.cos(a) > -2 ? 1 : 0);
    const gUst = new THREE.Color(0x6fa3ff), gUfuk = new THREE.Color(0xc4dcff);
    const nUst = new THREE.Color(0x03050c), nUfuk = new THREE.Color(0x0b1222);
    const sUfuk = new THREE.Color(0xf2955a);
    const k = THREE.MathUtils.smoothstep(yuks, -0.25, 0.25);
    const ust = nUst.clone().lerp(gUst, k), ufuk = nUfuk.clone().lerp(gUfuk, k);
    ufuk.lerp(sUfuk, alacakaranlik * 0.75);
    /* Yağmurda gökyüzü griye döner, şimşekte aydınlanır */
    if (hy > 0) {
      const gri = new THREE.Color(0x6c747f).multiplyScalar(0.12 + 0.88 * k * (1 - 0.35 * hf));
      ust.lerp(gri, hy * 0.93); ufuk.lerp(gri.clone().multiplyScalar(1.12), hy * 0.88);
    }
    if (sm > 0) { ust.lerp(new THREE.Color(0xdfe6ff), sm * 0.8); ufuk.lerp(new THREE.Color(0xeef1ff), sm * 0.8); }
    /* 0.22.0: Kanlı Ay: kızıl gece göğü ve sis, kocaman kızıl ay */
    const kn = (this.kanliK || 0) * (1 - k);
    if (kn > 0.001) { ust.lerp(new THREE.Color(0x2a0306), kn * 0.9); ufuk.lerp(new THREE.Color(0x7a120a), kn * 0.9); }
    this.ay.material.color.setHex(0xe6ecf5).lerp(new THREE.Color(0xff2a14), Math.min(1, (this.kanliK || 0) * 1.2)); this.ay.scale.setScalar(1 + (this.kanliK || 0) * 0.7);
    this.yildizMalzeme.color.setHex(0xffffff).lerp(new THREE.Color(0xff7060), kn);
    const gm = this.gokMalzeme.uniforms;
    gm.ust.value.copy(ust); gm.ufuk.value.copy(ufuk);
    const gy = new THREE.Vector3(Math.cos(a), yuks, 0.25).normalize();
    gm.gunesYon.value.copy(gy);
    gm.gunesHale.value.setRGB(1, 0.6, 0.3).multiplyScalar(alacakaranlik + 0.15 * k);
    this.yildizMalzeme.opacity = THREE.MathUtils.clamp(-yuks * 3, 0, 1) * 0.9 * (1 - hy);
    this.gunes.material.opacity = 1 - hy * 0.92; this.ay.material.opacity = 1 - hy * 0.92; this.gunes.children[0].material.opacity = 0.18 * (1 - hy);
    this.gokGrubu.position.copy(konum);
    this.gokGrubu.updateMatrixWorld(true);
    this.gunes.position.copy(gy).multiplyScalar(400); this.gunes.lookAt(konum);
    this.ay.position.copy(gy).multiplyScalar(-400); this.ay.lookAt(konum);
    /* Bulutlar oyuncuyu izler, doku kayar */
    this.bulut.position.set(konum.x, PY + 4, konum.z);
    const bk = this.bulutMalzeme.map;
    bk.offset.set((konum.x + zamanSn * 1.2) / 768 % 1, -(konum.z) / 768 % 1);
    this.bulutMalzeme.color.setScalar(0.1 + gun * 0.9).lerp(new THREE.Color(1, 0.75, 0.6), alacakaranlik * 0.4 * (1 - hy));
    /* 0.22.0: geceleri bulutlar gökyüzünün tonunu alır (gri lekeler oluşmaz; Kanlı Ay'da kızarır) */
    this.bulutMalzeme.color.lerp(ufuk.clone().multiplyScalar(1.5).convertSRGBToLinear(), (1 - k) * 0.9);
    /* Yağışta bulutlar gökyüzünün biraz koyu tonunu alır (gece kapkara lekeler oluşmaz) */
    if (hy > 0) this.bulutMalzeme.color.lerp(ust.clone().multiplyScalar(0.62).convertSRGBToLinear(), hy * 0.95);
    this.bulutMalzeme.opacity = 0.82 + 0.16 * hy;
    /* Blok aydınlatması */
    const gokRenk = new THREE.Color(1, 1, 1).lerp(new THREE.Color(0.62, 0.7, 1), 1 - k).lerp(new THREE.Color(1, 0.82, 0.68), alacakaranlik * 0.5);
    if (kn > 0.001) gokRenk.lerp(new THREE.Color(1, 0.45, 0.4), kn * 0.75);
    const lav = suda === 'lav';
    /* suda === 'maske': dalış maskesi su altında görüşü uzatır */
    const maske = suda === 'maske';
    const sis = lav ? new THREE.Color(0.9, 0.32, 0.05) : suda ? new THREE.Color(0.08, 0.22, 0.44).multiplyScalar((maske ? 0.45 : 0.35) + gun * (maske ? 0.75 : 0.65)) : ufuk;
    let sisSon = lav ? 2.5 : maske ? 46 : suda ? 22 : (gorus * 16 - 6) * (1 - 0.42 * hy - 0.12 * hf), sisBas = lav ? 0 : maske ? 8 : suda ? 0 : sisSon * (0.62 - 0.3 * hy);
    /* Geliştirici: sis kapatılabilir (sisKapali), en düşük ışık en yükseğe çıkarılabilir (tamAydinlik) */
    if (this.sisKapali) { sisBas = 9000; sisSon = 10000; }
    /* 0.18.0: Yeraltı Diyarı: gökyüzü yok; kızıl sis, sıcak ve loş ortam ışığı */
    const diyar = !!hava.diyar && !lav && !suda;
    if (diyar) {
      gokRenk.setRGB(1, 0.62, 0.48);
      sis.setRGB(0.1, 0.025, 0.018);
      sisSon = Math.min(sisSon, Math.max(48, gorus * 16 - 10)); sisBas = sisSon * 0.25;
      if (this.sisKapali) { sisBas = 9000; sisSon = 10000; }
    }
    for (const m of this.malzemeler) {
      const u = m.uniforms;
      u.gun.value = diyar ? 0 : gun; u.gokRenk.value.copy(gokRenk); u.sisRenk.value.copy(sis); u.sisBas.value = sisBas; u.sisSon.value = sisSon; u.zaman.value = zamanSn;
      u.ruzgar.value += ((diyar ? 0 : 0.25 + hy * 0.5 + hf * 1.0) - u.ruzgar.value) * 0.01;
      /* Gece görüşü iksiri: en düşük ışık yükselir */
      u.magara.value = this.tamAydinlik ? 1 : hava.gece ? 0.72 : diyar ? 0.36 : 0.07;
      u.islak.value = m === this.opakMalzeme && !suda && !diyar ? hy : 0;
    }
    this.cizici.setClearColor(sis);
    this.gokGrubu.visible = !suda && !diyar; this.bulut.visible = !suda && !diyar;
    if (diyar) return 0.4;
    this.kamera.far = Math.max(600, gorus * 16 + 40); this.kamera.updateProjectionMatrix();
    return gun;
  }

  /* 0.22.0: kayan yıldız: gökyüzünün üst yarısında, ufka doğru kısa bir iz */
  kayanYildiz() {
    const l = this.kayanlar.find(k => !k.visible); if (!l) return;
    const a = Math.random() * Math.PI * 2, e = 0.45 + Math.random() * 0.7;
    l.bas = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).multiplyScalar(430);
    const b = a + (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.5);
    l.yon = new THREE.Vector3(Math.cos(b) * 0.8, -0.55 - Math.random() * 0.3, Math.sin(b) * 0.8).normalize();
    l.boy = 30 + Math.random() * 45; l.hiz = 160 + Math.random() * 120; l.omur = 0.55 + Math.random() * 0.5; l.yas = 0; l.visible = true;
  }
  /* Ekran parlaması (meteor çarpması) */
  parlama(k) { const el = document.getElementById('gokParla'); if (!el) return; el.style.transition = 'none'; el.style.opacity = String(Math.min(0.9, k)); void el.offsetWidth; el.style.transition = 'opacity 1.6s ease-out'; el.style.opacity = '0'; }
  /* Her kare: s = { kanli, aurora, meteorlar, sure } */
  gokOlaylari(dt, s) {
    this.kanliK = s.kanli;
    const au = this.auroraMalzeme.uniforms;
    au.z.value += dt; au.guc.value = s.aurora;
    this.aurora.visible = s.aurora > 0.01 && this.gokGrubu.visible;
    for (const l of this.kayanlar) {
      if (!l.visible) continue;
      l.yas += dt;
      if (l.yas > l.omur) { l.visible = false; continue; }
      const bas = l.bas.clone().addScaledVector(l.yon, l.yas * l.hiz), uzun = l.boy * Math.min(1, l.yas * 4), son = bas.clone().addScaledVector(l.yon, -uzun);
      const pa = l.geometry.attributes.position; pa.setXYZ(0, bas.x, bas.y, bas.z); pa.setXYZ(1, son.x, son.y, son.z); pa.needsUpdate = true;
      l.material.opacity = Math.min(1, (l.omur - l.yas) * 4) * this.yildizMalzeme.opacity * 1.1;
    }
    /* Meteor: gökten çarpma noktasına doğru hızlanarak iner, arkasında kıvılcım bırakır */
    const m = s.meteorlar.find(q => !q.carpti);
    if (m) {
      const k = Math.min(1, m.t / m.sure), kk = k * k;
      const yuks = 320, yatay = 260;
      const x = m.x + Math.cos(m.aci) * yatay * (1 - kk), y = m.y + yuks * (1 - kk), z = m.z + Math.sin(m.aci) * yatay * (1 - kk);
      this.meteorTopu.visible = true; this.meteorTopu.position.set(x, y, z); this.meteorTopu.scale.setScalar(6 + 10 * k);
      for (let i = 0; i < 2; i++) {
        const iz = this.meteorIzi[this.izSira++ % this.meteorIzi.length];
        iz.visible = true; iz.yas = 0; iz.position.set(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2, z + (Math.random() - 0.5) * 2); iz.boy = 2.5 + 4 * k;
      }
    } else this.meteorTopu.visible = false;
    for (const iz of this.meteorIzi) {
      if (!iz.visible) continue;
      iz.yas += dt;
      if (iz.yas > 1.4) { iz.visible = false; continue; }
      iz.scale.setScalar(iz.boy * (1 + iz.yas * 0.8)); iz.material.opacity = 0.85 * (1 - iz.yas / 1.4);
      iz.material.color.setRGB(1, 0.6 - iz.yas * 0.3, 0.25 - iz.yas * 0.15);
    }
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
    this.secim.visible = true;
    /* Biçimli bloklarda seçim kutusu blok biçiminin sınırına oturur */
    const k = h.kutu || [0, 0, 0, 1, 1, 1];
    this.secim.position.set(h.x + (k[0] + k[3]) / 2, h.y + (k[1] + k[4]) / 2, h.z + (k[2] + k[5]) / 2);
    this.secim.scale.set(k[3] - k[0], k[4] - k[1], k[5] - k[2]);
    this.catlak.scale.copy(this.secim.scale);
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
    /* El katmanı standart malzeme kullanır: doku sRGB olarak işaretlenmezse renkler soluk görünür */
    const elAtlas = this.atlasDoku.clone(); elAtlas.colorSpace = THREE.SRGBColorSpace; elAtlas.needsUpdate = true;
    this.elBlokMalzeme = new THREE.MeshBasicMaterial({ map: elAtlas, alphaTest: 0.5 });
    this.elEsyaMalzeme = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.elEsya = null; this.elId = -1; this.elYay = null; this.yayOnceki = 0; this.yayBirak = 0;
    this.el.add(this.elKol);
    this.sallanma = 0;
  }
  elAyarla(id, buyulu = false) {
    this.elBuyulu = buyulu;
    if (id === this.elId) return;
    if (this.elId !== -1) this.elDegis = 1;   // 0.23.0: eşya değişince el aşağı inip yeniden kalkar
    this.elId = id;
    if (this.elEsya) { this.el.remove(this.elEsya); if (this.elEsya.geometry) this.elEsya.geometry.dispose(); this.elEsya = null; }
    this.elYay = null;
    this.elTur = !id ? 'bos' : 'esya';
    this.elKol.visible = !id;   // kol yalnızca boş elde görünür (eşya tutarken savurmada kameraya giriyordu)
    this.elKol.position.set(0.04, -0.04, 0.1); this.elKol.rotation.set(-0.25, 0.2, 0);
    if (!id) return;
    /* Yay (0.15.1): simge yerine dikey tutulan üç boyutlu yay; kiriş ve ok germe ile hareket eder */
    const ey = ESYALAR[id];
    if (ey && ey.tur === 'yay') { this.elYay = yayModeli(id === 459); this.elEsya = this.elYay.grup; this.el.add(this.elEsya); return; }
    if (ey && ey.tur === 'blok' && CIZIM[id] === C_KUP) {
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
      this.elEsya.position.set(0, 0.04, -0.02);
      this.elTur = 'blok';
    } else {
      /* Eşyalar simgelerinden kalınlık verilerek üç boyutlu (piksel piksel çıkıntılı) çizilir */
      this.elEsya = new THREE.Mesh(simgeHacmi(simge(id).cv, 0.36), this.elEsyaMalzeme);
      const e = ESYALAR[id], alet = e && (e.tur === 'alet' || e.tur === 'yay' || e.tur === 'olta');
      /* 0.23.0: aletler sapından kavranmış gibi, ucu öne ve yukarı bakar */
      if (alet) { this.elEsya.rotation.set(0.15, -1.45, 0.62); this.elEsya.position.set(0.0, 0.13, -0.04); this.elTur = 'alet'; }
      else { this.elEsya.rotation.set(0.12, -0.55, 0); this.elEsya.position.set(0.02, 0.07, -0.02); }
    }
    this.el.add(this.elEsya);
  }
  /* sallanma: 0..1 vuruş animasyonu, yurume: adım fazı */
  /* 0.23.0: el animasyonları: nefes salınımı, eşya değiştirme, alet için çapraz savurma, blok için öne itme, yemek yerken ağza götürme */
  elGuncelle(dt, vurus, yurume, isik, germe = 0, ek = {}) {
    const s = vurus > 0 ? Math.sin(vurus * Math.PI) : 0;
    const g = germe > 0 ? Math.min(1, germe) : 0;
    this.elDegis = Math.max(0, (this.elDegis || 0) - dt * 4.5);
    this.elYeme = Math.max(0, (ek.yeme || 0));
    if (this.elYay) { this.yayGuncelle(dt, s, yurume, isik, g); this.el.position.y -= this.elDegis * 0.35; return; }
    const t = performance.now() / 1000, nefes = Math.sin(t * 1.6) * 0.006, d = this.elDegis * this.elDegis * (3 - 2 * this.elDegis);
    const v = vurus > 0 ? vurus : 0, ileri = v < 0.35 ? v / 0.35 : 1 - (v - 0.35) / 0.65, ke = ileri * ileri * (3 - 2 * ileri);
    const kos = ek.kos ? 1.6 : 1, yx = Math.sin(yurume) * 0.012 * kos, yy = Math.abs(Math.cos(yurume)) * 0.014 * kos;
    const y = this.elYeme, ym = y > 0 ? Math.sin(t * 22) * 0.02 : 0;
    let px = 0.42 + yx - g * 0.22 - y * 0.3, py = -0.38 - yy + nefes - g * -0.12 - d * 0.35 + y * 0.12 + ym, pz = -0.62 + g * 0.08 + y * 0.12;
    let rx = g >= 1 ? Math.sin(t * 25) * 0.01 : 0, ry = g * 0.5 + y * 0.6, rz = g * 0.4 - y * 0.3;
    if (this.elTur === 'alet') { px -= ke * 0.12; py += ke * 0.06 - s * 0.05; pz -= ke * 0.12; rx -= ke * 1.25; ry -= ke * 0.35; rz += ke * 0.5; }
    else if (this.elTur === 'blok' || this.elTur === 'esya') { px -= ke * 0.06; py -= s * 0.06; pz -= ke * 0.16; rx -= ke * 0.55; ry -= ke * 0.2; }
    else { px -= ke * 0.05; py -= s * 0.05; pz -= ke * 0.2; rx -= ke * 0.7; }
    this.el.position.set(px, py, pz);
    this.el.rotation.set(rx, ry, rz);
    const c = this.elKol.material.color; c.setRGB(0.78 * isik, 0.6 * isik, 0.44 * isik);
    this.elBlokMalzeme.color.setScalar(isik);
    this.elEsyaMalzeme.color.setScalar(isik);
    /* Büyülü eşya: hafif mor parıltı nabzı */
    if (this.elBuyulu) { const t = 0.5 + 0.5 * Math.sin(performance.now() / 260); this.elEsyaMalzeme.color.setRGB(isik * (1 - 0.12 * t), isik * (1 - 0.3 * t), isik * Math.min(1.25, 1 + 0.25 * t)); }
  }

  /* Birinci şahıs yay: boşta sağ altta eğik; germe ilerledikçe ortaya gelir, dikleşir, kiriş ve ok geriye çekilir;
     bırakınca kiriş titreyerek öne fırlar ve yay hafifçe tepki verir */
  yayGuncelle(dt, s, yurume, isik, g) {
    const Y = this.elYay;
    if (this.yayOnceki > 0.15 && g === 0) this.yayBirak = 1;
    this.yayOnceki = g;
    this.yayBirak = Math.max(0, this.yayBirak - dt * 3.2);
    const b = this.yayBirak, titre = g >= 1 ? Math.sin(performance.now() / 35) * 0.004 : 0;
    const e = g * g * (3 - 2 * g);
    this.el.position.set(0.3 - e * 0.26 + Math.sin(yurume) * 0.012 * (1 - e) + titre, -0.3 + e * 0.12 - Math.abs(Math.cos(yurume)) * 0.012 * (1 - e) - s * 0.06, -0.62 + e * 0.1 - b * 0.06);
    this.el.rotation.set(-s * 0.5 + b * 0.12, 0.25 - e * 0.25, -0.42 + e * 0.32 + titre);
    /* Kiriş: uçlardan çekilen orta noktaya; bırakınca sönümlü titreşim */
    const cek = e * 0.24 - (b > 0 ? Math.sin(b * 22) * b * 0.05 : 0);
    Y.kirisAyarla(cek);
    Y.ok.visible = g > 0.02;
    Y.ok.position.z = 0.02 + cek;
    Y.el.position.z = 0.02 + cek;
    Y.el.visible = g > 0.02;
    for (const mt of Y.malzemeler) { if (!mt.userData.temel) mt.userData.temel = mt.color.clone(); mt.color.copy(mt.userData.temel).multiplyScalar(isik); }
    Y.elMalz.color.setRGB(0.78 * isik, 0.6 * isik, 0.44 * isik);
  }

  ciz() {
    const c = this.cizici;
    c.info.reset();
    c.render(this.sahne, this.kamera);
    if (this.el.visible) { c.autoClear = false; c.clearDepth(); c.render(this.elSahne, this.elKamera); c.autoClear = true; }
  }
}

/* Simge tuvalinden kalın piksel geometrisi: her dolu piksel öne ve arkaya yüz, boş komşusuna bakan kenarlara yan yüz verir.
   Renkler sRGB'den doğrusal renk uzayına çevrilir; yüzler yönlerine göre gölgelenir. */
const HACIM = new Map();
export function simgeHacmi(cv, boy) {
  const anahtar = cv;
  if (HACIM.has(anahtar)) return HACIM.get(anahtar).clone();
  const S = cv.width, d = cv.getContext('2d').getImageData(0, 0, S, S).data;
  const dolu = (x, y) => x >= 0 && y >= 0 && x < S && y < S && d[(y * S + x) * 4 + 3] > 100;
  const p = [], c = [], u = boy / S, k = boy / 16 * 0.55, renk = new THREE.Color();
  const yuz = (a, b, cc, e, g) => { p.push(...a, ...b, ...cc, ...a, ...cc, ...e); for (let i = 0; i < 6; i++) c.push(renk.r * g, renk.g * g, renk.b * g); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    if (!dolu(x, y)) continue;
    const i = (y * S + x) * 4;
    renk.setRGB(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255, THREE.SRGBColorSpace);
    const x0 = (x - S / 2) * u, x1 = x0 + u, y1 = (S / 2 - y) * u, y0 = y1 - u;
    yuz([x0, y0, k], [x1, y0, k], [x1, y1, k], [x0, y1, k], 1);
    yuz([x1, y0, -k], [x0, y0, -k], [x0, y1, -k], [x1, y1, -k], 0.78);
    if (!dolu(x, y - 1)) yuz([x0, y1, k], [x1, y1, k], [x1, y1, -k], [x0, y1, -k], 0.92);
    if (!dolu(x, y + 1)) yuz([x0, y0, -k], [x1, y0, -k], [x1, y0, k], [x0, y0, k], 0.6);
    if (!dolu(x - 1, y)) yuz([x0, y0, -k], [x0, y0, k], [x0, y1, k], [x0, y1, -k], 0.72);
    if (!dolu(x + 1, y)) yuz([x1, y0, k], [x1, y0, -k], [x1, y1, -k], [x1, y1, k], 0.84);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  HACIM.set(anahtar, g);
  return g.clone();
}

/* Birinci şahıs yay modeli (0.15.1): dikey yay gövdesi (öne doğru kavisli), kabza, iki parçalı kiriş, ok ve kirişi çeken el */
function yayModeli(buz) {
  const grup = new THREE.Group();
  const ahsap = new THREE.MeshBasicMaterial({ color: buz ? 0x7fc8e8 : 0x8a5a2e }), koyu = new THREE.MeshBasicMaterial({ color: buz ? 0x4a8cb0 : 0x5a3a1e });
  const kiris = new THREE.MeshBasicMaterial({ color: 0xece8dc }), demir = new THREE.MeshBasicMaterial({ color: 0x9a9da4 }), tuy = new THREE.MeshBasicMaterial({ color: 0xf2f2ea });
  const elMalz = new THREE.MeshBasicMaterial({ color: 0xc89870 });
  const H = 0.34, K = 0.075, N = 18;
  const nokta = t => [0, t * H, -(1 - t * t) * K];
  for (let i = 0; i < N; i++) {
    const t0 = -1 + 2 * i / N, t1 = -1 + 2 * (i + 1) / N, a = nokta(t0), b = nokta(t1);
    const l = Math.hypot(b[1] - a[1], b[2] - a[2]), uc = Math.abs(t0 + t1) > 1.6;
    const m = new THREE.Mesh(new THREE.BoxGeometry(uc ? 0.022 : 0.03, l + 0.004, uc ? 0.028 : 0.036), uc ? koyu : ahsap);
    m.position.set(0, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    m.rotation.x = -Math.atan2(b[2] - a[2], b[1] - a[1]);
    grup.add(m);
  }
  /* Kabza ve tutan el */
  const kabza = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.1, 0.05), koyu); kabza.position.set(0, 0, -K); grup.add(kabza);
  const tut = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.07), elMalz); tut.position.set(0.012, -0.01, -K + 0.01); grup.add(tut);
  /* Kiriş: üst ve alt uçtan çekilen noktaya iki ince kutu */
  const ks = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.006, 1, 0.006), kiris); grup.add(m); return m; });
  const kirisAyarla = c => {
    ks.forEach((m, i) => {
      const uy = i ? -H : H, L = Math.hypot(uy, c);
      m.scale.y = L; m.position.set(0, uy / 2, c / 2);
      m.rotation.x = Math.atan2(c, -uy);
    });
  };
  kirisAyarla(0);
  /* Ok: kirişten öne uzanır */
  const ok = new THREE.Group();
  const sap = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.56), new THREE.MeshBasicMaterial({ color: 0x8a6034 })); sap.position.z = -0.28; ok.add(sap);
  const uc = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.024, 0.05), demir); uc.position.z = -0.57; ok.add(uc);
  for (const [w, h] of [[0.002, 0.04], [0.04, 0.002]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), tuy); t.position.z = -0.03; ok.add(t); }
  ok.position.set(0.016, 0, 0.02); ok.visible = false; grup.add(ok);
  const el = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.07), elMalz); el.position.set(0.016, 0, 0.02); el.visible = false; grup.add(el);
  return { grup, ok, el, kirisAyarla, malzemeler: [ahsap, koyu, kiris, demir, tuy, sap.material], elMalz };
}
