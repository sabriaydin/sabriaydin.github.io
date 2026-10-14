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
 uWindV:{value:new THREE.Vector3(.8,.3,.4)}     /* x,y: yön, z: şiddet */
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
 const inject=sh=>{sh.uniforms.uHF=U.uHF;sh.uniforms.uFogT=U.uFogT};
 const base=function(sh){inject(sh)};
 Object.defineProperty(P,'onBeforeCompile',{configurable:true,get(){return this._obc||base},set(f){this._src=f?f.toString():'';this._obc=f?function(sh,r){f.call(this,sh,r);inject(sh)}:null}});
 P.customProgramCacheKey=function(){return this._src||''};
}

/* ---- her kare: zaman, rüzgâr ve sis ---- */
let gustT=6,gustE=0,wa=.6;
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
