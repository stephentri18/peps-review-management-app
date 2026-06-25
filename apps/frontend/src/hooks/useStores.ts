import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/stores.js';
import type { Store, WidgetSettings } from '@reviews/types';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn:  storesApi.list,
    staleTime: 60_000,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn:  () => storesApi.getById(id),
    enabled:  !!id,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
}

export function useUpdateWidgetSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<WidgetSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>;
    }) => storesApi.updateSettings(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['store', id] });
    },
  });
}

export function useRotateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storesApi.rotateKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
}