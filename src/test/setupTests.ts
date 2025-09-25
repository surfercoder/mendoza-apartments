import '@testing-library/jest-dom'

// Extend global types
declare global {
  var mockTranslations: jest.Mock
  var mockUseForm: jest.Mock
}

// Global mocks for JSdom compatibility
Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  value: jest.fn(),
  writable: true,
  configurable: true
})

// Mock window.location if not already mocked
if (!window.location.origin) {
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://test.com' },
    writable: true,
    configurable: true
  })
}

// Global mock for next-intl when not already mocked
global.mockTranslations = global.mockTranslations || jest.fn((key: string) => key)

// Global mock for react-hook-form when not mocked
global.mockUseForm = global.mockUseForm || jest.fn(() => ({
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
