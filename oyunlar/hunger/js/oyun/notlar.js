/* Hunger 3D - Güncelleme Notları penceresi (açılır liste, sayfa başına 10 güncelleme) ve duraklatma menüsünde klavye gezinmesi (güncelleme 67, sayfalama: 71).
   Veri: js/veri/guncelleme/*.js dosyaları HG.UPD dizisini doldurur. */
(()=>{
'use strict';
const $=HG.$;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nt=$('#nt'),list=$('#ntL'),pgr=$('#ntP');
const PER=10;                                    /* sayfa başına gösterilen güncelleme sayısı */
let page=0,built=false;
const data=()=>(HG.UPD||[]).slice().sort((a,b)=>b.n-a.n);     /* en yeni güncelleme başta */
const pageCount=()=>Math.max(1,Math.ceil(data().length/PER));
function renderList(){
 const L=data(),part=L.slice(page*PER,page*PER+PER);
 list.innerHTML=part.map((e,i)=>`<details${i===0?' open':''}><summary><b>Güncelleme ${e.n}</b><span>${esc(e.t)}</span></summary><ul>${e.l.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></details>`).join('');
 list.scrollTop=0;
 if(pgr){
  const first=part.length?part[0].n:0,last=part.length?part[part.length-1].n:0;
  pgr.querySelectorAll('button[data-p]').forEach(bt=>{
   const k=bt.dataset.p;
   if(k==='prev')bt.disabled=page<=0;
   else if(k==='next')bt.disabled=page>=pageCount()-1;
   else if(+k===page)bt.setAttribute('aria-current','page');
   else bt.removeAttribute('aria-current');
  });
  const info=pgr.querySelector('.pi');if(info)info.textContent=`Güncelleme ${first}${first!==last?' - '+last:''} · Sayfa ${page+1}/${pageCount()}`;
 }
}
function go(p){
 p=Math.max(0,Math.min(pageCount()-1,p));
 if(p===page)return;
 page=p;renderList();
}
function build(){
 if(!list)return;
 if(!built&&pgr){
  built=true;
  const n=pageCount();
  let h='<button type="button" class="ghost" data-p="prev">‹ Önceki</button><span class="pn">';
  for(let i=0;i<n;i++)h+=`<button type="button" class="ghost" data-p="${i}" aria-label="Sayfa ${i+1}">${i+1}</button>`;
  h+='</span><button type="button" class="ghost" data-p="next">Sonraki ›</button><div class="pi"></div>';
  pgr.innerHTML=h;
  pgr.addEventListener('click',e=>{
   const bt=e.target.closest('button[data-p]');if(!bt||bt.disabled)return;
   const k=bt.dataset.p;
   go(k==='prev'?page-1:k==='next'?page+1:+k);
  });
 }
 page=0;renderList();
}
function open(){build();nt.hidden=false;const f=list.querySelector('summary');if(f)f.focus({preventScroll:true})}
function close(){nt.hidden=true;const b=$('#bNotes');if(b)b.focus({preventScroll:true})}
const b=$('#bNotes');if(b)b.addEventListener('click',()=>{HG.initAudio&&HG.initAudio();open()});
$('#ntX')&&$('#ntX').addEventListener('click',close);
nt&&nt.addEventListener('pointerdown',e=>{if(e.target===nt)close()});
addEventListener('keydown',e=>{
 if(nt&&!nt.hidden){
  if(e.code==='Escape'){close();e.preventDefault();e.stopPropagation();return}
  if(e.code==='ArrowDown'||e.code==='ArrowUp'){
   const S=[...list.querySelectorAll('summary')];let i=S.indexOf(document.activeElement);
   i=i<0?0:Math.max(0,Math.min(S.length-1,i+(e.code==='ArrowDown'?1:-1)));if(S[i])S[i].focus();e.preventDefault()}
  /* sol/sağ ok ve PageUp/PageDown: sayfa değiştirir */
  else if(e.code==='ArrowLeft'||e.code==='PageUp'){go(page-1);const f=list.querySelector('summary');f&&f.focus({preventScroll:true});e.preventDefault()}
  else if(e.code==='ArrowRight'||e.code==='PageDown'){go(page+1);const f=list.querySelector('summary');f&&f.focus({preventScroll:true});e.preventDefault()}
 }
},true);
/* Duraklatma menüsü: yukarı/aşağı ok ile gezinme, açılınca "Devam" düğmesine odak */
const ps=$('#pause');
const pb=()=>[...ps.querySelectorAll('button')].filter(x=>!x.hidden&&!x.disabled&&x.offsetParent!==null&&!x.closest('#cpPause'));
if(ps){
 new MutationObserver(()=>{if(!ps.hidden)setTimeout(()=>{const f=$('#bRes');f&&f.focus({preventScroll:true})},50)}).observe(ps,{attributes:true,attributeFilter:['hidden']});
 addEventListener('keydown',e=>{
  if(ps.hidden||(e.code!=='ArrowDown'&&e.code!=='ArrowUp'))return;
  if(HG.ui&&HG.ui.state!=='pause')return;
  const L=[...ps.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);if(!L.length)return;
  let i=L.indexOf(document.activeElement);
  i=i<0?0:(i+(e.code==='ArrowDown'?1:-1)+L.length)%L.length;L[i].focus({preventScroll:true});e.preventDefault();
 });
}
})();
