/* Hunger 3D - rehber hedefleri */
(()=>{
'use strict';
const {G}=HG;
/* [bayrak, açıklama]: bayraklar envanter.js/eylem.js içinde işaretlenir (got_, made_, placed_, ...) */
const GOALS=[
 ['got_wood','Bir ağaca bak ve sol tuşu basılı tutarak odun topla.'],
 ['got_stone','Yerdeki gri kayalardan taş topla.'],
 ['made_axe1','C tuşuyla üretim panelini aç ve Taş Balta üret.'],
 ['made_pick1','Taş Kazma üret. Kömür ve bakır ancak bununla çıkarılır.'],
 ['made_torch','Meşale üret (odun ve kömür). Geceleri karanlıkta yaratıklar dolaşır; ışık onları uzak tutar.'],
 ['placed_fire','Kamp Ateşi üret ve yere bakıp yerleştir (sol tık veya F). Gece ısıtır.'],
 ['made_bow','Yay ve ok üret. Sol tuşu basılı tutup gerin, bırakınca ok atılır.'],
 ['drank','Mavi tatlı su gölüne bakıp sol tuşla su iç. Deniz suyu içilmez.'],
 ['made_bench','Çalışma Tezgâhı üret ve yerleştir.'],
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
 ['day7','7. güne kadar hayatta kal.']
];
function goalText(){
 let done=0;for(const g of GOALS)if(G.flags[g[0]])done++;
 const g=GOALS.find(x=>!G.flags[x[0]]);
 return g?`<b>Hedef ${done+1}/${GOALS.length}:</b> ${g[1]}`:'Tüm hedefler tamamlandı. Hayatta kalmaya devam et.';
}
HG.GOALS=GOALS;HG.goalText=goalText;
})();
