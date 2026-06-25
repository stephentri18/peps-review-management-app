import { sql } from '../config/db.js';

export interface OverviewStats {
  total_reviews: number;
  published_reviews: number;
  pending_reviews: number;
  rejected_reviews: number;
  average_rating: number;
  total_stores: number;
  reviews_with_media: number;
}

export interface VolumePoint {
  date: string;
  count: number;
}

export interface StoreStats {
  store_id: string;
  store_name: string;
  shop_domain: string;
  total: number;
  published: number;
  pending: number;
  average_rating: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export type VolumeInterval = 'day' | 'week' | 'month';

export const analyticsService = {

  async getOverview(storeId?: string): Promise<OverviewStats> {
    const storeFilter = storeId ? sql`WHERE r.store_id = ${storeId}` : sql``;

    const [row] = await sql<[{
      total:             string;
      published:         string;
      pending:           string;
      rejected:          string;
      average_rating:    string;
      with_media:        string;
    }]>`
      SELECT
        COUNT(*)                                                    AS total,
        COUNT(*) FILTER (WHERE r.status = 'published')              AS published,
        COUNT(*) FILTER (WHERE r.status = 'pending')                AS pending,
        COUNT(*) FILTER (WHERE r.status = 'rejected')               AS rejected,
        COALESCE(AVG(r.rating) FILTER (
          WHERE r.status = 'published'
        ), 0)::NUMERIC(3,2)                                         AS average_rating,
        COUNT(DISTINCT rm.review_id)                                AS with_media
      FROM reviews r
      LEFT JOIN review_media rm ON rm.review_id = r.id
      ${storeFilter}
    `;

    const [storeRow] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM stores
    `;

    return {
      total_reviews:     parseInt(row?.total        ?? '0', 10),
      published_reviews: parseInt(row?.published    ?? '0', 10),
      pending_reviews:   parseInt(row?.pending      ?? '0', 10),
      rejected_reviews:  parseInt(row?.rejected     ?? '0', 10),
      average_rating:    parseFloat(row?.average_rating ?? '0'),
      total_stores:      parseInt(storeRow?.count   ?? '0', 10),
      reviews_with_media: parseInt(row?.with_media  ?? '0', 10),
    };
  },

  async getVolume(
    interval: VolumeInterval = 'day',
    days: number = 30,
    storeId?: string
  ): Promise<VolumePoint[]> {
    const storeFilter = storeId ? sql`AND store_id = ${storeId}` : sql``;

    // Map interval to postgres date_trunc value
    const trunc =
      interval === 'week'  ? 'week'  :
      interval === 'month' ? 'month' :
                             'day';

    const rows = await sql<{ date: string; count: string }[]>`
      SELECT
        DATE_TRUNC(${trunc}, created_at)::DATE::TEXT AS date,
        COUNT(*) AS count
      FROM reviews
      WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
        ${storeFilter}
      GROUP BY DATE_TRUNC(${trunc}, created_at)
      ORDER BY date ASC
    `;

    return rows.map((r) => ({
      date:  r.date,
      count: parseInt(r.count, 10),
    }));
  },

  async getStoreBreakdown(): Promise<StoreStats[]> {
    const rows = await sql<{
      store_id:       string;
      store_name:     string;
      shop_domain:    string;
      total:          string;
      published:      string;
      pending:        string;
      average_rating: string;
    }[]>`
      SELECT
        s.id                                                        AS store_id,
        s.name                                                      AS store_name,
        s.shop_domain,
        COUNT(r.id)                                                 AS total,
        COUNT(r.id) FILTER (WHERE r.status = 'published')          AS published,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')            AS pending,
        COALESCE(AVG(r.rating) FILTER (
          WHERE r.status = 'published'
        ), 0)::NUMERIC(3,2)                                        AS average_rating
      FROM stores s
      LEFT JOIN reviews r ON r.store_id = s.id
      GROUP BY s.id, s.name, s.shop_domain
      ORDER BY total DESC
    `;

    return rows.map((r) => ({
      store_id:       r.store_id,
      store_name:     r.store_name,
      shop_domain:    r.shop_domain,
      total:          parseInt(r.total,          10),
      published:      parseInt(r.published,      10),
      pending:        parseInt(r.pending,        10),
      average_rating: parseFloat(r.average_rating),
    }));
  },

  async getRatingDistribution(storeId?: string): Promise<RatingDistribution[]> {
    const storeFilter = storeId ? sql`AND store_id = ${storeId}` : sql``;

    const rows = await sql<{ rating: string; count: string }[]>`
      SELECT
        rating::TEXT,
        COUNT(*) AS count
      FROM reviews
      WHERE status = 'published'
        ${storeFilter}
      GROUP BY rating
      ORDER BY rating DESC
    `;

    const total = rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);

    // Ensure all 5 ratings are always present even if count is 0
    return [5, 4, 3, 2, 1].map((rating) => {
      const row = rows.find((r) => parseInt(r.rating, 10) === rating);
      const count = row ? parseInt(row.count, 10) : 0;
      return {
        rating,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  },
};