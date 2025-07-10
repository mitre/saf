#!/bin/bash

set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes

ORIGINAL=$PWD
echo $ORIGINAL

cd "${npm_config_inspec_objects:-../ts-inspec-objects}"

git switch "${npm_config_branch:-main}"

echo "Executing - git fetch ..."
git fetch

echo "Executing - git pull ..."
git pull

echo "Executing - npm install ..."
npm ci

echo "Executing - npm pack ..."
npm pack

echo "Finished generating the tarball"

cd "$ORIGINAL"

echo "Executing - npm install remote ..."
npm i

echo "Executing - npm install local ..."
npm i "${npm_config_inspec_objects:-../ts-inspec-objects}/mitre-inspec-objects-"*".tgz"

echo "Executing - npm run prepack ..."
npm run prepack

echo "Install of local inspec-objects complete."
