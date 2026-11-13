# syvna_ui_sdk

Syvna UI: the components every Syvna app is built from (dashboards, websites and AI agents), themed by tokens, in light and dark. Also the copy-in CLI and the MCP server agents use.

```bash
npm install
npm run dev      # the docs, with a live playground per component: http://localhost:4500
```

## Use it in an app

Copy just the components an app needs, at a release:

```bash
npx github:ValeBytes/syvna_ui_sdk#v0.1.0 init
npx github:ValeBytes/syvna_ui_sdk#v0.1.0 add Button DateRangePicker
npx github:ValeBytes/syvna_ui_sdk upgrade        # later: move to the newest release
```

## Releases

One version for everything, tagged `vX.Y.Z`; what changed is in [CHANGELOG.md](CHANGELOG.md).

```bash
# write what changed under "Unreleased" in CHANGELOG.md, commit, then:
npm run release -- minor      # or patch, major, or an exact 1.2.3; --dry-run to preview
git push origin main --follow-tags
```

How it's laid out and how to change it: [AGENTS.md](AGENTS.md).
