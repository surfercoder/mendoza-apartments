import { extractCoordinatesFromGoogleMapsUrl, getBestCoordinates } from '../map-utils';

describe('map-utils', () => {
  describe('extractCoordinatesFromGoogleMapsUrl', () => {
    it('should extract coordinates from ?q= format', () => {
      const url = 'https://maps.google.com/?q=-32.889459,-68.845839';
      const result = extractCoordinatesFromGoogleMapsUrl(url);
      expect(result).toEqual({ lat: -32.889459, lng: -68.845839 });
    });

    it('should extract coordinates from @ format', () => {
      const url = 'https://www.google.com/maps/@-32.889459,-68.845839,17z';
      const result = extractCoordinatesFromGoogleMapsUrl(url);
      expect(result).toEqual({ lat: -32.889459, lng: -68.845839 });
    });

    it('should extract coordinates from place/@ format', () => {
      const url = 'https://www.google.com/maps/place/Amado+Nervo+521/@-32.889459,-68.845839,17z';
      const result = extractCoordinatesFromGoogleMapsUrl(url);
      expect(result).toEqual({ lat: -32.889459, lng: -68.845839 });
    });

    it('should return null for invalid URL', () => {
      const url = 'https://www.example.com';
      const result = extractCoordinatesFromGoogleMapsUrl(url);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = extractCoordinatesFromGoogleMapsUrl('');
      expect(result).toBeNull();
    });
  });

  describe('getBestCoordinates', () => {
    it('should prioritize Google Maps URL coordinates', () => {
      const result = getBestCoordinates(
        -32.8,
        -68.8,
        'https://maps.google.com/?q=-32.889459,-68.845839'
      );
      expect(result).toEqual({ lat: -32.889459, lng: -68.845839 });
    });

    it('should fall back to database coordinates if URL extraction fails', () => {
      const result = getBestCoordinates(
        -32.8,
        -68.8,
        'https://www.example.com'
      );
      expect(result).toEqual({ lat: -32.8, lng: -68.8 });
    });

    it('should use database coordinates if no URL provided', () => {
      const result = getBestCoordinates(-32.8, -68.8);
      expect(result).toEqual({ lat: -32.8, lng: -68.8 });
    });

    it('should return null if no coordinates available', () => {
      const result = getBestCoordinates();
      expect(result).toBeNull();
    });
  });
});
