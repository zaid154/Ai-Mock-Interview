# MockMate AI — Responsive UI Repair Brief

**Scope:** `client/` only (React 18 + Vite, plain JS, single stylesheet `client/src/index.css`).
No server, DB, auth, or API changes. No new dependencies. No redesign — the existing
visual language (Vercel/Linear-style dark+light tokens) must be preserved exactly.

**Goal:** the app must render correctly and without horizontal overflow at every width
from **320px to 1920px**, on mobile, tablet, laptop and desktop.

---

## 0. Critical context before you start

The stylesheet is **out of sync with the JSX**. Roughly 17 class names are referenced in
components but have **no rule anywhere in `index.css`**, and four classes that *do* have
responsive rules are referenced by **no component at all**. This is the single biggest
reason the UI "breaks" — large parts of Quiz, Results and Interview are rendering
completely unstyled, and the mobile media queries are targeting selectors that never match.

Fixing only the media queries will not work. The missing component styles must be
authored first, then the breakpoint system rebuilt on top.

---

## 1. Missing CSS classes — author these first

Every class below is used in JSX but is **not defined** in `client/src/index.css`.
Write styles that match the surrounding design system (`--surface`, `--surface-2`,
`--border`, `--accent-primary`, `--radius` values already in use, `--shadow-sm/md/lg`).
They must work in **both** `[data-theme="light"]` and `[data-theme="dark"]`.

| Class | Used at | What it must be |
|---|---|---|
| `.small` | 16 files (e.g. `Dashboard.jsx:362`, `Quiz.jsx:117`, `Results.jsx:106`) | Font-size utility, ~`0.82rem`. Currently a no-op, so "small" text renders at full body size wherever no inline `fontSize` was also set. |
| `.question-text` | `Interview.jsx:274`, `Quiz.jsx:151`, `Results.jsx:160,204` | Question prompt block: comfortable line-height, `overflow-wrap: anywhere` so long code identifiers cannot overflow. |
| `.question-card` | `Quiz.jsx:138` | Panel/card wrapper — same treatment as `.panel`. |
| `.options-grid` | `Quiz.jsx:156`, `Results.jsx:177` | Vertical stack of MCQ options with gap. Single column on all sizes. |
| `.option-card` + `.selected` / `.correct` / `.wrong` | `Quiz.jsx:161`, `Results.jsx:184` | Full-width clickable option row: flex, letter badge + text + trailing icon, `text-align: left`, state colours from `--accent-primary` / `--good` / `--bad`. **Currently the entire MCQ quiz UI is unstyled native buttons.** |
| `.option-letter` | `Quiz.jsx:164`, `Results.jsx:187` | Fixed-size circular A/B/C/D badge, `flex-shrink: 0`. |
| `.interview-hud-head` | `Interview.jsx:125`, `Quiz.jsx:108` | The session header: two children side by side on desktop (`display:flex; justify-content:space-between; align-items:flex-start; gap`), **stacked on mobile**. With no rule at all it is a plain block, which is why the timer/counter sits under the title at every width. |
| `.progress-track` / `.progress-fill` | `Interview.jsx:239-240`, `Quiz.jsx:133-134` | Progress bar. Track needs height + background + radius + `overflow:hidden`; fill needs height 100% + accent background + width transition. **Currently invisible — the `width: X%` inline style paints nothing.** |
| `.score-ring`, `.score-donut`, `.score-donut-inner`, `.score-value` | `Results.jsx:102-105` | The overall-score donut. `.score-donut` receives a `--pct` custom property inline — implement with `conic-gradient(var(--accent-primary) calc(var(--pct) * 1%), var(--surface-3) 0)`, a centred inner circle, and a fixed size that shrinks on mobile. **Currently renders as bare text.** |
| `.spin` | `Certificates.jsx:204` | `animation: spin 1s linear infinite` + the `@keyframes spin`. The PDF loading spinner never spins. |
| `.hover-lift` | `Certificates.jsx:356` | Small hover affordance for the credential-ID link. |

### Dead CSS — remove or rewire

These have rules (including inside media queries) but **no component uses them**:

- `.stats-grid`, `.podium-grid` — listed in the `max-width: 768px` stacking rule
  (`index.css:1399`) alongside `.dashboard-grid` and `.cert-page-grid`. Two of the four
  selectors are dead.
- `.table-wrap`, `.table-responsive` — the horizontal-scroll helpers at `index.css:1405`.
  Nothing uses them; `Leaderboard.jsx:184` re-implements it inline instead.

Either delete them, or (preferred for the table helpers) apply `.table-wrap` to the
Leaderboard table container so there is one implementation.

---

## 2. Layout bugs — all viewports (not only mobile)

### 2.1 Invalid inline style prop `justify:` — 8 files

React silently drops unknown style keys, so **every one of these flex containers is
falling back to `justify-content: flex-start`**:

```
components/Navbar.jsx:242      justify: 'flex-start'
pages/Certificates.jsx:382     justify: 'center'
pages/Dashboard.jsx:174        justify: 'space-between'
pages/ForgotPassword.jsx:54    justify: 'space-between'
pages/Interview.jsx:302        justify: 'space-between'
pages/Login.jsx:61             justify: 'space-between'
pages/Profile.jsx:235          justify: 'space-between'
pages/Register.jsx:46          justify: 'space-between'
```

Replace every one with `justifyContent`. Visible effects today: the Dashboard header
stats hug the title instead of sitting right; the Profile action buttons do not right-align;
Interview's "Clear Answer" button does not right-align; the Certificates locked card is
not vertically distributed; the auth left panes do not push their footer down.

Also `Interview.jsx:191` has `uppercase: 'true'` — not a CSS property. Use
`textTransform: 'uppercase'`.

### 2.2 `.container` is declared twice, with conflicting widths

- `index.css:253` → `width: min(1120px, 92vw)`, `padding: 2rem 0 3.5rem`
- `index.css:1312` → `width: 100%`, `max-width: 1200px`, `padding-left/right: 1.25rem`

Meanwhile `.nav-inner` (`index.css:586`) is still `width: min(1120px, 92vw)`.

Result: on laptop and desktop the **navbar content and the page content do not line up** —
the brand/nav sits on a 1120px (or 92vw) rail while page content sits on a 1200px rail with
its own 1.25rem padding. Collapse these into **one** `.container` definition and make
`.nav-inner` and the footer use the exact same width + padding tokens.

### 2.3 Landing sections destroy the container's horizontal padding

Four `<section className="container">` elements override `padding` with the shorthand,
which resets left/right to `0`:

```
pages/Landing.jsx:106   padding: '4.5rem 0 3rem'
pages/Landing.jsx:163   padding: '4.5rem 0 3.5rem'
pages/Landing.jsx:327   padding: '2rem 0'
pages/Landing.jsx:344   padding: '4rem 0 5rem'
```

On mobile these four sections run **edge-to-edge with zero side gutter** while the hero
(line 39, which correctly uses `paddingTop`/`paddingBottom`) does not — so the landing page
visibly jumps between aligned and unaligned blocks as you scroll.

Fix: use `paddingTop`/`paddingBottom` only, or move the spacing into a CSS class. Same
issue pattern in `Footer.jsx:42` and `Footer.jsx:146` (`padding: '0 1rem'` overrides the
container gutter with a different value).

---

## 3. Mobile-specific breakage

### 3.1 The global full-width button rule

```css
/* index.css:1445 */
@media (max-width: 480px) {
  .btn { width: 100%; justify-content: center; }
}
```

This hits **every** `.btn` on the site, including buttons that live inside horizontal flex
rows. Confirmed damage below 480px:

- `Navbar.jsx:260` — the "Get Started" pill expands and crushes the brand + hamburger.
- `AdminDashboard.jsx:500-515` — "Verify", the promote/demote button, inside the user row.
- `AdminDashboard.jsx:435` — "Add Key" beside the key input.
- `AdminDashboard.jsx:358` — the "Upload Image" label-button beside the URL input.
- `AdminDashboard.jsx:584-587` — "Save" / "Rename" in every `SettingRow`.
- `Profile.jsx:456` — "Apply URL" beside the photo-URL input.
- `Bookmarks.jsx:195` — "Copy" in the card header actions.
- `Interview.jsx:262-267` — "Copy Question" / "Bookmark".

Replace the blanket rule with an **opt-in** class (e.g. `.btn-block-mobile`) applied only
where a full-width button is actually wanted, or scope it to specific containers such as
form submit rows. `.btn-block` already exists for the intentional cases.

### 3.2 Footer collapses to 2 columns on the smallest phones

`index.css:1217` sets `.footer-grid { grid-template-columns: 1fr }` at `≤550px`, but
`index.css:1432` sets `grid-template-columns: 1fr 1fr !important` at `≤768px`. The 768
block appears **later in the file and carries `!important`**, so it wins on a 360px phone —
the footer link columns stay side by side and squeeze. Remove the conflict; keep one
authoritative rule per breakpoint.

### 3.3 Non-wrapping flex rows that overflow

Add `flex-wrap: wrap` (and `min-width: 0` on the growing child where text must ellipsize):

- `AdminDashboard.jsx:467` — the badge + 3-button action cluster in each user row.
- `AdminDashboard.jsx:428` — the add-key form.
- `AdminDashboard.jsx:351` — the signature input + upload button.
- `Profile.jsx:445` — the URL input + "Apply URL".
- `Dashboard.jsx:192` — the "Completed / Avg Rating" stat pair with its divider.
- `Dashboard.jsx:395` — the score chip + delete button inside `.history-item`.
- `Quiz.jsx:189` — the Previous/Next navigation row. Note `Interview.jsx:367` already has
  `flexWrap: 'wrap'` here; Quiz does not. Make them consistent.
- `Bookmarks.jsx:181` — the question header; the text `<div>` needs `flex: 1; min-width: 0`.

### 3.4 Fixed `minWidth` that exceeds a phone viewport

`Certificates.jsx:412` — the qualification-progress box is `minWidth: '320px'` inside a
panel with `padding: '4rem 2rem'`, inside the container's 1rem gutter. On a 360px screen the
available width is ~264px, so it **overflows by ~56px**. Make it `width: 100%` with
`max-width: 420px`, and reduce the panel padding at small widths.

### 3.5 Tables crush instead of scrolling

`Leaderboard.jsx:184-185` — the panel has `overflowX: 'auto'` but the `<table>` has
`width: 100%` and no `min-width`, so on mobile the columns compress and wrap into an
unreadable stack rather than scrolling. Give the table a `min-width` (~640px) so the
existing overflow container actually engages. Reuse `.table-wrap` from §1 for this.

### 3.6 Overflow is masked, not fixed

```css
/* index.css:1307 */
html, body { max-width: 100vw; overflow-x: hidden !important; }
```

This hides the symptom of every overflow above, which is why the breakage shows up as
*clipped* content rather than a scrollbar. It also risks breaking the `position: sticky`
navbar in some browsers. Once §2 and §3 are fixed, remove the `!important` (and preferably
the whole rule) and verify no page produces a horizontal scrollbar at 320px.

### 3.7 `100vh` on mobile

`Landing.jsx:37` uses `minHeight: '100vh'` while the rest of the app (`index.css:108,244`)
correctly uses `100dvh`. On mobile browsers `100vh` includes the collapsing URL bar and
causes a jump on scroll. Switch to `100dvh` (or drop it — the section already has its own
`minHeight: 420px` hero).

---

## 4. Breakpoint system — consolidate

Current breakpoints are ad-hoc and mutually inconsistent:
`480, 550, 600, 680, 768 (three separate blocks), 860, 900 (two blocks), 960` — plus
auto-fit grids at `minmax(220px/240px/250px/260px/280px/320px, 1fr)`.

Two blocks are also mutually redundant: `.mobile-menu-btn` / `.nav-links-desktop` are
toggled at **both** `768px` (`index.css:698`) and `960px` (`index.css:1351`), so the real
hamburger breakpoint is 960 and the 768 block is dead weight.

Standardise on **three** breakpoints and put every responsive rule in those three blocks,
in one clearly-marked section at the end of the file:

| Token | Range | Behaviour |
|---|---|---|
| Desktop / laptop | `> 1024px` | Full multi-column layouts |
| Tablet | `≤ 1024px` | Hamburger nav on, 2-column grids collapse to 1, side-by-side panels stack |
| Mobile | `≤ 640px` | Single column everywhere, tighter gutters/padding, larger tap targets |
| Small phone | `≤ 380px` | Only typography/padding tightening — **no new layout changes** |

Also fix the anchor-scroll offsets: `scroll-padding-top` / `scroll-margin-top` are `80px`
(`index.css:102,112`) but the navbar is `56px` (`48px` on mobile), leaving a visible gap on
every in-page jump. `Footer.jsx:27,34` hardcodes the same wrong `- 80` offset in JS.
Drive all three from one value.

---

## 5. Theme conflict (fix while you are in here)

`ThemeContext.jsx:12-15` sets `data-theme` from localStorage / `prefers-color-scheme`,
but `Navbar.jsx:23-25` unconditionally forces `data-theme="light"` on mount. Because
child effects run before parent effects, **ThemeProvider wins** — so a user whose OS is in
dark mode gets the dark palette, with no toggle anywhere (the switcher was removed from the
navbar and the admin page).

Meanwhile several surfaces are hardcoded light and will clash in dark mode:
`.official-cert-card` and the whole `.official-cert-*` family (`index.css:940-1144`) use
literal `#ffffff` / `#0f172a` / `#cbd5e1`.

Decide one of:
- **(a)** commit to light-only — delete the `[data-theme="dark"]` block's role as the
  `:root` default, make `:root` the light palette, and remove the dead ThemeContext; or
- **(b)** restore a working toggle and make the certificate card explicitly light-on-dark.

Pick (a) unless the toggle is wanted back. Either way, `Navbar.jsx:23-25` must go.

---

## 6. Constraints

- Do **not** change any visual design, spacing scale, colour token, font, or copy.
- Do **not** add a CSS framework, a preprocessor, or any npm package.
- Do **not** touch `server/`.
- Keep `index.css` as the single stylesheet; keep the existing section comments.
- Prefer moving repeated inline styles into classes **only** where it is needed to fix a
  bug — this is a repair pass, not a refactor.
- Every fix must be verified against both themes if §5 keeps the toggle.

---

## 7. Acceptance criteria

1. **Zero horizontal overflow** at 320, 360, 390, 414, 768, 820, 1024, 1280, 1440, 1920 px —
   verified with `document.documentElement.scrollWidth <= window.innerWidth` on every route,
   *after* `overflow-x: hidden` is removed.
2. **No unstyled components**: Quiz options, Results score donut, Interview/Quiz progress
   bars and HUD headers all render as designed.
3. **No React "unsupported style property" warnings** in the console on any route.
4. Navbar content and page content share the same left/right rail at every width ≥1024px.
5. Hamburger ↔ desktop nav switch happens at exactly one breakpoint.
6. Footer is 1 column ≤640px, 2 columns ≤1024px, 4 columns above.
7. No button is unintentionally full-width; no action row overflows its card.
8. Leaderboard table scrolls horizontally on mobile instead of crushing.
9. In-page anchor links (Overview / Benefits / Specifications / How-to) land flush under
   the navbar with no gap, from both the navbar and the footer.
10. Landing page has an even gutter down its whole length on mobile.

## 8. Routes to test

`/` · `/login` · `/register` · `/verify` · `/forgot-password` · `/dashboard` ·
`/interview/:id` · `/quiz/:id` · `/results/:id` · `/bookmarks` · `/leaderboard` ·
`/certificates` · `/verify-certificate/:certId` · `/profile` · `/admin`

Admin and the Quiz/Results pages are the highest-risk and must be checked at 360px
explicitly — they contain the densest action rows and the unstyled components.
