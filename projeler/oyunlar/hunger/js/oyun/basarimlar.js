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
 ['cave3','Mağara Kâşifi','Üç kez mağaraya gir.',26,()=>S('caves')>=3],
 ['swim','Yüzücü','Derin suda yüz.',8,()=>F('swam')],
 ['dive','Dalgıç','Suyun altına dal.',10,()=>F('dived')],
 ['breath','Derin Nefes','Su altında 20 saniye kal.',16,()=>F('deepbreath')],
 ['shell','Midye Toplayıcı','On midye topla.',14,()=>S('shells')>=10],
 ['pearl','İnci Avcısı','Deniz dibinde bir inci bul.',22,()=>F('got_pearl')],
 ['sea500','Açık Deniz','Toplam 500 metre yüz.',24,()=>S('swum')>=500],
 ['walk5k','Yolcu','Toplam 5000 metre yürü.',20,()=>S('walked')>=5000],
 ['milk','Sütçü','Bir ineği sağ.',6,()=>F('milked')],
 ['heal','Yaralı Dostu','Bandajla bir yarayı sar.',6,()=>F('healed')],
 ['torch','Işık Taşıyıcı','Meşale üret.',6,()=>F('made_torch')],
 ['perks','Uzmanlaşma','Yeteneklere toplam 5 puan harca.',20,()=>HG.PERKS&&HG.PERKS.reduce((a,p)=>a+HG.perk(p[0]),0)>=5],
 ['raft','Denizci','Bir sal üret ve üzerine bin.',12,()=>F('sailed')],
 ['islet','Ada Kâşifi','Üç ada keşfet.',16,()=>S('islets')>=3],
 ['islet8','Takımada','Sekiz ada keşfet.',34,()=>S('islets')>=8],
 ['wreck','Batık Avcısı','Bir gemi enkazının sandığını aç.',22,()=>F('wreck_open')],
 ['lighthouse','Fener Bekçisi','Bir deniz fenerinin sandığını aç.',22,()=>F('lighthouse_open')],
 ['castaway','Kazazede Dostu','Bir kazazede kampının sandığını aç.',16,()=>F('castaway_open')],
 ['shark','Köpek Balığı Avcısı','Bir köpek balığı öldür.',26,()=>S('sharks')>=1],
 ['tuna','Orkinos Avı','Açık denizde bir orkinos tut.',14,()=>F('got_tuna')],
 ['reef','Mercan Bahçesi','Bir resifte dalıp mercan topla.',14,()=>F('got_coral')],
 ['sail1k','Açık Denizci','Salla toplam 1000 metre yol git.',28,()=>S('sailed')>=1000],
 ['crab','Yengeç Avcısı','Bir yengeci avla.',10,()=>S('crabs')>=1],
 ['mask','Dalış Takımı','Dalış Maskesi üret veya bul.',12,()=>F('made_mask')||F('got_mask')],
 ['lvl20','Bilge','20. seviyeye ulaş.',60,()=>(G.lvl||1)>=20],
 ['day30','Köklü','30. güne ulaş.',60,()=>HG.dayNo()>=30],
 ['plot','Çiftçi Adayı','Bir Ekim Tarlası yerleştir.',8,()=>F('placed_plot')],
 ['harvest','İlk Hasat','Tarladan ilk ekini hasat et.',14,()=>F('harvest')],
 ['harvest10','Bereketli Toprak','On kez hasat yap.',30,()=>S('harvest')>=10],
 ['rack','Kış Hazırlığı','Kurutma Rafı yerleştir ve kuru yiyecek hazırla.',12,()=>F('dried')],
 ['bed','Yumuşak Uyku','Hasır Yatakta sabaha kadar uyu.',12,()=>F('slept_bed')],
 ['mush','Mantar Avcısı','On mantar topla.',10,()=>S('mush')>=10],
 ['egg','Kümes Sahibi','Bir yumurta topla.',6,()=>F('got_egg')],
 ['stew','Şef','Et Güveci pişir.',10,()=>F('made_stew')],
 ['armor','Zırhlı','Deri Yelek veya Demir Göğüslük üret.',14,()=>F('made_vest')||F('made_iarmor')],
 ['spy','Uzak Görüş','Dürbünle yakınlaştır.',8,()=>F('zoomed')],
 ['trap','Tuzakçı','Av Tuzağıyla bir av yakala.',12,()=>S('trapped')>=1],
 ['rainb','Yağmur Toplayıcı','Yağmur Varilinden şişe doldur.',10,()=>F('barrel_fill')],
 ['tpost','Aydınlık Yol','Meşale Direği yerleştir.',8,()=>F('placed_tpost')],
 ['photo','Fotoğrafçı','Fotoğraf modunda (P) bir kare çek.',8,()=>F('photo')],
 ['msg1','Denizden Haber','Bir Şişedeki Mesaj oku.',14,()=>S('msgs')>=1],
 ['msg8','Mesajların Sahibi','Sekiz Şişedeki Mesajın hepsini oku.',40,()=>S('msgs')>=8],
 /* büyük güncelleme (51) */
 ['crate','Depocu','Depo Sandığı yerleştir.',8,()=>F('placed_crate')],
 ['sign','Yol Gösterici','Tabela yerleştir.',6,()=>F('placed_sign')],
 ['apiary','Arıcı','Arı Kovanı yerleştir.',12,()=>F('placed_apiary')],
 ['wildhive','Bal Hırsızı','Yabani bir kovandan bal topla.',14,()=>F('wildhive')],
 ['honey10','Bal Ustası','Toplam on kez bal topla.',26,()=>S('honey')>=10],
 ['ftrap','Kapan Kurucu','Balık Kapanından av çıkar.',12,()=>F('trapfish')],
 ['treasure','Define','Gömülü bir hazine bul.',22,()=>S('treasure')>=1],
 ['treasure5','Define Avcısı','Beş gömülü hazine bul.',44,()=>S('treasure')>=5],
 ['bear','Ayı Avcısı','Bir ayı öldür.',30,()=>F('bear')||S('bears')>=1],
 ['pet','Sadık Dost','Bir köpek sahiplen.',14,()=>F('pet')],
 ['shield','Siperci','Kalkanla bir darbeyi engelle.',12,()=>F('blocked')],
 ['wet','Sırılsıklam','Üzerin ıslansın.',6,()=>F('gotwet')],
 ['fever','Ateşi Atlat','Ateşi bitki çayı veya merhemle düşür.',14,()=>F('cured')],
 ['rumor','Kulak Misafiri','Bir köylüden söylenti dinle.',8,()=>F('rumor')],
 ['rep','Köyün Dostu','Bir köyde itibar kazan.',16,()=>F('rep')],
 ['trader2','Gezgin Dost','Gezgin Tüccarı gör.',10,()=>F('traderseen')],
 ['daily1','Günün İşi','Bir günlük meydan okumayı tamamla.',10,()=>S('daily')>=1],
 ['daily10','Düzenli','On günlük meydan okuma tamamla.',36,()=>S('daily')>=10],
 ['winter','Kış Geldi','Kış mevsimine ulaş.',14,()=>HG.cfg.season!==false&&HG.x2season&&HG.x2season().id===3],
 ['year','Bir Yıl','25. güne ulaş (bir mevsim turu).',40,()=>HG.dayNo()>=25],
 ['apple','Elma Mevsimi','Beş elma topla.',10,()=>S('apples')>=5],
 ['sword3','Demir Kılıç','Demir Kılıç üret.',20,()=>F('made_sword3')],
 ['second','İkinci Şans','Öl ve doğma noktasında yeniden uyan.',10,()=>S('deaths')>=1],
 /* güncelleme 64: denge ve co-op */
 ['repair','Tamirci','Çalışma Tezgâhında bir aleti onar.',10,()=>F('repaired')],
 ['broke','Sert Kullanım','Bir aleti kırılana kadar kullan.',6,()=>F('toolbroke')],
 ['coop','Ortak Çaba','Bir arkadaşınla co-op oyna.',14,()=>F('coopplay')]
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
