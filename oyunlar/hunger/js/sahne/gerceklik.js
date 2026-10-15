/* Hunger 3D - sahne: gerçekçilik altyapısı
   • Tüm malzemelere ortak uniform'lar (zaman, yükseklik sisi, rüzgâr) eklenir.
   • Yükseklik sisi: vadilerde, şafakta, geceleri, yağmurda ve Kan Ayı'nda yere çöken hacimli sis.
   • Rüzgâr: yönü ve şiddeti zamanla değişen, ara sıra sert esen rüzgâr (ağaç, çim, yağmur, duman, yaprak kullanır). */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc,{clamp}=HG;
const U=sc.U={
 uHF:{value:new THREE.Vector4(.002,.42,0,0)},   /* x: sis yoğunluğu (1/m), y: yükseklikle sönüm, z: taban yüksekliği */
 uFogT:{value:0},
 uWindV:{value:new THREE.Vector3(.8,.3,.4)},    /* x,y: yön, z: şiddet */
 uPQ:{value:2}                                  /* yüzey ayrıntısı: 0 kapalı, 1 düz izdüşüm, 2 üç yönlü */
};
sc.wind={x:.8,z:.3,s:.4,gust:0};

/* ---- sis ve su parçaları: shader kalıpları ---- */
const SC=THREE.ShaderChunk;
SC.fog_pars_vertex='#ifdef USE_FOG\n varying float vFogDepth;\n varying vec3 vFogW;\n#endif';
SC.fog_vertex='#ifdef USE_FOG\n vFogDepth=-mvPosition.z;\n vFogW=cameraPosition+vec3(dot(viewMatrix[0].xyz,mvPosition.xyz),dot(viewMatrix[1].xyz,mvPosition.xyz),dot(viewMatrix[2].xyz,mvPosition.xyz));\n#endif';
SC.fog_pars_fragment=`#ifdef USE_FOG
 uniform vec3 fogColor;
 uniform vec4 uHF;
 uniform float uFogT;
 varying float vFogDepth;
 varying vec3 vFogW;
 #ifdef FOG_EXP2
  uniform float fogDensity;
 #else
  uniform float fogNear;
  uniform float fogFar;
 #endif
#endif`;
SC.fog_fragment=`#ifdef USE_FOG
 #ifdef FOG_EXP2
  float fogEx=fogDensity*fogDensity*vFogDepth*vFogDepth;
  float hm=.5*(vFogW.y+cameraPosition.y);
  float hn=.62+.38*sin(vFogW.x*.045+uFogT*.07)*cos(vFogW.z*.05-uFogT*.05);
  fogEx+=uHF.x*vFogDepth*exp(-max(hm-uHF.z,0.)*uHF.y)*hn;
  float fogFactor=1.-exp(-fogEx);
 #else
  float fogFactor=smoothstep(fogNear,fogFar,vFogDepth);
 #endif
 gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,fogFactor);
#endif`;

/* ---- her malzemeye ortak uniform'ları ekleyen kanca ---- */
{
 const P=THREE.Material.prototype;
/* ---- yüzey ayrıntısı: malzeme rengine göre çim / kabuk-toprak / kaya / kum dokusu, üç yönlü izdüşüm ve türevden çıkıntı haritası ---- */
 const PV_P='varying vec3 vPW;varying vec3 vPN;',
 PF_P=`uniform sampler2D tPG,tPD,tPR,tPS,tPL,tPT;uniform float uPQ;varying vec3 vPW;varying vec3 vPN;
 vec4 pTri(sampler2D t,vec3 p,vec3 n,float s){
  vec4 r=texture2D(t,p.xz*s);
  if(uPQ<1.5)return r;
  vec3 w=pow(abs(n),vec3(4.));w/=w.x+w.y+w.z+1e-4;
  return r*w.y+texture2D(t,p.zy*s)*w.x+texture2D(t,p.xy*s)*w.z;
 }`,
 PF_C=`
 float pbrH=.5,pbrAmp=0.,pbrFade=0.,pbrWet=0.,pbrOre=0.;
 if(uPQ>.5){
  vec3 pc=diffuseColor.rgb;
  float lum=dot(pc,vec3(.3,.59,.11));
  float ln=max(lum,.03);
  float cr=(pc.r-pc.b)/ln,cg=(pc.g-max(pc.r,pc.b))/ln;   /* parlaklıktan bağımsız renk eğilimi */
  float gr=smoothstep(.06,.24,cg);
  float sd=smoothstep(.4,.7,lum)*smoothstep(.08,.24,cr)*(1.-gr);
  float br=smoothstep(.1,.4,cr)*(1.-gr)*(1.-sd);
  #ifdef PBR_LEAF
  if(gr>.5){                                   /* yeşil yüzeyler: yaprak şekilleri, boşluklar */
   float dpl=-(viewMatrix*vec4(vPW,1.)).z,lf=1.-smoothstep(24.,58.,dpl);
   vec4 l1=texture2D(tPL,vec2(vPW.x+vPW.y*.7,vPW.z+vPW.y*.5)*1.6),l2=texture2D(tPL,vec2(vPW.z-vPW.y*.6,vPW.x*.8+vPW.y)*2.9+.37);
   float mk=1.-(1.-l1.a)*(1.-l2.a);
   if(mk<.48*lf)discard;
   diffuseColor.rgb*=mix(vec3(1.),(l1.rgb*l1.a+l2.rgb*(1.-l1.a)*l2.a)/max(mk,.02)*2.,lf);
  }
  #endif
  vec3 pn=normalize(vPN);
  float up=smoothstep(.5,.85,pn.y);
  float rk=clamp(1.-gr-sd-br,0.,1.);
  float gu=gr*up;rk+=gr-gu;gr=gu;               /* dik yamaçtaki çimen kayaya dönüşür */
  float ws=gr+br+sd+rk+1e-4;gr/=ws;br/=ws;sd/=ws;rk/=ws;
  /* büyük ölçekli değişim: tekrarı kırar, çıplak toprak yamaları ve kum dalgacıkları oluşturur */
  float mac=texture2D(tPR,vPW.xz*.011).a,mac2=texture2D(tPS,vPW.xz*.037+.31).a;
  #ifdef PBR_ORE
  rk=1.;gr=0.;br=0.;sd=0.;
  #endif
  float dp=smoothstep(.66,.82,mac2*.5+mac*.5)*gr*.8;              /* çimenin seyrek olduğu çıplak toprak yamaları */
  br+=dp;gr-=dp;
  vec4 tg=texture2D(tPG,vPW.xz*.42);tg=mix(tg,texture2D(tPG,vPW.xz*.093+.27),.45);
  vec4 tb=mix(pTri(tPD,vPW,pn,.85),pTri(tPT,vPW,pn,.5),clamp(dp*1.4+.35*br,0.,1.));
  vec4 tr=pTri(tPR,vPW,pn,.26);tr=mix(tr,pTri(tPR,vPW+7.3,pn,.071),.4);
  vec4 ts=texture2D(tPS,vPW.xz*.33);
  vec4 dt=tg*gr+tb*br+ts*sd+tr*rk;
  float dep=-(viewMatrix*vec4(vPW,1.)).z;
  pbrFade=1.-smoothstep(28.,85.,dep);
  vec3 mv=vec3(.92+.2*mac,.92+.2*mac,.92+.16*mac);
  diffuseColor.rgb*=mix(vec3(1.),dt.rgb*2.*mix(vec3(1.),mv,gr+sd+rk*.5),pbrFade);
  pbrWet=sd*(1.-smoothstep(-.16,.22,vPW.y));                   /* su kenarında ıslak kum: koyu ve parlak */
  diffuseColor.rgb*=1.-.38*pbrWet;
  #ifdef PBR_ORE
  pbrOre=clamp(smoothstep(.1,.32,cr)+(1.-smoothstep(.02,.09,lum))*.8,0.,1.);
  #endif
  float rip=sin(dot(vPW.xz,vec2(.8,.6))*5.2+mac*7.)*.5+.5;
  dt.a=mix(dt.a,dt.a*.6+rip*.4,sd);
  pbrH=dt.a;pbrAmp=gr*.035+br*.05+sd*.012+rk*.09;
 }`,
 PF_N=`
 if(uPQ>.5){
  vec2 dh=vec2(dFdx(pbrH),dFdy(pbrH))*pbrAmp*pbrFade;
  vec3 sX=dFdx(-vViewPosition),sY=dFdy(-vViewPosition),R1=cross(sY,normal),R2=cross(normal,sX);
  float fDet=dot(sX,R1);
  normal=normalize(abs(fDet)*normal-sign(fDet)*(dh.x*R1+dh.y*R2));
  roughnessFactor=clamp(roughnessFactor*(.82+.36*pbrH)*(1.-.55*pbrWet)*(1.-.5*pbrOre),.12,1.);
 }`;
 const inject=function(sh){
  sh.uniforms.uHF=U.uHF;sh.uniforms.uFogT=U.uFogT;
  if(!(this&&this.userData&&this.userData.pbr))return;
  sh.uniforms.uPQ=U.uPQ;sh.uniforms.tPG={value:sc.tex.pGrass};sh.uniforms.tPD={value:sc.tex.pBark};sh.uniforms.tPR={value:sc.tex.pRock};sh.uniforms.tPS={value:sc.tex.pSand};sh.uniforms.tPL={value:sc.tex.pLeaf};sh.uniforms.tPT={value:sc.tex.pDirt};
  if(this.userData.leaf)sh.fragmentShader='#define PBR_LEAF\n'+sh.fragmentShader;
  if(this.userData.ore)sh.fragmentShader='#define PBR_ORE\n'+sh.fragmentShader;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+PV_P).replace('#include <project_vertex>',`#include <project_vertex>
   {vec4 pw4=vec4(transformed,1.);vec3 pn3=objectNormal;
    #ifdef USE_INSTANCING
     pw4=instanceMatrix*pw4;pn3=mat3(instanceMatrix)*pn3;
    #endif
    vPW=(modelMatrix*pw4).xyz;vPN=normalize(mat3(modelMatrix)*pn3);}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+PF_P).replace('#include <color_fragment>','#include <color_fragment>'+PF_C).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>'+PF_N);
 };
 const base=function(sh){inject.call(this,sh)};
 Object.defineProperty(P,'onBeforeCompile',{configurable:true,get(){return this._obc||base},set(f){this._src=f?f.toString():'';this._obc=f?function(sh,r){f.call(this,sh,r);inject.call(this,sh)}:null}});
 P.customProgramCacheKey=function(){return (this._src||'')+(this.userData&&this.userData.pbr?'#pbr':'')+(this.userData&&this.userData.leaf?'L':'')+(this.userData&&this.userData.ore?'O':'')};
}

/* ---- her kare: zaman, rüzgâr ve sis ---- */
let gustT=6,gustE=0,wa=.6;
/* kalite: 3-2 üç yönlü, 1 düz izdüşüm, 0 kapalı */
S.onQuality(q=>{U.uPQ.value=q>=2?2:q===1?1:0});
S.onFrame((G,t,dt,info)=>{
 const L=info.L,tod=info.tod,rain=sc.rain||0,over=sc.over||0,cf=HG.cfg||{};
 U.uFogT.value=t;
 /* rüzgâr */
 wa=.6+Math.sin(t*.013)*.55+Math.sin(t*.041+1.3)*.28;
 gustT-=dt;if(gustT<=0){gustT=5+Math.random()*16;gustE=1}
 gustE=Math.max(0,gustE-dt*.35);
 const gust=Math.sin(Math.PI*Math.min(1,gustE*1.0))*gustE;       /* hızlı yükselir, yavaş söner */
 const s=clamp(.26+.2*Math.sin(t*.05)+.12*Math.sin(t*.17+2)+rain*.4+over*.15+gust*.75,.05,1.5);
 const w=sc.wind;w.x=Math.cos(wa);w.z=Math.sin(wa);w.s+=(s-w.s)*(1-Math.exp(-dt*1.6));w.gust=gust;
 U.uWindV.value.set(w.x,w.z,w.s);
 /* yükseklik sisi: şafakta yoğun, yağmurda ve geceleri hafif, Kan Ayı'nda kırmızımsı kalın */
 const dawn=Math.exp(-Math.pow((tod-.285)/.06,2)),dusk=Math.exp(-Math.pow((tod-.74)/.05,2))*.35;
 const k=(cf.mist===undefined?100:cf.mist)/100,bl=sc.bloodV||0;
 const dens=(.0013+.0095*dawn+.003*dusk+.0016*(1-L)+.0032*rain+.0035*over+.0055*bl)*k;
 U.uHF.value.set(dens,.4-.1*dawn,0,0);
});
})();
