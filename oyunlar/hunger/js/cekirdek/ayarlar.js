/* Hunger 3D - ayarlar: kayıtlı seçenekler (HG.cfg) ve ayar menüsü (Grafik, Ses, Kontrol, Oyun) */
(()=>{
'use strict';
const KEY='hunger-ayar-v1';
/* Şema: [anahtar, etiket, tür, varsayılan, en az, en çok, adım, birim/açıklama] */
const TABS=[
 ['Grafik',[
  ['q','Kalite düzeyi','select','auto',[['auto','Otomatik'],['3','Yüksek'],['2','Orta'],['1','Düşük'],['0','En düşük']],'Otomatik: başarıma göre düşer.'],
  ['res','Çözünürlük ölçeği','range',100,50,100,5,'%'],
  ['shadow','Gölgeler','toggle',true,'Düşük kalitede gölge zaten kapalıdır.'],
  ['bloom','Parlama (bloom)','range',100,0,150,5,'%','Yalnızca Orta/Yüksek kalitede etkilidir.'],
  ['grass','Çim ve çiçek yoğunluğu','range',100,0,100,5,'%'],
  ['fog','Sis yoğunluğu','range',100,40,160,5,'%','Düşük değer uzağı daha net gösterir.'],
  ['mist','Yer sisi','range',100,0,160,5,'%','Alçak bölgelerde ve şafakta toplanan sis.'],
  ['fx','Parçacık yoğunluğu','range',100,0,100,5,'%','Yaprak, toz, duman, kıvılcım ve su sıçraması.'],
  ['bright','Parlaklık','range',100,60,140,5,'%'],
  ['fov','Görüş açısı (FOV)','range',75,60,110,1,'°']]],
 ['Ses',[
  ['master','Ana ses','range',80,0,100,5,'%'],
  ['sfx','Efekt sesleri','range',100,0,100,5,'%','Adım, darbe, eşya ve hayvan sesleri.'],
  ['amb','Ortam sesleri','range',70,0,100,5,'%','Rüzgâr, deniz, yağmur, orman, ateş.'],
  ['mus','Müzik','range',0,0,100,5,'%','Varsayılan kapalıdır; sürekli ton istemeyenler için.'],
  ['tens','Gerilim ve fısıltı','range',40,0,100,5,'%','Korku anlarındaki alçak ton ve fısıltılar.']]],
 ['Kontrol',[
  ['sens','Fare / dokunma hassasiyeti','range',100,20,300,5,'%'],
  ['invY','Dikey bakışı ters çevir','toggle',false]]],
 ['Oyun',[
  ['hud','Durum çubukları','toggle',true],
  ['mini','Mini harita','toggle',true],
  ['clock','Saat','toggle',true],
  ['goal','Hedef bildirimi','toggle',true],
  ['tip','Eylem ipuçları','toggle',true],
  ['horror','Korku görsel efektleri','range',100,0,100,5,'%','Bozulma, renk kayması ve kararma şiddeti.'],
  ['shake','Kamera sarsıntısı','range',100,0,100,5,'%']]]
];
const DEF={};for(const [,rows] of TABS)for(const r of rows)DEF[r[0]]=r[3];
const cfg=HG.cfg=Object.assign({},DEF);
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object')for(const k in DEF)if(k in s&&typeof s[k]===typeof DEF[k])cfg[k]=s[k];
 /* eski kalite anahtarı */
 const q=localStorage.getItem('hunger-kalite');if(q&&!(s&&'q' in s))cfg.q=q;
}catch(e){}
const $=HG.$;
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(cfg));localStorage.setItem('hunger-kalite',String(cfg.q))}catch(e){}
}
/* Ayarları çalışan sisteme uygular */
function apply(key){
 const g=$('#game');if(!g)return;
 g.classList.toggle('no-hud',!cfg.hud);g.classList.toggle('no-mini',!cfg.mini);g.classList.toggle('no-clock',!cfg.clock);
 g.classList.toggle('no-goal',!cfg.goal);g.classList.toggle('no-tip',!cfg.tip);
 const sc=HG.sc,S=HG.Scene;
 if(sc.R){
  sc.qMode=cfg.q;
  if(key==='q'){S.setQuality(cfg.q==='auto'?3:+cfg.q);sc.fpsAcc=sc.fpsN=0}
  else if(key==='shadow')S.setQuality(sc.quality);
  else if(key==='res'||key==='grass')S.applyCfg(key);
  sc.R.toneMappingExposure=cfg.bright/100;
 }
 document.querySelectorAll('.bQ').forEach(b=>{if(S.qualityLabel)b.textContent='Grafik: '+S.qualityLabel()});
}
/* ---- arayüz ---- */
let box,tab=0,openFrom=null;
function row(r){
 const [k,label,type,def,a,b,c,unit,note]=r;
 const d=document.createElement('div');d.className='sr';
 const l=document.createElement('label');l.textContent=label;d.appendChild(l);
 let hint=type==='range'?note:(type==='select'?b:a);
 if(type==='range'){
  const v=document.createElement('output'),i=document.createElement('input');
  i.type='range';i.min=a;i.max=b;i.step=c;i.value=cfg[k];i.id='s_'+k;l.htmlFor=i.id;
  const show=()=>{v.textContent=i.value+unit};show();
  i.oninput=()=>{cfg[k]=+i.value;show();if(k!=='res')apply(k);persist()};
  if(k==='res')i.onchange=()=>apply(k);
  d.append(i,v);
 }else if(type==='toggle'){
  const i=document.createElement('input');i.type='checkbox';i.checked=!!cfg[k];i.id='s_'+k;l.htmlFor=i.id;
  i.onchange=()=>{cfg[k]=i.checked;apply(k);persist()};
  d.appendChild(i);
 }else{
  const s=document.createElement('select');s.id='s_'+k;l.htmlFor=s.id;
  for(const [v,t] of a){const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)}
  s.value=String(cfg[k]);s.onchange=()=>{cfg[k]=s.value;apply(k);persist()};
  d.appendChild(s);hint=b;
 }
 if(hint){const h=document.createElement('small');h.textContent=hint;d.appendChild(h)}
 return d;
}
function render(){
 const tabs=box.querySelector('.stabs'),body=box.querySelector('.sbody');
 tabs.innerHTML='';body.innerHTML='';
 TABS.forEach((t,i)=>{
  const b=document.createElement('button');b.type='button';b.textContent=t[0];b.className='ghost'+(i===tab?' on':'');
  b.onclick=()=>{tab=i;render()};tabs.appendChild(b);
 });
 for(const r of TABS[tab][1])body.appendChild(row(r));
 if(TABS[tab][0]==='Kontrol'&&HG.keyUI)HG.keyUI(body);
}
function open(from){
 if(!box)return;
 openFrom=from||null;box.hidden=false;render();
 const m=$('#menu'),p=$('#pause');
 if(m)m.dataset.h=m.hidden?'':'1';
 if(m&&!m.hidden)m.style.visibility='hidden';if(p&&!p.hidden)p.style.visibility='hidden';
 try{HG.snd('ui_open')}catch(e){}
}
function close(){
 if(!box||box.hidden)return;
 box.hidden=true;
 const m=$('#menu'),p=$('#pause');if(m)m.style.visibility='';if(p)p.style.visibility='';
 try{HG.snd('ui_close')}catch(e){}
}
function build(){
 const g=$('#game');if(!g)return;
 box=document.createElement('div');box.id='set';box.hidden=true;
 box.innerHTML='<div class="card sc"><h1 style="font-size:30px;letter-spacing:.14em">AYARLAR</h1><div class="stabs"></div><div class="sbody"></div><div class="sfoot"><button type="button" class="ghost" id="sReset">Varsayılana dön</button><button type="button" id="sClose">Kapat</button></div></div>';
 g.appendChild(box);
 box.querySelector('#sClose').onclick=close;
 box.querySelector('#sReset').onclick=()=>{Object.assign(cfg,DEF);for(const k of ['q','shadow','res','grass'])apply(k);apply();persist();render()};
 box.addEventListener('pointerdown',e=>{if(e.target===box)close()});
 document.querySelectorAll('.bSet').forEach(b=>b.onclick=()=>{HG.initAudio&&HG.initAudio();open()});
 /* Esc yalnızca ayar penceresini kapatır */
 addEventListener('keydown',e=>{if(e.code==='Escape'&&!box.hidden&&!(HG.keyCapturing&&HG.keyCapturing())){e.stopImmediatePropagation();e.preventDefault();close()}},true);
 apply();
}
HG.settings={open,close,apply,DEF,get isOpen(){return !!box&&!box.hidden}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
