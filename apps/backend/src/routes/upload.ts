import { Router, type Request, type Response } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import express from 'express';

const router:express.Router = Router();

router.post('/sign', apiKeyAuth, (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `review_media/${req.store!.id}`;

  // Sign only the params Cloudinary includes when validating an upload.
  // resource_type/api_key/file/cloud_name/signature are excluded by Cloudinary,
  // so signing resource_type here causes a signature mismatch (401).
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    folder,
  });
});

export { router as uploadRouter };