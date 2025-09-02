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

export default function HomePage() {
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
                <h1 className="text-2xl font-bold">Mendoza Apartments</h1>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Beautiful stays in Mendoza, Argentina
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin Dashboard
                </Button>
              </Link>
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
              Find Your Perfect Stay in Mendoza
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover beautiful apartments in the heart of Argentina&apos;s wine country. 
              From cozy downtown spaces to luxury penthouses with mountain views.
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
                {apartments.length > 0 
                  ? `${apartments.length} apartment${apartments.length > 1 ? 's' : ''} available`
                  : 'No apartments found'
                }
              </h3>
              {currentFilters.checkIn && currentFilters.checkOut && (
                <p className="text-muted-foreground">
                  For {currentFilters.checkIn.toLocaleDateString()} - {currentFilters.checkOut.toLocaleDateString()} 
                  • {currentFilters.guests} guest{currentFilters.guests > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          
          {!hasSearched && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                All Available Apartments
              </h3>
              <p className="text-muted-foreground">
                Browse our collection of apartments or use the search above to find availability for specific dates.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : apartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  checkIn={currentFilters.checkIn}
                  checkOut={currentFilters.checkOut}
                  guests={currentFilters.guests}
                />
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No apartments available</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your dates or number of guests to see more options.
              </p>
              <Button 
                onClick={() => {
                  setHasSearched(false)
                  setCurrentFilters({ checkIn: undefined, checkOut: undefined, guests: 1 })
                  handleSearch({ checkIn: undefined, checkOut: undefined, guests: 1 })
                }}
                variant="outline"
              >
                View All Apartments
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
              2024 Mendoza Apartments. Managed by Florencia.
            </p>
            <p className="text-sm">
              For inquiries, contact us via email or WhatsApp through any apartment listing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
