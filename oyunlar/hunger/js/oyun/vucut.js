/* Hunger 3D - beden durumu: dayanıklılık, akıl sağlığı, kanama, meşale yakıtı, hasar geri bildirimi, bandaj */
(()=>{
'use strict';
const {G,ui,look,clamp,daylight,take,count,flag,held}=HG;
const sc=HG.sc,$=HG.$;
const body={flash:0,dirA:0,dirT:0,hit:0,hitKill:false,dripT:0,msgT:0};
sc.shake=0;sc.fear=0;sc.insane=0;
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d};

/* Işık düzeyi (0-1): kamp ateşi ve elde yanan meşale. Yaratıklar ve kurtlar bu değere göre kaçar. */
function lightLevel(x,z,noTorch){
 let m=0;
 if(G.torchLit&&!noTorch){const d=Math.hypot(x-G.px,z-G.py);m=Math.max(m,clamp(1-d/8.5,0,1))}
 for(const f of sc.fires||[]){const d=Math.hypot(x-f.x,z-f.z);if(d<10)m=Math.max(m,clamp(1-d/10,0,1))}
 for(const l of sc.lamps||[]){const d=Math.hypot(x-l.x,z-l.z);if(d<9)m=Math.max(m,clamp(1-d/9,0,1)*.9)}
 return m;
}
/* Merkezi hasar: sağlık, kamera sarsıntısı, kırmızı çerçeve, yön göstergesi, kanama, akıl kaybı */
function hurt(dmg,cause,src,bleedP){
 G.hp-=dmg;G.cause=cause||G.cause;
 sc.shake=Math.min(1.3,sc.shake+.3+dmg*.03);
 body.flash=Math.min(1,.5+dmg*.035);
 if(src){body.dirA=angDiff(look.yaw+Math.PI,Math.atan2(src.x-G.px,src.z-G.py));body.dirT=1.3}
 HG.snd('hurt');
 G.san=clamp(G.san-dmg*.4,0,100);
 if(bleedP&&Math.random()<bleedP&&!(G.bleed>0)){G.bleed=75;HG.toast('Kanıyorsun! Bandaj ile yarayı sar.')}
}
function addSan(v){if(v<0)v*=1-.15*HG.perk('mind');G.san=clamp(G.san+v,0,100)}
function hitMarker(kill,zone){body.hit=1;body.hitKill=!!kill;HG.snd('hitmark')}
function swing(){
 const ok=G.stam>=5;G.stam=Math.max(0,G.stam-5);
 if(G.stam<=0)G.tired=true;
 return ok?1:.45;
}
function useStam(v){G.stam=Math.max(0,G.stam-v);if(G.stam<=0)G.tired=true}
function useMedical(){
 if(!count('bandage'))return;
 take('bandage',1);G.bleed=0;G.hp=clamp(G.hp+14+5*HG.perk('medic'),0,100);G.san=clamp(G.san+3,0,100);
 HG.snd('bandage');HG.toast('Yara sarıldı.');flag('healed');HG.ui.dirty=true;
}

function updateBody(dt){
 const L=daylight(),play=ui.state==='play';
 /* meşale: elde ve yakıt varsa yanar */
 const h=held();
 G.torchLit=!!(h&&h.it.tool==='torch'&&G.torchFuel>0&&!G.head);          /* meşale su altında yanmaz */
 if(G.torchLit){
  const wet=(sc.rain||0)>.5&&!G.sheltered?1.8:1;
  G.torchFuel-=dt*wet;
  if(G.torchFuel<=0){
   take('torch',1);G.torchFuel=360;ui.dirty=true;
   HG.toast(count('torch')?'Meşale söndü, yenisi yakıldı.':'Meşale tükendi.');
  }
 }
 /* dayanıklılık */
 const run=G.sprint&&G.moving;
 if(run)G.stam-=18*dt;
 else G.stam+=(G.moving?9:17)*dt*(G.hun>20&&G.thr>20?1:.5)*(1+.15*HG.perk('agile'));
 G.stam=clamp(G.stam,0,100);
 if(G.stam<=0)G.tired=true;
 else if(G.tired&&G.stam>28)G.tired=false;
 /* kanama */
 if(G.bleed>0){
  G.bleed-=dt;G.hp-=.75*dt;if(G.hp<=0)G.cause='Kan kaybından öldün.';
  body.dripT-=dt;if(body.dripT<=0){body.dripT=1.6+Math.random();HG.snd('drip')}
  if(G.bleed<=0)HG.toast('Kanama kendiliğinden durdu.');
 }
 /* akıl sağlığı */
 let d=0;
 const ll=lightLevel(G.px,G.py),dark=Math.max(1-L,(sc.over||0)*.3);
 const safe=G.sheltered||ll>.2;
 if(!safe)d-=.17*dark*dark*2;
 let seen=0;
 for(const a of G.animals||[]){
  const def=HG.ANIMAL[a.t];
  if(!def.foe||a.dying)continue;
  const dd=Math.hypot(a.x-G.px,a.z-G.py);
  if(dd<30&&a.seen)seen=Math.max(seen,(1-dd/30)*(a.fake?.45:1));
 }
 d-=1.5*seen;
 if(G.hun<12||G.thr<12)d-=.08;
 if(L>.55&&!seen)d+=.5;
 if(safe&&!seen)d+=.9;
 if(!play)d=0;
 if(d<0)d*=1-.15*HG.perk('mind');
 G.san=clamp(G.san+d*dt,0,100);
 if(G.san<=0&&play){G.hp-=.4*dt;G.cause='Aklını yitirdin ve karanlığa karıştın.'}
 sc.insane+=(clamp((55-G.san)/55,0,1)-sc.insane)*(1-Math.exp(-dt*1.2));
 if(G.san<30&&play&&Math.random()<dt*.05)sc.shake=Math.max(sc.shake,.25);
}

/* ---- HUD ---- */
let lastT=performance.now();
const cache={};
function bar(id,v){const k=Math.round(v);if(cache[id]===k)return;cache[id]=k;const e=$(id);if(!e)return;e.querySelector('b').style.width=k+'%';e.classList.toggle('low',v<25)}
function bodyHud(){
 const now=performance.now(),dt=Math.min(.1,(now-lastT)/1000);lastT=now;
 bar('#bSta',G.stam);bar('#bSan',G.san);
 body.flash=Math.max(0,body.flash-dt*1.6);body.dirT=Math.max(0,body.dirT-dt*1.2);body.hit=Math.max(0,body.hit-dt*4);
 const bl=G.bleed>0?.25+.2*Math.sin(now*.008):0;
 sc.hurtRed=Math.min(.7,body.flash*.7);
 const vh=$('#vh');if(vh)vh.style.opacity=Math.min(1,body.flash+bl);
 const vs=$('#vs');if(vs)vs.style.opacity=clamp(sc.insane*.9+sc.fear*.25,0,1)*HG.cfg.horror/100;
 const uw=$('#uw');if(uw)uw.style.opacity=G.head?1:0;
 {const o2=$('#bO2');if(o2){const sh=G.o2!==undefined&&G.o2<99.5;if(o2.hidden===sh)o2.hidden=!sh;if(sh)bar('#bO2',G.o2)}}
 const dm=$('#dmg');if(dm){dm.style.opacity=body.dirT>0?Math.min(1,body.dirT):0;dm.style.transform='rotate('+(-body.dirA*57.2958)+'deg)'}
 const hm=$('#hitm');if(hm){hm.style.opacity=body.hit;hm.classList.toggle('kill',body.hitKill)}
 let s='';
 if(G.bleed>0)s+='Kanama · ';
 if(G.tired)s+='Bitkin · ';
 if(G.swim)s+='Yüzüyor · ';else if(G.onRaft)s+='Salda · ';
 if(G.torchLit)s+='Meşale '+Math.max(0,Math.round(G.torchFuel/360*100))+'% · ';
 if(G.san<30)s+='Akıl dağılıyor · ';
 else if(G.san<55)s+='Huzursuz · ';
 if(hc.s!==s){hc.s=s;const e=$('#sts');if(e)e.textContent=s.replace(/ · $/,'')}
}
const hc={};
Object.assign(HG,{lightLevel,hurt,addSan,hitMarker,swing,useStam,useMedical,updateBody,bodyHud});
})();
