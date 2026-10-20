/* Hunger 3D - üretim süresi (Rust mantığı): malzeme hemen harcanır, eşya sıraya girer ve süresi dolunca çantaya eklenir.
   Süre malzemelerin miktarına ve değerine göre belirlenir: küçük ve basit eşyalar 1.5-3 sn, aletler ve yapılar 3-6 sn,
   bakır/demir ve deri gibi pahalı malzemeli büyük eşyalar 6-11 sn sürer. Pişirme ve ergitme kısa tutulur.
   Sıra kayıtla birlikte saklanır (G.x2.cq); sıradaki bir eşya iptal edilirse malzemeleri iade edilir. Aynı anda tek eşya üretilir. */
(()=>{
'use strict';
const {RC,IT,ICON,G,ui,count,take,add,canAdd,flag}=HG;
const $=HG.$;
const MAXQ=40;
const WT={wood:1,stone:1.2,sand:1,berries:.5,herb:1,feather:1,wool:2,bone:1.5,coal:1.5,comb:2,fur:3,leather:2.5,copper_ore:2,iron_ore:3,copper_ingot:4,iron_ingot:6,bottle:1.5,wheat:.8,honey:1.5,egg:.8,mushroom:.6,meat:1,cmeat:1,fish:1,sardine:.6,bass:1,tuna:1.5,crab:1,shell:.8};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* tarifin süresi (saniye) */
function duration(r){
 let u=0;for(const k in r[2])u+=r[2][k]*(WT[k]!==undefined?WT[k]:1.5);
 let d=Math.min(11,Math.max(1.5,1+u*.18));
 if(r[3]==='fire')d=Math.max(1.5,Math.min(d*.7,3));          /* pişirme */
 else if(r[3]==='furn')d=Math.max(2.5,Math.min(d,4));         /* ergitme, cam */
 return Math.round(d*10)/10;
}
HG.craftTime=duration;
const Q=()=>{const x=HG.X2?HG.X2():(G.x2||(G.x2={}));return x.cq||(x.cq=[])};
if(HG.x2reg)HG.x2reg('cq',()=>[],v=>Array.isArray(v)?v.filter(q=>q&&IT[q.id]&&q.n>0&&q.d>0&&q.m&&typeof q.m==='object').slice(0,MAXQ).map(q=>{const m={};for(const k in q.m)if(IT[k]&&q.m[k]>0)m[k]=q.m[k]|0;return {id:q.id,n:q.n|0,d:Math.min(30,+q.d),t:Math.max(0,Math.min(+q.t||0,+q.d)),m}}):[]);

function craft(i){
 const r=RC[i];if(!r||HG.canCraft(r)!==1)return;
 const q=Q();
 if(q.length>=MAXQ){HG.toast('Üretim sırası dolu.');return}
 for(const k in r[2])take(k,r[2][k]);
 q.push({id:r[0],n:r[1],d:duration(r),t:0,m:Object.assign({},r[2])});
 if(G.stats)G.stats.crafted++;
 HG.snd('ui');ui.dirty=true;
}
function finish(e){
 const left=add(e.id,e.n);
 if(left>0&&HG.spawnDrop)HG.spawnDrop(e.id,left);
 flag('made_'+e.id);HG.xpGain(3);
 HG.feed('Üretildi: '+IT[e.id].n+(e.n>1?' ×'+e.n:''));HG.snd('craft');ui.dirty=true;
}
function cancel(idx){
 const q=Q(),e=q[idx];if(!e)return;
 q.splice(idx,1);
 for(const k in e.m){const left=add(k,e.m[k]);if(left>0&&HG.spawnDrop)HG.spawnDrop(k,left)}
 if(G.stats&&G.stats.crafted>0)G.stats.crafted--;
 HG.snd('ui');ui.dirty=true;
}
function updateCraft(dt){
 const q=Q();
 if(q.length&&ui.state==='play'){
  const e=q[0];e.t+=dt;
  if(e.t>=e.d){q.shift();finish(e)}
 }
 draw();
}
/* ---- arayüz: oyun içi küçük gösterge ve üretim ekranında sıra ---- */
let hud=null,bar=null,last='';
function ensure(){
 if(!hud){
  hud=document.createElement('div');hud.id='cqhud';hud.hidden=true;
  hud.innerHTML='<b></b><div class="cqp"><i></i></div><span></span>';
  const g=$('#game')||document.body;g.appendChild(hud);
 }
 if(!bar){
  const st=$('#crfSt');if(st&&st.parentNode){bar=document.createElement('div');bar.id='cqbar';bar.hidden=true;st.parentNode.insertBefore(bar,st.nextSibling);
   bar.addEventListener('click',ev=>{const b=ev.target.closest('button[data-cq]');if(b){cancel(+b.dataset.cq);last='';draw();if(HG.renderRecipes)HG.renderRecipes()}});
  }
 }
}
function draw(){
 ensure();
 const q=Q(),e=q[0];
 const key=q.length?q.map(x=>x.id+x.n).join(',')+'|'+Math.floor((e.t/e.d)*100):'';
 if(key===last)return;last=key;
 if(!q.length){if(hud)hud.hidden=true;if(bar){bar.hidden=true;bar.innerHTML=''}return}
 const pct=Math.min(100,Math.round(e.t/e.d*100));
 if(hud){
  hud.hidden=false;
  hud.querySelector('b').textContent='Üretiliyor: '+IT[e.id].n+(e.n>1?' ×'+e.n:'');
  hud.querySelector('i').style.width=pct+'%';
  hud.querySelector('span').textContent=q.length>1?'Sırada: '+(q.length-1):'';
 }
 if(bar){
  bar.hidden=false;
  let h='<div class="cqt">Üretim sırası <small>(simgeye tıklayarak iptal edin, malzemeler iade edilir)</small></div><div class="cql">';
  q.forEach((x,i)=>{h+=`<button type="button" data-cq="${i}" class="cqi${i===0?' on':''}" title="${esc(IT[x.id].n)}${x.n>1?' ×'+x.n:''} · ${x.d} sn · iptal"><img src="${ICON[x.id]}" alt="">${i===0?`<i style="width:${pct}%"></i>`:''}${x.n>1?`<span>${x.n}</span>`:''}</button>`});
  bar.innerHTML=h+'</div>';
 }
}
/* tarif kartlarına süre bilgisi: kart yenilenirken düğme başlığına eklenir */
{
 const t0=HG.renderRecipes;
 HG.renderRecipes=function(){
  const r=t0.apply(this,arguments);
  for(const b of document.querySelectorAll('#recipes button[data-r]')){const rc=RC[+b.dataset.r];if(rc&&!b.dataset.sr){b.dataset.sr=1;b.title=(b.title?b.title+' · ':'')+'Süre: '+duration(rc)+' sn'}}
  return r;
 };
}
Object.assign(HG,{craft,cancelCraft:cancel,updateCraft});
})();
