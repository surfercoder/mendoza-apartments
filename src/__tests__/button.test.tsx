import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders text content and has data-slot attribute', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('data-slot', 'button')
  })

  it('triggers onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Press</Button>)
    await user.click(screen.getByRole('button', { name: /press/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
