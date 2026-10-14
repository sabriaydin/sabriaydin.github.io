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
 const pbr=(size,fn)=>{
  const t=canvasTex(size,(d)=>{
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const r=fn(x/size,y/size,x,y),i=(y*size+x)*4;
    d[i]=clamp(r[0],0,1)*255;d[i+1]=clamp(r[1],0,1)*255;d[i+2]=clamp(r[2],0,1)*255;d[i+3]=clamp(r[3],0,1)*255;
   }
  },THREE.LinearEncoding);
  t.anisotropy=8;return t;
 };
 const SZ=512;
 /* çim: sık yaprak çizgileri, öbekler, sararmış ve koyu bölgeler */
 tex.pGrass=pbr(SZ,(u,v)=>{
  const blade=fb(u,v,96,40,3,101),fine=fb(u,v,200,200,2,111),clump=fb(u,v,9,9,3,121),dry=fb(u,v,5,5,2,131);
  const h=clamp(.15+blade*.5+fine*.25+clump*.3,0,1),l=.5+(h-.5)*.8-(1-clump)*.08;
  return [l*(1+.2*dry),l*(1.04-.1*dry),l*(.86-.14*dry),h];
 });
 /* toprak ve ağaç kabuğu: dikey çatlaklı sırtlar ve lifler */
 tex.pBark=pbr(SZ,(u,v)=>{
  const ridge=Math.abs(fb(u,v,18,3,4,201)-.5)*2,fiber=fb(u,v,70,6,2,211),crack=1-Math.min(1,Math.abs(fb(u,v,10,2,3,221)-.5)*9),spot=fb(u,v,6,6,2,231);
  const h=clamp(.8-ridge*.65+fiber*.12-crack*.35,0,1),l=.5+(h-.5)*.85-crack*.1+(spot-.5)*.16;
  return [l*(1.05+.08*spot),l,l*(.9-.08*spot),h];
 });
 /* kaya: katmanlı tabakalar, hücresel çatlaklar, tanecik */
 {
  const w=worley(SZ,7,301);
  tex.pRock=pbr(SZ,(u,v,x,y)=>{
   const rid=Math.abs(fb(u,v,6,6,5,311)-.5)*2,strata=Math.sin((v*9+fb(u,v,3,3,2,321)*1.8)*Math.PI*2)*.5+.5,crack=1-Math.min(1,w[y*SZ+x]*7.5),grain=fb(u,v,120,120,2,331);
   const h=clamp(.55+(1-rid)*.28+strata*.12+grain*.12-crack*.5,0,1),l=.5+(h-.5)*.8-crack*.12+(grain-.5)*.1;
   const tint=fb(u,v,4,4,2,341);
   return [l*(1+.06*(tint-.5)*2),l*(1-.02*(tint-.5)*2),l*(1-.1*(tint-.5)*2),h];
  });
 }
 /* kum: dalgacıklar ve ince tane */
 tex.pSand=pbr(SZ,(u,v)=>{
  const wave=Math.sin((v*14+fb(u,v,5,5,3,401)*3.2)*Math.PI*2)*.5+.5,grain=fb(u,v,220,220,2,411),pat=fb(u,v,7,7,3,421);
  const h=clamp(.45+wave*.25+grain*.25+pat*.2,0,1),l=.5+(h-.5)*.55+(pat-.5)*.1;
  return [l*1.04,l,l*.93,h];
 });
}
/* Yaprak kümesi: şeffaf boşluklu, damarlı yaprak şekilleri (ağaç yapraklarının kenarını parçalar). Dikişsiz: kenarlara taşan yapraklar karşı tarafa da çizilir. */
{
 const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d');
 const leaf=(x,y,r,ang,v)=>{
  g.save();g.translate(x,y);g.rotate(ang);
  const s=Math.round(255*v);
  g.fillStyle='rgb('+s+','+Math.min(255,s+14)+','+Math.round(s*.82)+')';
  g.beginPath();g.ellipse(0,0,r,r*.42,0,0,6.2832);g.fill();
  g.strokeStyle='rgb('+Math.round(s*.6)+','+Math.round(s*.68)+','+Math.round(s*.5)+')';g.lineWidth=Math.max(1,r*.07);
  g.beginPath();g.moveTo(-r*.9,0);g.lineTo(r*.9,0);g.stroke();
  g.restore();
 };
 for(let i=0;i<150;i++){
  const x=hash(i,1,501)*size,y=hash(i,2,501)*size,r=11+hash(i,3,501)*13,a=hash(i,4,501)*6.2832,v=.4+hash(i,5,501)*.28;
  for(const ox of [-size,0,size])for(const oy of [-size,0,size])if(x+ox>-r*2&&x+ox<size+r*2&&y+oy>-r*2&&y+oy<size+r*2)leaf(x+ox,y+oy,r,a,v);
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
