/* Hunger 3D - ses motoru (WebAudio): uzamsal (3B) ses, yankı, katmanlı ortam sesleri, hava, hayvanlar, adımlar, müzik.
   Tüm sesler programla üretilir; dış ses dosyası kullanılmaz.
   Dış API: HG.snd(ad, {x,z,y}?), HG.initAudio(), HG.audioFrame(G,dt,mode) */
(()=>{
'use strict';
const {G,T,O,W,H,ui,look}=HG;
const sc=HG.sc;
let AC=null,master,comp,sfx,amb,ambLP,mus,sendS,sendM,verb,white,pink;
let lx=0,lz=0;
const R=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/* ---------- altyapı ---------- */
function mkNoise(sec,isPink){
 const n=(AC.sampleRate*sec)|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){
  const a=b.getChannelData(c);let b0=0,b1=0,b2=0;
  for(let i=0;i<n;i++){
   const w=Math.random()*2-1;
   if(isPink){b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;a[i]=(b0+b1+b2+w*.1848)*.2}else a[i]=w;
  }
 }
 return b;
}
function mkIR(sec,dec){
 const n=(AC.sampleRate*sec)|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){
  const a=b.getChannelData(c);let lp=0;
  for(let i=0;i<n;i++){
   const x=(Math.random()*2-1)*Math.pow(1-i/n,dec);
   lp+=(x-lp)*(.75-.62*i/n);a[i]=lp*1.6;
  }
 }
 return b;
}
function setPos(p,x,y,z){
 if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z}else p.setPosition(x,y,z);
}
function initAudio(){
 if(!AC){
  try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  try{
   comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=18;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.22;
   master=AC.createGain();master.gain.value=.0001;
   comp.connect(master);master.connect(AC.destination);
   sfx=AC.createGain();sfx.gain.value=1;sfx.connect(comp);
   ambLP=AC.createBiquadFilter();ambLP.type='lowpass';ambLP.frequency.value=22000;ambLP.connect(comp);
   amb=AC.createGain();amb.gain.value=1;amb.connect(ambLP);
   mus=AC.createGain();mus.gain.value=1;mus.connect(comp);
   verb=AC.createConvolver();verb.buffer=mkIR(2.6,2.3);
   const vo=AC.createGain();vo.gain.value=1;verb.connect(vo);vo.connect(comp);
   sendS=AC.createGain();sendS.gain.value=.12;sfx.connect(sendS);sendS.connect(verb);
   sendM=AC.createGain();sendM.gain.value=.5;mus.connect(sendM);sendM.connect(verb);
   white=mkNoise(2,false);pink=mkNoise(6,true);
   buildAmbience();
  }catch(e){console.warn('ses kurulamadı',e)}
 }
 if(AC&&AC.state==='suspended'&&!document.hidden)AC.resume();
}
/* Sekme arka plana geçince ses bağlamı durdurulur (pil ve işlemci tasarrufu), dönünce sürdürülür */
document.addEventListener('visibilitychange',()=>{
 if(!AC)return;
 try{if(document.hidden){if(AC.state==='running')AC.suspend()}else if(AC.state==='suspended')AC.resume()}catch(e){}
});

/* ---------- ses üreteç parçaları ---------- */
function env(g,t,v,att,dec){
 g.gain.setValueAtTime(.0001,t);
 g.gain.linearRampToValueAtTime(Math.max(.0002,v),t+att);
 g.gain.exponentialRampToValueAtTime(.0001,t+att+dec);
}
/* süzgeçli gürültü patlaması */
function N(dst,o){
 const t=AC.currentTime+(o.t||0),att=o.att||.003,d=o.d||.1;
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
 s.buffer=o.pink?pink:white;
 f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.f||1000,t);
 if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+att+d);
 f.Q.value=o.q||.7;
 env(g,t,o.v||.3,att,d);
 s.connect(f);f.connect(g);g.connect(dst);
 s.start(t,Math.random()*1.4,att+d+.06);
}
/* osilatör notası */
function Tn(dst,o){
 const t=AC.currentTime+(o.t||0),att=o.att||.004,d=o.d||.2;
 const os=AC.createOscillator(),g=AC.createGain();
 os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);
 if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+att+d);
 if(o.det)os.detune.value=o.det;
 if(o.vib){
  const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=o.vibf||6;lg.gain.value=o.vib;
  lfo.connect(lg);lg.connect(os.frequency);lfo.start(t);lfo.stop(t+att+d+.08);
 }
 env(g,t,o.v||.2,att,d);
 let n=os;
 if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=o.lq||.7;os.connect(f);n=f}
 n.connect(g);g.connect(dst);
 os.start(t);os.stop(t+att+d+.06);
}
/* çınlama: metalik / camsı kısmi tonlar */
function M(dst,o){for(const [r,a,dc] of o.p)Tn(dst,{t:o.t,f:o.f*r,d:dc,v:o.v*a,att:.0015})}

/* ---------- ses tablosu ---------- */
const K={};
K.hit=d=>{const p=R(.88,1.14);Tn(d,{f:155*p,f2:62,d:.14,v:.55});N(d,{ft:'bandpass',f:900*p,q:1.3,d:.08,v:.5});N(d,{ft:'highpass',f:3200,d:.03,v:.22});N(d,{ft:'lowpass',f:380,d:.2,v:.45,t:.01})};
K.rock=d=>{const p=R(.9,1.12);N(d,{ft:'bandpass',f:2300*p,q:2,d:.07,v:.55});Tn(d,{f:340*p,f2:170,d:.08,type:'triangle',v:.22});N(d,{ft:'highpass',f:5200,d:.05,v:.2,t:.02});N(d,{ft:'lowpass',f:300,d:.14,v:.35})};
K.ore=d=>{const f=R(1500,2100);N(d,{ft:'bandpass',f:2600,q:2.5,d:.05,v:.4});M(d,{f,v:.2,p:[[1,1,.34],[2.76,.7,.2],[5.4,.4,.12],[8.93,.25,.08]]});Tn(d,{f:200,f2:90,d:.07,v:.2})};
K.crack=d=>{N(d,{ft:'bandpass',f:2600,f2:300,q:.8,d:.32,v:.65});Tn(d,{f:85,f2:38,d:.3,type:'sawtooth',v:.18,lp:300});for(let i=0;i<5;i++)N(d,{ft:'highpass',f:R(3000,6000),d:.025,v:.28,t:R(.02,.28)})};
K.crumble=d=>{N(d,{ft:'lowpass',f:2200,f2:180,d:.95,v:.75});Tn(d,{f:62,f2:28,d:.7,v:.45});for(let i=0;i<9;i++)N(d,{ft:'bandpass',f:R(1500,5200),q:2,d:.04,v:R(.15,.35),t:R(.04,.7)})};
K.creak=d=>{const f=R(120,160);Tn(d,{f,f2:f*1.9,d:.9,type:'sawtooth',v:.12,lp:520,vib:6,vibf:19});Tn(d,{f:f*1.5,f2:f*.9,d:.8,type:'sawtooth',v:.08,lp:480,t:.1,vib:5,vibf:23});for(let i=0;i<6;i++)N(d,{ft:'bandpass',f:R(1200,2600),q:3,d:.018,v:R(.25,.5),t:R(.05,.9)})};
K.leaves=d=>{N(d,{ft:'bandpass',f:4500,f2:2300,q:.7,d:.6,v:.28,att:.12,pink:true});N(d,{ft:'highpass',f:6000,d:.4,v:.1,att:.1,t:.05})};
K.thud=d=>{N(d,{ft:'lowpass',f:420,f2:120,d:.9,v:.9});Tn(d,{f:58,f2:28,d:.8,v:.65});N(d,{ft:'bandpass',f:1700,q:.6,d:.25,v:.4,t:.02});K.leaves(d)};
K.step=d=>{const p=R(.85,1.2);N(d,{ft:'lowpass',f:620*p,d:.06,v:R(.16,.24)});N(d,{ft:'bandpass',f:2900*p,q:.9,d:.045,v:R(.07,.13),t:.012,pink:true})};
K.step_rock=d=>{const p=R(.9,1.2);N(d,{ft:'bandpass',f:1900*p,q:1.6,d:.05,v:R(.2,.3)});Tn(d,{f:210*p,f2:140,d:.04,type:'triangle',v:.1})};
K.step_sand=d=>{N(d,{ft:'lowpass',f:R(1000,1500),d:.11,v:R(.13,.19),att:.012,pink:true});N(d,{ft:'highpass',f:3800,d:.07,v:.07,t:.015})};
K.step_water=d=>{N(d,{ft:'bandpass',f:R(1200,1900),q:.8,d:.15,v:R(.2,.28),pink:true});Tn(d,{f:R(420,600),f2:240,d:.08,v:.06,t:.02})};
K.jump=d=>{N(d,{ft:'highpass',f:700,d:.12,v:.13,att:.02,pink:true});Tn(d,{f:210,f2:340,d:.1,v:.04})};
K.land=d=>{N(d,{ft:'lowpass',f:520,d:.18,v:.4});Tn(d,{f:95,f2:45,d:.16,v:.28});N(d,{ft:'bandpass',f:1800,q:.7,d:.08,v:.12})};
K.splash=d=>{N(d,{ft:'bandpass',f:2100,f2:900,q:.7,d:.5,v:.45,pink:true});N(d,{ft:'highpass',f:6500,d:.25,v:.18});for(let i=0;i<4;i++)Tn(d,{f:R(500,900),f2:R(1000,1700),d:.07,v:.05,t:R(.05,.4)})};
K.shear=d=>{for(let i=0;i<3;i++){N(d,{ft:'bandpass',f:4600,q:3.5,d:.05,v:.3,t:i*.12});M(d,{f:3000+i*180,v:.05,t:i*.12,p:[[1,1,.08],[2.4,.5,.05]]})}};
K.milk=d=>{for(let i=0;i<4;i++){N(d,{ft:'bandpass',f:3200,q:2,d:.035,v:.14,t:i*.13});Tn(d,{f:700,f2:320,d:.06,v:.05,t:i*.13+.01})}};
K.get=d=>{Tn(d,{f:660,f2:1000,d:.1,v:.16});Tn(d,{f:1320,d:.18,v:.07,t:.05,att:.002});N(d,{ft:'highpass',f:5000,d:.04,v:.06})};
K.drink=d=>{for(let i=0;i<3;i++){Tn(d,{f:R(240,330),f2:R(120,170),d:.1,v:.14,t:i*.19});N(d,{ft:'bandpass',f:800,q:1,d:.1,v:.1,t:i*.19,pink:true})}};
K.eat=d=>{for(let i=0;i<4;i++){N(d,{ft:'bandpass',f:R(1700,2600),q:1.4,d:.05,v:R(.25,.4),t:i*R(.07,.11)});N(d,{ft:'lowpass',f:420,d:.07,v:.2,t:i*.09})}};
K.craft=d=>{K.hit(d);M(d,{f:880,v:.12,t:.06,p:[[1,1,.5],[2.7,.5,.3],[5.2,.3,.18]]});Tn(d,{f:660,d:.12,type:'triangle',v:.1,t:.12})};
K.hurt=d=>{Tn(d,{f:190,f2:75,d:.28,type:'sawtooth',v:.18,lp:700});N(d,{ft:'lowpass',f:700,d:.14,v:.45});N(d,{ft:'bandpass',f:1500,q:.8,d:.1,v:.2})};
K.ui=d=>{Tn(d,{f:1250,d:.035,v:.05,att:.002})};
K.ui_open=d=>{Tn(d,{f:520,f2:760,d:.12,v:.07,type:'triangle'});N(d,{ft:'bandpass',f:2400,q:1,d:.06,v:.05})};
K.ui_close=d=>{Tn(d,{f:700,f2:420,d:.1,v:.06,type:'triangle'})};
K.levelup=d=>{[523,659,784,1047].forEach((f,i)=>{Tn(d,{f,d:.28,v:.09,type:'triangle',t:i*.1});Tn(d,{f:f*2,d:.2,v:.03,t:i*.1})})};
K.quest=d=>{Tn(d,{f:660,d:.2,v:.1,type:'triangle'});Tn(d,{f:880,d:.4,v:.1,type:'triangle',t:.14});Tn(d,{f:1320,d:.4,v:.03,t:.14});N(d,{ft:'highpass',f:6000,d:.15,v:.04,t:.14})};
K.chest=d=>{Tn(d,{f:150,f2:85,d:.55,type:'sawtooth',v:.1,lp:520,att:.05});N(d,{ft:'bandpass',f:900,f2:300,q:2,d:.45,v:.25,pink:true});N(d,{ft:'lowpass',f:200,d:.2,v:.45,t:.5});Tn(d,{f:1400,d:.15,v:.04,t:.55})};
K.bloodmoon=d=>{Tn(d,{f:62,f2:48,d:3.6,type:'sawtooth',v:.16,lp:260,att:.8});Tn(d,{f:93,f2:70,d:3.2,type:'sawtooth',v:.08,lp:300,att:1.0});N(d,{ft:'lowpass',f:180,d:3,v:.35,att:.8})};
K.pick=d=>K.rock(d);
K.thunder=d=>{
 N(d,{ft:'lowpass',f:2600,f2:220,d:.3,v:.55});
 N(d,{ft:'lowpass',f:230,f2:70,d:3.6,v:1,att:.25,pink:true});Tn(d,{f:48,f2:30,d:3,v:.5,att:.3});
 for(let i=0;i<4;i++)N(d,{ft:'lowpass',f:R(120,320),d:R(.9,1.8),v:R(.45,.8),att:.1,t:R(.3,2.6),pink:true});
};
K.bird=d=>{
 const k=Math.random(),b=R(2600,3900);
 if(k<.4){const n=(2+Math.random()*4)|0;for(let i=0;i<n;i++)Tn(d,{f:b*R(.95,1.1),f2:b*R(1.2,1.5),d:.07,v:.07,t:i*R(.09,.14),att:.006})}
 else if(k<.7){for(let i=0;i<9;i++)Tn(d,{f:b,f2:b*1.18,d:.03,v:.05,t:i*.045,att:.003})}
 else{Tn(d,{f:b*.55,f2:b*.45,d:.16,v:.08});Tn(d,{f:b*.42,f2:b*.34,d:.22,v:.08,t:.22})}
};
K.cricket=d=>{const f=R(4100,4600);for(let i=0;i<3;i++)Tn(d,{f,d:.025,v:.04,t:i*.055,att:.004})};
K.owl=d=>{Tn(d,{f:390,f2:340,d:.32,v:.12,att:.05,lp:900});Tn(d,{f:380,f2:290,d:.55,v:.12,att:.05,t:.45,lp:900,vib:8,vibf:9})};
K.pop=d=>{N(d,{ft:'bandpass',f:R(1500,4000),q:2,d:.02,v:R(.2,.45)})};
K.heart=d=>{Tn(d,{f:62,f2:42,d:.13,v:.55,lp:160});Tn(d,{f:56,f2:38,d:.12,v:.4,t:.19,lp:150})};
K.stomach=d=>{Tn(d,{f:105,f2:70,d:1.1,type:'sawtooth',v:.1,lp:210,lq:2,vib:25,vibf:11,att:.2});N(d,{ft:'lowpass',f:260,d:.9,v:.2,att:.2,pink:true})};
K.breath=d=>{N(d,{ft:'bandpass',f:R(900,1300),q:.7,d:.28,v:.1,att:.12,pink:true})};
/* korku ve silah sesleri */
K.hiss=d=>{N(d,{ft:'bandpass',f:5200,f2:2800,q:1.2,d:.6,v:.4,pink:true,att:.04});N(d,{ft:'highpass',f:7000,d:.4,v:.15})};
K.scratch=d=>{for(let i=0;i<6;i++){N(d,{ft:'bandpass',f:R(2200,3400),q:4,d:.05,v:.3,t:i*.075});N(d,{ft:'lowpass',f:500,d:.06,v:.18,t:i*.075})}};
K.whisper=d=>{const f=R(900,1500);N(d,{ft:'bandpass',f,f2:f*.7,q:8,d:1.5,v:.22,att:.5,pink:true});N(d,{ft:'bandpass',f:f*1.9,f2:f*1.3,q:9,d:1.2,v:.1,att:.45,t:.2,pink:true})};
K.creak=d=>{Tn(d,{f:62,f2:48,d:1.4,type:'sawtooth',v:.07,att:.2,lp:260});N(d,{ft:'lowpass',f:380,d:1.1,v:.2,att:.25,pink:true})};
K.stinger=d=>{Tn(d,{f:233,d:1.8,type:'sawtooth',v:.1,att:.04,lp:900});Tn(d,{f:246.9,d:1.8,type:'sawtooth',v:.09,att:.04,lp:900});Tn(d,{f:932,f2:880,d:1.2,type:'sine',v:.05,att:.03});N(d,{ft:'lowpass',f:300,d:1.4,v:.5,att:.02,pink:true});Tn(d,{f:48,d:1.6,v:.4,att:.02})};
K.drip=d=>{Tn(d,{f:1300,f2:620,d:.07,v:.07,att:.002});N(d,{ft:'bandpass',f:900,q:2,d:.05,v:.06,t:.01})};
K.bowdraw=d=>{Tn(d,{f:85,f2:150,d:.7,type:'sawtooth',v:.06,att:.05,lp:420,vib:5,vibf:14});N(d,{ft:'bandpass',f:1700,f2:2600,q:2,d:.55,v:.08,att:.15,pink:true})};
K.bowfire=d=>{Tn(d,{f:240,f2:70,d:.14,v:.4,att:.002});N(d,{ft:'bandpass',f:2400,q:1.3,d:.09,v:.45});Tn(d,{f:110,f2:92,d:.35,type:'triangle',v:.14,att:.003});N(d,{ft:'highpass',f:4500,d:.12,v:.15,t:.03})};
K.arrowhit=d=>{Tn(d,{f:190,f2:90,d:.09,v:.45,att:.002});N(d,{ft:'lowpass',f:900,d:.07,v:.4});Tn(d,{f:420,f2:380,d:.5,type:'triangle',v:.05,att:.002,vib:30,vibf:40})};
K.arrowflesh=d=>{N(d,{ft:'bandpass',f:620,q:1,d:.12,v:.55});Tn(d,{f:150,f2:70,d:.12,v:.4,att:.002});N(d,{ft:'highpass',f:3500,d:.03,v:.2})};
K.hitmark=d=>{Tn(d,{f:1900,d:.03,v:.06,att:.001});Tn(d,{f:1250,d:.04,v:.05,att:.001,t:.04})};
K.bandage=d=>{for(let i=0;i<2;i++)N(d,{ft:'highpass',f:2600,q:.8,d:.28,v:.22,att:.03,t:i*.3,pink:true});Tn(d,{f:200,f2:150,d:.08,v:.05,t:.6})};
/* hayvan sesleri */
function animalVoice(type,kind){
 const die=kind==='die',call=kind==='call',v=call?.55:1,L=die?1.7:1;
 return d=>{
  if(type==='sheep'){const f=R(380,460);Tn(d,{f,f2:f*.74,d:.42*L,type:'sawtooth',v:.13*v,lp:1900,lq:3,vib:22,vibf:26});N(d,{ft:'bandpass',f:1600,q:2,d:.35*L,v:.07*v,att:.04,pink:true});if(die)K.thud(d)}
  else if(type==='cow'){const f=R(88,108);Tn(d,{f,f2:f*.78,d:.9*L,type:'sawtooth',v:.22*v,lp:760,lq:2,att:.1,vib:5,vibf:4});Tn(d,{f:f*2.02,f2:f*1.6,d:.8*L,type:'triangle',v:.09*v,att:.12})}
  else if(type==='boar'){N(d,{ft:'bandpass',f:450,q:1.4,d:.3*L,v:.5*v,pink:true});Tn(d,{f:92,f2:58,d:.32*L,type:'sawtooth',v:.2*v,lp:420,vib:26,vibf:17});if(die||kind==='cry'){Tn(d,{f:R(900,1200),f2:420,d:.35*L,type:'sawtooth',v:.07*v,lp:2300,vib:30,vibf:18})}}
  else if(type==='rabbit'){Tn(d,{f:R(1700,2000),f2:R(2500,3000),d:.1*L,v:.1*v,att:.01});if(die)Tn(d,{f:1500,f2:700,d:.25,v:.1,t:.1})}
  else if(type==='wolf'){
   if(call){const f=R(300,360);Tn(d,{f,f2:f*1.7,d:1.3,v:.13,att:.5,vib:5,vibf:5.5,lp:2200});Tn(d,{f:f*1.7,f2:f*1.15,d:2.4,v:.13,att:.05,t:1.3,vib:8,vibf:6,lp:2200});Tn(d,{f:f*3.4,f2:f*2.3,d:2,v:.03,t:1.3,att:.1})}
   else{Tn(d,{f:290,f2:130,d:.35*L,type:'sawtooth',v:.16,lp:1400,vib:18,vibf:30});N(d,{ft:'bandpass',f:900,q:1.2,d:.3*L,v:.4,pink:true});if(die)Tn(d,{f:420,f2:100,d:.9,type:'sawtooth',v:.08,lp:1800,t:.1})}
  }
  else if(type==='shade'){
   if(call)K.whisper(d);
   else{N(d,{ft:'bandpass',f:4200,f2:2500,q:1.5,d:.7*L,v:.35,pink:true});Tn(d,{f:die?1200:800,f2:die?180:300,d:.6*L,type:'sawtooth',v:.09,lp:2600,vib:45,vibf:30});if(die)Tn(d,{f:60,f2:35,d:1.2,v:.4})}
  }
  else if(type==='chicken'){
   if(call){const n=2+((Math.random()*2)|0);for(let i=0;i<n;i++){const f=R(520,640);Tn(d,{f,f2:f*.8,d:.1,type:'triangle',v:.09*v,t:i*.17,lp:1700,att:.01});N(d,{ft:'bandpass',f:1500,q:2,d:.07,v:.05*v,t:i*.17,pink:true})}}
   else{const f=R(720,900);Tn(d,{f,f2:f*1.5,d:.3*L,type:'sawtooth',v:.1,lp:2500,vib:36,vibf:28});N(d,{ft:'bandpass',f:2100,q:1.5,d:.25*L,v:.1,pink:true});if(die)K.thud(d)}
  }
  else if(type==='deer'){Tn(d,{f:R(520,640),f2:R(380,460),d:.3*L,type:'sawtooth',v:.1*v,lp:1500,vib:15,vibf:21});N(d,{ft:'bandpass',f:1100,q:1.5,d:.25*L,v:.12*v,pink:true})}
  else if(type==='shark'){
   if(call)K.shark_warn(d);
   else{N(d,{ft:'bandpass',f:800,f2:420,q:1.1,d:.45*L,v:.45*v,pink:true});Tn(d,{f:130,f2:62,d:.5*L,type:'sawtooth',v:.15*v,lp:900});if(die){K.splash(d);Tn(d,{f:70,f2:32,d:1,v:.3})}}
  }
  else if(type==='jelly'){Tn(d,{f:R(420,520),f2:R(160,220),d:.2*L,v:.12*v,att:.01});N(d,{ft:'lowpass',f:700,f2:260,d:.22*L,v:.25*v,pink:true});if(die)K.splash(d)}
  else if(type==='crab'){const n=die?7:4;for(let i=0;i<n;i++)N(d,{ft:'bandpass',f:R(2800,3800),q:4,d:.02,v:.3*v,t:i*R(.045,.08)});if(die)Tn(d,{f:180,f2:90,d:.12,v:.15})}
  else if(type==='bear'){
   const Lb=call?1.5:die?1.9:.85;
   Tn(d,{f:R(72,92),f2:50,d:.75*Lb,type:'sawtooth',v:.24*v,lp:560,lq:2,att:.1,vib:9,vibf:13});
   Tn(d,{f:R(140,170),f2:90,d:.5*Lb,type:'sawtooth',v:.1*v,lp:900,att:.08,vib:24,vibf:19});
   N(d,{ft:'bandpass',f:420,f2:230,q:1,d:.6*Lb,v:.32*v,att:.1,pink:true});
   if(die){K.thud(d);Tn(d,{f:60,f2:32,d:1.1,v:.25,t:.2})}
  }
  else if(type==='dog'){
   if(die){Tn(d,{f:760,f2:300,d:.55,type:'triangle',v:.1,vib:14,vibf:9,lp:2200});N(d,{ft:'bandpass',f:1500,q:2,d:.3,v:.05,pink:true})}
   else{const n=call?1:2;for(let i=0;i<n;i++){const f=R(360,470);Tn(d,{f,f2:f*.58,d:.11,type:'sawtooth',v:.17*v,lp:1900,lq:2,t:i*.22,att:.006});N(d,{ft:'bandpass',f:1200,q:1.5,d:.09,v:.24*v,t:i*.22,pink:true});Tn(d,{f:f*2,f2:f*1.2,d:.07,v:.05*v,t:i*.22,att:.004})}}
  }
 };
}
K.step_raft=d=>{const p=R(.85,1.15);N(d,{ft:'lowpass',f:520*p,d:.09,v:R(.2,.3)});Tn(d,{f:150*p,f2:95,d:.1,type:'triangle',v:.1});N(d,{ft:'bandpass',f:R(1000,1500),q:1.5,d:.05,v:.06,t:.02,pink:true})};
K.shark_warn=d=>{Tn(d,{f:70,f2:48,d:1.4,type:'sawtooth',v:.12,att:.1,lp:240});Tn(d,{f:104,f2:60,d:1.2,type:'sawtooth',v:.06,att:.15,lp:260,t:.05});N(d,{ft:'lowpass',f:300,d:1.1,v:.22,att:.2,pink:true})};
K.gull=d=>{const f=R(1500,1900),n=2+((Math.random()*3)|0);for(let i=0;i<n;i++)Tn(d,{f:f*R(.95,1.08),f2:f*.7,d:.2,v:.06,att:.01,t:i*.26,type:'sawtooth',lp:3200,vib:30,vibf:40});N(d,{ft:'bandpass',f:2600,q:2,d:.1,v:.03,t:.02,pink:true})};
K.dolphin=d=>{for(let i=0;i<4;i++)Tn(d,{f:2400+i*160,f2:5200,d:.14,v:.05,t:i*.13,att:.004});Tn(d,{f:3000,f2:1800,d:.5,v:.04,t:.55,att:.02,vib:40,vibf:30});for(let i=0;i<7;i++)N(d,{ft:'bandpass',f:6200,q:5,d:.015,v:.1,t:.9+i*.045})};
K.whale=d=>{Tn(d,{f:78,f2:132,d:2.4,v:.2,att:.6,vib:3,vibf:.8,lp:420});Tn(d,{f:130,f2:70,d:2.6,v:.12,att:.5,t:1.1,vib:2,vibf:.6,lp:420});Tn(d,{f:240,f2:160,d:2,v:.03,t:.6,att:.5})};
K.bell=d=>{M(d,{f:520,v:.12,p:[[1,1,1.8],[2.4,.55,1.2],[4.1,.3,.8],[6.3,.15,.5]]})};
for(const ty of ['sheep','cow','boar','rabbit','deer','wolf','shade','shark','jelly','crab','chicken','bear','dog'])for(const kd of ['cry','die','call'])K[kd+'_'+ty]=animalVoice(ty,kd);
K.bark=d=>animalVoice('dog','cry')(d);
K.clang=d=>{M(d,{f:1050,v:.2,p:[[1,1,.4],[2.76,.7,.28],[5.4,.4,.16]]});N(d,{ft:'bandpass',f:2400,q:2,d:.06,v:.35});Tn(d,{f:170,f2:80,d:.12,v:.3})};
K.buzz=d=>{Tn(d,{f:R(205,245),d:.8,type:'sawtooth',v:.05,lp:900,att:.12,vib:34,vibf:58});N(d,{ft:'bandpass',f:1500,q:3,d:.7,v:.05,att:.15,pink:true})};
K.zoom=d=>{Tn(d,{f:940,f2:620,d:.07,type:'triangle',v:.06});N(d,{ft:'highpass',f:4200,d:.03,v:.05})};
K.shutter=d=>{N(d,{ft:'highpass',f:2600,d:.035,v:.32});N(d,{ft:'bandpass',f:1800,q:2,d:.05,v:.25,t:.07});Tn(d,{f:260,f2:180,d:.05,v:.1,t:.07})};

/* ---------- konumlu çıkış ---------- */
function route(pos){
 if(!pos||!AC.createPanner)return sfx;
 const p=AC.createPanner();
 p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=2.5;p.rolloffFactor=1.25;p.maxDistance=140;
 setPos(p,pos.x,pos.y!==undefined?pos.y:1.1,pos.z);
 const lp=AC.createBiquadFilter();lp.type='lowpass';
 const dd=Math.hypot(pos.x-lx,pos.z-lz);lp.frequency.value=Math.max(1100,18000/(1+dd*.13));
 p.connect(lp);lp.connect(sfx);return p;
}
const last={};
const LIMIT={step:.18,step_rock:.18,step_sand:.18,step_water:.18,ui:.04,cricket:.05};
function snd(k,pos){
 if(!AC||ui.mute||AC.state!=='running')return;
 const fn=K[k];if(!fn)return;
 const now=performance.now()/1000,lim=LIMIT[k]||0;
 if(lim&&last[k]&&now-last[k]<lim)return;
 last[k]=now;
 try{fn(route(pos))}catch(e){if(HG.audioDebug)console.error('ses',k,e.message)}
}

/* ---------- sürekli ortam sesleri ---------- */
const bed={};
function loopSrc(buf){const s=AC.createBufferSource();s.buffer=buf;s.loop=true;s.start(0,Math.random()*(buf.duration-.5));return s}
function mkBed(name,buf,filters){
 const s=loopSrc(buf),g=AC.createGain();g.gain.value=0;
 let n=s;const fs=[];
 for(const [type,f,q] of filters){const b=AC.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q||.7;n.connect(b);n=b;fs.push(b)}
 n.connect(g);g.connect(amb);bed[name]={g,f:fs};
}
let fireV=null,pad=null;
function buildAmbience(){
 mkBed('wind',pink,[['bandpass',380,.5]]);
 mkBed('sea',pink,[['lowpass',700,.6]]);
 mkBed('foam',white,[['highpass',2600,.5],['lowpass',7500,.5]]);
 mkBed('leaf',pink,[['bandpass',3600,.45]]);
 mkBed('rain',white,[['highpass',1100,.5],['lowpass',9500,.5]]);
 mkBed('drum',pink,[['lowpass',480,.6]]);
 mkBed('whisper',pink,[['bandpass',1100,9],['bandpass',2300,7]]);
 /* gerilim: alçak, vuran iki ton */
 {const dg=AC.createGain();dg.gain.value=0;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;lp.connect(dg);dg.connect(amb);for(const [f,ty] of [[48,'sine'],[49.1,'sine']]){const o=AC.createOscillator();o.type=ty;o.frequency.value=f;const g=AC.createGain();g.gain.value=.5;o.connect(g);g.connect(lp);o.start()}bed.drone={g:dg}}
 /* ateş: konumlu */
 const pn=AC.createPanner();pn.panningModel='HRTF';pn.distanceModel='inverse';pn.refDistance=2;pn.rolloffFactor=1.5;pn.maxDistance=60;setPos(pn,0,1,0);pn.connect(sfx);
 const mk=(buf,filters)=>{const s=loopSrc(buf),g=AC.createGain();g.gain.value=0;let n=s;for(const [t,f,q] of filters){const b=AC.createBiquadFilter();b.type=t;b.frequency.value=f;b.Q.value=q||.7;n.connect(b);n=b}n.connect(g);g.connect(pn);return g};
 fireV={pn,crackle:mk(white,[['highpass',2400,.6],['lowpass',8000,.5]]),roar:mk(pink,[['lowpass',260,.7]])};
 /* müzik: yavaş akorlar */
 const pg=AC.createGain();pg.gain.value=0;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;lp.Q.value=.4;lp.connect(pg);pg.connect(mus);
 const voices=[];
 for(let i=0;i<4;i++)for(const dt of [-7,7]){const o=AC.createOscillator();o.type=i%2?'triangle':'sine';o.frequency.value=110;o.detune.value=dt;const g=AC.createGain();g.gain.value=.25;o.connect(g);g.connect(lp);o.start();voices.push({o,i})}
 pad={g:pg,lp,voices,ci:0,t:6,bell:10};
}
const PROG_DAY=[0,5,7,2],PROG_NIGHT=[0,3,8,5];
const CH_DAY=[0,7,12,16],CH_NIGHT=[0,7,12,15];
const PENTA=[0,2,4,7,9];
const hz=st=>110*Math.pow(2,st/12);

let scanT=0,forest=0,sea=0,altitude=0;
function scan(){
 const px=Math.floor(G.px),py=Math.floor(G.py);
 let trees=0;
 for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++){
  const x=px+dx,y=py+dy;if(x<0||y<0||x>=W||y>=H)continue;
  const o=G.obj[y*W+x];if(o===O.TREE||o===O.BUSH||o===O.PALM)trees++;
 }
 forest=clamp(trees/38,0,1);
 let wd=40;
 for(let a=0;a<16;a++){
  const ca=Math.cos(a*.3927),sa=Math.sin(a*.3927);
  for(let r=2;r<=34;r+=2){
   const x=Math.floor(G.px+ca*r),y=Math.floor(G.py+sa*r);
   if(x<0||y<0||x>=W||y>=H){wd=Math.min(wd,r);break}
   if(G.tile[y*W+x]<=T.SHAL){wd=Math.min(wd,r);break}
  }
 }
 sea=Math.pow(clamp(1-wd/36,0,1),1.2);
}
const tc=(p,v,tau)=>p.setTargetAtTime(v,AC.currentTime,tau||.7);
let nextBird=4,nextCricket=2,nextOwl=30,nextDrip=3,nextCreak=20,beatT=0,stomachT=20,breathT=0,popT=0;

function audioFrame(G,dt,mode){
 if(!AC||!bed.wind||AC.state!=='running')return;
 const play=mode==='play',t=performance.now()*.001;
 const L=HG.daylight?HG.daylight():1,rain=sc.rain||0,over=sc.over||0,sh=play&&G.sheltered?1:0;
 /* dinleyici */
 const li=AC.listener;
 lx=G.px;lz=G.py;
 const ly=play&&G.pz!==undefined?G.pz+1.65:2,yaw=look.yaw,fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 if(li.positionX){li.positionX.value=lx;li.positionY.value=ly;li.positionZ.value=lz;li.forwardX.value=fx;li.forwardY.value=0;li.forwardZ.value=fz;li.upX.value=0;li.upY.value=1;li.upZ.value=0}
 else{li.setPosition(lx,ly,lz);li.setOrientation(fx,0,fz,0,1,0)}
 /* ana ses */
 const C=HG.cfg;
 tc(master.gain,ui.mute?.0001:(ui.state==='pause'?.35:1)*C.master/100*(C.master>0?1:0)+.0001,.15);
 tc(sfx.gain,C.sfx/100,.1);tc(amb.gain,C.amb/100,.1);tc(mus.gain,C.mus/100,.1);
 /* çevre taraması */
 scanT-=dt;if(scanT<=0){scanT=.45;scan()}
 altitude=play&&G.pz!==undefined?G.pz:0;
 const gust=.5+.5*Math.sin(t*.31)*Math.sin(t*.173+1.1);
 const wind=clamp(.2+.4*gust+.28*over+.4*rain+clamp(altitude/14,0,.35),0,1);
 const open=1-forest*.5;
 tc(bed.wind.g.gain,.07*wind*open*(sh?.45:1)+.012,.5);
 tc(bed.wind.f[0].frequency,260+520*wind+140*gust,.4);
 /* deniz: dalga salınımı */
 const swell=.55+.45*Math.sin(t*.42)*Math.sin(t*.13+.6);
 tc(bed.sea.g.gain,.2*sea*swell,.5);tc(bed.sea.f[0].frequency,420+520*swell,.5);
 tc(bed.foam.g.gain,.05*sea*Math.max(0,swell-.35)*1.6,.4);
 /* orman hışırtısı */
 tc(bed.leaf.g.gain,.05*forest*(.4+wind)*(sh?.5:1),.6);
 /* yağmur */
 const rv=rain*(play?1:.6);
 tc(bed.rain.g.gain,.17*rv*(sh?.55:1),.8);tc(bed.rain.f[0].frequency,sh?2400:1100,.5);
 tc(bed.drum.g.gain,.17*rv*(sh?1.4:.4),.8);
 /* korku katmanları: gerilim drone'u ve fısıltılar */
 const fear=sc.fear||0,ins=sc.insane||0;
 const tens=HG.cfg.tens/100;
 tc(bed.drone.g.gain,.12*tens*Math.max(fear-.15,0,ins*.5-.1),1.2);
 tc(bed.whisper.g.gain,.07*tens*ins*(.4+.6*Math.abs(Math.sin(t*1.9))),.3);
 tc(bed.whisper.f[0].frequency,700+800*Math.abs(Math.sin(t*.63)),.2);tc(bed.whisper.f[1].frequency,1700+900*Math.abs(Math.sin(t*.41+1)),.2);
 /* barınakta ortam seslerini kıs, yankıyı artır */
 tc(ambLP.frequency,sh?3200:22000,.5);
 tc(sendS.gain,G.cave?.5:sh?.34:.1+.08*forest+.05*rain,.6);
 /* ateş */
 let best=null,bd=1e9;
 for(const f of sc.fires||[]){const d=(f.x-G.px)**2+(f.z-G.py)**2;if(d<bd){bd=d;best=f}}
 const fd=Math.sqrt(bd);
 if(best&&fd<26){
  setPos(fireV.pn,best.x,(best.y||0)+.6,best.z);
  popT-=dt;
  const fl=.35+.65*Math.pow(Math.random(),2.5);
  tc(fireV.crackle.gain,.16*fl,.05);tc(fireV.roar.gain,.34*(.8+.2*Math.sin(t*3.1)),.3);
  if(popT<=0){popT=R(.12,.7);if(!ui.mute)try{K.pop(fireV.pn)}catch(e){}}
 }else{tc(fireV.crackle.gain,0,.3);tc(fireV.roar.gain,0,.3)}
 /* zamanlayıcılı tek seferlik sesler */
 const gz=play&&G.pz!==undefined?G.pz:0;
 const spatial=(r0,r1,y0,y1)=>{const a=Math.random()*Math.PI*2,r=R(r0,r1);return{x:G.px+Math.cos(a)*r,z:G.py+Math.sin(a)*r,y:gz+R(y0,y1)}};
 const quiet=sh?.45:1;
 nextBird-=dt;
 if(nextBird<=0){
  nextBird=R(3.5,11)/(.35+forest*1.2);
  if(L>.5&&rain<.25&&!ui.mute&&!sh&&fear<.3)try{K.bird(route(spatial(7,30,3,9)))}catch(e){}
 }
 nextCricket-=dt;
 if(nextCricket<=0){
  nextCricket=R(.25,.9);
  if(L<.3&&!G.cave&&rain<.2&&sea<.7&&!ui.mute&&Math.random()<quiet*clamp(1-fear*2,0,1))try{K.cricket(route(spatial(4,18,0,.4)))}catch(e){}
 }
 nextOwl-=dt;
 if(nextOwl<=0){
  nextOwl=R(28,70);
  if(L<.2&&rain<.4&&forest>.15&&!ui.mute)try{K.owl(route(spatial(14,38,4,9)))}catch(e){}
 }
 /* mağara: damlayan su ve uzaktan taş gıcırtısı */
 if(play&&G.cave){
  nextDrip-=dt;if(nextDrip<=0){nextDrip=R(1.6,6);if(!ui.mute)try{K.drip(route(spatial(3,20,0,1)))}catch(e){}}
  nextCreak-=dt;if(nextCreak<=0){nextCreak=R(18,45);if(!ui.mute)try{K.creak(route(spatial(10,30,0,3)))}catch(e){}}
 }
 /* oyuncu durumu: kalp atışı, mide, nefes */
 if(play){
  if((G.hp<32&&G.hp>0)||fear>.35||ins>.6){const lo=G.hp<32?(32-G.hp)*2.4:0;beatT-=dt;if(beatT<=0){beatT=60/(62+lo+fear*55);snd('heart')}}
  stomachT-=dt;if(stomachT<=0){stomachT=R(24,46);if(G.hun<14)snd('stomach')}
  if(G.sprint&&G.moving){breathT-=dt;if(breathT<=0){breathT=.62;snd('breath')}}else breathT=0;
 }
 /* müzik */
 if(pad){
  const night=L<.35,low=play&&G.hp<32;
  tc(pad.g.gain,(low||HG.cfg.mus<=0?0:.02)*(1-.45*rain)*(sh?.8:1)*(mode==='menu'?1.35:1)*(ui.mute?0:1),2.5);
  pad.t-=dt;
  if(pad.t<=0){
   pad.t=R(13,19);pad.ci=(pad.ci+1)%4;
   const root=(night?PROG_NIGHT:PROG_DAY)[pad.ci],ch=night?CH_NIGHT:CH_DAY;
   for(const v of pad.voices){const st=root+ch[v.i]-(v.i===0?12:0);tc(v.o.frequency,hz(st+12),2.8)}
   tc(pad.lp.frequency,night?750:1250,2);
  }
  pad.bell-=dt;
  if(pad.bell<=0){
   pad.bell=R(8,21);
   if(L>.3&&rain<.5&&!ui.mute&&!low)try{
    const root=PROG_DAY[pad.ci],n=hz(root+PENTA[(Math.random()*5)|0]+24+(Math.random()<.4?12:0));
    Tn(mus,{f:n,d:3.2,v:.05,att:.01,type:'sine'});Tn(mus,{f:n*2.005,d:1.6,v:.012,att:.01});
   }catch(e){}
  }
 }
}

HG.audioState=()=>AC?AC.state:'yok';HG.snd=snd;HG.initAudio=initAudio;HG.audioFrame=audioFrame;
})();
