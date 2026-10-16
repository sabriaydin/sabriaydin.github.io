/* Hunger 3D - rehber hedefleri */
(()=>{
'use strict';
const {G}=HG;
/* [bayrak, açıklama]: bayraklar envanter.js/eylem.js içinde işaretlenir (got_, made_, placed_, ...) */
const GOALS=[
 ['got_wood','El Taşını elinde tut (1. yuva), bir ağaca bak ve sol tuşla art arda vurarak odun topla. Çıplak elle ağaç kesilmez.'],
 ['got_stone','El Taşıyla yerdeki gri kayalardan taş topla.'],
 ['made_axe1','C tuşuyla üretim panelini aç ve Taş Balta üret.'],
 ['made_pick1','Taş Kazma üret. Kömür ve bakır ancak bununla çıkarılır.'],
 ['made_torch','Meşale üret (odun ve kömür). Geceleri karanlıkta yaratıklar dolaşır; ışık onları uzak tutar.'],
 ['placed_fire','Kamp Ateşi üret ve yere bakıp yerleştir (sol tık veya F). Gece ısıtır.'],
 ['made_bow','Yay ve ok üret. Sol tuşu basılı tutup gerin, bırakınca ok atılır.'],
 ['drank','Mavi tatlı su gölüne bakıp sol tuşla su iç. Deniz suyu içilmez.'],
 ['made_bench','Çalışma Tezgâhı üret ve yerleştir.'],
 ['made_plan','İnşa Planı (10 odun) ve Çekiç (12 odun, 8 taş) üret. Rust tarzı inşa: plan kurar, çekiç yükseltir ve yıkar.'],
 ['built','İnşa Planı eldeyken sol tıkla duvar ve kapı kur; sağ tık basılı tutarak parça seç. Çekiçle duvarı Odun, Taş veya Metal seviyesine yükselt.'],
 ['shelter','Duvar ve kapıyla tamamen kapalı bir barınak yap, geceyi içinde geçir.'],
 ['made_copper_ingot','Ocak yap; bakır cevherini kömürle eriterek külçe üret.'],
 ['made_pick2','Bakır Kazma üret. Demir damarları ancak bununla çıkarılır.'],
 ['made_pick3','Demir cevherini eritip Demir Kazma üret.'],
 ['vfound','Adada bir köy bul. Köylülerle konuşmak için E tuşuna bas.'],
 ['traded','Bir köylüyle ticaret yap: eşya takas et veya sikke karşılığı sat.'],
 ['made_bag','Uyku Tulumu üret (tezgâhta yün ve deri), gece güvenli bir yerde uyu.'],
 ['slept','Uyku tulumunu kullanarak geceyi geçir.'],
 ['chest','Haritada terk edilmiş bir kamp bul (harita üzerinde ◆ ile işaretlenir) ve sandığını E ile aç.'],
 ['quest','Bir köylüyle konuş ve görevini tamamla. K tuşu günlüğü açar.'],
 ['shade_killed','Bir Gölge yaratığını ışıkla veya silahla yok et. Bakıldığında donar, bakılmadığında yaklaşır.'],
 ['blood','Kan Ayı gecesini (her 5. gün akşamı) sağ atlat. Fener ve ateşin yanında kal.'],
 ['day7','7. güne kadar hayatta kal.'],
 ['swam','Derin suya girip yüzmeyi dene. Boşluk yüzeye çıkarır, dal tuşu aşağı indirir.'],
 ['dived','Suyun altına dal ve nefes çubuğunu izle. Nefes biterse boğulursun.'],
 ['got_shell','Dalıp deniz dibine bakarak midye topla ve ateşte pişir.'],
 ['made_raft','Tezgâhta Sal üret (odun, deri, yün). Elinde tutup suya bakarak E veya sağ tıkla bin.'],
 ['isl_found','Salla açık denize çık ve yeni bir ada keşfet. Köpek balıklarına dikkat et: sal onlara karşı da sığınaktır.'],
 ['wreck_open','Denizde bir gemi enkazı bul, dalıp dibindeki sandığı E ile aç. Dalış Maskesi nefesi uzatır.'],
 ['placed_plot','Ekim Tarlası üret (odun, taş) ve yerleştir. Yaban meyvesinden Tohum üret; tarlaya bakıp elde tohumla E: ekim.'],
 ['harvest','Ekin olgunlaşınca (yaklaşık 5 dakika, yağmurda iki kat hızlı) E ile hasat et: buğday ve tohum verir, ateşte ekmek olur.'],
 ['placed_rack','Kurutma Rafı kur; çiğ et ve balık elde tutulup E ile asılır. Yağmur altında kurumaz, rafı çatı altına kurmak iyi olur.'],
 ['placed_bed','Hasır Yatak üret (tezgâhta), çatı altına koy ve gece E ile uyu: Uyku Tulumundan daha dinlendiricidir.'],
 ['placed_crate','Depo Sandığı üret ve yerleştir. E ile açılır; eşyalarını düzenle. Yatak koyarsan doğma noktan olur.'],
 ['placed_sign','Tabela üret, yerleştir ve E ile üzerine yol bilgisi yaz.'],
 ['wildhive','Ormanda ağaçlardaki yabani arı kovanını bul; elde meşale varken E ile bal ve balmumu topla.'],
 ['placed_apiary','Balmumuyla Arı Kovanı üret ve çalılık bir yere kur; bal ve balmumu üretir.'],
 ['placed_ftrap','Balık Kapanı üret ve su kenarındaki kuma kur; zamanla balık yakalar.'],
 ['made_shovel','Kürek üret. Kuma veya toprağa bakıp E ile kazarak hazine ara.'],
 ['treasure','Hazine Haritası (Gezgin Tüccar veya köylü söylentisi) ile gömülü bir hazine bul. Kürek eldeyken toprak ısındıkça yaklaşırsın.'],
 ['made_shield','Kalkan üret. Elde tutup sağ tıkı basılı tutarak siper al; önden gelen darbeyi azaltır.'],
 ['pet','Gezgin Tüccardan Köpek Yavrusu al. Köpek seni takip eder ve saldırganlara karşı korur.'],
 ['bear','Bir ayıyı alt et (Demir Kılıç veya yay ile). Kürkünden Kürk Palto üretilir; kışın soğuğa karşı en iyi giysidir.']
];
function goalText(){
 let done=0;for(const g of GOALS)if(G.flags[g[0]])done++;
 const g=GOALS.find(x=>!G.flags[x[0]]);
 return g?`<b>Hedef ${done+1}/${GOALS.length}:</b> ${g[1]}`:'Tüm hedefler tamamlandı. Hayatta kalmaya devam et.';
}
HG.GOALS=GOALS;HG.goalText=goalText;
})();
