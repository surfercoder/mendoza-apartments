"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { SearchFilters } from "@/lib/types"
import { Search, Users } from "lucide-react"
import { useTranslations } from "next-intl"

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const t = useTranslations('search')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [guests, setGuests] = React.useState<string>("1")

  const handleSearch = () => {
    onSearch({
      checkIn: dateRange?.from,
      checkOut: dateRange?.to,
      guests: parseInt(guests)
    })
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
