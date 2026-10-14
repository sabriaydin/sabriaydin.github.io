/* Hunger 3D - başarımlar: koşullar saniyede bir denetlenir; açılan başarım deneyim verir ve kayda işlenir */
(()=>{
'use strict';
const {G,ui,clamp}=HG;
const F=k=>!!(G.flags&&G.flags[k]);
const S=k=>(G.stats&&G.stats[k])||0;
/* [kimlik, ad, açıklama, deneyim, koşul] */
const ACH=[
 ['wood','Odun Toplayıcı','İlk odunu topla.',4,()=>F('got_wood')],
 ['axe','İlk Alet','Taş baltayı üret.',5,()=>F('made_axe1')],
 ['fire','İlk Ateş','Bir kamp ateşi yerleştir.',6,()=>F('placed_fire')],
 ['shelter','Başının Üstünde Çatı','Gece, kapalı bir barınakta zaman geçir.',10,()=>F('shelter')],
 ['cook','Pişmiş Yemek','Ateşte et veya balık pişir.',6,()=>F('made_cmeat')||F('made_cfish')],
 ['fish','Oltacı','İlk balığı tut.',6,()=>F('got_fish')],
 ['hunt','Avcı','Bir hayvan avla.',8,()=>F('hunted')],
 ['bow','Okçu','Yayla ok at.',8,()=>F('shot')],
 ['copper','Bakır Çağı','İlk bakır külçeyi erit.',12,()=>F('made_copper_ingot')],
 ['iron','Demir Çağı','İlk demir külçeyi erit.',16,()=>F('made_iron_ingot')],
 ['pick3','Derin Madenci','Demir kazma üret.',18,()=>F('made_pick3')],
 ['coat','Sıcak Tutan','Deri mont üret.',10,()=>F('made_coat')],
 ['bag','Rahat Uyku','Uyku tulumu üret.',10,()=>F('made_bag')],
 ['slept','İyi Dinlenme','Sabaha kadar uyu.',10,()=>F('slept')],
 ['village','Yabancı Misafir','Bir köy bul.',10,()=>F('vfound')],
 ['villages','Gezgin','Üç köy bul.',20,()=>(G.villages||[]).filter((v,i)=>F('v'+i)).length>=3],
 ['trader','Tüccar','Bir köylüyle ticaret yap.',8,()=>F('traded')],
 ['rich','Zengin','Aynı anda 30 bakır sikke taşı.',14,()=>HG.count&&HG.count('coin')>=30],
 ['quest','Yardımsever','Bir köy görevi tamamla.',10,()=>S('quests')>=1],
 ['quest5','Köyün Dostu','Beş görev tamamla.',24,()=>S('quests')>=5],
 ['chest','Kamp Kaşifi','Bir kamp sandığı aç.',10,()=>S('chests')>=1],
 ['chest5','Hazine Avcısı','Beş kamp sandığı aç.',24,()=>S('chests')>=5],
 ['lore','Tarihçi','Yedi sefer notu topla.',16,()=>(G.notes||[]).length>=7],
 ['lore14','Sırrın Sahibi','Tüm sefer notlarını topla.',40,()=>(G.notes||[]).length>=14],
 ['shade','Gölge Avcısı','Bir Gölge öldür.',14,()=>S('shades')>=1],
 ['shade10','Işığın Bekçisi','On Gölge öldür.',30,()=>S('shades')>=10],
 ['day3','Üç Gün','3. güne ulaş.',8,()=>HG.dayNo()>=3],
 ['day7','Bir Hafta','7. güne ulaş.',20,()=>HG.dayNo()>=7],
 ['day15','Yerleşik','15. güne ulaş.',40,()=>HG.dayNo()>=15],
 ['blood','Kızıl Gece','Bir Kan Ayı gecesini atlat.',30,()=>S('blood')>=1],
 ['lvl5','Deneyimli','5. seviyeye ulaş.',16,()=>(G.lvl||1)>=5],
 ['lvl10','Usta','10. seviyeye ulaş.',40,()=>(G.lvl||1)>=10],
 ['fall','Yer Çekimi','Yüksekten düşüp hayatta kal.',6,()=>F('fell')],
 ['headshot','Tam Isabet','Bir canlıyı kafasından vurarak öldür.',10,()=>F('headshot')],
 ['cave','Karanlığa İniş','Bir mağaraya gir.',12,()=>F('cave')],
 ['cavedeep','Karanlıkta Ayakta','Bir mağarada en az yarım dakika hayatta kal.',14,()=>F('cavedeep')],
 ['vault','Mühürlü Hazine','Bir mağaranın hazine sandığını aç.',28,()=>F('vault')],
 ['gem','Kızıl Parıltı','Bir mücevher veya altın külçe taşı.',16,()=>HG.count&&(HG.count('gem')>=1||HG.count('gold')>=1)],
 ['cave3','Mağara Kâşifi','Üç kez mağaraya gir.',26,()=>S('caves')>=3]
];
HG.ACH=ACH.map(a=>[a[0],a[1],a[2],a[3]]);
const prevI=HG.progInit,prevS=HG.progSave,prevL=HG.progLoad;
HG.progInit=()=>{prevI();G.ach={};G.achQuiet=true};
HG.progSave=()=>Object.assign(prevS(),{ach:G.ach||{}});
HG.progLoad=s=>{prevL(s);G.ach=s&&s.ach&&typeof s.ach==='object'?s.ach:{};G.achQuiet=true};
function check(){
 if(!G.ach)G.ach={};
 let any=false;
 for(const a of ACH){
  if(G.ach[a[0]])continue;
  let ok=false;try{ok=!!a[4]()}catch(e){}
  if(!ok)continue;
  G.ach[a[0]]=1;any=true;
  if(!G.achQuiet){HG.toast('★ Başarım: '+a[1]);try{HG.snd('quest')}catch(e){}HG.xpGain&&HG.xpGain(a[3])}
 }
 G.achQuiet=false;return any;
}
let acc=0;
const up=HG.update;
HG.update=dt=>{up(dt);acc+=dt;if(acc>1&&ui.state==='play'){acc=0;check()}};
HG.checkAch=check;
})();
