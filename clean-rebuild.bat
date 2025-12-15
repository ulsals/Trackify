@echo off
echo ========================================
echo Cleaning Gradle Cache...
echo ========================================

cd /d "d:\User\Documents\2025\SEM5\BERGERAK\UAS\Trackify"

REM Delete build folders
echo Removing build folders...
if exist "android\build" rmdir /s /q "android\build"
if exist "android\.gradle" rmdir /s /q "android\.gradle"
if exist ".gradle" rmdir /s /q ".gradle"

REM Delete global gradle cache
echo Removing global gradle cache...
if exist "%USERPROFILE%\.gradle\caches" rmdir /s /q "%USERPROFILE%\.gradle\caches"
if exist "%USERPROFILE%\.gradle\daemon" rmdir /s /q "%USERPROFILE%\.gradle\daemon"
if exist "%USERPROFILE%\.gradle\notifications" rmdir /s /q "%USERPROFILE%\.gradle\notifications"
if exist "%USERPROFILE%\.gradle\tmp" rmdir /s /q "%USERPROFILE%\.gradle\tmp"

echo.
echo ========================================
echo Cleaning node_modules...
echo ========================================

REM Delete node_modules
if exist "node_modules" rmdir /s /q "node_modules"

echo.
echo ========================================
echo Installing npm dependencies...
echo ========================================

call npm install

echo.
echo ========================================
echo Done! Now run: expo run:android
echo ========================================
pause
