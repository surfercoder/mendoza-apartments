import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text here" />)
    const input = screen.getByPlaceholderText('Enter text here')
    expect(input).toBeInTheDocument()
  })

  it('renders with specific type', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders password input', () => {
    render(<Input type="password" data-testid="password-input" />)
    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders number input', () => {
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('applies default className', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-9')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
  })

  it('merges custom and default classes', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-9')
  })

  it('accepts value prop', () => {
    render(<Input value="test value" readOnly />)
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('accepts defaultValue prop', () => {
    render(<Input defaultValue="default test" />)
    const input = screen.getByDisplayValue('default test')
    expect(input).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'test')

    expect(handleChange).toHaveBeenCalled()
  })

  it('handles onFocus events', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    render(<Input onFocus={handleFocus} />)

    const input = screen.getByRole('textbox')
    await user.click(input)

    expect(handleFocus).toHaveBeenCalled()
  })

  it('handles onBlur events', async () => {
    const user = userEvent.setup()
    const handleBlur = jest.fn()
    render(<Input onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab()

    expect(handleBlur).toHaveBeenCalled()
  })

  it('accepts required attribute', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('accepts min and max for number inputs', () => {
    render(<Input type="number" min={0} max={100} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('accepts step for number inputs', () => {
    render(<Input type="number" step={0.1} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('step', '0.1')
  })

  it('accepts maxLength attribute', () => {
    render(<Input maxLength={10} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('accepts minLength attribute', () => {
    render(<Input minLength={5} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('minLength', '5')
  })

  it('accepts pattern attribute', () => {
    render(<Input pattern="[0-9]*" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('pattern', '[0-9]*')
  })

  it('accepts autoComplete attribute', () => {
    render(<Input autoComplete="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('accepts autoFocus attribute', () => {
    render(<Input autoFocus />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveFocus()
  })

  it('accepts readOnly attribute', () => {
    render(<Input readOnly />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readOnly')
  })

  it('accepts id attribute', () => {
    render(<Input id="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('accepts name attribute', () => {
    render(<Input name="test-name" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'test-name')
  })

  it('accepts aria-label attribute', () => {
    render(<Input aria-label="Test input field" />)
    const input = screen.getByLabelText('Test input field')
    expect(input).toBeInTheDocument()
  })

  it('accepts aria-describedby attribute', () => {
    render(
      <div>
        <Input aria-describedby="help-text" />
        <div id="help-text">Help text</div>
      </div>
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('can be used with form validation', async () => {
    const user = userEvent.setup()
    const handleSubmit = jest.fn((e) => e.preventDefault())

    render(
      <form onSubmit={handleSubmit}>
        <Input required name="test" />
        <button type="submit">Submit</button>
      </form>
    )

    const button = screen.getByRole('button', { name: 'Submit' })
    await user.click(button)

    // Form should not submit due to required field validation
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('handles keyboard events', async () => {
    const user = userEvent.setup()
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()

    render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'a')

    expect(handleKeyDown).toHaveBeenCalled()
    expect(handleKeyUp).toHaveBeenCalled()
  })
})