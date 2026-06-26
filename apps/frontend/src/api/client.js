import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
apiClient.interceptors.response.use((res) => res, (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
//# sourceMappingURL=client.js.map