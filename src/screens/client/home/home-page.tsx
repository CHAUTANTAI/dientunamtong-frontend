'use client';

import { Spin, Card, Row, Col } from 'antd';
import BannerCarousel from '@/components/client/BannerCarousel';
import LeftSidebar from '@/components/client/LeftSidebar';
import RightSidebar from '@/components/client/RightSidebar';
import HighlightCategories from '@/components/client/HighlightCategories';
import HighlightProducts from '@/components/client/HighlightProducts';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { IntroContent, BannerContent } from '@/types/pageSection';

export default function HomePage() {
  const { data: sections, isLoading, error } = useGetActivePageSectionsQuery('homepage');

  // Extract section data (even if still loading or error)
  const introSection = sections?.find(s => s.section_identifier === 'intro');
  const bannerSection = sections?.find(s => s.section_identifier === 'banner');

  const introContent = introSection?.content as IntroContent;
  const bannerContent = bannerSection?.content as BannerContent;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Main Layout: 3 Columns (2:6:2) with 2 rows each */}
      <Row gutter={16}>
        {/* Column 1 (Left - 2/10) */}
        <Col xs={0} lg={0} xl={4}>
          {/* Row 1: Left Intro Box */}
          <Card
            style={{
              marginBottom: 16,
              height: '200px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            styles={{ body: { padding: '20px', color: '#fff' } }}
          >
            <h3 style={{ color: '#fff', marginTop: 0 }}>Thông tin</h3>
            <p style={{ color: '#fff', opacity: 0.9 }}>
              Nội dung giới thiệu bên trái
            </p>
          </Card>

          {/* Row 2: Left Sidebar */}
          <div>
            <LeftSidebar />
          </div>
        </Col>

        {/* Column 2 (Center - 6/10) */}
        <Col xs={24} lg={24} xl={16}>
          {/* Row 1: Banner - height matches intro boxes */}
          <div style={{ marginBottom: 16 }}>
            <BannerCarousel bannerIds={bannerContent?.banner_ids} />
          </div>

          {/* Row 2: Main Content (max-content, extends down) */}
          <div>
            {/* Intro content from API if exists */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" tip="Loading content..." />
              </div>
            )}
            
            {!isLoading && introContent && (
              <Card style={{ marginBottom: 24, borderRadius: 8 }} styles={{ body: { padding: '24px' } }}>
                {introContent.title && (
                  <h2 style={{ marginTop: 0, marginBottom: 16 }}>{introContent.title}</h2>
                )}
                {introContent.subtitle && (
                  <p style={{ color: '#666', marginBottom: 16 }}>{introContent.subtitle}</p>
                )}
                <div
                  style={{ fontSize: 14, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: introContent.text }}
                />
              </Card>
            )}

            {/* Main content sections */}
            <HighlightCategories />
            <HighlightProducts />
          </div>
        </Col>

        {/* Column 3 (Right - 2/10) */}
        <Col xs={0} lg={0} xl={4}>
          {/* Row 1: Right Info Box */}
          <Card
            style={{
              marginBottom: 16,
              height: '200px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
            styles={{ body: { padding: '20px', textAlign: 'center', color: '#fff' } }}
          >
            <h3 style={{ color: '#fff', marginTop: 0 }}>Khuyến mãi</h3>
            <p style={{ color: '#fff', opacity: 0.9 }}>
              Nội dung khuyến mãi hoặc thông tin
            </p>
          </Card>

          {/* Row 2: Right Sidebar */}
          <div>
            <RightSidebar />
          </div>
        </Col>
      </Row>
    </div>
  );
}
