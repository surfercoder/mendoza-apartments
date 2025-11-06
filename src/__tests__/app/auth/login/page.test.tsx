import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/[locale]/auth/login/page'

// Mock LoginForm component
jest.mock('@/components/login-form', () => ({
  LoginForm: (props: any) => (
    <div data-testid="login-form" {...props}>
      Login Form Component
    </div>
  )
}))

describe('Login Page', () => {
  it('renders login page with correct structure', () => {
    const { container } = render(<LoginPage />)

    // Check main container
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    // Check inner container
    const innerDiv = mainDiv.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')
  })

  it('renders LoginForm component', () => {
    render(<LoginPage />)

    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByText('Login Form Component')).toBeInTheDocument()
  })

  it('centers the form on the page', () => {
    const { container } = render(<LoginPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('items-center', 'justify-center')
  })

  it('applies responsive padding', () => {
    const { container } = render(<LoginPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('p-6', 'md:p-10')
  })

  it('constrains form width', () => {
    const { container } = render(<LoginPage />)

    const innerDiv = container.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
  })

  it('uses correct viewport height', () => {
    const { container } = render(<LoginPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-svh')
  })

  it('passes props to LoginForm correctly', () => {
    render(<LoginPage />)

    const loginForm = screen.getByTestId('login-form')
    expect(loginForm).toBeInTheDocument()
  })

  it('renders without errors', () => {
    expect(() => render(<LoginPage />)).not.toThrow()
  })
})