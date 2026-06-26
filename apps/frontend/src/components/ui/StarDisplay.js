import { jsx as _jsx } from "react/jsx-runtime";
import { Icon } from './Icon.js';
export function StarDisplay({ rating, size = 'sm' }) {
    const px = size === 'md' ? 18 : 14;
    return (_jsx("span", { className: "inline-flex gap-0.5", "aria-label": `${rating} out of 5 stars`, children: Array.from({ length: 5 }, (_, i) => {
            const filled = i < rating;
            return (_jsx(Icon, { name: "star", size: px, strokeWidth: 1.5, fill: filled ? 'currentColor' : 'none', className: filled ? 'text-amber-400' : 'text-neutral-200 dark:text-neutral-700' }, i));
        }) }));
}
//# sourceMappingURL=StarDisplay.js.map