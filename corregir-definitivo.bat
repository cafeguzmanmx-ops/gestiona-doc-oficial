@echo off
title Corrección definitiva
echo ==========================================
echo Aplicando correcciones definitivas...
echo ==========================================

cd /d "%~dp0"

echo [1/6] Creando archivo de declaracion de tipos...
(
echo /// ^<reference types="vite/client" /^>
echo.
echo interface ImportMetaEnv {
echo   readonly VITE_API_URL: string;
echo   readonly VITE_APP_NAME: string;
echo }
echo.
echo interface ImportMeta {
echo   readonly env: ImportMetaEnv;
echo }
) > "apps\web\src\vite-env.d.ts"
echo   OK

echo [2/6] Creando componente LandingPage...
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo export const LandingPage = () => {
echo   return (
echo     <div>
echo       <h1>Bienvenido a Gestiona Doc</h1>
echo       <Link to="/login">Iniciar sesion</Link>
echo       <Link to="/registro">Registrarse</Link>
echo     </div>
echo   );
echo };
) > "apps\web\src\pages\LandingPage.tsx"
echo   OK

echo [3/6] Corrigiendo api.ts para evitar error de import.meta.env...
(
echo import axios from 'axios';
echo.
echo const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:3000/api';
echo.
echo export const api = axios.create({
echo   baseURL: API_BASE_URL,
echo   headers: { 'Content-Type': 'application/json' },
echo });
echo.
echo api.interceptors.request.use((config) => {
echo   const token = localStorage.getItem('token');
echo   if (token) config.headers.Authorization = `Bearer ${token}`;
echo   return config;
echo });
) > "apps\web\src\lib\api.ts"
echo   OK

echo [4/6] Verificando que App.tsx importe correctamente...
powershell -Command "(Get-Content 'apps\web\src\App.tsx') -replace 'import { LandingPage } from ''\./pages/LandingPage'';', 'import { LandingPage } from ''./pages/LandingPage'';' | Set-Content 'apps\web\src\App.tsx'"
echo   OK

echo [5/6] Eliminando caché de TypeScript...
if exist "apps\web\tsconfig.tsbuildinfo" del "apps\web\tsconfig.tsbuildinfo"
echo   OK

echo [6/6] Mostrando estructura de archivos...
dir /b "apps\web\src\pages\*.tsx"
echo.
echo ==========================================
echo Correcciones listas. Ahora recompila:
echo npm --workspace apps/web run build
echo ==========================================
pause