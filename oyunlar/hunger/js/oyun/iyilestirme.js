/* Hunger 3D - arayüz iyileştirmeleri (güncelleme 64): ana menüde klavye gezinmesi ve ilk odak, çanta panelinde kaynak özeti şeridi.
   Özgün dosyalara dokunmaz; yalnızca DOM'a ekleme yapar. */
(()=>{
'use strict';
const {G,ui,IT,ICON,count}=HG;
const $=HG.$;
const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden';

/* ---------- Ana menü: yukarı/aşağı ok ile düğmeler arasında gezinme, açılışta ilk düğmeye odak ---------- */
const OVER=['#wd','#sv','#sd','#coop','#cplost','#set','#gd','#sg'];
const overlayOpen=()=>OVER.some(s=>{const e=$(s);return e&&!e.hidden});
function menuBtns(){return [...document.querySelectorAll('#menu .btns button')].filter(b=>!b.hidden&&getComputedStyle(b).display!=='none')}
function focusFirst(){
 const m=$('#menu');if(!visible(m)||overlayOpen())return;
 const b=menuBtns()[0];
 if(b&&document.activeElement!==b)try{b.focus({preventScroll:true})}catch(e){}
}
addEventListener('keydown',e=>{
 if(ui.state!=='menu')return;
 const k=e.code;
 if(k!=='ArrowDown'&&k!=='ArrowUp'&&k!=='Home'&&k!=='End')return;
 const m=$('#menu');if(!visible(m)||overlayOpen())return;
 const L=menuBtns();if(!L.length)return;
 let i=L.indexOf(document.activeElement);
 if(k==='Home')i=0;else if(k==='End')i=L.length-1;
 else if(i<0)i=k==='ArrowDown'?0:L.length-1;
 else i=(i+(k==='ArrowDown'?1:-1)+L.length)%L.length;
 L[i].focus({preventScroll:true});
 e.preventDefault();
});
/* Menü görünür olduğunda (açılış, oyundan çıkış, pencere kapanışı) odak ilk düğmeye alınır */
function watchMenu(){
 const m=$('#menu');if(!m)return;
 const mo=new MutationObserver(()=>{if(visible(m)&&!menuBtns().includes(document.activeElement))setTimeout(focusFirst,60)});
 mo.observe(m,{attributes:true,attributeFilter:['hidden','style']});
 for(const s of OVER){const e=$(s);if(e)new MutationObserver(()=>{if(!overlayOpen())setTimeout(focusFirst,60)}).observe(e,{attributes:true,attributeFilter:['hidden']})}
 setTimeout(focusFirst,200);
}

/* ---------- Çanta paneli: kaynak özeti şeridi ---------- */
const RES=['wood','stone','coal','copper_ore','iron_ore','copper_ingot','iron_ingot'];
let strip=null,sig='';
function buildStrip(){
 const grid=$('#grid');if(!grid||strip)return;
 strip=document.createElement('div');strip.id='resum';strip.title='Çantadaki temel kaynaklar';
 grid.insertAdjacentElement('afterend',strip);
}
function updStrip(){
 const p=$('#panel');if(!p||p.hidden||!G.inv)return;
 buildStrip();
 let s='',h='';
 for(const id of RES){
  if(!IT[id])continue;
  const n=count(id);s+=id+n+'|';
  h+=`<span class="${n?'':'z'}" title="${IT[id].n}"><img src="${ICON[id]}" alt="${IT[id].n}"><b>${n}</b></span>`;
 }
 if(s!==sig){sig=s;strip.innerHTML=h}
}
setInterval(updStrip,300);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchMenu);else watchMenu();
})();
