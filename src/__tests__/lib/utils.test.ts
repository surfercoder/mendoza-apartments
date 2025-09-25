import { cn } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      // twMerge should resolve conflicts, keeping the last one
      expect(result).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should handle falsy values', () => {
      const result = cn('base-class', false, null, undefined, '')
      expect(result).toBe('base-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle objects with conditional classes', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('hasEnvVars', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should return truthy when both env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      // Need to re-import to get updated env vars
      jest.resetModules()
      const { hasEnvVars: newHasEnvVars } = await import('@/lib/utils')

      expect(newHasEnvVars).toBeTruthy()
    })

    it('should return falsy when SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      jest.resetModules()
      const { hasEnvVars: newHasEnvVars } = await import('@/lib/utils')

      expect(newHasEnvVars).toBeFalsy()
    })

    it('should return falsy when SUPABASE_ANON_KEY is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.resetModules()
      const { hasEnvVars: newHasEnvVars } = await import('@/lib/utils')

      expect(newHasEnvVars).toBeFalsy()
    })

    it('should return falsy when both env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      jest.resetModules()
      const { hasEnvVars: newHasEnvVars } = await import('@/lib/utils')

      expect(newHasEnvVars).toBeFalsy()
    })

    it('should return falsy when env vars are empty strings', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

      jest.resetModules()
      const { hasEnvVars: newHasEnvVars } = await import('@/lib/utils')

      expect(newHasEnvVars).toBeFalsy()
    })
  })
})