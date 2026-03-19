'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Layout } from 'antd';
import TopBar from './TopBar';
import BannerHeader from './BannerHeader';
import MegaMenu from './MegaMenu';
import SearchSlogan from './SearchSlogan';
import SliderArea from '@/components/client/SliderArea';
import ClientFooter from './ClientFooter';
import DynamicFavicon from '@/components/common/DynamicFavicon';
import FloatingContactButton from '@/components/client/FloatingContactButton';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { usePageSections } from '@/hooks/usePageSections';

const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * ClientLayout - Main layout cho client pages
 * Structure theo source Hoàng Trí:
 * 1. TopBar (Work time + Cart + Menu)
 * 2. BannerHeader (Logo + Banner + Hotline)
 * 3. MegaMenu (Categories dropdown)
 * 4. SearchSlogan (Search + Marquee)
 * 5. SliderArea (Slider + Mini ads) - CHỈ hiển thị ở HomePage
 * 6. Content
 * 7. Footer
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { data: systemInfo } = useGetSystemInfoQuery();
  const faviconUrl = useSignedImageUrl(systemInfo?.company_logo || '');

  // Fetch all homepage sections' content
  const { bannerHeader, megaMenu, searchSlogan, slider } = usePageSections('homepage');

  // Only show slider on homepage
  const showSlider = pathname === '/';

  // Dynamically update document title based on system info
  useEffect(() => {
    if (systemInfo?.company_name) {
      document.title = systemInfo.company_name;
    }
  }, [systemInfo]);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'visible', backgroundColor: '#f5f5f5' }}>
      <DynamicFavicon logoUrl={faviconUrl} />
      
      {/* TopBar */}
      <TopBar />
      
      {/* Banner Header */}
      <BannerHeader content={bannerHeader} />
      
      {/* Mega Menu */}
      <MegaMenu content={megaMenu} />
      
      {/* Search + Slogan */}
      <SearchSlogan content={searchSlogan} />
      
      {/* Slider Area - Only show on homepage */}
      {showSlider && <SliderArea content={slider} />}
      
      {/* Main Content */}
      <Content
        style={{
          width: '100%',
          padding: '0',
          overflow: 'visible',
          backgroundColor: '#f5f5f5',
        }}
      >
        {children}
      </Content>
      
      {/* Footer */}
      <ClientFooter />
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </Layout>
  );
}

