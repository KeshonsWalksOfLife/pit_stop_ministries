# Pitt Stop Ministries — Wiki

Deep documentation for architecture, routes, and per-page behavior. Quick-start lives in [README.md](./README.md).

## Table of Contents

- [Project Structure](#project-structure)
- [Infrastructure](#infrastructure)
- [Routes](#routes)
- [Navigation](#navigation)
- [Contact Page](#contact-page)
- [Donations Page](#donations-page)
- [Sermons Page](#sermons-page)
- [Roadmap](#roadmap)

## Project Structure

```
pit_stop_ministries/
├── index.js                  # Entry point — Express server config
├── middleware/
│   └── errorHandler.js       # Centralized error handling
├── routes/
│   ├── donations.js          # Donations page route
│   ├── sermons.js            # Sermons page route
│   └── contacts.js           # Contact form GET/POST + Brevo relay
├── services/
│   ├── email.js              # Brevo transactional email client
│   ├── validateContact.js    # Server-side validation for contact fields
│   └── rateLimiter.js        # express-rate-limit config (5/15min per IP)
├── views/
│   ├── donations.ejs
│   ├── sermons.ejs
│   ├── contacts.ejs
│   ├── contact-success.ejs   # Post-submit confirmation (also used for honeypot deception)
│   └── partials/
│       ├── nav.ejs           # Shared navigation partial
│       ├── footer.ejs        # Shared footer partial
│       └── head.ejs          # Stub — Phase 2 head extraction
├── public/
│   ├── css/                  # Per-page styles + shared nav/footer styles
│   ├── js/
│   │   ├── nav.js            # Hamburger toggle + ARIA sync
│   │   └── contacts.js       # Crisis interception + submit state + scroll reveal
│   └── assets/               # Images
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
| GET    | `/`                | Health check response                                                                                 |
| GET    | `/donations`       | Renders donations page with embedded Tithe.ly Give widget                                             |
| GET    | `/sermons`         | Renders sermons page (scaffold)                                                                       |
| GET    | `/contacts`        | Renders contact form                                                                                  |
| POST   | `/contacts`        | Rate-limited (5/15min per IP), honeypot-checked, validated, then relays to Pastor Bowman via Brevo    |

Each page route passes `currentPage` to its template so the shared nav partial can mark the active link with `aria-current="page"`.

## Navigation

Shared `views/partials/nav.ejs` partial included by every page.

- **Desktop (≥ 769px):** persistent 200px vertical rail on the left, dark background, white links
- **Mobile (≤ 768px):** rail collapses to a 48×48px hamburger button (WCAG touch target); clicking toggles `.nav-links.open` to reveal the menu
- **Active state:** matching link receives `aria-current="page"` from the route's `currentPage`, styled with gold + bold + left border (color-blind safe — three signals, not just color)
- **Accessibility:** `aria-expanded` on the hamburger stays in sync with menu state for screen readers
- **Hardening:** partial uses a local `_cp` fallback so a route that forgets to pass `currentPage` still renders cleanly

Behavior wired from `public/js/nav.js`, loaded via `<script src="/js/nav.js" defer></script>` on each page that includes the partial.

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

Currently a scaffold. Route at `routes/sermons.js`, view at `views/sermons.ejs`, styles at `public/css/sermons.css`. YouTube channel embed and design pass pending.

## Roadmap

- [x] Foundation infrastructure
- [x] Donations route + Tithe.ly widget embed
- [x] Shared nav partial + mobile hamburger + active-state styling
- [x] Footer partial + footer.css (seamless dark blend)
- [x] Contact form: scaffold + Brevo email + validation + honeypot + rate limiting
- [x] Contact form: error state polish + submit loading state
- [x] Contact-success view: brand styling + name personalization
- [x] Nav rail: widened to 200px, dark recolor, current-page hardening
- [x] Crisis interception JS for emergency category
- [x] Contact page design pass (dark theme + form-focused layout + radial glow)
- [x] Sermons page (scaffold)
- [x] Donations page design pass (dark theme + brand-gold Give button + footer + reveals)
- [ ] Sermons page: YouTube channel embed + design pass *(next)*
- [ ] Donor testimonials section on donations page (Phase 2 — stories from those who've given and what led them to it)
- [ ] Events page
- [ ] Home page (built last, after all sub-pages exist)
- [ ] Auth0 integration (Phase 2 — user accounts for Pastor Bowman to manage content)
- [ ] Collapsible desktop/tablet nav rail with icon-only state (Phase 2 — requires icon library)
- [ ] Cookie consent + SEO/analytics groundwork (Phase 2)
- [ ] Refactor shared `<head>` content into `partials/head.ejs` (Phase 2 — stub already exists)
