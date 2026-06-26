type Theme = 'light' | 'dark';
interface ThemeState {
    theme: Theme;
    toggle: () => void;
    setTheme: (theme: Theme) => void;
}
export declare const useThemeStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ThemeState>>;
export {};
//# sourceMappingURL=themeStore.d.ts.map