'use client';

import { Spin, Card, Row, Col } from 'antd';
import BannerCarousel from '@/components/client/BannerCarousel';
import LeftSidebar from '@/components/client/LeftSidebar';
import RightSidebar from '@/components/client/RightSidebar';
import HighlightCategories from '@/components/client/HighlightCategories';
import HighlightProducts from '@/components/client/HighlightProducts';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { IntroContent, BannerContent, RightContentBoxContent } from '@/types/pageSection';

// Helper to strip HTML tags for tooltip
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

export default function HomePage() {
  const { data: sections, isLoading } = useGetActivePageSectionsQuery('homepage');

  // Extract section data
  const introSection = sections?.find(s => s.section_identifier === 'intro');
  const bannerSection = sections?.find(s => s.section_identifier === 'banner');
  const rightContentBoxSection = sections?.find(s => s.section_identifier === 'right_content_box');

  const introContent = introSection?.content as unknown as IntroContent;
  const bannerContent = bannerSection?.content as unknown as BannerContent;
  const rightContentBoxContent = rightContentBoxSection?.content as unknown as RightContentBoxContent;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Main Layout: 3 Columns (2:6:2) with 2 rows each */}
      <Row gutter={16}>
        {/* Column 1 (Left - 2/10) */}
        <Col xs={0} lg={0} xl={4}>
          {/* Row 1: Left Intro Box - with dynamic content */}
          <Card
            style={{
              marginBottom: 16,
              height: '200px', // Fixed height
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              overflow: 'hidden', // Changed from auto to hidden
            }}
            styles={{ body: { padding: '20px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' } }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <Spin style={{ color: '#fff' }} />
              </div>
            ) : introContent ? (
              <>
                {introContent.title && (
                  <h3 
                    title={introContent.title}
                    style={{ 
                      color: '#fff', 
                      marginTop: 0, 
                      marginBottom: 12, 
                      fontSize: 18,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                  >
                    {introContent.title}
                  </h3>
                )}
                {introContent.subtitle && (
                  <p 
                    title={introContent.subtitle}
                    style={{ 
                      color: '#fff', 
                      opacity: 0.9, 
                      marginBottom: 12, 
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                  >
                    {introContent.subtitle}
                  </p>
                )}
                <div
                  title={stripHtml(introContent.text)}
                  style={{ 
                    color: '#fff', 
                    opacity: 0.9, 
                    fontSize: 13, 
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    flex: 1,
                    cursor: 'help',
                  }}
                  dangerouslySetInnerHTML={{ __html: introContent.text }}
                />
              </>
            ) : (
              <>
                <h3 style={{ color: '#fff', marginTop: 0, fontSize: 18 }}>Thông tin</h3>
                <p style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>
                  Nội dung giới thiệu sẽ được cập nhật sớm
                </p>
              </>
            )}
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
            <BannerCarousel mediaIds={bannerContent?.media_ids} />
          </div>

          {/* Row 2: Main Content (max-content, extends down) */}
          <div>
            {/* Main content sections */}
            <HighlightCategories />
            <HighlightProducts />
          </div>
        </Col>

        {/* Column 3 (Right - 2/10) */}
        <Col xs={0} lg={0} xl={4}>
          {/* Row 1: Right Content Box - Dynamic from page_sections */}
          <Card
            style={{
              marginBottom: 16,
              height: '200px', // Fixed height
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              overflow: 'hidden', // Changed from auto to hidden
            }}
            styles={{ body: { padding: '20px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' } }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <Spin style={{ color: '#fff' }} />
              </div>
            ) : rightContentBoxContent ? (
              <>
                {rightContentBoxContent.title && (
                  <h3 
                    title={rightContentBoxContent.title}
                    style={{ 
                      color: '#fff', 
                      marginTop: 0, 
                      marginBottom: 12, 
                      fontSize: 18,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                  >
                    {rightContentBoxContent.title}
                  </h3>
                )}
                {rightContentBoxContent.subtitle && (
                  <p 
                    title={rightContentBoxContent.subtitle}
                    style={{ 
                      color: '#fff', 
                      opacity: 0.9, 
                      marginBottom: 12, 
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                  >
                    {rightContentBoxContent.subtitle}
                  </p>
                )}
                <div
                  title={stripHtml(rightContentBoxContent.text)}
                  style={{ 
                    color: '#fff', 
                    opacity: 0.9, 
                    fontSize: 13, 
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    flex: 1,
                    cursor: 'help',
                  }}
                  dangerouslySetInnerHTML={{ __html: rightContentBoxContent.text }}
                />
              </>
            ) : (
              <>
                <h3 style={{ color: '#fff', marginTop: 0, fontSize: 18 }}>Khuyến mãi</h3>
                <p style={{ color: '#fff', opacity: 0.9, fontSize: 14 }}>
                  Nội dung khuyến mãi hoặc thông tin
                </p>
              </>
            )}
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
