"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createApartment, updateApartment } from "@/lib/supabase/apartments"
import { Apartment } from "@/lib/types"
import { Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { uploadApartmentImage } from "@/lib/supabase/storage"

const apartmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price_per_night: z.number().min(1, "Price must be greater than 0"),
  max_guests: z.number().min(1, "Must accommodate at least 1 guest"),
  address: z.string().min(1, "Address is required"),
  contact_email: z.string().email("Valid email is required"),
  contact_phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  is_active: z.boolean(),
  images: z.array(z.string().url("Must be a valid URL")).optional(),
  characteristics: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    wifi: z.boolean().optional(),
    kitchen: z.boolean().optional(),
    air_conditioning: z.boolean().optional(),
    parking: z.boolean().optional(),
    pool: z.boolean().optional(),
    balcony: z.boolean().optional(),
    terrace: z.boolean().optional(),
    garden: z.boolean().optional(),
    bbq: z.boolean().optional(),
    washing_machine: z.boolean().optional(),
    mountain_view: z.boolean().optional(),
  }),
})

type ApartmentFormData = z.infer<typeof apartmentSchema>

interface ApartmentFormProps {
  apartment?: Apartment
  onSuccess: () => void
  onCancel: () => void
}

export function ApartmentForm({ apartment, onSuccess, onCancel }: ApartmentFormProps) {
  const t = useTranslations('admin.form')
  const [isLoading, setIsLoading] = React.useState(false)
  const [imageUrls, setImageUrls] = React.useState<string[]>(apartment?.images || [])
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const form = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: apartment?.title || "",
      description: apartment?.description || "",
      price_per_night: apartment?.price_per_night || 0,
      max_guests: apartment?.max_guests || 1,
      address: apartment?.address || "",
      contact_email: apartment?.contact_email || "florencia@mendozaapartments.com",
      contact_phone: apartment?.contact_phone || "",
      whatsapp_number: apartment?.whatsapp_number || "",
      is_active: apartment?.is_active ?? true,
      images: apartment?.images || [],
      characteristics: {
        bedrooms: apartment?.characteristics?.bedrooms || 0,
        bathrooms: apartment?.characteristics?.bathrooms || 0,
        wifi: apartment?.characteristics?.wifi || false,
        kitchen: apartment?.characteristics?.kitchen || false,
        air_conditioning: apartment?.characteristics?.air_conditioning || false,
        parking: apartment?.characteristics?.parking || false,
        pool: apartment?.characteristics?.pool || false,
        balcony: apartment?.characteristics?.balcony || false,
        terrace: apartment?.characteristics?.terrace || false,
        garden: apartment?.characteristics?.garden || false,
        bbq: apartment?.characteristics?.bbq || false,
        washing_machine: apartment?.characteristics?.washing_machine || false,
        mountain_view: apartment?.characteristics?.mountain_view || false,
      },
    },
  })

  const removeImageUrl = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updatedImages)
    form.setValue("images", updatedImages)
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadError(null)
    const uploaded: string[] = []
    try {
      for (const file of Array.from(files)) {
        const res = await uploadApartmentImage(file)
        if ("error" in res) {
          setUploadError(res.error)
          continue
        }
        uploaded.push(res.url)
      }
      if (uploaded.length > 0) {
        const updated = [...imageUrls, ...uploaded]
        setImageUrls(updated)
        form.setValue("images", updated)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ApartmentFormData) => {
    setIsLoading(true)
    try {
      const apartmentData = {
        ...data,
        images: imageUrls,
      }

      if (apartment) {
        await updateApartment(apartment.id, apartmentData)
      } else {
        await createApartment(apartmentData)
      }
      
      onSuccess()
    } catch (error) {
      console.error("Error saving apartment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('title')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Cozy Downtown Apartment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('descriptionPlaceholder')}
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
                    <FormControl>
                      <Input placeholder="San Martín 1234, Mendoza Capital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price_per_night"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('pricePerNight')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="85"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('maxGuests')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('activeListing')}</FormLabel>
                      <FormDescription>
                        {t('activeListingDesc')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contactInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contactEmail')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="florencia@mendozaapartments.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contactPhone')}</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 261 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('whatsappNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 261 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('whatsappHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Characteristics + Images Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('characteristics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <FormField
                control={form.control}
                name="characteristics.bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bedrooms')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="characteristics.bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bathrooms')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "wifi", label: t('wifi') },
                { name: "kitchen", label: t('kitchen') },
                { name: "air_conditioning", label: t('air_conditioning') },
                { name: "parking", label: t('parking') },
                { name: "pool", label: t('pool') },
                { name: "balcony", label: t('balcony') },
                { name: "terrace", label: t('terrace') },
                { name: "garden", label: t('garden') },
                { name: "bbq", label: t('bbq') },
                { name: "washing_machine", label: t('washing_machine') },
                { name: "mountain_view", label: t('mountain_view') },
              ].map((characteristic) => (
                <FormField
                  key={characteristic.name}
                  control={form.control}
                  name={`characteristics.${characteristic.name}` as `characteristics.${'wifi' | 'kitchen' | 'air_conditioning' | 'parking' | 'pool' | 'balcony' | 'terrace' | 'garden' | 'bbq' | 'washing_machine' | 'mountain_view'}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {characteristic.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('images')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload */}
              <div className="space-y-2">
                <Label htmlFor="imageFiles">Upload images</Label>
                <Input id="imageFiles" type="file" accept="image/*" multiple onChange={(e) => handleFilesSelected(e.target.files)} />
                {isUploading && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                  </div>
                )}
                {uploadError && (
                  <div className="text-xs text-red-600">{uploadError}</div>
                )}
              </div>

              {imageUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('imageUrls')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative p-2 border rounded">
                        <div className="relative h-20 w-full overflow-hidden rounded">
                          <Image src={url} alt={`image-${index}`} fill className="object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white/90"
                          onClick={() => removeImageUrl(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel', { default: 'Cancel' })}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {apartment ? t('update') : t('create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
