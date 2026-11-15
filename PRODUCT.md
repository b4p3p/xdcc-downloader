# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Electron desktop app for Windows; the UI is a single HTML page rendered by
Chromium, sandboxed renderer, strict CSP: `default-src 'self'`.)

## Users

Two audiences, both first-class:

- People who do not know IRC and want one file: they search, pick a result,
  press download. The app hides servers, channels, bots and DCC from them.
- People who know XDCC and want a fast, no-nonsense client: they paste
  `Server/Channel/Command` or an `irc://` link plus `/msg bot xdcc send #n`,
  and read the connection log and the bot's messages.

## Product Purpose

Download a file offered by an XDCC bot on IRC without an IRC client. Success:
from a file name (or a pasted request) to a completed file on disk, with the
user always knowing what is happening (connecting, queued, downloading,
done, error) and never misled about a truncated transfer.

## Positioning

A single-purpose XDCC client: search (XDCC.eu) and download in one window,
no IRC client, no chat, no accounts. Honest about state: a partial transfer
is reported as an error, never as completed.

## Operating Context

- Search reads XDCC.eu public pages (one request per search, no scripts
  executed); results show name, size, gets, network, channel, bot, pack;
  sortable table, up to ~500 rows.
- Manual request: two text formats (field format, or IRC link + command).
- One download at a time, in an isolated worker process; Cancel kills it and
  keeps partial files.
- Destination folder defaults to Windows Downloads.
- Bots may queue the user; queue messages appear in the log.

## Capabilities and Constraints

- UI languages: Italian and English, both shipped now.
- No external network resources in the UI (CSP); any font must be bundled in
  the project.
- Window min size 660×700, default 1220×900.
- Tests: `npm test` (parser, search parsing, local IRC/DCC transfer),
  `npm run smoke`.

## Brand Commitments

Name: "XDCC Downloader". No binding visual identity: the current look and
icon may be replaced.

## Evidence on Hand

No testimonials, download counts or users to cite. Third-party: xdccJS (MIT),
XDCC.eu as search source (credited in the UI).

## Product Principles

1. The protocol is hidden by default, visible on demand (log, raw request).
2. State is always explicit and truthful; errors say what to do next.
3. One task per screen region: find, configure, transfer.
4. The user is responsible for what they download; the app does not promote
   content.
