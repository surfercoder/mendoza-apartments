import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Root: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>)
}))

describe('Label', () => {
  it('renders label component', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
  })

  it('renders as label element', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label.tagName).toBe('LABEL')
  })

  it('applies data-slot attribute', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('data-slot', 'label')
  })

  it('applies default classes', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('flex')
    expect(label).toHaveClass('items-center')
    expect(label).toHaveClass('gap-2')
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('leading-none')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('select-none')
  })

  it('accepts custom className', () => {
    render(<Label className="custom-class">Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('custom-class')
    expect(label).toHaveClass('flex') // Still has default classes
  })

  it('merges custom and default classes', () => {
    render(<Label className="text-lg text-red-500">Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('text-lg')
    expect(label).toHaveClass('text-red-500')
    expect(label).toHaveClass('flex')
    expect(label).toHaveClass('items-center')
  })

  it('accepts htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('works with form inputs', () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </div>
    )

    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('supports nested elements', () => {
    render(
      <Label>
        <span>Required</span>
        <strong>Field Name</strong>
      </Label>
    )

    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('Field Name')).toBeInTheDocument()
  })

  it('supports icons and other elements', () => {
    render(
      <Label>
        <svg data-testid="icon" width="16" height="16">
          <circle cx="8" cy="8" r="4" />
        </svg>
        Label with Icon
      </Label>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Label with Icon')).toBeInTheDocument()
  })

  it('accepts other HTML attributes', () => {
    render(
      <Label
        id="test-label"
        data-testid="label"
        aria-describedby="help-text"
      >
        Test Label
      </Label>
    )

    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('id', 'test-label')
    expect(label).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Label onClick={handleClick}>Clickable Label</Label>)

    const label = screen.getByText('Clickable Label')
    label.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports disabled state styling', () => {
    render(
      <div className="group" data-disabled="true">
        <Label>Disabled Label</Label>
      </div>
    )

    const label = screen.getByText('Disabled Label')
    // The disabled styles are applied via CSS classes based on group state
    expect(label).toHaveClass('group-data-[disabled=true]:pointer-events-none')
    expect(label).toHaveClass('group-data-[disabled=true]:opacity-50')
  })

  it('supports peer disabled styling', () => {
    render(
      <div>
        <input disabled className="peer" />
        <Label>Peer Label</Label>
      </div>
    )

    const label = screen.getByText('Peer Label')
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed')
    expect(label).toHaveClass('peer-disabled:opacity-50')
  })

  it('can be used with required field indicators', () => {
    render(
      <Label>
        Email Address
        <span className="text-red-500">*</span>
      </Label>
    )

    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('supports accessibility attributes', () => {
    render(
      <Label
        aria-label="Accessible label"
        role="label"
        aria-required="true"
      >
        Required Field
      </Label>
    )

    const label = screen.getByLabelText('Accessible label')
    expect(label).toHaveAttribute('role', 'label')
    expect(label).toHaveAttribute('aria-required', 'true')
  })

  it('handles complex content', () => {
    render(
      <Label>
        <div className="flex items-center gap-2">
          <span className="text-red-500">*</span>
          <span>Required Field</span>
          <small className="text-gray-500">(optional details)</small>
        </div>
      </Label>
    )

    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('Required Field')).toBeInTheDocument()
    expect(screen.getByText('(optional details)')).toBeInTheDocument()
  })

  it('forwards all props to Radix Root', () => {
    const customProps = {
      'data-custom': 'value',
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn()
    }

    render(<Label {...customProps}>Test Label</Label>)

    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('data-custom', 'value')
  })
})