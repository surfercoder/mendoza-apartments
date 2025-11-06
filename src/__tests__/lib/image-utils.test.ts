import {
  convertHeicToJpeg,
  optimizeImage,
  validateImageFile,
} from '@/lib/image-utils';

// Mock browser APIs
global.createImageBitmap = jest.fn();
global.document.createElement = jest.fn();

describe('lib/image-utils', () => {
  const createMockFile = (
    name: string = 'test-image.jpg',
    type: string = 'image/jpeg',
    size: number = 1024 * 1024 // 1MB default
  ) => {
    const blob = new Blob(['a'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  const createMockCanvas = () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({
        drawImage: jest.fn(),
      })) as any,
      toBlob: jest.fn((callback) => {
        const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
        callback(blob);
      }) as any,
    };
    return canvas;
  };

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('convertHeicToJpeg', () => {
    it('should return original file if not HEIC/HEIF', async () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg');
      const result = await convertHeicToJpeg(jpegFile);

      expect(result).toBe(jpegFile);
    });

    it('should detect HEIC by file type', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      const result = await convertHeicToJpeg(heicFile);

      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
      expect(global.createImageBitmap).toHaveBeenCalledWith(heicFile);
    });

    it('should detect HEIF by file type', async () => {
      const heifFile = createMockFile('test.heif', 'image/heif');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      const result = await convertHeicToJpeg(heifFile);

      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
    });

    it('should detect HEIC by file extension', async () => {
      const heicFile = createMockFile('photo.HEIC', 'image/jpeg');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      const result = await convertHeicToJpeg(heicFile);

      expect(result.name).toBe('photo.jpg');
      expect(result.type).toBe('image/jpeg');
    });

    it('should set canvas dimensions from bitmap', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      const mockBitmap = { width: 1920, height: 1080 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await convertHeicToJpeg(heicFile);

      expect(mockCanvas.width).toBe(1920);
      expect(mockCanvas.height).toBe(1080);
    });

    it('should convert to JPEG with 92% quality', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await convertHeicToJpeg(heicFile);

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/jpeg',
        0.92
      );
    });

    it('should throw error if canvas context is null', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();
      mockCanvas.getContext = jest.fn(() => null);

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await expect(convertHeicToJpeg(heicFile)).rejects.toThrow(
        'HEIC images are not supported in your browser'
      );
    });

    it('should throw error if toBlob fails', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();
      mockCanvas.toBlob = jest.fn((callback) => callback(null));

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await expect(convertHeicToJpeg(heicFile)).rejects.toThrow(
        'HEIC images are not supported in your browser'
      );
    });

    it('should throw helpful error if createImageBitmap fails', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic');

      (global.createImageBitmap as jest.Mock).mockRejectedValue(
        new Error('HEIC not supported')
      );

      await expect(convertHeicToJpeg(heicFile)).rejects.toThrow(
        'HEIC images are not supported in your browser'
      );
    });
  });

  describe('optimizeImage', () => {
    it('should return file unchanged if already under size limit', async () => {
      const smallFile = createMockFile('small.jpg', 'image/jpeg', 2 * 1024 * 1024); // 2MB

      const result = await optimizeImage(smallFile, 5);

      expect(result).toBe(smallFile);
      expect(global.createImageBitmap).not.toHaveBeenCalled();
    });

    it('should convert HEIC files first', async () => {
      const heicFile = createMockFile('test.heic', 'image/heic', 1 * 1024 * 1024);
      const mockBitmap = { width: 800, height: 600 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await optimizeImage(heicFile, 5);

      expect(global.createImageBitmap).toHaveBeenCalledWith(heicFile);
    });

    it('should compress large files', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024); // 10MB
      const mockBitmap = { width: 3000, height: 2000 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      const result = await optimizeImage(largeFile, 5);

      expect(global.createImageBitmap).toHaveBeenCalled();
      expect(result.type).toBe('image/jpeg');
    });

    it('should resize images larger than 2048px', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const mockBitmap = { width: 4096, height: 3072 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await optimizeImage(largeFile, 5);

      // Width should be scaled to 2048, height proportionally
      expect(mockCanvas.width).toBe(2048);
      expect(mockCanvas.height).toBe(1536);
    });

    it('should handle portrait orientation', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const mockBitmap = { width: 2000, height: 3000 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await optimizeImage(largeFile, 5);

      // Height should be scaled to 2048, width proportionally
      expect(mockCanvas.height).toBe(2048);
      expect(mockCanvas.width).toBeCloseTo(1365.33, 0);
    });

    it('should not resize images under 2048px', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const mockBitmap = { width: 1600, height: 1200 };
      const mockCanvas = createMockCanvas();

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await optimizeImage(largeFile, 5);

      expect(mockCanvas.width).toBe(1600);
      expect(mockCanvas.height).toBe(1200);
    });

    it('should try different quality levels to meet size limit', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const mockBitmap = { width: 2000, height: 1500 };
      const mockCanvas = createMockCanvas();

      // Mock toBlob to create files that are too large at first
      let callCount = 0;
      mockCanvas.toBlob = jest.fn((callback, type, quality) => {
        callCount++;
        // First few calls return large blobs, last one is small enough
        const size = (quality as number) > 0.7 ? 8 * 1024 * 1024 : 3 * 1024 * 1024;
        const blob = new Blob(['a'.repeat(size)], { type: 'image/jpeg' });
        callback(blob);
      });

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      await optimizeImage(largeFile, 5);

      // Should be called at least 3 times
      expect(mockCanvas.toBlob).toHaveBeenCalledTimes(4);
    });

    it('should return converted file if optimization fails', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);

      (global.createImageBitmap as jest.Mock).mockRejectedValue(
        new Error('Optimization failed')
      );

      const result = await optimizeImage(largeFile, 5);

      expect(result).toBe(largeFile);
    });

    it('should throw error if canvas context is null', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const mockBitmap = { width: 2000, height: 1500 };
      const mockCanvas = createMockCanvas();
      mockCanvas.getContext = jest.fn(() => null);

      (global.createImageBitmap as jest.Mock).mockResolvedValue(mockBitmap);
      (global.document.createElement as jest.Mock).mockReturnValue(mockCanvas);

      const result = await optimizeImage(largeFile, 5);

      // Should return original file when error occurs
      expect(result).toBe(largeFile);
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid JPEG files', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      const result = validateImageFile(jpegFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG files', () => {
      const pngFile = createMockFile('test.png', 'image/png', 5 * 1024 * 1024);
      const result = validateImageFile(pngFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP files', () => {
      const webpFile = createMockFile('test.webp', 'image/webp', 5 * 1024 * 1024);
      const result = validateImageFile(webpFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files larger than 10MB', () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 11 * 1024 * 1024);
      const result = validateImageFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Image is too large. Maximum size is 10MB.');
    });

    it('should reject HEIC files with helpful message', () => {
      const heicFile = createMockFile('test.heic', 'image/heic', 5 * 1024 * 1024);
      const result = validateImageFile(heicFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('HEIC images are not supported');
      expect(result.error).toContain('convert to JPEG or PNG');
    });

    it('should reject HEIF files', () => {
      const heifFile = createMockFile('test.heif', 'image/heif', 5 * 1024 * 1024);
      const result = validateImageFile(heifFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('HEIC images are not supported');
    });

    it('should reject HEIC files by extension (case-insensitive)', () => {
      const heicFile = createMockFile('photo.HEIC', 'image/jpeg', 5 * 1024 * 1024);
      const result = validateImageFile(heicFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('HEIC images are not supported');
    });

    it('should reject invalid file types', () => {
      const pdfFile = createMockFile('document.pdf', 'application/pdf', 5 * 1024 * 1024);
      const result = validateImageFile(pdfFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    });

    it('should accept files with matching extension even if MIME type is missing', () => {
      const jpegFile = createMockFile('test.jpeg', 'application/octet-stream', 5 * 1024 * 1024);
      const result = validateImageFile(jpegFile);

      expect(result.valid).toBe(true);
    });

    it('should handle files at exactly 10MB limit', () => {
      const exactFile = createMockFile('exact.jpg', 'image/jpeg', 10 * 1024 * 1024);
      const result = validateImageFile(exactFile);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid file extensions', () => {
      const gifFile = createMockFile('animated.gif', 'image/gif', 5 * 1024 * 1024);
      const result = validateImageFile(gifFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    });
  });
});
