export {}
// Only load DOM-specific matchers in jsdom environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@testing-library/jest-dom')
}

// Extend global types
declare global {
  var mockTranslations: jest.Mock
  var mockUseForm: jest.Mock
}

// Global mocks for JSdom compatibility
if (typeof HTMLFormElement !== 'undefined') {
  Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
    value: jest.fn(),
    writable: true,
    configurable: true
  })
}

// Mock window.location if not already mocked (only in jsdom environment)
if (typeof window !== 'undefined' && !window.location.origin) {
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://test.com' },
    writable: true,
    configurable: true
  })
}

// Global mock for next-intl when not already mocked
const g = globalThis as unknown as { mockTranslations?: jest.Mock; mockUseForm?: jest.Mock }
g.mockTranslations = g.mockTranslations || jest.fn((key: string) => key)

// Global mock for react-hook-form when not mocked
g.mockUseForm = g.mockUseForm || jest.fn(() => ({
  register: jest.fn(),
  handleSubmit: jest.fn((onValid) => jest.fn((e) => {
    e?.preventDefault?.()
    onValid?.({})
  })),
  formState: { errors: {}, isSubmitting: false },
  watch: jest.fn(),
  setValue: jest.fn(),
  reset: jest.fn()
}))

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
