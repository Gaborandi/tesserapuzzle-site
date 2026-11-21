const platform = new URLSearchParams(window.location.search).get('src');

if (['tiktok', 'instagram', 'facebook', 'share', 'whatsapp', 'instagram_story'].includes(platform)) {
  const apple = new URL('https://apps.apple.com/app/apple-store/id6773765192');
  apple.search = new URLSearchParams({ pt: '120202877', ct: platform, mt: '8' });
  document.querySelector('[data-tessera-apple]').href = apple.href;

  const play = new URL(document.querySelector('[data-tessera-play]').href);
  const campaign = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: 'studio_nov26'
  });
  campaign.forEach((value, name) => play.searchParams.set(name, value));
  play.searchParams.set('referrer', campaign.toString());
  document.querySelector('[data-tessera-play]').href = play.href;
}
