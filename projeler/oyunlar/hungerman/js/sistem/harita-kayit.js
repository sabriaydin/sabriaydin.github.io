/* HungerMan - keşfedilen harita kaydı: dünya kayıtlarından ayrı bir IndexedDB deposunda, bölge bölge saklanır
   Kimlik: tek oyunculu ve sunucuda dünya numarası; çok oyunculu istemcide tohum ve oyuncu adı. */
const DB_AD = 'hungerman_harita', DEPO = 'bolgeler';
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
const aralik = k => IDBKeyRange.bound(k + '|', k + '|￿');
function islem(mod, f) {
  return db().then(d => new Promise((coz, red) => {
    const t = d.transaction(DEPO, mod), s = t.objectStore(DEPO);
    const r = f(s);
    t.oncomplete = () => coz(r && r.result);
    t.onerror = () => red(t.error);
  }));
}

export const HaritaKayit = {
  /* [{ id: 'kimlik|rx,rz', p: [[parça sırası, Uint8Array(512)], ...] }] */
  yukle: kimlik => islem('readonly', s => s.getAll(aralik(kimlik))).then(l => l || []),
  kaydet: (kimlik, bolgeler) => (bolgeler.length ? islem('readwrite', s => { for (const b of bolgeler) s.put({ id: kimlik + '|' + b.k, p: b.p }); }) : Promise.resolve()),
  sil: kimlik => islem('readwrite', s => s.delete(aralik(kimlik)))
};
