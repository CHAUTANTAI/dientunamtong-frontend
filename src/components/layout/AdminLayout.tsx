/**
 * AdminLayout Component
 * Main layout wrapper for admin pages with responsive mobile support
 */

"use client";

import { Layout, App } from 'antd';
import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import DynamicFavicon from '@/components/common/DynamicFavicon';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useGetProfileQuery } from '@/store/api/profileApi';
import { getAuthToken } from '@/utils/auth';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

// Safely extract status from unknown RTK Query error shapes without using `any`
function getStatusFromError(err: unknown): number | string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as Record<string, unknown>;
  const status = e.status ?? e.originalStatus;
  if (typeof status === 'number' || typeof status === 'string') return status;
  return undefined;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pageTitle = usePageTitle();
  const router = useRouter();
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Redirect to login when profile endpoint returns 401 (no valid session)
  useEffect(() => {
    if (!profileLoading && profileError) {
      const status = getStatusFromError(profileError);
      if (status === 401 || status === '401') {
        router.push(`/auth/login`);
      }
    }
  }, [profileError, profileLoading, router]);
  const attemptedRefetch = useRef(false);

  // If profile request returns 401 but we already have a token (login just finished),
  // retry once before redirecting to avoid a race where profile is requested
  // before client auth state is fully persisted.
  useEffect(() => {
    if (!profileLoading && profileError) {
      const status = getStatusFromError(profileError);
      if (status === 401 || status === '401') {
        const token = getAuthToken();
        if (token && !attemptedRefetch.current) {
          attemptedRefetch.current = true;
          // small delay to let login handler finish writing storage/state
          setTimeout(() => {
            refetchProfile();
          }, 150);
          return;
        }

        // No token or already retried -> redirect to login
        router.push(`/auth/login`);
      }
    }
  }, [profileError, profileLoading, router, refetchProfile]);
  const faviconUrl = useSignedImageUrl(profile?.logo || '');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <App>
      <Layout style={{ minHeight: '100vh' }}>
        <DynamicFavicon logoUrl={faviconUrl} />
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
          mobileDrawerOpen={mobileDrawerOpen}
          onMobileClose={() => setMobileDrawerOpen(false)}
        />

        {/* Right Content */}
        <Layout>
          {/* Header */}
          <Header onMenuClick={handleSidebarToggle} isMobile={isMobile} />

          {/* Main Content */}
          <Layout.Content
            style={{
              padding: isMobile ? '12px' : '24px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            {/* Page Title */}
            {pageTitle && (
              <h1
                style={{
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: '#1e1e2e',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                {pageTitle}
              </h1>
            )}

            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Page Content */}
            <div
              style={{
                background: '#fff',
                padding: isMobile ? '12px' : '24px',
                borderRadius: isMobile ? '8px' : '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                marginTop: '16px',
              }}
            >
              {children}
            </div>

            {/* Footer */}
            <Footer />
          </Layout.Content>
        </Layout>

        {/* Mobile Overlay */}
        {isMobile && mobileDrawerOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              zIndex: 998,
            }}
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}
      </Layout>
    </App>
  );
};

AdminLayout.displayName = 'AdminLayout';
