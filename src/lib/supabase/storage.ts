import { createClient } from "@/lib/supabase/client";

/**
 * Uploads an image file to Supabase Storage bucket 'apartments' and returns the public URL.
 * The file will be stored at `public/<timestamp>-<originalName>`.
 */
export async function uploadApartmentImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabase.storage
      .from("apartments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }

    const { data: publicUrl } = supabase.storage.from("apartments").getPublicUrl(data.path);
    return { url: publicUrl.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
