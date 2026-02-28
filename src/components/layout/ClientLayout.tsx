'use client';

import { Layout } from 'antd';
import ClientHeader from './ClientHeader';
import ClientFooter from './ClientFooter';

const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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
    </Layout>
  );
}
