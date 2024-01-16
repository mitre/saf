#!/bin/bash

set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # do not hide errors within pipes

ORIGINAL=$PWD
echo $ORIGINAL

cd "${npm_config_heimdall:-../heimdall2}"
cd apps/frontend

git switch "${npm_config_branch:-master}"

echo "Executing - git fetch ..."
git fetch

echo "Executing - git pull ..."
git pull

echo "Executing - yarn install ..."
CYPRESS_INSTALL_BINARY=0 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn install

echo "Executing - yarn pack ..."
yarn pack

echo "Finished generating the tarball"

cd "$ORIGINAL"

echo "Executing - npm install remote ..."
npm i

echo "Executing - npm install local ..."
npm i "${npm_config_heimdall:-../heimdall2}/apps/frontend/mitre-heimdall-lite-v"*".tgz"

echo "Executing - npm run prepack ..."
npm run prepack

echo "Install of local heimdall-lite complete."
