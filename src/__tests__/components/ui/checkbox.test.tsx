import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children, className, checked, defaultChecked, ...props }: any) => (
    <button
      role="checkbox"
      data-testid="checkbox-root"
      className={className}
      aria-checked={checked || defaultChecked || false}
      {...props}
    >
      {children}
    </button>
  ),
  Indicator: ({ children, className }: any) => (
    <div data-testid="checkbox-indicator" className={className}>
      {children}
    </div>
  )
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid="check-icon" />
}))

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox />)
    expect(screen.getByTestId('checkbox-root')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-indicator')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-class" />)
    const checkbox = screen.getByTestId('checkbox-root')
    expect(checkbox.className).toContain('custom-class')
  })

  it('forwards props to root element', () => {
    render(<Checkbox disabled aria-label="Test checkbox" />)
    const checkbox = screen.getByTestId('checkbox-root')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox')
  })

  it('renders check icon in indicator', () => {
    render(<Checkbox />)
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('applies default styling classes', () => {
    render(<Checkbox />)
    const checkbox = screen.getByTestId('checkbox-root')
    expect(checkbox.className).toContain('peer')
    expect(checkbox.className).toContain('size-4')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Checkbox onClick={handleClick} />)
    
    const checkbox = screen.getByTestId('checkbox-root')
    await user.click(checkbox)
    
    expect(handleClick).toHaveBeenCalled()
  })

  it('supports controlled state', () => {
    render(<Checkbox checked={true} />)
    const checkbox = screen.getByTestId('checkbox-root')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('supports uncontrolled state', () => {
    render(<Checkbox defaultChecked={true} />)
    const checkbox = screen.getByTestId('checkbox-root')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })
})