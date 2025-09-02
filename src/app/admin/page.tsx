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
import { getAllApartments } from "@/lib/supabase/apartments"
import { Apartment } from "@/lib/types"
import { Plus, Home, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
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
            <CardTitle className="text-sm font-medium">Total Apartments</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartments.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeApartments.length} active, {inactiveApartments.length} inactive
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Badge variant="outline" className="text-green-600">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApartments.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeApartments.reduce((sum, apt) => sum + apt.max_guests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total guests across all active apartments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  View Public Site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Apartments Management</h2>
            <p className="text-muted-foreground">
              Create, edit, and manage your apartment listings
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Apartment</DialogTitle>
                <DialogDescription>
                  Add a new apartment to your rental portfolio
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
      </div>
    </div>
  )
}
