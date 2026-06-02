# Pitt Stop Ministries

A web application for Pitt Stop Ministries, built by Keshon for Pastor Keyubba Bowman.

> **Detailed documentation lives in the [Wiki](../../wiki).** This README is the orientation
> layer — what the project is, how to run it, and where things stand. For how each subsystem
> actually works (and why), follow the links in [Documentation](#documentation) below.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Template Engine:** EJS
- **Environment:** dotenv
- **Logging:** morgan
- **Dev Server:** nodemon
- **Email:** @getbrevo/brevo — transactional API for contact form
- **Rate Limiting:** express-rate-limit — IP-based throttling on sensitive endpoints

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

## Project Structure

```
pit_stop_ministries/
├── index.js          # Entry point — Express server config
├── middleware/       # Centralized error handling
├── models/           # Data models (coming soon)
├── routes/           # Page routes + contact form handler
├── services/         # Email, validation, rate limiting
├── views/            # EJS templates + shared partials
├── public/           # CSS + client-side JS
├── .env.example      # Template for required env vars
└── package.json
```

A file-by-file breakdown is in the wiki: **[Architecture & Infrastructure](../../wiki/Architecture-and-Infrastructure)**.

## Documentation

The wiki holds the detailed reference for each part of the system:

- **[Architecture & Infrastructure](../../wiki/Architecture-and-Infrastructure)** — full project layout, Express setup, middleware chain
- **[Routes](../../wiki/Routes)** — every endpoint and what it does
- **[Navigation](../../wiki/Navigation)** — shared nav partial, mobile hamburger, active-state + accessibility
- **[Contact Page](../../wiki/Contact-Page)** — form categories, crisis interception, Brevo email relay, 3-layer spam defense
- **[Sermons Page](../../wiki/Sermons-Page)** — sermons list and YouTube embed plan

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
- [ ] Collapsible desktop/tablet nav rail with icon-only state (Phase 2 — requires icon library)
- [ ] Cookie consent + SEO/analytics groundwork (Phase 2)
- [ ] Refactor shared `<head>` content into `partials/head.ejs` (Phase 2 — prevents per-page script/CSS tag drift)
