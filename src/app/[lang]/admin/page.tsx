import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminRedirect({ params }: PageProps) {
  await params; // Ensure params are resolved
  redirect('/admin');
}

