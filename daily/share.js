(function(root){
  'use strict';
  var dailyURL='https://gaborandi.github.io/tesserapuzzle-site/daily/?s=share';
  function formatResult(day,seconds){
    var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var elapsed=Math.max(0,Math.floor(seconds||0));
    return 'Tessera Daily · '+months[Number(day.slice(5,7))-1]+' '+Number(day.slice(8,10))+' · 5×5\n'
      +'🟩🟩🟩🟩🟩 solved in '+Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0')+' · no hints\n'+dailyURL;
  }
  function storeLinks(search,apple,play){
    var params=new URLSearchParams(search),values=params.getAll('s');
    if(values.length!==1||!/^[a-z_]{1,20}$/.test(values[0]))return {apple:apple,play:play};
    var a=new URL(apple),p=new URL(play),ref=new URLSearchParams(p.searchParams.get('referrer')||'');
    a.searchParams.set('pt','120202877');a.searchParams.set('ct','daily_'+values[0]);
    ref.set('utm_campaign','daily_'+values[0]);p.searchParams.set('referrer',ref.toString());
    return {apple:a.href,play:p.href};
  }
  async function copy(text,nav,doc){
    if(nav.clipboard&&typeof nav.clipboard.writeText==='function'){
      try{await nav.clipboard.writeText(text);return true;}catch(e){}
    }
    var ta=doc.createElement('textarea'),previous=doc.activeElement,copied=false;
    ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';
    doc.body.appendChild(ta);
    try{ta.focus();ta.select();copied=typeof doc.execCommand==='function'&&doc.execCommand('copy');}
    catch(e){}finally{ta.remove();if(previous&&typeof previous.focus==='function')previous.focus();}
    return !!copied;
  }
  var api={formatResult:formatResult,storeLinks:storeLinks,copy:copy};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.TesseraDailyShare=api;
})(typeof window==='object'?window:this);
