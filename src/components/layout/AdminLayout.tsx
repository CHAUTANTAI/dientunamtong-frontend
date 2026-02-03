/**
 * AdminLayout Component
 * Main layout wrapper for admin pages
 */

'use client';

import { Layout } from 'antd';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ title: string; href?: string }>;
}

export const AdminLayout = ({ children, pageTitle, breadcrumbs }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Right Content */}
      <Layout>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Layout.Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
          }}
        >
          {/* Page Title */}
          {pageTitle && (
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#000',
              }}
            >
              {pageTitle}
            </h1>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

          {/* Page Content */}
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

AdminLayout.displayName = 'AdminLayout';
