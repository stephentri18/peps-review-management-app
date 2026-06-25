import { randomBytes } from 'crypto';
import { sql } from '../config/db.js';
import type { Store, WidgetSettings } from '@reviews/types';

function generateApiKey(): string {
  return `rv_sk_${randomBytes(32).toString('hex')}`;
}

export const storeService = {

  async create(data: { shop_domain: string; name: string; plan?: Store['plan'] }): Promise<Store> {
    const apiKey = generateApiKey();

    const [store] = await sql<Store[]>`
      INSERT INTO stores (shop_domain, name, api_key, plan)
      VALUES (${data.shop_domain}, ${data.name}, ${apiKey}, ${data.plan ?? 'free'})
      RETURNING *
    `;

    // Auto-create default widget settings for the store
    await sql`
      INSERT INTO widget_settings (store_id)
      VALUES (${store!.id})
      ON CONFLICT (store_id) DO NOTHING
    `;

    return store!;
  },

  async list(): Promise<Store[]> {
    return sql<Store[]>`SELECT * FROM stores ORDER BY created_at DESC`;
  },

  async getById(id: string): Promise<Store | null> {
    const [store] = await sql<Store[]>`
      SELECT * FROM stores WHERE id = ${id} LIMIT 1
    `;
    return store ?? null;
  },

  async getByDomain(domain: string): Promise<Store | null> {
    const [store] = await sql<Store[]>`
      SELECT * FROM stores WHERE shop_domain = ${domain} LIMIT 1
    `;
    return store ?? null;
  },

  async update(id: string, data: Partial<Pick<Store, 'name' | 'plan' | 'settings'>>): Promise<Store> {
  const [store] = await sql<Store[]>`
    UPDATE stores SET
      name       = COALESCE(${data.name ?? null}, name),
      plan       = COALESCE(${data.plan ?? null}, plan),
      settings   = COALESCE(${data.settings ? sql.json(data.settings) : null}, settings),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return store!;
},

  async rotateApiKey(id: string): Promise<Store> {
    const newKey = generateApiKey();
    const [store] = await sql<Store[]>`
      UPDATE stores SET api_key = ${newKey}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return store!;
  },

  async getWidgetSettings(storeId: string): Promise<WidgetSettings | null> {
    const [settings] = await sql<WidgetSettings[]>`
      SELECT * FROM widget_settings WHERE store_id = ${storeId} LIMIT 1
    `;
    return settings ?? null;
  },

  async updateWidgetSettings(
    storeId: string,
    data: Partial<Omit<WidgetSettings, 'id' | 'store_id' | 'created_at' | 'updated_at'>>
  ): Promise<WidgetSettings> {
    const [settings] = await sql<WidgetSettings[]>`
      UPDATE widget_settings SET
        theme_color          = COALESCE(${data.theme_color ?? null}, theme_color),
        auto_approve         = COALESCE(${data.auto_approve ?? null}, auto_approve),
        require_email        = COALESCE(${data.require_email ?? null}, require_email),
        show_verified_badge  = COALESCE(${data.show_verified_badge ?? null}, show_verified_badge),
        max_media_per_review = COALESCE(${data.max_media_per_review ?? null}, max_media_per_review),
        reviews_per_page     = COALESCE(${data.reviews_per_page ?? null}, reviews_per_page),
        allow_video          = COALESCE(${data.allow_video ?? null}, allow_video),
        updated_at           = NOW()
      WHERE store_id = ${storeId}
      RETURNING *
    `;
    return settings!;
  },
};