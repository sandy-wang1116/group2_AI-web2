(function(){
'use strict';
var T=window.TAX,$=function(i){return document.getElementById(i)},MAX=10;
var spouse=true,rowId=0;
function fmt(n){return n.toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(v){var n=parseFloat(String(v).replace(/,/g,''));return isFinite(n)?n:NaN}
// 只允許數字輸入
document.addEventListener('input',function(e){var t=e.target;if(t.hasAttribute&&t.hasAttribute('data-num')){var dec=t.getAttribute('inputmode')==='decimal';t.value=t.value.replace(dec?/[^\d.]/g:/\D/g,'');t.classList.remove('bad');if(t.closest('#assets'))sum()}});
function tog(y){spouse=y;$('sp-yes').classList.toggle('on',y);$('sp-no').classList.toggle('on',!y);$('sp-yes').setAttribute('aria-pressed',y);$('sp-no').setAttribute('aria-pressed',!y)}
$('sp-yes').onclick=function(){tog(true)};$('sp-no').onclick=function(){tog(false)};
function addRow(name,amt,fixed){
 var tb=document.querySelector('#assets tbody');if(tb.rows.length>=MAX)return;
 var tr=document.createElement('tr');tr.dataset.id=++rowId;
 tr.innerHTML='<td'+(fixed?' class="fixed">'+name:'><input class="nm" type="text" value="'+(name||'')+'" placeholder="資產名稱">')+'</td>'+
 '<td><input class="amt" type="text" inputmode="decimal" data-num value="'+(amt||'')+'"></td>'+
 '<td><select class="cur"><option value="TWD">新台幣</option><option value="USD">美金</option><option value="JPY">日圓</option><option value="OTH">其他</option></select></td>'+
 '<td class="rt">—</td><td class="num tw">0.00</td><td>'+(fixed?'':'<button type="button" class="ghost del" aria-label="刪除此列">刪除</button>')+'</td>';
 tb.appendChild(tr);
 tr.querySelector('.cur').onchange=function(){var c=this.value,td=tr.querySelector('.rt');
  if(c==='TWD')td.textContent='—';else{td.innerHTML='<input class="rate" type="text" inputmode="decimal" data-num value="'+(c==='USD'?T.defaults.usd:c==='JPY'?T.defaults.jpy:'')+'" placeholder="輸入匯率">'}sum()};
 var d=tr.querySelector('.del');if(d)d.onclick=function(){tr.remove();sum();btn()};
 sum();btn();
}
function btn(){$('add').disabled=document.querySelector('#assets tbody').rows.length>=MAX}
function rows(){var out=[],ok=true;document.querySelectorAll('#assets tbody tr').forEach(function(tr){
 var a=num(tr.querySelector('.amt').value),c=tr.querySelector('.cur').value,r=1;
 if(c!=='TWD'){var ri=tr.querySelector('.rate');r=num(ri.value);if(!(r>0)){ok=false;ri.classList.add('bad')}}
 if(isNaN(a)){a=0}
 out.push({tw:a*r})});return{rows:out,ok:ok}}
function sum(){var tot=0;document.querySelectorAll('#assets tbody tr').forEach(function(tr){
 var a=num(tr.querySelector('.amt').value)||0,c=tr.querySelector('.cur').value,r=1;
 if(c!=='TWD'){r=num(tr.querySelector('.rate').value)||0}
 var v=a*r;tr.querySelector('.tw').textContent=fmt(v);tot+=v});$('total').textContent=fmt(tot);return tot}
$('add').onclick=function(){addRow('',''  )};
function init(){document.querySelector('#assets tbody').innerHTML='';rowId=0;
 addRow('信託本金','4000',true);addRow('公司股權','8000');addRow('不動產','5000');addRow('投資金融商品','3000');
 var n=document.querySelectorAll('#assets .nm');['公司股權','不動產','投資金融商品'].forEach(function(s,i){n[i].value=s});}
$('reset').onclick=function(){init();['age','adult','minor'].forEach(function(i){$(i).value=''});$('age').value='58';$('adult').value='2';$('minor').value='0';tog(true);$('result').hidden=true;$('msg').textContent=''};
// 稅額：超額累進（單位：萬元）
function tax(net,B){if(net<=0)return 0;for(var i=0;i<B.length;i++){if(net<=B[i].upTo||i===B.length-1){var lo=i?B[i-1].upTo:0;return B[i].base+(net-lo)*B[i].rate}}}
function giftTax(v){var net=Math.max(0,v-T.gift.exemption);return{net:net,tax:tax(net,T.gift.brackets)}}
function estTax(gross,ded){var net=Math.max(0,gross-ded);return{net:net,tax:tax(net,T.estate.brackets)}}
function calc(){
 var msg=$('msg');msg.textContent='';
 var age=num($('age').value),ad=num($('adult').value),mi=num($('minor').value),n=+$('years').value,
 pay=num($('pay').value),r=num($('rate').value)/100,my=num($('minyrs').value)||0;
 if([age,ad,mi].some(isNaN)){msg.textContent='請完整輸入年齡、成年子女與未成年子女人數（僅限數字，無則填 0）。';return}
 if(!(r>0)||isNaN(pay)){msg.textContent='請確認進階假設中的折現利率與固定給付金額。';return}
 var R=rows();if(!R.ok){msg.textContent='非新台幣資產請輸入有效匯率（標示紅框處）。';return}
 var total=sum(),P=R.rows[0].tw;
 if(total<=0||P<=0){msg.textContent='請輸入信託本金與資產金額（須大於 0）。';return}
 if(pay*n>P){msg.textContent='傳富久久：每年給付 × 信託期間不可超過信託本金，請調整固定給付金額。';return}
 var E=T.estate,v=Math.pow(1+r,-n),pvP=P*v,pvPay=pay*(1-v)/r;
 var ded=E.exemption+E.funeral+(spouse?E.spouse:0)+(ad+mi)*E.child+mi*my*E.minorExtraPerYear;
 var base=estTax(total,ded),out=estTax(total-P,ded);
 var gv={a:pvP,b:P-pvP,c:Math.max(0,P-pvPay)};
 var g={a:giftTax(gv.a),b:giftTax(gv.b),c:giftTax(gv.c)};
 var S=[
 {k:'none',name:'不使用信託',inv:0,gift:0,own:'原有資產由繼承程序處理',left:null,est:base.tax,eg:total,en:base.net,gv:null},
 {k:'a',name:'傳富發我',inv:P,gift:g.a.tax,own:'子女取得本金',left:P,est:out.tax,eg:total-P,en:out.net,gv:gv.a,gn:g.a.net},
 {k:'b',name:'傳富發發',inv:P,gift:g.b.tax,own:'林先生取得本金'.replace('林先生','委託人'),left:P,est:base.tax,eg:total,en:base.net,gv:gv.b,gn:g.b.net},
 {k:'c',name:'傳富久久',inv:P,gift:g.c.tax,own:'子女取得剩餘金額',left:P-pay*n,est:out.tax,eg:total-P,en:out.net,gv:gv.c,gn:g.c.net}];
 S.forEach(function(s){s.sum=s.est+s.gift;s.diff=s.sum-S[0].est});
 render(S,n,age,total,P,ded,pay,r,pvPay,spouse,ad,mi);
}
function render(S,n,age,total,P,ded,pay,r,pvPay){
 var best=S.reduce(function(a,b){return b.sum<a.sum?b:a});
 var h='<thead><tr><th>比較項目</th>'+S.map(function(s){return'<th>'+s.name+'</th>'}).join('')+'</tr></thead><tbody>';
 function row(l,f,cls){return'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+S.map(f).map(function(x){return'<td>'+x+'</td>'}).join('')+'</tr>'}
 h+=row('投入信託本金',function(s){return s.inv?fmt(s.inv):'0'});
 h+=row('預估贈與稅',function(s){return fmt(s.gift)});
 h+=row('期滿後本金歸屬',function(s){return s.own});
 h+=row(n+' 年後本金／剩餘金額',function(s){return s.left==null?'不適用':fmt(s.left)});
 h+=row('預估遺產稅',function(s){return fmt(s.est)});
 h+=row('遺產稅＋贈與稅',function(s){return fmt(s.sum)},'key');
 h+=row('相較不使用信託的稅負差額',function(s,i){if(!i)return'—';var d=s.diff;return d>0.005?'<span class="worse">增加 '+fmt(d)+'</span>':'<span class="best">減少 '+fmt(-d)+'</span>'});
 $('cmp').innerHTML=h+'</tbody>';
 chart(S,best);
 $('detail').innerHTML='<p>資產總額 '+fmt(total)+'；遺產稅免稅額與扣除額合計 '+fmt(ded)+'（含免稅額 '+T.estate.exemption+'、喪葬費 '+T.estate.funeral+'；配偶／子女依輸入計算）。</p>'+
 '<p>贈與稅免稅額 '+T.gift.exemption+'；折現利率 '+(r*100).toFixed(3)+'%；信託 '+n+' 年；信託期滿時委託人 '+(age+n)+' 歲。</p>'+
 S.slice(1).map(function(s){return'<p>'+s.name+'：他益價值 '+fmt(s.gv)+'，課稅贈與淨額 '+fmt(s.gn)+'；遺產總額 '+fmt(s.eg)+'，課稅遺產淨額 '+fmt(s.en)+'。</p>'}).join('')+
 '<p>傳富久久每年給付 '+fmt(pay)+' 之折現總和 '+fmt(pvPay)+'。</p>'+
 '<p>假設：僅本次贈與、同年度無其他合併計算之贈與；繼承發生於信託期滿後，並沿用 115 年稅制；久久之給付全數用於支出；資產以輸入金額計價（實務上不動產以公告現值、股權以淨值等評價）；未計入信託費用與投資報酬；未成年子女僅加扣所填距成年年數；傳富發發之效益主要在孳息移轉，不反映於稅額。</p>';
 $('result').hidden=false;$('result').scrollIntoView({behavior:'smooth'});
}
function chart(S,best){
 var W=720,H=340,pl=60,pb=50,pt=30,mx=Math.max.apply(null,S.map(function(s){return s.sum}))*1.15||1,
 bw=90,gap=(W-pl-4*bw)/5,ph=H-pt-pb,svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="遺產稅加贈與稅長條圖">';
 for(var i=0;i<=4;i++){var y=pt+ph-ph*i/4;svg+='<line x1="'+pl+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="'+(pl-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="var(--mute)">'+Math.round(mx*i/4).toLocaleString()+'</text>'}
 S.forEach(function(s,i){var x=pl+gap+i*(bw+gap),h=ph*s.sum/mx,y=pt+ph-h,c=s===best?'var(--green)':(i?'var(--amber)':'var(--mute)');
  svg+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" fill="'+c+'" rx="2"/><text x="'+(x+bw/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">'+fmt(s.sum)+'</text><text x="'+(x+bw/2)+'" y="'+(H-pb+22)+'" text-anchor="middle" font-size="14" fill="var(--ink)">'+s.name+'</text>'});
 svg+='<text x="'+pl+'" y="16" font-size="12" fill="var(--mute)">單位：萬元；綠色為稅負最低方案</text></svg>';
 $('chart').innerHTML=svg}
$('calc').onclick=calc;init();
})();
