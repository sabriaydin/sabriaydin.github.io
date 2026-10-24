/* Hunger 3D - sahne: arazi ve su yüzeyi — parçalara (chunk) bölünmüş, iki ayrıntı düzeyli (LOD), yumuşak yükseklik ve renk karışımı */
(()=>{
'use strict';
const {W,H,T,hash,clamp,fbm,smooth}=HG;
const S=HG.Scene,sc=HG.sc;
let VH=null,HVg=null,tileCol=null,Gref=null,waterMat=null,terrainMat=null,oceanMesh=null;
let chunks=[];
const TH=[-1.3,-.5,.05,.14,.32,-.5];       /* kare türüne göre taban yükseklik: derin, sığ, kum, çimen, kaya, göl */
const WY=sc.WY=-.16;                       /* su yüzeyi yüksekliği */
const CT=32;                               /* parça boyu (kare) */
const NF=2;                                /* ince ızgara: kare başına 2 bölüm */
const NX=W*NF+1,NZ=H*NF+1;

/* Catmull-Rom: köşe yüksekliklerinden pürüzsüz, sürekli yüzey */
const cr=(p0,p1,p2,p3,t)=>p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));
function groundY(x,z){
 const fx=x<0?0:x>W-.001?W-.001:x,fz=z<0?0:z>H-.001?H-.001:z,ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz,w=W+1;
 const x0=ix>0?ix-1:0,x1=ix,x2=ix+1,x3=ix+2>W?W:ix+2;
 const z0=(iz>0?iz-1:0)*w,z1=iz*w,z2=(iz+1)*w,z3=(iz+2>H?H:iz+2)*w;
 const r0=cr(VH[z0+x0],VH[z0+x1],VH[z0+x2],VH[z0+x3],tx),r1=cr(VH[z1+x0],VH[z1+x1],VH[z1+x2],VH[z1+x3],tx),r2=cr(VH[z2+x0],VH[z2+x1],VH[z2+x2],VH[z2+x3],tx),r3=cr(VH[z3+x0],VH[z3+x1],VH[z3+x2],VH[z3+x3],tx);
 return cr(r0,r1,r2,r3,tz);
}
const COL={
 grassA:new THREE.Color(0x4d8a38),grassB:new THREE.Color(0x6d9a3c),grassC:new THREE.Color(0x3d7a35),
 sand:new THREE.Color(0xd9c68e),sandW:new THREE.Color(0xb8a574),rock:new THREE.Color(0x7a766f),rockD:new THREE.Color(0x5e5b57),
 shal:new THREE.Color(0x87a98f),deep:new THREE.Color(0x2b4a5c),pond:new THREE.Color(0x5e6f4e),snow:new THREE.Color(0xe9eef2)
};
const cc=new THREE.Color(),c1=new THREE.Color(),c2=new THREE.Color();
function tileColor(i,x,z,out){
 const t=Gref.tile[i];
 if(t===T.GRASS){
  const a=fbm(x/5.5,z/5.5,41),b=fbm(x/14,z/14,43);
  out.copy(COL.grassA).lerp(COL.grassB,smooth(.35,.75,a)*.8).lerp(COL.grassC,smooth(.55,.8,b)*.7);
 }else if(t===T.SAND){out.copy(COL.sand).lerp(COL.sandW,fbm(x/4,z/4,45)*.5)}
 else if(t===T.ROCK){out.copy(COL.rock).lerp(COL.rockD,fbm(x/3,z/3,47)*.8)}
 else if(t===T.SHAL)out.copy(COL.shal);else if(t===T.DEEP)out.copy(COL.deep);else out.copy(COL.pond);
 return out;
}
/* Kare renklerinin yumuşak karışımı (konum x,z; yükseklik h; eğim sl) */
function blendColor(x,z,h,sl,out){
 const fx=clamp(x-.5,0,W-1.001),fz=clamp(z-.5,0,H-1.001),ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz;
 const u=tx*tx*(3-2*tx),v=tz*tz*(3-2*tz),q=(iz*W+ix)*3,q2=q+W*3;
 const m=o=>(tileCol[q+o]*(1-u)+tileCol[q+3+o]*u)*(1-v)+(tileCol[q2+o]*(1-u)+tileCol[q2+3+o]*u)*v;
 out.setRGB(m(0),m(1),m(2));
 if(h>-.05){
  const rk=smooth(.55,1.05,sl);
  if(rk>0)out.lerp(COL.rock,rk*.85);
  if(h>15){const sn=smooth(17,21.5,h+fbm(x/3,z/3,49)*1.6)*(1-smooth(1.1,1.8,sl));if(sn>0)out.lerp(COL.snow,sn)}
 }
 return out;
}
function colorAt(x,z,out){
 out=out||cc;const h=groundY(x,z),sx=groundY(x+.4,z)-groundY(x-.4,z),sz=groundY(x,z+.4)-groundY(x,z-.4);
 return blendColor(x,z,h,Math.hypot(sx,sz)/.8,out);
}
const hAt=(i,j)=>HVg[(j<0?0:j>=NZ?NZ-1:j)*NX+(i<0?0:i>=NX?NX-1:i)];

/* Arazi parçası: n=2 (ayrıntılı) veya 1 (uzak) */
function terrainChunk(cx,cz,n){
 const x0=cx*CT,z0=cz*CT,x1=Math.min(W,x0+CT),z1=Math.min(H,z0+CT),gx=(x1-x0)*n+1,gz=(z1-z0)*n+1,st=NF/n;   /* st: ince ızgara adımı */
 const cnt=gx*gz,pos=new Float32Array(cnt*3),nor=new Float32Array(cnt*3),col=new Float32Array(cnt*3),uv=new Float32Array(cnt*2);
 for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){
  const fi=(x0*NF)+i*st,fj=(z0*NF)+j*st,k=j*gx+i,x=fi/NF,z=fj/NF,y=hAt(fi,fj);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x*.33;uv[k*2+1]=z*.33;
  const s=st,dx=hAt(fi+s,fj)-hAt(fi-s,fj),dz=hAt(fi,fj+s)-hAt(fi,fj-s),sp=2*s/NF,l=Math.hypot(dx,sp,dz);
  nor[k*3]=-dx/l;nor[k*3+1]=sp/l;nor[k*3+2]=-dz/l;
  const sl=Math.hypot(hAt(fi+1,fj)-hAt(fi-1,fj),hAt(fi,fj+1)-hAt(fi,fj-1));
  blendColor(x,z,y,sl,cc);const sh=.93+hash(fi,fj,11)*.14;col[k*3]=cc.r*sh;col[k*3+1]=cc.g*sh;col[k*3+2]=cc.b*sh;
 }
 const idx=[];
 for(let j=0;j<gz-1;j++)for(let i=0;i<gx-1;i++){const a=j*gx+i,b=a+1,c=a+gx,d=c+1;idx.push(a,c,b,b,c,d)}
 /* etek (skirt): parça kenarlarındaki ayrıntı farkı çatlaklarını gizler */
 const P=[...pos],N=[...nor],C=[...col],U=[...uv];let base=cnt;
 const edge=(ids)=>{
  const start=base;
  for(const k of ids){P.push(pos[k*3],pos[k*3+1]-1.1,pos[k*3+2]);N.push(nor[k*3],nor[k*3+1],nor[k*3+2]);C.push(col[k*3],col[k*3+1],col[k*3+2]);U.push(uv[k*2],uv[k*2+1]);base++}
  for(let q=0;q<ids.length-1;q++){const a=ids[q],b=ids[q+1],a2=start+q,b2=start+q+1;idx.push(a,a2,b,b,a2,b2)}
 };
 const top=[],bot=[],lef=[],rig=[];
 for(let i=0;i<gx;i++){top.push(i);bot.push((gz-1)*gx+i)}
 for(let j=0;j<gz;j++){lef.push(j*gx);rig.push(j*gx+gx-1)}
 edge(top);edge(bot.slice().reverse());edge(lef.slice().reverse());edge(rig);
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 g.setIndex(idx);g.computeBoundingSphere();
 const m=new THREE.Mesh(g,terrainMat);m.receiveShadow=true;return m;
}
/* Su parçası: kıyıya kadar uzanır; yüzey araziyle kesişerek yumuşak kıyı oluşturur */
function waterChunk(cx,cz,n){
 const x0=cx*CT,z0=cz*CT,x1=Math.min(W,x0+CT),z1=Math.min(H,z0+CT),st=NF/n;
 let mn=1e9;
 for(let j=z0*NF;j<=z1*NF;j++)for(let i=x0*NF;i<=x1*NF;i++)mn=Math.min(mn,hAt(i,j));
 if(mn>WY+.03)return null;
 const wp=[],wc=[],wi=[],wu=[],map=new Map();
 /* Köpük yalnızca suyun bittiği ince şeritte belirir: eskiden sığ suyun tamamı beyazlaşıyor ve
    kumdan ayırt edilemiyordu. */
 const dcol=(d,out)=>{const t=clamp(d/1.1,0,1),foam=1-smooth(0,.06,d);c1.setRGB(.24,.74,.72);c2.setRGB(.05,.24,.44);c1.lerp(c2,Math.pow(t,.6));const f=foam*.45;out.push(c1.r+(1-c1.r)*f,c1.g+(1-c1.g)*f,c1.b+(1-c1.b)*f,clamp(.52+t*.42+f*.2,0,.95))};
 if(mn<WY-.7&&false){}
 /* tüm parça derin sudaysa tek büyük dörtgen */
 let mx=-1e9;for(let j=z0*NF;j<=z1*NF;j+=2)for(let i=x0*NF;i<=x1*NF;i+=2)mx=Math.max(mx,hAt(i,j));
 if(mx<WY-.7){
  const cs=[];dcol(1.2,cs);
  wp.push(x0,WY,z0,x1,WY,z0,x0,WY,z1,x1,WY,z1);wu.push(x0*.11,z0*.11,x1*.11,z0*.11,x0*.11,z1*.11,x1*.11,z1*.11);
  for(let q=0;q<4;q++)wc.push(...cs);
  wi.push(0,2,1,1,2,3);
 }else{
  const vert=(fi,fj)=>{
   const key=fj*NX+fi;let r=map.get(key);if(r!==undefined)return r;
   const d=WY-hAt(fi,fj);r=wp.length/3;wp.push(fi/NF,WY,fj/NF);wu.push(fi/NF*.11,fj/NF*.11);dcol(d,wc);map.set(key,r);return r;
  };
  for(let j=z0*NF;j<z1*NF;j+=st)for(let i=x0*NF;i<x1*NF;i+=st){
   let m=1e9;for(let b=0;b<=st;b++)for(let a=0;a<=st;a++)m=Math.min(m,hAt(i+a,j+b));
   if(m>WY+.03)continue;
   const A=vert(i,j),B=vert(i+st,j),C=vert(i,j+st),D=vert(i+st,j+st);wi.push(A,C,B,B,C,D);
  }
 }
 if(!wi.length)return null;
 const wg=new THREE.BufferGeometry();
 wg.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(wc,4));wg.setAttribute('uv',new THREE.Float32BufferAttribute(wu,2));
 const nn=[];for(let q=0;q<wp.length/3;q++)nn.push(0,1,0);wg.setAttribute('normal',new THREE.Float32BufferAttribute(nn,3));
 wg.setIndex(wi);wg.computeBoundingSphere();
 const m=new THREE.Mesh(wg,waterMat);m.renderOrder=1;m.receiveShadow=true;return m;
}
function clearChunks(){
 for(const c of chunks){for(const m of [c.t0,c.t1,c.w0,c.w1]){if(m){sc.scene.remove(m);m.geometry.dispose()}}}
 chunks=[];
 if(oceanMesh){sc.scene.remove(oceanMesh);oceanMesh.geometry.dispose();oceanMesh=null}
}
function buildTerrain(G){
 Gref=G;clearChunks();
 const w=W+1;VH=new Float32Array(w*(H+1));
 for(let z=0;z<=H;z++)for(let x=0;x<=W;x++){
  let s=0,n=0;
  for(let dz=-1;dz<=0;dz++)for(let dx=-1;dx<=0;dx++){const tx=x+dx,tz=z+dz;if(tx<0||tz<0||tx>=W||tz>=H)continue;s+=TH[G.tile[tz*W+tx]]+G.hgt[tz*W+tx];n++}
  let h=s/n;if(h>-.05)h+=(hash(x,z,7)-.5)*.18;
  VH[z*w+x]=h;
 }
 tileCol=new Float32Array(W*H*3);
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){tileColor(z*W+x,x,z,c1);const q=(z*W+x)*3;tileCol[q]=c1.r;tileCol[q+1]=c1.g;tileCol[q+2]=c1.b}
 HVg=new Float32Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)HVg[j*NX+i]=groundY(i/NF,j/NF);
 if(!terrainMat){
  terrainMat=sc.mat({pbr:true,roughness:.96});sc.terrainMat=terrainMat;
  waterMat=sc.mat({transparent:true,roughness:.1,metalness:.05,depthWrite:false,normalMap:sc.tex.waterN,normalScale:new THREE.Vector2(.45,.45)});
  sc.waterMat=waterMat;
  waterMat.onBeforeCompile=sh=>{
   sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`
   #ifdef USE_NORMALMAP
   vec3 mapN=texture2D(normalMap,vUv).xyz*2.0-1.0;
   vec3 mapN2=texture2D(normalMap,vUv*1.73+vec2(-uFogT*.019,uFogT*.013)).xyz*2.0-1.0;
   vec3 mapN3=texture2D(normalMap,vUv*.47+vec2(uFogT*.006,-uFogT*.009)).xyz*2.0-1.0;
   mapN=normalize(mapN+mapN2*.8+mapN3*.6);mapN.xy*=normalScale;
   normal=perturbNormal2Arb(-vViewPosition,normal,mapN,faceDirection);
   #endif`).replace('#include <dithering_fragment>',`#include <dithering_fragment>
   {float fr=pow(1.0-clamp(dot(normalize(vViewPosition),normal),0.0,1.0),3.0);gl_FragColor.a=clamp(gl_FragColor.a+fr*.32,0.0,1.0);}`);
  };
 }
 const ncx=Math.ceil(W/CT),ncz=Math.ceil(H/CT);
 for(let cz=0;cz<ncz;cz++)for(let cx=0;cx<ncx;cx++){
  const c={cx,cz,x:Math.min(W,(cx+.5)*CT),z:Math.min(H,(cz+.5)*CT),lod:-1};
  c.t1=terrainChunk(cx,cz,1);c.w1=waterChunk(cx,cz,1);c.b0=false;   /* ayrıntılı (LOD0) parçalar yakınlaşınca üretilir */
  for(const m of [c.t1,c.w1])if(m){m.visible=false;sc.scene.add(m)}
  chunks.push(c);
 }
 /* harita dışı uçsuz bucaksız okyanus: haritayı çevreleyen 4 şerit (içeride su parçaları vardır) */
 const og=new THREE.BufferGeometry(),R=1400,Y=WY-.01,pp=[],oi=[];
 const rect=(xa,za,xb,zb)=>{const k=pp.length/3;pp.push(xa,Y,za,xb,Y,za,xa,Y,zb,xb,Y,zb);oi.push(k,k+2,k+1,k+1,k+2,k+3)};
 rect(-R,-R,W+R,0);rect(-R,H,W+R,H+R);rect(-R,0,0,H);rect(W,0,W+R,H);
 const np=pp.length/3,nn=[],uvs=[],oc=[];
 for(let q=0;q<np;q++){nn.push(0,1,0);uvs.push(pp[q*3]*.11,pp[q*3+2]*.11);oc.push(.05,.24,.44,.95)}
 og.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));og.setAttribute('normal',new THREE.Float32BufferAttribute(nn,3));
 og.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));og.setAttribute('color',new THREE.Float32BufferAttribute(oc,4));og.setIndex(oi);
 oceanMesh=new THREE.Mesh(og,waterMat);oceanMesh.renderOrder=0;oceanMesh.frustumCulled=false;sc.scene.add(oceanMesh);
 updateLod(true,isFinite(G.px)?G.px:W/2,isFinite(G.py)?G.py:H/2);
}
/* Ayrıntılı parçalar yalnızca oyuncunun yakınında bellekte tutulur (büyük harita için bellek tasarrufu) */
function build0(c){
 c.b0=true;c.t0=terrainChunk(c.cx,c.cz,2);c.w0=waterChunk(c.cx,c.cz,2);
 for(const m of [c.t0,c.w0])if(m){m.visible=false;sc.scene.add(m)}
}
function drop0(c){
 for(const k of ['t0','w0']){const m=c[k];if(m){sc.scene.remove(m);m.geometry.dispose();c[k]=null}}
 c.b0=false;
}
function updateLod(force,px,pz){
 const t0=performance.now();let nb=0;
 for(const c of chunks){
  const d=Math.hypot(c.x-px,c.z-pz);let want=d<(c.lod===0?125:105)?0:1;
  if(want===0&&!c.b0){
   if(!force&&nb>0&&performance.now()-t0>5)want=1;          /* kare başına üretim süresi sınırlı: kalanlar sonraki karelerde */
   else{build0(c);nb++}
  }else if(c.b0&&d>230)drop0(c);
  if(!force&&want===c.lod)continue;
  c.lod=want;
  if(c.t0)c.t0.visible=want===0;if(c.t1)c.t1.visible=want===1;
  const w=want===0?c.w0:c.w1;
  if(c.w0)c.w0.visible=false;if(c.w1)c.w1.visible=false;
  if(w)w.visible=true;else if(c.w0||c.w1)(c.w0||c.w1).visible=true;
 }
}
S.groundY=groundY;S.colorAt=colorAt;
S.onBuild(buildTerrain);
S.onFrame((G,t,dt,info)=>{
 if(!waterMat)return;
 const n=sc.tex.waterN;n.offset.set(t*.012,t*.007);
 waterMat.envMapIntensity=.35+1.1*info.L;
 const p=sc.cam.position;updateLod(false,p.x,p.z);
});
})();
