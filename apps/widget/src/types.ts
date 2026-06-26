export interface WidgetConfig {
  apiKey: string;
  productId: string;
  productHandle: string;
  productTitle: string;
  apiBase: string;
  themeColor: string;
  requireEmail: boolean;
  allowVideo: boolean;
  maxMedia: number;
  reviewsPerPage: number;
  showVerifiedBadge: boolean;
  carouselTitle: string;
}

export interface UploadedMedia {
  cloudinary_public_id: string;
  url: string;
  thumbnail_url?: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  bytes?: number;
}