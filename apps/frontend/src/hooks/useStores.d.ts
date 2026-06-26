import type { Store, WidgetSettings } from '@reviews/types';
export declare function useStores(): import("@tanstack/react-query").UseQueryResult<NoInfer<Store[]>, Error>;
export declare function useStore(id: string): import("@tanstack/react-query").UseQueryResult<NoInfer<{
    store: Store;
    settings: WidgetSettings;
}>, Error>;
export declare function useCreateStore(): import("@tanstack/react-query").UseMutationResult<Store, Error, {
    shop_domain: string;
    name: string;
    plan?: "free" | "pro" | "enterprise" | undefined;
}, unknown>;
export declare function useUpdateWidgetSettings(): import("@tanstack/react-query").UseMutationResult<WidgetSettings, Error, {
    id: string;
    payload: Partial<Omit<WidgetSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>;
}, unknown>;
export declare function useRotateApiKey(): import("@tanstack/react-query").UseMutationResult<string, Error, string, unknown>;
//# sourceMappingURL=useStores.d.ts.map