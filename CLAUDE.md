# andrewmacleod.com — project reference

Personal portfolio site for Andrew MacLeod (software engineer). Static site built with **Eleventy (11ty) v3** + **Nunjucks**, hosted on **GitHub Pages** at `andrewmacleod.com`.

This repo holds the **source only**. A GitHub Action builds the site and force-pushes the output to a separate hosting repo.

## Repo layout (git root = this folder)

```
.github/workflows/build-and-deploy.yml   CI: build + deploy (see below)
.gitignore                               .NET template + `_site`, `node_modules`
README.md, LICENSE (MIT, code), CONTENT_LICENSE (content © Andrew MacLeod, no reuse)
Design/                                  Old hand-written HTML/CSS mockup (index.htm, styles.css). NOT built or deployed — historical reference only.
StaticSite/                              The Eleventy project (all real work happens here)
  .eleventy.js                           Config
  package.json                           Only dep: @11ty/eleventy ^3.1.2 (devDependency). No npm scripts.
  CNAME                                  "andrewmacleod.com" — passthrough-copied so the Pages repo keeps the custom domain
  index.njk                              Home page: Experience cards, About, Contact form
  _includes/layout.njk                   Base layout (head, header/nav, hero, footer)
  _includes/gallery-layout.njk           Extends layout.njk; adds GLightbox (CDN) for photo galleries
  experience/*.md                        One page per job → `experience` collection
  experience/experience.json             Directory data: layout: layout.njk, tags: ["experience"]
  interests/index.njk                    Interests landing page (hand-written cards)
  interests/innellan-pier/index.njk      Photo gallery (data array inline in the template)
  interests/innellan-pier/images/        NNN-Name.jpg + NNN-Name-Thumbnail.jpg pairs (36 photos)
  images/                                Profile photo at 128/256/360/512px
  styles/main.css                        Single global stylesheet (~700 lines)
  cheeky.htm                             Standalone legacy "Perfect Omelette" page, not linked from anywhere, passthrough-copied as-is. Self-contained, with a small inline `<style>` (sans-serif, narrow column); it doesn't use main.css.  _site/                                 Build output (gitignored)
```

## Build, run, deploy

- Local dev (from `StaticSite/`): `npx eleventy --serve` → http://localhost:8080
- Local build: `npx @11ty/eleventy` → `StaticSite/_site/`
- Eleventy does **not** clean `_site`, so stale pages from renamed or deleted files stay there locally. Delete `_site` before you check output. CI always starts clean.
- Don't build with a different `--output` while `StaticSite/_site` exists. The input dir is `.`, so Eleventy would treat the old `_site/` as input and re-render it.
- **Deploy**: any push to `main` triggers `.github/workflows/build-and-deploy.yml`. It runs Node 20, `npm install`, and `npx @11ty/eleventy` in `StaticSite/`. It then `git init`s `_site/` and **force-pushes** it to `MacLeodDevelopment/macleoddevelopment.github.io` (main), authenticating with the `DEPLOY_TOKEN` secret.
  - Pushing to `main` publishes live. Treat it as outward-facing.
  - The hosting repo's history is overwritten on every deploy, so nothing should be edited there by hand.
- There are no tests, linting, or formatting tools.

## Eleventy config (`StaticSite/.eleventy.js`)

- `dir`: input `.`, includes `_includes`, output `_site`. There is no `_data/` directory.
- Passthrough copies: `styles`, `images`, `interests/**/*.jpg`, `cheeky.htm`, `CNAME`.
- **Adding a new gallery's images**: `.jpg` files under `interests/**` are copied automatically. Other extensions (`.png`, `.webp`, …) or image folders elsewhere need a new `addPassthroughCopy` line.
- `.md` files are processed with Liquid as the template engine (Eleventy default). `.njk` files use Nunjucks.
- No plugins, no custom filters/shortcodes, no `pathPrefix`. The layout uses the built-in `url` filter on the desktop nav only.

## Templates

### `layout.njk` (every page)
- `<title>` and meta description come from the front matter fields `metaTitle` and `metaDescription`. If a page omits them, the layout falls back to "Andrew MacLeod - Consultant Software Engineer" and "Portfolio website for Andrew MacLeod".
  - Every page sets both. Add them to every new page.
  - `metaTitle` is the full title, ending in " - Andrew MacLeod".
  - These are separate from `title` because `title` can contain HTML and is used as the hero heading.
  - Nunjucks autoescape is on, so `&` and `"` in these values are escaped correctly.
- Stylesheet is loaded non-blocking (`preload` + `onload` swap, `<noscript>` fallback). Inline `<style>` holds only critical CLS-prevention rules for the header, hero and `#year`. If hero/header sizing changes in `main.css`, update these inline rules to match.
- Header has two navs with the same links:
  - `nav.nav-desktop` uses the `url` filter.
  - `details.nav-mobile` is a JS-free hamburger (shown ≤420px) with hard-coded hrefs.
  - **Update both when changing navigation.**
- **Hero is rendered on every page** using front matter:
  - `title`: output with `| safe`, so HTML is allowed. Falls back to "Hello! I am Andrew MacLeod".
  - `subtitle`: shown under the title.
  - The profile image always shows.
- Footer year is set by inline JS. Another small inline script closes the mobile menu when a link is clicked.
- Anchor scrolling is smooth through CSS only: `scroll-behavior: smooth` on `html, body`, turned off under `prefers-reduced-motion`. `scroll-margin-top` on `h2` keeps headings clear of the fixed header. Don't add JS scrolling.

### `gallery-layout.njk`
Chains to `layout.njk`. It loads GLightbox CSS/JS from jsDelivr (unpinned versions) inside `<body>` and initialises it with `GLightbox({ selector: '.glightbox', zoomable: true })`.

## Content patterns

### Experience entries (`experience/*.md`)
Required front matter:
```yaml
title: "Company"                 # hero h1 on the detail page
subtitle: "Role YYYY to YYYY."   # hero subtitle
metaTitle: "<linkFriendlyTitle> - Andrew MacLeod"   # <title>
metaDescription: "Same text as intro."                # meta description
linkFriendlyTitle: "Role at Company"  # card heading on home page
order: 1                          # sort key on home page (ascending, 1 = most recent)
intro: "One-sentence summary."   # card text on home page
```
Body conventions:
- Markdown with `### Tech Stack` followed by a `·`-separated list.
- Project/client sections as `##`, with `### Role` subsections.
- Layout and tag come from `experience.json`, so don't repeat them.

URL = `/experience/<filename-slug>/`. The home page loops `collections.experience | sort(attribute="data.order")`.

Current order:
1. CGI/BJSS (2021–2026)
2. Parexel/Calyx (2016–2021)
3. Ideagen (2014–2016)
4. FACE (2013–2014)
5. Earlier roles

### Galleries (`interests/<name>/index.njk`)
- Use `layout: gallery-layout.njk`.
- Photos are defined inline with `{% set photos = [ {title, desc, full_title, full_desc, file}, ... ] %}`.
- `file` is the base name with no extension. The template expects both `images/<file>.jpg` (full size) and `images/<file>-Thumbnail.jpg`.
- `full_desc` can be long, with `\n` line breaks. It is shown in the GLightbox description panel.
- Markup: `.gallery-grid` > `a.gallery-card.glightbox[data-gallery][data-title][data-description]` > `img` (lazy) + `.gallery-card-content`.
- New interest pages also need a hand-written card in `interests/index.njk`. That page reuses the `.experience` / `.experience-card` classes.

### Contact form (in `index.njk`)
- Uses Cloudflare Turnstile (sitekey `0x4AAAAAADmqC7wRlvnimFim`).
- On submit, JS POSTs JSON `{email, message, token}` to the Cloudflare Worker `https://api-email-worker.andrewmacleod-com.workers.dev`.
- The Worker is a separate project and is not in this repo.
- Status messages go to `#contact-status` (`aria-live`).

## CSS (`styles/main.css`)
- Design tokens are custom properties on `:root`: `--bg`, `--text`, `--muted`, `--link`, `--header-bg`, `--card-bg`, `--border`, `--footer-bg`, `--focus`, `--shadow`, `--max-width` (min(900px, 90%)), `--radius`, `--header-height`.
- Themes and accessibility modes follow the OS through media queries: `prefers-color-scheme: dark`, `prefers-contrast: more`, `forced-colors: active` and `prefers-reduced-motion`. There is no manual theme toggle.
- Breakpoints:
  - 520px: smaller hero.
  - 420px: hero stacks; the mobile hamburger replaces the desktop nav.
- Component sections:
  - Header and both navs.
  - Hero.
  - `.experience` / `.experience-card` (card grid, also used on the Interests page).
  - Contact form.
  - `.sr-only`.
  - An external-link icon via `a[target="_blank"][href^="http"]::after`.
  - `.gallery-*`.
  - GLightbox overrides (`.gslide-*`, `.goverlay`, `.gnext/.gprev/.gclose`). `.gslide-title` and `.gslide-desc` are each defined twice.
- `img:not(.gslide-image img)` applies the global image rules while leaving lightbox images alone.

## Conventions and preferences
- Accessibility matters:
  - Screen-reader text uses `.sr-only`, e.g. "(opens in a new tab)" on external links. External links use `target="_blank" rel="noopener"`.
  - Use semantic sections with `id`s as nav anchors (`#experience`, `#about`, `#contact`).
- Performance and CLS matter. Images need explicit `width`/`height` and `srcset`, gallery thumbnails need `loading="lazy"`, and the CSS loads non-blocking.
- No front-end framework or bundler. Keep JS inline and minimal; CDN libraries only when needed (GLightbox, Turnstile).
- British English in content.
- Line endings: `core.autocrlf=true`, so files are LF in the repo and CRLF in the working tree. When editing files with scripts, keep CRLF consistent. A stray lone `\r` makes git treat the file as binary.
- Commit messages are short and imperative ("Update text", "Add CNAME").

## Known quirks / possible improvements (not yet fixed)
- The workflow uses `actions/checkout@v3` (old) and `npm install` rather than `npm ci`.
- GLightbox CDN URLs aren't version-pinned, and the CSS `<link>` sits in `<body>`.
- The root `.gitignore` is mostly an unrelated .NET template.
