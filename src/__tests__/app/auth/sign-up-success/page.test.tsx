import { render, screen } from '@testing-library/react'
import SignUpSuccessPage from '@/app/auth/sign-up-success/page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Thank you for signing up!',
      'description': 'Check your email to confirm',
      'message': "You've successfully signed up. Please check your email to confirm your account before signing in."
    }
    return translations[key] || key
  })
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>{children}</div>
  )
}))

describe('Sign Up Success Page', () => {
  it('renders success page with thank you message', () => {
    render(<SignUpSuccessPage />)

    expect(screen.getByText('Thank you for signing up!')).toBeInTheDocument()
    expect(screen.getByText('Check your email to confirm')).toBeInTheDocument()
    expect(screen.getByText("You've successfully signed up. Please check your email to confirm your account before signing in.")).toBeInTheDocument()
  })

  it('renders with correct structure', () => {
    const { container } = render(<SignUpSuccessPage />)

    // Check main container
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    // Check inner container
    const innerDiv = mainDiv.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')

    // Check flex column div
    const flexColDiv = innerDiv?.querySelector('.flex.flex-col')
    expect(flexColDiv).toBeInTheDocument()
    expect(flexColDiv).toHaveClass('flex', 'flex-col', 'gap-6')
  })

  it('renders all card components', () => {
    render(<SignUpSuccessPage />)

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-description')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('applies correct CSS classes to title', () => {
    render(<SignUpSuccessPage />)

    const cardTitle = screen.getByTestId('card-title')
    expect(cardTitle).toHaveClass('text-2xl')
  })

  it('centers the card on the page', () => {
    const { container } = render(<SignUpSuccessPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('items-center', 'justify-center')
  })

  it('applies responsive padding', () => {
    const { container } = render(<SignUpSuccessPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('p-6', 'md:p-10')
  })

  it('constrains content width', () => {
    const { container } = render(<SignUpSuccessPage />)

    const innerDiv = container.querySelector('.w-full.max-w-sm')
    expect(innerDiv).toBeInTheDocument()
  })

  it('uses correct viewport height', () => {
    const { container } = render(<SignUpSuccessPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-svh')
  })

  it('renders without errors', () => {
    expect(() => render(<SignUpSuccessPage />)).not.toThrow()
  })

  it('contains proper text for email confirmation instructions', () => {
    render(<SignUpSuccessPage />)

    const instructionText = screen.getByText(/You've successfully signed up/)
    expect(instructionText).toBeInTheDocument()
    expect(instructionText).toHaveClass('text-sm')
  })
})