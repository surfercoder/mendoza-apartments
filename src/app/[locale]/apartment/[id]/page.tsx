import { notFound } from 'next/navigation';
import { getApartmentById } from '@/lib/supabase/apartments';
import { ApartmentDetailsClient } from './apartment-details-client';
import { setRequestLocale } from 'next-intl/server';

interface ApartmentDetailsPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function ApartmentDetailsPage({ params }: ApartmentDetailsPageProps) {
  const { id, locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const apartment = await getApartmentById(id);

  if (!apartment) {
    notFound();
  }

  return <ApartmentDetailsClient apartment={apartment} />;
}
