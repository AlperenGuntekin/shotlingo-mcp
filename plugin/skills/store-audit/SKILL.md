---
name: store-audit
description: Audit a live App Store product page for free, with no account and no API key. Use when the user asks to review, audit, critique or benchmark an app's store listing, screenshots, localization or first screen, asks "what is wrong with my App Store page", or gives an apps.apple.com link and wants to know how it compares with the top apps in its category.
---

# Store page audit

One GET returns a sourced audit of any App Store listing. It reads only Apple's public data
(the iTunes lookup in each storefront and the category's top-free chart). No sign-in, no key,
nothing rendered.

## Run it

```bash
curl -s "https://mcp.shotlingo.com/audit?app=<App Store link or numeric id>&country=us&format=md"
```

- `app`: an `apps.apple.com/.../id123456789` link or the bare id.
- `country`: the two-letter storefront the listing is read from (default `us`).
- `format=md` gives Markdown; leave it off for JSON with every source URL.
- Limit: 10 audits per hour per IP. Results are cached for 6 hours.

## What comes back

- How many of the 10 iPhone screenshot slots are used, and the median of the top 5 free apps in the same category and storefront.
- For 10 major storefronts (DE, FR, ES, IT, BR, JP, KR, CN, NL, TR): which ones show the same screenshot files as the base storefront, which ones show the base description untranslated, and which languages the app itself supports but its shoppers do not see.
- iPad screenshots, ratings and the last update, next to the same top 5.
- `notMeasured`: what the public data cannot show (caption text inside the images, App Previews, subtitle, exact pixel size). Do not fill those in by guessing.

## How to present it

Lead with the `high` findings, then `medium`. Quote the numbers as they came back and say they
were read from Apple's public data at `checkedAt`. Do not add claims the audit did not return.

## Fixing what it finds

The `app-store-screenshots` skill in this repo has the design rules for the screenshots
themselves. If the ShotLingo MCP server is connected (see the README), it can import the live
screenshots (`import_store_screenshots`), translate and fit the captions (`set_translations`,
`fit_text_into_design`), render every language (`start_batch`) and upload the set to App Store
Connect (`export_to_app_store`) or start an A/B test (`create_ab_test`). The connector needs a
ShotLingo paid plan; the audit and both skills do not.
