---
description: Localize an App Store or Google Play screenshot set into other languages and render it with ShotLingo
argument-hint: "<project name or screenshots> <languages, e.g. de ja pt-BR>"
---

Localize this screenshot set: $ARGUMENTS

Follow the `app-store-screenshots` skill.

1. Find the source. If a ShotLingo project name was given, use `list_projects` and open it; if screenshots were given, start with `import_image` or `import_store_screenshots` and `adapt_template`.
2. Read the current captions with `get_translations`. Rewrite each one for every target language: keep the benefit, fit the market, no prices.
3. Write them with `set_translations`, then check with `fit_text_into_design` which captions do not fit in that language and shorten them.
4. Render one page per language with `render_screenshot` and show the results. Point out anything clipped or wrapped badly and fix it before going on.
5. When the user is happy, render the rest with `start_batch` and report progress from `get_batch_status`.
6. Do not upload unless the user asks. `export_to_app_store` and `export_to_google_play` replace the screenshots on the live listing.

If the ShotLingo tools are not available, tell the user to run `/mcp` and sign in to the `shotlingo` server, then write the localized captions as a table so nothing is lost.
