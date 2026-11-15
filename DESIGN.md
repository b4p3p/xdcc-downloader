---
name: XDCC Downloader
description: Single-window XDCC client dressed as an airmail post-office counter.
colors:
  post: "#1d3f9e"
  post-deep: "#15307d"
  post-tint: "#dfe7f7"
  red: "#c4302a"
  red-deep: "#a32620"
  paper: "#eaf0f8"
  panel: "#ffffff"
  rule: "#cbd6e7"
  rule-soft: "#e5ebf4"
  head: "#f4f7fc"
  ink: "#13203d"
  mute: "#4c5c7a"
  select: "#e3ebfa"
  hover: "#f0f4fb"
  ok: "#1d6f45"
  ok-tint: "#e1f1e8"
  bad-tint: "#fbe7e5"
  on-post: "#ffffff"
  on-post-mute: "#c9d5f2"
typography:
  display:
    fontFamily: "Barlow Condensed, Public Sans, Segoe UI, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Barlow Condensed, Public Sans, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  body:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  data:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  label:
    fontFamily: "Barlow Condensed, Public Sans, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  stamp: "2px"
  tag: "3px"
  base: "6px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  panel: "18px"
  xl: "24px"
components:
  button-send:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-post}"
    typography: "{typography.body}"
    rounded: "0 6px 6px 0"
    padding: "0 22px"
    height: "40px"
  button-send-hover:
    backgroundColor: "{colors.red-deep}"
  button-primary:
    backgroundColor: "{colors.post}"
    textColor: "{colors.on-post}"
    rounded: "{rounded.base}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.post-deep}"
  button-ghost:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    textColor: "{colors.post}"
  button-link:
    textColor: "{colors.post}"
    padding: "4px 0"
  input-search:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "6px 0 0 6px"
    padding: "0 14px 0 40px"
    height: "40px"
  input-request:
    backgroundColor: "{colors.head}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.base}"
    padding: "12px 14px"
  tab:
    textColor: "{colors.on-post-mute}"
    rounded: "{rounded.base}"
    padding: "0 14px"
    height: "36px"
  tab-selected:
    textColor: "{colors.on-post}"
  tag-network:
    backgroundColor: "{colors.post-tint}"
    textColor: "{colors.post-deep}"
    rounded: "{rounded.tag}"
    padding: "1px 7px"
  badge-state:
    backgroundColor: "{colors.post-tint}"
    textColor: "{colors.post-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "1px 8px"
  badge-state-done:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok}"
  badge-state-error:
    backgroundColor: "{colors.bad-tint}"
    textColor: "{colors.red-deep}"
  table-row:
    height: "36px"
    padding: "0 10px"
  table-row-selected:
    backgroundColor: "{colors.select}"
    textColor: "{colors.post}"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.base}"
    padding: "18px"
---

# Design System: XDCC Downloader

## Overview

**Creative North Star: "The Airmail Counter"**

Every download is a parcel a bot mails to the user, and the window is the
post-office counter where it is addressed, sent and collected. The world is
airmail stationery: pale blue airmail paper as the ground, a deep post-office
blue shell bar, airmail red reserved for the act of sending and for alarm,
white panels ruled with fine blue-grey lines. It is a working desk, not a
dashboard and not a website: dense, quiet, with the postal devices (stamp,
postmark, waybill, chevron border) carrying the identity so the data does
not have to.

Two voices share the work. A condensed postal-label face (Barlow Condensed,
uppercase, tracked) speaks for labels, column heads, stamps and the one big
number; a sober grotesk (Public Sans) carries every datum. Numerals are
tabular everywhere, so sizes, counts and percentages stand in columns. The
log and the pasted request are the only places that drop into monospace,
because they are the protocol showing through on demand.

Depth is almost flat: two white panels lift a hair off the paper, and the
only motion with character is the postmark landing on the envelope when the
transfer changes state.

**Key Characteristics:**
- Airmail palette: post blue shell, airmail red action, blue-grey rules on pale blue paper.
- Condensed uppercase postal labels over a plain grotesk for data; tabular numerals throughout.
- Dense table rows (36px) and compact 40px controls; one 6px radius family.
- Signature devices: the red/white/blue chevron progress strip and the rotated circular postmark.
- Fonts bundled locally (strict CSP); light scheme only.

## Colors

A two-hue postal palette, blue for structure and red for sending, on a cool
paper neutral; green appears only as the delivered state.

### Primary
- **Post-Office Blue** (post): the shell bar, primary "Start download"
  button, selected row text, sorted column head, focus outlines, step rules,
  postmark in transit. **Deep Post Blue** (post-deep) is its hover and the
  text on tinted tags. **Blue Slip** (post-tint) fills the network tag and
  the in-progress state badge.

### Secondary
- **Airmail Red** (red): the search "send" button, the red bands of the
  progress chevron, step numerals, the text caret in the request field, the
  error postmark and invalid-request check. **Deep Airmail Red** (red-deep)
  is its hover and the error badge text on **Error Slip** (bad-tint).

### Tertiary
- **Delivered Green** (ok): done postmark, done badge, valid-request check,
  on **Delivered Slip** (ok-tint). Never used decoratively.

### Neutral
- **Airmail Paper** (paper): the window ground behind the panels.
- **Counter White** (panel): panels, search field, ghost buttons, brand stamp.
- **Letterhead** (head): sticky table head, request textarea, log well.
- **Blue-Grey Rule** (rule): panel borders, head dividers, ghost button border.
- **Soft Rule** (rule-soft): row dividers, section dividers in the envelope, empty strip track, idle badge.
- **Ink Navy** (ink): body text.
- **Postal Grey** (mute): meta lines, labels, column heads, log text.
- **Row Hover** (hover) and **Row Selected** (select): table row states.
- **On-Post White** (on-post) and **On-Post Haze** (on-post-mute): text on the blue bar, selected and unselected.

### Named Rules
**The Red Means Send Rule.** Airmail red is the act of sending (search
button, progress chevron) or an alarm (error, invalid input). It never
decorates a neutral control and never appears as a second primary button.

**The Status Has a Datum Rule.** A state colour never stands alone: every
state badge sits beside the file name or message it describes, and the
postmark repeats network, date and state in words.

## Typography

**Display Font:** Barlow Condensed 600/700 (with Public Sans, Segoe UI)
**Body Font:** Public Sans variable (with Segoe UI, system-ui)
**Label/Mono Font:** JetBrains Mono 400 (with Consolas)

**Character:** a stamped, condensed postal-label voice set against a civic,
neutral grotesk; the condensed face is always uppercase and tracked, the
grotesk is always sentence case.

### Hierarchy
- **Display** (700, 34px, 1): the transfer percentage only.
- **Headline** (700, 18px, 1.3): the parcel's file name at the top of the envelope; wraps anywhere.
- **Title** (700, 17px, 1.2, 0.08em, uppercase): panel headings; the brand uses the same face at 19px, 0.06em.
- **Body** (400, 14px, 1.45): running text, messages, buttons at 600.
- **Data** (400, 13px): table cells and meta lines; 13.5px for waybill values and state line.
- **Label** (600, 13px, 0.07-0.08em, uppercase): column heads, waybill terms, field labels, figure captions, log summary, state badge (at 700).
- **Mono** (400, 12-14px, 1.6-1.7): log, request textarea, format examples.

### Named Rules
**The Tabular Everywhere Rule.** `font-variant-numeric: tabular-nums` is set
on the body; numeric columns align right. Never switch it off for a figure.

**The Two Voices Rule.** Condensed uppercase names things; the grotesk
states values. A datum (file name, bot, path, size) is never set in the
condensed label face.

## Layout

A full-height column: the blue bar (12px 24px padding, 20px gaps, wraps),
then a "desk" grid of two panels with a 16px gutter and 16px 24px 20px
padding. The work panel takes the remaining width; the envelope panel is
`clamp(340px, 30vw, 430px)`. Panels scroll internally so the bar never
moves. Inside panels the padding is 18px; vertical rhythm in the envelope is
14px between sections, each section opened by a soft rule.

Responsive behaviour: at 1020px and below the desk stacks to one column and
the work panel is capped at 70vh; at 760px and below the search field takes
its own full-width row in the bar and outer padding drops to 16px. The
results table is a container query: under 860px of panel width the channel
column is dropped (the envelope still shows it). The table keeps a 640px
minimum and scrolls horizontally rather than loosening density.

## Elevation & Depth

Nearly flat, tonal on paper. The only shadow lifts the two panels off the
airmail paper; everything inside a panel is separated by rules and tint, not
by shadow. The postmark's double ring is drawn with inset shadows, a postal
device rather than elevation.

### Shadow Vocabulary
- **Panel lift** (`box-shadow: 0 1px 2px rgba(19,32,61,.06), 0 4px 14px rgba(19,32,61,.04)`): the two desk panels only.
- **Postmark ring** (`box-shadow: inset 0 0 0 4px var(--panel), inset 0 0 0 5px currentColor`): the inner ring of the circular postmark.

### Named Rules
**The Ruled Not Raised Rule.** Inside a panel, hierarchy comes from 1px
rules, letterhead tint and type, never from cards with shadows.

## Shapes

One gentle radius (6px) for panels, buttons, fields, tabs and wells; small
3px corners for tags, badges and the progress track; a nearly square 2px
brand stamp with a dashed inset outline like a perforated stamp; a true
circle for the postmark. The search field and its red button fuse into one
40px bar: the field rounds only its left corners, the button only its right.

## Components

### Buttons
Compact and plain, 40px tall, 600 weight, 8px icon gap, colour transitions
of 0.15s.
- **Shape:** gentle corners (6px).
- **Send:** airmail red with white text, 22px side padding, fused to the search field; hover deepens.
- **Primary:** post blue, white text, fills its row in the envelope; hover deepens to deep post blue.
- **Ghost:** white with a blue-grey rule border and ink text; hover turns border and text post blue.
- **Link:** post blue text, no box, underline on hover (3px offset), trailing 16px icon.
- **Disabled:** 0.45 opacity, default cursor.
- **Focus:** 2px post-blue outline, 2px offset; white outline on the blue bar.

### Tabs and language switch
On the blue bar: 36px tabs in On-Post Haze, hover adds an 8% white veil,
selected adds 16% white and full white text. The IT/EN switch is a
segmented control with a 35% white hairline; the pressed segment inverts to
white with blue condensed text.

### Inputs / Fields
- **Search:** white, borderless on the blue bar, 40px, leading search icon, 15px text.
- **Request textarea:** letterhead fill, blue-grey rule border, mono 14px/1.7, red caret; focus swaps the border and a flush 2px outline to post blue.
- **Validation line:** 13px 600 with a 16px check or alert icon, green when valid, red when not.

### Results table
Dense, sortable, sticky head on letterhead tint. Rows 36px with 10px cell
padding and soft-rule dividers; text ellipsizes. Column heads are condensed
labels in Postal Grey with a faint sort icon; the sorted column turns post
blue with a solid icon. Hover tints the row, selection fills it Row Selected
with the name in 600 post blue. Network values are Blue Slip tags.

### Chips (state badge and network tag)
- **Network tag:** Blue Slip fill, deep blue 12px 600 text, 3px corners.
- **State badge:** condensed 700 uppercase label on a slip: blue in progress, Soft Rule idle, green done, Error Slip with deep red on error or cancelled. Always followed by its message.

### Envelope (signature)
The right panel is the parcel: headline file name with the postmark beside
it, a two-column waybill (condensed terms, 600 values with muted
sub-details), the destination with a start-ellipsized path so the folder
name stays visible, the action row, the transit section and the
collapsible log in a letterhead well.

### Progress chevron (signature)
A 14px track in Soft Rule with 3px corners, filled with the airmail border
pattern (red, white, blue, white at -45deg) whose width is proportional to
bytes received, transitioning linearly over 0.3s. Below it the percentage in
Display and the byte, speed and remaining-time figures in muted data type.

### Postmark (signature)
A 92px circle rotated -11deg, 2px ring plus inset inner ring, condensed
700 12px uppercase lines for network, date and state, coloured by state
(idle slate, transit blue, done green, error red). On each state change it
re-stamps: 0.42s from -24deg and 1.35 scale to rest, on the expo-out ease;
removed under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep airmail red for sending and alarms only; the primary download action is post blue.
- **Do** set labels, column heads and stamps in Barlow Condensed uppercase with 0.06-0.08em tracking, and every value in Public Sans.
- **Do** keep tabular numerals and right-aligned numeric columns; table rows stay at 36px.
- **Do** pair every state colour with words: badge plus message, postmark with network, date and state.
- **Do** separate content inside panels with 1px blue-grey rules and the letterhead tint.
- **Do** bundle any new font locally; the CSP allows nothing external.
- **Do** honour reduced motion: no postmark stamp, no strip or button transitions.

### Don't:
- **Don't** use a solid single-colour progress bar; progress is the airmail chevron, proportional to bytes.
- **Don't** add shadows to elements inside a panel; only the two desk panels are lifted.
- **Don't** set file names, paths or other data in the condensed label face or in uppercase.
- **Don't** introduce a dark terminal look for the log or the request; they stay light, in a letterhead well.
- **Don't** loosen table density to make room; drop a column through the container query instead.
