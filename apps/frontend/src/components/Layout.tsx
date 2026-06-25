import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: '📊' },
  { to: '/reviews',   label: 'Reviews',    icon: '💬' },
  { to: '/stores',    label: 'Stores',     icon: '🏪' },
  { to: '/analytics', label: 'Analytics',  icon: '📈' },
  { to: '/settings',  label: 'Settings',   icon: '⚙️'  },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="text-white font-bold text-lg">⭐ Reviews</div>
          <div className="text-slate-400 text-xs mt-0.5">Management Dashboard</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="text-slate-400 text-xs truncate mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-slate-400 hover:text-white text-sm transition-colors"
          >
            → Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}