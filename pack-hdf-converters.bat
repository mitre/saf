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
ECHO npm_config_heimdall 1 is %npm_config_heimdall%
IF DEFINED npm_config_heimdall (

  FOR /f %%F IN ('dir /b %npm_config_heimdall%\libs\hdf-converters\mitre-hdf-converters-v*.tgz') DO SET TAR_ZIP=%%F
  ECHO TAR_ZIP is %TAR_ZIP%
  ECHO npm_config_heimdall 2 is %npm_config_heimdall%
  SET THIS_TAR_ZIP=%npm_config_heimdall%\libs\hdf-converters
  ECHO THIS_TAR_ZIP is %THIS_TAR_ZIP%
) ELSE (
  SET THIS_TAR_ZIP=..\heimdall2\libs\hdf-converters\mitre-hdf-converters-v*.tgz
)
CALL npm i %THIS_TAR_ZIP%

ECHO Executing - yarn prepack ...
CALL yarn prepack
