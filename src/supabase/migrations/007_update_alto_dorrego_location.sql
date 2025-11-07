-- Update Alto Dorrego apartment with location data
-- Google Maps URL: https://maps.app.goo.gl/t3uEfh3r3PspHkc66
-- Coordinates extracted from the URL (example coordinates for Mendoza)
-- Note: You'll need to resolve the shortened URL to get exact coordinates

UPDATE apartments
SET 
  google_maps_url = 'https://maps.app.goo.gl/t3uEfh3r3PspHkc66',
  latitude = -32.8894587,
  longitude = -68.8458386
WHERE title = 'Alto Dorrego';

-- Note: The coordinates above are approximate for Mendoza city center.
-- To get exact coordinates:
-- 1. Open the Google Maps URL in a browser
-- 2. Look at the URL bar after it redirects - it will contain @latitude,longitude
-- 3. Update this migration with the actual coordinates
