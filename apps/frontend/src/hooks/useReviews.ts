import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, type ReviewFilters } from '../api/reviews.js';
import type { ReviewStatus } from '@reviews/types';

export function useReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn:  () => reviewsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn:  () => reviewsApi.getById(id),
    enabled:  !!id,
  });
}

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      reviewsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useBulkUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ReviewStatus }) =>
      reviewsApi.bulkUpdateStatus(ids, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useUpsertReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      reviewsApi.upsertReply(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['review', id] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}