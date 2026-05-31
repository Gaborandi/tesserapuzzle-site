# Tessera Website

Public GitHub Pages site for Tessera: The Mosaic Puzzle.

Live site: https://gaborandi.github.io/tesserapuzzle-site/

## Pages

- `index.html` - public landing page
- `privacy/` - privacy policy
- `terms/` - terms of service
- `support/` - support and contact page
- `privacy.html` - redirect kept for App Store compatibility
- `app-ads.txt` - Google AdMob seller declaration
- `appstore-metadata.md` - App Store copy and support metadata
- `assets/site.js` - lightweight language selector and localized page copy
- `assets/legal.css` - shared legal/support page styling

## Localization

The site supports the same broad language set as the newer Gaborandi launch pages:

`en`, `ar`, `es`, `fr`, `de`, `pt`, `it`, `ja`, `ko`, `zh`, `ru`, `tr`, `hi`, `id`, `nl`, `pl`, `sv`, `vi`.

Arabic is right-to-left. English remains the legal source of truth. Long legal clauses may fall back to English where a localized convenience translation is not provided.

## Product Positioning

Tessera is a mobile territory puzzle game built around one clear mechanic: divide the board into connected regions that satisfy a rule.

- Logic: connected equal-size regions with no duplicate numbers
- Chroma: connected regions that match color targets
- Equate: connected regions that evaluate to exact equation targets

The public copy should stay consistent with the game:

- Use `$5.99` for the one-time premium unlock.
- Do not call Premium a subscription. Use "Premium users" or "Premium purchasers."
- If mentioning Hint Pack, clarify that it is optional for non-premium players and that Premium already includes the full per-puzzle hint allowance.
- Describe generated content as deterministic or part of a curated progression.
- Keep unfinished modes out of public launch copy.
- Include the publisher identity: "Tessera is an independent mobile game by Gaborandi."

## Launch Links

- Privacy: https://gaborandi.github.io/tesserapuzzle-site/privacy/
- Terms: https://gaborandi.github.io/tesserapuzzle-site/terms/
- Support: https://gaborandi.github.io/tesserapuzzle-site/support/
- AdMob app-ads.txt: https://gaborandi.github.io/tesserapuzzle-site/app-ads.txt

AdMob may also crawl the developer website root depending on the app store
listing and account configuration. If AdMob expects the root domain, publish the
same `app-ads.txt` at `https://gaborandi.github.io/app-ads.txt` or move Tessera
to a custom domain where the root file can be controlled.

## Publishing

This repository is published with GitHub Pages from the `main` branch. Updates are currently made through the GitHub website editor and upload UI. Do not use `git push` for routine Tessera website updates unless the owner explicitly changes this workflow.

When app screenshots or grid colors change, replace the public images in `assets/`
before publishing so the website matches the current App Store and TestFlight
build. If the filenames stay the same, bump the `?v=` query strings in
`index.html` so browsers cannot keep showing cached old screenshots. Re-check
the live Privacy Policy URL after each legal or monetization change:

- Website: https://gaborandi.github.io/tesserapuzzle-site/
- Privacy: https://gaborandi.github.io/tesserapuzzle-site/privacy/
