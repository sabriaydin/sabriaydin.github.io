/* Hunger 3D - terk edilmiş kamplar: keşif, sandık açma, ganimet ve bulunan kayıtlar */
(()=>{
'use strict';
const {G,ui,count,add,canAdd,IT}=HG;
const rnd=Math.random,R=(a,b)=>a+((rnd()*(b-a+1))|0);
/* ganimet: [eşya, en az, en çok, ağırlık]; seviye arttıkça güçlenir */
const LOOT=[
 [['bandage',1,3,5],['arrow',5,12,5],['cmeat',1,3,5],['wbottle',1,2,4],['torch',1,2,4],['coin',2,6,6],['leather',2,4,3],['bone',2,4,3],['berries',3,6,3],['jerky',1,3,3],['seed',2,4,2],['feather',2,5,2],['mushroom',2,4,2]],
 [['bandage',2,4,4],['arrow',8,16,4],['cmeat',2,4,4],['torch',2,3,3],['coin',5,10,6],['iron_ingot',1,1,3],['copper_ingot',1,2,4],['coat',1,1,1],['wool',2,4,2],['bag',1,1,1],['jerky',2,4,3],['salve',1,2,2],['vest',1,1,1],['seed',3,5,2],['feather',3,6,2]],
 [['bandage',3,5,4],['arrow',12,20,4],['coin',10,18,6],['iron_ingot',1,3,5],['pick2',1,1,2],['axe2',1,1,2],['bow',1,1,2],['spear',1,1,2],['coat',1,1,3],['bag',1,1,2],['cmeat',3,5,3],['salve',1,3,3],['iarmor',1,1,1.2],['spear2',1,1,1.2],['spyglass',1,1,1.2],['jerky',3,5,3]],
 /* mağaradaki mühürlü sandık: az ama değerli */
 [['gold',1,3,6],['gem',1,2,5],['coin',18,32,5],['iron_ingot',2,4,4],['pick3',1,1,1.6],['axe3',1,1,1.6],['bandage',3,5,3],['arrow',16,26,3],['torch',3,4,3],['spyglass',1,1,1.2],['iarmor',1,1,1.2],['salve',2,3,3]]
];
/* deniz kampları: enkaz, kazazede kampı ve deniz feneri; seviye 0-1 ve 2+ için iki ganimet listesi */
const LOOT_SEA={
 wreck:[[['coin',6,12,6],['iron_ingot',1,2,4],['mask',1,1,1.6],['bandage',1,3,4],['torch',1,2,3],['cfish',1,3,4],['wbottle',1,2,3],['gold',1,1,2]],
        [['coin',12,22,6],['gold',1,2,4],['gem',1,1,3],['mask',1,1,2],['iron_ingot',2,3,4],['pick2',1,1,1.4],['axe2',1,1,1.4],['bandage',2,4,3],['arrow',8,14,3]]],
 castaway:[[['coconut',3,6,6],['cfish',2,4,5],['raft',1,1,2.2],['mask',1,1,1],['wbottle',1,2,4],['bandage',1,2,3],['torch',1,2,3],['coin',3,7,4]],
           [['coconut',4,8,5],['cfish',3,5,5],['raft',1,1,3],['mask',1,1,1.6],['bandage',2,3,3],['coin',6,12,5],['bag',1,1,1]]],
 lighthouse:[[['bandage',3,5,5],['torch',3,5,5],['arrow',10,18,4],['coin',8,16,6],['cfish',2,4,4],['wbottle',2,3,3],['raft',1,1,2]],
             [['bandage',3,5,5],['torch',3,5,4],['coin',12,22,6],['iron_ingot',1,3,4],['mask',1,1,2],['gold',1,1,1.5]]]
};
/* [keşif mesajı, deneyim, keşif mesafesi] */
const KIND={wreck:['Bir gemi enkazı keşfedildi: sandık dipte.',10,22],castaway:['Issız bir adada kazazede kampı bulundu.',8,40],lighthouse:['Bir deniz feneri keşfedildi.',12,70]};
function roll(tier,kind){
 const T=LOOT_SEA[kind]?LOOT_SEA[kind][tier>=2?1:0]:LOOT[tier],out=[];let k=tier>2?R(4,5):R(3,4)+tier;
 while(k-->0){
  const tw=T.reduce((s,x)=>s+x[3],0);let r=rnd()*tw,e=T[0];
  for(const x of T){r-=x[3];if(r<=0){e=x;break}}
  const n=R(e[1],e[2]),f=out.find(o=>o[0]===e[0]);
  if(f&&IT[e[0]].s>1)f[1]+=n;else if(!f)out.push([e[0],n]);
 }
 return out;
}
function updateCamps(dt){
 const L=G.camps;G.nearCamp=null;if(!L)return;
 let best=2.6;
 for(const c of L){
  const d=Math.hypot(G.px-(c.x+.5),G.py-(c.y+.5)),kd=KIND[c.kind];
  if(d<(kd?kd[2]:14)&&!G.flags['c'+c.id]){
   G.flags['c'+c.id]=1;HG.toast(kd?kd[0]:c.vault?'Mühürlü bir hazine odası bulundu.':'Terk edilmiş bir kamp keşfedildi.');HG.xpGain(kd?kd[1]:c.vault?14:6);
   if(kd)HG.flag(c.kind+'_found');
  }
  if(c.kind==='wreck'&&G.onRaft){if(d<3&&!G.flags.wreckHint){G.flags.wreckHint=1;HG.toast('Enkaz sandığına ulaşmak için salı bırakıp suya girin.')}continue}   /* enkaz sandığı salın altındadır */
  if(!c.open&&d<best){best=d;G.nearCamp=c}
 }
}
const CN=24;
/* Sandık: ganimet ilk açılışta sandığın kendi 24 kutuluk deposuna konur (G.x2.cc); çantaya otomatik gelmez, oyuncu istediğini alır */
function openChest(){
 const c=G.nearCamp;if(!c||c.open||ui.state!=='play')return false;
 const X=HG.X2(),cc=X.cc||(X.cc={}),key=String(c.id);
 let e=cc[key];
 if(!e){
  const loot=roll(c.tier,c.kind);e={it:Array(CN).fill(null)};
  for(const [id,n0] of loot){
   let n=n0;const mx=IT[id].s;
   for(let k=0;k<CN&&n>0;k++){const s=e.it[k];if(s&&s.id===id&&s.n<mx){const m=Math.min(mx-s.n,n);s.n+=m;n-=m}}
   for(let k=0;k<CN&&n>0;k++){if(!e.it[k]){const m=Math.min(mx,n);e.it[k]={id,n:m};n-=m}}
  }
  cc[key]=e;
  G.stats.chests++;HG.flag('chest');if(c.vault)HG.flag('vault');if(LOOT_SEA[c.kind])HG.flag(c.kind+'_open');HG.xpGain(14+c.tier*8);
  /* kayıt */
  const N=HG.NOTES||[];
  if(N.length&&c.note!==undefined&&!G.notes.includes(c.note)){
   G.notes.push(c.note);HG.xpGain(8);
   /* Günlük penceresi kendiliğinden açılmaz (oyunun akışını kesiyordu): yalnızca bildirim düşer,
      kayıt Günlük › Kayıtlar sekmesinde "Yeni" işaretiyle bekler. */
   HG.noteNew&&HG.noteNew(c.note);
   HG.toast('Yeni bir kayıt bulundu · Günlük (K) › Kayıtlar');
  }
 }
 HG.snd('chest');
 if(HG.openCampStore&&HG.openCampStore(c,e))return true;
 /* arayüz yoksa eski davranış: her şey çantaya */
 for(const q of e.it)if(q){const left=add(q.id,q.n);if(left>0)HG.spawnDrop(q.id,left)}
 c.open=true;G.nearCamp=null;delete cc[key];return true;
}
/* kamp sandığı penceresi kapanınca: boşsa sandık tükenmiş sayılır (kayıtta açık olarak saklanır) */
function campChestClosed(c){
 const X=HG.X2(),cc=X.cc||{},key=String(c.id),e=cc[key];
 if(e&&!e.it.some(Boolean)){c.open=true;delete cc[key];if(G.nearCamp===c)G.nearCamp=null;HG.feed('Sandık boşaltıldı.')}
}
Object.assign(HG,{updateCamps,openChest,campChestClosed});
})();
