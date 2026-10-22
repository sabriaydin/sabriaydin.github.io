/* Hunger 3D - oynanış eklentileri (güncelleme 70).
   Q ile önceki eşyaya dönme, gizlilik göstergesi (çömelerek avlanma geri bildirimi) ve
   çömelme ipucu. Özgün dosyalara dokunmaz; yalnızca DOM'a ekleme ve tuş dinleme yapar. */
(()=>{
'use strict';
const {G,ui}=HG;
const $=HG.$;

/* ---------- Q: önceki eşyaya dön ---------- */
let prevSel=0,curSel=-1;
addEventListener('keydown',e=>{
 if(ui.state!=='play'||!HG.keyIs||!HG.keyIs('lastslot',e.code))return;
 if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
 const p=prevSel;
 if(p===G.sel||p<0||p>=HG.HOT)return;
 prevSel=G.sel;G.sel=p;curSel=p;ui.dirty=true;
 try{HG.snd('ui')}catch(err){}
});

/* ---------- Gizlilik göstergesi ----------
   Yakındaki hayvanların durumuna bakar: fark edilmediyse "Gizli", tetikteyse "Tetikte",
   kovalıyorsa "Fark edildin". Çömelme bu durumu belirgin biçimde iyileştirir. */
const el=document.createElement('div');
el.id='stealth';el.hidden=true;
el.innerHTML='<i></i><span></span>';
const host=$('#game');if(host)host.appendChild(el);
const span=el.querySelector('span');
let state='',showT=0;
const on=()=>{el.hidden=false;el.classList.add('on')};
const off=()=>{el.classList.remove('on');state='';showT=0};

function stealth(){
 const L=G.animals;if(!L)return null;
 let best=0,near=false;
 for(const a of L){
  if(a.dying)continue;
  const def=HG.ANIMAL[a.t];if(!def)continue;
  const d=Math.hypot(a.x-G.px,a.z-G.py);
  if(d>26)continue;
  near=true;
  if(a.charge>0)best=Math.max(best,2);
  else if(a.alerted||(a.alertT||0)>0||a.panic>0)best=Math.max(best,1);
 }
 return near?best:null;
}
/* Gösterim kuralı: hayvan tetikteyse veya kovalıyorsa her zaman gösterilir; sakin bir hayvan
   yakındayken yalnızca çömelirken gösterilir. Böylece yürürken yanından geçilen her hayvanda
   gösterge kendiliğinden açılıp kapanmaz. Kaybolurken yumuşak söner. */
function tick(dt){
 if(ui.state!=='play'||ui.sleeping||HG.busy){off();return}
 const s=stealth();
 const want=s===null?-1:(s>=1?s:(G.crouch?0:-1));
 if(want<0){showT=Math.max(0,showT-dt);if(showT<=0)off();return}
 showT=1.4;
 const txt=want===2?'Fark edildin':want===1?'Tetikte':'Gizli · ses çıkarmıyorsun';
 if(state!==txt){state=txt;span.textContent=txt;el.className=want===2?'seen':want===1?'warn':'hid'}
 on();
}

/* ---------- Çömelme ipucu: ilk kez tetikte bir hayvana yaklaşınca bir kez gösterilir ---------- */
let hinted=false;
function hint(){
 if(hinted||G.crouch||ui.state!=='play')return;
 const s=stealth();
 if(s!==1)return;
 hinted=true;
 const b=HG.bind&&HG.bind.crouch,k=(b&&HG.keyLabel)?HG.keyLabel(b[0]):'Ctrl';
 HG.toast&&HG.toast('Hayvan tetikte: '+k+' ile çömelirsen ayak sesin kesilir ve çok daha geç fark edilirsin.');
}

const u0=HG.update;
let acc=0;
HG.update=function(dt){
 const r=u0.apply(this,arguments);
 if(curSel!==G.sel){if(curSel>=0)prevSel=curSel;curSel=G.sel}
 acc+=dt;
 if(acc>=.25){const d=acc;acc=0;try{tick(d);hint()}catch(e){}}
 return r;
};
})();
