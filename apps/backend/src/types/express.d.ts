import type { Store, AdminUser } from '@reviews/types';

declare global {
  namespace Express {
    interface Request {
      store?: Store;
      admin?: AdminUser;
    }
  }
}
