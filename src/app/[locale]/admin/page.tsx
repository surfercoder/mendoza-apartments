"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ApartmentForm } from "@/components/admin/apartment-form"
import { ApartmentList } from "@/components/admin/apartment-list"
import { ReservationsList } from "@/components/admin/reservations-list"
import { getAllApartments } from "@/lib/supabase/apartments"
import { Apartment } from "@/lib/types"
import { Plus, Home, Calendar, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const tTabs = useTranslations('tabs')
  const locale = useLocale()
  const [apartments, setApartments] = React.useState<Apartment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const loadApartments = async () => {
    setIsLoading(true)
    try {
      const data = await getAllApartments()
      setApartments(data)
    } catch (error) {
      console.error('Error loading apartments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadApartments()
  }, [])

  const handleApartmentCreated = () => {
    setIsCreateDialogOpen(false)
    loadApartments()
  }

  const handleApartmentUpdated = () => {
    loadApartments()
  }

  const handleApartmentDeleted = () => {
    loadApartments()
  }

  const activeApartments = apartments.filter(apt => apt.is_active)
  const inactiveApartments = apartments.filter(apt => !apt.is_active)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalApartments')}</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartments.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeApartments.length} {tc('active')}, {inactiveApartments.length} {tc('inactive')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeListings')}</CardTitle>
            <Badge variant="outline" className="text-green-600">
              {tc('active')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApartments.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.availableForBooking')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.maxCapacity')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeApartments.reduce((sum, apt) => sum + apt.max_guests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalGuestsAcrossActive')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.quickActions')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href={`/${locale}`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  {tc('viewPublicSite')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="apartments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apartments" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {tTabs('apartments')}
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {tTabs('reservations')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apartments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.apartmentsManagement')}</h2>
              <p className="text-muted-foreground">{t('dashboard.createEditManage')}</p>
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {tc('addNewApartment')}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <div />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('dialogs.createTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dialogs.createDescription')}
                  </DialogDescription>
                </DialogHeader>
                <ApartmentForm 
                  onSuccess={handleApartmentCreated}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <ApartmentList
            apartments={apartments}
            isLoading={isLoading}
            onApartmentUpdated={handleApartmentUpdated}
            onApartmentDeleted={handleApartmentDeleted}
          />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.reservationsManagement')}</h2>
            <p className="text-muted-foreground">{t('dashboard.manageBookingRequests')}</p>
          </div>
          
          <ReservationsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
