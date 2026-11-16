@echo off
REM ---------------------------------------------------------------------------
REM Starts the local MongoDB server used by the FAKHARA API.
REM
REM The data is stored in server\data\mongodb so it survives restarts.
REM ---------------------------------------------------------------------------

setlocal

set "MONGOD=C:\Users\Hcheum\mongodb-8.2.6\mongod.exe"
set "DBPATH=%~dp0server\data\mongodb"
set "LOGPATH=%~dp0server\data\mongod.log"

if not exist "%MONGOD%" (
  echo MongoDB was not found at:
  echo   %MONGOD%
  echo.
  echo Install MongoDB, or update the MONGOD path in this script.
  exit /b 1
)

if not exist "%DBPATH%" (
  echo Creating data directory: %DBPATH%
  mkdir "%DBPATH%"
)

REM Do not start a second instance when one is already listening on 27017.
netstat -ano | findstr /R /C:":27017 .*LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo MongoDB is already running on port 27017.
  exit /b 0
)

echo Starting MongoDB on port 27017...
echo   data: %DBPATH%
echo   log:  %LOGPATH%
start "FAKHARA MongoDB" /min "%MONGOD%" --dbpath "%DBPATH%" --port 27017 --bind_ip 127.0.0.1 --logpath "%LOGPATH%"

REM Wait for the port to answer before returning.
for /l %%i in (1,1,30) do (
  netstat -ano | findstr /R /C:":27017 .*LISTENING" >nul 2>&1 && (
    echo MongoDB is ready on mongodb://127.0.0.1:27017/fakhara
    exit /b 0
  )
  timeout /t 1 /nobreak >nul
)

echo MongoDB did not start in time. Check %LOGPATH%
exit /b 1
