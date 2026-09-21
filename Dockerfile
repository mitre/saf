ARG BASE_CONTAINER=node:22-alpine

FROM $BASE_CONTAINER AS builder

LABEL name="SAF" \
      vendor="The MITRE Corporation" \
      version="${SAF_VERSION}" \
      release="1" \
      url="https://github.com/mitre/saf" \
      description="The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines" \
      docs="https://github.com/mitre/saf" \
      run="docker run -d --name ${NAME} ${IMAGE} <args>"

WORKDIR /build
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund --fetch-timeout=600000

COPY . .
RUN npm pack \
    && npm prune --omit=dev --ignore-scripts --no-audit --no-fund \
    && mkdir /app \
    && tar -xzf mitre-saf-*.tgz -C /app --strip-components=1 \
    && mv node_modules /app/node_modules

FROM $BASE_CONTAINER AS app

COPY --from=builder /app /usr/local/lib/node_modules/@mitre/saf
RUN ln -s /usr/local/lib/node_modules/@mitre/saf/bin/run /usr/local/bin/saf

# Useful for CI pipelines
RUN apk add --no-cache bash jq curl ca-certificates yq

USER node

ENTRYPOINT ["saf"]
VOLUME ["/share"]
WORKDIR /share
