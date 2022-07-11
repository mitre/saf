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
  CALL git switch %npm_config_branch% || EXIT /B %ERRORLEVEL%
) ELSE (
  CALL git switch master || EXIT /B %ERRORLEVEL%
)

ECHO Executing - git fetch ...
CALL git fetch || EXIT /B %ERRORLEVEL%

ECHO Executing - git pull ...
CALL git pull || EXIT /B %ERRORLEVEL%

ECHO Executing - yarn install ...
CALL yarn install || EXIT /B %ERRORLEVEL%

ECHO Executing - yarn pack ...
CALL yarn pack || EXIT /B %ERRORLEVEL%

ECHO Finished generating the tarball

CD %original_dir%

ECHO Executing - npm install remote ...
CALL npm i || EXIT /B %ERRORLEVEL%

ECHO Executing - npm install local ...
IF DEFINED npm_config_heimdall (
  FOR /f "tokens=*" %%a IN ('dir /b %npm_config_heimdall%\libs\hdf-converters\mitre-hdf-converters-v*.tgz') DO (
    SET THIS_TAR_ZIP=%npm_config_heimdall%\libs\hdf-converters\%%a
  )
) ELSE (
  SET THIS_TAR_ZIP=..\heimdall2\libs\hdf-converters\mitre-hdf-converters-v*.tgz
)
CALL npm i %THIS_TAR_ZIP% || EXIT /B %ERRORLEVEL%

ECHO Executing - yarn prepack ...
CALL yarn prepack || EXIT /B %ERRORLEVEL%

ECHO Install of local hdf-converters complete.
