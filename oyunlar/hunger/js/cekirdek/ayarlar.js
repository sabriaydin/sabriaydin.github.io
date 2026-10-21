/* Hunger 3D - ayarlar: kayıtlı seçenekler (HG.cfg) ve ayar menüsü (Grafik, Ses, Kontrol, Oyun) */
(()=>{
'use strict';
const KEY='hunger-ayar-v1';
/* Şema: [anahtar, etiket, tür, varsayılan, en az, en çok, adım, birim/açıklama] */
const TABS=[
 ['Grafik',[
  ['q','Kalite düzeyi','select','auto',[['auto','Otomatik'],['3','Yüksek'],['2','Orta'],['1','Düşük'],['0','En düşük'],['ozel','Özel']],'Seçilen düzey aşağıdaki ayarları birlikte değiştirir. Otomatik: kare hızı düşerse düzey kendiliğinden iner. Bir ayarı elle değiştirirseniz düzey Özel olur.'],
  ['res','Çözünürlük ölçeği','range',100,50,100,5,'%','En etkili başarım ayarı: düşürmek görüntüyü yumuşatır ama kare hızını belirgin artırır.'],
  ['shadow','Gölgeler','toggle',true,'Güneş ve ay gölgeleri. Kapatmak başarımı artırır.'],
  ['bloom','Parlama (bloom)','range',100,0,150,5,'%','Parlak yüzeylerin çevresine taşan ışık.'],
  ['grass','Çim ve çiçek yoğunluğu','range',100,0,100,5,'%'],
  ['fog','Sis yoğunluğu','range',100,40,160,5,'%','Düşük değer uzağı daha net gösterir.'],
  ['mist','Yer sisi','range',100,0,160,5,'%','Alçak bölgelerde ve şafakta toplanan sis.'],
  ['fx','Parçacık yoğunluğu','range',100,0,100,5,'%','Yaprak, toz, duman, kıvılcım ve su sıçraması.'],
  ['bright','Parlaklık','range',100,60,140,5,'%'],
  ['dist','Çizim mesafesi','range',100,50,130,5,'%','Düşürmek uzaktaki ağaç ve kayaları daha erken gizler; başarımı artırır.'],
  ['fov','Görüş açısı (FOV)','range',75,60,110,1,'°'],
  ['adapt','Uyarlanabilir çözünürlük','toggle',true,'Kare hızı düşerse çizim çözünürlüğü kendiliğinden biraz düşer, rahatlayınca geri yükselir. Üst sınır yukarıdaki Çözünürlük ölçeğidir.'],
  ['fpsTarget','Hedef kare hızı','select','55',[['45','45 FPS'],['55','55 FPS'],['60','60 FPS']],'Uyarlanabilir çözünürlüğün korumaya çalıştığı değer.'],
  ['fps','FPS göstergesi','toggle',false],
  ['mfx','Menü arka plan efekti','toggle',true,'Ana menüdeki manzara, kıvılcım ve sis animasyonu. Kapatınca manzara hareketsiz kalır; zayıf cihazlarda pil ve başarım kazandırır.']]],
 ['Ses',[
  ['master','Ana ses','range',80,0,100,5,'%','Gerçek ses kayıtları Creative Commons lisanslıdır: Wildfire Games (0 A.D.) ve diğer sahipler. Ayrıntı: ses/KREDI.txt'],
  ['sfx','Efekt sesleri','range',100,0,100,5,'%','Adım, darbe, eşya ve hayvan sesleri.'],
  ['amb','Ortam sesleri','range',70,0,100,5,'%','Rüzgâr, deniz, yağmur, kuşlar, orman, ateş.'],
  ['mus','Müzik','range',35,0,100,5,'%','Gün ve gece için ayrı parçalar; aralarında uzun sessizlik bırakılır. Korku anlarında kesilir.'],
  ['tens','Gerilim ve fısıltı','range',40,0,100,5,'%','Korku anlarındaki alçak ton, kalp atışı ve fısıltılar.']]],
 ['Kontrol',[
  ['sens','Fare / dokunma hassasiyeti','range',100,20,300,5,'%'],
  ['invY','Dikey bakışı ters çevir','toggle',false],
  ['crouchT','Çömelmeyi aç/kapat','toggle',false,'Açıkken çömelme tuşu basılı tutulmaz; bir kez basmak çömeltir, yeniden basmak doğrultur.'],
  ['sprintT','Koşmayı aç/kapat','toggle',false,'Açıkken koş tuşu basılı tutulmaz; bir kez basmak koşuyu açar, durunca kapanır.'],
  ['kbLock','Tam ekranda oyna','toggle',true,'Oyuna girince tam ekrana geçilir ve tarayıcı kısayolları oyuna yönlendirilir: Ctrl+W sekmeyi kapatmaz, Ctrl+R sayfayı yenilemez. Esc ile tam ekrandan çıkılır.']]],
 ['Oyun',[
  ['diff','Zorluk','select','1',[['0','Kolay'],['1','Normal'],['2','Zor']],'Açlık, susuzluk ve alınan hasar hızını değiştirir. Kolay: %25 daha az, Zor: %30 daha fazla.'],
  ['cmd','Konsol komutları','toggle',false,'Dünya kuralıdır: Dünya Oluştur penceresinden seçilir.'],
  ['wear','Alet aşınması','toggle',true,'Açıkken taş, bakır ve demir aletler kullandıkça aşınır ve kırılır; Çalışma Tezgâhında onarılır. Kapatmak oyunu kolaylaştırır.'],
  ['durbar','Dayanıklılık çubukları','toggle',true,'Eşya kutularında alet dayanıklılığını gösteren ince çubuk.'],
  ['hud','Durum çubukları','toggle',true],
  ['mini','Mini harita','toggle',true],
  ['clock','Saat','toggle',true],
  ['goal','Hedef bildirimi','toggle',true],
  ['tip','Eylem ipuçları','toggle',true],
  ['cross','Nişan noktası','toggle',true],
  ['compass','Pusula (üst orta)','toggle',true,'Ekranın üstünde yön ve hedef işaretini gösteren pusula çubuğu.'],
  ['ui','Arayüz boyutu','range',100,70,140,5,'%','Durum çubukları ve hızlı erişim çubuğunun boyutu.'],
  ['horror','Korku görsel efektleri','range',100,0,100,5,'%','Bozulma, renk kayması ve kararma şiddeti.'],
  ['shake','Kamera sarsıntısı','range',100,0,100,5,'%'],
  ['death','Ölünce','select','bed',[['bed','Doğma noktasında uyan; eşyalar cenaze çantasında'],['free','Doğma noktasında uyan; eşyalar kalsın'],['perm','Kalıcı ölüm (oyun biter)']],'Doğma noktası: yatak varsa yatak, yoksa ilk kamp. Cenaze çantası haritada işaretlenir.'],
  ['season','Mevsimler','toggle',true,'Kapalıyken mevsim etkisi olmaz (her zaman nötr).'],
  ['snow','Kış karı (görsel)','toggle',true,'Kışın yağan kar ve beyazlaşan zemin; kapatmak başarımı artırır.'],
  ['wetsys','Islaklık ve ateş','toggle',true,'Islanınca soğuk daha çabuk işler; uzun süre ıslak kalmak ateşe yol açar.'],
  ['peace','Barış modu','toggle',false,'Açıkken Gölge, kurt, ayı, köpek balığı ve denizanası bulunmaz; diğer hayvanlar saldırmaz (inşa ve keşif için). Arı sokması geçerlidir; yanan meşale korur.']]],
 ['Erişilebilirlik',[
  ['cap','Ses altyazıları','toggle',false,'Önemli sesleri (hayvan, gök gürültüsü, saldırı) ekranda kısa yazıyla gösterir.'],
  ['dmgnum','Hasar sayıları','toggle',true,'Vurulan hayvanın üzerinde verilen hasarı gösterir.'],
  ['pad','Oyun kolu desteği','toggle',true,'Bağlı oyun koluyla oynanır. Sol çubuk: hareket, sağ çubuk: bakış, A: zıpla, X: E, RT: vur, B: çanta, Y: harita, LB/RB: kutu seç, L3: koş.']]]
];
const DEF={};for(const [,rows] of TABS)for(const r of rows)DEF[r[0]]=r[3];
DEF.qt=3;                                   /* Özel düzeyde kullanılan kalite kademesi (satırı yoktur) */
const cfg=HG.cfg=Object.assign({},DEF);
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object')for(const k in DEF)if(k in s&&typeof s[k]===typeof DEF[k])cfg[k]=s[k];
 /* eski kalite anahtarı */
 const q=localStorage.getItem('hunger-kalite');if(q&&!(s&&'q' in s))cfg.q=q;
}catch(e){}
const $=HG.$;
const QNAME={auto:'Otomatik',3:'Yüksek',2:'Orta',1:'Düşük',0:'En düşük',ozel:'Özel'};

/* ---- Kalite ön ayarları ----
   Kalite düzeyi seçilince aşağıdaki ayarlar birlikte değişir. Düzeyin kendisi ayrıca kenar yumuşatma,
   gölge haritası boyutu, yüzey ayrıntısı ve model ayrıntı mesafesi gibi doğrudan değiştirilemeyen
   kademeleri belirler (js/sahne/cekirdek.js). */
const PKEYS=['res','shadow','bloom','grass','mist','fx','dist'];
const PRESET={
 3:{res:100,shadow:true,bloom:100,grass:100,mist:100,fx:100,dist:100},
 2:{res:100,shadow:true,bloom:80,grass:70,mist:80,fx:80,dist:95},
 1:{res:90,shadow:false,bloom:0,grass:40,mist:40,fx:50,dist:80},
 0:{res:75,shadow:false,bloom:0,grass:0,mist:0,fx:20,dist:60}
};
const QINFO={
 3:'Kenar yumuşatma 4×, parlama ve güneş ışınları açık, keskin gölge, en yüksek yüzey ayrıntısı.',
 2:'Kenar yumuşatma 2×, parlama açık, güneş ışınları kapalı, gölge haritası küçültülür.',
 1:'Kenar yumuşatma, parlama ve gölge kapalı; yüzey ayrıntısı ve görüş mesafesi azaltılır.',
 0:'Tüm görsel efektler kapalı, çizim çözünürlüğü düşürülür, çim çizilmez.'
};
const clampT=v=>Math.max(0,Math.min(3,v|0));
/* Yürürlükteki kalite kademesi: Otomatik'te sahnenin o anki kademesi, Özel'de son seçilen kademe */
function tier(){
 const q=String(cfg.q);
 if(q==='auto')return HG.sc&&HG.sc.quality!==undefined?clampT(HG.sc.quality):3;
 if(q==='ozel')return clampT(cfg.qt);
 return clampT(+q);
}
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(cfg));localStorage.setItem('hunger-kalite',String(cfg.q))}catch(e){}
}
/* Ayarları çalışan sisteme uygular */
function apply(key){
 const g=$('#game');if(!g)return;
 g.classList.toggle('no-hud',!cfg.hud);g.classList.toggle('no-mini',!cfg.mini);g.classList.toggle('no-clock',!cfg.clock);
 g.classList.toggle('no-compass',!cfg.compass);g.classList.toggle('no-goal',!cfg.goal);g.classList.toggle('no-tip',!cfg.tip);g.classList.toggle('no-cross',!cfg.cross);
 g.style.setProperty('--ui',String((cfg.ui||100)/100));
 const sc=HG.sc,S=HG.Scene;
 if(sc.R){
  sc.qMode=cfg.q;
  if(key==='q'){S.setQuality(S.tierOf?S.tierOf():tier());sc.fpsAcc=sc.fpsN=0}
  else if(key==='shadow')S.setQuality(sc.quality);
  else if(key==='res'||key==='grass')S.applyCfg(key);
  sc.R.toneMappingExposure=cfg.bright/100;
 }
 document.querySelectorAll('.bQ').forEach(b=>{if(S.qualityLabel)b.textContent='Grafik: '+S.qualityLabel()});
}
/* Bir kademenin ön ayarını uygular (kullanıcı seçimi veya Otomatik'in kademe düşürmesi) */
function applyPreset(t){
 const p=PRESET[clampT(t)];if(!p)return;
 for(const k in p)cfg[k]=p[k];
 apply('shadow');apply('res');apply('grass');apply();
}
/* Otomatik kipte sahne kademe düşürdüğünde çağrılır (js/sahne/cekirdek.js) */
function autoTier(t){
 if(String(cfg.q)!=='auto')return;
 applyPreset(t);persist();
 if(box&&!box.hidden)render();
}
/* Ön ayara bağlı bir ayar elle değiştirilirse düzey Özel olur */
function markCustom(k){
 if(PKEYS.indexOf(k)<0)return false;
 const q=String(cfg.q);
 if(q==='ozel')return false;
 cfg.qt=tier();cfg.q='ozel';
 const s=box&&box.querySelector('#s_q');if(s)s.value='ozel';
 apply();qinfo();
 return true;
}
/* Bir ayarın o anki koşullarda etkisi yoksa nedenini bildirir (satır soluk ve kapalı gösterilir) */
function offReason(k){
 const t=tier();
 if(k==='shadow'&&t<=1)return 'Bu kalite düzeyinde gölgeler çizilmez.';
 if(k==='bloom'&&t<=1)return 'Parlama yalnızca Orta ve Yüksek kalitede çizilir.';
 if(k==='fpsTarget'&&!cfg.adapt)return 'Uyarlanabilir çözünürlük kapalıyken kullanılmaz.';
 if(k==='snow'&&!cfg.season)return 'Mevsimler kapalıyken kış gelmez.';
 if((k==='sfx'||k==='amb'||k==='mus'||k==='tens')&&!cfg.master)return 'Ana ses kapalı.';
 return '';
}
/* Bir ayar değişince başka satırların durumu da değişiyorsa liste yeniden çizilir */
const REDRAW=new Set(['q','adapt','season','master','shadow']);

/* ---- arayüz ---- */
let box,tab=0,openFrom=null,find='',perfIv=0;
const norm=s=>String(s).toLocaleLowerCase('tr').replace(/[îıİI]/g,'i');
function row(r){
 const [k,label,type,def,a,b,c,unit,note]=r;
 const d=document.createElement('div');d.className='sr';
 const l=document.createElement('label');l.textContent=label;d.appendChild(l);
 let hint=type==='range'?note:(type==='select'?b:a);
 const off=offReason(k);
 let inp;
 if(type==='range'){
  const v=document.createElement('output'),i=document.createElement('input');
  i.type='range';i.min=a;i.max=b;i.step=c;i.value=cfg[k];i.id='s_'+k;l.htmlFor=i.id;
  const show=()=>{v.textContent=i.value+unit};show();
  i.oninput=()=>{cfg[k]=+i.value;show();markCustom(k);if(k!=='res')apply(k);persist()};
  i.onchange=()=>{if(k==='res')apply(k);if(REDRAW.has(k))render();else qinfo()};
  d.append(i,v);inp=i;
 }else if(type==='toggle'){
  const i=document.createElement('input');i.type='checkbox';i.checked=!!cfg[k];i.id='s_'+k;l.htmlFor=i.id;
  i.onchange=()=>{cfg[k]=i.checked;markCustom(k);apply(k);persist();if(REDRAW.has(k))render();else qinfo()};
  d.appendChild(i);inp=i;
 }else{
  const s=document.createElement('select');s.id='s_'+k;l.htmlFor=s.id;
  for(const [v,t] of a){const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)}
  s.value=String(cfg[k]);
  s.onchange=()=>{
   if(k==='q'){
    const prev=tier();                                 /* önceki kademe: Özel seçilirse temel olarak kalır */
    cfg.q=s.value;
    if(s.value==='ozel')cfg.qt=prev;
    else{cfg.qt=s.value==='auto'?3:clampT(+s.value);applyPreset(cfg.qt)}
   }else cfg[k]=s.value;
   apply(k);persist();
   if(REDRAW.has(k))render();else qinfo();
  };
  d.appendChild(s);hint=b;inp=s;
 }
 if(off){d.classList.add('off');if(inp)inp.disabled=true;hint=off}
 if(hint){const h=document.createElement('small');h.textContent=hint;d.appendChild(h)}
 /* Kalite düzeyinin altında kademenin ne yaptığı ve canlı başarım bilgisi gösterilir */
 if(k==='q'){
  const q=document.createElement('small');q.className='sqi';d.appendChild(q);
  const pf=document.createElement('small');pf.className='spf';d.appendChild(pf);
 }
 return d;
}
/* Kalite açıklaması ve canlı kare hızı satırını tazeler */
function qinfo(){
 if(!box||box.hidden)return;
 const q=box.querySelector('.sqi'),pf=box.querySelector('.spf');
 if(q){const t=tier();q.textContent=(String(cfg.q)==='ozel'?'Özel (temel: '+QNAME[t]+'). ':String(cfg.q)==='auto'?'Şu anki düzey: '+QNAME[t]+'. ':'')+QINFO[t]}
 if(pf){
  const p=HG.perf;
  pf.textContent=p?'Şu an: '+p.fps+' FPS · çizim ölçeği %'+Math.round((p.scale||1)*100)+(HG.sc&&HG.sc.R?' · piksel oranı '+(Math.round(HG.sc.R.getPixelRatio()*100)/100):''):'';
 }
}
function render(){
 const tabs=box.querySelector('.stabs'),body=box.querySelector('.sbody');
 tabs.innerHTML='';body.innerHTML='';
 TABS.forEach((t,i)=>{
  const b=document.createElement('button');b.type='button';b.textContent=t[0];b.className='ghost'+(i===tab&&!find?' on':'');
  b.onclick=()=>{tab=i;find='';const s=box.querySelector('#sFind');if(s)s.value='';render()};tabs.appendChild(b);
 });
 const skip=r=>r[0]==='wear'||r[0]==='cmd';      /* dünya kuralları: Dünya Oluştur penceresinde seçilir */
 if(find){
  /* Arama: tüm sekmelerdeki eşleşen satırlar sekme adıyla birlikte listelenir */
  const f=norm(find);let n=0;
  for(const [name,rows] of TABS){
   const hit=rows.filter(r=>!skip(r)&&(norm(r[1]).includes(f)||norm(r[7]||'').includes(f)||norm(r[8]||'').includes(f)||norm(r[4]||'').includes(f)||norm(r[5]||'').includes(f)));
   if(!hit.length)continue;
   const g=document.createElement('div');g.className='sgrp';g.textContent=name;body.appendChild(g);
   for(const r of hit){body.appendChild(row(r));n++}
  }
  if(!n){const e=document.createElement('p');e.className='snone';e.textContent='Bu arama için ayar bulunamadı.';body.appendChild(e)}
 }else{
  for(const r of TABS[tab][1])if(!skip(r))body.appendChild(row(r));
  if(TABS[tab][0]==='Oyun'){
   const i=document.createElement('p');i.className='snote';
   i.textContent='Alet aşınması, zorluk ve barış modu gibi dünya kuralları yeni oyun açarken Dünya Oluştur penceresinden seçilir; buradaki kayıtlı dünyayı etkilemez.';
   body.appendChild(i);
  }
  if(TABS[tab][0]==='Kontrol'&&HG.keyUI)HG.keyUI(body);
 }
 const rb=box.querySelector('#sReset');if(rb)rb.textContent=find?'Varsayılana dön':'"'+TABS[tab][0]+'" sekmesini sıfırla';
 qinfo();
}
/* Varsayılana dönüş: yalnızca bir sekme veya tümü */
function reset(all){
 const keys=all?Object.keys(DEF):TABS[tab][1].map(r=>r[0]);
 for(const k of keys)if(k!=='wear'&&k!=='cmd')cfg[k]=DEF[k];      /* dünya kuralları korunur */
 if(all)cfg.qt=DEF.qt;
 for(const k of ['q','shadow','res','grass'])apply(k);
 apply();persist();render();
}
function open(from,tabName){
 if(!box)return;
 if(tabName){const k=TABS.findIndex(t=>t[0]===tabName);if(k>=0)tab=k}
 openFrom=from||null;box.hidden=false;find='';
 const s=box.querySelector('#sFind');if(s)s.value='';
 render();
 if(perfIv)clearInterval(perfIv);
 perfIv=setInterval(qinfo,700);                        /* canlı kare hızı satırı */
 const m=$('#menu'),p=$('#pause');
 if(m)m.dataset.h=m.hidden?'':'1';
 if(m&&!m.hidden)m.style.visibility='hidden';if(p&&!p.hidden)p.style.visibility='hidden';
 try{HG.snd('ui_open')}catch(e){}
}
function close(){
 if(!box||box.hidden)return;
 box.hidden=true;
 if(perfIv){clearInterval(perfIv);perfIv=0}
 const m=$('#menu'),p=$('#pause');if(m)m.style.visibility='';if(p)p.style.visibility='';
 try{HG.snd('ui_close')}catch(e){}
}
function build(){
 const g=$('#game');if(!g)return;
 box=document.createElement('div');box.id='set';box.hidden=true;
 box.innerHTML='<div class="card sc"><h1 style="font-size:30px;letter-spacing:.14em">AYARLAR</h1><input id="sFind" type="search" placeholder="Ayar ara (örn. gölge, ses, zorluk)" autocomplete="off"><div class="stabs"></div><div class="sbody"></div><div class="sfoot"><button type="button" class="ghost" id="sReset">Sekmeyi sıfırla</button><button type="button" class="ghost" id="sResetAll">Tümünü sıfırla</button><button type="button" class="ghost" id="sPeek" title="Basılı tutarken ayar penceresi gizlenir">Görünümü göster</button><button type="button" id="sClose">Kapat</button></div></div>';
 g.appendChild(box);
 box.querySelector('#sClose').onclick=close;
 box.querySelector('#sReset').onclick=()=>reset(false);
 box.querySelector('#sResetAll').onclick=()=>reset(true);
 /* Basılı tutarken pencere gizlenir: kalite ve grafik ayarlarının etkisi sahnede görülür */
 const pk=box.querySelector('#sPeek'),peek=v=>box.classList.toggle('peek',v);
 pk.addEventListener('pointerdown',e=>{e.preventDefault();peek(true);try{pk.setPointerCapture&&pk.setPointerCapture(e.pointerId)}catch(err){}});
 for(const ev of ['pointerup','pointercancel','pointerleave','blur'])pk.addEventListener(ev,()=>peek(false));
 pk.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')peek(true)});
 pk.addEventListener('keyup',()=>peek(false));
 const f=box.querySelector('#sFind');
 f.oninput=()=>{find=f.value.trim();render();if(find)f.focus()};
 box.addEventListener('pointerdown',e=>{if(e.target===box)close()});
 document.querySelectorAll('.bSet').forEach(b=>b.onclick=()=>{HG.initAudio&&HG.initAudio();open()});
 /* Esc yalnızca ayar penceresini kapatır */
 addEventListener('keydown',e=>{if(e.code==='Escape'&&!box.hidden&&!(HG.keyCapturing&&HG.keyCapturing())){e.stopImmediatePropagation();e.preventDefault();close()}},true);
 apply();
}
HG.settings={open,close,apply,persist,autoTier,DEF,get isOpen(){return !!box&&!box.hidden}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
