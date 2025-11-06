// Mock next-intl/server
const mockGetRequestConfig = jest.fn()
jest.mock('next-intl/server', () => ({
  getRequestConfig: mockGetRequestConfig
}))

// Mock next-intl/routing
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'es'
  }
}))

// Mock dynamic imports for messages
jest.mock('../../messages/en.json', () => ({
  default: { hello: 'Hello' }
}), { virtual: true })

jest.mock('../../messages/es.json', () => ({
  default: { hello: 'Hola' }
}), { virtual: true })

describe('i18n/request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    mockGetRequestConfig.mockClear()
  })

  it('should call getRequestConfig with a function', async () => {
    await import('@/i18n/request')
    expect(mockGetRequestConfig).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should use Spanish as default locale when requestLocale is undefined', async () => {
    let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    expect(configFn).toBeDefined()

    const config = await configFn!({ requestLocale: Promise.resolve(undefined) })

    expect(config.locale).toBe('es')
  })

  it('should use locale from requestLocale when available', async () => {
    jest.resetModules()
    jest.clearAllMocks()

    let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    delete require.cache[require.resolve('@/i18n/request')]
    await import('@/i18n/request')

    const config = await configFn!({ requestLocale: Promise.resolve('en') })

    expect(config.locale).toBe('en')
  })

  it('should use Spanish when requestLocale is invalid', async () => {
    let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    const config = await configFn!({ requestLocale: Promise.resolve('invalid') })

    expect(config.locale).toBe('es')
  })

  it('should load Spanish messages by default', async () => {
    let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    await import('@/i18n/request')

    const config = await configFn!({ requestLocale: Promise.resolve(undefined) })

    expect(config.locale).toBe('es')
    expect(config.messages).toBeDefined()
  })

  it('should load English messages when locale is en', async () => {
    jest.resetModules()
    jest.clearAllMocks()

    let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

    mockGetRequestConfig.mockImplementation((fn) => {
      configFn = fn
      return fn as any
    })

    delete require.cache[require.resolve('@/i18n/request')]
    await import('@/i18n/request')

    const config = await configFn!({ requestLocale: Promise.resolve('en') })

    expect(config.locale).toBe('en')
    expect(config.messages).toBeDefined()
  })

  it('should handle various requestLocale scenarios', async () => {
    const scenarios = [
      { requestLocale: undefined, expectedLocale: 'es' },
      { requestLocale: 'en', expectedLocale: 'en' },
      { requestLocale: 'es', expectedLocale: 'es' },
      { requestLocale: '', expectedLocale: 'es' },
      { requestLocale: 'invalid', expectedLocale: 'es' }
    ]

    for (const scenario of scenarios) {
      jest.resetModules()
      jest.clearAllMocks()

      let configFn: ((params: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>) | undefined

      mockGetRequestConfig.mockImplementation((fn) => {
        configFn = fn
        return fn as any
      })

      delete require.cache[require.resolve('@/i18n/request')]
      await import('@/i18n/request')

      const config = await configFn!({ requestLocale: Promise.resolve(scenario.requestLocale as any) })

      expect(config.locale).toBe(scenario.expectedLocale)
    }
  })
})