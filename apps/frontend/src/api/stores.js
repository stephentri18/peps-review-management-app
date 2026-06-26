import { apiClient } from './client.js';
export const storesApi = {
    list: async () => {
        const { data } = await apiClient.get('/api/stores');
        return data.stores;
    },
    getById: async (id) => {
        const { data } = await apiClient.get(`/api/stores/${id}`);
        return data;
    },
    create: async (payload) => {
        const { data } = await apiClient.post('/api/stores', payload);
        return data.store;
    },
    update: async (id, payload) => {
        const { data } = await apiClient.patch(`/api/stores/${id}`, payload);
        return data.store;
    },
    rotateKey: async (id) => {
        const { data } = await apiClient.post(`/api/stores/${id}/rotate-key`);
        return data.api_key;
    },
    getSettings: async (id) => {
        const { data } = await apiClient.get(`/api/stores/${id}/settings`);
        return data.settings;
    },
    updateSettings: async (id, payload) => {
        const { data } = await apiClient.put(`/api/stores/${id}/settings`, payload);
        return data.settings;
    },
};
//# sourceMappingURL=stores.js.map