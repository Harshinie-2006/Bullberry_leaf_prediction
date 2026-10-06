@echo off
echo =========================================================
echo    Forwarding Phone Port 8000 to PC Backend via USB ADB
echo =========================================================
set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist %ADB% (
    set ADB=adb
)
%ADB% devices
%ADB% reverse tcp:8000 tcp:8000
%ADB% reverse tcp:5173 tcp:5173
echo.
echo If your phone is connected with USB Debugging enabled,
echo port 8000 is now forwarded! In the app, choose 'USB Cable (localhost)'.
echo =========================================================
pause
