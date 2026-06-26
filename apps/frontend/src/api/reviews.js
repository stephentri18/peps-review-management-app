import { apiClient } from './client.js';
export const reviewsApi = {
    list: async (filters = {}) => {
        const { data } = await apiClient.get('/api/reviews', {
            params: filters,
        });
        return data;
    },
    getById: async (id) => {
        const { data } = await apiClient.get(`/api/reviews/${id}`);
        return data.review;
    },
    updateStatus: async (id, status) => {
        const { data } = await apiClient.patch(`/api/reviews/${id}/status`, { status });
        return data.review;
    },
    bulkUpdateStatus: async (ids, status) => {
        await Promise.all(ids.map((id) => reviewsApi.updateStatus(id, status)));
    },
    upsertReply: async (id, body) => {
        const { data } = await apiClient.post(`/api/reviews/${id}/reply`, { body });
        return data.reply;
    },
    deleteReply: async (id) => {
        await apiClient.delete(`/api/reviews/${id}/reply`);
    },
    delete: async (id) => {
        await apiClient.delete(`/api/reviews/${id}`);
    },
};
//# sourceMappingURL=reviews.js.map