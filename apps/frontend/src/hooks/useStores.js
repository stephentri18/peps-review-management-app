import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/stores.js';
export function useStores() {
    return useQuery({
        queryKey: ['stores'],
        queryFn: storesApi.list,
        staleTime: 60000,
    });
}
export function useStore(id) {
    return useQuery({
        queryKey: ['store', id],
        queryFn: () => storesApi.getById(id),
        enabled: !!id,
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
        mutationFn: ({ id, payload, }) => storesApi.updateSettings(id, payload),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: ['store', id] });
        },
    });
}
export function useRotateApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => storesApi.rotateKey(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
    });
}
//# sourceMappingURL=useStores.js.map