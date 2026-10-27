/* Hunger 3D - müzik yönetimi.
   Parçalar gün ve gece için ayrı listelerden seçilir, aynı parça arka arkaya çalmaz, aralarında uzun
   sessizlik bırakılır. Korku, düşük can ve şiddetli yağmurda müzik yumuşakça susar; durum geçtiğinde
   bir süre sonra yeniden başlar. Parça ses dosyası olarak akar (bellekte tutulmaz), böylece oyunun
   başlaması gecikmez. Dosya yoksa ortam katmanındaki akor yastığı devreye girer. */
(()=>{
'use strict';
const S=HG.Ses,{ui}=HG;
const R=S.R,tc=S.tc;
const BASE='ses/';
const LISTE={gun:['muzik-gun1.mp3','muzik-gun2.mp3','muzik-gun3.mp3'],gece:['muzik-gece1.mp3','muzik-gece2.mp3']};
const M={el:null,g:null,calar:false,calisti:false,bozuk:false,sonuk:false,bekle:3,son:''};

function kur(){
 if(M.el||M.bozuk)return;
 try{
  const ac=S.ac(),el=new Audio();
  el.preload='none';el.loop=false;el.crossOrigin='anonymous';
  el.addEventListener('ended',()=>{M.calar=false;M.bekle=R(55,150)});
  el.addEventListener('playing',()=>{M.calisti=true});
  el.addEventListener('error',()=>{
   if(M.calar||M.el){M.calar=false;M.bozuk=!M.calisti;M.bekle=R(60,120)}
  });
  const src=ac.createMediaElementSource(el);
  M.g=ac.createGain();M.g.gain.value=0;
  src.connect(M.g);M.g.connect(S.kanal('mus'));
  M.el=el;
  document.addEventListener('visibilitychange',()=>{
   if(!M.el||!M.calar)return;
   try{if(document.hidden)M.el.pause();else M.el.play()}catch(e){}
  });
 }catch(e){M.bozuk=true}
}
function durdur(){
 if(M.sonuk)return;
 M.sonuk=true;tc(M.g.gain,0,.9);
 setTimeout(()=>{
  if(!M.sonuk)return;
  try{M.el.pause()}catch(e){}
  M.calar=false;M.sonuk=false;M.bekle=R(45,100);
 },2800);
}
function basla(gece,menu){
 const liste=LISTE[gece?'gece':'gun'].filter(f=>f!==M.son);
 const f=menu?LISTE.gun[1]:liste[(Math.random()*liste.length)|0];
 M.son=f;
 try{
  M.el.src=BASE+f;M.el.currentTime=0;
  const p=M.el.play();
  if(p&&p.then)p.then(()=>{M.calar=true;M.sonuk=false;tc(M.g.gain,.9,.6)},()=>{M.bekle=18});
  else{M.calar=true;tc(M.g.gain,.9,.6)}
 }catch(e){M.bekle=22}
}
function kare(e){
 if(M.bozuk)return;
 const C=HG.cfg;
 const ister=C.mus>0&&!ui.mute&&C.master>0&&(e.mode==='menu'||e.mode==='play');
 if(!M.el){if(ister)kur();return}
 /* gerilim: korku, delilik veya düşük can varken müzik susar */
 const korku=HG.sc.fear||0,delilik=HG.sc.insane||0;
 const gergin=e.play&&(e.G.hp<32||korku>.28||delilik>.55);
 if(M.calar){
  const dur=!ister||gergin||(e.play&&(HG.sc.rain||0)>.85);
  if(dur)durdur();
  else if(M.sonuk){M.sonuk=false;tc(M.g.gain,.9,.9)}
  return;
 }
 M.bekle-=e.dt;
 if(M.bekle>0||!ister||gergin)return;
 const L=HG.daylight?HG.daylight():1;
 basla(L<.4&&e.mode==='play',e.mode==='menu');
}
S.kare(kare);
S.muzik={
 calisiyor:()=>M.calisti&&M.calar&&HG.cfg.mus>0,
 durum:()=>({ok:M.calisti,dead:M.bozuk,playing:M.calar,last:M.son})
};
})();
