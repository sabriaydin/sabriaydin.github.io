#!/usr/bin/env node
// Sitedeki tüm HTML dosyalarında geçen dış (http/https) bağlantıları kontrol eder,
// 400 ve üzeri durum kodu dönenleri veya hiç yanıt vermeyenleri listeler.
//
//   node scripts/check-links.mjs
//
// CI'da (.github/workflows/link-kontrolu.yml) haftalık olarak çalışır; kırık bağlantı
// bulunursa iş başarısız olur ve Actions sekmesinde hangi dosyada hangi bağlantının
// sorunlu olduğu görünür. Elle çalıştırmak için de kullanılabilir.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', '.github', 'scripts', 'node_modules']);
const TIMEOUT_MS = 10000;
const CONCURRENCY = 8;

// steampowered.com ve bazı mağaza siteleri bot isteklerini farklı şekilde yanıtlayabilir
// (403/429 verip insan tarayıcısında normal çalışabilir); bu alan adları uyarı olarak
// ayrı gösterilir, hata olarak sayılmaz.
const NOISY_HOSTS = [/steampowered\.com$/, /apple\.com$/];

const walkHtml = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  if (e.name.startsWith('.')) return [];
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walkHtml(p);
  return e.name.endsWith('.html') ? [p] : [];
});

const files = walkHtml(ROOT);
const linkToFiles = new Map(); // url -> Set(dosya yolları)
const hrefRe = /(?:href|src)="(https?:\/\/[^"]+)"/g;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(hrefRe)) {
    const url = m[1];
    if (!linkToFiles.has(url)) linkToFiles.set(url, new Set());
    linkToFiles.get(url).add(path.relative(ROOT, file));
  }
}

const urls = [...linkToFiles.keys()];
console.log(`${files.length} HTML dosyasında ${urls.length} benzersiz dış bağlantı bulundu, kontrol ediliyor...`);

const check = async url => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    // Bazı siteler HEAD'i desteklemez (405/501), GET ile tekrar dene
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return { url, ok: res.ok, status: res.status };
  } catch (err) {
    return { url, ok: false, status: 0, error: err.message };
  } finally {
    clearTimeout(t);
  }
};

const results = [];
let i = 0;
async function worker() {
  while (i < urls.length) {
    const url = urls[i++];
    results.push(await check(url));
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));

const broken = results.filter(r => !r.ok);
const noisy = broken.filter(r => NOISY_HOSTS.some(re => { try { return re.test(new URL(r.url).host); } catch { return false; } }));
const real = broken.filter(r => !noisy.includes(r));

const report = (title, list) => {
  if (!list.length) return;
  console.log(`\n${title} (${list.length}):`);
  for (const r of list) {
    console.log(`  [${r.status || 'HATA'}] ${r.url}${r.error ? ` — ${r.error}` : ''}`);
    for (const f of linkToFiles.get(r.url)) console.log(`      ↳ ${f}`);
  }
};

report('Bilinen gürültülü alan adlarından uyarı (bot engeli olabilir, elle kontrol et)', noisy);
report('Kırık bağlantı', real);

if (real.length) {
  console.log(`\n::error::${real.length} kırık bağlantı bulundu.`);
  process.exit(1);
}
console.log('\nKırık bağlantı bulunamadı.');
