import { render, screen } from '@testing-library/react'
import UpdatePasswordPage from '@/app/[locale]/auth/update-password/page'

// Mock UpdatePasswordForm component
jest.mock('@/components/update-password-form', () => ({
  UpdatePasswordForm: (props: any) => (
    <div data-testid="update-password-form" {...props}>
      Update Password Form Component
    </div>
  )
}))

describe('Update Password Page', () => {
  it('renders update password page with correct structure', () => {
    const { container } = render(<UpdatePasswordPage />)

    // Check main container
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    // Check inner container
    const innerDiv = mainDiv.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')
  })

  it('renders UpdatePasswordForm component', () => {
    render(<UpdatePasswordPage />)

    expect(screen.getByTestId('update-password-form')).toBeInTheDocument()
    expect(screen.getByText('Update Password Form Component')).toBeInTheDocument()
  })

  it('centers the form on the page', () => {
    const { container } = render(<UpdatePasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('items-center', 'justify-center')
  })

  it('applies responsive padding', () => {
    const { container } = render(<UpdatePasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('p-6', 'md:p-10')
  })

  it('constrains form width', () => {
    const { container } = render(<UpdatePasswordPage />)

    const innerDiv = container.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
  })

  it('uses correct viewport height', () => {
    const { container } = render(<UpdatePasswordPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-svh')
  })

  it('renders without errors', () => {
    expect(() => render(<UpdatePasswordPage />)).not.toThrow()
  })
})