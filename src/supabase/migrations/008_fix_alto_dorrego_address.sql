-- Fix Alto Dorrego apartment address
-- Extracted from Google Maps URL: https://maps.app.goo.gl/t3uEfh3r3PspHkc66
-- Actual address: Amado Nervo 521, M5521, Mendoza
-- Coordinates: -32.9141716, -68.8332792

UPDATE apartments
SET 
  address = 'Amado Nervo 521, M5521, Mendoza',
  latitude = -32.9141716,
  longitude = -68.8332792,
  google_maps_url = 'https://maps.app.goo.gl/t3uEfh3r3PspHkc66'
WHERE title LIKE '%Alto Dorrego%' OR title LIKE '%Divino y Luminoso%';

-- Verify the update
DO $$
DECLARE
  updated_address TEXT;
  updated_lat NUMERIC;
  updated_lng NUMERIC;
BEGIN
  SELECT address, latitude, longitude 
  INTO updated_address, updated_lat, updated_lng
  FROM apartments
  WHERE title LIKE '%Alto Dorrego%' OR title LIKE '%Divino y Luminoso%'
  LIMIT 1;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 008 COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Updated apartment address:';
  RAISE NOTICE '  Address: %', updated_address;
  RAISE NOTICE '  Latitude: %', updated_lat;
  RAISE NOTICE '  Longitude: %', updated_lng;
  RAISE NOTICE '========================================';
END $$;
