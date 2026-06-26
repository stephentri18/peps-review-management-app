export type ReviewStatus = 'pending' | 'published' | 'rejected';
export type ReviewSource = 'widget' | 'import' | 'manual';
export interface Review {
    id: string;
    store_id: string;
    product_id: string;
    product_handle: string | null;
    product_title: string | null;
    reviewer_name: string;
    reviewer_email: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string | null;
    body: string;
    status: ReviewStatus;
    verified_purchase: boolean;
    helpful_count: number;
    source: ReviewSource;
    ip_address: string | null;
    created_at: string;
    published_at: string | null;
    updated_at: string;
}
export interface ReviewMedia {
    id: string;
    review_id: string;
    cloudinary_public_id: string;
    url: string;
    thumbnail_url: string | null;
    type: 'image' | 'video';
    width: number | null;
    height: number | null;
    bytes: number | null;
    created_at: string;
}
export interface ReviewReply {
    id: string;
    review_id: string;
    store_id: string;
    body: string;
    created_at: string;
    updated_at: string;
}
export interface ReviewWithMedia extends Review {
    media: ReviewMedia[];
    reply: ReviewReply | null;
}
export interface SubmitMediaItem {
    cloudinary_public_id: string;
    url: string;
    thumbnail_url?: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
    bytes?: number;
}
export interface SubmitReviewPayload {
    product_id: string;
    product_handle?: string;
    product_title?: string;
    reviewer_name: string;
    reviewer_email: string;
    rating: number;
    title?: string;
    body: string;
    media?: SubmitMediaItem[];
}
export interface ReviewsListResponse {
    reviews: ReviewWithMedia[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}
export interface AggregateRating {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
//# sourceMappingURL=review.d.ts.map