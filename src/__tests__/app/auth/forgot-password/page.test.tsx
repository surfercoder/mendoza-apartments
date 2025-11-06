import { render, screen } from '@testing-library/react'
import ForgotPasswordPage from '@/app/[locale]/auth/forgot-password/page'

// Mock ForgotPasswordForm component
jest.mock('@/components/forgot-password-form', () => ({
  ForgotPasswordForm: (props: any) => (
    <div data-testid="forgot-password-form" {...props}>
      Forgot Password Form Component
    </div>
  )
}))

describe('Forgot Password Page', () => {
  it('renders forgot password page with correct structure', () => {
    const { container } = render(<ForgotPasswordPage />)

    // Check main container
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    // Check inner container
    const innerDiv = mainDiv.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')
  })

  it('renders ForgotPasswordForm component', () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
    expect(screen.getByText('Forgot Password Form Component')).toBeInTheDocument()
  })

  it('centers the form on the page', () => {
    const { container } = render(<ForgotPasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('items-center', 'justify-center')
  })

  it('applies responsive padding', () => {
    const { container } = render(<ForgotPasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('p-6', 'md:p-10')
  })

  it('constrains form width', () => {
    const { container } = render(<ForgotPasswordPage />)

    const innerDiv = container.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
  })

  it('uses correct viewport height', () => {
    const { container } = render(<ForgotPasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-svh')
  })

  it('renders without errors', () => {
    expect(() => render(<ForgotPasswordPage />)).not.toThrow()
  })
})