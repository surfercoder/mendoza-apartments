"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { SearchFilters } from "@/lib/types"
import { Search, Users, SlidersHorizontal } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const t = useTranslations('search')
  const tAdmin = useTranslations('admin.form')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [guests, setGuests] = React.useState<string>("1")
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Define available amenities
  const availableAmenities = [
    'wifi', 'kitchen', 'air_conditioning', 'parking', 'pool', 
    'balcony', 'terrace', 'garden', 'bbq', 'washing_machine',
    'mountain_view', 'hot_water', 'heating', 'coffee_maker', 
    'microwave', 'oven', 'refrigerator', 'iron', 'hair_dryer',
    'tv', 'fire_extinguisher', 'crib', 'blackout_curtains',
    'bidet', 'dishwasher', 'single_floor', 'cleaning_service'
  ]

  const handleSearch = () => {
    onSearch({
      checkIn: dateRange?.from,
      checkOut: dateRange?.to,
      guests: parseInt(guests),
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
    })
  }

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handleClearFilters = () => {
    setSelectedAmenities([])
  }

  const handleApplyFilters = () => {
    setIsDialogOpen(false)
  }

  const isSearchDisabled = !dateRange?.from || !dateRange?.to || isLoading

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="date" className="text-sm font-medium mb-2 block">
              {t('checkInOut')}
            </Label>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              placeholder={t('selectDates')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guests" className="text-sm font-medium mb-2 block">
                {t('guests')}
              </Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger id="guests">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('selectGuests')} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {t('guest', {count: num})}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block opacity-0">
                {t('filters')}
              </Label>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="default" className="h-9 w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t('filters')}
                    {selectedAmenities.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        {selectedAmenities.length}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('amenitiesTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('amenitiesDescription')}
                      {selectedAmenities.length > 0 && (
                        <span className="ml-2 font-medium text-primary">
                          {t('selectedCount', { count: selectedAmenities.length })}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tAdmin(amenity)}
                        </label>
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="w-full sm:w-auto"
                    >
                      {t('clearFilters')}
                    </Button>
                    <Button
                      onClick={handleApplyFilters}
                      className="w-full sm:w-auto"
                    >
                      {t('applyFilters')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSearch}
            disabled={isSearchDisabled}
            size="lg"
            className="px-8"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? t('searching') : t('searchApartments')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
