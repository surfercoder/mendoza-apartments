import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {},
    formState: { errors: {} },
  })),
  Controller: ({ render, name }: any) => render({
    field: { name, onChange: jest.fn(), onBlur: jest.fn(), value: '' },
    fieldState: { error: null },
    formState: { errors: {} }
  }),
  useFormContext: jest.fn(() => ({
    formState: { errors: {} },
    getFieldState: jest.fn(() => ({ error: null }))
  })),
  useFormState: jest.fn(() => ({ errors: {} })),
  FormProvider: ({ children }: any) => <div data-testid="form-provider">{children}</div>
}))

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Root: ({ className, children, ...props }: any) => (
    <label data-testid="label-root" className={className} {...props}>
      {children}
    </label>
  )
}))

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div data-testid="slot" {...props}>{children}</div>
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Form Components', () => {
  const TestComponent = () => {
    const form = useForm()
    return (
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="test"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Label</FormLabel>
                <FormControl>
                  <input {...field} data-testid="test-input" />
                </FormControl>
                <FormDescription>Test description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }

  it('renders Form component', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('form-provider')).toBeInTheDocument()
  })

  it('renders FormItem', () => {
    render(
      <FormItem>
        <div>Form item content</div>
      </FormItem>
    )
    
    const formItem = screen.getByText('Form item content').parentElement
    expect(formItem?.className).toContain('grid gap-2')
  })

  it('renders FormLabel', () => {
    render(
      <FormLabel>
        Test Label
      </FormLabel>
    )
    
    expect(screen.getByTestId('label-root')).toBeInTheDocument()
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders FormControl', () => {
    render(
      <FormControl>
        <input data-testid="control-input" />
      </FormControl>
    )
    
    expect(screen.getByTestId('slot')).toBeInTheDocument()
    expect(screen.getByTestId('control-input')).toBeInTheDocument()
  })

  it('renders FormDescription', () => {
    render(
      <FormDescription>
        This is a description
      </FormDescription>
    )
    
    const description = screen.getByText('This is a description')
    expect(description).toBeInTheDocument()
    expect(description.className).toContain('text-sm')
    expect(description.className).toContain('text-muted-foreground')
  })

  it('renders FormMessage', () => {
    render(
      <FormMessage>
        Error message
      </FormMessage>
    )
    
    const message = screen.getByText('Error message')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('text-sm')
    expect(message.className).toContain('text-destructive')
  })

  it('renders complete form structure', () => {
    render(<TestComponent />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('applies custom className to FormItem', () => {
    render(
      <FormItem className="custom-form-item" data-testid="form-item">
        Content
      </FormItem>
    )

    const formItem = screen.getByTestId('form-item')
    expect(formItem.className).toContain('custom-form-item')
  })

  it('applies custom className to FormLabel', () => {
    render(
      <FormLabel className="custom-label">
        Label
      </FormLabel>
    )
    
    const label = screen.getByTestId('label-root')
    expect(label.className).toContain('custom-label')
  })

  it('applies custom className to FormDescription', () => {
    render(
      <FormDescription className="custom-description">
        Description
      </FormDescription>
    )
    
    const description = screen.getByText('Description')
    expect(description.className).toContain('custom-description')
  })

  it('applies custom className to FormMessage', () => {
    render(
      <FormMessage className="custom-message">
        Message
      </FormMessage>
    )
    
    const message = screen.getByText('Message')
    expect(message.className).toContain('custom-message')
  })

  it('renders empty FormMessage when no children', () => {
    render(<FormMessage />)
    
    // Should render but be empty
    const messages = screen.queryByText(/.+/)
    expect(messages).toBeNull()
  })
})