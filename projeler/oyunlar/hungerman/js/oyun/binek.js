/* HungerMan - binek ve oturma (0.16.0)
   Ehlileştirilmiş ve eyerlenmiş ata binilir: at, oyuncunun baktığı yöne döner; W ileri, S geri, A/D yana,
   Shift dörtnala, Boşluk zıplama. C ya da E ile inilir. Sandalye ve koltuğa oturulur; hareket edince kalkılır.
   Tek oyunculuda ve sunucuda at doğrudan canlı listesindedir; istemcide aynadaki at yerelde sürülür ve konumu sunucuya gider. */
import { BLOKLAR, KATI } from '../bloklar.js';

export const OTURMA = 1.08;   // eyerde oturan oyuncunun ayak yüksekliği (atın tabanına göre)

export class Binek {
  constructor(o) {
    Object.assign(this, o);   // varliklar, oyuncu, dunya, ses, dusenler, bildirim(m)
    this.at = null;           // binilen at
    this.oturak = null;       // oturulan sandalye / koltuk: { x, y, z, h }
    this.nalSayac = 0;
    this.ag = null;           // istemcide: { indi(v) }
  }
  get biniyor() { return !!this.at; }

  /* ---------- At ---------- */
  bin(v) {
    if (this.oturak) this.kalk();
    this.at = v;
    v.binenHiz = 0; v.hiz.set(0, 0, 0); v.oturuyor = false; v.hedef = null;
    if (this.varliklar.ayna) v.yerelBinek = true; else if (!v.binen) v.binen = 'yerel';
    this.oyuncu.yaw = v.yaw;
    this.oyuncu.hiz.set(0, 0, 0);
    this.oturt();
    this.bildirim('Ata binildi: W ileri, S geri, A/D yana, Shift dörtnala, Boşluk zıplama. İnmek için C ya da E.');
  }
  oturt() { const v = this.at, P = this.oyuncu; P.konum.set(v.konum.x, v.konum.y + OTURMA, v.konum.z); }
  /* İnince oyuncu atın yanındaki boş bir yere bırakılır */
  in() {
    const v = this.at;
    if (!v) return;
    this.at = null;
    v.binenHiz = 0; v.hiz.x = 0; v.hiz.z = 0;
    if (this.varliklar.ayna) { v.yerelBinek = false; v.hedefP.copy(v.konum); if (this.ag && this.ag.indi) this.ag.indi(v); }
    else v.binen = null;
    const P = this.oyuncu, s = Math.sin(v.yaw), c = Math.cos(v.yaw);
    for (const [a, b] of [[1.3, 0], [-1.3, 0], [0, 1.6], [0, -1.6], [2, 0], [-2, 0]]) {
      const x = v.konum.x + a * c + b * s, z = v.konum.z - a * s + b * c;
      for (let y = Math.floor(v.konum.y) + 1; y >= Math.floor(v.konum.y) - 1; y--) {
        if (KATI[this.dunya.blok(Math.floor(x), y - 1, Math.floor(z))] && !P.carpisiyor(x, y + 0.01, z, 1.8)) { P.konum.set(x, y + 0.01, z); P.hiz.set(0, 0, 0); P.dusus = 0; return; }
      }
    }
    P.konum.set(v.konum.x, v.konum.y + 1.7, v.konum.z); P.hiz.set(0, 0, 0); P.dusus = 0;
  }

  /* g: girdi (ileri, geri, sol, sag, zipla, kos) */
  guncelle(dt, g) {
    if (this.oturak) { this.oturGuncelle(); return; }
    const v = this.at;
    if (!v) return;
    const V = this.varliklar;
    if (v.olu || !V.liste.includes(v)) { this.at = null; this.oyuncu.hiz.set(0, 0, 0); return; }
    const P = this.oyuncu, p = v.konum;
    /* At, binicinin baktığı yöne döner */
    let f = P.yaw - v.yaw; f = Math.atan2(Math.sin(f), Math.cos(f));
    v.yaw += f * Math.min(1, dt * 5); v.hedefYaw = v.yaw;
    const ileri = (g.ileri ? 1 : 0) - (g.geri ? 1 : 0), yan = (g.sag ? 1 : 0) - (g.sol ? 1 : 0);
    const hizMax = ileri > 0 ? (g.kos ? 11 : 7.2) : ileri < 0 ? 2.4 : 0;
    const sy = Math.sin(v.yaw), cy = Math.cos(v.yaw);
    const ix = -sy * ileri * hizMax + cy * yan * 2.4, iz = -cy * ileri * hizMax - sy * yan * 2.4;
    const k = Math.min(1, (v.yerde ? 6 : 1.4) * dt * (v.suda ? 0.5 : 1));
    v.hiz.x += (ix * (v.suda ? 0.45 : 1) - v.hiz.x) * k; v.hiz.z += (iz * (v.suda ? 0.45 : 1) - v.hiz.z) * k;
    /* Zıplama ve bir bloklu basamakları kendiliğinden aşma */
    if (g.zipla && v.yerde) v.hiz.y = 10.5;
    else if (v.yerde && v.engel && Math.hypot(ix, iz) > 0.5 && !V.carpisiyor(v, p.x, p.y + 1.15, p.z)) v.hiz.y = 8.4;
    if (v.suda) v.hiz.y = Math.min(v.hiz.y + 26 * dt, 2.2);
    else { v.hiz.y -= 28 * dt; if (v.hiz.y < -40) v.hiz.y = -40; }
    const dus = v.hiz.y;
    V.hareket(v, dt);
    /* Yüksekten düşen at hasar alır */
    if (v.yerde && dus < -16 && !V.ayna) V.hasarVer(v, Math.floor((-dus - 14) / 2.5), null, { sessiz: true });
    v.binenHiz = Math.hypot(v.hiz.x, v.hiz.z);
    if (V.ayna) v.hedefP.copy(p);
    this.oturt();
    P.hiz.set(0, 0, 0); P.dusus = 0;
    /* Nal sesi */
    this.nalSayac -= dt * v.binenHiz;
    if (v.yerde && !v.suda && this.nalSayac <= 0) { this.nalSayac = 1.7; this.ses.nal(Math.min(1, v.binenHiz / 9)); }
  }

  /* ---------- Sandalye ve koltuk ---------- */
  otur(x, y, z) {
    if (this.at) return false;
    const b = BLOKLAR[this.dunya.blok(x, y, z)];
    if (!b || !b.oturak) return false;
    this.oturak = { x, y, z, h: b.oturak, id: this.dunya.blok(x, y, z) };
    const P = this.oyuncu;
    P.hiz.set(0, 0, 0);
    /* Arkalık yon tarafındadır; oyuncu karşı yöne bakar */
    P.yaw = [0, -Math.PI / 2, Math.PI, Math.PI / 2][(b.yon + 2) % 4];
    this.oturGuncelle();
    this.bildirim('Oturuldu. Kalkmak için hareket ediniz ya da C tuşuna basınız.');
    if (this.olay) this.olay('ev');
    return true;
  }
  oturGuncelle() {
    const o = this.oturak, P = this.oyuncu;
    if (this.dunya.blok(o.x, o.y, o.z) !== o.id) { this.oturak = null; return; }
    P.konum.set(o.x + 0.5, o.y + o.h - 0.8, o.z + 0.5);   // göz, oturak yüksekliğine göre alçalır P.hiz.set(0, 0, 0); P.dusus = 0;
  }
  kalk() {
    const o = this.oturak;
    if (!o) return;
    this.oturak = null;
    const P = this.oyuncu;
    P.konum.set(o.x + 0.5, o.y + 1.01, o.z + 0.5);
    if (P.carpisiyor(P.konum.x, P.konum.y, P.konum.z, 1.8)) P.konum.y = o.y + 0.6;
    P.hiz.set(0, 0, 0);
  }
}
