import { apiClient } from './client.js';

export interface OverviewStats {
  total_reviews:      number;
  published_reviews:  number;
  pending_reviews:    number;
  rejected_reviews:   number;
  average_rating:     number;
  total_stores:       number;
  reviews_with_media: number;
}

export interface VolumePoint {
  date:  string;
  count: number;
}

export interface StoreStats {
  store_id:       string;
  store_name:     string;
  shop_domain:    string;
  total:          number;
  published:      number;
  pending:        number;
  average_rating: number;
}

export interface RatingDistribution {
  rating:     number;
  count:      number;
  percentage: number;
}

export const analyticsApi = {
  overview: async (storeId?: string): Promise<OverviewStats> => {
    const { data } = await apiClient.get<OverviewStats>('/api/analytics/overview', {
      params: storeId ? { store_id: storeId } : {},
    });
    return data;
  },

  volume: async (params: {
    interval?: 'day' | 'week' | 'month';
    days?: number;
    store_id?: string;
  }): Promise<{ interval: string; days: number; data: VolumePoint[] }> => {
    const { data } = await apiClient.get('/api/analytics/volume', { params });
    return data;
  },

  stores: async (): Promise<StoreStats[]> => {
    const { data } = await apiClient.get<{ stores: StoreStats[] }>(
      '/api/analytics/stores'
    );
    return data.stores;
  },

  ratings: async (storeId?: string): Promise<RatingDistribution[]> => {
    const { data } = await apiClient.get<{ distribution: RatingDistribution[] }>(
      '/api/analytics/ratings',
      { params: storeId ? { store_id: storeId } : {} }
    );
    return data.distribution;
  },
};