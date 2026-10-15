/* Hunger 3D - inşa sistemi (Rust mantığı): İnşa Planı ile parça kurulur, Çekiç ile yükseltilir veya yıkılır; sağ tık basılı tutulunca radyal menü açılır */
(()=>{
'use strict';
const {W,T,O,G,ui,IT,count,take,gain,held,setObj,flag}=HG;

/* ---- Parça kataloğu ---- */
/* Her parçanın seviyeleri: o: nesne kodu, n: seviye adı, c: gereken malzeme */
const PIECES={
 wall:{n:'Duvar',h:1.3,sp:'wallt',tiers:[
  {o:O.WALLT,n:'Çıta',c:{wood:6}},
  {o:O.WALLW,n:'Odun',c:{wood:14}},
  {o:O.WALLS,n:'Taş',c:{stone:18}},
  {o:O.WALLM,n:'Metal',c:{iron_ingot:8}}]},
 door:{n:'Kapı',h:1.3,sp:'door',tiers:[
  {o:O.DOOR,n:'Odun',c:{wood:8}},
  {o:O.DOORM,n:'Metal',c:{iron_ingot:6}}]},
 fence:{n:'Çit',h:.85,sp:'fence',tiers:[
  {o:O.FENCE,n:'Çit',c:{wood:4}}]}
};
const PLAN_ORDER=['wall','door','fence'];
/* Çekiç menüsü: yükseltilecek seviye (seviye adına göre) veya yıkma */
const HAM=[
 {n:'Odun',sp:'wallw',lv:'Odun'},
 {n:'Taş',sp:'walls',lv:'Taş'},
 {n:'Metal',sp:'wallm',lv:'Metal'},
 {n:'Yık',sp:'demo',lv:null}
];
/* Nesne koduna göre parça ve seviye */
const OF={};
for(const k in PIECES)PIECES[k].tiers.forEach((t,i)=>{OF[t.o]={k,i,p:PIECES[k],t}});
const NAME_OF=id=>(IT[id]&&IT[id].n)||id;
const costText=c=>Object.keys(c).map(id=>c[id]+' '+NAME_OF(id)).join(', ');
const canPay=c=>Object.keys(c).every(id=>count(id)>=c[id]);
const pay=c=>{for(const id in c)take(id,c[id])};
function refund(c){
 for(const id in c){
  const n=Math.floor(c[id]*.5);if(n<=0)continue;
  if(HG.canAdd(id,n))gain(id,n,true);else HG.spawnDrop(id,n);
 }
}
let sel='wall',hsel=0;                          /* plan: seçili parça · çekiç: seçili menü sırası */

/* ---- Hedef kare ---- */
function okTile(x,y,o){
 if(x<0||y<0||x>=W||y>=HG.H)return false;
 const i=y*W+x,t=G.tile[i];
 if(G.obj[i]||t<T.SAND||t===T.POND)return false;
 if(o!==O.DOOR&&o!==O.DOORM&&Math.floor(G.px)===x&&Math.floor(G.py)===y)return false;
 return true;
}
function planTarget(o){
 const tg=G.tg;if(!tg||tg.an)return null;
 if(!G.obj[tg.y*W+tg.x]&&okTile(tg.x,tg.y,o))return {x:tg.x,y:tg.y};
 if(tg.px>=0&&okTile(tg.px,tg.py,o))return {x:tg.px,y:tg.py};
 return null;
}
function pieceAim(){
 const tg=G.tg;if(!tg||tg.an||G.head)return null;
 const i=tg.y*W+tg.x,r=OF[G.obj[i]];
 return r?{i,x:tg.x,y:tg.y,r}:null;
}
/* Çekiçle seçili menü öğesinin bu parçaya etkisi: {act:'up'|'down'|'none', t:hedef seviye, msg} */
function hamEffect(r){
 const m=HAM[hsel];
 if(!m.lv)return {act:'down'};
 const ti=r.p.tiers.findIndex(t=>t.n===m.lv);
 if(ti<0)return {act:'none',msg:r.p.n+' için '+m.n+' seviyesi yok.'};
 if(ti===r.i)return {act:'none',msg:'Zaten '+m.n+' seviyesinde.'};
 if(ti<r.i)return {act:'none',msg:'Yalnızca yükseltme yapılabilir; sökmek için Yık seçin.'};
 return {act:'up',t:ti};
}

/* ---- Eylemler ---- */
let nextI=0;
const cooling=()=>{if(nextI>G.clock+1)nextI=0;return G.clock<nextI};   /* oyun saati sıfırlanırsa (yeni oyun/yükleme) eski bekleme geçersiz sayılır */
function insaPlace(){
 if(ui.state!=='play'||cooling())return false;
 const p=PIECES[sel],t=p.tiers[0];
 if(G.head){HG.toast('Su altında inşa edilemez.');return false}
 const pos=planTarget(t.o);
 if(!pos){HG.toast('Buraya kurulamaz.');return false}
 if(!canPay(t.c)){HG.toast('Yetersiz malzeme: '+costText(t.c)+' gerekir.');return false}
 nextI=G.clock+.25;
 pay(t.c);setObj(pos.y*W+pos.x,t.o);flag('built');G.shelterCheck=0;
 HG.armSwing(.3);HG.snd('craft');ui.dirty=true;
 return true;
}
function insaHammer(){
 if(ui.state!=='play'||cooling())return false;
 const a=pieceAim();
 if(!a){HG.toast('Çekiç yalnızca kurulu duvar, kapı ve çit üzerinde kullanılır.');return false}
 const e=hamEffect(a.r);
 if(e.act==='none'){HG.toast(e.msg);return false}
 nextI=G.clock+.35;
 if(e.act==='down'){
  refund(a.r.t.c);setObj(a.i,O.NONE);G.shelterCheck=0;
  HG.armSwing(.36);HG.snd('hit');ui.dirty=true;
  return true;
 }
 const nt=a.r.p.tiers[e.t];
 if(!canPay(nt.c)){HG.toast('Yetersiz malzeme: '+costText(nt.c)+' gerekir.');return false}
 pay(nt.c);setObj(a.i,nt.o);G.shelterCheck=0;
 HG.armSwing(.36);HG.snd('craft');ui.dirty=true;
 return true;
}
function selText(){
 const h=held();
 if(h&&h.it.tool==='hammer'){const m=HAM[hsel];return 'Çekiç: '+m.n+(m.lv?' seviyesine yükselt':' (söküm, %50 iade)')}
 const p=PIECES[sel],t=p.tiers[0];
 return 'Plan: '+p.n+(t.n!==p.n?' ('+t.n+')':'')+' · '+costText(t.c);
}
function insaCycle(){
 const h=held();if(!h)return;
 if(h.it.tool==='hammer')hsel=(hsel+1)%HAM.length;
 else sel=PLAN_ORDER[(PLAN_ORDER.indexOf(sel)+1)%PLAN_ORDER.length];
 HG.snd('ui');HG.toast(selText());
}
/* Nişan ipucu: İnşa Planı veya Çekiç elde iken */
function insaAction(tg){
 const h=held();if(!h)return null;
 if(h.it.tool==='plan'){
  const p=PIECES[sel],t=p.tiers[0];
  return {hint:'Sol tık: kur · '+costText(t.c)+' · sağ tık basılı: parça seç',name:'İnşa Planı · '+p.n};
 }
 const a=pieceAim();
 if(!a)return {hint:'Sağ tık basılı: seçim · '+HAM[hsel].n,name:'Çekiç'};
 const e=hamEffect(a.r);
 const nm=a.r.p.n+(a.r.t.n!==a.r.p.n?' ('+a.r.t.n+')':'');
 if(e.act==='down')return {hint:'Sol tık: yık (%50 iade)',name:nm};
 if(e.act==='up')return {hint:'Sol tık: '+HAM[hsel].n+' seviyesine yükselt · '+costText(a.r.p.tiers[e.t].c),name:nm};
 return {hint:e.msg,name:nm};
}
/* Yerleştirme gölgesi: {x,y,ok,h,hammer,warn} */
function insaGhost(k){
 const h=held();if(!h)return null;
 if(h.it.tool==='plan'){
  const p=PIECES[sel],t=p.tiers[0],pos=planTarget(t.o);
  if(pos)return {x:pos.x,y:pos.y,ok:canPay(t.c),warn:!canPay(t.c),h:p.h};
  const tg=G.tg;if(tg&&!tg.an)return {x:tg.x,y:tg.y,ok:false,h:p.h};
  return null;
 }
 const a=pieceAim();if(!a)return null;
 const e=hamEffect(a.r),h2=a.r.p.h;
 if(e.act==='none')return {x:a.x,y:a.y,ok:false,hammer:true,h:h2};
 if(e.act==='up'&&!canPay(a.r.p.tiers[e.t].c))return {x:a.x,y:a.y,ok:false,warn:true,hammer:true,h:h2};
 return {x:a.x,y:a.y,ok:true,hammer:true,h:h2};
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
  let sub=m.lv?'Yükselt':'%50 iade';
  return {n:m.n,sp:m.sp,sub,i};
 });
 return PLAN_ORDER.map((k,i)=>({n:PIECES[k].n,sp:PIECES[k].sp,sub:costText(PIECES[k].tiers[0].c),i,k}));
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
  return '<div class="rs" data-i="'+j+'" style="left:calc(50% + '+Math.round(Math.cos(a)*R)+'px);top:calc(50% + '+Math.round(Math.sin(a)*R)+'px)"><img src="'+ico(e.sp)+'" alt=""><i>'+e.n+'</i><u>'+e.sub+'</u></div>';
 }).join('');
 rItems=[...rEl.querySelectorAll('.rs')];
}
function curIndex(h){return h.it.tool==='hammer'?hsel:PLAN_ORDER.indexOf(sel)}
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
  if(h.it.tool==='hammer')hsel=pick;else sel=PLAN_ORDER[pick];
  HG.snd('ui');HG.toast(selText());
 }else if(quick)insaCycle();
}
/* Kilit kalkarsa veya pencere odağı giderse menü kapanır */
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)radialClose(false)});
addEventListener('blur',()=>radialClose(false));

function insaReset(){nextI=0;rOn=false;rPick=-1;clearTimeout(rShowT);if(rEl)rEl.hidden=true}
Object.assign(HG,{insaReset,insaPlace,insaHammer,insaCycle,insaAction,insaGhost,radialOpen,radialClose,radialOn,radialMove,INSA:{PIECES,HAM,OF}});
})();
