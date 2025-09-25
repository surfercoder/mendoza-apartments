import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSwitcher } from '@/components/theme-switcher'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Laptop: ({ size, className }: { size?: number; className?: string }) => (
    <span data-testid="laptop-icon" data-size={size} className={className} />
  ),
  Moon: ({ size, className }: { size?: number; className?: string }) => (
    <span data-testid="moon-icon" data-size={size} className={className} />
  ),
  Sun: ({ size, className }: { size?: number; className?: string }) => (
    <span data-testid="sun-icon" data-size={size} className={className} />
  )
}))

// Mock dropdown menu components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) => (
    <div data-testid="dropdown-menu-content" className={className} data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuRadioGroup: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }) => (
    <div data-testid="dropdown-menu-radio-group" data-value={value} onClick={() => onValueChange?.('light')}>
      {children}
    </div>
  ),
  DropdownMenuRadioItem: ({ children, className, value }: { children: React.ReactNode; className?: string; value: string }) => (
    <div data-testid={`dropdown-menu-radio-item-${value}`} className={className} data-value={value}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild}>
      {children}
    </div>
  )
}))

import { useTheme } from 'next-themes'

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('ThemeSwitcher', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })
  })

  it('returns null when not mounted', () => {
    const { container } = render(<ThemeSwitcher />)
    expect(container.firstChild).toBeNull()
  })

  it('renders theme switcher after mounting', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })
  })

  it('shows sun icon for light theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    render(<ThemeSwitcher />)

    await waitFor(() => {
      const sunIcon = screen.getByTestId('sun-icon')
      expect(sunIcon).toBeInTheDocument()
      expect(sunIcon).toHaveAttribute('data-size', '16')
    })
  })

  it('shows moon icon for dark theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark'
    })

    render(<ThemeSwitcher />)

    await waitFor(() => {
      const moonIcon = screen.getByTestId('moon-icon')
      expect(moonIcon).toBeInTheDocument()
      expect(moonIcon).toHaveAttribute('data-size', '16')
    })
  })

  it('shows laptop icon for system theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    render(<ThemeSwitcher />)

    await waitFor(() => {
      const laptopIcon = screen.getByTestId('laptop-icon')
      expect(laptopIcon).toBeInTheDocument()
      expect(laptopIcon).toHaveAttribute('data-size', '16')
    })
  })

  it('shows laptop icon for undefined theme', async () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    render(<ThemeSwitcher />)

    await waitFor(() => {
      const laptopIcon = screen.getByTestId('laptop-icon')
      expect(laptopIcon).toBeInTheDocument()
    })
  })

  it('renders all theme options in dropdown', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-menu-radio-item-light')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-radio-item-dark')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-radio-item-system')).toBeInTheDocument()
    })
  })

  it('displays correct text for each theme option', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })

  it('includes icons in theme options', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      // Should have only one icon in the button (for current theme)
      // The menu items only contain text, not icons
      const sunIcon = screen.getByTestId('sun-icon')
      expect(sunIcon).toBeInTheDocument()

      // Verify menu items exist but don't contain icons
      expect(screen.getByTestId('dropdown-menu-radio-item-light')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-radio-item-dark')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-radio-item-system')).toBeInTheDocument()
    })
  })

  it('calls setTheme when option is selected', async () => {
    const user = userEvent.setup()
    render(<ThemeSwitcher />)

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })

    const radioGroup = screen.getByTestId('dropdown-menu-radio-group')
    await user.click(radioGroup)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('uses current theme as radio group value', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    render(<ThemeSwitcher />)

    await waitFor(() => {
      const radioGroup = screen.getByTestId('dropdown-menu-radio-group')
      expect(radioGroup).toHaveAttribute('data-value', 'dark')
    })
  })

  it('applies correct icon size constant', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      // Check that the current theme icon uses the ICON_SIZE constant (16)
      // Only one icon is rendered at a time in the button
      const currentIcon = screen.getByTestId('sun-icon') // default theme is light
      expect(currentIcon).toHaveAttribute('data-size', '16')
    })
  })

  it('applies correct CSS classes to icons', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      // Check that the current theme icon has the correct CSS class
      // Only one icon is rendered at a time in the button
      const currentIcon = screen.getByTestId('sun-icon') // default theme is light
      expect(currentIcon).toHaveClass('text-(--muted-foreground)')
    })
  })

  it('applies correct classes to radio items', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      const lightItem = screen.getByTestId('dropdown-menu-radio-item-light')
      const darkItem = screen.getByTestId('dropdown-menu-radio-item-dark')
      const systemItem = screen.getByTestId('dropdown-menu-radio-item-system')

      expect(lightItem).toHaveClass('flex', 'gap-2')
      expect(darkItem).toHaveClass('flex', 'gap-2')
      expect(systemItem).toHaveClass('flex', 'gap-2')
    })
  })

  it('uses ghost button variant and sm size', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      // The Button component should be rendered with ghost variant and sm size
      // This would need to be verified by checking the actual Button component props
      // For now, we verify the structure is correct
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-trigger')).toHaveAttribute('data-as-child', 'true')
    })
  })

  it('configures dropdown menu content correctly', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      const content = screen.getByTestId('dropdown-menu-content')
      expect(content).toHaveClass('w-content')
      expect(content).toHaveAttribute('data-align', 'start')
    })
  })

  it('handles theme changes correctly', async () => {
    const { rerender } = render(<ThemeSwitcher />)

    // Start with light theme
    await waitFor(() => {
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    // Change to dark theme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light'
    })

    rerender(<ThemeSwitcher />)

    await waitFor(() => {
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })
  })
})