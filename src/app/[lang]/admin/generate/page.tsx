import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminGenerateRedirect({ params }: PageProps) {
  await params;
  redirect('/admin/generate');
}

