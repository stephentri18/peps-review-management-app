import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useReviews, useUpdateReviewStatus, useBulkUpdateStatus } from '../hooks/useReviews.js';
import { useStores } from '../hooks/useStores.js';
import { ReviewDetailModal } from '../components/reviews/ReviewDetailModal.js';
import { StatusBadge } from '../components/ui/Badge.js';
import { StarDisplay } from '../components/ui/StarDisplay.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Icon } from '../components/ui/Icon.js';
export function Reviews() {
    const [selectedId, setSelectedId] = useState(null);
    const [checkedIds, setCheckedIds] = useState(new Set());
    // Filters
    const [status, setStatus] = useState('');
    const [storeId, setStoreId] = useState('');
    const [rating, setRating] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useReviews({
        page,
        per_page: 20,
        status: status || undefined,
        store_id: storeId || undefined,
        rating: rating ? Number(rating) : undefined,
        search: search || undefined,
    });
    const { data: stores } = useStores();
    const updateStatus = useUpdateReviewStatus();
    const bulkUpdate = useBulkUpdateStatus();
    const reviews = data?.reviews ?? [];
    // ── Checkbox handling ─────────────────────────────────────────────
    const toggleCheck = (id) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleAll = () => {
        if (checkedIds.size === reviews.length) {
            setCheckedIds(new Set());
        }
        else {
            setCheckedIds(new Set(reviews.map((r) => r.id)));
        }
    };
    const handleBulk = async (status) => {
        if (!checkedIds.size)
            return;
        await bulkUpdate.mutateAsync({ ids: Array.from(checkedIds), status });
        setCheckedIds(new Set());
    };
    const handleQuickStatus = async (e, id, status) => {
        e.stopPropagation();
        await updateStatus.mutateAsync({ id, status });
    };
    const resetFilters = () => {
        setStatus('');
        setStoreId('');
        setRating('');
        setSearch('');
        setPage(1);
    };
    const hasFilters = status || storeId || rating || search;
    return (_jsxs("div", { className: "mx-auto max-w-7xl p-6 lg:p-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "page-title", children: "Reviews" }), _jsxs("p", { className: "page-subtitle", children: [data?.total ?? 0, " total reviews"] })] }), _jsxs("div", { className: "card mb-4 flex flex-wrap items-center gap-3 p-3", children: [_jsxs("div", { className: "relative min-w-[12rem] flex-1", children: [_jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500", children: _jsx(Icon, { name: "search", size: 16 }) }), _jsx("input", { type: "text", placeholder: "Search reviews\u2026", value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); }, className: "input pl-9" })] }), _jsxs("select", { value: status, onChange: (e) => { setStatus(e.target.value); setPage(1); }, className: "input w-auto", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "rejected", children: "Rejected" })] }), _jsxs("select", { value: storeId, onChange: (e) => { setStoreId(e.target.value); setPage(1); }, className: "input w-auto", children: [_jsx("option", { value: "", children: "All Stores" }), stores?.map((s) => (_jsx("option", { value: s.id, children: s.name }, s.id)))] }), _jsxs("select", { value: rating, onChange: (e) => { setRating(e.target.value); setPage(1); }, className: "input w-auto", children: [_jsx("option", { value: "", children: "All Ratings" }), [5, 4, 3, 2, 1].map((r) => (_jsxs("option", { value: r, children: [r, " Stars"] }, r)))] }), hasFilters && (_jsx("button", { onClick: resetFilters, className: "btn-ghost px-3 py-2", children: "Reset" }))] }), checkedIds.size > 0 && (_jsxs("div", { className: "mb-4 flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2.5 text-white shadow-sm animate-fade-in", children: [_jsxs("span", { className: "text-sm font-medium", children: [checkedIds.size, " selected"] }), _jsxs("button", { onClick: () => handleBulk('published'), disabled: bulkUpdate.isPending, className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium transition hover:bg-emerald-600 disabled:opacity-50", children: [_jsx(Icon, { name: "check", size: 15 }), " Publish"] }), _jsxs("button", { onClick: () => handleBulk('rejected'), disabled: bulkUpdate.isPending, className: "inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium transition hover:bg-rose-600 disabled:opacity-50", children: [_jsx(Icon, { name: "x", size: 15 }), " Reject"] }), _jsx("button", { onClick: () => setCheckedIds(new Set()), className: "ml-auto text-sm text-neutral-400 transition hover:text-white", children: "Clear" })] })), _jsx("div", { className: "card overflow-hidden", children: isLoading ? (_jsx("div", { className: "flex justify-center py-24", children: _jsx(Spinner, { size: "lg" }) })) : reviews.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center py-24 text-center", children: [_jsx("span", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500", children: _jsx(Icon, { name: "inbox", size: 24 }) }), _jsx("div", { className: "text-sm font-medium text-neutral-600 dark:text-neutral-300", children: "No reviews found" }), _jsx("div", { className: "mt-1 text-xs text-neutral-400 dark:text-neutral-500", children: "Try adjusting your filters" })] })) : (_jsx("div", { className: "scrollbar-thin overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-neutral-100 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-800/40", children: [_jsx("th", { className: "w-10 px-4 py-3", children: _jsx("input", { type: "checkbox", checked: checkedIds.size === reviews.length && reviews.length > 0, onChange: toggleAll, className: "h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800" }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Reviewer" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Review" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Rating" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-neutral-100 dark:divide-neutral-800", children: reviews.map((review) => (_jsxs("tr", { onClick: () => setSelectedId(review.id), className: "cursor-pointer transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50", children: [_jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: _jsx("input", { type: "checkbox", checked: checkedIds.has(review.id), onChange: () => toggleCheck(review.id), className: "h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800" }) }), _jsxs("td", { className: "px-4 py-3", children: [_jsx("div", { className: "font-medium text-neutral-900 dark:text-neutral-100", children: review.reviewer_name }), _jsx("div", { className: "text-xs text-neutral-400 dark:text-neutral-500", children: review.reviewer_email })] }), _jsxs("td", { className: "max-w-xs px-4 py-3", children: [review.title && (_jsx("div", { className: "truncate font-medium text-neutral-800 dark:text-neutral-200", children: review.title })), _jsx("div", { className: "truncate text-neutral-500 dark:text-neutral-400", children: review.body }), review.media?.length > 0 && (_jsxs("span", { className: "mt-1 inline-flex items-center gap-1 text-xs text-brand-600", children: [_jsx(Icon, { name: "paperclip", size: 13 }), review.media.length, " file", review.media.length !== 1 ? 's' : ''] }))] }), _jsx("td", { className: "px-4 py-3", children: _jsx(StarDisplay, { rating: review.rating }) }), _jsx("td", { className: "px-4 py-3", children: _jsx(StatusBadge, { status: review.status }) }), _jsx("td", { className: "whitespace-nowrap px-4 py-3 text-neutral-500 dark:text-neutral-400", children: new Date(review.created_at).toLocaleDateString() }), _jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [review.status !== 'published' && (_jsx("button", { onClick: (e) => handleQuickStatus(e, review.id, 'published'), title: "Publish", className: "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20", children: _jsx(Icon, { name: "check", size: 16 }) })), review.status !== 'rejected' && (_jsx("button", { onClick: (e) => handleQuickStatus(e, review.id, 'rejected'), title: "Reject", className: "flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20", children: _jsx(Icon, { name: "x", size: 16 }) }))] }) })] }, review.id))) })] }) })) }), data && data.total_pages > 1 && (_jsxs("div", { className: "mt-4 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400", children: [_jsxs("span", { children: ["Page ", data.page, " of ", data.total_pages, " \u00B7 ", data.total, " total"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1, className: "btn-secondary px-3 py-2", children: [_jsx(Icon, { name: "chevronLeft", size: 16 }), " Prev"] }), _jsxs("button", { onClick: () => setPage((p) => p + 1), disabled: page >= data.total_pages, className: "btn-secondary px-3 py-2", children: ["Next ", _jsx(Icon, { name: "chevronRight", size: 16 })] })] })] })), _jsx(ReviewDetailModal, { reviewId: selectedId, onClose: () => setSelectedId(null) })] }));
}
//# sourceMappingURL=Reviews.js.map