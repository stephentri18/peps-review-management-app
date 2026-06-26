import { sql } from '../config/db.js';
import { buildPaginationMeta, getOffset } from '../utils/pagination.js';
import type {
  Review,
  ReviewWithMedia,
  ReviewStatus,
  ReviewsListResponse,
  SubmitReviewPayload,
  SubmitMediaItem,
  AggregateRating,
} from '@reviews/types';

interface CreateInput {
  storeId: string;
  data: SubmitReviewPayload;
  ipAddress: string | null;
}

interface ListQuery {
  page: number;
  per_page: number;
  status?: ReviewStatus;
  store_id?: string;
  product_id?: string;
  rating?: number;
  search?: string;
  sort: 'created_at' | 'rating' | 'helpful_count';
  order: 'asc' | 'desc';
}

export const reviewService = {

  async create({ storeId, data, ipAddress }: CreateInput): Promise<Review> {
    const [settings] = await sql`
      SELECT auto_approve, max_media_per_review
      FROM widget_settings WHERE store_id = ${storeId}
    `;

    // 5-star reviews auto-publish; 1–4 star reviews wait for moderation.
    // The store's auto_approve setting still publishes everything when enabled.
    const autoApprove = settings?.auto_approve ?? false;
    const publish = autoApprove || data.rating === 5;
    const status: ReviewStatus = publish ? 'published' : 'pending';
    const publishedAt = publish ? new Date() : null;

    const [review] = await sql<Review[]>`
      INSERT INTO reviews (
        store_id, product_id, product_handle, product_title,
        reviewer_name, reviewer_email, rating, title, body,
        status, ip_address, published_at
      ) VALUES (
        ${storeId},
        ${data.product_id},
        ${data.product_handle ?? null},
        ${data.product_title ?? null},
        ${data.reviewer_name},
        ${data.reviewer_email},
        ${data.rating},
        ${data.title ?? null},
        ${data.body},
        ${status},
        ${ipAddress},
        ${publishedAt}
      )
      RETURNING *
    `;

    if (data.media?.length) {
      const maxMedia: number = settings?.max_media_per_review ?? 3;
      await reviewService.insertMedia(review!.id, data.media.slice(0, maxMedia));
    }

    return review!;
  },

  async insertMedia(reviewId: string, media: SubmitMediaItem[]): Promise<void> {
    for (const m of media) {
      await sql`
        INSERT INTO review_media (
          review_id, cloudinary_public_id, url, thumbnail_url,
          type, width, height, bytes
        ) VALUES (
          ${reviewId},
          ${m.cloudinary_public_id},
          ${m.url},
          ${m.thumbnail_url ?? null},
          ${m.type},
          ${m.width ?? null},
          ${m.height ?? null},
          ${m.bytes ?? null}
        )
      `;
    }
  },

  async list(q: ListQuery): Promise<ReviewsListResponse> {
    // Build conditional fragments — postgres.js handles them safely
    const statusFilter  = q.status     ? sql`AND r.status = ${q.status}`         : sql``;
    const storeFilter   = q.store_id   ? sql`AND r.store_id = ${q.store_id}`     : sql``;
    const productFilter = q.product_id ? sql`AND r.product_id = ${q.product_id}` : sql``;
    const ratingFilter  = q.rating     ? sql`AND r.rating = ${q.rating}`         : sql``;
    const searchFilter = q.search
      ? sql`AND (
          r.body ILIKE ${'%' + q.search + '%'} OR
          r.reviewer_name ILIKE ${'%' + q.search + '%'}
        )`
      : sql``;

    const [countRow] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count
      FROM reviews r
      WHERE 1=1
        ${statusFilter}
        ${storeFilter}
        ${productFilter}
        ${ratingFilter}
        ${searchFilter}
    `;

    const total = parseInt(countRow?.count ?? '0', 10);
    const offset = getOffset(q.page, q.per_page);

    // Sort column mapped to safe sql identifiers
    const sortCol =
      q.sort === 'rating'        ? sql`r.rating` :
      q.sort === 'helpful_count' ? sql`r.helpful_count` :
                                   sql`r.created_at`;
    const sortDir = q.order === 'asc' ? sql`ASC` : sql`DESC`;

    const reviews = await sql<ReviewWithMedia[]>`
      SELECT
        r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id',                   rm.id,
              'review_id',            rm.review_id,
              'cloudinary_public_id', rm.cloudinary_public_id,
              'url',                  rm.url,
              'thumbnail_url',        rm.thumbnail_url,
              'type',                 rm.type,
              'width',                rm.width,
              'height',               rm.height,
              'bytes',                rm.bytes,
              'created_at',           rm.created_at
            ) ORDER BY rm.created_at
          ) FILTER (WHERE rm.id IS NOT NULL),
          '[]'::json
        ) AS media,
        (
          SELECT to_json(rp.*)
          FROM review_replies rp
          WHERE rp.review_id = r.id
          LIMIT 1
        ) AS reply
      FROM reviews r
      LEFT JOIN review_media rm ON rm.review_id = r.id
      WHERE 1=1
        ${statusFilter}
        ${storeFilter}
        ${productFilter}
        ${ratingFilter}
        ${searchFilter}
      GROUP BY r.id
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ${q.per_page}
      OFFSET ${offset}
    `;

    return {
      reviews,
      ...buildPaginationMeta(total, q.page, q.per_page),
    };
  },

  async getById(id: string): Promise<ReviewWithMedia | null> {
    const [review] = await sql<ReviewWithMedia[]>`
      SELECT
        r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id',                   rm.id,
              'review_id',            rm.review_id,
              'cloudinary_public_id', rm.cloudinary_public_id,
              'url',                  rm.url,
              'thumbnail_url',        rm.thumbnail_url,
              'type',                 rm.type,
              'width',                rm.width,
              'height',               rm.height,
              'bytes',                rm.bytes,
              'created_at',           rm.created_at
            ) ORDER BY rm.created_at
          ) FILTER (WHERE rm.id IS NOT NULL),
          '[]'::json
        ) AS media,
        (
          SELECT to_json(rp.*)
          FROM review_replies rp
          WHERE rp.review_id = r.id
          LIMIT 1
        ) AS reply
      FROM reviews r
      LEFT JOIN review_media rm ON rm.review_id = r.id
      WHERE r.id = ${id}
      GROUP BY r.id
    `;
    return review ?? null;
  },

  async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
    const publishedAt = status === 'published' ? new Date() : null;
    const [review] = await sql<Review[]>`
      UPDATE reviews
      SET
        status       = ${status},
        published_at = ${publishedAt},
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return review!;
  },

  async upsertReply(reviewId: string, body: string) {
    // store_id is derived from the review itself — the admin is global, so its
    // id is NOT a valid stores(id) and must never be written here.
    const [reply] = await sql`
      INSERT INTO review_replies (review_id, store_id, body)
      SELECT ${reviewId}, r.store_id, ${body}
      FROM reviews r
      WHERE r.id = ${reviewId}
      ON CONFLICT (review_id)
      DO UPDATE SET body = ${body}, updated_at = NOW()
      RETURNING *
    `;
    return reply;
  },

  async deleteReply(reviewId: string): Promise<void> {
    await sql`DELETE FROM review_replies WHERE review_id = ${reviewId}`;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM reviews WHERE id = ${id}`;
  },

  async getAggregate(storeId: string, productId: string): Promise<AggregateRating> {
    const [row] = await sql<[{
      average: string;
      total: string;
      r1: string; r2: string; r3: string; r4: string; r5: string;
    }]>`
      SELECT
        COALESCE(AVG(rating), 0)::NUMERIC(3,2)                   AS average,
        COUNT(*)                                                  AS total,
        COUNT(*) FILTER (WHERE rating = 1)                        AS r1,
        COUNT(*) FILTER (WHERE rating = 2)                        AS r2,
        COUNT(*) FILTER (WHERE rating = 3)                        AS r3,
        COUNT(*) FILTER (WHERE rating = 4)                        AS r4,
        COUNT(*) FILTER (WHERE rating = 5)                        AS r5
      FROM reviews
      WHERE store_id = ${storeId}
        AND product_id = ${productId}
        AND status = 'published'
    `;

    return {
      average:      parseFloat(row?.average ?? '0'),
      total:        parseInt(row?.total ?? '0', 10),
      distribution: {
        1: parseInt(row?.r1 ?? '0', 10),
        2: parseInt(row?.r2 ?? '0', 10),
        3: parseInt(row?.r3 ?? '0', 10),
        4: parseInt(row?.r4 ?? '0', 10),
        5: parseInt(row?.r5 ?? '0', 10),
      },
    };
  },
};