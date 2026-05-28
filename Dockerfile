# ── Builder ──────────────────────────────────────────────────────────────────
FROM node:20 AS builder

ENV METEOR_ALLOW_SUPERUSER=true
ENV PATH="/root/.meteor:${PATH}"

# Install Meteor
RUN curl https://install.meteor.com/ | sh

WORKDIR /app

# Cache npm deps layer before copying full source
COPY app/package.json app/package-lock.json ./
RUN npm install

# Copy full Meteor app source (node_modules and .meteor/local excluded via .dockerignore)
COPY app/ ./

# Build server-only production bundle
RUN meteor build /build --architecture os.linux.x86_64 --server-only

# Extract bundle and install server npm dependencies
RUN cd /build \
 && tar -xzf app.tar.gz \
 && cd bundle/programs/server \
 && npm install --production

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Copy the extracted bundle to /built_app (the non-tar branch in start.sh.internal)
COPY --from=builder /build/bundle/ /built_app/

# Stub out setup_nvm.sh — node is already available in this image
RUN mkdir -p /home/app/scripts \
 && echo '#!/bin/sh' > /home/app/scripts/setup_nvm.sh \
 && chmod +x /home/app/scripts/setup_nvm.sh

COPY start.sh.internal /start.sh
RUN chmod +x /start.sh

WORKDIR /built_app

EXPOSE 3000

CMD ["/start.sh"]
