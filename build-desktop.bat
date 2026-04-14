@echo off
echo ============================================
echo   SavdoSklad Distribution Package Builder
echo ============================================
echo.

REM [YANGI] 0-qadam: Frontend build
echo [0/4] Frontend build qilinmoqda (Vite)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo XATOLIK: Frontend build amalga oshmadi!
    pause
    exit /b 1
)
cd ..

REM ==========================================
echo [1/4] Yangilangan frontend fayllari ko'chirilmoqda...
REM Eski fayllarni tozalash (assets va html fayllar)
if exist "cmd\desktop\frontend\assets" rmdir /S /Q "cmd\desktop\frontend\assets"
xcopy /E /I /Y "frontend\dist\*" "cmd\desktop\frontend\"


REM 1-qadam: Migration fayllarni yangilamoqda
echo [1/3] Migration fayllar ko'chirilmoqda...
xcopy /E /I /Y "migrations" "cmd\desktop\migrations" >nul 2>&1

REM api.js da URL ni to'g'rilash (desktop uchun doim /api/v1 bo'ladi)
copy /Y "cmd\desktop\frontend\js\api.js" "cmd\desktop\frontend\js\api.js.bak" >nul 2>&1
powershell -NoProfile -Command "& {$c = Get-Content 'cmd\desktop\frontend\js\api.js'; $c[0] = \"const API_BASE = '/api/v1';\"; $c | Set-Content 'cmd\desktop\frontend\js\api.js'}" >nul 2>&1

echo    OK - Fayllar tayyor

REM 2-qadam: Migration fayllarni yangilamoqda
echo [2/4] Migration fayllar ko'chirilmoqda...
 xcopy /E /I /Y "migrations" "cmd\desktop\migrations" >nul 2>&1

REM ===========================================
REM 2-qadam: Build
echo [2/3] Desktop .exe build qilinmoqda...
go build -ldflags="-H windowsgui -s -w" -o SavdoSklad-Desktop.exe ./cmd/desktop
if %errorlevel% neq 0 (
    echo XATOLIK: Build amalga oshmadi!
    pause
    exit /b 1
)
echo    OK - SavdoSklad-Desktop.exe yaratildi

REM 3-qadam: ZIP paket tayyorlash
echo [3/3] Tarqatish paketi tayyorlanmoqda...
if exist "SavdoSklad-Package" rmdir /S /Q "SavdoSklad-Package"
mkdir "SavdoSklad-Package"
copy /Y "SavdoSklad-Desktop.exe" "SavdoSklad-Package\" >nul
copy /Y "dist\.env" "SavdoSklad-Package\" >nul
copy /Y "dist\README.md" "SavdoSklad-Package\" >nul

REM ZIP
powershell -NoProfile -NonInteractive -Command "Compress-Archive -Path 'SavdoSklad-Package\*' -DestinationPath 'SavdoSklad-v1.0.zip' -Force"
echo    OK - SavdoSklad-v1.0.zip yaratildi

echo.
echo ============================================
echo   TAYYOR!
echo ============================================
echo.
echo   SavdoSklad-Desktop.exe  (asosiy fayl)
echo   SavdoSklad-v1.0.zip     (tarqatish uchun)
echo.
pause
