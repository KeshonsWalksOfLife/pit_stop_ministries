# Pitt Stop Ministries

A web application for Pitt Stop Ministries, built by Keshon for Pastor Keyubba Bowman.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Template Engine:** EJS
- **Environment:** dotenv
- **Logging:** morgan
- **Dev Server:** nodemon
- **Email:** @getbrevo/brevo — transactional API for contact form
- **Rate Limiting:** express-rate-limit — IP-based throttling on sensitive endpoints

## Project Structure

```
pit_stop_ministries/
├── index.js                  # Entry point — Express server config
├── middleware/
│   └── errorHandler.js       # Centralized error handling
├── models/                   # Data models (coming soon)
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
│       ├── head.ejs          # Shared <head> partial
│       └── footer.ejs        # Shared footer partial
├── public/
│   ├── css/                  # Per-page styles + shared nav styles
│   └── js/
│       └── nav.js            # Hamburger toggle + ARIA sync
├── .env                      # Environment variables (not committed)
├── .env.example              # Template for required env vars
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env

# Start dev server with auto-reload
npm run dev
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` in `.env`).

## Infrastructure (Completed)

- dotenv loaded as first line — environment variables available everywhere
- EJS template engine configured with views directory
- Static file serving from `public/`
- JSON body parsing for POST requests (`express.json()`)
- URL-encoded form body parsing (`express.urlencoded({ extended: true })`)
- morgan request logging in dev mode
- Centralized error handler — catches unhandled errors, returns clean 500 response

## Routes

- `GET /` — API health check response
- `GET /donations` — renders donations page with embedded Tithe.ly Give widget
- `GET /sermons` — renders sermons page
- `GET /contacts` — renders contact form
- `POST /contacts` — rate-limited (5/15min per IP), honeypot-checked, validated, then relays to Pastor Bowman via Brevo

Each page route passes `currentPage` to its template so the shared nav partial can mark the active link.

## Navigation

Shared `views/partials/nav.ejs` partial included by every page.

- **Desktop (≥ 769px):** persistent vertical rail on the left, dark background, white links
- **Mobile (≤ 768px):** rail collapses to a 48×48px hamburger button (WCAG touch target); clicking toggles `.nav-links.open` to reveal the menu
- **Active state:** matching link receives `aria-current="page"` from the route's `currentPage`, styled with gold + bold + left border (color-blind safe — three signals, not just color)
- **Accessibility:** `aria-expanded` on the hamburger stays in sync with menu state for screen readers

Behavior wired from `public/js/nav.js`, loaded via `<script src="/js/nav.js" defer></script>` on each page that includes the partial.

## Contact Page

Form collects: name, email, category dropdown, message.

**Categories:** Prayer Request, Booking / Speaking, Marriage / Officiate, General Questions, Compliments / Testimonials, Suicidal / Emergency.

**Crisis interception (planned):** when "Suicidal / Emergency" is selected, the page will immediately surface 988 crisis resources via JavaScript — submission pathway becomes secondary. A contact form is not a crisis tool.

**Email delivery:** Brevo transactional API relays submissions to Pastor Bowman's inbox via `services/email.js`. Direct SMTP credentials never touch the codebase. Set `BREVO_API_KEY` in `.env` (sender domain SPF/DKIM verification still pending for production).

**Spam & abuse protection — three-layer defense on `POST /contacts`:**

1. **Rate limiting** (`services/rateLimiter.js`) — Cheapest, broadest gate. 5 submissions per 15 minutes per IP, returns HTTP 429 with a friendly retry message. Mounted as middleware on the POST route so it runs before any other logic.
2. **Honeypot** (`routes/contacts.js`) — Hidden `website` input rendered off-screen with `aria-hidden="true"` and `tabindex="-1"` so screen readers and keyboard users skip it, but bots filling every field will trip it. Triggered submissions are logged server-side with IP + identifying info, then rendered a **fake success page** so the attacker doesn't learn the trap exists.
3. **Validation** (`services/validateContact.js`) — Server-side checks on name (1–100), email (6–254 + format), category (whitelist), and message (10–2000). EJS templates auto-escape via `<%= %>` so any returned user input is XSS-safe. Errors render back to the form with the original values preserved.

Defense is intentionally layered: each gate is cheaper and broader than the next. A bot has to rotate IPs faster than 5/15min, *and* not fill the honeypot, *and* pass validation, before the email send is even attempted.

## Sermons Page

Renders a list of sermons (currently scaffolded; YouTube channel embed pending). Route at `routes/sermons.js`, view at `views/sermons.ejs`, styles at `public/css/sermons.css`.

## Roadmap

- [x] Foundation infrastructure
- [x] Donations route + Tithe.ly widget embed
- [x] Shared nav partial + mobile hamburger + active-state styling
- [x] Contact form: scaffold + Brevo email + validation + honeypot + rate limiting
- [x] Sermons page (scaffold)
- [ ] Contact page design pass (CSS, favicon, accessibility polish)
- [ ] Sermons page: YouTube channel embed + design pass
- [ ] Crisis interception JS for emergency category
- [ ] Events page
- [ ] Home page (built last, after all sub-pages exist)
- [ ] Auth0 integration (Phase 2 — user accounts for Pastor Bowman to manage content)
