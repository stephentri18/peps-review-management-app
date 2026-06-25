// Cloudinary upload response shape (subset we care about)
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  bytes: number;
  format: string;
  duration?: number; // video only
}