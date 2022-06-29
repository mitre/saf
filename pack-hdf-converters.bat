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

IF DEFINED npm_config_branch (
  CALL git switch %npm_config_branch%
) ELSE (
  CALL git switch master
)

ECHO Executing - git fetch ...
CALL git fetch

ECHO Executing - git pull ...
CALL git pull

ECHO Executing - yarn install ...
CALL yarn install

ECHO Executing - yarn pack ...
CALL yarn pack

ECHO Finished generating the tarball

CD %original_dir%

ECHO Executing - npm install remote ...
CALL npm i

ECHO Executing - npm install local ...
IF DEFINED npm_config_heimdall (
  SET PARAMETERS = "%npm_config_heimdall%"\libs\hdf-converters\mitre-hdf-converters-*.tgz
) ELSE (
  SET PARAMETERS = ..\heimdall2\libs\hdf-converters\mitre-hdf-converters-v*.tgz
)
CALL npm i %PARAMETERS%

ECHO Executing - yarn prepack ...
CALL yarn prepack
