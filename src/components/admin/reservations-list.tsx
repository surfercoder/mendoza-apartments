"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Mail, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react"
import { Booking } from "@/lib/types"
import { getAllBookings, updateBookingStatus } from "@/lib/supabase/bookings"
import { openWhatsAppChat } from "@/lib/whatsapp"

interface ReservationWithApartment extends Booking {
  apartments: {
    title: string
    address: string
    whatsapp_number?: string
    contact_phone?: string
  }
}

export function ReservationsList() {
  const [reservations, setReservations] = useState<ReservationWithApartment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithApartment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  
  const t = useTranslations('reservations')
  const tStatus = useTranslations('reservations.status')
  const tActions = useTranslations('reservations.actions')
  const tDetails = useTranslations('reservations.details')
  const tTable = useTranslations('reservations.table')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await getAllBookings()
      setReservations(data as ReservationWithApartment[])
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reservationId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      setUpdating(reservationId)
      const updated = await updateBookingStatus(reservationId, newStatus)
      
      if (updated) {
        setReservations(prev => 
          prev.map(res => 
            res.id === reservationId 
              ? { ...res, status: newStatus }
              : res
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />{tStatus('pending')}</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />{tStatus('confirmed')}</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />{tStatus('cancelled')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const openWhatsApp = (reservation: ReservationWithApartment) => {
    const apartment = {
      id: reservation.apartment_id,
      title: reservation.apartments.title,
      description: '', // Not needed for WhatsApp
      characteristics: {}, // Not needed for WhatsApp
      price_per_night: 0, // Not needed for WhatsApp
      max_guests: 0, // Not needed for WhatsApp
      address: reservation.apartments.address,
      images: [], // Not needed for WhatsApp
      contact_email: '', // Not needed for WhatsApp
      contact_phone: reservation.apartments.contact_phone,
      whatsapp_number: reservation.apartments.whatsapp_number,
      is_active: true, // Not needed for WhatsApp
      created_at: '', // Not needed for WhatsApp
      updated_at: '', // Not needed for WhatsApp
    }
    openWhatsAppChat(apartment, reservation)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('loading')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tTable('guest')}</TableHead>
                <TableHead>{tTable('apartment')}</TableHead>
                <TableHead>{tTable('dates')}</TableHead>
                <TableHead>{tTable('guests')}</TableHead>
                <TableHead>{tTable('total')}</TableHead>
                <TableHead>{tTable('status')}</TableHead>
                <TableHead>{tTable('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.guest_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {reservation.guest_email}
                      </div>
                      {reservation.guest_phone && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {reservation.guest_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.apartments.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.apartments.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(reservation.check_in), "MMM dd, yyyy")}
                      </div>
                      <div className="text-muted-foreground">
                        {tDetails('to')} {format(new Date(reservation.check_out), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {reservation.total_guests}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {reservation.total_price}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="view-button"
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setIsDetailOpen(true)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {tActions('view')}
                      </Button>
                      <Dialog open={isDetailOpen && selectedReservation?.id === reservation.id} onOpenChange={(open) => {
                        setIsDetailOpen(open)
                        if (!open) setSelectedReservation(null)
                      }}>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{tDetails('title')}</DialogTitle>
                            <DialogDescription>
                              {tDetails('description')}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedReservation && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">{tDetails('guestInfo')}</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>{tDetails('name')}</strong> {selectedReservation.guest_name}</div>
                                    <div><strong>{tDetails('email')}</strong> {selectedReservation.guest_email}</div>
                                    {selectedReservation.guest_phone && (
                                      <div><strong>{tDetails('phone')}</strong> {selectedReservation.guest_phone}</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">{tDetails('apartmentInfo')}</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>{tDetails('apartmentTitle')}</strong> {selectedReservation.apartments.title}</div>
                                    <div><strong>{tDetails('address')}</strong> {selectedReservation.apartments.address}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">{tDetails('bookingDetails')}</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><strong>{tDetails('checkIn')}</strong> {format(new Date(selectedReservation.check_in), "MMM dd, yyyy")}</div>
                                    <div><strong>{tDetails('checkOut')}</strong> {format(new Date(selectedReservation.check_out), "MMM dd, yyyy")}</div>
                                    <div><strong>{tDetails('guests')}</strong> {selectedReservation.total_guests}</div>
                                    <div><strong>{tDetails('total')}</strong> ${selectedReservation.total_price}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">{tDetails('statusActions')}</h4>
                                  <div className="space-y-2">
                                    <div>{getStatusBadge(selectedReservation.status)}</div>
                                    <Select
                                      value={selectedReservation.status}
                                      onValueChange={(value) => handleStatusChange(selectedReservation.id, value as 'pending' | 'confirmed' | 'cancelled')}
                                      disabled={updating === selectedReservation.id}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">{tStatus('pending')}</SelectItem>
                                        <SelectItem value="confirmed">{tStatus('confirmed')}</SelectItem>
                                        <SelectItem value="cancelled">{tStatus('cancelled')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              {selectedReservation.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">{tDetails('guestNotes')}</h4>
                                  <div className="p-3 bg-muted rounded-md text-sm">
                                    {selectedReservation.notes}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => openWhatsApp(selectedReservation)}
                                  className="flex-1"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  {tDetails('contactWhatsApp')}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsDetailOpen(false)}
                                >
                                  {tActions('close')}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWhatsApp(reservation)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {tActions('whatsapp')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {reservations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('noReservations')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
