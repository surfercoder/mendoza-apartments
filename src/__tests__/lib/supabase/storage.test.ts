import { uploadApartmentImage } from '@/lib/supabase/storage'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the client module
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Types for mocks - removed unused types

describe('lib/supabase/storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Date.now for consistent file naming
    jest.spyOn(Date, 'now').mockReturnValue(1234567890)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const createMockFile = (name: string = 'test-image.jpg', type: string = 'image/jpeg') => {
    return new File(['fake content'], name, { type })
  }

  it('should upload file successfully and return public URL', async () => {
    const mockFile = createMockFile('test-image.jpg')
    const expectedFilePath = 'public/1234567890-test-image.jpg'
    const expectedPublicUrl = 'https://test.supabase.co/storage/v1/object/public/apartments/public/1234567890-test-image.jpg'

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: expectedFilePath },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: expectedPublicUrl }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await uploadApartmentImage(mockFile)

    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('apartments')
    expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
      expectedFilePath,
      mockFile,
      {
        cacheControl: '3600',
        upsert: false
      }
    )
    expect(mockSupabaseClient.storage.from().getPublicUrl).toHaveBeenCalledWith(expectedFilePath)
    expect(result).toEqual({ url: expectedPublicUrl })
  })

  it('should handle file names with spaces by replacing them with dashes', async () => {
    const mockFile = createMockFile('test image with spaces.jpg')
    const expectedFilePath = 'public/1234567890-test-image-with-spaces.jpg'

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: expectedFilePath },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://test.url' }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    await uploadApartmentImage(mockFile)

    expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
      expectedFilePath,
      mockFile,
      expect.any(Object)
    )
  })

  it('should handle upload error', async () => {
    const mockFile = createMockFile('test-image.jpg')
    const uploadError = {
      message: 'Upload failed due to network error'
    }

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: null,
            error: uploadError
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await uploadApartmentImage(mockFile)

    expect(result).toEqual({ error: 'Upload failed due to network error' })
  })

  it('should handle unexpected errors', async () => {
    const mockFile = createMockFile('test-image.jpg')

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error')
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await uploadApartmentImage(mockFile)

    expect(result).toEqual({ error: 'Unexpected error' })
  })

  it('should handle non-Error exceptions', async () => {
    const mockFile = createMockFile('test-image.jpg')

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockImplementation(() => {
          throw 'String error'
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await uploadApartmentImage(mockFile)

    expect(result).toEqual({ error: 'Unknown error' })
  })

  it('should generate unique file names with timestamp', async () => {
    const mockFile1 = createMockFile('image1.jpg')
    const mockFile2 = createMockFile('image2.jpg')

    // Mock different timestamps
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1111111111)
      .mockReturnValueOnce(2222222222)

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'some-path' },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://test.url' }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    await uploadApartmentImage(mockFile1)
    await uploadApartmentImage(mockFile2)

    expect(mockSupabaseClient.storage.from().upload).toHaveBeenNthCalledWith(
      1,
      'public/1111111111-image1.jpg',
      mockFile1,
      expect.any(Object)
    )
    expect(mockSupabaseClient.storage.from().upload).toHaveBeenNthCalledWith(
      2,
      'public/2222222222-image2.jpg',
      mockFile2,
      expect.any(Object)
    )
  })

  it('should use correct upload options', async () => {
    const mockFile = createMockFile('test-image.jpg')

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'some-path' },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://test.url' }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    await uploadApartmentImage(mockFile)

    expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
      expect.any(String),
      mockFile,
      {
        cacheControl: '3600',
        upsert: false
      }
    )
  })

  it('should handle different file types', async () => {
    const fileTypes = [
      { name: 'image.jpg', type: 'image/jpeg' },
      { name: 'image.png', type: 'image/png' },
      { name: 'image.webp', type: 'image/webp' },
      { name: 'document.pdf', type: 'application/pdf' }
    ]

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'some-path' },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://test.url' }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    for (const fileType of fileTypes) {
      const mockFile = createMockFile(fileType.name, fileType.type)
      const result = await uploadApartmentImage(mockFile)

      expect(result).toEqual({ url: 'https://test.url' })
    }
  })

  it('should store files in apartments bucket', async () => {
    const mockFile = createMockFile('test-image.jpg')

    const mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'some-path' },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://test.url' }
          })
        })
      }
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    await uploadApartmentImage(mockFile)

    expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('apartments')
  })
})