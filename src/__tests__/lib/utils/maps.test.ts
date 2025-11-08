import {
  extractCoordinatesFromGoogleMapsUrl,
  getGoogleMapsEmbedUrl,
  getGoogleMapsStaticUrl
} from '@/lib/utils/maps'

describe('lib/utils/maps', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('extractCoordinatesFromGoogleMapsUrl', () => {
    it('should extract coordinates from format 2: @latitude,longitude', () => {
      const url = 'https://www.google.com/maps/@-32.8894587,-68.8458386,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toEqual({
        latitude: -32.8894587,
        longitude: -68.8458386
      })
    })

    it('should return null for null input', () => {
      const result = extractCoordinatesFromGoogleMapsUrl(null as any)
      expect(result).toBeNull()
    })

    it('should extract coordinates from format 3: place with @coordinates', () => {
      const url = 'https://www.google.com/maps/place/Mendoza/@-32.8894587,-68.8458386,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toEqual({
        latitude: -32.8894587,
        longitude: -68.8458386
      })
    })

    it('should extract coordinates from format 4: query parameter', () => {
      const url = 'https://www.google.com/maps?q=-32.8894587,-68.8458386'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toEqual({
        latitude: -32.8894587,
        longitude: -68.8458386
      })
    })

    it('should extract coordinates from query parameter with ampersand', () => {
      const url = 'https://www.google.com/maps?zoom=15&q=-32.8894587,-68.8458386'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toEqual({
        latitude: -32.8894587,
        longitude: -68.8458386
      })
    })

    it('should return null for empty URL', () => {
      const result = extractCoordinatesFromGoogleMapsUrl('')
      expect(result).toBeNull()
    })

    it('should return null for URL without coordinates', () => {
      const url = 'https://www.google.com/maps'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
    })

    it('should return null for invalid coordinates (out of range latitude)', () => {
      const url = 'https://www.google.com/maps/@-95.0,-68.8458386,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
    })

    it('should return null for invalid coordinates (out of range longitude)', () => {
      const url = 'https://www.google.com/maps/@-32.8894587,-200.0,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
    })

    it('should return null for NaN coordinates', () => {
      const url = 'https://www.google.com/maps/@abc,def,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
    })

    it('should handle positive coordinates', () => {
      const url = 'https://www.google.com/maps/@40.7128,74.0060,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: 74.0060
      })
    })

    it('should handle errors gracefully', () => {
      // Pass a URL that will cause an error during regex matching
      const url = 'not a valid url'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
    })

    it('should validate coordinates at boundaries', () => {
      const url1 = 'https://www.google.com/maps/@90.0,180.0,17z'
      const result1 = extractCoordinatesFromGoogleMapsUrl(url1)
      expect(result1).toEqual({ latitude: 90.0, longitude: 180.0 })

      const url2 = 'https://www.google.com/maps/@-90.0,-180.0,17z'
      const result2 = extractCoordinatesFromGoogleMapsUrl(url2)
      expect(result2).toEqual({ latitude: -90.0, longitude: -180.0 })
    })

    it('should return null for query parameter with invalid latitude', () => {
      const url = 'https://www.google.com/maps?q=-95.0,-68.8458386'
      const result = extractCoordinatesFromGoogleMapsUrl(url)
      expect(result).toBeNull()
    })

    it('should return null for query parameter with invalid longitude', () => {
      const url = 'https://www.google.com/maps?q=-32.8894587,-200.0'
      const result = extractCoordinatesFromGoogleMapsUrl(url)
      expect(result).toBeNull()
    })

    it('should handle URL that throws error during matching', () => {
      // Mock match to throw an error
      const originalMatch = String.prototype.match
      String.prototype.match = jest.fn().mockImplementation(() => {
        throw new Error('Catastrophic backtracking')
      })

      const url = 'https://www.google.com/maps/@-32.8894587,-68.8458386,17z'
      const result = extractCoordinatesFromGoogleMapsUrl(url)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error extracting coordinates from URL:', expect.any(Error))

      // Restore original method
      String.prototype.match = originalMatch
    })
  })

  describe('getGoogleMapsEmbedUrl', () => {
    it('should generate embed URL with coordinates', () => {
      const url = getGoogleMapsEmbedUrl(-32.8894587, -68.8458386)

      expect(url).toBe(
        'https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=-32.8894587,-68.8458386&zoom=15'
      )
    })

    it('should handle positive coordinates', () => {
      const url = getGoogleMapsEmbedUrl(40.7128, 74.0060)

      expect(url).toBe(
        'https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=40.7128,74.006&zoom=15'
      )
    })
  })

  describe('getGoogleMapsStaticUrl', () => {
    it('should generate static URL with coordinates', () => {
      const url = getGoogleMapsStaticUrl(-32.8894587, -68.8458386)

      expect(url).toBe('https://www.google.com/maps?q=-32.8894587,-68.8458386')
    })

    it('should handle positive coordinates', () => {
      const url = getGoogleMapsStaticUrl(40.7128, 74.0060)

      expect(url).toBe('https://www.google.com/maps?q=40.7128,74.006')
    })

    it('should handle zero coordinates', () => {
      const url = getGoogleMapsStaticUrl(0, 0)

      expect(url).toBe('https://www.google.com/maps?q=0,0')
    })
  })
})
