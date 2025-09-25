import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn()
}))

import { createBrowserClient } from '@supabase/ssr'

const mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<typeof createBrowserClient>

// Type for mock Supabase client
type MockSupabaseClient = Partial<SupabaseClient>

describe('lib/supabase/client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should create a browser client with environment variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockClient: MockSupabaseClient = { auth: {} as any, from: jest.fn() }
    mockCreateBrowserClient.mockReturnValue(mockClient as SupabaseClient)

    const client = createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
    expect(client).toBe(mockClient)
  })

  it('should handle missing SUPABASE_URL', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockClient: MockSupabaseClient = { auth: {} as any, from: jest.fn() }
    mockCreateBrowserClient.mockReturnValue(mockClient as SupabaseClient)

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      undefined,
      'test-anon-key'
    )
  })

  it('should handle missing SUPABASE_ANON_KEY', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const mockClient: MockSupabaseClient = { auth: {} as any, from: jest.fn() }
    mockCreateBrowserClient.mockReturnValue(mockClient as SupabaseClient)

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      undefined
    )
  })

  it('should handle missing environment variables', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const mockClient: MockSupabaseClient = { auth: {} as any, from: jest.fn() }
    mockCreateBrowserClient.mockReturnValue(mockClient as SupabaseClient)

    createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      undefined,
      undefined
    )
  })

  it('should return the client created by createBrowserClient', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockClient: MockSupabaseClient = {
      auth: { signIn: jest.fn(), signOut: jest.fn() } as any,
      from: jest.fn(),
      storage: { from: jest.fn() } as any
    }
    mockCreateBrowserClient.mockReturnValue(mockClient as SupabaseClient)

    const client = createClient()

    expect(client).toBe(mockClient)
    expect(client.auth).toBeDefined()
    expect(client.from).toBeDefined()
    expect(client.storage).toBeDefined()
  })

  it('should be callable multiple times', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockClient1: MockSupabaseClient = { id: 1 } as any
    const mockClient2: MockSupabaseClient = { id: 2 } as any

    mockCreateBrowserClient
      .mockReturnValueOnce(mockClient1 as SupabaseClient)
      .mockReturnValueOnce(mockClient2 as SupabaseClient)

    const client1 = createClient()
    const client2 = createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2)
    expect(client1).toBe(mockClient1)
    expect(client2).toBe(mockClient2)
  })
})