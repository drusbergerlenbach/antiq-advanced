import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CalendarDays, ListTodo, Settings, Tag, Clock } from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((state) => state.user);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: CalendarDays, label: 'Heute' },
    { path: '/all', icon: ListTodo, label: 'Alle' },
    { path: '/untimed', icon: Clock, label: 'Zeitlos' },
    { path: '/settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      <nav className="bg-white border-t border-antiq-gray safe-area-bottom shadow-soft sticky bottom-0 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                  active ? 'text-antiq-amber' : 'text-gray-600 hover:text-antiq-blue'
                }`}
                style={{ minHeight: '64px' }}
              >
                <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
