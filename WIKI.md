# Pitt Stop Ministries — Wiki

Deep documentation for architecture, routes, and per-page behavior. Quick-start lives in [README.md](./README.md).

## Table of Contents

- [Project Structure](#project-structure)
- [Infrastructure](#infrastructure)
- [Routes](#routes)
- [Navigation](#navigation)
- [Type System](#type-system)
- [Contact Page](#contact-page)
- [Donations Page](#donations-page)
- [Sermons Page](#sermons-page)
- [Pitt Stop (About) Page](#pitt-stop-about-page)
- [Home Page](#home-page)
- [Roadmap](#roadmap)

## Project Structure

```
pit_stop_ministries/
├── index.js                  # Entry point — Express server config
├── middleware/
│   └── errorHandler.js       # Centralized error handling
├── routes/
│   ├── home.js               # Home (landing/hub) route
│   ├── sermons.js            # Sermons page route (reads + groups data/sermons.json)
│   ├── pittstop.js           # Pitt Stop (About) page route
│   ├── donations.js          # Donations page route
│   └── contacts.js           # Contact form GET/POST + Brevo relay
├── services/
│   ├── email.js              # Brevo transactional email client
│   ├── validateContact.js    # Server-side validation for contact fields
│   └── rateLimiter.js        # express-rate-limit config (5/15min per IP)
├── data/
│   └── sermons.json          # Curated YouTube sermon library (id / title / date)
├── scripts/
│   └── fetch_sermons.mjs     # Rebuilds sermons.json from a video-id list (oEmbed + upload date)
├── views/
│   ├── home.ejs
│   ├── sermons.ejs
│   ├── pittstop.ejs
│   ├── donations.ejs
│   ├── contacts.ejs
│   ├── contact-success.ejs   # Post-submit confirmation (also used for honeypot deception)
│   └── partials/
│       ├── nav.ejs           # Shared navigation partial
│       ├── footer.ejs        # Shared footer partial
│       └── head.ejs          # Stub — Phase 2 head extraction
├── public/
│   ├── css/                  # Per-page styles + shared nav/footer/type styles
│   ├── js/
│   │   ├── nav.js            # Hamburger toggle + ARIA sync
│   │   ├── sermons.js        # Thumbnail-facade → YouTube iframe on click
│   │   ├── donations.js      # Tithe.ly reveal + scroll reveal
│   │   └── contacts.js       # Crisis interception + submit state + scroll reveal
│   └── images/               # Brand imagery (lion hero, pit crew, Pastor Q)
├── .env                      # Environment variables (not committed)
├── .env.example              # Template for required env vars
└── package.json
```

## Infrastructure

- `dotenv` loaded as first line — environment variables available everywhere
- EJS template engine configured with views directory
- Static file serving from `public/`
- JSON body parsing for POST requests (`express.json()`)
- URL-encoded form body parsing (`express.urlencoded({ extended: true })`)
- `morgan` request logging in dev mode
- Centralized error handler — catches unhandled errors, returns clean 500 response

## Routes

| Method | Path               | Behavior                                                                                              |
|--------|--------------------|-------------------------------------------------------------------------------------------------------|
| GET    | `/`                | Renders the Home page — the hub (lion hero, intro, weekly rhythms, CTA paths)                         |
| GET    | `/sermons`         | Renders the Sermons page — curated YouTube library, featured latest + month groups                   |
| GET    | `/pittstop`        | Renders the Pitt Stop (About) page                                                                    |
| GET    | `/donations`       | Renders donations page with embedded Tithe.ly Give widget                                             |
| GET    | `/contacts`        | Renders contact form                                                                                  |
| POST   | `/contacts`        | Rate-limited (5/15min per IP), honeypot-checked, validated, then relays to Pastor Bowman via Brevo    |

Each page route passes `currentPage` to its template so the shared nav partial can mark the active link with `aria-current="page"`.

## Navigation

Shared `views/partials/nav.ejs` partial included by every page. Items: **Home · Sermons · Donations · Pitt Stop · Contact**. There is no standalone Events item — the two weekly rhythms live on the Home page.

- **Desktop (≥ 769px):** persistent 200px vertical rail on the left, dark background, white links
- **Mobile (≤ 768px):** rail collapses to a 48×48px hamburger button (WCAG touch target); clicking toggles `.nav-links.open` to reveal the menu
- **Active state:** matching link receives `aria-current="page"` from the route's `currentPage`, styled with gold + bold + left border (color-blind safe — three signals, not just color)
- **Accessibility:** `aria-expanded` on the hamburger stays in sync with menu state for screen readers
- **Hardening:** partial uses a local `_cp` fallback so a route that forgets to pass `currentPage` still renders cleanly

Behavior wired from `public/js/nav.js`, loaded via `<script src="/js/nav.js" defer></script>` on each page that includes the partial.

## Type System

Shared `public/css/type.css`, linked on every page after its own stylesheet so headings stay consistent site-wide.

- **Headers** (`h1`, `h2`, `h3`) use the display serif **Playfair Display** (`--font-display`, Georgia/serif fallback) for gravity and brand voice.
- **Body, labels, and card titles** stay in the system sans stack (`--font-sans`). Small uppercase labels (`.eyebrow`, `.section-eyebrow`, `.home-kicker`) and content titles (`.sermon-title`) are explicitly kept sans, so Playfair is reserved for true section headers.
- The font is pulled once via `@import` inside `type.css`, keeping each page's `<head>` clean.

## Contact Page

Form collects: name, email, category dropdown, message.

**Categories:** Prayer Request, Booking / Speaking, Marriage / Officiate, General Questions, Compliments / Testimonials, Suicidal / Emergency.

**Layout:** form-focused single column on a centered card. No intro section — the nav, H1, field labels, and submit button are sufficient signage. Empty space is intentional, accented by a soft gold radial glow behind the card so the form reads as "lit on a stage" rather than "stranded on a page."

**Crisis interception:** when "Suicidal / Emergency" is selected, `public/js/contacts.js` reveals an in-page alert with 988 call / text / chat actions and smooth-scrolls it into view. The form submission pathway remains available but is visually secondary. A contact form is not a crisis tool.

**Email delivery:** Brevo transactional API relays submissions to Pastor Bowman's inbox via `services/email.js`. Direct SMTP credentials never touch the codebase. Set `BREVO_API_KEY` in `.env` (sender domain SPF/DKIM verification still pending for production).

**Spam & abuse protection — three-layer defense on `POST /contacts`:**

1. **Rate limiting** (`services/rateLimiter.js`) — Cheapest, broadest gate. 5 submissions per 15 minutes per IP, returns HTTP 429 with a friendly retry message. Mounted as middleware on the POST route so it runs before any other logic.
2. **Honeypot** (`routes/contacts.js`) — Hidden `website` input rendered off-screen with `aria-hidden="true"` and `tabindex="-1"` so screen readers and keyboard users skip it, but bots filling every field will trip it. Triggered submissions are logged server-side with IP + identifying info, then rendered a **fake success page** so the attacker doesn't learn the trap exists.
3. **Validation** (`services/validateContact.js`) — Server-side checks on name (1–100), email (6–254 + format), category (whitelist), and message (10–2000). EJS templates auto-escape via `<%= %>` so any returned user input is XSS-safe. Errors render back to the form with the original values preserved.

Defense is intentionally layered: each gate is cheaper and broader than the next. A bot has to rotate IPs faster than 5/15min, *and* not fill the honeypot, *and* pass validation, before the email send is even attempted.

## Donations Page

Theological framing paired with a Tithe.ly Give button. Clicking opens Tithe.ly's hosted modal for the actual donation flow — the page itself stays lean and focused on the call.

**Layout:** centered single-column, dark theme matching the rest of the site. Three reveals on scroll: hero copy, theological framing, then the Give section.

**Give button:** uses the `tithely-give-button` class (which `give.js` binds the modal trigger to) and a `data-form` ID for the configured form. Tithe.ly's default inline styling has been stripped — the button is restyled to brand-gold matching the contact form's submit, so all primary actions across the site share the same visual signal.

**Supporting copy near the button:**
- Cadence line above: *"Give once, or give every month."* — surfaces recurring giving as an option without adding a separate UI control (Tithe.ly's modal handles the actual toggle).
- Trust line below: *"Secure giving powered by Tithe.ly."* — donors hesitate without a trust marker.

Route at `routes/donations.js`, view at `views/donations.ejs`, styles at `public/css/donations.css`, reveal observer at `public/js/donations.js`.

## Sermons Page

Surfaces Pastor Q's video messages from the `@cristoviveenmitvtucanaldeb3599` YouTube channel. Route at `routes/sermons.js`, view at `views/sermons.ejs`, styles at `public/css/sermons.css`, behavior at `public/js/sermons.js`.

**Content source — `data/sermons.json`:** a hand-curated list of `{ id, title, date, description }`. Because every video on the channel is titled identically ("THE PITT STOP"), display titles are date-stamped — `The Pitt Stop | Mon D, YYYY`. The list is regenerated by `scripts/fetch_sermons.mjs`, which pulls real titles via YouTube oEmbed and real upload dates by scraping each watch page (needs a `Mozilla/5.0` User-Agent). To add videos: append IDs and run `node scripts/fetch_sermons.mjs`.

**Layout:** the route sorts newest-first, features the latest message large, and groups the rest by month (`June 2026`, `May 2026`, …) into a 2-column card grid. Dark brand theme with a gold-glow hero.

**Performance — thumbnail facade:** cards render a lightweight YouTube thumbnail (`i.ytimg.com/vi/<id>/hqdefault.jpg`) plus a play button; `public/js/sermons.js` swaps in the real `youtube-nocookie` iframe only on click (video id validated against `/^[A-Za-z0-9_-]{11}$/`). The page loads ~30 small images instead of 30 live players.

## Pitt Stop (About) Page

The ministry's story. Route at `routes/pittstop.js`, view at `views/pittstop.ejs`, styles at `public/css/pittstop.css`.

**Layout:** split hero — Pastor Q's portrait (`public/images/pop-picture.jpg`) carries the visual weight, feathered via a radial `mask-image` so its pure-black backdrop melts into the dark canvas — beside a headline, lead copy, and CTAs (orange primary → Sermons, ghost → Contact). Below: an "Our heart" story section and Refuel / Repair / Send-out value cards. Orange (`#E85A1A`) is the primary accent here, gold secondary. Story/About copy is placeholder pending Pastor Q.

## Home Page

The hub that ties the site together. Route at `routes/home.js` (mounted at `/`), view at `views/home.ejs`, styles at `public/css/home.css`.

**Sections:**
1. **Hero** — the "Thy Kingdom Come / Matthew 6:10" lion (`public/images/thy-kingdom-come.jpeg`) as the spiritual anchor, with a gold aura halo and a slow fade-from-dark reveal; "Welcome" kicker + CTAs (Watch this week → Sermons, Who we are → About) below.
2. **Who is Pitt Stop** — the pit-crew image (`public/images/pit-crew.jpg`) beside the refueling-metaphor copy → links to the About story.
3. **Weekly Rhythms (events)** — *Refuel Wednesdays* + *Pitt Stop Talks* cards (placeholder times pending Pastor Q) with a "Plan your visit" nudge. Events have no separate page; they live here.
4. **Where to next** — four friction-free, benefit-led CTA cards routing to Sermons / About / Give / Connect.

Tightened, even spacing under 768px so the page glides on phones.

## Roadmap

### Phase 1 — v1 (shipped) 🏁

- [x] Foundation infrastructure (Express, EJS, middleware, centralized error handling)
- [x] Shared nav partial + mobile hamburger + active-state styling + footer partial
- [x] Contact form: Brevo email + validation + honeypot + rate limiting + crisis interception + design pass
- [x] Donations page: Tithe.ly Give widget + dark brand design pass + scroll reveals
- [x] Sermons page: curated YouTube library, month categories, thumbnail-facade players, dark design
- [x] Pitt Stop (About) page: Pastor Q hero + story + value cards
- [x] Home page (hub): lion hero, ministry intro, weekly rhythms (events folded in), CTA paths
- [x] Site-wide type system (Playfair Display headers + system-sans body)
- [x] Nav restructure (Home added, Events folded into Home) + image optimization

### Phase 2 — post-launch

- [ ] Confirm real service times + finalize sermon/About copy with Pastor Q
- [ ] Brevo sender-domain SPF/DKIM verification for production email
- [ ] Donor testimonials section on the donations page
- [ ] Auth0 integration (user accounts for Pastor Bowman to manage content)
- [ ] Collapsible desktop/tablet nav rail with icon-only state (requires icon library)
- [ ] Cookie consent + SEO/analytics groundwork
- [ ] Refactor shared `<head>` into `partials/head.ejs` (stub already exists)
