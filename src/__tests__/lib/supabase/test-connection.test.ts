import { testSupabaseConnection } from '@/lib/supabase/test-connection'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the client module
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Types for mocks - removed unused types

describe('lib/supabase/test-connection', () => {
  const originalEnv = process.env
  const originalConsole = console

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    // Mock console methods
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    process.env = originalEnv
    console.log = originalConsole.log
    console.error = originalConsole.error
  })

  it('should return success when connection is successful', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [{ count: 5 }],
            error: null
          })
        })
      })
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: true,
      data: [{ count: 5 }]
    })
    expect(console.log).toHaveBeenCalledWith('Testing Supabase connection...')
    expect(console.log).toHaveBeenCalledWith('Supabase URL:', 'Set')
    expect(console.log).toHaveBeenCalledWith('Supabase Key:', 'Set')
    expect(console.log).toHaveBeenCalledWith('✅ Supabase connection successful!')
  })

  it('should return error when URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Missing environment variables. Please check your .env.local file.'
    })
    expect(console.log).toHaveBeenCalledWith('Supabase URL:', 'Missing')
    expect(console.log).toHaveBeenCalledWith('Supabase Key:', 'Set')
    expect(console.error).toHaveBeenCalledWith('Connection test failed:', expect.any(Error))
  })

  it('should return error when key is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Missing environment variables. Please check your .env.local file.'
    })
    expect(console.log).toHaveBeenCalledWith('Supabase URL:', 'Set')
    expect(console.log).toHaveBeenCalledWith('Supabase Key:', 'Missing')
  })

  it('should return error when both env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Missing environment variables. Please check your .env.local file.'
    })
    expect(console.log).toHaveBeenCalledWith('Supabase URL:', 'Missing')
    expect(console.log).toHaveBeenCalledWith('Supabase Key:', 'Missing')
  })

  it('should return error when env vars are empty strings', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Missing environment variables. Please check your .env.local file.'
    })
    expect(console.log).toHaveBeenCalledWith('Supabase URL:', 'Missing')
    expect(console.log).toHaveBeenCalledWith('Supabase Key:', 'Missing')
  })

  it('should return error when Supabase query fails', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const supabaseError = {
      message: 'Table does not exist',
      code: '42P01'
    }

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError
          })
        })
      })
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Table does not exist'
    })
    expect(console.error).toHaveBeenCalledWith('Supabase connection error:', supabaseError)
  })

  it('should handle unexpected errors', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const unexpectedError = new Error('Network error')

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(unexpectedError)
        })
      })
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Network error'
    })
    expect(console.error).toHaveBeenCalledWith('Connection test failed:', unexpectedError)
  })

  it('should handle non-Error objects', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue('String error')
        })
      })
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    const result = await testSupabaseConnection()

    expect(result).toEqual({
      success: false,
      error: 'Unknown error'
    })
  })

  it('should query apartments table correctly', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient as unknown as SupabaseClient)

    await testSupabaseConnection()

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('apartments')
    expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('count')
    expect(mockSupabaseClient.from().select().limit).toHaveBeenCalledWith(1)
  })
})