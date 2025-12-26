import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminLoginRedirect({ params }: PageProps) {
  await params;
  redirect('/admin/login');
}

