import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminHeader } from '@/components/admin/admin-header'

// Mock HTMLFormElement.prototype.requestSubmit for JSdom
Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  value: jest.fn(),
  writable: true,
  configurable: true
})

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'admin.dashboard': {
        'title': 'Admin Dashboard'
      },
      'common': {
        'welcome': 'Welcome',
        'signOut': 'Sign Out'
      }
    }
    return translations[namespace]?.[key] || key
  })
}))

// Mock LanguageSwitcher
jest.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>
}))

describe('AdminHeader', () => {
  const defaultProps = {
    userEmail: 'admin@example.com'
  }

  it('renders admin header with title', () => {
    render(<AdminHeader {...defaultProps} />)

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Admin Dashboard')
  })

  it('displays user email with welcome message', () => {
    render(<AdminHeader {...defaultProps} />)

    expect(screen.getByText('Welcome: admin@example.com')).toBeInTheDocument()
  })

  it('renders language switcher', () => {
    render(<AdminHeader {...defaultProps} />)

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
  })

  it('renders sign out form and button', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    // Query form by tag name since HTML forms don't have implicit form role
    const form = container.querySelector('form[action="/auth/signout"]')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('action', '/auth/signout')
    expect(form).toHaveAttribute('method', 'post')

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    expect(signOutButton).toBeInTheDocument()
    expect(signOutButton).toHaveAttribute('type', 'submit')
  })

  it('applies correct CSS classes to header elements', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    const headerDiv = container.firstChild as HTMLElement
    expect(headerDiv).toHaveClass('flex', 'items-center', 'justify-between')

    const title = screen.getByRole('heading')
    expect(title).toHaveClass('text-2xl', 'font-bold')

    const rightSection = headerDiv.querySelector('.flex.items-center.space-x-4')
    expect(rightSection).toBeInTheDocument()
  })

  it('applies correct CSS classes to user email', () => {
    render(<AdminHeader {...defaultProps} />)

    const userEmailSpan = screen.getByText('Welcome: admin@example.com')
    expect(userEmailSpan).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('applies correct CSS classes to sign out button', () => {
    render(<AdminHeader {...defaultProps} />)

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })
    expect(signOutButton).toHaveClass('text-sm', 'text-muted-foreground', 'hover:text-foreground')
  })

  it('handles different user email formats', () => {
    const emails = [
      'user@domain.com',
      'long.email.address@example.org',
      'test+tag@company.co.uk',
      'simple@test.io'
    ]

    emails.forEach(email => {
      const { unmount } = render(<AdminHeader userEmail={email} />)
      expect(screen.getByText(`Welcome: ${email}`)).toBeInTheDocument()
      // Clean up after each iteration to prevent multiple elements
      unmount()
    })
  })

  it('handles empty user email', () => {
    render(<AdminHeader userEmail="" />)

    // Use regex matcher to handle whitespace variations
    expect(screen.getByText(/^Welcome:\s*$/)).toBeInTheDocument()
  })

  it('handles user email with special characters', () => {
    const specialEmail = 'test+user@example.com'
    render(<AdminHeader userEmail={specialEmail} />)

    expect(screen.getByText(`Welcome: ${specialEmail}`)).toBeInTheDocument()
  })

  it('sign out button can be clicked', async () => {
    const user = userEvent.setup()
    render(<AdminHeader {...defaultProps} />)

    const signOutButton = screen.getByRole('button', { name: 'Sign Out' })

    await act(async () => {
      await user.click(signOutButton)
    })

    // The button should still be present after click (form submission handled by browser)
    expect(signOutButton).toBeInTheDocument()
  })

  it('renders header elements in correct order', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    const headerDiv = container.firstChild as HTMLElement
    const children = Array.from(headerDiv.children)

    expect(children).toHaveLength(2)
    expect(children[0]).toContainElement(screen.getByRole('heading'))
    expect(children[1]).toContainElement(screen.getByTestId('language-switcher'))
    expect(children[1]).toContainElement(screen.getByRole('button', { name: 'Sign Out' }))
  })

  it('uses correct translation namespaces', async () => {
    const { useTranslations } = await import('next-intl')

    render(<AdminHeader {...defaultProps} />)

    expect(useTranslations).toHaveBeenCalledWith('admin.dashboard')
    expect(useTranslations).toHaveBeenCalledWith('common')
  })

  it('displays proper heading hierarchy', () => {
    render(<AdminHeader {...defaultProps} />)

    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveProperty('tagName', 'H1')
  })

  it('maintains proper spacing between elements', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    const rightSection = container.querySelector('.space-x-4')
    expect(rightSection).toBeInTheDocument()
    expect(rightSection?.children).toHaveLength(3) // email span, language switcher, form
  })

  it('form targets correct endpoint', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    const form = container.querySelector('form[action="/auth/signout"]')
    expect(form).toBeInTheDocument()
    expect(form?.getAttribute('action')).toBe('/auth/signout')
    expect(form?.getAttribute('method')).toBe('post')
  })

  it('renders without crashing with minimal props', () => {
    expect(() => render(<AdminHeader userEmail="test@example.com" />)).not.toThrow()
  })

  it('handles very long email addresses gracefully', () => {
    const longEmail = 'very.very.very.long.email.address.that.might.cause.layout.issues@extremely.long.domain.name.example.com'
    render(<AdminHeader userEmail={longEmail} />)

    expect(screen.getByText(`Welcome: ${longEmail}`)).toBeInTheDocument()
  })

  it('preserves form functionality', () => {
    const { container } = render(<AdminHeader {...defaultProps} />)

    const form = container.querySelector('form[action="/auth/signout"]')
    const button = screen.getByRole('button', { name: 'Sign Out' })

    expect(form).toContainElement(button)
    expect(button).toHaveAttribute('type', 'submit')
  })
})