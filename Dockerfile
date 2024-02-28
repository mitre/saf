ARG BASE_CONTAINER=node:18-alpine

FROM $BASE_CONTAINER AS builder

LABEL name="SAF" \
      vendor="The MITRE Corporation" \
      version="${SAF_VERSION}" \
      release="1" \
      url="https://github.com/mitre/saf" \
      description="The MITRE Security Automation Framework (SAF) Command Line Interface (CLI) brings together applications, techniques, libraries, and tools developed by MITRE and the security community to streamline security automation for systems and DevOps pipelines" \
      docs="https://github.com/mitre/saf" \
      run="docker run -d --name ${NAME} ${IMAGE} <args>"

RUN mkdir -p /share

COPY . /build
WORKDIR /build
RUN rm -rf test
RUN npm ci --omit=dev --fetch-timeout=600000
RUN mv "$(npm pack | tail -1)" saf.tgz

FROM $BASE_CONTAINER AS app

COPY --from=builder /build/saf.tgz /build/
RUN npm install -g /build/saf.tgz && npm cache clean --force;

# Useful for CI pipelines
RUN apk add --no-cache bash jq curl ca-certificates yq

USER node

ENTRYPOINT ["saf"]
VOLUME ["/share"]
WORKDIR /share
