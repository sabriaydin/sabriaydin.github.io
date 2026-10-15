/* Hunger 3D - köylü görevleri: eşya getirme, avlanma, Gölge avı, köy bulma. Ödül: sikke, deneyim, bazen eşya. */
(()=>{
'use strict';
const {G,ui,IT,ANIMAL,count,take,add,$,DAY}=HG;
const rnd=Math.random,R=(a,b)=>a+((rnd()*(b-a+1))|0);
/* mesleğe göre istenebilecek eşyalar: [eşya, en az, en çok] */
const FETCH={
 farmer:[['wood',8,14],['leather',3,5],['berries',8,12]],
 hunter:[['meat',4,7],['bone',5,8],['leather',3,5]],
 fisher:[['fish',4,7],['coconut',3,5],['sand',8,12],['sardine',4,7],['crab',2,3]],
 smith:[['coal',8,12],['iron_ore',2,3],['copper_ore',3,5]],
 healer:[['berries',8,12],['wool',4,6],['milk',2,3]],
 woodcut:[['wood',16,26],['coal',6,9]],
 miner:[['stone',16,26],['coal',8,12],['copper_ore',3,5]]
};
const VAL={sardine:2,bass:3,tuna:5,crab:3,coral:5,wood:1,leather:2.5,berries:1,meat:2,bone:1.5,fish:2,coconut:2,sand:1,coal:2,iron_ore:7,copper_ore:4,wool:2,milk:3,stone:1};
const EXTRA=[['bandage',2],['torch',2],['arrow',8],['cmeat',2]];
function gen(n){
 const vs=G.villages||[],r=rnd();
 let q;
 if(r<.5){
  const f=FETCH[n.prof][R(0,FETCH[n.prof].length-1)],k=R(f[1],f[2]);
  q={t:'fetch',item:f[0],n:k,rw:{coin:Math.ceil(k*VAL[f[0]]*1.6)+2}};
 }else if(r<.72){
  const a=n.prof==='fisher'&&rnd()<.5?'shark':rnd()<.55?'wolf':'boar',k=a==='shark'?1:a==='wolf'?R(1,2):R(2,3);
  q={t:'hunt',a,n:k,rw:{coin:k*(a==='shark'?30:a==='wolf'?14:9)}};
 }else if(r<.86){
  const k=R(1,2);q={t:'shade',n:k,rw:{coin:k*18}};
 }else if(vs.length>1){
  let j;do{j=R(0,vs.length-1)}while(j===n.vi);
  q={t:'visit',j,n:1,rw:{coin:14}};
 }else q={t:'shade',n:1,rw:{coin:18}};
 q.rw.xp=25+q.rw.coin;
 if(rnd()<.4)q.rw.item=EXTRA[R(0,EXTRA.length-1)];
 q.st=0;q.p=0;q.next=0;
 return q;
}
const title=q=>q.t==='fetch'?`${q.n} ${IT[q.item].n} getir`:q.t==='hunt'?`${q.n} ${ANIMAL[q.a].n} avla`:q.t==='shade'?`${q.n} Gölge yok et`:`${G.villages[q.j].name} köyünü bul`;
const have=q=>q.t==='fetch'?Math.min(q.n,count(q.item)):q.t==='visit'?(G.flags['v'+q.j]?1:0):Math.min(q.n,q.p);
const prog=q=>q.st===2?'Tamamlandı':`${have(q)}/${q.n}`;
const done=q=>have(q)>=q.n;
function getQ(n){
 if(!G.quests)G.quests={};
 let q=G.quests[n.id];
 if(!q||(q.st===2&&G.clock>=q.next)){q=G.quests[n.id]=gen(n)}
 return q;
}
function give(id,k){const left=add(id,k);if(left>0)HG.spawnDrop(id,left)}
function html(n){
 const q=getQ(n),rw=q.rw.coin+' sikke'+(q.rw.item?' + '+IT[q.rw.item[0]].n+(q.rw.item[1]>1?' ×'+q.rw.item[1]:''):'')+' · '+q.rw.xp+' deneyim';
 let body,btn='';
 if(q.st===0){body=`<b>${title(q)}</b><span>${n.name}: ${q.t==='fetch'?'Bunlara ihtiyaç var.':q.t==='visit'?'Komşu köyden haber gelmiyor.':'Bölge tehlikeli hâle geldi.'}</span><br><span>Ödül: ${rw}</span>`;btn='<button type="button" data-q="acc">Kabul</button>'}
 else if(q.st===1){body=`<b>${title(q)}</b><span>İlerleme: ${prog(q)}</span><br><span>Ödül: ${rw}</span>`;btn=`<button type="button" data-q="turn"${done(q)?'':' disabled'}>Teslim</button>`}
 else body=`<b>Görev tamamlandı</b><span>Yeni görev için biraz sonra tekrar gelin.</span>`;
 return `<h3>Görev</h3><div class="rc"><span class="qi">${q.st===2?'✓':'!'}</span><div>${body}</div>${btn}</div>`;
}
function act(n,a){
 const q=getQ(n);
 if(a==='acc'&&q.st===0){q.st=1;q.p=0;HG.snd('ui_open');HG.toast('Görev alındı: '+title(q))}
 else if(a==='turn'&&q.st===1&&done(q)){
  if(q.t==='fetch')take(q.item,q.n);
  give('coin',q.rw.coin);if(q.rw.item)give(q.rw.item[0],q.rw.item[1]);
  HG.xpGain(q.rw.xp);G.stats.quests++;HG.flag('quest');
  q.st=2;q.next=G.clock+DAY*.35;HG.snd('quest');HG.toast('Görev tamamlandı: +'+q.rw.coin+' sikke');
 }
 HG.renderTrade&&HG.renderTrade();
 const s=$('#trS');if(s&&G.trading)s.textContent=HG.PROF[G.trading.prof].hi+' · Sikken: '+count('coin');
}
/* öldürme bildirimi (hayvanlar.js killAnimal çağırır) */
function onKill(a,def){
 if(a._k||!G.stats)return;a._k=1;
 if(def.foe){
  if(a.fake)return;
  G.stats.shades++;HG.xpGain(16);
 }else{G.stats.hunted++;HG.xpGain(def.xpv||5);if(a.t==='shark')G.stats.sharks=(G.stats.sharks||0)+1;if(a.t==='crab')G.stats.crabs=(G.stats.crabs||0)+1}
 for(const id in G.quests||{}){
  const q=G.quests[id];
  if(q.st!==1||q.p>=q.n)continue;
  if((q.t==='hunt'&&q.a===a.t)||(q.t==='shade'&&def.foe)){q.p++;HG.toast('Görev: '+title(q)+' · '+q.p+'/'+q.n)}
 }
}
const list=()=>(G.npcs||[]).filter(n=>G.quests&&G.quests[n.id]&&G.quests[n.id].st===1).map(n=>({n,q:G.quests[n.id]}));
function init(){
 const t=$('#trL');
 if(t)t.addEventListener('click',e=>{const b=e.target.closest('button[data-q]');if(b&&G.trading)act(G.trading,b.dataset.q)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
Object.assign(HG,{questHtml:html,questList:list,questTitle:title,questProg:prog,onKill});
})();
