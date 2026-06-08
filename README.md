# Pitt Stop Ministries

A web application for Pitt Stop Ministries, built by Keshon for Pastor Keyubba Bowman.

For architecture, routes, page-by-page details, and the full roadmap, see **[WIKI.md](./WIKI.md)**.

## Tech Stack

- Node.js + Express 5
- EJS templates
- Brevo transactional email (contact form)
- express-rate-limit (POST throttling)
- dotenv, morgan, nodemon

## Getting Started

```bash
npm install
cp .env.example .env       # fill in BREVO_API_KEY, PORT, etc.
npm run dev
```

Server runs on `http://localhost:3000` by default (configurable via `PORT` in `.env`).

## Status Snapshot

- [x] Foundation infrastructure, shared nav, donations widget, sermons scaffold
- [x] Contact form: validation, honeypot, rate limiting, crisis interception, design pass
- [ ] Donations UI cleanup *(next)*
- [ ] Sermons page: YouTube embed + design pass
- [ ] Events page
- [ ] Home page
- [ ] Phase 2: Auth0, cookie consent, shared head partial

Full roadmap with history: see **[WIKI.md → Roadmap](./WIKI.md#roadmap)**.
