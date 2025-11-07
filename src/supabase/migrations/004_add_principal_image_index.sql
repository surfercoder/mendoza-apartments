-- =====================================================
-- MIGRATION 004: ADD PRINCIPAL IMAGE INDEX
-- =====================================================
-- This migration adds a principal_image_index column to
-- the apartments table to allow setting which image
-- should be displayed as the main/poster image.
-- =====================================================

-- Add principal_image_index column
-- This stores the index (0-based) of the principal image in the images array
-- NULL means use the first image (index 0) as default
ALTER TABLE apartments 
ADD COLUMN principal_image_index INTEGER DEFAULT 0;

-- Add a comment to document the column
COMMENT ON COLUMN apartments.principal_image_index IS 
'Index (0-based) of the principal/featured image in the images array. 
This image will be displayed as the poster/card image on the home page.
Defaults to 0 (first image). Must be within the bounds of the images array.';

-- Add a check constraint to ensure the index is non-negative
ALTER TABLE apartments 
ADD CONSTRAINT principal_image_index_non_negative 
CHECK (principal_image_index >= 0);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  apartment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO apartment_count FROM apartments;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 004 COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added principal_image_index column to apartments table';
  RAISE NOTICE 'Total apartments: %', apartment_count;
  RAISE NOTICE 'All existing apartments now have principal_image_index = 0 (first image)';
END $$;
