'use strict';
// Optional, bounded aggregate events. No third-party JavaScript or automatic pageviews.
(() => {
  const endpoint = 'https://gaborandi.goatcounter.com/count';
  const storageKey = 'tessera.sampler01.measurement.v1';
  const qaKey = 'tessera.measurement.exclude';
  const stages = new Set(['start','first-move','guided-region','continued','independent-region','hint','solved','store-click','store-click-android']);
  const sources = new Set(['website','reddit_puzzles','youtube','editorial','bonte','thinky','instagram']);
  const params = new URLSearchParams(location.search);
  const source = sources.has(params.get('src')) ? params.get('src') : 'unlabelled';
  let excluded = location.hostname !== 'gaborandi.github.io' || location.protocol !== 'https:' || params.get('qa') === '1';
  try {
    if (params.get('qa') === '1') localStorage.setItem(qaKey,'1');
    excluded = excluded || localStorage.getItem(qaKey) === '1' || localStorage.getItem('skipgc') === 't';
  } catch (_) {}
  const box = document.getElementById('measurementConsent');
  const status = document.getElementById('measurementStatus');
  let consent = false, cohort = 'fresh', activity = false, sent = new Set(), initialized = false;
  let cohortSource = source;
  const pending = new Set();
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (saved && ['fresh','resumed','late'].includes(saved.cohort)) {
      consent = saved.consent === true; cohort = saved.cohort;
      sent = new Set(Array.isArray(saved.sent) ? saved.sent.filter(s => stages.has(s)) : []);
      cohortSource = sources.has(saved.source) ? saved.source : 'unlabelled';
      initialized = true;
    }
  } catch (_) {}
  // Keep outbound labels aligned with the first source retained in this tab.
  // These are fixed campaign labels, not a player ID or a matched install funnel.
  const campaign = cohortSource === 'unlabelled' ? 'sampler' : 'sampler_'+cohortSource;
  const store = document.getElementById('storeLink');
  const androidStore = document.getElementById('storeLinkAndroid');
  if (store) store.href = 'https://apps.apple.com/app/apple-store/id6773765192?pt=120202877&ct='+campaign+'&mt=8';
  if (androidStore) {
    const referral = new URLSearchParams({utm_source:campaign,utm_medium:'web',utm_campaign:'android_oct26'});
    androidStore.href = 'https://play.google.com/store/apps/details?id=com.tesserapuzzle.app&referrer='+encodeURIComponent(referral.toString());
  }
  function save() {
    try { sessionStorage.setItem(storageKey,JSON.stringify({consent,cohort,source:cohortSource,sent:[...sent]})); } catch (_) {}
  }
  function event(stage) {
    if (!stages.has(stage)) return;
    if (stage !== 'start') activity = true;
    if (!consent || excluded || sent.has(stage)) return;
    // Mark before sending: failures stay missing rather than being retried as duplicate plays.
    sent.add(stage); save();
    try {
      const image = new Image(1,1);
      image.referrerPolicy = 'no-referrer';
      const query = new URLSearchParams({p:'sampler01-'+cohort+'-'+stage,t:'Sampler 01 · '+cohort+' · '+stage,r:cohortSource,e:'true',rnd:Math.random().toString(36).slice(2,10)});
      pending.add(image);
      image.onload = () => pending.delete(image);
      image.onerror = () => { pending.delete(image); status.textContent='Counts may be blocked. You can keep playing.'; };
      image.src = endpoint+'?'+query;
    } catch (_) { status.textContent='Counts are unavailable. You can keep playing.'; }
  }
  window.TesseraMetrics = {
    init({resumed}) {
      if (!initialized || !sent.has('start')) { cohort = resumed ? 'resumed' : 'fresh'; initialized = true; }
      document.getElementById('measurement').hidden = false;
      box.checked = consent && !excluded; box.disabled = excluded;
      if (excluded) status.textContent='Developer preview: measurement is excluded.';
      else event('start');
    },
    event
  };
  box.addEventListener('change',() => {
    if (excluded) { box.checked=false; return; }
    consent = box.checked;
    if (consent && !sent.has('start') && activity) cohort = 'late';
    save(); status.textContent=consent ? 'Thank you. Uncheck anytime to stop counting.' : 'Measurement is off.';
    if (consent) event('start');
  });
})();
