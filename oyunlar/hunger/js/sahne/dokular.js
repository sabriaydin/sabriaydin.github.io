/* Hunger 3D - sahne: prosedürel dokular (arazi detayı, su normal haritası, parlama sprite'ı) */
(()=>{
'use strict';
const {hash,clamp}=HG;
const sc=HG.sc;
const tex=sc.tex={};

/* Dikişsiz (tekrarlanabilir) değer gürültüsü: periyot p */
function pnoise(x,y,p,s){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const m=n=>((n%p)+p)%p;
 const a=hash(m(xi),m(yi),s),b=hash(m(xi+1),m(yi),s),c=hash(m(xi),m(yi+1),s),d=hash(m(xi+1),m(yi+1),s);
 return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function tiledHeight(size,oct,seed){
 const h=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let t=0,a=.5,tot=0;
  for(let o=0;o<oct.length;o++){const p=oct[o];t+=a*pnoise(x/size*p,y/size*p,p,seed+o*13);tot+=a;a*=.55}
  h[y*size+x]=t/tot;
 }
 return h;
}
function canvasTex(size,fill,enc){
 const c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d'),im=g.createImageData(size,size);
 fill(im.data,size);g.putImageData(im,0,0);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
 if(enc)t.encoding=enc;
 return t;
}

/* Arazi detayı: açık-koyu benek + ince tanecik (renkle çarpılır, çıkıntı haritası olarak da kullanılır) */
{
 const size=256,h=tiledHeight(size,[6,14,32,64],5);
 tex.detail=canvasTex(size,(d)=>{
  for(let i=0;i<size*size;i++){
   const g=hash(i%size,(i/size)|0,91),v=clamp(.72+h[i]*.42+(g-.5)*.1,0,1)*255;
   d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;
  }
 },THREE.LinearEncoding);
}
/* ---- Gerçekçi yüzey dokuları: çim, toprak/kabuk, kaya, kum (RGB: renk çarpanı, A: yükseklik). Dikişsiz, 512 px.
   Shader (gerceklik.js) bunları dünya koordinatında, malzemenin rengine göre karıştırarak uygular. ---- */
{
 const pn2=(x,y,px,py,s)=>{
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const mx=n=>((n%px)+px)%px,my=n=>((n%py)+py)%py;
  const a=hash(mx(xi),my(yi),s),b=hash(mx(xi+1),my(yi),s),c=hash(mx(xi),my(yi+1),s),d=hash(mx(xi+1),my(yi+1),s);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
 };
 /* çok katmanlı gürültü: px,py temel periyotlar (yatay/dikey), oktav sayısı */
 const fb=(u,v,px,py,oct,s)=>{let t=0,a=.5,tot=0,fx=px,fy=py;for(let o=0;o<oct;o++){t+=a*pn2(u*fx,v*fy,fx,fy,s+o*7);tot+=a;a*=.52;fx*=2;fy*=2}return t/tot};
 /* hücresel (Worley) çatlak alanı: F2-F1 */
 const worley=(size,cells,s)=>{
  const px=new Float32Array(cells*cells),py=new Float32Array(cells*cells);
  for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){px[j*cells+i]=i+hash(i,j,s);py[j*cells+i]=j+hash(i,j,s+3)}
  const out=new Float32Array(size*size),k=cells/size;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const fx=x*k,fy=y*k,cx=Math.floor(fx),cy=Math.floor(fy);let f1=9,f2=9;
   for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
    const gx=((cx+i)%cells+cells)%cells,gy=((cy+j)%cells+cells)%cells;
    const dx=px[gy*cells+gx]+(cx+i-gx)-fx,dy=py[gy*cells+gx]+(cy+j-gy)-fy,d=dx*dx+dy*dy;
    if(d<f1){f2=f1;f1=d}else if(d<f2)f2=d;
   }
   out[y*size+x]=Math.sqrt(f2)-Math.sqrt(f1);
  }
  return out;
 };
 const pbr=(size,fn,norm)=>{
  const t=canvasTex(size,(d)=>{
   let sum=0;const buf=norm?new Float32Array(size*size*4):null;
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const r=fn(x/size,y/size,x,y),i=(y*size+x)*4;
    if(norm){buf[i]=r[0];buf[i+1]=r[1];buf[i+2]=r[2];buf[i+3]=r[3];sum+=r[0]*.3+r[1]*.59+r[2]*.11}
    else{d[i]=clamp(r[0],0,1)*255;d[i+1]=clamp(r[1],0,1)*255;d[i+2]=clamp(r[2],0,1)*255;d[i+3]=clamp(r[3],0,1)*255}
   }
   if(norm){const k=norm/(sum/(size*size));                    /* ortalama parlaklığı hedefe getirir: dokular malzeme rengiyle çarpıldığından renk ve parlaklık korunur */
    for(let i=0;i<size*size;i++){d[i*4]=clamp(buf[i*4]*k,0,1)*255;d[i*4+1]=clamp(buf[i*4+1]*k,0,1)*255;d[i*4+2]=clamp(buf[i*4+2]*k,0,1)*255;d[i*4+3]=clamp(buf[i*4+3],0,1)*255}}
  },THREE.LinearEncoding);
  t.anisotropy=8;return t;
 };
 const SZ=512;
 const smooth01=(v,a,b)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
/* çim: tek tek eğri çimen yaprakları (koyu diplerden açık uçlara), öbek ve sararma değişimi; dikişsiz */
 tex.pGrass=(()=>{
  const N=SZ,R=new Float32Array(N*N),G=new Float32Array(N*N),B=new Float32Array(N*N),Hh=new Float32Array(N*N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   const u=x/N,v=y/N,cl=fb(u,v,9,9,3,121),dry=fb(u,v,5,5,2,131),i=y*N+x,l=.3+.1*cl;
   R[i]=l*(1.05+.18*dry);G[i]=l*(1.08-.1*dry);B[i]=l*.62;Hh[i]=.2+.1*cl;
  }
  const nb=2600;
  for(let k=0;k<nb;k++){
   const bx=hash(k,1,701)*N,by=hash(k,2,701)*N,len=12+hash(k,3,701)*30,ang=(hash(k,4,701)-.5)*.9,cur=(hash(k,5,701)-.5)*.9,wd=.9+hash(k,6,701)*1.5,
    tone=hash(k,7,701),dryk=hash(k,8,701)>.88?1:0,lum=.9+hash(k,9,701)*.3;
   const steps=Math.ceil(len*1.4);
   for(let s2=0;s2<=steps;s2++){
    const t=s2/steps,d=t*len,dx=Math.sin(ang+cur*t)*d,dy=-Math.cos(ang+cur*t*.6)*d,w=wd*(1-t*t*.85)*.55+.28;
    const cx=bx+dx,cy=by+dy;
    const base=.32+.4*t*(.7+tone*.5),r0=base*(dryk?1.35:.88+tone*.2)*lum,g0=base*(dryk?1.12:1.12-tone*.1)*lum,b0=base*(dryk?.62:.55+tone*.12)*lum;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
     if(ox*ox+oy*oy>w*w+.35)continue;
     const px=((Math.round(cx+ox)%N)+N)%N,py=((Math.round(cy+oy)%N)+N)%N,i=py*N+px,hv=.3+.65*t;
     if(hv>=Hh[i]*.82){R[i]=r0;G[i]=g0;B[i]=b0;Hh[i]=hv*(1-.18*(ox*ox+oy*oy>.5?1:0))}
    }
   }
  }
  const t=canvasTex(N,(d)=>{for(let i=0;i<N*N;i++){d[i*4]=clamp(R[i]*1.12,0,1)*255;d[i*4+1]=clamp(G[i]*1.12,0,1)*255;d[i*4+2]=clamp(B[i]*1.28,0,1)*255;d[i*4+3]=clamp(Hh[i],0,1)*255}},THREE.LinearEncoding);
  t.anisotropy=8;return t;
 })();
 /* ağaç kabuğu: derin dikey çatlak ağı, aralarında pullu levhalar, kısa yatay çatlaklar, hafif liken lekeleri */
 tex.pBark=pbr(SZ,(u,v)=>{
  const wu=u+(fb(u,v,6,3,2,501)-.5)*.045,wv=v+(fb(u,v,4,4,2,503)-.5)*.1;
  const r1=Math.abs(fb(wu,wv,12,3,4,201)-.5)*2,fur=1-smooth01(r1,0,.13);
  const r2=Math.abs(fb(wu+.31,wv,22,3,3,205)-.5)*2,fur2=(1-smooth01(r2,0,.1))*.55;
  const plate=fb(wu,wv,44,12,3,211),fib=fb(u,v,120,5,2,213);
  const cross=(1-smooth01(Math.abs(fb(wu,wv,26,46,2,221)-.5)*2,0,.09))*(1-fur);
  const f=Math.min(1,fur+fur2*(1-fur));
  const h=clamp(.82-f*.55-cross*.22+plate*.22+fib*.12,0,1);
  const li=smooth01(fb(u,v,5,5,3,231),.66,.84)*.7;
  const l=.5+(h-.74)*1.05-(f>.5?.05:0);
  return [l*(1.07-.12*li),l*(1+.03*li),l*(.86-.04*li),h];
 },.5);
 /* kaya: yontulmuş yüzeyler, katmanlı tabakalar, hücresel çatlaklar, çukurcuklar ve tanecik; nötr gri, hafif sıcak-soğuk lekeler */
 {
  const w=worley(SZ,7,301),w2=worley(SZ,16,305);
  tex.pRock=pbr(SZ,(u,v,x,y)=>{
   const rid=Math.abs(fb(u,v,6,6,5,311)-.5)*2,strata=Math.sin((v*11+fb(u,v,3,3,2,321)*2.2)*Math.PI*2)*.5+.5,grain=fb(u,v,140,140,2,331),fr=fb(u,v,14,14,3,351);
   const wk=w[((y+Math.round((fr-.5)*60))%SZ+SZ)%SZ*SZ+((x+Math.round((fb(u,v,16,16,3,361)-.5)*60))%SZ+SZ)%SZ];
   const crack=(1-Math.min(1,wk*15))*(.35+.65*smooth01(fb(u,v,5,5,3,371),.35,.65));
   const fc=w2[(y*SZ+x)],plateau=smooth01(fc,.02,.16);                         /* küçük kırık yüzler: kenarlarda koyu çizgi */
   const pit=smooth01(fb(u,v,70,70,2,381),.7,.82);
   const h=clamp(.5+(1-rid)*.26+strata*.12+grain*.14-crack*.3-(1-plateau)*.12-pit*.14,0,1),l=.5+(h-.52)*1.05-crack*.06+(grain-.5)*.14;
   const tint=fb(u,v,4,4,2,341),rust=smooth01(fb(u,v,7,7,3,391),.62,.8);
   return [l*(1+.05*(tint-.5)*2+.07*rust),l*(1-.01*(tint-.5)*2-.03*rust),l*(1-.06*(tint-.5)*2-.09*rust),h];
  },.5);
 }
  /* kum: dalgacıklar ve ince tane */
 tex.pSand=pbr(SZ,(u,v)=>{
  const wave=Math.sin((v*14+fb(u,v,5,5,3,401)*3.2)*Math.PI*2)*.5+.5,grain=fb(u,v,220,220,2,411),pat=fb(u,v,7,7,3,421);
  const h=clamp(.45+wave*.25+grain*.25+pat*.2,0,1),l=.5+(h-.5)*.55+(pat-.5)*.1;
  return [l*1.04,l,l*.93,h];
 });
}
/* toprak: kuru çatlaklar, çakıl taşları, yaprak çöpü (ormanlık ve çıplak yamalar) */
{
 const SZ2=512,pn=(x,y,px,py,sd)=>{
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const mx=n=>((n%px)+px)%px,my=n=>((n%py)+py)%py;
  const a=hash(mx(xi),my(yi),sd),b=hash(mx(xi+1),my(yi),sd),c=hash(mx(xi),my(yi+1),sd),d=hash(mx(xi+1),my(yi+1),sd);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
 };
 const f=(u,v,px,py,oct,sd)=>{let t=0,a=.5,tot=0,fx=px,fy=py;for(let o=0;o<oct;o++){t+=a*pn(u*fx,v*fy,fx,fy,sd+o*7);tot+=a;a*=.52;fx*=2;fy*=2}return t/tot};
 const cells=11,wx=new Float32Array(cells*cells),wy=new Float32Array(cells*cells);
 for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){wx[j*cells+i]=i+hash(i,j,601);wy[j*cells+i]=j+hash(i,j,603)}
 const crackAt=(u,v)=>{
  const fx=u*cells,fy=v*cells,cx=Math.floor(fx),cy=Math.floor(fy);let f1=9,f2=9;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
   const gx=((cx+i)%cells+cells)%cells,gy=((cy+j)%cells+cells)%cells,dx=wx[gy*cells+gx]+(cx+i-gx)-fx,dy=wy[gy*cells+gx]+(cy+j-gy)-fy,d=dx*dx+dy*dy;
   if(d<f1){f2=f1;f1=d}else if(d<f2)f2=d;
  }
  return Math.sqrt(f2)-Math.sqrt(f1);
 };
 const t=canvasTex(SZ2,(d)=>{
  for(let y=0;y<SZ2;y++)for(let x=0;x<SZ2;x++){
   const u=x/SZ2,v=y/SZ2,base=f(u,v,12,12,4,611),fine=f(u,v,160,160,2,621),wu=u+(f(u,v,9,9,3,691)-.5)*.06,wv=v+(f(u,v,9,9,3,693)-.5)*.06,crack=(1-Math.min(1,crackAt(wu,wv)*18))*Math.max(0,f(u,v,4,4,2,695)*1.7-.45);
   const gx=Math.floor(u*36),gy=Math.floor(v*36);let peb=0,pc=0;
   if(hash(gx,gy,631)>.62){const dx=u*36-gx-(.25+hash(gx,gy,641)*.5),dy=v*36-gy-(.25+hash(gx,gy,651)*.5),r=.13+hash(gx,gy,661)*.16,dd=Math.hypot(dx,dy*1.2)/r;if(dd<1){peb=Math.sqrt(1-dd*dd);pc=hash(gx,gy,671)}}
   const lit=Math.max(0,f(u,v,64,28,3,681)-.6)*3.4;
   const hgt=clamp(.42+base*.28+fine*.2-crack*.18+peb*.55,0,1),l=.5+(hgt-.5)*.8-crack*.06+peb*(pc-.5)*.25;
   const i=(y*SZ2+x)*4;
   d[i]=clamp(l*(1.06+lit*.38+peb*(pc>.5?.12:-.02)),0,1)*255;d[i+1]=clamp(l*(1-lit*.1),0,1)*255;d[i+2]=clamp(l*(.86-lit*.4+peb*(pc>.5?-.05:.08)),0,1)*255;d[i+3]=clamp(hgt,0,1)*255;
  }
 },THREE.LinearEncoding);
 t.anisotropy=8;tex.pDirt=t;
}
/* Birinci kişi kolları için dikişsiz dokular (nesne uzayında kullanılır): deri (gözenek, ince kırışıklık) ve dokuma kumaş (iplik örgüsü) */
{
 const SZ=256,pw=(u,v,px,py,s)=>pnoise(u*px,v*py,Math.round(px),s),clamp01=v=>v<0?0:v>1?1:v;
 const mk=(fn)=>{const t=canvasTex(SZ,(d)=>{for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const r=fn(x/SZ,y/SZ),i=(y*SZ+x)*4;d[i]=clamp01(r[0])*255;d[i+1]=clamp01(r[1])*255;d[i+2]=clamp01(r[2])*255;d[i+3]=clamp01(r[3])*255}},THREE.LinearEncoding);t.anisotropy=8;return t};
 /* deri: çok ince gözenek, çapraz kırışıklık çizgileri, hafif lekelenme (düşük karşıtlık: yakından bakınca gürültü gibi görünmez) */
 tex.pSkin=mk((u,v)=>{
  const l1=Math.abs(pw(u,v,18,18,831)-.5)*2,l2=Math.abs(pw(u+.3,v,16,16,841)-.5)*2,fine=pw(u,v,48,48,851),fine2=pw(u,v,110,110,857);
  const line=Math.max(0,1-Math.min(l1,l2)*6)*.32;
  const h=clamp01(.62+fine*.16+fine2*.07-line*.2);
  const l=.5+(h-.5)*.45;
  return [l*1.02,l*.99,l*.96,h];                      /* büyük ölçekli lekelenme yok: parçalar farklı yerel eksenlerde olduğundan eklemlerde basamak oluşturur */
 });
 /* kumaş: bir üstten bir alttan geçen iplikler (bez dokuma), iplik kalınlığı değişimi */
 tex.pCloth=mk((u,v)=>{
  const N=40,fu=u*N,fv=v*N,iu=Math.floor(fu),iv=Math.floor(fv),a=fu-iu,b=fv-iv,chk=(iu+iv)&1;
  const wu=Math.sin(a*Math.PI),wv=Math.sin(b*Math.PI);                     /* çözgü ve atkı iplikleri */
  const over=chk?wu*(.55+.45*wv*.5):wv*(.55+.45*wu*.5),under=chk?wv:wu;
  const h=clamp01(.35+over*.5+under*.1+(hash(iu,iv,871)-.5)*.1+(pw(u,v,120,120,881)-.5)*.1);
  const th=.9+hash(chk?iu:iv,chk?0:1,891)*.2,l=.5+(h-.5)*.8;
  return [l*th,l*th,l*th,h];
 });
}
/* Yaprak kümesi: şeffaf boşluklu, uçlu, damarlı ve renk tonu değişen yaprak şekilleri (ağaç yapraklarının kenarını parçalar). Dikişsiz: kenarlara taşan yapraklar karşı tarafa da çizilir. */
{
 const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d');
 const leaf=(x,y,r,ang,v,hue)=>{
  g.save();g.translate(x,y);g.rotate(ang);
  const s=255*v,rr=Math.round(s*(1+hue*.22)),gg=Math.min(255,Math.round(s*1.07)),bb=Math.round(s*(.8-hue*.2)),w=r*.46;
  const gr=g.createLinearGradient(0,-w,0,w);gr.addColorStop(0,'rgb('+Math.min(255,Math.round(rr*1.12))+','+Math.min(255,Math.round(gg*1.1))+','+Math.round(bb*1.05)+')');gr.addColorStop(1,'rgb('+Math.round(rr*.82)+','+Math.round(gg*.84)+','+Math.round(bb*.8)+')');
  g.fillStyle=gr;
  g.beginPath();g.moveTo(-r,0);g.bezierCurveTo(-r*.5,-w*1.15,r*.35,-w*1.0,r,0);g.bezierCurveTo(r*.35,w*1.0,-r*.5,w*1.15,-r,0);g.fill();
  g.strokeStyle='rgba('+Math.round(rr*.55)+','+Math.round(gg*.62)+','+Math.round(bb*.5)+',.85)';g.lineWidth=Math.max(.7,r*.06);
  g.beginPath();g.moveTo(-r*.95,0);g.lineTo(r*.92,0);g.stroke();
  g.lineWidth=Math.max(.5,r*.035);g.globalAlpha=.55;
  for(let k=1;k<=3;k++){const px=-r*.55+k*r*.3;g.beginPath();g.moveTo(px,0);g.lineTo(px+r*.2,-w*.62);g.moveTo(px,0);g.lineTo(px+r*.2,w*.62);g.stroke()}
  g.restore();
 };
 for(let i=0;i<150;i++){
  const x=hash(i,1,501)*size,y=hash(i,2,501)*size,r=10+hash(i,3,501)*13,a=hash(i,4,501)*6.2832,v=.38+hash(i,5,501)*.3,hu=hash(i,6,501)-.5;
  for(const ox of [-size,0,size])for(const oy of [-size,0,size])if(x+ox>-r*2&&x+ox<size+r*2&&y+oy>-r*2&&y+oy<size+r*2)leaf(x+ox,y+oy,r,a,v,hu);
 }
 tex.pLeaf=new THREE.CanvasTexture(c);tex.pLeaf.wrapS=tex.pLeaf.wrapT=THREE.RepeatWrapping;tex.pLeaf.anisotropy=4;
}
/* Su normal haritası */
{
 const size=256,h=tiledHeight(size,[8,16,32],17),k=2.6;
 tex.waterN=canvasTex(size,(d)=>{
  const at=(x,y)=>h[((y+size)%size)*size+((x+size)%size)];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const dx=(at(x+1,y)-at(x-1,y))*k,dy=(at(x,y+1)-at(x,y-1))*k,l=Math.hypot(dx,dy,1);
   const i=(y*size+x)*4;d[i]=(-dx/l*.5+.5)*255;d[i+1]=(-dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255;
  }
 },THREE.LinearEncoding);
}
/* Yumuşak parlama (ateş, işaretçi) */
{
 const c=document.createElement('canvas');c.width=c.height=64;
 const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=gr;g.fillRect(0,0,64,64);
 tex.glow=new THREE.CanvasTexture(c);
}
})();
