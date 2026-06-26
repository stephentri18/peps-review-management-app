import type { Store, WidgetSettings } from '@reviews/types';
export declare const storesApi: {
    list: () => Promise<Store[]>;
    getById: (id: string) => Promise<{
        store: Store;
        settings: WidgetSettings;
    }>;
    create: (payload: {
        shop_domain: string;
        name: string;
        plan?: Store['plan'];
    }) => Promise<Store>;
    update: (id: string, payload: Partial<Pick<Store, 'name' | 'plan'>>) => Promise<Store>;
    rotateKey: (id: string) => Promise<string>;
    getSettings: (id: string) => Promise<WidgetSettings>;
    updateSettings: (id: string, payload: Partial<Omit<WidgetSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>) => Promise<WidgetSettings>;
};
//# sourceMappingURL=stores.d.ts.map