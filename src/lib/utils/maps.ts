/**
 * Extract coordinates from a Google Maps URL
 * Supports various Google Maps URL formats
 */
export function extractCoordinatesFromGoogleMapsUrl(url: string): { latitude: number; longitude: number } | null {
  if (!url) return null;

  try {
    // Format 1: https://maps.app.goo.gl/... (shortened URL - needs to be resolved)
    // Format 2: https://www.google.com/maps/@-32.8894587,-68.8458386,17z
    // Format 3: https://www.google.com/maps/place/.../@-32.8894587,-68.8458386,17z
    // Format 4: https://www.google.com/maps?q=-32.8894587,-68.8458386
    
    // Try to match coordinates in the URL
    const coordPattern = /@?(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(coordPattern);
    
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      
      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    // Try query parameter format
    const queryPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = url.match(queryPattern);
    
    if (queryMatch) {
      const latitude = parseFloat(queryMatch[1]);
      const longitude = parseFloat(queryMatch[2]);
      
      if (isValidCoordinate(latitude, longitude)) {
        return { latitude, longitude };
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
    return null;
  }
}

/**
 * Validate if coordinates are within valid ranges
 */
function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Get a Google Maps embed URL from coordinates
 */
export function getGoogleMapsEmbedUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=15`;
}

/**
 * Get a static Google Maps URL from coordinates
 */
export function getGoogleMapsStaticUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
