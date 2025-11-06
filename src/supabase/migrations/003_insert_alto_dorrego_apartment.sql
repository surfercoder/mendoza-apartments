-- =====================================================
-- MIGRATION 003: INSERT ALTO DORREGO APARTMENT
-- =====================================================
-- Inserts the first real apartment: Departamento 1 Alto Dorrego
-- Some fields have placeholder values that need to be updated
-- by the admin through the web interface
-- =====================================================

-- Insert Departamento 1 Alto Dorrego
INSERT INTO apartments (
  title,
  description,
  characteristics,
  price_per_night,
  max_guests,
  address,
  images,
  contact_email,
  contact_phone,
  whatsapp_number,
  is_active
) VALUES (
  -- Basic Information
  'Divino y Luminoso depto con excelente ubicación y cochera',
  'Departamento confortable y luminoso, situado en uno de los mejores lugares de Mendoza a pocos metros de los principales accesos. Equipado con todo lo necesario para pasar una estadía placentera y cómoda con anfitriones disponibles para resolver los requerimientos de los huéspedes.',
  
  -- Characteristics (all amenities from the provided list)
  jsonb_build_object(
    -- TODO: Admin needs to fill these in
    'bedrooms', NULL,
    'bathrooms', NULL,
    
    -- Confirmed amenities
    'wifi', true,
    'kitchen', true,
    'air_conditioning', true,
    'parking', true,
    'hot_water', true,
    'heating', true,
    'coffee_maker', true,
    'microwave', true,
    'oven', true,
    'refrigerator', true,
    'iron', true,
    'hair_dryer', true,
    'tv', true,
    'fire_extinguisher', true,
    'crib', true,
    'blackout_curtains', true,
    'bidet', true,
    'single_floor', true,
    'long_term_available', true,
    'cleaning_service', true,
    
    -- Not mentioned in the amenities list
    'pool', false,
    'balcony', false,
    'terrace', false,
    'garden', false,
    'bbq', false,
    'washing_machine', false,
    'mountain_view', false,
    'dishwasher', false
  ),
  
  -- Pricing and Capacity
  0.00, -- TODO: Admin needs to set actual price_per_night
  4, -- max_guests (confirmed)
  
  -- Location
  'TODO: Extract address from https://maps.app.goo.gl/t3uEfh3r3PspHkc66', -- TODO: Admin needs to provide street address
  
  -- Images
  ARRAY[]::TEXT[], -- TODO: Admin will upload 12 images through the web interface
  
  -- Contact Information
  'TODO@example.com', -- TODO: Admin needs to provide contact_email
  NULL, -- TODO: Admin can optionally provide contact_phone
  NULL, -- TODO: Admin can optionally provide whatsapp_number
  
  -- Status
  true -- is_active (apartment is ready to be listed once data is complete)
);

-- =====================================================
-- VERIFICATION AND NEXT STEPS
-- =====================================================

DO $$
DECLARE
  apartment_id UUID;
  apartment_title TEXT;
  amenity_count INTEGER;
BEGIN
  -- Get the apartment we just inserted
  SELECT id, title INTO apartment_id, apartment_title
  FROM apartments
  WHERE title = 'Divino y Luminoso depto con excelente ubicación y cochera';
  
  -- Count how many amenities are set to true
  SELECT COUNT(*) INTO amenity_count
  FROM jsonb_each_text(
    (SELECT characteristics FROM apartments WHERE id = apartment_id)
  )
  WHERE value = 'true';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 003 COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Apartment inserted:';
  RAISE NOTICE '  ID: %', apartment_id;
  RAISE NOTICE '  Title: %', apartment_title;
  RAISE NOTICE '  Max Guests: 4';
  RAISE NOTICE '  Amenities configured: %', amenity_count;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ADMIN ACTION REQUIRED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'The admin (Florencia) needs to complete the following:';
  RAISE NOTICE '';
  RAISE NOTICE '1. REQUIRED FIELDS:';
  RAISE NOTICE '   - price_per_night (currently: 0.00)';
  RAISE NOTICE '   - contact_email (currently: TODO@example.com)';
  RAISE NOTICE '   - address (currently: placeholder)';
  RAISE NOTICE '   - bedrooms (currently: NULL)';
  RAISE NOTICE '   - bathrooms (currently: NULL)';
  RAISE NOTICE '';
  RAISE NOTICE '2. OPTIONAL FIELDS:';
  RAISE NOTICE '   - contact_phone';
  RAISE NOTICE '   - whatsapp_number';
  RAISE NOTICE '';
  RAISE NOTICE '3. IMAGES:';
  RAISE NOTICE '   - Upload 12 apartment photos';
  RAISE NOTICE '   - HEIC/HEIF (iPhone) photos supported';
  RAISE NOTICE '   - Auto-converted to JPEG on upload';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'HOW TO COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to: /admin';
  RAISE NOTICE '2. Click "Edit" on the Alto Dorrego apartment';
  RAISE NOTICE '3. Fill in all required fields';
  RAISE NOTICE '4. Upload the 12 images (iPhone HEIC photos OK!)';
  RAISE NOTICE '5. Click "Update Apartment"';
  RAISE NOTICE '';
  RAISE NOTICE 'Google Maps location: https://maps.app.goo.gl/t3uEfh3r3PspHkc66';
  RAISE NOTICE '';
  RAISE NOTICE 'All migrations completed! ✓';
END $$;
