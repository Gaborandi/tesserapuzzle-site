const palette = document.getElementById('palette');
const mixButton = document.getElementById('mix');
const swatch = document.getElementById('mixture');
const statusLine = document.getElementById('status');
const required = 6;
const targetRecipe = '1,5,0';
const pigments = ['Vermilion','Lead White','Prussian Blue'];
let units = [0,0,0];
let colors;
const rows = pigments.map((name, index) => {
  const row = document.createElement('div');
  row.className = 'pigment';
  const nameEl = document.createElement('span');
  nameEl.className = 'pigment-name';
  nameEl.textContent = name;
  const subtract = document.createElement('button');
  const add = document.createElement('button');
  for (const [control, label, step] of [[subtract, 'Remove', -1],[add, 'Add', 1]]) {
    control.type = 'button';
    control.className = 'button secondary';
    control.textContent = step === 1 ? '+' : '−';
    control.setAttribute('aria-label', label + ' ' + name);
    control.addEventListener('click', () => adjust(index, step));
  }
  const amount = document.createElement('output');
  amount.setAttribute('aria-label', name + ' units');
  amount.setAttribute('aria-live', 'off');
  row.append(nameEl, subtract, amount, add);
  palette.append(row);
  return { subtract, add, amount };
});

const total = () => units.reduce((sum, value) => sum + value, 0);

function render() {
  const used = total();
  rows.forEach(({subtract, add, amount}, index) => {
    amount.textContent = units[index];
    subtract.disabled = units[index] === 0;
    add.disabled = used === required;
  });
  document.getElementById('total').textContent = used + ' of ' + required + ' units';
  mixButton.disabled = used !== required || !colors;
}

function adjust(index, step) {
  if (units[index] + step < 0 || total() + step > required) return;
  units[index] += step;
  render();
  const action = step === 1 ? rows[index].add : rows[index].subtract;
  if (action.disabled) {
    if (!mixButton.disabled && step === 1) mixButton.focus();
    else if (!rows[index].add.disabled) rows[index].add.focus();
    else rows[index].subtract.focus();
  }
  if (colors) statusLine.textContent = total() === required ? 'Six units ready. Mix and compare.' : 'Adjust the pigment amounts, then mix.';
}

mixButton.addEventListener('click', () => {
  const recipe = units.join(',');
  const mixtureColor = colors?.[recipe];
  if (!mixtureColor) return;
  swatch.style.backgroundColor = mixtureColor;
  statusLine.textContent = recipe === targetRecipe
    ? 'You matched Cherry Blossom pink. One Vermilion and five Lead White.'
    : 'This mixture is a different shade. Change the recipe and try again.';
});
document.getElementById('reset').addEventListener('click', () => {
  units = [0,0,0];
  swatch.style.backgroundColor = '';
  statusLine.textContent = colors ? 'Add six units to mix another shade.' : 'The mixing palette is unavailable. Reload to retry.';
  render();
});

render();
fetch('mixes.json').then(response => {
  if (!response.ok) throw Error('Pigment palette could not be read.');
  return response.json();
}).then(table => {
  colors = table;
  render();
}).catch(() => {
  statusLine.textContent = 'The mixing palette is unavailable. Reload to retry.';
});
