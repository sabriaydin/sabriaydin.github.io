/* Hunger 3D - envanter: ekleme, çıkarma, sayma, bayraklar */
(()=>{
'use strict';
const {SLOTS,IT,G,ui}=HG;
const count=id=>{let n=0;for(const s of G.inv)if(s&&s.id===id)n+=s.n;return n};
function canAdd(id,n){
 const mx=IT[id].s;let room=0;
 for(const s of G.inv){if(!s)room+=mx;else if(s.id===id)room+=mx-s.n;if(room>=n)return true}
 return room>=n;
}
function add(id,n){
 const mx=IT[id].s;
 for(const s of G.inv){if(n<=0)break;if(s&&s.id===id&&s.n<mx){const k=Math.min(mx-s.n,n);s.n+=k;n-=k}}
 for(let i=0;i<SLOTS&&n>0;i++){if(!G.inv[i]){const k=Math.min(mx,n);G.inv[i]={id,n:k};n-=k}}
 ui.dirty=true;return n;
}
function take(id,n){
 for(let i=SLOTS-1;i>=0&&n>0;i--){const s=G.inv[i];if(s&&s.id===id){const k=Math.min(s.n,n);s.n-=k;n-=k;if(s.n<=0)G.inv[i]=null}}
 ui.dirty=true;
}
/* Kaynak topla: yer varsa ekler, bildirim ve ses verir. q: vuruş başına kaynakta ses ve deneyim verilmez */
function gain(id,n,q){
 if(!canAdd(id,n)){HG.toast('Envanter dolu.');return false}
 add(id,n);flag('got_'+id);if(HG.extGain)HG.extGain(id,n);HG.feed('+'+n+' '+IT[id].n);if(!q){HG.snd('get');if(HG.xpGain)HG.xpGain(.5)}return true;
}
/* Çantayı düzenle: hızlı erişim çubuğu dışındaki kutular birleştirilir ve eşya sırasına göre dizilir */
function sortInv(){
 if(ui.state!=='play'||!G.inv)return;
 const HOT=HG.HOT,tot={};
 for(let i=HOT;i<SLOTS;i++){const s=G.inv[i];if(s)tot[s.id]=(tot[s.id]||0)+s.n}
 const out=[];
 for(const id of Object.keys(IT)){let n=tot[id]||0;const mx=IT[id].s;while(n>0){const k=Math.min(mx,n);out.push({id,n:k});n-=k}}
 for(let i=HOT;i<SLOTS;i++)G.inv[i]=out[i-HOT]||null;
 ui.picked=null;ui.dirty=true;HG.snd('ui');HG.toast('Çanta düzenlendi.');
}
const held=()=>{const s=G.inv[G.sel];return s?{k:s.id,it:IT[s.id],s}:null};
const setObj=(i,v)=>{const was=G.obj[i];G.obj[i]=v;(G.oc||(G.oc=[])).push(i);if(HG.journal)HG.journal.cell(i,v,was)};   /* değişen kareler biriktirilir; sahne yalnızca bunları günceller */
const flag=f=>{if(!G.flags[f])G.flags[f]=1};
Object.assign(HG,{count,canAdd,add,take,gain,held,setObj,flag,sortInv});
})();
