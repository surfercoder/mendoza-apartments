import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

// Mock embla-carousel-react
const mockScrollPrev = jest.fn();
const mockScrollNext = jest.fn();
const mockCanScrollPrev = jest.fn(() => true);
const mockCanScrollNext = jest.fn(() => true);
const mockOn = jest.fn();
const mockOff = jest.fn();

const mockEmblaApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  on: mockOn,
  off: mockOff,
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [jest.fn(), mockEmblaApi]),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left">Left Arrow</div>,
  ArrowRight: () => <div data-testid="arrow-right">Right Arrow</div>,
}));

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Carousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders carousel with children', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByRole('region');
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('renders carousel items with correct role', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const items = screen.getAllByRole('group');
    expect(items).toHaveLength(2);
    items.forEach(item => {
      expect(item).toHaveAttribute('aria-roledescription', 'slide');
    });
  });

  it('applies custom className to Carousel', () => {
    render(
      <Carousel className="custom-carousel">
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByRole('region');
    expect(carousel.className).toContain('custom-carousel');
  });

  it('applies custom className to CarouselContent', () => {
    render(
      <Carousel>
        <CarouselContent className="custom-content">
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const content = screen.getByRole('region').querySelector('[data-slot="carousel-content"]')?.firstChild as HTMLElement;
    expect(content?.className).toContain('custom-content');
  });

  it('applies custom className to CarouselItem', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem className="custom-item">Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const item = screen.getByRole('group');
    expect(item.className).toContain('custom-item');
  });

  it('sets horizontal orientation by default', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    // Horizontal orientation should apply -ml-4 class to content
    const contentWrapper = screen.getByRole('region').querySelector('[data-slot="carousel-content"]')?.firstChild as HTMLElement;
    expect(contentWrapper?.className).toContain('-ml-4');
  });

  it('sets vertical orientation when specified', () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    // Vertical orientation should apply -mt-4 flex-col classes to content
    const contentWrapper = screen.getByRole('region').querySelector('[data-slot="carousel-content"]')?.firstChild as HTMLElement;
    expect(contentWrapper?.className).toContain('-mt-4');
    expect(contentWrapper?.className).toContain('flex-col');
  });

  it('handles keyboard navigation with arrow keys', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByRole('region');

    // Simulate ArrowLeft key press
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(mockScrollPrev).toHaveBeenCalled();

    // Simulate ArrowRight key press
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(mockScrollNext).toHaveBeenCalled();
  });

  it('prevents default behavior on arrow key press', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByRole('region');
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    carousel.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('forwards additional props to carousel container', () => {
    render(
      <Carousel data-testid="custom-carousel" id="my-carousel">
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    const carousel = screen.getByTestId('custom-carousel');
    expect(carousel).toHaveAttribute('id', 'my-carousel');
  });
});

describe('CarouselPrevious', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders previous button', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    expect(button).toBeInTheDocument();
  });

  it('displays left arrow icon', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    expect(screen.getByTestId('arrow-left')).toBeInTheDocument();
  });

  it('calls scrollPrev when clicked', async () => {
    const user = userEvent.setup();

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    await user.click(button);

    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it('is disabled when cannot scroll prev', () => {
    mockCanScrollPrev.mockReturnValue(false);

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    expect(button).toBeDisabled();
  });

  it('is enabled when can scroll prev', () => {
    mockCanScrollPrev.mockReturnValue(true);

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    expect(button).not.toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="custom-prev" />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    expect(button.className).toContain('custom-prev');
  });

  it('accepts custom variant prop', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious variant="ghost" />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /previous slide/i });
    expect(button).toBeInTheDocument();
  });

  it('has sr-only text for accessibility', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );

    const srText = screen.getByText('Previous slide');
    expect(srText.className).toContain('sr-only');
  });
});

describe('CarouselNext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders next button', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    expect(button).toBeInTheDocument();
  });

  it('displays right arrow icon', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByTestId('arrow-right')).toBeInTheDocument();
  });

  it('calls scrollNext when clicked', async () => {
    const user = userEvent.setup();

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    await user.click(button);

    expect(mockScrollNext).toHaveBeenCalled();
  });

  it('is disabled when cannot scroll next', () => {
    mockCanScrollNext.mockReturnValue(false);

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    expect(button).toBeDisabled();
  });

  it('is enabled when can scroll next', () => {
    mockCanScrollNext.mockReturnValue(true);

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    expect(button).not.toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext className="custom-next" />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    expect(button.className).toContain('custom-next');
  });

  it('accepts custom variant prop', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext variant="ghost" />
      </Carousel>
    );

    const button = screen.getByRole('button', { name: /next slide/i });
    expect(button).toBeInTheDocument();
  });

  it('has sr-only text for accessibility', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );

    const srText = screen.getByText('Next slide');
    expect(srText.className).toContain('sr-only');
  });
});

describe('Carousel integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders complete carousel with all components', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
          <CarouselItem>Item 3</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
  });

  it('supports setApi callback', () => {
    const setApi = jest.fn();

    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    // setApi should be called with the Embla API
    expect(setApi).toHaveBeenCalledWith(mockEmblaApi);
  });

  it('registers event listeners on mount', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(mockOn).toHaveBeenCalledWith('reInit', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('select', expect.any(Function));
  });

  it('throws error when using carousel hooks outside context', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<CarouselPrevious />);
    }).toThrow('useCarousel must be used within a <Carousel />');

    console.error = originalError;
  });

  it('handles multiple carousel items with different content', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div>Card 1</div>
          </CarouselItem>
          <CarouselItem>
            <img alt="Image 2" src="/image.jpg" />
          </CarouselItem>
          <CarouselItem>
            <button>Button 3</button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 3' })).toBeInTheDocument();
  });
});
