'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de geração de conteúdo
    router.replace('/admin/analytics');
  }, [router]);

  return null;
}

