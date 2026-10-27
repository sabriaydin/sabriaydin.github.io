/* Hunger 3D - üretilen ses kitaplığı.
   Buradaki sesler kayıt dosyası gerektirmez; tarayıcıda anında hesaplanır.
   İki işi vardır: kaydı olmayan sesleri (arayüz, korku, deniz canlıları, gök olayları) çalmak ve
   kayıt yüklenemediğinde yerine geçmek. Böylece oyun hiçbir koşulda sessiz kalmaz.
   Her ses, kendisine verilen hedef düğüme bağlanır; konumlandırma ve yankı motorun işidir. */
(()=>{
'use strict';
const S=HG.Ses,K=S.K;
const R=S.R,clamp=S.clamp;
const AC=()=>S.ac();

/* ---------------------------------------------------------- temel parçalar ---------------------------------------------------------- */
/* zarf: sesin yükselişi ve sönüşü */
function env(g,t,v,att,dec){
 g.gain.setValueAtTime(.0001,t);
 g.gain.linearRampToValueAtTime(Math.max(.0002,v),t+att);
 g.gain.exponentialRampToValueAtTime(.0001,t+att+dec);
}
/* süzgeçten geçmiş gürültü patlaması: darbe, hışırtı, su, nefes */
function N(dst,o){
 const ac=AC(),t=ac.currentTime+(o.t||0),att=o.att||.003,d=o.d||.1;
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
 s.buffer=S.gurultu(o.pink);
 f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.f||1000,t);
 if(o.f2)f.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+att+d);
 f.Q.value=o.q||.7;
 env(g,t,o.v||.3,att,d);
 s.connect(f);f.connect(g);g.connect(dst);
 s.start(t,Math.random()*1.4,att+d+.06);
 s.onended=()=>{try{s.disconnect();f.disconnect();g.disconnect()}catch(e){}};
}
/* osilatör notası: ıslık, uğultu, hayvan sesi, çan tonu */
function Tn(dst,o){
 const ac=AC(),t=ac.currentTime+(o.t||0),att=o.att||.004,d=o.d||.2;
 const os=ac.createOscillator(),g=ac.createGain();
 os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);
 if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+att+d);
 if(o.det)os.detune.value=o.det;
 if(o.vib){
  const lfo=ac.createOscillator(),lg=ac.createGain();
  lfo.frequency.value=o.vibf||6;lg.gain.value=o.vib;
  lfo.connect(lg);lg.connect(os.frequency);lfo.start(t);lfo.stop(t+att+d+.08);
  lfo.onended=()=>{try{lfo.disconnect();lg.disconnect()}catch(e){}};
 }
 env(g,t,o.v||.2,att,d);
 let n=os;
 if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=o.lq||.7;os.connect(f);n=f}
 n.connect(g);g.connect(dst);
 os.start(t);os.stop(t+att+d+.06);
 os.onended=()=>{try{os.disconnect();g.disconnect();if(n!==os)n.disconnect()}catch(e){}};
}
/* çınlama: metal ve camın kısmi tonları */
const M=(dst,o)=>{for(const [r,a,dc] of o.p)Tn(dst,{t:o.t,f:o.f*r,d:dc,v:o.v*a,att:.0015})};
S.N=N;S.Tn=Tn;S.M=M;S.env=env;

/* ---------------------------------------------------------- toplama ve aletler ---------------------------------------------------------- */
K.hit=d=>{const p=R(.88,1.14);Tn(d,{f:155*p,f2:62,d:.14,v:.55});N(d,{ft:'bandpass',f:900*p,q:1.3,d:.08,v:.5});N(d,{ft:'highpass',f:3200,d:.03,v:.22});N(d,{ft:'lowpass',f:380,d:.2,v:.45,t:.01})};
K.rock=d=>{const p=R(.9,1.12);N(d,{ft:'bandpass',f:2300*p,q:2,d:.07,v:.55});Tn(d,{f:340*p,f2:170,d:.08,type:'triangle',v:.22});N(d,{ft:'highpass',f:5200,d:.05,v:.2,t:.02});N(d,{ft:'lowpass',f:300,d:.14,v:.35})};
K.ore=d=>{const f=R(1500,2100);N(d,{ft:'bandpass',f:2600,q:2.5,d:.05,v:.4});M(d,{f,v:.2,p:[[1,1,.34],[2.76,.7,.2],[5.4,.4,.12],[8.93,.25,.08]]});Tn(d,{f:200,f2:90,d:.07,v:.2})};
K.pick=d=>{N(d,{ft:'bandpass',f:620,q:1,d:.1,v:.5});Tn(d,{f:160,f2:72,d:.11,v:.35,att:.002});N(d,{ft:'highpass',f:3200,d:.03,v:.18})};
/* ağaç devrilirken: gövdenin çatırtısı */
K.crack=d=>{N(d,{ft:'bandpass',f:2600,f2:300,q:.8,d:.32,v:.65});Tn(d,{f:85,f2:38,d:.3,type:'sawtooth',v:.18,lp:300});for(let i=0;i<5;i++)N(d,{ft:'highpass',f:R(3000,6000),d:.025,v:.28,t:R(.02,.28)})};
K.creak=d=>{const f=R(120,160);Tn(d,{f,f2:f*1.9,d:.9,type:'sawtooth',v:.12,lp:520,vib:6,vibf:19});Tn(d,{f:f*1.5,f2:f*.9,d:.8,type:'sawtooth',v:.08,lp:480,t:.1,vib:5,vibf:23});for(let i=0;i<6;i++)N(d,{ft:'bandpass',f:R(1200,2600),q:3,d:.018,v:R(.25,.5),t:R(.05,.9)})};
/* mağarada uzaktan gelen taş gıcırtısı (ağaç gıcırtısından ayrıdır) */
K.cave_creak=d=>{Tn(d,{f:62,f2:48,d:1.4,type:'sawtooth',v:.07,att:.2,lp:260});N(d,{ft:'lowpass',f:380,d:1.1,v:.2,att:.25,pink:true})};
K.leaves=d=>{N(d,{ft:'bandpass',f:4500,f2:2300,q:.7,d:.6,v:.28,att:.12,pink:true});N(d,{ft:'highpass',f:6000,d:.4,v:.1,att:.1,t:.05})};
K.thud=d=>{N(d,{ft:'lowpass',f:420,f2:120,d:.9,v:.9});Tn(d,{f:58,f2:28,d:.8,v:.65});N(d,{ft:'bandpass',f:1700,q:.6,d:.25,v:.4,t:.02});K.leaves(d)};
K.crumble=d=>{N(d,{ft:'lowpass',f:2200,f2:180,d:.95,v:.75});Tn(d,{f:62,f2:28,d:.7,v:.45});for(let i=0;i<9;i++)N(d,{ft:'bandpass',f:R(1500,5200),q:2,d:.04,v:R(.15,.35),t:R(.04,.7)})};
K.craftChime=d=>{M(d,{f:880,v:.12,t:.06,p:[[1,1,.5],[2.7,.5,.3],[5.2,.3,.18]]});Tn(d,{f:660,d:.12,type:'triangle',v:.1,t:.12})};
K.craft=d=>{K.hit(d);K.craftChime(d)};
K.shear=d=>{for(let i=0;i<3;i++){N(d,{ft:'bandpass',f:4600,q:3.5,d:.05,v:.3,t:i*.12});M(d,{f:3000+i*180,v:.05,t:i*.12,p:[[1,1,.08],[2.4,.5,.05]]})}};
K.milk=d=>{for(let i=0;i<4;i++){N(d,{ft:'bandpass',f:3200,q:2,d:.035,v:.14,t:i*.13});Tn(d,{f:700,f2:320,d:.06,v:.05,t:i*.13+.01})}};
K.chest=d=>{Tn(d,{f:150,f2:85,d:.55,type:'sawtooth',v:.1,lp:520,att:.05});N(d,{ft:'bandpass',f:900,f2:300,q:2,d:.45,v:.25,pink:true});N(d,{ft:'lowpass',f:200,d:.2,v:.45,t:.5});Tn(d,{f:1400,d:.15,v:.04,t:.55})};
/* ateş yakma: çakmaktaşı kıvılcımı ve alevin tutuşması */
K.ignite=d=>{for(let i=0;i<3;i++)N(d,{ft:'bandpass',f:R(3800,6200),q:4,d:.03,v:.3,t:i*.1});N(d,{ft:'lowpass',f:1800,f2:420,d:1.1,v:.5,att:.12,t:.3,pink:true});Tn(d,{f:70,f2:48,d:.8,v:.18,att:.2,t:.3})};

/* ---------------------------------------------------------- oyuncu ---------------------------------------------------------- */
K.step=d=>{const p=R(.85,1.2);N(d,{ft:'lowpass',f:620*p,d:.06,v:R(.16,.24)});N(d,{ft:'bandpass',f:2900*p,q:.9,d:.045,v:R(.07,.13),t:.012,pink:true})};
K.step_rock=d=>{const p=R(.9,1.2);N(d,{ft:'bandpass',f:1900*p,q:1.6,d:.05,v:R(.2,.3)});Tn(d,{f:210*p,f2:140,d:.04,type:'triangle',v:.1})};
K.step_sand=d=>{N(d,{ft:'lowpass',f:R(1000,1500),d:.11,v:R(.13,.19),att:.012,pink:true});N(d,{ft:'highpass',f:3800,d:.07,v:.07,t:.015})};
K.step_water=d=>{N(d,{ft:'bandpass',f:R(1200,1900),q:.8,d:.15,v:R(.2,.28),pink:true});Tn(d,{f:R(420,600),f2:240,d:.08,v:.06,t:.02})};
K.step_raft=d=>{const p=R(.85,1.15);N(d,{ft:'lowpass',f:520*p,d:.09,v:R(.2,.3)});Tn(d,{f:150*p,f2:95,d:.1,type:'triangle',v:.1});N(d,{ft:'bandpass',f:R(1000,1500),q:1.5,d:.05,v:.06,t:.02,pink:true})};
/* kar: yüksek frekanslı, kısa ve "gıcırtılı" basış */
K.step_snow=d=>{N(d,{ft:'bandpass',f:R(2600,3600),q:1.1,d:.08,v:R(.14,.2),att:.016,pink:true});N(d,{ft:'lowpass',f:520,d:.05,v:.12});Tn(d,{f:R(1500,2100),f2:R(900,1200),d:.05,v:.03,att:.01})};
K.jump=d=>{N(d,{ft:'highpass',f:700,d:.12,v:.13,att:.02,pink:true});Tn(d,{f:210,f2:340,d:.1,v:.04})};
K.land=d=>{N(d,{ft:'lowpass',f:520,d:.18,v:.4});Tn(d,{f:95,f2:45,d:.16,v:.28});N(d,{ft:'bandpass',f:1800,q:.7,d:.08,v:.12})};
K.splash=d=>{N(d,{ft:'bandpass',f:2100,f2:900,q:.7,d:.5,v:.45,pink:true});N(d,{ft:'highpass',f:6500,d:.25,v:.18});for(let i=0;i<4;i++)Tn(d,{f:R(500,900),f2:R(1000,1700),d:.07,v:.05,t:R(.05,.4)})};
K.get=d=>{Tn(d,{f:660,f2:1000,d:.1,v:.16});Tn(d,{f:1320,d:.18,v:.07,t:.05,att:.002});N(d,{ft:'highpass',f:5000,d:.04,v:.06})};
K.drink=d=>{for(let i=0;i<3;i++){Tn(d,{f:R(240,330),f2:R(120,170),d:.1,v:.14,t:i*.19});N(d,{ft:'bandpass',f:800,q:1,d:.1,v:.1,t:i*.19,pink:true})}};
K.eat=d=>{for(let i=0;i<4;i++){N(d,{ft:'bandpass',f:R(1700,2600),q:1.4,d:.05,v:R(.25,.4),t:i*R(.07,.11)});N(d,{ft:'lowpass',f:420,d:.07,v:.2,t:i*.09})}};
K.bandage=d=>{for(let i=0;i<2;i++)N(d,{ft:'highpass',f:2600,q:.8,d:.28,v:.22,att:.03,t:i*.3,pink:true});Tn(d,{f:200,f2:150,d:.08,v:.05,t:.6})};
K.hurt=d=>{Tn(d,{f:190,f2:75,d:.28,type:'sawtooth',v:.18,lp:700});N(d,{ft:'lowpass',f:700,d:.14,v:.45});N(d,{ft:'bandpass',f:1500,q:.8,d:.1,v:.2})};
K.breath=d=>{N(d,{ft:'bandpass',f:R(900,1300),q:.7,d:.28,v:.1,att:.12,pink:true})};
K.stomach=d=>{Tn(d,{f:92,f2:64,d:.9,v:.05,lp:170,att:.3});N(d,{ft:'lowpass',f:240,f2:130,d:1,v:.1,att:.3,pink:true})};
/* kalp atışı: şiddeti motor tarafından ayarlanır */
let kalp=1;
K.heart=d=>{const v=kalp;Tn(d,{f:78,f2:50,d:.12,v:.34*v,att:.012,lp:230});N(d,{ft:'lowpass',f:140,d:.06,v:.16*v,att:.008});Tn(d,{f:66,f2:44,d:.1,v:.24*v,att:.012,t:.27,lp:210})};
S.kalpSiddet=v=>{kalp=clamp(v,0,1)};

/* ---------------------------------------------------------- dövüş ---------------------------------------------------------- */
K.bowdraw=d=>{Tn(d,{f:85,f2:150,d:.7,type:'sawtooth',v:.06,att:.05,lp:420,vib:5,vibf:14});N(d,{ft:'bandpass',f:1700,f2:2600,q:2,d:.55,v:.08,att:.15,pink:true})};
K.bowfire=d=>{Tn(d,{f:240,f2:70,d:.14,v:.4,att:.002});N(d,{ft:'bandpass',f:2400,q:1.3,d:.09,v:.45});Tn(d,{f:110,f2:92,d:.35,type:'triangle',v:.14,att:.003});N(d,{ft:'highpass',f:4500,d:.12,v:.15,t:.03})};
K.arrowhit=d=>{Tn(d,{f:190,f2:90,d:.09,v:.45,att:.002});N(d,{ft:'lowpass',f:900,d:.07,v:.4});Tn(d,{f:420,f2:380,d:.5,type:'triangle',v:.05,att:.002,vib:30,vibf:40})};
K.arrowflesh=d=>{N(d,{ft:'bandpass',f:620,q:1,d:.12,v:.55});Tn(d,{f:150,f2:70,d:.12,v:.4,att:.002});N(d,{ft:'highpass',f:3500,d:.03,v:.2})};
K.hitmark=d=>{Tn(d,{f:1900,d:.03,v:.06,att:.001});Tn(d,{f:1250,d:.04,v:.05,att:.001,t:.04})};
K.clang=d=>{M(d,{f:1050,v:.2,p:[[1,1,.4],[2.76,.7,.28],[5.4,.4,.16]]});N(d,{ft:'bandpass',f:2400,q:2,d:.06,v:.35});Tn(d,{f:170,f2:80,d:.12,v:.3})};
K.scratch=d=>{for(let i=0;i<6;i++){N(d,{ft:'bandpass',f:R(2200,3400),q:4,d:.05,v:.3,t:i*.075});N(d,{ft:'lowpass',f:500,d:.06,v:.18,t:i*.075})}};
K.hiss=d=>{N(d,{ft:'bandpass',f:5200,f2:2800,q:1.2,d:.6,v:.4,pink:true,att:.04});N(d,{ft:'highpass',f:7000,d:.4,v:.15})};

/* ---------------------------------------------------------- arayüz ---------------------------------------------------------- */
K.ui=d=>{Tn(d,{f:1250,d:.035,v:.05,att:.002})};
K.ui_open=d=>{Tn(d,{f:520,f2:760,d:.12,v:.07,type:'triangle'});N(d,{ft:'bandpass',f:2400,q:1,d:.06,v:.05})};
K.ui_close=d=>{Tn(d,{f:700,f2:420,d:.1,v:.06,type:'triangle'})};
K.levelup=d=>{[523,659,784,1047].forEach((f,i)=>{Tn(d,{f,d:.28,v:.09,type:'triangle',t:i*.1});Tn(d,{f:f*2,d:.2,v:.03,t:i*.1})})};
K.quest=d=>{Tn(d,{f:660,d:.2,v:.1,type:'triangle'});Tn(d,{f:880,d:.4,v:.1,type:'triangle',t:.14});Tn(d,{f:1320,d:.4,v:.03,t:.14});N(d,{ft:'highpass',f:6000,d:.15,v:.04,t:.14})};
K.zoom=d=>{Tn(d,{f:940,f2:620,d:.07,type:'triangle',v:.06});N(d,{ft:'highpass',f:4200,d:.03,v:.05})};
K.shutter=d=>{N(d,{ft:'highpass',f:2600,d:.035,v:.32});N(d,{ft:'bandpass',f:1800,q:2,d:.05,v:.25,t:.07});Tn(d,{f:260,f2:180,d:.05,v:.1,t:.07})};
K.bell=d=>{M(d,{f:520,v:.12,p:[[1,1,1.8],[2.4,.55,1.2],[4.1,.3,.8],[6.3,.15,.5]]})};

/* ---------------------------------------------------------- doğa ve gök ---------------------------------------------------------- */
K.thunder=d=>{
 N(d,{ft:'lowpass',f:2600,f2:220,d:.3,v:.55});
 N(d,{ft:'lowpass',f:230,f2:70,d:3.6,v:1,att:.25,pink:true});Tn(d,{f:48,f2:30,d:3,v:.5,att:.3});
 for(let i=0;i<4;i++)N(d,{ft:'lowpass',f:R(120,320),d:R(.9,1.8),v:R(.45,.8),att:.1,t:R(.3,2.6),pink:true});
};
K.pop=d=>{N(d,{ft:'bandpass',f:R(1500,4000),q:2,d:.02,v:R(.2,.45)})};
K.drip=d=>{Tn(d,{f:1300,f2:620,d:.07,v:.07,att:.002});N(d,{ft:'bandpass',f:900,q:2,d:.05,v:.06,t:.01})};
K.bird=d=>{
 const k=Math.random(),b=R(2600,3900);
 if(k<.4){const n=(2+Math.random()*4)|0;for(let i=0;i<n;i++)Tn(d,{f:b*R(.95,1.1),f2:b*R(1.2,1.5),d:.07,v:.07,t:i*R(.09,.14),att:.006})}
 else if(k<.7){for(let i=0;i<9;i++)Tn(d,{f:b,f2:b*1.18,d:.03,v:.05,t:i*.045,att:.003})}
 else{Tn(d,{f:b*.55,f2:b*.45,d:.16,v:.08});Tn(d,{f:b*.42,f2:b*.34,d:.22,v:.08,t:.22})}
};
K.cricket=d=>{const f=R(4100,4600);for(let i=0;i<3;i++)Tn(d,{f,d:.025,v:.04,t:i*.055,att:.004})};
K.owl=d=>{Tn(d,{f:390,f2:340,d:.32,v:.12,att:.05,lp:900});Tn(d,{f:380,f2:290,d:.55,v:.12,att:.05,t:.45,lp:900,vib:8,vibf:9})};
K.gull=d=>{const f=R(1500,1900),n=2+((Math.random()*3)|0);for(let i=0;i<n;i++)Tn(d,{f:f*R(.95,1.08),f2:f*.7,d:.2,v:.06,att:.01,t:i*.26,type:'sawtooth',lp:3200,vib:30,vibf:40});N(d,{ft:'bandpass',f:2600,q:2,d:.1,v:.03,t:.02,pink:true})};
K.dolphin=d=>{for(let i=0;i<4;i++)Tn(d,{f:2400+i*160,f2:5200,d:.14,v:.05,t:i*.13,att:.004});Tn(d,{f:3000,f2:1800,d:.5,v:.04,t:.55,att:.02,vib:40,vibf:30});for(let i=0;i<7;i++)N(d,{ft:'bandpass',f:6200,q:5,d:.015,v:.1,t:.9+i*.045})};
K.whale=d=>{Tn(d,{f:78,f2:132,d:2.4,v:.2,att:.6,vib:3,vibf:.8,lp:420});Tn(d,{f:130,f2:70,d:2.6,v:.12,att:.5,t:1.1,vib:2,vibf:.6,lp:420});Tn(d,{f:240,f2:160,d:2,v:.03,t:.6,att:.5})};
K.buzz=d=>{Tn(d,{f:R(205,245),d:.8,type:'sawtooth',v:.05,lp:900,att:.12,vib:34,vibf:58});N(d,{ft:'bandpass',f:1500,q:3,d:.7,v:.05,att:.15,pink:true})};
K.shark_warn=d=>{Tn(d,{f:70,f2:48,d:1.4,type:'sawtooth',v:.12,att:.1,lp:240});Tn(d,{f:104,f2:60,d:1.2,type:'sawtooth',v:.06,att:.15,lp:260,t:.05});N(d,{ft:'lowpass',f:300,d:1.1,v:.22,att:.2,pink:true})};

/* ---------------------------------------------------------- korku ---------------------------------------------------------- */
K.whisper=d=>{const f=R(900,1500);N(d,{ft:'bandpass',f,f2:f*.7,q:8,d:1.5,v:.22,att:.5,pink:true});N(d,{ft:'bandpass',f:f*1.9,f2:f*1.3,q:9,d:1.2,v:.1,att:.45,t:.2,pink:true})};
K.stinger=d=>{Tn(d,{f:233,d:1.8,type:'sawtooth',v:.1,att:.04,lp:900});Tn(d,{f:246.9,d:1.8,type:'sawtooth',v:.09,att:.04,lp:900});Tn(d,{f:932,f2:880,d:1.2,type:'sine',v:.05,att:.03});N(d,{ft:'lowpass',f:300,d:1.4,v:.5,att:.02,pink:true});Tn(d,{f:48,d:1.6,v:.4,att:.02})};
K.bloodmoon=d=>{Tn(d,{f:62,f2:48,d:3.6,type:'sawtooth',v:.16,lp:260,att:.8});Tn(d,{f:93,f2:70,d:3.2,type:'sawtooth',v:.08,lp:300,att:1});N(d,{ft:'lowpass',f:180,d:3,v:.35,att:.8})};

/* ---------------------------------------------------------- hayvanlar ----------------------------------------------------------
   Her tür için dört durum: call (çağrı), cry (acı), die (ölüm), atk (saldırı). */
function ses(tur,durum){
 const die=durum==='die',call=durum==='call',v=call?.55:1,L=die?1.7:1;
 return d=>{
  if(tur==='sheep'){const f=R(380,460);Tn(d,{f,f2:f*.74,d:.42*L,type:'sawtooth',v:.13*v,lp:1900,lq:3,vib:22,vibf:26});N(d,{ft:'bandpass',f:1600,q:2,d:.35*L,v:.07*v,att:.04,pink:true});if(die)K.thud(d)}
  else if(tur==='cow'){const f=R(88,108);Tn(d,{f,f2:f*.78,d:.9*L,type:'sawtooth',v:.22*v,lp:760,lq:2,att:.1,vib:5,vibf:4});Tn(d,{f:f*2.02,f2:f*1.6,d:.8*L,type:'triangle',v:.09*v,att:.12})}
  else if(tur==='boar'){N(d,{ft:'bandpass',f:450,q:1.4,d:.3*L,v:.5*v,pink:true});Tn(d,{f:92,f2:58,d:.32*L,type:'sawtooth',v:.2*v,lp:420,vib:26,vibf:17});if(die||durum==='cry')Tn(d,{f:R(900,1200),f2:420,d:.35*L,type:'sawtooth',v:.07*v,lp:2300,vib:30,vibf:18})}
  else if(tur==='rabbit'){Tn(d,{f:R(1700,2000),f2:R(2500,3000),d:.1*L,v:.1*v,att:.01});if(die)Tn(d,{f:1500,f2:700,d:.25,v:.1,t:.1})}
  else if(tur==='wolf'){
   if(call){const f=R(300,360);Tn(d,{f,f2:f*1.7,d:1.3,v:.13,att:.5,vib:5,vibf:5.5,lp:2200});Tn(d,{f:f*1.7,f2:f*1.15,d:2.4,v:.13,att:.05,t:1.3,vib:8,vibf:6,lp:2200});Tn(d,{f:f*3.4,f2:f*2.3,d:2,v:.03,t:1.3,att:.1})}
   else{Tn(d,{f:290,f2:130,d:.35*L,type:'sawtooth',v:.16,lp:1400,vib:18,vibf:30});N(d,{ft:'bandpass',f:900,q:1.2,d:.3*L,v:.4,pink:true});if(die)Tn(d,{f:420,f2:100,d:.9,type:'sawtooth',v:.08,lp:1800,t:.1})}
  }
  else if(tur==='shade'){
   if(call)K.whisper(d);
   else{N(d,{ft:'bandpass',f:4200,f2:2500,q:1.5,d:.7*L,v:.35,pink:true});Tn(d,{f:die?1200:800,f2:die?180:300,d:.6*L,type:'sawtooth',v:.09,lp:2600,vib:45,vibf:30});if(die)Tn(d,{f:60,f2:35,d:1.2,v:.4})}
  }
  else if(tur==='chicken'){
   if(call){const n=2+((Math.random()*2)|0);for(let i=0;i<n;i++){const f=R(520,640);Tn(d,{f,f2:f*.8,d:.1,type:'triangle',v:.09*v,t:i*.17,lp:1700,att:.01});N(d,{ft:'bandpass',f:1500,q:2,d:.07,v:.05*v,t:i*.17,pink:true})}}
   else{const f=R(720,900);Tn(d,{f,f2:f*1.5,d:.3*L,type:'sawtooth',v:.1,lp:2500,vib:36,vibf:28});N(d,{ft:'bandpass',f:2100,q:1.5,d:.25*L,v:.1,pink:true});if(die)K.thud(d)}
  }
  else if(tur==='deer'){Tn(d,{f:R(520,640),f2:R(380,460),d:.3*L,type:'sawtooth',v:.1*v,lp:1500,vib:15,vibf:21});N(d,{ft:'bandpass',f:1100,q:1.5,d:.25*L,v:.12*v,pink:true})}
  else if(tur==='shark'){
   if(call)K.shark_warn(d);
   else{N(d,{ft:'bandpass',f:800,f2:420,q:1.1,d:.45*L,v:.45*v,pink:true});Tn(d,{f:130,f2:62,d:.5*L,type:'sawtooth',v:.15*v,lp:900});if(die){K.splash(d);Tn(d,{f:70,f2:32,d:1,v:.3})}}
  }
  else if(tur==='jelly'){Tn(d,{f:R(420,520),f2:R(160,220),d:.2*L,v:.12*v,att:.01});N(d,{ft:'lowpass',f:700,f2:260,d:.22*L,v:.25*v,pink:true});if(die)K.splash(d)}
  else if(tur==='crab'){const n=die?7:4;for(let i=0;i<n;i++)N(d,{ft:'bandpass',f:R(2800,3800),q:4,d:.02,v:.3*v,t:i*R(.045,.08)});if(die)Tn(d,{f:180,f2:90,d:.12,v:.15})}
  else if(tur==='bear'){
   const Lb=call?1.5:die?1.9:.85;
   Tn(d,{f:R(72,92),f2:50,d:.75*Lb,type:'sawtooth',v:.24*v,lp:560,lq:2,att:.1,vib:9,vibf:13});
   Tn(d,{f:R(140,170),f2:90,d:.5*Lb,type:'sawtooth',v:.1*v,lp:900,att:.08,vib:24,vibf:19});
   N(d,{ft:'bandpass',f:420,f2:230,q:1,d:.6*Lb,v:.32*v,att:.1,pink:true});
   if(die){K.thud(d);Tn(d,{f:60,f2:32,d:1.1,v:.25,t:.2})}
  }
  else if(tur==='dog'){
   if(die){Tn(d,{f:760,f2:300,d:.55,type:'triangle',v:.1,vib:14,vibf:9,lp:2200});N(d,{ft:'bandpass',f:1500,q:2,d:.3,v:.05,pink:true})}
   else{const n=call?1:2;for(let i=0;i<n;i++){const f=R(360,470);Tn(d,{f,f2:f*.58,d:.11,type:'sawtooth',v:.17*v,lp:1900,lq:2,t:i*.22,att:.006});N(d,{ft:'bandpass',f:1200,q:1.5,d:.09,v:.24*v,t:i*.22,pink:true});Tn(d,{f:f*2,f2:f*1.2,d:.07,v:.05*v,t:i*.22,att:.004})}}
  }
 };
}
for(const t of ['sheep','cow','boar','rabbit','deer','wolf','shade','shark','jelly','crab','chicken','bear','dog'])
 for(const k of ['cry','die','call','atk'])K[k+'_'+t]=ses(t,k);
K.bark=d=>ses('dog','cry')(d);
})();
