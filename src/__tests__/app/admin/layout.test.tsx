import { render } from '@testing-library/react'
import AdminLayout from '@/app/admin/layout'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock AdminHeader component
jest.mock('@/components/admin/admin-header', () => ({
  AdminHeader: ({ userEmail }: { userEmail: string }) => (
    <div data-testid="admin-header" data-user-email={userEmail}>
      Admin Header
    </div>
  )
}))

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset redirect mock to not throw by default
    mockRedirect.mockImplementation(() => { throw new Error('Redirect') })
  })

  it('renders admin layout with authenticated user', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: 'admin@example.com' } }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const { getByTestId } = render(
      await AdminLayout({
        children: <div data-testid="admin-children">Admin Content</div>
      })
    )

    expect(getByTestId('admin-header')).toHaveAttribute('data-user-email', 'admin@example.com')
    expect(getByTestId('admin-children')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to login when user is not authenticated', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    // Mock redirect to throw an error to simulate stopping execution
    mockRedirect.mockImplementation(() => {
      throw new Error('REDIRECT')
    })

    await expect(AdminLayout({
      children: <div>Admin Content</div>
    })).rejects.toThrow('REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('handles user with no email', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: null } }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const { getByTestId } = render(
      await AdminLayout({
        children: <div data-testid="admin-children">Admin Content</div>
      })
    )

    expect(getByTestId('admin-header')).toHaveAttribute('data-user-email', '')
  })

  it('handles authentication error gracefully', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: undefined }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    // Mock redirect to throw an error to simulate stopping execution
    mockRedirect.mockImplementation(() => {
      throw new Error('REDIRECT')
    })

    await expect(AdminLayout({
      children: <div>Admin Content</div>
    })).rejects.toThrow('REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('renders correct layout structure', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: 'admin@example.com' } }
        })
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any)

    const { container } = render(
      await AdminLayout({
        children: <div>Admin Content</div>
      })
    )

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-background')

    const borderDiv = mainDiv.querySelector('.border-b')
    expect(borderDiv).toBeInTheDocument()

    const containerDiv = borderDiv?.querySelector('.container')
    expect(containerDiv).toBeInTheDocument()
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'py-4')
  })
})