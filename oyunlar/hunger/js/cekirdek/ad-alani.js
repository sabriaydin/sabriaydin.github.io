/* Hunger 3D - ortak ad alanı: sabitler ve paylaşılan durum nesneleri */
(()=>{
'use strict';
/* HG: oyunun tek global nesnesi. Tüm dosyalar buraya kayıt olur. */
window.HG={
 TS:32,W:768,H:768,DAY:1620,REACH:3.4,SLOTS:24,HOT:8,EYE:1.65,SAVE:'hunger-save-v7',
 T:{DEEP:0,SHAL:1,SAND:2,GRASS:3,ROCK:4,POND:5},
 O:{NONE:0,TREE:1,PALM:2,ROCK:3,COAL:4,COPPER:5,IRON:6,BUSH:7,BUSH0:8,PALM0:9,FIRE:10,BENCH:11,FURN:12,WALLW:13,WALLS:14,DOOR:15,VWALL:16,VDOOR:17,VDEC:18,WALLT:19,WALLM:20,DOORM:21,FENCE:22,BED:23,RACK:24,BARREL:25,TORCHP:26,SNARE:27,PLOT:28,SHROOM:29,CHEST:30,SIGN:31,APIARY:32,FTRAP:33,HIVEW:34,WINW:35,WINS:36,WINM:37,ARCHW:38,ARCHS:39,GATE:40,GATEM:41,FENCES:42,FENCEM:43},
 G:{},                                   /* oyun durumu: dünya, oyuncu, istatistikler, envanter */
 ui:{state:'menu',picked:null,dirty:true,menuClock:0,touch:false,locked:false,panelUnlock:false,mute:false},
 inp:{keys:{},joy:{x:0,y:0},mouseDown:false,touchAct:false},   /* giriş durumu */
 look:{yaw:0,pitch:0},                   /* bakış yönü (radyan) */
 A:{key:'',p:0,need:1,tick:0,hitI:-1,hitT:0,mem:{}},  /* sürmekte olan eylem (kesme, kazma...) */
 Scene:{},                               /* 3B sahne arayüzü (js/sahne/) */
 sc:{}                                   /* sahne dosyalarının ortak iç durumu */
};
HG.$=s=>document.querySelector(s);
})();
