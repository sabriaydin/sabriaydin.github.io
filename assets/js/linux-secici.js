/* Linux işletim sistemleri kategorisi: "Sana uygun Linux'u bul" filtreleme widget'ı.
   Veriler aşağıdaki LDB tablosundadır; yeni dağıtım yazısı eklendiğinde buraya da bir satır eklenir (eklenmezse yazı filtre açıkken görünmez).
   z: zorluk 1-5 | amac: gunluk, oyun, gelistirme, sunucu, guvenlik, eski | mas: masaüstü | yayin: sabit, rolling | taban: debian (Debian/Ubuntu), arch, fedora (Fedora/RHEL), bagimsiz */
(function(){
var LDB={
'linux-02-ubuntu':{z:1,amac:['gunluk','gelistirme','sunucu'],mas:['gnome'],yayin:['sabit'],taban:'debian'},
'linux-03-linux-mint':{z:1,amac:['gunluk','eski'],mas:['cinnamon','mate','xfce'],yayin:['sabit'],taban:'debian'},
'linux-04-debian':{z:3,amac:['sunucu','gelistirme','gunluk'],mas:['gnome'],yayin:['sabit'],taban:'debian'},
'linux-05-fedora-workstation':{z:2,amac:['gelistirme','gunluk'],mas:['gnome'],yayin:['sabit'],taban:'fedora'},
'linux-06-arch-linux':{z:5,amac:['gunluk','gelistirme','oyun'],mas:['gnome','kde','xfce','cinnamon','mate'],yayin:['rolling'],taban:'arch'},
'linux-07-opensuse':{z:3,amac:['gelistirme','gunluk','sunucu'],mas:['kde','gnome','xfce'],yayin:['sabit','rolling'],taban:'bagimsiz'},
'linux-08-pop-os':{z:2,amac:['oyun','gelistirme','gunluk'],mas:['diger'],yayin:['sabit'],taban:'debian'},
'linux-09-manjaro':{z:3,amac:['gunluk','oyun'],mas:['kde','gnome','xfce'],yayin:['rolling'],taban:'arch'},
'linux-10-kali-linux':{z:3,amac:['guvenlik'],mas:['xfce','kde','gnome'],yayin:['rolling'],taban:'debian'},
'linux-11-zorin-os':{z:1,amac:['gunluk'],mas:['gnome'],yayin:['sabit'],taban:'debian'},
'linux-12-mx-linux':{z:2,amac:['gunluk','eski'],mas:['xfce','kde'],yayin:['sabit'],taban:'debian'},
'linux-13-elementary-os':{z:1,amac:['gunluk'],mas:['diger'],yayin:['sabit'],taban:'debian'},
'linux-14-endeavouros':{z:4,amac:['gunluk','gelistirme','oyun'],mas:['kde','gnome','xfce','cinnamon','mate'],yayin:['rolling'],taban:'arch'},
'linux-15-linux-lite':{z:1,amac:['gunluk','eski'],mas:['xfce'],yayin:['sabit'],taban:'debian'},
'linux-16-rocky-linux':{z:3,amac:['sunucu'],mas:['gnome'],yayin:['sabit'],taban:'fedora'},
'linux-17-almalinux':{z:3,amac:['sunucu'],mas:['gnome'],yayin:['sabit'],taban:'fedora'},
'linux-18-centos-stream':{z:3,amac:['sunucu','gelistirme'],mas:['gnome'],yayin:['rolling'],taban:'fedora'},
'linux-19-kubuntu':{z:1,amac:['gunluk'],mas:['kde'],yayin:['sabit'],taban:'debian'},
'linux-20-xubuntu':{z:1,amac:['gunluk','eski'],mas:['xfce'],yayin:['sabit'],taban:'debian'},
'linux-21-lubuntu':{z:1,amac:['eski','gunluk'],mas:['diger'],yayin:['sabit'],taban:'debian'},
'linux-22-ubuntu-mate':{z:1,amac:['gunluk','eski'],mas:['mate'],yayin:['sabit'],taban:'debian'},
'linux-23-nobara':{z:2,amac:['oyun','gunluk'],mas:['kde','gnome'],yayin:['sabit'],taban:'fedora'},
'linux-24-garuda-linux':{z:3,amac:['oyun','gunluk'],mas:['kde','diger'],yayin:['rolling'],taban:'arch'},
'linux-25-tails':{z:2,amac:['guvenlik'],mas:['gnome'],yayin:['sabit'],taban:'debian'},
'linux-26-alpine-linux':{z:5,amac:['sunucu'],mas:[],yayin:['sabit'],taban:'bagimsiz'},
'linux-27-nixos':{z:5,amac:['gelistirme','sunucu','gunluk'],mas:['gnome','kde','xfce','cinnamon','mate'],yayin:['sabit','rolling'],taban:'bagimsiz'},
'linux-28-void-linux':{z:5,amac:['gunluk','eski'],mas:['xfce','kde','gnome','mate','cinnamon'],yayin:['rolling'],taban:'bagimsiz'},
'linux-29-gentoo':{z:5,amac:['gelistirme','gunluk'],mas:['gnome','kde','xfce','mate','cinnamon'],yayin:['rolling'],taban:'bagimsiz'},
'linux-30-bazzite':{z:2,amac:['oyun','gunluk'],mas:['kde','gnome'],yayin:['rolling'],taban:'fedora'}
};
var T={exp:{1:'Yeni başlıyorum',2:'Biraz biliyorum',3:'İleri düzeyim'},
amac:{gunluk:'Günlük kullanım',oyun:'Oyun',gelistirme:'Yazılım geliştirme',sunucu:'Sunucu',guvenlik:'Gizlilik ve güvenlik',eski:'Eski bilgisayar'},
mas:{gnome:'GNOME',kde:'KDE Plasma',xfce:'Xfce',cinnamon:'Cinnamon',mate:'MATE'},
yayin:{sabit:'Kararlı (sabit sürüm)',rolling:'En yeni yazılım (sürekli güncel)'},
taban:{debian:'Debian / Ubuntu',arch:'Arch',fedora:'Fedora / RHEL',bagimsiz:'Bağımsız'}};
var MAXZ={1:2,2:3,3:5};
var st={exp:'',amac:[],mas:'',yayin:'',taban:''};
try{var sv=JSON.parse(sessionStorage.getItem('lxw')||'null');if(sv&&typeof sv==='object')for(var k in st)if(k in sv)st[k]=sv[k]}catch(e){}
function save(){try{sessionStorage.setItem('lxw',JSON.stringify(st))}catch(e){}}
function on(){return !!(st.exp||st.amac.length||st.mas||st.yayin||st.taban)}
/* Bir dağıtımı değerlendir: elenirse null, geçerse {s: puan, why: [nedenler]} */
function evalD(id){
  var d=LDB[id];if(!d)return null;var why=[],s=0;
  if(st.exp){if(d.z>MAXZ[st.exp])return null;s+=(6-d.z)}
  if(st.mas){if(d.mas.indexOf(st.mas)<0)return null;why.push(T.mas[st.mas]);s+=3}
  if(st.yayin){if(d.yayin.indexOf(st.yayin)<0)return null;why.push(st.yayin==='sabit'?'Kararlı sürüm':'Sürekli güncel');s+=3}
  if(st.taban){if(d.taban!==st.taban)return null;why.push(T.taban[st.taban]+' tabanlı');s+=3}
  if(st.amac.length){var m=st.amac.filter(function(a){return d.amac.indexOf(a)>-1});if(!m.length)return null;
    m.forEach(function(a){why.push(T.amac[a]);s+=5+(d.amac.indexOf(a)===0?2:0)})}
  if(st.exp)why.unshift('Zorluk: '+['Çok kolay','Kolay','Orta','Zor','Uzman'][d.z-1]);
  return{s:s,why:why,z:d.z}
}
window.LXF={active:false,pass:function(p){if(!this.active)return true;return !!evalD(p.id)}};
function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function chip(type,name,val,label,checked){return '<label class="lxw-c"><input type="'+type+'" name="'+name+'" value="'+val+'"'+(checked?' checked':'')+'><span>'+label+'</span></label>'}
function html(){
  var h='<div class="lxw-h"><span class="lxw-pr">$</span> <b>Sana uygun Linux’u bul</b><button type="button" class="lxw-x" id="lxw-x" aria-label="Kapat">×</button><small>Birkaç soruyu yanıtla; liste ve öneriler anında güncellenir.</small></div>'+'<div class="lxw-res" id="lxw-res" aria-live="polite"></div><form class="lxw-f" id="lxw-f" onsubmit="return false">';
  h+='<fieldset><legend>1. Linux deneyimin</legend><div class="lxw-cs">'+[1,2,3].map(function(v){return chip('radio','exp',v,T.exp[v],String(st.exp)===String(v))}).join('')+'</div></fieldset>';
  h+='<fieldset><legend>2. Ne için kullanacaksın? <i>(birden fazla seçilebilir)</i></legend><div class="lxw-cs">'+Object.keys(T.amac).map(function(v){return chip('checkbox','amac',v,T.amac[v],st.amac.indexOf(v)>-1)}).join('')+'</div></fieldset>';
  h+='<fieldset><legend>3. Masaüstü görünümü</legend><div class="lxw-cs">'+chip('radio','mas','','Fark etmez',!st.mas)+Object.keys(T.mas).map(function(v){return chip('radio','mas',v,T.mas[v],st.mas===v)}).join('')+'</div></fieldset>';
  h+='<fieldset><legend>4. Güncellik</legend><div class="lxw-cs">'+chip('radio','yayin','','Fark etmez',!st.yayin)+Object.keys(T.yayin).map(function(v){return chip('radio','yayin',v,T.yayin[v],st.yayin===v)}).join('')+'</div></fieldset>';
  h+='<fieldset><legend>5. Taban <i>(biliyorsan)</i></legend><div class="lxw-cs">'+chip('radio','taban','','Fark etmez',!st.taban)+Object.keys(T.taban).map(function(v){return chip('radio','taban',v,T.taban[v],st.taban===v)}).join('')+'</div></fieldset>';
  h+='<div class="lxw-act"><button type="button" id="lxw-clr">Seçimleri temizle</button></div></form>';
  return h
}
function href(id){return (document.body.dataset.root||'')+'posts/'+id+'.html'}
function results(){
  var res=document.getElementById('lxw-res');if(!res)return;
  var P=(window.POSTS||[]).filter(function(p){return p.cat==='linuxos'});
  if(!on()){res.innerHTML='<p class="lxw-n">Hiç ölçüt seçilmedi: tüm Linux yazıları listeleniyor. Listeyi daraltmak için aşağıdan seçim yap.</p>';return}
  var r=P.map(function(p){var e=evalD(p.id);return e?{p:p,e:e}:null}).filter(Boolean).sort(function(a,b){return b.e.s-a.e.s||a.e.z-b.e.z});
  if(!r.length){res.innerHTML='<p class="lxw-n lxw-no">Bu ölçütlere uyan dağıtım bulunamadı. Bazı seçimleri “Fark etmez” yaparak tekrar dene.</p>';return}
  res.innerHTML='<h3>'+r.length+' dağıtım uygun</h3><ol class="lxw-top">'+r.slice(0,3).map(function(x,i){return '<li><a href="'+href(x.p.id)+'"><span class="lxw-rk">'+(i+1)+'</span><span><b>'+esc(x.p.title)+'</b><small>'+x.e.why.map(esc).join(' · ')+'</small></span></a></li>'}).join('')+'</ol>'+(r.length>3?'<p class="lxw-n">Diğer uygun dağıtımlar soldaki listede.</p>':'')
}
function read(){
  var f=document.getElementById('lxw-f');if(!f)return;
  var g=function(n){var e=f.querySelector('input[name='+n+']:checked');return e?e.value:''};
  st.exp=g('exp');st.mas=g('mas');st.yayin=g('yayin');st.taban=g('taban');
  st.amac=[].slice.call(f.querySelectorAll('input[name=amac]:checked')).map(function(i){return i.value});
  save()
}
function update(){LXF.active=on();results();if(window.lxRedraw)window.lxRedraw()}
window.lxMount=function(cat,grp){
  var want=cat==='linuxos'||(!cat&&grp==='linux'),ex=document.getElementById('lxw');
  if(!want){if(ex){ex.remove();var t0=document.getElementById('lxw-tab');if(t0)t0.remove();document.body.classList.remove('lxw-open')}LXF.active=false;return}
  if(ex){LXF.active=on();return}
  var a=document.createElement('aside');a.id='lxw';a.className='lxw';a.setAttribute('aria-label','Linux seçici');a.innerHTML=html();document.body.appendChild(a);
  var tab=document.createElement('button');tab.type='button';tab.id='lxw-tab';tab.className='lxw-tab';tab.setAttribute('aria-controls','lxw');tab.innerHTML='<span class="lxw-pr">$</span> Linux seçici';document.body.appendChild(tab);
  var WIDE=window.matchMedia('(min-width:1760px)');
  function setOpen(v){document.body.classList.toggle('lxw-open',v);tab.setAttribute('aria-expanded',v);try{sessionStorage.setItem('lxw-open',v?'1':'0')}catch(e){}}
  var so=null;try{so=sessionStorage.getItem('lxw-open')}catch(e){}
  setOpen(so===null?WIDE.matches:so==='1');
  tab.addEventListener('click',function(){setOpen(true)});
  a.querySelector('#lxw-x').addEventListener('click',function(){setOpen(false);tab.focus()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('lxw-open')&&!WIDE.matches&&document.getElementById('lxw'))setOpen(false)});
  document.addEventListener('mousedown',function(e){if(!WIDE.matches&&document.body.classList.contains('lxw-open')&&document.getElementById('lxw')&&!e.target.closest('#lxw,#lxw-tab'))setOpen(false)});
  var f=a.querySelector('#lxw-f');
  f.addEventListener('change',function(){read();update()});
  a.querySelector('#lxw-clr').addEventListener('click',function(){f.querySelectorAll('input').forEach(function(i){i.checked=(i.type==='radio'&&i.value==='')});st={exp:'',amac:[],mas:'',yayin:'',taban:''};save();update()});
  LXF.active=on();results()
};
})();
