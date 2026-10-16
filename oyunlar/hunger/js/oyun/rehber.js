/* Hunger 3D - oyun içi rehber: oynanış, hikâye, canavarlar, hayvanlar, harita, madenler, eşyalar, üretim, başarımlar, tuşlar */
(()=>{
'use strict';
const {G,ui,IT,RC,STN,ICON,ANIMAL,inp}=HG;
const $=HG.$;
const TABS=[['play','Oynanış'],['story','Hikâye'],['foes','Canavarlar'],['fauna','Hayvanlar'],['map','Harita'],['sea','Deniz'],['ores','Madenler'],['items','Eşyalar'],['recipes','Üretim'],['tips','Alet ve silahlar'],['caves','Mağaralar'],['news','Yeni sistemler'],['ach','Başarımlar']];
let tab='play',openFrom=null;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
/* {eylem} -> atanmış tuş */
const sub=t=>t.replace(/\{(\w+)\}/g,(m,a)=>HG.bind&&HG.bind[a]?'<kbd>'+esc(HG.keyLabel(HG.bind[a][0]))+'</kbd>':m);
const sec=list=>list.map(x=>`<div class="nt"><b>${x[0]}</b><span>${sub(x[1])}</span></div>`).join('');
const DROPS={sheep:'Çiğ et, yün',cow:'Çiğ et, deri, kemik; süt sağılabilir',rabbit:'Çiğ et, deri',deer:'Çiğ et, deri, kemik',wolf:'Çiğ et, deri, kemik',boar:'Çiğ et, deri, kemik',chicken:'Çiğ et, tüy; yumurta bırakır',bear:'Çiğ et, deri, kemik, kürk',dog:'Hiçbir şey (evcil dost)'};
const NOTE={sheep:'Zararsız; makasla yün kırkılır.',cow:'Zararsız; boş şişeyle süt sağılır.',rabbit:'Hızlı kaçar, yakalaması zordur; ok işe yarar.',deer:'Ürkektir ve hızlıdır; uzaktan ok ile avlanır.',wolf:'Geceleri sürü hâlinde saldırır; ateşten çekinir.',boar:'Yaklaşırsanız saldırır; sert vurur.',chicken:'Zararsızdır; aralıklarla yumurta bırakır, kurtlardan kaçar.',bear:'Dağlık ve ormanlık yerlerde yaşar; yaklaşırsanız çok sert saldırır. Kışın uykuya yatar ve yakına gelmedikçe dokunmaz. Demir Kılıç, yay ve ateş işe yarar.',dog:'Gezgin Tüccardan Köpek Yavrusu alınır. Sizi takip eder, tehlikeli yaratıklara saldırır; E ile beklet veya çağır, ette beslenir.'};
function fauna(){
 return '<div class="mut">Avlanan hayvanlar yerde bırakılan eşyalarla leş bırakır; eşyalar toplanınca leş kaybolur.</div>'+['sheep','cow','rabbit','deer','wolf','boar','bear','chicken','dog'].map(k=>{
  const a=ANIMAL[k];
  return `<div class="nt"><b>${a.n}</b><span>Can: ${a.hp} · Yürüyüş ${a.walk} m/s, koşu ${a.run} m/s${a.cspd?' · Kovalama '+a.cspd+' m/s':''}${a.aggr?' · Saldırı: '+a.dmg+' hasar':''}<br>Verir: ${DROPS[k]}<br>${NOTE[k]}</span></div>`;
 }).join('');
}
function items(){
 const rows=Object.keys(IT).map(k=>{
  const it=IT[k];let d=it.d||'';
  if(it.tool==='axe'||it.tool==='pick')d=(it.tool==='axe'?'Ağaç keser, düşmana vurur.':'Kaya ve maden kazar.')+' Kademe '+it.tier+'/3 · Vuruş hasarı '+HG.HIT[it.tier]+', verim ×'+HG.YIELD[it.tier]+'.';
  if(it.place&&!d)d='Yerleştirilir.';
  if(!d)d='Üretim ve ticaret malzemesi.';
  return `<div class="rc"><img src="${ICON[k]||''}" alt=""><div><b>${it.n}</b><span>${esc(d)}</span></div><span class="stk">×${it.s}</span></div>`;
 });
 return '<div class="mut">×N: bir kutuda taşınabilecek en fazla adet. Eşyaya sağ tıklayarak kullanabilir, panelin dışına sürükleyerek yere atabilirsiniz.</div>'+rows.join('');
}
function recipes(){
 return '<div class="mut">Üretim: {craft} veya {inv} tuşuyla açılan panelden yapılır. Bazı tarifler yakında ilgili yapı bulunmasını gerektirir.</div>'.replace(/\{(\w+)\}/g,(m,a)=>HG.bind[a]?HG.keyLabel(HG.bind[a][0]):m)
  +RC.map(r=>{
   const need=Object.keys(r[2]).map(k=>IT[k].n+' ×'+r[2][k]).join(', ');
   return `<div class="rc"><img src="${ICON[r[0]]||''}" alt=""><div><b>${IT[r[0]].n}${r[1]>1?' ×'+r[1]:''}</b><span>${need}${r[3]?' · Gerekli: '+STN[r[3]]+' yakını':''}</span></div></div>`;
  }).join('');
}
function ach(){
 const L=HG.ACH||[],have=G.ach||{},n=L.filter(a=>have[a[0]]).length;
 return `<div class="mut">Açılan başarım: ${n}/${L.length}. Her başarım deneyim kazandırır.</div>`+L.map(a=>{
  const ok=!!have[a[0]];
  return `<div class="nt${ok?' hl':''}"><b>${ok?'★ ':'☆ '}${a[1]}</b><span>${a[2]}${ok?'':''}</span></div>`;
 }).join('');
}
function body(){
 switch(tab){
  case 'play':return sec(HG.GUIDE.play);
  case 'story':return sec(HG.GUIDE.story);
  case 'foes':return sec(HG.GUIDE.foes);
  case 'fauna':return fauna();
  case 'map':return sec(HG.GUIDE.map);
  case 'sea':return sec(HG.GUIDE.sea);
  case 'ores':return sec(HG.GUIDE.ores);
  case 'items':return items();
  case 'recipes':return recipes();
  case 'tips':return sec(HG.GUIDE.tips);
  case 'caves':return sec(HG.GUIDE.caves);
  case 'news':return sec(HG.GUIDE.news||[]);
  case 'ach':return ach();
  default:return sec(HG.GUIDE.play);
 }
}
function render(){
 const t=$('#gdT'),b=$('#gdB');if(!t||!b)return;
 t.innerHTML=TABS.map(x=>`<button type="button" class="ghost${x[0]===tab?' on':''}" data-t="${x[0]}">${x[1]}</button>`).join('');
 b.innerHTML=body();b.scrollTop=0;
}
function toggleGuide(force,from){
 const g=$('#gd');if(!g)return;
 const open=force!==undefined?force:g.hidden;
 if(open===!g.hidden)return;
 if(open&&ui.state==='play'&&(!$('#panel').hidden||!$('#trade').hidden||!$('#jr').hidden||!$('#bigmap').hidden))return;
 if(open){
  openFrom=ui.state;
  if(ui.state==='play'){for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;HG.unlock(true)}
  render();g.hidden=false;try{HG.snd('ui_open')}catch(e){}
 }else{
  g.hidden=true;try{HG.snd('ui_close')}catch(e){}
  if(ui.state==='play'){ui.relock=true;HG.lock()}
 }
}
function setup(){
 const t=$('#gdT');if(!t)return;
 t.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b){tab=b.dataset.t;render()}});
 $('#gdX').onclick=()=>toggleGuide(false);
 $('#gd').addEventListener('pointerdown',e=>{if(e.target===$('#gd'))toggleGuide(false)});
 document.querySelectorAll('.bGuide').forEach(b=>b.onclick=()=>{HG.initAudio&&HG.initAudio();toggleGuide(true)});
 /* Esc yalnızca rehberi kapatır (menüde ve duraklatmada oyunun Esc işlemi çalışmaz) */
 addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('#gd').hidden){e.stopImmediatePropagation();e.preventDefault();inp.keys.Escape=true;toggleGuide(false)}},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
Object.assign(HG,{toggleGuide});
})();
