-- Add location fields to apartments table
ALTER TABLE apartments
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN google_maps_url TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN apartments.latitude IS 'Latitude coordinate for apartment location';
COMMENT ON COLUMN apartments.longitude IS 'Longitude coordinate for apartment location';
COMMENT ON COLUMN apartments.google_maps_url IS 'Google Maps share URL for the apartment location';
