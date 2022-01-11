FROM node:lts-alpine as builder

LABEL name="SAF" \
      vendor="MTIRE" \
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
RUN yarn --frozen-lockfile --production --network-timeout 600000
RUN yarn pack --install-if-needed --prod --filename saf.tgz

FROM node:lts-alpine

COPY --from=builder /build/saf.tgz /build/
RUN npm install -g /build/saf.tgz

ENTRYPOINT ["saf"]
VOLUME ["/share"]
WORKDIR /share
