import { createClient } from '@/lib/supabase/server'

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>
const mockCookies = cookies as jest.MockedFunction<typeof cookies>

// Types for mocks - removed unused types

describe('lib/supabase/server', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should create a server client with environment variables and cookies', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' }
      ]),
      set: jest.fn()
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient = { auth: {}, from: jest.fn() }
    mockCreateServerClient.mockReturnValue(mockClient as unknown)

    const client = await createClient()

    expect(mockCookies).toHaveBeenCalled()
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function)
        })
      })
    )
    expect(client).toBe(mockClient)
  })

  it('should configure cookies correctly', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([
        { name: 'session', value: 'session-value' },
        { name: 'refresh', value: 'refresh-value' }
      ]),
      set: jest.fn()
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient = { auth: {}, from: jest.fn() }
    let cookiesConfig: Record<string, unknown> = {}
    mockCreateServerClient.mockImplementation((url, key, options) => {
      cookiesConfig = options.cookies
      return mockClient as unknown
    })

    await createClient()

    // Test getAll function
    const allCookies = (cookiesConfig.getAll as () => unknown)()
    expect(mockCookieStore.getAll).toHaveBeenCalled()
    expect(allCookies).toEqual([
      { name: 'session', value: 'session-value' },
      { name: 'refresh', value: 'refresh-value' }
    ])
  })

  it('should handle setAll cookies correctly', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn()
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient = { auth: {}, from: jest.fn() }
    let cookiesConfig: Record<string, unknown> = {}
    mockCreateServerClient.mockImplementation((url, key, options) => {
      cookiesConfig = options.cookies
      return mockClient as unknown
    })

    await createClient()

    // Test setAll function
    const cookiesToSet = [
      { name: 'session', value: 'new-session', options: { httpOnly: true } },
      { name: 'refresh', value: 'new-refresh', options: { secure: true } }
    ]

    ;(cookiesConfig.setAll as (cookies: unknown[]) => void)(cookiesToSet)

    expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'new-session', { httpOnly: true })
    expect(mockCookieStore.set).toHaveBeenCalledWith('refresh', 'new-refresh', { secure: true })
  })

  it('should handle setAll cookies error gracefully', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn().mockImplementation(() => {
        throw new Error('Cookie setting failed')
      })
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient = { auth: {}, from: jest.fn() }
    let cookiesConfig: Record<string, unknown> = {}
    mockCreateServerClient.mockImplementation((url, key, options) => {
      cookiesConfig = options.cookies
      return mockClient as unknown
    })

    await createClient()

    // Test setAll function with error
    const cookiesToSet = [
      { name: 'session', value: 'new-session', options: { httpOnly: true } }
    ]

    // Should not throw an error
    expect(() => (cookiesConfig.setAll as (cookies: unknown[]) => void)(cookiesToSet)).not.toThrow()
  })

  it('should handle missing environment variables', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn()
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient = { auth: {}, from: jest.fn() }
    mockCreateServerClient.mockReturnValue(mockClient as unknown)

    const client = await createClient()

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      undefined,
      undefined,
      expect.any(Object)
    )
    expect(client).toBe(mockClient)
  })

  it('should handle cookies promise rejection', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    mockCookies.mockRejectedValue(new Error('Cookies not available'))

    await expect(createClient()).rejects.toThrow('Cookies not available')
  })

  it('should return different clients on multiple calls', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockCookieStore = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn()
    }
    mockCookies.mockResolvedValue(mockCookieStore as any)

    const mockClient1 = { id: 1 }
    const mockClient2 = { id: 2 }

    mockCreateServerClient
      .mockReturnValueOnce(mockClient1 as unknown)
      .mockReturnValueOnce(mockClient2 as unknown)

    const client1 = await createClient()
    const client2 = await createClient()

    expect(mockCreateServerClient).toHaveBeenCalledTimes(2)
    expect(client1).toBe(mockClient1)
    expect(client2).toBe(mockClient2)
  })
})