/* Hunger 3D - inşa sistemi (Rust mantığı): İnşa Planı ile parça kurulur, Çekiç ile yükseltilir, döndürülür veya yıkılır; sağ tık basılı tutulunca radyal menü açılır.
   58. güncelleme: yeni parçalar (pencereli duvar, geçit, çit kapısı, taş/tel çit), seviye seçimi, yön, geri alma, toplu işlem, pipet, ızgara, bilgi paneli. */
(()=>{
'use strict';
const {W,T,O,G,ui,IT,count,take,gain,held,setObj,flag}=HG;
const sc=HG.sc;

/* ---- Parça kataloğu ---- */
/* Her parçanın seviyeleri: o: nesne kodu, n: seviye adı, c: gereken malzeme */
const PIECES={
 wall:{n:'Duvar',h:1.3,sp:'wallt',tiers:[
  {o:O.WALLT,n:'Çıta',c:{wood:6}},
  {o:O.WALLW,n:'Odun',c:{wood:14}},
  {o:O.WALLS,n:'Taş',c:{stone:18}},
  {o:O.WALLM,n:'Metal',c:{iron_ingot:8}}]},
 win:{n:'Pencereli duvar',h:1.3,sp:'winw',tiers:[
  {o:O.WINW,n:'Odun',c:{wood:10}},
  {o:O.WINS,n:'Taş',c:{stone:14}},
  {o:O.WINM,n:'Metal',c:{iron_ingot:6}}]},
 door:{n:'Kapı',h:1.3,sp:'door',tiers:[
  {o:O.DOOR,n:'Odun',c:{wood:8}},
  {o:O.DOORM,n:'Metal',c:{iron_ingot:6}}]},
 arch:{n:'Geçit',h:1.5,sp:'archw',tiers:[
  {o:O.ARCHW,n:'Odun',c:{wood:9}},
  {o:O.ARCHS,n:'Taş',c:{stone:12}}]},
 gate:{n:'Çit kapısı',h:.95,sp:'gate',tiers:[
  {o:O.GATE,n:'Odun',c:{wood:6}},
  {o:O.GATEM,n:'Metal',c:{iron_ingot:4}}]},
 fence:{n:'Çit',h:.85,sp:'fence',tiers:[
  {o:O.FENCE,n:'Çit',c:{wood:4}},
  {o:O.FENCES,n:'Taş',c:{stone:8}},
  {o:O.FENCEM,n:'Metal',c:{iron_ingot:3}}]}
};
const PLAN_ORDER=['wall','win','door','arch','gate','fence'];
/* Çekiç menüsü: lv: yükseltilecek seviye adı · act: next (bir üst seviye), rot (yönü çevir), down (yık) */
const HAM=[
 {n:'Odun',sp:'wallw',lv:'Odun'},
 {n:'Taş',sp:'walls',lv:'Taş'},
 {n:'Metal',sp:'wallm',lv:'Metal'},
 {n:'Sonraki',sp:'hnext',act:'next'},
 {n:'Döndür',sp:'hrot',act:'rot'},
 {n:'Yık',sp:'demo',act:'down'}
];
const FULL_T=30;                                  /* kurulumdan sonra bu süre içinde yıkılırsa malzemenin tamamı iade edilir */
const MS=[[10,15],[25,30],[50,60],[100,120],[200,250]];       /* ayakta duran parça sayısı eşikleri: [adet, XP] */
/* Nesne koduna göre parça ve seviye */
const OF={};
for(const k in PIECES)PIECES[k].tiers.forEach((t,i)=>{OF[t.o]={k,i,p:PIECES[k],t}});
const NAME_OF=id=>(IT[id]&&IT[id].n)||id;
const costText=c=>Object.keys(c).map(id=>c[id]+' '+NAME_OF(id)).join(', ');
const costRich=c=>Object.keys(c).map(id=>NAME_OF(id)+' '+Math.min(count(id),c[id])+'/'+c[id]).join(', ');
const canPay=c=>Object.keys(c).every(id=>count(id)>=c[id]);
const pay=c=>{for(const id in c)take(id,c[id])};
const sum=(a,b)=>{const o=Object.assign({},a);for(const id in b)o[id]=(o[id]||0)+b[id];return o};
/* iade: oran 0..1; geri verilen malzemeyi döner */
function refund(c,rate){
 const got={};
 for(const id in c){
  const n=Math.floor(c[id]*(rate===undefined?.5:rate));if(n<=0)continue;
  got[id]=n;
  if(HG.canAdd(id,n))gain(id,n,true);else HG.spawnDrop(id,n);
 }
 return got;
}
const kl=a=>(HG.bind&&HG.bind[a]&&HG.keyLabel)?HG.keyLabel(HG.bind[a][0]):'?';

/* ---- Kalıcı durum (kayıtla birlikte): seçili parça, seviyeler, çekiç menüsü, elle verilen yönler, sayaçlar ---- */
const DEF=()=>({sel:'wall',ts:{},hs:0,rot:{},n:{b:0,u:0,d:0,r:0,z:0},hi:0,grid:1});
let FALL=DEF();
HG.x2reg('insa',DEF,v=>{
 const o=DEF();if(!v||typeof v!=='object')return o;
 if(PIECES[v.sel])o.sel=v.sel;
 if(v.ts&&typeof v.ts==='object')for(const k in PIECES){const q=+v.ts[k];if(Number.isInteger(q)&&q>=0&&q<PIECES[k].tiers.length)o.ts[k]=q}
 if(Number.isInteger(v.hs)&&v.hs>=0&&v.hs<HAM.length)o.hs=v.hs;
 if(v.rot&&typeof v.rot==='object')for(const k in v.rot){const i=+k;if(Number.isInteger(i)&&i>=0&&i<W*HG.H&&(v.rot[k]===0||v.rot[k]===1))o.rot[k]=v.rot[k]}
 if(v.n&&typeof v.n==='object')for(const k in o.n)if(isFinite(+v.n[k])&&+v.n[k]>=0)o.n[k]=Math.floor(+v.n[k]);
 if(isFinite(+v.hi)&&+v.hi>=0)o.hi=+v.hi;
 o.grid=v.grid===0?0:1;
 return o;
});
const S2=()=>{const x=HG.X2&&HG.X2();return (x&&x.insa)||FALL};
const tierIdx=k=>{const s=S2().ts[k]|0;return Math.min(s,PIECES[k].tiers.length-1)};
const tierOf=k=>PIECES[k].tiers[tierIdx(k)];
let rotSel=null;                                 /* plan: elle seçilen yön (null: otomatik, 0: doğu-batı, 1: kuzey-güney) */
const placedAt=new Map();                        /* kare -> kurulum saati (hatasız kurulum iadesi için) */
const undoS=[];                                  /* geri alma yığını (en fazla 30 işlem) */
const pushU=f=>{undoS.push(f);if(undoS.length>30)undoS.shift()};
HG.insaRotOf=i=>S2().rot[i];

/* ---- Hedef kare ---- */
const passO=o=>o===O.DOOR||o===O.DOORM||HG.INSA_PASS(o);
/* Neden kurulamadığı: boş metin kurulabilir demektir */
function why(x,y,o){
 if(x<0||y<0||x>=W||y>=HG.H)return 'Harita dışı.';
 const i=y*W+x,t=G.tile[i];
 if(G.obj[i])return 'Bu kare dolu.';
 if(t<T.SAND||t===T.POND)return 'Suya kurulamaz.';
 if(!passO(o)){
  if(Math.floor(G.px)===x&&Math.floor(G.py)===y)return 'Üzerinde duruyorsunuz.';
  for(const a of G.animals||[])if(!a.dying&&Math.abs(a.x-x-.5)<.7&&Math.abs(a.z-y-.5)<.7)return 'Karede hayvan var.';
  for(const n of G.npcs||[])if(Math.abs(n.x-x-.5)<.7&&Math.abs(n.z-y-.5)<.7)return 'Karede köylü var.';
 }
 return '';
}
/* {x,y,r}: r boşsa kurulabilir; yoksa neden. null: hedef yok */
function planTarget(o){
 const tg=G.tg;if(!tg||tg.an)return null;
 const c=[];
 if(!G.obj[tg.y*W+tg.x])c.push([tg.x,tg.y]);
 if(tg.px>=0)c.push([tg.px,tg.py]);
 if(!c.length)return {x:tg.x,y:tg.y,r:'Buraya kurulamaz.'};
 let first=null;
 for(const [x,y] of c){const r=why(x,y,o);if(!r)return {x,y,r:''};if(!first)first={x,y,r}}
 return first;
}
function pieceAim(){
 const tg=G.tg;if(!tg||tg.an||G.head)return null;
 const i=tg.y*W+tg.x,r=OF[G.obj[i]];
 return r?{i,x:tg.x,y:tg.y,r}:null;
}
/* Otomatik yön: komşu yapıların doğrultusu (0: doğu-batı, 1: kuzey-güney) */
function autoQ(x,y){
 const C=sc.insaConn;if(!C)return 0;
 const cn=(a,b)=>a>=0&&b>=0&&a<W&&b<HG.H&&C.has(G.obj[b*W+a]);
 const ax=cn(x-1,y)||cn(x+1,y),az=cn(x,y-1)||cn(x,y+1);
 return az&&!ax?1:0;
}
/* Bağlı aynı parça bölgesi (4 komşu), en çok max kare; hedeften uzaklığa göre sıralı */
function region(i0,pred,max){
 const out=[i0],seen=new Set([i0]);
 for(let q=0;q<out.length&&out.length<max;q++){
  const c=out[q],x=c%W;
  for(const n of [x>0?c-1:-1,x<W-1?c+1:-1,c-W,c+W]){
   if(n<0||n>=W*HG.H||seen.has(n))continue;
   const r=OF[G.obj[n]];if(!r||!pred(r))continue;
   seen.add(n);out.push(n);if(out.length>=max)break;
  }
 }
 return out;
}
const bulkOn=()=>!!(HG.keyDown&&HG.keyDown('ibulk'));
/* Çekiçle seçili menü öğesinin bu parçaya etkisi: {act:'up'|'down'|'rot'|'none', t:hedef seviye, msg} */
function hamEffect(r){
 const m=HAM[S2().hs];
 if(m.act==='down')return {act:'down'};
 if(m.act==='rot')return {act:'rot'};
 if(m.act==='next'){
  if(r.i+1>=r.p.tiers.length)return {act:'none',msg:'Zaten en üst seviyede.'};
  return {act:'up',t:r.i+1};
 }
 const ti=r.p.tiers.findIndex(t=>t.n===m.lv);
 if(ti<0)return {act:'none',msg:r.p.n+' için '+m.n+' seviyesi yok.'};
 if(ti===r.i)return {act:'none',msg:'Zaten '+m.n+' seviyesinde.'};
 if(ti<r.i)return {act:'none',msg:'Yalnızca yükseltme yapılabilir; sökmek için Yık seçin.'};
 return {act:'up',t:ti};
}

/* ---- Efektler ve sayaçlar ---- */
const DUST={Odun:0xcdb48a,'Çıta':0xcdb48a,'Çit':0xcdb48a,'Taş':0xb9b9c1,Metal:0xc4cad2};
function fx(i,t,n,up){
 if(!sc.insaDust)return;
 sc.insaDust(i%W+.5,((i/W)|0)+.5,DUST[t.n],n,up);
}
function milestones(){
 let n=0;for(let i=0;i<G.obj.length;i++)if(OF[G.obj[i]])n++;
 const s=S2();
 for(const m of MS)if(n>=m[0]&&s.hi<m[0]){
  s.hi=m[0];HG.toast('İnşaat ustası: '+m[0]+' parça ayakta.');
  if(HG.xpGain)HG.xpGain(m[1]);if(HG.feed)HG.feed('İnşa: '+m[0]+' parça');flag('build'+m[0]);
 }
 return n;
}
let shW=null;                                     /* barınak durumu değişimi izleme */
const watchShelter=()=>{G.shelterCheck=0;shW={t:1.2,prev:!!G.sheltered}};
const tflag=t=>{flag('built');if(t.n==='Taş')flag('built_stone');if(t.n==='Metal')flag('built_metal')};

/* ---- Eylemler ---- */
let nextI=0;
const cooling=()=>{if(nextI>G.clock+1)nextI=0;return G.clock<nextI};   /* oyun saati sıfırlanırsa (yeni oyun/yükleme) eski bekleme geçersiz sayılır */
function setRot(i,q){
 const s=S2();if(q===null||q===undefined)delete s.rot[i];else s.rot[i]=q;
}
function touch(i){(G.oc||(G.oc=[])).push(i)}       /* sahneyi bu kareyi yeniden kurmaya zorlar */
let lastPlaced=-1;
function insaPlace(){
 if(ui.state!=='play'||cooling())return false;
 const k=S2().sel,p=PIECES[k],t=tierOf(k);
 if(G.head){HG.toast('Su altında inşa edilemez.');return false}
 const pos=planTarget(t.o);
 if(!pos){HG.toast('Buraya kurulamaz.');return false}
 if(pos.r){HG.toast(pos.r);return false}
 if(!canPay(t.c)){HG.toast('Yetersiz malzeme: '+costRich(t.c)+'.');return false}
 nextI=G.clock+.2;
 const i=pos.y*W+pos.x,paid=Object.assign({},t.c),rot0=rotSel;
 pay(paid);setRot(i,rot0);setObj(i,t.o);placedAt.set(i,G.clock);lastPlaced=i;
 tflag(t);S2().n.b++;watchShelter();
 if(sc.insaPop)sc.insaPop(i);fx(i,t,7);
 pushU(()=>{
  if(G.obj[i]!==t.o){HG.toast('Parça değişmiş; geri alınamadı.');return false}
  refund(paid,1);setRot(i,null);setObj(i,O.NONE);placedAt.delete(i);watchShelter();fx(i,t,5,true);return true;
 });
 HG.armSwing(.3);HG.snd('craft');ui.dirty=true;
 milestones();
 return true;
}
/* Bir kareyi bir üst seviyeye çıkarır; bedeli ödenir. Geri alma kaydı için {i,from,to,cost} döner */
function upgradeCell(i,nt){
 const r=OF[G.obj[i]],from=G.obj[i];
 pay(nt.c);setObj(i,nt.o);placedAt.delete(i);
 if(sc.insaPop)sc.insaPop(i);fx(i,nt,6);tflag(nt);
 return {i,from,to:nt.o,cost:Object.assign({},nt.c)};
}
function insaHammer(){
 if(ui.state!=='play'||cooling())return false;
 const a=pieceAim();
 if(!a){HG.toast('Çekiç yalnızca kurulu inşa parçaları üzerinde kullanılır.');return false}
 const e=hamEffect(a.r),bulk=bulkOn();
 if(e.act==='none'){HG.toast(e.msg);return false}
 nextI=G.clock+.35;
 const s=S2();
 if(e.act==='rot'){
  const cells=bulk?region(a.i,r=>r.p===a.r.p,40):[a.i],undo=[];
  const ey=sc.structAt&&sc.structAt(a.i),cur=ey&&ey.objs[0]?(Math.round(ey.objs[0].rotation.y/(Math.PI/2))%2+2)%2:0,nq=cur?0:1;
  for(const i of cells){undo.push([i,s.rot[i]]);setRot(i,nq);touch(i)}
  s.n.r+=cells.length;
  pushU(()=>{for(const [i,q] of undo){if(!OF[G.obj[i]])continue;setRot(i,q);touch(i)}return true});
  HG.toast((cells.length>1?cells.length+' parça ':'')+(nq?'kuzey-güney':'doğu-batı')+' yönüne çevrildi.');
  HG.armSwing(.3);HG.snd('craft');return true;
 }
 if(e.act==='down'){
  const cells=bulk?region(a.i,r=>r.p===a.r.p&&r.i===a.r.i,40):[a.i],ups=[];
  for(const i of cells){
   const r=OF[G.obj[i]],full=placedAt.has(i)&&G.clock-placedAt.get(i)<=FULL_T;
   const got=refund(r.t.c,full?1:.5);
   ups.push({i,o:G.obj[i],got,rot:s.rot[i],t:r.t});
   setRot(i,null);setObj(i,O.NONE);placedAt.delete(i);fx(i,r.t,6,true);
  }
  s.n.d+=cells.length;watchShelter();
  pushU(()=>{
   let ok=0;
   for(const u of ups){
    if(G.obj[u.i]||!canPay(u.got))continue;
    pay(u.got);setRot(u.i,u.rot);setObj(u.i,u.o);ok++;if(sc.insaPop)sc.insaPop(u.i);
   }
   if(ok<ups.length)HG.toast(ok?ok+' parça geri getirildi; kalanlar için malzeme veya yer yok.':'Geri alınamadı: iade edilen malzeme gerekli.');
   if(ok)watchShelter();
   return ok>0;
  });
  if(cells.length>1)HG.toast(cells.length+' parça yıkıldı.');
  HG.armSwing(.36);HG.snd('hit');ui.dirty=true;
  return true;
 }
 /* yükseltme */
 const cells=bulk?region(a.i,r=>r.p===a.r.p&&r.i<e.t,40):[a.i],done=[];
 for(const i of cells){
  const r=OF[G.obj[i]],ti=Math.min(e.t,r.p.tiers.length-1);if(ti<=r.i)continue;
  const nt=r.p.tiers[ti];
  if(!canPay(nt.c)){
   if(!done.length){HG.toast('Yetersiz malzeme: '+costRich(nt.c)+'.');return false}
   break;
  }
  done.push(upgradeCell(i,nt));
 }
 if(!done.length){HG.toast('Yükseltilecek parça yok.');return false}
 s.n.u+=done.length;watchShelter();
 pushU(()=>{
  let ok=0;
  for(const d of done){
   if(G.obj[d.i]!==d.to)continue;
   refund(d.cost,1);setObj(d.i,d.from);ok++;
  }
  if(ok)watchShelter();
  return ok>0;
 });
 if(cells.length>1)HG.toast(done.length+'/'+cells.length+' parça yükseltildi.');
 milestones();
 HG.armSwing(.36);HG.snd('craft');ui.dirty=true;
 return true;
}
/* Geri al: son inşa işlemi (kurma, yükseltme, yıkma, döndürme), malzeme iadesiyle */
function insaUndo(){
 if(ui.state!=='play')return false;
 const u=undoS.pop();
 if(!u){HG.toast('Geri alınacak inşa işlemi yok.');return false}
 const ok=u();
 if(ok){S2().n.z++;HG.snd('ui');HG.toast('Geri alındı. ('+undoS.length+' işlem daha)');ui.dirty=true}
 return ok;
}
/* Pipet: bakılan parçanın türünü ve seviyesini plana alır */
function insaPick(){
 const a=pieceAim();
 if(!a){HG.toast('Pipet için kurulu bir parçaya bakın.');return false}
 const s=S2();s.sel=a.r.k;s.ts[a.r.k]=a.r.i;
 const q=s.rot[a.i];rotSel=(q===0||q===1)?q:null;
 HG.snd('ui');HG.toast('Plan: '+a.r.p.n+' · '+a.r.t.n+' seçildi.');return true;
}
function rotName(){return rotSel===null?'otomatik':rotSel?'kuzey-güney':'doğu-batı'}
function selText(){
 const h=held();
 if(h&&h.it.tool==='hammer'){
  const m=HAM[S2().hs];
  return 'Çekiç: '+m.n+(m.lv?' seviyesine yükselt':m.act==='next'?' (bir üst seviye)':m.act==='rot'?' (yönü çevir)':' (söküm, %50 iade)');
 }
 const k=S2().sel,p=PIECES[k],t=tierOf(k);
 return 'Plan: '+p.n+' · '+t.n+' · '+costText(t.c)+' · yön: '+rotName();
}
function insaCycle(){
 const h=held();if(!h)return;
 const s=S2();
 if(h.it.tool==='hammer')s.hs=(s.hs+1)%HAM.length;
 else{s.sel=PLAN_ORDER[(PLAN_ORDER.indexOf(s.sel)+1)%PLAN_ORDER.length];rotSel=null}
 HG.snd('ui');HG.toast(selText());
}
/* Seviye seçimi: plan elde iken kurulacak seviye (dir: +1/-1) */
function insaTier(dir){
 const h=held();if(!h||h.it.tool!=='plan')return false;
 const s=S2(),k=s.sel,n=PIECES[k].tiers.length;
 s.ts[k]=((tierIdx(k)+(dir||1))%n+n)%n;
 HG.snd('ui');HG.toast(selText());return true;
}
function insaRot(){
 const h=held();if(!h)return false;
 if(h.it.tool==='plan'){rotSel=rotSel===null?0:rotSel===0?1:null;HG.snd('ui');HG.toast('Yön: '+rotName()+'.');return true}
 const a=pieceAim();if(!a){HG.toast('Yönü çevirmek için kurulu bir parçaya bakın.');return false}
 const s=S2(),hs=s.hs;s.hs=HAM.findIndex(m=>m.act==='rot');
 const r=insaHammer();s.hs=hs;return r;
}
/* Tekerlek: Ctrl = parça / menü öğesi, Shift = seviye */
function insaWheel(dir,tier){
 const h=held();if(!h||(h.it.tool!=='plan'&&h.it.tool!=='hammer'))return false;
 if(tier&&h.it.tool==='plan')return insaTier(dir);
 const s=S2();
 if(h.it.tool==='hammer')s.hs=((s.hs+dir)%HAM.length+HAM.length)%HAM.length;
 else{s.sel=PLAN_ORDER[((PLAN_ORDER.indexOf(s.sel)+dir)%PLAN_ORDER.length+PLAN_ORDER.length)%PLAN_ORDER.length];rotSel=null}
 HG.snd('ui');HG.toast(selText());return true;
}
function insaGrid(){const s=S2();s.grid=s.grid?0:1;HG.snd('ui');HG.toast('İnşa ızgarası '+(s.grid?'açık':'kapalı')+'.');return true}
/* Tuş kısayolları (giris.js keydown'dan çağrılır); true: tuş kullanıldı */
function insaKey(code){
 const K=HG.keyIs;if(!K)return false;
 if(K('iinfo',code)){toggleInfo();return true}
 const h=held(),tool=h&&h.it.tool,on=tool==='plan'||tool==='hammer';
 if(!on)return false;
 if(K('itier',code))return insaTier(1)||(tool==='hammer'&&(insaCycle(),true));
 if(K('irot',code))return insaRot();
 if(K('iundo',code))return insaUndo();
 if(K('ipick',code))return insaPick();
 if(K('igrid',code))return insaGrid();
 return false;
}
/* Nişan ipucu: İnşa Planı veya Çekiç elde iken */
function insaAction(tg){
 const h=held();if(!h)return null;
 if(h.it.tool==='plan'){
  const k=S2().sel,p=PIECES[k],t=tierOf(k),pos=planTarget(t.o);
  const nm='İnşa Planı · '+p.n+' ('+t.n+')';
  if(pos&&pos.r)return {hint:pos.r,name:nm};
  const nb=pos&&sc.insaConn&&(passO(t.o)||k==='win'||k==='arch')&&![[-1,0],[1,0],[0,-1],[0,1]].some(d=>{const xx=pos.x+d[0],zz=pos.y+d[1];return xx>=0&&zz>=0&&xx<W&&zz<HG.H&&sc.insaConn.has(G.obj[zz*W+xx])});
  return {hint:(nb?'Yanında duvar yok · ':'')+'Sol tık: kur · '+costRich(t.c)+' · ['+kl('itier')+'] seviye · ['+kl('irot')+'] yön',name:nm};
 }
 const a=pieceAim();
 const s=S2();
 if(!a)return {hint:'Sağ tık basılı: seçim · '+HAM[s.hs].n,name:'Çekiç'};
 const e=hamEffect(a.r),bulk=bulkOn();
 const nm=a.r.p.n+' ('+a.r.t.n+')';
 const bt=bulk?' · toplu':'';
 if(e.act==='down'){
  const full=placedAt.has(a.i)&&G.clock-placedAt.get(a.i)<=FULL_T;
  return {hint:'Sol tık: yık ('+(full?'%100':'%50')+' iade)'+bt+' · ['+kl('ibulk')+'] toplu',name:nm};
 }
 if(e.act==='rot')return {hint:'Sol tık: yönü çevir'+bt+' · ['+kl('ibulk')+'] toplu',name:nm};
 if(e.act==='up')return {hint:'Sol tık: '+a.r.p.tiers[e.t].n+' seviyesine yükselt · '+costRich(a.r.p.tiers[e.t].c)+bt+' · ['+kl('ibulk')+'] toplu',name:nm};
 return {hint:e.msg,name:nm};
}
/* Yerleştirme gölgesi: {x,y,ok,h,hammer,warn,thin,rot,grid} */
function insaGhost(k){
 const h=held();if(!h)return null;
 const s=S2();
 if(h.it.tool==='plan'){
  const pk=s.sel,p=PIECES[pk],t=tierOf(pk),pos=planTarget(t.o);
  if(pos&&!pos.r){const q=rotSel===null?autoQ(pos.x,pos.y):rotSel,ok=canPay(t.c);return {x:pos.x,y:pos.y,ok,warn:!ok,h:p.h,thin:true,rot:q,grid:!!s.grid}}
  const tg=G.tg;if(tg&&!tg.an)return {x:tg.x,y:tg.y,ok:false,h:p.h,thin:true,rot:rotSel===null?autoQ(tg.x,tg.y):rotSel,grid:!!s.grid};
  return null;
 }
 const a=pieceAim();if(!a)return null;
 const e=hamEffect(a.r),h2=a.r.p.h,rq=(()=>{const ey=sc.structAt&&sc.structAt(a.i);return ey&&ey.objs[0]?(Math.round(ey.objs[0].rotation.y/(Math.PI/2))%2+2)%2:0})();
 if(e.act==='none')return {x:a.x,y:a.y,ok:false,hammer:true,h:h2,thin:true,rot:rq};
 if(e.act==='up'&&!canPay(a.r.p.tiers[e.t].c))return {x:a.x,y:a.y,ok:false,warn:true,hammer:true,h:h2,thin:true,rot:rq};
 return {x:a.x,y:a.y,ok:true,hammer:true,h:h2,thin:true,rot:rq};
}

/* ---- Her karede: sürükleyerek kurma, barınak bildirimi, bilgi paneli ---- */
let holdT=0,infoEl=null,infoOn=false,infoT=0;
function updateInsa(dt){
 if(ui.state!=='play'){holdT=0;return}
 const h=held();
 if(h&&h.it.tool==='plan'&&HG.inp.mouseDown&&!(HG.radialOn&&HG.radialOn())){
  holdT+=dt;
  const tg=G.tg;
  /* basılı tutup bakışı süpürürken yeni boş karelere kurar (yalnızca bakılan kare boşsa) */
  if(holdT>.28&&tg&&!tg.an&&!G.obj[tg.y*W+tg.x]&&tg.y*W+tg.x!==lastPlaced)insaPlace();
 }else holdT=0;
 if(shW){
  shW.t-=dt;
  if(!!G.sheltered!==shW.prev){HG.toast(G.sheltered?'Kapalı alan: barınak sağlandı.':'Barınak bozuldu.');shW=null}
  else if(shW.t<=0)shW=null;
 }
 if(infoOn){infoT-=dt;if(infoT<=0){infoT=1;renderInfo()}}
}
function counts(){
 const c={};let tot=0;
 for(let i=0;i<G.obj.length;i++){const r=OF[G.obj[i]];if(r){tot++;(c[r.k]||(c[r.k]=[]))[r.i]=((c[r.k]||[])[r.i]||0)+1}}
 return {c,tot};
}
function renderInfo(){
 if(!infoEl)return;
 const {c,tot}=counts(),s=S2();
 let h='<b>İnşa bilgisi</b><div class="ii">Ayakta: <b>'+tot+'</b> parça</div>';
 for(const k of PLAN_ORDER){
  const a=c[k];if(!a)continue;
  h+='<div class="ir"><span>'+PIECES[k].n+'</span><i>'+PIECES[k].tiers.map((t,i)=>a[i]?t.n+' '+a[i]:'').filter(Boolean).join(' · ')+'</i></div>';
 }
 h+='<div class="ii">Kurulan '+s.n.b+' · Yükseltilen '+s.n.u+' · Yıkılan '+s.n.d+' · Çevrilen '+s.n.r+' · Geri alınan '+s.n.z+'</div>';
 h+='<div class="ik"><kbd>'+kl('itier')+'</kbd> seviye · <kbd>'+kl('irot')+'</kbd> yön · <kbd>'+kl('ibulk')+'</kbd> toplu (basılı) · <kbd>'+kl('iundo')+'</kbd> geri al · <kbd>'+kl('ipick')+'</kbd> pipet · <kbd>'+kl('igrid')+'</kbd> ızgara · <kbd>'+kl('iinfo')+'</kbd> bu panel<br>Ctrl+tekerlek: parça · Shift+tekerlek: seviye · Sağ tık basılı: radyal menü · Tutarak süpür: sürekli kur</div>';
 infoEl.innerHTML=h;
}
function toggleInfo(){
 if(!infoEl){
  infoEl=document.createElement('div');infoEl.id='insainfo';infoEl.hidden=true;
  (document.getElementById('game')||document.body).appendChild(infoEl);
 }
 infoOn=!infoOn;infoEl.hidden=!infoOn;infoT=0;
 if(infoOn)renderInfo();
 HG.snd('ui');
}

/* ---- Radyal menü: sağ tık basılı tutulur, fare hareketiyle parça seçilir; kısa tık seçimi sıradakine geçirir ---- */
let rEl=null,rItems=[],rOn=false,rShow=false,rT0=0,rx=0,ry=0,rPick=-1,rShowT=0,rList=[],rKind='';
const ICO={};
function ico(sp){
 if(!HG.SP||!HG.SP[sp])return '';
 return ICO[sp]||(ICO[sp]=HG.SP[sp].toDataURL());
}
function listFor(h){
 if(h.it.tool==='hammer')return HAM.map((m,i)=>{
  let sub=m.lv?'Yükselt':m.act==='next'?'Bir üst seviye':m.act==='rot'?'Yönü çevir':'%50 iade';
  return {n:m.n,sp:m.sp,sub,i};
 });
 return PLAN_ORDER.map((k,i)=>{const t=tierOf(k);return {n:PIECES[k].n,sp:PIECES[k].sp,sub:t.n+' · '+costText(t.c),i,k,no:!canPay(t.c)}});
}
function build(h){
 if(!rEl){
  rEl=document.createElement('div');rEl.id='radial';rEl.hidden=true;
  (document.getElementById('game')||document.body).appendChild(rEl);
 }
 rList=listFor(h);rKind=h.it.tool;
 const N=rList.length,R=104;
 rEl.innerHTML='<div class="rctr"><b></b><span></span></div>'+rList.map((e,j)=>{
  const a=-Math.PI/2+j*2*Math.PI/N;
  return '<div class="rs'+(e.no?' no':'')+'" data-i="'+j+'" style="left:calc(50% + '+Math.round(Math.cos(a)*R)+'px);top:calc(50% + '+Math.round(Math.sin(a)*R)+'px)"><img src="'+ico(e.sp)+'" alt=""><i>'+e.n+'</i><u>'+e.sub+'</u></div>';
 }).join('');
 rItems=[...rEl.querySelectorAll('.rs')];
}
function curIndex(h){return h.it.tool==='hammer'?S2().hs:PLAN_ORDER.indexOf(S2().sel)}
function paint(){
 if(!rEl)return;
 const cur=rPick>=0?rPick:curIndex(held()||{it:{}});
 rItems.forEach((el,j)=>el.classList.toggle('on',j===cur));
 const e=rList[cur];
 if(e){rEl.querySelector('.rctr b').textContent=e.n;rEl.querySelector('.rctr span').textContent=e.sub}
}
function radialOpen(){
 if(rOn)return true;
 const h=held();
 if(ui.state!=='play'||!h||(h.it.tool!=='plan'&&h.it.tool!=='hammer'))return false;
 build(h);rOn=true;rShow=false;rx=ry=0;rPick=-1;rT0=performance.now();
 clearTimeout(rShowT);
 rShowT=setTimeout(()=>{if(rOn){rShow=true;rEl.hidden=false;paint()}},170);
 return true;
}
function radialOn(){return rOn}
function radialMove(dx,dy){
 if(!rOn)return;
 rx+=dx;ry+=dy;const l=Math.hypot(rx,ry),M=90;
 if(l>M){rx*=M/l;ry*=M/l}
 if(l>=26){
  const N=rList.length;
  let a=Math.atan2(ry,rx)+Math.PI/2;if(a<0)a+=Math.PI*2;
  rPick=Math.round(a/(Math.PI*2/N))%N;
  rShowNow();
 }
 paint();
}
function rShowNow(){if(!rShow){rShow=true;clearTimeout(rShowT);rEl.hidden=false}}
function radialClose(commit){
 if(!rOn)return;
 const h=held(),quick=performance.now()-rT0<260;
 rOn=false;clearTimeout(rShowT);
 if(rEl)rEl.hidden=true;
 const pick=rPick;rPick=-1;rShow=false;
 if(!commit||!h||h.it.tool!==rKind)return;                 /* menü açıkken eşya değiştiyse seçim uygulanmaz */
 if(pick>=0){
  if(h.it.tool==='hammer')S2().hs=pick;else{S2().sel=PLAN_ORDER[pick];rotSel=null}
  HG.snd('ui');HG.toast(selText());
 }else if(quick)insaCycle();
}
/* Kilit kalkarsa veya pencere odağı giderse menü kapanır */
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)radialClose(false)});
addEventListener('blur',()=>radialClose(false));

function insaReset(){nextI=0;undoS.length=0;placedAt.clear();rotSel=null;lastPlaced=-1;shW=null;holdT=0;if(infoEl){infoEl.hidden=true;infoOn=false}FALL=DEF();rOn=false;rPick=-1;clearTimeout(rShowT);if(rEl)rEl.hidden=true}
Object.assign(HG,{insaReset,insaPlace,insaHammer,insaCycle,insaAction,insaGhost,radialOpen,radialClose,radialOn,radialMove,insaUndo,insaPick,insaTier,insaRot,insaWheel,insaKey,insaGrid,updateInsa,INSA:{PIECES,HAM,OF,region}});
})();
