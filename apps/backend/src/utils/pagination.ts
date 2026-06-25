export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
): PaginationMeta {
  return {
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  };
}

export function getOffset(page: number, perPage: number): number {
  return (page - 1) * perPage;
}