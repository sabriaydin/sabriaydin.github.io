/* Hunger 3D - Kayıtlı Oyunlar penceresi (ana menü ve duraklatma menüsü: liste, yükleme, silme, dosyadan yükleme) ve Oyunu Kaydet penceresi (otomatik: tarayıcı, manuel: dosya) */
(()=>{
'use strict';
const {ui}=HG;
const $=HG.$;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let msg='';
const fmt=ts=>{try{return ts?new Date(ts).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'}):'—'}catch(e){return '—'}};
/* "3 dk önce" biçiminde göreli süre */
function ago(ts){
 if(!ts)return '';
 const s=Math.max(0,(Date.now()-ts)/1000);
 if(s<60)return 'az önce';
 if(s<3600)return Math.floor(s/60)+' dk önce';
 if(s<86400)return Math.floor(s/3600)+' sa önce';
 return Math.floor(s/86400)+' gün önce';
}
/* tarayıcı depolamasında Hunger'ın kapladığı yer (bayt) */
function usedBytes(){
 let n=0;
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('hunger')===0)n+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}
 return n*2;
}
const mb=b=>(b/1048576).toFixed(b<1048576*10?1:0).replace('.',',')+' MB';

/* ---- küçük görüntü: oyun sahnesinden belirli aralıklarla alınır, kayıtla birlikte saklanır ---- */
let thumb='',thumbReq=false;
const TW=192,TH=108,tc=document.createElement('canvas');tc.width=TW;tc.height=TH;
function grab(){
 try{
  const cv=$('#c'),g=tc.getContext('2d');
  const sw=cv.width,sh=cv.height;if(!sw||!sh)return;
  const r=TW/TH;let cw=sw,ch=sh;
  if(sw/sh>r)cw=Math.round(sh*r);else ch=Math.round(sw/r);       /* ortadan 16:9 kırpılır */
  g.drawImage(cv,Math.floor((sw-cw)/2),Math.floor((sh-ch)/2),cw,ch,0,0,TW,TH);
  const u=tc.toDataURL('image/jpeg',.55);
  if(u.length<40000)thumb=u;
 }catch(e){}
}
HG.saveThumb=()=>thumb;
{
 const r0=HG.Scene.render;
 HG.Scene.render=function(){
  const r=r0.apply(this,arguments);
  if(thumbReq&&ui.state==='play'){thumbReq=false;grab()}
  return r;
 };
 setInterval(()=>{if(ui.state==='play'&&!ui.sleeping)thumbReq=true},7000);
}

function refreshCont(){
 const b=$('#bCont');if(!b)return;
 const sl=HG.listSlots();
 b.hidden=!sl.length;
 /* Devam Et düğmesinin altında en son kaydın özeti gösterilir */
 const s=sl[0];
 b.innerHTML='Devam Et'+(s?'<small>Gün '+s.day+' · Seviye '+s.lvl+' · '+esc(ago(s.ts))+'</small>':'');
}
function render(){
 const L=$('#svL');if(!L)return;
 const slots=HG.listSlots(),max=HG.MAXSLOT||10,manual=slots.filter(s=>!s.auto).length;
 $('#svC').textContent=manual+'/'+max+' kayıt · '+mb(usedBytes());
 const S=$('#svS');
 S.textContent=msg||(slots.length?'Bir kaydı yükleyebilir, adını değiştirebilir, bilgisayara indirebilir veya silebilirsiniz.':'Henüz kayıtlı oyun yok. Oyunda Duraklat › Oyunu Kaydet ile kayıt alınır; kayıt dosyası varsa Dosyadan yükle ile açılır.');
 S.classList.toggle('on',!!msg);
 L.innerHTML=slots.map((s,i)=>{
  const th=typeof s.th==='string'&&s.th.indexOf('data:image/jpeg')===0?`<img alt="" src="${s.th}">`:'<span class="svn">HUNGER</span>';
  return `<div class="sl${s.auto?' auto':''}" data-id="${esc(s.id)}"><div class="sth">${th}<em>Gün ${s.day}</em></div>`+
   `<div class="sn"><b>${esc(s.name)}</b>${s.auto?'<i class="tg">ESKİ OTOMATİK</i>':''}${HG.G&&HG.G.slot===s.id&&ui.state!=='menu'?'<i class="tg son">AÇIK OYUN</i>':''}${i===0?'<i class="tg son">EN SON</i>':''}`+
   `<small>Seviye ${s.lvl} · ${esc(fmt(s.ts))} · ${esc(ago(s.ts))}</small>${s.auto?'<small>Önceki sürümden kalan otomatik kayıt.</small>':''}</div>`+
   `<div class="sa"><button type="button" class="pri" data-a="load">Yükle</button>${s.auto?'':'<button type="button" class="ghost" data-a="ren">Ad değiştir</button>'}<button type="button" class="ghost" data-a="dl">İndir</button><button type="button" class="ghost dg" data-a="del">Sil</button></div></div>`;
 }).join('');
}
function open(m){
 msg=m||'';$('#sv').hidden=false;render();try{HG.snd('ui_open')}catch(e){}
}
function close(){$('#sv').hidden=true;msg='';refreshCont();try{HG.snd('ui_close')}catch(e){}}
function startFrom(id){close();HG.initAudio();if(ui.state==='pause')HG.save();HG.startGame(true,id)}
async function onFile(f){
 if(!f)return;
 let text='';try{text=await f.text()}catch(e){open('Dosya okunamadı.');return}
 const r=HG.importText(text,f.name);
 if(r.err){open(r.err);return}
 startFrom(r.id);
}
function setup(){
 if(!$('#sv'))return;
 const fi=$('#fileIn');
 fi.addEventListener('change',()=>{const f=fi.files&&fi.files[0];fi.value='';onFile(f)});
 for(const id of ['#bSaved','#bSaved2']){const b=$(id);if(b)b.onclick=()=>{HG.initAudio();open()}}
 $('#svF').onclick=()=>fi.click();
 $('#svX').onclick=close;
 $('#sv').addEventListener('pointerdown',e=>{if(e.target===$('#sv'))close()});
 $('#svL').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;
  const row=b.closest('.sl'),id=row.dataset.id,a=b.dataset.a;
  if(a==='load')startFrom(id);
  else if(a==='dl'){HG.downloadSlot(id)}
  else if(a==='del'){
   if(b.dataset.sure){HG.deleteSlot(id);msg='Kayıt silindi.';render();refreshCont()}
   else{b.dataset.sure='1';b.textContent='Silinsin mi?';b.classList.add('on');setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='Sil';b.classList.remove('on')}},3000)}
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
 /* Oyunu Kaydet: Otomatik kayıt (tarayıcı) veya Manuel kayıt (dosya indirme) */
 const sd=$('#sd');
 const sdOpen=()=>{
  const slot=HG.G&&HG.G.slot&&HG.listSlots().find(x=>x.id===HG.G.slot);
  $('#sdS').textContent=slot?'Bu oyun şu an "'+slot.name+'" kaydına otomatik kaydediliyor. Kayıt türünü seçin.':'Kayıt türünü seçin.';
  $('#sdAuto b').textContent=slot?'Otomatik kaydı şimdi güncelle':'Otomatik kayıt';
  sd.hidden=false;try{HG.snd('ui_open')}catch(e){}
 };
 const sdClose=()=>{sd.hidden=true;try{HG.snd('ui_close')}catch(e){}};
 const bs=$('#bSaveGame');if(bs)bs.onclick=sdOpen;
 $('#sdX').onclick=sdClose;
 sd.addEventListener('pointerdown',e=>{if(e.target===sd)sdClose()});
 $('#sdAuto').onclick=()=>{if(HG.manualSave(false))sdClose()};
 $('#sdMan').onclick=()=>{if(HG.downloadCurrent())sdClose()};
 addEventListener('keydown',e=>{if(e.code==='Escape'&&!sd.hidden){e.stopImmediatePropagation();e.preventDefault();sdClose()}},true);
 refreshCont();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
HG.savesUI={open,close};
})();
