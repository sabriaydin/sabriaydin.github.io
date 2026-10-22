/* Hunger 3D - geliştirici konsolu (F1).
   Oyunda olan her şeyi zaman damgasıyla kaydeder: ses olayları, hasar, saldırı, hayvan, envanter, üretim, dünya değişiklikleri,
   durum geçişleri, tuş ve fare girdileri, bildirimler, koruma kararları, console çıktıları ve hatalar.
   Yalnızca kayıt tutar ve gösterir; oyunu değiştiren komut içermez. Özgün dosyalara yalnızca HG.sndHook çağrısı (ses.js) eklenmiştir.
   Erken yüklenir (console ve hata yakalaması için); oyun işlevlerine bağlanan kancalar sayfa yüklenmesi bitince takılır. */
(()=>{
'use strict';
const {ui,$}=HG;
const G=HG.G;
const MAX=3000,SHOW=800;
const CATS=[['sistem','Sistem'],['hata','Hata'],['konsol','Konsol'],['durum','Durum'],['ses','Ses'],['hasar','Hasar'],['saldiri','Saldırı'],['hayvan','Hayvan'],['envanter','Envanter'],['uretim','Üretim'],['dunya','Dünya'],['girdi','Girdi'],['bildirim','Bildirim'],['koruma','Koruma'],['komut','Komut']];
const CN=Object.fromEntries(CATS);
const KEY='hunger-konsol';
const t0=performance.now();
const buf=[],byKey=new Map(),counts={};
let seq=0,off=new Set();
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.off))off=new Set(s.off.filter(k=>CN[k]))}catch(e){}

/* ============================================================ Kayıt çekirdeği ============================================================ */
const lc=s=>String(s).toLocaleLowerCase('tr');
const fmtT=ms=>{const s=ms/1000,m=Math.floor(s/60);return m+':'+(s-m*60).toFixed(1).padStart(4,'0')};
function push(c,m,l){
 if(!CN[c])c='sistem';
 const now=performance.now();m=String(m).slice(0,500);
 const key=c+'|'+m,o=byKey.get(key);
 /* aynı kayıt kısa sürede yinelenirse satır çoğaltılmaz, sayaç artar (ör. kalp atışı, ayak sesi) */
 if(o&&!o.gone&&seq-o.n<60&&now-o.t2<2500){o.r++;o.t2=now;mark(o);return o}
 const e={n:++seq,t:now-t0,t2:now,c,m,l:l||'bilgi',r:1,el:null,gone:false,k:key};
 buf.push(e);byKey.set(key,e);counts[c]=(counts[c]||0)+1;
 if(buf.length>MAX){
  const d=buf.splice(0,buf.length-MAX);
  for(const x of d){x.gone=true;counts[x.c]--;if(x.el&&x.el.parentNode)x.el.remove();if(byKey.get(x.k)===x)byKey.delete(x.k)}
 }
 fresh.push(e);sched();
 return e;
}
HG.log=(c,m,l)=>push(c,m,l);

/* ============================================================ console ve hata yakalama ============================================================ */
function fmtArg(a){
 try{
  if(typeof a==='string')return a;
  if(a instanceof Error)return String(a.stack||a.message).split('\n').slice(0,3).join(' | ');
  if(a&&typeof a==='object'){const j=JSON.stringify(a);return j&&j.length>240?j.slice(0,240)+'…':j}
  return String(a);
 }catch(e){return '[gösterilemedi]'}
}
for(const k of ['log','info','warn','error','debug']){
 const o=console[k];if(typeof o!=='function')continue;
 console[k]=function(...a){
  try{push(k==='error'?'hata':'konsol',a.map(fmtArg).join(' '),k==='error'?'hata':k==='warn'?'uyari':'bilgi')}catch(e){}
  return o.apply(this,a);
 };
}
addEventListener('error',e=>{try{push('hata',(e.message||'Hata')+(e.filename?' ('+String(e.filename).split('/').pop()+':'+e.lineno+')':''),'hata')}catch(x){}});
addEventListener('unhandledrejection',e=>{try{push('hata','Yakalanmayan söz reddi: '+fmtArg(e.reason),'hata')}catch(x){}});

/* ============================================================ Arayüz ============================================================ */
let root=null,listEl=null,statEl=null,qEl=null,chipsEl=null,frzEl=null,autoEl=null;
let open=false,frozen=false,auto=true,q='',tm=0,stT=0;
const fresh=[],dirty=new Set(),chipEl={};
const pass=e=>!off.has(e.c)&&(!q||lc(e.m).includes(q)||lc(CN[e.c]).includes(q));
function mark(e){if(e.el){dirty.add(e);sched()}}
function sched(){if(open&&!frozen&&!tm)tm=setTimeout(flush,90)}

function mkRow(e){
 const d=document.createElement('div');d.className='kr l-'+e.l+' c-'+e.c;
 const t=document.createElement('time'),b=document.createElement('b'),m=document.createElement('span'),x=document.createElement('i');
 b.textContent=CN[e.c];m.className='km';m.textContent=e.m;x.className='kx';
 d.append(t,b,m,x);e.el=d;upRow(e);return d;
}
function upRow(e){
 const d=e.el;if(!d)return;
 d.firstChild.textContent=fmtT(e.t2-t0);
 d.lastChild.textContent=e.r>1?'×'+e.r:'';
}
function chips(){
 for(const [k] of CATS){const c=chipEl[k];if(c){c.firstChild.textContent=CN[k]+' ';c.lastChild.textContent=counts[k]||0;c.classList.toggle('off',off.has(k))}}
}
function flush(){
 tm=0;
 if(!open||frozen||!listEl)return;
 const near=listEl.scrollHeight-listEl.scrollTop-listEl.clientHeight<48;
 const fr=document.createDocumentFragment();
 for(const e of fresh.splice(0)){if(!e.gone&&pass(e))fr.appendChild(mkRow(e))}
 listEl.appendChild(fr);
 for(const e of dirty)if(e.el&&!e.gone)upRow(e);
 dirty.clear();
 while(listEl.childElementCount>SHOW)listEl.firstChild.remove();
 if(auto&&near)listEl.scrollTop=listEl.scrollHeight;
 chips();
}
function renderAll(){
 fresh.length=0;dirty.clear();
 listEl.textContent='';
 const fr=document.createDocumentFragment();
 let n=0;
 for(let i=buf.length-1;i>=0&&n<SHOW;i--){const e=buf[i];e.el=null;if(pass(e)){fr.prepend(mkRow(e));n++}}
 listEl.appendChild(fr);
 if(auto)listEl.scrollTop=listEl.scrollHeight;
 chips();
}
function savePref(){try{localStorage.setItem(KEY,JSON.stringify({off:[...off]}))}catch(e){}}

/* ---- dışa aktarma ---- */
function text(onlyShown){
 const L=['Hunger 3D geliştirici konsolu · '+new Date().toLocaleString('tr-TR'),
  'Tarayıcı: '+navigator.userAgent,'Ekran: '+innerWidth+'×'+innerHeight+' @'+(devicePixelRatio||1)+'x',''];
 for(const e of buf){
  if(onlyShown&&!pass(e))continue;
  L.push('['+fmtT(e.t2-t0)+'] ['+CN[e.c]+(e.l==='hata'?' · HATA':e.l==='uyari'?' · UYARI':'')+'] '+e.m+(e.r>1?' ×'+e.r:''));
 }
 return L.join('\n');
}
function copyText(){
 const t=text(true);
 const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(fb);else fb();
 push('sistem','Kayıt panoya kopyalandı ('+t.split('\n').length+' satır).');
}
function saveFile(){
 const d=new Date(),p=n=>String(n).padStart(2,'0');
 const name='hunger-konsol-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'.txt';
 const u=URL.createObjectURL(new Blob([text(true)],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),4000);
 push('sistem','Kayıt dosyaya kaydedildi: '+name);
}
function clearLog(){
 buf.length=0;byKey.clear();for(const k in counts)counts[k]=0;fresh.length=0;dirty.clear();
 if(listEl)listEl.textContent='';
 chips();
 push('sistem','Kayıt temizlendi.');
}

/* ---- durum satırı ---- */
const BEDN={wind:'rüzgâr',sea:'deniz',foam:'köpük',leaf:'yaprak',rain:'yağmur',drum:'yağmur davulu',whisper:'fısıltı',drone:'gerilim uğultusu'};
/* Durum şeridi: düz metin yerine ayrı ayrı kutucuklar (değere göre renklenir). */
function status(){
 if(!statEl)return;
 const P=[];
 const add=(lab,val,cls,wide)=>P.push({l:lab,v:String(val),c:cls||'',w:!!wide});
 const lvl=(v,lo,mid)=>v<lo?'bad':v<mid?'warn':'ok';
 const perf=HG.perf||{};
 add('Durum',ui.state+(G.cave?' · mağara':''));
 if(perf.fps)add('FPS',perf.fps+' · '+(perf.ms||0).toFixed(1)+' ms',perf.fps<30?'bad':perf.fps<50?'warn':'ok');
 try{if(G.hp!==undefined&&ui.state!=='menu'){
  add('Gün',HG.dayNo());
  add('Konum',Math.round(G.px)+', '+Math.round(G.py)+(G.pz===undefined?'':' · '+G.pz.toFixed(1)+' m'));
  add('Can',Math.round(G.hp),lvl(G.hp,25,60));
  add('Açlık',Math.round(G.hun),lvl(G.hun,20,50));
  add('Susuzluk',Math.round(G.thr),lvl(G.thr,20,50));
  add('Dayanıklılık',Math.round(G.stam),lvl(G.stam,20,50));
 }}catch(e){}
 try{
  let s=HG.audioState()+(ui.mute?' · sessiz':'');
  if(HG.sesGercek){const d=HG.sesGercek.durum();s+=' · '+d.nLoaded+' kayıt'+(d.nFailed?' ('+d.nFailed+' hata)':'')}
  add('Ses',s,ui.mute?'warn':'');
  if(HG.audioBeds){const b=HG.audioBeds(),a=[];for(const k in b)if(b[k]>.012)a.push((BEDN[k]||k)+' '+b[k].toFixed(2));
   add('Ortam',a.length?a.join(', '):'yok','',true)}
 }catch(e){}
 /* kutucuklar yeniden kullanılır: her karede DOM baştan kurulmaz */
 while(statEl.childElementCount>P.length)statEl.lastChild.remove();
 while(statEl.childElementCount<P.length){
  const d=document.createElement('span');d.className='ks';
  d.append(document.createElement('em'),document.createElement('b'));statEl.appendChild(d);
 }
 P.forEach((q,i)=>{const d=statEl.children[i];
  d.className='ks'+(q.c?' '+q.c:'')+(q.w?' wide':'');
  d.firstChild.textContent=q.l;d.lastChild.textContent=q.v;d.title=q.l+': '+q.v;
 });
}

function build(){
 if(root)return;
 root=document.createElement('div');root.id='kns';root.hidden=true;
 root.setAttribute('role','dialog');root.setAttribute('aria-label','Geliştirici konsolu');
 root.innerHTML='<div class="kn-box">'+
  '<div class="kn-top"><h1>GELİŞTİRİCİ KONSOLU <kbd>F1</kbd></h1><div class="kn-btns">'+
   '<button type="button" id="knFrz" aria-pressed="false">Akışı dondur</button>'+
   '<button type="button" id="knAut" aria-pressed="true" class="on">Otomatik kaydır</button>'+
   '<button type="button" id="knClr">Temizle</button>'+
   '<button type="button" id="knCpy">Kopyala</button>'+
   '<button type="button" id="knSav">Dosyaya kaydet</button>'+
   '<button type="button" id="knX" class="ghost">Kapat</button></div></div>'+
  '<div class="kn-st" id="knSt"></div>'+
  '<div class="kn-flt"><div class="kn-qw"><input id="knQ" type="text" placeholder="Kayıtlarda ara…" autocomplete="off" spellcheck="false" aria-label="Kayıtlarda ara"></div>'+
   '<div class="kn-ch" id="knCh"></div></div>'+
  '<div class="kn-l" id="knL" role="log" aria-live="off" tabindex="0"></div>'+
  '<div class="kn-split" id="knSplit" role="separator" aria-orientation="horizontal" title="Sürükleyerek kayıt ve komut alanlarını boyutlandırın"><i></i></div>'+
  '<div class="kn-cmd" id="knCmd"></div>'+
  '<div class="kn-ft">En son '+MAX+' kayıt saklanır, aynı kayıtlar birleştirilir (×sayı). Komut satırı için dünya kuralı "Konsol komutları" açık olmalıdır.</div></div>';
 ($('#game')||document.body).appendChild(root);
 listEl=root.querySelector('#knL');statEl=root.querySelector('#knSt');qEl=root.querySelector('#knQ');chipsEl=root.querySelector('#knCh');
 frzEl=root.querySelector('#knFrz');autoEl=root.querySelector('#knAut');
 for(const [k,n] of CATS){
  const b=document.createElement('button');b.type='button';b.className='kn-c c-'+k;b.dataset.k=k;
  b.append(document.createTextNode(n+' '),document.createElement('i'));
  b.onclick=()=>{if(off.has(k))off.delete(k);else off.add(k);savePref();renderAll()};
  chipsEl.appendChild(b);chipEl[k]=b;
 }
 const all=document.createElement('button');all.type='button';all.className='kn-c kn-all';all.textContent='Tümü';
 all.onclick=()=>{off.clear();savePref();renderAll()};chipsEl.appendChild(all);
 qEl.addEventListener('input',()=>{q=lc(qEl.value.trim());renderAll()});
 /* yazı alanında basılan tuşlar oyuna ulaşmaz (Esc ve F1 hariç) */
 qEl.addEventListener('keydown',e=>{if(e.code!=='Escape'&&e.code!=='F1')e.stopPropagation()});
 qEl.addEventListener('keyup',e=>{if(e.code!=='Escape'&&e.code!=='F1')e.stopPropagation()});
 frzEl.onclick=()=>{
  frozen=!frozen;frzEl.classList.toggle('on',frozen);frzEl.setAttribute('aria-pressed',String(frozen));
  frzEl.textContent=frozen?'Akışı sürdür':'Akışı dondur';
  if(!frozen)renderAll();
 };
 autoEl.onclick=()=>{auto=!auto;autoEl.classList.toggle('on',auto);autoEl.setAttribute('aria-pressed',String(auto));if(auto)listEl.scrollTop=listEl.scrollHeight};
 root.querySelector('#knClr').onclick=clearLog;
 root.querySelector('#knCpy').onclick=copyText;
 root.querySelector('#knSav').onclick=saveFile;
 root.querySelector('#knX').onclick=()=>setOpen(false);
 root.addEventListener('pointerdown',e=>{if(e.target===root)setOpen(false)});
 root.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
 if(HG.konsolBuilt)HG.konsolBuilt(root);                 /* komut satırı ve geliştirici paneli (js/oyun/komut.js) */
 setupSplit(root);
}
/* Boyutlandırma çubukları (iki tane):
   knSplit  — kayıt listesi ile komut alanı arasında; komut alanının toplam yüksekliğini değiştirir.
   kcSplit  — komut çıktısı ile geliştirici paneli arasında; panelin yüksekliğini değiştirir.
   Komut yazma alanı (kc-in) her iki durumda da sabit yükseklikte kalır.
   Seçilen yükseklikler tarayıcıda saklanır. */
function dragBar(sp,key,getH,setH){
 if(!sp)return;
 let drag=null;
 sp.addEventListener('pointerdown',e=>{
  drag={y:e.clientY,h:getH()};sp.classList.add('on');
  try{sp.setPointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();
 });
 sp.addEventListener('pointermove',e=>{if(drag)setH(drag.h+(drag.y-e.clientY))});
 const end=()=>{if(!drag)return;drag=null;sp.classList.remove('on');
  try{localStorage.setItem(typeof key==='function'?key():key,String(Math.round(getH())))}catch(e){}};
 sp.addEventListener('pointerup',end);sp.addEventListener('pointercancel',end);
 sp.addEventListener('keydown',e=>{const d=e.key==='ArrowUp'?24:e.key==='ArrowDown'?-24:0;
  if(d){setH(getH()+d);e.preventDefault()}});
 sp.tabIndex=0;
}
const savedH=k=>{try{return parseInt(localStorage.getItem(k)||'',10)||0}catch(e){return 0}};
function setupSplit(root){
 const box=root.querySelector('.kn-box'),cmd=root.querySelector('#knCmd');
 if(!box||!cmd)return;
 const has=cmd.childElementCount>0;box.classList.toggle('has-cmd',has);
 if(!has)return;
 const pan=root.querySelector('#kcPan'),inp=root.querySelector('.kc-in');
 /* Konsol kurulurken henüz görünmediğinden ölçüler sıfır gelebilir: o durumda pencere boyu
    ve saklanan değerler kullanılır, konsol açılınca gerçek ölçülerle yeniden uygulanır. */
 const boxH=()=>box.clientHeight||Math.round(innerHeight*.86);
 const cmdH=()=>{const h=cmd.getBoundingClientRect().height;return h>1?h:(parseInt(box.style.getPropertyValue('--kncmd'),10)||300)};
 const panH=()=>{const h=pan?pan.getBoundingClientRect().height:0;return h>1?h:(parseInt(cmd.style.getPropertyValue('--kcpan'),10)||210)};
 /* 1) kayıt listesi / komut alanı */
 const MIN=120,setCmd=h=>{const mx=Math.max(MIN,boxH()-220);box.style.setProperty('--kncmd',Math.round(Math.min(mx,Math.max(MIN,h)))+'px')};
 /* 2) komut çıktısı / geliştirici paneli (komut yazma alanı sabit kalır) */
 const PMIN=90,setPan=h=>{
  const inH=(inp&&inp.getBoundingClientRect().height)||34;
  const mx=Math.max(PMIN,cmdH()-inH-70);
  cmd.style.setProperty('--kcpan',Math.round(Math.min(mx,Math.max(PMIN,h)))+'px');
 };
/* Geliştirici modu açıkken komut alanı daha yüksek açılır (panel sığsın), kapalıyken kayıt
    listesine yer kalır. İki durum ayrı ayrı hatırlanır. */
 const devNow=()=>cmd.classList.contains('dev');
 const kCmd=()=>devNow()?'hunger-kncmd-dev':'hunger-kncmd';
 const apply=()=>{setCmd(savedH(kCmd())||(devNow()?500:230));setPan(savedH('hunger-kcpan')||310)};
 apply();HG.konsolResize=apply;
 dragBar(root.querySelector('#knSplit'),kCmd,cmdH,h=>{setCmd(h);setPan(panH())});
 dragBar(root.querySelector('#kcSplit'),'hunger-kcpan',panH,setPan);
}
HG.konsolBox=()=>root;
const clearKeys=()=>{const inp=HG.inp;if(!inp)return;for(const k in inp.keys)inp.keys[k]=false;inp.mouseDown=false;inp.touchAct=false};
function setOpen(v){
 v=!!v;if(v===open)return;
 build();
 if(v){
  open=true;root.hidden=false;
  if(HG.konsolResize)try{HG.konsolResize()}catch(e){}        /* ölçüler ilk açılışta gerçek yerleşime göre uygulanır */
  if(ui.state==='play'){clearKeys();if(HG.unlock)HG.unlock(true)}
  renderAll();status();
  stT=setInterval(status,500);
 }else{
  open=false;root.hidden=true;clearInterval(stT);clearTimeout(tm);tm=0;
  const a=document.activeElement;if(a&&a.blur&&a!==document.body)a.blur();
  if(ui.state==='play'){ui.relock=true;if(HG.lock)HG.lock()}
 }
}
const toggle=()=>setOpen(!open);
HG.konsol={open:()=>setOpen(true),close:()=>setOpen(false),toggle,get isOpen(){return open},clear:clearLog,text,get entries(){return buf}};

/* F1: konsolu aç/kapat. Ayarlar › Kontrol artık F1 ile açılmaz (Ayarlar menüsünden erişilir) */
addEventListener('keydown',e=>{
 if(e.code==='F1'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)toggle();return}
 if(!open)return;
 if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)setOpen(false);return}
 /* konsol açıkken tuşlar oyuna gitmez; yazı alanı ve düğmelerin kendi işlevi korunur */
 const t=e.target;
 if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
 e.stopImmediatePropagation();
 if(e.code==='Tab'||e.code==='Space')return;
},true);

/* diğer pencerelerle uyum: üst katman sorgusu ve kapatma (giris.js bu kancaları kullanır) */
function chain(){
 const eo=HG.extOverlay,ec=HG.extClose;
 HG.extOverlay=()=>open||!!(eo&&eo());
 HG.extClose=silent=>{
  if(open&&!silent){setOpen(false);return true}
  return ec?ec(silent):false;
 };
}

/* ============================================================ Olay kancaları ============================================================ */
const SND={heart:'kalp atışı',stomach:'mide gurultusu',cricket:'cırcır böceği',breath:'nefes',whisper:'fısıltı',stinger:'korku vurgusu',scratch:'tırmalama',hiss:'tıslama',
 hurt:'hasar alma',hitmark:'isabet işareti',hit:'darbe',rock:'kaya darbesi',ore:'maden darbesi',crack:'çatırtı',crumble:'ufalanma',creak:'gıcırtı',leaves:'yaprak hışırtısı',thud:'ağır düşme',
 step:'ayak sesi',step_rock:'ayak sesi (kaya)',step_sand:'ayak sesi (kum)',step_water:'ayak sesi (su)',step_raft:'ayak sesi (sal)',jump:'zıplama',land:'yere iniş',splash:'su sıçraması',
 shear:'kırkma',milk:'sağma',get:'toplama',drink:'su içme',eat:'yeme',craft:'üretim',ui:'arayüz tıkı',ui_open:'pencere açılışı',ui_close:'pencere kapanışı',levelup:'seviye atlama',
 quest:'görev',chest:'sandık',bloodmoon:'kan ayı',pick:'eşya alma',thunder:'gök gürültüsü',bird:'kuş',owl:'baykuş',pop:'patlama',drip:'damla',bowdraw:'yay germe',bowfire:'ok atışı',
 arrowhit:'ok isabeti',arrowflesh:'ok (et)',bandage:'bandaj',shark_warn:'köpek balığı uyarısı',gull:'martı',dolphin:'yunus',whale:'balina',bell:'çan',bark:'havlama',clang:'metal çınlaması',
 buzz:'vızıltı',zoom:'yakınlaştırma',shutter:'fotoğraf',die_shade:'Gölge ölümü',cry_shade:'Gölge çığlığı',call_shade:'Gölge çağrısı',call_wolf:'kurt uluması',call_chicken:'tavuk'};
const sName=k=>SND[k]?k+' — '+SND[k]:k;
HG.sndHook=(k,pos,src)=>{
 try{
  let d='';
  if(pos&&typeof pos.x==='number'&&G.px!==undefined)d=' · '+Math.round(Math.hypot(pos.x-G.px,pos.z-G.py))+' m uzakta';
  push('ses',sName(k)+' ['+src+']'+d);
 }catch(e){}
};

function wrap(name,pre){
 const o=HG[name];if(typeof o!=='function')return;
 HG[name]=function(...a){
  let post=null;try{post=pre(a)}catch(e){}
  const r=o.apply(this,a);
  if(post)try{post(r)}catch(e){}
  return r;
 };
}

function hooks(){
 const IT=HG.IT||{},AN=HG.ANIMAL||{},NAMES=HG.NAMES||{},O=HG.O||{};
 const revO={};for(const k in O)if(revO[O[k]]===undefined)revO[O[k]]=k;
 const oName=v=>v?(NAMES[v]||revO[v]||('#'+v)):'boş';
 const aName=a=>(a&&AN[a.t]&&AN[a.t].n)||(a&&a.t)||'?';
 const R=v=>Math.round(v*10)/10;
 chain();

 wrap('hurt',a=>{
  const hp0=G.hp;
  return ()=>{
   const real=R(hp0-G.hp),src=a[2]&&typeof a[2].x==='number'?' · kaynak '+Math.round(Math.hypot(a[2].x-G.px,a[2].z-G.py))+' m uzakta':'';
   push('hasar','−'+real+' can (istenen '+R(a[0])+') · '+(a[1]||'neden belirtilmedi')+src+' · kalan '+Math.round(G.hp),'uyari');
  };
 });
 wrap('hitAnimal',a=>{
  const t=a[0],hp0=t&&t.hp;
  return ()=>{if(t)push('saldiri',aName(t)+' vuruldu · '+R(hp0-t.hp)+' hasar · kalan '+Math.max(0,Math.round(t.hp)))};
 });
 wrap('killAnimal',a=>()=>push('hayvan',aName(a[0])+' öldü'));
 wrap('craft',a=>{
  const r=HG.RC&&HG.RC[a[0]];if(!r)return null;
  const st=HG.canCraft(r),n0=HG.count(r[0]);
  return ()=>{
   const ok=HG.count(r[0])!==n0||st===1;
   push('uretim',(IT[r[0]]?IT[r[0]].n:r[0])+' ×'+r[1]+' → '+(st===1&&ok?'üretildi':st===-1?'başarısız: istasyon yakında değil':st===1?'başarısız: envanter dolu':'başarısız: malzeme yetersiz'),st===1&&ok?'bilgi':'uyari');
  };
 });
 wrap('toast',a=>()=>push('bildirim',a[0]));
 wrap('save',()=>()=>push('sistem','Oyun kaydedildi.'));
 wrap('placeHeld',()=>()=>push('girdi','Yerleştirme denendi.'));

 /* dünya olayları (blok değişiklikleri ve eklenti olayları) oyun başladıktan sonra kaydedilir */
 HG.on('obj',e=>{
  if(ui.state==='menu')return;
  const x=e.i%HG.W,z=Math.floor(e.i/HG.W);
  push('dunya','Hücre ('+x+','+z+'): '+oName(e.was)+' → '+oName(e.v));
 });
 HG.on('x2',e=>{
  if(ui.state==='menu')return;
  const o=Object.assign({},e);delete o.s;delete o.at;delete o.by;
  push('dunya','Olay '+fmtArg(o));
 });
 HG.on('respawn',e=>push('durum','Yeniden doğma: '+Math.round(e.x)+','+Math.round(e.z)));

 /* tuş ve fare girdileri */
 const SKIP={fwd:1,back:1,left:1,right:1};
 const TRN={sprint:'Koş',jump:'Zıpla',dive:'Dal',use:'Kullan',place:'Yerleştir',inv:'Envanter',craft:'Üretim',map:'Harita',jr:'Günlük',guide:'Rehber',mute:'Sesi aç/kapat',qsave:'Hızlı kaydet',drop:'Eşya at',sort:'Çanta düzenle',photo:'Fotoğraf modu'};
 addEventListener('keydown',e=>{
  if(e.repeat||open||ui.state==='menu')return;
  let act='';
  for(const k in HG.bind)if(HG.keyIs(k,e.code)){act=k;break}
  if(SKIP[act])return;
  if(!act&&/^Digit[1-8]$/.test(e.code))act='slot';
  push('girdi','Tuş '+e.code+(act==='slot'?' → hızlı çubuk '+e.code.slice(5):act?' → '+(TRN[act]||act):''));
 },true);
 addEventListener('pointerdown',e=>{
  if(open||ui.state!=='play'||!e.target||e.target.id!=='c')return;
  push('girdi',(e.button===2?'Sağ':e.button===0?'Sol':'Orta')+' tık'+(ui.locked?'':' (fare kilitli değil)'));
 },true);

 /* durum geçişleri ve envanter farkı (çeyrek saniyede bir) */
 const S={};let inv0=null,invRef=null;
 const edge=(key,val,on,offM)=>{const was=S[key];S[key]=!!val;if(was===undefined)return;if(val&&!was&&on)push('durum',on);else if(!val&&was&&offM)push('durum',offM)};
 const sc=HG.sc||{};
 let beds0=null;
 setInterval(()=>{
  try{
   const st=ui.state;
   if(S.st!==st){if(S.st!==undefined)push('durum','Oyun durumu: '+S.st+' → '+st);S.st=st}
   if(st==='menu'||G.hp===undefined)return;
   /* envanter */
   if(G.inv&&invRef!==G.inv){invRef=G.inv;inv0=null}
   if(G.inv){
    const m={};for(const s of G.inv)if(s)m[s.id]=(m[s.id]||0)+s.n;
    if(inv0){
     for(const id in m){const d=m[id]-(inv0[id]||0);if(d)push('envanter',(d>0?'+':'−')+Math.abs(d)+' '+(IT[id]?IT[id].n:id)+' (toplam '+m[id]+')')}
     for(const id in inv0)if(!(id in m))push('envanter','−'+inv0[id]+' '+(IT[id]?IT[id].n:id)+' (toplam 0)');
    }
    inv0=m;
   }
   if(st!=='play'&&st!=='pause')return;
   edge('lowhp',G.hp<25&&G.hp>0,'Can 25 altında: kalp atışı sesi başlar.','Can 25 üzerine çıktı: kalp atışı sesi biter.');
   edge('thr0',G.thr<=0,'Susuzluk sıfır: koşma kapalı, can çok yavaş azalır.','Susuzluk giderildi.');
   edge('hun0',G.hun<=0,'Açlık sıfır: can azalır.','Açlık giderildi.');
   edge('bleed',G.bleed>0,'Kanama başladı.','Kanama durdu.');
   edge('tired',G.tired,'Dayanıklılık bitti: yorgun.','Yorgunluk geçti.');
   edge('cave',!!G.cave,'Mağaraya girildi.','Mağaradan çıkıldı.');
   edge('shel',G.sheltered,'Barınak içinde.','Barınaktan çıkıldı.');
   edge('raft',G.onRaft,'Salın üstünde.','Saldan inildi.');
   edge('head',G.head,'Su altında.','Su yüzeyinde.');
   edge('fire',G.nearFire,'Ateşin yanında.','Ateşten uzaklaşıldı.');
   edge('torch',G.torchLit,'Meşale yandı.','Meşale söndü.');
   edge('rain',(sc.rain||0)>.2,'Yağmur başladı.','Yağmur bitti.');
   edge('fear',(sc.fear||0)>.5,'Korku düzeyi yükseldi (gerilim sesleri artar).','Korku düzeyi düştü.');
   edge('insane',(sc.insane||0)>.5,'Akıl düzeyi düşük (fısıltılar artar).','Akıl düzeyi toparlandı.');
   edge('macro',HG.macroBlocked&&HG.macroBlocked(),null,'Saldırı kilidi kalktı.');
   const dn=HG.dayNo&&HG.dayNo();if(dn!==undefined){if(S.day!==undefined&&S.day!==dn)push('durum',dn+'. gün başladı.');S.day=dn}
   /* ortam sesi katmanları: duyulur olunca ve kesilince kaydedilir */
   if(HG.audioBeds){
    const b=HG.audioBeds();
    if(beds0)for(const k in b){
     const on=b[k]>.02,was=beds0[k]>.02;
     if(on&&!was)push('ses','Ortam sesi başladı: '+(BEDN[k]||k)+' (seviye '+b[k].toFixed(2)+')');
     else if(!on&&was)push('ses','Ortam sesi bitti: '+(BEDN[k]||k));
    }
    beds0=b;
   }
  }catch(e){}
 },250);

 push('sistem','Konsol hazır. Tarayıcı: '+navigator.userAgent.slice(0,140));
 push('sistem','Ekran: '+innerWidth+'×'+innerHeight+' @'+(devicePixelRatio||1)+'x · dokunmatik: '+(matchMedia('(pointer:coarse)').matches?'evet':'hayır'));
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',hooks);else hooks();
})();
