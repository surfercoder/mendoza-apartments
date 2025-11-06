import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdatePasswordForm } from '@/components/update-password-form'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Reset Your Password',
      'description': 'Please enter your new password below.',
      'newPassword': 'New password',
      'newPasswordPlaceholder': 'New password',
      'saving': 'Saving...',
      'saveButton': 'Save new password',
      'errorOccurred': 'An error occurred'
    }
    return translations[key] || key
  }),
  useLocale: jest.fn(() => 'en')
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>{children}</div>
  )
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, placeholder, required, value, onChange, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      data-testid="password-input"
      {...props}
    />
  )
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => {
    const { 'data-testid': testId, ...otherProps } = props;
    return (
      <label htmlFor={htmlFor} data-testid={testId || "label"} {...otherProps}>
        {children}
      </label>
    );
  }
}))

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    } as any)
  })

  const createMockSupabaseClient = () => ({
    auth: {
      updateUser: jest.fn()
    }
  })

  it('renders update password form', () => {
    render(<UpdatePasswordForm />)

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    expect(screen.getByText('Please enter your new password below.')).toBeInTheDocument()
    expect(screen.getByText('New password')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save new password' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<UpdatePasswordForm className="custom-class" />)
    const form = container.firstChild as HTMLElement
    expect(form).toHaveClass('flex', 'flex-col', 'gap-6', 'custom-class')
  })

  it('forwards other props', () => {
    render(<UpdatePasswordForm data-testid="update-form" />)
    const form = screen.getByTestId('update-form')
    expect(form).toBeInTheDocument()
  })

  it('has correct input attributes', () => {
    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    expect(passwordInput).toHaveAttribute('id', 'password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('placeholder', 'New password')
    expect(passwordInput).toBeRequired()
  })

  it('updates password input value', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    await user.type(passwordInput, 'newpassword123')

    expect(passwordInput).toHaveValue('newpassword123')
  })

  it('handles successful password update', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    await user.type(passwordInput, 'newpassword123')
    await act(async () => {
      await user.click(submitButton)
    })

    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123'
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en/admin')
    })
  })

  it('handles password update error', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    const passwordError = new Error('Password is too weak') as any;
    passwordError.message = 'Password is too weak';
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      error: passwordError
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    await user.type(passwordInput, 'weak')
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Password is too weak')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.updateUser.mockRejectedValue('String error')
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    await user.type(passwordInput, 'newpassword123')
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })

  it('shows loading state during update', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    let resolvePromise: (value: any) => void
    const updatePromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockSupabaseClient.auth.updateUser.mockReturnValue(updatePromise as any)
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    await user.type(passwordInput, 'newpassword123')
    await act(async () => {
      await user.click(submitButton)
    })

    // Check loading state
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    act(() => {
      resolvePromise!({ error: null })
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save new password' })).toBeInTheDocument()
    })
  })

  it('prevents form submission with empty password', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const submitButton = screen.getByRole('button', { name: 'Save new password' })
    await act(async () => {
      await user.click(submitButton)
    })

    // Form validation should prevent submission
    expect(mockSupabaseClient.auth.updateUser).not.toHaveBeenCalled()
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // First call fails
    const firstPasswordError = new Error('First error') as any;
    firstPasswordError.message = 'First error';
    mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
      error: firstPasswordError
    })

    // Second call succeeds
    mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
      error: null
    })

    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    // First submission - should show error
    await user.type(passwordInput, 'weakpassword')
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission - error should be cleared before new attempt
    await user.clear(passwordInput)
    await user.type(passwordInput, 'strongpassword123')
    await act(async () => {
      await user.click(submitButton)
    })

    // The error should be cleared immediately on form submission
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('form can be submitted with Enter key', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')

    await user.type(passwordInput, 'newpassword123')
    await user.keyboard('{Enter}')

    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123'
    })
  })

  it('renders all card components', () => {
    render(<UpdatePasswordForm />)

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-description')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('applies correct CSS classes to title', () => {
    render(<UpdatePasswordForm />)

    const cardTitle = screen.getByTestId('card-title')
    expect(cardTitle).toHaveClass('text-2xl')
  })

  it('has proper form structure', () => {
    render(<UpdatePasswordForm />)

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('for', 'password')

    const submitButton = screen.getByRole('button', { name: 'Save new password' })
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(submitButton).toHaveClass('w-full')
  })

  it('handles Supabase client creation error', async () => {
    const user = userEvent.setup()
    mockCreateClient.mockImplementation(() => {
      throw new Error('Client creation failed')
    })

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByRole('button', { name: 'Save new password' })

    await user.type(passwordInput, 'newpassword123')
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Client creation failed')).toBeInTheDocument()
    })
  })
})