import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.js';
export function useReviews(filters = {}) {
    return useQuery({
        queryKey: ['reviews', filters],
        queryFn: () => reviewsApi.list(filters),
        staleTime: 30000,
    });
}
export function useReview(id) {
    return useQuery({
        queryKey: ['review', id],
        queryFn: () => reviewsApi.getById(id),
        enabled: !!id,
    });
}
export function useUpdateReviewStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => reviewsApi.updateStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['reviews'] });
            qc.invalidateQueries({ queryKey: ['review'] });
        },
    });
}
export function useBulkUpdateStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ ids, status }) => reviewsApi.bulkUpdateStatus(ids, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
    });
}
export function useUpsertReply() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }) => reviewsApi.upsertReply(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: ['review', id] });
            qc.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}
export function useDeleteReview() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => reviewsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
    });
}
//# sourceMappingURL=useReviews.js.map