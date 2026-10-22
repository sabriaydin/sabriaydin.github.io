/* Başlık: karışık harflerden çözülür */
(()=>{const el=$('#h1'),tx='Parola Defteri',ch='ABCDEF0123456789#%&@';if(rm)return;let i=0;
const iv=setInterval(()=>{el.textContent=[...tx].map((c,j)=>c===' '||j<i?c:ch[Math.random()*ch.length|0]).join('');if(i++>=tx.length){clearInterval(iv);el.textContent=tx}},70)})();

/* Kart eğimi */
document.querySelectorAll('.t').forEach(c=>{
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateZ(6px)`});
  c.addEventListener('pointerleave',()=>c.style.transform='')});

/* Bekleme süresi demosu */
(()=>{let n=0,t=null;const bt=$('#bf'),out=$('#bfo'),bar=$('#bfb');
bt.onclick=()=>{if(t)return;n++;let s=Math.min(2**n,30),k=s;bt.disabled=true;
out.textContent=`${n}. hatalı deneme: ${s} sn bekleyin`;
bar.style.transition='none';bar.style.width='100%';
requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition=`width ${s}s linear`;bar.style.width='0'}));
t=setInterval(()=>{k--;if(k>0){out.textContent=`${n}. hatalı deneme: ${k} sn kaldı`}else{clearInterval(t);t=null;bt.disabled=false;out.textContent=`Süre doldu. Bir sonraki hatada ${Math.min(2**(n+1),30)} sn beklersiniz.`}},1000)}})();

/* Şifreleme simülasyonu */
$('#pt').addEventListener('input',e=>{$('#ct').textContent=[...e.target.value].map((c,i)=>((c.charCodeAt(0)*131+i*57+7)%256).toString(16).padStart(2,'0')).join(' ')||'…'});
