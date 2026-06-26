import { type ReviewFilters } from '../api/reviews.js';
import type { ReviewStatus } from '@reviews/types';
export declare function useReviews(filters?: ReviewFilters): import("@tanstack/react-query").UseQueryResult<NoInfer<import("@reviews/types").ReviewsListResponse>, Error>;
export declare function useReview(id: string): import("@tanstack/react-query").UseQueryResult<NoInfer<import("@reviews/types").ReviewWithMedia>, Error>;
export declare function useUpdateReviewStatus(): import("@tanstack/react-query").UseMutationResult<import("@reviews/types").ReviewWithMedia, Error, {
    id: string;
    status: ReviewStatus;
}, unknown>;
export declare function useBulkUpdateStatus(): import("@tanstack/react-query").UseMutationResult<void, Error, {
    ids: string[];
    status: ReviewStatus;
}, unknown>;
export declare function useUpsertReply(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    id: string;
    body: string;
}, unknown>;
export declare function useDeleteReview(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
//# sourceMappingURL=useReviews.d.ts.map