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
import { createBooking } from "@/lib/supabase/bookings"
import { Loader2, Calendar, Users, DollarSign, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

const bookingSchema = z.object({
  guest_name: z.string().min(2, "Name must be at least 2 characters"),
  guest_email: z.string().email("Please enter a valid email address"),
  guest_phone: z.string().min(8, "Please enter a valid phone number"),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

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
      alert("Please select check-in and check-out dates")
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
        status: 'pending' as const,
        notes: data.notes || undefined,
      }

      const result = await createBooking(bookingData)
      
      if (result) {
        setIsSubmitted(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          setIsSubmitted(false)
          form.reset()
        }, 2000)
      } else {
        alert("Failed to submit booking. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      alert("Failed to submit booking. Please try again.")
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
            <p className="text-sm text-muted-foreground">{t('submittedEmail')}</p>
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
                    <Input type="email" placeholder="your.email@example.com" {...field} />
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
                    <Input placeholder="+54 261 123-4567" {...field} />
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
