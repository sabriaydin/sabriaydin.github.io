/* Harici bağlantı yönlendirme sayfası: uyarı, açık adres ve 10 saniyelik geri sayım */
(function(){
  var box=document.getElementById('rd');if(!box)return;
  var SURE=10,raw=(new URLSearchParams(location.search)).get('u')||'',u=null;
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  try{u=new URL(raw)}catch(e){}
  if(!u||!/^https?:$/.test(u.protocol)){
    box.innerHTML='<h1>Geçersiz bağlantı</h1><p class="rd-sub rd-err">Yönlendirilecek adres bulunamadı veya güvenli bir web adresi değil.</p><div class="rd-act"><a class="rd-b pri" href="index.html">Ana sayfaya dön</a></div>';
    document.title='Geçersiz bağlantı | Sabri Aydın';return;
  }
  var href=u.href,host=u.hostname,C=2*Math.PI*30,left=SURE,timer=null;
  box.innerHTML=
    '<h1>Harici bir siteye gidiyorsunuz</h1>'+
    '<p class="rd-sub">Bu bağlantı <b>Sabri Aydın</b> sitesinin dışındaki <span class="rd-host">'+esc(host)+'</span> adresine açılacaktır.</p>'+
    '<h2>Gidilecek adres</h2><span class="rd-url" id="rd-url">'+esc(href)+'</span>'+
    '<h2>Devam etmeden önce</h2><ul>'+
      '<li>Gideceğiniz sitenin içeriğinden ve gizlilik uygulamalarından bu site sorumlu değildir.</li>'+
      '<li>Adresin yukarıdaki alan adıyla (<b>'+esc(host)+'</b>) aynı olduğunu ve beklediğiniz resmî site olduğunu kontrol edin.</li>'+
      '<li>İndirme yapıyorsanız yalnızca resmî sayfadan indirin; mümkünse dosyanın sağlama (checksum) değerini doğrulayın.</li>'+
      '<li>Bilinmeyen sitelerde parola, kart veya kişisel bilgi girmeyin.</li>'+
    '</ul>'+
    '<div class="rd-count"><div class="rd-ring" aria-hidden="true"><svg viewBox="0 0 68 68"><circle class="bg" cx="34" cy="34" r="30"/><circle class="fg" id="rd-fg" cx="34" cy="34" r="30" stroke-dasharray="'+C+'" stroke-dashoffset="0"/></svg><b id="rd-n">'+SURE+'</b></div>'+
    '<p class="rd-msg" id="rd-msg"><span id="rd-t">'+SURE+'</span> saniye içinde otomatik olarak yönlendirileceksiniz.</p></div>'+
    '<div class="rd-act"><a class="rd-b pri" id="rd-go" href="'+esc(href)+'" rel="noopener noreferrer nofollow">Şimdi git</a>'+
    '<button type="button" class="rd-b" id="rd-stop">Yönlendirmeyi durdur</button>'+
    '<button type="button" class="rd-b" id="rd-copy">Adresi kopyala</button>'+
    '<button type="button" class="rd-b" id="rd-back">Geri dön</button></div>';
  document.title='Yönlendiriliyor: '+host+' | Sabri Aydın';
  var n=document.getElementById('rd-n'),t=document.getElementById('rd-t'),fg=document.getElementById('rd-fg'),msg=document.getElementById('rd-msg'),stop=document.getElementById('rd-stop');
  function draw(){n.textContent=left;t.textContent=left;fg.style.strokeDashoffset=String(C*(1-left/SURE))}
  function go(){location.href=href}
  function tick(){left--;if(left<=0){left=0;draw();clearInterval(timer);go();return}draw()}
  function start(){left=SURE;draw();clearInterval(timer);timer=setInterval(tick,1000);stop.textContent='Yönlendirmeyi durdur'}
  stop.onclick=function(){
    if(timer){clearInterval(timer);timer=null;msg.textContent='Otomatik yönlendirme durduruldu. Devam etmek için “Şimdi git” düğmesini kullanın.';stop.textContent='Geri sayımı yeniden başlat'}
    else{msg.innerHTML='<span id="rd-t">'+SURE+'</span> saniye içinde otomatik olarak yönlendirileceksiniz.';t=document.getElementById('rd-t');start()}
  };
  document.getElementById('rd-copy').onclick=function(e){
    var b=e.currentTarget;function ok(){b.textContent='Kopyalandı';setTimeout(function(){b.textContent='Adresi kopyala'},1800)}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(href).then(ok,function(){})}
    else{var r=document.createRange();r.selectNodeContents(document.getElementById('rd-url'));var s=getSelection();s.removeAllRanges();s.addRange(r)}
  };
  document.getElementById('rd-back').onclick=function(){
    if(history.length>1)history.back();else location.href='index.html'
  };
  start();
})();
