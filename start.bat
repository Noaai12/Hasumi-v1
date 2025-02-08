@echo off
:start
npm start
if %errorlevel% equ 1 (
    echo Restarting bot...
    goto start
) else (
    echo Bot shutdown complete.
)
