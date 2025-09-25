import { render, screen } from '@testing-library/react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

// Mock @radix-ui/react-popover
jest.mock('@radix-ui/react-popover', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-root">{children}</div>,
  Trigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="popover-trigger" {...props}>{children}</div>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-portal">{children}</div>,
  Content: ({ className, align, sideOffset, children, ...props }: { 
    className?: string; 
    align?: string; 
    sideOffset?: number; 
    children: React.ReactNode; 
    [key: string]: unknown 
  }) => (
    <div 
      data-testid="popover-content" 
      className={className} 
      data-align={align}
      data-side-offset={sideOffset}
      {...props}
    >
      {children}
    </div>
  )
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('Popover Components', () => {
  it('renders Popover', () => {
    render(
      <Popover>
        <div>Popover content</div>
      </Popover>
    )
    expect(screen.getByTestId('popover-root')).toBeInTheDocument()
  })

  it('renders PopoverTrigger', () => {
    render(
      <PopoverTrigger>
        <button>Open Popover</button>
      </PopoverTrigger>
    )
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('renders PopoverContent with default props', () => {
    render(
      <PopoverContent>
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute('data-align', 'center')
    expect(content).toHaveAttribute('data-side-offset', '4')
  })

  it('renders PopoverContent with custom align', () => {
    render(
      <PopoverContent align="start">
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-align', 'start')
  })

  it('renders PopoverContent with custom sideOffset', () => {
    render(
      <PopoverContent sideOffset={8}>
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-side-offset', '8')
  })

  it('applies custom className to PopoverContent', () => {
    render(
      <PopoverContent className="custom-class">
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content.className).toContain('custom-class')
  })

  it('applies default styling classes to PopoverContent', () => {
    render(
      <PopoverContent>
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content.className).toContain('z-50')
    expect(content.className).toContain('w-72')
    expect(content.className).toContain('rounded-md')
  })

  it('forwards props to PopoverContent', () => {
    render(
      <PopoverContent data-custom="test">
        <div>Content</div>
      </PopoverContent>
    )
    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-custom', 'test')
  })

  it('renders complete popover structure', () => {
    render(
      <Popover>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    )

    expect(screen.getByTestId('popover-root')).toBeInTheDocument()
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
    expect(screen.getByText('Trigger')).toBeInTheDocument()
    expect(screen.getByText('Popover Content')).toBeInTheDocument()
  })

  it('handles asChild prop on PopoverTrigger', () => {
    render(
      <PopoverTrigger asChild>
        <button>Custom Button</button>
      </PopoverTrigger>
    )
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })
})