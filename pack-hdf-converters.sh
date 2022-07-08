#!/bin/bash

set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes

ORIGINAL=$PWD
echo $ORIGINAL

cd "${npm_config_heimdall:-../heimdall2}"
cd libs/hdf-converters

git switch "${npm_config_branch:-master}"

echo "Executing - git fetch ..."
git fetch

echo "Executing - git pull ..."
git pull

echo Executing - yarn install ...
CYPRESS_INSTALL_BINARY=0 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn install

echo "Executing - yarn pack ..."
yarn pack

echo "Finished generating the tarball"

cd "$ORIGINAL"

echo "Executing - npm install remote ..."
npm i

echo "Executing - npm install local ..."
npm i "${npm_config_heimdall:-../heimdall2}/libs/hdf-converters/mitre-hdf-converters-v"*".tgz"

echo "Executing - yarn prepack ..."
yarn prepack

echo "Install of local hdf-converters complete."
