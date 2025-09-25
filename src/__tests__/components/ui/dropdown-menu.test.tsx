import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu'

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: any) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children, ...props }: any) => (
    <div data-testid="dropdown-trigger" {...props}>{children}</div>
  ),
  Content: ({ className, sideOffset, children, ...props }: any) => (
    <div data-testid="dropdown-content" className={className} data-side-offset={sideOffset} {...props}>
      {children}
    </div>
  ),
  Item: ({ className, inset, children, ...props }: any) => (
    <div data-testid="dropdown-item" className={className} data-inset={inset} {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({ className, children, checked, ...props }: any) => (
    <div data-testid="dropdown-checkbox-item" className={className} data-checked={checked} {...props}>
      {children}
    </div>
  ),
  RadioItem: ({ className, children, ...props }: any) => (
    <div data-testid="dropdown-radio-item" className={className} {...props}>
      {children}
    </div>
  ),
  Label: ({ className, inset, children, ...props }: any) => (
    <div data-testid="dropdown-label" className={className} data-inset={inset} {...props}>
      {children}
    </div>
  ),
  Separator: ({ className, ...props }: any) => (
    <div data-testid="dropdown-separator" className={className} {...props} />
  ),
  Group: ({ children }: any) => <div data-testid="dropdown-group">{children}</div>,
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  Sub: ({ children }: any) => <div data-testid="dropdown-sub">{children}</div>,
  SubContent: ({ className, children, ...props }: any) => (
    <div data-testid="dropdown-sub-content" className={className} {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ className, inset, children, ...props }: any) => (
    <div data-testid="dropdown-sub-trigger" className={className} data-inset={inset} {...props}>
      {children}
    </div>
  ),
  RadioGroup: ({ children }: any) => <div data-testid="dropdown-radio-group">{children}</div>,
  ItemIndicator: ({ children }: any) => <div data-testid="dropdown-item-indicator">{children}</div>,
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  ChevronRightIcon: () => <div data-testid="chevron-right" />,
  CircleIcon: () => <div data-testid="circle-icon" />
}))

describe('DropdownMenu Components', () => {
  it('renders DropdownMenu', () => {
    render(
      <DropdownMenu>
        <div>Menu content</div>
      </DropdownMenu>
    )
    expect(screen.getByTestId('dropdown-root')).toBeInTheDocument()
  })

  it('renders DropdownMenuTrigger', () => {
    render(
      <DropdownMenuTrigger>
        <button>Open Menu</button>
      </DropdownMenuTrigger>
    )
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
  })

  it('renders DropdownMenuContent with correct props', () => {
    render(
      <DropdownMenuContent>
        <div>Content</div>
      </DropdownMenuContent>
    )
    const content = screen.getByTestId('dropdown-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute('data-side-offset', '4')
  })

  it('renders DropdownMenuItem', () => {
    render(
      <DropdownMenuItem inset>
        Menu Item
      </DropdownMenuItem>
    )
    const item = screen.getByTestId('dropdown-item')
    expect(item).toBeInTheDocument()
    expect(item).toHaveAttribute('data-inset', 'true')
  })

  it('renders DropdownMenuCheckboxItem', () => {
    render(
      <DropdownMenuCheckboxItem checked={true}>
        Checkbox Item
      </DropdownMenuCheckboxItem>
    )
    const item = screen.getByTestId('dropdown-checkbox-item')
    expect(item).toBeInTheDocument()
    expect(item).toHaveAttribute('data-checked', 'true')
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('renders DropdownMenuRadioItem', () => {
    render(
      <DropdownMenuRadioItem value="test">
        Radio Item
      </DropdownMenuRadioItem>
    )
    const item = screen.getByTestId('dropdown-radio-item')
    expect(item).toBeInTheDocument()
    expect(screen.getByTestId('circle-icon')).toBeInTheDocument()
  })

  it('renders DropdownMenuLabel', () => {
    render(
      <DropdownMenuLabel inset>
        Label
      </DropdownMenuLabel>
    )
    const label = screen.getByTestId('dropdown-label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('data-inset', 'true')
  })

  it('renders DropdownMenuSeparator', () => {
    render(<DropdownMenuSeparator />)
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument()
  })

  it('renders DropdownMenuShortcut', () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>)
    const shortcut = screen.getByText('⌘K')
    expect(shortcut).toBeInTheDocument()
    expect(shortcut.className).toContain('ml-auto')
  })

  it('renders DropdownMenuGroup', () => {
    render(
      <DropdownMenuGroup>
        <div>Group content</div>
      </DropdownMenuGroup>
    )
    expect(screen.getByTestId('dropdown-group')).toBeInTheDocument()
  })

  it('renders DropdownMenuPortal', () => {
    render(
      <DropdownMenuPortal>
        <div>Portal content</div>
      </DropdownMenuPortal>
    )
    expect(screen.getByTestId('dropdown-portal')).toBeInTheDocument()
  })

  it('renders DropdownMenuSub', () => {
    render(
      <DropdownMenuSub>
        <div>Sub content</div>
      </DropdownMenuSub>
    )
    expect(screen.getByTestId('dropdown-sub')).toBeInTheDocument()
  })

  it('renders DropdownMenuSubContent', () => {
    render(
      <DropdownMenuSubContent>
        <div>Sub content</div>
      </DropdownMenuSubContent>
    )
    expect(screen.getByTestId('dropdown-sub-content')).toBeInTheDocument()
  })

  it('renders DropdownMenuSubTrigger', () => {
    render(
      <DropdownMenuSubTrigger>
        Sub Trigger
      </DropdownMenuSubTrigger>
    )
    const trigger = screen.getByTestId('dropdown-sub-trigger')
    expect(trigger).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
  })

  it('renders DropdownMenuRadioGroup', () => {
    render(
      <DropdownMenuRadioGroup>
        <div>Radio group content</div>
      </DropdownMenuRadioGroup>
    )
    expect(screen.getByTestId('dropdown-radio-group')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <DropdownMenuContent className="custom-class">
        Content
      </DropdownMenuContent>
    )
    const content = screen.getByTestId('dropdown-content')
    expect(content.className).toContain('custom-class')
  })
})