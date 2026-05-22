@echo off
title Corregir archivos del frontend
echo ======================================
echo Corrigiendo archivos del frontend...
echo ======================================

cd /d "%~dp0"

echo [1/3] Recreando LandingPage.tsx...
del "apps\web\src\pages\LandingPage.tsx" 2>nul
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo import { ArrowRight, BarChart3, BellRing, Building2, CheckCircle2, Clock3, FileCheck2, FileText, ShieldCheck, Smartphone, Users } from 'lucide-react';
echo import { Button } from '../components/Button';
echo.
echo export const LandingPage = () => {
echo   return (
echo     <div className="min-h-screen bg-white">
echo       {/* Navbar */}
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
echo.
echo       {/* Hero */}
echo       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
echo         <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
echo           <div className="text-center">
echo             <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
echo               Controla la correspondencia oficial de tu municipio
echo             </h1>
echo             <p className="mt-6 text-xl max-w-3xl mx-auto text-blue-100">
echo               Digitaliza la recepción, turnado, seguimiento y cierre de oficios. 
echo               Trazabilidad total, alertas y reportes en una plataforma SaaS diseñada para gobiernos municipales.
echo             </p>
echo             <div className="mt-10 flex justify-center space-x-4">
echo               <Link to="/registro">
echo                 <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
echo                   Comenzar prueba gratuita
echo                   <ArrowRight className="ml-2 h-4 w-4" />
echo                 </Button>
echo               </Link>
echo               <Link to="/solicitar-demo">
echo                 <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
echo                   Solicitar demo
echo                 </Button>
echo               </Link>
echo             </div>
echo           </div>
echo         </div>
echo       </div>
echo.
echo       {/* Beneficios */}
echo       <div className="py-16 bg-gray-50">
echo         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
echo           <div className="text-center">
echo             <h2 className="text-3xl font-bold text-gray-900">Beneficios clave</h2>
echo           </div>
echo           <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
echo             <div className="text-center">
echo               <FileCheck2 className="h-12 w-12 text-blue-600 mx-auto" />
echo               <h3 className="mt-4 text-xl font-semibold">Control total</h3>
echo               <p className="mt-2 text-gray-600">Folio automático, seguimiento paso a paso y bitácora de cada oficio.</p>
echo             </div>
echo             <div className="text-center">
echo               <BellRing className="h-12 w-12 text-blue-600 mx-auto" />
echo               <h3 className="mt-4 text-xl font-semibold">Alertas preventivas</h3>
echo               <p className="mt-2 text-gray-600">Notificaciones de vencimiento y asignaciones para evitar retrasos.</p>
echo             </div>
echo             <div className="text-center">
echo               <BarChart3 className="h-12 w-12 text-blue-600 mx-auto" />
echo               <h3 className="mt-4 text-xl font-semibold">Reportes ejecutivos</h3>
echo               <p className="mt-2 text-gray-600">Exporta a Excel/PDF para rendición de cuentas y auditoría.</p>
echo             </div>
echo           </div>
echo         </div>
echo       </div>
echo.
echo       {/* Footer */}
echo       <footer className="bg-gray-800 text-white py-8">
echo         <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
echo           © 2026 Gestiona Doc - Solución SaaS para municipios mexicanos
echo         </div>
echo       </footer>
echo     </div>
echo   );
echo };
) > "apps\web\src\pages\LandingPage.tsx"
echo   OK

echo [2/3] Creando SolicitarDemoPage.tsx...
del "apps\web\src\pages\SolicitarDemoPage.tsx" 2>nul
(
echo import React, { useState } from 'react';
echo import { Link, useNavigate } from 'react-router-dom';
echo import { ArrowLeft, Send, Building2, MapPin, User, Mail, Phone, Users as UsersIcon, MessageSquare } from 'lucide-react';
echo import { Button } from '../components/Button';
echo import { api } from '../lib/api';
echo.
echo export const SolicitarDemoPage = () => {
echo   const navigate = useNavigate();
echo   const [loading, setLoading] = useState(false);
echo   const [formData, setFormData] = useState({
echo     municipioName: '',
echo     state: '',
echo     contactName: '',
echo     position: '',
echo     email: '',
echo     phone: '',
echo     estimatedUsers: 10,
echo     message: '',
echo     source: 'landing'
echo   });
echo.
echo   const handleSubmit = async (e: React.FormEvent) => {
echo     e.preventDefault();
echo     setLoading(true);
echo     try {
echo       await api.post('/contacto/solicitar-demo', formData);
echo       alert('Solicitud enviada. Nos pondremos en contacto pronto.');
echo       navigate('/');
echo     } catch (error) {
echo       alert('Error al enviar la solicitud. Intenta de nuevo.');
echo     } finally {
echo       setLoading(false);
echo     }
echo   };
echo.
echo   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
echo     setFormData({ ...formData, [e.target.name]: e.target.value });
echo   };
echo.
echo   return (
echo     <div className="min-h-screen bg-gray-50">
echo       <div className="max-w-3xl mx-auto px-4 py-12">
echo         <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
echo           <ArrowLeft className="h-4 w-4 mr-1" /> Volver
echo         </Link>
echo         <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
echo           <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitar demo</h1>
echo           <p className="text-gray-600 mb-6">Completa el formulario y te contactaremos para agendar una demostración personalizada.</p>
echo           <form onSubmit={handleSubmit} className="space-y-5">
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Municipio *</label>
echo               <input type="text" name="municipioName" required value={formData.municipioName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Estado *</label>
echo               <input type="text" name="state" required value={formData.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
echo               <input type="text" name="contactName" required value={formData.contactName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Cargo *</label>
echo               <input type="text" name="position" required value={formData.position} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
echo               <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
echo               <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Número estimado de usuarios</label>
echo               <input type="number" name="estimatedUsers" value={formData.estimatedUsers} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <div>
echo               <label className="block text-sm font-medium text-gray-700">Mensaje (opcional)</label>
echo               <textarea name="message" rows={4} value={formData.message} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
echo             </div>
echo             <Button type="submit" disabled={loading} className="w-full">
echo               {loading ? 'Enviando...' : <><Send className="h-4 w-4 mr-2" /> Enviar solicitud</>}
echo             </Button>
echo           </form>
echo         </div>
echo       </div>
echo     </div>
echo   );
echo };
) > "apps\web\src\pages\SolicitarDemoPage.tsx"
echo   OK

echo [3/3] Agregando declaración de tipos para import.meta.env...
if not exist "apps\web\src\vite-env.d.ts" (
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

echo.
echo ======================================
echo Archivos corregidos. Ahora recompila:
echo npm --workspace apps/web run build
echo ======================================
pause