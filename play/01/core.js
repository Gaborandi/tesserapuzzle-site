(function (root) {
  'use strict';
  const size = 6;
  const grid = [2,1,4,5,6,4,6,3,3,4,5,5,6,6,4,6,1,3,1,3,2,2,3,2,5,4,5,1,4,1,2,3,5,6,1,2];
  const initial = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,1,1,-1,-1,-1,2,1,1,-1,0,-1,2,2,1,-1,0,-1,2,2,0,0,0,0];
  const reference = [5,5,5,5,4,4,5,5,3,3,3,4,2,1,1,3,3,4,2,1,1,3,0,4,2,2,1,1,0,4,2,2,0,0,0,0];
  const regions = [
    { name: 'Coral', color: '#ef6461', letter: 'A' },
    { name: 'Green', color: '#4cc9b0', letter: 'B' },
    { name: 'Blue', color: '#5fa8d3', letter: 'C' },
    { name: 'Gold', color: '#f4c542', letter: 'D' },
    { name: 'Violet', color: '#b07cd8', letter: 'E' },
    { name: 'Orange', color: '#ff8a50', letter: 'F' }
  ];
  function neighbors(i) {
    return [i >= 6 ? i-6 : -1, i < 30 ? i+6 : -1, i%6 ? i-1 : -1, i%6 < 5 ? i+1 : -1].filter(j => j >= 0);
  }
  function connected(cells) {
    if (!cells.length) return false;
    const allowed = new Set(cells), seen = new Set([cells[0]]), queue = [cells[0]];
    for (const i of queue) for (const j of neighbors(i)) if (allowed.has(j) && !seen.has(j)) { seen.add(j); queue.push(j); }
    return seen.size === cells.length;
  }
  function inspect(board, region) {
    const cells = board.flatMap((r,i) => r === region ? [i] : []);
    const numbers = cells.map(i => grid[i]);
    const missing = Array.from({length:6},(_,i) => i+1).filter(n => !numbers.includes(n));
    const duplicate = numbers.find((n,i) => numbers.indexOf(n) !== i);
    const joined = connected(cells);
    return { cells, numbers, missing, duplicate, joined, complete: cells.length === 6 && !duplicate && joined };
  }
  function solved(board) {
    return Array.isArray(board) && board.length === 36 && board.every(r => Number.isInteger(r) && r >= 0 && r < 6) &&
      regions.every((_,r) => inspect(board,r).complete);
  }
  function validSavedBoard(board) {
    return Array.isArray(board) && board.length === 36 && board.every((r,i) => Number.isInteger(r) && r >= -1 && r < 6 && (initial[i] < 0 || initial[i] === r)) &&
      regions.every((_,r) => { const s = inspect(board,r); return s.cells.length <= 6 && !s.duplicate; });
  }
  // One curated board; the six label permutations are equivalent, valid solutions.
  // Validation above accepts the rules, not a particular reference coloring.
  const permutations = [[3,4,5],[3,5,4],[4,3,5],[4,5,3],[5,3,4],[5,4,3]];
  function completionFor(board) {
    for (const p of permutations) {
      const candidate = reference.map(r => r < 3 ? r : p[r-3]);
      if (board.every((r,i) => r < 0 || candidate[i] === r)) return candidate;
    }
    return null;
  }
  function place(board, index, region, phase) {
    if (initial[index] >= 0) return { ok:false, message:'These starting tiles are fixed. Choose an unfilled tile.' };
    if (phase === 'opening' && region !== 1) return { ok:false, message:'First, finish green B. It needs one 1.' };
    const old = board[index];
    if (old === region) { const next = board.slice(); next[index] = -1; return { ok:true, board:next }; }
    if (old >= 0) return { ok:false, message:'Tap this tile with its current color selected to clear it first.' };
    const info = inspect(board,region);
    if (info.cells.length >= 6) return { ok:false, message:regions[region].name+' '+regions[region].letter+' already has six tiles. Choose another color.' };
    if (info.numbers.includes(grid[index])) return { ok:false, message:regions[region].name+' '+regions[region].letter+' already has a '+grid[index]+'. Every number appears once.' };
    if (info.cells.length && !neighbors(index).some(i => board[i] === region)) return { ok:false, message:'Join this region along an edge. Diagonal corners do not connect.' };
    const next = board.slice(); next[index] = region;
    return { ok:true, board:next };
  }
  function resultText(seconds,hints,url) {
    const minutes = Math.floor(seconds/60), remainder = seconds%60;
    return 'Tessera · Challenge 01\n6×6 Logic · solved\n'+minutes+'m '+String(remainder).padStart(2,'0')+'s · '+hints+' hint'+(hints === 1 ? '' : 's')+'\nThe numbers stay. You choose the regions.\n'+url;
  }
  const api = Object.freeze({ size, grid:Object.freeze(grid), initial:Object.freeze(initial), reference:Object.freeze(reference), regions, neighbors, connected, inspect, solved, validSavedBoard, completionFor, place, resultText });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TesseraChallenge = api;
})(typeof window !== 'undefined' ? window : this);
