# andrewmacleod.com — project reference

Personal portfolio site for Andrew MacLeod (software engineer). Static site built with **Eleventy (11ty) v3** + **Nunjucks**, hosted on **GitHub Pages** at `andrewmacleod.com`.

This repo holds the **source only**. A GitHub Action builds the site and force-pushes the output to a separate hosting repo.

## Repo layout (git root = this folder)

```
.github/workflows/build-and-deploy.yml   CI: build + deploy (see below)
.gitignore                               `_site`, `node_modules`
README.md, LICENSE (MIT, code), CONTENT_LICENSE (content © Andrew MacLeod, no reuse)
Design/                                  NOT built or deployed — reference only.
  index.htm, styles.css                  Original hand-written HTML/CSS mockup.
  design-concepts/                       Ten standalone redesign mock-ups plus a vote page (index.html). Concept 10 ("Spec Sheet") is the design the live site now uses. Image paths are relative to StaticSite/, so open them from the repo.
StaticSite/                              The Eleventy project (all real work happens here)
  .eleventy.js                           Config
  package.json                           Only dep: @11ty/eleventy ^3.1.6 (devDependency). No npm scripts.
  CNAME                                  "andrewmacleod.com" — passthrough-copied so the Pages repo keeps the custom domain
  index.njk                              Home page: datasheet title block, Compatibility, Revision history, Notes, Related documents, Enquiries (contact form)
  404.njk                                Not-found page, output as /404.html (GitHub Pages serves it for any missing address). Plain, factual copy, with one deadpan Highlander easter egg: a footnote, "Note 1 · There can be only one."
  _includes/layout.njk                   Base layout (head, header/nav, compact title block for inner pages, footer)
  _includes/experience-layout.njk        Extends layout.njk; detail panel (Rev, dates, role) beside the Markdown body
  _includes/gallery-layout.njk           Extends layout.njk; adds GLightbox (CDN) for photo galleries
  experience/*.md                        One page per job → `experience` collection
  experience/experience.json             Directory data: layout: experience-layout.njk, tags: ["experience"]
  interests/index.njk                    Interests landing page (hand-written gallery-style cards)
  interests/innellan-pier/index.njk      Photo gallery (data array inline in the template)
  interests/innellan-pier/images/        NNN-Name.jpg + NNN-Name-Thumbnail.jpg pairs (36 photos)
  images/                                Profile photo (front, `andrew-macleod-profile-*`) and rear view (`andrew-macleod-rear-*`), each at 128/256/360/512px
  fonts/                                 Self-hosted woff2 fonts + README.txt (OFL licence note)
  styles/main.css                        Single global stylesheet
  cheeky.htm                             Standalone legacy "Perfect Omelette" page, not linked from anywhere, passthrough-copied as-is. Self-contained, with a small inline `<style>` (sans-serif, narrow column); it doesn't use main.css.
  _site/                                 Build output (gitignored)
```

## Build, run, deploy

- Local dev (from `StaticSite/`): `npx eleventy --serve` → http://localhost:8080. Restart it after changing `.eleventy.js`.
- Local build: `npx @11ty/eleventy` → `StaticSite/_site/`
- Eleventy does **not** clean `_site`, so stale pages from renamed or deleted files stay there locally. Delete `_site` before you check output. CI always starts clean.
- Don't build with a different `--output` while `StaticSite/_site` exists. The input dir is `.`, so Eleventy would treat the old `_site/` as input and re-render it.
- **Deploy**: any push to `main` triggers `.github/workflows/build-and-deploy.yml`. It uses `actions/checkout@v7` and `actions/setup-node@v7`, and runs Node 22 (matching local), `npm ci`, and `npx @11ty/eleventy` in `StaticSite/`. `npm ci` needs `package-lock.json` to stay in sync with `package.json`. It then `git init`s `_site/` and **force-pushes** it to `MacLeodDevelopment/macleoddevelopment.github.io` (main), authenticating with the `DEPLOY_TOKEN` secret.
  - Pushing to `main` publishes live. Treat it as outward-facing.
  - The hosting repo's history is overwritten on every deploy, so nothing should be edited there by hand.
- There are no tests, linting, or formatting tools.

## Eleventy config (`StaticSite/.eleventy.js`)

- `dir`: input `.`, includes `_includes`, output `_site`. There is no `_data/` directory.
- Passthrough copies: `styles`, `images`, `fonts`, `interests/**/*.jpg`, `cheeky.htm`, `CNAME`.
- **Adding a new gallery's images**: `.jpg` files under `interests/**` are copied automatically. Other extensions (`.png`, `.webp`, …) or image folders elsewhere need a new `addPassthroughCopy` line.
- `.md` and `.html` files anywhere under `StaticSite/` are rendered as templates. That's why the fonts note is `README.txt`, not `.md`.
- `.md` files are processed with Liquid as the template engine (Eleventy default). `.njk` files use Nunjucks.
- No plugins, no custom filters/shortcodes, no `pathPrefix`. The layout uses the built-in `url` filter on the desktop nav only.

## Design

The site is styled as an industrial product **datasheet**: a ruled panel (`.sheet`) made of rows and cells, monospaced uppercase labels, Schibsted Grotesk for text, Martian Mono for labels, and one safety-orange accent (`--orange`) used only as a fill (badges, current revision, crop marks, the Contact nav item, lightbox controls), never as text.

## Templates

### `layout.njk` (every page)
- `<title>` and meta description come from the front matter fields `metaTitle` and `metaDescription`. If a page omits them, the layout falls back to "Andrew MacLeod - Consultant Software Engineer" and "Portfolio website for Andrew MacLeod".
  - Every page sets both. Add them to every new page.
  - `metaTitle` is the full title, ending in " - Andrew MacLeod".
  - These are separate from `title` because `title` can contain HTML and is used as the page heading.
  - Nunjucks autoescape is on, so `&` and `"` in these values are escaped correctly.
- Both fonts are preloaded. `main.css` is an ordinary, render-blocking `<link rel="stylesheet">` on purpose: the browser waits for it before the first paint, so the page never shows unstyled. (It used to load non-blocking with a `preload` + `onload` swap, which caused a visible flash of unstyled content on every load.) Don't add inline critical CSS or make it async again. `<meta name="color-scheme" content="light dark">` makes the browser start with a dark canvas in dark mode, before the CSS arrives.
- A skip link (`.skip-link`) jumps to `#main`.
- Header is sticky (`--header-height`, 52px) and has two navs with the same links (Experience, About, Interests, Contact):
  - `nav.nav-desktop` uses the `url` filter.
  - `details.nav-mobile` is a JS-free "Menu" button (shown ≤640px) with hard-coded hrefs, wrapping its own `<nav>`.
  - **Update both when changing navigation.**
- **Profile photo** (home and inner pages): black and white, turning to colour on mouse-over (`.frame:hover img`, only under `@media (hover: hover)`, so a tap on a phone doesn't leave it in colour) and when the inner-page link has keyboard focus.
- **Home page** (`homePage: true` in front matter): the layout outputs `content` only. `index.njk` builds its own sheet, including the large title block (Fig. 1 photo, spec table).
  - Fig. 1 is styled as a drawing: a faint grid fills the whole figure cell, edge to edge, behind the label, photo and caption. The figure cell is a `div`; the `<figure>` is the inner `.dwg` grid (photo, dimension lines, then the `figcaption`, in the photo's column so it lines up with the photo's left edge). The photo sits in a `.drawing` area with dimension lines (`.dim-h`, `.dim-v`) and a scale note. The photo is capped at 420px (320px at ≤900px) so it doesn't dominate the page. The photo is pinned to the top of the drawing, so its top edge lines up with the h1, and the dimension lines go on the left and bottom to keep it there. The drawing stretches to the height of the title cell, so the two halves end level. All of the drawing decoration is `aria-hidden`.
  - **Front / rear view:** the "Fig. 1" / "Fig. 2" label is a `button.view-toggle` ("Front view" / "Rear view" beside it is plain text). A small inline script in `index.njk` flips `data-view` on `#fig-view` between `front` and `rear`, and sets `aria-hidden` on whichever photo isn't showing. CSS does the rest: `.v-front` / `.v-rear` spans hold both versions of the figure number, label, caption and scale note, and the one for the other view is `display: none`. The rear photo (`.img-rear`) sits over the front one and fades in, with the same black-and-white-until-hover filter.
  - **Tap for colour (touch screens):** the same script toggles `.is-colour` on `#fig-view` when the photo is tapped, and CSS turns both photos to colour while it's set, so it survives the Fig. 1 / Fig. 2 switch. A click toggles it if **either** the `pointerdown` reported a touch or pen pointer, **or** the device has no mouse-style hover (`(hover: hover) and (pointer: fine)` doesn't match). Browsers don't all report touch the same way (it didn't work in Opera on an iPhone SE when only `pointerType` was checked), so either signal is enough. Mouse clicks on a real mouse device are ignored, because hover handles them. The first touch or pen `pointerdown` also adds `.has-touch` to `<html>`, and the photo's hover colour rule is `@media (hover: hover) and (pointer: fine) { html:not(.has-touch) .frame:hover img }`. So a browser that wrongly claims hover can't leave the photo stuck in colour after a tap. The side effect is that on a touchscreen laptop, once a finger has touched the photo, mouse hover stops colouring it for the rest of that page visit; tapping still toggles it. A swipe that starts on the photo cancels the pointer, so it scrolls without toggling.
  - **Testing touch in headless Chrome:** `Input.synthesizeTapGesture` and `synthesizeScrollGesture` don't reach the page in `--headless=new`. Use `Input.dispatchTouchEvent` (touchStart/touchMove/touchEnd) with `Emulation.setTouchEmulationEnabled` and a `mobile: true` device metrics override.
  - **Easter egg ("the quickening", added Nov 2026 on trial):** five clicks or taps on the Fig. 1 photo within 1.5 seconds make two brief flickers (the page inverts and every ruled line flashes), then an orange stamp, "There can be only one.", lands over the photo for four seconds (click it or press Esc to dismiss). A Highlander reference to the MacLeod name.
    - Code: one block at the end of the photo script in `index.njk` (`strike`, `show`, `hide`), the `.quickening-stamp` span inside `.frame`, and the `EASTER EGG` section near the end of `main.css` (`html.is-zapped`, `body::after`, `.quickening-stamp`, `touch-action: manipulation` on the photo).
    - The flicker works by overriding `--line` and `--hair`, so every rule flashes at once, plus a white `mix-blend-mode: difference` layer that inverts the page. Two flashes keeps it under the three-flashes-a-second accessibility limit. With reduced motion it's only the stamp. The stamp is announced through `role="status"`.
    - On touch, each tap also toggles colour (above), so five taps leave the photo in colour. That's intended.
    - **It may be removed after feedback.** It arrived as a single PR, so `git revert` of that merge removes it cleanly. Otherwise delete the three pieces above.
- **Inner pages**: the layout wraps `content` in `.sheet` and adds a compact title block (`.page-head`) first, using front matter:
  - Small profile photo with crop marks, linking to the home page (alt text "Andrew MacLeod, home page").
  - Label line: `Experience · Rev {{ rev }}` when the page has `rev`, otherwise `label`, otherwise "Datasheet".
  - `title`: output with `| safe`, so HTML is allowed.
  - `subtitle`: shown under the title.
  - Inner-page content must be one or more `.row` elements, because it sits inside the sheet.
- Footer: copyright and "Document AM-DS-001 · Specifications subject to change". The year is set by inline JS (`#year` and any `.js-year`). Another small inline script closes the mobile menu when a link is clicked.
- Anchor scrolling is smooth through CSS only: `scroll-behavior: smooth` on `html`, turned off under `prefers-reduced-motion`. `scroll-padding-top` keeps targets clear of the sticky header. Put anchor `id`s on the whole section (row or cell), not the `h2`, so the "Section N" label above the heading stays visible. Don't add JS scrolling.

### `experience-layout.njk`
Chains to `layout.njk`. Outputs a `.row.sec`: a side panel with "Rev X", a Dates/Role table and a "← Revision history" link, and the Markdown body in `.cell.prose`.

### `404.njk`
Uses `layout.njk` like any inner page, with `permalink: 404.html` and `eleventyExcludeFromCollections: true`.
- **Keep the tone dry.** Andrew found a first version with several jokes ("Part not found", a "fault report", "Units at this address") too twee. The page is deliberately plain, and the only joke is the footnote (`.page-note`).
- **Links must be absolute** (starting with `/`). GitHub Pages serves this file at whatever address was asked for, so a relative link would resolve against the wrong folder. The layout's own links and assets are already absolute.
- A small inline script shows the requested address in the fault table, using `textContent` (never `innerHTML`, as it comes from the URL). `decodeURI` is wrapped in `try`, because a malformed address such as a stray `%` makes it throw.
- `npx eleventy --serve` also serves it for missing pages, with a 404 status, so it can be tested locally. The dev server hangs on a malformed address (for example one containing `%E0`), which GitHub Pages doesn't.

### `gallery-layout.njk`
Chains to `layout.njk` and sets `lightbox: true` in its front matter.
- When `lightbox` is true, `layout.njk` adds the GLightbox stylesheet to `<head>`.
- `gallery-layout.njk` loads the GLightbox script after the content and initialises it with `GLightbox({ selector: '.glightbox', zoomable: true })`.
- Both files come from jsDelivr's npm path, pinned to `glightbox@3.3.1`. When upgrading, change the version in both `layout.njk` and `gallery-layout.njk`.
- Workarounds. They rely on GLightbox 3.3.1 internals, so retest on a phone and at in-between widths after any upgrade.
  - **Swipe-to-close from the caption:** GLightbox's swipe handler only ignores touches that start inside `.gslide-desc`. A vertical drag that starts on the caption's title or padding closes the lightbox. Fixed in `gallery-layout.njk`: on `slide_after_load`, touch events are stopped from propagating out of `.gslide-description`.
  - **Caption over a zoomed image:** pinch zoom writes `scale3d(...)` into the image's inline style. CSS in `main.css` uses `.gslide:has(img[style*="scale3d"])` to hide the caption and undim the image while zoomed. Click zoom adds `.zoomed`, and GLightbox hides the caption itself.
  - **Small-screen layout:** at ≤768px wide, on any device (phones, iPads, narrow desktop windows), GLightbox adds `body.glightbox-mobile` and positions the caption over the bottom of the image, up to 78vh. `main.css` caps the caption at 38vh and reserves that space under the image (`padding-bottom` on `.ginner-container`, `max-height` on the image), so they never overlap. After "See more", `body.gdesc-open` lets it grow to 78vh again. These selectors start with `body` because GLightbox's stylesheet loads after ours and would otherwise win.
  - **"See more" link:** on phones GLightbox shortens long captions and colours the toggle white. `main.css` recolours `.desc-more`.
  - **Controls:** the prev/next/close buttons are orange squares with dark icons, so they show on the dark overlay in both colour modes.
  - **Scroll position lost on close:** `.glightbox-open { height: auto }` in `main.css` is kept at all widths. GLightbox sets `overflow: hidden` while open and only applies `height: auto` from 769px.

## Content patterns

### Experience entries (`experience/*.md`)
Required front matter:
```yaml
title: "Company"                 # h1 on the detail page; company name in the home page revision table
subtitle: "Role YYYY to YYYY."   # subtitle on the detail page
metaTitle: "<linkFriendlyTitle> - Andrew MacLeod"   # <title>
metaDescription: "Same text as intro."                # meta description
linkFriendlyTitle: "Role at Company"
order: 1                          # sort key on home page (ascending, 1 = most recent)
rev: "E"                          # revision letter, A = earliest. The current role (F) is hard-coded in index.njk.
years: "2021 – 2026"              # Dates column and detail panel (en dash)
role: "Senior consultant"         # short role, shown under the company name
shortTitle: "FACE"                # optional: shorter company name for the revision table
intro: "One-sentence summary."   # Description column on the home page
```
Body conventions:
- Markdown with `### Tech Stack` followed by a `·`-separated list.
- Project/client sections as `##`, with `### Role` subsections. In `.prose`, `h3` renders as a small mono label.
- Layout and tag come from `experience.json`, so don't repeat them.

URL = `/experience/<filename-slug>/`. The home page loops `collections.experience | sort(attribute="data.order")`.

Current order:
1. CGI/BJSS (2021–2026), Rev E
2. Parexel/Calyx (2016–2021), Rev D
3. Ideagen (2014–2016), Rev C
4. FACE (2013–2014), Rev B
5. Earlier roles, Rev A

The current role (Principal Engineer at a London-based property-tech company, working remotely from Nottingham) appears as Rev F in the home page revision table and in the title block's spec table and badge. It has no detail page.

### Galleries (`interests/<name>/index.njk`)
- Use `layout: gallery-layout.njk`, and set `label` (e.g. "Interests · Gallery").
- Content is a `.row.sec`: intro in `.sec-label`, the grid in a `.cell`.
- Photos are defined inline with `{% set photos = [ {title, desc, full_title, full_desc, file}, ... ] %}`.
- `file` is the base name with no extension. The template expects both `images/<file>.jpg` (full size) and `images/<file>-Thumbnail.jpg`.
- `full_desc` can be long, with `\n` line breaks. It is shown in the GLightbox description panel.
- Markup: `.gallery-grid` > `a.gallery-card.glightbox[data-gallery][data-title][data-description]` > `img` (lazy, width/height set) + `.gallery-card-content`.
- New interest pages also need a card in `interests/index.njk` (same `.gallery-card` markup, without `.glightbox`), and a link under "Related documents" on the home page if wanted.

### Contact form (in `index.njk`, "Enquiries")
- Uses Cloudflare Turnstile (sitekey `0x4AAAAAADmqC7wRlvnimFim`). `.turnstile-container` reserves 65px so the button doesn't jump.
- On submit, JS POSTs JSON `{email, message, token}` to the Cloudflare Worker `https://api-email-worker.andrewmacleod-com.workers.dev`.
- The Worker is a separate project and is not in this repo.
- Status messages go to `#contact-status` (`aria-live`).

## CSS (`styles/main.css`)
- `@font-face` for the two self-hosted fonts (Latin `unicode-range`, `font-display: swap`). Characters outside Latin (arrows) fall back to system fonts.
- Design tokens are custom properties on `:root`: `--bg`, `--panel`, `--ink`, `--muted`, `--line` (strong rules), `--hair` (light rules), `--orange`, `--on-orange`, `--focus`, `--max-width` (min(1200px, 94%)), `--header-height`, `--gap`, `--sans`, `--mono`.
- Themes and accessibility modes follow the OS through media queries: `prefers-color-scheme: dark`, `prefers-contrast: more`, `forced-colors: active` and `prefers-reduced-motion`. There is no manual theme toggle.
- Breakpoints:
  - 900px: rows stack to one column (title block, split rows, section label above content); Compatibility goes to 2 columns.
  - 640px: the "Menu" button replaces the desktop nav; Compatibility goes to 1 column; the revision table turns into one block per row.
  - 420px: tighter `--gap`.
- Component sections: header and navs; sheet (`.sheet`, `.row`, `.cell`, `.row.sec` + `.sec-label`, `.row.split`); home title block (`.r-title`, `.frame` crop marks, `.badge`, `table.specs`); inner-page `.page-head`; `.compat`; `table.rev`; `.notes`, `.related`, `.back-link`; `.prose`; contact form; footer; external-link icon (`a[target="_blank"][href^="http"]::after`); `.gallery-*`; GLightbox overrides.
- `img:not(.gslide-image img)` applies the global image rules while leaving lightbox images alone.

## Conventions and preferences
- Accessibility matters:
  - Screen-reader text uses `.sr-only`, e.g. "(opens in a new tab)" on external links. External links use `target="_blank" rel="noopener"`.
  - Use semantic sections with `id`s as nav anchors (`#experience`, `#about`, `#contact`).
- Performance and CLS matter. Images need explicit `width`/`height` and `srcset`, gallery thumbnails need `loading="lazy"`, fonts are self-hosted and preloaded, and the one stylesheet loads render-blocking so there's no flash of unstyled content.
- No front-end framework or bundler. Keep JS inline and minimal; CDN libraries only when needed (GLightbox, Turnstile).
- British English in content.
- **Where Andrew is (keep copy consistent):** he's from Nottingham and lives there. His first job (graphic design for a financial company) was in London. His current role is with a London-based property-tech company, working remotely from Nottingham. Don't describe him as London-based or living in London. This applies to the mock-ups in `Design/design-concepts/` too.
- Line endings: `core.autocrlf=true`, so files are LF in the repo and CRLF in the working tree. When editing files with scripts, keep CRLF consistent. A stray lone `\r` makes git treat the file as binary.
  - In Git Bash, `sed -i` strips the `\r`s (the whole file ends up LF), and `grep -c $'\r'` always reports 0 because grep drops CRs. Count them with `tr -cd '\r' < file | wc -c`, and fix a file with `unix2dos file`.
  - If a file shows as modified but `git diff` is empty, only its line endings changed. `git checkout -- file` rewrites it as CRLF.
- Commit messages are short and imperative ("Update text", "Add CNAME").

## Known quirks / possible improvements (not yet fixed)
- `npm audit` (Oct 2026, Eleventy 3.1.6) reports 9 remaining vulnerabilities (5 high, 4 moderate). None has an upstream fix, and nothing from them is shipped to the live site:
  - `braces` (every version), via `chokidar@3`, which is used by `nunjucks` and `eleventy-dev-server`. This is a DoS from untrusted glob patterns, and the only glob patterns here are our own.
  - `sprintf-js` (every version), via `argparse` → `js-yaml@3` → `gray-matter`. This is a DoS from untrusted format strings, which we don't use.
  - Accepted risk. Recheck when Eleventy 4 is stable.
  - **Never run `npm audit fix --force`.** It "fixes" these by downgrading Eleventy to 0.6.0.
