import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from '@/components/ui/button'

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: any) => <a href={href}>{children}</a>
  MockLink.displayName = 'Link'
  return MockLink
})

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div data-testid="slot" {...props}>{children}</div>
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: jest.fn(() => jest.fn(({ className }) => `mocked-button-class ${className || ''}`))
}))

describe('Button', () => {
  it('renders button with default props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('renders as Slot when asChild is true', () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    )

    expect(screen.getByTestId('slot')).toBeInTheDocument()
    expect(screen.getByText('Link Button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('forwards all button props', () => {
    render(
      <Button
        disabled
        type="submit"
        aria-label="Custom button"
        data-testid="custom-button"
      >
        Button
      </Button>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Custom button')
    expect(button).toHaveAttribute('data-testid', 'custom-button')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('accepts variant prop', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('accepts size prop', () => {
    render(<Button size="sm">Small Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('combines variant and size props', () => {
    render(<Button variant="outline" size="lg">Large Outline</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders with children', () => {
    render(
      <Button>
        <span>Icon</span>
        Button Text
      </Button>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Button Text')).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Button</Button>)

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalled()
  })

  it('is accessible', () => {
    render(<Button aria-describedby="help-text">Accessible Button</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(
      <Button onFocus={handleFocus} onBlur={handleBlur}>
        Focus Button
      </Button>
    )

    const button = screen.getByRole('button')

    await user.click(button) // This will focus
    expect(handleFocus).toHaveBeenCalled()

    await user.tab() // This will blur
    expect(handleBlur).toHaveBeenCalled()
  })

  describe('buttonVariants', () => {
    it('is exported', () => {
      expect(buttonVariants).toBeDefined()
      expect(typeof buttonVariants).toBe('function')
    })
  })

  it('renders without crashing with minimal props', () => {
    expect(() => render(<Button />)).not.toThrow()
  })

  it('handles all variant types', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']

    variants.forEach(variant => {
      render(<Button variant={variant as any}>{variant} Button</Button>)
      expect(screen.getByText(`${variant} Button`)).toBeInTheDocument()
    })
  })

  it('handles all size types', () => {
    const sizes = ['default', 'sm', 'lg', 'icon']

    sizes.forEach(size => {
      render(<Button size={size as any}>{size} Button</Button>)
      expect(screen.getByText(`${size} Button`)).toBeInTheDocument()
    })
  })

  it('works with form submission', () => {
    render(
      <form>
        <Button type="submit">Submit</Button>
      </form>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('supports ref forwarding when not asChild', () => {
    const ref = jest.fn()

    render(<Button ref={ref}>Button</Button>)

    // The ref should be called
    expect(ref).toHaveBeenCalled()
  })
})