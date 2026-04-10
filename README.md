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
- JSON body parsing for POST requests
- morgan request logging in dev mode
- Centralized error handler — catches unhandled errors, returns clean 500 response

## Roadmap

- [ ] User Profile Builder (routes, utils, EJS view)
- [ ] Donations route
- [ ] Tithe.ly API integration
- [ ] Contact page for Pit Stop Ministries
- [ ] Frontend build-out after backend routes are proven
