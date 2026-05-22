@echo off
title Corrección final del frontend
echo ==========================================
echo Corrigiendo archivos del frontend...
echo ==========================================

cd /d "%~dp0"

echo [1/5] Creando carpeta pages si no existe...
if not exist "apps\web\src\pages" mkdir "apps\web\src\pages"
echo   OK

echo [2/5] Creando LandingPage.tsx...
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo import { ArrowRight, BarChart3, BellRing, Building2, CheckCircle2, Clock3, FileCheck2, FileText, ShieldCheck, Smartphone, Users } from 'lucide-react';
echo import { Button } from '../components/Button';
echo.
echo export const LandingPage = () => {
echo   return (
echo     <div className="min-h-screen bg-white">
echo       <nav className="bg-white shadow-sm border-b">
echo         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
echo           <div className="flex justify-between items-center h-16">
echo             <div className="flex items-center">
echo               <Building2 className="h-8 w-8 text-blue-600" />
echo               <span className="ml-2 text-xl font-bold text-gray-900">Gestiona Doc</span>
echo             </div>
echo             <div className="flex space-x-4">
echo               <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Iniciar sesión</Link>
echo               <Link to="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Registrar municipio</Link>
echo             </div>
echo           </div>
echo         </div>
echo       </nav>
echo       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
echo         <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
echo           <div className="text-center">
echo             <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">Controla la correspondencia oficial de tu municipio</h1>
echo             <p className="mt-6 text-xl max-w-3xl mx-auto text-blue-100">Digitaliza la recepción, turnado, seguimiento y cierre de oficios. Trazabilidad total, alertas y reportes en una plataforma SaaS diseñada para gobiernos municipales.</p>
echo             <div className="mt-10 flex justify-center space-x-4">
echo               <Link to="/registro"><Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Comenzar prueba gratuita <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
echo               <Link to="/solicitar-demo"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">Solicitar demo</Button></Link>
echo             </div>
echo           </div>
echo         </div>
echo       </div>
echo       <div className="py-16 bg-gray-50">
echo         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
echo           <div className="text-center"><h2 className="text-3xl font-bold text-gray-900">Beneficios clave</h2></div>
echo           <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
echo             <div className="text-center"><FileCheck2 className="h-12 w-12 text-blue-600 mx-auto" /><h3 className="mt-4 text-xl font-semibold">Control total</h3><p className="mt-2 text-gray-600">Folio automático, seguimiento paso a paso y bitácora de cada oficio.</p></div>
echo             <div className="text-center"><BellRing className="h-12 w-12 text-blue-600 mx-auto" /><h3 className="mt-4 text-xl font-semibold">Alertas preventivas</h3><p className="mt-2 text-gray-600">Notificaciones de vencimiento y asignaciones para evitar retrasos.</p></div>
echo             <div className="text-center"><BarChart3 className="h-12 w-12 text-blue-600 mx-auto" /><h3 className="mt-4 text-xl font-semibold">Reportes ejecutivos</h3><p className="mt-2 text-gray-600">Exporta a Excel/PDF para rendición de cuentas y auditoría.</p></div>
echo           </div>
echo         </div>
echo       </div>
echo       <footer className="bg-gray-800 text-white py-8"><div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">© 2026 Gestiona Doc - Solución SaaS para municipios mexicanos</div></footer>
echo     </div>
echo   );
echo };
) > "apps\web\src\pages\LandingPage.tsx"
echo   OK

echo [3/5] Creando SolicitarDemoPage.tsx...
(
echo import React, { useState } from 'react';
echo import { Link, useNavigate } from 'react-router-dom';
echo import { ArrowLeft, Send } from 'lucide-react';
echo import { Button } from '../components/Button';
echo import { api } from '../lib/api';
echo.
echo export const SolicitarDemoPage = () => {
echo   const navigate = useNavigate();
echo   const [loading, setLoading] = useState(false);
echo   const [formData, setFormData] = useState({ municipioName: '', state: '', contactName: '', position: '', email: '', phone: '', estimatedUsers: 10, message: '', source: 'landing' });
echo   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
echo   const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await api.post('/contacto/solicitar-demo', formData); alert('Solicitud enviada'); navigate('/'); } catch (error) { alert('Error'); } finally { setLoading(false); } };
echo   return (
echo     <div className="min-h-screen bg-gray-50"><div className="max-w-3xl mx-auto px-4 py-12"><Link to="/" className="inline-flex items-center text-blue-600 mb-6"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Link><div className="bg-white rounded-lg shadow-lg p-6 md:p-8"><h1 className="text-2xl font-bold">Solicitar demo</h1><p className="text-gray-600 mb-6">Completa el formulario</p><form onSubmit={handleSubmit} className="space-y-5"><input type="text" name="municipioName" placeholder="Municipio" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="text" name="state" placeholder="Estado" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="text" name="contactName" placeholder="Nombre completo" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="text" name="position" placeholder="Cargo" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="email" name="email" placeholder="Correo" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="tel" name="phone" placeholder="Teléfono" required onChange={handleChange} className="w-full border p-2 rounded" /><input type="number" name="estimatedUsers" placeholder="Usuarios estimados" onChange={handleChange} className="w-full border p-2 rounded" /><textarea name="message" rows={4} placeholder="Mensaje" onChange={handleChange} className="w-full border p-2 rounded"></textarea><Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar solicitud'}</Button></form></div></div></div>
echo   );
echo };
) > "apps\web\src\pages\SolicitarDemoPage.tsx"
echo   OK

echo [4/5] Creando vite-env.d.ts...
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

echo [5/5] Verificando existencia de archivos...
if exist "apps\web\src\pages\LandingPage.tsx" (echo   LandingPage.tsx existe) else (echo   ERROR: falta LandingPage.tsx)
if exist "apps\web\src\vite-env.d.ts" (echo   vite-env.d.ts existe) else (echo   ERROR: falta vite-env.d.ts)

echo.
echo ==========================================
echo Correciones aplicadas. Reintenta el build:
echo npm --workspace apps/web run build
echo ==========================================
pause