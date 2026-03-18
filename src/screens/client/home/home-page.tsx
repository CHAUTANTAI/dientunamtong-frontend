'use client';

import { Row, Col } from 'antd';
import LeftSidebar from '@/components/client/LeftSidebar';
import RightSidebar from '@/components/client/RightSidebar';
import TrendingKeywords from '@/components/client/TrendingKeywords';
import ProductsSection from '@/components/client/ProductsSection';

/**
 * HomePage - Main page với layout 3 cột như source Hoàng Trí
 * Layout: Left Sidebar (20%) + Main Content (55%) + Right Sidebar (25%)
 * 
 * Sections order:
 * 1. Trending Keywords (full width trong main)
 * 2. Products Section (supports up to 3 categories)
 */
export default function HomePage() {
  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {/* Main 3-Column Layout */}
      <Row gutter={24}>
        {/* Left Sidebar - 20% */}
        <Col xs={0} lg={0} xl={5}>
          <LeftSidebar />
        </Col>

        {/* Main Content - 55% */}
        <Col xs={24} lg={24} xl={14}>
          {/* Trending Keywords */}
          <TrendingKeywords />

          {/* Products Section */}
          <ProductsSection title="Phụ tùng xe" limit={6} />
        </Col>

        {/* Right Sidebar - 25% */}
        <Col xs={0} lg={0} xl={5}>
          <RightSidebar />
        </Col>
      </Row>

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

