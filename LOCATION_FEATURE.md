# Location Feature Implementation

## Overview
This document describes the location feature that allows apartments to display their location on an interactive map.

## Features Added

### 1. Database Schema
- Added `latitude`, `longitude`, and `google_maps_url` fields to the `apartments` table
- Migration file: `src/supabase/migrations/006_add_location_fields.sql`

### 2. Map Integration
- Installed **Leaflet** (`react-leaflet` and `leaflet`) for map display
- Uses OpenStreetMap tiles (free, no API key required)
- Dynamic import to avoid SSR issues with Next.js

### 3. Admin Panel Updates
- Added Google Maps URL field to apartment form
- Accepts Google Maps share links (e.g., `https://maps.app.goo.gl/...`)
- Validates URL format
- Translations added for English and Spanish

### 4. Apartment Details Page
- New route: `/apartment/[id]`
- Displays:
  - Full image gallery with thumbnail selection
  - Complete apartment description
  - All amenities with icons
  - Interactive map showing apartment location
  - Booking card with contact information
- Map features:
  - Marker at apartment location
  - Popup with apartment name and address
  - Link to open in Google Maps
  - 15x zoom level for neighborhood context

### 5. Navigation
- Apartment card titles now link to details page
- Hover effect on title to indicate clickability

## How to Use

### For Florencia (Admin)

1. **Adding Location to an Apartment:**
   - Go to Admin Dashboard
   - Edit an apartment (or create a new one)
   - In the "Google Maps URL" field, paste the share link from Google Maps
   - Example: `https://maps.app.goo.gl/t3uEfh3r3PspHkc66`
   - Save the apartment

2. **Getting Coordinates:**
   - The system will automatically extract coordinates from most Google Maps URLs
   - Supported formats:
     - `https://maps.app.goo.gl/...` (shortened URLs)
     - `https://www.google.com/maps/@-32.889,-68.845,17z`
     - `https://www.google.com/maps/place/.../@-32.889,-68.845`
     - `https://www.google.com/maps?q=-32.889,-68.845`

### For Guests

1. **Viewing Apartment Location:**
   - Click on any apartment title from the home page
   - Scroll to the "Location" section
   - View the interactive map
   - Click "Open in Google Maps" to get directions

## Technical Details

### Components
- `src/components/apartment-map.tsx` - Map component using Leaflet
- `src/app/[locale]/apartment/[id]/apartment-details-client.tsx` - Details page client component
- `src/app/[locale]/apartment/[id]/page.tsx` - Details page server component

### Utilities
- `src/lib/utils/maps.ts` - Helper functions for coordinate extraction and map URLs

### Styling
- Leaflet CSS imported in `src/app/[locale]/layout.tsx`
- Map height: 400px
- Responsive design with border and rounded corners

## Database Migrations

Run migrations in order:
```bash
# 1. Add location fields
psql -f src/supabase/migrations/006_add_location_fields.sql

# 2. Update Alto Dorrego with location (optional)
psql -f src/supabase/migrations/007_update_alto_dorrego_location.sql
```

## Future Enhancements

Potential improvements:
1. Automatic geocoding from address if no Google Maps URL provided
2. Multiple location markers for nearby points of interest
3. Distance calculator from apartment to attractions
4. Street view integration
5. Neighborhood information overlay

## Notes

- The map uses OpenStreetMap tiles (free, open-source)
- No API keys required for basic functionality
- Map is client-side rendered to avoid SSR issues
- Coordinates are stored as DECIMAL(10,8) for latitude and DECIMAL(11,8) for longitude
- Google Maps URL is optional but recommended for best user experience
