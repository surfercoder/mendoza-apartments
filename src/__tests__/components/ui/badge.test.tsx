import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders badge component', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toBeInTheDocument()
  })

  it('renders as div element', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge.tagName).toBe('DIV')
  })

  it('applies default variant classes', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-md')
    expect(badge).toHaveClass('border')
    expect(badge).toHaveClass('px-2.5')
    expect(badge).toHaveClass('py-0.5')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
    expect(badge).toHaveClass('transition-colors')
  })

  it('applies default variant specific classes', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('shadow-sm')
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>)
    const badge = screen.getByText('Secondary Badge')
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('inline-flex') // Base classes still applied
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>)
    const badge = screen.getByText('Destructive Badge')
    expect(badge).toHaveClass('border-transparent')
    expect(badge).toHaveClass('shadow-sm')
    expect(badge).toHaveClass('inline-flex') // Base classes still applied
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline Badge</Badge>)
    const badge = screen.getByText('Outline Badge')
    expect(badge).toHaveClass('inline-flex') // Base classes still applied
    // Outline variant doesn't have border-transparent
    expect(badge).not.toHaveClass('border-transparent')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('inline-flex') // Still has base classes
  })

  it('merges custom and variant classes', () => {
    render(
      <Badge variant="secondary" className="text-lg bg-blue-500">
        Custom Secondary
      </Badge>
    )
    const badge = screen.getByText('Custom Secondary')
    expect(badge).toHaveClass('text-lg')
    expect(badge).toHaveClass('bg-blue-500')
    expect(badge).toHaveClass('inline-flex')
  })

  it('accepts HTML attributes', () => {
    render(
      <Badge
        id="test-badge"
        data-testid="badge"
        role="status"
        aria-label="Status badge"
      >
        Attribute Badge
      </Badge>
    )

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
  })

  it('supports nested content', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('supports icons and other elements', () => {
    render(
      <Badge>
        <svg data-testid="icon" width="12" height="12">
          <circle cx="6" cy="6" r="3" />
        </svg>
        Badge with Icon
      </Badge>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Badge with Icon')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>)

    const badge = screen.getByText('Clickable Badge')
    badge.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles mouse events', async () => {
    const user = userEvent.setup()
    const handleMouseEnter = jest.fn()
    const handleMouseLeave = jest.fn()

    render(
      <Badge onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} data-testid="hoverable-badge">
        Hoverable Badge
      </Badge>
    )

    const badge = screen.getByTestId('hoverable-badge')

    // Simulate hover
    await user.hover(badge)
    expect(handleMouseEnter).toHaveBeenCalledTimes(1)

    // Simulate unhover
    await user.unhover(badge)
    expect(handleMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('can be used for status indicators', () => {
    render(
      <div>
        <Badge variant="default">Active</Badge>
        <Badge variant="secondary">Pending</Badge>
        <Badge variant="destructive">Error</Badge>
        <Badge variant="outline">Draft</Badge>
      </div>
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('supports accessibility attributes', () => {
    render(
      <Badge
        role="status"
        aria-live="polite"
        aria-label="Current status: active"
      >
        Active
      </Badge>
    )

    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-live', 'polite')
    expect(badge).toHaveAttribute('aria-label', 'Current status: active')
  })

  it('can contain interactive elements', () => {
    render(
      <Badge>
        <span>Count: 5</span>
        <button type="button" aria-label="Remove">×</button>
      </Badge>
    )

    expect(screen.getByText('Count: 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('handles empty content', () => {
    render(<Badge data-testid="empty-badge"></Badge>)
    const badge = screen.getByTestId('empty-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toBeEmptyDOMElement()
  })

  it('supports focus events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(
      <Badge tabIndex={0} onFocus={handleFocus} onBlur={handleBlur}>
        Focusable Badge
      </Badge>
    )

    const badge = screen.getByText('Focusable Badge')

    badge.focus()
    expect(handleFocus).toHaveBeenCalledTimes(1)

    badge.blur()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies focus styles', () => {
    render(<Badge tabIndex={0}>Focusable Badge</Badge>)
    const badge = screen.getByText('Focusable Badge')
    expect(badge).toHaveClass('focus:outline-hidden')
    expect(badge).toHaveClass('focus:ring-2')
    expect(badge).toHaveClass('focus:ring-offset-2')
  })

  it('works with different content types', () => {
    render(
      <div>
        <Badge>Text Badge</Badge>
        <Badge>123</Badge>
        <Badge>
          <strong>Bold Text</strong>
        </Badge>
        <Badge>
          <em>Italic Text</em>
        </Badge>
      </div>
    )

    expect(screen.getByText('Text Badge')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
    expect(screen.getByText('Bold Text')).toBeInTheDocument()
    expect(screen.getByText('Italic Text')).toBeInTheDocument()
  })
})