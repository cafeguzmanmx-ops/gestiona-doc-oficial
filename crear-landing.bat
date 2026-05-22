@echo off
echo Creando LandingPage.tsx en la ruta correcta...

REM Crear la carpeta pages si no existe
if not exist "apps\web\src\pages" mkdir "apps\web\src\pages"

REM Crear el archivo
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo export const LandingPage = () => {
echo   return (
echo     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
echo       <h1 className="text-4xl font-bold text-blue-600">Gestiona Doc</h1>
echo       <p className="mt-4 text-gray-700">Sistema de control de correspondencia municipal</p>
echo       <div className="mt-8 space-x-4">
echo         <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Iniciar sesión</Link>
echo         <Link to="/registro" className="bg-green-500 text-white px-4 py-2 rounded">Registrar municipio</Link>
echo         <Link to="/solicitar-demo" className="bg-gray-500 text-white px-4 py-2 rounded">Solicitar demo</Link>
echo       </div>
echo     </div>
echo   );
echo };
) > "apps\web\src\pages\LandingPage.tsx"

echo Archivo creado.
echo Verificando...
if exist "apps\web\src\pages\LandingPage.tsx" (
    echo OK: LandingPage.tsx existe.
) else (
    echo ERROR: No se pudo crear el archivo.
)
pause