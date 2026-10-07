@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required.&pause&exit /b 1)
for %%F in (backend\server.js backend\controllers\authController.js backend\controllers\mockAttemptController.js backend\controllers\chatController.js backend\controllers\orderController.js backend\data\examCatalog.js) do (
  node --check "%%F"
  if errorlevel 1 goto :error
)
node verify-project.mjs
if errorlevel 1 goto :error
echo Source verification passed.
exit /b 0
:error
pause
exit /b 1
