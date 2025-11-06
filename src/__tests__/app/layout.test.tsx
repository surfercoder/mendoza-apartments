import { render } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

// Mock CSS import
jest.mock('@/app/globals.css', () => ({}))

describe('RootLayout', () => {
  it('renders children directly', () => {
    const testChild = <div data-testid="test-children">Test Content</div>
    
    const layout = RootLayout({
      children: testChild
    })

    const { getByTestId } = render(layout)
    expect(getByTestId('test-children')).toBeInTheDocument()
  })

  describe('metadata', () => {
    it('has correct default metadata', () => {
      expect(metadata.title).toBe('Mendoza Apartments - Beautiful Stays in Argentina')
      expect(metadata.description).toBe('Discover beautiful apartments in Mendoza, Argentina. From cozy downtown spaces to luxury penthouses with mountain views.')
    })

    it('has correct metadataBase URL', async () => {
      const originalUrl = process.env.VERCEL_URL

      try {
        // Test with VERCEL_URL
        process.env.VERCEL_URL = 'myapp.vercel.app'
        jest.resetModules()
        const layoutWithVercel = await import('@/app/layout')
        expect(layoutWithVercel.metadata.metadataBase?.toString()).toBe('https://myapp.vercel.app/')

        // Test without VERCEL_URL
        delete process.env.VERCEL_URL
        jest.resetModules()
        const layoutWithoutVercel = await import('@/app/layout')
        expect(layoutWithoutVercel.metadata.metadataBase?.toString()).toBe('http://localhost:3000/')
      } finally {
        // Restore original
        if (originalUrl) {
          process.env.VERCEL_URL = originalUrl
        } else {
          delete process.env.VERCEL_URL
        }
        jest.resetModules()
      }
    })
  })
})