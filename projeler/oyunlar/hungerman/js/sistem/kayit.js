/* HungerMan - kayıt: dünyalar tarayıcının IndexedDB deposunda saklanır; ayarlar localStorage'da */
const DB_AD = 'hungerman', DEPO = 'dunyalar';
let dbSoz = null;

function db() {
  if (dbSoz) return dbSoz;
  dbSoz = new Promise((coz, red) => {
    if (!('indexedDB' in window)) return red(new Error('IndexedDB yok'));
    const r = indexedDB.open(DB_AD, 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains(DEPO)) d.createObjectStore(DEPO, { keyPath: 'id' }); };
    r.onsuccess = () => coz(r.result);
    r.onerror = () => red(r.error);
  });
  return dbSoz;
}
function islem(mod, f) {
  return db().then(d => new Promise((coz, red) => {
    const t = d.transaction(DEPO, mod), s = t.objectStore(DEPO);
    const r = f(s);
    t.oncomplete = () => coz(r && r.result);
    t.onerror = () => red(t.error);
  }));
}

export const Kayit = {
  /* 0.23.0: "~yedek" ile biten kayıtlar, dünyanın bir önceki oturumdaki kopyasıdır; listede ayrı gösterilmez */
  listele: () => islem('readonly', s => s.getAll()).then(l => { l = l || []; const yedek = new Set(l.filter(d => String(d.id).endsWith('~yedek')).map(d => String(d.id).slice(0, -6)));
    return l.filter(d => !String(d.id).endsWith('~yedek')).map(d => ({ id: d.id, ad: d.ad, tohum: d.tohum, olusturma: d.olusturma, son: d.son, gun: d.gun || 1, komutlar: !!d.komutlar, zorluk: d.zorluk || 'normal', bitti: !!d.hardcoreBitti, yedek: yedek.has(d.id) })).sort((a, b) => b.son - a.son); }),
  yukle: id => islem('readonly', s => s.get(id)),
  kaydet: veri => islem('readwrite', s => s.put(veri)),
  sil: id => islem('readwrite', s => { s.delete(id + '~yedek'); return s.delete(id); })
};

const AYAR_ANAHTAR = 'hungerman_ayarlar';
export const VARSAYILAN_AYAR = { gorus: 8, fov: 75, hassasiyet: 1, ses: 0.8, muzik: 0.5, cozunurluk: 0, tersY: false, fps: false, sallanma: true, vucutIsisi: true };
/* 0.22.0: sayısal ayarlar geçerli aralığa çekilir (bozuk ya da elle değiştirilmiş kayıtta dünya yüklenemiyordu) */
const AYAR_ARALIK = { gorus: [4, 16], fov: [60, 100], hassasiyet: [0.2, 2.5], ses: [0, 1], muzik: [0, 1], cozunurluk: [0, 4] };
function ayarDuzelt(a) {
  for (const [k, [en, eb]] of Object.entries(AYAR_ARALIK)) { const v = Number(a[k]); a[k] = Number.isFinite(v) ? Math.min(eb, Math.max(en, v)) : VARSAYILAN_AYAR[k]; }
  a.gorus = Math.round(a.gorus);
  return a;
}
export function ayarlariYukle() {
  try { return ayarDuzelt(Object.assign({}, VARSAYILAN_AYAR, JSON.parse(localStorage.getItem(AYAR_ANAHTAR) || '{}'))); }
  catch (e) { return Object.assign({}, VARSAYILAN_AYAR); }
}
export function ayarlariKaydet(a) { try { localStorage.setItem(AYAR_ANAHTAR, JSON.stringify(a)); } catch (e) { /* depolama kapalı olabilir */ } }

/* 0.23.0: dünya yedeği dosyası: Map, Set ve sayı dizileri JSON'a çevrilir; tarayıcı destekliyorsa gzip ile sıkıştırılır */
const kodla = (k, x) => x instanceof Map ? { __t: 'Map', v: [...x] } : x instanceof Set ? { __t: 'Set', v: [...x] } : ArrayBuffer.isView(x) ? { __t: x.constructor.name, v: Array.from(x) } : x;
const coz = (k, x) => x && typeof x === 'object' && x.__t ? (x.__t === 'Map' ? new Map(x.v) : x.__t === 'Set' ? new Set(x.v) : /^(Uint|Int|Float)(8|16|32|64)(Clamped)?Array$/.test(x.__t) ? new globalThis[x.__t](x.v) : x) : x;
export async function yedekDosyasi(veri) {
  const metin = JSON.stringify({ hungerman: 1, surum: veri.surum || '', tarih: Date.now(), dunya: veri }, kodla);
  let blob = new Blob([metin], { type: 'application/json' });
  if (typeof CompressionStream === 'function') blob = await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob();
  return blob;
}
export async function yedekOku(dosya) {
  const b = new Uint8Array(await dosya.slice(0, 2).arrayBuffer());
  const metin = b[0] === 0x1f && b[1] === 0x8b ? await new Response(dosya.stream().pipeThrough(new DecompressionStream('gzip'))).text() : await dosya.text();
  const v = JSON.parse(metin, coz);
  if (!v || !v.hungerman || !v.dunya || typeof v.dunya !== 'object' || v.dunya.tohum == null) throw new Error('Bu dosya bir HungerMan dünya yedeği değil.');
  return v.dunya;
}
