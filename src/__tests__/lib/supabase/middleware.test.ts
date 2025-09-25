import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}))

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn()
  }
}))

// Mock the utils
jest.mock('@/lib/utils', () => ({
  hasEnvVars: true,
  cn: jest.fn()
}))

import { createServerClient } from '@supabase/ssr'

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>
// const mockHasEnvVars = hasEnvVars as jest.MockedFunction<typeof hasEnvVars>

// Types for mocks - keeping only what we need

describe('lib/supabase/middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const createMockRequest = (pathname: string = '/', cookies: Record<string, string> = {}) => {
    const mockCookies = {
      getAll: jest.fn().mockReturnValue(
        Object.entries(cookies).map(([name, value]) => ({ name, value }))
      ),
      set: jest.fn()
    }

    const mockClone = jest.fn().mockReturnValue({ pathname })
    
    return {
      nextUrl: { pathname, clone: mockClone },
      cookies: mockCookies,
      url: `https://example.com${pathname}`
    } as unknown as NextRequest
  }

  const createMockSupabaseClient = (user: Record<string, unknown> | null = null) => {
    return {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } })
      }
    }
  }

  it('should allow authenticated user to access any route', async () => {
    const mockRequest = createMockRequest('/dashboard')
    const mockResponse = { id: 'mock-response' }
    const mockSupabaseClient = createMockSupabaseClient({ id: 'user-123' })

    mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    const result = await updateSession(mockRequest)

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    expect(result).toBe(mockResponse)
    expect(mockNextResponse.redirect).not.toHaveBeenCalled()
  })

  it('should allow unauthenticated user to access home page', async () => {
    const mockRequest = createMockRequest('/')
    const mockResponse = { id: 'mock-response' }
    const mockSupabaseClient = createMockSupabaseClient(null)

    mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    const result = await updateSession(mockRequest)

    expect(result).toBe(mockResponse)
    expect(mockNextResponse.redirect).not.toHaveBeenCalled()
  })

  it('should allow unauthenticated user to access login routes', async () => {
    const loginRoutes = ['/login', '/auth/login', '/auth/sign-up', '/auth/forgot-password']

    for (const route of loginRoutes) {
      const mockRequest = createMockRequest(route)
      const mockResponse = { id: 'mock-response' }
      const mockSupabaseClient = createMockSupabaseClient(null)

      mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

      const result = await updateSession(mockRequest)

      expect(result).toBe(mockResponse)
      expect(mockNextResponse.redirect).not.toHaveBeenCalled()
    }
  })

  it('should allow unauthenticated user to access auth routes', async () => {
    const authRoutes = ['/auth/confirm', '/auth/error', '/auth/signout']

    for (const route of authRoutes) {
      const mockRequest = createMockRequest(route)
      const mockResponse = { id: 'mock-response' }
      const mockSupabaseClient = createMockSupabaseClient(null)

      mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

      const result = await updateSession(mockRequest)

      expect(result).toBe(mockResponse)
      expect(mockNextResponse.redirect).not.toHaveBeenCalled()
    }
  })

  it('should redirect unauthenticated user from protected routes', async () => {
    const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings']

    for (const route of protectedRoutes) {
      const mockRequest = createMockRequest(route)
      const mockResponse = { id: 'mock-response' }
      const mockRedirectResponse = { id: 'redirect-response' }
      const mockSupabaseClient = createMockSupabaseClient(null)

      mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as unknown as NextResponse)
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

      const clonedUrl = { pathname: '/auth/login' }
      ;(mockRequest.nextUrl.clone as jest.Mock).mockReturnValue(clonedUrl)

      const result = await updateSession(mockRequest)

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(clonedUrl)
      expect(result).toBe(mockRedirectResponse)
    }
  })

  it('should configure Supabase client with correct cookies', async () => {
    const mockRequest = createMockRequest('/', { session: 'session-value', refresh: 'refresh-value' })
    const mockResponse = { id: 'mock-response', cookies: { set: jest.fn(), getAll: jest.fn() } }
    const mockSupabaseClient = createMockSupabaseClient({ id: 'user-123' })

    mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    let cookiesConfig: Record<string, unknown> = {}
    mockCreateServerClient.mockImplementation((url, key, options) => {
      cookiesConfig = options.cookies
      return mockSupabaseClient as unknown
    })

    await updateSession(mockRequest)

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

    // Test getAll function
    const allCookies = (cookiesConfig.getAll as () => unknown)()
    expect(mockRequest.cookies.getAll).toHaveBeenCalled()
    expect(allCookies).toEqual([
      { name: 'session', value: 'session-value' },
      { name: 'refresh', value: 'refresh-value' }
    ])
  })

  it('should handle setAll cookies correctly', async () => {
    const mockRequest = createMockRequest()
    const mockResponse = {
      id: 'mock-response',
      cookies: {
        set: jest.fn(),
        getAll: jest.fn()
      }
    }
    const mockSupabaseClient = createMockSupabaseClient({ id: 'user-123' })

    mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    let cookiesConfig: Record<string, unknown> = {}
    mockCreateServerClient.mockImplementation((url, key, options) => {
      cookiesConfig = options.cookies
      return mockSupabaseClient as unknown
    })

    await updateSession(mockRequest)

    // Test setAll function
    const cookiesToSet = [
      { name: 'session', value: 'new-session' },
      { name: 'refresh', value: 'new-refresh', options: { httpOnly: true } }
    ]

    ;(cookiesConfig.setAll as (cookies: unknown[]) => void)(cookiesToSet)

    expect(mockRequest.cookies.set).toHaveBeenCalledWith('session', 'new-session')
    expect(mockRequest.cookies.set).toHaveBeenCalledWith('refresh', 'new-refresh')
    expect(mockNextResponse.next).toHaveBeenCalledWith({ request: mockRequest })
    expect(mockResponse.cookies.set).toHaveBeenCalledWith('session', 'new-session', undefined)
    expect(mockResponse.cookies.set).toHaveBeenCalledWith('refresh', 'new-refresh', { httpOnly: true })
  })

  it('should handle auth.getUser errors gracefully', async () => {
    const mockRequest = createMockRequest('/dashboard')
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockRejectedValue(new Error('Auth error'))
      }
    }

    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    await expect(updateSession(mockRequest)).rejects.toThrow('Auth error')
  })

  it('should handle URL cloning for redirects', async () => {
    const mockRequest = createMockRequest('/protected')
    const mockSupabaseClient = createMockSupabaseClient(null)
    const mockClonedUrl = { pathname: '/protected' }
    const mockRedirectResponse = { id: 'redirect-response' }

    ;(mockRequest.nextUrl.clone as jest.Mock).mockReturnValue(mockClonedUrl)
    mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as unknown as NextResponse)
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as unknown)

    const result = await updateSession(mockRequest)

    expect(mockRequest.nextUrl.clone).toHaveBeenCalled()
    expect(mockClonedUrl.pathname).toBe('/auth/login')
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(mockClonedUrl)
    expect(result).toBe(mockRedirectResponse)
  })
})