import { render, screen } from '@testing-library/react'
import ErrorPage from '@/app/auth/error/page'

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      'title': 'Sorry, something went wrong.',
      'codeError': `Code error: ${params?.error || ''}`,
      'unspecified': 'An unspecified error occurred.'
    }
    if (key === 'codeError' && params?.error) {
      return `Code error: ${params.error}`
    }
    return translations[key] || key
  })
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>{children}</div>
  )
}))

describe('Auth Error Page', () => {
  it('renders error page with generic message when no error provided', async () => {
    const searchParams = Promise.resolve({ error: undefined } as any)

    const { container } = render(await ErrorPage({ searchParams }))

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('An unspecified error occurred.')).toBeInTheDocument()

    // Check page structure
    const mainDiv = container.querySelector('.flex.min-h-svh')
    expect(mainDiv).toBeInTheDocument()
    expect(mainDiv).toHaveClass('min-h-svh', 'w-full', 'items-center', 'justify-center')

    const maxWidthDiv = mainDiv?.querySelector('.w-full.max-w-sm')
    expect(maxWidthDiv).toBeInTheDocument()

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('renders error page with specific error message when error provided', async () => {
    const searchParams = Promise.resolve({ error: 'Token has expired' })

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('Code error: Token has expired')).toBeInTheDocument()
    expect(screen.queryByText('An unspecified error occurred.')).not.toBeInTheDocument()
  })

  it('renders error page with empty string error', async () => {
    const searchParams = Promise.resolve({ error: '' })

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('An unspecified error occurred.')).toBeInTheDocument()
    expect(screen.queryByText('Code error:')).not.toBeInTheDocument()
  })

  it('renders error page with complex error message', async () => {
    const complexError = 'Invalid credentials: Email not confirmed or password incorrect'
    const searchParams = Promise.resolve({ error: complexError })

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
    expect(screen.getByText(`Code error: ${complexError}`)).toBeInTheDocument()
  })

  it('handles URL encoded error messages', async () => {
    const encodedError = 'Token invalid & expired'
    const searchParams = Promise.resolve({ error: encodedError })

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText(`Code error: ${encodedError}`)).toBeInTheDocument()
  })

  it('applies correct CSS classes', async () => {
    const searchParams = Promise.resolve({ error: 'Test error' })

    const { container } = render(await ErrorPage({ searchParams }))

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'min-h-svh', 'w-full', 'items-center', 'justify-center', 'p-6', 'md:p-10')

    const innerDiv = mainDiv.querySelector('.w-full')
    expect(innerDiv).toHaveClass('w-full', 'max-w-sm')

    const flexColDiv = innerDiv?.querySelector('.flex.flex-col')
    expect(flexColDiv).toHaveClass('flex', 'flex-col', 'gap-6')

    const cardTitle = screen.getByTestId('card-title')
    expect(cardTitle).toHaveClass('text-2xl')
  })

  it('handles null/undefined search params gracefully', async () => {
    const searchParams = Promise.resolve(null as any)

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('An unspecified error occurred.')).toBeInTheDocument()
  })

  it('handles search params promise rejection', async () => {
    const searchParams = Promise.reject(new Error('Failed to load params'))

    await expect(ErrorPage({ searchParams })).rejects.toThrow('Failed to load params')
  })

  it('renders correctly with falsy but defined error', async () => {
    const searchParams = Promise.resolve({ error: 0 as any })

    render(await ErrorPage({ searchParams }))

    expect(screen.getByText('An unspecified error occurred.')).toBeInTheDocument()
    expect(screen.queryByText('Code error:')).not.toBeInTheDocument()
  })

  it('renders correctly with whitespace-only error', async () => {
    const searchParams = Promise.resolve({ error: '   ' })

    render(await ErrorPage({ searchParams }))

    // Use function matcher to handle text spread across multiple elements, targeting the <p> element
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Code error:    '
    })).toBeInTheDocument()
  })
})