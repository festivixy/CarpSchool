# ── Builder ──────────────────────────────────────────────────────────────────
FROM node:22 AS builder

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV METEOR_ALLOW_SUPERUSER=true
ENV PATH="/root/.meteor:${PATH}"

# Install Meteor
RUN curl -fsSL https://install.meteor.com/?release=3.3.1 | sh

WORKDIR /app

# Cache npm deps layer before copying full source
COPY app/package.json app/package-lock.json ./app/
RUN cd app && npm ci --legacy-peer-deps

# Copy full Meteor app source (node_modules and .meteor/local excluded via .dockerignore)
COPY app/ ./app/

# Build server-only production bundle
RUN cd app && meteor build /build --architecture os.linux.x86_64 --server-only

# Extract bundle and install server npm dependencies
RUN cd /build \
 && tar -xzf app.tar.gz \
 && cd bundle/programs/server \
 && npm install --omit=dev

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner

# Copy the extracted bundle to /built_app (the non-tar branch in start.sh.internal)
COPY --from=builder /build/bundle/ /built_app/

# Stub out setup_nvm.sh — node is already available in this image
RUN mkdir -p /home/app/scripts \
 && echo '#!/bin/sh' > /home/app/scripts/setup_nvm.sh \
 && chmod +x /home/app/scripts/setup_nvm.sh

COPY start.sh.internal /start.sh
RUN chmod +x /start.sh \
 && chown -R node:node /built_app

USER node

WORKDIR /built_app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["/start.sh"]
