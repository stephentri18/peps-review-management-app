import { useState } from 'react';
import { useReviews, useUpdateReviewStatus, useBulkUpdateStatus } from '../hooks/useReviews.js';
import { useStores } from '../hooks/useStores.js';
import { ReviewDetailModal } from '../components/reviews/ReviewDetailModal.js';
import { StatusBadge }       from '../components/ui/Badge.js';
import { StarDisplay }       from '../components/ui/StarDisplay.js';
import { Spinner }           from '../components/ui/Spinner.js';
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data?.total ?? 0} total reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-slate-800"
        />

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as ReviewStatus | ''); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={storeId}
          onChange={(e) => { setStoreId(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
        >
          <option value="">All Stores</option>
          {stores?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2"
        >
          Reset
        </button>
      </div>

      {/* Bulk actions */}
      {checkedIds.size > 0 && (
        <div className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-4 flex items-center gap-4">
          <span className="text-sm font-medium">{checkedIds.size} selected</span>
          <button
            onClick={() => handleBulk('published')}
            disabled={bulkUpdate.isPending}
            className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Publish All
          </button>
          <button
            onClick={() => handleBulk('rejected')}
            disabled={bulkUpdate.isPending}
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Reject All
          </button>
          <button
            onClick={() => setCheckedIds(new Set())}
            className="ml-auto text-slate-400 hover:text-white text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <div>No reviews found</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={checkedIds.size === reviews.length && reviews.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Reviewer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Review</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review: ReviewWithMedia) => (
                <tr
                  key={review.id}
                  onClick={() => setSelectedId(review.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checkedIds.has(review.id)}
                      onChange={() => toggleCheck(review.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{review.reviewer_name}</div>
                    <div className="text-gray-400 text-xs">{review.reviewer_email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {review.title && (
                      <div className="font-medium text-gray-800 truncate">{review.title}</div>
                    )}
                    <div className="text-gray-500 truncate">{review.body}</div>
                    {review.media?.length > 0 && (
                      <span className="text-xs text-blue-500">📎 {review.media.length} file{review.media.length !== 1 ? 's' : ''}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StarDisplay rating={review.rating} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={review.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {review.status !== 'published' && (
                        <button
                          onClick={(e) => handleQuickStatus(e, review.id, 'published')}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button
                          onClick={(e) => handleQuickStatus(e, review.id, 'rejected')}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {data.page} of {data.total_pages} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.total_pages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next →
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