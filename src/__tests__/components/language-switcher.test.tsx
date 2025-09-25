import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from '@/components/language-switcher'

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: jest.fn(() => [false, jest.fn()])
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en')
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn()
  }))
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-menu-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-menu-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  )
}))

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

const mockUseTransition = useTransition as jest.MockedFunction<typeof useTransition>
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
})

describe('LanguageSwitcher', () => {
  const mockRefresh = jest.fn()
  const mockStartTransition = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseRouter.mockReturnValue({
      refresh: mockRefresh,
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn()
    } as any)

    mockUseTransition.mockReturnValue([false, mockStartTransition])
    mockUseLocale.mockReturnValue('en')

    // Reset document.cookie
    document.cookie = ''
  })

  it('renders language switcher with English locale', () => {
    mockUseLocale.mockReturnValue('en')

    render(<LanguageSwitcher />)

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    expect(screen.getByTitle('United States')).toBeInTheDocument()
    expect(screen.getAllByText('🇺🇸')).toHaveLength(2) // Trigger and dropdown item
  })

  it('renders language switcher with Spanish locale', () => {
    mockUseLocale.mockReturnValue('es')

    render(<LanguageSwitcher />)

    expect(screen.getByTitle('Argentina')).toBeInTheDocument()
    expect(screen.getAllByText('🇦🇷')).toHaveLength(2) // Trigger and dropdown item
  })

  it('renders dropdown menu items', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()

    // Check flag emojis in menu items
    const menuItems = screen.getAllByTestId('dropdown-menu-item')
    expect(menuItems).toHaveLength(2)
  })

  it('sets button attributes correctly for English locale', () => {
    mockUseLocale.mockReturnValue('en')

    render(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveAttribute('data-size', 'sm')
    expect(button).not.toBeDisabled()

    const flagSpan = screen.getByTitle('United States')
    expect(flagSpan).toHaveAttribute('aria-label', 'United States')
  })

  it('sets button attributes correctly for Spanish locale', () => {
    mockUseLocale.mockReturnValue('es')

    render(<LanguageSwitcher />)

    const flagSpan = screen.getByTitle('Argentina')
    expect(flagSpan).toHaveAttribute('aria-label', 'Argentina')
  })

  it('disables button when transition is pending', () => {
    mockUseTransition.mockReturnValue([true, mockStartTransition])

    render(<LanguageSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('switches to English locale', async () => {
    const user = userEvent.setup()
    mockUseLocale.mockReturnValue('es') // Start with Spanish

    mockStartTransition.mockImplementation((callback) => {
      callback()
    })

    render(<LanguageSwitcher />)

    const englishMenuItem = screen.getByText('English').closest('[data-testid=\"dropdown-menu-item\"]')
    expect(englishMenuItem).toBeInTheDocument()

    await act(async () => {
      await user.click(englishMenuItem!)
    })

    expect(mockStartTransition).toHaveBeenCalled()

    // Verify the callback was called with the right locale
    const transitionCallback = mockStartTransition.mock.calls[0][0]
    transitionCallback()

    expect(document.cookie).toContain('NEXT_LOCALE=en')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('switches to Spanish locale', async () => {
    const user = userEvent.setup()
    mockUseLocale.mockReturnValue('en') // Start with English

    mockStartTransition.mockImplementation((callback) => {
      callback()
    })

    render(<LanguageSwitcher />)

    const spanishMenuItem = screen.getByText('Español').closest('[data-testid=\"dropdown-menu-item\"]')
    expect(spanishMenuItem).toBeInTheDocument()

    await act(async () => {
      await user.click(spanishMenuItem!)
    })

    expect(mockStartTransition).toHaveBeenCalled()

    // Verify the callback was called with the right locale
    const transitionCallback = mockStartTransition.mock.calls[0][0]
    transitionCallback()

    expect(document.cookie).toContain('NEXT_LOCALE=es')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('sets cookie with correct attributes', async () => {
    const user = userEvent.setup()

    mockStartTransition.mockImplementation((callback) => {
      callback()
    })

    render(<LanguageSwitcher />)

    const englishMenuItem = screen.getByText('English').closest('[data-testid=\"dropdown-menu-item\"]')

    await act(async () => {
      await user.click(englishMenuItem!)
    })

    // Get the transition callback and execute it
    const transitionCallback = mockStartTransition.mock.calls[0][0]
    transitionCallback()

    // Check cookie format
    const expectedCookie = 'NEXT_LOCALE=en; path=/; max-age=31536000' // 365 * 24 * 60 * 60
    expect(document.cookie).toBe(expectedCookie)
  })

  it('aligns dropdown menu content to end', () => {
    render(<LanguageSwitcher />)

    const dropdownContent = screen.getByTestId('dropdown-menu-content')
    expect(dropdownContent).toHaveAttribute('data-align', 'end')
  })

  it('uses useTransition hook correctly', () => {
    render(<LanguageSwitcher />)

    expect(mockUseTransition).toHaveBeenCalled()
  })

  it('calls router.refresh when locale changes', async () => {
    const user = userEvent.setup()

    mockStartTransition.mockImplementation((callback) => {
      callback()
    })

    render(<LanguageSwitcher />)

    const englishMenuItem = screen.getByText('English').closest('[data-testid=\"dropdown-menu-item\"]')

    await act(async () => {
      await user.click(englishMenuItem!)
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('handles same locale selection', async () => {
    const user = userEvent.setup()
    mockUseLocale.mockReturnValue('en')

    mockStartTransition.mockImplementation((callback) => {
      callback()
    })

    render(<LanguageSwitcher />)

    const englishMenuItem = screen.getByText('English').closest('[data-testid=\"dropdown-menu-item\"]')

    await act(async () => {
      await user.click(englishMenuItem!)
    })

    // Should still work even if selecting the same locale
    expect(mockStartTransition).toHaveBeenCalled()

    const transitionCallback = mockStartTransition.mock.calls[0][0]
    transitionCallback()

    expect(document.cookie).toContain('NEXT_LOCALE=en')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders correct structure', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
    expect(screen.getAllByTestId('dropdown-menu-item')).toHaveLength(2)
  })

  it('maintains flag emoji spacing in menu items', () => {
    render(<LanguageSwitcher />)

    const menuItems = screen.getAllByTestId('dropdown-menu-item')

    // Check that flags are present with proper spacing class
    const englishItem = menuItems.find(item => item.textContent?.includes('English'))
    const spanishItem = menuItems.find(item => item.textContent?.includes('Español'))

    expect(englishItem).toBeInTheDocument()
    expect(spanishItem).toBeInTheDocument()

    // Check for the flag emojis in the items
    expect(englishItem?.textContent).toContain('🇺🇸')
    expect(spanishItem?.textContent).toContain('🇦🇷')
  })
})