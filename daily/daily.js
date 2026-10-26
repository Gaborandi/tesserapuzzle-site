(function(){
  'use strict';
  var G=window.TesseraDailyGenerator, day=new Date().toISOString().slice(0,10);
  var puzzle=G.generatePuzzleFromConfig({gridSize:5,regionSize:5,numRegions:5,seed:G.hashSeed('web-daily-'+day),checkUniqueness:true});
  var nums=puzzle.grid.flat(), answer=puzzle.solution.flat(), initial=Array(25).fill(-1);
  var names=['Coral','Green','Blue','Gold','Violet'],colors=['#ef6461','#4cc9b0','#5fa8d3','#f4c542','#b07cd8'];
  answer.forEach(function(r,i){if(initial.indexOf(r)<0)initial[i]=r;});
  var board=initial.slice(), selected=0, history=[], cells=[],swatches=[],focus=0;
  function $(id){return document.getElementById(id);}
  function neighbors(i){return [i>=5?i-5:-1,i<20?i+5:-1,i%5?i-1:-1,i%5<4?i+1:-1].filter(function(x){return x>=0;});}
  function info(r){var indices=board.map(function(x,i){return x===r?i:-1;}).filter(function(i){return i>=0;}),seen=[],queue=indices.length?[indices[0]]:[];while(queue.length){var i=queue.shift();if(seen.indexOf(i)>=0)continue;seen.push(i);neighbors(i).forEach(function(j){if(board[j]===r&&seen.indexOf(j)<0)queue.push(j);});}var values=indices.map(function(i){return nums[i];});return {count:indices.length,valid:indices.length===5&&new Set(values).size===5&&seen.length===5};}
  function solved(){return names.every(function(_,r){return info(r).valid;});}
  function say(text){$('feedback').textContent=text;}
  function render(){var done=solved();cells.forEach(function(b,i){var r=board[i];b.className='cell'+(r>=0?' owned':'')+(initial[i]>=0?' fixed':'');b.style.setProperty('--color',r>=0?colors[r]:'#464a60');b.style.setProperty('--tint',r>=0?colors[r]+'35':'#23273c');b.lastChild.textContent=r>=0?String.fromCharCode(65+r):'';b.tabIndex=i===focus?0:-1;b.setAttribute('aria-label','Row '+(Math.floor(i/5)+1)+', column '+(i%5+1)+', number '+nums[i]+', '+(r>=0?names[r]+' '+String.fromCharCode(65+r):'unfilled')+(initial[i]>=0?', starting tile':''));b.setAttribute('aria-pressed',String(r===selected));});swatches.forEach(function(b,r){var s=info(r);b.setAttribute('aria-pressed',String(selected===r));b.lastChild.textContent=s.valid?'✓ 5/5':s.count+'/5';b.setAttribute('aria-label',names[r]+' '+String.fromCharCode(65+r)+', '+s.count+' of 5 tiles'+(s.valid?', complete':''));});$('undo').disabled=!history.length;$('win').hidden=!done;if(done)say('All five regions are connected and contain 1–5 once. Nicely solved.');}
  function choose(r){selected=r;render();if(!solved())say(names[r]+' selected. Choose a tile.');}
  function act(i){if(solved())return;if(initial[i]>=0){say('This is a starting tile. It stays fixed.');return;}history.push(board.slice());board[i]=board[i]===selected?-1:selected;render();if(!solved())say(info(selected).valid?names[selected]+' is complete.':names[selected]+': '+info(selected).count+' of 5 tiles.');}
  nums.forEach(function(n,i){var b=document.createElement('button');b.type='button';var v=document.createElement('span');v.textContent=n;b.appendChild(v);b.appendChild(document.createElement('small'));b.addEventListener('click',function(){act(i);});b.addEventListener('keydown',function(e){var delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5};if(e.key in delta){e.preventDefault();var next=i+delta[e.key];if(next<0||next>=25||e.key==='ArrowLeft'&&i%5===0||e.key==='ArrowRight'&&i%5===4)return;focus=next;render();cells[next].focus();}else if(/^[a-e]$/i.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();choose(e.key.toUpperCase().charCodeAt(0)-65);}});b.addEventListener('focus',function(){focus=i;});$('board').appendChild(b);cells.push(b);});
  names.forEach(function(name,r){var b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+r);b.style.setProperty('--color',colors[r]);b.style.setProperty('--tint',colors[r]+'35');b.appendChild(document.createElement('small'));b.addEventListener('click',function(){choose(r);});$('palette').appendChild(b);swatches.push(b);});
  $('undo').onclick=function(){if(history.length){board=history.pop();render();say('Last move undone.');}};
  $('restart').onclick=function(){$('reset').showModal();};$('keep').onclick=function(){$('reset').close();};$('confirm').onclick=function(){board=initial.slice();history=[];render();say('Same daily puzzle, fresh start.');$('reset').close();};
  $('day').textContent=day+' UTC';$('day').dateTime=day;$('loading').hidden=true;render();setInterval(function(){$('rollover').hidden=new Date().toISOString().slice(0,10)===day;},30000);
  // No analytics added. Existing sampler GoatCounter stays untouched: its
  // sampler01 events must not be contaminated by daily-puzzle activity.
})();
