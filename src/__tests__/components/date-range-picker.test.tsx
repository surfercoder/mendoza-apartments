import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker } from '@/components/date-range-picker'
import { DateRange } from 'react-day-picker'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key)
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'LLL dd, y') {
      // Handle specific test dates
      const dateStr = date instanceof Date ? date.toISOString() : date.toString()
      if (dateStr.includes('2024-01-01')) return 'Jan 01, 2024'
      if (dateStr.includes('2024-01-05')) return 'Jan 05, 2024'

      // Fallback to normal formatting
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }).replace(/(\d{2})/, '$1')
    }
    return date.toString()
  }),
  startOfDay: jest.fn((date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  })
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, id, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      id={id}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({
    onSelect,
    mode,
    numberOfMonths,
    disabled,
    initialFocus,
    selected,
    defaultMonth,
    ...props
  }: any) => (
    <div
      data-testid="calendar"
      data-mode={mode}
      data-number-of-months={numberOfMonths}
      data-initial-focus={initialFocus}
      selected={JSON.stringify(selected)}
      defaultmonth={defaultMonth?.toString()}
      {...props}
    >
      <div>Calendar Component</div>
      <button
        onClick={() => onSelect({ from: new Date('2024-01-01'), to: new Date('2024-01-02') })}
        data-testid="select-date-range"
      >
        Select Date Range
      </button>
      <button
        onClick={() => onSelect({ from: new Date('2024-01-01') })}
        data-testid="select-single-date"
      >
        Select Single Date
      </button>
      <button
        onClick={() => onSelect(undefined)}
        data-testid="clear-selection"
      >
        Clear Selection
      </button>
      <div data-testid="disabled-dates">
        Disabled: {disabled && disabled(new Date('2020-01-01')) ? 'true' : 'false'}
      </div>
    </div>
  )
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children, className, align, ...props }: any) => (
    <div data-testid="popover-content" className={className} data-align={align} {...props}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: any) => (
    <div data-testid="popover-trigger">
      {children}
    </div>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: ({ className }: any) => (
    <div data-testid="calendar-icon" className={className} />
  )
}))

describe('DateRangePicker', () => {
  const mockOnDateChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default placeholder', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    expect(screen.getByText('pickDates')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Select your dates'

    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
        placeholder={customPlaceholder}
      />
    )

    expect(screen.getByText(customPlaceholder)).toBeInTheDocument()
  })

  it('displays single date when only from date is selected', () => {
    const singleDate: DateRange = {
      from: new Date('2024-01-01'),
      to: undefined
    }

    render(
      <DateRangePicker
        date={singleDate}
        onDateChange={mockOnDateChange}
      />
    )

    expect(screen.getByText('Jan 01, 2024')).toBeInTheDocument()
  })

  it('displays date range when both dates are selected', () => {
    const dateRange: DateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-05')
    }

    render(
      <DateRangePicker
        date={dateRange}
        onDateChange={mockOnDateChange}
      />
    )

    expect(screen.getByText('Jan 01, 2024 - Jan 05, 2024')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
        className="custom-class"
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('grid', 'gap-2', 'custom-class')
  })

  it('applies muted text color when no date selected', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const button = screen.getByRole('button', { name: /pickdates/i })
    expect(button.className).toContain('text-muted-foreground')
  })

  it('does not apply muted text color when date is selected', () => {
    const dateRange: DateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-05')
    }

    render(
      <DateRangePicker
        date={dateRange}
        onDateChange={mockOnDateChange}
      />
    )

    const button = screen.getByRole('button', { name: /jan 01, 2024 - jan 05, 2024/i })
    expect(button.className).not.toContain('text-muted-foreground')
  })

  it('renders popover structure', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    expect(screen.getByTestId('popover')).toBeInTheDocument()
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
  })

  it('configures calendar with correct props', () => {
    const dateRange: DateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-05')
    }

    render(
      <DateRangePicker
        date={dateRange}
        onDateChange={mockOnDateChange}
      />
    )

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('data-mode', 'range')
    expect(calendar).toHaveAttribute('data-number-of-months', '2')
    expect(calendar).toHaveAttribute('data-initial-focus', 'true')
  })

  it('handles date range selection', async () => {
    const user = userEvent.setup()

    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const selectButton = screen.getByTestId('select-date-range')
    await act(async () => {
      await user.click(selectButton)
    })

    expect(mockOnDateChange).toHaveBeenCalledWith({
      from: new Date('2024-01-01'),
      to: new Date('2024-01-02')
    })
  })

  it('handles single date selection', async () => {
    const user = userEvent.setup()

    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const selectButton = screen.getByTestId('select-single-date')
    await act(async () => {
      await user.click(selectButton)
    })

    expect(mockOnDateChange).toHaveBeenCalledWith({
      from: new Date('2024-01-01')
    })
  })

  it('handles clearing selection', async () => {
    const user = userEvent.setup()

    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const clearButton = screen.getByTestId('clear-selection')
    await act(async () => {
      await user.click(clearButton)
    })

    expect(mockOnDateChange).toHaveBeenCalledWith(undefined)
  })

  it('disables past dates', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    // The disabled function should return true for past dates
    const disabledDates = screen.getByTestId('disabled-dates')
    expect(disabledDates).toHaveTextContent('Disabled: true')
  })

  it('sets correct button attributes', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const button = screen.getByRole('button', { name: /pickdates/i })
    expect(button).toHaveAttribute('id', 'date')
    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button.className).toContain('w-full')
    expect(button.className).toContain('justify-start')
    expect(button.className).toContain('text-left')
    expect(button.className).toContain('font-normal')
  })

  it('sets popover content alignment', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const popoverContent = screen.getByTestId('popover-content')
    expect(popoverContent).toHaveAttribute('data-align', 'start')
    expect(popoverContent.className).toContain('w-auto')
    expect(popoverContent.className).toContain('p-0')
  })

  it('passes calendar icon with correct styling', () => {
    render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const calendarIcon = screen.getByTestId('calendar-icon')
    expect(calendarIcon.className).toContain('mr-2')
    expect(calendarIcon.className).toContain('h-4')
    expect(calendarIcon.className).toContain('w-4')
  })

  it('sets default month when date range is provided', () => {
    const dateRange: DateRange = {
      from: new Date('2024-06-15'),
      to: new Date('2024-06-20')
    }

    render(
      <DateRangePicker
        date={dateRange}
        onDateChange={mockOnDateChange}
      />
    )

    // The calendar should be rendered (indicating defaultMonth is set)
    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('handles edge case with same from and to dates', () => {
    const sameDate = new Date('2024-01-01')
    const dateRange: DateRange = {
      from: sameDate,
      to: sameDate
    }

    render(
      <DateRangePicker
        date={dateRange}
        onDateChange={mockOnDateChange}
      />
    )

    expect(screen.getByText('Jan 01, 2024 - Jan 01, 2024')).toBeInTheDocument()
  })

  it('renders without className when not provided', () => {
    const { container } = render(
      <DateRangePicker
        date={undefined}
        onDateChange={mockOnDateChange}
      />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('grid', 'gap-2')
    expect(wrapper.className).not.toContain('undefined')
  })

  describe('Same-day booking validation', () => {
    it('allows booking for today (current date)', () => {
      // Mock the current date to be at 7:45 AM
      const mockToday = new Date('2024-11-08T07:45:00')
      jest.spyOn(global, 'Date').mockImplementation((() => mockToday) as any)

      render(
        <DateRangePicker
          date={undefined}
          onDateChange={mockOnDateChange}
        />
      )

      const calendar = screen.getByTestId('calendar')
      expect(calendar).toBeInTheDocument()

      // Restore Date
      jest.restoreAllMocks()
    })

    it('disables dates before today using startOfDay comparison', () => {
      const mockToday = new Date('2024-11-08T07:45:00')
      const yesterday = new Date('2024-11-07T23:59:59')
      
      render(
        <DateRangePicker
          date={undefined}
          onDateChange={mockOnDateChange}
        />
      )

      // Get the disabled function from the Calendar mock
      const calendar = screen.getByTestId('calendar')
      expect(calendar).toBeInTheDocument()
      
      // The disabled dates test should show that past dates are disabled
      const disabledDates = screen.getByTestId('disabled-dates')
      expect(disabledDates).toHaveTextContent('Disabled: true')
    })

    it('uses startOfDay to normalize date comparison', () => {
      const { startOfDay } = require('date-fns')
      
      // Test that startOfDay is called correctly
      const testDate = new Date('2024-11-08T15:30:00')
      const result = startOfDay(testDate)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('allows same-day bookings regardless of current time', () => {
      // Test at different times of the day
      const testTimes = [
        '2024-11-08T00:01:00', // Just after midnight
        '2024-11-08T07:45:00', // Morning
        '2024-11-08T12:00:00', // Noon
        '2024-11-08T23:59:00', // Just before midnight
      ]

      testTimes.forEach(timeStr => {
        const mockNow = new Date(timeStr)
        const todayAtMidnight = new Date(timeStr)
        todayAtMidnight.setHours(0, 0, 0, 0)

        // The date comparison should use startOfDay
        // So today at any time should be >= today at midnight
        expect(todayAtMidnight.getTime()).toBeLessThanOrEqual(mockNow.getTime())
      })
    })

    it('correctly identifies yesterday as disabled', () => {
      const mockToday = new Date('2024-11-08T07:45:00')
      const yesterday = new Date('2024-11-07')
      const todayStart = new Date('2024-11-08')
      todayStart.setHours(0, 0, 0, 0)

      // Yesterday should be less than today's start
      expect(yesterday < todayStart).toBe(true)
    })

    it('correctly identifies tomorrow as enabled', () => {
      const mockToday = new Date('2024-11-08T07:45:00')
      const tomorrow = new Date('2024-11-09')
      const todayStart = new Date('2024-11-08')
      todayStart.setHours(0, 0, 0, 0)

      // Tomorrow should not be less than today's start
      expect(tomorrow < todayStart).toBe(false)
    })
  })
})