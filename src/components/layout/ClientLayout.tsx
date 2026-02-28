'use client';

import { useEffect } from 'react';
import { Layout } from 'antd';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';

const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: systemInfo } = useGetSystemInfoQuery();

  // Dynamically update document title based on system info
  useEffect(() => {
    if (systemInfo?.company_name) {
      document.title = systemInfo.company_name;
    }
  }, [systemInfo]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ClientHeader />
      <Content
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        {children}
      </Content>
      <ClientFooter />

      <style jsx global>{`
        @media (max-width: 768px) {
          .ant-layout-content {
            padding: 16px 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .ant-layout-content {
            padding: 12px 8px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
