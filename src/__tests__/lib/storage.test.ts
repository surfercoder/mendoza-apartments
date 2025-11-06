// Set up environment variables before importing the module
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
  })),
}));

import {
  getOptimizedImageUrl,
  uploadApartmentImage,
  uploadMultipleApartmentImages,
  deleteApartmentImage,
  deleteMultipleApartmentImages,
  supabase,
} from '@/lib/storage';

describe('lib/storage', () => {
  const createMockFile = (name: string = 'test-image.jpg') => {
    const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
    return new File([blob], name, { type: 'image/jpeg' });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOptimizedImageUrl', () => {
    it('should add width parameter', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 800);

      expect(result).toContain('width=800');
      expect(result).toContain('quality=80');
    });

    it('should add height parameter', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, undefined, 600);

      expect(result).toContain('height=600');
      expect(result).toContain('quality=80');
    });

    it('should add both width and height parameters', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 800, 600);

      expect(result).toContain('width=800');
      expect(result).toContain('height=600');
      expect(result).toContain('quality=80');
    });

    it('should use custom quality parameter', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 800, 600, 90);

      expect(result).toContain('quality=90');
    });

    it('should use default quality of 80', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl);

      expect(result).toContain('quality=80');
    });

    it('should preserve original URL structure', () => {
      const imageUrl = 'https://test.supabase.co/path/to/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 800);

      expect(result).toContain('https://test.supabase.co/path/to/image.jpg');
      expect(result).toContain('width=800');
    });

    it('should handle URL without parameters', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 800, 600, 85);

      const url = new URL(result);
      expect(url.searchParams.get('width')).toBe('800');
      expect(url.searchParams.get('height')).toBe('600');
      expect(url.searchParams.get('quality')).toBe('85');
    });

    it('should handle only quality parameter', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, undefined, undefined, 95);

      expect(result).toContain('quality=95');
      expect(result).not.toContain('width=');
      expect(result).not.toContain('height=');
    });

    it('should handle width of 0', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 0, 600);

      // Width of 0 is falsy, so it shouldn't be added
      expect(result).not.toContain('width=');
      expect(result).toContain('height=600');
    });

    it('should construct valid URLs', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';
      const result = getOptimizedImageUrl(imageUrl, 1920, 1080, 100);

      expect(() => new URL(result)).not.toThrow();
    });

    it('should work with different quality values', () => {
      const imageUrl = 'https://test.supabase.co/image.jpg';

      const qualities = [1, 50, 80, 100];
      qualities.forEach(quality => {
        const result = getOptimizedImageUrl(imageUrl, undefined, undefined, quality);
        expect(result).toContain(`quality=${quality}`);
      });
    });
  });

  describe('uploadApartmentImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = createMockFile('test-image.jpg');
      const apartmentId = 'apt-123';
      const mockPath = `${apartmentId}/1234567890.jpg`;
      const mockPublicUrl = `https://test.supabase.co/storage/v1/object/public/apartment-images/${mockPath}`;

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: mockPath },
        error: null,
      });

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadApartmentImage(mockFile, apartmentId);

      expect(result).toBe(mockPublicUrl);
      expect(supabase.storage.from).toHaveBeenCalledWith('apartment-images');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${apartmentId}/\\d+\\.jpg$`)),
        mockFile,
        { cacheControl: '3600', upsert: false }
      );
      expect(mockGetPublicUrl).toHaveBeenCalledWith(mockPath);
    });

    it('should handle upload errors', async () => {
      const mockFile = createMockFile('test-image.jpg');
      const apartmentId = 'apt-123';
      const mockError = { message: 'Upload failed' };

      const mockUpload = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      await expect(uploadApartmentImage(mockFile, apartmentId)).rejects.toThrow(
        'Failed to upload image: Upload failed'
      );
    });

    it('should handle different file extensions', async () => {
      const mockFile = createMockFile('test-image.png');
      const apartmentId = 'apt-456';
      const mockPath = `${apartmentId}/1234567890.png`;
      const mockPublicUrl = `https://test.supabase.co/storage/v1/object/public/apartment-images/${mockPath}`;

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: mockPath },
        error: null,
      });

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const result = await uploadApartmentImage(mockFile, apartmentId);

      expect(result).toBe(mockPublicUrl);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${apartmentId}/\\d+\\.png$`)),
        mockFile,
        expect.any(Object)
      );
    });
  });

  describe('uploadMultipleApartmentImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockFiles = [
        createMockFile('image1.jpg'),
        createMockFile('image2.jpg'),
        createMockFile('image3.jpg'),
      ];
      const apartmentId = 'apt-789';
      const mockUrls = [
        'https://test.supabase.co/image1.jpg',
        'https://test.supabase.co/image2.jpg',
        'https://test.supabase.co/image3.jpg',
      ];

      let callIndex = 0;
      const mockUpload = jest.fn().mockImplementation(() => {
        const index = callIndex++;
        return Promise.resolve({
          data: { path: `apt-789/${index}.jpg` },
          error: null,
        });
      });

      const mockGetPublicUrl = jest.fn().mockImplementation((path) => {
        const index = parseInt(path.split('/')[1].split('.')[0]);
        return { data: { publicUrl: mockUrls[index] } };
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const results = await uploadMultipleApartmentImages(mockFiles, apartmentId);

      expect(results).toHaveLength(3);
      expect(results).toEqual(mockUrls);
      expect(mockUpload).toHaveBeenCalledTimes(3);
    });

    it('should handle empty array', async () => {
      const results = await uploadMultipleApartmentImages([], 'apt-123');
      expect(results).toEqual([]);
    });

    it('should handle upload failure in batch', async () => {
      const mockFiles = [createMockFile('image1.jpg'), createMockFile('image2.jpg')];
      const apartmentId = 'apt-789';

      const mockUpload = jest.fn()
        .mockResolvedValueOnce({
          data: { path: 'apt-789/0.jpg' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Upload failed' },
        });

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://test.supabase.co/image1.jpg' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      await expect(uploadMultipleApartmentImages(mockFiles, apartmentId)).rejects.toThrow();
    });
  });

  describe('deleteApartmentImage', () => {
    it('should delete an image successfully', async () => {
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image.jpg';

      const mockRemove = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      await deleteApartmentImage(imageUrl);

      expect(supabase.storage.from).toHaveBeenCalledWith('apartment-images');
      expect(mockRemove).toHaveBeenCalledWith(['apt-123/image.jpg']);
    });

    it('should handle delete errors', async () => {
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image.jpg';
      const mockError = { message: 'Delete failed' };

      const mockRemove = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      await expect(deleteApartmentImage(imageUrl)).rejects.toThrow(
        'Failed to delete image: Delete failed'
      );
    });

    it('should handle invalid image URLs', async () => {
      const invalidUrl = 'https://test.supabase.co/invalid-path';

      await expect(deleteApartmentImage(invalidUrl)).rejects.toThrow(
        'Invalid image URL'
      );
    });

    it('should handle URLs with complex paths', async () => {
      const imageUrl = 'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-456/subfolder/image.jpg';

      const mockRemove = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      await deleteApartmentImage(imageUrl);

      expect(mockRemove).toHaveBeenCalledWith(['apt-456/subfolder/image.jpg']);
    });
  });

  describe('deleteMultipleApartmentImages', () => {
    it('should delete multiple images successfully', async () => {
      const imageUrls = [
        'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image1.jpg',
        'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image2.jpg',
        'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image3.jpg',
      ];

      const mockRemove = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      await deleteMultipleApartmentImages(imageUrls);

      expect(mockRemove).toHaveBeenCalledTimes(3);
      expect(mockRemove).toHaveBeenCalledWith(['apt-123/image1.jpg']);
      expect(mockRemove).toHaveBeenCalledWith(['apt-123/image2.jpg']);
      expect(mockRemove).toHaveBeenCalledWith(['apt-123/image3.jpg']);
    });

    it('should handle empty array', async () => {
      await deleteMultipleApartmentImages([]);
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should handle deletion failure in batch', async () => {
      const imageUrls = [
        'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image1.jpg',
        'https://test.supabase.co/storage/v1/object/public/apartment-images/apt-123/image2.jpg',
      ];

      const mockRemove = jest.fn()
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Delete failed' },
        });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      await expect(deleteMultipleApartmentImages(imageUrls)).rejects.toThrow(
        'Failed to delete image: Delete failed'
      );
    });
  });
});
