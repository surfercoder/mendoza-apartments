import { redirect } from 'next/navigation'
import RedirectPage from '@/app/apartment/[id]/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('RedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to Spanish locale with apartment id', async () => {
    // Mock redirect to throw an error to simulate Next.js redirect behavior
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const params = Promise.resolve({ id: 'apt-123' })

    await expect(RedirectPage({ params })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/es/apartment/apt-123')
  })

  it('should handle different apartment ids', async () => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const params = Promise.resolve({ id: 'another-apt-456' })

    await expect(RedirectPage({ params })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/es/apartment/another-apt-456')
  })
})
