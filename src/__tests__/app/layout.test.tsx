import { render } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
    className: 'geist-sans'
  }))
}))

// Mock RootProviders
jest.mock('@/components/root-providers', () => ({
  RootProviders: ({ children, locale }: { children: React.ReactNode, locale: string }) => (
    <div data-testid="root-providers" data-locale={locale}>
      {children}
    </div>
  )
}))

// Mock CSS import
jest.mock('@/app/globals.css', () => ({}))

// Mock message imports
jest.mock('../../../messages/es.json', () => ({
  default: { test: 'Spanish message' }
}))

jest.mock('../../../messages/en.json', () => ({
  default: { test: 'English message' }
}))

import { cookies } from 'next/headers'

const mockCookies = cookies as jest.MockedFunction<typeof cookies>

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children within RootProviders with default locale', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined)
    } as any)

    const layout = await RootLayout({
      children: <div data-testid="test-children">Test Content</div>
    })

    // Extract body content for testing
    const bodyContent = layout.props.children.props.children
    const { getByTestId } = render(bodyContent)

    expect(getByTestId('root-providers')).toBeInTheDocument()
    expect(getByTestId('root-providers')).toHaveAttribute('data-locale', 'es')
    expect(getByTestId('test-children')).toBeInTheDocument()
  })

  it('uses locale from cookies when available', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'en' })
    } as any)

    const layout = await RootLayout({
      children: <div data-testid="test-children">Test Content</div>
    })

    // Extract body content for testing
    const bodyContent = layout.props.children.props.children
    const { getByTestId } = render(bodyContent)

    expect(getByTestId('root-providers')).toHaveAttribute('data-locale', 'en')
  })

  it('renders html with correct attributes', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'es' })
    } as any)

    const layout = await RootLayout({
      children: <div>Test Content</div>
    })

    // Test the structure without rendering the html element
    expect(layout.type).toBe('html')
    expect(layout.props.lang).toBe('es')
    expect(layout.props.suppressHydrationWarning).toBe(true)
  })

  it('applies geist font className to body', async () => {
    mockCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined)
    } as any)

    const layout = await RootLayout({
      children: <div>Test Content</div>
    })

    // Test body element props
    const bodyElement = layout.props.children
    expect(bodyElement.type).toBe('body')
    expect(bodyElement.props.className).toContain('geist-sans')
    expect(bodyElement.props.className).toContain('antialiased')
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

  it('handles cookie error gracefully', async () => {
    mockCookies.mockResolvedValue({
      get: null
    } as any)

    const layout = await RootLayout({
      children: <div data-testid="test-children">Test Content</div>
    })

    // Extract body content for testing
    const bodyContent = layout.props.children.props.children
    const { getByTestId } = render(bodyContent)

    expect(getByTestId('root-providers')).toHaveAttribute('data-locale', 'es')
  })
})