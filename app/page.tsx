'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { ROUTES } from '@/constants/routes';

/**
 * Root Page
 * Redirects to login or dashboard based on auth state
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    // The middleware will handle redirecting to login if not authenticated
    router.push(ROUTES.DASHBOARD);
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Spin size="large" />
    </div>
  );
}
