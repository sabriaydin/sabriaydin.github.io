/* Hunger 3D - sahne: atmosfer parçacıkları (geceleri ateş böcekleri, gündüz ışıkta uçuşan polen ve toz) */
(()=>{
'use strict';
const {smooth,T}=HG;
const S=HG.Scene,sc=HG.sc;
const VS=`
attribute vec4 aS;
uniform vec3 uCam;uniform float uTime,uScale,uSize,uGround,uMode,uBox;
varying float vA;
void main(){
 float b=uBox;
 float ph=aS.w*6.2831;
 float x=mod(aS.x*b+sin(uTime*.23+ph)*1.6+uTime*.12-uCam.x+b*.5,b)-b*.5;
 float z=mod(aS.z*b+cos(uTime*.19+ph*1.3)*1.6-uCam.z+b*.5,b)-b*.5;
 float y=uGround+(uMode<.5?.35+aS.y*3.4+sin(uTime*.7+ph*3.)*.35:.6+aS.y*7.5+sin(uTime*.5+ph*2.)*.5);
 vec3 p=vec3(uCam.x+x,y,uCam.z+z);
 vec4 mv=viewMatrix*vec4(p,1.);
 float blink=uMode<.5?pow(max(0.,sin(uTime*(1.1+aS.w*2.2)+aS.w*47.)),2.4):.45+.55*sin(uTime*.8+aS.w*31.);
 float dist=length(mv.xyz);
 vA=blink*(1.-smoothstep(b*.28,b*.5,dist));
 gl_PointSize=clamp(uSize*uScale/max(.5,-mv.z),1.,uMode<.5?26.:7.);
 gl_Position=projectionMatrix*mv;
}`;
const FS=`uniform float uAlpha,uBright;uniform vec3 uCol;varying float vA;
void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a*=a;gl_FragColor=vec4(uCol*uBright,a*vA*uAlpha);}`;
let fire,dust;
function make(n,mode,col,bright,size,box){
 const aS=new Float32Array(n*4),pos=new Float32Array(n*3);
 for(let i=0;i<n*4;i++)aS[i]=Math.random();
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(aS,4));
 const m=new THREE.ShaderMaterial({uniforms:{uCam:{value:new THREE.Vector3()},uTime:{value:0},uScale:{value:600},uSize:{value:size},uGround:{value:0},uMode:{value:mode},uBox:{value:box},uAlpha:{value:0},uBright:{value:bright},uCol:{value:new THREE.Color(col)}},
  vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
 const p=new THREE.Points(g,m);p.frustumCulled=false;p.renderOrder=15;p.visible=false;sc.scene.add(p);return p;
}
S.onInit(()=>{
 fire=make(110,0,0x8cff20,1.5,.1,44);
 dust=make(220,1,0xfff0d0,.9,.03,40);
});
S.onQuality(q=>{
 if(!fire)return;
 fire.geometry.setDrawRange(0,[0,50,80,110][q]);
 dust.geometry.setDrawRange(0,[0,0,110,220][q]);
});
let a1=0,a2=0;
S.onFrame((G,t,dt,info)=>{
 const play=info.mode==='play',L=info.L,rain=sc.rain||0;
 const cam=sc.cam,gy=play&&G.pz!==undefined?G.pz:0;
 const tile=play?G.tile[Math.floor(G.py)*HG.W+Math.floor(G.px)]:0;
 const grass=tile===T.GRASS?1:tile===T.SAND?.3:0;
 const tf=play?smooth(.45,.15,L)*(1-rain)*grass:0;
 const td=play?smooth(.35,.8,L)*(1-rain*.9):0;
 const k=1-Math.exp(-dt*1.5);a1+=(tf-a1)*k;a2+=(td-a2)*k;
 const scale=sc.R.domElement.height/(2*Math.tan(cam.fov*Math.PI/360));
 for(const [p,a] of [[fire,a1],[dust,a2]]){
  p.visible=a>.01&&p.geometry.drawRange.count>0;
  if(!p.visible)continue;
  const u=p.material.uniforms;u.uCam.value.copy(cam.position);u.uTime.value=t;u.uScale.value=scale;u.uGround.value=gy;u.uAlpha.value=a;
 }
});
})();
