import { useState } from 'react';
import { Modal }         from '../ui/Modal.js';
import { StatusBadge }   from '../ui/Badge.js';
import { StarDisplay }   from '../ui/StarDisplay.js';
import { Spinner }       from '../ui/Spinner.js';
import { useReview, useUpdateReviewStatus, useUpsertReply, useDeleteReview } from '../../hooks/useReviews.js';
import type { ReviewStatus } from '@reviews/types';

interface Props {
  reviewId: string | null;
  onClose: () => void;
}

export function ReviewDetailModal({ reviewId, onClose }: Props) {
  const [replyText, setReplyText] = useState('');
  const [lightbox, setLightbox]   = useState<string | null>(null);

  const { data: review, isLoading } = useReview(reviewId ?? '');
  const updateStatus = useUpdateReviewStatus();
  const upsertReply  = useUpsertReply();
  const deleteReview = useDeleteReview();

  if (!reviewId) return null;

  const handleStatus = async (status: ReviewStatus) => {
    await updateStatus.mutateAsync({ id: reviewId, status });
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await upsertReply.mutateAsync({ id: reviewId, body: replyText.trim() });
    setReplyText('');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    await deleteReview.mutateAsync(reviewId);
    onClose();
  };

  return (
    <>
      <Modal open={!!reviewId} onClose={onClose} title="Review Detail" size="xl">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : review ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
                  <StatusBadge status={review.status} />
                  {review.verified_purchase && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{review.reviewer_email}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </div>
              </div>
              <StarDisplay rating={review.rating} size="md" />
            </div>

            {/* Product */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
              <span className="text-gray-500">Product: </span>
              <span className="font-medium text-gray-800">
                {review.product_title ?? review.product_id}
              </span>
            </div>

            {/* Review text */}
            {review.title && (
              <div className="font-semibold text-gray-900">{review.title}</div>
            )}
            <p className="text-gray-700 leading-relaxed">{review.body}</p>

            {/* Media */}
            {review.media?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Attachments ({review.media.length})
                </div>
                <div className="flex flex-wrap gap-3">
                  {review.media.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setLightbox(m.url)}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.thumbnail_url ?? m.url} className="w-full h-full object-cover" muted />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Existing reply */}
            {review.reply && (
              <div className="border-l-4 border-slate-800 bg-slate-50 px-4 py-3 rounded-r-lg">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Store Response
                </div>
                <p className="text-sm text-gray-700">{review.reply.body}</p>
              </div>
            )}

            {/* Reply input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {review.reply ? 'Update Reply' : 'Post a Reply'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your response to this review..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 resize-none"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || upsertReply.isPending}
                className="mt-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {upsertReply.isPending ? 'Saving...' : 'Save Reply'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {review.status !== 'published' && (
                <button
                  onClick={() => handleStatus('published')}
                  disabled={updateStatus.isPending}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✓ Publish
                </button>
              )}
              {review.status !== 'rejected' && (
                <button
                  onClick={() => handleStatus('rejected')}
                  disabled={updateStatus.isPending}
                  className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  ✕ Reject
                </button>
              )}
              {review.status !== 'pending' && (
                <button
                  onClick={() => handleStatus('pending')}
                  disabled={updateStatus.isPending}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  ↩ Reset to Pending
                </button>
              )}
              <button
                onClick={handleDelete}
                className="ml-auto px-4 py-2 text-red-600 text-sm hover:underline"
              >
                Delete Review
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Review media"
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}