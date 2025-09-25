import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock window.location.origin
const originalLocation = window.location;
delete (global as any).window.location;
(global as any).window.location = { origin: 'https://test.com' };

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    (global as any).window.location = originalLocation;
  })

  const createMockSupabaseClient = () => ({
    auth: {
      resetPasswordForEmail: jest.fn()
    }
  })

  it('renders forgot password form initially', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    expect(screen.getByText('Type in your email and we\'ll send you a link to reset your password')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset email' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ForgotPasswordForm className="custom-class" />)
    const form = screen.getByText('Reset Your Password').closest('.custom-class')
    expect(form).toHaveClass('custom-class')
  })

  it('forwards other props', () => {
    render(<ForgotPasswordForm data-testid="forgot-form" />)
    const form = screen.getByTestId('forgot-form')
    expect(form).toBeInTheDocument()
  })

  it('has login link', () => {
    render(<ForgotPasswordForm />)
    const loginLink = screen.getByRole('link', { name: 'Login' })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  it('updates email input', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('handles successful password reset request', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
      data: {}
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost/auth/update-password'
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      expect(screen.getByText('Password reset instructions sent')).toBeInTheDocument()
      expect(screen.getByText('If you registered using your email and password, you will receive a password reset email.')).toBeInTheDocument()
    })

    // Original form should not be visible
    expect(screen.queryByRole('button', { name: 'Send reset email' })).not.toBeInTheDocument()
  })

  it('handles password reset error', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    const errorWithMessage = new Error('Email not found');
    mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(errorWithMessage)
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'nonexistent@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument()
    })

    // Should still show the form, not the success state
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
    expect(screen.queryByText('Check Your Email')).not.toBeInTheDocument()
  })

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue('String error')
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })

  it('shows loading state during password reset', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // Create a promise that we can control
    let resolvePromise!: (value: any) => void
    const resetPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockSupabaseClient.auth.resetPasswordForEmail.mockReturnValue(resetPromise as any)
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolvePromise({ error: null, data: {} })

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
    })
  })

  it('prevents form submission with empty email', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const submitButton = screen.getByRole('button', { name: 'Send reset email' })
    await user.click(submitButton)

    // Form validation should prevent submission
    expect(mockSupabaseClient.auth.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // First call fails
    const firstError = new Error('First error');
    mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValueOnce(firstError)

    // Second call succeeds
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValueOnce({
      error: null,
      data: {}
    })

    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    // First submission - should show error
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission - error should be cleared before new attempt
    await user.click(submitButton)

    // The error should be cleared immediately on form submission
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('has correct input types and attributes', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'm@example.com')
    expect(emailInput).toBeRequired()
  })

  it('form can be submitted with Enter key', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
      data: {}
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')

    await user.type(emailInput, 'test@example.com')
    await user.keyboard('{Enter}')

    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost/auth/update-password'
      }
    )
  })

  it('shows success state after successful submission', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
      data: {}
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      // Success state should be shown
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      expect(screen.getByText('Password reset instructions sent')).toBeInTheDocument()

      // Original form should be hidden
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Send reset email' })).not.toBeInTheDocument()
    })
  })

  it('uses correct redirect URL in password reset', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      error: null,
      data: {}
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send reset email' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      {
        redirectTo: 'http://localhost/auth/update-password'
      }
    )
  })
})