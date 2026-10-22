/* Hunger 3D - harita: gölgelendirilmiş kabartma, keşfedildikçe açılan sis, kareli ızgara, pusula, ölçek, yakınlaştırma-kaydırma, hedef işareti, mağara girişleri.
   Mini harita ve tam ekran harita aynı tabanı kullanır; mağarada kendi planı çizilir. */
(()=>{
'use strict';
const {W,H,G,T,O,clamp,fbm,hash}=HG;
const $=HG.$;
const CELL=4,CW=Math.ceil(W/CELL),CH=Math.ceil(H/CELL);
let base=null,fog=null,fogCtx=null,fogImg=null,fogDirty=true,expT=0,bound=false;
const view={z:1,cx:W/2,cy:H/2,drag:null,moved:false,mx:0,my:0};
const FOGC=[5,9,16];

/* ---- taban harita ---- */
function surfaceBase(im){
 const d=im.data,seed=G.seed||1;
 const hv=i=>{const t=G.tile[i];return (t===T.DEEP?-1.3:t===T.SHAL?-.5:t===T.POND?-.5:0)+G.hgt[i]};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x,t=G.tile[i],h=G.hgt[i];
  /* kabartma gölgesi: kuzeybatıdan ışık */
  const a=hv(y>0&&x>0?i-W-1:i),b=hv(y<H-1&&x<W-1?i+W+1:i),sh=clamp(1+(a-b)*.55,.62,1.4);
  let r,g,bl;
  if(t===T.DEEP){const k=fbm(x/12,y/12,seed+4);r=12+k*10;g=40+k*14;bl=74+k*18}
  else if(t===T.SHAL){r=60;g=124;bl=152}
  else if(t===T.POND){r=62;g=132;bl=158}
  else if(t===T.SAND){const k=fbm(x/5,y/5,seed+6);r=212+k*14;g=194+k*12;bl=140+k*10}
  else if(t===T.ROCK){
   const k=fbm(x/4,y/4,seed+8),e=clamp(h/6,0,1);
   r=100+e*70+k*16;g=97+e*70+k*14;bl=92+e*72+k*14;
   if(h>5)  {const s=clamp((h-5)/1.2,0,1);r+=(236-r)*s;g+=(240-g)*s;bl+=(244-bl)*s}
  }else{
   const k=fbm(x/6,y/6,seed+5),e=clamp(h/4,0,1);
   r=58+k*34+e*26;g=112+k*30+e*14;bl=50+k*18+e*12;
  }
  const o=G.obj[i];
  if(o===O.TREE||o===O.PALM){r*=.62;g*=.78;bl*=.6}
  else if(o===O.BUSH||o===O.BUSH0){r*=.8;g*=.92;bl*=.78}
  else if(o===O.FIRE||o===O.TORCHP){r=250;g=150;bl=40}
  else if(o===O.SHROOM){r*=.9;g*=.8;bl*=.8}
  else if(o===O.PLOT){r=110;g=84;bl=44}
  else if(o===O.CHEST||o===O.SIGN||o===O.APIARY||o===O.FTRAP){r=170;g=120;bl=70}
  else if(o===O.HIVEW){r=214;g=170;bl=60}
  else if(o===O.BED||o===O.RACK||o===O.BARREL||o===O.SNARE||o===O.BENCH||o===O.FURN||o===O.WALLW||o===O.WALLS||o===O.DOOR||o===O.WALLT||o===O.WALLM||o===O.DOORM||o===O.FENCE){r=170;g=120;bl=70}
  else if(o===O.WINW||o===O.ARCHW||o===O.GATE){r=190;g=136;bl=78}
  else if(o===O.WINS||o===O.ARCHS||o===O.FENCES){r=150;g=152;bl=160}
  else if(o===O.WINM||o===O.GATEM||o===O.FENCEM){r=118;g=134;bl=158}
  if(t>T.SHAL&&t!==T.POND){r*=sh;g*=sh;bl*=sh}
  /* kıyı köpüğü */
  if(G.shore&&G.shore[i]){r+=(235-r)*.35;g+=(240-g)*.35;bl+=(245-bl)*.35}
  const q=i*4;d[q]=r>255?255:r;d[q+1]=g>255?255:g;d[q+2]=bl>255?255:bl;d[q+3]=255;
 }
}
function caveBase(im){
 const d=im.data,lv=G.cave.lv,seed=lv.exit.x*5+lv.exit.y;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x,q=i*4;
  let r=6,g=7,b=10;
  if(lv.open[i]){
   const k=fbm(x/3,y/3,seed);
   if(G.tile[i]===T.POND){r=38;g=88;b=128}
   else{r=82+k*34;g=90+k*34;b=108+k*36}
   const o=G.obj[i];
   if(o===O.COAL){r=26;g=26;b=34}else if(o===O.COPPER){r=210;g=120;b=60}else if(o===O.IRON){r=160;g=84;b=54}
   else if(o===O.ROCK){r=120;g=118;b=116}
   else if(o===O.FIRE){r=250;g=150;b=40}
  }else if(G.obj[i]===O.VWALL){r=22;g=24;b=30}
  d[q]=r;d[q+1]=g;d[q+2]=b;d[q+3]=255;
 }
}
function build(){
 const c=document.createElement('canvas');c.width=W;c.height=H;
 const g=c.getContext('2d'),im=g.createImageData(W,H);
 if(G.cave)caveBase(im);else surfaceBase(im);
 g.putImageData(im,0,0);base=c;
 if(!fog){fog=document.createElement('canvas');fog.width=CW;fog.height=CH;fogCtx=fog.getContext('2d');fogImg=fogCtx.createImageData(CW,CH)}
 fogDirty=true;
}
function drawFog(){
 if(!G.explore)return;
 if(fogDirty){
  const d=fogImg.data;
  for(let i=0;i<CW*CH;i++){const q=i*4,e=G.explore[i];d[q]=FOGC[0];d[q+1]=FOGC[1];d[q+2]=FOGC[2];d[q+3]=e?0:255}      /* keşfedilmemiş yer tamamen kapalıdır: arazi, kıyı ve işaret sezdirilmez */
  fogCtx.putImageData(fogImg,0,0);fogDirty=false;
 }
}
/* keşfedilen (bayrağı kalkmış) köy, kamp, ada, resif ve mağaralar kendi çevreleriyle birlikte haritada açılır */
function revealDisc(x,y,r){
 const cx0=Math.floor((x-r)/CELL),cx1=Math.floor((x+r)/CELL),cy0=Math.floor((y-r)/CELL),cy1=Math.floor((y+r)/CELL);
 for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){
  if(cx<0||cy<0||cx>=CW||cy>=CH)continue;
  const i=cy*CW+cx;if(G.explore[i])continue;
  if(Math.hypot((cx+.5)*CELL-x,(cy+.5)*CELL-y)<=r+CELL*.5){G.explore[i]=1;fogDirty=true}
 }
}
function revealFound(){
 const F=G.flags||{};
 (G.villages||[]).forEach((v,i)=>{if(F['v'+i])revealDisc(v.cx,v.cy,16)});
 for(const c of G.camps||[])if(F['c'+c.id])revealDisc(c.x+.5,c.y+.5,6);
 for(const q of G.islets||[])if(F['isl'+q.id])revealDisc(q.x,q.y,q.r+4);
 for(const q of G.reefs||[])if(F['reef'+q.id])revealDisc(q.x+.5,q.y+.5,q.r+3);
 for(const c of G.caves||[])if(F['cave'+c.id])revealDisc(c.x+.5,c.y+.5,6);
}
/* işaret yalnızca keşfedilmiş bir hücredeyse çizilir */
const seen=(x,y)=>{if(G.cave||!G.explore)return true;const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);return cx>=0&&cy>=0&&cx<CW&&cy<CH&&!!G.explore[cy*CW+cx]};
/* oyuncunun çevresini keşfedilmiş say */
function explore(dt){
 if(!G.explore)return;
 expT-=dt;if(expT>0)return;expT=.25;
 if(!G.cave)revealFound();
 const R=G.cave?9:16,cx0=Math.floor((G.px-R)/CELL),cx1=Math.floor((G.px+R)/CELL),cy0=Math.floor((G.py-R)/CELL),cy1=Math.floor((G.py+R)/CELL);
 for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){
  if(cx<0||cy<0||cx>=CW||cy>=CH)continue;
  const i=cy*CW+cx;if(G.explore[i])continue;
  if(Math.hypot((cx+.5)*CELL-G.px,(cy+.5)*CELL-G.py)<=R+CELL*.5){G.explore[i]=1;fogDirty=true}
 }
 /* hedefe varıldı */
 if(G.wp&&!G.cave&&Math.hypot(G.px-G.wp.x,G.py-G.wp.y)<4){G.wp=null;HG.toast('Hedefe ulaşıldı.')}
}
const explored=()=>{
 if(!G.explore)return 0;
 if(G.cave){
  /* mağarada oran, yalnızca içinde boşluk bulunan hücrelere göre hesaplanır */
  const lv=G.cave.lv;
  if(!lv.cells){lv.cells=new Uint8Array(CW*CH);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(lv.open[y*W+x])lv.cells[((y/CELL)|0)*CW+((x/CELL)|0)]=1}
  let t=0,n=0;for(let i=0;i<CW*CH;i++)if(lv.cells[i]){t++;if(G.explore[i])n++}
  return t?n/t:0;
 }
 let n=0;for(let i=0;i<G.explore.length;i++)if(G.explore[i])n++;return n/(CW*CH);
};

/* ---- işaretler ---- */
const LF=sz=>'600 '+Math.max(10,Math.min(12,sz*1.25))+'px system-ui,sans-serif';      /* işaret yazıları okunur ve küçük: 10-12 piksel */
function markers(g,tx,ty,k,sz){
 /* köyler */
 (G.villages||[]).forEach((v,i)=>{
  if(!G.flags['v'+i]||!seen(v.cx,v.cy))return;
  const x=tx(v.cx),y=ty(v.cy),s=Math.max(4,sz*1.1);
  g.fillStyle='#f0b040';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.rect(x-s,y-s,s*2,s*2);g.stroke();g.fill();
  if(sz>5){
   g.fillStyle='#fff';g.font=LF(sz);g.textAlign='center';g.strokeText(v.name,x,y-s-4);g.fillText(v.name,x,y-s-4);
   /* köy türü: hangi köyde ne bulunacağı haritadan görülür */
   if(v.typeName&&sz>7){g.font=LF(sz*.8);g.fillStyle='#ffd9a0';g.strokeText(v.typeName,x,y+s+11);g.fillText(v.typeName,x,y+s+11)}
  }
 });
 /* kamplar ve sandık odası */
 const SEAC={wreck:['#e0884a','Enkaz'],castaway:['#7ad07a','Kazazede'],lighthouse:['#ffffff','Fener']};
 for(const c of G.camps||[]){
  if(!G.flags['c'+c.id]||!seen(c.x+.5,c.y+.5))continue;
  const x=tx(c.x+.5),y=ty(c.y+.5),s=Math.max(3.5,sz*.9),sea=SEAC[c.kind];
  g.fillStyle=c.open?'#8a8a8a':c.vault?'#ff5a6a':sea?sea[0]:'#e8e4da';g.strokeStyle='#000';g.lineWidth=2;
  g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s,y);g.lineTo(x,y+s);g.lineTo(x-s,y);g.closePath();g.stroke();g.fill();
  if(sea&&sz>5){g.fillStyle='#fff';g.strokeStyle='#000';g.font=LF(sz);g.textAlign='center';g.strokeText(sea[1],x,y-s-4);g.fillText(sea[1],x,y-s-4)}
 }
 /* keşfedilen adalar ve mercan resifleri */
 if(!G.cave){
  for(const q of G.islets||[]){
   if(!G.flags['isl'+q.id]||!seen(q.x,q.y))continue;
   const x=tx(q.x),y=ty(q.y),s=Math.max(3.5,sz*.8);
   g.fillStyle='#5fb04a';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.arc(x,y,s,0,7);g.stroke();g.fill();
   if(sz>5){g.fillStyle='#fff';g.font=LF(sz);g.textAlign='center';g.strokeText('Ada',x,y-s-4);g.fillText('Ada',x,y-s-4)}
  }
  for(const q of G.reefs||[]){
   if(!G.flags['reef'+q.id]||!seen(q.x+.5,q.y+.5))continue;
   const x=tx(q.x+.5),y=ty(q.y+.5),r=Math.max(3.5,q.r*k*.8);
   g.strokeStyle='#ff7aa8';g.lineWidth=2;g.setLineDash([4,3]);g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.setLineDash([]);
   if(sz>5){g.fillStyle='#ffd0e0';g.strokeStyle='#000';g.font=LF(sz);g.textAlign='center';g.strokeText('Resif',x,y-r-4);g.fillText('Resif',x,y-r-4)}
  }
 }
 /* mağara girişleri */
 for(const c of G.caves||[]){
  if(!G.flags['cave'+c.id]||!seen(c.x+.5,c.y+.5))continue;
  const x=tx(c.x+.5),y=ty(c.y+.5),s=Math.max(4,sz);
  g.fillStyle='#14161c';g.strokeStyle=c.vault?'#8a8a8a':'#ff5a4a';g.lineWidth=2;
  g.beginPath();g.moveTo(x-s,y+s*.8);g.lineTo(x-s,y-s*.1);g.quadraticCurveTo(x,y-s*1.6,x+s,y-s*.1);g.lineTo(x+s,y+s*.8);g.closePath();g.fill();g.stroke();
  if(sz>5){
   const nm=c.kindName||'Mağara';
   g.fillStyle='#fff';g.strokeStyle='#000';g.font=LF(sz);g.textAlign='center';g.strokeText(nm,x,y-s*1.5);g.fillText(nm,x,y-s*1.5);
   /* zorluk: keşfedilen mağaranın ne beklediğini haritadan görmek için */
   if(sz>7){const z=['Kolay','Orta','Zor'][c.tier||0];g.font=LF(sz*.8);g.fillStyle='#ffb0a0';g.strokeText(z,x,y+s+11);g.fillText(z,x,y+s+11)}
  }
 }
 /* mağaradan çıkış */
 if(G.cave){
  const e=G.cave.lv.exit,x=tx(e.x+.5),y=ty(e.y+.5);
  g.fillStyle='#bcd2ff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.arc(x,y,Math.max(3.5,sz*.8),0,7);g.stroke();g.fill();
 }
 /* yerleştirilen kamp ateşleri */
 if(!G.cave)for(const f of HG.sc.fires||[]){
  if(!seen(f.x,f.z))continue;
  const x=tx(f.x),y=ty(f.z),s=Math.max(2.4,sz*.55);
  g.fillStyle='#ff9a2a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.arc(x,y,s,0,7);g.stroke();g.fill();
 }
 /* hedef işareti */
 if(G.wp&&!G.cave){
  const x=tx(G.wp.x),y=ty(G.wp.y),s=Math.max(5,sz*1.2);
  g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-s*2);g.stroke();
  g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-s*2);g.stroke();
  g.fillStyle='#4ad0ff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-s*2);g.lineTo(x+s*1.3,y-s*1.5);g.lineTo(x,y-s);g.closePath();g.fill();g.stroke();
 }
 if(HG.extMapMarks)HG.extMapMarks(g,tx,ty,k,sz,seen);       /* büyük güncelleme (51): cenaze, yatak, tüccar, hazine bölgesi, bayraklar */
}
function playerArrow(g,x,y,r){
 const a=Math.atan2(G.fy,G.fx);
 g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#d9463c';g.strokeStyle='#fff';g.lineWidth=1.4;
 g.beginPath();g.moveTo(r*1.5,0);g.lineTo(-r*.85,r*.75);g.lineTo(-r*.35,0);g.lineTo(-r*.85,-r*.75);g.closePath();g.stroke();g.fill();g.restore();
}

/* ---- mini harita ---- */
function mini(m,mw){
 if(!base)return;
 const MS=G.cave?58:80,k=mw/MS;
 m.imageSmoothingEnabled=false;
 m.fillStyle='#06121f';m.fillRect(0,0,mw,mw);
 const sx=G.px-MS/2,sy=G.py-MS/2,x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(W,sx+MS),y1=Math.min(H,sy+MS);
 if(x1>x0&&y1>y0){
  m.drawImage(base,x0,y0,x1-x0,y1-y0,(x0-sx)*k,(y0-sy)*k,(x1-x0)*k,(y1-y0)*k);
  drawFog();
  m.imageSmoothingEnabled=true;
  m.drawImage(fog,x0/CELL,y0/CELL,(x1-x0)/CELL,(y1-y0)/CELL,(x0-sx)*k,(y0-sy)*k,(x1-x0)*k,(y1-y0)*k);
  m.imageSmoothingEnabled=false;
 }
 const tx=x=>(x-sx)*k,ty=y=>(y-sy)*k;
 /* işaretler yalnızca görüş alanında */
 m.save();m.beginPath();m.rect(2,2,mw-4,mw-4);m.clip();
 markers(m,tx,ty,k,3.4);
 m.restore();
 /* hedefe yön oku */
 if(G.wp&&!G.cave){
  const dx=G.wp.x-G.px,dy=G.wp.y-G.py,d=Math.hypot(dx,dy);
  if(Math.abs(dx)>MS/2-2||Math.abs(dy)>MS/2-2){
   const a=Math.atan2(dy,dx),r=mw/2-9;
   m.save();m.translate(mw/2+Math.cos(a)*r,mw/2+Math.sin(a)*r);m.rotate(a);m.fillStyle='#4ad0ff';m.strokeStyle='#000';m.lineWidth=1.5;
   m.beginPath();m.moveTo(6,0);m.lineTo(-4,4.5);m.lineTo(-4,-4.5);m.closePath();m.fill();m.stroke();m.restore();
  }
  m.font='600 10px system-ui,sans-serif';m.textAlign='left';m.fillStyle='#fff';m.strokeStyle='#000';m.lineWidth=3;
  const t='⚑ '+Math.round(d)+' m';m.strokeText(t,5,mw-6);m.fillText(t,5,mw-6);
 }
 /* kuzey işareti */
 m.font='700 11px system-ui,sans-serif';m.textAlign='center';m.fillStyle='#fff';m.strokeStyle='#000';m.lineWidth=3;
 m.strokeText('K',mw/2,12);m.fillText('K',mw/2,12);
 /* oyuncu */
 m.strokeStyle='#fff';m.lineWidth=1.5;m.beginPath();m.moveTo(mw/2,mw/2);m.lineTo(mw/2+G.fx*7*k,mw/2+G.fy*7*k);m.stroke();
 m.fillStyle='#d9463c';m.beginPath();m.arc(mw/2,mw/2,3,0,7);m.fill();
}

/* ---- tam ekran harita ---- */
function size(){const wide=innerWidth>=innerHeight;return Math.floor(Math.min(innerWidth*.94-(wide?80:0),innerHeight*.84-(wide?0:64)))}      /* pusula için haritanın yanında (yatay) veya üstünde (dikey) yer ayrılır */
const toWorld=(px,py,S)=>{const k=S/W*view.z;return {x:(px-S/2)/k+view.cx,y:(py-S/2)/k+view.cy}};
function clampView(){
 const half=W/2/view.z;
 view.cx=clamp(view.cx,half,W-half);view.cy=clamp(view.cy,half,H-half);
}
function bind(){
 if(bound)return;
 const c=$('#bm');if(!c)return;bound=true;
 const pos=e=>{const r=c.getBoundingClientRect(),S=c.width;return {x:(e.clientX-r.left)*S/r.width,y:(e.clientY-r.top)*S/r.height,S}};
 c.addEventListener('wheel',e=>{
  e.preventDefault();
  const p=pos(e),before=toWorld(p.x,p.y,p.S);
  view.z=clamp(view.z*(e.deltaY<0?1.25:.8),1,8);
  const k=p.S/W*view.z;view.cx=before.x-(p.x-p.S/2)/k;view.cy=before.y-(p.y-p.S/2)/k;
  clampView();
 },{passive:false});
 c.addEventListener('mousedown',e=>{const p=pos(e);view.drag={x:p.x,y:p.y,cx:view.cx,cy:view.cy};view.moved=false});
 addEventListener('mousemove',e=>{
  if(!$('#bigmap').hidden){const p=pos(e);view.mx=p.x;view.my=p.y}
  if(!view.drag)return;
  const p=pos(e),k=p.S/W*view.z,dx=p.x-view.drag.x,dy=p.y-view.drag.y;
  if(Math.abs(dx)+Math.abs(dy)>4)view.moved=true;
  if(view.moved){view.cx=view.drag.cx-dx/k;view.cy=view.drag.cy-dy/k;clampView()}
 });
 addEventListener('mouseup',e=>{
  if(!view.drag)return;
  const wasMoved=view.moved;view.drag=null;
  if(wasMoved||e.target!==c||G.cave)return;
  const p=pos(e),w=toWorld(p.x,p.y,p.S);
  if(w.x<0||w.y<0||w.x>=W||w.y>=H)return;
  if(HG.extMapClick&&HG.extMapClick(w.x,w.y,e,10/(p.S/W*view.z)))return;      /* Shift + tık: bayrak */
  if(G.wp&&Math.hypot(w.x-G.wp.x,w.y-G.wp.y)<10/(p.S/W*view.z)){G.wp=null;HG.toast('Hedef işareti kaldırıldı.')}
  else{G.wp={x:w.x,y:w.y};HG.toast('Hedef işaretlendi: '+Math.round(Math.hypot(w.x-G.px,w.y-G.py))+' m')}
 });
 c.addEventListener('dblclick',()=>home());
}
/* varsayılan görünüm: yüzeyde tüm ada, mağarada mağara bölgesi */
function home(){view.z=G.cave?3.3:1;view.cx=W/2;view.cy=H/2;clampView()}
function open(){home();view.drag=null;bind()}
function big(){
 if(!base)return;
 const c=$('#bm'),S=size();
 if(c.width!==S){c.width=S;c.height=S}
 bind();
 const g=c.getContext('2d'),k=S/W*view.z;
 const tx=x=>(x-view.cx)*k+S/2,ty=y=>(y-view.cy)*k+S/2;
 g.setTransform(1,0,0,1,0,0);
 g.fillStyle='#06121f';g.fillRect(0,0,S,S);
 /* taban + sis */
 g.imageSmoothingEnabled=view.z>1.4;
 g.drawImage(base,tx(0),ty(0),W*k,H*k);
 drawFog();
 g.imageSmoothingEnabled=true;
 g.drawImage(fog,tx(0),ty(0),W*k,H*k);
 /* ızgara: 8x8 sektör, harf (sütun) ve rakam (satır) */
 const N=8,step=W/N;
 g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;g.fillStyle='rgba(255,255,255,.7)';
 g.font='600 '+Math.max(11,S/54)+'px system-ui,sans-serif';
 for(let i=0;i<=N;i++){
  const x=tx(i*step),y=ty(i*step);
  g.beginPath();g.moveTo(x,ty(0));g.lineTo(x,ty(H));g.moveTo(tx(0),y);g.lineTo(tx(W),y);g.stroke();
 }
 g.textAlign='center';
 for(let i=0;i<N;i++){
  const x=tx((i+.5)*step),y=ty((i+.5)*step);
  if(x>10&&x<S-10)g.fillText(String.fromCharCode(65+i),x,14);
  g.textAlign='left';if(y>20&&y<S-6)g.fillText(String(i+1),4,y+4);g.textAlign='center';
 }
 /* işaretler */
 g.save();g.beginPath();g.rect(0,0,S,S);g.clip();
 markers(g,tx,ty,k,Math.max(5,S/90));
 g.restore();
 playerArrow(g,tx(G.px),ty(G.py),Math.max(4.5,S/125));          /* imleç küçük tutulur: haritayı kapatmasın */
 /* pusula: haritanın dışında, ayrı küçük bir tuvalde çizilir */
 {const cc=$('#bmc');if(cc){const q=cc.getContext('2d'),r=cc.width*.46,x=cc.width/2,y=cc.height/2+5;
  q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,cc.width,cc.height);
  q.fillStyle='rgba(6,12,20,.78)';q.strokeStyle='rgba(255,255,255,.5)';q.lineWidth=1.5;q.beginPath();q.arc(x,y,r,0,7);q.fill();q.stroke();
  q.fillStyle='#d9463c';q.beginPath();q.moveTo(x,y-r*.78);q.lineTo(x+r*.26,y);q.lineTo(x-r*.26,y);q.closePath();q.fill();
  q.fillStyle='#e8e4da';q.beginPath();q.moveTo(x,y+r*.78);q.lineTo(x+r*.26,y);q.lineTo(x-r*.26,y);q.closePath();q.fill();
  q.fillStyle='#fff';q.font='700 11px system-ui,sans-serif';q.textAlign='center';q.fillText('K',x,y-r-2);}
 }
 /* ölçek çubuğu */
 {const len=view.z>=4?10:view.z>=2?25:50,px=len*k,x=14,y=S-16;
  g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(x,y-4);g.lineTo(x,y);g.lineTo(x+px,y);g.lineTo(x+px,y-4);g.stroke();
  g.strokeStyle='#000';g.lineWidth=1;g.stroke();
  g.font='600 '+Math.max(11,S/56)+'px system-ui,sans-serif';g.textAlign='left';g.strokeStyle='#000';g.lineWidth=3;g.strokeText(len+' m',x,y-8);g.fillText(len+' m',x,y-8);
 }
 /* imleç konumu */
 let cur='';
 if(view.mx||view.my){const w=toWorld(view.mx,view.my,S);if(w.x>=0&&w.y>=0&&w.x<W&&w.y<H)cur=' · İmleç: '+Math.floor(w.x)+', '+Math.floor(w.y)}
 const sec=String.fromCharCode(65+clamp(Math.floor(G.px/step),0,N-1))+(clamp(Math.floor(G.py/step),0,N-1)+1);
 const gz=G.pz!==undefined?G.pz:0;
 const fv=(G.villages||[]).filter((v,i)=>G.flags['v'+i]).length;
 const fc=(G.caves||[]).filter(v=>G.flags['cave'+v.id]).length;
 $('#bmcap').textContent=G.cave
  ?'Mağaranın içi · Keşfedilen: %'+Math.round(explored()*100)+' · Konum: '+Math.floor(G.px)+', '+Math.floor(G.py)+cur+' · M veya Esc: kapat'
  :'Harita · Sektör '+sec+' · Konum: '+Math.floor(G.px)+', '+Math.floor(G.py)+' · Rakım: '+Math.max(0,gz).toFixed(1)+' m · Keşfedilen: %'+Math.round(explored()*100)+' · Köy '+fv+' · Mağara '+fc+(G.wp?' · Hedef: '+Math.round(Math.hypot(G.wp.x-G.px,G.wp.y-G.py))+' m':'')+cur+'\n◆ kamp · ▲ mağara · ■ köy · ⚑ hedef · Tekerlek: yakınlaş · Sürükle: kaydır · Tık: hedef işaretle · Çift tık: sıfırla · M/Esc: kapat';
}
Object.assign(HG,{mapBuild:build,mapMini:mini,mapBig:big,mapOpen:open,mapExplore:explore,mapExplored:explored});
})();
