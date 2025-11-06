/**
 * Image utility functions for handling various image formats
 * Includes HEIC to JPEG conversion for iPhone compatibility
 */

/**
 * Convert HEIC/HEIF image to JPEG format
 * Uses HTML Image element with fallback for browser compatibility
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Check if it's a HEIC/HEIF file
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) {
    return file; // Return original file if not HEIC
  }

  try {
    // Try using createImageBitmap first (works in some browsers)
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(bitmap, 0, 0);
    
    // Convert to JPEG blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        },
        'image/jpeg',
        0.92 // Quality: 92%
      );
    });

    // Create new File object with .jpg extension
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], newFileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    // HEIC is not supported by most browsers' createImageBitmap
    // Provide a clear error message to the user
    throw new Error('HEIC images are not supported in your browser. Please convert the image to JPEG or PNG before uploading, or use the Photos app on your device to export as JPEG.');
  }
}

/**
 * Compress and optimize image before upload
 * Reduces file size while maintaining quality
 */
export async function optimizeImage(file: File, maxSizeMB: number = 5): Promise<File> {
  // First, convert HEIC to JPEG if needed
  const convertedFile = await convertHeicToJpeg(file);
  
  // Check if file is already under the size limit
  const fileSizeMB = convertedFile.size / 1024 / 1024;
  if (fileSizeMB <= maxSizeMB) {
    return convertedFile;
  }

  // If file is too large, compress it
  try {
    const bitmap = await createImageBitmap(convertedFile);
    const canvas = document.createElement('canvas');
    
    // Calculate new dimensions (max 2048px on longest side)
    const maxDimension = 2048;
    let width = bitmap.width;
    let height = bitmap.height;
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height / width) * maxDimension;
        width = maxDimension;
      } else {
        width = (width / height) * maxDimension;
        height = maxDimension;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(bitmap, 0, 0, width, height);
    
    // Try different quality levels to get under size limit
    let quality = 0.9;
    let blob: Blob | null = null;
    
    while (quality > 0.5) {
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      });
      
      const blobSizeMB = blob.size / 1024 / 1024;
      if (blobSizeMB <= maxSizeMB) {
        break;
      }
      
      quality -= 0.1;
    }
    
    if (!blob) {
      throw new Error('Failed to compress image');
    }
    
    return new File([blob], convertedFile.name, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return converted file even if optimization fails
    return convertedFile;
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB max before optimization)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image is too large. Maximum size is 10MB.',
    };
  }

  // Check if it's a HEIC/HEIF file - reject with helpful message
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif');
  
  if (isHeic) {
    return {
      valid: false,
      error: 'HEIC images are not supported. Please convert to JPEG or PNG first. On iPhone, you can export photos as JPEG from the Photos app.',
    };
  }

  // Check file type
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  
  const isValidType = validTypes.includes(file.type) ||
    file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);

  if (!isValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.',
    };
  }

  return { valid: true };
}
