/* Hunger 3D - Rust tarzı inşa sistemi (60. güncelleme)
   3 m'lik ızgara: Temel (yalnızca zemin), Zemin (kat), Duvar, Kapı Çerçevesi, Pencereli Duvar, Yarım Duvar, Alçak Duvar, Merdiven.
   Parçalar yapışma noktalarına oturur (kenar/hücre). Çıta olarak kurulur, Çekiç ile Odun/Taş/Metal/Zırhlı'ya yükseltilir.
   Denge (stabilite), kat çökmesi, kapı takma, 10 dakikalık yıkma süresi, çarpışma ve barınak hesabı bu dosyadadır.
   Eski kare tabanlı parçalar (insa.js) yalnızca eski kayıtlar için korunur; çekiçle sökülebilir. */
(()=>{
'use strict';
const {W,T,O,G,ui,IT,count,take,gain,held,flag}=HG;
const S=HG.Scene,sc=HG.sc;
const CS=3,LH=3,STEP=.42,KEY=512;
const F=0,FL=1,WL=2,DW=3,WN=4,HF=5,LW=6,ST=7;
const TNAME=['Temel','Zemin','Duvar','Kapı Çerçevesi','Pencereli Duvar','Yarım Duvar','Alçak Duvar','Merdiven'];
const TIER=['Çıta','Odun','Taş','Metal','Zırhlı'];
const TCOL=['#cdb48a','#c8935a','#b9b9c1','#c4cad2','#7f8791'];
const BASE=[{wood:5},{wood:20},{stone:30},{iron_ingot:12},{iron_ingot:16,copper_ingot:8}];
const MUL=[1.5,1,1,.75,.75,.5,.35,1];
const DEMO_T=600,MINSTAB=.05;
const PLAN_ORDER=[F,FL,WL,DW,WN,HF,LW,ST];
const SPR=['rs_found','rs_floor','rs_wall','rs_door','rs_win','rs_half','rs_low','rs_stairs'];
const HAMM=[
 {n:'Odun',sp:'rs_t1',tr:1},{n:'Taş',sp:'rs_t2',tr:2},{n:'Metal',sp:'rs_t3',tr:3},{n:'Zırhlı',sp:'rs_t4',tr:4},
 {n:'Döndür',sp:'hrot',act:'rot'},{n:'Yık',sp:'demo',act:'down'}
];
const DOORS={door:1,mdoor:2,adoor:3};
const DNAME=['','Tahta kapı','Metal kapı','Zırhlı kapı'];

const NAME_OF=id=>(IT[id]&&IT[id].n)||id;
const costOf=(t,tr)=>{const o={},b=BASE[tr];for(const id in b)o[id]=Math.max(1,Math.ceil(b[id]*MUL[t]));return o};
const costText=c=>Object.keys(c).map(id=>c[id]+' '+NAME_OF(id)).join(', ');
const costRich=c=>Object.keys(c).map(id=>NAME_OF(id)+' '+Math.min(count(id),c[id])+'/'+c[id]).join(', ');
const canPay=c=>Object.keys(c).every(id=>count(id)>=c[id]);
const pay=c=>{for(const id in c)take(id,c[id])};
function refund(c,rate){
 for(const id in c){
  const n=Math.floor(c[id]*rate);if(n<=0)continue;
  if(HG.canAdd(id,n))gain(id,n,true);else HG.spawnDrop(id,n);
 }
}
const kl=a=>(HG.bind&&HG.bind[a]&&HG.keyLabel)?HG.keyLabel(HG.bind[a][0]):'?';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- Kalıcı durum ---------- */
const DEF=()=>({p:[],sel:0,hs:0});
let FALL=DEF();
HG.x2reg('rs',DEF,v=>{
 const o=DEF();if(!v||typeof v!=='object')return o;
 if(Number.isInteger(v.sel)&&v.sel>=0&&v.sel<8)o.sel=v.sel;
 if(Number.isInteger(v.hs)&&v.hs>=0&&v.hs<HAMM.length)o.hs=v.hs;
 if(Array.isArray(v.p))for(const r of v.p){
  if(!Array.isArray(r)||r.length<9)continue;
  const [t,tr,l,i,j,d,y,tm,dt,dop,fl]=r;
  if(!(Number.isInteger(t)&&t>=0&&t<8&&Number.isInteger(tr)&&tr>=0&&tr<5&&Number.isInteger(l)&&l>=0&&l<12))continue;
  if(!(Number.isInteger(i)&&i>=1&&i<W/CS-1&&Number.isInteger(j)&&j>=1&&j<HG.H/CS-1&&Number.isInteger(d)&&d>=0&&d<4&&isFinite(y)))continue;
  o.p.push([t,tr,l,i,j,d,+y,isFinite(tm)?+tm:0,Number.isInteger(dt)&&dt>=0&&dt<4?dt:0,dop?1:0,fl?1:0,]);
 }
 return o;
});
const SS=()=>{const x=HG.X2&&HG.X2();return (x&&x.rs)||FALL};

/* ---------- Çalışma zamanı ---------- */
let P=[],CM=new Map(),EM=new Map(),SM=new Map(),HASH=new Map(),FT=new Map();
let curState=null,uid=1;
const RS={ver:0,ghost:null,aim:null,P:()=>P};
const ck=(l,i,j)=>(l*KEY+i)*KEY+j;
const ek=(l,d,i,j)=>((l*2+d)*KEY+i)*KEY+j;
const cellAt=(l,i,j)=>CM.get(ck(l,i,j));
const edgeAt=(l,d,i,j)=>EM.get(ek(l,d,i,j));
const stairAt=(l,i,j)=>SM.get(ck(l,i,j));
const isCell=t=>t<=FL,isEdge=t=>t>=WL&&t<=LW,full=t=>t===WL||t===DW||t===WN;
const edgeCells=(d,i,j)=>d===0?[[i,j-1],[i,j]]:[[i-1,j],[i,j]];
const cellEdges=(l,i,j)=>[[l,0,i,j],[l,0,i,j+1],[l,1,i,j],[l,1,i+1,j]];

/* Kenar parçalarının yerel kutuları (x: kenar boyunca ±1,6 m · z: kalınlık ±0,1 m) */
function shape(t){
 const A=-1.6,B=1.6,z=.1;
 if(t===WL)return [[A,0,-z,B,3,z]];
 if(t===HF)return [[A,0,-z,B,1.5,z]];
 if(t===LW)return [[A,0,-z,B,.75,z]];
 if(t===DW)return [[A,0,-z,-.7,3,z],[.7,0,-z,B,3,z],[-.7,2.1,-z,.7,3,z]];
 if(t===WN)return [[A,0,-z,-.7,3,z],[.7,0,-z,B,3,z],[-.7,0,-z,.7,.9,z],[-.7,2,-z,.7,3,z]];
 return [];
}
function origin(p){return p.d===0?[p.i*CS+CS/2,p.j*CS]:[p.i*CS,p.j*CS+CS/2]}
function worldBox(p,b){
 const [cx,cz]=origin(p);
 return p.d===0?[cx+b[0],p.y+b[1],cz+b[2],cx+b[3],p.y+b[4],cz+b[5]]:[cx+b[2],p.y+b[1],cz+b[0],cx+b[5],p.y+b[4],cz+b[3]];
}
function boxesOf(p){
 const o=[];
 if(p.t===F)o.push([p.i*CS,p.y-8,p.j*CS,p.i*CS+CS,p.y,p.j*CS+CS]);
 else if(p.t===FL)o.push([p.i*CS,p.y-.25,p.j*CS,p.i*CS+CS,p.y,p.j*CS+CS]);
 else if(isEdge(p.t)){
  for(const b of shape(p.t))o.push(worldBox(p,b));
  if(p.t===DW&&p.dt&&!p.dop)o.push(worldBox(p,[-.7,0,-.05,.7,2.1,.05]));
 }
 return o;
}
/* Merdiven: yükselme yönü d: 0 +x · 1 +z · 2 -x · 3 -z. Hücre içindeki ilerleme oranı */
function stairT(p,x,z){
 const u=(x-p.i*CS)/CS,v=(z-p.j*CS)/CS;
 return p.d===0?u:p.d===1?v:p.d===2?1-u:1-v;
}
const inCell=(p,x,z)=>x>=p.i*CS&&x<p.i*CS+CS&&z>=p.j*CS&&z<p.j*CS+CS;
const stairH=(p,x,z)=>p.y+LH*clamp(stairT(p,x,z),0,1);

function rebuildHash(){
 HASH=new Map();FT=new Map();
 const put=(e,x0,z0,x1,z1)=>{
  const i0=Math.floor((x0-.5)/CS),i1=Math.floor((x1+.5)/CS),j0=Math.floor((z0-.5)/CS),j1=Math.floor((z1+.5)/CS);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*KEY+j;let a=HASH.get(k);if(!a)HASH.set(k,a=[]);a.push(e)}
 };
 for(const p of P){
  if(p.t===ST){put({st:p},p.i*CS,p.j*CS,p.i*CS+CS,p.j*CS+CS);continue}
  p.bx=boxesOf(p);
  for(const b of p.bx)put({b},b[0],b[2],b[3],b[5]);
  if(p.t===F){FT.set(p.i*KEY+p.j,p.y);if(p.sk===undefined)p.sk=p.y-terrainStats(p.i,p.j).mn+.4}
 }
 RS.ver++;
}

/* ---------- Çarpışma ve zemin (oyuncu, düşman, hayvan) ---------- */
function rsBlock(x,z,pz,r){
 if(!P.length)return false;
 r=r===undefined?.27:r;
 const i0=Math.floor((x-r)/CS),i1=Math.floor((x+r)/CS),j0=Math.floor((z-r)/CS),j1=Math.floor((z+r)/CS);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
  const a=HASH.get(i*KEY+j);if(!a)continue;
  for(const e of a){
   if(e.b){
    const b=e.b;
    if(x>b[0]-r&&x<b[3]+r&&z>b[2]-r&&z<b[5]+r&&b[4]>pz+STEP+.02&&b[1]<pz+1.75)return true;
   }else{
    const p=e.st;
    if(x>p.i*CS-r&&x<p.i*CS+CS+r&&z>p.j*CS-r&&z<p.j*CS+CS+r){
     /* gövde ayak izinin yükselme yönündeki ucu */
     const ex=p.d===0?x+r:p.d===2?x-r:x,ez=p.d===1?z+r:p.d===3?z-r:z;
     if(stairH(p,ex,ez)>pz+STEP+.02&&p.y<pz+1.75)return true;
    }
   }
  }
 }
 return false;
}
/* Ayak altındaki yapı yüzeyi: pz+STEP'ten yüksek olmayan en yüksek yüzey (yoksa -Infinity) */
function rsSupport(x,z,pz){
 if(!P.length)return -Infinity;
 let best=-Infinity;const lim=pz+STEP+.02,r=.27;
 for(let k=0;k<5;k++){
  const sx=k===0?x:x+(k&1?r:-r),sz=k===0?z:z+(k&2?r:-r);
  const a=HASH.get(Math.floor(sx/CS)*KEY+Math.floor(sz/CS));if(!a)continue;
  for(const e of a){
   if(e.b){const b=e.b;if(sx>=b[0]&&sx<=b[3]&&sz>=b[2]&&sz<=b[5]&&b[4]<=lim&&b[4]>best)best=b[4]}
   else{const p=e.st;if(inCell(p,sx,sz)){const h=stairH(p,sx,sz);if(h<=lim&&h>best)best=h}}
  }
 }
 return best;
}
/* Eşyalar ve düşen nesneler için yüzey: arazi, temel üstü ve (varsa) üst kat */
function rsSurf(x,z,y){
 const g=S.groundY(x,z);
 if(!P.length||y===undefined)return g;
 const s=rsSupport(x,z,y);
 return s>g?s:g;
}
/* Işın için noktasal katı testi (nişan ışını yapıların içinden geçmesin) */
function rsSolid(x,y,z){
 if(!P.length)return false;
 const a=HASH.get(Math.floor(x/CS)*KEY+Math.floor(z/CS));if(!a)return false;
 for(const e of a){
  if(e.b){const b=e.b;if(x>=b[0]&&x<=b[3]&&z>=b[2]&&z<=b[5]&&y>=b[1]&&y<=b[4])return true}
  else{const p=e.st;if(inCell(p,x,z)&&y>=p.y&&y<=stairH(p,x,z))return true}
 }
 return false;
}
function rsFoeBlock(x,z){
 if(!P.length)return false;
 return rsBlock(x,z,S.terrainY(x,z),.3);
}

/* S.groundY: temel üstlerini içerir; S.terrainY: yalnızca arazi (fizik eğim denetimi için) */
{
 const g0=S.groundY;
 if(!S.terrainY){
  S.terrainY=g0;
  S.groundY=(x,z)=>{
   const t=g0(x,z);
   if(FT.size){const f=FT.get(((x/CS)|0)*KEY+((z/CS)|0));if(f!==undefined&&f>t)return f}
   return t;
  };
 }
}

/* ---------- Denge ---------- */
function supportStab(p){
 let s=0;
 if(p.t===FL){
  for(const [l,d,i,j] of cellEdges(p.l-1,p.i,p.j)){const w=edgeAt(l,d,i,j);if(w&&full(w.t))s=Math.max(s,w.stab*.87)}
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=cellAt(p.l,p.i+di,p.j+dj);if(n&&n.t===FL)s=Math.max(s,n.stab*.62)}
 }else if(isEdge(p.t)){
  for(const [i,j] of edgeCells(p.d,p.i,p.j)){const c=cellAt(p.l,i,j);if(c)s=Math.max(s,c.stab*.9)}
 }else if(p.t===ST){
  const c=cellAt(p.l,p.i,p.j);if(c)s=c.stab*.9;
 }
 return s;
}
function recalc(){
 for(const p of P)p.stab=p.t===F?1:0;
 for(let it=0,ch=true;ch&&it<60;it++){
  ch=false;
  for(const p of P){if(p.t===F)continue;const s=supportStab(p);if(s>p.stab+1e-6){p.stab=s;ch=true}}
 }
}
function index(){
 CM.clear();EM.clear();SM.clear();
 for(const p of P){
  if(isCell(p.t))CM.set(ck(p.l,p.i,p.j),p);
  else if(isEdge(p.t))EM.set(ek(p.l,p.d,p.i,p.j),p);
  else SM.set(ck(p.l,p.i,p.j),p);
 }
}
function reindex(){index();recalc();rebuildHash()}
/* Desteği biten parçalar çöker; zincirleme sürer */
function settle(){
 let total=0;
 for(let g=0;g<30;g++){
  recalc();
  const bad=P.filter(p=>p.t!==F&&p.stab<MINSTAB);
  if(!bad.length)break;
  for(const p of bad){effect(p,6);P.splice(P.indexOf(p),1)}
  total+=bad.length;index();
 }
 rebuildHash();
 if(total){HG.toast(total+' parça desteksiz kalıp çöktü.');HG.snd('hit');flag('rs_collapse')}
 return total;
}

/* ---------- Kayıt yükleme / yazma ---------- */
function mk(r){
 const [t,tr,l,i,j,d,y,tm,dt,dop,fl]=r;
 return {id:uid++,t,tr,l,i,j,d,y,tm,dt,dop:dop?1:0,fl:fl?1:0,stab:0,bx:[],ver:1};
}
function sync(){
 const s=SS();
 if(s===curState)return;
 curState=s;
 P=(s.p||[]).map(mk);
 reindex();
 settle();
}
HG.x2save.push(()=>{
 const s=SS();if(s!==curState)return;
 s.p=P.map(p=>[p.t,p.tr,p.l,p.i,p.j,p.d,Math.round(p.y*100)/100,Math.round(p.tm),p.dt,p.dop,p.fl]);
});

/* ---------- Ölçüler ---------- */
const centerOf=p=>{
 if(isCell(p.t)||p.t===ST)return [p.i*CS+CS/2,p.y+(p.t===ST?1.5:0),p.j*CS+CS/2];
 const [cx,cz]=origin(p);return [cx,p.y+1.5,cz];
};
function effect(p,n){
 const c=centerOf(p);
 if(sc.insaDust)sc.insaDust(c[0],c[2],p.tr>=3?0xb4bac2:p.tr===2?0xb9b9c1:0xcdb48a,n,true);
}
function terrainStats(i,j){
 let mx=-1e9,mn=1e9;
 for(let a=0;a<=4;a++)for(let b=0;b<=4;b++){
  const y=S.terrainY(i*CS+a*.75,j*CS+b*.75);
  if(y>mx)mx=y;if(y<mn)mn=y;
 }
 return {mx,mn};
}
const pcenterDist=(x,z)=>Math.hypot(x-G.px,z-G.py);

/* Oyuncunun yapı kutularıyla çakışması (kurulumu engeller) */
function bodyHits(boxes){
 const r=.3,y0=G.pz===undefined?0:G.pz,y1=y0+1.75;
 for(const b of boxes)if(G.px>b[0]-r&&G.px<b[3]+r&&G.py>b[2]-r&&G.py<b[5]+r&&b[4]>y0+.05&&b[1]<y1)return true;
 return false;
}

/* ---------- Hedef çözümleme ---------- */
const ray=()=>{const r=S.aimRay();return {o:r.o,d:r.d}};
function distToRay(px,py,pz,r){
 const vx=px-r.o.x,vy=py-r.o.y,vz=pz-r.o.z;
 let t=vx*r.d.x+vy*r.d.y+vz*r.d.z;if(t<0)t=0;
 const cx=r.o.x+r.d.x*t-px,cy=r.o.y+r.d.y*t-py,cz=r.o.z+r.d.z*t-pz;
 return {dist:Math.hypot(cx,cy,cz),t};
}
function groundHit(r,maxT){
 for(let t=.4;t<maxT;t+=.1){
  const x=r.o.x+r.d.x*t,y=r.o.y+r.d.y*t,z=r.o.z+r.d.z*t;
  if(x<CS||z<CS||x>=W-CS||z>=HG.H-CS)return null;
  if(y<=S.groundY(x,z)||rsSolid(x,y,z))return {x,y,z,t};
 }
 return null;
}
function faceDir(){
 const a=Math.atan2(G.fy,G.fx);                     /* fx,fy: bakılan yön (x, z) */
 return ((Math.round(a/(Math.PI/2))%4)+4)%4;
}
let rotOff=0;
const REACHB=6.5;

/* Temel adayı */
function foundCand(i,j,pt){
 const g={t:F,l:0,i,j,d:0,y:0,ok:false,why:'',pt,tr:0};
 const c=ck(0,i,j);
 if(CM.has(c)){g.why='Burada zaten temel var.';return g}
 if(i<1||j<1||i>=W/CS-1||j>=HG.H/CS-1){g.why='Harita dışı.';return g}
 let yy=null,bad=false;
 for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const n=cellAt(0,i+di,j+dj);
  if(n&&n.t===F){if(yy===null)yy=n.y;else if(Math.abs(yy-n.y)>.01)bad=true}
 }
 if(bad){g.why='Komşu temellerin yüksekliği farklı.';return g}
 for(let a=0;a<3;a++)for(let b=0;b<3;b++){
  const x=i*CS+a,z=j*CS+b,k=z*W+x,tl=G.tile[k],ob=G.obj[k];
  if(tl<T.SAND||tl===T.POND){g.why='Su üzerine temel kurulamaz.';return g}
  if(ob){g.why='Alanda nesne var (ağaç, kaya, yapı…).';return g}
 }
 const ts=terrainStats(i,j);
 if(ts.mn<sc.WY+.05){g.why='Zemin sudan yeterince yüksek değil.';return g}
 const y=yy===null?ts.mx+.35:yy;
 if(ts.mx>y-.05){g.why='Zemin komşu temelden yüksek; kazı yapılamaz.';return g}
 if(y-ts.mn>4.5){g.why='Zemin çok eğimli.';return g}
 g.y=y;g.sk=y-ts.mn+.4;g.snap=yy!==null;g.stab=1;g.ok=true;
 return g;
}
function resolvePlan(sel,r){
 const maxR=REACHB;
 /* ---- Temel ---- */
 if(sel===F){
  const h=groundHit(r,maxR+1);if(!h)return null;
  let i=Math.floor(h.x/CS),j=Math.floor(h.z/CS);
  let c=cellAt(0,i,j);
  if(c){            /* temelin üstüne bakılıyor: bakılan kenara komşu hücre */
   const dx=h.x-(i*CS+CS/2),dz=h.z-(j*CS+CS/2);
   if(Math.abs(dx)>Math.abs(dz))i+=dx>0?1:-1;else j+=dz>0?1:-1;
  }
  return foundCand(i,j,[i*CS+CS/2,S.groundY(i*CS+CS/2,j*CS+CS/2),j*CS+CS/2]);
 }
 const cands=[];
 const seen=new Set();
 /* ---- Zemin ---- */
 if(sel===FL){
  const tryCell=(l,i,j)=>{
   const k=ck(l,i,j);if(seen.has(k))return;seen.add(k);
   if(l<1||l>9||i<1||j<1||i>=W/CS-1||j>=HG.H/CS-1)return;
   if(CM.has(k))return;
   cands.push(floorCand(l,i,j));
  };
  for(const p of P){
   if(isEdge(p.t)&&full(p.t)&&pcenterDist(p.i*CS,p.j*CS)<14)for(const [i,j] of edgeCells(p.d,p.i,p.j))tryCell(p.l+1,i,j);
   if(p.t===FL&&pcenterDist(p.i*CS,p.j*CS)<14)for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]])tryCell(p.l,p.i+di,p.j+dj);
  }
 }
 /* ---- Kenar parçaları ---- */
 else if(sel>=WL&&sel<=LW){
  for(const p of P){
   if(!isCell(p.t)||pcenterDist(p.i*CS,p.j*CS)>14)continue;
   for(const [l,d,i,j] of cellEdges(p.l,p.i,p.j)){
    const k=ek(l,d,i,j);if(seen.has(k))continue;seen.add(k);
    if(EM.has(k))continue;
    cands.push(edgeCand(sel,l,d,i,j));
   }
  }
 }
 /* ---- Merdiven ---- */
 else if(sel===ST){
  for(const p of P){
   if(!isCell(p.t)||pcenterDist(p.i*CS,p.j*CS)>14)continue;
   if(SM.has(ck(p.l,p.i,p.j)))continue;
   cands.push(stairCand(p));
  }
 }
 let best=null,bs=1e9;
 for(const c of cands){
  const q=distToRay(c.pt[0],c.pt[1],c.pt[2],r);
  const thr=sel===WL||(sel>=DW&&sel<=LW)?1.9:sel===ST?2.2:2.6;
  if(q.dist>thr||q.t>maxR+1.5)continue;
  const sc2=q.dist+q.t*.04;
  if(sc2<bs){bs=sc2;best=c}
 }
 return best;
}
function floorCand(l,i,j){
 const g={t:FL,l,i,j,d:0,y:0,ok:false,why:'',tr:0,pt:[i*CS+CS/2,0,j*CS+CS/2]};
 let y=null,bad=false,s=0;
 const take_=v=>{if(y===null)y=v;else if(Math.abs(y-v)>.01)bad=true};
 for(const [ll,d,ii,jj] of cellEdges(l-1,i,j)){const w=edgeAt(ll,d,ii,jj);if(w&&full(w.t)){take_(w.y+LH);s=Math.max(s,w.stab*.87)}}
 for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=cellAt(l,i+di,j+dj);if(n&&n.t===FL){take_(n.y);s=Math.max(s,n.stab*.62)}}
 g.y=y===null?0:y;g.pt[1]=g.y;
 if(bad){g.why='Destek yükseklikleri uyuşmuyor.';return g}
 if(stairAt(l-1,i,j)){g.why='Merdivenin üstü açık kalmalı.';return g}
 if(s<MINSTAB){g.why='Yeterli destek yok (denge çok düşük).';return g}
 g.stab=s;
 if(bodyHits(boxesOf(Object.assign({},g,{t:FL})))){g.why='Oyuncu engelliyor.';return g}
 g.ok=true;return g;
}
function edgeCand(t,l,d,i,j){
 const g={t,l,i,j,d,y:0,ok:false,why:'',tr:0,pt:[0,0,0]};
 let y=null,bad=false,s=0;
 for(const [ci,cj] of edgeCells(d,i,j)){
  const c=cellAt(l,ci,cj);
  if(c){if(y===null)y=c.y;else if(Math.abs(y-c.y)>.01)bad=true;s=Math.max(s,c.stab*.9)}
 }
 g.y=y===null?0:y;
 const [cx,cz]=origin(g);g.pt=[cx,g.y+1.5,cz];
 if(bad){g.why='Bitişik zeminlerin yüksekliği farklı.';return g}
 if(y===null){g.why='Duvar için temel veya zemin gerekir.';return g}
 if(s<MINSTAB){g.why='Yeterli destek yok (denge çok düşük).';return g}
 g.stab=s;
 const tmp=Object.assign({},g);
 if(bodyHits(boxesOf(tmp))){g.why='Oyuncu engelliyor.';return g}
 g.ok=true;return g;
}
function stairCand(c){
 const d=(faceDir()+rotOff)%4;
 const g={t:ST,l:c.l,i:c.i,j:c.j,d,y:c.y,ok:false,why:'',tr:0,pt:[c.i*CS+CS/2,c.y+1.5,c.j*CS+CS/2],stab:c.stab*.9};
 if(cellAt(c.l+1,c.i,c.j)){g.why='Üstte zemin var; merdiven için açık kalmalı.';return g}
 if(g.stab<MINSTAB){g.why='Yeterli destek yok (denge çok düşük).';return g}
 g.ok=true;return g;
}

/* ---------- Kurma ---------- */
let nextAct=0;
const cooling=()=>{if(nextAct>G.clock+1)nextAct=0;return G.clock<nextAct};
function add(g){
 const p={id:uid++,t:g.t,tr:g.tr||0,l:g.l,i:g.i,j:g.j,d:g.d||0,y:g.y,tm:G.clock,dt:0,dop:0,fl:0,stab:g.stab||0,bx:[],ver:1};
 P.push(p);
 index();recalc();rebuildHash();
 return p;
}
function cur(){
 const s=SS();
 return PLAN_ORDER.includes(s.sel)?s.sel:0;
}
function ghostNow(){
 const h=held();
 if(!h||ui.state!=='play'||G.head)return null;
 const tool=h.it.tool;
 if(tool==='plan'){
  const sel=cur(),g=resolvePlan(sel,ray());
  if(!g)return null;
  g.cost=costOf(g.t,0);
  g.mode='plan';
  if(g.ok&&!canPay(g.cost)){g.ok=false;g.warn=true;g.why='Yetersiz malzeme: '+costRich(g.cost)+'.'}
  return g;
 }
 if(tool==='hammer'){
  const a=pieceAim();
  if(!a)return null;
  return {mode:'hammer',piece:a.p,hit:a,ok:true,t:a.p.t};
 }
 if(tool==='rsdoor'){
  const a=pieceAim();
  if(!a||a.p.t!==DW)return a?{mode:'door',piece:a.p,ok:false,why:'Kapı yalnızca kapı çerçevesine takılır.',t:a.p.t}:null;
  if(a.p.dt)return {mode:'door',piece:a.p,ok:false,why:'Çerçevede zaten kapı var.',t:a.p.t};
  return {mode:'door',piece:a.p,ok:true,t:a.p.t};
 }
 return null;
}
function insaPlace(){
 sync();
 if(ui.state!=='play'||cooling())return false;
 const h=held();if(!h||h.it.tool!=='plan')return false;
 if(G.head){HG.toast('Su altında inşa edilemez.');return false}
 const g=RS.ghost&&RS.ghost.mode==='plan'?RS.ghost:ghostNow();
 if(!g){HG.toast('Yapışacak yer yok: '+(cur()===F?'zemine':'bir temele veya zemine')+' bakın.');return false}
 if(!g.ok){HG.toast(g.why||'Buraya kurulamaz.');HG.snd('ui');return false}
 nextAct=G.clock+.25;
 pay(g.cost);
 const p=add(g);
 if(p.t===F){
  if(!G.air&&G.pz!==undefined&&pcenterDist(p.i*CS+CS/2,p.j*CS+CS/2)<CS*.9&&G.px>=p.i*CS&&G.px<p.i*CS+CS&&G.py>=p.j*CS&&G.py<p.j*CS+CS)G.pz=Math.max(G.pz,p.y);
 }
 effect(p,8);HG.armSwing(.3);HG.snd('craft');ui.dirty=true;
 flag('built');const n=SS();n.n=(n.n|0)+1;
 if(P.length>=50)flag('build50');
 if(P.length>=150)flag('build150');
 G.shelterCheck=0;
 return true;
}
/* ---------- Çekiç ---------- */
function insaHammer(){
 sync();
 if(ui.state!=='play'||cooling())return false;
 const h=held();if(!h||h.it.tool!=='hammer')return false;
 const s=SS(),m=HAMM[s.hs];
 const a=pieceAim();
 if(!a){
  if(legacyHammer(m))return true;
  HG.toast('Bir yapı parçasına bakın.');return false;
 }
 const p=a.p;
 nextAct=G.clock+.2;
 if(m.tr!==undefined){
  if(p.tr>=m.tr){HG.toast(p.tr===m.tr?'Zaten '+TIER[m.tr]+' seviyesinde.':'Yalnızca yükseltme yapılır; sökmek için Yık seçin.');return false}
  const c=costOf(p.t,m.tr);
  if(!canPay(c)){HG.toast('Yetersiz malzeme: '+costRich(c)+'.');return false}
  pay(c);p.tr=m.tr;p.ver++;RS.ver++;
  effect(p,7);HG.armSwing(.3);HG.snd('craft');ui.dirty=true;flag('built_'+(m.tr===2?'stone':m.tr>=3?'metal':'wood'));
  if(m.tr===4)flag('built_armored');
  HG.xpGain&&HG.xpGain(2+m.tr);
  return true;
 }
 if(m.act==='rot')return rotatePiece(p);
 /* Yık */
 if(p.t===DW&&p.dt){            /* önce kapı sökülür */
  const id=p.dt===1?'door':p.dt===2?'mdoor':'adoor';
  if(HG.canAdd(id,1))gain(id,1,true);else HG.spawnDrop(id,1);
  p.dt=0;p.dop=0;p.ver++;rebuildHash();HG.snd('craft');HG.toast(DNAME[1]+' söküldü.');G.shelterCheck=0;return true;
 }
 const age=G.clock-p.tm,inWin=age>=0&&age<=DEMO_T;
 if(p.t===F&&objectsOn(p)){HG.toast('Temelin üzerinde yapı var; önce onu kaldırın.');return false}
 const rate=inWin?1:.25;
 refund(costOf(p.t,0),rate);
 if(p.tr>0)refund(costOf(p.t,p.tr),rate);
 effect(p,10);
 P.splice(P.indexOf(p),1);index();
 settle();rebuildHash();
 HG.armSwing(.3);HG.snd('hit');ui.dirty=true;G.shelterCheck=0;
 HG.toast(TNAME[p.t]+' yıkıldı'+(inWin?' (tam iade).':' (%25 iade; 10 dakikalık süre geçmişti).'));
 return true;
}
function objectsOn(p){
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)if(G.obj[(p.j*CS+b)*W+p.i*CS+a])return true;
 return false;
}
function rotatePiece(p){
 if(p.t===ST){
  p.d=(p.d+1)%4;
  p.ver++;rebuildHash();effect(p,4);HG.snd('ui');HG.toast('Merdiven yönü çevrildi.');return true;
 }
 if(p.t===DW){p.fl=p.fl?0:1;p.ver++;RS.ver++;HG.snd('ui');HG.toast('Kapı menteşe tarafı değişti.');return true}
 HG.toast('Bu parça döndürülemez.');return false;
}
/* Eski (kare tabanlı) parçalar: çekiçle sökülebilir */
function legacyHammer(m){
 const tg=G.tg;if(!tg||tg.an||!HG.INSA||!HG.INSA.OF)return false;
 const i=tg.y*W+tg.x,r=HG.INSA.OF[G.obj[i]];
 if(!r||m.act!=='down')return false;
 refund(r.t.c,.5);HG.setObj(i,0);HG.snd('hit');G.shelterCheck=0;ui.dirty=true;
 HG.toast('Eski tip '+r.p.n+' sökülüp %50 iade edildi.');
 return true;
}

/* ---------- Kapı ---------- */
function rsDoorPlace(){
 sync();
 if(ui.state!=='play'||cooling())return false;
 const h=held();if(!h||h.it.tool!=='rsdoor')return false;
 const a=pieceAim();
 if(!a||a.p.t!==DW){HG.toast('Kapı, kapı çerçevesine takılır. Çerçeveye bakın.');return false}
 if(a.p.dt){HG.toast('Çerçevede zaten kapı var.');return false}
 nextAct=G.clock+.25;
 a.p.dt=DOORS[h.k]||1;a.p.dop=0;a.p.ver++;rebuildHash();
 take(h.k,1);HG.snd('craft');ui.dirty=true;G.shelterCheck=0;flag('door_set');
 return true;
}
function toggleDoor(p){
 p.dop=p.dop?0:1;p.ver++;rebuildHash();
 HG.snd(p.dop?'ui':'craft');G.shelterCheck=0;
}
/* E: bakılan kapıyı aç/kapat (kapı çerçevesine bakarken) */
function rsUse(){
 sync();
 if(!P.length||ui.state!=='play')return false;
 const a=pieceAim(4.2);
 if(!a||a.p.t!==DW||!a.p.dt)return false;
 toggleDoor(a.p);return true;
}
function rsAimDoor(){
 sync();
 if(!P.length)return null;
 const a=pieceAim(4.2);
 if(!a||a.p.t!==DW||!a.p.dt)return null;
 return {hint:'[E] '+(a.p.dop?'Kapıyı kapat':'Kapıyı aç'),name:DNAME[a.p.dt]};
}

/* ---------- Bakılan parça (ışın - kutu) ---------- */
function rayBox(r,b,maxT){
 let t0=0,t1=maxT;
 const o=[r.o.x,r.o.y,r.o.z],d=[r.d.x,r.d.y,r.d.z];
 for(let k=0;k<3;k++){
  const lo=b[k],hi=b[k+3];
  if(Math.abs(d[k])<1e-9){if(o[k]<lo||o[k]>hi)return -1;continue}
  let a=(lo-o[k])/d[k],c=(hi-o[k])/d[k];if(a>c){const q=a;a=c;c=q}
  if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return -1;
 }
 return t0;
}
function pieceAim(maxT){
 maxT=maxT||REACHB;
 if(!P.length)return null;
 const r=ray();
 let best=null,bt=maxT;
 for(const p of P){
  const c=centerOf(p);
  if(Math.abs(c[0]-r.o.x)>maxT+3||Math.abs(c[2]-r.o.z)>maxT+3)continue;
  let boxes=p.bx;
  if(p.t===ST)boxes=[[p.i*CS,p.y,p.j*CS,p.i*CS+CS,p.y+LH,p.j*CS+CS]];
  for(const b of boxes){
   const t=rayBox(r,b,bt);
   if(t>=0&&t<bt){bt=t;best={p,t}}
  }
 }
 if(!best)return null;
 /* ışın araziye daha önce çarpıyorsa (parça arkada kalmış) yok say */
 const h=groundHit(r,Math.min(bt,maxT));
 if(h&&h.t<bt-.15&&!rsSolid(h.x,h.y,h.z))return null;
 return best;
}

/* ---------- Seçim, ipuçları ---------- */
function selName(){const s=SS();return TNAME[cur()]+' ('+TIER[0]+')'}
function insaCycle(){
 sync();
 const h=held();if(!h)return false;
 const s=SS();
 if(h.it.tool==='hammer'){s.hs=(s.hs+1)%HAMM.length;HG.snd('ui');HG.toast('Çekiç: '+HAMM[s.hs].n);return true}
 const k=PLAN_ORDER.indexOf(cur());s.sel=PLAN_ORDER[(k+1)%PLAN_ORDER.length];rotOff=0;
 HG.snd('ui');HG.toast('İnşa Planı: '+selName()+' · '+costText(costOf(s.sel,0)));
 return true;
}
function insaWheel(dir){
 const h=held();if(!h||(h.it.tool!=='plan'&&h.it.tool!=='hammer'))return false;
 const s=SS();
 if(h.it.tool==='hammer'){s.hs=(s.hs+dir+HAMM.length)%HAMM.length;HG.snd('ui');HG.toast('Çekiç: '+HAMM[s.hs].n);return true}
 const k=PLAN_ORDER.indexOf(cur());s.sel=PLAN_ORDER[(k+dir+8)%8];rotOff=0;
 HG.snd('ui');HG.toast('İnşa Planı: '+selName());return true;
}
function insaKey(code){
 const K=HG.keyIs;if(!K)return false;
 const h=held(),tool=h&&h.it.tool;
 if(tool!=='plan'&&tool!=='hammer')return false;
 if(K('irot',code)){
  if(tool==='plan'){
   if(cur()===ST){rotOff=(rotOff+1)%4;HG.snd('ui');HG.toast('Merdiven yönü çevrildi.');return true}
   HG.toast('Bu parça döndürülmez; yalnızca merdiven çevrilir.');return true;
  }
  const a=pieceAim();if(a)rotatePiece(a.p);else HG.toast('Bir yapı parçasına bakın.');
  return true;
 }
 if(K('ipick',code)){
  const a=pieceAim();
  if(!a){HG.toast('Pipet için bir yapı parçasına bakın.');return true}
  SS().sel=a.p.t;HG.snd('ui');HG.toast('Seçildi: '+TNAME[a.p.t]);return true;
 }
 return false;
}
function insaAction(){
 sync();
 const h=held();if(!h)return null;
 const g=RS.ghost;
 if(h.it.tool==='plan'){
  const sel=cur(),nm='İnşa Planı · '+TNAME[sel];
  if(!g||g.mode!=='plan')return {hint:sel===F?'Zemine bakın · sağ tık basılı: parça seç':'Bir temele veya zemine bakın · sağ tık basılı: parça seç',name:nm};
  if(!g.ok)return {hint:g.why||'Buraya kurulamaz.',name:nm};
  const stab=g.t===F?'':' · denge %'+Math.round(g.stab*100);
  return {hint:'Sol tık: kur · '+costRich(g.cost)+stab+(sel===ST?' · ['+kl('irot')+'] yön':''),name:nm};
 }
 if(h.it.tool==='hammer'){
  const m=HAMM[SS().hs],a=g&&g.mode==='hammer'?g.hit:null;
  if(!a){
   const tg=G.tg;
   if(tg&&!tg.an&&HG.INSA&&HG.INSA.OF&&HG.INSA.OF[G.obj[tg.y*W+tg.x]])return {hint:'Eski tip parça · Yık seçiliyse sol tık: sök (%50 iade)',name:'Çekiç'};
   return {hint:'Sağ tık basılı: seçim · '+m.n,name:'Çekiç'};
  }
  const p=a.p,nm=TNAME[p.t]+' · '+TIER[p.tr]+(p.t===F?'':' · denge %'+Math.round(p.stab*100));
  if(m.tr!==undefined){
   if(p.tr>=m.tr)return {hint:p.tr===m.tr?'Zaten '+TIER[m.tr]+' seviyesinde.':'Daha yüksek seviyede; yalnızca yükseltme yapılır.',name:nm};
   return {hint:'Sol tık: '+TIER[m.tr]+' seviyesine yükselt · '+costRich(costOf(p.t,m.tr)),name:nm};
  }
  if(m.act==='rot')return {hint:p.t===ST||p.t===DW?'Sol tık: '+(p.t===ST?'yönü çevir':'menteşe tarafını değiştir'):'Bu parça döndürülemez.',name:nm};
  const age=G.clock-p.tm,left=Math.max(0,DEMO_T-age);
  if(p.t===DW&&p.dt)return {hint:'Sol tık: kapıyı sök (eşya geri gelir)',name:nm};
  return {hint:left>0?'Sol tık: yık · tam iade · '+Math.ceil(left/60)+' dk kaldı':'Sol tık: yık · %25 iade (10 dk geçti)',name:nm};
 }
 if(h.it.tool==='rsdoor'){
  if(!g)return {hint:'Kapı çerçevesine bakın',name:h.it.n};
  if(!g.ok)return {hint:g.why,name:h.it.n};
  return {hint:'Sol tık: kapıyı tak',name:h.it.n};
 }
 return null;
}

/* ---------- Barınak ---------- */
function rsSheltered(){
 if(!P.length)return false;
 /* oyuncunun bulunduğu hücre: ayak seviyesinin altındaki en yüksek temel/zemin */
 const i=Math.floor(G.px/CS),j=Math.floor(G.py/CS),pz=G.pz===undefined?0:G.pz;
 let sl=-1;
 for(let l=0;l<10;l++){const c=cellAt(l,i,j);if(c&&c.y<=pz+.5)sl=l}
 if(sl<0)return false;
 const l=sl,seen=new Set([i*KEY+j]),q=[[i,j]];
 while(q.length){
  const [ci,cj]=q.pop();
  if(!cellAt(l+1,ci,cj))return false;                      /* tavanı yok */
  for(const [dd,ni,nj,ei,ej,d] of [[0,ci+1,cj,ci+1,cj,1],[0,ci-1,cj,ci,cj,1],[0,ci,cj+1,ci,cj+1,0],[0,ci,cj-1,ci,cj,0]]){
   const e=edgeAt(l,d,ei,ej);
   let blocked=false;
   if(e){
    if(e.t===WL||e.t===WN)blocked=true;
    else if(e.t===DW&&e.dt&&!e.dop)blocked=true;
   }
   if(blocked)continue;
   if(!cellAt(l,ni,nj))return false;                        /* açık kenardan dışarı */
   const k=ni*KEY+nj;
   if(!seen.has(k)){seen.add(k);if(seen.size>36)return false;q.push([ni,nj])}
  }
 }
 return true;
}

/* ---------- Radyal menü ---------- */
let rEl=null,rItems=[],rOn=false,rShow=false,rT0=0,rx=0,ry=0,rPick=-1,rShowT=0,rList=[],rKind='';
const ICO={};
function ico(sp){
 if(!HG.SP||!HG.SP[sp])return '';
 return ICO[sp]||(ICO[sp]=HG.SP[sp].toDataURL());
}
function listFor(h){
 if(h.it.tool==='hammer')return HAMM.map((m,i)=>({n:m.n,sp:m.sp,sub:m.tr!==undefined?'Yükselt':m.act==='rot'?'Merdiven/kapı':'10 dk içinde tam iade',i}));
 return PLAN_ORDER.map((t,i)=>({n:TNAME[t],sp:SPR[t],sub:costText(costOf(t,0)),i,no:!canPay(costOf(t,0))}));
}
function build(h){
 if(!rEl){
  rEl=document.createElement('div');rEl.id='radial';rEl.hidden=true;
  (document.getElementById('game')||document.body).appendChild(rEl);
 }
 rList=listFor(h);rKind=h.it.tool;
 const N=rList.length,R=112;
 rEl.innerHTML='<div class="rctr"><b></b><span></span></div>'+rList.map((e,j)=>{
  const a=-Math.PI/2+j*2*Math.PI/N;
  return '<div class="rs'+(e.no?' no':'')+'" data-i="'+j+'" style="left:calc(50% + '+Math.round(Math.cos(a)*R)+'px);top:calc(50% + '+Math.round(Math.sin(a)*R)+'px)"><img src="'+ico(e.sp)+'" alt=""><i>'+e.n+'</i><u>'+e.sub+'</u></div>';
 }).join('');
 rItems=[...rEl.querySelectorAll('.rs')];
}
function curIndex(h){return h.it.tool==='hammer'?SS().hs:PLAN_ORDER.indexOf(cur())}
function paint(){
 if(!rEl)return;
 const cu=rPick>=0?rPick:curIndex(held()||{it:{}});
 rItems.forEach((el,j)=>el.classList.toggle('on',j===cu));
 const e=rList[cu];
 if(e){rEl.querySelector('.rctr b').textContent=e.n;rEl.querySelector('.rctr span').textContent=e.sub}
}
function radialOpen(){
 if(rOn)return true;
 const h=held();
 if(ui.state!=='play'||!h||(h.it.tool!=='plan'&&h.it.tool!=='hammer'))return false;
 sync();
 build(h);rOn=true;rShow=false;rx=ry=0;rPick=-1;rT0=performance.now();
 clearTimeout(rShowT);
 rShowT=setTimeout(()=>{if(rOn){rShow=true;rEl.hidden=false;paint()}},170);
 return true;
}
const radialOn=()=>rOn;
function radialMove(dx,dy){
 if(!rOn)return;
 rx+=dx;ry+=dy;const l=Math.hypot(rx,ry),M=90;
 if(l>M){rx*=M/l;ry*=M/l}
 if(l>=26){
  const N=rList.length;
  let a=Math.atan2(ry,rx)+Math.PI/2;if(a<0)a+=Math.PI*2;
  rPick=Math.round(a/(Math.PI*2/N))%N;
  if(!rShow){rShow=true;clearTimeout(rShowT);rEl.hidden=false}
 }
 paint();
}
function radialClose(commit){
 if(!rOn)return;
 const h=held(),quick=performance.now()-rT0<260;
 rOn=false;clearTimeout(rShowT);
 if(rEl)rEl.hidden=true;
 const pick=rPick;rPick=-1;rShow=false;
 if(!commit||!h||h.it.tool!==rKind)return;
 if(pick>=0){
  if(h.it.tool==='hammer')SS().hs=pick;else{SS().sel=PLAN_ORDER[pick];rotOff=0}
  HG.snd('ui');HG.toast(h.it.tool==='hammer'?'Çekiç: '+HAMM[pick].n:'İnşa Planı: '+TNAME[PLAN_ORDER[pick]]);
 }else if(quick)insaCycle();
}
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)radialClose(false)});
addEventListener('blur',()=>radialClose(false));

/* ---------- Her kare ---------- */
/* Temel üzerine kendiliğinden çıkan doğa nesneleri (yeniden büyüyen kaya, ağaç, çalı, mantar) temizlenir */
const NATURE=new Set([O.TREE,O.PALM,O.PALM0,O.ROCK,O.COAL,O.COPPER,O.IRON,O.BUSH,O.BUSH0,O.SHROOM]);
const rsCovered=(tx,tz)=>FT.size>0&&FT.has(Math.floor(tx/CS)*KEY+Math.floor(tz/CS));
let cleanT=0;
function cleanFound(){
 for(const p of P){
  if(p.t!==F)continue;
  for(let a=0;a<CS;a++)for(let b=0;b<CS;b++){
   const k=(p.j*CS+b)*W+p.i*CS+a;
   if(NATURE.has(G.obj[k])){if(G.dmg)delete G.dmg[k];HG.setObj(k,0)}
  }
 }
}
function updateInsa(dt){
 sync();
 cleanT-=dt;if(cleanT<=0){cleanT=2;if(P.length)cleanFound()}
 if(ui.state!=='play'){RS.ghost=null;return}
 const h=held();
 RS.ghost=h&&(h.it.tool==='plan'||h.it.tool==='hammer'||h.it.tool==='rsdoor')?ghostNow():null;
}
function insaReset(){
 nextAct=0;rotOff=0;rOn=false;rPick=-1;clearTimeout(rShowT);if(rEl)rEl.hidden=true;
 RS.ghost=null;
}
function insaGhost(){return null}     /* eski kare gölgesi kapalı; yeni gölge rust-insa-sahne.js içindedir */

/* ---------- Co-op eşitleme arayüzü (js/oyun/ag-dunya.js): parçalar anahtarla tanınır, yalnızca değişenler gönderilir ---------- */
const pkey=p=>isCell(p.t)?'c'+p.l+','+p.i+','+p.j:isEdge(p.t)?'e'+p.l+','+p.d+','+p.i+','+p.j:'s'+p.l+','+p.i+','+p.j;
const prec=p=>[p.t,p.tr,p.l,p.i,p.j,p.d,Math.round(p.y*100)/100,Math.round(p.tm),p.dt,p.dop,p.fl];
const findKey=k=>{const a=k.slice(1).split(',').map(Number);return k[0]==='c'?cellAt(a[0],a[1],a[2]):k[0]==='e'?edgeAt(a[0],a[1],a[2],a[3]):stairAt(a[0],a[1],a[2])};
RS.net={
 dump(){sync();const m=new Map();for(const p of P)m.set(pkey(p),prec(p));return m},
 apply(ups,dels){
  sync();let ch=false;
  for(const k of dels||[]){const p=findKey(k);if(p){effect(p,5);P.splice(P.indexOf(p),1);ch=true;index()}}
  for(const r of ups||[]){
   if(!Array.isArray(r)||r.length<9)continue;
   const [t,tr,l,i,j,d,y,tm,dt,dop,fl]=r;
   const k=t<=FL?'c'+l+','+i+','+j:t<=LW?'e'+l+','+d+','+i+','+j:'s'+l+','+i+','+j;
   const p=findKey(k);
   if(p){p.t=t;p.tr=tr;p.d=d;p.y=y;p.tm=tm;p.dt=dt;p.dop=dop?1:0;p.fl=fl?1:0;p.ver++}
   else{P.push(mk(r));index()}
   ch=true;
  }
  if(ch){index();recalc();rebuildHash()}
  return ch;
 }
};

Object.assign(HG,{
 RS,rsCovered,rsBlock,rsSupport,rsSurf,rsSolid,rsFoeBlock,rsSheltered,rsUse,rsAimDoor,rsDoorPlace,
 insaReset,insaPlace,insaHammer,insaCycle,insaAction:()=>{const r=insaAction();if(r)r.always=true;return r},insaGhost,radialOpen,radialClose,radialOn,radialMove,insaWheel,insaKey,updateInsa,
 insaRotOf:()=>undefined,
 RSD:{TNAME,TIER,TCOL,BASE,MUL,costOf,shape,origin,F,FL,WL,DW,WN,HF,LW,ST,CS,LH,stairH,PLAN_ORDER,SPR,DOORS,
  parts:()=>P,cellAt,edgeAt,stairAt,settle,reindex,add,recalc,pieceAim,resolvePlan,ghostNow,toggleDoor,rotatePiece,sync,
  setRot:v=>{rotOff=v},foundCand,floorCand,edgeCand,stairCand,faceDir,rsRayBox:rayBox}
});
})();
