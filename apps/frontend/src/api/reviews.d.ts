import type { ReviewWithMedia, ReviewStatus, ReviewsListResponse } from '@reviews/types';
export interface ReviewFilters {
    page?: number;
    per_page?: number;
    status?: ReviewStatus;
    store_id?: string;
    rating?: number;
    search?: string;
    sort?: 'created_at' | 'rating' | 'helpful_count';
    order?: 'asc' | 'desc';
}
export declare const reviewsApi: {
    list: (filters?: ReviewFilters) => Promise<ReviewsListResponse>;
    getById: (id: string) => Promise<ReviewWithMedia>;
    updateStatus: (id: string, status: ReviewStatus) => Promise<ReviewWithMedia>;
    bulkUpdateStatus: (ids: string[], status: ReviewStatus) => Promise<void>;
    upsertReply: (id: string, body: string) => Promise<any>;
    deleteReply: (id: string) => Promise<void>;
    delete: (id: string) => Promise<void>;
};
//# sourceMappingURL=reviews.d.ts.map