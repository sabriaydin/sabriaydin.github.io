/* Hunger 3D - sahne: hava durumu (bulutlanma, yağmur, şimşek) - yalnızca görsel ve işitsel; oyun kurallarını etkilemez */
(()=>{
'use strict';
const {smooth,clamp}=HG;
const S=HG.Scene,sc=HG.sc;
sc.rain=0;sc.over=0;sc.flash=0;
let rain,mat,fl=0,boltT=20,wet=-1,vis=1;
const MAXN=5600;

const VS=`
attribute vec4 aS;attribute float aE;
uniform vec3 uCam;uniform float uTime,uSpeed,uLen;uniform vec2 uWind;
varying float vA;
void main(){
 float bx=30.,by=22.,bz=30.;
 float y=mod(aS.y*by-uTime*uSpeed*(.88+aS.w*.24),by);
 float x=mod(aS.x*bx-uCam.x+bx*.5,bx)-bx*.5;
 float z=mod(aS.z*bz-uCam.z+bz*.5,bz)-bz*.5;
 vec3 p=vec3(uCam.x+x,uCam.y+y-by*.4,uCam.z+z);
 vec3 vel=normalize(vec3(uWind.x,-1.,uWind.y));
 p-=vel*uLen*aE;
 float dist=length(p-uCam);
 vA=(1.-aE*.7)*(1.-smoothstep(11.,17.,dist))*smoothstep(.6,1.6,dist);
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`;
const FS=`uniform float uAlpha;uniform vec3 uCol;varying float vA;void main(){gl_FragColor=vec4(uCol,vA*uAlpha);}`;

S.onInit(()=>{
 const n=MAXN*2,pos=new Float32Array(n*3),aS=new Float32Array(n*4),aE=new Float32Array(n);
 for(let i=0;i<MAXN;i++){
  const x=Math.random(),y=Math.random(),z=Math.random(),w=Math.random();
  for(let k=0;k<2;k++){const j=i*2+k;aS[j*4]=x;aS[j*4+1]=y;aS[j*4+2]=z;aS[j*4+3]=w;aE[j]=k}
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(aS,4));g.setAttribute('aE',new THREE.BufferAttribute(aE,1));
 mat=new THREE.ShaderMaterial({
  uniforms:{uCam:{value:new THREE.Vector3()},uTime:{value:0},uSpeed:{value:19},uLen:{value:.9},uWind:{value:new THREE.Vector2(.18,.06)},uAlpha:{value:0},uCol:{value:new THREE.Color(.72,.8,.92)}},
  vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,fog:false
 });
 rain=new THREE.LineSegments(g,mat);rain.frustumCulled=false;rain.renderOrder=20;rain.visible=false;sc.scene.add(rain);
});
S.onQuality(q=>{if(rain)rain.geometry.setDrawRange(0,[1200,2600,4200,MAXN][q]*2)});

S.onFrame((G,t,dt,info)=>{
 const c=G.clock,play=info.mode==='play';
 const raw=Math.sin(c/310)*.55+Math.sin(c/131+1.7)*.35+Math.sin(c/53+.4)*.1;
 const gate=smooth(40,150,c);
 const F=HG.wxForce;                                        /* konsol komutu: hava durumu zorlaması [bulut,yağmur] */
 const tOver=F?F[0]:smooth(.2,.65,raw)*gate,tRain=F?F[1]:smooth(.5,.85,raw)*gate;
 const k=1-Math.exp(-dt/7);
 sc.over+=(tOver-sc.over)*k;sc.rain+=(tRain-sc.rain)*k;
 /* şimşek */
 if(sc.rain>.65&&play){
  boltT-=dt;
  if(boltT<=0){
   boltT=12+Math.random()*28;fl=1;setTimeout(()=>{fl=.85},130);
   setTimeout(()=>{if(HG.snd)HG.snd('thunder')},350+Math.random()*2600);
  }
 }
 fl*=Math.exp(-dt*6.5);
 sc.flash=fl*(.65+.35*Math.sin(t*70))*.5;
 /* yağmur çizgileri; barınakta görünmez */
 const tv=G.sheltered?0:1;vis+=(tv-vis)*(1-Math.exp(-dt*3));
 const a=sc.rain*vis;
 rain.visible=a>.01;
 if(rain.visible){
  const u=mat.uniforms;u.uCam.value.copy(sc.cam.position);u.uTime.value=t;u.uAlpha.value=.3*a;if(sc.wind)u.uWind.value.set(sc.wind.x*(.1+sc.wind.s*.35),sc.wind.z*(.1+sc.wind.s*.35));
 }
 /* ıslak yüzeyler: pürüzlülük azalır */
 const w=Math.round(sc.rain*20)/20;
 if(w!==wet){wet=w;for(const m of sc.mats)if(m.roughness!==undefined){if(m._r0===undefined)m._r0=m.roughness;m.roughness=m._r0-.3*w}}
});
})();
