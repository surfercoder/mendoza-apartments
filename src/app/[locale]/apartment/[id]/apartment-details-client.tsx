'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Apartment } from '@/lib/types';
import { getBestCoordinates } from '@/lib/utils/map-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookingModal } from '@/components/booking-modal';
import { ApartmentMap } from '@/components/apartment-map';
import {
  Bed,
  Bath,
  Users,
  MapPin,
  ArrowLeft,
  Wifi,
  Car,
  Waves,
  UtensilsCrossed,
  Wind,
  Flame,
  Coffee,
  Microwave,
  ChefHat,
  Refrigerator,
  Shirt,
  Wind as Dryer,
  Tv,
  FireExtinguisher,
  Baby,
  Moon,
  Droplet,
  Sparkles,
  Home,
  Calendar as CalendarIcon,
  Sparkles as CleaningIcon,
  Mountain,
  Sun,
  ExternalLink,
} from 'lucide-react';

interface ApartmentDetailsClientProps {
  apartment: Apartment;
}

export function ApartmentDetailsClient({ apartment }: ApartmentDetailsClientProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const t = useTranslations('listing');
  const tForm = useTranslations('admin.form');
  const locale = useLocale();

  const characteristics = apartment.characteristics || {};

  // Get the principal image index
  const principalImageIndex = apartment.principal_image_index ?? 0;
  const validPrincipalIndex =
    apartment.images && apartment.images.length > 0
      ? Math.min(Math.max(0, principalImageIndex), apartment.images.length - 1)
      : 0;

  // Reorder images to show principal image first
  const orderedImages = apartment.images
    ? [
        apartment.images[validPrincipalIndex],
        ...apartment.images.filter((_, idx) => idx !== validPrincipalIndex),
      ]
    : [];

  const amenities = [
    { key: 'wifi', icon: Wifi, label: tForm('wifi') },
    { key: 'kitchen', icon: UtensilsCrossed, label: tForm('kitchen') },
    { key: 'air_conditioning', icon: Wind, label: tForm('air_conditioning') },
    { key: 'parking', icon: Car, label: tForm('parking') },
    { key: 'pool', icon: Waves, label: tForm('pool') },
    { key: 'balcony', icon: Home, label: tForm('balcony') },
    { key: 'terrace', icon: Sun, label: tForm('terrace') },
    { key: 'garden', icon: Mountain, label: tForm('garden') },
    { key: 'bbq', icon: Flame, label: tForm('bbq') },
    { key: 'washing_machine', icon: Sparkles, label: tForm('washing_machine') },
    { key: 'mountain_view', icon: Mountain, label: tForm('mountain_view') },
    { key: 'hot_water', icon: Droplet, label: tForm('hot_water') },
    { key: 'heating', icon: Flame, label: tForm('heating') },
    { key: 'coffee_maker', icon: Coffee, label: tForm('coffee_maker') },
    { key: 'microwave', icon: Microwave, label: tForm('microwave') },
    { key: 'oven', icon: ChefHat, label: tForm('oven') },
    { key: 'refrigerator', icon: Refrigerator, label: tForm('refrigerator') },
    { key: 'iron', icon: Shirt, label: tForm('iron') },
    { key: 'hair_dryer', icon: Dryer, label: tForm('hair_dryer') },
    { key: 'tv', icon: Tv, label: tForm('tv') },
    { key: 'fire_extinguisher', icon: FireExtinguisher, label: tForm('fire_extinguisher') },
    { key: 'crib', icon: Baby, label: tForm('crib') },
    { key: 'blackout_curtains', icon: Moon, label: tForm('blackout_curtains') },
    { key: 'bidet', icon: Droplet, label: tForm('bidet') },
    { key: 'dishwasher', icon: Sparkles, label: tForm('dishwasher') },
    { key: 'single_floor', icon: Home, label: tForm('single_floor') },
    { key: 'long_term_available', icon: CalendarIcon, label: tForm('long_term_available') },
    { key: 'cleaning_service', icon: CleaningIcon, label: tForm('cleaning_service') },
  ];

  const availableAmenities = amenities.filter(
    (amenity) => characteristics[amenity.key as keyof typeof characteristics]
  );

  // Get the best available coordinates (prioritize Google Maps URL)
  const coordinates = getBestCoordinates(
    apartment.latitude,
    apartment.longitude,
    apartment.google_maps_url
  );
  const hasLocation = coordinates !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href={`/${locale}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {orderedImages.length > 0 ? (
            <>
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={orderedImages[selectedImageIndex]}
                  alt={`${apartment.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[500px] overflow-y-auto">
                {orderedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-[190px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image src={image} alt={`${apartment.title} - Thumbnail ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="col-span-2 h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">{t('noImage')}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{apartment.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{apartment.address}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {characteristics.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {t('beds', { count: characteristics.bedrooms })}
                  </div>
                )}
                {characteristics.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {t('baths', { count: characteristics.bathrooms })}
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {t('upToGuests', { count: apartment.max_guests })}
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About this place</h2>
                <p className="text-muted-foreground whitespace-pre-line">{apartment.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {availableAmenities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableAmenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.key} className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span>{amenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {hasLocation && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Location</h2>
                    {apartment.google_maps_url && (
                      <a
                        href={apartment.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Open in Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <ApartmentMap
                    latitude={coordinates!.lat}
                    longitude={coordinates!.lng}
                    title={apartment.title}
                    address={apartment.address}
                    googleMapsUrl={apartment.google_maps_url}
                  />
                  <p className="text-sm text-muted-foreground mt-4">{apartment.address}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-1">
                    ${apartment.price_per_night}
                    <span className="text-base font-normal text-muted-foreground"> / {t('night')}</span>
                  </div>
                </div>

                <Button onClick={() => setIsBookingModalOpen(true)} className="w-full" size="lg">
                  Reserve
                </Button>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p>You won&apos;t be charged yet</p>
                  {apartment.contact_email && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Contact</p>
                      <p>{apartment.contact_email}</p>
                    </div>
                  )}
                  {apartment.whatsapp_number && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">WhatsApp</p>
                      <a
                        href={`https://wa.me/${apartment.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {apartment.whatsapp_number}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookingModal
        apartment={apartment}
        guests={1}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
        }}
      />
    </div>
  );
}
