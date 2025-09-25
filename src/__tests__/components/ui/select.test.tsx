import { render, screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Root: jest.fn(({ children, ...props }) => (
    <div data-testid="select-root" {...props}>
      {children}
    </div>
  )),
  Group: jest.fn(({ children, ...props }) => (
    <div data-testid="select-group" {...props}>
      {children}
    </div>
  )),
  Value: jest.fn(({ children, placeholder, ...props }) => (
    <span data-testid="select-value" {...props}>
      {children || placeholder}
    </span>
  )),
  Trigger: jest.fn(({ children, ...props }) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  )),
  Portal: jest.fn(({ children }) => <div data-testid="select-portal">{children}</div>),
  Content: jest.fn(({ children, ...props }) => (
    <div data-testid="select-content" {...props}>
      {children}
    </div>
  )),
  Viewport: jest.fn(({ children, ...props }) => (
    <div data-testid="select-viewport" {...props}>
      {children}
    </div>
  )),
  Item: jest.fn(({ children, ...props }) => (
    <div data-testid="select-item" {...props}>
      {children}
    </div>
  )),
  ItemText: jest.fn(({ children, ...props }) => (
    <span data-testid="select-item-text" {...props}>
      {children}
    </span>
  )),
  ItemIndicator: jest.fn(({ children, ...props }) => (
    <span data-testid="select-item-indicator" {...props}>
      {children}
    </span>
  )),
  Label: jest.fn(({ children, ...props }) => (
    <div data-testid="select-label" {...props}>
      {children}
    </div>
  )),
  Separator: jest.fn((props) => <div data-testid="select-separator" {...props} />),
  ScrollUpButton: jest.fn(({ children, ...props }) => (
    <button data-testid="select-scroll-up" {...props}>
      {children}
    </button>
  )),
  ScrollDownButton: jest.fn(({ children, ...props }) => (
    <button data-testid="select-scroll-down" {...props}>
      {children}
    </button>
  )),
  Icon: jest.fn(({ children, asChild, ...props }) => {
    if (asChild) {
      return children
    }
    return <span data-testid="select-icon" {...props}>{children}</span>
  })
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckIcon: () => <span data-testid="check-icon" />,
  ChevronDownIcon: ({ className }: { className?: string }) => (
    <span data-testid="chevron-down-icon" className={className} />
  ),
  ChevronUpIcon: () => <span data-testid="chevron-up-icon" />
}))

describe('Select Components', () => {
  describe('Select', () => {
    it('renders select root component', () => {
      render(<Select>Select content</Select>)
      const select = screen.getByTestId('select-root')
      expect(select).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<Select>Select content</Select>)
      const select = screen.getByTestId('select-root')
      expect(select).toHaveAttribute('data-slot', 'select')
    })

    it('forwards props correctly', () => {
      render(<Select open={true} dir="ltr">Select content</Select>)
      const select = screen.getByTestId('select-root')
      expect(select).toHaveAttribute('open')
      expect(select).toHaveAttribute('dir', 'ltr')
    })
  })

  describe('SelectGroup', () => {
    it('renders select group component', () => {
      render(<SelectGroup>Group content</SelectGroup>)
      const group = screen.getByTestId('select-group')
      expect(group).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectGroup>Group content</SelectGroup>)
      const group = screen.getByTestId('select-group')
      expect(group).toHaveAttribute('data-slot', 'select-group')
    })
  })

  describe('SelectValue', () => {
    it('renders select value component', () => {
      render(<SelectValue placeholder="Select option" />)
      const value = screen.getByTestId('select-value')
      expect(value).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectValue placeholder="Select option" />)
      const value = screen.getByTestId('select-value')
      expect(value).toHaveAttribute('data-slot', 'select-value')
    })

    it('displays placeholder', () => {
      render(<SelectValue placeholder="Choose option" />)
      const value = screen.getByText('Choose option')
      expect(value).toBeInTheDocument()
    })
  })

  describe('SelectTrigger', () => {
    it('renders select trigger component', () => {
      render(<SelectTrigger>Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectTrigger>Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
    })

    it('applies default size', () => {
      render(<SelectTrigger>Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-size', 'default')
    })

    it('applies custom size', () => {
      render(<SelectTrigger size="sm">Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-size', 'sm')
    })

    it('applies default classes', () => {
      render(<SelectTrigger>Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('flex')
      expect(trigger).toHaveClass('w-fit')
      expect(trigger).toHaveClass('items-center')
      expect(trigger).toHaveClass('justify-between')
      expect(trigger).toHaveClass('gap-2')
      expect(trigger).toHaveClass('rounded-md')
      expect(trigger).toHaveClass('border')
    })

    it('accepts custom className', () => {
      render(<SelectTrigger className="custom-class">Trigger content</SelectTrigger>)
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('custom-class')
      expect(trigger).toHaveClass('flex') // Still has default classes
    })

    it('includes chevron down icon', () => {
      render(<SelectTrigger>Trigger content</SelectTrigger>)
      const icon = screen.getByTestId('chevron-down-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('size-4')
      expect(icon).toHaveClass('opacity-50')
    })
  })

  describe('SelectContent', () => {
    it('renders select content component', () => {
      render(<SelectContent>Content</SelectContent>)
      const content = screen.getByTestId('select-content')
      expect(content).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectContent>Content</SelectContent>)
      const content = screen.getByTestId('select-content')
      expect(content).toHaveAttribute('data-slot', 'select-content')
    })

    it('applies default classes', () => {
      render(<SelectContent>Content</SelectContent>)
      const content = screen.getByTestId('select-content')
      expect(content).toHaveClass('relative')
      expect(content).toHaveClass('z-50')
      expect(content).toHaveClass('min-w-[8rem]')
      expect(content).toHaveClass('rounded-md')
      expect(content).toHaveClass('border')
      expect(content).toHaveClass('shadow-md')
    })

    it('includes scroll buttons and viewport', () => {
      render(<SelectContent>Content</SelectContent>)
      expect(screen.getByTestId('select-scroll-up')).toBeInTheDocument()
      expect(screen.getByTestId('select-scroll-down')).toBeInTheDocument()
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument()
    })

    it('uses portal for rendering', () => {
      render(<SelectContent>Content</SelectContent>)
      expect(screen.getByTestId('select-portal')).toBeInTheDocument()
    })

    it('applies popper position classes by default', () => {
      render(<SelectContent>Content</SelectContent>)
      const content = screen.getByTestId('select-content')
      // Default position is "popper", so it should have position-specific classes
      expect(content).toHaveClass('data-[side=bottom]:translate-y-1')
    })

    it('handles different positions', () => {
      render(<SelectContent position="item-aligned">Content</SelectContent>)
      const content = screen.getByTestId('select-content')
      expect(content).toHaveAttribute('position', 'item-aligned')
    })
  })

  describe('SelectLabel', () => {
    it('renders select label component', () => {
      render(<SelectLabel>Label content</SelectLabel>)
      const label = screen.getByTestId('select-label')
      expect(label).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectLabel>Label content</SelectLabel>)
      const label = screen.getByTestId('select-label')
      expect(label).toHaveAttribute('data-slot', 'select-label')
    })

    it('applies default classes', () => {
      render(<SelectLabel>Label content</SelectLabel>)
      const label = screen.getByTestId('select-label')
      expect(label).toHaveClass('px-2')
      expect(label).toHaveClass('py-1.5')
      expect(label).toHaveClass('text-xs')
    })
  })

  describe('SelectItem', () => {
    it('renders select item component', () => {
      render(<SelectItem value="test">Item content</SelectItem>)
      const item = screen.getByTestId('select-item')
      expect(item).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectItem value="test">Item content</SelectItem>)
      const item = screen.getByTestId('select-item')
      expect(item).toHaveAttribute('data-slot', 'select-item')
    })

    it('applies default classes', () => {
      render(<SelectItem value="test">Item content</SelectItem>)
      const item = screen.getByTestId('select-item')
      expect(item).toHaveClass('relative')
      expect(item).toHaveClass('flex')
      expect(item).toHaveClass('w-full')
      expect(item).toHaveClass('cursor-default')
      expect(item).toHaveClass('items-center')
      expect(item).toHaveClass('gap-2')
      expect(item).toHaveClass('rounded-sm')
    })

    it('includes item indicator with check icon', () => {
      render(<SelectItem value="test">Item content</SelectItem>)
      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('includes item text', () => {
      render(<SelectItem value="test">Item content</SelectItem>)
      expect(screen.getByTestId('select-item-text')).toBeInTheDocument()
    })
  })

  describe('SelectSeparator', () => {
    it('renders select separator component', () => {
      render(<SelectSeparator />)
      const separator = screen.getByTestId('select-separator')
      expect(separator).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectSeparator />)
      const separator = screen.getByTestId('select-separator')
      expect(separator).toHaveAttribute('data-slot', 'select-separator')
    })

    it('applies default classes', () => {
      render(<SelectSeparator />)
      const separator = screen.getByTestId('select-separator')
      expect(separator).toHaveClass('pointer-events-none')
      expect(separator).toHaveClass('-mx-1')
      expect(separator).toHaveClass('my-1')
      expect(separator).toHaveClass('h-px')
    })
  })

  describe('SelectScrollUpButton', () => {
    it('renders scroll up button', () => {
      render(<SelectScrollUpButton />)
      const button = screen.getByTestId('select-scroll-up')
      expect(button).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectScrollUpButton />)
      const button = screen.getByTestId('select-scroll-up')
      expect(button).toHaveAttribute('data-slot', 'select-scroll-up-button')
    })

    it('includes chevron up icon', () => {
      render(<SelectScrollUpButton />)
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
    })
  })

  describe('SelectScrollDownButton', () => {
    it('renders scroll down button', () => {
      render(<SelectScrollDownButton />)
      const button = screen.getByTestId('select-scroll-down')
      expect(button).toBeInTheDocument()
    })

    it('applies data-slot attribute', () => {
      render(<SelectScrollDownButton />)
      const button = screen.getByTestId('select-scroll-down')
      expect(button).toHaveAttribute('data-slot', 'select-scroll-down-button')
    })

    it('includes chevron down icon', () => {
      render(<SelectScrollDownButton />)
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })
  })

  describe('Complete Select composition', () => {
    it('renders complete select structure', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectSeparator />
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )

      expect(screen.getByTestId('select-root')).toBeInTheDocument()
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('select-value')).toBeInTheDocument()
      expect(screen.getByTestId('select-content')).toBeInTheDocument()
      expect(screen.getByTestId('select-group')).toBeInTheDocument()
      expect(screen.getByTestId('select-label')).toBeInTheDocument()
      expect(screen.getAllByTestId('select-item')).toHaveLength(3)
      expect(screen.getByTestId('select-separator')).toBeInTheDocument()
    })

    it('supports accessibility attributes', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Choose option">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Choose option')
    })
  })
})