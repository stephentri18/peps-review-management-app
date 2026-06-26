import { apiClient } from './client.js';
export const analyticsApi = {
    overview: async (storeId) => {
        const { data } = await apiClient.get('/api/analytics/overview', {
            params: storeId ? { store_id: storeId } : {},
        });
        return data;
    },
    volume: async (params) => {
        const { data } = await apiClient.get('/api/analytics/volume', { params });
        return data;
    },
    stores: async () => {
        const { data } = await apiClient.get('/api/analytics/stores');
        return data.stores;
    },
    ratings: async (storeId) => {
        const { data } = await apiClient.get('/api/analytics/ratings', { params: storeId ? { store_id: storeId } : {} });
        return data.distribution;
    },
};
//# sourceMappingURL=analytics.js.map