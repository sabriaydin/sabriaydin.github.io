/* Hunger 3D - olaylar: Kan Ayı gecesi (her 5. günün akşamı), günlük deneyim */
(()=>{
'use strict';
const {G,ui,daylight,dayNo,add}=HG;
function updateEvents(dt){
 if(!G.stats)return;
 const L=daylight(),d=dayNo();
 /* yeni gün: deneyim */
 if(d>(G.lastDay||1)){G.lastDay=d;HG.xpGain(20);HG.feed('Yeni gün: '+d)}
 /* akşam bildirimi: gün ışığı yarının altına düştüğünde bir kez */
 if(!G.cave){
  if(G.prevL!==undefined&&G.prevL>=.5&&L<.5&&!G.blood&&d%5!==0)HG.toast('Akşam oluyor. Ateş, meşale ve barınak hazırlayın.');
  G.prevL=L;
 }else G.prevL=undefined;
 /* Kan Ayı: her 5. günün akşamı doğar, sabaha kadar sürer */
 if(!G.blood&&L<.3&&d%5===0&&G.bloodDay!==d&&G.clock>60){
  G.blood=true;G.bloodDay=d;
  HG.toast('Kan Ayı doğdu. Bu gece Gölgeler çok daha fazla. Köy fenerlerinin ve ateşin yanında kalın.');
  HG.snd('bloodmoon');HG.snd('stinger');
 }
 if(G.blood&&L>.5){
  G.blood=false;G.stats.blood++;HG.flag('blood');
  const c=6+d;add('coin',c);HG.xpGain(60+d*2);
  HG.toast('Kan Ayı sona erdi. Hayatta kalma ödülü: '+c+' sikke.');HG.snd('quest');
 }
}
Object.assign(HG,{updateEvents});
})();
