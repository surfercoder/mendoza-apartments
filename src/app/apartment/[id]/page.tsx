import { redirect } from 'next/navigation';

interface RedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { id } = await params;
  // Redirect to the default locale (Spanish)
  redirect(`/es/apartment/${id}`);
}
