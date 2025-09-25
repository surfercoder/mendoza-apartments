import { render, screen } from '@testing-library/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card component', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-sm')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-class">Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('rounded-xl') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Card ref={ref}>Card content</Card>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })

    it('accepts other HTML attributes', () => {
      render(<Card data-testid="card" id="test-card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'test-card')
    })
  })

  describe('CardHeader', () => {
    it('renders card header component', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('gap-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('accepts custom className', () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardHeader ref={ref}>Header content</CardHeader>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardTitle', () => {
    it('renders card title component', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('accepts custom className', () => {
      render(<CardTitle className="custom-title">Title content</CardTitle>)
      const title = screen.getByText('Title content')
      expect(title).toHaveClass('custom-title')
      expect(title).toHaveClass('font-semibold') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardTitle ref={ref}>Title content</CardTitle>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardDescription', () => {
    it('renders card description component', () => {
      render(<CardDescription>Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardDescription>Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toHaveClass('text-sm')
    })

    it('accepts custom className', () => {
      render(<CardDescription className="custom-desc">Description content</CardDescription>)
      const description = screen.getByText('Description content')
      expect(description).toHaveClass('custom-desc')
      expect(description).toHaveClass('text-sm') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardDescription ref={ref}>Description content</CardDescription>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardContent', () => {
    it('renders card content component', () => {
      render(<CardContent>Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardContent>Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(<CardContent className="custom-content">Content text</CardContent>)
      const content = screen.getByText('Content text')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('p-6') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardContent ref={ref}>Content text</CardContent>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardFooter', () => {
    it('renders card footer component', () => {
      render(<CardFooter>Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardFooter>Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(<CardFooter className="custom-footer">Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-footer')
      expect(footer).toHaveClass('flex') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardFooter ref={ref}>Footer content</CardFooter>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('Card composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
          <CardFooter>
            <button>Test Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    })

    it('can render without all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Just Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Just content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Just Title')).toBeInTheDocument()
      expect(screen.getByText('Just content')).toBeInTheDocument()
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('supports nested components', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <span>Nested span</span>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Nested span')).toBeInTheDocument()
      expect(screen.getByText('List item 1')).toBeInTheDocument()
      expect(screen.getByText('List item 2')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <Card aria-label="Test card" role="article">
          <CardHeader>
            <CardTitle id="card-title">Accessible Title</CardTitle>
          </CardHeader>
          <CardContent aria-describedby="card-title">
            Accessible content
          </CardContent>
        </Card>
      )

      const card = screen.getByLabelText('Test card')
      expect(card).toHaveAttribute('role', 'article')

      const title = screen.getByText('Accessible Title')
      expect(title).toHaveAttribute('id', 'card-title')

      const content = screen.getByText('Accessible content')
      expect(content).toHaveAttribute('aria-describedby', 'card-title')
    })

    it('supports keyboard navigation when interactive', () => {
      render(
        <Card tabIndex={0} onClick={() => {}}>
          <CardContent>Interactive card</CardContent>
        </Card>
      )

      const card = screen.getByText('Interactive card').parentElement
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })
})