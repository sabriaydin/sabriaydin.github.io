/* Hunger 3D - co-op arayüzü: ana menüde "Co-op" penceresi (ad, kod, katıl), duraklatma menüsünde oyun açma/kod/oyuncu listesi,
   oyun içinde oyuncu durumu, sohbet (Enter) ve bağlantı koptu penceresi. Bütün öğeler burada oluşturulur. */
(()=>{
'use strict';
const {G,ui,$}=HG;
const net=HG.net;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mk=(tag,id,cls,html)=>{const e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
const root=$('#game')||document.body;
const copy=(txt,msg)=>{
 try{navigator.clipboard.writeText(txt).then(()=>HG.toast(msg),()=>HG.toast(txt))}catch(e){HG.toast(txt)}
};

/* ============================================================ Katılma penceresi (ana menü) ============================================================ */
const dlg=mk('div','coop',null,`<div class="card"><h1 style="font-size:26px;letter-spacing:.1em">CO-OP</h1>
 <p>İki oyunculu ortak oyun. Ev sahibinin verdiği bağlantı kodunu girerek onun dünyasına katılın.</p>
 <div class="wform">
  <label>Adınız<input id="cpName" type="text" maxlength="16" autocomplete="off" spellcheck="false"></label>
  <label>Bağlantı kodu<input id="cpCode" type="text" maxlength="7" placeholder="ABC-DEF" autocomplete="off" spellcheck="false"></label>
 </div>
 <p id="cpSt" class="cps"></p>
 <div class="btns"><button id="cpGo" type="button">Katıl</button><button id="cpX" class="ghost" type="button">Geri (Esc)</button></div>
 <small class="cph">Oyun kurmak için: bir oyuna girin, Duraklat menüsünde «Co-op oyun aç» düğmesine basın ve çıkan kodu arkadaşınıza iletin. Her iki oyuncu da aynı oyun sürümünü kullanmalıdır.</small></div>`);
dlg.hidden=true;root.appendChild(dlg);
const nameIn=dlg.querySelector('#cpName'),codeIn=dlg.querySelector('#cpCode'),stEl=dlg.querySelector('#cpSt'),goB=dlg.querySelector('#cpGo');
for(const i of [nameIn,codeIn]){
 i.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Enter'){e.preventDefault();goB.click()}if(e.code==='Escape'){e.preventDefault();closeDlg()}});
 i.addEventListener('keyup',e=>e.stopPropagation());
}
codeIn.addEventListener('input',()=>{
 codeIn.classList.remove('bad');
 const v=net.normCode(codeIn.value);codeIn.value=v.length>3?v.slice(0,3)+'-'+v.slice(3):v;
});
function openDlg(){
 if(ui.state!=='menu'||HG.busy)return;
 nameIn.value=net.name;dlg.hidden=false;
 if(net.st!=='connecting'&&net.st!=='loading')setSt('',false);
 setTimeout(()=>codeIn.focus(),30);
}
function closeDlg(){
 if(net.st==='connecting'||net.st==='loading')return;
 dlg.hidden=true;
}
function setSt(msg,bad){stEl.textContent=msg||'';stEl.classList.toggle('bad',!!bad)}
goB.addEventListener('click',()=>{
 HG.initAudio&&HG.initAudio();
 net.setName(nameIn.value);
 const c=net.normCode(codeIn.value);
 if(c.length!==6){codeIn.classList.add('bad');setSt('Kod 6 karakterden oluşur (örnek: ABC-DEF).',true);codeIn.focus();return}
 net.join(c);
});
dlg.querySelector('#cpX').addEventListener('click',closeDlg);
dlg.addEventListener('pointerdown',e=>{if(e.target===dlg)closeDlg()});
{
 const bar=$('#menu .btns');
 if(bar){
  const b=mk('button','bCoop','ghost',"Co-op'a Katıl");b.type='button';
  bar.appendChild(b);                       /* Kayıtlı Oyunlar / Ayarlar çifti bozulmasın: Co-op düğmesi altta tam genişlikte */
  b.addEventListener('click',()=>{HG.initAudio&&HG.initAudio();openDlg()});
 }
}

/* ============================================================ Duraklatma menüsü ============================================================ */
const pcard=$('#pause .card');
const ppanel=mk('div','cpPause');
if(pcard){const btns=pcard.querySelector('.btns');pcard.insertBefore(ppanel,btns)}
function playersHtml(){
 const L=[];
 L.push(`<li><b>${esc(net.name)}</b> <span>${net.role==='host'?'ev sahibi · siz':'siz'}</span></li>`);
 for(const r of HG.remote){
  if(!r.P||!r.P.ready)continue;
  const ping=net.lat?Math.round(net.lat)+' ms':'—';
  L.push(`<li><b>${esc(r.name)}</b> <span>${net.role==='guest'?'ev sahibi · ':''}${r.alive?Math.max(0,r.hp|0)+'% can':'düştü'} · ${ping}</span></li>`);
 }
 return '<ul class="cpl">'+L.join('')+'</ul>';
}
function renderPause(){
 if(!ppanel)return;
 const live=HG.coopLive();
 if(!live){
  if(net.st==='connecting'){ppanel.innerHTML=`<p class="cps">${esc(net.msg)}</p>`;return}
  const err=net.st==='error'?`<p class="cps bad">${esc(net.msg)}</p>`:'';
  ppanel.innerHTML=err+`<button id="cpHost" class="ghost" type="button">Co-op oyun aç (2 oyuncu)</button><small class="cph">Dünyanızı bir arkadaşınızla paylaşın: kod üretilir, arkadaşınız ana menüden «Co-op'a Katıl» ile girer.</small>`;
  return;
 }
 if(net.role==='host'){
  const code=net.code?net.fmtCode(net.code):'…';
  ppanel.innerHTML=`<div class="cpbox"><div class="cpk">Bağlantı kodu</div><button id="cpCopy" class="cpcode" type="button" title="Kopyalamak için tıklayın">${esc(code)}</button><small class="cph">Kodu arkadaşınıza iletin; kopyalamak için tıklayın. Bu sayfa açık kaldığı sürece kod geçerlidir.</small></div>${playersHtml()}<small class="cph">Co-op'ta oyun duraklamaz; menü açıkken dünya akmaya devam eder.</small><button id="cpEnd" class="ghost" type="button">Co-op'u kapat</button>`;
 }else{
  ppanel.innerHTML=`${playersHtml()}<small class="cph">Co-op'ta oyun duraklamaz; menü açıkken dünya akmaya devam eder.</small><button id="cpLeave" class="ghost" type="button">Co-op'tan ayrıl</button>`;
 }
}
ppanel.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='cpHost'){net.setName(net.name);if(net.host())renderPause()}
 else if(b.id==='cpCopy')copy(net.fmtCode(net.code),'Bağlantı kodu kopyalandı: '+net.fmtCode(net.code));
 else if(b.id==='cpEnd'){net.leave();renderPause()}
 else if(b.id==='cpLeave'){net.leave()}
});
if($('#pause')){
 new MutationObserver(()=>{if(!$('#pause').hidden)renderPause()}).observe($('#pause'),{attributes:true,attributeFilter:['hidden']});
}
setInterval(()=>{if($('#pause')&&!$('#pause').hidden&&(HG.coopLive()||net.st==='connecting'))renderPause()},1000);

/* ============================================================ Durum bildirimleri ============================================================ */
net.onStatus((st,msg)=>{
 if(!dlg.hidden){
  if(st==='connecting'||st==='loading'){setSt(msg,false);goB.disabled=true;nameIn.disabled=codeIn.disabled=true}
  else if(st==='error'){setSt(msg,true);goB.disabled=false;nameIn.disabled=codeIn.disabled=false}
  else if(st==='open'){dlg.hidden=true;goB.disabled=false;nameIn.disabled=codeIn.disabled=false;setSt('',false)}
  else{goB.disabled=false;nameIn.disabled=codeIn.disabled=false}
 }else if(st==='error')HG.toast(msg);
 if($('#pause')&&!$('#pause').hidden)renderPause();
});
HG.on('coop',()=>{if($('#pause')&&!$('#pause').hidden)renderPause();updHud()});

/* ============================================================ Oyun içi: oyuncu durumu ve sohbet ============================================================ */
const hud=mk('div','cphud');hud.hidden=true;root.appendChild(hud);
function updHud(){
 if(!HG.coopLive()||ui.state==='menu'){hud.hidden=true;return}
 const L=[];
 for(const r of HG.remote){
  if(!r.P||!r.P.ready)continue;
  L.push(`<div class="cpp"><i class="${r.alive?'on':'off'}"></i><b>${esc(r.name)}</b><span>${r.alive?Math.max(0,r.hp|0)+'%':'düştü'}${net.lat?' · '+Math.round(net.lat)+' ms':''}</span></div>`);
 }
 if(net.role==='host'&&!L.length)L.push(`<div class="cpp"><i class="wait"></i><b>Kod: ${esc(net.fmtCode(net.code)||'…')}</b><span>oyuncu bekleniyor</span></div>`);
 if(net.role==='guest'&&net.hostP&&performance.now()-net.hostP.last>3500)L.push('<div class="cpp warn">Bağlantı zayıf…</div>');
 const ov=['#pause','#dead'].some(s=>{const e=$(s);return e&&!e.hidden});          /* duraklatma/ölüm ekranının üstüne binmesin (bilgi zaten panelde) */
 hud.innerHTML=L.join('');hud.hidden=!L.length||ov;
}
setInterval(updHud,500);

const chat=mk('div','cpchat');root.appendChild(chat);
const chatLog=mk('div','cplog');chat.appendChild(chatLog);
const chatIn=mk('input','cpIn');chatIn.type='text';chatIn.maxLength=200;chatIn.placeholder='Mesaj yazın · Enter: gönder · Esc: kapat';chatIn.autocomplete='off';chatIn.spellcheck=false;chatIn.hidden=true;chat.appendChild(chatIn);
let chatOpen=false;
function addLine(e){
 const d=mk('div',null,'cpm'+(e.sys?' sys':''));
 if(e.sys)d.textContent=e.x;else{const b=document.createElement('b');b.textContent=e.n+': ';d.appendChild(b);d.appendChild(document.createTextNode(e.x))}
 chatLog.appendChild(d);
 while(chatLog.children.length>8)chatLog.firstChild.remove();
 setTimeout(()=>{if(!chatOpen)d.classList.add('old')},9000);
 chat.classList.toggle('has',true);
}
HG.on('chat',addLine);
function openChat(){
 if(chatOpen||ui.state!=='play'||!HG.coopLive())return;
 chatOpen=true;chatIn.hidden=false;chat.classList.add('open');
 for(const d of chatLog.children)d.classList.remove('old');
 HG.unlock(true);setTimeout(()=>chatIn.focus(),20);
}
function closeChat(relock){
 if(!chatOpen)return false;
 chatOpen=false;chatIn.hidden=true;chatIn.value='';chat.classList.remove('open');chatIn.blur();
 for(const d of chatLog.children)setTimeout(()=>d.classList.add('old'),7000);
 if(relock&&ui.state==='play'){ui.relock=false;HG.lock()}
 return true;
}
chatIn.addEventListener('keydown',e=>{
 e.stopPropagation();
 if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();const t=chatIn.value;if(t.trim())net.chat(t);closeChat(true)}
 else if(e.code==='Escape'){e.preventDefault();closeChat(true)}
});
chatIn.addEventListener('keyup',e=>e.stopPropagation());
addEventListener('keydown',e=>{
 if(e.code!=='Enter'&&e.code!=='NumpadEnter')return;
 if(chatOpen||ui.state!=='play'||!HG.coopLive())return;
 const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'))return;
 e.preventDefault();openChat();
});
{
 const o0=HG.extOverlay,c0=HG.extClose;
 HG.extOverlay=()=>chatOpen||(o0?o0():false);
 HG.extClose=silent=>{
  if(chatOpen){closeChat(false);return true}
  return c0?c0(silent):false;
 };
}

/* ============================================================ Bağlantı koptu ============================================================ */
const lost=mk('div','cplost',null,`<div class="card"><h1 style="font-size:26px;letter-spacing:.1em">BAĞLANTI KOPTU</h1>
 <p id="cplW">Ev sahibi ile bağlantı kesildi.</p>
 <div class="btns"><button id="cpSolo" type="button">Bu dünyada tek başıma devam et</button><button id="cpMenu" class="ghost" type="button">Ana menüye dön</button></div>
 <small class="cph">Tek başına devam ederseniz dünyanın o anki kopyası yerelde çalışır; sonradan «Oyunu Kaydet» ile saklayabilirsiniz.</small></div>`);
lost.hidden=true;root.appendChild(lost);
HG.on('coop-lost',()=>{
 closeChat(false);
 lost.hidden=false;HG.unlock&&HG.unlock(true);
 for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;
});
lost.querySelector('#cpMenu').addEventListener('click',()=>{location.reload()});
lost.querySelector('#cpSolo').addEventListener('click',()=>{
 lost.hidden=true;
 net.shutdown(true);
 G.slot=null;
 HG.toast('Tek kişilik devam ediyorsunuz. Dünyayı kaydetmek için Duraklat › Oyunu Kaydet.');
 if(ui.state==='play'){ui.relock=false;HG.lock()}
 else if(ui.state==='pause'){}
});
{
 const o0=HG.extOverlay;
 HG.extOverlay=()=>!lost.hidden||(o0?o0():false);
}

/* ============================================================ Esc: katılma penceresi ============================================================ */
addEventListener('keydown',e=>{
 if(e.code==='Escape'&&!dlg.hidden&&ui.state==='menu'){e.preventDefault();closeDlg()}
},true);

/* Ana menüye dönüşte (sayfa yeniden yüklenir) hiçbir ek işlem gerekmez: beforeunload ayrıldığını bildirir. */
HG.coopUI={openJoin:openDlg,renderPause,openChat};
})();
