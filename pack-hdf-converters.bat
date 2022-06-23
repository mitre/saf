ECHO OFF

SET CYPRESS_INSTALL_BINARY=0 
SET PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

SET original_dir=%cd%
ECHO %original_dir%

IF DEFINED npm_config_heimdall (
  CD %npm_config_heimdall%/libs/hdf-converters/
) ELSE (
  CD ../heimdall2/libs/hdf-converters/
)

REM CD libs/hdf-converters

IF DEFINED npm_config_branch (
  git switch %npm_config_branch%
) ELSE (
  git switch master
)

git fetch
git pull
yarn install 
yarn pack

CD %original_dir% 

npm i 

IF DEFINED npm_config_heimdall (
  npm i %npm_config_heimdall%/libs/hdf-converters/mitre-hdf-converters-v*.tgz
) ELSE (
  npm i ../heimdall2/libs/hdf-converters/mitre-hdf-converters-v*.tgz
)

yarn prepack
