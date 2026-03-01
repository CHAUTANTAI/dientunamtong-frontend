'use client';

import { useEffect } from 'react';
import { Layout } from 'antd';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';
import DynamicFavicon from '@/components/common/DynamicFavicon';
import FloatingContactButton from '@/components/client/FloatingContactButton';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: systemInfo } = useGetSystemInfoQuery();
  const faviconUrl = useSignedImageUrl(systemInfo?.company_logo || '');

  // Dynamically update document title based on system info
  useEffect(() => {
    if (systemInfo?.company_name) {
      document.title = systemInfo.company_name;
    }
  }, [systemInfo]);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <DynamicFavicon logoUrl={faviconUrl} />
      <ClientHeader />
      <Content
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 16px',
          overflow: 'hidden',
        }}
      >
        {children}
      </Content>
      <ClientFooter />
      <FloatingContactButton />

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
        
        @media (max-width: 400px) {
          .ant-layout-content {
            padding: 8px 6px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
