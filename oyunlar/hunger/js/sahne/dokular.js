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
