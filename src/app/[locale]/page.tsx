"use client"

import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { ApartmentCard } from "@/components/apartment-card"
import { getAvailableApartments } from "@/lib/supabase/apartments"
import { Apartment, SearchFilters } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Link from "next/link"
import { MapPin, Heart } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [apartments, setApartments] = React.useState<Apartment[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [currentFilters, setCurrentFilters] = React.useState<SearchFilters>({
    checkIn: undefined,
    checkOut: undefined,
    guests: 1
  })

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true)
    setCurrentFilters(filters)
    setHasSearched(true)
    
    try {
      const results = await getAvailableApartments(filters)
      setApartments(results)
    } catch (error) {
      console.error('Error searching apartments:', error)
      setApartments([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load all apartments on initial page load
  React.useEffect(() => {
    const loadInitialApartments = async () => {
      setIsLoading(true)
      try {
        const results = await getAvailableApartments({ checkIn: undefined, checkOut: undefined, guests: 1 })
        setApartments(results)
      } catch (error) {
        console.error('Error loading apartments:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialApartments()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">{t('brand')}</h1>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {t('tagline')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${locale}/admin`}>
                <Button variant="outline" size="sm">
                  {t('adminDashboard')}
                </Button>
              </Link>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('heroTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </div>
          
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {hasSearched && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                {t('results.found', {count: apartments.length})}
              </h3>
              {currentFilters.checkIn && currentFilters.checkOut && (
                <p className="text-muted-foreground">
                  {t('results.forDates', {from: currentFilters.checkIn.toLocaleDateString(), to: currentFilters.checkOut.toLocaleDateString()})}
                  • {t('results.guests', {count: currentFilters.guests})}
                </p>
              )}
            </div>
          )}
          
          {!hasSearched && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                {t('results.allTitle')}
              </h3>
              <p className="text-muted-foreground">
                {t('results.allSubtitle')}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse" data-testid="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : apartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment, index) => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  checkIn={currentFilters.checkIn}
                  checkOut={currentFilters.checkOut}
                  guests={currentFilters.guests}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">{t('results.none')}</h3>
              <p className="text-muted-foreground mb-4">{t('results.adjust')}</p>
              <Button 
                onClick={() => {
                  setHasSearched(false)
                  setCurrentFilters({ checkIn: undefined, checkOut: undefined, guests: 1 })
                  handleSearch({ checkIn: undefined, checkOut: undefined, guests: 1 })
                }}
                variant="outline"
              >
                {t('results.viewAll')}
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <p className="text-sm">
              {t('footer.contact')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
