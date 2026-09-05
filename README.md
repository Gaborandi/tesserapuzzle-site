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
- `assets/home.css` - responsive marketing-page layout and visual system
- `assets/tessera-gameplay-preview.mp4` - web-optimized copy of the approved Build 33 gameplay preview
- `assets/tessera-*.webp` - lossless web delivery copies of the real gameplay captures
- `assets/tessera-social-preview.png` - 1200x630 search and link-preview image
- `robots.txt` and `sitemap.xml` - search-crawler discovery files

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

- Do not hard-code a single storefront price on the public website. Apple shows
  the authoritative localized price. The U.S. App Store baseline is `$5.99`.
- Do not call Premium a subscription. Use "Premium users" or "Premium purchasers."
- If mentioning Hint Pack, clarify that it is optional for non-premium players and that Premium already includes the full per-puzzle hint allowance.
- Describe generated content as deterministic or part of a curated progression.
- Keep unfinished modes out of public launch copy.
- Include the publisher identity: "Tessera is an independent mobile game by Gaborandi."

## Launch Links

- Privacy: https://gaborandi.github.io/tesserapuzzle-site/privacy/
- Terms: https://gaborandi.github.io/tesserapuzzle-site/terms/
- Support: https://gaborandi.github.io/tesserapuzzle-site/support/
- Project copy of app-ads.txt: https://gaborandi.github.io/tesserapuzzle-site/app-ads.txt
- AdMob hostname-root app-ads.txt: https://gaborandi.github.io/app-ads.txt

AdMob discovers this declaration at the developer website hostname root. The
project copy is retained for packaging, but it does not replace the public root
file in `Gaborandi/gaborandi.github.io`.

## Publishing

This repository is published with GitHub Pages from the `main` branch. Updates are currently made through the GitHub website editor and upload UI. Do not use `git push` for routine Tessera website updates unless the owner explicitly changes this workflow.

When app screenshots or grid colors change, replace the public images in `assets/`
before publishing so the website matches the current App Store and TestFlight
build. If the filenames stay the same, bump the `?v=` query strings in
`index.html` so browsers cannot keep showing cached old screenshots. Re-check
the live Privacy Policy URL after each legal or monetization change:

- Website: https://gaborandi.github.io/tesserapuzzle-site/
- Privacy: https://gaborandi.github.io/tesserapuzzle-site/privacy/
