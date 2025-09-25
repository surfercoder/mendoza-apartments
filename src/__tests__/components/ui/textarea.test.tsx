import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('custom-class')
  })

  it('applies default styling classes', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('flex')
    expect(textarea.className).toContain('min-h-16')
    expect(textarea.className).toContain('w-full')
    expect(textarea.className).toContain('rounded-md')
  })

  it('forwards all textarea props', () => {
    render(
      <Textarea
        placeholder="Enter text here"
        rows={5}
        cols={30}
        disabled
        required
        aria-label="Custom textarea"
        data-testid="custom-textarea"
      />
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Enter text here')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '30')
    expect(textarea).toBeDisabled()
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAttribute('aria-label', 'Custom textarea')
    expect(textarea).toHaveAttribute('data-testid', 'custom-textarea')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()

    render(<Textarea onChange={handleChange} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello, World!')

    expect(handleChange).toHaveBeenCalled()
    expect(textarea).toHaveValue('Hello, World!')
  })

  it('supports controlled value', () => {
    render(<Textarea value="Controlled value" readOnly />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Controlled value')
  })

  it('supports default value', () => {
    render(<Textarea defaultValue="Default value" />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Default value')
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(
      <Textarea
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )

    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(handleFocus).toHaveBeenCalled()

    await user.tab()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('supports ref forwarding', () => {
    const ref = jest.fn()

    render(<Textarea ref={ref} />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement))
  })

  it('handles keyboard events', async () => {
    const user = userEvent.setup()
    const handleKeyDown = jest.fn()

    render(<Textarea onKeyDown={handleKeyDown} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'a')

    expect(handleKeyDown).toHaveBeenCalled()
  })

  it('works with form submission', () => {
    render(
      <form>
        <Textarea name="message" />
      </form>
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'message')
  })

  it('supports resize property', () => {
    const { rerender } = render(<Textarea className="resize-none" />)
    let textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('resize-none')

    rerender(<Textarea className="resize-vertical" />)
    textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('resize-vertical')
  })

  it('handles multiline text correctly', async () => {
    const user = userEvent.setup()
    render(<Textarea />)

    const textarea = screen.getByRole('textbox')
    const multilineText = 'Line 1\nLine 2\nLine 3'
    
    await user.type(textarea, multilineText)
    expect(textarea).toHaveValue(multilineText)
  })

  it('applies focus styles correctly', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('focus-visible:ring-[3px]')
  })

  it('applies disabled styles correctly', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('disabled:cursor-not-allowed')
    expect(textarea.className).toContain('disabled:opacity-50')
  })
})