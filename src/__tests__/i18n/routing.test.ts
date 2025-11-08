// Mock next-intl/routing
jest.mock('next-intl/routing', () => ({
  defineRouting: jest.fn((config) => config)
}))

// Mock next-intl/navigation
jest.mock('next-intl/navigation', () => ({
  createNavigation: jest.fn(() => ({
    Link: jest.fn(),
    redirect: jest.fn(),
    usePathname: jest.fn(),
    useRouter: jest.fn()
  }))
}))

import { routing, Link, redirect, usePathname, useRouter } from '@/i18n/routing'

// const mockDefineRouting = defineRouting as jest.MockedFunction<typeof defineRouting>

describe('i18n/routing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export routing configuration', () => {
    expect(routing).toBeDefined()
  })

  it('should configure locales correctly', () => {
    expect(routing.locales).toEqual(['en', 'es'])
    expect(routing.locales).toHaveLength(2)
    expect(routing.locales).toContain('en')
    expect(routing.locales).toContain('es')
  })

  it('should set default locale to Spanish', () => {
    expect(routing.defaultLocale).toBe('es')
  })

  it('should set locale prefix to always', () => {
    expect(routing.localePrefix).toBe('always')
  })

  it('should have expected routing configuration values', () => {
    // Test the actual configuration values rather than internal implementation
    expect(routing).toHaveProperty('locales', ['en', 'es'])
    expect(routing).toHaveProperty('defaultLocale', 'es')
    expect(routing).toHaveProperty('localePrefix', 'always')
  })

  it('should have proper routing configuration structure', () => {
    expect(routing).toEqual({
      locales: ['en', 'es'],
      defaultLocale: 'es',
      localePrefix: 'always'
    })
  })

  it('should support both English and Spanish locales', () => {
    const supportedLocales = routing.locales

    expect(supportedLocales).toContain('en')
    expect(supportedLocales).toContain('es')
    expect(supportedLocales.filter(locale => locale === 'en')).toHaveLength(1)
    expect(supportedLocales.filter(locale => locale === 'es')).toHaveLength(1)
  })

  it('should not contain unsupported locales', () => {
    const unsupportedLocales = ['fr', 'de', 'it', 'pt']

    unsupportedLocales.forEach(locale => {
      expect(routing.locales).not.toContain(locale)
    })
  })

  describe('navigation exports', () => {
    it('should export Link component', () => {
      expect(Link).toBeDefined()
      expect(typeof Link).toBe('function')
    })

    it('should export redirect function', () => {
      expect(redirect).toBeDefined()
      expect(typeof redirect).toBe('function')
    })

    it('should export usePathname hook', () => {
      expect(usePathname).toBeDefined()
      expect(typeof usePathname).toBe('function')
    })

    it('should export useRouter hook', () => {
      expect(useRouter).toBeDefined()
      expect(typeof useRouter).toBe('function')
    })
  })
})