import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from './Icon.js';
const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
};
export function StatsCard({ label, value, sub, icon, tone = 'neutral' }) {
    return (_jsxs("div", { className: "card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md", children: [_jsx("span", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`, children: _jsx(Icon, { name: icon, size: 20 }) }), _jsx("div", { className: "mt-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50", children: value }), _jsx("div", { className: "mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400", children: label }), sub && _jsx("div", { className: "mt-0.5 text-xs text-neutral-400 dark:text-neutral-500", children: sub })] }));
}
//# sourceMappingURL=StatsCard.js.map