import { useState } from 'react';
import { Modal }         from '../ui/Modal.js';
import { StatusBadge }   from '../ui/Badge.js';
import { StarDisplay }   from '../ui/StarDisplay.js';
import { Spinner }       from '../ui/Spinner.js';
import { Icon }          from '../ui/Icon.js';
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
                <div className="mb-1 flex flex-wrap items-center gap-2.5">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{review.reviewer_name}</span>
                  <StatusBadge status={review.status} />
                  {review.verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Icon name="verified" size={14} /> Verified
                    </span>
                  )}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">{review.reviewer_email}</div>
                <div className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </div>
              </div>
              <StarDisplay rating={review.rating} size="md" />
            </div>

            {/* Product */}
            <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm dark:bg-neutral-800/60">
              <span className="text-neutral-500 dark:text-neutral-400">Product: </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {review.product_title ?? review.product_id}
              </span>
            </div>

            {/* Review text */}
            {review.title && (
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{review.title}</div>
            )}
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">{review.body}</p>

            {/* Media */}
            {review.media?.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Attachments ({review.media.length})
                </div>
                <div className="flex flex-wrap gap-3">
                  {review.media.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setLightbox(m.url)}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 transition hover:opacity-80 dark:border-neutral-700"
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={m.thumbnail_url ?? m.url} className="h-full w-full object-cover" muted />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Existing reply */}
            {review.reply && (
              <div className="rounded-r-xl border-l-2 border-brand-500 bg-brand-50/50 px-4 py-3 dark:bg-brand-500/10">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  Store Response
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{review.reply.body}</p>
              </div>
            )}

            {/* Reply input */}
            <div>
              <label className="label">{review.reply ? 'Update Reply' : 'Post a Reply'}</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your response to this review…"
                rows={3}
                className="input resize-none"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || upsertReply.isPending}
                className="btn-primary mt-2"
              >
                {upsertReply.isPending ? 'Saving…' : 'Save Reply'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              {review.status !== 'published' && (
                <button
                  onClick={() => handleStatus('published')}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Icon name="check" size={16} /> Publish
                </button>
              )}
              {review.status !== 'rejected' && (
                <button
                  onClick={() => handleStatus('rejected')}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                >
                  <Icon name="x" size={16} /> Reject
                </button>
              )}
              {review.status !== 'pending' && (
                <button
                  onClick={() => handleStatus('pending')}
                  disabled={updateStatus.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  <Icon name="refresh" size={16} /> Reset to Pending
                </button>
              )}
              <button
                onClick={handleDelete}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:text-rose-700"
              >
                <Icon name="trash" size={16} /> Delete
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/90 p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Review media"
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
      )}
    </>
  );
}
