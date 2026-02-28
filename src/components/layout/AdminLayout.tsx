/**
 * AdminLayout Component
 * Main layout wrapper for admin pages with responsive mobile support
 */

'use client';

import { Layout } from 'antd';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import DynamicFavicon from '@/components/common/DynamicFavicon';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useGetProfileQuery } from '@/store/api/profileApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pageTitle = usePageTitle();
  const { data: profile } = useGetProfileQuery();
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
  );
};

AdminLayout.displayName = 'AdminLayout';
