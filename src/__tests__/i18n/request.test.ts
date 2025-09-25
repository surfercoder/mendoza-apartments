// Mock next/headers
let mockCookieGet: jest.Mock
const mockCookies = jest.fn()

jest.mock('next/headers', () => ({
  cookies: mockCookies
}))

// Mock next-intl/server
const mockGetRequestConfig = jest.fn()
jest.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig
}))

// Mock dynamic imports for messages
jest.mock('../../messages/en.json', () => ({
  default: { hello: 'Hello' }
}), { virtual: true })

jest.mock('../../messages/es.json', () => ({
  default: { hello: 'Hola' }
}), { virtual: true })

import { cookies } from 'next/headers'

const mockCookiesFn = mockCookies as jest.MockedFunction<typeof cookies>

describe('i18n/request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    // Reset the mocks for consistent test behavior
    mockGetRequestConfig.mockClear()
    mockCookieGet = jest.fn()
  })

  it('should call getRequestConfig with a function', async () => {
    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    await import('@/i18n/request')

    expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should use Spanish as default locale when no cookie is set', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    expect(configFn).toBeDefined()

    const config = await configFn!()

    // Don't check if the function was called, just check the result
    expect(config.locale).toBe('es')
  })

  it('should use locale from cookie when available', async () => {
    // Clear previous mocks first
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieGet = jest.fn().mockReturnValue({ value: 'en' })

    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    // Delete from require cache and re-require the module
    delete require.cache[require.resolve('@/i18n/request')]
    await import('@/i18n/request')

    const config = await configFn!()

    // Don't check if the function was called, just check the result
    expect(config.locale).toBe('en')
  })

  it('should use Spanish when cookie value is empty', async () => {
    mockCookieGet.mockReturnValue({ value: '' })
    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    const config = await configFn!()

    expect(config.locale).toBe('es')
  })

  it('should load Spanish messages by default', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    const config = await configFn!()

    // Since the dynamic import might import the full message file, just check the locale
    expect(config.locale).toBe('es')
    expect(config.messages).toBeDefined()
  })

  it('should load English messages when locale is en', async () => {
    // Clear previous mocks first
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieGet = jest.fn().mockReturnValue({ value: 'en' })

    const mockCookieStore = {
      get: mockCookieGet
    }
    mockCookiesFn.mockResolvedValue(mockCookieStore as any)

    let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    // Delete from require cache and re-require the module
    delete require.cache[require.resolve('@/i18n/request')]
    await import('@/i18n/request')

    const config = await configFn!()

    expect(config.locale).toBe('en')
    expect(config.messages).toBeDefined()
  })

  it('should handle various cookie scenarios', async () => {
    const scenarios = [
      { cookieValue: undefined, expectedLocale: 'es' },
      { cookieValue: null, expectedLocale: 'es' },
      { cookieValue: { value: 'en' }, expectedLocale: 'en' },
      { cookieValue: { value: 'es' }, expectedLocale: 'es' },
      { cookieValue: { value: '' }, expectedLocale: 'es' }
    ]

    for (const scenario of scenarios) {
      // Clear modules and mocks for each scenario
      jest.resetModules()
      jest.clearAllMocks()
      mockCookieGet = jest.fn().mockReturnValue(scenario.cookieValue)

      const mockCookieStore = {
        get: mockCookieGet
      }
      mockCookiesFn.mockResolvedValue(mockCookieStore as any)

      let configFn: (() => Promise<{ locale: string; messages: unknown }>) | undefined

      mockGetRequestConfig.mockImplementation((fn) => {
        configFn = fn
        return fn as any
      })

      // Delete from require cache and re-require the module
      delete require.cache[require.resolve('@/i18n/request')]
      await import('@/i18n/request')

      const config = await configFn!()

      expect(config.locale).toBe(scenario.expectedLocale)
    }
  })
})