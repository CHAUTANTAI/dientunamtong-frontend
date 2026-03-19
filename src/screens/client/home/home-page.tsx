'use client';

import { Row, Col, Spin } from 'antd';
import LeftSidebar from '@/components/client/LeftSidebar';
import RightSidebar from '@/components/client/RightSidebar';
import TrendingKeywords from '@/components/client/TrendingKeywords';
import ProductsSection from '@/components/client/ProductsSection';
import { usePublicPageSections } from '@/hooks/usePublicPageSections';

/**
 * HomePage - Main page với layout 3 cột như source Hoàng Trí
 * Layout: Left Sidebar (20%) + Main Content (55%) + Right Sidebar (25%)
 * 
 * Sections order:
 * 1. Trending Keywords (full width trong main)
 * 2. Products Section (supports up to 3 categories)
 */
export default function HomePage() {
  const { 
    leftSidebar, 
    rightSidebar, 
    trendingKeywords, 
    productsSection,
    isLoading
  } = usePublicPageSections('homepage');

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {/* Show spinner while loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {/* Main 3-Column Layout */}
      {!isLoading && (
        <Row gutter={24}>
          {/* Left Sidebar - 20% */}
          <Col xs={0} lg={0} xl={5}>
            <LeftSidebar content={leftSidebar} />
          </Col>

          {/* Main Content - 55% */}
          <Col xs={24} lg={24} xl={14}>
            {/* Trending Keywords */}
            <TrendingKeywords content={trendingKeywords} />

            {/* Products Section */}
            <ProductsSection content={productsSection} />
          </Col>

          {/* Right Sidebar - 25% */}
          <Col xs={0} lg={0} xl={5}>
            <RightSidebar content={rightSidebar} />
          </Col>
        </Row>
      )}

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 1199px) {
          .news-section-desktop {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

