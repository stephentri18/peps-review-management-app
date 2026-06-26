export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    resource_type: 'image' | 'video' | 'raw';
    width?: number;
    height?: number;
    bytes: number;
    format: string;
    duration?: number;
}
//# sourceMappingURL=media.d.ts.map