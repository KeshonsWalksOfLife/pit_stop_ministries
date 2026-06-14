# Pitt Stop Ministries

A web application for Pitt Stop Ministries, built by Keshon for Pastor Keyubba Bowman.

**Status:** Phase 1 (v1) complete — all public pages built, optimized, and ready for shipment. 🏁

> **Detailed documentation lives in the [Wiki](../../wiki).** This README is the orientation
> layer — what the project is, how to run it, and where things stand. For how each subsystem
> actually works (and why), follow the links in [Documentation](#documentation) below.

## Getting Started

```bash
npm install
cp .env.example .env       # fill in BREVO_API_KEY, PORT, etc.
npm run dev
```

The server runs on `http://localhost:3000` by default (configurable via `PORT` in `.env`).

## Project Structure

```
pit_stop_ministries/
├── index.js          # Entry point — Express server config
├── middleware/       # Centralized error handling
├── routes/           # Page routes (home, sermons, pittstop, donations) + contact handler
├── services/         # Email, validation, rate limiting
├── data/             # sermons.json — curated YouTube sermon library
├── scripts/          # fetch_sermons.mjs — rebuilds sermons.json from YouTube
├── views/            # EJS templates + shared partials
├── public/           # CSS, client-side JS, images
├── .env.example      # Template for required env vars
└── package.json
```

A file-by-file breakdown is in the wiki: **[Architecture & Infrastructure](../../wiki/Architecture-and-Infrastructure)**.

## Documentation

The wiki holds the detailed reference for each part of the system:

- **[Architecture & Infrastructure](../../wiki/Architecture-and-Infrastructure)** — full project layout, Express setup, middleware chain
- **[Routes](../../wiki/Routes)** — every endpoint and what it does
- **[Navigation](../../wiki/Navigation)** — shared nav partial, mobile hamburger, active-state + accessibility
- **[Type System](../../wiki/Type-System)** — site-wide display-serif headers + system-sans body
- **[Home Page](../../wiki/Home-Page)** — the hub: lion hero, ministry intro, weekly rhythms, CTA paths
- **[Sermons Page](../../wiki/Sermons-Page)** — curated YouTube library, month categories, thumbnail-facade players
- **[Pitt Stop (About) Page](../../wiki/Pitt-Stop-Page)** — Pastor Q hero, story, values
- **[Donations Page](../../wiki/Donations-Page)** — Tithe.ly Give widget + brand framing
- **[Contact Page](../../wiki/Contact-Page)** — form categories, crisis interception, Brevo email relay, 3-layer spam defense

## Roadmap

### Phase 1 — v1 (shipped) 🏁

- [x] Foundation infrastructure (Express, EJS, middleware, centralized error handling)
- [x] Shared nav partial + mobile hamburger + active-state styling + footer partial
- [x] Contact form: Brevo email + validation + honeypot + rate limiting + crisis interception + design pass
- [x] Donations page: Tithe.ly Give widget + dark brand design pass
- [x] Sermons page: curated YouTube library, month categories, thumbnail-facade players, dark design
- [x] Pitt Stop (About) page: Pastor Q hero + story + values
- [x] Home page (hub): lion hero, ministry intro, weekly rhythms (events folded in), CTA paths
- [x] Site-wide type system: Playfair Display headers + system-sans body
- [x] Nav restructure (Home added, Events folded into Home) + image optimization

### Phase 2 — post-launch

- [ ] Confirm real service times + finalize sermon/About copy with Pastor Q
- [ ] Brevo sender-domain SPF/DKIM verification for production email
- [ ] Donor testimonials section on the donations page
- [ ] Auth0 integration (user accounts for Pastor Bowman to manage content)
- [ ] Collapsible desktop/tablet nav rail with icon-only state (requires icon library)
- [ ] Cookie consent + SEO/analytics groundwork
- [ ] Refactor shared `<head>` into `partials/head.ejs` (prevents per-page tag drift)
