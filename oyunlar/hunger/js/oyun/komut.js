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

/* ---- geliştirici modu kilidi ----
   Parola kaynak dosyada düz metin olarak durmaz: yalnızca iki ayrı tuzla üretilmiş, 4096 turlu
   karışım değeri (özet) saklanır. Girilen parola aynı yoldan geçirilip bu değerle karşılaştırılır;
   dosyayı okuyan biri parolayı buradan göremez. Üst üste yanlış denemede kısa süreli kilit gelir. */
const PS=[0x7f4a7c15,0x9e3779b9,0x165667b1,0x27d4eb2f];
function pmix(s,a,b){
 let h=(0x811c9dc5^a)>>>0;
 for(let i=0;i<s.length;i++){h=(h^s.charCodeAt(i))>>>0;h=Math.imul(h,0x01000193)>>>0}
 for(let r=0;r<4096;r++){h=Math.imul(h^(h>>>13),(b+r)>>>0)>>>0;h=((h<<7)|(h>>>25))>>>0}
 return ('00000'+h.toString(36)).slice(-7);
}
const pdigest=v=>pmix('hg:'+v,PS[0],PS[1])+pmix('hg:'+v,PS[2],PS[3]);
const PD='0twr3uc00k2hz3';                       /* beklenen özet (parolanın kendisi değil) */
let pwAsk=false,pwLeft=3,pwLock=0;
function pwMode(on){
 pwAsk=on;
 if(!inpEl)return;
 inpEl.type=on?'password':'text';
 inpEl.placeholder=on?'Geliştirici parolası (iptal: boş bırakıp Enter)':'Komut yazın (yardim · Tab tamamlar · ↑↓ geçmiş)';
 const sp=inpEl.parentNode&&inpEl.parentNode.firstChild;if(sp)sp.textContent=on?'\u25CF':'>';
 inpEl.value='';inpEl.focus();
}
/* Geliştirici modunu açar veya kapatır (parola doğrulandıktan sonra çağrılır). */
function devOpen(v){
 devOn=!!v;
 if(panEl)panEl.hidden=!devOn;
 if(box)box.classList.toggle('dev',devOn);
 if(!devOn){
  /* kapanırken sahneye uygulanan tüm geliştirici ayarları geri alınır */
  DEV.fly=false;DEV.spd=1;DEV.tscale=1;DEV.frozen=false;DEV.wire=false;DEV.fog=true;DEV.light=0;
  HG.godMode=false;watch.length=0;
  applyFog();applyWire();applyLight();
 }
 if(HG.konsolTabs)try{HG.konsolTabs(devOn)}catch(e){}
 panel();
 if(devOn)say('Geliştirici modu açıldı. Panel, anahtarlar ve ek komutlar etkin ("yardim" ile listeye bakın). Bu modda dünya kuralı aranmaz.','ok');
 else say('Geliştirici modu kapatıldı; tüm geliştirici ayarları geri alındı.','ok');
}
function pwTry(v){
 pwMode(false);
 if(!v)return say('Geliştirici modu iptal edildi.');
 if(pdigest(v)!==PD){
  pwLeft--;
  if(pwLeft<=0){pwLock=performance.now()+30000;pwLeft=3;return say('Parola yanlış. 30 saniye boyunca yeniden denenemez.','hata')}
  return say('Parola yanlış. Kalan deneme: '+pwLeft,'hata');
 }
 pwLeft=3;devOpen(true);
}

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
 /* sis kalkmakla yetinilmez: köy, kamp, mağara, adacık ve resif işaretleri de bulunmuş sayılır,
    yoksa harita açık görünür ama üzerinde hiçbir konum adı çıkmaz. */
 const F=G.flags||(G.flags={});let n=0;
 (G.villages||[]).forEach((v,i)=>{if(!F['v'+i]){F['v'+i]=1;n++}});
 for(const c of G.camps||[])if(!F['c'+c.id]){F['c'+c.id]=1;n++}
 for(const c of G.caves||[])if(!F['cave'+c.id]){F['cave'+c.id]=1;n++}
 for(const q of G.islets||[])if(!F['isl'+q.id]){F['isl'+q.id]=1;n++}
 for(const q of G.reefs||[])if(!F['reef'+q.id]){F['reef'+q.id]=1;n++}
 if(HG.mapBuild)try{HG.mapBuild()}catch(e){}
 mark('harita');say('Haritanın tamamı açıldı. '+n+' konum işaretlendi.','ok');
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

/* ============================================================ geliştirici modu: ek yetenekler ============================================================
   Aşağıdaki özellikler yalnızca geliştirici modunda (hungerdev) çalışır ve hiçbiri özgün dosyaları
   değiştirmez: oyun döngüsü HG.update sarmalıyla, ışık ayrı bir kaynakla, malzeme ayarları sahne
   üzerinde gezilerek uygulanır. */
const DEV={fly:false,spd:1,tscale:1,frozen:false,fog:true,wire:false,light:0};
HG.devState=DEV;

/* -- oyun döngüsü sarmalı: uçuş, hız çarpanı, zaman akışı -- */
{
 const up0=HG.update;
 HG.update=function(dt){
  if(!devOn)return up0.apply(this,arguments);
  const x0=G.px,y0=G.py;
  const r=up0.apply(this,arguments);
  if(ui.state!=='play')return r;
  /* hız çarpanı: kare içindeki yer değişimi ölçeklenir */
  if(DEV.spd!==1&&(G.px!==x0||G.py!==y0)){
   const nx=x0+(G.px-x0)*DEV.spd,ny=y0+(G.py-y0)*DEV.spd;
   if(!HG.canStandAt||HG.canStandAt(nx,ny,G.pz)){G.px=nx;G.py=ny}
  }
  /* uçuş: yerçekimi ve yüzme kapanır, Boşluk/Shift ile yükselip alçalınır */
  if(DEV.fly){
   const inp=HG.inp,kd=HG.keyDown;
   G.vz=0;G.air=false;G.swim=false;G.head=false;
   let v=0;
   if(kd('jump')||(inp&&inp.touchJump))v+=1;
   if(kd('crouch')||kd('dive'))v-=1;
   if(G.pz===undefined)G.pz=HG.Scene.groundY(G.px,G.py)+2;
   G.pz=Math.max(-6,Math.min(240,G.pz+v*9*dt));
  }
  /* zaman akışı: durdurulabilir veya hızlandırılabilir */
  if(DEV.frozen)G.clock-=dt;
  else if(DEV.tscale!==1)G.clock+=dt*(DEV.tscale-1);
  return r;
 };
}
/* -- sahne ayarları -- */
function applyFog(){const sc=HG.sc;if(!sc||!sc.scene)return;
 if(DEV.fog){if(sc.fog0)sc.scene.fog=sc.fog0}
 else{if(!sc.fog0)sc.fog0=sc.scene.fog;sc.scene.fog=null}}
function applyWire(){const sc=HG.sc;if(!sc||!sc.scene)return;
 sc.scene.traverse(o=>{const m=o.material;if(!m)return;
  (Array.isArray(m)?m:[m]).forEach(k=>{if('wireframe' in k)k.wireframe=DEV.wire})});}
function applyLight(){const sc=HG.sc;if(!sc||!sc.scene)return;
 if(!sc.devLight){sc.devLight=new THREE.AmbientLight(0xffffff,0);sc.scene.add(sc.devLight)}
 sc.devLight.intensity=DEV.light;}

/* -- yakındaki canlılar -- */
function nearList(r){
 const out=[];
 for(const a of G.animals||[]){if(a.gone)continue;const d=Math.hypot(a.x-G.px,a.z-G.py);if(d<=r)out.push({t:HG.ANIMAL[a.t]?HG.ANIMAL[a.t].n:a.t,d,k:'hayvan'})}
 for(const n of G.npcs||[]){const d=Math.hypot(n.x-G.px,n.z-G.py);if(d<=r)out.push({t:(n.name||'köylü'),d,k:'köylü'})}
 for(const q of G.drops||[]){const d=Math.hypot(q.x-G.px,q.z-G.py);if(d<=r)out.push({t:(HG.IT[q.id]?HG.IT[q.id].n:q.id)+' ×'+q.n,d,k:'eşya'})}
 return out.sort((a,b)=>a.d-b.d);
}
/* -- dünya istatistiği -- */
function worldStats(){
 const T=HG.T,O=HG.O,t={},o={};
 const tile=G.tile,obj=G.obj;if(!tile)return null;
 for(let i=0;i<tile.length;i+=3){t[tile[i]]=(t[tile[i]]||0)+1}
 for(let i=0;i<obj.length;i++){const v=obj[i];if(v)o[v]=(o[v]||0)+1}
 const tn=['derin su','sığ su','kum','çim','kaya','göl'],tot=Math.max(1,Math.floor(tile.length/3));
 return {
  kare:Object.keys(t).map(k=>(tn[k]||k)+' %'+(t[k]/tot*100).toFixed(1)).join(' · '),
  agac:(o[O.TREE]||0)+(o[O.PALM]||0),kaya:o[O.ROCK]||0,
  komur:o[O.COAL]||0,bakir:o[O.COPPER]||0,demir:o[O.IRON]||0,cali:o[O.BUSH]||0
 };
}

/* ---- ek geliştirici komutları ---- */
def('ucus','<ac|kapat>','uçuş modu: yerçekimi kapanır, Boşluk/Ctrl ile yükselip alçalırsın',a=>{
 DEV.fly=!a.length?!DEV.fly:(near(a[0],'ac')||near(a[0],'aç')||near(a[0],'acik'));
 if(DEV.fly&&G.pz!==undefined)G.pz+=.6;
 mark('uçuş');say('Uçuş '+(DEV.fly?'açık (Boşluk yüksel · Ctrl alçal)':'kapalı'),'ok');
},true);
def('hiz','<0.2-8>','yürüme hızı çarpanı',a=>{
 DEV.spd=Math.max(.2,Math.min(8,num(a[0],1)));
 mark('hız');say('Hız çarpanı ×'+DEV.spd.toFixed(2),'ok');
},true);
def('zaman','<0-16|dur|devam>','zaman akışının hızı',a=>{
 const k=String(a[0]||'').toLocaleLowerCase('tr');
 if(k==='dur'){DEV.frozen=true;mark('zaman');return say('Zaman durduruldu.','ok')}
 if(k==='devam'){DEV.frozen=false;mark('zaman');return say('Zaman akıyor (×'+DEV.tscale+').','ok')}
 DEV.tscale=Math.max(0,Math.min(16,num(a[0],1)));DEV.frozen=DEV.tscale<=0;
 mark('zaman');say('Zaman akışı ×'+DEV.tscale.toFixed(1)+(DEV.frozen?' (durdu)':''),'ok');
},true);
def('sis','<ac|kapat>','sisi açar veya kapatır',a=>{
 DEV.fog=!a.length?!DEV.fog:(near(a[0],'ac')||near(a[0],'aç'));applyFog();say('Sis '+(DEV.fog?'açık':'kapalı'),'ok');
},true);
def('cizgi','<ac|kapat>','tel kafes (wireframe) görünümü',a=>{
 DEV.wire=!a.length?!DEV.wire:(near(a[0],'ac')||near(a[0],'aç'));applyWire();say('Tel kafes '+(DEV.wire?'açık':'kapalı'),'ok');
},true);
def('isik','<0-3>','ek ortam ışığı (karanlıkta görmek için)',a=>{
 DEV.light=Math.max(0,Math.min(3,num(a[0],1)));applyLight();say('Ek ışık '+DEV.light.toFixed(2),'ok');
},true);
def('hayvan','<tür> [adet]','yakına hayvan çıkarır',a=>{
 const k=String(a[0]||'').toLocaleLowerCase('tr');
 if(!k||!HG.ANIMAL[k]){
  const L=Object.keys(HG.ANIMAL).filter(x=>!HG.ANIMAL[x].dyn);
  return say('Tür kodu gerekli. Seçenekler: '+L.join(', '),'hata');
 }
 const n=Math.max(1,Math.min(30,num(a[1],1)|0)),L=[];
 for(let i=0;i<n;i++){
  let ok=false;
  for(let tr=0;tr<40&&!ok;tr++){
   const an=Math.random()*6.283,r=3+Math.random()*7,x=G.px+Math.cos(an)*r,z=G.py+Math.sin(an)*r;
   if(HG.walkable&&!HG.walkable(x,z))continue;
   L.push({t:k,x,z,yaw:Math.random()*6.283});ok=true;
  }
 }
 if(!L.length)return say('Uygun yer bulunamadı.','hata');
 (G.animals||(G.animals=[])).push(...HG.makeAnimals(L));
 mark('hayvan');say(HG.ANIMAL[k].n+' ×'+L.length+' çıkarıldı.','ok');
},true);
def('temizhayvan','[mesafe]','yakındaki hayvanları kaldırır',a=>{
 const r=Math.max(2,Math.min(400,num(a[0],40)));let n=0;
 for(const q of G.animals||[])if(!q.gone&&Math.hypot(q.x-G.px,q.z-G.py)<=r){q.gone=true;q.dying=9;n++}
 mark('hayvan');say(n+' hayvan kaldırıldı ('+Math.round(r)+' m).','ok');
},true);
def('seviye','<1-30>','oyuncu seviyesini ayarlar',a=>{
 const v=Math.max(1,Math.min(30,num(a[0],1)|0));
 const d=v-(G.lvl||1);G.lvl=v;G.xp=0;if(d>0)G.pts=(G.pts||0)+d;
 mark('seviye');say('Seviye '+v+(d>0?' · +'+d+' yetenek puanı':''),'ok');ui.dirty=true;
},true);
def('sikke','<n>','sikke ekler',a=>{
 const n=Math.max(1,Math.min(9999,num(a[0],100)|0));
 HG.gain&&HG.gain('coin',n);mark('sikke');say(n+' sikke eklendi.','ok');ui.dirty=true;
},true);
def('yetenek','<ad> <0-3> | liste','yetenek düzeyini ayarlar',a=>{
 const P=HG.PERKS||[];
 if(!a.length||near(a[0],'liste')){say('Yetenekler:');for(const p of P)echo('  '+p[0]+'  ·  '+p[1]+' (en çok '+p[3]+')');return}
 const k=String(a[0]),p=P.find(q=>q[0]===k);
 if(!p)return say('Yetenek yok: '+k+'  (yetenek liste)','hata');
 const v=Math.max(0,Math.min(p[3],num(a[1],p[3])|0));
 if(!G.perks)G.perks={};
 G.perks[k]=v;mark('yetenek');say(p[1]+' düzeyi '+v,'ok');
},true);
def('bos','','çantayı boşaltır',()=>{
 for(let i=0;i<HG.SLOTS;i++)G.inv[i]=null;
 mark('çanta');say('Çanta boşaltıldı.','ok');ui.dirty=true;
},true);
def('kaydet','','oyunu hemen kaydeder',()=>{
 const r=HG.save&&HG.save();say(r?'Oyun kaydedildi.':'Kayıt yapılamadı (önce Duraklat › Oyunu Kaydet ile bir yuva seçin).',r?'ok':'hata');
},true);
def('magara','[no]','mağaraları listeler veya birine ışınlar',a=>{
 const C=G.caves||[];if(!C.length)return say('Bu dünyada mağara yok.','hata');
 if(!a.length){
  say(C.length+' mağara:');
  C.forEach((c,i)=>echo('  '+i+'  ·  '+(c.kindName||'Mağara')+'  ·  zorluk '+['kolay','orta','zor'][c.tier||0]+'  ·  '+c.x+','+c.y+'  ·  '+Math.round(Math.hypot(c.x-G.px,c.y-G.py))+' m'));
  return;
 }
 const i=num(a[0],-1)|0,c=C[i];
 if(!c)return say('0 ile '+(C.length-1)+' arası bir numara verin.','hata');
 teleport(c.x,c.y+3);mark('ışınlanma');say((c.kindName||'Mağara')+' girişine ışınlandın.','ok');
},true);
def('koyler','[no]','köyleri listeler veya birine ışınlar',a=>{
 const V=G.villages||[];if(!V.length)return say('Bu dünyada köy yok.','hata');
 if(!a.length){
  say(V.length+' köy:');
  V.forEach((v,i)=>echo('  '+i+'  ·  '+(v.name||'Köy')+'  ·  '+(v.typeName||'-')+'  ·  '+v.cx+','+v.cy+'  ·  '+Math.round(Math.hypot(v.cx-G.px,v.cy-G.py))+' m'));
  return;
 }
 const i=num(a[0],-1)|0,v=V[i];
 if(!v)return say('0 ile '+(V.length-1)+' arası bir numara verin.','hata');
 teleport(v.cx,v.cy+6);mark('ışınlanma');say((v.name||'Köy')+' köyüne ışınlandın.','ok');
},true);
def('yakin','[mesafe]','yakındaki canlıları ve eşyaları listeler',a=>{
 const r=Math.max(2,Math.min(300,num(a[0],30))),L=nearList(r);
 if(!L.length)return say(Math.round(r)+' m içinde bir şey yok.');
 say(L.length+' kayıt ('+Math.round(r)+' m):');
 for(const q of L.slice(0,40))echo('  '+q.d.toFixed(1).padStart(6)+' m  ·  '+q.k+'  ·  '+q.t);
},true);
def('dunya','','dünya istatistiklerini yazar',()=>{
 const w=worldStats();if(!w)return say('Dünya hazır değil.','hata');
 say('Dünya kodu '+(HG.worldCode?HG.worldCode():G.seed)+'  ·  '+HG.W+'×'+HG.H);
 echo('  kareler: '+w.kare);
 echo('  ağaç '+w.agac+'  ·  kaya '+w.kaya+'  ·  çalı '+w.cali);
 echo('  kömür '+w.komur+'  ·  bakır '+w.bakir+'  ·  demir '+w.demir);
 echo('  köy '+(G.villages||[]).length+'  ·  mağara '+(G.caves||[]).length+'  ·  kamp '+(G.camps||[]).length);
},true);
def('olcum','','çizim ve bellek ölçümleri',()=>{
 const sc=HG.sc,p=HG.perf||{};
 const inf=sc&&sc.R?sc.R.info:null;
 say('FPS '+(p.fps||0)+'  ·  '+(p.ms||0).toFixed(2)+' ms  ·  ölçek %'+Math.round((p.scale||1)*100));
 if(inf){
  echo('  çizim '+inf.render.calls+'  ·  üçgen '+inf.render.triangles.toLocaleString('tr-TR'));
  echo('  geometri '+inf.memory.geometries+'  ·  doku '+inf.memory.textures+'  ·  program '+(inf.programs?inf.programs.length:'-'));
 }
 if(performance.memory)echo('  JS bellek '+(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' / '+(performance.memory.jsHeapSizeLimit/1048576).toFixed(0)+' MB');
},true);
def('izle','<yol> | temizle','panelde bir değeri sürekli gösterir (ör. izle G.stam)',a=>{
 const q=String(a[0]||'');
 if(!q||near(q,'temizle')){watch.length=0;return say('İzleme listesi temizlendi.','ok')}
 if(watch.length>=8)return say('En çok 8 değer izlenebilir.','hata');
 if(readPath(q)===undefined)return say('Okunamadı: '+q+'  (G.* veya HG.* yolu verin)','hata');
 watch.push(q);say('İzlemeye eklendi: '+q,'ok');
},true);
const watch=[];
function readPath(q){
 try{
  const p=String(q).split('.');let o=p[0]==='HG'?HG:p[0]==='G'?G:p[0]==='ui'?ui:p[0]==='sc'?HG.sc:null;
  if(!o)return undefined;
  for(let i=1;i<p.length;i++){if(o==null)return undefined;o=o[p[i]]}
  if(o===undefined||typeof o==='function')return undefined;
  if(typeof o==='number')return Math.round(o*1000)/1000;
  if(typeof o==='object')return Array.isArray(o)?'dizi('+o.length+')':'nesne';
  return o;
 }catch(e){return undefined}
}

/* ============================================================ çalıştırma ============================================================ */
function run(line){
 const txt=String(line||'').trim();
 if(!txt)return;
 const low=txt.toLocaleLowerCase('tr');
 const isDev=low===DEV_WORD||low.startsWith(DEV_WORD+' ');
 /* Parola tek satırda yazıldıysa ne ekrana ne kayda ne de geçmişe düşer: yıldızlanır. */
 const shown=isDev?DEV_WORD+(txt.length>DEV_WORD.length?' ••••••':''):txt;
 echo('> '+shown,'in');
 if(!isDev||txt.length===DEV_WORD.length){hist.push(txt);if(hist.length>60)hist.shift()}
 hi=-1;
 HG.log&&HG.log('komut','> '+shown);
 /* gizli komut: dünya kuralından bağımsız çalışır, parola ister */
 if(isDev){
  if(devOn)return devOpen(false);
  if(performance.now()<pwLock)return say('Çok fazla yanlış deneme. '+Math.ceil((pwLock-performance.now())/1000)+' saniye bekleyin.','hata');
  const arg=txt.slice(DEV_WORD.length).trim();
  if(arg)return pwTry(arg);                     /* tek satırda: hungerdev <parola> */
  say('Geliştirici modu parolası gerekli.');
  pwMode(true);
  return;
 }
 if(!on()&&!devOn)return say('Bu dünyada konsol komutları kapalı. Yeni dünya kurarken "Konsol komutları" seçeneğini açın.','hata');
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
/* Geliştirici paneli kendi sekmesinde açılır ve beş bölümden oluşur:
   Oyuncu · Dünya · Sahne · Eşya · İzleme. Panelin üstünde canlı ölçüm kutucukları durur.
   Bütün denetimler komut satırının aynısını çalıştırır; böylece panelden yapılan her değişiklik
   kayıt listesine de düşer ve komutla da yapılabilir. */
const SWITCH=[
 ['god','Ölümsüzlük',()=>!!HG.godMode,v=>run('olumsuz '+(v?'ac':'kapat'))],
 ['fly','Uçuş',()=>DEV.fly,v=>run('ucus '+(v?'ac':'kapat'))],
 ['frz','Zamanı durdur',()=>DEV.frozen,v=>run('zaman '+(v?'dur':'devam'))],
 ['fog','Sis',()=>DEV.fog,v=>run('sis '+(v?'ac':'kapat'))],
 ['wire','Tel kafes',()=>DEV.wire,v=>run('cizgi '+(v?'ac':'kapat'))]
];
const pct=v=>Math.round(v)+'';
const SLIDER=[
 ['hp','Can',0,100,1,()=>G.hp||0,v=>{G.hp=v;ui.dirty=true;mark('can')},pct,'oyuncu'],
 ['hun','Açlık',0,100,1,()=>G.hun||0,v=>{G.hun=v;ui.dirty=true;mark('açlık')},pct,'oyuncu'],
 ['thr','Susuzluk',0,100,1,()=>G.thr||0,v=>{G.thr=v;ui.dirty=true;mark('susuzluk')},pct,'oyuncu'],
 ['stam','Dayanıklılık',0,100,1,()=>G.stam||0,v=>{G.stam=v;mark('dayanıklılık')},pct,'oyuncu'],
 ['san','Akıl',0,100,1,()=>G.san||0,v=>{G.san=v;mark('akıl')},pct,'oyuncu'],
 ['spd','Hız çarpanı',.2,6,.2,()=>DEV.spd,v=>{DEV.spd=v},v=>'×'+v.toFixed(1),'oyuncu'],
 ['saat','Saat',0,24,.5,()=>HG.tod()*24,v=>{setHour(v);mark('saat')},v=>{const h=Math.floor(v),m=Math.round((v-h)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')},'dunya'],
 ['tim','Zaman akışı',0,16,.5,()=>DEV.tscale,v=>{DEV.tscale=v;DEV.frozen=v<=0},v=>'×'+v.toFixed(1),'dunya'],
 ['lgt','Ek ışık',0,3,.1,()=>DEV.light,v=>{DEV.light=v;applyLight()},v=>v.toFixed(1),'sahne']
];
const QGRP=[
 ['dunya','Hava',[['Açık','hava acik'],['Bulutlu','hava bulutlu'],['Yağmur','hava yagmur'],['Fırtına','hava firtina'],['Otomatik','hava otomatik']]],
 ['dunya','Saat',[['Sabah','saat 8'],['Öğlen','saat 13'],['Akşam','saat 20'],['Gece','saat 1']]],
 ['dunya','Harita ve konum',[['Haritayı aç','harita'],['Doğma noktası','isinlan dogma'],['En yakın köy','isinlan koy'],['En yakın kamp','isinlan kamp'],['Konum','konum'],['Dünya bilgisi','dunya']]],
 ['oyuncu','Hızlı işlem',[['Canı doldur','can 100'],['Doyur','aclik 100'],['Susuzluğu gider','susuzluk 100'],['+100 sikke','sikke 100'],['+500 deneyim','xp 500'],['Çantayı boşalt','bos'],['Oyunu kaydet','kaydet']]],
 ['sahne','Kalite',[['En düşük','kalite 0'],['Düşük','kalite 1'],['Orta','kalite 2'],['Yüksek','kalite 3']]],
 ['sahne','Canlılar',[['Yakındakiler','yakin 40'],['Hayvanları temizle','temizhayvan 60'],['Tavşan ×3','hayvan rabbit 3'],['Geyik ×2','hayvan deer 2'],['Kurt ×2','hayvan wolf 2'],['İnek ×2','hayvan cow 2']]]
];
let tileEl=null,togEl=null,gridEl=null,perfEl=null,itemQ=null,itemL=null,watchI=null,watchL=null,goEl={};
const esc=v=>String(v).replace(/[&<>]/g,'');
const el=(t,c,x)=>{const d=document.createElement(t);if(c)d.className=c;if(x!==undefined)d.textContent=x;return d};

/* ---- ölçüm kutucukları ---- */
function tiles(){
 if(!tileEl)return;
 const p=HG.perf||{},sc=HG.sc,inf=sc&&sc.R?sc.R.info:null;
 const mem=performance.memory?(performance.memory.usedJSHeapSize/1048576):0;
 const L=[
  ['FPS',p.fps||0,(p.ms||0).toFixed(1)+' ms',(p.fps||0)<30?'bad':(p.fps||0)<50?'warn':'ok'],
  ['Çizim',inf?inf.render.calls:'-',inf?(inf.render.triangles/1000).toFixed(0)+'k üçgen':''],
  ['Bellek',mem?mem.toFixed(0)+' MB':'-','JS yığını'],
  ['Konum',Math.round(G.px)+','+Math.round(G.py),(G.pz===undefined?'':G.pz.toFixed(1)+' m')+(G.cave?' · mağara':'')],
  ['Saat',saatStr(),'gün '+(HG.dayNo?HG.dayNo():'-')],
  ['Seviye',G.lvl||1,(G.pts||0)+' puan · '+Math.floor(G.xp||0)+' xp'],
  ['Canlı',(G.animals||[]).filter(a=>!a.gone).length,(G.npcs||[]).length+' köylü'],
  ['Durum',(HG.godMode?'ölümsüz':DEV.fly?'uçuş':DEV.frozen?'zaman durdu':'normal'),(G.cheat?'işaretli':'temiz'),(HG.godMode||DEV.fly||DEV.frozen)?'warn':'']
 ];
 while(tileEl.childElementCount>L.length)tileEl.lastChild.remove();
 while(tileEl.childElementCount<L.length){
  const d=el('div','kc-t');d.append(el('em'),el('b'),el('small'));tileEl.appendChild(d);
 }
 L.forEach((q,i)=>{const d=tileEl.children[i];
  d.className='kc-t'+(q[3]?' '+q[3]:'');
  d.children[0].textContent=q[0];d.children[1].textContent=esc(q[1]);d.children[2].textContent=q[2]||'';
 });
}
/* ---- eşya arama ---- */
function itemSearch(){
 if(!itemL)return;
 const q=(itemQ&&itemQ.value||'').toLocaleLowerCase('tr');
 const L=Object.keys(HG.IT).filter(k=>!q||k.toLocaleLowerCase('tr').includes(q)||HG.IT[k].n.toLocaleLowerCase('tr').includes(q)).slice(0,60);
 itemL.textContent='';
 if(!L.length){itemL.append(el('div','kc-empty','Eşleşen eşya yok.'));return}
 for(const k of L){
  const b=el('button','kc-it');b.type='button';b.dataset.id=k;
  b.append(el('span','',HG.IT[k].n),el('em','',k));
  itemL.appendChild(b);
 }
}
/* ---- ışınlanma seçicileri ---- */
function fillGo(){
 const mk=(sel,list,fmt)=>{
  if(!sel)return;const v=sel.value;sel.textContent='';
  list.forEach((o,i)=>{const op=el('option','',fmt(o,i));op.value=String(i);sel.appendChild(op)});
  if(!list.length)sel.appendChild(el('option','','yok'));
  if(v&&sel.querySelector('option[value="'+v+'"]'))sel.value=v;
 };
 mk(goEl.koy,G.villages||[],(v,i)=>(v.name||'Köy')+' · '+(v.typeName||'-')+' · '+Math.round(Math.hypot(v.cx-G.px,v.cy-G.py))+' m');
 mk(goEl.magara,G.caves||[],(c,i)=>(c.kindName||'Mağara')+' · '+['kolay','orta','zor'][c.tier||0]+' · '+Math.round(Math.hypot(c.x-G.px,c.y-G.py))+' m');
}
/* ---- izleme listesi ---- */
function watchRender(){
 if(!watchL)return;
 watchL.textContent='';
 if(!watch.length){watchL.append(el('div','kc-empty','Henüz izlenen değer yok. Örnek: G.stam'));return}
 for(const q of watch){
  const d=el('div','kc-w');
  d.append(el('span','',q),el('b','',String(readPath(q)===undefined?'-':readPath(q))));
  const x=el('button','kc-x','×');x.type='button';x.dataset.w=q;x.title='Kaldır';
  d.appendChild(x);watchL.appendChild(d);
 }
}
/* ---- performans sekmesi ---- */
const fpsHist=new Array(120).fill(0);let fpsI=0;
function perfDraw(full){
 if(!perfEl)return;
 const p=HG.perf||{},sc=HG.sc,inf=sc&&sc.R?sc.R.info:null;
 fpsHist[fpsI=(fpsI+1)%120]=p.fps||0;
 const cv=perfEl.querySelector('canvas');
 if(cv&&cv.clientWidth){
  /* tuval genişliği ekrana göre ayarlanır: çizgi bulanık görünmez */
  const dpr=Math.min(2,devicePixelRatio||1),cw=Math.round(cv.clientWidth*dpr),ch=Math.round(150*dpr);
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}
  const g=cv.getContext('2d'),W=cv.width,H=cv.height;
  g.setTransform(1,0,0,1,0,0);
  g.clearRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=1;
  for(const y of [30,60,120]){const yy=H-Math.min(1,y/144)*H;g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke();
   g.fillStyle='rgba(255,255,255,.22)';g.font=Math.round(9*Math.min(2,devicePixelRatio||1))+'px ui-monospace,monospace';g.fillText(String(y),2,yy-2)}
  g.beginPath();
  for(let i=0;i<120;i++){
   const v=fpsHist[(fpsI+1+i)%120],x=i/119*W,y=H-Math.min(1,v/144)*H;
   i?g.lineTo(x,y):g.moveTo(x,y);
  }
  g.strokeStyle=(p.fps||0)<30?'#ff7b72':(p.fps||0)<50?'#e8b45c':'#6fd38a';g.lineWidth=1.6*Math.min(2,devicePixelRatio||1);g.stroke();
  g.lineTo(W,H);g.lineTo(0,H);g.closePath();
  g.fillStyle=(p.fps||0)<30?'rgba(255,123,114,.12)':(p.fps||0)<50?'rgba(232,180,92,.12)':'rgba(111,211,138,.12)';g.fill();
 }
 const tb=perfEl.querySelector('.kc-grid');
 if(tb){
  const rows=[
   ['Kare hızı',(p.fps||0)+' FPS · '+(p.ms||0).toFixed(2)+' ms'],
   ['Çözünürlük ölçeği','%'+Math.round((p.scale||1)*100)+' · '+innerWidth+'×'+innerHeight],
   ['Kalite',(sc?sc.quality:'-')+' · piksel '+(sc&&sc.R?(Math.round(sc.R.getPixelRatio()*100)/100):'-')],
   ['Gölge tazeleme',(p.shadowHz||0)+' Hz · atlanan kare '+(p.drops||0)],
   ['Çizim çağrısı',inf?inf.render.calls:'-'],
   ['Üçgen',inf?inf.render.triangles.toLocaleString('tr-TR'):'-'],
   ['Geometri / doku',inf?(inf.memory.geometries+' / '+inf.memory.textures):'-'],
   ['Gölgelendirici',inf&&inf.programs?inf.programs.length:'-'],
   ['JS belleği',performance.memory?((performance.memory.usedJSHeapSize/1048576).toFixed(1)+' / '+(performance.memory.jsHeapSizeLimit/1048576).toFixed(0)+' MB'):'tarayıcı vermiyor'],
   ['Sahne nesnesi',sc&&sc.scene?sc.scene.children.length+' kök · '+(G.animals||[]).length+' hayvan · '+(G.npcs||[]).length+' köylü':'-'],
   ['Dünya',(HG.worldCode?HG.worldCode():G.seed)+' · '+HG.W+'×'+HG.H+' · '+(G.drops||[]).length+' yer eşyası']
  ];
  while(tb.childElementCount>rows.length)tb.lastChild.remove();
  while(tb.childElementCount<rows.length){const d=el('div');d.append(el('span'),el('b'));tb.appendChild(d)}
  rows.forEach((r,i)=>{const d=tb.children[i];d.firstChild.textContent=r[0];d.lastChild.textContent=esc(r[1])});
 }
}
HG.konsolPerf=perfDraw;

/* ---- panelin canlı güncellenmesi ---- */
function panel(){
 perfDraw();
 if(!panEl||panEl.hidden)return;
 tiles();
 if(togEl)for(const b of togEl.querySelectorAll('button[data-t]')){const sw=SWITCH.find(x=>x[0]===b.dataset.t);if(sw)b.classList.toggle('on',!!sw[2]())}
 if(panEl)for(const r of panEl.querySelectorAll('label[data-s]')){
  const sl=SLIDER.find(x=>x[0]===r.dataset.s);if(!sl)continue;
  const inp=r.querySelector('input');
  if(document.activeElement!==inp&&!inp.dataset.drag){const v=sl[5]();inp.value=v;r.lastChild.textContent=sl[7](+v)}
 }
 if(gridEl){
  const sc=HG.sc;
  const rows=[
   ['Durum',ui.state+(G.cave?' · mağara':'')],
   ['Bakış',(HG.look?((HG.look.yaw*57.3)|0)+'° / '+((HG.look.pitch*57.3)|0)+'°':'-')],
   ['Hava','bulut %'+Math.round((sc?sc.over:0)*100)+' · yağmur %'+Math.round((sc?sc.rain:0)*100)+(HG.wxForce?' (zorlanmış)':'')],
   ['Dünya',(HG.worldCode?HG.worldCode():G.seed)+' · '+HG.W+'×'+HG.H],
   ['Kurallar',(on()?'komutlar açık':'komutlar kapalı')+(G.cheat?' · işaretli':'')]
  ];
  while(gridEl.childElementCount>rows.length)gridEl.lastChild.remove();
  while(gridEl.childElementCount<rows.length){const d=el('div');d.append(el('span'),el('b'));gridEl.appendChild(d)}
  rows.forEach((r,i)=>{const d=gridEl.children[i];d.firstChild.textContent=r[0];d.lastChild.textContent=esc(r[1])});
 }
 watchRender();
 fillGo();
}
/* ---- kurulum ---- */
const sldHtml=g=>SLIDER.filter(x=>x[8]===g).map(x=>'<label class="kc-r" data-s="'+x[0]+'"><span>'+x[1]+'</span>'+
 '<input type="range" min="'+x[2]+'" max="'+x[3]+'" step="'+x[4]+'" aria-label="'+x[1]+'"><b></b></label>').join('');
const qHtml=g=>QGRP.filter(x=>x[0]===g).map(x=>'<div class="kc-qg"><em>'+x[1]+'</em><div class="kc-q">'+
 x[2].map(q=>'<button type="button" data-c="'+q[1]+'">'+q[0]+'</button>').join('')+'</div></div>').join('');
HG.konsolBuilt=root=>{
 box=root.querySelector('#knCmd');if(!box)return;
 /* komut satırı: her sekmede altta sabit durur */
 box.innerHTML='<div class="kc-in"><span>&gt;</span><input id="kcIn" type="text" placeholder="Komut yazın (yardim · Tab tamamlar · ↑↓ geçmiş)" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Komut satırı"></div>';
 inpEl=box.querySelector('#kcIn');
 outEl=root.querySelector('#kcOut');
 panEl=root.querySelector('#kcPan');
 perfEl=root.querySelector('#knPerf');
 /* performans sekmesi */
 perfEl.innerHTML='<div class="kc-h">KARE HIZI (son 120 ölçüm)</div>'+
  '<canvas class="kc-gr" width="900" height="150"></canvas>'+
  '<div class="kc-h">AYRINTILAR</div><div class="kc-grid"></div>';
 /* geliştirici paneli */
 panEl.innerHTML=
  '<div class="kc-tiles"></div>'+
  '<div class="kc-cols">'+
   '<div class="kc-card" data-g="oyuncu"><div class="kc-h">OYUNCU</div>'+
    '<div class="kc-tog">'+SWITCH.slice(0,2).map(x=>'<button type="button" class="kc-sw" data-t="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
    '<div class="kc-sld">'+sldHtml('oyuncu')+'</div>'+qHtml('oyuncu')+
   '</div>'+
   '<div class="kc-card" data-g="dunya"><div class="kc-h">DÜNYA</div>'+
    '<div class="kc-tog">'+SWITCH.slice(2,3).map(x=>'<button type="button" class="kc-sw" data-t="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
    '<div class="kc-sld">'+sldHtml('dunya')+'</div>'+
    '<div class="kc-go"><label><span>Köy</span><select id="kcKoy"></select><button type="button" data-go="koy">Git</button></label>'+
     '<label><span>Mağara</span><select id="kcMag"></select><button type="button" data-go="magara">Git</button></label></div>'+
    qHtml('dunya')+
   '</div>'+
   '<div class="kc-card" data-g="sahne"><div class="kc-h">SAHNE</div>'+
    '<div class="kc-tog">'+SWITCH.slice(3).map(x=>'<button type="button" class="kc-sw" data-t="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
    '<div class="kc-sld">'+sldHtml('sahne')+'</div>'+qHtml('sahne')+
    '<div class="kc-h" style="margin-top:12px">BİLGİ</div><div class="kc-grid"></div>'+
   '</div>'+
   '<div class="kc-card" data-g="esya"><div class="kc-h">EŞYA VER</div>'+
    '<div class="kc-row"><input id="kcIq" type="text" placeholder="Eşya ara…" autocomplete="off" spellcheck="false" aria-label="Eşya ara">'+
     '<input id="kcIn2" type="number" min="1" max="999" value="1" aria-label="Adet"></div>'+
    '<div class="kc-list" id="kcIl"></div>'+
   '</div>'+
   '<div class="kc-card" data-g="izle"><div class="kc-h">İZLEME</div>'+
    '<div class="kc-row"><input id="kcWq" type="text" placeholder="G.stam · HG.perf.fps · sc.rain" autocomplete="off" spellcheck="false" aria-label="İzlenecek değer">'+
     '<button type="button" id="kcWa">Ekle</button></div>'+
    '<div class="kc-list" id="kcWl"></div>'+
   '</div>'+
  '</div>';
 tileEl=panEl.querySelector('.kc-tiles');togEl=panEl;gridEl=panEl.querySelector('.kc-card[data-g="sahne"] .kc-grid');
 itemQ=panEl.querySelector('#kcIq');itemL=panEl.querySelector('#kcIl');
 watchI=panEl.querySelector('#kcWq');watchL=panEl.querySelector('#kcWl');
 goEl.koy=panEl.querySelector('#kcKoy');goEl.magara=panEl.querySelector('#kcMag');
 /* olaylar */
 panEl.addEventListener('click',e=>{
  const q=e.target.closest('button[data-c]');if(q)return run(q.dataset.c);
  const t=e.target.closest('button[data-t]');
  if(t){const sw=SWITCH.find(x=>x[0]===t.dataset.t);if(sw){sw[3](!sw[2]());panel()}return}
  const g=e.target.closest('button[data-go]');
  if(g){const sel=goEl[g.dataset.go];if(sel&&sel.value!==''&&sel.value!=null)run((g.dataset.go==='koy'?'koyler ':'magara ')+sel.value);return}
  const it=e.target.closest('button[data-id]');
  if(it){const n=Math.max(1,Math.min(999,parseInt(panEl.querySelector('#kcIn2').value,10)||1));run('esya '+it.dataset.id+' '+n);return}
  const w=e.target.closest('button[data-w]');
  if(w){const i=watch.indexOf(w.dataset.w);if(i>=0)watch.splice(i,1);watchRender();return}
  if(e.target.id==='kcWa'){const v=(watchI.value||'').trim();if(v){run('izle '+v);watchI.value='';watchRender()}return}
 });
 panEl.addEventListener('input',e=>{
  if(e.target===itemQ)return itemSearch();
  const r=e.target.closest('label[data-s]');if(!r)return;
  const sl=SLIDER.find(x=>x[0]===r.dataset.s);if(!sl)return;
  e.target.dataset.drag='1';
  const v=parseFloat(e.target.value);sl[6](v);r.lastChild.textContent=sl[7](v);
 });
 panEl.addEventListener('change',e=>{
  const r=e.target.closest('label[data-s]');if(!r)return;
  delete e.target.dataset.drag;
  const sl=SLIDER.find(x=>x[0]===r.dataset.s);
  if(sl)HG.log&&HG.log('komut',sl[1]+' → '+sl[7](parseFloat(e.target.value)));
 });
 /* panel içindeki yazı alanları oyuna tuş göndermez */
 for(const i of panEl.querySelectorAll('input')){
  i.addEventListener('keydown',e=>{if(e.code!=='Escape'&&e.code!=='F1')e.stopPropagation()});
  i.addEventListener('keyup',e=>{if(e.code!=='Escape'&&e.code!=='F1')e.stopPropagation()});
  i.addEventListener('keypress',e=>{if(e.key==='Enter'&&i===watchI){const v=(watchI.value||'').trim();if(v){run('izle '+v);watchI.value='';watchRender()}}});
 }
 inpEl.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.code==='Enter'||e.code==='NumpadEnter'){
   e.preventDefault();const v=inpEl.value;inpEl.value='';
   if(pwAsk)pwTry(v);else run(v);           /* parola sorulurken satır kayda ve geçmişe yazılmaz */
   return;
  }
  if(pwAsk){if(e.code==='Escape'){e.preventDefault();pwMode(false);say('Geliştirici modu iptal edildi.')}return}
  if(e.code==='ArrowUp'){e.preventDefault();if(hist.length){hi=hi<0?hist.length-1:Math.max(0,hi-1);inpEl.value=hist[hi]}}
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
 panEl.hidden=!devOn;
 itemSearch();watchRender();
 echo(on()?'Komutlar açık. "yardim" yazarak listeyi görebilirsiniz.':'Bu dünyada konsol komutları kapalı (Dünya Oluştur penceresinden açılır). Geliştirici modu bu kuraldan bağımsızdır.');
 clearInterval(panT);panT=setInterval(panel,400);
};
})();
