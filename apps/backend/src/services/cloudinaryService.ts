import { cloudinary } from '../config/cloudinary.js';

export const cloudinaryService = {

  async deleteMedia(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },

  async deleteMediaBatch(items: Array<{ publicId: string; type: 'image' | 'video' }>): Promise<void> {
    await Promise.allSettled(
      items.map((item) => cloudinaryService.deleteMedia(item.publicId, item.type))
    );
  },
};