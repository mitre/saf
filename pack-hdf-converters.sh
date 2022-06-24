#!/bin/bash

ORIGINAL=$PWD

cd "${npm_config_heimdall:-../heimdall2}"
cd libs/hdf-converters

git switch "${npm_config_branch:-master}"
git fetch
git pull

CYPRESS_INSTALL_BINARY=0 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn install
yarn pack

cd "$ORIGINAL"
npm i
npm i "${npm_config_heimdall:-../heimdall2}/libs/hdf-converters/mitre-hdf-converters-v"*".tgz" && yarn prepack
