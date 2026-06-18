# ── Stage 1: build React app ──────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Accept API URL at build time (CRA embeds env vars during `npm run build`)
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build


# ── Stage 2: serve with a minimal static server ───────────────────────────────
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve && \
    addgroup -g 1001 -S appgroup && \
    adduser  -S appuser -u 1001 -G appgroup

COPY --from=builder /app/build ./build

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000',(r)=>{process.exit(r.statusCode===200?0:1)})" || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
