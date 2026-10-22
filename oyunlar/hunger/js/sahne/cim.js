/* Hunger 3D - sahne: çimen tutamları ve çiçekler (oyuncunun çevresinde örneklenir, rüzgârda sallanır) */
(()=>{
'use strict';
const {W,H,T,O,hash,mulberry32,fbm}=HG;
const S=HG.Scene,sc=HG.sc;
const PER_TILE=5,RADIUS=58,CELL=16,CAP=34000,FCAP=5000,MOVE=5;
const uTime={value:0};
let grass=null,flow=null;
const NC=Math.ceil(W/CELL);
let lastX=-1e9,lastZ=-1e9,dirty=true;

function tuftGeo(){
 const pos=[],col=[],idx=[];
 const blades=[[0,0,.5,.26],[2.1,.04,-.06,.32],[4.2,-.05,.05,.22]];   /* sap boyu düşürüldü: eski boyda (0,42 × ölçek ≈ 0,82 m) köylülerin bacakları çimenin içinde kalıyordu */
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
/* çiçek: çapraz iki şeritli eğik sap, iki yaprak, sarı göbek ve altı yapraklı taç; aTint: 1 = taç yaprağı (örnek rengiyle boyanır), 0 = yeşil/sarı kısımlar */
function flowerGeo(){
 const pos=[],col=[],tint=[],idx=[];
 const v=(x,y,z,r,g,b,t)=>{pos.push(x,y,z);col.push(r,g,b);tint.push(t);return pos.length/3-1};
 const sh=.36,bend=.035;
 const sx=y=>bend*(y/sh)*(y/sh);                                          /* sap yukarıda hafif eğilir */
 for(const rot of [0,Math.PI/2]){
  const c=Math.cos(rot),s=Math.sin(rot),w=.011;let prev=null;
  for(let i=0;i<=3;i++){
   const y=sh*i/3,k=1-.35*i/3,x0=sx(y),a=v(x0-w*k*c,y,-w*k*s,.05,.17,.035,0),b=v(x0+w*k*c,y,w*k*s,.07,.22,.045,0);
   if(prev)idx.push(prev[0],prev[1],a,prev[1],b,a);prev=[a,b];
  }
 }
 for(const [yy,ang,len] of [[.1,.4,.1],[.19,-2.5,.085]]){                  /* yapraklar */
  const c=Math.cos(ang),s=Math.sin(ang),x0=sx(yy);
  const a=v(x0,yy,0,.04,.15,.03,0),b=v(x0+c*len*.5-s*.022,yy+.03,s*len*.5+c*.022,.07,.26,.05,0),d=v(x0+c*len*.5+s*.022,yy+.03,s*len*.5-c*.022,.07,.26,.05,0),e=v(x0+c*len,yy+.045,s*len,.1,.34,.07,0);
  idx.push(a,b,d,b,e,d);
 }
 const top=sx(sh),cy=sh+.004;
 const ctr=v(top,cy+.012,0,1,.62,.04,0);let ring=[];
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ring.push(v(top+Math.cos(a)*.022,cy+.004,Math.sin(a)*.022,.7,.36,.02,0))}
 for(let i=0;i<6;i++)idx.push(ctr,ring[i],ring[(i+1)%6]);
 for(let k=0;k<6;k++){
  const a=k/6*Math.PI*2+.3,c=Math.cos(a),s=Math.sin(a),px=-s,pz=c;
  const rb=.02,rm=.055,rt=.092,wm=.03;
  const b0=v(top+c*rb,cy+.002,s*rb,.62,.62,.62,1),mL=v(top+c*rm-px*wm,cy+.014,s*rm-pz*wm,1,1,1,1),mR=v(top+c*rm+px*wm,cy+.014,s*rm+pz*wm,1,1,1,1),tp=v(top+c*rt,cy+.006,s*rt,.9,.9,.9,1);
  idx.push(b0,mL,mR,mL,tp,mR);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('aTint',new THREE.Float32BufferAttribute(tint,1));g.setIndex(idx);g.computeVertexNormals();
 const nrm=g.attributes.normal;for(let i=0;i<nrm.count;i++)nrm.setXYZ(i,0,1,0);
 return g;
}
function windMat(amp,tinted){
 const m=sc.mat({side:THREE.DoubleSide,roughness:.9});
 m.onBeforeCompile=sh=>{
  sh.uniforms.uTime=uTime;sh.uniforms.uWindV=sc.U.uWindV;sh.uniforms.uWPh=sc.U.uWPh;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n normal=normalize(vNormal);');   /* iki yüzlü yaprak: arka yüz de ışık alır (karanlık yaprak kalmaz) */
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform vec3 uWindV;uniform vec2 uWPh;'+(tinted?'\nattribute float aTint;':'')).replace('#include <color_vertex>','#include <color_vertex>'+(tinted?'\n#ifdef USE_INSTANCING_COLOR\n vColor.xyz=color.xyz*mix(vec3(1.),instanceColor.xyz,aTint);\n#endif':'')).replace('#include <begin_vertex>',`vec3 transformed=vec3(position);
  #ifdef USE_INSTANCING
  float ph=instanceMatrix[3].x*.8+instanceMatrix[3].z*.6;
  float ws=.45+uWindV.z*1.2,wv=sin(uWPh.x+ph-dot(instanceMatrix[3].xz,vec2(.8,.6))*.35);   /* dalga yönü sabit: rüzgâr yönü yavaşça dönerken uzak bitkilerin fazı kaymaz */
  transformed.x+=((wv*.6+sin(uTime*3.1+ph*2.))*ws+uWindV.x*uWindV.z*1.6)*position.y*position.y*${amp.toFixed(2)};
  transformed.z+=(cos(uTime*1.3+ph*1.2)*.4*ws+uWindV.y*uWindV.z*1.6)*position.y*position.y*${amp.toFixed(2)};
  #endif`);
 };
 if(tinted)m.customProgramCacheKey=()=>'flowerTint';
 return m;
}
function mkMesh(geo,mat,cap){
 const m=new THREE.InstancedMesh(geo,mat,cap);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.count=0;m.setColorAt(0,new THREE.Color(1,1,1));
 sc.scene.add(m);return m;
}
S.onInit(()=>{
 grass=mkMesh(tuftGeo(),windMat(.9),CAP);
 flow=mkMesh(flowerGeo(),windMat(.5,true),FCAP);
 sc.grass=grass;sc.flow=flow;
});

const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),s3=new THREE.Vector3(),cl=new THREE.Color();
const FCOL=[0xffffff,0xffe14a,0xff7aa8,0xb48cff,0xff6a4a,0x7ac8ff];
/* Yapı kareleri: yerleştirilen ve üretilen yapıların kenarında çimen bitmez (sapları yapının içine girmesin) */
const STR=new Uint8Array(64);for(const k of ['BENCH','FURN','FIRE','WALLW','WALLS','DOOR','VWALL','VDOOR','VDEC','WALLT','WALLM','DOORM','FENCE','BED','RACK','BARREL','TORCHP','SNARE','PLOT','CHEST','SIGN','APIARY','FTRAP','HIVEW','WINW','WINS','WINM','ARCHW','ARCHS','GATE','GATEM','FENCES','FENCEM'])STR[O[k]]=1;
const WATER_LIM=()=>sc.WY+.07;                       /* bu yüksekliğin altında (su içinde / su çizgisinde) çimen bitmez */
/* Hücre (16x16 kare) bazlı tembel üretim: oyuncunun yaklaştığı hücrelerin konum, dönüş ve renkleri tohumdan hesaplanır, bellekte sınırlı sayıda tutulur */
const cells=new Map(),CELL_KEEP=260;
let cellSeed=0,cellG=null;
function genCell(G,ci){
 const cx=ci%NC,cz=(ci/NC)|0,x0=cx*CELL,z0=cz*CELL,x1=Math.min(W,x0+CELL),z1=Math.min(H,z0+CELL);
 const rnd=mulberry32((cellSeed+ci*7919)>>>0);
 const hsx=[];                                                     /* köy evlerinin zemini: içeride ve duvar altında çimen/çiçek bitmez */
 for(const v of G.villages||[]){if(v.cx<x0-16||v.cx>x1+16||v.cy<z0-16||v.cy>z1+16)continue;for(const h of v.houses||[])hsx.push(h)}
 const inHouse=(x,z)=>{for(const h of hsx)if(Math.abs(x+.5-h.x)<2.6&&Math.abs(z+.5-h.z)<2.6)return true;return false};
 /* Köy çevresinde çim kısa tutulur: meydanda ve patikalarda uzun ot köylüleri gizliyordu. */
 const vlist=(G.villages||[]).filter(v=>!(v.cx<x0-20||v.cx>x1+20||v.cy<z0-20||v.cy>z1+20));
 const vfac=(x,z)=>{
  for(const v of vlist){
   const d=Math.hypot(v.cx-x,v.cy-z);
   if(d<15)return .42+.58*Math.max(0,(d-7)/8);
  }
  return 1;
 };
 const L=[],F=[],lim=WATER_LIM();
 for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){
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
   const y=S.groundY(c.x,c.z);
   if(y<lim)continue;                                              /* su altında kalan veya su çizgisindeki noktalar */
   const sl=Math.abs(S.groundY(c.x+.3,c.z)-y)+Math.abs(S.groundY(c.x,c.z+.3)-y);
   if(sl>.42)continue;                                             /* dik yamaçta sap dikilmez */
   if(S.groundY(c.x+.45,c.z)<lim||S.groundY(c.x-.45,c.z)<lim||S.groundY(c.x,c.z+.45)<lim||S.groundY(c.x,c.z-.45)<lim)continue;   /* su kenarında sapların ucu suya girmesin */
   const sc2=(isG?.7+c.r*.6:.8+c.r*.6)*(isG?vfac(c.x,c.z):1);     /* köy içinde çim kısa kesilmiş gibi durur */
   p.set(c.x,y-.02-Math.min(.4,sl*.55),c.z);                       /* eğimde ve uzak arazi ayrıntısında sapın dibi gömülür: havada duran çimen kalmaz */e.set(0,c.r2*6.28,0);q.setFromEuler(e);s3.set(sc2,isG?sc2*(.78+c.r2*.42):sc2,sc2);m4.compose(p,q,s3);
   if(isG){S.colorAt(c.x,c.z,cl);const v=.9+c.r*.35;items.push({c,me:m4.elements.slice(),rgb:[cl.r*v,cl.g*v,cl.b*v]})}
   else{cl.setHex(FCOL[c.c]);items.push({c,me:m4.elements.slice(),rgb:[cl.r,cl.g,cl.b]})}
  }
  const n=items.length,me=new Float32Array(n*16),rgb=new Float32Array(n*3),tile=new Uint32Array(n),X=new Float32Array(n),Z=new Float32Array(n),R=new Float32Array(n);
  items.forEach((it,k)=>{me.set(it.me,k*16);rgb.set(it.rgb,k*3);tile[k]=it.c.i;X[k]=it.c.x;Z[k]=it.c.z;R[k]=it.c.r3===undefined?0:it.c.r3});
  return {n,me,rgb,tile,X,Z,R};
 };
 return {g:pack(L,true),f:pack(F,false)};
}
function getCell(G,ci){
 let c=cells.get(ci);
 if(c){cells.delete(ci);cells.set(ci,c);return c}          /* en son kullanılan sona alınır */
 c=genCell(G,ci);cells.set(ci,c);
 if(cells.size>CELL_KEEP)cells.delete(cells.keys().next().value);
 return c;
}
function layout(G){cells.clear();cellSeed=(G.seed^0x51ed)>>>0;cellG=G;dirty=true;lastX=-1e9}
/* Oyuncunun çevresindeki aday örnekleri mesh'e doldurur (uzaklaştıkça seyrelir) */
function rebuild(G,px,pz,frac){
 const R2=RADIUS*RADIUS,ob=G.obj,lo=W+1,hi=W*H-W-2;
 const c0=Math.max(0,Math.floor((px-RADIUS)/CELL)),c1=Math.min(NC-1,Math.floor((px+RADIUS)/CELL)),r0=Math.max(0,Math.floor((pz-RADIUS)/CELL)),r1=Math.min(NC-1,Math.floor((pz+RADIUS)/CELL));
 const fill=(mesh,cap,key,keep)=>{
  const ma=mesh.instanceMatrix.array,ca=mesh.instanceColor.array;let n=0;
  for(let r=r0;r<=r1&&n<cap;r++)for(let c=c0;c<=c1&&n<cap;c++){
   const cell=getCell(G,r*NC+c)[key],N=cell.n,Me=cell.me,Rgb=cell.rgb,Tile=cell.tile,X=cell.X,Z=cell.Z,Rr=cell.R;
   for(let k=0;k<N;k++){
    const i0=Tile[k];
    if(ob[i0])continue;
    const dx=X[k]-px,dz=Z[k]-pz,d2=dx*dx+dz*dz;if(d2>R2)continue;
    if(!keep(Rr[k],d2))continue;
    if(i0>lo&&i0<hi){                                          /* yapıların kenarındaki noktalar atlanır */
     const fx=X[k]-(i0%W),fz=Z[k]-((i0/W)|0);
     if((fx<.34&&STR[ob[i0-1]])||(fx>.66&&STR[ob[i0+1]])||(fz<.34&&STR[ob[i0-W]])||(fz>.66&&STR[ob[i0+W]]))continue;
    }
    ma.set(Me.subarray(k*16,k*16+16),n*16);ca[n*3]=Rgb[k*3];ca[n*3+1]=Rgb[k*3+1];ca[n*3+2]=Rgb[k*3+2];
    if(++n>=cap)break;
   }
  }
  mesh.count=n;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;mesh.visible=n>0;
 };
 fill(grass,CAP,'g',(r3,d2)=>r3<frac*(1-d2/R2*.85));
 fill(flow,FCAP,'f',(r,d2)=>frac>0&&d2<R2*.7);
}
/* Yaklaşmakta olan hücreler her karede en fazla biri olmak üzere önceden hazırlanır (yürürken takılma olmaz) */
function prefetch(G,px,pz){
 const R=RADIUS+22,c0=Math.max(0,Math.floor((px-R)/CELL)),c1=Math.min(NC-1,Math.floor((px+R)/CELL)),r0=Math.max(0,Math.floor((pz-R)/CELL)),r1=Math.min(NC-1,Math.floor((pz+R)/CELL));
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const ci=r*NC+c;if(!cells.has(ci)){getCell(G,ci);return}}
}
S.onBuild(G=>layout(G));
S.onSync(()=>{dirty=true});
S.markGrass=()=>{dirty=true};
S.onQuality(()=>{dirty=true;lastX=-1e9});
S.onFrame((G,t,dt,info)=>{
 uTime.value=t;
 const play=info.mode==='play',frac=sc.grassFrac===undefined?1:sc.grassFrac;
 if(!grass||!G.obj)return;
 if(!play||frac<=0){grass.visible=false;flow.visible=false;lastX=-1e9;return}
 if(!dirty&&Math.hypot(G.px-lastX,G.py-lastZ)<MOVE){prefetch(G,G.px,G.py);return}
 lastX=G.px;lastZ=G.py;dirty=false;
 rebuild(G,G.px,G.py,frac);
});
})();
