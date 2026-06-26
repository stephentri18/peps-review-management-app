import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useThemeStore } from '../store/themeStore.js';
import { Icon } from './ui/Icon.js';
const navItems = [
    { to: '/', label: 'Dashboard', icon: 'grid' },
    { to: '/reviews', label: 'Reviews', icon: 'message' },
    { to: '/stores', label: 'Stores', icon: 'store' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
];
function ThemeToggle({ className = '' }) {
    const { theme, toggle } = useThemeStore();
    const isDark = theme === 'dark';
    return (_jsx("button", { onClick: toggle, "aria-label": isDark ? 'Switch to light mode' : 'Switch to dark mode', title: isDark ? 'Light mode' : 'Dark mode', className: `flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${className}`, children: _jsx(Icon, { name: isDark ? 'sun' : 'moon', size: 18 }) }));
}
function SidebarContent({ email, onNavigate, onLogout, }) {
    const initial = email?.charAt(0).toUpperCase() ?? 'A';
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-5", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm", children: _jsx(Icon, { name: "star", size: 18, fill: "currentColor", strokeWidth: 0 }) }), _jsxs("div", { className: "leading-tight", children: [_jsx("div", { className: "text-sm font-semibold text-neutral-900 dark:text-neutral-50", children: "Reviews" }), _jsx("div", { className: "text-xs text-neutral-400 dark:text-neutral-500", children: "Management" })] })] }), _jsx(ThemeToggle, {})] }), _jsx("nav", { className: "flex-1 space-y-1 px-3 py-2", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, end: item.to === '/', onClick: onNavigate, className: ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive
                        ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'}`, children: [_jsx(Icon, { name: item.icon, size: 18 }), item.label] }, item.to))) }), _jsx("div", { className: "border-t border-neutral-100 p-3 dark:border-neutral-800", children: _jsxs("div", { className: "flex items-center gap-3 rounded-xl px-2 py-2", children: [_jsx("span", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-700", children: initial }), _jsx("div", { className: "min-w-0 flex-1", children: _jsx("div", { className: "truncate text-xs font-medium text-neutral-700 dark:text-neutral-300", children: email }) }), _jsx("button", { onClick: onLogout, "aria-label": "Sign out", title: "Sign out", className: "flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100", children: _jsx(Icon, { name: "logout", size: 18 }) })] }) })] }));
}
export function Layout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-neutral-50 dark:bg-neutral-950", children: [_jsx("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:block", children: _jsx(SidebarContent, { email: user?.email, onLogout: handleLogout }) }), _jsxs("header", { className: "sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80 md:hidden", children: [_jsx("button", { onClick: () => setDrawerOpen(true), "aria-label": "Open menu", className: "flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800", children: _jsx(Icon, { name: "menu", size: 20 }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white", children: _jsx(Icon, { name: "star", size: 15, fill: "currentColor", strokeWidth: 0 }) }), _jsx("span", { className: "text-sm font-semibold text-neutral-900 dark:text-neutral-50", children: "Reviews" })] }), _jsx(ThemeToggle, { className: "ml-auto" })] }), drawerOpen && (_jsxs("div", { className: "md:hidden", children: [_jsx("div", { className: "fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm animate-fade-in", onClick: () => setDrawerOpen(false) }), _jsx("aside", { className: "fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-white shadow-lg animate-fade-in dark:border-neutral-800 dark:bg-neutral-900", children: _jsx(SidebarContent, { email: user?.email, onNavigate: () => setDrawerOpen(false), onLogout: handleLogout }) })] })), _jsx("main", { className: "md:pl-64", children: _jsx(Outlet, {}) })] }));
}
//# sourceMappingURL=Layout.js.map