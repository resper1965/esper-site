import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminAnalyticsRedirect({ params }: PageProps) {
  await params;
  redirect('/admin/analytics');
}

