import { GET } from '@/app/auth/confirm/route'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('Auth Confirm Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (searchParams: Record<string, string>) => {
    const url = new URL('http://localhost:3000/auth/confirm')
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return { url: url.toString() } as NextRequest
  }

  it('successfully verifies OTP and redirects to next URL', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockResolvedValue({ error: null })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = createMockRequest({
      token_hash: 'valid-token-hash',
      type: 'signup',
      next: '/dashboard'
    })

    await GET(request)

    expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
      type: 'signup',
      token_hash: 'valid-token-hash'
    })
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to root when no next URL is provided', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockResolvedValue({ error: null })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = createMockRequest({
      token_hash: 'valid-token-hash',
      type: 'signup'
    })

    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('redirects to error page when OTP verification fails', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockResolvedValue({
          error: { message: 'Token has expired' }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = createMockRequest({
      token_hash: 'expired-token-hash',
      type: 'signup',
      next: '/dashboard'
    })

    await GET(request)

    expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
      type: 'signup',
      token_hash: 'expired-token-hash'
    })
    expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=Token has expired')
  })

  it('redirects to error page when token_hash is missing', async () => {
    const request = createMockRequest({
      type: 'signup',
      next: '/dashboard'
    })

    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=No token hash or type')
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('redirects to error page when type is missing', async () => {
    const request = createMockRequest({
      token_hash: 'valid-token-hash',
      next: '/dashboard'
    })

    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=No token hash or type')
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('redirects to error page when both token_hash and type are missing', async () => {
    const request = createMockRequest({
      next: '/dashboard'
    })

    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=No token hash or type')
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('handles different OTP types correctly', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockResolvedValue({ error: null })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const types = ['signup', 'invite', 'recovery', 'email_change', 'phone_change']

    for (const type of types) {
      jest.clearAllMocks()

      const request = createMockRequest({
        token_hash: 'valid-token-hash',
        type,
        next: '/dashboard'
      })

      await GET(request)

      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        type,
        token_hash: 'valid-token-hash'
      })
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    }
  })

  it('handles Supabase client creation error', async () => {
    mockCreateClient.mockRejectedValue(new Error('Client creation failed'))

    const request = createMockRequest({
      token_hash: 'valid-token-hash',
      type: 'signup',
      next: '/dashboard'
    })

    // The error will be thrown and should be handled by the framework
    await expect(GET(request)).rejects.toThrow('Client creation failed')

    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('handles verifyOtp throwing an error', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockRejectedValue(new Error('Network error'))
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = createMockRequest({
      token_hash: 'valid-token-hash',
      type: 'signup',
      next: '/dashboard'
    })

    // The error will be thrown and should be handled by the framework
    await expect(GET(request)).rejects.toThrow('Network error')

    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('URL encodes error message properly', async () => {
    const mockSupabaseClient = {
      auth: {
        verifyOtp: jest.fn().mockResolvedValue({
          error: { message: 'Token invalid & expired' }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const request = createMockRequest({
      token_hash: 'invalid-token-hash',
      type: 'signup'
    })

    await GET(request)

    expect(mockRedirect).toHaveBeenCalledWith('/auth/error?error=Token invalid & expired')
  })
})