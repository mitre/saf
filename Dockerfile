# syntax=docker/dockerfile:1
ARG BASE_CONTAINER=node:22-alpine

# ============================================================================
# Builder Stage: Install dependencies and build package
# ============================================================================
FROM $BASE_CONTAINER AS builder

# Enable corepack for pnpm support
RUN corepack enable

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

WORKDIR /build

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Use BuildKit cache mount for pnpm store (faster rebuilds)
# Fetch dependencies into cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

# Install production dependencies offline from cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --offline --ignore-scripts

# Copy source code (sensitive files excluded via .dockerignore: .git, .env, coverage, node_modules, etc.)
COPY . .

# Build and pack
RUN pnpm run prepack && \
    pnpm pack && \
    mv mitre-saf-*.tgz saf.tgz

# ============================================================================
# Runtime Stage: Minimal production image
# ============================================================================
FROM $BASE_CONTAINER AS app

# Metadata labels in final stage
LABEL name="SAF" \
      vendor="The MITRE Corporation" \
      version="${SAF_VERSION}" \
      release="1" \
      url="https://github.com/mitre/saf" \
      description="The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines" \
      docs="https://github.com/mitre/saf" \
      run="docker run -d --name ${NAME} ${IMAGE} <args>"

# Install runtime utilities (--no-cache prevents cache creation)
RUN apk add --no-cache bash jq curl ca-certificates yq

# Copy and install packaged CLI
COPY --from=builder /build/saf.tgz /tmp/
RUN npm install -g /tmp/saf.tgz --ignore-scripts && \
    npm cache clean --force && \
    rm /tmp/saf.tgz

# Run as non-root user
USER node

WORKDIR /share
VOLUME ["/share"]

ENTRYPOINT ["saf"]
