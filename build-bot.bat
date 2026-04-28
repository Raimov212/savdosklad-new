@echo off
echo Building SavdoSklad Bot...
cd /d %~dp0
go build -o bot.exe ./cmd/bot/
if %errorlevel% equ 0 (
    echo Build successful! bot.exe created.
) else (
    echo Build failed!
)
pause
