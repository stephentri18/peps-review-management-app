import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import { Icon, type IconName } from './ui/Icon.js';

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: '/',          label: 'Dashboard', icon: 'grid'     },
  { to: '/reviews',   label: 'Reviews',   icon: 'message'  },
  { to: '/stores',    label: 'Stores',    icon: 'store'    },
  { to: '/settings',  label: 'Settings',  icon: 'settings' },
];

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${className}`}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}

function SidebarContent({
  email,
  onNavigate,
  onLogout,
}: {
  email?: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const initial = email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Icon name="star" size={18} fill="currentColor" strokeWidth={0} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Reviews</div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500">Management</div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              }`
            }
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-700">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">{email}</div>
          </div>
          <button
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block">
        <SidebarContent email={user?.email} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Icon name="menu" size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icon name="star" size={15} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Reviews</span>
        </div>
        <ThemeToggle className="ml-auto" />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-white shadow-lg animate-fade-in dark:border-neutral-800 dark:bg-neutral-900">
            <SidebarContent
              email={user?.email}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
