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
import { Loader2, Plus, X } from "lucide-react"

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
  const [isLoading, setIsLoading] = React.useState(false)
  const [imageUrls, setImageUrls] = React.useState<string[]>(apartment?.images || [])
  const [newImageUrl, setNewImageUrl] = React.useState("")

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

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      const updatedImages = [...imageUrls, newImageUrl.trim()]
      setImageUrls(updatedImages)
      form.setValue("images", updatedImages)
      setNewImageUrl("")
    }
  }

  const removeImageUrl = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updatedImages)
    form.setValue("images", updatedImages)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the apartment, its location, and amenities..."
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
                    <FormLabel>Address</FormLabel>
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
                      <FormLabel>Price per Night ($)</FormLabel>
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
                      <FormLabel>Max Guests</FormLabel>
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
                      <FormLabel>Active Listing</FormLabel>
                      <FormDescription>
                        Make this apartment available for booking
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
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
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
                    <FormLabel>Contact Phone</FormLabel>
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
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 261 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include country code for WhatsApp integration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Characteristics */}
        <Card>
          <CardHeader>
            <CardTitle>Apartment Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <FormField
                control={form.control}
                name="characteristics.bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
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
                    <FormLabel>Bathrooms</FormLabel>
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
                { name: "wifi", label: "WiFi" },
                { name: "kitchen", label: "Kitchen" },
                { name: "air_conditioning", label: "Air Conditioning" },
                { name: "parking", label: "Parking" },
                { name: "pool", label: "Pool" },
                { name: "balcony", label: "Balcony" },
                { name: "terrace", label: "Terrace" },
                { name: "garden", label: "Garden" },
                { name: "bbq", label: "BBQ" },
                { name: "washing_machine", label: "Washing Machine" },
                { name: "mountain_view", label: "Mountain View" },
              ].map((characteristic) => (
                <FormField
                  key={characteristic.name}
                  control={form.control}
                  name={`characteristics.${characteristic.name}` as any} // eslint-disable-line
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
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              />
              <Button type="button" onClick={addImageUrl} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {imageUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Image URLs:</Label>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImageUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {apartment ? "Update Apartment" : "Create Apartment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
