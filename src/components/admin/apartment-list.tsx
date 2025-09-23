"use client"

import * as React from "react"
import Image from "next/image"
import { Apartment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ApartmentForm } from "./apartment-form"
import { deleteApartment } from "@/lib/supabase/apartments"
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MapPin,
  Users,
  DollarSign,
  Bed,
  Bath,
  Wifi,
  Car,
  Waves
} from "lucide-react"
import { useTranslations } from "next-intl"

interface ApartmentListProps {
  apartments: Apartment[]
  isLoading: boolean
  onApartmentUpdated: () => void
  onApartmentDeleted: () => void
}

export function ApartmentList({ 
  apartments, 
  isLoading, 
  onApartmentUpdated, 
  onApartmentDeleted 
}: ApartmentListProps) {
  const tCommon = useTranslations('common')
  const tAdmin = useTranslations('admin')
  const [editingApartment, setEditingApartment] = React.useState<Apartment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const handleEdit = (apartment: Apartment) => {
    setEditingApartment(apartment)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingApartment(null)
    onApartmentUpdated()
  }

  const handleDelete = async (apartmentId: string) => {
    try {
      await deleteApartment(apartmentId)
      onApartmentDeleted()
    } catch (error) {
      console.error('Error deleting apartment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (apartments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">{tAdmin('list.noApartmentsTitle')}</h3>
          <p className="text-muted-foreground text-center mb-4">
            {tAdmin('list.noApartmentsDesc')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment) => (
          <Card key={apartment.id} className="overflow-hidden">
            <div className="relative h-48">
              {apartment.images && apartment.images.length > 0 ? (
                <Image
                  src={apartment.images[0]}
                  alt={apartment.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{tAdmin('list.noImage')}</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={apartment.is_active ? "default" : "secondary"}>
                  {apartment.is_active ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      {tCommon('active')}
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      {tCommon('inactive')}
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{apartment.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{apartment.address}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {apartment.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${apartment.price_per_night}/night
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {apartment.max_guests} guests
                </div>
                {apartment.characteristics?.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {apartment.characteristics.bedrooms} bed{apartment.characteristics.bedrooms > 1 ? 's' : ''}
                  </div>
                )}
                {apartment.characteristics?.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {apartment.characteristics.bathrooms} bath{apartment.characteristics.bathrooms > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {apartment.characteristics?.wifi && (
                  <Badge variant="outline" className="text-xs">
                    <Wifi className="h-3 w-3 mr-1" />
                    WiFi
                  </Badge>
                )}
                {apartment.characteristics?.parking && (
                  <Badge variant="outline" className="text-xs">
                    <Car className="h-3 w-3 mr-1" />
                    Parking
                  </Badge>
                )}
                {apartment.characteristics?.pool && (
                  <Badge variant="outline" className="text-xs">
                    <Waves className="h-3 w-3 mr-1" />
                    Pool
                  </Badge>
                )}
                {apartment.characteristics?.air_conditioning && (
                  <Badge variant="outline" className="text-xs">
                    AC
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(apartment)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {tCommon('edit')}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{tAdmin('dialogs.deleteTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {tAdmin('dialogs.deleteConfirm', {title: apartment.title})}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(apartment.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {tCommon('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tAdmin('dialogs.editTitle')}</DialogTitle>
            <DialogDescription>
              {tAdmin('dialogs.editDescription')}
            </DialogDescription>
          </DialogHeader>
          {editingApartment && (
            <ApartmentForm 
              apartment={editingApartment}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
