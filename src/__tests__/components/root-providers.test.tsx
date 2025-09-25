import { render, screen } from '@testing-library/react'
import { RootProviders } from '@/components/root-providers'

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, attribute, defaultTheme, enableSystem, disableTransitionOnChange, ...props }: any) => (
    <div
      {...props}
      data-testid="theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-enable-system={enableSystem}
      data-disable-transition={disableTransitionOnChange}
    >
      {children}
    </div>
  )
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children, messages, locale, timeZone, now }: any) => (
    <div
      data-testid="intl-provider"
      data-locale={locale}
      data-timezone={timeZone}
      data-now={now?.toISOString()}
      data-messages={JSON.stringify(messages)}
    >
      {children}
    </div>
  )
}))

describe('RootProviders', () => {
  const mockMessages = {
    common: {
      hello: 'Hello',
      goodbye: 'Goodbye'
    },
    home: {
      title: 'Home Page'
    }
  }

  const defaultProps = {
    locale: 'en',
    messages: mockMessages,
    children: <div data-testid="test-children">Test Content</div>
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children within providers', () => {
    render(<RootProviders {...defaultProps} />)

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('configures ThemeProvider with correct props', () => {
    render(<RootProviders {...defaultProps} />)

    const themeProvider = screen.getByTestId('theme-provider')
    expect(themeProvider).toBeInTheDocument()
    expect(themeProvider).toHaveAttribute('data-attribute', 'class')
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system')
    expect(themeProvider).toHaveAttribute('data-enable-system', 'true')
    expect(themeProvider).toHaveAttribute('data-disable-transition', 'true')
  })

  it('configures NextIntlClientProvider with correct props', () => {
    render(<RootProviders {...defaultProps} />)

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toBeInTheDocument()
    expect(intlProvider).toHaveAttribute('data-locale', 'en')
    expect(intlProvider).toHaveAttribute('data-timezone', 'America/Argentina/Mendoza')
    expect(intlProvider).toHaveAttribute('data-messages', JSON.stringify(mockMessages))

    // Check that now prop is set (should be a valid ISO string)
    const nowAttribute = intlProvider.getAttribute('data-now')
    expect(nowAttribute).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it('works with Spanish locale', () => {
    const spanishMessages = {
      common: {
        hello: 'Hola',
        goodbye: 'Adiós'
      }
    }

    render(
      <RootProviders
        locale="es"
        messages={spanishMessages}
      >
        <div data-testid="spanish-content">Contenido en Español</div>
      </RootProviders>
    )

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-locale', 'es')
    expect(intlProvider).toHaveAttribute('data-messages', JSON.stringify(spanishMessages))

    expect(screen.getByTestId('spanish-content')).toBeInTheDocument()
  })

  it('handles empty messages object', () => {
    render(
      <RootProviders
        locale="en"
        messages={{}}
      >
        <div>Empty messages test</div>
      </RootProviders>
    )

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-messages', '{}')
  })

  it('renders provider hierarchy correctly', () => {
    render(<RootProviders {...defaultProps} />)

    const themeProvider = screen.getByTestId('theme-provider')
    const intlProvider = screen.getByTestId('intl-provider')
    const children = screen.getByTestId('test-children')

    // Check that intl provider is inside theme provider
    expect(themeProvider).toContainElement(intlProvider)
    expect(intlProvider).toContainElement(children)
  })

  it('handles complex nested messages structure', () => {
    const complexMessages = {
      auth: {
        login: {
          title: 'Sign In',
          fields: {
            email: 'Email',
            password: 'Password'
          }
        }
      },
      admin: {
        dashboard: {
          stats: {
            total: 'Total Apartments',
            active: 'Active Listings'
          }
        }
      }
    }

    render(
      <RootProviders
        locale="en"
        messages={complexMessages}
      >
        <div data-testid="complex-content">Complex structure test</div>
      </RootProviders>
    )

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-messages', JSON.stringify(complexMessages))
  })

  it('handles multiple children', () => {
    render(
      <RootProviders {...defaultProps}>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <span data-testid="child-3">Third Child</span>
      </RootProviders>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('passes through React fragments', () => {
    render(
      <RootProviders {...defaultProps}>
        <>
          <div data-testid="fragment-child-1">Fragment Child 1</div>
          <div data-testid="fragment-child-2">Fragment Child 2</div>
        </>
      </RootProviders>
    )

    expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument()
    expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument()
  })

  it('sets timezone to Argentina/Mendoza', () => {
    render(<RootProviders {...defaultProps} />)

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-timezone', 'America/Argentina/Mendoza')
  })

  it('passes current date as now prop', () => {
    const beforeRender = new Date()
    render(<RootProviders {...defaultProps} />)
    const afterRender = new Date()

    const intlProvider = screen.getByTestId('intl-provider')
    const nowAttribute = intlProvider.getAttribute('data-now')

    expect(nowAttribute).toBeTruthy()
    const nowDate = new Date(nowAttribute!)

    // The date should be between before and after render
    expect(nowDate.getTime()).toBeGreaterThanOrEqual(beforeRender.getTime())
    expect(nowDate.getTime()).toBeLessThanOrEqual(afterRender.getTime())
  })

  it('handles different locale formats', () => {
    const locales = ['en', 'es', 'en-US', 'es-AR']

    locales.forEach(locale => {
      const { unmount } = render(
        <RootProviders
          locale={locale}
          messages={mockMessages}
        >
          <div data-testid={`content-${locale}`}>Content for {locale}</div>
        </RootProviders>
      )

      const intlProvider = screen.getByTestId('intl-provider')
      expect(intlProvider).toHaveAttribute('data-locale', locale)
      expect(screen.getByTestId(`content-${locale}`)).toBeInTheDocument()

      // Clean up after each iteration to prevent multiple elements
      unmount()
    })
  })

  it('handles null messages gracefully', () => {
    render(
      <RootProviders
        locale="en"
        messages={null as any}
      >
        <div data-testid="null-messages">Null messages test</div>
      </RootProviders>
    )

    const intlProvider = screen.getByTestId('intl-provider')
    expect(intlProvider).toHaveAttribute('data-messages', 'null')
    expect(screen.getByTestId('null-messages')).toBeInTheDocument()
  })
})