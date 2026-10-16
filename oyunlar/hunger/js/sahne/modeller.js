/* Hunger 3D - sahne: yüksek ayrıntılı model tanımları (ağaç, kaya, maden, yapılar) — pürüzsüz gölgeleme, gürültü ile bozulmuş formlar */
(()=>{
'use strict';
const {O,hash}=HG;
const sc=HG.sc,S=HG.Scene;
/* --- gürültü: 3B değer gürültüsü --- */
const h3=(x,y,z,s)=>hash(x*73+z*179+s*31,y*131+s,s*7+x*3);
function vn3(x,y,z,s){
 const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(h3(xi,yi,zi,s),h3(xi+1,yi,zi,s),u),L(h3(xi,yi+1,zi,s),h3(xi+1,yi+1,zi,s),u),v),L(L(h3(xi,yi,zi+1,s),h3(xi+1,yi,zi+1,s),u),L(h3(xi,yi+1,zi+1,s),h3(xi+1,yi+1,zi+1,s),u),v),w);
}
const fb3=(x,y,z,s)=>vn3(x,y,z,s)*.6+vn3(x*2.1,y*2.1,z*2.1,s+5)*.28+vn3(x*4.3,y*4.3,z*4.3,s+9)*.12;

/* --- geometri yardımcıları --- */
const M4=(x,y,z,sx,sy,sz,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy||1,sz||1));
const part=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz,jit)=>({geo,c,m:M4(x,y,z,sx,sy,sz,rx,ry,rz),jit});
const alongPart=(geo,c,from,dir,len,sx,sz)=>{
 const d=dir.clone().normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d),p=from.clone().addScaledVector(d,len/2);
 return {geo,c,m:new THREE.Matrix4().compose(p,q,new THREE.Vector3(sx||1,1,sz||1))};
};
/* Aynı konumdaki köşeleri birleştirir ve yumuşak normaller hesaplar */
function weld(g){
 const p=g.attributes.position,map=new Map(),pos=[],idx=[];
 const src=g.index;
 const n=src?src.count:p.count;
 for(let t=0;t<n;t++){
  const i=src?src.getX(t):t,x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*5e3)+','+Math.round(y*5e3)+','+Math.round(z*5e3);
  let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(x,y,z)}idx.push(j);
 }
 const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setIndex(idx);o.computeVertexNormals();return o;
}
/* Gürültü ile şişirilmiş küre (yaprak öbeği, kaya, çalı) */
function blob(r,detail,amp,seed,sx,sy,sz){
 const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+(fb3(x*1.7+seed,y*1.7,z*1.7,seed|0)-.5)*2*amp;
  p.setXYZ(i,x*d*r*(sx||1),y*d*r*(sy||1),z*d*r*(sz||1));
 }
 return weld(g);
}
/* Yuvarlatılmış kutu: dilimli kutuyu küreye doğru yumuşatır */
function rbox(w,h,d,k,seg){
 const g=new THREE.BoxGeometry(w,h,d,seg||3,seg||3,seg||3),p=g.attributes.position,v=new THREE.Vector3();
 const r=Math.min(w,h,d)*(k||.18);
 for(let i=0;i<p.count;i++){
  v.set(p.getX(i),p.getY(i),p.getZ(i));
  const ix=Math.max(-1,Math.min(1,v.x/(w/2-r))),iy=Math.max(-1,Math.min(1,v.y/(h/2-r))),iz=Math.max(-1,Math.min(1,v.z/(d/2-r)));
  const cx=ix*(w/2-r),cy=iy*(h/2-r),cz=iz*(d/2-r),dx=v.x-cx,dy=v.y-cy,dz=v.z-cz,l=Math.hypot(dx,dy,dz)||1;
  p.setXYZ(i,cx+dx/l*r,cy+dy/l*r,cz+dz/l*r);
 }
 return weld(g);
}
/* Dilimli, hafif bozulmuş koni/silindir */
function warp(g,amp,seed,radial){
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=(fb3(x*3+seed,y*3,z*3,seed|0)-.5)*2*amp;
  if(radial){const l=Math.hypot(x,z)||1;p.setXYZ(i,x+x/l*n,y+n*.3,z+z/l*n)}else p.setXYZ(i,x+n,y,z+n);
 }
 return weld(g);
}
/* Birleştirme: indeksli/indekssiz geometri, köşe başına renk değişimi, sahte ortam kararması */
function merge(parts,opt){
 opt=opt||{};
 const pos=[],nor=[],cl=[],idx=[];let off=0;
 const jd=opt.jit===undefined?.12:opt.jit;
 for(const p of parts){
  const g=p.geo.clone();g.applyMatrix4(p.m);
  if(!g.attributes.normal)g.computeVertexNormals();
  const pa=g.attributes.position,na=g.attributes.normal,c=sc.col(p.c),j=p.jit===undefined?jd:p.jit,cf=p.cf||opt.cf;
  const tmp=new THREE.Color();
  for(let i=0;i<pa.count;i++){
   const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),nx=na.getX(i),ny=na.getY(i),nz=na.getZ(i);
   pos.push(x,y,z);nor.push(nx,ny,nz);
   const v=1+(fb3(x*5,y*5,z*5,3)-.5)*2*j;
   tmp.copy(c);if(cf)cf(x,y,z,nx,ny,nz,tmp);
   cl.push(tmp.r*v,tmp.g*v,tmp.b*v);
  }
  if(g.index){for(let i=0;i<g.index.count;i++)idx.push(g.index.getX(i)+off)}
  else for(let i=0;i<pa.count;i++)idx.push(i+off);
  off+=pa.count;g.dispose();
 }
 /* yükseklik tabanlı sahte AO: alt kısımlar koyulaşır */
 if(opt.ao){
  let mn=1e9,mx=-1e9;for(let i=1;i<pos.length;i+=3){mn=Math.min(mn,pos[i]);mx=Math.max(mx,pos[i])}
  for(let i=0;i<cl.length/3;i++){const t=(pos[i*3+1]-mn)/Math.max(.01,mx-mn),f=opt.ao+(1-opt.ao)*Math.pow(t,.8);cl[i*3]*=f;cl[i*3+1]*=f;cl[i*3+2]*=f}
 }
 const o=new THREE.BufferGeometry();
 o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
 o.setIndex(idx);
 return o;
}
const cyl=(a,b,h,n,hs)=>new THREE.CylinderGeometry(a,b,h,n||8,hs||1),cone=(r,h,n,hs)=>new THREE.ConeGeometry(r,h,n||8,hs||1),ico=(r,d)=>new THREE.IcosahedronGeometry(r,d===undefined?1:d),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);

/* palmiye yaprağı: ortası kıvrık, uca doğru incelen, aşağı sarkan şerit */
function frond(len,wid,droop,seg){
 const pos=[],idx=[];seg=seg||8;
 for(let i=0;i<=seg;i++){
  const t=i/seg,x=t*len,y=Math.sin(t*1.7)*len*.30-droop*t*t*len,w=wid*Math.pow(1-t,.55)*(.35+.65*Math.sin(Math.min(1,t*1.6+.1)*Math.PI*.5));
  pos.push(x,y+.04,0, x,y-.02,-w, x,y-.02,w);
 }
 for(let i=0;i<seg;i++){const a=i*3,b=a+3;idx.push(a,a+1,b, b,a+1,b+1, a,b,a+2, b,b+2,a+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}

/* Kırık taş: düzensiz, düzlemlerle kesilmiş (taze kırık yüzler), sivri uca doğru incelen, yosun-pas-tuz lekeli.
   sx,sy,sz: yarı boyutlar; dönüş: {geo, cf, cuts}. cf, merge() içinde köşe renklerini üretir. */
function stone(sx,sy,sz,seed,o){
 o=o||{};
 const g=new THREE.IcosahedronGeometry(1,o.detail||5),p=g.attributes.position,nc=o.cuts===undefined?5:o.cuts,cuts=[];
 const ext=n=>Math.hypot(n[0]*sx,n[1]*sy,n[2]*sz);
 for(let k=0;k<nc;k++){
  const a=hash(k,1,seed|0)*6.2832,b=Math.acos(hash(k,2,seed|0)*2-1);
  const n=[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];
  cuts.push({n,c:(.66+hash(k,3,seed|0)*.18)*ext(n)});
 }
 const tp=o.taper||0,amp=o.amp===undefined?.26:o.amp;
 for(let i=0;i<p.count;i++){
  let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const w=1+(fb3(x*1.3+seed,y*1.3,z*1.3,seed|0)-.5)*2*amp,rg=1-Math.abs(fb3(x*2.6+seed*.7,y*2.6,z*2.6,(seed+4)|0)*2-1),d=w*(1+(rg*rg-.3)*.16);
  let X=x*sx*d,Y=y*sy*d,Z=z*sz*d;
  if(tp){const t=Math.max(0,X/sx),k=1-tp*t*t*(.6+.4*t);Y*=k;Z*=k;X*=1+tp*.18*t}      /* +X ucu sivrilir */
  if(o.wedge){const t=Math.max(0,X/sx);Z*=1-o.wedge*t*t}                                /* +X ucu inceltilir (balta ağzı) */
  for(const c of cuts){const s=X*c.n[0]+Y*c.n[1]+Z*c.n[2]-c.c;if(s>0){X-=s*c.n[0];Y-=s*c.n[1];Z-=s*c.n[2]}}
  if(o.flat&&Y<-sy*o.flat)Y=-sy*o.flat;
  p.setXYZ(i,X,Y,Z);
 }
 const geo=weld(g),tone=o.tone||0;
 const lc=(c,r,gg,b,k)=>{r=Math.pow(r,2.2);gg=Math.pow(gg,2.2);b=Math.pow(b,2.2);c.r+=(r-c.r)*k;c.g+=(gg-c.g)*k;c.b+=(b-c.b)*k};      /* hedefler sRGB gösterimde, köşe renkleri doğrusal */
 const sm3=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v)};
 const cf=(x,y,z,nx,ny,nz,c)=>{
  const q=1/Math.max(sx,sy,sz)*.18,u=x*q*9,v=y*q*9,w=z*q*9;
  const n1=fb3(u+seed,v,w,seed|0),n2=fb3(u*3,v*3,w*3,(seed+3)|0),n3=fb3(u*.6,v*.6,w*.6,(seed+9)|0);
  const st=Math.sin(y/sy*5+x/sx*1.6+fb3(u*.4,v*.4,w*.4,(seed+1)|0)*4.5)*.5+.5;
  c.multiplyScalar(.8+n1*.34+(st-.5)*.14);
  if(n2>.72)c.multiplyScalar(.6+.15*n1);else if(n2<.2)c.multiplyScalar(1.2);                      /* koyu ve açık mineral taneleri */
  lc(c,.5+tone*.1,.36,.24,sm3(.6,.78,n3)*.34);                                                   /* pas lekesi */
  lc(c,.55,.56,.34,sm3(.7,.86,fb3(u*1.4+5,v*1.4,w*1.4,(seed+11)|0))*Math.max(0,.35+ny)*.5);      /* liken */
  for(const k of cuts){const s=x*k.n[0]+y*k.n[1]+z*k.n[2]-k.c;if(s>-.004*sx&&s<.004*sx){c.multiplyScalar(1.2);lc(c,.8,.78,.72,.12)}}   /* taze kırık yüz: açık renk */
  if(ny<-.35)c.multiplyScalar(.74);                                                                /* alt kısım gölgeli */
 };
 return {geo,cf,cuts};
}

const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
 /* Eğri boyunca incelen boru (gövde, kök, dal): yan yüzey kabuk girintileriyle oynatılır. pts: [[x,y,z],…], rf(t,y): yarıçap */
 function tube(pts,rf,seg,rings,ridge,seed){
  const cu=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),pos=[],idx=[],R=seg+1;
  const tg=new THREE.Vector3(),nr=new THREE.Vector3(),bn=new THREE.Vector3(),c=new THREE.Vector3();let pn=null;
  for(let i=0;i<=rings;i++){
   const t=i/rings;cu.getPointAt(t,c);cu.getTangentAt(t,tg);
   if(!pn){const up=Math.abs(tg.y)<.9;nr.set(up?0:1,up?1:0,0).cross(tg).normalize()}else nr.copy(pn).addScaledVector(tg,-pn.dot(tg)).normalize();
   pn=nr.clone();bn.crossVectors(tg,nr);
   const r0=rf(t,c.y);
   for(let j=0;j<=seg;j++){
    const a=j/seg*6.2832,ca=Math.cos(a),sa=Math.sin(a);
    let r=r0;if(ridge){const q=1-Math.abs(fb3(ca*2.1+seed,c.y*.22+seed*.3,sa*2.1,seed|0)*2-1);r*=1+ridge*(q*q-.35)}
    pos.push(c.x+(nr.x*ca+bn.x*sa)*r,c.y+(nr.y*ca+bn.y*sa)*r,c.z+(nr.z*ca+bn.z*sa)*r);
   }
  }
  for(let i=0;i<rings;i++)for(let j=0;j<seg;j++){const a=i*R+j,b=a+1,d=a+R,e=d+1;idx.push(a,d,b,b,d,e)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return weld(g);
 }
 /* Kök sivrilmeli gövde: yarıçap açıya da bağlıdır (yumuşak kök dilimleri, yukarı çıkıldıkça gövdeye karışır ve hafifçe burulur).
    tv: halka konumları (tabanda sıklaştırılır), roots: [{a,s,w}] kök yönü/gücü/genişliği, fl: taban sivrilme oranı, hh: sönme yüksekliği */
 function rootTube(pts,rf,seg,tv,ridge,seed,roots,fl,hh){
  const cu=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),pos=[],idx=[],R=seg+1,rings=tv.length-1;
  const tg=new THREE.Vector3(),nr=new THREE.Vector3(),bn=new THREE.Vector3(),c=new THREE.Vector3();let pn=null;
  for(let i=0;i<=rings;i++){
   const t=tv[i];cu.getPointAt(t,c);cu.getTangentAt(t,tg);
   if(!pn){const up=Math.abs(tg.y)<.9;nr.set(up?0:1,up?1:0,0).cross(tg).normalize()}else nr.copy(pn).addScaledVector(tg,-pn.dot(tg)).normalize();
   pn=nr.clone();bn.crossVectors(tg,nr);
   const r0=rf(t,c.y),F=fl*(c.y>0?Math.exp(-c.y/hh):1),tw=.28*Math.max(0,c.y);
   for(let j=0;j<=seg;j++){
    const a=j/seg*6.2832,ca=Math.cos(a),sa=Math.sin(a);
    let L=0;for(const q of roots){let d=a-q.a-tw;d-=6.2832*Math.round(d/6.2832);L+=q.s*Math.exp(-d*d/(2*q.w*q.w))}
    let r=r0*(1+F*Math.min(1.5,L));
    if(ridge){const q=1-Math.abs(fb3(ca*2.1+seed,c.y*.22+seed*.3,sa*2.1,seed|0)*2-1);r*=1+ridge*(q*q-.35)}
    pos.push(c.x+(nr.x*ca+bn.x*sa)*r,c.y+(nr.y*ca+bn.y*sa)*r,c.z+(nr.z*ca+bn.z*sa)*r);
   }
  }
  for(let i=0;i<rings;i++)for(let j=0;j<seg;j++){const a=i*R+j,b=a+1,d=a+R,e=d+1;idx.push(a,d,b,b,d,e)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return weld(g);
 }

/* stone() sonucunu konumlandırır: köşe renkleri yerel uzayda (konum ve y ekseni dönüşü hesaba katılarak) üretilir */
function stonePart(st,col,x,y,z,ry,extra){
 ry=ry||0;const c=Math.cos(ry),sn=Math.sin(ry),cf0=st.cf;
 const p=part(st.geo,col,x,y,z,1,1,1,0,ry,0,.08);
 p.cf=(X,Y,Z,nx,ny,nz,c2)=>{const lx=X-x,lz=Z-z;cf0(lx*c+lz*sn,Y-y,-lx*sn+lz*c,nx*c+nz*sn,ny,-nx*sn+nz*c,c2);if(extra)extra(X,Y,Z,nx,ny,nz,c2)};
 return p;
}
const sm01=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v)};
/* Balta başı: profili (x: ağız yönü, y: sap yönü) kalınlık boyunca çıkarılır, ağza doğru inceltilir */
let _axeG=null,_pickG=null;
function axeHeadGeo(){
 if(_axeG)return _axeG;
 const sh=new THREE.Shape(),P=[[-.045,-.035],[-.045,.035],[-.015,.042],[.025,.046],[.075,.07],[.118,.092],[.132,.05],[.136,0],[.132,-.05],[.118,-.092],[.075,-.07],[.025,-.046],[-.015,-.042]];
 sh.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)sh.lineTo(P[i][0],P[i][1]);
 const g=new THREE.ExtrudeGeometry(sh,{depth:.034,bevelEnabled:true,bevelThickness:.004,bevelSize:.003,bevelSegments:1,steps:1});
 g.translate(0,0,-.017);
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setZ(i,z*(1-.88*sm01(.02,.134,x)))}      /* ağza doğru kama biçimi */
 g.rotateY(-Math.PI/2);                                  /* x → +Z (ağız ileri), kalınlık → X */
 g.computeVertexNormals();                               /* dizinsiz: yüz başına normal, metal kenarlar keskin */
 return _axeG=g;
}
function pickHeadGeo(){
 if(_pickG)return _pickG;
 const g=tube([[0,.57,-.34],[0,.615,-.19],[0,.64,0],[0,.615,.19],[0,.57,.34]],t=>.005+.032*Math.pow(Math.sin(Math.PI*t),.75),8,16,0,0);
 return _pickG=g;
}
/* Alet parçaları: sap +Y ekseninde (y -.15….66), baş tepede, ağız +Z yönüne bakar. tier: 1 taş, 2 bakır, 3 demir.
   Dönüş: {wood, head, cord}: ayrı malzemelerle çizilecek üç part listesi */
function toolParts(kind,tier){
 const wood=[],head=[],cord=[];
 const grain=(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*80,y*5,z*80,9),g2=fb3(x*25,y*2,z*25,12);c.multiplyScalar(.8+g*.3+g2*.18);if(y<.3)c.multiplyScalar(.9)};
 if(kind==='rod'){
  const r=part(tube([[0,-.15,0],[0,.35,.02],[0,.95,.1]],t=>.017-.012*t,7,10,0,0),0x74502e,0,0,0,1,1,1,0,0,0,.05);r.cf=grain;wood.push(r);
  head.push(part(cyl(.021,.021,.2,8,1),0xb89258,0,-.02,0));head.push(part(cyl(.02,.02,.05,8),0x555560,0,.1,.005));
  const rl=part(cyl(.026,.026,.035,10),0x7a7a84,.032,.06,0,1,1,1,0,0,Math.PI/2);head.push(rl);
  return {wood,head,cord};
 }
 const hp=tube([[0,-.15,0],[.004,.2,-.003],[0,.66,0]],t=>.03-.011*t+.007*Math.exp(-t*30),8,12,0,0);
 const h=part(hp,0x74502e,0,0,0,1,1,1,0,0,0,.05);h.cf=grain;wood.push(h);
 wood.push(part(blob(.034,1,.1,5,1,1.2,1),0x7a4f29,0,-.15,0));                       /* sap ucu başlığı */
 const ring=(y,r)=>cord.push(part(new THREE.TorusGeometry(r,.0075,5,10),0x6b5232,0,y,0,1,1,1,Math.PI/2,0,0,.06));
 if(kind==='axe'){
  if(tier===1){
   const st=stone(.088,.072,.021,29,{cuts:5,detail:3,amp:.16,wedge:.9,taper:.12});
   head.push(stonePart(st,0x9c978e,0,.58,.06,-Math.PI/2));
   for(let i=0;i<4;i++)ring(.505+i*.016,.034);for(let i=0;i<3;i++)ring(.645-i*.016,.03);
   cord.push(part(box(.075,.012,.012),0x6b5232,0,.595,.04,1,1,1,0,0,.5),part(box(.075,.012,.012),0x6b5232,0,.595,.04,1,1,1,0,0,-.5));
  }else{
   const col=tier===2?0xdc8450:0xd4d9df;
   const hd=part(axeHeadGeo(),col,0,.585,.012,1,1,1,0,0,0,.04);
   hd.cf=(x,y,z,nx,ny,nz,c)=>{const e=sm01(.08,.14,z),n=fb3(x*60,y*60,z*60,7);c.multiplyScalar(.86+n*.22+e*.18);if(tier===2){const pat=sm01(.62,.78,fb3(x*14,y*14,z*14,3))*(1-e);c.r=c.r*(1-pat*.5)+.05*pat;c.g=c.g*(1-pat*.35)+.12*pat;c.b=c.b*(1-pat*.4)+.07*pat}else if(z<.0)c.multiplyScalar(.72)};
   head.push(hd);
   cord.push(part(cyl(.036,.036,.018,10),tier===2?0x7a4a22:0x4a4a52,0,.585,-.025));
  }
 }else if(kind==='pick'){
  if(tier===1){
   const st=stone(.34,.044,.034,31,{cuts:6,detail:3,amp:.12});
   head.push(stonePart(st,0x9c978e,0,.62,0,Math.PI/2));
   for(let i=0;i<5;i++)ring(.575+i*.018,.034);
   cord.push(part(box(.012,.012,.1),0x6b5232,0,.655,0,1,1,1,0,0,0));
  }else{
   const col=tier===2?0xdc8450:0xd4d9df,hd=part(pickHeadGeo(),col,0,0,0,1,1,1,0,0,0,.04);
   hd.cf=(x,y,z,nx,ny,nz,c)=>{const e=sm01(.2,.34,Math.abs(z)),n=fb3(x*60,y*60,z*60,7);c.multiplyScalar(.86+n*.22+e*.15);if(tier===2){const pat=sm01(.62,.78,fb3(x*14,y*14,z*14,3));c.r=c.r*(1-pat*.45)+.05*pat;c.g=c.g*(1-pat*.3)+.12*pat;c.b=c.b*(1-pat*.35)+.07*pat}};
   head.push(hd);head.push(part(rbox(.06,.08,.075,.3,2),tier===2?0xb0622e:0x9aa0a8,0,.628,0));
   ring(.55,.034);ring(.57,.033);
  }
 }
 return {wood,head,cord};
}
const MODEL=sc.MODEL={};
sc.g={cyl,cone,ico,box,merge,part,alongPart,blob,rbox,weld,warp,fb3,stone,tube,stonePart,toolParts};
S.onInit(()=>{
 /* ---- ağaçlar: oyuncunun (~1.8 m) birkaç katı boyunda; alt dallar göz hizasının üstünde başlar ---- */
 const bark=(x,y,z,nx,ny,nz,c)=>{
  const a=Math.atan2(x,z),v=.66+.68*vn3(a*5.5,y*.35,.7,8),w=.8+.3*vn3(a*2.2,y*1.2,2.1,4);
  c.r*=v*w;c.g*=v*w;c.b*=v*w;
  if(y<1.1){const m=Math.max(0,fb3(x*3,y*2.2,z*3,17)*1.5-.55)*Math.max(0,1.1-y)*.55;c.r=c.r*(1-m)+.1*m;c.g=c.g*(1-m)+.2*m;c.b=c.b*(1-m)+.05*m}   /* gövde dibinde yosun */
 };
 /* kök dilimleri: n yön (düzensiz aralık, farklı güç ve genişlik); halka konumları tabanda sıklaşır */
 const mkRoots=(n,seed,wk)=>{const r=[];for(let k=0;k<n;k++)r.push({a:k/n*6.2832+(hash(k,seed,3)-.5)*.7,s:.62+hash(k,seed,5)*.5,w:(.4+hash(k,seed,7)*.18)*wk});return r};
 const rootT=(n,p)=>{const tv=[];for(let i=0;i<=n;i++)tv.push(Math.pow(i/n,p));return tv};
 /* yere yayılan kök kolu: gövde yüzeyinden çıkar, yere oturarak incelir ve toprağa gömülür (yarı yuvarlak, ince ucu toprak altında) */
 const rootArm=(q,len,rad,hs,d0,seed)=>{
  const ca=Math.cos(q.a),sa=Math.sin(q.a),px=-sa,pz=ca,N=6,pts=[];
  const rr=s=>Math.max(.03,rad*Math.pow(1-s,.9)*.92+.02);
  for(let i=0;i<=N;i++){
   const s=i/N,d=d0+(len-d0)*Math.pow(s,.85),w=Math.sin(s*4.2+seed)*.12*len*s,y=rr(s)*.85+hs*Math.pow(1-s,3)-.12*s*s*s;
   pts.push([ca*d+px*w,y,sa*d+pz*w]);
  }
  return tube(pts,rr,8,9,.1,seed);
 };
 /* iğne yapraklı dal: yassı, ucu aşağı sarkan sivri demet; x ekseninde, tabanı x=0'da */
 const sprayC={};
 function spray(L,w,droop,sides,hs,seed){
  const key=[L,w,droop,sides,hs,seed].join('|');if(sprayC[key])return sprayC[key];
  const g=new THREE.ConeGeometry(w,L,sides,hs);g.rotateZ(-Math.PI/2);g.translate(L/2,0,0);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i),t=x/L;let y=p.getY(i)*.42-droop*t*t*L;
   const n=(fb3(x*2+seed,y*2,z*2,seed|0)-.5)*.34*w;y+=n;
   p.setXYZ(i,x,y,z*(1+n*1.3));
  }
  return sprayC[key]=weld(g);
 }
 const mkPine=(lo)=>{
  const ps=[],H=9.4,nl=lo?9:14;
  /* gövde: tabanda yumuşak kök dilimleri (ayrı sivri kök parçaları yerine) */
  const rp=mkRoots(5,11,lo?1.4:1);
  const tr=part(rootTube([[0,-.3,0],[.05,2.5,.03],[-.04,6,-.03],[0,H,0]],t=>.04+.46*Math.pow(1-t,1.1)+.2*Math.exp(-t*24),lo?9:14,rootT(lo?9:22,lo?1.7:2),lo?0:.1,3,rp,.5,.6),0x5a3a20,0,0,0,1,1,1,0,0,0,.08);tr.cf=bark;ps.push(tr);
  if(!lo)rp.forEach((q,k)=>{const r=part(rootArm(q,1.2+hash(k,11,9)*.7,.13+.05*q.s,.38,.38,.3,3+k),0x5a3a20,0,0,0,1,.9,1,0,0,0,.04);r.cf=bark;ps.push(r)});
  const pcf=(x,y,z,nx,ny,nz,c)=>{const t=Math.min(1,Math.max(0,(y-2.1)/6.9)),Lm=2.5*Math.pow(1-t,.85)+.4,d=Math.min(1,Math.hypot(x,z)/Lm);c.multiplyScalar(.7+.5*d*d+.14*Math.max(0,ny))};
  const c0=new THREE.Color(0x1f5532),c1=new THREE.Color(0x4a9a4a);
  for(let k=0;k<6;k++){const a=k*1.7,y=1.1+k*.22;ps.push(alongPart(cyl(.035,.012,.45+(k%3)*.12,4,1),0x4a3320,V3(0,y,0),V3(Math.cos(a),.15,Math.sin(a)),.5))}   /* kurumuş alt dal kökleri */
  for(let i=0;i<nl;i++){
   const t=i/(nl-1),y=2.1+t*6.9,per=lo?(t<.5?5:4):(t<.35?7:t<.7?6:5);
   const L=2.5*Math.pow(1-t,.85)+.4,w=.3+.34*(1-t);
   for(let k=0;k<per;k++){
    const a=i*2.39996+k/per*6.2832+(hash(i,k,3)-.5)*.5,cl=c0.clone().lerp(c1,t*.85+hash(i,k,5)*.15),Lk=L*(.85+hash(i,k,7)*.3);
    const pl=part(spray(Lk,w,.1+.12*(1-t),lo?4:5,lo?1:2,(i*7+k)%11),cl.getHex(),Math.cos(a)*.1,y+(hash(i,k,9)-.5)*.3,-Math.sin(a)*.1,1,1,1,(hash(i,k,11)-.5)*.5,-a,(t-.35)*.55-.04,.1);pl.cf=pcf;ps.push(pl);
    if(!lo){const s2=(k%2?1:-1)*.62,sl=Lk*.62,tb=Lk*.36,yy=y-.1+(hash(i,k,9)-.5)*.3-tb*.08;
     const q=part(spray(sl,w*.75,.12,4,1,(i*5+k)%7),cl.getHex(),Math.cos(a)*(.1+tb),yy,-Math.sin(a)*(.1+tb),1,1,1,0,-a+s2,(t-.35)*.55-.04,.1);
     q.cf=pcf;ps.push(q)}
   }
  }
  ps.push(part(spray(1.5,.26,.05,lo?4:6,2,5),0x56a04e,0,H-1.0,0,1,1,1,0,0,Math.PI/2-.12,.1));
  ps[ps.length-1].cf=pcf;
  return merge(ps,{ao:.64,jit:.12});
 };
 MODEL.treeA=mkPine(false);MODEL.treeA_lo=mkPine(true);
 const mkOak=(lo)=>{
  const ps=[];
  /* gövde: tabanda yumuşak kök dilimleri (ayrı sivri kök parçaları yerine) */
  const rp=mkRoots(6,23,lo?1.4:1);
  const trunk=part(rootTube([[0,-.3,0],[.1,1.5,.05],[-.05,3.2,-.05],[.05,4.5,0]],t=>.2+.3*Math.pow(1-t,1.4)+.3*Math.exp(-t*13),lo?9:14,rootT(lo?9:22,lo?1.7:2),lo?0:.12,7,rp,.55,.7),0x6a4626,0,0,0,1,1,1,0,0,0,.08);trunk.cf=bark;ps.push(trunk);
  if(!lo)rp.forEach((q,k)=>{const r=part(rootArm(q,1.5+hash(k,23,9)*.7,.2+.07*q.s,.5,.5,.4,7+k),0x6a4626,0,0,0,1,.9,1,0,0,0,.04);r.cf=bark;ps.push(r)});
  const nl=lo?3:5;
  for(let k=0;k<nl;k++){
   const a=k/nl*6.2832+.5,ca=Math.cos(a),sa=Math.sin(a),s=3.5+hash(k,1,2)*.6,e=1.6+hash(k,2,2)*.5;
   const lb=part(tube([[0,s,0],[ca*.7,s+.9,sa*.7],[ca*e,s+1.9,sa*e],[ca*(e+.7),s+2.8,sa*(e+.7)]],t=>.2-.15*t,lo?5:7,lo?3:5,0,0),0x6a4626,0,0,0,1,1,1,0,0,0,.08);lb.cf=bark;ps.push(lb);
   if(!lo){const b=part(tube([[ca*.9,s+1.1,sa*.9],[ca*(e+.5),s+1.8,sa*(e+.5)],[ca*(e+1.2),s+2.2,sa*(e+1.2)+.5]],t=>.07-.045*t,5,3,0,0),0x6a4626,0,0,0,1,1,1,0,0,0,.08);b.cf=bark;ps.push(b)}
  }
  const C=[0,6.2,0],cf=(x,y,z,nx,ny,nz,c)=>{
   const dx=x-C[0],dy=y-C[1],dz=z-C[2],l=Math.hypot(dx,dy,dz)||1,f=(nx*dx+ny*dy+nz*dz)/l;
   c.multiplyScalar(.5+.5*Math.pow(Math.max(0,f*.5+.5),1.1)+.22*Math.max(0,ny));
   if(ny>.35&&fb3(x*2,y*2,z*2,31)>.62){c.r*=1.12;c.g*=1.04}                                       /* güneş vuran uçlarda sarımsı yeşil */
  };
  const pal=[0x3f8736,0x4b9a41,0x356f2f,0x44903b,0x5aa84c,0x62b052,0x4a9a3e,0x3a7e34];
  const big=[[0,7.5,0,1.5],[1.7,6.3,.4,1.7],[-1.6,6.1,-.5,1.7],[.4,6.0,1.7,1.6],[-.5,6.4,-1.7,1.6],[.2,5.2,-.1,1.55]];
  const small=[[2.5,5.7,1.1,1.0],[-2.4,5.5,-1.0,1.0],[1.0,5.5,2.4,.95],[-1.4,5.8,2.1,.95],[1.9,7.1,-1.0,.9],[-2.0,7.0,.8,.9],[.2,8.6,.2,.85],[1.1,5.0,-2.1,.85]];
  const bl=(lo?big.slice(0,4):big).map(([x,y,z,r],i)=>part(blob(r,lo?1:2,.4,20+i*7,1,.84,1),pal[i%pal.length],x,y,z,1,1,1,0,i,0,.2));
  const sm=(lo?small.slice(0,5):small).map(([x,y,z,r],i)=>part(blob(r,lo?1:2,.4,70+i*5,1,.85,1),pal[(i+3)%pal.length],x,y,z,1,1,1,0,i,0,.2));
  [...bl,...sm].forEach(p=>{p.cf=cf});
  return merge([...ps,...bl,...sm],{ao:.6,jit:.14});
 };
 MODEL.treeB=mkOak(false);MODEL.treeB_lo=mkOak(true);
 /* palmiye yaprağı: ana damar (yassı şerit) ve iki yanda kıvrılarak sarkan yaprakçıklar */
 function frondP(len,wid,droop,N){
  const pos=[],idx=[],P=[],T=[];
  for(let i=0;i<=N;i++){const t=i/N;P.push(V3(t*len,Math.sin(t*1.7)*len*.30-droop*t*t*len+.04,0))}
  for(let i=0;i<=N;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(N,i+1)];T.push(b.clone().sub(a).normalize())}
  const v=(p)=>{pos.push(p.x,p.y,p.z);return pos.length/3-1};
  for(let i=0;i<=N;i++){const t=i/N,w=.026*(1-t*.6);v(P[i].clone().add(V3(0,.008,-w)));v(P[i].clone().add(V3(0,.008,w)))}
  for(let i=0;i<N;i++){const a=i*2,b=a+2;idx.push(a,a+1,b,b,a+1,b+1,a,b,a+1,b,b+1,a+1)}
  for(let i=1;i<=N;i++){
   const t=i/N,ln=wid*Math.pow(1-t,.55)*(.4+.6*Math.sin(Math.min(1,t*1.6+.1)*Math.PI*.5))*1.5,bw=len/N*.45;
   for(const s of [-1,1]){
    const B=P[i],Tn=T[i],D=V3(Tn.x*.5,-.2-.1*droop,s).normalize();
    const M=B.clone().addScaledVector(D,ln*.52).add(V3(0,.05*ln,0)),E=M.clone().addScaledVector(D,ln*.48).add(V3(0,-.34*ln,0)).addScaledVector(Tn,.1*ln);
    const b0=v(B.clone().addScaledVector(Tn,-bw)),b1=v(B.clone().addScaledVector(Tn,bw)),m0=v(M.clone().addScaledVector(Tn,-bw*.7)),m1=v(M.clone().addScaledVector(Tn,bw*.7)),e0=v(E);
    idx.push(b0,m0,b1,b1,m0,m1,m0,e0,m1);
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
 }
 const mkPalm=(nuts,lo)=>{
  const top=V3(1.05,7.0,0),ps=[];
  const tr=part(tube([[0,-.3,0],[.25,2.3,.05],[.75,4.8,-.02],[top.x,top.y-.1,0]],(t,y)=>(.3-.12*t+.12*Math.exp(-t*16))*(1+(lo?0:.05)*Math.sin(y*10.5)),lo?6:9,lo?8:30,0,0),0x8a6a40,0,0,0,1,1,1,0,0,0,.06);
  tr.cf=(x,y,z,nx,ny,nz,c)=>{const b=.5+.5*Math.sin(y*10.5),v=.78+.3*b+(vn3(x*4,y*.5,z*4,6)-.5)*.2;c.multiplyScalar(v);if(y<1.2)c.multiplyScalar(.82+.18*y/1.2)};
  ps.push(tr);
  ps.push(part(blob(.34,lo?1:2,.18,5),0x5a7a33,top.x,top.y,top.z));
  const nf=lo?8:14,fr=[frondP(3.7,.86,.65,lo?7:15),frondP(3.5,.8,.8,lo?7:15)];
  for(let i=0;i<nf;i++){
   const a=i/nf*Math.PI*2+i*.17,sc3=.85+((i*37)%10)/40,up=i%3===0?.35:i%3===1?.08:-.12;
   ps.push({geo:fr[i%2],c:i%2?0x3a8a36:0x4da043,m:new THREE.Matrix4().compose(top.clone().add(V3(0,.05,0)),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,a,up,'YZX')),V3(sc3,sc3,sc3)),jit:.16});
  }
  if(nuts)for(const [dx,dy,dz] of [[.22,-.28,.14],[-.2,-.3,.18],[.04,-.36,-.26],[.18,-.4,.2],[-.12,-.34,-.2]].slice(0,lo?4:5)){const q=part(blob(.17,lo?1:2,.08,9),0x5b3a1c,top.x+dx,top.y+dy,top.z+dz);q.cf=(x,y,z,nx,ny,nz,c)=>{const v=.8+vn3(x*9,y*9,z*9,18)*.5;c.multiplyScalar(v)};ps.push(q)}
  return merge(ps,{ao:.7});
 };
 MODEL.palm=mkPalm(true,false);MODEL.palm0=mkPalm(false,false);MODEL.palm_lo=mkPalm(true,true);MODEL.palm0_lo=mkPalm(false,true);
 /* ---- kaya ve madenler ---- */
 const moss=(x,y,z,nx,ny,nz,c)=>{if(ny>.55){const k=Math.min(1,(ny-.55)*2.2)*Math.max(0,fb3(x*3,y*3,z*3,15)*1.3-.35);c.r=c.r*(1-k)+.036*k;c.g=c.g*(1-k)+.134*k;c.b=c.b*(1-k)+.03*k}};     /* yosun (doğrusal renk) */
 const strata=(x,y,z,nx,ny,nz,c)=>{const b=Math.sin(y*14+fb3(x*2,y,z*2,4)*5)*.5+.5;const v=.88+b*.2;c.r*=v;c.g*=v;c.b*=v};
 const rockP=(c1,c2,cf)=>[
  part(blob(.52,2,.28,31,1,.74,.92),c1,0,.3,0,1,1,1,0,.5,0,.16,),
  part(blob(.3,2,.3,37,1,.85,1),c2,.3,.17,.17,1,1,1,0,0,0,.16),
  part(blob(.22,2,.3,41),c2,-.33,.13,-.1,1,1,1,0,0,0,.16)
 ].map(p=>{p.cf=cf;return p});
 const rcf=(x,y,z,nx,ny,nz,c)=>{strata(x,y,z,nx,ny,nz,c);moss(x,y,z,nx,ny,nz,c)};
 /* Madenler: köşeli kırık ana kaya + yüzeye yayılan damarlar, benekler ve çıkıntılı cevher kümeleri */
 const facet=(r,seed,amp,sx,sy,sz,detail)=>{
  const g=new THREE.IcosahedronGeometry(1,detail===undefined?1:detail),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+(fb3(x*1.9+seed,y*1.9,z*1.9,seed|0)-.5)*2*amp;
   p.setXYZ(i,x*d*r*(sx||1),Math.max(y*d*r*(sy||1),-.5*r*(sy||1)),z*d*r*(sz||1));
  }
  g.computeVertexNormals();return g;           /* indekssiz: yüzey başına normal, köşeli görünüm */
 };
 const lerpC=(c,r,g,b,k)=>{c.r+=(r-c.r)*k;c.g+=(g-c.g)*k;c.b+=(b-c.b)*k};
 /* yüzey başına sabit gürültü: düz gölgelemede bir yüzün üç köşesi aynı normali paylaşır, bu yüzden cevher "yüzler" hâlinde açığa çıkar */
 const facen=(x,y,z,nx,ny,nz,sd)=>fb3(nx*3.6+x*.7+sd,ny*3.6+y*.7,nz*3.6+z*.7,sd|0);
 const sm=(a,b,v)=>{v=Math.max(0,Math.min(1,(v-a)/(b-a)));return v*v*(3-2*v)};
 /* Kaya: köşeli kırık yüzeyli ana kaya, yan kayalar ve çakıllar; yosun, liken ve tabakalaşma */
 const rcf2=(x,y,z,nx,ny,nz,c)=>{rcf(x,y,z,nx,ny,nz,c);const lc=sm(.74,.82,fb3(x*9,y*9,z*9,21))*Math.max(0,.3+ny);lerpC(c,.5,.52,.32,lc*.4);const t=.82+.22*Math.max(0,ny)-.12*Math.max(0,-ny);c.r*=t;c.g*=t;c.b*=t};
 /* stone() ile kırık kaya parçası: tabanı y=0'da */
 const sPart=(sx,sy,sz,seed,o,col,x,z,extra,ry)=>stonePart(stone(sx,sy,sz,seed,o),col,x,(o.flat||0)*sy,z,ry,extra);
 const RKS=[[.56,.4,.5,31,{cuts:5,flat:.72,detail:3,amp:.22},0x7f786f,0,0,0.5],[.32,.24,.3,37,{cuts:4,flat:.7,detail:2,amp:.22},0x6b655e,.46,.3,1.3],[.26,.19,.24,41,{cuts:4,flat:.7,detail:2,amp:.2},0x756e66,-.5,-.18,2.1],[.2,.14,.18,43,{cuts:3,flat:.7,detail:2,amp:.2},0x5f5a54,.06,-.5,.4],[.12,.08,.11,47,{cuts:3,flat:.6,detail:1,amp:.18},0x726c64,.62,-.28,0],[.09,.06,.08,49,{cuts:2,flat:.6,detail:1,amp:.18},0x68625c,-.28,.5,0]];
 MODEL.rock=merge(RKS.map(r=>sPart(r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],moss,r[8])),{ao:.74});
 /* damar ve yama gürültüsü: yüzey konumuna bağlı, yumuşak (üçgen başına rastgele renk yok) */
 const vein=(x,y,z,sd,w)=>1-sm(0,w,Math.abs(fb3(x*3.4+sd,y*3.4,z*3.4,sd|0)-.5));
 const patch=(x,y,z,sd,lo,hi)=>sm(lo,hi,fb3(x*4.6+sd,y*4.6,z*4.6,(sd+3)|0));
 const oreCf={
  coal:(x,y,z,nx,ny,nz,c)=>{strata(x,y,z,nx,ny,nz,c);
   const pt=patch(x,y,z,2,.46,.58),band=sm(.75,.95,Math.sin(y*17+fb3(x*2,y*2,z*2,8)*6)*.5+.5);
   lerpC(c,.016,.016,.02,Math.min(.95,pt*.92+band*.3));               /* parlak siyah kömür yamaları ve bantları */
   lerpC(c,.5,.5,.52,vein(x,y,z,4,.03)*.35*(1-pt));                    /* ince kuvars damarları */
   lerpC(c,.07,.075,.09,sm(.72,.82,fb3(x*14,y*14,z*14,4))*.5)},
  copper:(x,y,z,nx,ny,nz,c)=>{strata(x,y,z,nx,ny,nz,c);
   const pt=patch(x,y,z,6,.47,.6),rim=patch(x,y,z,6,.4,.5)*(1-pt);
   lerpC(c,.5,.22,.08,pt*.88);                                        /* bakır cevheri yamaları */
   lerpC(c,.1,.36,.26,rim*.38+vein(x,y,z,12,.035)*.45);               /* malakit yeşili kenar ve damarlar */
   lerpC(c,.72,.38,.16,sm(.78,.88,fb3(x*15,y*15,z*15,9))*.5)},        /* parlak bakır benekleri */
  iron:(x,y,z,nx,ny,nz,c)=>{strata(x,y,z,nx,ny,nz,c);
   const pt=patch(x,y,z,7,.47,.6),band=sm(.6,.95,Math.sin(y*11+fb3(x*2,y,z*2,5)*5)*.5+.5);
   lerpC(c,.24,.075,.045,Math.min(.9,pt*.85+band*.22));               /* pas kızılı hematit */
   lerpC(c,.05,.05,.065,vein(x,y,z,14,.04)*.6*(1-pt*.4));              /* koyu manyetit damarları */
   lerpC(c,.4,.26,.14,sm(.78,.88,fb3(x*13,y*13,z*13,11))*.4)}
 };
 const SHARD={coal:0x17171c,copper:0x2f8a62,iron:0x92402a};
 const SHARDS=[[.2,.4,.1,.36,.07,.3,-.25],[-.16,.36,.22,.3,.06,-.28,.2],[.02,.52,-.14,.4,.075,.1,.05],[.34,.22,-.2,.24,.055,.45,-.4],[-.34,.2,.0,.22,.05,-.1,.5],[.12,.3,.36,.2,.05,.4,.1]];
 const oreCol={coal:0x2a2a30,copper:0xa8683a,iron:0x7a4a30},hostCol={coal:[0x4c4c50,0x404044],copper:[0x6e665e,0x5e5650],iron:[0x6a625e,0x5a524e]};
 const nugget=(k,x,y,z,r,sd,rx,ry,rz)=>{const q=part(facet(r,sd,.32,1,.8,1,k==='coal'?1:0),oreCol[k],x,y,z,1,1,1,rx||0,ry||0,rz||0,.14);q.cf=oreCf[k];return q};
 const oreParts=(k,st)=>{
  const [h1,h2]=hostCol[k];
  const oc=oreCf[k],both=(p)=>{const f0=p.cf;p.cf=(x,y,z,nx,ny,nz,c)=>{f0(x,y,z,nx,ny,nz,c);oc(x,y,z,nx,ny,nz,c)};return p};
  const hp=(sx,sy,sz,sd,o,col,x,z,ry)=>both(sPart(sx,sy,sz,sd,o,col,x,z,null,ry));
  const ps=st===0
   ?[hp(.54,.4,.5,31+k.length,{cuts:5,flat:.72,detail:3,amp:.24},h1,0,0,.5),hp(.3,.24,.28,37,{cuts:4,flat:.7,detail:2,amp:.24},h2,.4,.3,1.3),hp(.24,.19,.23,41,{cuts:4,flat:.7,detail:2,amp:.22},h2,-.42,-.2,2.1),hp(.18,.14,.17,43,{cuts:3,flat:.7,detail:2,amp:.22},h1,.04,-.46,.4)]
   :st===1
   ?[hp(.45,.34,.42,31+k.length,{cuts:5,flat:.72,detail:3,amp:.24},h1,0,0,.5),hp(.2,.15,.18,41,{cuts:3,flat:.7,detail:2,amp:.22},h2,-.34,-.14,1)]
   :[hp(.28,.2,.26,31+k.length,{cuts:4,flat:.7,detail:2,amp:.24},h1,.02,0,.5),hp(.1,.07,.09,45,{cuts:2,flat:.6,detail:1,amp:.2},h2,.28,.2,.3)];
  const nug=st===0?[[.2,.5,.2,.12,3,.2,.4,-.3],[-.18,.46,.3,.1,5,-.2,.9,.4],[.04,.66,-.12,.11,7,.1,.2,.1],[.4,.28,-.22,.085,9,.3,1.4,-.5],[-.4,.24,.16,.08,11,-.2,.6,.6],[.1,.3,.42,.07,13,0,.3,.2],[-.08,.42,-.36,.09,15,.4,.8,0]]
   :st===1?[[.18,.44,.18,.1,3,.2,.4,-.3],[-.16,.4,.26,.08,5,-.2,.9,.4],[.36,.2,-.18,.07,9,.3,1.4,-.5]]
   :[[.04,.3,.02,.08,3,.1,.2,.1]];
  nug.forEach(n=>ps.push(nugget(k,n[0],n[1],n[2],n[3],n[4],n[5],n[6],n[7])));
  /* kristal/kırık parça demetleri: cevher türüne göre renkli, ucu parlak */
  const SH=SHARD[k],sl=st===0?SHARDS:st===1?SHARDS.slice(0,3):SHARDS.slice(0,1);
  for(const [x,y,z,h,r,rx,rz] of (k==='coal'?[]:sl)){                    /* kömürde sivri kristal yok: yalnızca yuvarlak parçalar */
   const q=part(cone(r,h,k==='coal'?4:6,1),SH,x,y+h*.42,z,1,1,1,rx,x*3,rz,.1);
   q.cf=(px,py,pz,nx,ny,nz,c)=>{const t=Math.max(0,Math.min(1,(py-y)/h));c.r*=.62+.6*t;c.g*=.62+.6*t;c.b*=.62+.6*t};
   ps.push(q);
  }
  return merge(ps,{ao:.74});
 };
 for(const k of ['coal','copper','iron']){MODEL[k]=oreParts(k,0);MODEL[k+'_s1']=oreParts(k,1);MODEL[k+'_s2']=oreParts(k,2)}
 const rockStage=(st)=>{
  const ps=st===1
   ?[sPart(.46,.34,.42,31,{cuts:5,flat:.72,detail:3,amp:.22},0x8d8b88,0,0,moss,.5),sPart(.2,.15,.18,41,{cuts:3,flat:.7,detail:2,amp:.2},0x77757a,-.34,-.14,moss,1)]
   :[sPart(.28,.2,.26,31,{cuts:4,flat:.7,detail:2,amp:.22},0x8d8b88,.02,0,moss,.5),sPart(.1,.07,.09,45,{cuts:2,flat:.6,detail:1,amp:.2},0x77757a,.28,.2,moss,.3)];
  return merge(ps,{ao:.74});
 };
 MODEL.rock_s1=rockStage(1);MODEL.rock_s2=rockStage(2);
 /* ---- çalılar ---- */
 const bush=(b)=>{
  const C=[0,.36,0],cf=(x,y,z,nx,ny,nz,c)=>{
   const dx=x-C[0],dy=y-C[1],dz=z-C[2],l=Math.hypot(dx,dy,dz)||1,f=(nx*dx+ny*dy+nz*dz)/l;
   c.multiplyScalar(.52+.5*Math.pow(Math.max(0,f*.5+.5),1.1)+.2*Math.max(0,ny));
   if(ny>.3&&fb3(x*3,y*3,z*3,41)>.6){c.r*=1.12;c.g*=1.05}
  };
  const pal=[0x2f7a30,0x3f9140,0x2a6a2b,0x4aa046,0x358536,0x56aa4c,0x3a8a38,0x2d742e];
  const lobes=[[0,.34,0,.46,2],[.27,.4,.1,.33,1],[-.29,.3,-.1,.32,1],[.03,.52,-.2,.28,1],[.12,.3,.3,.3,1],[-.22,.35,.27,.27,1],[.3,.28,-.27,.25,1],[-.34,.44,.1,.25,1]];
  const ps=lobes.map(([x,y,z,r,d],i)=>{const p=part(blob(r,d,.34,51+i*3,1,.8,1),pal[i%pal.length],x,y,z,1,1,1,0,i,0,.2);p.cf=cf;return p});
  for(let k=0;k<4;k++){const a=k*1.7+.4;ps.push(alongPart(cyl(.02,.03,.28,4,1),0x5a4426,V3(Math.cos(a)*.12,0,Math.sin(a)*.12),V3(Math.cos(a),.9,Math.sin(a)),.28))}   /* dipten çıkan ince dallar */
  if(b)for(const [x,y,z] of [[.3,.44,.3],[-.2,.52,.34],[.1,.68,-.08],[.44,.3,-.12],[-.42,.32,.14],[0,.36,.5],[.2,.54,.2],[-.3,.5,-.3],[.34,.5,-.3]]){
   const q=part(blob(.052,1,.1,Math.round(x*40)),0xc9283a,x,y,z,1,1,1,0,0,0,.1);
   q.cf=(px,py,pz,nx,ny,nz,c)=>{const h=Math.max(0,ny*.6+nx*.3+.2);c.multiplyScalar(.75+.5*h);if(ny>.55&&nx>0&&nz>0)lerpC(c,.9,.7,.7,.25)};   /* meyve: üstte hafif parlama */
   ps.push(q);
  }
  return merge(ps,{ao:.62});
 };
 MODEL.bush=bush(true);MODEL.bush0=bush(false);
 /* ---- yerleştirilen yapılar ---- */
 const grainCf=(k)=>(x,y,z,nx,ny,nz,c)=>{const g=fb3(x*30,y*3,z*30,k),g2=fb3(x*9,y*1.5,z*9,k+3);c.multiplyScalar(.78+g*.3+g2*.2)};
 const knotCf=(k)=>(x,y,z,nx,ny,nz,c)=>{grainCf(k)(x,y,z,nx,ny,nz,c);const d=Math.hypot(((x*7+k)%1)-.5,((y*7)%1)-.5);if(hash(Math.floor(x*7+k),Math.floor(y*7),k)>.93&&d<.2)c.multiplyScalar(.7)};
 /* kütük: yatay silindir, kesit yüzünde yıllık halkalar, kabukta lifler. ax: eksen birim vektörü (x,z), c: merkez */
 const logP=(r,len,cx,cy,cz,ry,rz,col,seed)=>{
  const ca=Math.cos(ry),sa=Math.sin(ry),ax=rz?[ca,0,-sa]:[0,0,0];
  const p=part(cyl(r,r*1.03,len,12,3),col,cx,cy,cz,1,1,1,0,ry,rz,.1);
  p.cf=(X,Y,Z,nx,ny,nz,c)=>{
   const d=rz?Math.abs(nx*ax[0]+nz*ax[2]):Math.abs(ny);
   if(d>.85){const rr=rz?Math.hypot(Y-cy,(X-cx)*ax[2]-(Z-cz)*ax[0]):Math.hypot(X-cx,Z-cz);c.setHex(0xd2a86e);c.multiplyScalar(.8+.16*Math.sin(rr*(60/r*.1)+fb3(X*5,Y*5,Z*5,seed)*2.2)+(rr<r*.15?-.1:0))}
   else{const g=fb3(X*10,Y*10,Z*10,seed),g2=fb3(X*40,Y*2,Z*40,seed+3);c.multiplyScalar(.72+g*.4+g2*.25)}
  };
  return p;
 };
 const stones=Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2;return stonePart(stone(.14,.1,.12,60+i,{cuts:3,detail:1,amp:.2,flat:.6}),i%2?0x8a8a90:0x6c6c72,Math.cos(a)*.4,.06,Math.sin(a)*.4,a)});
 MODEL.fireBase=merge([
  logP(.07,.85,0,.12,0,.6,Math.PI/2,0x5e3a1c,2),logP(.07,.85,0,.19,0,-.6,Math.PI/2,0x4f321a,4),logP(.065,.7,0,.26,0,1.5,Math.PI/2,0x6a4423,6),
  ...[0,1,2,3].map(i=>part(cone(.015,.3,4,1),0x4a3320,Math.cos(i*1.6)*.14,.1,Math.sin(i*1.6)*.14,1,1,1,Math.PI/2.4,i*1.6,0)),
  ...stones,part(cyl(.3,.34,.05,14),0x15100a,0,.02,0,1,1,1,0,0,0,.3),part(blob(.2,1,.2,77,1,.12,1),0x2a2420,0,.04,0)
 ],{ao:.75});
 const plank=(w,d,y,c,k,x,z)=>{const p=part(rbox(w,.07,d,.3,3),c,x||0,y,z||0,1,1,1,0,0,0,.12);p.cf=grainCf(k);return p};
 MODEL.bench=merge([
  ...[0,1,2,3].map(i=>plank(.98,.15,.82,[0xb08050,0xa57647,0xb78856,0xa87a4a][i],20+i,0,-.24+i*.16)),
  part(rbox(.98,.06,.64,.3,3),0xc49058,0,.87,0,1,1,1,0,0,0,.12),
  ...[[-.4,-.24],[.4,-.24],[-.4,.24],[.4,.24]].map(p=>{const q=part(rbox(.1,.78,.1,.3,2),0x5a3a1e,p[0],.39,p[1]);q.cf=grainCf(30);return q}),
  part(rbox(.92,.06,.06,.3,2),0x4a2f18,0,.25,.24),part(rbox(.92,.06,.06,.3,2),0x4a2f18,0,.25,-.24),part(rbox(.06,.06,.5,.3,2),0x4a2f18,0,.25,0),
  part(rbox(.3,.05,.09,.3,2),0xd5d9de,.2,.93,.05,1,1,1,0,.1,0),part(rbox(.06,.2,.06,.3,2),0x6b4423,.28,.96,.05),part(rbox(.16,.11,.11,.3,2),0x77777f,-.25,.94,-.05),
  part(rbox(.18,.04,.1,.3,2),0x60606a,-.25,.9,.2),part(cyl(.012,.012,.2,6),0x8d8d95,-.25,.97,.2,1,1,1,0,0,Math.PI/2)
 ],{ao:.8});
 /* tuğla örgüsü: harç çizgileri */
 const brickCf=(row,len)=>(x,y,z,nx,ny,nz,c)=>{
  const u=Math.abs(nx)>.5?z:x,r=Math.floor(y/row),off=(r&1)*len*.5,fy=y/row-r,fu=((u+off)/len)%1,fu2=fu<0?fu+1:fu;
  const m=(fy<.1||fy>.93)||(fu2<.05||fu2>.96);
  c.multiplyScalar(m?.62:.86+fb3(x*14+r,y*14,z*14,5)*.3);
 };
 MODEL.furn=merge([
  (()=>{const p=part(rbox(.94,1,.94,.12,4),0x6e6e76,0,.5,0,1,1,1,0,0,0,.14);p.cf=brickCf(.125,.31);return p})(),
  (()=>{const p=part(rbox(1,.1,1,.3,3),0x8d8d95,0,1.03,0,1,1,1,0,0,0,.12);p.cf=brickCf(.1,.33);return p})(),
  (()=>{const p=part(cyl(.2,.26,.62,10,3),0x66666e,.22,1.38,-.2,1,1,1,0,0,0,.1);p.cf=brickCf(.1,.16);return p})(),part(rbox(.4,.07,.4,.3,2),0x8d8d95,.22,1.72,-.2),part(cyl(.14,.14,.03,10),0x15100a,.22,1.745,-.2),
  part(rbox(.54,.5,.12,.2,2),0x4a4a52,0,.4,.44),part(box(.46,.4,.1),0x120d0b,0,.4,.455),part(rbox(.6,.06,.12,.3,2),0x5a5a62,0,.66,.45),
  ...[.25,.5,.75].map(y=>part(box(.955,.03,.955),0x50505a,0,y,0))
 ],{ao:.8});
 const logZ=(y,col,k,rev)=>logP(.17,1.06,0,y,0,0,rev?0:Math.PI/2,col,k);
 MODEL.wallw=merge([
  logP(.17,1.06,0,.17,0,0,Math.PI/2,0xa67848,11),logP(.17,1.06,0,.49,0,Math.PI/2,Math.PI/2,0x98693c,12),logP(.17,1.06,0,.81,0,0,Math.PI/2,0xae7e4c,13),logP(.17,1.06,0,1.13,0,Math.PI/2,Math.PI/2,0x9c6d40,14),
  part(rbox(1.04,.07,1.04,.3,2),0x7a5432,0,1.29,0,1,1,1,0,0,0,.15)
 ],{ao:.78});
 const blk=(x,y,w,c,k)=>{const p=part(rbox(w,.42,1,.2,3),c,x,y,0,1,1,1,0,0,0,.2);p.cf=(X,Y,Z,nx,ny,nz,cc)=>{const n=fb3(X*9,Y*9,Z*9,k),st=Math.sin(Y*30+fb3(X*3,Y*3,Z*3,k)*4)*.5+.5;cc.multiplyScalar(.78+n*.36+st*.08);if(ny>.7)cc.multiplyScalar(1.1);if(ny>.6&&fb3(X*5,Y*5,Z*5,k+9)>.66){cc.r*=.7;cc.g*=1.0;cc.b*=.7}};return p};
 MODEL.walls=merge([
  blk(-.25,.21,.5,0x8a8a92,1),blk(.26,.21,.48,0x7d7d86,2),blk(-.5+.2,.64,.42,0x94949c,3),blk(.18,.64,.6,0x84848c,4),
  blk(-.28,1.07,.46,0x8e8e96,5),blk(.25,1.07,.52,0x7a7a83,6),part(rbox(1.04,.08,1.04,.3,2),0xa0a0a8,0,1.31,0,1,1,1,0,0,0,.14)
 ],{ao:.76,jit:.14});
 MODEL.door=merge([
  ...[-.46,.46].map((x,i)=>{const q=part(rbox(.13,1.32,.17,.3,2),0x4a2f18,x,.66,0);q.cf=grainCf(40+i);return q}),(()=>{const q=part(rbox(1.05,.13,.17,.3,2),0x4a2f18,0,1.3,0);q.cf=grainCf(44);return q})(),
  ...[-.3,-.15,0,.15,.3].map((x,i)=>{const q=part(rbox(.15,1.16,.09,.3,2),i%2?0x7a5430:0x84603a,x,.6,0);q.cf=grainCf(50+i);return q}),
  part(rbox(.78,.07,.1,.3,2),0x2c2c32,0,.34,0),part(rbox(.78,.07,.1,.3,2),0x2c2c32,0,.9,0),
  ...[-.32,-.1,.12,.32].flatMap(x=>[part(blob(.02,1,0,3),0x6a6a74,x,.34,.06),part(blob(.02,1,0,5),0x6a6a74,x,.9,.06)]),
  part(blob(.05,1,.05,3),0xd2b24a,.3,.65,.09),part(new THREE.TorusGeometry(.045,.01,5,10),0x2c2c32,.3,.65,.1)
 ],{ao:.82});
 /* ---- İnşa Planı parçaları: çıta duvar, metal duvar, metal kapı, çit ---- */
 const rail=(len,r,x,y,z,ax,col,k)=>{const p=part(cyl(r,r*1.04,len,7,2),col,x,y,z,1,1,1,ax==='x'?0:Math.PI/2,0,ax==='x'?Math.PI/2:Math.PI/2,.1);p.cf=grainCf(k);return p};
 MODEL.wallt=merge([
  ...Array.from({length:17},(_,i)=>{const x=-.48+i*.06,h=1.12+hash(i,3,1)*.2,lean=(hash(i,5,2)-.5)*.1,c=[0xb39a5c,0xa48c52,0xbfa468,0x9b8350][i%4];
   const p=part(cyl(.017,.026,h,5,2),c,x,h/2,(hash(i,7,3)-.5)*.05,1,1,1,lean,0,(hash(i,9,4)-.5)*.08,.06);p.cf=grainCf(70+i);return p}),
  ...[.28,.66,1.04].flatMap((y,j)=>[0,1].map(q=>rail(1.04,.03,0,y+(q?.03:-.03),q?.05:-.05,'x',[0x8e7640,0x86703c][q],90+j*2+q))),
  part(rbox(1.04,.05,.16,.3,2),0x7d6a3a,0,1.3,0,1,1,1,0,0,0,.1)
 ],{ao:.8,jit:.06});
 const steel=(k,rust)=>(x,y,z,nx,ny,nz,c)=>{const b=fb3(x*70,y*3,z*70,k),r=fb3(x*8,y*8,z*8,k+5);c.multiplyScalar(.82+b*.3);if(rust&&r>.62){const q=Math.min(1,(r-.62)*3);c.r=c.r*(1-q*.5)+.25*q*.5;c.g=c.g*(1-q*.5)+.1*q*.5;c.b=c.b*(1-q*.5)+.05*q*.5}};
 MODEL.wallm=merge([
  ...[-.46,.46].map((x,i)=>{const q=part(rbox(.12,1.32,.2,.3,2),0x474c53,x,.66,0);q.cf=steel(110+i,false);return q}),
  (()=>{const q=part(rbox(1.04,.1,.22,.3,2),0x474c53,0,1.3,0);q.cf=steel(114,false);return q})(),(()=>{const q=part(rbox(1.0,.08,.22,.3,2),0x474c53,0,.05,0);q.cf=steel(115,false);return q})(),
  part(box(.9,1.22,.08),0x33373d,0,.66,0),
  ...[.24,.65,1.06].map((y,i)=>{const q=part(rbox(.88,.4,.12,.3,3),0x6b727a,0,y,0,1,1,1,0,0,0,.04);q.cf=steel(120+i,true);return q}),
  ...[.24,.65,1.06].flatMap(y=>[-.37,.37].flatMap(x=>[part(blob(.025,1,0,3),0x9aa1a9,x,y+.12,.06),part(blob(.025,1,0,5),0x9aa1a9,x,y-.12,.06),part(blob(.025,1,0,7),0x9aa1a9,x,y+.12,-.06),part(blob(.025,1,0,9),0x9aa1a9,x,y-.12,-.06)]))
 ],{ao:.8});
 MODEL.doorm=merge([
  ...[-.46,.46].map((x,i)=>{const q=part(rbox(.13,1.32,.19,.3,2),0x3d4248,x,.66,0);q.cf=steel(130+i,false);return q}),(()=>{const q=part(rbox(1.05,.13,.19,.3,2),0x3d4248,0,1.3,0);q.cf=steel(134,false);return q})(),
  (()=>{const q=part(rbox(.82,1.16,.09,.3,3),0x6a7078,0,.6,0,1,1,1,0,0,0,.04);q.cf=steel(135,true);return q})(),
  part(rbox(.8,.07,.12,.3,2),0x4a4f56,0,.3,0),part(rbox(.8,.07,.12,.3,2),0x4a4f56,0,.9,0),part(rbox(.07,1.1,.12,.3,2),0x4a4f56,-.2,.6,0),part(rbox(.07,1.1,.12,.3,2),0x4a4f56,.2,.6,0),
  ...[-.32,.32].flatMap(x=>[.2,.45,.75,1.0].map(y=>part(blob(.022,1,0,3),0x9aa1a9,x,y,.07))),
  part(new THREE.TorusGeometry(.07,.016,6,14),0xb8bec6,.28,.62,.1),part(blob(.04,1,.04,3),0xd2b24a,.28,.62,.1)
 ],{ao:.82});
 MODEL.fence=merge([
  (()=>{const q=part(rbox(.12,.88,.12,.3,2),0x7a5430,0,.44,0);q.cf=grainCf(140);return q})(),part(rbox(.14,.04,.14,.3,2),0x5a3a1e,0,.9,0),
  ...[.34,.68].flatMap((y,j)=>[(()=>{const q=part(rbox(1.02,.075,.055,.3,2),[0x8a6038,0x80583a][j],0,y,0,1,1,1,0,0,0,.1);q.cf=grainCf(141+j);return q})(),(()=>{const q=part(rbox(.055,.075,1.02,.3,2),[0x84603a,0x8e6a40][j],0,y+.02,0,1,1,1,0,0,0,.1);q.cf=grainCf(143+j);return q})()])
 ],{ao:.8});
 MODEL.matPlain=sc.mat({pbr:true});
 MODEL.matDS=sc.mat({side:THREE.DoubleSide,pbr:true});
});
})();
