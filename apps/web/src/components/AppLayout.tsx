import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Bell, Building2, FileText, History, LayoutDashboard, LogOut, Shield, Users, Inbox, LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';

type NavItem = { to: string; label: string; icon: LucideIcon; disabled?: boolean };

const navItems: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/areas', label: 'Organigrama', icon: Building2 },
  { to: '/app/usuarios', label: 'Usuarios', icon: Users },
  { to: '/app/oficios', label: 'Oficios', icon: FileText },
  { to: '/app/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/app/notificaciones', label: 'Alertas', icon: Bell },
];

export function AppLayout() {
  const { tenant, user, logout } = useAuth();
  const auditItem: NavItem = { to: '/app/auditoria', label: 'Bitácora', icon: History };
  const effectiveNavItems: NavItem[] = user?.role === 'SUPER_ADMIN'
    ? [
      { to: '/app/admin/municipios', label: 'Municipios SaaS', icon: Shield },
      { to: '/app/admin/solicitudes-demo', label: 'Solicitudes demo', icon: Inbox },
      auditItem,
    ]
    : user?.role === 'ADMIN_MUNICIPAL'
      ? [...navItems, auditItem]
      : navItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 md:block">
        <Link to={user?.role === 'SUPER_ADMIN' ? '/app/admin/municipios' : '/app/dashboard'} className="block rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs text-blue-200">Gestiona Doc</p>
          <p className="mt-1 font-semibold">{user?.role === 'SUPER_ADMIN' ? 'Panel SaaS' : tenant?.name ?? 'Municipio'}</p>
        </Link>
        <nav className="mt-6 space-y-1">
          {effectiveNavItems.map((item) => (
            item.disabled ? (
              <div key={item.to} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400">
                <item.icon className="h-4 w-4" /> {item.label}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-brand-600' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </NavLink>
            )
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5">
          <Button variant="secondary" onClick={logout} className="w-full"><LogOut className="mr-2 h-4 w-4" /> Salir</Button>
        </div>
      </aside>
      <div className="md:pl-72">
        <header className="border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <strong>Gestiona Doc</strong>
            <Button variant="secondary" onClick={logout}>Salir</Button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
