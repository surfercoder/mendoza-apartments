import { redirect } from 'next/navigation'
import RootPage from '@/app/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('RootPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to /en', () => {
    // Mock redirect to throw an error to simulate Next.js redirect behavior
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    expect(() => RootPage()).toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/en')
  })
})
