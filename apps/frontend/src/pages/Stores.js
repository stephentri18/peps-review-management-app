import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useStores, useCreateStore, useRotateApiKey } from '../hooks/useStores.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Icon } from '../components/ui/Icon.js';
export function Stores() {
    const [showForm, setShowForm] = useState(false);
    const [domain, setDomain] = useState('');
    const [name, setName] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const { data: stores, isLoading } = useStores();
    const createStore = useCreateStore();
    const rotateKey = useRotateApiKey();
    const handleCreate = async (e) => {
        e.preventDefault();
        await createStore.mutateAsync({ shop_domain: domain, name });
        setDomain('');
        setName('');
        setShowForm(false);
    };
    const copyKey = (key, id) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const handleRotate = async (id) => {
        if (!confirm('Rotate API key? The old key will stop working immediately.'))
            return;
        await rotateKey.mutateAsync(id);
    };
    const planCls = {
        enterprise: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20',
        pro: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-400/20',
    };
    return (_jsxs("div", { className: "mx-auto max-w-5xl p-6 lg:p-10", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Stores" }), _jsxs("p", { className: "page-subtitle", children: [stores?.length ?? 0, " registered stores"] })] }), _jsxs("button", { onClick: () => setShowForm(!showForm), className: "btn-primary", children: [_jsx(Icon, { name: "plus", size: 16 }), " Add Store"] })] }), showForm && (_jsxs("form", { onSubmit: handleCreate, className: "card mb-6 space-y-4 p-6 animate-fade-in-up", children: [_jsx("h2", { className: "font-semibold text-neutral-900 dark:text-neutral-50", children: "Register New Store" }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Store Name" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Burnaby Peptides", required: true, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Shop Domain" }), _jsx("input", { value: domain, onChange: (e) => setDomain(e.target.value), placeholder: "burnaby-peptides.myshopify.com", required: true, className: "input" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", disabled: createStore.isPending, className: "btn-primary", children: createStore.isPending ? 'Creating…' : 'Create Store' }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "btn-ghost", children: "Cancel" })] })] })), isLoading ? (_jsx("div", { className: "flex justify-center py-24", children: _jsx(Spinner, { size: "lg" }) })) : (_jsx("div", { className: "space-y-3", children: stores?.map((store) => (_jsxs("div", { className: "card flex flex-col gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [_jsx("span", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400", children: _jsx(Icon, { name: "store", size: 20 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-semibold text-neutral-900 dark:text-neutral-100", children: store.name }), _jsx("div", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: store.shop_domain }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("code", { className: "max-w-[14rem] truncate rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", children: store.api_key }), _jsx("button", { onClick: () => copyKey(store.api_key, store.id), className: "inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition hover:text-brand-700", children: copiedId === store.id
                                                        ? _jsxs(_Fragment, { children: [_jsx(Icon, { name: "check", size: 13 }), " Copied"] })
                                                        : _jsxs(_Fragment, { children: [_jsx(Icon, { name: "copy", size: 13 }), " Copy"] }) })] })] })] }), _jsxs("div", { className: "flex flex-shrink-0 items-center gap-3", children: [_jsx("span", { className: `rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${planCls[store.plan] ?? 'bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-400/20'}`, children: store.plan }), _jsxs("button", { onClick: () => handleRotate(store.id), disabled: rotateKey.isPending, className: "inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-rose-600 disabled:opacity-50", children: [_jsx(Icon, { name: "refresh", size: 14 }), " Rotate Key"] })] })] }, store.id))) }))] }));
}
//# sourceMappingURL=Stores.js.map