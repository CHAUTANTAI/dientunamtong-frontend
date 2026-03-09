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
    <Layout style={{ minHeight: '100vh', overflow: 'visible' }}>
      <DynamicFavicon logoUrl={faviconUrl} />
      <ClientHeader />
      <Content
        style={{
          width: '100%',
          padding: '0',
          paddingTop: '80px', // Space for fixed header
          overflow: 'visible',
        }}
      >
        {children}
      </Content>
      <ClientFooter />
      <FloatingContactButton />
    </Layout>
  );
}
