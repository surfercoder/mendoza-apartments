import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/login-form'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Login',
      'description': 'Enter your email below to login to your account',
      'email': 'Email',
      'emailPlaceholder': 'm@example.com',
      'password': 'Password',
      'forgotPassword': 'Forgot your password?',
      'loggingIn': 'Logging in...',
      'loginButton': 'Login',
      'noAccount': "Don't have an account?",
      'signUpLink': 'Sign up',
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

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRefresh = jest.fn()
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: mockRefresh
    } as any)
  })

  const createMockSupabaseClient = () => ({
    auth: {
      signInWithPassword: jest.fn()
    }
  })

  it('renders login form', () => {
    render(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Enter your email below to login to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoginForm className="custom-class" />)
    const form = screen.getByRole('heading', { name: 'Login' }).closest('.custom-class')
    expect(form).toHaveClass('custom-class')
  })

  it('forwards other props', () => {
    render(<LoginForm data-testid="login-form" />)
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })

  it('has forgot password link', () => {
    render(<LoginForm />)
    const forgotLink = screen.getByRole('link', { name: 'Forgot your password?' })
    expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('has sign up link', () => {
    render(<LoginForm />)
    const signUpLink = screen.getByRole('link', { name: 'Sign up' })
    expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
  })

  it('updates email input', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('updates password input', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Password')
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })

    await waitFor(() => {
      // We now use replace + refresh for robust redirect in prod
      expect(mockReplace).toHaveBeenCalledWith('/en/admin')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    const loginError = new Error('Invalid credentials') as any;
    loginError.message = 'Invalid credentials';
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      error: loginError,
      data: { user: null, session: null }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValue('String error')
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // Create a promise that we can control
    let resolvePromise!: (value: any) => void
    const loginPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockSupabaseClient.auth.signInWithPassword.mockReturnValue(loginPromise as any)
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolvePromise({ error: null, data: { user: { id: '123' }, session: {} } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })
  })

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Login' })
    await user.click(submitButton)

    // Form validation should prevent submission
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()

    // First call fails
    const firstLoginError = new Error('First error') as any;
    firstLoginError.message = 'First error';
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      error: firstLoginError,
      data: { user: null, session: null }
    })

    // Second call succeeds
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })

    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    // First submission - should show error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission - error should be cleared before new attempt
    await user.clear(passwordInput)
    await user.type(passwordInput, 'correctpassword')
    await user.click(submitButton)

    // The error should be cleared immediately on form submission
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('has correct input types and attributes', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'm@example.com')
    expect(emailInput).toBeRequired()

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toBeRequired()
  })

  it('form can be submitted with Enter key', async () => {
    const user = userEvent.setup()
    const mockSupabaseClient = createMockSupabaseClient()
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { id: '123' }, session: {} }
    })
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.keyboard('{Enter}')

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })
})