/* Hunger 3D - Güncelleme Notları penceresi (açılır liste) ve duraklatma menüsünde klavye gezinmesi (güncelleme 67). */
(()=>{
'use strict';
const $=HG.$;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nt=$('#nt'),list=$('#ntL');
function build(){
 if(!list||list.childElementCount)return;
 const L=HG.NOTES||[];
 list.innerHTML=L.map((e,i)=>`<details${i===0?' open':''}><summary><b>${e.n?'Güncelleme '+e.n:'Başlangıç'}</b><span>${esc(e.t)}</span></summary><p>${esc(e.x)}</p></details>`).join('');
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
   i=i<0?0:Math.max(0,Math.min(S.length-1,i+(e.code==='ArrowDown'?1:-1)));S[i].focus();e.preventDefault()}
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
