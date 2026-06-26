import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.js';
export function useOverviewStats(storeId) {
    return useQuery({
        queryKey: ['analytics', 'overview', storeId],
        queryFn: () => analyticsApi.overview(storeId),
        staleTime: 60000,
    });
}
export function useVolumeData(params) {
    return useQuery({
        queryKey: ['analytics', 'volume', params],
        queryFn: () => analyticsApi.volume(params),
        staleTime: 60000,
    });
}
export function useStoreStats() {
    return useQuery({
        queryKey: ['analytics', 'stores'],
        queryFn: analyticsApi.stores,
        staleTime: 60000,
    });
}
export function useRatingDistribution(storeId) {
    return useQuery({
        queryKey: ['analytics', 'ratings', storeId],
        queryFn: () => analyticsApi.ratings(storeId),
        staleTime: 60000,
    });
}
//# sourceMappingURL=useAnalytics.js.map