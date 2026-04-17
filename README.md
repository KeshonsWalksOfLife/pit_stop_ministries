# Pit Stop Ministries

A web application for Pit Stop Ministries, built by Keshon for Pastor Keyubba Bowman.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Template Engine:** EJS
- **Environment:** dotenv
- **Logging:** morgan
- **Dev Server:** nodemon

## Project Structure

```
pit_stop_ministries/
├── index.js              # Entry point — Express server config
├── middleware/
│   └── errorHandler.js   # Centralized error handling
├── models/               # Data models (coming soon)
├── routes/               # Express route handlers (coming soon)
├── services/             # Business logic and API integrations
├── views/                # EJS templates
├── public/
│   └── css/              # Static assets
├── .env                  # Environment variables (not committed)
├── .env.example          # Template for required env vars
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
- `GET /contacts` — renders contact form (pending wiring into `index.js`)
- `POST /contacts` — receives form submission (proof-of-life: logs `req.body`, responds with confirmation)

## Contact Page (In Progress)

Form collects: name, email, category dropdown, message.

**Categories:** Prayer Request, Booking / Speaking, Marriage / Officiate, General Questions, Compliments / Testimonials, Suicidal / Emergency.

**Crisis interception (planned):** when "Suicidal / Emergency" is selected, the page will immediately surface 988 crisis resources via JavaScript — submission pathway becomes secondary. A contact form is not a crisis tool.

**Email delivery (planned):** Brevo transactional API will relay submissions to Pastor Bowman's inbox. Direct SMTP credentials never touch the codebase.

## Roadmap

- [x] Foundation infrastructure
- [x] Donations route + Tithe.ly widget embed
- [ ] Contact route fully wired + Brevo email delivery + crisis interception
- [ ] Sermons page
- [ ] Home page (built last, after all sub-pages exist)
- [ ] Auth0 integration (Phase 2)
