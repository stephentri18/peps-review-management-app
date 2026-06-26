import { jsx as _jsx } from "react/jsx-runtime";
export function Spinner({ size = 'md' }) {
    const cls = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' }[size];
    return (_jsx("div", { role: "status", "aria-label": "Loading", className: `animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600 dark:border-neutral-700 dark:border-t-brand-400 ${cls}` }));
}
//# sourceMappingURL=Spinner.js.map