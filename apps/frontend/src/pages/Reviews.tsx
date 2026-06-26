import { useState } from 'react';
import { useReviews, useUpdateReviewStatus, useBulkUpdateStatus } from '../hooks/useReviews.js';
import { useStores } from '../hooks/useStores.js';
import { ReviewDetailModal } from '../components/reviews/ReviewDetailModal.js';
import { StatusBadge }       from '../components/ui/Badge.js';
import { StarDisplay }       from '../components/ui/StarDisplay.js';
import { Spinner }           from '../components/ui/Spinner.js';
import { Icon }              from '../components/ui/Icon.js';
import type { ReviewStatus, ReviewWithMedia } from '@reviews/types';

export function Reviews() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Filters
  const [status,   setStatus]   = useState<ReviewStatus | ''>('');
  const [storeId,  setStoreId]  = useState('');
  const [rating,   setRating]   = useState('');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useReviews({
    page,
    per_page: 20,
    status:   status   || undefined,
    store_id: storeId  || undefined,
    rating:   rating   ? Number(rating) : undefined,
    search:   search   || undefined,
  });

  const { data: stores } = useStores();
  const updateStatus = useUpdateReviewStatus();
  const bulkUpdate   = useBulkUpdateStatus();

  const reviews = data?.reviews ?? [];

  // ── Checkbox handling ─────────────────────────────────────────────
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === reviews.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const handleBulk = async (status: ReviewStatus) => {
    if (!checkedIds.size) return;
    await bulkUpdate.mutateAsync({ ids: Array.from(checkedIds), status });
    setCheckedIds(new Set());
  };

  const handleQuickStatus = async (
    e: React.MouseEvent,
    id: string,
    status: ReviewStatus
  ) => {
    e.stopPropagation();
    await updateStatus.mutateAsync({ id, status });
  };

  const resetFilters = () => {
    setStatus(''); setStoreId('');
    setRating(''); setSearch('');
    setPage(1);
  };

  const hasFilters = status || storeId || rating || search;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Reviews</h1>
        <p className="page-subtitle">{data?.total ?? 0} total reviews</p>
      </div>

      {/* Filters */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[12rem] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search reviews…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as ReviewStatus | ''); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={storeId}
          onChange={(e) => { setStoreId(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All Stores</option>
          {stores?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="btn-ghost px-3 py-2">
            Reset
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {checkedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2.5 text-white shadow-sm animate-fade-in">
          <span className="text-sm font-medium">{checkedIds.size} selected</span>
          <button
            onClick={() => handleBulk('published')}
            disabled={bulkUpdate.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium transition hover:bg-emerald-600 disabled:opacity-50"
          >
            <Icon name="check" size={15} /> Publish
          </button>
          <button
            onClick={() => handleBulk('rejected')}
            disabled={bulkUpdate.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium transition hover:bg-rose-600 disabled:opacity-50"
          >
            <Icon name="x" size={15} /> Reject
          </button>
          <button
            onClick={() => setCheckedIds(new Set())}
            className="ml-auto text-sm text-neutral-400 transition hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <Icon name="inbox" size={24} />
            </span>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No reviews found</div>
            <div className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-800/40">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checkedIds.size === reviews.length && reviews.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Reviewer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {reviews.map((review: ReviewWithMedia) => (
                  <tr
                    key={review.id}
                    onClick={() => setSelectedId(review.id)}
                    className="cursor-pointer transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checkedIds.has(review.id)}
                        onChange={() => toggleCheck(review.id)}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">{review.reviewer_name}</div>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">{review.reviewer_email}</div>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {review.title && (
                        <div className="truncate font-medium text-neutral-800 dark:text-neutral-200">{review.title}</div>
                      )}
                      <div className="truncate text-neutral-500 dark:text-neutral-400">{review.body}</div>
                      {review.media?.length > 0 && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600">
                          <Icon name="paperclip" size={13} />
                          {review.media.length} file{review.media.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay rating={review.rating} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {review.status !== 'published' && (
                          <button
                            onClick={(e) => handleQuickStatus(e, review.id, 'published')}
                            title="Publish"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                          >
                            <Icon name="check" size={16} />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={(e) => handleQuickStatus(e, review.id, 'rejected')}
                            title="Reject"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          >
                            <Icon name="x" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            Page {data.page} of {data.total_pages} · {data.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary px-3 py-2"
            >
              <Icon name="chevronLeft" size={16} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.total_pages}
              className="btn-secondary px-3 py-2"
            >
              Next <Icon name="chevronRight" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <ReviewDetailModal
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
