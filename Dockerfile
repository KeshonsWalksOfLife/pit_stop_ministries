FROM node:22-alpine

WORKDIR /app

# Install dependencies first so this layer is cached unless package*.json changes
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Rate-limit counters persist here (services/rateLimiter.js) — mount a volume
# over this path (see docker-compose.yml) so counts survive container restarts.
RUN mkdir -p /app/data-runtime && chown -R node:node /app/data-runtime
ENV RATE_LIMIT_DATA_DIR=/app/data-runtime

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Runs as the non-root "node" user built into the base image
USER node

CMD ["node", "index.js"]
