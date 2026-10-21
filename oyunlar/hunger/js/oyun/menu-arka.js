/* Hunger 3D - ana menü arka planı (güncelleme 49).
   Ana menüde 3B dünya artık çizilmez (js/oyun/dongu.js); yerine oyunu anımsatan hafif bir 2B manzara çizilir:
   gün batımında ada silüeti, deniz, çam ve palmiye gölgeleri, kıyıdaki kamp ateşi ve ağaçların arasında
   ara sıra beliren Gölge gözleri.
   Başarım: sabit katmanlar (gökyüzü, yıldızlar, dağlar, ağaçlar, ön plan) bir kez ara tuvale çizilir;
   her karede yalnızca hareketli parçalar (deniz parıltısı, bulutlar, ateş, gözler, kuşlar) yenilenir.
   Çizim saniyede en çok 30 kare yapılır ve tuval yarı çözünürlükte tutulur.
   Ayarlar › Grafik › "Menü arka plan efekti" kapalıyken manzara tek kare olarak donar. */
(()=>{
'use strict';
const $=HG.$;
const cv=$('#mbg'),menu=$('#menu');
if(!cv||!menu||!cv.getContext)return;
const g=cv.getContext('2d');
const SCALE=.55;                      /* tuval çözünürlüğü: silüetler için yeterli, maliyeti düşük */
const FPS=30;

let w=0,h=0,W=0,H=0,sky=null,run=false,lastT=0,lastDraw=0,still=false;
const T0=performance.now();
let sea=0,shore=0,sunX=0,sunY=0,clouds=[],stars=[],birds=null,eyes=null,fireX=0,fireY=0;

/* tohumlu rastgele: manzara her açılışta aynı kalır */
let seed=0;
const sr=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const rr=(a,b)=>a+sr()*(b-a);

/* ---- silüet parçaları ---- */
function pine(c,x,y,hh,ww){
 c.beginPath();c.moveTo(x,y-hh);
 c.lineTo(x+ww*.42,y-hh*.56);c.lineTo(x+ww*.2,y-hh*.56);
 c.lineTo(x+ww*.72,y-hh*.22);c.lineTo(x+ww*.3,y-hh*.22);
 c.lineTo(x+ww,y);c.lineTo(x-ww,y);
 c.lineTo(x-ww*.3,y-hh*.22);c.lineTo(x-ww*.72,y-hh*.22);
 c.lineTo(x-ww*.2,y-hh*.56);c.lineTo(x-ww*.42,y-hh*.56);
 c.closePath();c.fill();
}
function palm(c,x,y,hh,col){
 c.strokeStyle=col;c.lineCap='round';
 c.lineWidth=Math.max(1.4,hh*.05);
 const tx=x+hh*.24,ty=y-hh;
 c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+hh*.08,y-hh*.56,tx,ty);c.stroke();
 c.lineWidth=Math.max(1.2,hh*.035);
 for(let i=0;i<7;i++){
  const a=-2.95+i*.5,cx=tx+Math.cos(a)*hh*.3,cy=ty+Math.sin(a)*hh*.3;
  c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(cx,cy,tx+Math.cos(a)*hh*.52,ty+Math.sin(a)*hh*.52+hh*.14);c.stroke();
 }
}
/* dağ sırtı: üç sinüsün toplamı (yumuşak ve tekrarsız) */
function ridgePath(c,base,amp,ph,k){
 c.beginPath();c.moveTo(0,H);
 for(let x=0;x<=W;x+=Math.max(2,W/180)){
  const u=x/W*k;
  const n=.45*Math.sin(u*2.1+ph)+.33*Math.sin(u*4.7+ph*1.7)+.22*Math.sin(u*9.3+ph*2.6);
  c.lineTo(x,base-amp*(.55+.45*n));
 }
 c.lineTo(W,H);c.closePath();
}
function ridgeY(x,base,amp,ph,k){
 const u=x/W*k,n=.45*Math.sin(u*2.1+ph)+.33*Math.sin(u*4.7+ph*1.7)+.22*Math.sin(u*9.3+ph*2.6);
 return base-amp*(.55+.45*n);
}

/* ---- sabit katmanlar: bir kez çizilir ---- */
function build(){
 seed=20260821;
 W=cv.width=Math.max(320,Math.round(w*SCALE));H=cv.height=Math.max(220,Math.round(h*SCALE));
 sea=Math.round(H*.60);shore=Math.round(H*.74);
 sunX=Math.round(W*.68);sunY=sea-Math.round(H*.015);   /* dağ sırtı kurulduktan sonra düzeltilir */
 fireX=Math.round(W*.56);fireY=Math.round(H*.845);
 sky=document.createElement('canvas');sky.width=W;sky.height=H;
 const c=sky.getContext('2d');

 /* gökyüzü: tepede gece mavisi, ufukta gün batımı */
 const sg=c.createLinearGradient(0,0,0,sea);
 sg.addColorStop(0,'#070a14');sg.addColorStop(.35,'#1a1b2e');sg.addColorStop(.68,'#4a2a38');
 sg.addColorStop(.88,'#8d4330');sg.addColorStop(1,'#c9763f');
 c.fillStyle=sg;c.fillRect(0,0,W,sea);

 /* yıldızlar (üst yarıda, ufka doğru seyrelir) */
 stars.length=0;
 const sn=Math.round(W*H/5200);
 for(let i=0;i<sn;i++){
  const x=sr()*W,y=sr()*sea*.72,a=(1-y/(sea*.72))*rr(.25,.9);
  c.fillStyle='rgba(226,232,245,'+a.toFixed(2)+')';
  const r=sr()<.12?1.6:1;c.fillRect(x,y,r,r);
  if(i<14)stars.push({x,y,a});                      /* birkaçı titreşir */
 }

 /* güneş, dağların en alçaldığı yere konur: sırtın arkasından görünür */
 {
  let bx=W*.68,by=-1;
  for(let x=W*.44;x<W*.96;x+=W*.008){const y=ridgeY(x,sea+1,H*.17,1.4,5.5);if(y>by){by=y;bx=x}}
  sunX=Math.round(bx);sunY=Math.round(Math.min(sea-H*.012,by-H*.016));
 }

 /* güneş ve parıltısı */
 const gl=c.createRadialGradient(sunX,sunY,0,sunX,sunY,H*.42);
 gl.addColorStop(0,'rgba(255,186,110,.55)');gl.addColorStop(.35,'rgba(226,120,62,.22)');gl.addColorStop(1,'rgba(226,120,62,0)');
 c.fillStyle=gl;c.beginPath();c.arc(sunX,sunY,H*.42,0,6.2832);c.fill();
 c.fillStyle='#ffc078';c.beginPath();c.arc(sunX,sunY,H*.052,0,6.2832);c.fill();

 /* deniz */
 const wg=c.createLinearGradient(0,sea,0,shore+H*.1);
 wg.addColorStop(0,'#7e4531');wg.addColorStop(.12,'#3a2f38');wg.addColorStop(.45,'#1b1d28');wg.addColorStop(1,'#0b0e15');
 c.fillStyle=wg;c.fillRect(0,sea,W,H-sea);

 /* uzak ada: sırt + tepesinde küçük çamlar */
 c.fillStyle='#121725';ridgePath(c,sea+1,H*.17,1.4,5.5);c.fill();
 c.fillStyle='#0e1320';
 for(let i=0;i<46;i++){
  const x=rr(0,W),y=ridgeY(x,sea+1,H*.17,1.4,5.5)+1;
  if(y>sea)continue;
  pine(c,x,y,rr(H*.016,H*.032),rr(H*.006,H*.011));
 }
 /* ikinci sırt: biraz daha yakın ve koyu */
 c.fillStyle='#0a0d15';ridgePath(c,sea+H*.03,H*.10,3.9,7.2);c.fill();
 /* ufuk pusu: katmanları birbirinden ayıran ince sıcak bant */
 const hz=c.createLinearGradient(0,sea-H*.05,0,sea+H*.02);
 hz.addColorStop(0,'rgba(220,140,90,0)');hz.addColorStop(.7,'rgba(220,140,90,.16)');hz.addColorStop(1,'rgba(220,140,90,0)');
 c.fillStyle=hz;c.fillRect(0,sea-H*.05,W,H*.07);

 /* güneşin denizdeki ışık yolu: kenarları yumuşayan yatay şeritler (sabit katman) */
 {
  const n=Math.round((shore-sea)/Math.max(2,H*.009)),hh=Math.ceil((shore-sea)/n)+1;
  for(let i=0;i<n;i++){
   const p=i/n,y=sea+p*(shore-sea),sp=W*(.028+p*.26),a=(1-p)*(1-p)*.34;
   const lg=c.createLinearGradient(sunX-sp,0,sunX+sp,0);
   lg.addColorStop(0,'rgba(255,170,96,0)');lg.addColorStop(.5,'rgba(255,170,96,'+a.toFixed(3)+')');lg.addColorStop(1,'rgba(255,170,96,0)');
   c.fillStyle=lg;c.fillRect(sunX-sp,y,sp*2,hh);
  }
 }

 /* kıyı şeridi ve kumsal */
 c.fillStyle='#171621';c.fillRect(0,shore-H*.012,W,H*.02);
 const bg=c.createLinearGradient(0,shore,0,H);
 bg.addColorStop(0,'#1a1620');bg.addColorStop(1,'#07080c');
 c.fillStyle=bg;c.fillRect(0,shore,W,H-shore);

 /* orta plan: ağaç hattı (çam ve palmiye karışık) */
 c.fillStyle='#0a0c12';c.strokeStyle='#0a0c12';
 for(let i=0;i<30;i++){
  const x=rr(-W*.02,W*1.02),y=shore+rr(H*.005,H*.05),s=rr(H*.05,H*.095);
  if(sr()<.32)palm(c,x,y,s*1.15,'#0a0c12');else pine(c,x,y,s,s*.33);
 }
 /* ön plan tepesi */
 c.fillStyle='#05070a';
 c.beginPath();c.moveTo(0,H);
 for(let x=0;x<=W;x+=Math.max(2,W/120)){
  const u=x/W;c.lineTo(x,H-H*.07-H*.045*(.5+.5*Math.sin(u*7.3+1.2))*(.6+.4*Math.sin(u*17.1)));
 }
 c.lineTo(W,H);c.closePath();c.fill();
 /* ön planda çim tutamları */
 c.strokeStyle='#05070a';c.lineWidth=Math.max(1,H*.0022);c.lineCap='round';
 for(let i=0;i<120;i++){
  const x=rr(0,W),y=H-rr(0,H*.085),hh=rr(H*.012,H*.032),bend=rr(-H*.012,H*.012);
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+bend*.5,y-hh*.6,x+bend,y-hh);c.stroke();
 }
 /* kıyıdaki kamp ateşinin odunları */
 c.strokeStyle='#120d0a';c.lineWidth=Math.max(1.6,H*.006);
 for(const a of [-.5,.5,0]){
  c.beginPath();c.moveTo(fireX-Math.cos(a)*H*.022,fireY-Math.sin(a)*H*.01);
  c.lineTo(fireX+Math.cos(a)*H*.022,fireY+Math.sin(a)*H*.01);c.stroke();
 }

 /* hareketli öğelerin başlangıç durumu */
 clouds=[];
 for(let i=0;i<5;i++)clouds.push({x:sr(),y:rr(.18,.5),s:rr(.18,.42),v:rr(.004,.011),a:rr(.1,.26)});
 birds=null;eyes=null;
}

/* ---- hareketli katman ---- */
function draw(now){
 const t=(now-lastT)*.001;
 g.setTransform(1,0,0,1,0,0);
 g.drawImage(sky,0,0);

 /* bulutlar: ufka yakın uzun şeritler */
 for(const cl of clouds){
  if(!still)cl.x+=cl.v*t*.08;
  if(cl.x>1.35)cl.x=-.35;
  const x=cl.x*W,y=cl.y*sea,ww=cl.s*W,hh=ww*.085;
  const gr=g.createLinearGradient(x-ww/2,0,x+ww/2,0);
  gr.addColorStop(0,'rgba(70,60,80,0)');gr.addColorStop(.5,'rgba(120,96,104,'+cl.a+')');gr.addColorStop(1,'rgba(70,60,80,0)');
  g.fillStyle=gr;g.beginPath();g.ellipse(x,y,ww/2,hh,0,0,6.2832);g.fill();
 }

 const tm=still?8.4:(now-T0)*.001;      /* efekt kapalıyken zaman durur: manzara tek kare olarak kalır */

 /* yıldız titreşimi */
 for(const s of stars){
  const a=s.a*(.55+.45*Math.sin(tm*1.7+s.x*.07));
  g.fillStyle='rgba(226,232,245,'+a.toFixed(2)+')';g.fillRect(s.x,s.y,1.4,1.4);
 }

 /* denizde kırışık çizgileri: sabit ışık yolunun üzerinde yavaşça kayar */
 g.save();
 g.beginPath();g.rect(0,sea,W,shore-sea);g.clip();
 g.globalCompositeOperation='lighter';
 const rows=Math.round((shore-sea)/Math.max(3,H*.016));
 for(let i=0;i<rows;i++){
  const p=i/rows,y=sea+p*(shore-sea)+H*.004;
  const j=Math.sin(i*12.9898)*43758.5453,q=j-Math.floor(j);          /* satır başına sabit rastgelelik */
  const spread=W*(.03+p*.22)*(.45+.55*q);
  const off=Math.sin(tm*.7+i*1.9)*W*.01*(.3+p);
  const a=(1-p*.85)*.12*(.4+.6*Math.sin(tm*1.3+i*2.1));
  if(a<=.012)continue;
  g.fillStyle='rgba(255,186,120,'+a.toFixed(3)+')';
  g.beginPath();g.ellipse(sunX+off,y,spread/2,Math.max(.8,H*.0032),0,0,6.2832);g.fill();
 }
 g.restore();

 /* kuşlar: ara sıra uzakta geçen küçük sürü */
 if(!still){
  if(!birds&&Math.random()<.0022)birds={x:-.08,y:rr(.16,.34),v:rr(.035,.06),n:3+((Math.random()*3)|0)};
  if(birds){
   birds.x+=birds.v*t;
   g.strokeStyle='rgba(20,22,30,.7)';g.lineWidth=Math.max(1,H*.002);
   for(let i=0;i<birds.n;i++){
    const x=(birds.x-i*.022)*W,y=birds.y*sea+Math.sin(tm*1.6+i)*H*.006;
    if(x<-20||x>W+20)continue;
    const s=H*.008,f=Math.sin(tm*7+i*1.4)*.5+.5;
    g.beginPath();g.moveTo(x-s,y+s*f*.6);g.lineTo(x,y-s*.2);g.lineTo(x+s,y+s*f*.6);g.stroke();
   }
   if(birds.x>1.25)birds=null;
  }
 }

 /* kamp ateşi: kıyıda titreyen alev ve sıcak ışık */
 {
  const fl=still?.85:.78+.22*Math.sin(tm*8.3)+.1*Math.sin(tm*17.7);
  const R=H*.09*fl;
  const gr=g.createRadialGradient(fireX,fireY-R*.3,0,fireX,fireY-R*.3,R*3.2);
  gr.addColorStop(0,'rgba(255,168,88,.40)');gr.addColorStop(.35,'rgba(226,104,44,.17)');gr.addColorStop(1,'rgba(190,70,28,0)');
  g.fillStyle=gr;g.beginPath();g.arc(fireX,fireY-R*.3,R*3.2,0,6.2832);g.fill();
  const fh=H*.05*fl,fw=H*.024;
  g.fillStyle='rgba(224,96,32,.92)';
  g.beginPath();g.moveTo(fireX,fireY-fh);
  g.quadraticCurveTo(fireX+fw,fireY-fh*.35,fireX+fw*.55,fireY);
  g.lineTo(fireX-fw*.55,fireY);
  g.quadraticCurveTo(fireX-fw,fireY-fh*.35,fireX,fireY-fh);
  g.fill();
  g.fillStyle='rgba(255,164,56,.95)';
  g.beginPath();g.moveTo(fireX,fireY-fh*.72);
  g.quadraticCurveTo(fireX+fw*.52,fireY-fh*.26,fireX+fw*.3,fireY);
  g.lineTo(fireX-fw*.3,fireY);
  g.quadraticCurveTo(fireX-fw*.52,fireY-fh*.26,fireX,fireY-fh*.72);
  g.fill();
  g.fillStyle='rgba(255,226,150,.9)';
  g.beginPath();g.ellipse(fireX,fireY-fh*.18,fw*.22,fh*.2,0,0,6.2832);g.fill();
 }

 /* Gölge: ağaçların arasında ara sıra beliren iki göz */
 if(!still){
  if(!eyes&&Math.random()<.0016)eyes={x:rr(.5,.94),y:rr(.78,.86),t:0,life:rr(2.6,4.2)};
  if(eyes){
   eyes.t+=t;
   const k=Math.min(1,eyes.t/.7)*Math.min(1,Math.max(0,(eyes.life-eyes.t)/.7));
   const bl=Math.sin(eyes.t*2.1)>-.93?1:0;                 /* seyrek göz kırpma */
   const a=k*bl*.85,x=eyes.x*W,y=eyes.y*H,d=H*.012;
   if(a>.01){
    g.save();g.globalCompositeOperation='lighter';
    for(const s of [-1,1]){
     const gr=g.createRadialGradient(x+s*d,y,0,x+s*d,y,d*2.2);
     gr.addColorStop(0,'rgba(255,90,70,'+a.toFixed(2)+')');gr.addColorStop(1,'rgba(255,60,40,0)');
     g.fillStyle=gr;g.beginPath();g.arc(x+s*d,y,d*2.2,0,6.2832);g.fill();
     g.fillStyle='rgba(255,200,170,'+(a*.9).toFixed(2)+')';
     g.beginPath();g.ellipse(x+s*d,y,d*.3,d*.19,0,0,6.2832);g.fill();
    }
    g.restore();
   }
   if(eyes.t>eyes.life)eyes=null;
  }
 }
}

function frame(now){
 if(!run)return;
 if(menu.hidden){run=false;return}                        /* menü kapandı: döngü durur */
 still=HG.cfg&&HG.cfg.mfx===false;                        /* ayar kapalıyken manzara donar */
 const need=still?1000:1000/FPS;
 if(now-lastDraw>=need){
  if(cv.clientWidth!==w||cv.clientHeight!==h||!sky){w=cv.clientWidth|0;h=cv.clientHeight|0;if(w&&h)build()}
  if(sky){lastT=lastDraw||now;draw(now);lastDraw=now}
 }
 requestAnimationFrame(frame);
}
function start(){
 if(run||menu.hidden)return;
 run=true;lastDraw=0;lastT=performance.now();
 requestAnimationFrame(frame);
}
/* Menü görünür olunca çizim yeniden başlar (oyundan menüye dönüldüğünde de) */
new MutationObserver(start).observe(menu,{attributes:true,attributeFilter:['hidden']});
addEventListener('resize',()=>{sky=null});
start();
HG.menuBg={start,get on(){return run}};
})();
