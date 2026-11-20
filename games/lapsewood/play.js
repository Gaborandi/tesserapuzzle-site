const garden = document.getElementById('garden');
const statusLine = document.getElementById('status');
const undo = document.getElementById('undo');
const map = ['seed', 'seed', null, 'cloud', 'seed', 'cloud', null, null, 'seed'];
const targets = [0, 1, 4, 8];
const plants = ['seed','sprout','bush','tree','old_tree','fallen_log','soil'];
const water = ['water','ice','mist','cloud','rain'];
const names = { seed:'Seed', sprout:'Sprout', bush:'Bush', tree:'Tree', old_tree:'Old tree',
  fallen_log:'Fallen log', soil:'Soil', water:'Water', ice:'Ice', mist:'Mist', cloud:'Cloud', rain:'Rain' };
const instructions = 'Grow all four seeds into sprouts, bushes or trees.';
let current = map.slice();
let history = [];
let changed = [];
const tileNodes = map.map((state, index) => {
  const el = document.createElement(state ? 'button' : 'div');
  if (state) {
    el.className = 'tile';
    el.type = 'button';
    const img = document.createElement('img');
    img.alt = '';
    const label = document.createElement('span');
    el.append(img, label);
    el.addEventListener('click', () => tap(index));
  } else {
    el.className = 'tile-space';
    el.setAttribute('aria-hidden','true');
  }
  garden.append(el);
  return el;
});

function totalGrown() {
  return targets.filter(i => ['sprout','bush','tree'].includes(current[i])).length;
}

function render(message) {
  const moves = 3 - history.length;
  const growing = totalGrown();
  document.getElementById('moves').textContent = moves + (moves === 1 ? ' tap left' : ' taps left');
  document.getElementById('grown').textContent = growing + ' of 4 plants growing';
  const done = growing === 4 || moves === 0;
  current.forEach((state, index) => {
    if (!state) return;
    const el = tileNodes[index];
    el.firstElementChild.src = 'tiles/' + state + '.webp';
    el.lastElementChild.textContent = names[state];
    el.dataset.kind = water.includes(state) ? 'water' : 'plant';
    el.dataset.changed = String(changed.includes(index));
    el.setAttribute('aria-label', names[state] + ', row ' + (Math.floor(index / 3) + 1) + ', column ' + (index % 3 + 1));
    el.disabled = done || state === 'soil';
  });
  undo.disabled = history.length === 0;
  statusLine.textContent = growing === 4 ? 'Garden restored. All four seeds are growing.' :
    moves === 0 ? 'Out of taps. Undo a move or try the puzzle again.' : message;
}

function neighbors(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return [row > 0 ? index - 3 : -1, col > 0 ? index - 1 : -1, col < 2 ? index + 1 : -1, row < 2 ? index + 3 : -1];
}

function tap(index) {
  if (history.length === 3 || totalGrown() === 4 || current[index] === 'soil') return;
  history.push(current.slice());
  changed = [index];
  const before = current[index];
  const plantIndex = plants.indexOf(before);
  current[index] = plantIndex >= 0 ? plants[plantIndex + 1] : water[(water.indexOf(before) + 1) % water.length];
  const after = current[index];
  const advances = after === 'rain' ? ['seed','sprout','bush'] : after === 'water' ? ['seed','sprout'] : after === 'cloud' ? ['bush'] : [];
  for (const neighbor of neighbors(index)) {
    const plant = current[neighbor];
    const replacement = advances.includes(plant) ? plants[plants.indexOf(plant) + 1] :
      after === 'rain' && plant === 'soil' ? 'seed' : null;
    if (replacement) {
      current[neighbor] = replacement;
      changed.push(neighbor);
    }
  }
  const cascade = changed.length - 1;
  render(names[before] + ' became ' + names[after].toLowerCase() + '. ' +
    (cascade ? cascade + (cascade === 1 ? ' neighboring plant grew.' : ' neighboring plants grew.') : ''));
  if (totalGrown() === 4 || history.length === 3) undo.focus();
}

undo.addEventListener('click', () => {
  if (!history.length) return;
  current = history.pop();
  changed = [];
  render('Last tap and its chain undone.');
  if (!history.length) tileNodes[0].focus();
});
document.getElementById('reset').addEventListener('click', () => {
  history = [];
  current = map.slice();
  changed = [];
  render(instructions);
});
render(instructions);
