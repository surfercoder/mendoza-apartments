"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Apartment } from "@/lib/types"
import { Loader2, Calendar, Users, DollarSign, MapPin, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { openWhatsAppChat } from "@/lib/whatsapp"
import { toast } from "sonner"

// We'll create the schema inside the component to access translations
const createBookingSchema = (tValidation: (key: string) => string) => z.object({
  guest_name: z.string().min(2, tValidation('nameMinLength')),
  guest_email: z.string().email(tValidation('emailInvalid')),
  guest_phone: z.string().min(8, tValidation('phoneMinLength')),
  notes: z.string().optional(),
})

type BookingFormData = {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  notes?: string;
}

interface BookingModalProps {
  apartment: Apartment
  checkIn?: Date
  checkOut?: Date
  guests: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BookingModal({
  apartment,
  checkIn,
  checkOut,
  guests,
  isOpen,
  onClose,
  onSuccess
}: BookingModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const t = useTranslations('booking')
  const tSearch = useTranslations('search')
  const tValidation = useTranslations('validation')
  const bookingSchema = createBookingSchema(tValidation)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      notes: "",
    },
  })

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return nights * apartment.price_per_night
  }

  const totalPrice = calculateTotalPrice()
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0

  const onSubmit = async (data: BookingFormData) => {
    if (!checkIn || !checkOut) {
      toast.error(tSearch('selectDatesAlert'))
      return
    }

    setIsLoading(true)
    try {
      const bookingData = {
        apartment_id: apartment.id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0],
        total_guests: guests,
        total_price: totalPrice,
        notes: data.notes || undefined,
      }

      // Submit booking via API (which will also send emails)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()
      
      if (result.success) {
        setIsSubmitted(true)
        
        // Open WhatsApp chat after successful submission
        setTimeout(() => {
          openWhatsAppChat(apartment, result.booking)
        }, 1000)
        
        setTimeout(() => {
          onSuccess()
          onClose()
          setIsSubmitted(false)
          form.reset()
        }, 3000) // Give more time for WhatsApp to open
      } else {
        toast.error(result.error || tSearch('bookingFailed'))
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      toast.error(tSearch('bookingFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isSubmitted) {
      onClose()
      form.reset()
    }
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">{t('submittedTitle')}</h3>
            <p className="text-muted-foreground mb-4">{t('submittedDesc')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('submittedEmail')}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp chat opened for payment coordination</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', {title: apartment.title})}
          </DialogDescription>
        </DialogHeader>

        {/* Booking Summary */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">{t('summary.title')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {apartment.title}
              </span>
            </div>
            {checkIn && checkOut && (
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(checkIn, "MMM dd")} - {format(checkOut, "MMM dd, yyyy")}
                </span>
                <span>{t('summary.nights', {count: nights})}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {t('summary.guests', {count: guests})}
              </span>
            </div>
            {totalPrice > 0 && (
              <div className="flex items-center justify-between font-semibold pt-2 border-t">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t('summary.total')}
                </span>
                <span>${totalPrice}</span>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guest_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.fullNamePh')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guest_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={tSearch('emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guest_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tSearch('phonePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('form.notesPh')}
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !checkIn || !checkOut}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t('actions.submitting') : t('actions.submit')}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 rounded">
          <strong>{t('note.title')}</strong> {t('note.content')}
        </div>
      </DialogContent>
    </Dialog>
  )
}
