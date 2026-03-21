'use client';

import { Card, Typography, Space } from 'antd';
import { 
  PictureOutlined, 
  MenuOutlined, 
  SearchOutlined, 
  FireOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface HomepageLayoutPreviewProps {
  onSectionClick?: (sectionKey: string) => void;
  activeSection?: string;
}

interface LayoutBoxProps {
  label: string;
  icon: React.ReactNode;
  sectionKey: string;
  color?: string;
  height?: string;
  className?: string;
  isActive?: boolean;
  onSectionClick?: (key: string) => void;
}

/**
 * LayoutBox - Individual clickable section box
 * Extracted outside component to prevent re-creation on render
 */
const LayoutBox = ({ 
  label, 
  icon, 
  sectionKey, 
  color = '#1890ff',
  height = '60px',
  className = '',
  isActive = false,
  onSectionClick
}: LayoutBoxProps) => {
  return (
    <div
      onClick={() => onSectionClick?.(sectionKey)}
      className={className}
      style={{
        border: isActive ? `3px solid ${color}` : `2px solid #d9d9d9`,
        borderRadius: '6px',
        padding: '12px',
        backgroundColor: isActive ? `${color}15` : '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.3s',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.backgroundColor = `${color}10`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#d9d9d9';
          e.currentTarget.style.backgroundColor = '#fafafa';
        }
      }}
    >
      <span style={{ fontSize: '18px', color }}>{icon}</span>
      <Text strong style={{ fontSize: '13px', color: isActive ? color : '#595959' }}>
        {label}
      </Text>
    </div>
  );
};

/**
 * HomepageLayoutPreview - Visual representation of homepage layout
 * Helps admin visualize which section they're editing
 */
export default function HomepageLayoutPreview({ 
  onSectionClick, 
  activeSection 
}: HomepageLayoutPreviewProps) {
  const t = useTranslations('homepageEditor.preview');

  return (
    <Card 
      title={
        <Space>
          <PictureOutlined />
          <span>{t('title')}</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: 24 }}
    >
      <div style={{ 
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
      }}>
        {/* Layout container */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* Banner Header */}
          <LayoutBox
            label={t('bannerHeader')}
            icon={<PictureOutlined />}
            sectionKey="layout-banner-header"
            color="#ff4d4f"
            height="70px"
            isActive={activeSection === 'layout-banner-header'}
            onSectionClick={onSectionClick}
          />

          {/* Mega Menu */}
          <LayoutBox
            label={t('megaMenu')}
            icon={<MenuOutlined />}
            sectionKey="layout-mega-menu"
            color="#722ed1"
            height="50px"
            isActive={activeSection === 'layout-mega-menu'}
            onSectionClick={onSectionClick}
          />

          {/* Search + Slogan */}
          <LayoutBox
            label={t('searchSlogan')}
            icon={<SearchOutlined />}
            sectionKey="layout-search-slogan"
            color="#13c2c2"
            height="50px"
            isActive={activeSection === 'layout-search-slogan'}
            onSectionClick={onSectionClick}
          />

          {/* Slider + Mini Ads Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr',
            gap: '8px',
          }}>
            <LayoutBox
              label={t('mainSlider')}
              icon={<PictureOutlined />}
              sectionKey="slider-slider"
              color="#faad14"
              height="140px"
              isActive={activeSection === 'slider-slider'}
              onSectionClick={onSectionClick}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <LayoutBox
                label={t('miniAd1')}
                icon={<PictureOutlined />}
                sectionKey="slider-slider"
                color="#faad14"
                height="66px"
                isActive={activeSection === 'slider-slider'}
                onSectionClick={onSectionClick}
              />
              <LayoutBox
                label={t('miniAd2')}
                icon={<PictureOutlined />}
                sectionKey="slider-slider"
                color="#faad14"
                height="66px"
                isActive={activeSection === 'slider-slider'}
                onSectionClick={onSectionClick}
              />
            </div>
          </div>

          {/* Main Content: Left Sidebar + Content Sections + Right Sidebar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr 200px',
            gap: '8px',
            minHeight: '400px',
          }}>
            {/* Left Sidebar */}
            <LayoutBox
              label={t('leftSidebar')}
              icon={<UnorderedListOutlined />}
              sectionKey="left-sidebar"
              color="#52c41a"
              height="100%"
              className="left-sidebar"
              isActive={activeSection === 'left-sidebar'}
              onSectionClick={onSectionClick}
            />

            {/* Center Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Trending Keywords - moved inside center column */}
              <LayoutBox
                label={t('trendingKeywords')}
                icon={<FireOutlined />}
                sectionKey="trending-keywords"
                color="#f5222d"
                height="50px"
                isActive={activeSection === 'trending-keywords'}
                onSectionClick={onSectionClick}
              />
              
              <LayoutBox
                label={t('productsSection')}
                icon={<AppstoreOutlined />}
                sectionKey="products-section"
                color="#1890ff"
                height="140px"
                isActive={activeSection === 'products-section'}
                onSectionClick={onSectionClick}
              />
            </div>

            {/* Right Sidebar */}
            <LayoutBox
              label={t('rightSidebar')}
              icon={<RightOutlined />}
              sectionKey="right-sidebar"
              color="#fa8c16"
              height="100%"
              className="right-sidebar"
              isActive={activeSection === 'right-sidebar'}
              onSectionClick={onSectionClick}
            />
          </div>

          {/* Helper Text */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '12px',
            padding: '8px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '6px',
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💡 {t('clickHint')}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
