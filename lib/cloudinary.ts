import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Pull the Cloudinary public_id out of a delivery URL, e.g.
 * https://res.cloudinary.com/<cloud>/image/upload/v1699999999/physics-society/team/photos/abc123.jpg
 * -> "physics-society/team/photos/abc123"
 * Returns null for anything that isn't a Cloudinary upload URL (so callers
 * can safely no-op on external/legacy image URLs instead of throwing).
 */
export function extractPublicId(url: string): string | null {
  const afterUpload = url.split('/upload/')[1];
  if (!afterUpload) return null;
  const segments = afterUpload
    .split('/')
    .filter(Boolean)
    // Drop a leading version segment (v1699999999) — transformation
    // segments aren't expected here since uploads use plain folder paths.
    .filter(seg => !/^v\d+$/.test(seg));
  if (segments.length === 0) return null;
  return segments.join('/').replace(/\.[a-zA-Z0-9]+$/, '');
}

/**
 * Best-effort delete of a Cloudinary asset by its delivery URL. Never
 * throws — a failed cleanup shouldn't block the API request that triggered
 * it (e.g. saving a member's updated photo, or removing a member).
 */
export async function deleteCloudinaryAsset(
  url?: string | null,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  if (!url) return;
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('[cloudinary] Failed to delete asset', publicId, err);
  }
}

/** Same as `deleteCloudinaryAsset`, for an array of URLs (e.g. an event's photo gallery). */
export async function deleteCloudinaryAssets(
  urls?: (string | null | undefined)[],
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  if (!urls?.length) return;
  await Promise.all(urls.map(u => deleteCloudinaryAsset(u, resourceType)));
}

export default cloudinary;
