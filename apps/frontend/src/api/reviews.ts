import { apiClient } from './client.js';
import type {
  ReviewWithMedia,
  ReviewStatus,
  ReviewsListResponse,
} from '@reviews/types';

export interface ReviewFilters {
  page?:     number;
  per_page?: number;
  status?:   ReviewStatus;
  store_id?: string;
  rating?:   number;
  search?:   string;
  sort?:     'created_at' | 'rating' | 'helpful_count';
  order?:    'asc' | 'desc';
}

export const reviewsApi = {
  list: async (filters: ReviewFilters = {}): Promise<ReviewsListResponse> => {
    const { data } = await apiClient.get<ReviewsListResponse>('/api/reviews', {
      params: filters,
    });
    return data;
  },

  getById: async (id: string): Promise<ReviewWithMedia> => {
    const { data } = await apiClient.get<{ review: ReviewWithMedia }>(
      `/api/reviews/${id}`
    );
    return data.review;
  },

  updateStatus: async (id: string, status: ReviewStatus): Promise<ReviewWithMedia> => {
    const { data } = await apiClient.patch<{ review: ReviewWithMedia }>(
      `/api/reviews/${id}/status`,
      { status }
    );
    return data.review;
  },

  bulkUpdateStatus: async (ids: string[], status: ReviewStatus): Promise<void> => {
    await Promise.all(ids.map((id) => reviewsApi.updateStatus(id, status)));
  },

  upsertReply: async (id: string, body: string) => {
    const { data } = await apiClient.post(`/api/reviews/${id}/reply`, { body });
    return data.reply;
  },

  deleteReply: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reviews/${id}/reply`);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/reviews/${id}`);
  },
};