export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
export type JsonObject = {
    [key: string]: JsonValue;
};
export interface Store {
    id: string;
    shop_domain: string;
    name: string;
    api_key: string;
    plan: 'free' | 'pro' | 'enterprise';
    settings: JsonObject;
    created_at: string;
    updated_at: string;
}
export interface WidgetSettings {
    id: string;
    store_id: string;
    theme_color: string;
    auto_approve: boolean;
    require_email: boolean;
    show_verified_badge: boolean;
    max_media_per_review: number;
    reviews_per_page: number;
    allow_video: boolean;
    created_at: string;
    updated_at: string;
}
export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: 'superadmin' | 'admin' | 'viewer';
}
//# sourceMappingURL=store.d.ts.map