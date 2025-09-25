import { render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

// Mock @radix-ui/react-dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Root: jest.fn(({ children, ...props }) => (
    <div data-testid="dialog-root" {...props}>
      {children}
    </div>
  )),
  Trigger: jest.fn(({ children, ...props }) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  )),
  Portal: jest.fn(({ children, ...props }) => (
    <div data-testid="dialog-portal" {...props}>
      {children}
    </div>
  )),
  Close: jest.fn(({ children, ...props }) => (
    <button data-testid="dialog-close" {...props}>
      {children}
    </button>
  )),
  Overlay: jest.fn((props) => (
    <div data-testid="dialog-overlay" {...props} />
  )),
  Content: jest.fn(({ children, ...props }) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  )),
  Title: jest.fn(({ children, ...props }) => (
    <h2 data-testid="dialog-title" {...props}>
      {children}
    </h2>
  )),
  Description: jest.fn(({ children, ...props }) => (
    <p data-testid="dialog-description" {...props}>
      {children}
    </p>
  ))
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  XIcon: () => <span data-testid="x-icon" />
}))

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('renders dialog root component', () => {
      render(<Dialog>Dialog content</Dialog>)
      const dialog = screen.getByTestId('dialog-root')
      expect(dialog).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<Dialog>Dialog content</Dialog>)
      const dialog = screen.getByTestId('dialog-root')
      expect(dialog).toHaveAttribute('data-slot', 'dialog')
    })

    it('forwards props correctly', () => {
      render(<Dialog open={true}>Dialog content</Dialog>)
      const dialog = screen.getByTestId('dialog-root')
      expect(dialog).toHaveAttribute('open')
    })
  })

  describe('DialogTrigger', () => {
    it('renders dialog trigger component', () => {
      render(<DialogTrigger>Open Dialog</DialogTrigger>)
      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogTrigger>Open Dialog</DialogTrigger>)
      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger).toHaveAttribute('data-slot', 'dialog-trigger')
    })

    it('renders trigger content', () => {
      render(<DialogTrigger>Open Dialog</DialogTrigger>)
      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
    })
  })

  describe('DialogPortal', () => {
    it('renders dialog portal component', () => {
      render(<DialogPortal>Portal content</DialogPortal>)
      const portal = screen.getByTestId('dialog-portal')
      expect(portal).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogPortal>Portal content</DialogPortal>)
      const portal = screen.getByTestId('dialog-portal')
      expect(portal).toHaveAttribute('data-slot', 'dialog-portal')
    })
  })

  describe('DialogClose', () => {
    it('renders dialog close component', () => {
      render(<DialogClose>Close</DialogClose>)
      const close = screen.getByTestId('dialog-close')
      expect(close).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogClose>Close</DialogClose>)
      const close = screen.getByTestId('dialog-close')
      expect(close).toHaveAttribute('data-slot', 'dialog-close')
    })

    it('renders close content', () => {
      render(<DialogClose>Close Dialog</DialogClose>)
      expect(screen.getByText('Close Dialog')).toBeInTheDocument()
    })
  })

  describe('DialogOverlay', () => {
    it('renders dialog overlay component', () => {
      render(<DialogOverlay />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogOverlay />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveAttribute('data-slot', 'dialog-overlay')
    })

    it('applies default classes', () => {
      render(<DialogOverlay />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('fixed')
      expect(overlay).toHaveClass('inset-0')
      expect(overlay).toHaveClass('z-50')
      expect(overlay).toHaveClass('bg-black/50')
    })

    it('accepts custom className', () => {
      render(<DialogOverlay className="custom-overlay" />)
      const overlay = screen.getByTestId('dialog-overlay')
      expect(overlay).toHaveClass('custom-overlay')
      expect(overlay).toHaveClass('fixed') // Still has default classes
    })
  })

  describe('DialogContent', () => {
    it('renders dialog content component', () => {
      render(<DialogContent>Content</DialogContent>)
      const content = screen.getByTestId('dialog-content')
      expect(content).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogContent>Content</DialogContent>)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('data-slot', 'dialog-content')
    })

    it('applies default classes', () => {
      render(<DialogContent>Content</DialogContent>)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('fixed')
      expect(content).toHaveClass('top-[50%]')
      expect(content).toHaveClass('left-[50%]')
      expect(content).toHaveClass('z-50')
      expect(content).toHaveClass('grid')
      expect(content).toHaveClass('w-full')
      expect(content).toHaveClass('translate-x-[-50%]')
      expect(content).toHaveClass('translate-y-[-50%]')
      expect(content).toHaveClass('gap-4')
      expect(content).toHaveClass('rounded-lg')
      expect(content).toHaveClass('border')
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('shadow-lg')
    })

    it('includes portal and overlay', () => {
      render(<DialogContent>Content</DialogContent>)
      expect(screen.getByTestId('dialog-portal')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-overlay')).toBeInTheDocument()
    })

    it('shows close button by default', () => {
      render(<DialogContent>Content</DialogContent>)
      const closeButtons = screen.getAllByTestId('dialog-close')
      expect(closeButtons).toHaveLength(1)
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('hides close button when showCloseButton is false', () => {
      render(<DialogContent showCloseButton={false}>Content</DialogContent>)
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('accepts custom className', () => {
      render(<DialogContent className="custom-content">Content</DialogContent>)
      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('fixed') // Still has default classes
    })

    it('renders content children', () => {
      render(<DialogContent>Test Content</DialogContent>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('DialogHeader', () => {
    it('renders dialog header component', () => {
      render(<DialogHeader>Header content</DialogHeader>)
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogHeader data-testid="dialog-header">Header content</DialogHeader>)
      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveAttribute('data-slot', 'dialog-header')
    })

    it('applies default classes', () => {
      render(<DialogHeader data-testid="dialog-header">Header content</DialogHeader>)
      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('gap-2')
      expect(header).toHaveClass('text-center')
      expect(header).toHaveClass('sm:text-left')
    })
  })

  describe('DialogFooter', () => {
    it('renders dialog footer component', () => {
      render(<DialogFooter>Footer content</DialogFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogFooter data-testid="dialog-footer">Footer content</DialogFooter>)
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveAttribute('data-slot', 'dialog-footer')
    })

    it('applies default classes', () => {
      render(<DialogFooter data-testid="dialog-footer">Footer content</DialogFooter>)
      const footer = screen.getByTestId('dialog-footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('flex-col-reverse')
      expect(footer).toHaveClass('gap-2')
      expect(footer).toHaveClass('sm:flex-row')
      expect(footer).toHaveClass('sm:justify-end')
    })
  })

  describe('DialogTitle', () => {
    it('renders dialog title component', () => {
      render(<DialogTitle>Dialog Title</DialogTitle>)
      const title = screen.getByTestId('dialog-title')
      expect(title).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogTitle>Dialog Title</DialogTitle>)
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveAttribute('data-slot', 'dialog-title')
    })

    it('applies default classes', () => {
      render(<DialogTitle>Dialog Title</DialogTitle>)
      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('font-semibold')
    })

    it('renders title content', () => {
      render(<DialogTitle>My Dialog Title</DialogTitle>)
      expect(screen.getByText('My Dialog Title')).toBeInTheDocument()
    })
  })

  describe('DialogDescription', () => {
    it('renders dialog description component', () => {
      render(<DialogDescription>Dialog description</DialogDescription>)
      const description = screen.getByTestId('dialog-description')
      expect(description).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<DialogDescription>Dialog description</DialogDescription>)
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveAttribute('data-slot', 'dialog-description')
    })

    it('applies default classes', () => {
      render(<DialogDescription>Dialog description</DialogDescription>)
      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveClass('text-sm')
    })

    it('renders description content', () => {
      render(<DialogDescription>This is a description</DialogDescription>)
      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })
  })

  describe('Complete Dialog composition', () => {
    it('renders complete dialog structure', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog Description</DialogDescription>
            </DialogHeader>
            <div>Dialog Body Content</div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Description')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('supports accessibility attributes', () => {
      render(
        <Dialog>
          <DialogTrigger aria-label="Open settings dialog">Settings</DialogTrigger>
          <DialogContent aria-describedby="dialog-desc">
            <DialogTitle id="dialog-title">Settings</DialogTitle>
            <DialogDescription id="dialog-desc">
              Configure your settings
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const trigger = screen.getByTestId('dialog-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Open settings dialog')

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('aria-describedby', 'dialog-desc')

      const title = screen.getByTestId('dialog-title')
      expect(title).toHaveAttribute('id', 'dialog-title')

      const description = screen.getByTestId('dialog-description')
      expect(description).toHaveAttribute('id', 'dialog-desc')
    })

    it('can render without close button', () => {
      render(
        <Dialog>
          <DialogContent showCloseButton={false}>
            <DialogTitle>No Close Button</DialogTitle>
            <DialogFooter>
              <DialogClose>Custom Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      // Should only have one close button (the custom one)
      const closeButtons = screen.getAllByTestId('dialog-close')
      expect(closeButtons).toHaveLength(1)
      expect(screen.getByText('Custom Close')).toBeInTheDocument()
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })
  })
})