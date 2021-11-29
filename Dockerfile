FROM node:14-alpine as builder

LABEL name="Heimdall Tools" \
      vendor="MTIRE" \
      version="${HEIMDALLTOOLS_VERSION}" \
      release="1" \
      url="https://github.com/mitre/heimdall_tools" \
      description="HeimdallTools supplies several methods to convert output from various tools to \"Heimdall Data Format\"(HDF) format to be viewable in Heimdall" \
      docs="https://github.com/mitre/heimdall_tools" \
      run="docker run -d --name ${NAME} ${IMAGE} <args>"

RUN mkdir -p /share

COPY . /build
WORKDIR /build
RUN yarn pack --install-if-needed --filename heimdall_tools.tgz

FROM node:14-alpine

COPY --from=builder /build/heimdall_tools.tgz /build/
RUN npm install -g /build/heimdall_tools.tgz

ENTRYPOINT ["heimdall_tools"]
VOLUME ["/share"]
WORKDIR /share
