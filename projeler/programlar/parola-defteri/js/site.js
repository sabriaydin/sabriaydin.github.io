const $=s=>document.querySelector(s),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
(()=>{const S=window.SITE||{},q=s=>document.querySelectorAll(s);
q('[data-indir]').forEach(a=>a.href=S.indir||'#');
const vt=S.virustotal||(/^[a-f0-9]{64}$/i.test(S.sha256||'')?'https://www.virustotal.com/gui/file/'+S.sha256:'#');
q('[data-mail]').forEach(a=>a.href=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.eposta||'')?'mailto:'+S.eposta+'?subject='+encodeURIComponent('Parola Defteri hakkında'):'#');
q('[data-yil]').forEach(e=>e.textContent=new Date().getFullYear());
q('[data-vt]').forEach(a=>{a.href=vt;a.target='_blank';a.rel='noopener noreferrer'});
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x)e.textContent=x;return e};
const inl=(el,s)=>s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).forEach(p=>{
  const b=p.match(/^\*\*([^*]+)\*\*$/),l=p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if(b)el.append(mk('strong','',b[1]));
  else if(l&&/^(https?:\/\/|\.{0,2}\/|#)/.test(l[2])){const a=mk('a','',l[1]);a.href=l[2];el.append(a)}
  else if(p)el.append(p)});
const ayir=t=>{const L=t.replace(/\r/g,'').replace(/^\uFEFF/,'').split('\n'),f={};let i=0;
  for(;i<L.length;i++){const l=L[i].trim();if(l==='---')continue;if(!l){if(f.surum)break;continue}
    const m=l.match(/^(surum|tarih|baslik)\s*:\s*(.*)$/i);if(m)f[m[1].toLowerCase()]=m[2];else break}
  f.govde=L.slice(i).join('\n');return f.surum&&f.baslik?f:null};
/* posts/1.txt, 2.txt, 3.txt ... dosyalarını sırayla okur; ilk eksik numarada durur */
const yukle=async()=>{const o=[];
  for(let s=1;s<200;s+=10){
    const r=await Promise.all(Array.from({length:10},(_,i)=>fetch('posts/'+(s+i)+'.txt',{cache:'no-cache'}).then(x=>x.ok?x.text():null).catch(()=>null)));
    let son=false;r.forEach(t=>{if(t===null)son=true;else if(!son){const f=ayir(t);if(f)o.push(f)}});
    if(son)break}
  return o.reverse()};
const goster=(el,f)=>{const a=mk('article','t u'),h=mk('header'),dt=new Date(f.tarih);
  h.append(mk('span','v','v'+f.surum),mk('h3','',f.baslik));
  if(!isNaN(dt)){const d=mk('time','',dt.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}));d.dateTime=f.tarih;h.append(d)}
  a.append(h);let ul=null;
  (f.govde||'').split('\n').forEach(l=>{l=l.trim();
    if(!l){ul=null;return}
    if(/^[-*] /.test(l)){if(!ul){ul=mk('ul');a.append(ul)}const li=mk('li');inl(li,l.slice(2));ul.append(li)}
    else{ul=null;const p=mk('p');inl(p,l);a.append(p)}});
  el.append(a)};
const els=q('[data-liste]');
if(els.length)yukle().then(L=>{
  if(L[0])q('[data-surum]').forEach(e=>{e.textContent=' v'+L[0].surum;e.hidden=false});
  els.forEach(el=>{L.slice(0,+el.dataset.liste||99).forEach(f=>goster(el,f));
    if(!L.length){const s=el.closest('#son');if(s)s.hidden=true;else el.textContent=location.protocol==='file:'?'Yerel önizlemede yazılar görünmez, site yayınlanınca görünür.':'Henüz güncelleme yok.'}})});
})();
