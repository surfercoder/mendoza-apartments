import { render, screen } from '@testing-library/react'
import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout'
import { notFound } from 'next/navigation'
import { getMessages, setRequestLocale } from 'next-intl/server'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(),
  setRequestLocale: jest.fn()
}))

// Mock RootProviders
jest.mock('@/components/root-providers', () => ({
  RootProviders: ({ children, locale }: { children: React.ReactNode, locale: string }) => (
    <div data-testid="root-providers" data-locale={locale}>
      {children}
    </div>
  )
}))

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    className: 'geist-sans',
    variable: '--font-geist-sans'
  }))
}))

// Mock i18n/routing
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es']
  }
}))

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>
const mockGetMessages = getMessages as jest.MockedFunction<typeof getMessages>
const mockSetRequestLocale = setRequestLocale as jest.MockedFunction<typeof setRequestLocale>

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetMessages.mockResolvedValue({
      common: {
        welcome: 'Welcome'
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render layout with valid locale', async () => {
    const params = Promise.resolve({ locale: 'en' })
    const children = <div>Test Content</div>

    const result = await LocaleLayout({ children, params })

    expect(mockSetRequestLocale).toHaveBeenCalledWith('en')
    expect(mockGetMessages).toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()

    render(result)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByTestId('root-providers')).toHaveAttribute('data-locale', 'en')
  })

  it('should render layout with Spanish locale', async () => {
    const params = Promise.resolve({ locale: 'es' })
    const children = <div>Contenido de Prueba</div>

    const result = await LocaleLayout({ children, params })

    expect(mockSetRequestLocale).toHaveBeenCalledWith('es')
    expect(mockGetMessages).toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()

    render(result)

    expect(screen.getByText('Contenido de Prueba')).toBeInTheDocument()
    expect(screen.getByTestId('root-providers')).toHaveAttribute('data-locale', 'es')
  })

  it('should call notFound for invalid locale', async () => {
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })

    const params = Promise.resolve({ locale: 'fr' })
    const children = <div>Test Content</div>

    await expect(LocaleLayout({ children, params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
    expect(mockSetRequestLocale).not.toHaveBeenCalled()
  })

  it('should render html with lang attribute', async () => {
    const params = Promise.resolve({ locale: 'en' })
    const children = <div>Test Content</div>

    const result = await LocaleLayout({ children, params })
    render(result)

    const html = screen.getByText('Test Content').closest('html')
    expect(html).toHaveAttribute('lang', 'en')
  })

  it('should apply geist font className to body', async () => {
    const params = Promise.resolve({ locale: 'en' })
    const children = <div>Test Content</div>

    const result = await LocaleLayout({ children, params })
    render(result)

    const body = screen.getByText('Test Content').closest('body')
    expect(body).toHaveClass('geist-sans', 'antialiased')
  })
})

describe('generateStaticParams', () => {
  it('should return all locales', () => {
    const params = generateStaticParams()

    expect(params).toEqual([
      { locale: 'en' },
      { locale: 'es' }
    ])
  })
})
