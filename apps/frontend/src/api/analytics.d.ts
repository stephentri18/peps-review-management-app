export interface OverviewStats {
    total_reviews: number;
    published_reviews: number;
    pending_reviews: number;
    rejected_reviews: number;
    average_rating: number;
    total_stores: number;
    reviews_with_media: number;
}
export interface VolumePoint {
    date: string;
    count: number;
}
export interface StoreStats {
    store_id: string;
    store_name: string;
    shop_domain: string;
    total: number;
    published: number;
    pending: number;
    average_rating: number;
}
export interface RatingDistribution {
    rating: number;
    count: number;
    percentage: number;
}
export declare const analyticsApi: {
    overview: (storeId?: string) => Promise<OverviewStats>;
    volume: (params: {
        interval?: 'day' | 'week' | 'month';
        days?: number;
        store_id?: string;
    }) => Promise<{
        interval: string;
        days: number;
        data: VolumePoint[];
    }>;
    stores: () => Promise<StoreStats[]>;
    ratings: (storeId?: string) => Promise<RatingDistribution[]>;
};
//# sourceMappingURL=analytics.d.ts.map