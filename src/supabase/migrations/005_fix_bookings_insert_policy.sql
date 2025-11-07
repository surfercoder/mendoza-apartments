-- =====================================================
-- MIGRATION 005: FIX BOOKINGS INSERT POLICY
-- =====================================================
-- This migration adds the missing INSERT policy for
-- authenticated users to create bookings.
-- =====================================================

-- Add INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create bookings"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 005 COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added INSERT policy for authenticated users on bookings table';
  RAISE NOTICE 'Authenticated users can now create bookings';
END $$;
