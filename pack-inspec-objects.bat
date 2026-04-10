ECHO OFF

SET original_dir=%cd%
ECHO %original_dir%

IF DEFINED npm_config_inspec_objects (
  CD %npm_config_inspec_objects%
) ELSE (
  CD ../ts-inspec-objects
)

IF DEFINED npm_config_branch (
  CALL git switch %npm_config_branch% || EXIT /B %ERRORLEVEL%
) ELSE (
  CALL git switch main || EXIT /B %ERRORLEVEL%
)

ECHO Executing - git fetch ...
CALL git fetch || EXIT /B %ERRORLEVEL%

ECHO Executing - git pull ...
CALL git pull || EXIT /B %ERRORLEVEL%

ECHO Executing - yarn install ...
CALL npm ci || EXIT /B %ERRORLEVEL%

ECHO Executing - yarn pack ...
CALL npm pack || EXIT /B %ERRORLEVEL%

ECHO Finished generating the tarball

CD %original_dir%

ECHO Executing - npm install remote ...
CALL npm i || EXIT /B %ERRORLEVEL%

ECHO Executing - npm install local ...

IF DEFINED npm_config_inspec_objects (
  FOR /f "tokens=*" %%a IN ('dir /b %npm_config_inspec_objects%\mitre-inspec-objects-*.tgz') DO (
    SET THIS_TAR_ZIP=%npm_config_inspec_objects%\%%a
  )
) ELSE (
  FOR /f "tokens=*" %%a IN ('dir /b ..\ts-inspec-objects\mitre-inspec-objects-*.tgz') DO (
    SET THIS_TAR_ZIP=..\ts-inspec-objects\%%a
  )
)
CALL npm i %THIS_TAR_ZIP% || EXIT /B %ERRORLEVEL%

ECHO Executing - npm run prepack ...
CALL npm run prepack || EXIT /B %ERRORLEVEL%

ECHO Install of local inspecjs complete.
