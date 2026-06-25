import type { WidgetConfig, UploadedMedia } from './types.js';
import { getUploadSignature } from './api.js';

export async function uploadFile(
  file: File,
  config: WidgetConfig,
  onProgress: (pct: number) => void
): Promise<UploadedMedia> {
  const params = await getUploadSignature(config);
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', params.api_key);
  formData.append('timestamp', String(params.timestamp));
  formData.append('signature', params.signature);
  formData.append('folder', params.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as Record<string, unknown>;
        resolve({
          cloudinary_public_id: data['public_id'] as string,
          url:                  data['secure_url'] as string,
          thumbnail_url: resourceType === 'video'
            ? (data['secure_url'] as string).replace('/upload/', '/upload/so_0/')
            : undefined,
          type:   resourceType,
          width:  data['width'] as number | undefined,
          height: data['height'] as number | undefined,
          bytes:  data['bytes'] as number | undefined,
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${params.cloud_name}/${resourceType}/upload`
    );
    xhr.send(formData);
  });
}