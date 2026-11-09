#!/usr/bin/env node
// Kalite denetimi: yayın klasörünü (build.mjs --deploy çıktısı) tarar ve sorunları listeler.
//   node scripts/build.mjs --deploy _site --base https://...   (önce)
//   node scripts/denetle.mjs _site                              (sonra)
// Hata (✖) varsa çıkış kodu 1 olur; uyarılar (!) yayını durdurmaz.
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve(process.argv[2] || '_site');
if (!fs.existsSync(OUT)) { console.log('Yayın klasörü yok:', OUT); process.exit(1); }
const dec = s => s.replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const errs = [], warns = [];
const E = (f, m) => errs.push(`${f}: ${m}`), W = (f, m) => warns.push(`${f}: ${m}`);
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(OUT).filter(f => f.endsWith('.html'));
const titles = new Map(), descs = new Map();
const exists = (from, ref) => {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return true;
  let p = clean.startsWith('/') ? path.join(OUT, clean) : path.resolve(path.dirname(from), decodeURIComponent(clean));
  return fs.existsSync(p) && (!fs.statSync(p).isDirectory() || fs.existsSync(path.join(p, 'index.html')));
};
for (const f of pages) {
  const rel = path.relative(OUT, f).split(path.sep).join('/');
  const h = fs.readFileSync(f, 'utf8');
  const isPost = rel.startsWith('posts/');
  const body = h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<(pre|code|textarea)[\s>][\s\S]*?<\/\1>/gi, '');
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  if (!title) E(rel, 'başlık (title) yok'); else {
    if (dec(title).length > 70) W(rel, `başlık uzun (${dec(title).length} karakter; en çok ~70 önerilir)`);
    if (titles.has(title)) E(rel, `başlık ${titles.get(title)} ile aynı`); else titles.set(title, rel);
  }
  const d = (h.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1];
  if (!d) W(rel, 'description yok'); else {
    const L = dec(d).length;
    if (L < 40) W(rel, `description kısa (${L})`); else if (L > 180) W(rel, `description uzun (${L})`);
    if (isPost) { if (descs.has(d)) W(rel, `description ${descs.get(d)} ile aynı`); else descs.set(d, rel); }
  }
  if (!/<html[^>]*\blang=/.test(h)) W(rel, 'html lang yok');
  if (!/name="viewport"/.test(h)) E(rel, 'viewport yok');
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1 && rel !== '404.html') (isPost ? E : W)(rel, `h1 sayısı ${h1} (1 olmalı)`);
  if (isPost) {
    if (!/rel="canonical"/.test(h)) W(rel, 'canonical yok (--base verilmemiş olabilir)');
    // içindekiler bağlantıları gerçek bir id'ye gitmeli
    const ids = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const m of body.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1]) && m[1] !== 'app') E(rel, `#${m[1]} bağlantısının hedefi yok`);
    const dup = [...ids].length !== (body.match(/\sid="[^"]+"/g) || []).length;
    if (dup) W(rel, 'yinelenen id var');
  }
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(m[0])) W(rel, 'alt metni olmayan görsel: ' + (m[0].match(/src="([^"]*)"/) || [])[1]);
  }
  for (const m of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const r = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(r) || r.includes('{{')) continue;
    if (!exists(f, r)) E(rel, `bağlantı/dosya bulunamadı: ${r}`);
  }
}
const say = (s, a) => a.forEach(x => console.log(s, x));
say('✖', errs); say('!', warns);
console.log(`\n${pages.length} sayfa tarandı: ${errs.length} hata, ${warns.length} uyarı.`);
process.exit(errs.length ? 1 : 0);
