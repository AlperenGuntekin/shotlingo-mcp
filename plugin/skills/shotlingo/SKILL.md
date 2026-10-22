---
name: shotlingo
description: How to drive the ShotLingo MCP tools safely and without wasted renders. Use whenever the task calls a ShotLingo tool (list_projects, adapt_template, duplicate_project, generate_page, set_translations, fit_text_into_design, render_screenshot, start_batch, export_to_app_store, export_to_google_play, create_ab_test, stop_ab_test), builds or edits a ShotLingo project, renders a localized screenshot set, uploads screenshots to App Store Connect or Google Play, or sets up a Product Page Optimization test. Read it before the first ShotLingo call, even for a quick render, because edits are only undoable after save_version and the store tools replace a live listing. For what the screenshots should say and show, use the app-store-screenshots skill.
---

# Using the ShotLingo tools

Three facts shape everything below:

1. Project edits write straight to the stored design. The only undo is a `save_version` made before the edit.
2. Renders are rate limited and count against a daily cap. A render that hits the cache costs nothing.
3. Four tools write to a live store listing: `export_to_app_store`, `export_to_google_play`, `create_ab_test`, `stop_ab_test`.

If the tools are not available, ask the user to run `/mcp` and sign in to the `shotlingo` server. The first call opens a browser window for the ShotLingo sign-in; the MCP connector needs a paid ShotLingo plan.

## Tool classes

| class | tools | cost and risk |
|---|---|---|
| read, compute | list_projects, list_templates, get_template, get_usage, get_translations, fit_text_into_design, apply_device_frame, estimate_ab_test, list_ab_tests, list_app_store_apps, list_google_play_apps, get_batch_status, list_versions, list_trash | none, use freely |
| render | render_screenshot, start_batch | daily render cap; check `get_usage` before a full set |
| edit design | create_project, adapt_template, duplicate_project, add_page, delete_page, generate_page, add_text, add_image, add_shape, upload_image, create_upload_url, import_image, import_store_screenshots, update_element, move_element, reorder_element, set_page_background, delete_element, set_translations, update_project | writes the real design; undo only through an earlier `save_version` |
| versions, trash | save_version, restore_version, restore_project, delete_project | `save_version` is safe; `restore_version` overwrites the project but saves the current state first; `delete_project` moves the project to the trash |
| live store | export_to_app_store, export_to_google_play, create_ab_test, stop_ab_test | changes what store visitors see; preview first, the user decides |

If a tool named in these docs is missing from your tool list, the client loaded the list before the server added it. Tell the user to fully quit and reopen the client; reconnecting is not always enough.

## Before editing

- **Version, do not copy.** Call `save_version` before a risky edit and `restore_version` to undo. Use `duplicate_project` only for a genuinely new app or set, never one project per iteration.
- `delete_project` returns a preview first and needs `confirm: true`. A deleted project stays in the trash (`list_trash`, `restore_project`).
- To leave a graphic out of one render, pass its id in `omitElements` instead of deleting it from the project.

## Three starting points

1. **An existing project:** `list_projects`, `save_version`, edit, `fit_text_into_design`, `set_translations`, render.
2. **A template:** `list_templates`, then `get_template` for its pages and text slot ids. Render the template directly (`render_screenshot` with `templateId` and `texts` keyed by slot id), or clone it into a project with `adapt_template`. Render one page and look at it before committing to a template.
3. **From scratch:** `create_project` sets the export size and creates no pages. Then `add_page`, `generate_page`, render with `inlinePreview`, and nudge with `move_element` or `update_element`. Prefer `generate_page` (layouts `headline-device-caption`, `headline-device`, `headline-only`) over placing every text and image by hand: it keeps the device image clear of the headline.

Images the user hands over as files: `upload_image` (base64 or a `data:` URI; PNG, JPEG or WebP) returns a URL that `add_image` and `generate_page` accept. Store screenshots already on a listing come in with `import_store_screenshots`.

## Elements

- `update_element` edits text. Images and shapes move with `move_element`.
- `reorder_element`: z 0 is the back.
- `delete_page` renumbers the pages after it. Page order is the order in the store.
- `apply_device_frame` returns a placement (frame image, screen rectangle, scale). It does not draw or store anything by itself.

## Translations

- `fit_text_into_design` takes `texts` keyed by language, each an array in the page's text slot order. It returns the fitted size, shrink ratio, wrapped lines and the slots that cannot fit. It is an estimate and uses no render quota. Run it before saving copy for long languages such as German, French or Russian.
- `set_translations` is a bulk upsert keyed by object id and language code. Read back with `get_translations`.
- Object ids come from `get_template` (templates) or `fit_text_into_design` with `includeElements` (projects).

## Rendering

- `texts` must not be empty. For a project, stored translations are the base and `texts` overrides them per object id, so English strings passed to a German render replace the German copy. To render only the stored copy, pass `{"__stored__": ""}`.
- One render at a time. Two parallel calls get `429 Rate limit exceeded`; wait several seconds between calls. If the renderer is busy the call returns `retryAfterSeconds`; wait that long and retry once.
- For one page in many languages, or a whole set, use `start_batch` and poll `get_batch_status` every 20 to 30 seconds. The batch runs on the server; a status of `stalled: true` means it stopped making progress.
- `pageIndex` is 0-based. `size` is `"WxH"`; the default is the project's export size.
- Use `inlinePreview` when you need to see a page; leave it off in batches, full-size PNGs are large.

## Before calling a set done

- Look at every page in every language as an image. Overflow, wrong line breaks, missing glyphs and copy left in the wrong language only show up rendered.
- Captions carry no rating, star count, badge, award, user count or review you cannot back up. Hiding the number is not enough: a laurel and five stars still promise a rating, so leave the graphic out.
- Every paid feature named on a screenshot says it needs a purchase (App Review guideline 2.3.2). No prices and no "free" in captions.
- The render size matches the store slot you will upload to (below).

## Anything that reaches the store

1. **Store tools return a preview unless `confirm: true`.** Show the preview to the user and wait for an explicit yes before the confirming call.
2. **Call `list_ab_tests` first.** `create_ab_test` stops the app's running test, and a stopped test cannot be resumed. `export_to_app_store` replaces the live screenshots, which are the control arm of any running test.
3. **App Store Connect keys** are connected in the ShotLingo web app. If `list_app_store_apps` asks for a key, the account has none yet. Never ask for or accept a private key in the chat.
4. **Read the result back.** `export_to_app_store` deletes and re-uploads but does not pin the order, so check the order in App Store Connect afterwards. `create_ab_test` pins the order it is given.

### Product Page Optimization

- Size the test with `estimate_ab_test` (impressions per day and baseline conversion from App Store Connect analytics). It returns the smallest detectable effect at 7 to 90 days. Power follows the smaller arm. If no plausible effect clears the 90-day number, say the test cannot conclude instead of starting it.
- One test per app. A treatment localization with nothing uploaded shows the live images in App Store Connect; that means nothing was uploaded, not that the old set was.
- The API cannot start a test: `submitForReview: true` submits it and Apple starts it on approval.
- Results (impressions, conversion, confidence) are only in the App Store Connect web UI, not in the API. `list_ab_tests` gives state, dates and traffic split. Read results no earlier than 28 days after approval.

### iPhone sizes App Store Connect accepts

- `APP_IPHONE_67` slot (the large iPhone size): 1320 x 2868 or 1290 x 2796.
- `APP_IPHONE_65` slot: 1242 x 2688 only. Render this size separately if the listing has its own 6.5-inch set.
