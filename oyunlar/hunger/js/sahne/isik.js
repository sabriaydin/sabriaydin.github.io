/* Hunger 3D - sahne: gökyüzü (gradyan, güneş, ay, bulut), ışıklar, yansıma ortamı, yıldızlar, ateş ışıkları */
(()=>{
'use strict';
const {W,H,clamp,smooth}=HG;
const S=HG.Scene,sc=HG.sc;
let hemi,moon,lantern,stars,dome,skyU;const fireLights=[];
const C=h=>new THREE.Color(h);
const cTopN=C(0x03060f),cTopD=C(0x2a72c8),cHorN=C(0x0a1226),cHorD=C(0xa4d0ee),cDusk=C(0xf0955a),cDuskTop=C(0x5a5f9a);
const cCloudD=C(0xfdfdfd),cCloudN=C(0x1a2236),cCloudDusk=C(0xffc9a0);
const cWarm=C(0xffb070),cWhite=C(0xfff1de),cHN=C(0x2a3a6a),cHD=C(0xbfe0ff);
const top=new THREE.Color(),hor=new THREE.Color(),cloud=new THREE.Color(),tmp=new THREE.Color();
sc.fires=[];

const VERT=`varying vec3 vDir;void main(){vDir=position;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_Position.z=gl_Position.w;}`;
const FRAG=`
varying vec3 vDir;
uniform vec3 uTop,uHor,uCloud,uSunDir,uSunCol,uMoonDir;
uniform float uNight,uDusk,uTime,uCover;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float t=0.,a=.5;for(int i=0;i<5;i++){t+=a*vn(p);p=p*2.03+7.1;a*=.5;}return t;}
void main(){
 vec3 d=normalize(vDir);
 float y=max(d.y,0.);
 vec3 col=mix(uHor,uTop,pow(y,.5));
 float sd=max(dot(d,uSunDir),0.);
 float horGlow=pow(1.-y,6.);
 col+=uSunCol*(pow(sd,900.)*7.+pow(sd,20.)*.22+pow(sd,3.)*.10*(1.-uNight))*(1.-uNight);
 col+=uSunCol*horGlow*pow(sd,2.)*.25*uDusk;
 float md=max(dot(d,uMoonDir),0.);
 col+=vec3(.92,.95,1.)*smoothstep(.99935,.9996,md)*uNight*1.6+vec3(.25,.35,.6)*pow(md,60.)*.2*uNight;
 if(d.y>.0){
  vec2 p=d.xz/(d.y+.12)*.9+vec2(uTime*.010,uTime*.004);
  float n=fbm(p*1.3);
  float c=smoothstep(uCover,uCover+.28,n);
  float fade=smoothstep(.0,.22,d.y);
  float lit=clamp(fbm(p*1.3+vec2(.12,.07))-n+.55,0.,1.);
  vec3 cc=uCloud*(.72+.38*lit)+uSunCol*pow(sd,6.)*.35*(1.-uNight);
  col=mix(col,cc,c*fade*.92);
 }
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <encodings_fragment>
}`;
function skyMaterial(){
 return new THREE.ShaderMaterial({
  uniforms:{uTop:{value:new THREE.Color()},uHor:{value:new THREE.Color()},uCloud:{value:new THREE.Color()},uSunDir:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color()},uMoonDir:{value:new THREE.Vector3(0,-1,0)},uNight:{value:0},uDusk:{value:0},uTime:{value:0},uCover:{value:.5}},
  vertexShader:VERT,fragmentShader:FRAG,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false
 });
}
const cBT=new THREE.Color(.16,.012,.02),cBH=new THREE.Color(.5,.06,.045),cBC=new THREE.Color(.34,.05,.05),cBM=new THREE.Color(1,.22,.15);
const sunDir=new THREE.Vector3(),moonDir=new THREE.Vector3();

S.onInit(()=>{
 const scene=sc.scene;
 hemi=new THREE.HemisphereLight(0xbfe0ff,0x3f4a2a,.4);scene.add(hemi);
 const sun=sc.sun=new THREE.DirectionalLight(0xfff2dc,2.2);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);const c=sun.shadow.camera;c.left=-26;c.right=26;c.top=26;c.bottom=-26;c.near=1;c.far=150;sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;
 scene.add(sun,sun.target);
 moon=new THREE.DirectionalLight(0x6f8cff,0);scene.add(moon,moon.target);
 lantern=new THREE.PointLight(0xffd9a0,0,7,2);scene.add(lantern);
 for(let i=0;i<3;i++){const l=new THREE.PointLight(0xff8a3c,0,13,1.6);scene.add(l);fireLights.push(l)}
 const sp=[];for(let i=0;i<700;i++){const a=Math.random()*Math.PI*2,b=Math.acos(Math.random()*.95+.02),r=170;sp.push(Math.sin(b)*Math.cos(a)*r,Math.cos(b)*r,Math.sin(b)*Math.sin(a)*r)}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
 stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));stars.frustumCulled=false;stars.renderOrder=-9;scene.add(stars);
 /* gökyüzü kubbesi */
 dome=new THREE.Mesh(new THREE.SphereGeometry(300,32,16),skyMaterial());dome.frustumCulled=false;dome.renderOrder=-10;scene.add(dome);skyU=dome.material.uniforms;
 /* yansıma ortamı: öğle gökyüzünden bir kez üretilir (PBR yansımaları ve gölge-ışığı için) */
 try{
  const es=new THREE.Scene(),em=skyMaterial(),u=em.uniforms;
  u.uTop.value.copy(cTopD);u.uHor.value.copy(cHorD);u.uCloud.value.copy(cCloudD);u.uSunDir.value.set(.3,.8,.4).normalize();u.uSunCol.value.copy(cWhite);u.uCover.value=.55;
  es.add(new THREE.Mesh(new THREE.SphereGeometry(300,32,16),em));
  const pm=new THREE.PMREMGenerator(sc.R);sc.envRT=pm.fromScene(es,0);scene.environment=sc.envRT.texture;pm.dispose();
 }catch(e){}
});

S.onFrame((G,t,dt,info)=>{
 const scene=sc.scene,sun=sc.sun,L=info.L,tod=info.tod,play=info.mode==='play';
 const ss=clamp(1-Math.abs(L-.5)*2,0,1),dusk=ss*.9;
 const day=smooth(.1,.9,L);
 const oc=sc.over||0,rn=sc.rain||0,fl=sc.flash||0;
 top.copy(cTopN).lerp(cTopD,day).lerp(cDuskTop,ss*.35);
 hor.copy(cHorN).lerp(cHorD,day).lerp(cDusk,dusk*.75);
 cloud.copy(cCloudN).lerp(cCloudD,day).lerp(cCloudDusk,dusk*.7);
 /* hava: kapalı/yağmurlu havada gökyüzü gri ve koyu olur */
 if(oc>.01){
  const gl=(hor.r+hor.g+hor.b)/3*.78;tmp.setRGB(gl,gl*1.02,gl*1.07);hor.lerp(tmp,oc*.7);
  const gt=(top.r+top.g+top.b)/3*.7;tmp.setRGB(gt,gt*1.02,gt*1.08);top.lerp(tmp,oc*.75);
  const gc=(cloud.r+cloud.g+cloud.b)/3*(.62-.2*rn);tmp.setRGB(gc,gc,gc*1.04);cloud.lerp(tmp,oc*.85);
 }
 /* Kan Ayı: gökyüzü kızıla döner */
 sc.bloodV=(sc.bloodV||0)+(((play&&G.blood)?1:0)-(sc.bloodV||0))*(1-Math.exp(-dt/2.5));
 const bl=sc.bloodV;
 if(bl>.01){const kb=bl*(1-day)*.92;top.lerp(cBT,kb);hor.lerp(cBH,kb);cloud.lerp(cBC,kb)}
 const a=(tod-.25)*Math.PI*2,px=play?G.px:W/2,pz=play?G.py:H/2,py=play?S.groundY(px,pz):0;
 const ox=Math.cos(a)*45,oy=Math.sin(a)*45+6,oz=22;
 sunDir.set(ox,oy-6,oz).normalize();moonDir.set(-ox,-(oy-6)+8,-oz).normalize();
 tmp.copy(cWarm).lerp(cWhite,smooth(.2,.9,L));
 skyU.uTop.value.copy(top);skyU.uHor.value.copy(hor);skyU.uCloud.value.copy(cloud);skyU.uSunDir.value.copy(sunDir);skyU.uSunCol.value.copy(tmp);skyU.uMoonDir.value.copy(moonDir);
 sc.sunDirV=sunDir;sc.moonDirV=moonDir;
 skyU.uNight.value=1-L;skyU.uDusk.value=dusk;skyU.uTime.value=t;skyU.uCover.value=.5-.34*oc;
 dome.position.copy(sc.cam.position);
 scene.background.copy(hor);
 const fog=scene.fog;fog.color.copy(hor);fog.density=(play?.0105:.0042)*(1+.9*oc+1.3*rn)*HG.cfg.fog/100;
 /* güneş: gölge dokusu kayması olmasın diye hedef doku ızgarasına oturtulur */
 const q=52/sun.shadow.mapSize.x,sx=Math.round(px/q)*q,sz=Math.round(pz/q)*q;
 sun.position.set(sx+ox,py+oy,sz+oz);sun.target.position.set(sx,py,sz);
 sun.intensity=Math.max(0,2.3*smooth(0,.5,L))*(Math.sin(a)>-.05?1:0)*(1-.62*oc);
 sun.color.copy(tmp);
 moon.position.set(px-ox*.6,py+30,pz-oz*.6);moon.target.position.set(px,py,pz);moon.intensity=.5*(1-L)*(1+bl*.6);moon.color.setHex(0x6f8cff).lerp(cBM,bl*.85);
 hemi.intensity=(.1+.28*L)*(1+.35*oc)+fl*1.4;hemi.color.copy(cHN).lerp(cHD,L);
 /* ortam ışığı gündüz güçlü, gece zayıf */
 const k=.07+.62*L;for(const m of sc.mats)m.envMapIntensity=k;
 stars.material.opacity=Math.pow(1-L,2);stars.position.copy(sc.cam.position);
 /* en yakın 3 ateş gerçek ışık verir */
 const sorted=sc.fires.map(f=>({f,d:(f.x-px)**2+(f.z-pz)**2})).sort((p,q2)=>p.d-q2.d);
 for(let i=0;i<fireLights.length;i++){
  const l=fireLights[i],s=sorted[i];
  if(s&&s.d<900){l.position.set(s.f.x,s.f.y+.9,s.f.z);l.intensity=(1.6+(1-L)*3.4)*(1+Math.sin(t*12+i)*.07+Math.sin(t*5.3)*.05)*(1-(sc.fear||0)*.6*(Math.sin(t*37+i*2)>.55?1:0));l.distance=14;l.decay=1.6}else l.intensity=0;
 }
 if(play){lantern.position.set(G.px,(G.pz!==undefined?G.pz:py)+2,G.py);lantern.intensity=.3*(1-L)}else lantern.intensity=0;
});
})();
