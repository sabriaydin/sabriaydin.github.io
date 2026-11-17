/* HungerMan - köy baskınları (0.35.0)
   Gece, oyuncu bir köyün içindeyken köyün itibarı Yabancı ya da daha iyiyse, her köy için gecede bir kez %18 olasılıkla baskın başlar.
   Köyün çevresinden iki dalga hâlinde zombi, iskelet ve haydutlar gelir. Dalgalar püskürtülürse köy ödül verir (itibar, sikke, nadir eşya).
   Oyuncu köyden uzaklaşırsa ya da sabah olursa baskın başarısız sayılır: itibar düşer, köylüler kaçıştığı için o gün ticaret yapılmaz.
   Yalnızca tek oyunculuda ve sunucuda çalışır. */
const TURLER = ['zombi', 'zombi', 'iskelet', 'haydut'];
const ODUL = [[264, 1], [290, 1], [61, 3], [336, 1], [493, 1], [492, 1]];

export class Baskinlar {
  constructor(o) {
    Object.assign(this, o); // koyler, varliklar, dunya, bildirim, ses, birak(id, n, x, y, z), basarim(k)
    this.aktif = null;
    this.denenen = new Map();   // köy kimliği -> son denenen gün
    this.sayac = 0;
  }
  gece(o) { return o.zaman > 0.58 && o.zaman < 0.92; }
  guncelle(dt, o) {
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = 1;
    const K = this.koyler, koy = K.icindeki;
    if (!this.aktif) {
      if (!koy || !this.gece(o) || K.kademe(koy.id) < 1 || this.denenen.get(koy.id) === o.gun) return;
      this.denenen.set(koy.id, o.gun);
      if (Math.random() < 0.18) this.baslat(koy, o);
      return;
    }
    const A = this.aktif, p = o.oyuncu.konum;
    for (const v of [...A.kalan]) if (v.olu || !this.varliklar.liste.includes(v)) A.kalan.delete(v);
    if (Math.hypot(p.x - A.koy.x, p.z - A.koy.z) > A.koy.yaricap + 48 || !this.gece(o)) return this.bitir(false, o);
    if (!A.kalan.size) {
      if (A.dalga < 2) { A.dalga++; this.bildirim(`${A.koy.ad}: ikinci dalga geliyor!`); this.dalga(o); }
      else this.bitir(true, o);
    }
  }
  baslat(koy, o) {
    this.aktif = { koy, dalga: 1, kalan: new Set() };
    this.bildirim(`Baskın! ${koy.ad} köyü canavarların saldırısına uğradı. Köyü koruyunuz.`);
    if (this.ses && this.ses.gorev) this.ses.gorev();
    this.dalga(o);
  }
  dalga(o) {
    const A = this.aktif, k = A.koy, n = 3 + A.dalga * 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = k.yaricap - 6 - Math.random() * 6;
      const x = Math.floor(k.x + Math.cos(a) * r), z = Math.floor(k.z + Math.sin(a) * r);
      if (!this.dunya.yuklu(x, z)) continue;
      const y = this.dunya.ustKati(x, z) + 1;
      const v = this.varliklar.ekle(TURLER[Math.floor(Math.random() * TURLER.length)], x + 0.5, y, z + 0.5);
      v.baskin = true; v.ofkeli = true;
      A.kalan.add(v);
    }
  }
  bitir(basari, o) {
    const A = this.aktif, k = A.koy;
    this.aktif = null;
    if (basari) {
      this.koyler.itibarDegistir(k.id, 15);
      const p = o.oyuncu.konum, nadir = ODUL[Math.floor(Math.random() * ODUL.length)];
      this.birak(288, 6 + Math.floor(Math.random() * 6), p.x, p.y + 1, p.z);
      this.birak(nadir[0], nadir[1], p.x, p.y + 1, p.z);
      this.bildirim(`Baskın püskürtüldü! ${k.ad} köyü size minnettar (+15 itibar).`);
      if (this.basarim) this.basarim('baskin');
      if (this.ses && this.ses.gorev) this.ses.gorev();
    } else {
      this.koyler.itibarDegistir(k.id, -5);
      this.koyler.durum(k.id).kapali = o.gun;
      this.bildirim(`${k.ad} köyü baskına yenik düştü. Köylüler kaçıştı; bugün ticaret yapılmayacak.`);
      for (const v of A.kalan) v.baskin = false;
    }
  }
}
