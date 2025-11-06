import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '@/components/sign-up-form'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Sign up',
      'description': 'Create a new account',
      'email': 'Email',
      'emailPlaceholder': 'm@example.com',
      'password': 'Password',
      'repeatPassword': 'Repeat Password',
      'passwordMismatch': 'Passwords do not match',
      'creatingAccount': 'Creating an account...',
      'signUpButton': 'Sign up',
      'haveAccount': 'Already have an account?',
      'loginLink': 'Login',
      'errorOccurred': 'An error occurred'
    }
    return translations[key] || key
  })
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Mock window.location.origin
const originalLocation = window.location;
delete (global as any).window.location;
(global as any).window.location = { origin: 'http://localhost' };

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mockPush = jest.fn()
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignUpForm', () => {
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

  afterAll(() => {
    (global as any).window.location = originalLocation;
  })

  const createMockSupabaseClient = () => ({
    auth: {
      signUp: jest.fn()
    }
  })

  it('renders sign up form', () => {
    render(<SignUpForm />)

    expect(screen.getAllByText('Sign up')).toHaveLength(2) // title and button
    expect(screen.getByText('Create a new account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Repeat Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SignUpForm className="custom-class" />)
    const form = screen.getByText('Create a new account').closest('.custom-class')
    expect(form).toHaveClass('custom-class')
  })

  it('forwards other props', () => {
    render(<SignUpForm data-testid="signup-form" />)
    const form = screen.getByTestId('signup-form')
    expect(form).toBeInTheDocument()
  })

  it('has login link', () => {
    render(<SignUpForm />)
    const loginLink = screen.getByRole('link', { name: 'Login' })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  it('updates email input', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('updates password input', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText('Password')
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('updates repeat password input', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    await user.type(repeatPasswordInput, 'password123')

    expect(repeatPasswordInput).toHaveValue('password123')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'differentpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('handles successful sign up', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
    await user.click(submitButton)

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'http://localhost/admin'
      }
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success')
    })
  })

  it('handles sign up error', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    const authError = new Error('Email already exists') as any;
    authError.message = 'Email already exists';
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      error: authError,
      data: { user: null, session: null }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signUp.mockRejectedValue('String error')
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })

  it('shows loading state during sign up', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // Create a promise that we can control
    let resolvePromise!: (value: any) => void
    const signUpPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockSupabaseClient.auth.signUp.mockReturnValue(signUpPromise as any)
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByRole('button', { name: 'Creating an account...' })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolvePromise({ error: null, data: { user: { id: '123' }, session: {} } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
    })
  })

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: 'Sign up' })
    await user.click(submitButton)

    // Form validation should prevent submission
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled()
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // First call fails
    const firstAuthError = new Error('First error') as any;
    firstAuthError.message = 'First error';
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      error: firstAuthError,
      data: { user: null, session: null }
    })

    // Second call succeeds
    mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })

    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    // First submission - should show error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
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
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'm@example.com')
    expect(emailInput).toBeRequired()

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toBeRequired()

    expect(repeatPasswordInput).toHaveAttribute('type', 'password')
    expect(repeatPasswordInput).toBeRequired()
  })

  it('validates passwords match before submitting', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'differentpassword')
    await user.click(submitButton)

    // Should not call Supabase when passwords don't match
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled()
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('form can be submitted with Enter key', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'password123')
    await user.keyboard('{Enter}')

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'http://localhost/admin'
      }
    })
  })

  it('clears password mismatch error when passwords match', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const repeatPasswordInput = screen.getByLabelText('Repeat Password')
    const submitButton = screen.getByRole('button', { name: 'Sign up' })

    // Add email first
    await user.type(emailInput, 'test@example.com')

    // First create a mismatch
    await user.type(passwordInput, 'password123')
    await user.type(repeatPasswordInput, 'different')
    await user.click(submitButton)

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()

    // Now fix the mismatch and submit again
    await user.clear(repeatPasswordInput)
    await user.type(repeatPasswordInput, 'password123')
    await user.click(submitButton)

    // Error should be cleared
    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })
})