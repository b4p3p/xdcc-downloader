---
version: 1
slug: "src-index-html"
primary_target: "src/index.html"
related_targets: []
---

# Surface brief: main window

Scope: the single window of the Electron app (`src/index.html`). Mode: Operate.

Audience and job: newcomers who want one file (search, pick, download) and XDCC users who paste a request and read the log. One download at a time. States: idle, connecting, queued, downloading, done, error, cancelled; search: idle, loading, results, empty, error.

Constraints: Italian and English UI; strict CSP (`'self'` only), fonts bundled; window min 660x700; no hacker/terminal look, no website look, results table stays dense.

## Direction contract

THESIS: every download is a parcel the bot mails to you; the window is the post office counter, not a dashboard. Refuses the grey downloader with a blue progress bar.

OWN-WORLD: airmail. Pale blue airmail-paper ground, deep post-office blue shell bar, airmail red as the action and alert colour, white panels with fine blue-grey rules; condensed postal-label voice for labels, stamps and big numbers, a sober grotesk for data; tabular numerals everywhere.

STORY: the user searches or pastes, sees the parcel's waybill (file, bot, pack, server, channel, destination) before sending, presses send, follows it to delivery, and opens the folder.

FIRST VIEWPORT: blue top bar (brand stamp, search field with red button, tabs Search / Manual request, IT/EN switch); below, two columns: dense sortable results table left, the "envelope" panel right (waybill, destination, start/cancel, chevron progress strip, numbers, log). Primary action: Start download in the envelope.

FORM: candidate 5 of 7 (airmail post), with raises: tabular columns (datamatics), true-length progress (labanotation), status paired with its datum (monochrome), one shared column grid (Crouwel), selected row lifts into the envelope (streaming). seed:31cc18f586f95868. Signature move: the red/white/blue airmail chevron is the progress strip, proportional to bytes, and a circular postmark (network, date, state) stamps the envelope on each state change.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
