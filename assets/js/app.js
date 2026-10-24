(function(){
'use strict';
var T=window.TAX,$=function(i){return document.getElementById(i)},st={sp:1,q1:1,q2:1};
function fmt(n){return n.toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})}
function num(v){var n=parseFloat(String(v).replace(/,/g,''));return isFinite(n)?n:NaN}
$('rate').value='';
document.addEventListener('input',function(e){var t=e.target;if(t.hasAttribute&&t.hasAttribute('data-num')){var dec=t.getAttribute('inputmode')==='decimal';t.value=t.value.replace(dec?/[^\d.]/g:/\D/g,'');t.classList.remove('bad');heirs()}});
function sync(){$('q2wrap').hidden=!st.q1;$('pwrap').hidden=!(st.q1&&st.q2)}
function itax(net){if(net<=0)return 0;var B=T.income.brackets;for(var i=0;i<B.length;i++){if(net<=B[i].upTo||i===B.length-1)return net*B[i].rate-B[i].diff}}
function heirs(){$('heirs').textContent=((num($('kids').value)||0)+st.sp)+' 人'}
document.querySelectorAll('.seg').forEach(function(g){g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 g.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});st[g.dataset.t]=+b.dataset.v;sync();heirs()})});
$('cur').onchange=function(){var c=this.value;$('rwrap').hidden=c==='TWD';$('rate').value=c==='USD'?T.defaults.usd:c==='JPY'?T.defaults.jpy:''};
function tax(net){if(net<=0)return 0;var B=T.gift.brackets;for(var i=0;i<B.length;i++){if(net<=B[i].upTo||i===B.length-1){return B[i].base+(net-(i?B[i-1].upTo:0))*B[i].rate}}}
function gift(v){var net=Math.max(0,v-T.gift.exemption);return{net:net,tax:tax(net)}}
function calc(){
 var m=$('msg');m.textContent='';
 var a=num($('amt').value),c=$('cur').value,r=1,n=+$('years').value,d=num($('disc').value)/100,y=num($('yld').value)/100,k=num($('kids').value),q1=st.q1===1,q2=q1&&st.q2===1,pay=q2?num($('pay').value):0;
 if(c!=='TWD'){r=num($('rate').value);if(!(r>0)){$('rate').classList.add('bad');m.textContent='請輸入有效匯率。';return}}
 if(!(a>0)){m.textContent='請輸入信託資產規模（須大於 0）。';return}
 if(isNaN(k)||isNaN(y)||isNaN(pay)||!(d>0)){m.textContent='請完整輸入子女人數、折現利率、配息率與自留生活費（僅限數字，無則填 0）。';return}
 if(!q1&&k<1){m.textContent='本金不給子女時，孳息由子女取得，子女人數至少須為 1。';return}
 if(q2&&!(pay>0)){m.textContent='請輸入每年自留固定生活費（須大於 0），或將該項改為「否」。';return}
 var P=a*r;
 if(pay*n>P){m.textContent='每年自留生活費 × 信託期間不可超過信託本金，請調整。';return}
 var v=Math.pow(1+d,-n),pvPay=pay*(1-v)/d,Y=P*y,yi=Y*n,S,I=T.income;
 if(!q1){
  var ni=Math.max(0,Y/k-I.exemption-I.standard),g=gift(P-P*v),g0=tax(Math.max(0,Y-T.gift.exemption));
  S=[{name:'不使用信託',alt:'（每年贈與孳息給子女）',inv:0,gv:n*Y,gtax:n*g0,itax:n*Y*I.settlorRate,own:'委託人保有本金',flow:'孳息歸子女，約 '+fmt(yi)},
     {name:'傳富發發 (88)',inv:P,gv:P-P*v,gtax:g.tax,itax:n*k*itax(ni),own:'委託人取得本金',flow:'孳息歸子女，約 '+fmt(yi)}];
 }else{
  var G0=q2?P+yi-pay*n:P,h0=gift(G0),gv=q2?Math.max(0,P-pvPay):P*v,g1=gift(gv);
  S=[{name:'不使用信託',alt:q2?'（一次贈與剩餘本金）':'（一次贈與本金）',inv:0,gv:G0,net:h0.net,gtax:h0.tax,itax:0,own:q2?'子女一次取得剩餘本金':'子女一次取得本金',left:null,flow:'不適用'},
     {name:q2?'傳富久久 (99)':'傳富發我 (85)',inv:P,gv:gv,net:g1.net,gtax:g1.tax,itax:0,own:q2?'子女取得剩餘金額':'子女取得本金',left:q2?G0:P,flow:q2?'每年給付委託人 '+fmt(pay)+'，共 '+fmt(pay*n):'孳息歸委託人，約 '+fmt(yi)}];
 }
 S.forEach(function(s){s.tax=s.gtax+s.itax});
 var mn=Math.min(S[0].tax,S[1].tax),best=S.filter(function(s){return s.tax-mn<0.005}),b0=S[0];
 var cmpTxt=best.indexOf(b0)>=0?'':'，較不使用信託'+(b0.tax>=mn?'節省 '+fmt(b0.tax-mn):'多繳 '+fmt(mn-b0.tax))+' 萬元';
 $('concl').innerHTML=(best.length>1?'稅額相同，皆適合：':'最適合您的方案：')+best.map(function(s){return s.name}).join('、')+'<small>預估應繳稅額最低，為 '+fmt(mn)+' 萬元（NT$ '+Math.round(mn*10000).toLocaleString('zh-TW')+' 元）'+cmpTxt+'。各方案本金歸屬不同，請搭配客戶需求說明。</small>';
 $('ctitle').textContent=q1?'預估贈與稅比較':'預估應繳稅額比較（贈與稅＋所得稅）';
 var h='<thead><tr><th>比較項目</th>'+S.map(function(s){return'<th>'+s.name+(s.alt?'<br><small>'+s.alt+'</small>':'')+'</th>'}).join('')+'</tr></thead><tbody>';
 function row(l,f,cls){return'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+S.map(function(s,i){return'<td>'+f(s,i)+'</td>'}).join('')+'</tr>'}
 h+=row('投入信託本金',function(s){return s.inv?fmt(s.inv):'0'});
 if(q1){
  h+=row('贈與價值（稅基）',function(s){return fmt(s.gv)});
  h+=row('減：贈與稅免稅額',function(s){return fmt(s.gv-s.net)});
  h+=row('課稅贈與淨額',function(s){return fmt(s.net)});
  h+=row('預估贈與稅',function(s){return fmt(s.gtax)},'key');
  h+=row('期滿後本金歸屬',function(s){return s.own});
  h+=row(n+' 年後本金／剩餘金額',function(s){return s.left==null?'不適用':fmt(s.left)});
 }else{
  h+=row('贈與價值合計（稅基）',function(s){return fmt(s.gv)});
  h+=row('預估贈與稅合計',function(s){return fmt(s.gtax)});
  h+=row('預估所得稅合計（'+n+' 年）',function(s){return fmt(s.itax)});
  h+=row('預估應繳稅額（贈與稅＋所得稅）',function(s){return fmt(s.tax)},'key');
  h+=row('期滿後本金歸屬',function(s){return s.own});
 }
 h+=row('信託期間現金流（配息率 '+(y*100).toFixed(2)+'%）',function(s){return s.flow});
 h+=row('相較不使用信託的稅負差額',function(s,i){if(!i)return'—';var df=s.tax-b0.tax;return df>0.005?'<span class="worse">增加 '+fmt(df)+'</span>':df<-0.005?'<span class="best">減少 '+fmt(-df)+'</span>':'相同'});
 $('cmp').innerHTML=h+'</tbody>';
 chart(S,best);
 $('detail').innerHTML='<p>信託本金折合新台幣 '+fmt(P)+' 萬；信託 '+n+' 年；折現利率 '+(d*100).toFixed(3)+'%；傳承人數 '+((k||0)+st.sp)+' 人（贈與稅免稅額 '+T.gift.exemption+' 萬為「每位贈與人每年」，不因受贈人數增加；配偶不列為受贈對象）。</p>'+
 (q1?(q2?'<p>傳富久久：每年給付 '+fmt(pay)+' 萬折現總和 '+fmt(pvPay)+' 萬；贈與價值＝本金 − 折現總和。期滿剩餘本金＝本金 '+fmt(P)+' ＋ 期間孳息 '+fmt(yi)+' － 自留生活費 '+fmt(pay*n)+' ＝ '+fmt(G0)+' 萬（兩方案同一口徑）；不使用信託以此金額一次贈與計算，傳富久久之贈與價值仍依稅法折現公式。</p>':'<p>傳富發我：贈與價值＝本金折現值；不使用信託以本金 '+fmt(P)+' 萬一次贈與計算。</p>')+'<p>此情境僅比較贈與稅，未計入所得稅。</p>':
 '<p>不使用信託：每年孳息 '+fmt(Y)+' 萬由委託人先課所得稅（假設最高級距 '+(I.settlorRate*100)+'%），再贈與子女，每年各自適用贈與稅免稅額。</p><p>傳富發發：孳息歸子女，由 '+k+' 位子女均分，每人年所得 '+fmt(Y/k)+' 萬，扣除免稅額 '+I.exemption+'、標準扣除額 '+I.standard+' 萬（115年度）後依綜所得稅累進稅率計算，假設子女無其他收入、無其他扣除額，亦未計入儲蓄投資特別扣除。</p>')+
 '<p>共同假設：同年度無其他合併計算之贈與；信託費用未計入；孳息以「本金 × 配息率 × 年數」簡單估算（不複利）；繼承稅未納入。</p>';
 $('result').hidden=false;$('result').scrollIntoView({behavior:'smooth'});
}
function chart(S,best){
 var W=720,H=340,pl=60,pb=50,pt=30,mx=Math.max.apply(null,S.map(function(s){return s.tax}))*1.2||1,bw=90,gap=(W-pl-S.length*bw)/(S.length+1),ph=H-pt-pb,
 svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="預估應繳稅額長條圖">';
 for(var i=0;i<=4;i++){var y=pt+ph-ph*i/4;svg+='<line x1="'+pl+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="'+(pl-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="var(--mute)">'+Math.round(mx*i/4).toLocaleString()+'</text>'}
 S.forEach(function(s,i){var x=pl+gap+i*(bw+gap),h=ph*s.tax/mx,y=pt+ph-h,c=best.indexOf(s)>=0?'var(--green)':(i?'var(--amber)':'var(--mute)');
  svg+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+Math.max(h,1)+'" fill="'+c+'" rx="2"/><text x="'+(x+bw/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">'+fmt(s.tax)+'</text><text x="'+(x+bw/2)+'" y="'+(H-pb+22)+'" text-anchor="middle" font-size="12" fill="var(--ink)">'+s.name+'</text>'});
 $('chart').innerHTML=svg+'<text x="'+pl+'" y="16" font-size="12" fill="var(--mute)">單位：萬元；綠色為稅額最低方案</text></svg>'}
$('calc').onclick=calc;sync();heirs();
})();
