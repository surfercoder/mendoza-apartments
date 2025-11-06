import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'apartment-images';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param apartmentId - The apartment ID (used for organizing files)
 * @returns The public URL of the uploaded image
 */
export async function uploadApartmentImage(
  file: File,
  apartmentId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${apartmentId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Upload multiple image files to Supabase Storage
 * @param files - Array of image files to upload
 * @param apartmentId - The apartment ID (used for organizing files)
 * @returns Array of public URLs of the uploaded images
 */
export async function uploadMultipleApartmentImages(
  files: File[],
  apartmentId: string
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadApartmentImage(file, apartmentId)
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteApartmentImage(imageUrl: string): Promise<void> {
  // Extract the file path from the public URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
  
  if (pathParts.length < 2) {
    throw new Error('Invalid image URL');
  }

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete multiple images from Supabase Storage
 * @param imageUrls - Array of public URLs of images to delete
 */
export async function deleteMultipleApartmentImages(
  imageUrls: string[]
): Promise<void> {
  const deletePromises = imageUrls.map((url) => deleteApartmentImage(url));
  await Promise.all(deletePromises);
}

/**
 * Get optimized image URL with transformations
 * @param imageUrl - The original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Transformed image URL
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  const url = new URL(imageUrl);
  const params = new URLSearchParams();

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());

  url.search = params.toString();
  return url.toString();
}
