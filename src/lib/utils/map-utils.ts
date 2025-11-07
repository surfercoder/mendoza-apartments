/**
 * Extract latitude and longitude from a Google Maps URL
 * Supports various Google Maps URL formats:
 * - https://maps.google.com/?q=-32.889459,-68.845839
 * - https://www.google.com/maps/place/@-32.889459,-68.845839,17z
 * - https://www.google.com/maps/@-32.889459,-68.845839,17z
 * - https://goo.gl/maps/... (shortened URLs - returns null, needs to be expanded first)
 */
export function extractCoordinatesFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;

  try {
    // Pattern 1: ?q=lat,lng
    const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const qMatch = url.match(qPattern);
    if (qMatch) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2])
      };
    }

    // Pattern 2: @lat,lng,zoom or place/@lat,lng,zoom
    const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*),?\d*\.?\d*z?/;
    const atMatch = url.match(atPattern);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      };
    }

    // Pattern 3: /maps/place/.../@lat,lng
    const placePattern = /\/maps\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const placeMatch = url.match(placePattern);
    if (placeMatch) {
      return {
        lat: parseFloat(placeMatch[1]),
        lng: parseFloat(placeMatch[2])
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from Google Maps URL:', error);
    return null;
  }
}

/**
 * Get the best available coordinates for a location
 * Prioritizes Google Maps URL coordinates over database coordinates
 */
export function getBestCoordinates(
  latitude?: number,
  longitude?: number,
  googleMapsUrl?: string
): { lat: number; lng: number } | null {
  // First, try to extract from Google Maps URL
  if (googleMapsUrl) {
    const extracted = extractCoordinatesFromGoogleMapsUrl(googleMapsUrl);
    if (extracted) {
      return extracted;
    }
  }

  // Fall back to database coordinates
  if (latitude !== undefined && longitude !== undefined) {
    return { lat: latitude, lng: longitude };
  }

  return null;
}
