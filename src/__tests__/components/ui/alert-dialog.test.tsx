import { render, screen } from '@testing-library/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Mock @radix-ui/react-alert-dialog
jest.mock('@radix-ui/react-alert-dialog', () => ({
  Root: ({ children, open }: any) => (
    <div data-testid="alert-dialog-root" data-open={open}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog-trigger" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children }: any) => <div data-testid="alert-dialog-portal">{children}</div>,
  Overlay: ({ className, ...props }: any) => (
    <div data-testid="alert-dialog-overlay" className={className} {...props} />
  ),
  Content: ({ className, children, ...props }: any) => (
    <div data-testid="alert-dialog-content" className={className} {...props}>
      {children}
    </div>
  ),
  Header: ({ className, children, ...props }: any) => (
    <div data-testid="alert-dialog-header" className={className} {...props}>
      {children}
    </div>
  ),
  Footer: ({ className, children, ...props }: any) => (
    <div data-testid="alert-dialog-footer" className={className} {...props}>
      {children}
    </div>
  ),
  Title: ({ className, children, ...props }: any) => (
    <div data-testid="alert-dialog-title" className={className} {...props}>
      {children}
    </div>
  ),
  Description: ({ className, children, ...props }: any) => (
    <div data-testid="alert-dialog-description" className={className} {...props}>
      {children}
    </div>
  ),
  Action: ({ className, children, ...props }: any) => (
    <button data-testid="alert-dialog-action" className={className} {...props}>
      {children}
    </button>
  ),
  Cancel: ({ className, children, ...props }: any) => (
    <button data-testid="alert-dialog-cancel" className={className} {...props}>
      {children}
    </button>
  ),
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('AlertDialog Components', () => {
  it('renders AlertDialog', () => {
    render(
      <AlertDialog>
        <div>Dialog content</div>
      </AlertDialog>
    )
    expect(screen.getByTestId('alert-dialog-root')).toBeInTheDocument()
  })

  it('renders AlertDialogTrigger', () => {
    render(
      <AlertDialogTrigger>
        <button>Open Dialog</button>
      </AlertDialogTrigger>
    )
    expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument()
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('renders AlertDialogContent with correct classes', () => {
    render(
      <AlertDialogContent>
        <div>Content</div>
      </AlertDialogContent>
    )
    const content = screen.getByTestId('alert-dialog-content')
    expect(content).toBeInTheDocument()
    expect(content.className).toContain('fixed')
    expect(content.className).toContain('left-[50%]')
    expect(content.className).toContain('top-[50%]')
  })

  it('renders AlertDialogHeader', () => {
    render(
      <AlertDialogHeader data-testid="alert-dialog-header">
        <div>Header content</div>
      </AlertDialogHeader>
    )
    const header = screen.getByTestId('alert-dialog-header')
    expect(header).toBeInTheDocument()
    expect(header.className).toContain('flex')
  })

  it('renders AlertDialogFooter', () => {
    render(
      <AlertDialogFooter data-testid="alert-dialog-footer">
        <div>Footer content</div>
      </AlertDialogFooter>
    )
    const footer = screen.getByTestId('alert-dialog-footer')
    expect(footer).toBeInTheDocument()
    expect(footer.className).toContain('flex')
  })

  it('renders AlertDialogTitle', () => {
    render(
      <AlertDialogTitle>Dialog Title</AlertDialogTitle>
    )
    const title = screen.getByTestId('alert-dialog-title')
    expect(title).toBeInTheDocument()
    expect(title.className).toContain('text-lg')
    expect(title).toHaveTextContent('Dialog Title')
  })

  it('renders AlertDialogDescription', () => {
    render(
      <AlertDialogDescription>Dialog Description</AlertDialogDescription>
    )
    const description = screen.getByTestId('alert-dialog-description')
    expect(description).toBeInTheDocument()
    expect(description.className).toContain('text-sm')
    expect(description).toHaveTextContent('Dialog Description')
  })

  it('renders AlertDialogAction', () => {
    render(
      <AlertDialogAction>Confirm</AlertDialogAction>
    )
    const action = screen.getByTestId('alert-dialog-action')
    expect(action).toBeInTheDocument()
    expect(action).toHaveTextContent('Confirm')
  })

  it('renders AlertDialogCancel', () => {
    render(
      <AlertDialogCancel>Cancel</AlertDialogCancel>
    )
    const cancel = screen.getByTestId('alert-dialog-cancel')
    expect(cancel).toBeInTheDocument()
    expect(cancel).toHaveTextContent('Cancel')
  })

  it('applies custom className', () => {
    render(
      <AlertDialogContent className="custom-class">
        Content
      </AlertDialogContent>
    )
    const content = screen.getByTestId('alert-dialog-content')
    expect(content.className).toContain('custom-class')
  })

  it('forwards props correctly', () => {
    render(
      <AlertDialogAction data-custom="test" onClick={() => {}}>
        Action
      </AlertDialogAction>
    )
    const action = screen.getByTestId('alert-dialog-action')
    expect(action).toHaveAttribute('data-custom', 'test')
  })
})