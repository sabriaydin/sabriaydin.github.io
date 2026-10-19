(function(){
'use strict';
var root=document.getElementById('hed');if(!root)return;
var $=function(s,r){return(r||root).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||root).querySelectorAll(s))};
var IND='  ',LS='hed-v1';
var VOID={area:1,base:1,br:1,col:1,embed:1,hr:1,img:1,input:1,link:1,meta:1,source:1,track:1,wbr:1};
var TAGS=('a abbr address article aside audio b blockquote body br button canvas caption code col div dl dt dd em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input label legend li link main meta nav ol optgroup option p pre section select small span strong style sub sup svg table tbody td template textarea tfoot th thead title tr u ul video script').split(' ').reduce(function(o,k){o[k]=1;return o},{});
/* ---------- Renklendirme ---------- */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function sp(c,s){return'<span class="'+c+'">'+esc(s)+'</span>'}
var KW={};'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while with yield async await get set'.split(' ').forEach(function(k){KW[k]=1});
var LIT={'true':1,'false':1,'null':1,'undefined':1,NaN:1,Infinity:1};
function hlJS(s){
var re=/\s+|\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?|0[xX][\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?|[A-Za-z_$][\w$]*|[\s\S]/g;
var rx=/\/(?![*\/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^\/\\\n\[])+\/[a-z]*/y;
var o='',m,prev='',pkw=false,c,t;
while((m=re.exec(s))){t=m[0];c=t.charAt(0);
if(/^\s/.test(t)){o+=t;continue}
var cls='';
if(c==='/'&&(t.charAt(1)==='/'||t.charAt(1)==='*'))cls='c';
else if(c==='"'||c==="'"||c==='`')cls='s';
else if(/^\d/.test(t))cls='n';
else if(/^[A-Za-z_$]/.test(t)){
if(KW[t])cls='k';else if(LIT[t])cls='n';else if(/^\s*\(/.test(s.substr(re.lastIndex,40)))cls='f';
pkw=(t==='return'||t==='typeof'||t==='case'||t==='in'||t==='of'||t==='delete'||t==='void');prev='a';
}else if(t==='/'&&(prev===''||pkw||/[(,=:\[!&|?{};+\-*%<>~^]/.test(prev))){
rx.lastIndex=m.index;var r=rx.exec(s);
if(r){o+=sp('s',r[0]);re.lastIndex=rx.lastIndex;prev='a';pkw=false;continue}
}
if(cls!=='k'&&!/^[A-Za-z_$]/.test(t)){pkw=false}
if(!/^[A-Za-z_$]/.test(t))prev=(cls==='s'||cls==='n')?'a':t;
o+=cls?sp(cls,t):esc(t);
}
return o}
function hlCSS(s){
var re=/\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|@[\w-]+|#[\da-fA-F]{3,8}\b|[-+]?(?:\d*\.)?\d+(?:%|[a-zA-Z]+)?|!important|[A-Za-z_-][\w-]*|[\s\S]/g;
var o='',m,t,depth=0,decl=false,prop=false;
while((m=re.exec(s))){t=m[0];var c=t.charAt(0),cls='';
if(/^\s/.test(t)){o+=t;continue}
if(c==='/'&&t.charAt(1)==='*')cls='c';
else if(c==='"'||c==="'")cls='s';
else if(c==='@'||t==='!important')cls='k';
else if(c==='#'&&t.length>1)cls=decl?'n':'t';
else if(/^[-+]?(\d|\.\d)/.test(t))cls='n';
else if(/^[A-Za-z_-]/.test(t)){
var nx=s.substr(re.lastIndex,200);
if(decl)cls=/^\(/.test(nx)?'f':'v';
else if(depth>0&&/^\s*:/.test(nx)&&!/^[^;{}]*\{/.test(nx.replace(/^\s*:/,''))){cls='p';prop=true}
else cls=/^\(/.test(nx)?'f':'t';
}else if(t==='{'){depth++;decl=false;prop=false}
else if(t==='}'){depth=Math.max(0,depth-1);decl=false;prop=false}
else if(t===';'){decl=false;prop=false}
else if(t===':'&&prop){decl=true;prop=false}
if(cls==='p'){o+=sp('p',t);continue}
o+=cls?sp(cls,t):(/[{}();:,]/.test(t)?sp('pu',t):esc(t));
}
return o}
function hlText(t){return esc(t).replace(/&amp;([#\w]+;)/g,'<span class="e">&amp;$1</span>')}
function hlHTML(s){
var o='',i=0,n=s.length,tagRe=/<\/?[A-Za-z][^\s\/>]*/y,at=/\s+|[^\s=>\/"']+|=|"[^"]*"?|'[^']*'?|\/?>|\//y;
while(i<n){
if(s.charAt(i)!=='<'){var j=s.indexOf('<',i);if(j<0)j=n;o+=hlText(s.slice(i,j));i=j;continue}
if(s.substr(i,4)==='<!--'){var j2=s.indexOf('-->',i+4);j2=j2<0?n:j2+3;o+=sp('c',s.slice(i,j2));i=j2;continue}
if(s.charAt(i+1)==='!'){var j3=s.indexOf('>',i);j3=j3<0?n:j3+1;o+=sp('k',s.slice(i,j3));i=j3;continue}
tagRe.lastIndex=i;var m=tagRe.exec(s);
if(!m){o+=esc('<');i++;continue}
var close=m[0].charAt(1)==='/',name=m[0].replace(/^<\/?/,'');
o+=sp('pu',close?'</':'<')+sp('t',name);i+=m[0].length;
var done=false;
while(i<n){at.lastIndex=i;var a=at.exec(s);if(!a){o+=esc(s.charAt(i));i++;continue}
var t=a[0];i+=t.length;
if(/^\s/.test(t))o+=t;
else if(t==='>'||t==='/>'){o+=sp('pu',t);done=true;break}
else if(t==='='||t==='/')o+=sp('pu',t);
else if(t.charAt(0)==='"'||t.charAt(0)==="'")o+=sp('s',t);
else o+=sp('a',t);
}
var ln=name.toLowerCase();
if(done&&!close&&(ln==='style'||ln==='script')){
var rest=s.slice(i),k=rest.search(new RegExp('</'+ln+'\\b','i'));
var e=k<0?n:i+k;
o+=ln==='style'?hlCSS(s.slice(i,e)):hlJS(s.slice(i,e));i=e;
}
}
return o}
var HL={html:hlHTML,css:hlCSS,js:hlJS};
/* ---------- Emmet (kısaltılmış) ---------- */
function emmetParse(t){
var m=/^[a-zA-Z][a-zA-Z0-9-]*/.exec(t),tag=m?m[0]:'',rest=t.slice(tag.length),mods='',attr='',text=null,n=1,x;
while(rest){
if((x=/^[.#][\w$-]+/.exec(rest)))mods+=x[0];
else if((x=/^\[[^\]]*\]/.exec(rest)))attr+=(attr?' ':'')+x[0].slice(1,-1);
else if((x=/^\{[^}]*\}/.exec(rest)))text=x[0].slice(1,-1);
else if((x=/^\*(\d+)/.exec(rest)))n=Math.min(+x[1],50);
else return null;
rest=rest.slice(x[0].length)}
if(!tag&&!mods)return null;
if(tag&&!TAGS[tag.toLowerCase()])return null;
return{tag:(tag||'div').toLowerCase(),mods:mods,attr:attr,text:text,n:n}}
function emmetAttrs(e,r){
var cls=[],id='',out=[];
e.mods.replace(/([.#])([\w$-]+)/g,function(_,k,v){v=v.replace(/\$/g,r);if(k==='.')cls.push(v);else id=v});
if(id)out.push('id="'+id+'"');if(cls.length)out.push('class="'+cls.join(' ')+'"');
var given={};
e.attr.replace(/([\w-]+)(?:=("[^"]*"|'[^']*'|[^\s]+))?/g,function(_,k,v){given[k]=1;v=v===undefined?null:v.replace(/^["']|["']$/g,'').replace(/\$/g,r);out.push(v===null?k:k+'="'+v+'"')});
var d={a:['href'],img:['src','alt'],input:['type'],link:['rel','href'],script:['src'],iframe:['src'],form:['action'],label:['for']};
(d[e.tag]||[]).forEach(function(k){if(!given[k]){var val=k==='type'?'text':k==='rel'?'stylesheet':'\u0001';if(e.tag==='script'||e.tag==='label'||e.tag==='iframe'||e.tag==='form')return;out.push(k+'="'+val+'"')}});
return out.length?' '+out.join(' '):''}
function emmet(ab){
if(ab==='!')return'<!DOCTYPE html>\n<html lang="tr">\n<head>\n'+IND+'<meta charset="utf-8">\n'+IND+'<meta name="viewport" content="width=device-width,initial-scale=1">\n'+IND+'<title>Belge</title>\n</head>\n<body>\n'+IND+'\u0001\n</body>\n</html>';
var lv=ab.split('>').map(function(l){return l.split('+').map(emmetParse)}),bad=false;
lv.forEach(function(l){l.forEach(function(e){if(!e)bad=true})});
if(bad)return null;
function gen(k,ind){var out=[];
lv[k].forEach(function(e,idx){for(var r=1;r<=e.n;r++){
var kids=(idx===lv[k].length-1&&k+1<lv.length)?gen(k+1,ind+IND):null;
var open='<'+e.tag+emmetAttrs(e,r)+'>',tx=e.text===null?null:e.text.replace(/\$/g,r);
if(VOID[e.tag])out.push(ind+open);
else if(kids&&kids.length){out.push(ind+open);Array.prototype.push.apply(out,kids);out.push(ind+'</'+e.tag+'>')}
else out.push(ind+open+(tx===null?'\u0001':tx)+'</'+e.tag+'>');
}});return out}
return gen(0,'').join('\n')}
/* ---------- Girintileme ---------- */
function reindentHTML(src){
var lines=src.split('\n'),d=0,out=[],raw=null;
for(var i=0;i<lines.length;i++){var ln=lines[i],t=ln.trim();
if(raw){if(new RegExp('</'+raw+'\\b','i').test(ln)){d=Math.max(0,d-1);out.push(t.indexOf('</'+raw)===0?IND.repeat(d)+t:ln);raw=null}else out.push(ln);continue}
if(!t){out.push('');continue}
var mm=t.match(/^(<\/[^>]+>\s*)+/),lead=mm?(mm[0].match(/<\//g)||[]).length:0;
out.push(IND.repeat(Math.max(0,d-lead))+t);
var tags=t.replace(/<!--[\s\S]*?-->/g,'').match(/<\/?[A-Za-z][^>]*>/g)||[],net=0;
for(var j=0;j<tags.length;j++){var tg=tags[j];
if(tg.charAt(1)==='/')net--;
else if(/\/>$/.test(tg)||VOID[(tg.match(/^<([A-Za-z0-9-]+)/)[1]).toLowerCase()])continue;
else net++}
d=Math.max(0,d+net);
var rm=t.match(/<(pre|textarea|script|style)\b[^>]*>(?![\s\S]*<\/\1>)/i);if(rm)raw=rm[1].toLowerCase();
}
return out.join('\n')}
function reindentBrace(src){
var lines=src.split('\n'),d=0,out=[],tpl=false,com=false;
for(var i=0;i<lines.length;i++){var ln=lines[i],t=ln.trim();
if(tpl||com){out.push(ln);
if(tpl){var b=(ln.replace(/\\./g,'').match(/`/g)||[]).length;if(b%2===1)tpl=false}
if(com&&ln.indexOf('*/')>-1)com=false;continue}
if(!t){out.push('');continue}
var st=t.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`|\/\*.*?\*\/|\/\/.*$/g,'');
var open=(st.match(/[{(\[]/g)||[]).length,close=(st.match(/[})\]]/g)||[]).length,ld=/^[})\]]+/.exec(st);
out.push(IND.repeat(Math.max(0,d-(ld?ld[0].length:0)))+t);
d=Math.max(0,d+open-close);
var bt=(st.replace(/\\./g,'').match(/`/g)||[]).length;if(bt%2===1)tpl=true;
if(/\/\*/.test(st)&&st.indexOf('*/')<0)com=true;
}
return out.join('\n')}
/* ---------- Editör ---------- */
function Editor(lang,host,onInput,onCaret){
host.innerHTML='<div class="g"><div class="gi"></div></div><div class="w"><div class="cl"></div><div class="fm"></div><div class="hl"></div><textarea spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" wrap="off" aria-label="'+lang.toUpperCase()+' kodu"></textarea></div>';
var gi=$('.gi',host),cl=$('.cl',host),fm=$('.fm',host),hl=$('.hl',host),ta=$('textarea',host),W=$('.w',host);
var E={lang:lang,host:host,ta:ta,matches:[],cur:-1,term:'',cs:false,starts:[0]};
var lines=0;
function lh(){return parseFloat(getComputedStyle(ta).lineHeight)||22}
function cw(){var s=document.createElement('span');s.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:'+getComputedStyle(ta).font;s.textContent='0000000000';W.appendChild(s);var w=s.getBoundingClientRect().width/10;s.remove();return w||8}
E.render=function(){
var v=ta.value;hl.innerHTML=HL[lang](v)+'\n';
var n=v.split('\n').length;
if(n!==lines){lines=n;var a=[];for(var i=1;i<=n;i++)a.push(i);gi.textContent=a.join('\n')}
E.sync();E.line();E.marks()};
E.sync=function(){
var st=ta.scrollTop,sl=ta.scrollLeft;
hl.style.transform='translate('+(-sl)+'px,'+(-st)+'px)';gi.style.transform='translateY('+(-st)+'px)';E.line();E.marks()};
E.line=function(){
var pos=ta.selectionStart,ln=ta.value.slice(0,pos).split('\n').length-1;
cl.style.top=(12+ln*lh()-ta.scrollTop)+'px';cl.style.display=(ta.selectionStart!==ta.selectionEnd)?'none':''};
E.setTerm=function(t,cs){
E.term=t;E.cs=cs;E.find();E.marks()};
E.find=function(){
var v=ta.value,t=E.term,ms=[];
E.starts=[0];for(var i=0;i<v.length;i++)if(v.charCodeAt(i)===10)E.starts.push(i+1);
if(t){var hay=E.cs?v:v.toLowerCase(),nd=E.cs?t:t.toLowerCase(),k=0;
while((k=hay.indexOf(nd,k))>-1&&ms.length<5000){ms.push(k);k+=Math.max(1,nd.length)}}
E.matches=ms;
var p=ta.selectionStart;E.cur=-1;
for(var j=0;j<ms.length;j++){if(ms[j]>=p){E.cur=j;break}}
if(E.cur<0&&ms.length)E.cur=0};
function lineOf(idx){var lo=0,hi=E.starts.length-1;while(lo<hi){var mid=(lo+hi+1)>>1;if(E.starts[mid]<=idx)lo=mid;else hi=mid-1}return lo}
function vcol(line,idx){var s=ta.value.substring(E.starts[line],idx),c=0;for(var i=0;i<s.length;i++){c=s.charAt(i)==='\t'?c+(2-c%2):c+1}return c}
E.marks=function(){
fm.innerHTML='';if(!E.matches.length)return;
var h=lh(),w=cw(),top=ta.scrollTop,sl=ta.scrollLeft,first=Math.floor(top/h)-1,last=Math.ceil((top+ta.clientHeight)/h)+1,html='';
for(var i=0;i<E.matches.length;i++){var idx=E.matches[i],ln=lineOf(idx);if(ln<first||ln>last)continue;
var c=vcol(ln,idx),len=E.term.length;
html+='<i'+(i===E.cur?' class="cur"':'')+' style="left:'+(14+c*w-sl)+'px;top:'+(12+ln*h-top)+'px;width:'+(len*w)+'px;height:'+h+'px"></i>'}
fm.innerHTML=html};
E.reveal=function(a,b){
var ln=lineOf(a),h=lh(),w=cw(),y=12+ln*h;
if(y<ta.scrollTop+h||y>ta.scrollTop+ta.clientHeight-h*2)ta.scrollTop=Math.max(0,y-ta.clientHeight/2);
var x=14+vcol(ln,a)*w;
if(x<ta.scrollLeft+20||x>ta.scrollLeft+ta.clientWidth-80)ta.scrollLeft=Math.max(0,x-ta.clientWidth/2);
E.sync()};
E.goto=function(i){
if(!E.matches.length)return;
E.cur=(i+E.matches.length)%E.matches.length;var a=E.matches[E.cur];
ta.setSelectionRange(a,a+E.term.length);E.reveal(a,a+E.term.length);E.marks();onCaret(E)};
E.next=function(d){
if(!E.matches.length)return;var p=d>0?ta.selectionEnd:ta.selectionStart-1,j=-1;
if(d>0){for(var i=0;i<E.matches.length;i++)if(E.matches[i]>=ta.selectionStart+(ta.selectionStart===ta.selectionEnd?0:1)){j=i;break}if(j<0)j=0}
else{for(var k=E.matches.length-1;k>=0;k--)if(E.matches[k]<ta.selectionStart){j=k;break}if(j<0)j=E.matches.length-1}
E.goto(j)};
function ins(text){
ta.focus();var ok=false;try{ok=document.execCommand('insertText',false,text)}catch(e){}
if(!ok){ta.setRangeText(text,ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input',{bubbles:true}))}}
E.ins=ins;
E.replaceRange=function(a,b,text,sa,sb){ta.setSelectionRange(a,b);ins(text);if(sa!=null)ta.setSelectionRange(sa,sb==null?sa:sb)};
E.replaceSel=function(rep){
if(ta.selectionStart===ta.selectionEnd)return false;
var a=ta.selectionStart,s=ta.value.slice(a,ta.selectionEnd);
var ok=E.cs?s===E.term:s.toLowerCase()===E.term.toLowerCase();if(!ok)return false;
ins(rep);return true};
E.all=function(rep){
if(!E.term)return 0;var v=ta.value,n=0,out='',k=0,hay=E.cs?v:v.toLowerCase(),nd=E.cs?E.term:E.term.toLowerCase(),i;
while((i=hay.indexOf(nd,k))>-1){out+=v.slice(k,i)+rep;k=i+nd.length;n++}
if(!n)return 0;out+=v.slice(k);ta.focus();ta.setSelectionRange(0,v.length);ins(out);ta.setSelectionRange(0,0);return n};
function lineRange(){
var v=ta.value,a=ta.selectionStart,b=ta.selectionEnd;
if(b>a&&v.charAt(b-1)==='\n')b--;
var s=v.lastIndexOf('\n',a-1)+1,e=v.indexOf('\n',b);if(e<0)e=v.length;return[s,e]}
function toggleComment(){
var r=lineRange(),v=ta.value,block=v.slice(r[0],r[1]),ls=block.split('\n'),a=ta.selectionStart,b=ta.selectionEnd;
var pre=lang==='js'?'// ':null,all=true,out;
function isC(l){var t=l.trim();if(!t)return true;return lang==='html'?/^<!--[\s\S]*-->$/.test(t):lang==='css'?/^\/\*[\s\S]*\*\/$/.test(t):/^\/\//.test(t)}
ls.forEach(function(l){if(!isC(l))all=false});
out=ls.map(function(l){var t=l.trim();if(!t)return l;var ind=/^\s*/.exec(l)[0];
if(all){return ind+(lang==='html'?t.replace(/^<!--\s?/,'').replace(/\s?-->$/,''):lang==='css'?t.replace(/^\/\*\s?/,'').replace(/\s?\*\/$/,''):t.replace(/^\/\/\s?/,''))}
return ind+(lang==='html'?'<!-- '+t+' -->':lang==='css'?'/* '+t+' */':pre+t)}).join('\n');
E.replaceRange(r[0],r[1],out,r[0],r[0]+out.length)}
function indentLines(back){
var r=lineRange(),v=ta.value,ls=v.slice(r[0],r[1]).split('\n');
var out=ls.map(function(l){if(!back)return l.length?IND+l:l;return l.replace(/^(?:\t| {1,2})/,'')}).join('\n');
E.replaceRange(r[0],r[1],out,r[0],r[0]+out.length)}
function moveLines(dir){
var r=lineRange(),v=ta.value;
if(dir<0){if(r[0]===0)return;var ps=v.lastIndexOf('\n',r[0]-2)+1,prev=v.slice(ps,r[0]-1),cur=v.slice(r[0],r[1]);
E.replaceRange(ps,r[1],cur+'\n'+prev,ps,ps+cur.length)}
else{if(r[1]>=v.length)return;var ne=v.indexOf('\n',r[1]+1);if(ne<0)ne=v.length;var nxt=v.slice(r[1]+1,ne),cu=v.slice(r[0],r[1]);
E.replaceRange(r[0],ne,nxt+'\n'+cu,r[0]+nxt.length+1,r[0]+nxt.length+1+cu.length)}}
function dupLines(){
var r=lineRange(),v=ta.value,blk=v.slice(r[0],r[1]);
E.replaceRange(r[1],r[1],'\n'+blk,r[1]+1,r[1]+1+blk.length)}
function smartEnter(){
var v=ta.value,a=ta.selectionStart,b=ta.selectionEnd,ls=v.lastIndexOf('\n',a-1)+1,line=v.slice(ls,a),ind=/^[ \t]*/.exec(line)[0],pv=v.charAt(a-1),nx=v.charAt(b),tl=line.replace(/\s+$/,'');
var pair=(pv==='{'&&nx==='}')||(pv==='['&&nx===']')||(pv==='('&&nx===')');
var openTag=lang==='html'&&/<([A-Za-z][\w-]*)(?:\s[^<>]*)?>$/.test(tl)&&!/\/>$/.test(tl)&&!VOID[(/<([A-Za-z][\w-]*)[^<>]*>$/.exec(tl)||[0,''])[1].toLowerCase()]&&!/<\/[^>]+>$/.test(tl);
var after=/^<\/\w/.test(v.slice(b));
if(pair||(openTag&&after)){var s='\n'+ind+IND;ins(s+'\n'+ind);ta.setSelectionRange(a+s.length,a+s.length);return}
var extra=(/[{(\[]$/.test(tl)||openTag)?IND:'';
ins('\n'+ind+extra)}
function tryEmmet(){
if(lang!=='html'||ta.selectionStart!==ta.selectionEnd)return false;
var v=ta.value,a=ta.selectionStart,ls=v.lastIndexOf('\n',a-1)+1,i=a,depth=0;
while(i>ls){var ch=v.charAt(i-1);
if(ch==='}'||ch===']')depth++;else if(ch==='{'||ch==='[')depth--;
else if(/\s/.test(ch)&&depth<=0)break;
i--}
var ab=v.slice(i,a);if(!ab)return false;
var txt=emmet(ab);if(txt===null)return false;
var base=/^[ \t]*/.exec(v.slice(ls,i))[0];
if(base)txt=txt.split('\n').map(function(l,k){return k?base+l:l}).join('\n');
var cp=txt.indexOf('\u0001');txt=txt.replace(/\u0001/g,'');
E.replaceRange(i,a,txt);if(cp>-1)ta.setSelectionRange(i+cp,i+cp);return true}
var PAIR={'(':')','[':']','{':'}'},QUOTE={'"':1,"'":1,'`':1};
ta.addEventListener('keydown',function(e){
var k=e.key,mod=e.ctrlKey||e.metaKey,v=ta.value,a=ta.selectionStart,b=ta.selectionEnd;
if(mod&&k==='Enter'){e.preventDefault();E.onRun&&E.onRun();return}
if(mod&&(k==='s'||k==='S')){e.preventDefault();E.onSave&&E.onSave();return}
if(mod&&(k==='f'||k==='F')){e.preventDefault();E.onFind&&E.onFind();return}
if(mod&&k==='/'){e.preventDefault();toggleComment();return}
if(mod&&(k==='d'||k==='D')){e.preventDefault();dupLines();return}
if(e.altKey&&(k==='ArrowUp'||k==='ArrowDown')){e.preventDefault();moveLines(k==='ArrowUp'?-1:1);return}
if(mod||e.altKey)return;
if(k==='Tab'){e.preventDefault();
if(e.shiftKey){indentLines(true);return}
if(a!==b&&v.slice(a,b).indexOf('\n')>-1){indentLines(false);return}
if(a===b&&tryEmmet())return;
ins(IND);return}
if(k==='Enter'&&!e.shiftKey){e.preventDefault();smartEnter();return}
if(k==='Backspace'&&a===b&&a>0&&PAIR[v.charAt(a-1)]===v.charAt(a)){e.preventDefault();E.replaceRange(a-1,a+1,'');return}
if(k==='Backspace'&&a===b&&QUOTE[v.charAt(a-1)]&&v.charAt(a-1)===v.charAt(a)){e.preventDefault();E.replaceRange(a-1,a+1,'');return}
if(k.length===1){
var nx=v.charAt(b),pv=v.charAt(a-1);
if((k===')'||k===']'||k==='}'||QUOTE[k])&&a===b&&nx===k){e.preventDefault();ta.setSelectionRange(a+1,a+1);return}
if(PAIR[k]){e.preventDefault();
if(a!==b){var sel=v.slice(a,b);ins(k+sel+PAIR[k]);ta.setSelectionRange(a+1,a+1+sel.length);return}
if(!nx||/[\s)\]}>;,]/.test(nx)){ins(k+PAIR[k]);ta.setSelectionRange(a+1,a+1);return}
ins(k);return}
if(QUOTE[k]){
if(a!==b){e.preventDefault();var s2=v.slice(a,b);ins(k+s2+k);ta.setSelectionRange(a+1,a+1+s2.length);return}
if(!/[\w]/.test(pv)&&!/[\w]/.test(nx)&&!(k==="'"&&lang==='html'&&!/=\s*$/.test(v.slice(0,a)))){e.preventDefault();ins(k+k);ta.setSelectionRange(a+1,a+1);return}}
if(k==='>'&&lang==='html'&&a===b){
var m=/<([A-Za-z][\w-]*)(?:\s(?:"[^"]*"|'[^']*'|[^<>"'])*)?$/.exec(v.slice(Math.max(0,v.lastIndexOf('<',a-1)),a));
if(m&&!VOID[m[1].toLowerCase()]&&v.charAt(a-1)!=='/'&&v.slice(v.lastIndexOf('<',a-1),a).charAt(1)!=='/'&&v.slice(a,a+m[1].length+3)!=='</'+m[1]+'>'){e.preventDefault();ins('></'+m[1]+'>');ta.setSelectionRange(a+1,a+1);return}}
}});
ta.addEventListener('input',function(){E.find();E.render();onInput(E)});
ta.addEventListener('scroll',function(){E.sync()});
['keyup','click','focus','select'].forEach(function(ev){ta.addEventListener(ev,function(){E.line();onCaret(E)})});
E.reindent=function(){
var v=ta.value,o=lang==='html'?reindentHTML(v):reindentBrace(v);
if(o===v)return false;ta.focus();ta.setSelectionRange(0,v.length);ins(o);ta.setSelectionRange(0,0);return true};
E.set=function(v){ta.value=v;E.find();E.render();ta.scrollTop=0;ta.scrollLeft=0;E.sync()};
return E}
/* ---------- Şablonlar ---------- */
var TPL=window.HED_TPL||[['Boş sayfa','','','','Başlangıç']];
/* ---------- Durum ---------- */
var st={html:'',css:'',js:'',tab:'html',lay:'',theme:'dark',fs:14,auto:false,dev:''};
var had=false;try{var sv=JSON.parse(localStorage.getItem(LS)||'null');if(sv&&typeof sv==='object'){had=!!sv.saved;for(var k in st)if(k!=='auto'&&k in sv&&typeof sv[k]===typeof st[k])st[k]=sv[k]}}catch(e){}
if(!had){st.html=TPL[0][1];st.css=TPL[0][2];st.js=TPL[0][3]}
if(!st.lay)st.lay=window.innerWidth<=820?'stack':'split';
var eds={},cur=st.tab,saveT=0,runT=0,jsOff=0,jsN=0,errN=0;
function save(){clearTimeout(saveT);saveT=setTimeout(function(){
try{localStorage.setItem(LS,JSON.stringify({html:eds.html.ta.value,css:eds.css.ta.value,js:eds.js.ta.value,tab:cur,lay:st.lay,theme:st.theme,fs:st.fs,auto:st.auto,dev:st.dev,saved:1}));$('#s-save').textContent='Kaydedildi '+new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(e){$('#s-save').textContent='Kaydedilemedi'}},400)}
function caret(E){
if(E!==eds[cur])return;
var v=E.ta.value,p=E.ta.selectionStart,ls=v.lastIndexOf('\n',p-1)+1,ln=v.slice(0,p).split('\n').length;
$('#s-pos').textContent='Satır '+ln+', Sütun '+(p-ls+1);
var sel=E.ta.selectionEnd-p;$('#s-sel').textContent=sel>0?sel+' karakter seçili':'';
$('#s-len').textContent=v.split('\n').length+' satır · '+v.length+' karakter'}
function onInput(E){caret(E);save();if(st.auto){clearTimeout(runT);runT=setTimeout(run,600)}updFind()}
$$('.hed-ed').forEach(function(h){var l=h.getAttribute('data-l');eds[l]=Editor(l,h,onInput,caret);eds[l].onRun=run;eds[l].onSave=download;eds[l].onFind=openFind;eds[l].set(st[l])});
/* ---------- Önizleme ---------- */
var HOOK='<script>(function(){var P=parent;function s(t,a,l){try{P.postMessage({hed:1,t:t,a:a,l:l},"*")}catch(e){}}function f(v){try{if(typeof v==="string")return v;if(v instanceof Error)return v.stack||String(v);if(typeof v==="function")return String(v);if(v&&typeof v==="object")return JSON.stringify(v,function(k,x){return typeof x==="function"?"[Function]":x},2);return String(v)}catch(e){return String(v)}}["log","info","warn","error","debug"].forEach(function(m){var o=console[m];console[m]=function(){s(m,[].slice.call(arguments).map(f));try{o.apply(console,arguments)}catch(e){}}});addEventListener("error",function(e){s("error",[e.message||"Hata"],e.lineno)});addEventListener("unhandledrejection",function(e){s("error",["Promise hatası: "+f(e.reason)])});addEventListener("message",function(e){if(e.data&&e.data.hedEval!=null){try{s("result",[f((0,eval)(e.data.hedEval))])}catch(x){s("error",[String(x)])}}})})();<\/script>';
function build(clean){
var h=eds.html.ta.value,c=eds.css.ta.value,j=eds.js.ta.value,full=/<html[\s>]|<!doctype/i.test(h);
var sty=c.trim()?'<style>\n'+c+'\n</style>':'',js=j.trim()?'<script>\n'+j.replace(/<\/script/gi,'<\\/script')+'\n<\/script>':'',hook=clean?'':HOOK,d;
if(full){d=h;
if(/<head[^>]*>/i.test(d))d=d.replace(/<head[^>]*>/i,function(m){return m+hook});
else if(/<html[^>]*>/i.test(d))d=d.replace(/<html[^>]*>/i,function(m){return m+'<head>'+hook+'</head>'});
else d=hook+d;
if(sty){if(/<\/head>/i.test(d))d=d.replace(/<\/head>/i,function(){return sty+'\n</head>'});else d=d+sty}
if(js){if(/<\/body>/i.test(d))d=d.replace(/<\/body>/i,function(){return js+'\n</body>'});else d=d+'\n'+js}
}else{
var t=(/<title>([\s\S]*?)<\/title>/i.exec(h)||[0,'Belge'])[1];
d='<!DOCTYPE html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>'+(clean?'Belge':'Önizleme')+'</title>\n'+hook+(sty?sty+'\n':'')+'</head>\n<body>\n'+h+'\n'+js+'\n</body>\n</html>'}
if(!clean&&js){var ix=d.indexOf(js);jsOff=ix<0?0:d.slice(0,ix).split('\n').length;jsN=j.split('\n').length}else{jsOff=0;jsN=0}
return d}
var ifr=$('#h-if'),cl=$('#h-cl'),cn=$('#h-cn');
function log(t,txt){var d=document.createElement('div');d.className=t;d.textContent=txt;cl.appendChild(d);while(cl.childNodes.length>400)cl.removeChild(cl.firstChild);cl.scrollTop=cl.scrollHeight;
if(t==='error'){errN++;cn.classList.add('er')}cn.textContent=cl.childNodes.length}
function clearCons(){cl.innerHTML='';errN=0;cn.classList.remove('er');cn.textContent='0'}
function run(){clearTimeout(runT);clearCons();ifr.srcdoc=build(false)}
window.addEventListener('message',function(e){
if(e.source!==ifr.contentWindow||!e.data||!e.data.hed)return;
var t=e.data.t,a=e.data.a||[],txt=a.join(' ');
if(t==='error'&&e.data.l&&e.data.l>jsOff&&e.data.l<=jsOff+jsN+1)txt+='  (JS satır '+(e.data.l-jsOff)+')';
log(t==='debug'?'log':t,txt)});
/* ---------- Araç çubuğu ---------- */
function setTab(l){cur=l;$$('.hed-tab').forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-l')===l?'true':'false')});
$$('.hed-ed').forEach(function(h){h.classList.toggle('act',h.getAttribute('data-l')===l)});
var E=eds[l];E.find();E.marks();E.ta.focus();caret(E);updFind();save()}
$$('.hed-tab').forEach(function(b){b.onclick=function(){setTab(b.getAttribute('data-l'))}});
function setLay(l){st.lay=l;root.setAttribute('data-lay',l);$$('[data-lay].hed-b').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-lay')===l)});
root.style.removeProperty('--sp');setTimeout(function(){eds[cur].sync()},30);save()}
$$('[data-lay].hed-b').forEach(function(b){b.onclick=function(){setLay(b.getAttribute('data-lay'))}});
function setTheme(t){st.theme=t;root.setAttribute('data-theme',t);save()}
$('#h-th').onclick=function(){setTheme(st.theme==='dark'?'light':'dark')};
function setFs(n){st.fs=Math.max(11,Math.min(26,n));root.style.setProperty('--fs',st.fs+'px');for(var k in eds){eds[k].render()}save()}
$('#h-fm').onclick=function(){setFs(st.fs-1)};$('#h-fp').onclick=function(){setFs(st.fs+1)};
var auto=$('#h-auto');auto.checked=st.auto;auto.onchange=function(){st.auto=auto.checked;save();if(st.auto)run()};
$('#h-run').onclick=run;$('#h-refresh').onclick=run;
var dev=$('#h-dev'),frame=$('#h-frame');
function setDev(v){st.dev=v;dev.value=v;frame.classList.toggle('dev',!!v);frame.style.setProperty('--dw',v||'100%');save()}
dev.onchange=function(){setDev(dev.value)};
function dims(){var r=ifr.getBoundingClientRect();$('#h-dim').textContent=Math.round(r.width)+' × '+Math.round(r.height)+' px'}
if(window.ResizeObserver)new ResizeObserver(dims).observe(ifr);
var tpl=$('#h-tpl'),grp={};TPL.forEach(function(t,i){var g=t[4]||'Diğer';if(!grp[g]){grp[g]=document.createElement('optgroup');grp[g].label=g;tpl.appendChild(grp[g])}var o=document.createElement('option');o.value=i;o.textContent=t[0];grp[g].appendChild(o)});
tpl.onchange=function(){var i=tpl.value;tpl.value='';if(i==='')return;var t=TPL[+i];
if((eds.html.ta.value||eds.css.ta.value||eds.js.ta.value)&&!confirm('Mevcut kod bu şablonla değiştirilecek. Devam edilsin mi?'))return;
eds.html.set(t[1]);eds.css.set(t[2]);eds.js.set(t[3]);setTab('html');save();run()};
$('#h-reset').onclick=function(){if(!confirm('Tüm kod başlangıç şablonuna sıfırlanacak. Devam edilsin mi?'))return;
eds.html.set(TPL[0][1]);eds.css.set(TPL[0][2]);eds.js.set(TPL[0][3]);setTab('html');save();run()};
$('#h-fmt').onclick=function(){var E=eds[cur];if(E.reindent())log('sys',cur.toUpperCase()+' girintileri düzenlendi.');else log('sys','Girintiler zaten düzgün.')};
function copyText(t){return(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){var x=document.createElement('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.appendChild(x);x.select();try{document.execCommand('copy')}catch(e){}x.remove()})}
$('#h-copy').onclick=function(){var b=this;copyText(build(true)).then(function(){b.textContent='Kopyalandı ✓';setTimeout(function(){b.textContent='Kopyala'},1500)})};
function download(){var blob=new Blob([build(true)],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sayfa.html';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000)}
$('#h-dl').onclick=download;
$('#h-tab').onclick=function(){var blob=new Blob([build(true)],{type:'text/html;charset=utf-8'}),u=URL.createObjectURL(blob);window.open(u,'_blank','noopener');setTimeout(function(){URL.revokeObjectURL(u)},60000)};
var file=$('#h-file');$('#h-open').onclick=function(){file.click()};
function loadFile(f){if(!f)return;var r=new FileReader();r.onload=function(){var ext=(f.name.split('.').pop()||'').toLowerCase(),l=ext==='css'?'css':ext==='js'?'js':'html';eds[l].set(String(r.result));setTab(l);save();run();log('sys',f.name+' '+l.toUpperCase()+' bölümüne yüklendi.')};r.readAsText(f)}
file.onchange=function(){loadFile(file.files[0]);file.value=''};
['dragover','dragleave','drop'].forEach(function(ev){$('.hed-eds').addEventListener(ev,function(e){e.preventDefault();$('.hed-eds').classList.toggle('hed-drop',ev==='dragover');if(ev==='drop')loadFile(e.dataTransfer.files[0])})});
/* Tam ekran */
var fullB=$('#h-full'),de=document.documentElement;
if(!de.requestFullscreen&&!de.webkitRequestFullscreen)fullB.hidden=true;
function isFull(){return!!(document.fullscreenElement||document.webkitFullscreenElement)}
function syncFull(){fullB.textContent=isFull()?'✕ Tam ekrandan çık':'⛶ Tam ekran';setTimeout(function(){for(var k in eds)eds[k].sync();dims()},80)}
fullB.onclick=function(){if(isFull())(document.exitFullscreen||document.webkitExitFullscreen).call(document);else(de.requestFullscreen||de.webkitRequestFullscreen).call(de)};
document.addEventListener('fullscreenchange',syncFull);document.addEventListener('webkitfullscreenchange',syncFull);
/* Yardım */
var hp=$('#h-hp');$('#h-help').onclick=function(){hp.hidden=false;$('#h-hpx').focus()};$('#h-hpx').onclick=function(){hp.hidden=true;eds[cur].ta.focus()};
hp.onclick=function(e){if(e.target===hp)hp.hidden=true};
/* Bul / değiştir */
var fb=$('#h-fbar'),fq=$('#h-fq'),fr=$('#h-fr'),fc=$('#h-fcase'),cs=false;
function updFind(){var E=eds[cur];if(fb.hidden){E.setTerm('',false);return}
E.setTerm(fq.value,cs);var c=$('#h-fcnt');c.textContent=fq.value?(E.matches.length?(Math.max(0,E.cur)+1)+' / '+E.matches.length:'Sonuç yok'):''}
function openFind(){fb.hidden=false;var E=eds[cur],s=E.ta.value.slice(E.ta.selectionStart,E.ta.selectionEnd);if(s&&s.indexOf('\n')<0)fq.value=s;fq.focus();fq.select();updFind()}
function closeFind(){fb.hidden=true;updFind();eds[cur].ta.focus()}
$('#h-find').onclick=function(){fb.hidden?openFind():closeFind()};$('#h-fx').onclick=closeFind;
fq.oninput=function(){updFind();var E=eds[cur];if(E.cur>-1)E.goto(E.cur);updFind()};
fc.onclick=function(){cs=!cs;fc.classList.toggle('on',cs);updFind()};
function step(d){var E=eds[cur];E.setTerm(fq.value,cs);E.next(d);updFind()}
$('#h-fnext').onclick=function(){step(1)};$('#h-fprev').onclick=function(){step(-1)};
fq.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();step(e.shiftKey?-1:1)}else if(e.key==='Escape'){e.stopPropagation();closeFind()}};
fr.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('#h-frep').click()}else if(e.key==='Escape'){e.stopPropagation();closeFind()}};
$('#h-frep').onclick=function(){var E=eds[cur];E.setTerm(fq.value,cs);if(!E.replaceSel(fr.value))E.next(1);else{E.find();E.next(1)}updFind();fq.focus()};
$('#h-fall').onclick=function(){var E=eds[cur];E.setTerm(fq.value,cs);var n=E.all(fr.value);updFind();$('#h-fcnt').textContent=n+' değişiklik'};
/* Konsol */
var cons=$('#h-cons');if(window.innerWidth<=820)cons.classList.add('closed');$('#h-ch').onclick=function(e){if(e.target.closest('#h-cclr'))return;cons.classList.toggle('closed')};
$('#h-cclr').onclick=clearCons;
var hist=[],hi=0,ci=$('#h-ci');
ci.onkeydown=function(e){
if(e.key==='Enter'&&ci.value.trim()){var c=ci.value;hist.push(c);hi=hist.length;log('echo',c);ci.value='';try{ifr.contentWindow.postMessage({hedEval:c},'*')}catch(x){log('error',String(x))}}
else if(e.key==='ArrowUp'&&hist.length){e.preventDefault();hi=Math.max(0,hi-1);ci.value=hist[hi]}
else if(e.key==='ArrowDown'&&hist.length){e.preventDefault();hi=Math.min(hist.length,hi+1);ci.value=hist[hi]||''}};
/* Ayırıcı */
var spl=$('#h-split'),main=$('.hed-main');
spl.addEventListener('pointerdown',function(e){e.preventDefault();spl.setPointerCapture(e.pointerId);spl.classList.add('drag');root.classList.add('dragging')});
spl.addEventListener('pointermove',function(e){if(!spl.classList.contains('drag'))return;
var r=main.getBoundingClientRect(),col=getComputedStyle(main).flexDirection==='column',p=col?(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width;
root.style.setProperty('--sp',Math.max(15,Math.min(85,p*100))+'%');for(var k in eds)eds[k].sync()});
function endDrag(){spl.classList.remove('drag');root.classList.remove('dragging');dims()}
spl.addEventListener('pointerup',endDrag);spl.addEventListener('pointercancel',endDrag);
spl.addEventListener('dblclick',function(){root.style.removeProperty('--sp')});
spl.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();var cs2=parseFloat(getComputedStyle(root).getPropertyValue('--sp'))||50,d=(e.key==='ArrowLeft'||e.key==='ArrowUp')?-5:5;root.style.setProperty('--sp',Math.max(15,Math.min(85,cs2+d))+'%')}});
document.addEventListener('keydown',function(e){
if(e.key==='Escape'&&!hp.hidden){hp.hidden=true}
if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&root.contains(document.activeElement)){e.preventDefault();run()}});
window.addEventListener('resize',function(){for(var k in eds)eds[k].sync()});
/* Başlat */
root.style.setProperty('--fs',st.fs+'px');setTheme(st.theme);setLay(st.lay);setDev(st.dev);setTab(st.tab||'html');
for(var k2 in eds)eds[k2].render();
caret(eds[cur]);run();
window.__hed={eds:eds,run:run,emmet:emmet,build:build,st:st};
})();
