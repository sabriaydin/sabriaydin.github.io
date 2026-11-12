/* HungerMan - ağ bağlantısı: oyuncular arasında doğrudan (WebRTC) veri kanalı
   Sunucu olan oyuncu bir katılım kodu alır; diğerleri bu kodla bağlanır. PeerJS'in ücretsiz eşleştirme sunucusu
   yalnızca ilk tanışma için kullanılır, oyun verisi doğrudan oyuncular arasında akar. Ayrı bir oyun sunucusu yoktur. */

const ONEK = 'hungerman-v1-';
export const KOD_HARF = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789';
const PARCA = 30000;          // bir mesajın en büyük boyutu (karakter); büyük mesajlar parçalanır
const TAMPON = 4 * 1024 * 1024;

let yukSoz = null;
/* Ağ kitaplığı yalnızca çok oyunculu kullanılınca yüklenir */
function kutuphane() {
  if (window.peerjs && window.peerjs.Peer) return Promise.resolve(window.peerjs.Peer);
  if (!yukSoz) yukSoz = new Promise((coz, red) => {
    const s = document.createElement('script');
    s.src = new URL('../../lib/peerjs.min.js', import.meta.url).href;
    s.onload = () => (window.peerjs && window.peerjs.Peer ? coz(window.peerjs.Peer) : red(new Error('Ağ kitaplığı yüklenemedi.')));
    s.onerror = () => { yukSoz = null; red(new Error('Ağ kitaplığı yüklenemedi.')); };
    document.head.appendChild(s);
  });
  return yukSoz;
}

/* Özel eşleştirme sunucusu (test ve kendi kurulumu için): adres çubuğuna ?sinyal=localhost:9000 eklenir */
function secenekler() {
  const o = { debug: 0 };
  try {
    const s = new URLSearchParams(location.search).get('sinyal');
    if (s) {
      const u = new URL(s.includes('://') ? s : 'http://' + s);
      o.host = u.hostname; o.port = +u.port || (u.protocol === 'https:' ? 443 : 80);
      o.path = u.pathname.replace(/\/$/, '') || '/'; o.secure = u.protocol === 'https:';
      o.config = { iceServers: [] };
    }
  } catch (e) { /* geçersiz adres: varsayılan sunucu */ }
  return o;
}

export function kodUret() { let k = ''; for (let i = 0; i < 6; i++) k += KOD_HARF[Math.floor(Math.random() * KOD_HARF.length)]; return k; }
export function kodDuzelt(k) { return String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

function hataMetni(e) {
  const t = e && e.type;
  if (t === 'peer-unavailable') return 'Bu kodla açık bir dünya bulunamadı. Kodu ve sunucunun açık olduğunu denetleyiniz.';
  if (t === 'browser-incompatible') return 'Tarayıcınız eşler arası bağlantıyı (WebRTC) desteklemiyor.';
  if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return 'Eşleştirme sunucusuna ulaşılamadı. İnternet bağlantınızı denetleyiniz.';
  if (t === 'webrtc') return 'Doğrudan bağlantı kurulamadı. Ağ veya güvenlik duvarı eşler arası bağlantıyı engelliyor olabilir.';
  if (t === 'unavailable-id') return 'Katılım kodu kullanımda.';
  return 'Bağlantı hatası' + (t ? ` (${t})` : '') + '.';
}

/* Tek bir oyuncuyla kurulan veri kanalı: JSON mesajlar, büyükleri parçalanır, gönderim tampona göre sıralanır */
export class Kanal {
  constructor(c) {
    this.c = c;
    this.kuyruk = [];
    this.parca = null;
    this.kapali = false;
    this.sonAlim = performance.now();
    this.mesaj = null; this.kapandi = null;
    c.on('data', d => this.al(d));
    c.on('close', () => this.kapat());
    c.on('error', () => this.kapat());
  }
  get acik() { return !this.kapali && this.c.open; }
  gonder(m) {
    if (this.kapali) return;
    const s = JSON.stringify(m);
    if (s.length <= PARCA) this.kuyruk.push(s);
    else { const n = Math.ceil(s.length / PARCA); for (let i = 0; i < n; i++) this.kuyruk.push('~' + i + ',' + n + ',' + s.slice(i * PARCA, (i + 1) * PARCA)); }
    this.bosalt();
  }
  bosalt() {
    if (this.kapali || this.bekliyor) return;
    const dc = this.c.dataChannel;
    while (this.kuyruk.length) {
      if (dc && dc.bufferedAmount > TAMPON) { this.bekliyor = true; setTimeout(() => { this.bekliyor = false; this.bosalt(); }, 40); return; }
      try { this.c.send(this.kuyruk.shift()); } catch (e) { this.kapat(); return; }
    }
  }
  al(d) {
    this.sonAlim = performance.now();
    if (typeof d !== 'string') return;
    if (d[0] === '~') {
      const a = d.indexOf(','), b = d.indexOf(',', a + 1);
      const i = +d.slice(1, a), n = +d.slice(a + 1, b);
      if (i === 0) this.parca = [];
      if (!this.parca) return;
      this.parca.push(d.slice(b + 1));
      if (i < n - 1) return;
      d = this.parca.join(''); this.parca = null;
    }
    let m; try { m = JSON.parse(d); } catch (e) { return; }
    if (this.mesaj) this.mesaj(m);
  }
  kapat() {
    if (this.kapali) return;
    this.kapali = true; this.kuyruk = [];
    try { this.c.close(); } catch (e) { /* zaten kapalı */ }
    if (this.peer) { try { this.peer.destroy(); } catch (e) { /* yok */ } }
    if (this.kapandi) this.kapandi();
  }
}

/* Sunucu: kod alır, gelen bağlantıları kabul eder */
export class AgSunucu {
  constructor() { this.peer = null; this.kod = null; this.kapali = false; this.baglandi = null; this.hata = null; }
  async baslat() {
    const Peer = await kutuphane();
    for (let deneme = 0; deneme < 5; deneme++) {
      const kod = kodUret();
      try { await this.ac(Peer, kod); this.kod = kod; return kod; }
      catch (e) { if (e.tur !== 'unavailable-id') throw e; }
    }
    throw new Error('Katılım kodu alınamadı. Daha sonra yeniden deneyiniz.');
  }
  ac(Peer, kod) {
    return new Promise((coz, red) => {
      const p = new Peer(ONEK + kod, secenekler());
      let acildi = false;
      const zaman = setTimeout(() => { if (!acildi) { p.destroy(); red(new Error('Eşleştirme sunucusu yanıt vermedi. İnternet bağlantınızı denetleyiniz.')); } }, 15000);
      p.on('open', () => { acildi = true; clearTimeout(zaman); this.peer = p; coz(); });
      p.on('error', e => {
        if (!acildi) { clearTimeout(zaman); p.destroy(); const h = new Error(hataMetni(e)); h.tur = e.type; red(h); return; }
        if (e.type !== 'peer-unavailable' && this.hata) this.hata(hataMetni(e));
      });
      p.on('connection', c => {
        c.on('open', () => { if (this.kapali) { c.close(); return; } if (this.baglandi) this.baglandi(new Kanal(c)); });
      });
      /* Eşleştirme sunucusu bağlantısı koparsa yeni katılımlar için yeniden bağlan (mevcut oyuncular etkilenmez) */
      p.on('disconnected', () => { setTimeout(() => { if (!this.kapali && !p.destroyed && p.disconnected) try { p.reconnect(); } catch (e) { /* sonra yeniden denenir */ } }, 3000); });
    });
  }
  kapat() { this.kapali = true; if (this.peer) { try { this.peer.destroy(); } catch (e) { /* yok */ } } this.peer = null; }
}

/* İstemci: koda bağlanır, açılan kanalı döndürür */
export async function katil(kod) {
  const Peer = await kutuphane();
  return new Promise((coz, red) => {
    const p = new Peer(secenekler());
    let bitti = false;
    const son = (h, k) => { if (bitti) return; bitti = true; clearTimeout(zaman); if (h) { try { p.destroy(); } catch (e) { /* yok */ } red(h); } else coz(k); };
    const zaman = setTimeout(() => son(new Error('Bağlantı zaman aşımına uğradı. Kodu ve sunucunun açık olduğunu denetleyiniz.')), 25000);
    p.on('open', () => {
      const c = p.connect(ONEK + kod, { reliable: true, serialization: 'raw' });
      c.on('open', () => { const k = new Kanal(c); k.peer = p; son(null, k); });
      c.on('error', e => son(new Error(hataMetni(e))));
    });
    p.on('error', e => son(new Error(hataMetni(e))));
  });
}
