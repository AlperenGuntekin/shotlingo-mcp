---
name: app-store-screenshots
description: Design, review and localize App Store and Google Play screenshot sets. Use when the user asks for app store screenshots, store listing visuals, screenshot captions, a screenshot review, localized screenshots, or screenshot sizes. Works on its own; if the ShotLingo MCP tools are connected, it also renders and uploads the set.
---

# App Store screenshots

Screenshots are the part of a store listing most people look at before they decide. Treat them as a short ad, not as documentation.

## 1. Decide the story before the pixels

- Write one benefit per screenshot, in the user's words ("Split a bill in 10 seconds"), not feature names ("Bill splitting module").
- Order by what makes someone install. The first three carry the decision: in search results an iPhone portrait listing shows the first three, so each must make sense alone.
- Screenshot 1 answers "what is this and why should I care". Do not spend it on onboarding, a login screen or a logo.
- Plan 5 to 8 screens. Apple allows up to 10 per device size; Google Play allows up to 8 phone screenshots.

## 2. Captions

- Headline 2 to 6 words, one optional sub-line. If it needs a comma, it is probably two screens.
- Make the headline readable at search-result thumbnail size. Check it at roughly a quarter of full size.
- Same position, size and style on every screen, so the set reads as one strip.
- No prices or "free" in captions: prices vary by storefront and change; a wrong price in a screenshot is a rejection risk and a trust problem.
- If a feature shown is behind a purchase, say so (App Review guideline 2.3.2).

## 3. The app must be visible

- Show the real app in use (guideline 2.3.3: not just title art, a login page or a splash screen).
- Use real-looking content: names, numbers and photos that make sense in the target market.
- A device frame is optional. If you use one, use the current device shape for the size you upload.

## 4. Sizes

- iPhone: upload the 6.9-inch size (for example 1320 x 2868 portrait); App Store Connect scales it down for smaller iPhones. Add 6.5-inch (1284 x 2778 or 1242 x 2688) only if you want separate art for it.
- iPad: 13-inch (2064 x 2752 or 2048 x 2732) if the app runs on iPad.
- Google Play phone: PNG or JPEG, each side between 320 and 3840 px, long side no more than twice the short side.
- Always confirm against Apple's "Screenshot specifications" page before a release; the list changes with new devices.

## 5. Localization

- Localize, do not just translate: rewrite the benefit for the market, keep the meaning.
- German, French, Russian and Portuguese captions usually run longer than English. Design the caption box for the longest language, or let it shrink to fit, never clip.
- Japanese, Chinese and Korean need a font with full CJK coverage; Arabic and Hebrew are right to left, so mirror the layout and keep numbers readable.
- Swap screenshots that show text inside the app (UI language, currency, dates) where you can.
- Review every language as an image, not as a string list: overflow, wrong line breaks and missing glyphs only show up rendered.

## 6. Review checklist before upload

- [ ] Each of the first three screens works alone in a search result
- [ ] One benefit per screen, headline readable at thumbnail size
- [ ] No prices, no unlabeled paid features, no claims you cannot back up
- [ ] Real app UI on every screen
- [ ] Every language rendered and looked at; nothing clipped
- [ ] Sizes match the current specifications

## With ShotLingo connected

If tools named like `list_templates`, `set_translations` and `render_screenshot` are available:

1. `list_templates` or `import_store_screenshots`, then `adapt_template` / `create_project` with the user's screenshots.
2. Write the captions with the rules above; `fit_text` for long languages.
3. `set_translations` for each target language, then `render_screenshot` for one page and show it before rendering everything.
4. `start_batch` for the full set, poll `get_batch_status`.
5. Upload only when the user asks: `export_to_app_store` or `export_to_google_play` replace what is on the listing.

`get_usage` shows how many renders are left today.
