import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Cargando sesión...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
