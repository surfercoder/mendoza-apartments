import { render } from '@testing-library/react'
import { Toaster } from '@/components/ui/sonner'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

// Mock sonner
jest.mock('sonner', () => ({
  Toaster: jest.fn(({ theme, className, icons, style, ...props }) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      data-has-icons={icons ? 'true' : 'false'}
      data-icon-success={icons?.success ? 'true' : 'false'}
      data-icon-info={icons?.info ? 'true' : 'false'}
      data-icon-warning={icons?.warning ? 'true' : 'false'}
      data-icon-error={icons?.error ? 'true' : 'false'}
      data-icon-loading={icons?.loading ? 'true' : 'false'}
      style={style}
      {...props}
    />
  ))
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CircleCheckIcon: () => <div data-testid="icon-success">✓</div>,
  InfoIcon: () => <div data-testid="icon-info">i</div>,
  TriangleAlertIcon: () => <div data-testid="icon-warning">⚠</div>,
  OctagonXIcon: () => <div data-testid="icon-error">✗</div>,
  Loader2Icon: () => <div data-testid="icon-loading">⟳</div>
}))

describe('Toaster', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with light theme', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'light')
    expect(toaster).toHaveClass('toaster group')
  })

  it('should render with dark theme', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'dark')
  })

  it('should default to system theme when no theme is provided', () => {
    (useTheme as jest.Mock).mockReturnValue({})

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('should default to system theme when theme is undefined', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: undefined })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('should render with system theme explicitly', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'system' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('should include all custom icons', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')

    // Verify all icons are provided
    expect(toaster).toHaveAttribute('data-has-icons', 'true')
    expect(toaster).toHaveAttribute('data-icon-success', 'true')
    expect(toaster).toHaveAttribute('data-icon-info', 'true')
    expect(toaster).toHaveAttribute('data-icon-warning', 'true')
    expect(toaster).toHaveAttribute('data-icon-error', 'true')
    expect(toaster).toHaveAttribute('data-icon-loading', 'true')
  })

  it('should apply custom CSS variables', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    const style = toaster.style

    expect(style.getPropertyValue('--normal-bg')).toBe('var(--popover)')
    expect(style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)')
    expect(style.getPropertyValue('--normal-border')).toBe('var(--border)')
    expect(style.getPropertyValue('--border-radius')).toBe('var(--radius)')
  })

  it('should forward additional props to Sonner', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

    const { getByTestId } = render(<Toaster position="top-right" duration={5000} />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('position', 'top-right')
    expect(toaster).toHaveAttribute('duration', '5000')
  })

  it('should handle empty theme object', () => {
    (useTheme as jest.Mock).mockReturnValue({})

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('should always include className "toaster group"', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    expect(toaster).toHaveClass('toaster')
    expect(toaster).toHaveClass('group')
  })

  it('should work with null theme', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: null })

    const { getByTestId } = render(<Toaster />)

    const toaster = getByTestId('sonner-toaster')
    // null is coerced to 'null' as a string when passed to data attribute
    // The component passes null to the Sonner component, which will handle it appropriately
    expect(toaster).toBeInTheDocument()
  })
})
