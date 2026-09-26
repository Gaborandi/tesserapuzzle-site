'use strict';
(() => {
  const C = window.TesseraChallenge;
  const $ = id => document.getElementById(id);
  const key = 'tessera.challenge.01.v1';
  const local = ['localhost','127.0.0.1','::1'].includes(location.hostname) || location.protocol === 'file:';
  let board = C.initial.slice(), selected = 1, continued = false, history = [], hints = 0, activeMs = 0, started = false;
  let hintIndex = -1, focusIndex = 0, lastTick = performance.now(), storageAvailable = true, visible = !document.hidden;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && C.validSavedBoard(saved.board)) {
      board = saved.board.slice(); selected = Number.isInteger(saved.selected) && saved.selected >= 0 && saved.selected < 6 ? saved.selected : 1;
      continued = saved.continued === true || board.some((r,i) => C.initial[i] < 0 && r >= 3);
      history = Array.isArray(saved.history) ? saved.history.filter(C.validSavedBoard).slice(-200) : [];
      hints = Number.isInteger(saved.hints) && saved.hints >= 0 && saved.hints < 10000 ? saved.hints : 0;
      activeMs = Number.isFinite(saved.activeMs) && saved.activeMs >= 0 && saved.activeMs < 864000000 ? saved.activeMs : 0;
      started = board.some((r,i) => C.initial[i] !== r);
    }
  } catch (_) { storageAvailable = false; }
  const phase = () => C.solved(board) ? 'done' : continued ? 'full' : C.inspect(board,1).complete ? 'ready' : 'opening';
  function tick() {
    const now = performance.now();
    if (started && visible && phase() !== 'done' && phase() !== 'ready') activeMs += Math.max(0,now-lastTick);
    lastTick = now;
  }
  function save() {
    try { localStorage.setItem(key,JSON.stringify({board,selected,continued,history,hints,activeMs})); }
    catch (_) { storageAvailable = false; }
  }
  function feedback(text,kind='') { $('feedback').textContent = text; $('feedback').className = 'feedback '+kind; }
  function announceDefault() {
    const p = phase();
    if (p === 'opening') feedback('Two regions are already done. Finish green to learn the rule.');
    else if (p === 'ready') feedback('Green now has 1–6, once each, with every tile connected.','success');
    else if (p === 'done') feedback('All 36 tiles belong to six valid regions.','success');
    else {
      const info = C.inspect(board,selected);
      if (info.complete) feedback(C.regions[selected].name+' '+C.regions[selected].letter+' is complete. Choose an unfinished color.','success');
      else if (info.cells.length > 1 && !info.joined) feedback('This region is split. Reconnect its tiles along their edges, or undo.','error');
      else if (!info.cells.length) feedback('Start '+C.regions[selected].name.toLowerCase()+' '+C.regions[selected].letter+' on any unfilled tile, then grow along its edges.');
      else feedback('Still needed: '+info.missing.join(', ')+'. Tap a tile with the selected color to clear it.');
    }
  }
  const cells = C.grid.map((n,i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cell'; b.dataset.index = i;
    const num = document.createElement('span'); num.textContent = n; b.appendChild(num);
    const letter = document.createElement('span'); letter.className = 'region-letter'; letter.setAttribute('aria-hidden','true'); b.appendChild(letter);
    b.addEventListener('click',() => act(i));
    b.addEventListener('keydown',event => {
      const movement = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-6,ArrowDown:6};
      if (event.key in movement) {
        event.preventDefault();
        let next = i + movement[event.key];
        if (event.key === 'ArrowLeft' && i%6 === 0 || event.key === 'ArrowRight' && i%6 === 5 || next < 0 || next > 35) return;
        focusIndex = next; cells.forEach((c,j) => c.tabIndex = j === next ? 0 : -1); cells[next].focus();
      } else if (!event.metaKey && !event.ctrlKey && !event.altKey && /^[a-f]$/i.test(event.key) && phase() === 'full') { event.preventDefault(); choose(event.key.toUpperCase().charCodeAt(0)-65); }
    });
    b.addEventListener('focus',() => { focusIndex=i; cells.forEach((c,j) => c.tabIndex=j === i ? 0 : -1); });
    $('board').appendChild(b); return b;
  });
  const swatches = C.regions.map((region,r) => {
    const b = document.createElement('button'); b.type='button'; b.className='swatch';
    b.style.setProperty('--color',region.color); b.style.setProperty('--tint',region.color+'25');
    const dot = document.createElement('span'); dot.className='dot'; dot.textContent=region.letter; b.appendChild(dot);
    const count=document.createElement('span'); count.className='swatch-count'; b.appendChild(count);
    b.addEventListener('click',() => choose(r)); $('palette').appendChild(b); return b;
  });
  const numberBadges = Array.from({length:6},(_,i) => {
    const s=document.createElement('span'); s.className='number'; s.textContent=i+1; $('numbers').appendChild(s); return s;
  });
  // The size range remains visible below the game on phones, beside it on desktop.
  const mobileRange = document.createElement('div'); mobileRange.className='mobile-range';
  mobileRange.appendChild(document.querySelector('.range').cloneNode(true));
  $('controls').parentNode.appendChild(mobileRange);
  function render() {
    const p=phase(), chosen=C.regions[selected], info=C.inspect(board,selected);
    document.documentElement.style.setProperty('--selected',chosen.color);
    cells.forEach((b,i) => {
      const r=board[i], region=r >= 0 ? C.regions[r] : null;
      b.className='cell'+(r >= 0 ? ' owned' : '')+(C.initial[i] >= 0 ? ' fixed' : '')+(r === selected ? ' selected' : '')+(hintIndex === i ? ' hinted' : '');
      b.style.setProperty('--color',region ? region.color : '#414055'); b.style.setProperty('--tint',region ? region.color+'32' : '#242438');
      b.lastChild.textContent = region ? region.letter : '';
      b.tabIndex=i === focusIndex ? 0 : -1;
      b.setAttribute('aria-label','Row '+(Math.floor(i/6)+1)+', column '+(i%6+1)+', number '+C.grid[i]+', '+(region ? region.name+' '+region.letter : 'unfilled')+(C.initial[i] >= 0 ? ', starting tile' : ''));
      b.setAttribute('aria-pressed',r === selected ? 'true' : 'false');
    });
    swatches.forEach((b,r) => {
      const s=C.inspect(board,r); b.setAttribute('aria-pressed',selected === r ? 'true' : 'false');
      b.setAttribute('aria-label',C.regions[r].name+' '+C.regions[r].letter+', '+s.cells.length+' of 6 tiles'+(s.complete ? ', complete' : ''));
      b.lastChild.textContent = s.complete ? '✓ 6/6' : s.cells.length+'/6';
    });
    numberBadges.forEach((s,i) => { const has=info.numbers.includes(i+1); s.className='number '+(has ? 'present' : 'missing'); s.setAttribute('aria-label',(i+1)+(has ? ', present' : ', needed')); });
    $('regionName').textContent=chosen.letter+' · '+chosen.name;
    $('completionCount').textContent=C.regions.filter((_,r) => C.inspect(board,r).complete).length+' / 6 regions';
    $('palette').hidden = p !== 'full'; $('continue').hidden=p !== 'ready'; $('win').hidden=p !== 'done';
    $('selectedRegion').hidden=p === 'done'; $('controls').hidden=p === 'done'; $('undo').disabled=!history.length;
    $('board').classList.toggle('solved',p === 'done');
    if (p === 'opening') {
      $('cueLabel').textContent='YOUR FIRST MOVE'; $('cueTitle').textContent='Green needs a 1. Which one fits?'; $('cueText').textContent='Tap a 1 that touches green along an edge.';
    } else if (p === 'ready') {
      $('cueLabel').textContent='THAT’S THE IDEA'; $('cueTitle').textContent='Six tiles. Six different numbers.'; $('cueText').textContent='They all connect along their edges. Ready for the rest?';
    } else if (p === 'full') {
      $('cueLabel').textContent='MAKE EVERY PIECE BELONG'; $('cueTitle').textContent='Finish the remaining regions.'; $('cueText').textContent='Choose a color below, then join six different numbers.';
    } else {
      $('cueLabel').textContent='CHALLENGE COMPLETE'; $('cueTitle').textContent='You found the whole mosaic.'; $('cueText').textContent='Every region has 1–6, once each. Every tile connects.';
      const seconds=Math.floor(activeMs/1000);
      $('resultDetails').textContent=Math.floor(seconds/60)+'m '+String(seconds%60).padStart(2,'0')+'s of active play · '+hints+' hint'+(hints===1?'':'s');
      $('resultText').value=C.resultText(seconds,hints,challengeURL());
    }
  }
  function choose(r) { if (phase() !== 'full') return; selected=r; hintIndex=-1; render(); announceDefault(); save(); }
  function act(i) {
    const p=phase(); if (p === 'done') { feedback('Solved. Copy your result below to invite someone to the same challenge.','success'); return; }
    if (p === 'ready') { feedback('Select “Finish this puzzle” below when you’re ready for the other regions.'); return; }
    tick(); started=true;
    const result=C.place(board,i,selected,p);
    if (!result.ok) { feedback(result.message,'error'); cells[i].classList.remove('wrong'); void cells[i].offsetWidth; cells[i].classList.add('wrong'); return; }
    history.push(board.slice()); history=history.slice(-200); board=result.board; hintIndex=-1;
    render(); announceDefault(); save();
    if (phase() === 'ready') $('continue').focus({preventScroll:true});
    if (phase() === 'done') { $('copyResult').focus({preventScroll:true}); $('win').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
  }
  $('continue').addEventListener('click',() => { tick(); continued=true; selected=3; render(); announceDefault(); save(); });
  $('undo').addEventListener('click',() => { if (!history.length) return; tick(); board=history.pop(); hintIndex=-1; if (!continued) selected=1; render(); announceDefault(); save(); });
  $('hint').addEventListener('click',() => {
    if (phase() === 'ready') { feedback('You have already found this region. Continue below to try the rest.','success'); return; }
    const answer=C.completionFor(board);
    if (!answer) { feedback('A previous choice blocks a full solution. Undo recent moves until a hint can fit.','error'); return; }
    let r=phase() === 'opening' ? 1 : selected;
    if (C.inspect(board,r).complete) r=C.regions.findIndex((_,reg) => !C.inspect(board,reg).complete);
    const occupied=C.inspect(board,r).cells;
    const i=answer.findIndex((reg,index) => reg === r && board[index] < 0 && (!occupied.length || C.neighbors(index).some(j => board[j] === r)));
    if (i < 0) { feedback('Reconnect this region or undo its last change before adding another tile.','error'); return; }
    if (hintIndex !== i) hints++; hintIndex=i; selected=r; render(); save();
    feedback('Try the outlined '+C.grid[i]+' in row '+(Math.floor(i/6)+1)+', column '+(i%6+1)+'. '+(occupied.length ? 'It joins '+C.regions[r].name.toLowerCase()+' '+C.regions[r].letter+' along an edge.' : 'Start '+C.regions[r].name.toLowerCase()+' '+C.regions[r].letter+' here.'));
  });
  $('reset').addEventListener('click',() => $('resetDialog').showModal());
  $('playAgain').addEventListener('click',() => $('resetDialog').showModal());
  $('cancelReset').addEventListener('click',() => $('resetDialog').close());
  $('confirmReset').addEventListener('click',() => {
    $('resetDialog').close(); board=C.initial.slice(); selected=1; continued=false; history=[]; hints=0; activeMs=0; started=false; lastTick=performance.now(); hintIndex=-1; focusIndex=0;
    $('resultText').hidden=true; render(); announceDefault(); save(); cells[0].focus({preventScroll:true}); $('cue').scrollIntoView({block:'start',behavior:'auto'});
  });
  function challengeURL() { return location.origin+location.pathname; }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) { return false; }
  }
  $('copyLink').addEventListener('click',async () => {
    const ok=await copy(challengeURL());
    $('copyLink').textContent=ok ? (local ? 'Local preview link copied' : 'Challenge link copied') : 'Select the address above to copy';
    if (local) $('previewNote').hidden=false;
  });
  $('copyResult').addEventListener('click',async () => {
    const ok=await copy($('resultText').value);
    $('resultText').hidden=false;
    if (!ok) { $('resultText').focus(); $('resultText').select(); }
    $('copyResult').textContent=ok ? 'Result copied'+(local?' · local preview link':'') : 'Select and copy your result below';
  });
  document.addEventListener('visibilitychange',() => { tick(); visible=!document.hidden; save(); });
  window.addEventListener('pagehide',() => { tick(); save(); });
  setInterval(tick,1000);
  $('previewBadge').hidden=!local; $('previewNote').hidden=!local;
  render(); announceDefault();
  if (!storageAvailable) feedback('Progress cannot be saved in this browser. You can still play in this tab.');
})();
