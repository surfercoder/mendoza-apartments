import { POST } from '@/app/auth/signout/route'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn()
  }
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('Auth Signout Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('successfully signs out user and redirects to home', async () => {
    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({})
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const mockRedirectResponse = { status: 302 }
    mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any)

    const mockRequest = {
      url: 'http://localhost:3000/auth/signout'
    } as NextRequest

    const result = await POST(mockRequest)

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    expect(mockNextResponse.redirect).toHaveBeenCalledWith(
      new URL('/', 'http://localhost:3000/auth/signout')
    )
    expect(result).toBe(mockRedirectResponse)
  })

  it('handles Supabase client creation error', async () => {
    mockCreateClient.mockRejectedValue(new Error('Client creation failed'))

    const mockRequest = {
      url: 'http://localhost:3000/auth/signout'
    } as NextRequest

    await expect(POST(mockRequest)).rejects.toThrow('Client creation failed')

    expect(mockNextResponse.redirect).not.toHaveBeenCalled()
  })

  it('handles signOut error gracefully', async () => {
    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockRejectedValue(new Error('Sign out failed'))
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const mockRequest = {
      url: 'http://localhost:3000/auth/signout'
    } as NextRequest

    // The error should propagate
    await expect(POST(mockRequest)).rejects.toThrow('Sign out failed')

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    expect(mockNextResponse.redirect).not.toHaveBeenCalled()
  })

  it('constructs redirect URL correctly with different base URLs', async () => {
    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({})
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const mockRedirectResponse = { status: 302 }
    mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any)

    const mockRequest = {
      url: 'https://example.com/auth/signout'
    } as NextRequest

    await POST(mockRequest)

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(
      new URL('/', 'https://example.com/auth/signout')
    )
  })

  it('works with localhost with port', async () => {
    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({})
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const mockRedirectResponse = { status: 302 }
    mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any)

    const mockRequest = {
      url: 'http://localhost:3001/auth/signout'
    } as NextRequest

    await POST(mockRequest)

    expect(mockNextResponse.redirect).toHaveBeenCalledWith(
      new URL('/', 'http://localhost:3001/auth/signout')
    )
  })

  it('signOut is called exactly once', async () => {
    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({})
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const mockRedirectResponse = { status: 302 }
    mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any)

    const mockRequest = {
      url: 'http://localhost:3000/auth/signout'
    } as NextRequest

    await POST(mockRequest)

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1)
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledWith()
  })
})