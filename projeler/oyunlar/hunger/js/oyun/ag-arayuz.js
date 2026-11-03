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
 <p>Dört oyuncuya kadar ortak oyun. Ev sahibinin verdiği bağlantı kodunu girerek onun dünyasına katılın.</p>
 <div class="wform">
  <label>Adınız<input id="cpName" type="text" maxlength="16" autocomplete="off" spellcheck="false"></label>
  <label>Bağlantı kodu<input id="cpCode" type="text" maxlength="7" placeholder="ABC-DEF" autocomplete="off" spellcheck="false"></label>
 </div>
 <p id="cpSt" class="cps"></p>
 <div class="btns"><button id="cpGo" type="button">Katıl</button><button id="cpX" class="ghost" type="button">Geri (Esc)</button></div>
 <small class="cph">Oyun kurmak için: bir oyuna girin, Duraklat menüsünde «Co-op oyun aç» düğmesine basın ve çıkan kodu arkadaşlarınıza iletin. Bütün oyuncular aynı oyun sürümünü kullanmalıdır.</small>
 <details id="cpAdv"><summary>Bağlantı ayarları ve sınama</summary>
  <p class="cph">Aynı ağdaki bilgisayarlar birbirini kendiliğinden bulur. Farklı ağlardaki (ayrı evler, mobil internet) oyuncular için ara sunucu gerekir; aşağıdaki sınama hangi aşamada takıldığınızı söyler.</p>
  <div class="btns"><button id="cpTest" class="ghost" type="button">Bağlantıyı sına</button></div>
  <div id="cpRes" class="cpres"></div>
  <div class="wform">
   <label>Kendi aktarma (TURN) sunucunuz<input id="cpTurn" type="text" placeholder="turn:sunucu:3478 veya https://… bilgi adresi" autocomplete="off" spellcheck="false"></label>
   <label>TURN kullanıcı adı<input id="cpUser" type="text" autocomplete="off" spellcheck="false"></label>
   <label>TURN parolası<input id="cpPass" type="text" autocomplete="off" spellcheck="false"></label>
   <label>Aracı sunucu (isteğe bağlı)<input id="cpSrv" type="text" placeholder="boşsa genel sunucu" autocomplete="off" spellcheck="false"></label>
  </div>
  <label class="cpchk"><input id="cpRelay" type="checkbox"> Her zaman aktarma sunucusu kullan (doğrudan bağlantı denenmez)</label>
  <div class="btns"><button id="cpSave" class="ghost" type="button">Ayarları kaydet</button><button id="cpReset" class="ghost" type="button">Varsayılana dön</button></div>
  <small class="cph">Operatör ağı veya mobil internet kullanan oyuncular için ücretsiz bir TURN hesabı (örneğin metered.ca) açıp bilgilerini buraya yazmak en kalıcı çözümdür. Ayarlar yalnızca bu tarayıcıda saklanır.</small>
 </details></div>`);
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

/* ---- Bağlantı ayarları ve sınama ---- */
{
 const q=s=>dlg.querySelector(s);
 const turnIn=q('#cpTurn'),userIn=q('#cpUser'),passIn=q('#cpPass'),srvIn=q('#cpSrv'),relayIn=q('#cpRelay'),res=q('#cpRes'),testB=q('#cpTest');
 for(const i of [turnIn,userIn,passIn,srvIn]){
  i.addEventListener('keydown',e=>e.stopPropagation());
  i.addEventListener('keyup',e=>e.stopPropagation());
 }
 function loadCfg(){
  if(!net.agCfg)return;
  const c=net.agCfg.get();
  turnIn.value=c.turn;userIn.value=c.user;passIn.value=c.pass;srvIn.value=c.srv;relayIn.checked=!!c.relay;
 }
 loadCfg();
 q('#cpSave').addEventListener('click',()=>{
  if(!net.agCfg)return;
  net.agCfg.set({turn:turnIn.value,user:userIn.value,pass:passIn.value,srv:srvIn.value,relay:relayIn.checked});
  res.innerHTML='<div class="ok">Ayarlar kaydedildi. Bundan sonraki bağlantılarda kullanılacak.</div>';
 });
 q('#cpReset').addEventListener('click',()=>{
  if(!net.agCfg)return;
  net.agCfg.sifirla();loadCfg();
  res.innerHTML='<div class="ok">Varsayılan sunuculara dönüldü.</div>';
 });
 testB.addEventListener('click',async()=>{
  if(!HG.netTest)return;
  testB.disabled=true;res.innerHTML='<div class="wait">Sınanıyor…</div>';
  try{
   const r=await HG.netTest(m=>{res.innerHTML='<div class="wait">'+esc(m)+'</div>'});
   const rows=r.satir.map(s=>'<div class="'+(s[0]==='✓'?'ok':'no')+'">'+esc(s)+'</div>').join('');
   res.innerHTML='<div class="sum">'+esc(r.ozet)+'</div>'+rows+(net.iceWarn?'<div class="no">'+esc(net.iceWarn)+'</div>':'');
  }catch(e){res.innerHTML='<div class="no">Sınama yapılamadı: '+esc(String(e&&e.message||e))+'</div>'}
  testB.disabled=false;
 });
}
{
 const bar=$('#menu .btns');
 if(bar){
  const b=mk('button','bCoop','ghost',"Oyuna Katıl");b.type='button';
  const nb=$('#bNew');if(nb&&nb.parentNode===bar)nb.after(b);else bar.appendChild(b);   /* Yeni Oyun düğmesinin hemen altında */
  b.addEventListener('click',()=>{HG.initAudio&&HG.initAudio();openDlg()});
 }
}

/* ============================================================ Duraklatma menüsü ============================================================ */
const pcard=$('#pause .card');
const ppanel=mk('div','cpPause');
if(pcard){const host=$('#pmCoop');if(host)host.appendChild(ppanel);else pcard.insertBefore(ppanel,pcard.querySelector('.btns'))}
function playersHtml(){
 const L=[];
 L.push(`<li><b>${esc(net.name)}</b> <span>${net.role==='host'?'ev sahibi · siz':'siz'}</span></li>`);
 for(const r of HG.remote){
  if(!r.P||!r.P.ready)continue;
  const P=r.P,lat=P.lat||(P===net.hostP?net.lat:0);
  const ping=lat?Math.round(lat)+' ms':'—';
  const yol=P.yol?' · '+P.yol:'';
  const rol=(net.role==='guest'&&P===net.hostP)?'ev sahibi · ':'';
  const kb=(net.role==='host'&&!P.virtual)?` <button type="button" class="ghost cpKick" data-p="${esc(P.id)}" title="Oyuncuyu bu oyundan çıkar">Çıkar</button>`:'';
  L.push(`<li><b>${esc(r.name)}</b> <span>${rol}${r.alive?Math.max(0,r.hp|0)+'% can':'düştü'} · ${ping}${yol}${kb}</span></li>`);
 }
 return '<ul class="cpl">'+L.join('')+'</ul>';
}
let paused=false;                                   /* sınama sonucu ekranda dururken panel tazelenmez */
function renderPause(){
 if(!ppanel||paused)return;
 const live=HG.coopLive();
 if(!live){
  if(net.st==='connecting'){ppanel.innerHTML=`<p class="cps">${esc(net.msg)}</p>`;return}
  const err=net.st==='error'?`<p class="cps bad">${esc(net.msg)}</p>`:'';
  ppanel.innerHTML=err+`<button id="cpHost" class="ghost" type="button">Co-op oyun aç (4 oyuncuya kadar)</button><small class="cph">Dünyanızı arkadaşlarınızla paylaşın: kod üretilir, arkadaşlarınız ana menüden «Oyuna Katıl» ile girer.</small>`;
  return;
 }
 if(net.role==='host'){
  const code=net.code?net.fmtCode(net.code):'…';
  ppanel.innerHTML=`<div class="cpbox"><div class="cpk">Bağlantı kodu</div><button id="cpCopy" class="cpcode" type="button" title="Kopyalamak için tıklayın">${esc(code)}</button><small class="cph">Kodu arkadaşlarınıza iletin; kopyalamak için tıklayın. Bu sayfa açık kaldığı sürece kod geçerlidir.</small><button id="cpLink" class="ghost" type="button" title="Tıklayınca kod kendiliğinden dolan davet bağlantısını kopyalar">Davet bağlantısını kopyala</button></div>${playersHtml()}<div class="cpres" id="cpPRes"></div><button id="cpPTest" class="ghost" type="button">Bağlantıyı sına</button><small class="cph">Co-op'ta oyun duraklamaz; menü açıkken dünya akmaya devam eder. Arkadaşınız bağlanamıyorsa sınamayı iki tarafta da çalıştırın.</small><button id="cpEnd" class="ghost" type="button">Co-op'u kapat</button>`;
 }else{
  ppanel.innerHTML=`${playersHtml()}<small class="cph">Co-op'ta oyun duraklamaz; menü açıkken dünya akmaya devam eder.</small><button id="cpLeave" class="ghost" type="button">Co-op'tan ayrıl</button>`;
 }
}
ppanel.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='cpPTest'){
  const res=ppanel.querySelector('#cpPRes');if(!res||!HG.netTest)return;
  b.disabled=true;res.innerHTML='<div class="wait">Sınanıyor…</div>';
  paused=true;                                                   /* sınama sürerken panel yeniden çizilmesin */
  HG.netTest(m=>{res.innerHTML='<div class="wait">'+esc(m)+'</div>'}).then(r=>{
   res.innerHTML='<div class="sum">'+esc(r.ozet)+'</div>'+r.satir.map(s=>'<div class="'+(s[0]==='✓'?'ok':'no')+'">'+esc(s)+'</div>').join('');
   b.disabled=false;paused=false;
  },()=>{res.innerHTML='<div class="no">Sınama yapılamadı.</div>';b.disabled=false;paused=false});
  return;
 }
 if(b.id==='cpLink'&&net.code)copy(location.origin+location.pathname+'?coop='+net.code,'Davet bağlantısı kopyalandı.');
 else if(b.classList.contains('cpKick')){const P=net.peers.find(q=>q.id===b.dataset.p);if(P&&net.kick(P)){HG.toast(P.name+' oyundan çıkarılıyor.');setTimeout(renderPause,500)}}
 else if(b.id==='cpHost'){net.setName(net.name);if(net.host())renderPause()}
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
const DIRS=['K','KD','D','GD','G','GB','B','KB'];          /* arkadaşın yönü (kuzey, kuzeydoğu, ...) */
const hud=mk('div','cphud');hud.hidden=true;root.appendChild(hud);
function updHud(){
 if(!HG.coopLive()||ui.state==='menu'){hud.hidden=true;return}
 const L=[];
 for(const r of HG.remote){
  if(!r.P||!r.P.ready)continue;
  const dx=r.x-G.px,dz=r.z-G.py,dist=Math.round(Math.hypot(dx,dz)),dir=DIRS[Math.round((((Math.atan2(dx,-dz)*180/Math.PI)+360)%360)/45)%8];
  L.push(`<div class="cpp"><i class="${r.alive?'on':'off'}"></i><b>${esc(r.name)}</b><span>${r.alive?Math.max(0,r.hp|0)+'%':'düştü'} · ${dist} m ${dir}${net.lat?' · '+Math.round(net.lat)+' ms':''}</span></div>`);
 }
 if(net.role==='host'&&!L.length)L.push(`<div class="cpp"><i class="wait"></i><b>Kod: ${esc(net.fmtCode(net.code)||'…')}</b><span>oyuncu bekleniyor</span></div>`);
 else if(net.role==='host'&&L.length)L.push(`<div class="cpp"><i class="wait"></i><b>Kod: ${esc(net.fmtCode(net.code)||'…')}</b><span>${L.length+1}/${(net.MAXG||1)+1} oyuncu</span></div>`);
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
 <div class="btns"><button id="cpRe" type="button">Yeniden bağlan</button><button id="cpSolo" class="ghost" type="button">Bu dünyada tek başıma devam et</button><button id="cpMenu" class="ghost" type="button">Ana menüye dön</button></div>
 <small class="cph">Yeniden bağlanırsanız dünya ev sahibinden yeniden alınır; çantanız ve gelişiminiz geri yüklenir. Tek başına devam ederseniz dünyanın o anki kopyası yerelde çalışır; sonradan «Oyunu Kaydet» ile saklayabilirsiniz.</small></div>`);
lost.hidden=true;root.appendChild(lost);
HG.on('coop-lost',e=>{
 closeChat(false);
 const kick=!!(e&&e.why==='kick');
 const w=lost.querySelector('#cplW');if(w)w.textContent=kick?'Ev sahibi sizi bu oyundan çıkardı.':'Ev sahibi ile bağlantı kesildi.';
 const rb=lost.querySelector('#cpRe');if(rb){rb.hidden=kick||!net.code;rb.disabled=false;rb.textContent='Yeniden bağlan'}
 lost.hidden=false;HG.unlock&&HG.unlock(true);
 for(const k in HG.inp.keys)HG.inp.keys[k]=false;HG.inp.mouseDown=false;
});
lost.querySelector('#cpRe').addEventListener('click',()=>{
 const b=lost.querySelector('#cpRe');
 b.disabled=true;b.textContent='Bağlanılıyor…';
 if(!net.rejoin||!net.rejoin()){b.disabled=false;b.textContent='Yeniden bağlan';HG.toast('Yeniden bağlanılamadı.')}
});
net.onStatus(st=>{
 if(lost.hidden)return;
 if(st==='open'||st==='loading')lost.hidden=true;                    /* yeniden bağlanma başarılı */
 else if(st==='error'){const b=lost.querySelector('#cpRe');if(b){b.disabled=false;b.textContent='Yeniden bağlan'}}
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

/* Davet bağlantısı (?coop=KOD): ana menü hazır olunca katılma penceresi kod dolu açılır */
{
 let m=null;try{m=/[?&]coop=([0-9A-Za-z-]{6,7})/.exec(location.search)}catch(e){}
 const c=m?net.normCode(m[1]):'';
 if(c.length===6){
  let tries=0;
  const go=()=>{
   if(ui.state!=='menu'||HG.busy){if(tries++<40)setTimeout(go,500);return}
   openDlg();codeIn.value=c.slice(0,3)+'-'+c.slice(3);
   try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  };
  setTimeout(go,600);
 }
}

/* Ana menüye dönüşte (sayfa yeniden yüklenir) hiçbir ek işlem gerekmez: beforeunload ayrıldığını bildirir. */
HG.coopUI={openJoin:openDlg,renderPause,openChat};
})();
