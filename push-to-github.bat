@echo off
echo ===================================================
echo   SUPER LUDO PRO - PUSH TO GITHUB & HOSTING
echo ===================================================
echo.
echo Make sure you have created an empty repository on GitHub:
echo https://github.com/new  (Name: ludo-game)
echo.
pause
echo Pushing to GitHub...
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ===================================================
    echo   SUCCESS! Pushed to GitHub!
    echo   1. Live Web Hosting (GitHub Pages):
    echo      https://abhi420m.github.io/ludo-game/
    echo.
    echo   2. Android APK Builder:
    echo      Check the "Actions" tab on GitHub to download your APK!
    echo ===================================================
) else (
    echo.
    echo [ERROR] Push failed. Please verify that https://github.com/Abhi420m/ludo-game exists.
)
echo.
pause
