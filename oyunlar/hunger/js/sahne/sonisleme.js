/* Hunger 3D - sahne: son işleme (HDR çizim, parıltı/bloom, güneş ışınları, renk derecelendirme, vinyet, tane, kromatik sapma)
   Yalnızca Yüksek ve Orta kalitede etkindir; Düşük kalitede doğrudan ekrana çizilir. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';

const FS_BRIGHT=`
uniform sampler2D tIn;uniform float uThr;varying vec2 vUv;
void main(){
 vec3 c=texture2D(tIn,vUv).rgb;
 float l=max(max(c.r,c.g),c.b);
 float k=clamp((l-uThr)/(uThr*.7+.001),0.,1.);k=k*k*(3.-2.*k);
 gl_FragColor=vec4(min(c,vec3(10.))*k,1.);
}`;
const FS_DOWN=`
uniform sampler2D tIn;uniform vec2 uTexel;varying vec2 vUv;
void main(){
 vec3 c=texture2D(tIn,vUv).rgb*.5;
 c+=texture2D(tIn,vUv+uTexel*vec2(-1.,-1.)).rgb*.125;
 c+=texture2D(tIn,vUv+uTexel*vec2( 1.,-1.)).rgb*.125;
 c+=texture2D(tIn,vUv+uTexel*vec2(-1., 1.)).rgb*.125;
 c+=texture2D(tIn,vUv+uTexel*vec2( 1., 1.)).rgb*.125;
 gl_FragColor=vec4(c,1.);
}`;
const FS_UP=`
uniform sampler2D tIn;uniform vec2 uTexel;uniform float uW;varying vec2 vUv;
void main(){
 vec3 c=texture2D(tIn,vUv).rgb*4.;
 c+=texture2D(tIn,vUv+uTexel*vec2(-1.,0.)).rgb*2.;
 c+=texture2D(tIn,vUv+uTexel*vec2( 1.,0.)).rgb*2.;
 c+=texture2D(tIn,vUv+uTexel*vec2(0.,-1.)).rgb*2.;
 c+=texture2D(tIn,vUv+uTexel*vec2(0., 1.)).rgb*2.;
 c+=texture2D(tIn,vUv+uTexel*vec2(-1.,-1.)).rgb;
 c+=texture2D(tIn,vUv+uTexel*vec2( 1.,-1.)).rgb;
 c+=texture2D(tIn,vUv+uTexel*vec2(-1., 1.)).rgb;
 c+=texture2D(tIn,vUv+uTexel*vec2( 1., 1.)).rgb;
 gl_FragColor=vec4(c/16.*uW,1.);
}`;
const FS_COMP=`
uniform sampler2D tScene,tBloom,tShaft;
uniform vec2 uSun,uRes;
uniform vec3 uShadowTint,uLightTint,uShaftCol;
uniform float uBloom,uShaft,uVig,uGrain,uTime,uExp,uCA,uSat,uFlash,uShaftOn,uContrast,uInsane,uFear,uRed;
varying vec2 vUv;
vec3 hgRRT(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}
vec3 hgACES(vec3 color){
 const mat3 hgIn=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));
 const mat3 hgOut=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));
 color*=uExp/0.6;color=hgIn*color;color=hgRRT(color);color=hgOut*color;
 return clamp(color,0.,1.);
}
vec3 toSRGB(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
 vec2 d=vUv-.5;
 float r2=dot(d,d);
 vec2 uv=vUv+vec2(sin(vUv.y*13.+uTime*1.7),cos(vUv.x*11.+uTime*1.3))*.0028*uInsane;
 /* kromatik sapma: kenarlara doğru artar */
 vec2 off=d*uCA*(1.+uInsane*5.+uFear)*(r2+.02*uInsane)*.012;
 vec3 col=vec3(texture2D(tScene,uv+off).r,texture2D(tScene,uv).g,texture2D(tScene,uv-off).b);
 /* parıltı */
 col+=texture2D(tBloom,vUv).rgb*uBloom;
 /* güneş ışınları */
 if(uShaftOn>.5){
  vec2 dv=(uSun-vUv)*(.92/28.);vec2 p=vUv;float w=1.;vec3 s=vec3(0.);
  for(int i=0;i<28;i++){p+=dv;s+=texture2D(tShaft,p).rgb*w;w*=.955;}
  col+=s/28.*uShaft*uShaftCol;
 }
 col+=vec3(.55,.62,.8)*uFlash;
 col.r+=uRed*.35;col.gb*=1.-uRed*.45;
 col=hgACES(col);
 /* renk derecelendirme: gölgeler soğuk, ışıklar sıcak; doygunluk; hafif S eğrisi */
 float l=dot(col,vec3(.2126,.7152,.0722));
 col*=mix(uShadowTint,uLightTint,smoothstep(.05,.7,l));
 col=mix(vec3(l),col,uSat);
 col=toSRGB(clamp(col,0.,1.));
 col=mix(col,col*col*(3.-2.*col),uContrast);
 /* vinyet */
 col*=1.-(uVig+uFear*.22+uInsane*.18)*smoothstep(.12,.62,r2);
 /* film tanesi + bantlanma önleme */
 float g=hash(vUv*uRes+fract(uTime)*91.7)-.5;
 col+=g*uGrain*(1.-.5*l);
 gl_FragColor=vec4(col,1.);
}`;

let R,post=null;const cfg={on:false,samples:0,shafts:false,bloom:1,q:3};sc.postCfg=cfg;
const quadGeo=new THREE.PlaneGeometry(2,2);
const quadCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
let quad,quadScene,mBright,mDown,mUp,mComp;
const sv=new THREE.Vector3(),sv2=new THREE.Vector2();

function rtOpts(extra){return Object.assign({type:THREE.HalfFloatType,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false},extra||{})}
function hdrOK(){
 try{return R.capabilities.isWebGL2&&(R.extensions.has('EXT_color_buffer_float')||R.extensions.has('EXT_color_buffer_half_float'))}catch(e){return false}
}
function disposePost(){
 if(!post)return;
 post.scene.dispose();post.bright.dispose();post.mips.forEach(m=>m.dispose());post=null;
}
function buildPost(){
 disposePost();
 if(!cfg.on||!hdrOK())return;
 const sz=R.getDrawingBufferSize(new THREE.Vector2()),w=Math.max(2,sz.x|0),h=Math.max(2,sz.y|0);
 const samples=R.capabilities.isWebGL2?cfg.samples:0;
 const scene=new THREE.WebGLRenderTarget(w,h,rtOpts({depthBuffer:true,samples}));
 const bw=Math.max(2,w>>1),bh=Math.max(2,h>>1);
 const bright=new THREE.WebGLRenderTarget(bw,bh,rtOpts());
 const mips=[];let mw=bw,mh=bh;
 for(let i=0;i<4;i++){mw=Math.max(2,mw>>1);mh=Math.max(2,mh>>1);mips.push(new THREE.WebGLRenderTarget(mw,mh,rtOpts()))}
 post={scene,bright,mips,w,h};
}
function mats(){
 const mk=(fs,u,extra)=>new THREE.ShaderMaterial(Object.assign({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,fog:false,lights:false,toneMapped:false},extra||{}));
 mBright=mk(FS_BRIGHT,{tIn:{value:null},uThr:{value:1.25}});
 mDown=mk(FS_DOWN,{tIn:{value:null},uTexel:{value:new THREE.Vector2()}});
 mUp=mk(FS_UP,{tIn:{value:null},uTexel:{value:new THREE.Vector2()},uW:{value:1}},{blending:THREE.AdditiveBlending,transparent:true});
 mComp=mk(FS_COMP,{
  tScene:{value:null},tBloom:{value:null},tShaft:{value:null},uSun:{value:new THREE.Vector2(.5,.5)},uRes:{value:new THREE.Vector2(1,1)},
  uShadowTint:{value:new THREE.Color(.97,1,1.05)},uLightTint:{value:new THREE.Color(1.04,1,.95)},uShaftCol:{value:new THREE.Color(1,.92,.75)},
  uBloom:{value:.55},uShaft:{value:0},uVig:{value:.32},uGrain:{value:.025},uTime:{value:0},uExp:{value:1},uCA:{value:.9},uSat:{value:1.1},uFlash:{value:0},uShaftOn:{value:0},uContrast:{value:.18},uInsane:{value:0},uFear:{value:0},uRed:{value:0}
 });
}
function pass(mat,target,clear){
 quad.material=mat;
 R.setRenderTarget(target);
 const ac=R.autoClear;R.autoClear=!!clear;
 R.render(quadScene,quadCam);
 R.autoClear=ac;
}
const cS=new THREE.Color(),cL=new THREE.Color();
function renderPost(scene,cam,t,dt,info){
 if(!post){R.render(scene,cam);return}
 const u=mComp.uniforms,L=info.L,rain=sc.rain||0,over=sc.over||0;
 /* 1) sahne -> HDR hedef */
 R.setRenderTarget(post.scene);R.render(scene,cam);
 /* 2) parlak alan ayıklama ve bulanıklaştırma zinciri */
 mBright.uniforms.tIn.value=post.scene.texture;mBright.uniforms.uThr.value=1.2;
 pass(mBright,post.bright,true);
 let src=post.bright;
 for(let i=0;i<post.mips.length;i++){
  mDown.uniforms.tIn.value=src.texture;mDown.uniforms.uTexel.value.set(1/src.width,1/src.height);
  pass(mDown,post.mips[i],true);src=post.mips[i];
 }
 for(let i=post.mips.length-1;i>0;i--){
  const s=post.mips[i],d=post.mips[i-1];
  mUp.uniforms.tIn.value=s.texture;mUp.uniforms.uTexel.value.set(1/s.width,1/s.height);mUp.uniforms.uW.value=1;
  pass(mUp,d,false);
 }
 /* 3) birleştirme */
 u.tScene.value=post.scene.texture;u.tBloom.value=post.mips[0].texture;u.tShaft.value=post.bright.texture;
 u.uRes.value.set(post.w,post.h);u.uTime.value=t;
 u.uBloom.value=(.42+.35*(1-L))*cfg.bloom*HG.cfg.bloom/100;
 /* güneş ışınları: güneş ekranın önündeyken ve gün ışığında */
 let sh=0;
 if(cfg.shafts&&sc.sunDirV){
  sv.copy(sc.sunDirV).multiplyScalar(100).add(cam.position);
  const dir=sv.clone().sub(cam.position).normalize(),fw=new THREE.Vector3();cam.getWorldDirection(fw);
  const f=fw.dot(dir);
  sv.project(cam);u.uSun.value.set(sv.x*.5+.5,sv.y*.5+.5);
  sh=Math.max(0,f)*Math.max(0,L-.15)*(1-over*.85)*(sc.sunUp||1);
 }
 u.uShaftOn.value=sh>.01?1:0;u.uShaft.value=sh*1.15;
 /* gün içi renk tonu: gün batımında ışıklar turuncuya, geceleri maviye kayar */
 const ss=Math.max(0,1-Math.abs(L-.5)*2);
 cL.setRGB(1.03+.1*ss*(1-rain),1.0+.01*ss,.97-.12*ss);
 cS.setRGB(.97-.04*(1-L),1.0-.02*(1-L),1.04+.1*(1-L));
 u.uLightTint.value.copy(cL);u.uShadowTint.value.copy(cS);
 u.uSat.value=1.1-.28*rain-.1*over+.06*ss-.4*(sc.insane||0)-.15*(sc.fear||0);
 u.uFlash.value=sc.flash||0;
 {const hz=HG.cfg.horror/100;u.uInsane.value=(sc.insane||0)*hz;u.uFear.value=(sc.fear||0)*hz}u.uRed.value=sc.hurtRed||0;
 u.uExp.value=HG.cfg.bright/100;
 u.uVig.value=.3+.12*(1-L)+(info.mode==='play'&&sc.hurt?sc.hurt*.35:0);
 pass(mComp,null,true);
 R.setRenderTarget(null);
}
sc.postRender=renderPost;

S.onInit(()=>{
 R=sc.R;
 quad=new THREE.Mesh(quadGeo,null);quad.frustumCulled=false;
 quadScene=new THREE.Scene();quadScene.add(quad);
 mats();
});
/* kalite: 3 Yüksek (4x MSAA, bloom, ışınlar), 2 Orta (2x MSAA, bloom), diğerleri kapalı */
S.onQuality(q=>{
 cfg.q=q;
 if(q>=3)Object.assign(cfg,{on:true,samples:4,shafts:true,bloom:1,q});
 else if(q===2)Object.assign(cfg,{on:true,samples:2,shafts:false,bloom:.8,q});
 else Object.assign(cfg,{on:false,samples:0,shafts:false,bloom:0,q});
 sc.postOn=cfg.on;
});
const oldResize=S.resize;
S.resize=()=>{oldResize();if(R&&quad)buildPost()};
/* tuvalin hızlı yeniden boyutlanmasında gereksiz yeniden kurulumu önlemek için ufak bir geciktirme gerekmez: setSize yalnızca pencere değişince çağrılır */
})();
