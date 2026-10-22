/* Hunger 3D - başarım: uyarlanabilir çözünürlük ve gölge bütçesi (güncelleme 70).
   Kare süresi hedefin üstüne çıkarsa çizim çözünürlüğü kademeli düşürülür, rahatladığında geri yükseltilir.
   Gölge haritası yalnızca gerektiğinde yenilenir. Ayarlardaki Çözünürlük ölçeği üst sınırdır; bu modül
   yalnızca onun altında oynar ve kullanıcı ayarı değiştirince kendini sıfırlar. */
(()=>{
'use strict';
const S=HG.Scene,sc=HG.sc;
const MIN=.58,STEP=.055;
let scale=1,lastSet=-1,base=null,ema=16.7,warm=0,coolT=0,shT=0,shN=0;
const st=HG.perf={scale:1,ms:16.7,fps:60,drops:0,shadowHz:0};

function target(){const t=+(HG.cfg.fpsTarget||55);return t>0?1000/t:1000/55}

function apply(){
 const R=sc.R;if(!R)return;
 const cur=R.getPixelRatio();
 if(lastSet<0||Math.abs(cur-lastSet)>1e-4){base=cur;scale=1;lastSet=cur;st.scale=1;return}   /* kullanıcı ayarı değişti: taban yenilenir */
 const want=base*scale;
 if(Math.abs(want-cur)>1e-4){R.setPixelRatio(want);lastSet=want;S.resize()}
 st.scale=scale;
}

S.onFrame((G,t,dt,info)=>{
 const ms=dt*1000;
 ema+=(ms-ema)*.12;
 st.ms=ema;st.fps=Math.round(1000/Math.max(1,ema));
 /* gölge: hareketsiz sahnede her kare yeniden çizilmez */
 const sun=sc.sun;
 if(sun&&sun.shadow){
  const hz=ema>28?3:ema>20?2:1;                      /* kare süresi uzadıkça gölge daha seyrek yenilenir */
  st.shadowHz=hz;
  if(hz>1){
   if(sun.shadow.autoUpdate){sun.shadow.autoUpdate=false}
   if(++shN>=hz){shN=0;sun.shadow.needsUpdate=true}
  }else if(!sun.shadow.autoUpdate){sun.shadow.autoUpdate=true;sun.shadow.needsUpdate=false}
 }
 if(!HG.cfg.adapt||info.mode!=='play'||HG.busy){if(scale!==1){scale=1;apply()}else apply();return}
 if(warm<60){warm++;apply();return}                  /* açılıştaki ilk kareler ölçüme katılmaz */
 const tg=target();
 coolT-=dt;
 if(ema>tg*1.18&&scale>MIN&&coolT<=0){scale=Math.max(MIN,scale-STEP);coolT=.6;st.drops++;apply()}
 else if(ema<tg*.82&&scale<1&&coolT<=0){scale=Math.min(1,scale+STEP*.6);coolT=1.4;apply()}
 else apply();
});
/* Dünya yeniden kurulurken (yükleme) ölçek sıfırlanır */
HG.on&&HG.on('world',()=>{warm=0;scale=1});
})();
