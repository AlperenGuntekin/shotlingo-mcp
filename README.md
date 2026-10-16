<h1 align="center">ShotLingo MCP: App Store screenshot generator for Claude, Cursor and VS Code</h1>

<p align="center">
  Describe the screenshots you want. Your agent writes the copy in 41 languages, ShotLingo renders the pixels,<br>
  and the set goes straight to App Store Connect or Google Play.
</p>

<p align="center">
  <a href="https://registry.modelcontextprotocol.io"><img alt="MCP Registry" src="https://img.shields.io/badge/MCP%20Registry-com.shotlingo%2Fmcp-6E56CF"></a>
  <a href="#claude-code"><img alt="Claude Code plugin" src="https://img.shields.io/badge/Claude%20Code-plugin-D97757"></a>
  <a href="#cursor"><img alt="Cursor" src="https://img.shields.io/badge/Cursor-one%20click-000000"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-green"></a>
  <a href="https://github.com/AlperenGuntekin/shotlingo-mcp/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/AlperenGuntekin/shotlingo-mcp?style=social"></a>
</p>

<p align="center">
  <img src="assets/demo.gif" alt="Claude Code calls the ShotLingo MCP tools and an App Store screenshot comes back localized into many languages" width="800">
</p>

## Install in one line

<a id="claude-code"></a>
**Claude Code** (plugin: MCP server + screenshot design skill + `/shotlingo:localize` command)

```bash
claude plugin marketplace add AlperenGuntekin/shotlingo-mcp
claude plugin install shotlingo@shotlingo
```

Only the server, no plugin:

```bash
claude mcp add --transport http shotlingo https://mcp.shotlingo.com/mcp
```

**Claude (web and desktop):** Settings, Connectors, Add custom connector, paste `https://mcp.shotlingo.com/mcp`.

<a id="cursor"></a>
**Cursor:** [Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=shotlingo&config=eyJ1cmwiOiJodHRwczovL21jcC5zaG90bGluZ28uY29tL21jcCJ9), or put this in `~/.cursor/mcp.json`:

```json
{ "mcpServers": { "shotlingo": { "url": "https://mcp.shotlingo.com/mcp" } } }
```

**VS Code:**

```bash
code --add-mcp '{"name":"shotlingo","type":"http","url":"https://mcp.shotlingo.com/mcp"}'
```

**Clients that only speak stdio:**

```json
{ "mcpServers": { "shotlingo": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.shotlingo.com/mcp"] } } }
```

The first tool call opens a browser window to sign in to ShotLingo (OAuth 2.1 with PKCE). No API key to copy, nothing stored in this repo.

## What you can ask for

> "Make a 6.9-inch App Store set for my habit tracker from these five simulator screenshots, one benefit per screen, then translate it into German, Japanese and Brazilian Portuguese."

> "Take my English set, localize it for the top five markets, render all of it and upload it to App Store Connect."

> "Which captions overflow in German? Shorten them and re-render only those pages."

## What you get

| Step | Tools |
|---|---|
| Start from a template or your own screenshots | `list_templates`, `get_template`, `adapt_template`, `create_project`, `duplicate_project`, `import_image`, `import_store_screenshots` |
| Edit the layout | `generate_page`, `apply_device_frame`, `update_project`, `fit_text_into_design` |
| Localize | `set_translations`, `get_translations` (41 languages, right-to-left included) |
| Render | `render_screenshot`, `start_batch`, `get_batch_status` |
| Ship | `export_to_app_store`, `export_to_google_play`, `list_app_store_apps`, `list_google_play_apps` |
| Account | `get_usage`, `list_projects` |

Text is fitted by the same export pipeline the ShotLingo web editor uses, so a German caption that runs long shrinks to fit instead of spilling off the frame.

The Claude Code plugin also ships:

- **`app-store-screenshots` skill:** the screenshot design rules we use: what the first three screens must do, caption length, sizes, localization traps, App Review rules. It works on its own, with no account.
- **`/shotlingo:localize` command:** one command from "here is my English set" to a rendered, localized set.

## Pricing and the free path

- The skill in this repo is free and needs no account.
- The ShotLingo web editor at [shotlingo.com](https://shotlingo.com) has a free plan.
- The MCP connector needs a paid plan (Pro, Plus or Studio). Store upload needs Plus or Studio. Limits are on [shotlingo.com/plans](https://shotlingo.com/plans).

## How it works

```
your agent ──MCP over HTTPS──▶ mcp.shotlingo.com ──▶ ShotLingo renderer ──▶ PNGs / App Store Connect / Google Play
```

The server is hosted and closed source. This repo is the open part: client configs, the Claude Code plugin and the design skill. Bugs and feature requests for the server are welcome here as issues.

## Privacy

This repo collects nothing: it is configuration and Markdown. What the hosted service stores is described in [shotlingo.com/privacy](https://shotlingo.com/privacy).

## Contributing

Better screenshot rules, client configs for more editors, and clearer docs are all welcome. Open a pull request or an issue. Run `npm test` before you push.

## License

MIT for everything in this repository. The ShotLingo service has its own [terms](https://shotlingo.com/terms).
