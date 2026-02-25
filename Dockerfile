FROM node:20-alpine

WORKDIR /app

# Copy package files first — separate layer so npm ci only re-runs when
# dependencies change, not on every source file change
COPY --chown=node:node package*.json ./

# Production dependencies only — no jest, eslint, etc.
RUN npm ci --omit=dev

# Copy application files
COPY --chown=node:node server.js ./
COPY --chown=node:node data/ ./data/
COPY --chown=node:node public/ ./public/

# Run as non-root user
USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
