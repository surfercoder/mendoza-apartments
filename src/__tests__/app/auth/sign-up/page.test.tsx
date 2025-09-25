import { render, screen } from '@testing-library/react'
import SignUpPage from '@/app/auth/sign-up/page'

// Mock SignUpForm component
jest.mock('@/components/sign-up-form', () => ({
  SignUpForm: (props: any) => (
    <div data-testid="sign-up-form" {...props}>
      Sign Up Form Component
    </div>
  )
}))

describe('Sign Up Page', () => {
  it('renders sign up page with correct structure', () => {
    const { container } = render(<SignUpPage />)

    // Check main container
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    // Check inner container
    const innerDiv = mainDiv.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')
  })

  it('renders SignUpForm component', () => {
    render(<SignUpPage />)

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
    expect(screen.getByText('Sign Up Form Component')).toBeInTheDocument()
  })

  it('centers the form on the page', () => {
    const { container } = render(<SignUpPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('items-center', 'justify-center')
  })

  it('applies responsive padding', () => {
    const { container } = render(<SignUpPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('p-6', 'md:p-10')
  })

  it('constrains form width', () => {
    const { container } = render(<SignUpPage />)

    const innerDiv = container.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
  })

  it('uses correct viewport height', () => {
    const { container } = render(<SignUpPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-svh')
  })

  it('renders without errors', () => {
    expect(() => render(<SignUpPage />)).not.toThrow()
  })
})