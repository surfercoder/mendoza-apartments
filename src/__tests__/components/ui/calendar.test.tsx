import { render, screen } from '@testing-library/react'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import React from 'react'

// Mock functions will be defined inside the mock

// Mock react-day-picker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ className, showOutsideDays, captionLayout, formatters, components, ...props }: any) => {
    // Test formatters if provided
    const testDate = new Date(2024, 0, 1) // January 1, 2024
    const formattedMonth = formatters?.formatMonthDropdown?.(testDate)

    return (
      <div
        data-testid="day-picker"
        className={className}
        data-show-outside-days={showOutsideDays}
        data-caption-layout={captionLayout}
        data-formatted-month={formattedMonth}
        {...props}
      >
        <div data-testid="day-picker-content">
          {/* Test Root component */}
          {components?.Root && (
            <components.Root
              className="test-root-class"
              rootRef={React.createRef()}
              data-testid="custom-root"
            />
          )}

          {/* Test Chevron components */}
          {components?.Chevron && (
            <div data-testid="chevron-container">
              <components.Chevron orientation="left" className="test-chevron" data-testid="chevron-left" />
              <components.Chevron orientation="right" className="test-chevron" data-testid="chevron-right" />
              <components.Chevron orientation="down" className="test-chevron" data-testid="chevron-down" />
            </div>
          )}

          {/* Test WeekNumber component */}
          {components?.WeekNumber && (
            <components.WeekNumber data-testid="week-number">
              Week 1
            </components.WeekNumber>
          )}

          {/* Test DayButton component */}
          {components?.DayButton && (
            <components.DayButton
              day={{ date: testDate }}
              modifiers={{}}
              className="test-day-button"
              data-testid="day-button"
            />
          )}
        </div>
      </div>
    )
  },
  DayButton: ({ className, day, ...props }: any) => (
    <button
      className={className}
      data-testid="mock-day-button"
      data-day={day?.date?.toLocaleDateString()}
      {...props}
    >
      {day?.date?.getDate()}
    </button>
  ),
  getDefaultClassNames: jest.fn(() => ({
    root: 'rdp-root',
    months: 'rdp-months',
    month: 'rdp-month',
    nav: 'rdp-nav',
    button_previous: 'rdp-button-previous',
    button_next: 'rdp-button-next',
    month_caption: 'rdp-month-caption',
    dropdowns: 'rdp-dropdowns',
    dropdown_root: 'rdp-dropdown-root',
    dropdown: 'rdp-dropdown',
    caption_label: 'rdp-caption-label',
    weekdays: 'rdp-weekdays',
    weekday: 'rdp-weekday',
    week: 'rdp-week',
    week_number_header: 'rdp-week-number-header',
    week_number: 'rdp-week-number',
    day: 'rdp-day',
    range_start: 'rdp-range-start',
    range_middle: 'rdp-range-middle',
    range_end: 'rdp-range-end',
    today: 'rdp-today',
    outside: 'rdp-outside',
    disabled: 'rdp-disabled',
    hidden: 'rdp-hidden'
  }))
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronLeftIcon: ({ className, ...props }: any) => (
    <div data-testid="chevron-left-icon" className={className} {...props} />
  ),
  ChevronRightIcon: ({ className, ...props }: any) => (
    <div data-testid="chevron-right-icon" className={className} {...props} />
  ),
  ChevronDownIcon: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props} />
  )
}))

// Mock button component
jest.mock('@/components/ui/button', () => ({
  Button: function MockButton({ children, variant, size, className, ...props }: any) {
    return (
      <button
        data-testid="button"
        data-variant={variant}
        data-size={size}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  },
  buttonVariants: ({ variant }: any) => `button-variant-${variant}`
}))

import { getDefaultClassNames } from 'react-day-picker'
const mockGetDefaultClassNames = getDefaultClassNames as jest.MockedFunction<typeof getDefaultClassNames>

describe('Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders calendar component', () => {
    render(<Calendar />)
    expect(screen.getByTestId('day-picker')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Calendar className="custom-class" />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar.className).toContain('custom-class')
  })

  it('sets showOutsideDays to true by default', () => {
    render(<Calendar />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-show-outside-days', 'true')
  })

  it('allows overriding showOutsideDays', () => {
    render(<Calendar showOutsideDays={false} />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-show-outside-days', 'false')
  })

  it('forwards props to DayPicker', () => {
    render(<Calendar mode="single" disabled />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('mode', 'single')
    expect(calendar).toHaveAttribute('disabled')
  })

  it('applies default styling classes', () => {
    render(<Calendar />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar.className).toContain('p-3')
  })

  it('sets captionLayout to label by default', () => {
    render(<Calendar />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-caption-layout', 'label')
  })

  it('allows overriding captionLayout', () => {
    render(<Calendar captionLayout="dropdown" />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-caption-layout', 'dropdown')
  })

  it('provides default month formatter', () => {
    render(<Calendar />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-formatted-month', 'Jan')
  })

  it('allows custom formatters', () => {
    const customFormatters = {
      formatMonthDropdown: (date: Date) => date.toLocaleDateString('en-US', { month: 'long' })
    }
    render(<Calendar formatters={customFormatters} />)
    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('data-formatted-month', 'January')
  })

  it('renders custom Root component', () => {
    render(<Calendar />)
    expect(screen.getByTestId('custom-root')).toBeInTheDocument()
    expect(screen.getByTestId('custom-root')).toHaveAttribute('data-slot', 'calendar')
  })

  it('renders Chevron components with different orientations', () => {
    render(<Calendar />)

    expect(screen.getByTestId('chevron-container')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument()

    // Verify the chevron components have the correct classes
    expect(screen.getByTestId('chevron-left')).toHaveClass('test-chevron')
    expect(screen.getByTestId('chevron-right')).toHaveClass('test-chevron')
    expect(screen.getByTestId('chevron-down')).toHaveClass('test-chevron')
  })

  it('renders WeekNumber component', () => {
    render(<Calendar />)

    const weekNumber = screen.getByTestId('week-number')
    expect(weekNumber).toBeInTheDocument()
    expect(weekNumber.tagName).toBe('TD')
    expect(weekNumber).toHaveTextContent('Week 1')
  })

  it('renders DayButton component', () => {
    render(<Calendar />)

    expect(screen.getByTestId('day-button')).toBeInTheDocument()
  })

  it('accepts custom button variant', () => {
    render(<Calendar buttonVariant="outline" />)

    // The button variant should be applied to navigation buttons
    expect(mockGetDefaultClassNames).toHaveBeenCalled()
  })

  it('merges custom classNames with defaults', () => {
    const customClassNames = {
      root: 'custom-root-class',
      month: 'custom-month-class'
    }

    render(<Calendar classNames={customClassNames} />)

    expect(mockGetDefaultClassNames).toHaveBeenCalled()
  })

  it('accepts custom components', () => {
    const CustomComponent = () => <div data-testid="custom-component">Custom</div>

    render(<Calendar components={{ DayButton: CustomComponent }} />)

    // The custom component should be merged with default components
    expect(screen.getByTestId('day-picker')).toBeInTheDocument()
  })

  it('passes through all other props', () => {
    render(
      <Calendar
        mode="range"
        selected={{ from: new Date(), to: undefined }}
        onSelect={() => {}}
        disabled={[new Date()]}
      />
    )

    const calendar = screen.getByTestId('day-picker')
    expect(calendar).toHaveAttribute('mode', 'range')
  })

  it('calls getDefaultClassNames', () => {
    render(<Calendar />)
    expect(mockGetDefaultClassNames).toHaveBeenCalled()
  })
})

describe('CalendarDayButton', () => {
  const mockDay = { 
    date: new Date(2024, 0, 15),
    dateLib: {} as any,
    outside: false,
    displayMonth: new Date(2024, 0, 1),
    isEqualTo: jest.fn()
  }
  const baseModifiers = {
    focused: false,
    selected: false,
    range_start: false,
    range_end: false,
    range_middle: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders day button component', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
      />
    )

    expect(screen.getByTestId('button')).toBeInTheDocument()
  })

  it('applies correct data attributes for single selection', () => {
    const modifiers = {
      ...baseModifiers,
      selected: true
    }

    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={modifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-selected-single', 'true')
    expect(button).toHaveAttribute('data-range-start', 'false')
    expect(button).toHaveAttribute('data-range-end', 'false')
    expect(button).toHaveAttribute('data-range-middle', 'false')
  })

  it('applies correct data attributes for range start', () => {
    const modifiers = {
      ...baseModifiers,
      selected: true,
      range_start: true
    }

    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={modifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-selected-single', 'false')
    expect(button).toHaveAttribute('data-range-start', 'true')
  })

  it('applies correct data attributes for range middle', () => {
    const modifiers = {
      ...baseModifiers,
      selected: true,
      range_middle: true
    }

    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={modifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-selected-single', 'false')
    expect(button).toHaveAttribute('data-range-middle', 'true')
  })

  it('applies correct data attributes for range end', () => {
    const modifiers = {
      ...baseModifiers,
      selected: true,
      range_end: true
    }

    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={modifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-selected-single', 'false')
    expect(button).toHaveAttribute('data-range-end', 'true')
  })

  it('sets data-day attribute with correct date format', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-day', mockDay.date.toLocaleDateString())
  })

  it('focuses button when focused modifier is true', () => {
    const modifiers = {
      ...baseModifiers,
      focused: true
    }

    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={modifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveFocus()
  })

  it('applies custom className', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
        className="custom-day-class"
      />
    )

    const button = screen.getByTestId('button')
    expect(button.className).toContain('custom-day-class')
  })

  it('uses ghost variant and icon size', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-variant', 'ghost')
    expect(button).toHaveAttribute('data-size', 'icon')
  })

  it('forwards additional props', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
        onClick={() => {}}
        disabled
      />
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('disabled')
  })

  it('applies default class names', () => {
    render(
      <CalendarDayButton
        day={mockDay}
        modifiers={baseModifiers}
      />
    )

    expect(mockGetDefaultClassNames).toHaveBeenCalled()
  })
})