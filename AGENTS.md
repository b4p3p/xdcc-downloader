# AGENTS.md

Guide for coding agents and contributors working on XDCC Downloader, a
Windows desktop client (Electron) that searches XDCC.eu and downloads files
from XDCC bots on IRC through xdccJS.

## Commands

```powershell
npm install        # dependencies (Electron is a dev dependency)
npm start          # run the app
npm test           # node --test: parser, search parsing, local IRC/DCC transfer
npm run smoke      # opens the real window, drives search/select/sort, exits
npm run shots      # screenshots of the main states into .impeccable/review/
npm run pack       # portable Windows exe in dist/
npm run pack:check # checks the packed exe (window, preload, live search)
```

Run `npm test` and `npm run smoke` before every commit that touches `src/`.
`pack:check` performs a real search on XDCC.eu: use it only when needed.

## Layout

| Path | Role |
|---|---|
| `src/main.js` | Electron main process: window, IPC handlers, worker lifecycle |
| `src/preload.js` | the only bridge to the renderer (`window.downloader`) |
| `src/worker.js` | child process running xdccJS; one per download |
| `src/parse.js` | parses a pasted request (field format or `irc://` link + `/msg`) |
| `src/search.js` | fetches and parses XDCC.eu result pages with cheerio |
| `src/i18n.js` | IT/EN strings, shared by main, worker and renderer |
| `src/index.html`, `style.css`, `renderer.js`, `results.js` | the UI |
| `src/assets/` | app icon, bundled fonts (OFL licences beside them) |
| `test/` | `node:test` suites; `transfer.test.js` runs a local IRC server and bot |
| `scripts/` | smoke test, screenshot capture, packed-exe check |
| `PRODUCT.md`, `DESIGN.md`, `.impeccable/` | product and visual design records |

## Architecture rules

- **Security model.** Renderer runs with `contextIsolation`, `sandbox` and
  no Node integration; navigation and new windows are blocked; the page CSP
  is `default-src 'self'`. Do not load anything remote in the UI (fonts and
  icons are bundled or inline). New renderer capabilities go through
  `preload.js` as narrow IPC calls.
- **Isolation of transfers.** Each download runs in a forked worker so that
  Cancel kills every socket. The worker validates the file name offered by
  the bot and the resolved path before anything is written.
- **Honest state.** A transfer that ends short of the announced size is an
  error, never "completed". Keep it that way.
- **One request per search**, no scripts executed from XDCC.eu, response
  size capped. The search page structure is parsed in `search.js`; when the
  site changes, fix the parser and its test fixture together.

## Internationalisation

Every user-facing string lives in `src/i18n.js` under the same key for `it`
and `en`. Main process and worker translate with `t()` in the language the
renderer last set (`set-language` IPC); the renderer translates elements
with `data-i18n`, `data-i18n-placeholder` and `data-i18n-label`. Add both
languages in the same change. Tests run in Italian (the module default).

## UI and design

The visual direction ("airmail": post-office blue shell, airmail red for
actions, chevron progress strip, postmark for the transfer state) is
recorded in `DESIGN.md` and in `.impeccable/surfaces/src-index-html.md`.
Change the look through the tokens in `style.css`, and keep `DESIGN.md` in
step. After a UI change run `npm run shots` and look at the captures.

## Conventions

- CommonJS, no build step, no framework in the renderer.
- Code comments in English, only where the reason is not obvious.
- Commits: short imperative subject; work directly on `main` for small
  changes.
- Do not commit `node_modules/`, `dist/`, `.impeccable/mocks/`,
  `.impeccable/review/`.
