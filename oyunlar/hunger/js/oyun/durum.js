/* Hunger 3D - oyun durumu: yeni oyun, kaydetme, yükleme, başlatma */
(()=>{
'use strict';
const {W,SLOTS,O,SAVE,G,ui,A,look,genWorld,Scene}=HG;
const $=HG.$;

/* G nesnesi hiç değişmez; yeni oyunda içi sıfırlanıp yeniden doldurulur */
function newState(seed,emb){
 /* emb: eski (384) kayıtlar için ada, güncel büyük haritanın ortasına yerleştirilir */
 const w=emb?HG.embedLegacy(genWorld(seed,emb),emb,seed):genWorld(seed);
 if(HG.thinWorld)HG.thinWorld(w.obj,w.sx,w.sy,HG.pendingWorld&&HG.pendingWorld.res);                /* doğal kaynakların bir kısmı kaldırılır (js/veri/denge.js); rastgele sayı kullanılmaz */
 for(const k in G)delete G[k];
 Object.assign(G,{seed,tile:w.tile,obj:w.obj,hgt:w.hgt,drops:[],animals:HG.makeAnimals(w.animals),pz:undefined,vz:0,air:false,shore:w.shore,px:w.sx,py:w.sy,fx:0,fy:-1,objDirty:true,tg:null,
  hp:100,hun:HG.BAL.startStat,thr:HG.BAL.startStat,warm:100,stam:100,san:100,bleed:0,torchFuel:360,torchLit:false,tired:false,arrows:[],clock:0,thin:1,sp0:{x:w.sx,y:w.sy},inv:Array(SLOTS).fill(null),sel:0,flags:{},timers:[],
  villages:w.villages,camps:w.camps||[],caves:w.caves||[],explore:new Uint8Array(Math.ceil(HG.W/4)*Math.ceil(HG.H/4)),cave:null,emb:emb||0,islets:w.islets||[],reefs:w.reefs||[],onRaft:false,raftHp:100,mask:false,seaT:0,sharkCd:0,entSC:w.entSC,sdist:HG.seaDistField(w.tile,HG.W),npcs:HG.makeNpcs(w.villages),sheltered:false,shelterCheck:0,shelterT:0,moving:false,walk:0,nearFire:false,cause:'',saveT:0,sprint:false});
 G.inv[0]={id:'rock',n:1};                      /* başlangıçta elde El Taşı bulunur: çıplak elle ağaç kesilemez, kazılamaz */
 G.inv[1]={id:'torch',n:1};                     /* ilk gece için bir meşale */
 G.inv[2]={id:'wbottle',n:1};                   /* ilk susuzluk için bir su şişesi */
 HG.progInit();
 return G;
}
/* ---- kayıt altyapısı: otomatik kayıt + elle alınan yuvalar + dosya ---- */
const IDX='hunger-yuvalar',SLOTKEY=id=>'hunger-yuva-'+id,MAXSLOT=10;
/* Harita nesneleri: art arda tekrarlayan bayt dizileri (değer, uzunluk) olarak sıkıştırılır */
function encExp(a){if(!a)return '';let s='';for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]?49:48);return s}
function decExp(s,a){if(typeof s==='string'&&s.length===a.length)for(let i=0;i<a.length;i++)a[i]=s.charCodeAt(i)===49?1:0}
function encObj(o){
 let out='',i=0;const n=o.length;
 while(i<n){const v=o[i];let c=1;while(i+c<n&&o[i+c]===v&&c<65535)c++;out+=String.fromCharCode(v,c&255,c>>8);i+=c}
 return btoa(out);
}
function decObj(s,n){
 const b=atob(s.objr!==undefined?s.objr:s.obj);n=n||HG.W*HG.H;
 if(s.objr===undefined)return b.length===n?Array.from(b,ch=>ch.charCodeAt(0)):null;
 const r=new Uint8Array(n);let k=0;
 for(let i=0;i+2<b.length;i+=3){const v=b.charCodeAt(i),c=b.charCodeAt(i+1)|(b.charCodeAt(i+2)<<8);for(let q=0;q<c&&k<n;q++)r[k++]=v}
 return k===n?r:null;
}
function snapshot(name){return HG.withSurface(()=>snapshotRaw(name))}
function snapshotRaw(name){
 const d=HG.dayNo();
 return {game:'hunger-3d',v:7,hv:2,thin:G.thin?1:0,rules:{diff:String(HG.cfg.diff),death:HG.cfg.death,season:HG.cfg.season!==false,wear:HG.cfg.wear!==false,cmd:!!HG.cfg.cmd,peace:!!HG.cfg.peace},ws:HG.W,emb:G.emb||0,rf:G.onRaft?1:0,meta:{name:name||'',ts:Date.now(),day:d,lvl:G.lvl||1,th:HG.saveThumb?HG.saveThumb():''},prog:HG.progSave(),camps:(G.camps||[]).map(c=>c.open?1:0),cav:(G.caves||[]).map(c=>c.vault?1:0),wp:G.wp||null,exp:encExp(G.explore),timers:G.timers,dmg:Object.fromEntries(Object.entries(G.dmg||{}).map(([k,v])=>[k,+v.toFixed(3)])),npcs:HG.npcSave(),seed:G.seed,px:G.px,py:G.py,yaw:look.yaw,hp:G.hp,hun:G.hun,thr:G.thr,warm:G.warm,stam:+G.stam.toFixed(1),san:+G.san.toFixed(1),bleed:+(G.bleed||0).toFixed(1),o2:+(G.o2===undefined?100:G.o2).toFixed(1),torchFuel:+G.torchFuel.toFixed(1),clock:G.clock,inv:G.inv,sel:G.sel,flags:G.flags,drops:G.drops,animals:G.animals.filter(a=>!a.gone&&!HG.ANIMAL[a.t].foe&&!HG.ANIMAL[a.t].dyn).map(a=>({t:a.t,x:+a.x.toFixed(2),z:+a.z.toFixed(2),hp:a.hp,yaw:+a.yaw.toFixed(2),sheared:a.sheared?1:0,dead:a.dying&&!a.gone?1:0})),objr:encObj(G.obj)};
}
const validSave=s=>!!(s&&typeof s==='object'&&s.v===7&&typeof s.seed==='number'&&typeof s.px==='number'&&typeof s.py==='number'&&(typeof s.obj==='string'||typeof s.objr==='string')&&Array.isArray(s.inv));
function readJSON(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function slotIndex(){const x=readJSON(IDX);return Array.isArray(x)?x.filter(e=>e&&typeof e.id==='string'):[]}
function writeIndex(a){try{localStorage.setItem(IDX,JSON.stringify(a));return true}catch(e){return false}}
/* Yuva listesi: otomatik kayıt (varsa) ve elle alınanlar, en yeni önce */
function listSlots(){
 const out=[],a=readJSON(SAVE);
 if(validSave(a))out.push({id:'auto',name:'Otomatik kayıt',ts:(a.meta&&a.meta.ts)||0,day:(a.meta&&a.meta.day)||Math.floor((a.clock||0)/HG.DAY)+1,lvl:(a.meta&&a.meta.lvl)||1,th:(a.meta&&a.meta.th)||'',auto:true});
 for(const e of slotIndex())if(localStorage.getItem(SLOTKEY(e.id)))out.push(Object.assign({},e));
 return out.sort((x,y)=>y.ts-x.ts);
}
function readSlot(id){const s=readJSON(id==='auto'?SAVE:SLOTKEY(id));return validSave(s)?s:null}
function saveExists(){return listSlots().length>0}
/* Otomatik kayıt: yalnızca "Oyunu Kaydet › Otomatik kayıt" ile bir tarayıcı yuvasına bağlanmış oyun, bu yuvaya her 20 saniyede yazılır */
function save(){
 if(!G.obj||ui.state==='dead'||ui.state==='menu'||!G.slot)return false;
 const idx=slotIndex(),e=idx.find(x=>x.id===G.slot);
 if(!e){G.slot=null;return false}
 try{
  const sn=snapshot(e.name);e.ts=sn.meta.ts;e.day=sn.meta.day;e.lvl=sn.meta.lvl;e.th=sn.meta.th||'';
  localStorage.setItem(SLOTKEY(e.id),JSON.stringify(sn));writeIndex(idx);G.saveFail=false;return true;
 }catch(x){if(!G.saveFail&&ui.state==='play'){G.saveFail=true;HG.toast('Otomatik kayıt yapılamadı: tarayıcı depolama alanı dolu olabilir.')}return false}
}
/* Tarayıcıya kaydet: oyun bir yuvaya bağlıysa orayı günceller, değilse yeni yuva açıp oyunu ona bağlar (bundan sonra otomatik kayıt oraya yazar) */
function manualSave(quick){
 if(!G.obj||ui.state==='dead'||ui.state==='menu')return false;
 let idx=slotIndex(),e=G.slot&&idx.find(x=>x.id===G.slot);
 if(!e){
  if(idx.length>=MAXSLOT){HG.toast('Kayıt sınırına ulaşıldı ('+MAXSLOT+'). Kayıtlı Oyunlar listesinden silin.');return false}
  const id=Date.now().toString(36);const base=(G.worldName||'Kayıt').slice(0,34);let n=G.worldName?1:1,nm=G.worldName?base:base+' 1';while(idx.some(x=>x.name===nm)){n++;nm=base+' '+n}
  e={id,name:nm};idx.push(e);G.slot=id;
 }
 const sn=snapshot(e.name);e.ts=sn.meta.ts;e.day=sn.meta.day;e.lvl=sn.meta.lvl;e.th=sn.meta.th||'';
 try{localStorage.setItem(SLOTKEY(e.id),JSON.stringify(sn))}catch(x){HG.toast('Kayıt yapılamadı: tarayıcı depolama alanı dolu.');return false}
 if(!writeIndex(idx)){HG.toast('Kayıt yapılamadı.');return false}
 HG.toast((quick?'Hızlı kayıt: ':'Oyun kaydedildi: ')+e.name+' (her 20 saniyede otomatik güncellenir)');try{HG.snd('ui')}catch(x){}
 return true;
}
function fname(sn,name){return 'hunger-'+String(name||sn.meta.name||'kayit').toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi,'-').replace(/^-|-$/g,'')+'-gun'+sn.meta.day+'.json'}
function downloadData(sn,name){
 try{
  const b=new Blob([JSON.stringify(sn)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=fname(sn,name);document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return true;
 }catch(e){HG.toast('Dosya indirilemedi.');return false}
}
/* Çalışan oyunu dosya olarak indirir */
function downloadCurrent(){
 if(!G.obj||ui.state==='dead'||ui.state==='menu')return false;
 const idx=slotIndex(),e=G.slot&&idx.find(x=>x.id===G.slot);
 const nm=e?e.name:(G.worldName||'Kayıt'),ok=downloadData(snapshot(nm),nm);
 if(ok)HG.toast('Kayıt dosyası indirildi.');return ok;
}
function downloadSlot(id){const s=readSlot(id);if(!s){HG.toast('Kayıt okunamadı.');return false}const e=listSlots().find(x=>x.id===id);return downloadData(s,e?e.name:'kayit')}
/* Dosyadan içe aktarma: geçerliyse yeni yuva olarak eklenir, yuva kimliği döner (hata: null) */
function importText(text,fileName){
 let s;try{s=JSON.parse(text)}catch(e){return {err:'Dosya okunamadı: geçerli bir kayıt dosyası değil.'}}
 if(!validSave(s))return {err:'Bu dosya geçerli bir Hunger kaydı değil.'};
 if(decObj(s,s.ws?HG.W*HG.W:384*384)===null)return {err:'Kayıt dosyası bozuk: harita verisi okunamadı.'};
 const idx=slotIndex();
 if(idx.length>=MAXSLOT)return {err:'Kayıt sınırına ulaşıldı ('+MAXSLOT+'). Önce bir kayıt silin.'};
 const id=Date.now().toString(36)+'i';
 let name=(s.meta&&s.meta.name&&s.meta.name!=='Otomatik kayıt')?s.meta.name:String(fileName||'İçe aktarılan').replace(/\.json$/i,'').slice(0,40);
 const meta=Object.assign({day:Math.floor((s.clock||0)/HG.DAY)+1,lvl:1,ts:Date.now()},s.meta||{});meta.name=name;meta.ts=Date.now();s.meta=meta;
 try{localStorage.setItem(SLOTKEY(id),JSON.stringify(s))}catch(e){return {err:'Tarayıcı depolama alanı dolu.'}}
 idx.push({id,name,ts:meta.ts,day:meta.day,lvl:meta.lvl,th:typeof meta.th==='string'&&meta.th.startsWith('data:image/jpeg')&&meta.th.length<40000?meta.th:''});writeIndex(idx);
 return {id,name};
}
function renameSlot(id,name){
 name=String(name||'').trim().slice(0,40);if(!name||id==='auto')return false;
 const idx=slotIndex(),e=idx.find(x=>x.id===id);if(!e)return false;
 e.name=name;writeIndex(idx);
 const s=readSlot(id);if(s){s.meta=Object.assign(s.meta||{},{name});try{localStorage.setItem(SLOTKEY(id),JSON.stringify(s))}catch(x){}}
 return true;
}
function deleteSlot(id){
 if(id==='auto'){try{localStorage.removeItem(SAVE)}catch(e){}return true}
 try{localStorage.removeItem(SLOTKEY(id))}catch(e){}
 writeIndex(slotIndex().filter(x=>x.id!==id));if(G.slot===id)G.slot=null;return true;
}

/* ---- yüklenme ekranı ---- */
const TIPS=['Kaynaklar sınırlıdır ve yavaş yeniden büyür: ağaç ve taşı israf etme, yeni bölgeleri keşfet.','Taş, bakır ve demir aletler kullandıkça aşınır. Çalışma Tezgâhına bakıp E ile onar.','Cevher eritmek için kömür gerekir: bakır külçe 2 cevher + 1 kömür, demir külçe 2 cevher + 2 kömür ister.','Ateş yakmak için odun ve kıvılcım gerekir; geceleri ateş en güvenli dostundur.','Kurtlar gece sürü hâlinde dolaşır. Işıktan ve ateşten çekinirler.','Köylülerle ticaret yaparak altın kazanabilir, görev tamamlayarak ödül alabilirsin.','Kamplardaki sandıklarda hem değerli eşya hem de adanın geçmişini anlatan notlar bulunur.','Her 5. gece Kan Ayı doğar: düşmanlar çoğalır ve gökyüzü kızıllaşır.','Uyku tulumu veya yatakla geceyi atlatabilirsin; yalnızca güvenli bir barınakta uyu.','Yüksekten düşmek can götürür; uçurumlardan atlamadan önce yüksekliği ölç.','Suya düşen eşyalar bir süre yüzer, sonra derin suda batar.','Gelişim ekranında (K) kazandığın puanları yeteneklere harcayabilirsin.','Rüzgâr yönü ve yağmur oka da etki eder; uzak hedeflerde hafifçe yukarı nişan al.','Deniz dibine bakıp sol tuşu basılı tutarak midye, yosun ve nadiren inci toplanır; balıkçı bunları satın alır.','Derin suda nefes çubuğu azalır; yüzeye çıkmayı geciktirmeyin.','Çanta düzenleme tuşu, kutuları birleştirip eşya türüne göre sıralar.','Köylüler geceleri evlerinde uyur; ticaret için sabahı beklemek gerekir.','Ağaç ve çalılar barınak sayılmaz; duvar ve kapıyla kapatılmış bir alan gerekir.','Sal ile açık denize çıkabilirsin; köpek balıkları yüzenlere saldırır, salda daha güvendesin.','Batık gemilerin sandığı dipte durur. Dalış Maskesi nefesi uzatır.','Deniz fenerlerinin ışığı geceleri çok uzaktan görünür ve yön gösterir.','Başlangıçtaki El Taşı ağaç ve kaya için yeterlidir; balta ve kazma çok daha hızlıdır.','İnşa Planı ile duvar, kapı ve çit kurulur; Çekiçle Odun, Taş veya Metal seviyesine yükseltilir.'];
let tipI=0,tipT=0,closeT=0;
function ldOpen(title){
 const e=$('#load');if(!e)return;clearTimeout(closeT);e.hidden=false;e.classList.remove('out');
 $('#loadT').textContent=title||'Yükleniyor';$('#loadBar').parentNode.hidden=false;
 tipI=(Math.random()*TIPS.length)|0;$('#loadTip').textContent=TIPS[tipI];
 clearInterval(tipT);tipT=setInterval(()=>{tipI=(tipI+1)%TIPS.length;$('#loadTip').textContent=TIPS[tipI]},4200);
 ldSet(0,'');
}
function ldSet(p,txt){const b=$('#loadBar');if(!b)return;b.style.width=Math.round(p*100)+'%';$('#loadPct').textContent=Math.round(p*100)+'%';if(txt!==undefined)$('#loadSub').textContent=txt}
function ldClose(){
 const e=$('#load');if(!e)return;clearInterval(tipT);e.classList.add('out');clearTimeout(closeT);closeT=setTimeout(()=>{e.hidden=true},500);
}
const nap=()=>new Promise(r=>setTimeout(r,20));
async function startGame(load,slotId){
 if(HG.busy)return;
 HG.busy=true;
 for(const id of ['#menu','#dead','#pause'])$(id).hidden=true;
 ldOpen(load?'Kayıt yükleniyor':'Yeni oyun hazırlanıyor');
 await nap();
 let s=null;
 let slotUsed=null;
 if(load){const ls=listSlots();const pick=slotId?ls.find(x=>x.id===slotId):ls[0];if(pick){s=readSlot(pick.id);slotUsed=pick.id}}
 let guestSnap=false;
 if(HG.netSnap){s=HG.netSnap;HG.netSnap=null;slotUsed=null;guestSnap=true}           /* co-op: konuk, ev sahibinin gönderdiği dünya verisiyle başlar (js/oyun/ag.js) */
 if(s&&s.v===7){
  /* eski (384) kayıt: ada, büyük haritanın ortasına yerleştirilir ve tüm konumlar kaydırılır */
  const N=HG.W,oldSz=s.ws?0:384,emb=s.ws?(s.emb||0):384,off=oldSz?(N-oldSz)>>1:0;
  const mapI=i=>oldSz?((((i/oldSz)|0)+off)*N+(i%oldSz)+off):i;
  ldSet(.1,'Dünya yeniden kuruluyor');await nap();
  newState(s.seed,emb);
  ldSet(.25,'Kayıt işleniyor');await nap();
  try{const b=decObj(s,oldSz?oldSz*oldSz:N*N);if(b)for(let i=0;i<b.length;i++){let o=b[i];if(o===O.BUSH0)o=O.BUSH;if(o===O.PALM0)o=O.PALM;G.obj[mapI(i)]=o}}catch(e){}
  HG.pondClean(G.tile,G.obj,N);                     /* gölet içi ve kenarındaki ağaç/çalı temizlenir */
  Object.assign(G,{px:s.px+off,py:s.py+off,hp:s.hp,hun:s.hun,thr:s.thr,warm:s.warm,clock:s.clock,inv:s.inv,sel:s.sel||0,flags:s.flags||{},
   o2:s.o2===undefined?100:s.o2,stam:s.stam===undefined?100:s.stam,san:s.san===undefined?100:s.san,bleed:s.bleed||0,torchFuel:s.torchFuel===undefined?360:s.torchFuel});
  G.drops=(Array.isArray(s.drops)?s.drops:[]).filter(d=>d&&HG.IT[d.id]&&d.n>0).map(d=>Object.assign({id:d.id,n:d.n,x:d.x+off,y:d.y,z:d.z+off,vx:0,vz:0,vy:0,age:5,rest:false},d.d>0&&HG.BAL.dur[d.id]?{d:Math.round(d.d)}:{}));
  if(Array.isArray(s.animals)){
   /* eski kayıtlarda can küçük sayılardı: yüzdeye çevrilir */
   const OLD={sheep:8,cow:14,rabbit:3,deer:9,wolf:14,boar:12};
   if(s.hv!==2)for(const a of s.animals)if(OLD[a.t]&&typeof a.hp==='number')a.hp=Math.max(1,Math.min(100,a.hp/OLD[a.t]*100));
   if(off)for(const a of s.animals){a.x+=off;a.z+=off}
   G.animals=HG.makeAnimals(s.animals);
  }
  if(Array.isArray(s.timers))G.timers=s.timers.filter(t=>t&&t.i>=0&&t.i<(oldSz?oldSz*oldSz:N*N)).map(t=>{t.i=mapI(t.i);return t});
  if(!s.thin&&HG.migrateBalance)HG.migrateBalance();        /* denge öncesi kayıt: kaynaklar ve hayvanlar bir kez seyreltilir */
  /* dünya kuralları (Dünya Oluştur: zorluk, ölüm, mevsimler, barış) kayıtla birlikte saklanır; eski kayıtlarda yoktur ve geçerli ayarlar korunur.
     Co-op konuğu ev sahibinin kurallarını ag.js üzerinden alır. */
  if(s.rules&&typeof s.rules==='object'&&!guestSnap){
   const r=s.rules,c=HG.cfg;
   if(['0','1','2'].includes(String(r.diff)))c.diff=String(r.diff);
   if(['bed','free','perm'].includes(r.death))c.death=r.death;
   if(typeof r.season==='boolean')c.season=r.season;
   if(typeof r.wear==='boolean')c.wear=r.wear;
   if(typeof r.cmd==='boolean')c.cmd=r.cmd;
   if(typeof r.peace==='boolean')c.peace=r.peace;
  }
  /* yarım kalmış düğüm hasarı (kısmen kesilmiş ağaç, kırılmış kaya/maden) */
  G.dmg={};G.yac={};if(s.dmg&&typeof s.dmg==='object')for(const k in s.dmg){const f=+s.dmg[k],i=mapI(+k);if(i>=0&&i<(oldSz?oldSz*oldSz:N*N)&&f>0&&f<1&&G.obj[mapI(+k)])G.dmg[i]=f}
  HG.npcLoad(s.npcs);HG.progLoad(s.prog);
  if(Array.isArray(s.camps))s.camps.forEach((o,i)=>{if(G.camps[i])G.camps[i].open=!!o});
  if(Array.isArray(s.cav))s.cav.forEach((o,i)=>{if(G.caves[i])G.caves[i].vault=!!o});
  if(oldSz){                                          /* eski keşif haritası yeni ızgaraya taşınır */
   const oc=Math.ceil(oldSz/4),nc=Math.ceil(N/4),o4=off>>2,tmp=new Uint8Array(oc*oc);decExp(s.exp,tmp);
   for(let z=0;z<oc;z++)for(let x=0;x<oc;x++)if(tmp[z*oc+x])G.explore[(z+o4)*nc+x+o4]=1;
  }else decExp(s.exp,G.explore);
  G.wp=s.wp&&typeof s.wp.x==='number'&&typeof s.wp.y==='number'?{x:s.wp.x+off,y:s.wp.y+off}:null;
  look.yaw=s.yaw||0;look.pitch=0;
  G.onRaft=!!(s.rf&&HG.count('raft')&&HG.raftWater(G.px,G.py));G.raftYaw=look.yaw;
  G.slot=slotUsed&&slotUsed!=='auto'?slotUsed:null;
  if(!Array.isArray(G.inv)||G.inv.length!==SLOTS)G.inv=Array(SLOTS).fill(null);
  /* bozuk veya eski sürümden kalma kayıt: tanımsız eşya ve geçersiz sayılar temizlenir (aksi halde elde tutulan eşya hata verir) */
  G.inv=G.inv.map(x=>x&&typeof x==='object'&&HG.IT[x.id]&&x.n>0?Object.assign({id:x.id,n:Math.floor(x.n)},x.d>0&&HG.BAL.dur[x.id]?{d:Math.min(HG.BAL.dur[x.id],Math.round(x.d))}:{}):null);       /* d: alet dayanıklılığı */
  for(const [k,d] of [['hp',100],['hun',92],['thr',92],['warm',100],['clock',0],['px',0],['py',0]])if(!isFinite(G[k]))G[k]=d;
  G.sel=Math.max(0,Math.min(HG.HOT-1,G.sel|0));
  /* eski kayıt: hiç alet yoksa El Taşı verilir */
  if(!G.inv.some(x=>x&&HG.IT[x.id]&&(HG.IT[x.id].tool==='axe'||HG.IT[x.id].tool==='pick'||x.id==='rock'))&&HG.canAdd('rock',1))HG.add('rock',1);
 }else{
  ldSet(.1,'Ada üretiliyor');await nap();
  {const sd=HG.pendingSeed;HG.pendingSeed=null;newState(Number.isInteger(sd)?sd:(Math.random()*2147483647)|0)}   /* dünya kodu girildiyse aynı ada üretilir */
  if(HG.applyNewWorld)HG.applyNewWorld();                /* Dünya Oluştur penceresindeki seçenekler (js/oyun/menu.js) */
  look.yaw=0;look.pitch=-.1;
 }
 HG.extStart&&HG.extStart();
 if(HG.netBoot)HG.netBoot(s);                         /* co-op konuğu: kişisel durum sıfırlanır (js/oyun/ag-dunya.js) */
 ldSet(.35,'Harita çiziliyor');await nap();
 HG.buildMini();
 await Scene.buildAsync(G,p=>ldSet(.4+p*.45,'Sahne kuruluyor'));
 ldSet(.9,'Gölgelendiriciler derleniyor');await nap();
 Scene.warmup();
 ldSet(1,'Hazır');
 /* yükleme bitince oyun doğrudan başlar (ses, menüdeki tıklamayla zaten açılmıştır; imleç kilidi alınamazsa ilk tıklamada alınır) */
 await new Promise(r=>setTimeout(r,350));
 Scene.setMode('play');
 ui.state='play';ui.picked=null;ui.dirty=true;A.key='';A.p=0;A.mem={};A.memKey=null;
 A.nextSwing=A.nextDig=A.nextDive=0;A.hitI=-1;A.hitT=0;HG.useProg=null;HG.insaReset&&HG.insaReset();   /* sayaçlar oyun saatine bağlıdır: yeni oyun/kayıt yüklemede sıfırlanır */
 for(const id of ['#menu','#dead','#pause'])$(id).hidden=true;
 for(const id of ['#hud','#clock','#comp','#goal','#mini','#hot','#cross'])$(id).hidden=false;
 if(ui.touch)$('#touch').hidden=false;
 if(!load)HG.toast('Adaya vardın. El Taşı elinde hazır: bir ağaca bakıp sol tuşla art arda vurarak odun topla.');
 else if(G.thinInfo){HG.toast('Kayıt yeni denge ayarlarına geçirildi: kaynakların ve hayvanların bir kısmı kaldırıldı.');G.thinInfo=null}
 HG.busy=false;ldClose();
 HG.lock();
 save();
}
Object.assign(HG,{snapshotRaw,encObj,decObj,newState,saveExists,save,manualSave,startGame,ldOpen,ldSet,ldClose,listSlots,readSlot,downloadCurrent,downloadSlot,importText,renameSlot,deleteSlot,MAXSLOT});
})();
