/* Hunger 3D - sahne: çimen tutamları ve çiçekler (oyuncunun çevresinde örneklenir, rüzgârda sallanır) */
(()=>{
'use strict';
const {W,H,T,O,hash,mulberry32,fbm}=HG;
const S=HG.Scene,sc=HG.sc;
const PER_TILE=5,RADIUS=58,CELL=16,CAP=34000,FCAP=5000,MOVE=5;
const uTime={value:0};
let grass=null,flow=null;
let gN=0,gMe,gRgb,gTile,gR,gX,gZ,gCell;          /* çimen adayları (yapı-dizisi) */
let fN=0,fMe,fRgb,fTile,fX,fZ,fCell;               /* çiçek adayları */
const NC=Math.ceil(W/CELL);
let lastX=-1e9,lastZ=-1e9,dirty=true;

function tuftGeo(){
 const pos=[],col=[],idx=[];
 const blades=[[0,0,.5,.34],[2.1,.04,-.06,.42],[4.2,-.05,.05,.3]];
 let n=0;
 for(const [rot,ox,oz,hgt] of blades){
  const c=Math.cos(rot),s=Math.sin(rot),w=.045;
  const pts=[[-w,0,0],[w,0,0],[-w*.7,hgt*.55,.03],[w*.7,hgt*.55,.03],[0,hgt,.09]];
  for(const [x,y,z] of pts){pos.push(ox+x*c+z*s,y,oz-x*s+z*c);const t=y/hgt;col.push(.55+.6*t,.62+.55*t,.45+.35*t)}
  idx.push(n,n+1,n+2,n+1,n+3,n+2,n+2,n+3,n+4);n+=5;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const nrm=g.attributes.normal;for(let i=0;i<nrm.count;i++)nrm.setXYZ(i,0,1,0);
 return g;
}
function flowerGeo(){
 const pos=[],col=[],idx=[];
 const sh=.34;
 pos.push(-.012,0,0,.012,0,0,-.01,sh,0,.01,sh,0);for(let i=0;i<4;i++)col.push(.35,.6,.25);idx.push(0,1,2,1,3,2);
 let n=4;
 for(let k=0;k<5;k++){
  const a=k/5*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
  pos.push(0,sh,0,c*.07-s*.025,sh+.015,s*.07+c*.025,c*.07+s*.025,sh+.015,s*.07-c*.025);
  for(let i=0;i<3;i++)col.push(1,1,1);idx.push(n,n+1,n+2);n+=3;
 }
 pos.push(0,sh+.012,0,.02,sh+.012,0,0,sh+.012,.02);for(let i=0;i<3;i++)col.push(1,.85,.2);idx.push(n,n+1,n+2);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const nrm=g.attributes.normal;for(let i=0;i<nrm.count;i++)nrm.setXYZ(i,0,1,0);
 return g;
}
function windMat(amp){
 const m=sc.mat({side:THREE.DoubleSide,roughness:.9});
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTime=uTime;sh.uniforms.uWindV=sc.U.uWindV;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n normal=normalize(vNormal);');   /* iki yüzlü yaprak: arka yüz de ışık alır (karanlık yaprak kalmaz) */
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform vec3 uWindV;').replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
  #ifdef USE_INSTANCING
  float ph=instanceMatrix[3].x*.8+instanceMatrix[3].z*.6;
  float ws=.45+uWindV.z*1.2,wv=sin(uTime*(1.7+uWindV.z*1.4)+ph-dot(instanceMatrix[3].xz,uWindV.xy)*.35);
  transformed.x+=((wv*.6+sin(uTime*3.1+ph*2.))*ws+uWindV.x*uWindV.z*1.6)*position.y*position.y*${amp.toFixed(2)};
  transformed.z+=(cos(uTime*1.3+ph*1.2)*.4*ws+uWindV.y*uWindV.z*1.6)*position.y*position.y*${amp.toFixed(2)};
  #endif`);
 };
 return m;
}
function mkMesh(geo,mat,cap){
 const m=new THREE.InstancedMesh(geo,mat,cap);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.count=0;m.setColorAt(0,new THREE.Color(1,1,1));
 sc.scene.add(m);return m;
}
S.onInit(()=>{
 grass=mkMesh(tuftGeo(),windMat(.9),CAP);
 flow=mkMesh(flowerGeo(),windMat(.5),FCAP);
 sc.grass=grass;
});

const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s3=new THREE.Vector3(),cl=new THREE.Color();
const FCOL=[0xffffff,0xffe14a,0xff7aa8,0xb48cff,0xff6a4a,0x7ac8ff];
/* Arazi kurulduğunda bir kez: konum, dönüş, renk önceden hesaplanır; hücrelere (grid) göre sıralanır */
function layout(G){
 const rnd=mulberry32(G.seed^0x51ed);
 const L=[],F=[];
 /* köy evlerinin zemini: içeride ve duvar altında çimen/çiçek bitmez */
 const hsx=[];for(const v of G.villages||[])for(const h of v.houses||[])hsx.push(h);
 const inHouse=(x,z)=>{for(const h of hsx)if(Math.abs(x+.5-h.x)<2.6&&Math.abs(z+.5-h.z)<2.6)return true;return false};
 for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  if(G.tile[z*W+x]!==T.GRASS)continue;
  if(hsx.length&&inHouse(x,z))continue;
  const patch=fbm(x/7,z/7,G.seed+61);
  for(let k=0;k<PER_TILE;k++){
   const px=x+rnd(),pz=z+rnd(),r=rnd(),r2=rnd(),r3=rnd();
   L.push({x:px,z:pz,i:z*W+x,r,r2,r3});
   if(patch>.62&&rnd()<.55)F.push({x:x+rnd(),z:z+rnd(),i:z*W+x,r:rnd(),r2:rnd(),c:(rnd()*FCOL.length)|0});
  }
 }
 const pack=(arr,isG)=>{
  const items=[];
  for(const c of arr){
   const y=S.groundY(c.x,c.z),sl=Math.abs(S.groundY(c.x+.3,c.z)-y)+Math.abs(S.groundY(c.x,c.z+.3)-y);
   if(sl>.55)continue;
   const sc2=isG?.7+c.r*.7:.8+c.r*.6;
   p.set(c.x,y-.02,c.z);e.set(0,c.r2*6.28,0);q.setFromEuler(e);s3.set(sc2,isG?sc2*(.8+c.r2*.6):sc2,sc2);m4.compose(p,q,s3);
   if(isG){S.colorAt(c.x,c.z,cl);const v=.9+c.r*.35;items.push({c,me:m4.elements.slice(),rgb:[cl.r*v,cl.g*v,cl.b*v]})}
   else{cl.setHex(FCOL[c.c]);items.push({c,me:m4.elements.slice(),rgb:[cl.r,cl.g,cl.b]})}
  }
  items.sort((a,b)=>cellOf(a.c.x,a.c.z)-cellOf(b.c.x,b.c.z));
  return items;
 };
 const cellOf=(x,z)=>Math.floor(z/CELL)*NC+Math.floor(x/CELL);
 const gi=pack(L,true),fi=pack(F,false);
 const store=(items)=>{
  const n=items.length,me=new Float32Array(n*16),rgb=new Float32Array(n*3),tile=new Uint32Array(n),X=new Float32Array(n),Z=new Float32Array(n),R=new Float32Array(n),cell=new Int32Array(NC*NC+1);
  items.forEach((it,k)=>{me.set(it.me,k*16);rgb.set(it.rgb,k*3);tile[k]=it.c.i;X[k]=it.c.x;Z[k]=it.c.z;R[k]=it.c.r3===undefined?0:it.c.r3;cell[cellOf(it.c.x,it.c.z)+1]++});
  for(let k=0;k<NC*NC;k++)cell[k+1]+=cell[k];
  return {n,me,rgb,tile,X,Z,R,cell};
 };
 const a=store(gi),b=store(fi);
 gN=a.n;gMe=a.me;gRgb=a.rgb;gTile=a.tile;gR=a.R;gX=a.X;gZ=a.Z;gCell=a.cell;
 fN=b.n;fMe=b.me;fRgb=b.rgb;fTile=b.tile;fX=b.X;fZ=b.Z;fCell=b.cell;
 dirty=true;lastX=-1e9;
}
/* Oyuncunun çevresindeki aday örnekleri mesh'e doldurur (uzaklaştıkça seyrelir) */
function rebuild(G,px,pz,frac){
 const R2=RADIUS*RADIUS;
 const c0=Math.max(0,Math.floor((px-RADIUS)/CELL)),c1=Math.min(NC-1,Math.floor((px+RADIUS)/CELL)),r0=Math.max(0,Math.floor((pz-RADIUS)/CELL)),r1=Math.min(NC-1,Math.floor((pz+RADIUS)/CELL));
 const fill=(mesh,cap,N,Me,Rgb,Tile,X,Z,Rr,cell,keep)=>{
  const ma=mesh.instanceMatrix.array,ca=mesh.instanceColor.array;let n=0;
  for(let r=r0;r<=r1&&n<cap;r++)for(let c=c0;c<=c1&&n<cap;c++){
   const ci=r*NC+c;
   for(let k=cell[ci];k<cell[ci+1];k++){
    if(G.obj[Tile[k]])continue;
    const dx=X[k]-px,dz=Z[k]-pz,d2=dx*dx+dz*dz;if(d2>R2)continue;
    if(!keep(Rr[k],d2))continue;
    ma.set(Me.subarray(k*16,k*16+16),n*16);ca[n*3]=Rgb[k*3];ca[n*3+1]=Rgb[k*3+1];ca[n*3+2]=Rgb[k*3+2];
    if(++n>=cap)break;
   }
  }
  mesh.count=n;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.visible=n>0;
 };
 fill(grass,CAP,gN,gMe,gRgb,gTile,gX,gZ,gR,gCell,(r3,d2)=>r3<frac*(1-d2/R2*.85));
 fill(flow,FCAP,fN,fMe,fRgb,fTile,fX,fZ,new Float32Array(fN),fCell,(r,d2)=>frac>0&&d2<R2*.7);
}
S.onBuild(G=>layout(G));
S.onSync(()=>{dirty=true});
S.onQuality(()=>{dirty=true;lastX=-1e9});
S.onFrame((G,t,dt,info)=>{
 uTime.value=t;
 const play=info.mode==='play',frac=sc.grassFrac===undefined?1:sc.grassFrac;
 if(!grass||!G.obj)return;
 if(!play||frac<=0){grass.visible=false;flow.visible=false;lastX=-1e9;return}
 if(!dirty&&Math.hypot(G.px-lastX,G.py-lastZ)<MOVE)return;
 lastX=G.px;lastZ=G.py;dirty=false;
 rebuild(G,G.px,G.py,frac);
});
})();
