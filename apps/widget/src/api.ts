import type { ReviewsListResponse, AggregateRating } from '@reviews/types';
import type { WidgetConfig, UploadedMedia } from './types.js';

export async function fetchReviews(
  config: WidgetConfig,
  page: number = 1
): Promise<ReviewsListResponse> {
  const url = new URL(`${config.apiBase}/api/widget/reviews`);
  url.searchParams.set('product_id', config.productId);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(config.reviewsPerPage));

  const res = await fetch(url.toString(), {
    headers: { 'x-api-key': config.apiKey },
  });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json() as Promise<ReviewsListResponse>;
}

export async function fetchAggregate(config: WidgetConfig): Promise<AggregateRating> {
  const url = new URL(`${config.apiBase}/api/widget/aggregate`);
  url.searchParams.set('product_id', config.productId);

  const res = await fetch(url.toString(), {
    headers: { 'x-api-key': config.apiKey },
  });
  if (!res.ok) throw new Error('Failed to fetch aggregate');
  return res.json() as Promise<AggregateRating>;
}

export async function submitReview(
  config: WidgetConfig,
  data: {
    reviewer_name: string;
    reviewer_email: string;
    rating: number;
    title?: string;
    body: string;
    media?: UploadedMedia[];
  }
): Promise<void> {
  const res = await fetch(`${config.apiBase}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({
      product_id:     config.productId,
      product_handle: config.productHandle,
      product_title:  config.productTitle,
      ...data,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Submission failed');
  }
}

export async function getUploadSignature(config: WidgetConfig): Promise<{
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
}> {
  const res = await fetch(`${config.apiBase}/api/upload/sign`, {
    method: 'POST',
    headers: { 'x-api-key': config.apiKey },
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function voteHelpful(
  config: WidgetConfig,
  reviewId: string,
  vote: 'helpful' | 'not_helpful'
): Promise<void> {
  await fetch(`${config.apiBase}/api/widget/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify({ vote }),
  });
}