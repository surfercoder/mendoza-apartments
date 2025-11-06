"use client"

import * as React from "react"
import Image from "next/image"
import { Apartment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingModal } from "@/components/booking-modal"
import { ImageGalleryModal } from "@/components/image-gallery-modal"
import { 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Waves, 
  Users, 
  MapPin,
  Calendar
} from "lucide-react"
import { useTranslations } from "next-intl"

interface ApartmentCardProps {
  apartment: Apartment
  checkIn?: Date
  checkOut?: Date
  guests?: number
}

export function ApartmentCard({ apartment, checkIn, checkOut, guests = 1 }: ApartmentCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = React.useState(false)
  const characteristics = apartment.characteristics || {}
  const t = useTranslations('listing')
  
  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return null
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return nights * apartment.price_per_night
  }

  const totalPrice = calculateTotalPrice()
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : null

  const handleBookingSuccess = () => {
    // Optionally refresh the apartment list or show a success message
    console.log('Booking submitted successfully!')
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div 
          className="relative h-48 w-full cursor-pointer group"
          onClick={() => apartment.images && apartment.images.length > 0 && setIsGalleryModalOpen(true)}
        >
          {apartment.images && apartment.images.length > 0 ? (
            <>
              <Image
                src={apartment.images[0]}
                alt={apartment.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {apartment.images.length > 1 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                  +{apartment.images.length - 1} more
                </div>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">{t('noImage')}</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90">
              ${apartment.price_per_night}/{t('night')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{apartment.title}</CardTitle>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {apartment.address}
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {apartment.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {characteristics.bedrooms && (
            <div className="flex items-center text-sm">
              <Bed className="h-4 w-4 mr-1" />
              {t('beds', {count: characteristics.bedrooms})}
            </div>
          )}
          {characteristics.bathrooms && (
            <div className="flex items-center text-sm">
              <Bath className="h-4 w-4 mr-1" />
              {t('baths', {count: characteristics.bathrooms})}
            </div>
          )}
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-1" />
            {t('upToGuests', {count: apartment.max_guests})}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {characteristics.wifi && (
            <Badge variant="outline" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              {t('amenities.wifi')}
            </Badge>
          )}
          {characteristics.parking && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              {t('amenities.parking')}
            </Badge>
          )}
          {characteristics.pool && (
            <Badge variant="outline" className="text-xs">
              <Waves className="h-3 w-3 mr-1" />
              {t('amenities.pool')}
            </Badge>
          )}
          {characteristics.air_conditioning && (
            <Badge variant="outline" className="text-xs">
              {t('amenities.ac')}
            </Badge>
          )}
          {characteristics.kitchen && (
            <Badge variant="outline" className="text-xs">
              {t('amenities.kitchen')}
            </Badge>
          )}
        </div>
        
        {totalPrice && nights && (
          <div className="border-t pt-3 mb-3">
            <div className="flex justify-between text-sm">
              <span>${apartment.price_per_night} × {t('nights', {count: nights})}</span>
              <span>${totalPrice}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t('total')}</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => setIsBookingModalOpen(true)}
          size="sm" 
          className="w-full"
          disabled={!checkIn || !checkOut}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {checkIn && checkOut ? t('bookNow') : t('selectDates')}
        </Button>
        
        <BookingModal
          apartment={apartment}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
        
        <ImageGalleryModal
          images={apartment.images || []}
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          apartmentTitle={apartment.title}
        />
      </CardFooter>
    </Card>
  )
}
