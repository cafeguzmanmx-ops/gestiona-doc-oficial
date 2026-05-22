@echo off
title Aplicar correcciones a Gestiona Doc
echo ==========================================
echo Aplicando correcciones a los archivos...
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/4] Corrigiendo subscription.guard.ts...
powershell -Command "(Get-Content 'apps/api/src/common/security/subscription.guard.ts') -replace 'if \(!subscription \|\| !ACTIVE_STATUSES\.includes\(subscription\.status\)\)', 'if (!subscription || ![''TRIAL'',''ACTIVE''].includes(subscription.status))' | Set-Content 'apps/api/src/common/security/subscription.guard.ts'"
if %errorlevel% equ 0 ( echo   OK ) else ( echo   ERROR )

echo [2/4] Corrigiendo pdf-upload.options.ts...
powershell -Command "(Get-Content 'apps/api/src/common/upload/pdf-upload.options.ts') -replace 'callback\(new BadRequestException\(.+?\), false\);', 'callback(new BadRequestException(''Solo se permiten archivos PDF con extensión .pdf'') as any, false);' | Set-Content 'apps/api/src/common/upload/pdf-upload.options.ts'"
if %errorlevel% equ 0 ( echo   OK ) else ( echo   ERROR )

echo [3/4] Corrigiendo notifications.service.ts (primer metadata)...
powershell -Command "(Get-Content 'apps/api/src/notifications/notifications.service.ts') -replace 'metadata: data\.metadata,', 'metadata: data.metadata as any,' | Set-Content 'apps/api/src/notifications/notifications.service.ts'"
if %errorlevel% equ 0 ( echo   OK ) else ( echo   ERROR )

echo [4/4] Corrigiendo oficios.controller.ts (tres ocurrencias)...
powershell -Command "(Get-Content 'apps/api/src/oficios/oficios.controller.ts') -replace '@UseInterceptors\(FileInterceptor\(''archivo'', getPdfUploadOptions\(\)\)\)', '@UseInterceptors(FileInterceptor(''archivo'', getPdfUploadOptions() as any))' | Set-Content 'apps/api/src/oficios/oficios.controller.ts'"
if %errorlevel% equ 0 ( echo   OK ) else ( echo   ERROR )

echo.
echo ==========================================
echo Correciones aplicadas. Ahora recompila con:
echo npm --workspace apps/api run build
echo ==========================================
pause