export declare function useOverviewStats(storeId?: string): import("@tanstack/react-query").UseQueryResult<NoInfer<import("../api/analytics.js").OverviewStats>, Error>;
export declare function useVolumeData(params: {
    interval?: 'day' | 'week' | 'month';
    days?: number;
    store_id?: string;
}): import("@tanstack/react-query").UseQueryResult<NoInfer<{
    interval: string;
    days: number;
    data: import("../api/analytics.js").VolumePoint[];
}>, Error>;
export declare function useStoreStats(): import("@tanstack/react-query").UseQueryResult<NoInfer<import("../api/analytics.js").StoreStats[]>, Error>;
export declare function useRatingDistribution(storeId?: string): import("@tanstack/react-query").UseQueryResult<NoInfer<import("../api/analytics.js").RatingDistribution[]>, Error>;
//# sourceMappingURL=useAnalytics.d.ts.map