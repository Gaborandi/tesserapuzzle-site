(function(){
  'use strict';
  var G=window.TesseraDailyGenerator, day=new Date().toISOString().slice(0,10);
  var puzzle=G.generatePuzzleFromConfig({gridSize:5,regionSize:5,numRegions:5,seed:G.hashSeed('web-daily-'+day),checkUniqueness:true});
  var nums=puzzle.grid.flat(), answer=puzzle.solution.flat(), initial=Array(25).fill(-1);
  var names=['Coral','Green','Blue','Gold','Violet'],colors=['#ef6461','#4cc9b0','#5fa8d3','#f4c542','#b07cd8'];
  answer.forEach(function(r,i){if(initial.indexOf(r)<0)initial[i]=r;});
  var board=initial.slice(), selected=0, history=[], cells=[],swatches=[],focus=0;
  var startedAt=null,finishedSeconds=null,Share=window.TesseraDailyShare;
  // Source labels only: no storage, cookies, telemetry or network request.
  var links=Share.storeLinks(window.location.search,$('apple-store').href,$('play-store').href);
  $('apple-store').href=links.apple;$('play-store').href=links.play;
  function $(id){return document.getElementById(id);}
  function neighbors(i){return [i>=5?i-5:-1,i<20?i+5:-1,i%5?i-1:-1,i%5<4?i+1:-1].filter(function(x){return x>=0;});}
  function info(r){var indices=board.map(function(x,i){return x===r?i:-1;}).filter(function(i){return i>=0;}),seen=[],queue=indices.length?[indices[0]]:[];while(queue.length){var i=queue.shift();if(seen.indexOf(i)>=0)continue;seen.push(i);neighbors(i).forEach(function(j){if(board[j]===r&&seen.indexOf(j)<0)queue.push(j);});}var values=indices.map(function(i){return nums[i];}),repeats=[];
    [1,2,3,4,5].forEach(function(v){var at=indices.filter(function(i){return nums[i]===v;});if(at.length>1)repeats.push({value:v,count:at.length,fixed:at.filter(function(i){return initial[i]>=0;}).length,cells:at});});
    repeats.sort(function(x,y){return y.count-x.count||x.value-y.value;});
    return {count:indices.length,valid:indices.length===5&&new Set(values).size===5&&seen.length===5,repeats:repeats,joined:seen.length===indices.length,cells:indices};}
  function solved(){return names.every(function(_,r){return info(r).valid;});}
  function say(text,bad){$('feedback').textContent=text;$('feedback').className=bad?'error':'';}
  function render(){var done=solved();if(done&&finishedSeconds===null)finishedSeconds=startedAt===null?0:Math.floor((performance.now()-startedAt)/1000);if(!done){finishedSeconds=null;$('share-status').textContent='';$('share-manual').hidden=true;}var clash={};names.forEach(function(_,r){info(r).repeats.forEach(function(d){d.cells.forEach(function(i){clash[i]=true;});});});cells.forEach(function(b,i){var r=board[i];b.className='cell'+(r>=0?' owned':'')+(initial[i]>=0?' fixed':'')+(clash[i]?' clash':'');b.style.setProperty('--color',r>=0?colors[r]:'#464a60');b.style.setProperty('--tint',r>=0?colors[r]+'35':'#23273c');b.lastChild.textContent=r>=0?String.fromCharCode(65+r):'';b.tabIndex=i===focus?0:-1;b.setAttribute('aria-label','Row '+(Math.floor(i/5)+1)+', column '+(i%5+1)+', number '+nums[i]+', '+(r>=0?names[r]+' '+String.fromCharCode(65+r):'unfilled')+(initial[i]>=0?', starting tile':'')+(clash[i]?', repeated number':''));b.setAttribute('aria-pressed',String(r===selected));});swatches.forEach(function(b,r){var s=info(r);b.setAttribute('aria-pressed',String(selected===r));b.lastChild.textContent=s.valid?'✓ 5/5':s.count+'/5';b.setAttribute('aria-label',names[r]+' '+String.fromCharCode(65+r)+', '+s.count+' of 5 tiles'+(s.valid?', complete':''));});$('undo').disabled=!history.length;var wasHidden=$('win').hidden;$('win').hidden=!done;if(done&&wasHidden&&$('win').scrollIntoView)$('win').scrollIntoView({block:'center',behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(done)say('All five regions are connected and contain 1–5 once. Nicely solved.');}
  function choose(r){selected=r;render();if(!solved()){if(broken(r)){say(names[r]+' selected. '+explain(r),true);reveal();}else say(names[r]+' selected. Choose a tile.');}}
  function act(i){if(solved())return;if(initial[i]>=0){say('This is a starting tile. It stays fixed.');return;}if(startedAt===null)startedAt=performance.now();history.push(board.slice());board[i]=board[i]===selected?-1:selected;render();if(!solved())report(selected);}
  var words=['no','one','two','three','four','five','six'];
  function count(k){return words[k]||String(k);}
  function broken(r){var s=info(r);return !s.valid&&(s.count>5||s.repeats.length>0||s.count>1&&!s.joined);}
  function explain(r){
    var s=info(r),n=names[r];
    if(s.valid)return n+' is complete.';
    if(s.count>5){var extra=s.count-5;return n+' has '+s.count+' tiles. A region is exactly five. Clear '+(extra===1?'one tile':count(extra)+' tiles')+' you added, or use Undo.';}
    if(s.repeats.length){
      var d=s.repeats[0],mine=d.count-d.fixed,fix;
      if(d.fixed)fix='One is a starting tile and stays. Clear the '+(mine===1?'other one':count(mine)+' you added');
      else fix=d.count===2?'Tap one of them to clear it':'Clear all but one of them';
      return n+' has '+count(d.count)+' '+d.value+'s. Each region needs 1 to 5 once. '+fix+', or use Undo.';
    }
    if(s.count>1&&!s.joined)return n+' is split. Its tiles must touch along an edge. Corners do not count.';
    return n+': '+s.count+' of 5 tiles.';
  }
  // After a rule break, make sure the message and Undo are on screen. Ordinary moves never scroll.
  function reveal(){
    var c=document.querySelector('.controls').getBoundingClientRect(),f=$('feedback').getBoundingClientRect(),h=window.innerHeight;
    if(c.bottom<=h&&f.top>=0)return;
    var gentle=!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    window.scrollBy({top:c.bottom>h?Math.min(c.bottom-h+8,f.top-8):f.top-8,behavior:gentle?'smooth':'auto'});
  }
  function report(r){var bad=broken(r);say(explain(r),bad);if(bad)reveal();}
  nums.forEach(function(n,i){var b=document.createElement('button');b.type='button';var v=document.createElement('span');v.textContent=n;b.appendChild(v);b.appendChild(document.createElement('small'));b.addEventListener('click',function(){act(i);});b.addEventListener('keydown',function(e){var delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5};if(e.key in delta){e.preventDefault();var next=i+delta[e.key];if(next<0||next>=25||e.key==='ArrowLeft'&&i%5===0||e.key==='ArrowRight'&&i%5===4)return;focus=next;render();cells[next].focus();}else if(/^[a-e]$/i.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();choose(e.key.toUpperCase().charCodeAt(0)-65);}});b.addEventListener('focus',function(){focus=i;});$('board').appendChild(b);cells.push(b);});
  names.forEach(function(name,r){var b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+r);b.style.setProperty('--color',colors[r]);b.style.setProperty('--tint',colors[r]+'35');b.appendChild(document.createElement('small'));b.addEventListener('click',function(){choose(r);});$('palette').appendChild(b);swatches.push(b);});
  $('undo').onclick=function(){if(history.length){board=history.pop();render();if(broken(selected)){say('Last move undone. '+explain(selected),true);reveal();}else say('Last move undone.');}};
  $('restart').onclick=function(){$('reset').showModal();};$('keep').onclick=function(){$('reset').close();};$('confirm').onclick=function(){board=initial.slice();history=[];startedAt=null;finishedSeconds=null;render();say('Same daily puzzle, fresh start.');$('reset').close();};
  $('copy-result').onclick=async function(){
    if(!solved()||finishedSeconds===null)return;
    var text=Share.formatResult(day,finishedSeconds),copied=await Share.copy(text,navigator,document);
    $('share-status').textContent=copied?'Copied':'Copy unavailable. Select the result below to copy it.';
    $('share-manual').hidden=copied;
    if(!copied){$('share-manual').value=text;$('share-manual').focus();$('share-manual').select();}
  };
  $('day').textContent=day+' UTC';$('day').dateTime=day;$('loading').hidden=true;render();setInterval(function(){$('rollover').hidden=new Date().toISOString().slice(0,10)===day;},30000);
  // No analytics added. Existing sampler GoatCounter stays untouched: its
  // sampler01 events must not be contaminated by daily-puzzle activity.
})();
