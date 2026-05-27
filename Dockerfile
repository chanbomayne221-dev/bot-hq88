# ===== Build stage =====
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Tools cần để build better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Runtime stage =====
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tini sqlite3 \
 && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund \
 && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY assets ./assets
COPY scripts ./scripts

# Volume cho database persistent (Railway volume mount tại /app/data)
RUN mkdir -p /app/data
ENV DB_PATH=/app/data/bot.sqlite
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","dist/server.js"]
