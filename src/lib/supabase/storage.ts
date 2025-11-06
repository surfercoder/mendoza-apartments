import { createClient } from "@/lib/supabase/client";
import { optimizeImage, validateImageFile } from "@/lib/image-utils";

const BUCKET_NAME = "apartment-images";

/**
 * Uploads an image file to Supabase Storage bucket 'apartment-images' and returns the public URL.
 * Automatically converts HEIC images to JPEG and optimizes file size.
 * The file will be stored at `<timestamp>-<originalName>`.
 */
export async function uploadApartmentImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    // Validate the file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { error: validation.error || "Invalid file" };
    }

    // Optimize and convert HEIC to JPEG if needed
    const optimizedFile = await optimizeImage(file, 5); // 5MB max after optimization

    const supabase = createClient();
    
    // Ensure filename has correct extension after conversion
    let fileName = optimizedFile.name.replace(/\s+/g, "-");
    if (!fileName.toLowerCase().endsWith('.jpg') && 
        !fileName.toLowerCase().endsWith('.jpeg') && 
        !fileName.toLowerCase().endsWith('.png') && 
        !fileName.toLowerCase().endsWith('.webp')) {
      fileName = fileName.replace(/\.[^.]+$/, '.jpg');
    }
    
    const finalFileName = `${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(finalFileName, optimizedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }

    const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
    return { url: publicUrl.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteApartmentImage(imageUrl: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const supabase = createClient();
    
    // Extract the file path from the public URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    
    if (pathParts.length < 2) {
      return { error: 'Invalid image URL' };
    }

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
