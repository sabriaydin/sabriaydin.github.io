/* Hunger 3D - kayıtlar penceresi (ana menü), elle kaydetme ve dosya aktarma düğmeleri */
(()=>{
'use strict';
const {ui}=HG;
const $=HG.$;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let msg='',startAfterImport=false;
const fmt=ts=>{try{return ts?new Date(ts).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'}):'—'}catch(e){return '—'}};
function refreshCont(){const b=$('#bCont');if(b)b.hidden=!HG.saveExists()}
function render(){
 const L=$('#svL');if(!L)return;
 const slots=HG.listSlots();
 $('#svS').textContent=msg||(slots.length?'Bir kaydı yükleyebilir, adını değiştirebilir, bilgisayara indirebilir veya silebilirsiniz.':'Henüz kayıt yok. Oyunda Duraklat › Oyunu kaydet ile kayıt alabilirsiniz.');
 L.innerHTML=slots.map(s=>`<div class="sl${s.auto?' auto':''}" data-id="${esc(s.id)}"><div class="sn"><b>${esc(s.name)}</b><small>Gün ${s.day} · Seviye ${s.lvl} · ${fmt(s.ts)}${s.auto?' · her 20 saniyede güncellenir':''}</small></div><div class="sa"><button type="button" data-a="load">Yükle</button>${s.auto?'':'<button type="button" class="ghost" data-a="ren">Yeniden adlandır</button>'}<button type="button" class="ghost" data-a="dl">İndir</button><button type="button" class="ghost" data-a="del">Sil</button></div></div>`).join('');
}
function open(m){
 msg=m||'';$('#sv').hidden=false;render();try{HG.snd('ui_open')}catch(e){}
}
function close(){$('#sv').hidden=true;msg='';refreshCont();try{HG.snd('ui_close')}catch(e){}}
function startFrom(id){close();HG.initAudio();HG.startGame(true,id)}
async function onFile(f){
 if(!f)return;
 let text='';try{text=await f.text()}catch(e){open('Dosya okunamadı.');return}
 const r=HG.importText(text,f.name);
 if(r.err){open(r.err);return}
 if(startAfterImport)startFrom(r.id);
 else{open('Kayıt içe aktarıldı: '+r.name)}
}
function setup(){
 if(!$('#sv'))return;
 const fi=$('#fileIn');
 fi.addEventListener('change',()=>{const f=fi.files&&fi.files[0];fi.value='';onFile(f)});
 $('#bSaves').onclick=()=>{HG.initAudio();open()};
 $('#bLoadF').onclick=()=>{HG.initAudio();startAfterImport=true;fi.click()};
 $('#svF').onclick=()=>{startAfterImport=false;fi.click()};
 $('#svX').onclick=close;
 $('#sv').addEventListener('pointerdown',e=>{if(e.target===$('#sv'))close()});
 $('#svL').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;
  const row=b.closest('.sl'),id=row.dataset.id,a=b.dataset.a;
  if(a==='load')startFrom(id);
  else if(a==='dl'){HG.downloadSlot(id)}
  else if(a==='del'){
   if(b.dataset.sure){HG.deleteSlot(id);msg='Kayıt silindi.';render();refreshCont()}
   else{b.dataset.sure='1';b.textContent='Silinsin mi?';b.classList.remove('ghost');setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='Sil';b.classList.add('ghost')}},3000)}
  }else if(a==='ren'){
   const nm=row.querySelector('.sn b'),inp=document.createElement('input');inp.className='rn';inp.maxLength=40;inp.value=nm.textContent;
   nm.replaceWith(inp);inp.focus();inp.select();
   const done=ok=>{if(ok&&inp.value.trim()){HG.renameSlot(id,inp.value);msg='Ad değiştirildi.'}render()};
   inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter')done(true);else if(ev.key==='Escape')done(false)});
   inp.addEventListener('blur',()=>done(true));
  }
 });
 /* Esc yalnızca kayıtlar penceresini kapatır */
 addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!$('#sv').hidden){
   if(document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains('rn'))return;
   e.stopImmediatePropagation();e.preventDefault();close();
  }
 },true);
 /* duraklatma menüsü */
 $('#bSave').onclick=()=>HG.manualSave(false);
 $('#bDown').onclick=()=>HG.downloadCurrent();
 refreshCont();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
HG.savesUI={open,close};
})();
