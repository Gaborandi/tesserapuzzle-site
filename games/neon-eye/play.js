const strike = document.getElementById('strike');
const resetButton = document.getElementById('reset');
const statusLine = document.getElementById('status');
const attemptsLabel = document.getElementById('attempts');
const hitsLabel = document.getElementById('hits');
const target = document.getElementById('target');
const needle = document.getElementById('needle');
const slow = matchMedia('(prefers-reduced-motion: reduce)');
const centers = [65, 186, 296, 112, 239, 47];
const wrap = angle => (angle % 360 + 360) % 360;
const arcWidth = () => 54 - 3 * attempt;
let attempt = 0;
let hits = 0;
let started;
let animation;
let phase = 'ready';

function publishBoard() {
  const width = arcWidth();
  target.style.setProperty('--target-angle', wrap(centers[attempt] - width / 2) + 'deg');
  target.style.setProperty('--width', width + 'deg');
  attemptsLabel.textContent = 'Attempt ' + (attempt + 1) + ' of ' + centers.length;
  hitsLabel.textContent = hits + (hits === 1 ? ' hit' : ' hits');
}

function angleAt(timestamp) {
  const elapsed = Math.max(0, timestamp - started) / 1000;
  const speed = (slow.matches ? 86 : 115) + attempt * 16;
  return wrap(elapsed * speed * (attempt % 2 ? -1 : 1));
}

function draw(timestamp) {
  needle.style.setProperty('--rotation', angleAt(timestamp) + 'deg');
  animation = requestAnimationFrame(draw);
}

function stop() {
  cancelAnimationFrame(animation);
}

function start() {
  publishBoard();
  started = performance.now();
  phase = 'moving';
  strike.textContent = 'Tap now';
  statusLine.textContent = 'Watch the needle. Tap inside the green arc.';
  animation = requestAnimationFrame(draw);
}

function reset() {
  stop();
  attempt = 0;
  hits = 0;
  phase = 'ready';
  needle.style.setProperty('--rotation','0deg');
  strike.textContent = 'Start round';
  statusLine.textContent = 'Use the button, Enter or Space. Each attempt starts when you are ready.';
  publishBoard();
}

strike.addEventListener('click', () => {
  if (phase === 'ready') { start(); return; }
  if (phase === 'complete') { reset(); return; }
  if (phase === 'result') { attempt++; start(); return; }

  stop();
  const angle = angleAt(performance.now());
  needle.style.setProperty('--rotation', angle + 'deg');
  const offset = Math.abs(wrap(angle - centers[attempt] + 180) - 180);
  const hit = offset <= arcWidth() / 2;
  if (hit) hits++;
  publishBoard();
  if (attempt === centers.length - 1) {
    phase = 'complete';
    strike.textContent = 'Play again';
    statusLine.textContent = (hit ? 'Hit. ' : 'Miss. ') + 'Round complete. ' + hits + ' of ' + centers.length + ' hits.';
  } else {
    phase = 'result';
    strike.textContent = 'Next attempt';
    statusLine.textContent = hit ? 'Hit. Take a breath before the next attempt.' : 'Miss. Look at how far the needle stopped from the arc.';
  }
});

resetButton.addEventListener('click', reset);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden || phase !== 'moving') return;
  stop();
  phase = 'ready';
  needle.style.setProperty('--rotation','0deg');
  strike.textContent = 'Resume attempt';
  statusLine.textContent = 'Paused. Start when you are ready.';
});
reset();
