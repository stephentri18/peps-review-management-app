import { apiClient } from './client.js';
import type { Store, WidgetSettings } from '@reviews/types';

export const storesApi = {
  list: async (): Promise<Store[]> => {
    const { data } = await apiClient.get<{ stores: Store[] }>('/api/stores');
    return data.stores;
  },

  getById: async (id: string): Promise<{ store: Store; settings: WidgetSettings }> => {
    const { data } = await apiClient.get(`/api/stores/${id}`);
    return data;
  },

  create: async (payload: {
    shop_domain: string;
    name: string;
    plan?: Store['plan'];
  }): Promise<Store> => {
    const { data } = await apiClient.post<{ store: Store }>('/api/stores', payload);
    return data.store;
  },

  update: async (id: string, payload: Partial<Pick<Store, 'name' | 'plan'>>) => {
    const { data } = await apiClient.patch<{ store: Store }>(
      `/api/stores/${id}`,
      payload
    );
    return data.store;
  },

  rotateKey: async (id: string): Promise<string> => {
    const { data } = await apiClient.post<{ api_key: string }>(
      `/api/stores/${id}/rotate-key`
    );
    return data.api_key;
  },

  getSettings: async (id: string): Promise<WidgetSettings> => {
    const { data } = await apiClient.get<{ settings: WidgetSettings }>(
      `/api/stores/${id}/settings`
    );
    return data.settings;
  },

  updateSettings: async (
    id: string,
    payload: Partial<Omit<WidgetSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>
  ): Promise<WidgetSettings> => {
    const { data } = await apiClient.put<{ settings: WidgetSettings }>(
      `/api/stores/${id}/settings`,
      payload
    );
    return data.settings;
  },
};