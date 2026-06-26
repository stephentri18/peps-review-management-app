import { create } from 'zustand';
function getInitial() {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
        return 'dark';
    }
    return 'light';
}
function apply(theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
        localStorage.setItem('theme', theme);
    }
    catch {
        /* ignore storage errors */
    }
}
export const useThemeStore = create((set, get) => ({
    theme: getInitial(),
    toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        apply(next);
        set({ theme: next });
    },
    setTheme: (theme) => {
        apply(theme);
        set({ theme });
    },
}));
//# sourceMappingURL=themeStore.js.map