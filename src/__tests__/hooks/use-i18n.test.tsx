import { renderHook } from '@testing-library/react'
import { useI18n } from '@/hooks/use-i18n'

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
  useTranslations: jest.fn()
}))

import { useLocale, useTranslations } from 'next-intl'

const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>
const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>

describe('hooks/use-i18n', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return translation function and locale', () => {
    const mockT = Object.assign(
      jest.fn((key: string) => `translated-${key}`),
      {
        rich: jest.fn(),
        markup: jest.fn(),
        raw: jest.fn(),
        has: jest.fn()
      }
    )
    mockUseTranslations.mockReturnValue(mockT as any)
    mockUseLocale.mockReturnValue('en')

    const { result } = renderHook(() => useI18n())
    expect(result.current.t).toBe(mockT)
    expect(result.current.locale).toBe('en')
  })

  it('should pass namespace to useTranslations', () => {
    const mockT = Object.assign(jest.fn(), { rich: jest.fn(), markup: jest.fn(), raw: jest.fn(), has: jest.fn() })
    mockUseTranslations.mockReturnValue(mockT as any)
    mockUseLocale.mockReturnValue('es')

    renderHook(() => useI18n('common'))

    expect(mockUseTranslations).toHaveBeenCalledWith('common')
  })

  it('should use default namespace when none provided', () => {
    const mockT = Object.assign(jest.fn(), { rich: jest.fn(), markup: jest.fn(), raw: jest.fn(), has: jest.fn() })
    mockUseTranslations.mockReturnValue(mockT as any)
    mockUseLocale.mockReturnValue('es')

    renderHook(() => useI18n())

    expect(mockUseTranslations).toHaveBeenCalledWith(undefined)
  })

  it('should handle different locales', () => {
    const mockT = Object.assign(
      jest.fn((key: string) => `es-${key}`),
      { rich: jest.fn(), markup: jest.fn(), raw: jest.fn(), has: jest.fn() }
    )
    mockUseTranslations.mockReturnValue(mockT as any)
    mockUseLocale.mockReturnValue('es')

    const { result } = renderHook(() => useI18n())

    expect(result.current.locale).toBe('es')
  })

  it('should handle multiple calls with different namespaces', () => {
    const mockT1 = Object.assign(jest.fn(), { rich: jest.fn(), markup: jest.fn(), raw: jest.fn(), has: jest.fn() })
    const mockT2 = Object.assign(jest.fn(), { rich: jest.fn(), markup: jest.fn(), raw: jest.fn(), has: jest.fn() })

    // First call with namespace 'home'
    mockUseTranslations.mockReturnValueOnce(mockT1 as any)
    mockUseTranslations.mockReturnValueOnce(mockT2 as any)
    mockUseLocale.mockReturnValue('en')

    const { result: result1 } = renderHook(() => useI18n('namespace1'))
    const { result: result2 } = renderHook(() => useI18n('namespace2'))

    expect(mockUseTranslations).toHaveBeenNthCalledWith(1, 'namespace1')
    expect(mockUseTranslations).toHaveBeenNthCalledWith(2, 'namespace2')
    expect(result1.current.t).toBe(mockT1)
    expect(result2.current.t).toBe(mockT2)
  })
})