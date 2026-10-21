/* Hunger 3D - konsol komut satırı ve geliştirici modu (güncelleme 50).
   F1 konsolunun altındaki satıra komut yazılır. Komutlar yalnızca dünya oluşturulurken
   "Konsol komutları" seçeneği açılmış dünyalarda çalışır; komut kullanılan dünyada başarım kazanılmaz.
   Geliştirici modu gizli bir komutla açılır ve konsola canlı bir bilgi paneli ile ek komutlar ekler.
   Özgün dosyalara yalnızca iki küçük kanca eklenmiştir: konsol.js (HG.konsolBuilt) ve sahne/hava.js (HG.wxForce). */
(()=>{
'use strict';
const {G,ui,$}=HG;
const DEV_WORD='hungerdev';                      /* geliştirici modunu açan gizli komut */
let devOn=false,box=null,inpEl=null,outEl=null,panEl=null,panT=0;
const hist=[];let hi=-1;

const say=(m,l)=>{HG.log&&HG.log('komut',m,l);echo(m,l)};
function echo(m,l){
 if(!outEl)return;
 const d=document.createElement('div');d.className='kc-o'+(l==='hata'?' bad':l==='ok'?' ok':'');
 d.textContent=m;outEl.appendChild(d);
 while(outEl.children.length>60)outEl.firstChild.remove();
 outEl.scrollTop=outEl.scrollHeight;
}
const on=()=>!!(HG.cfg&&HG.cfg.cmd);           /* dünya kuralı: konsol komutları açık mı */
/* Komut kullanılan dünyada başarım kazanılmaz (hile korumasıyla aynı işaret) */
function mark(why){
 if(G.cheat)return;
 G.cheat=1;
 HG.log&&HG.log('komut','Dünya komutla değiştirildi ('+why+'): bu dünyada yeni başarım açılmaz.');
 HG.toast&&HG.toast('Konsol komutu kullanıldı: bu dünyada yeni başarım açılmaz.');
}
const num=(v,d)=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:d};
const near=(a,b)=>String(a).toLocaleLowerCase('tr')===String(b).toLocaleLowerCase('tr');

/* ---- oyun saatini belirli bir saate getirir (zaman eğrisi aranarak: iç değişkenlere dokunulmaz) ---- */
function setHour(h){
 const want=(((h%24)+24)%24)/24,DAY=HG.DAY,base=Math.floor(G.clock/DAY)*DAY,save=G.clock;
 let best=base,bd=9;
 for(let i=0;i<1440;i++){
  const c=base+i/1440*DAY;G.clock=c;
  const d=Math.abs(((HG.tod()-want)+1.5)%1-.5);
  if(d<bd){bd=d;best=c}
 }
 G.clock=save;
 if(G.clock<best-DAY*.5)G.clock=best-DAY;else G.clock=best;      /* saat geriye alınırsa gün atlamaz */
 if(G.clock<0)G.clock=best;
}
function teleport(x,z){
 const S=HG.Scene;
 x=Math.max(1,Math.min(HG.W-2,x));z=Math.max(1,Math.min(HG.H-2,z));
 G.px=x+.5;G.py=z+.5;
 const y=S.groundY?S.groundY(G.px,G.py):0;
 G.pz=y+.2;G.vz=0;G.air=true;G.pvx=0;G.pvy=0;
 if(G.cave){G.cave=0;if(HG.caveExit)try{HG.caveExit()}catch(e){}}
 G.objDirty=true;
}

/* ============================================================ komutlar ============================================================ */
const CMD={};
const def=(n,a,h,fn,dev)=>{CMD[n]={n,a,h,fn,dev:!!dev}};

def('yardim','','kullanılabilir komutları listeler',()=>{
 const L=Object.values(CMD).filter(c=>!c.dev||devOn);
 say('Komutlar: '+L.map(c=>c.n).join(', '));
 say('Ayrıntı için: yardim <komut>');
},false);
CMD.yardim.fn=a=>{
 if(a[0]){
  const c=CMD[String(a[0]).toLocaleLowerCase('tr')];
  if(!c||(c.dev&&!devOn))return say('Böyle bir komut yok: '+a[0],'hata');
  return say(c.n+(c.a?' '+c.a:'')+' — '+c.h);
 }
 const L=Object.values(CMD).filter(c=>!c.dev||devOn);
 say('Komutlar (yardim <komut> ile ayrıntı):');
 for(const c of L)echo('  '+c.n+(c.a?' '+c.a:'')+'  ·  '+c.h);
};

def('saat','<0-24>','oyun saatini değiştirir',a=>{
 if(!a.length)return say('Şu anki saat: '+saatStr());
 const h=num(a[0],NaN);
 if(!isFinite(h)||h<0||h>24)return say('Saat 0 ile 24 arasında olmalı.','hata');
 setHour(h);mark('saat');say('Saat '+saatStr()+' yapıldı.','ok');
});
function saatStr(){const t=HG.tod()*24,hh=Math.floor(t),mm=Math.floor((t-hh)*60);return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')}

def('hava','<acik|bulutlu|yagmur|firtina|otomatik>','hava durumunu değiştirir',a=>{
 const k=String(a[0]||'').toLocaleLowerCase('tr');
 const M={'acik':[0,0],'açık':[0,0],'bulutlu':[.75,0],'yagmur':[1,.8],'yağmur':[1,.8],'firtina':[1,1],'fırtına':[1,1]};
 if(k==='otomatik'||k==='oto'){HG.wxForce=null;return say('Hava durumu kendi akışına bırakıldı.','ok')}
 if(!M[k])return say('Seçenekler: acik, bulutlu, yagmur, firtina, otomatik','hata');
 HG.wxForce=M[k];mark('hava');say('Hava: '+k,'ok');
});

def('isinlan','<x> <z> | dogma | koy | kamp','bir konuma ışınlanır',a=>{
 if(ui.state!=='play')return say('Önce oyuna girin.','hata');
 const k=String(a[0]||'').toLocaleLowerCase('tr');
 if(k==='dogma'||k==='doğma'){
  const s=G.spawn||G.start;
  if(!s)return say('Doğma noktası bulunamadı.','hata');
  teleport(s.x|0,(s.z!==undefined?s.z:s.y)|0);return say('Doğma noktasına ışınlandın.','ok');
 }
 if(k==='koy'||k==='köy'){
  const V=G.villages||[];if(!V.length)return say('Bu dünyada köy yok.','hata');
  let b=V[0],bd=1e9;
  for(const v of V){const d=Math.hypot(v.cx-G.px,v.cy-G.py);if(d<bd){bd=d;b=v}}
  teleport(b.cx|0,b.cy|0);mark('ışınlanma');return say((b.name||'Köy')+' köyüne ışınlandın.','ok');
 }
 if(k==='kamp'){
  const C=G.camps||[];if(!C.length)return say('Bu dünyada kamp yok.','hata');
  let b=C[0],bd=1e9;
  for(const c of C){const d=Math.hypot(c.x-G.px,c.z-G.py);if(d<bd){bd=d;b=c}}
  teleport(b.x|0,b.z|0);mark('ışınlanma');return say('En yakın kampa ışınlandın.','ok');
 }
 const x=num(a[0],NaN),z=num(a[1],NaN);
 if(!isFinite(x)||!isFinite(z))return say('Kullanım: isinlan <x> <z>  ·  veya isinlan dogma|koy|kamp','hata');
 teleport(x,z);mark('ışınlanma');say('Işınlandın: '+Math.round(x)+', '+Math.round(z),'ok');
});

def('konum','','bulunduğun yeri yazar',()=>{
 say('Konum '+Math.round(G.px)+', '+Math.round(G.py)+' · yükseklik '+(G.pz===undefined?'-':G.pz.toFixed(1))+' m · '+(G.cave?'mağara':'yüzey')+' · saat '+saatStr());
});

def('harita','','haritanın tamamını keşfedilmiş yapar',()=>{
 if(!G.explore)return say('Harita hazır değil.','hata');
 G.explore.fill(1);
 if(HG.mapBuild)try{HG.mapBuild()}catch(e){}
 mark('harita');say('Haritanın tamamı açıldı.','ok');
});

def('temizle','','konsol kayıtlarını siler',()=>{HG.konsol&&HG.konsol.clear&&HG.konsol.clear();if(outEl)outEl.innerHTML='';say('Kayıtlar silindi.')});

/* ---- geliştirici komutları ---- */
def('esya','<kod> [adet]','çantaya eşya ekler',a=>{
 const id=String(a[0]||'');const n=Math.max(1,Math.min(999,num(a[1],1)|0));
 if(!HG.IT[id])return say('Eşya kodu yok: '+id+'  (liste için: esyalar <arama>)','hata');
 const g=HG.gain?HG.gain(id,n):false;
 mark('eşya');say(g?(HG.IT[id].n+' ×'+n+' eklendi.'):'Çantada yer yok.',g?'ok':'hata');
 ui.dirty=true;
},true);
def('esyalar','<arama>','eşya kodlarını arar',a=>{
 const q=String(a[0]||'').toLocaleLowerCase('tr');
 const L=Object.keys(HG.IT).filter(k=>!q||k.toLocaleLowerCase('tr').includes(q)||HG.IT[k].n.toLocaleLowerCase('tr').includes(q));
 if(!L.length)return say('Eşleşen eşya yok.','hata');
 say(L.length+' eşya:');
 for(const k of L.slice(0,60))echo('  '+k+'  ·  '+HG.IT[k].n);
},true);
def('can','<0-100>','canı ayarlar',a=>{G.hp=Math.max(1,Math.min(100,num(a[0],100)));mark('can');say('Can %'+Math.round(G.hp),'ok')},true);
def('aclik','<0-100>','açlığı ayarlar',a=>{G.hun=Math.max(0,Math.min(100,num(a[0],100)));mark('açlık');say('Açlık %'+Math.round(G.hun),'ok')},true);
def('susuzluk','<0-100>','susuzluğu ayarlar',a=>{G.thr=Math.max(0,Math.min(100,num(a[0],100)));mark('susuzluk');say('Susuzluk %'+Math.round(G.thr),'ok')},true);
def('olumsuz','<ac|kapat>','hasar almayı kapatır',a=>{
 const v=!a.length||near(a[0],'ac')||near(a[0],'aç')||near(a[0],'acik');
 HG.godMode=v;mark('ölümsüzlük');say('Ölümsüzlük '+(v?'açık':'kapalı'),'ok');
},true);
def('xp','<n>','deneyim ekler',a=>{const n=Math.max(1,num(a[0],10)|0);HG.xpGain&&HG.xpGain(n);mark('xp');say(n+' deneyim eklendi.','ok')},true);
def('kalite','<0-3>','grafik kalitesini değiştirir',a=>{
 const q=Math.max(0,Math.min(3,num(a[0],3)|0));
 if(HG.cfg){HG.cfg.q=String(q);HG.settings&&HG.settings.apply('q');HG.settings&&HG.settings.persist()}
 say('Kalite düzeyi: '+q,'ok');
},true);
def('tohum','','dünya kodunu yazar',()=>say('Dünya kodu: '+(HG.worldCode?HG.worldCode():G.seed)+'  ·  tohum: '+G.seed),true);
def('bayrak','<ad>','bir ilerleme bayrağı açar',a=>{
 const f=String(a[0]||'');if(!f)return say('Bayrak adı gerekli.','hata');
 G.flags[f]=1;mark('bayrak');say('Bayrak açıldı: '+f,'ok');
},true);

/* ============================================================ çalıştırma ============================================================ */
function run(line){
 const txt=String(line||'').trim();
 if(!txt)return;
 echo('> '+txt,'in');
 hist.push(txt);if(hist.length>60)hist.shift();hi=-1;
 HG.log&&HG.log('komut','> '+txt);
 /* gizli komut: dünya kuralından bağımsız çalışır */
 if(txt.toLocaleLowerCase('tr')===DEV_WORD){
  devOn=!devOn;
  if(panEl)panEl.hidden=!devOn;
  if(box)box.classList.toggle('dev',devOn);
  return say(devOn?'Geliştirici modu açıldı. Ek komutlar ve bilgi paneli etkin.':'Geliştirici modu kapatıldı.','ok');
 }
 if(!on())return say('Bu dünyada konsol komutları kapalı. Yeni dünya kurarken "Konsol komutları" seçeneğini açın.','hata');
 const p=txt.split(/\s+/),name=p.shift().toLocaleLowerCase('tr');
 const c=CMD[name];
 if(!c)return say('Bilinmeyen komut: '+name+'  (yardim yazın)','hata');
 if(c.dev&&!devOn)return say('Bu komut geliştirici modunda çalışır.','hata');
 try{c.fn(p)}catch(e){say('Komut hatası: '+(e&&e.message||e),'hata')}
}
HG.cmdRun=run;
HG.komut={run,get dev(){return devOn}};

/* hasar engelleme (ölümsüzlük) */
{
 const h0=HG.hurt;
 HG.hurt=function(){if(HG.godMode)return 0;return h0.apply(this,arguments)};
}

/* ============================================================ arayüz ============================================================ */
function panel(){
 if(!panEl||panEl.hidden)return;
 const p=HG.perf||{},S=HG.Scene,sc=HG.sc;
 const rows=[
  ['Durum',ui.state+(G.cave?' · mağara':'')],
  ['Konum',Math.round(G.px)+', '+Math.round(G.py)+(G.pz===undefined?'':' · '+G.pz.toFixed(1)+' m')],
  ['Bakış',(HG.look?((HG.look.yaw*57.3)|0)+'° / '+((HG.look.pitch*57.3)|0)+'°':'-')],
  ['Saat',saatStr()+' · gün '+(HG.dayNo?HG.dayNo():'-')],
  ['Kare',(p.fps||0)+' FPS · '+(p.ms||0).toFixed(1)+' ms · ölçek %'+Math.round((p.scale||1)*100)],
  ['Kalite',(sc?sc.quality:'-')+' · piksel '+(sc&&sc.R?(Math.round(sc.R.getPixelRatio()*100)/100):'-')],
  ['Canlılar',(G.animals?G.animals.length:0)+' hayvan · '+(G.npcs?G.npcs.length:0)+' köylü · '+(G.drops?G.drops.length:0)+' yer eşyası'],
  ['Hava','bulut %'+Math.round((sc?sc.over:0)*100)+' · yağmur %'+Math.round((sc?sc.rain:0)*100)+(HG.wxForce?' (zorlanmış)':'')],
  ['Dünya',(HG.worldCode?HG.worldCode():G.seed)+' · '+HG.W+'×'+HG.H],
  ['Durumlar',(HG.godMode?'ölümsüz · ':'')+(G.cheat?'işaretli · ':'')+(on()?'komutlar açık':'komutlar kapalı')]
 ];
 panEl.querySelector('.kc-grid').innerHTML=rows.map(r=>'<span>'+r[0]+'</span><b>'+String(r[1]).replace(/[&<>]/g,'')+'</b>').join('');
}
HG.konsolBuilt=root=>{
 box=root.querySelector('#knCmd');if(!box)return;
 box.innerHTML=
  '<div class="kc-out" id="kcOut"></div>'+
  '<div class="kc-pan" id="kcPan" hidden><div class="kc-h">GELİŞTİRİCİ PANELİ</div><div class="kc-grid"></div>'+
   '<div class="kc-q">'+
    '<button type="button" data-c="saat 8">Sabah</button>'+
    '<button type="button" data-c="saat 20">Akşam</button>'+
    '<button type="button" data-c="hava acik">Açık hava</button>'+
    '<button type="button" data-c="hava yagmur">Yağmur</button>'+
    '<button type="button" data-c="harita">Haritayı aç</button>'+
    '<button type="button" data-c="isinlan dogma">Doğma noktası</button>'+
    '<button type="button" data-c="olumsuz ac">Ölümsüzlük</button>'+
    '<button type="button" data-c="konum">Konum</button>'+
   '</div></div>'+
  '<div class="kc-in"><span>&gt;</span><input id="kcIn" type="text" placeholder="Komut yazın (yardim)" autocomplete="off" spellcheck="false" aria-label="Komut satırı"></div>';
 outEl=box.querySelector('#kcOut');panEl=box.querySelector('#kcPan');inpEl=box.querySelector('#kcIn');
 panEl.querySelector('.kc-q').addEventListener('click',e=>{
  const b=e.target.closest('button[data-c]');if(b)run(b.dataset.c);
 });
 inpEl.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();const v=inpEl.value;inpEl.value='';run(v)}
  else if(e.code==='ArrowUp'){e.preventDefault();if(hist.length){hi=hi<0?hist.length-1:Math.max(0,hi-1);inpEl.value=hist[hi]}}
  else if(e.code==='ArrowDown'){e.preventDefault();if(hi>=0){hi++;if(hi>=hist.length){hi=-1;inpEl.value=''}else inpEl.value=hist[hi]}}
  else if(e.code==='Tab'){
   e.preventDefault();
   const q=inpEl.value.trim().toLocaleLowerCase('tr');
   if(!q)return;
   const L=Object.keys(CMD).filter(k=>k.startsWith(q)&&(!CMD[k].dev||devOn));
   if(L.length===1)inpEl.value=L[0]+' ';else if(L.length)say('Seçenekler: '+L.join(', '));
  }
 });
 inpEl.addEventListener('keyup',e=>e.stopPropagation());
 echo(on()?'Komutlar açık. "yardim" yazarak listeyi görebilirsiniz.':'Bu dünyada konsol komutları kapalı (Dünya Oluştur penceresinden açılır).');
 clearInterval(panT);panT=setInterval(panel,700);
};
})();
