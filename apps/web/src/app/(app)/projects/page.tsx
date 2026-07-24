'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ProjectsPage() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    router.push('/dashboard');
  }, []);

  return null;
}
