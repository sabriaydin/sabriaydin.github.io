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
function tick(dt){
 if(ui.state!=='play'||ui.sleeping||HG.busy){if(!el.hidden)el.hidden=true;return}
 const s=stealth();
 if(s===null){showT=Math.max(0,showT-dt);if(showT<=0&&!el.hidden)el.hidden=true;return}
 const name=s===2?'Fark edildin':s===1?'Tetikte':'Gizli';
 const cls=s===2?'seen':s===1?'warn':'hid';
 showT=1.6;
 if(state!==name){
  state=name;span.textContent=name+(G.crouch&&s===0?' · çömelme işe yarıyor':'');
  el.className=cls;
 }
 if(el.hidden)el.hidden=false;
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
