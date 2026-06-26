import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { Icon } from '../components/ui/Icon.js';
export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await apiClient.post('/api/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/');
        }
        catch {
            setError('Invalid email or password.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 p-4 dark:bg-neutral-950", children: [_jsx("div", { className: "pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" }), _jsx("div", { className: "pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" }), _jsxs("div", { className: "relative w-full max-w-sm animate-fade-in-up", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("span", { className: "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg", children: _jsx(Icon, { name: "star", size: 26, fill: "currentColor", strokeWidth: 0 }) }), _jsx("h1", { className: "text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50", children: "Welcome back" }), _jsx("p", { className: "mt-1 text-sm text-neutral-500 dark:text-neutral-400", children: "Sign in to your dashboard" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "card space-y-5 p-7 shadow-md", children: [error && (_jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400", children: [_jsx(Icon, { name: "x", size: 16 }), error] })), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@reviewsapp.com", required: true, className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, className: "input" })] }), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: loading ? 'Signing in…' : 'Sign in' })] }), _jsx("p", { className: "mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500", children: "Reviews Management Dashboard" })] })] }));
}
//# sourceMappingURL=Login.js.map