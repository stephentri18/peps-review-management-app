import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useStores, useUpdateWidgetSettings } from '../hooks/useStores.js';
import { storesApi } from '../api/stores.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Icon } from '../components/ui/Icon.js';
export function Settings() {
    const { data: stores, isLoading: storesLoading } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [settings, setSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [saved, setSaved] = useState(false);
    const [snippetCopied, setSnippetCopied] = useState(false);
    const updateSettings = useUpdateWidgetSettings();
    // Load settings when store is selected
    useEffect(() => {
        if (!selectedStoreId) {
            setSettings(null);
            return;
        }
        setLoadingSettings(true);
        storesApi.getSettings(selectedStoreId)
            .then(setSettings)
            .finally(() => setLoadingSettings(false));
    }, [selectedStoreId]);
    // Auto-select first store
    useEffect(() => {
        if (stores?.length && !selectedStoreId) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores]);
    const handleSave = async () => {
        if (!settings || !selectedStoreId)
            return;
        await updateSettings.mutateAsync({
            id: selectedStoreId,
            payload: {
                theme_color: settings.theme_color,
                auto_approve: settings.auto_approve,
                require_email: settings.require_email,
                show_verified_badge: settings.show_verified_badge,
                max_media_per_review: settings.max_media_per_review,
                reviews_per_page: settings.reviews_per_page,
                allow_video: settings.allow_video,
            },
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };
    const set = (key, val) => {
        setSettings((prev) => prev ? { ...prev, [key]: val } : prev);
    };
    const copySnippet = () => {
        navigator.clipboard.writeText(widgetSnippet);
        setSnippetCopied(true);
        setTimeout(() => setSnippetCopied(false), 2000);
    };
    const widgetSnippet = selectedStoreId && stores
        ? `<div
  id="reviews-widget"
  data-api-key="${stores.find((s) => s.id === selectedStoreId)?.api_key ?? ''}"
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
  data-product-title="{{ product.title | escape }}"
  data-theme-color="${settings?.theme_color ?? '#000000'}"
  data-require-email="${settings?.require_email ?? true}"
  data-allow-video="${settings?.allow_video ?? true}"
  data-max-media="${settings?.max_media_per_review ?? 3}"
  data-reviews-per-page="${settings?.reviews_per_page ?? 5}"
></div>
<script src="https://reviews-cdn.yourdomain.com/widget.js" defer></script>`
        : '';
    return (_jsxs("div", { className: "mx-auto max-w-3xl p-6 lg:p-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "page-title", children: "Widget Settings" }), _jsx("p", { className: "page-subtitle", children: "Configure the review widget per store" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "label", children: "Store" }), storesLoading ? _jsx(Spinner, { size: "sm" }) : (_jsx("select", { value: selectedStoreId, onChange: (e) => setSelectedStoreId(e.target.value), className: "input w-full sm:w-72", children: stores?.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id))) }))] }), loadingSettings ? (_jsx("div", { className: "flex justify-center py-24", children: _jsx(Spinner, { size: "lg" }) })) : settings ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "card divide-y divide-neutral-100 p-0 dark:divide-neutral-800", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 p-5", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-neutral-900 dark:text-neutral-100", children: "Theme Color" }), _jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Applied to buttons and accents in the widget" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("code", { className: "text-xs text-neutral-400 dark:text-neutral-500", children: settings.theme_color }), _jsx("label", { className: "h-9 w-9 cursor-pointer rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-700", style: { background: settings.theme_color }, children: _jsx("input", { type: "color", value: settings.theme_color, onChange: (e) => set('theme_color', e.target.value), className: "h-full w-full cursor-pointer opacity-0" }) })] })] }), [
                                { key: 'auto_approve', label: 'Auto-approve reviews', desc: 'Publish reviews immediately without manual approval' },
                                { key: 'require_email', label: 'Require email', desc: 'Email address is mandatory in the review form' },
                                { key: 'show_verified_badge', label: 'Show verified badge', desc: 'Display "Verified Purchase" badge on eligible reviews' },
                                { key: 'allow_video', label: 'Allow video uploads', desc: 'Customers can attach videos to their reviews' },
                            ].map(({ key, label, desc }) => (_jsxs("div", { className: "flex items-center justify-between gap-4 p-5", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-neutral-900 dark:text-neutral-100", children: label }), _jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: desc })] }), _jsx("button", { type: "button", onClick: () => set(key, !settings[key]), role: "switch", "aria-checked": settings[key], className: `relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${settings[key] ? 'bg-brand-600' : 'bg-neutral-300 dark:bg-neutral-700'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0'}` }) })] }, key))), _jsxs("div", { className: "grid gap-6 p-5 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Max Media Per Review" }), _jsx("input", { type: "number", min: 0, max: 10, value: settings.max_media_per_review, onChange: (e) => set('max_media_per_review', Number(e.target.value)), className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Reviews Per Page" }), _jsx("input", { type: "number", min: 1, max: 50, value: settings.reviews_per_page, onChange: (e) => set('reviews_per_page', Number(e.target.value)), className: "input" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handleSave, disabled: updateSettings.isPending, className: "btn-primary", children: updateSettings.isPending ? 'Saving…' : 'Save Settings' }), saved && (_jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600", children: [_jsx(Icon, { name: "check", size: 16 }), " Settings saved"] }))] }), _jsxs("div", { className: "card p-6", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold text-neutral-900 dark:text-neutral-50", children: "Shopify Embed Snippet" }), _jsx("button", { onClick: copySnippet, className: "inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 transition hover:text-brand-700", children: snippetCopied
                                            ? _jsxs(_Fragment, { children: [_jsx(Icon, { name: "check", size: 13 }), " Copied"] })
                                            : _jsxs(_Fragment, { children: [_jsx(Icon, { name: "copy", size: 13 }), " Copy Snippet"] }) })] }), _jsx("pre", { className: "scrollbar-thin overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-200 dark:bg-neutral-950 dark:ring-1 dark:ring-neutral-800", children: widgetSnippet })] })] })) : null] }));
}
//# sourceMappingURL=Settings.js.map