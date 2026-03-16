'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Space, Typography, Row, Col, App, Spin } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetPageSectionsQuery, useUpdatePageSectionsMutation } from '@/store/api/pageSectionApi';
import type {
  PageSection,
  BannerHeaderContent,
  MegaMenuContent,
  SearchSloganContent,
  SliderContent,
  TrendingKeywordsContent,
  ProductsSectionContent,
  NewsSectionContent,
  VideoSectionContent,
  LeftSidebarContent,
  RightSidebarContent,
} from '@/types/pageSection';

// Import all modals
import BannerHeaderEditModal from './BannerHeaderEditModal';
import MegaMenuEditModal from './MegaMenuEditModal';
import SearchSloganEditModal from './SearchSloganEditModal';
import SliderEditModal from './SliderEditModal';
import TrendingKeywordsEditModal from './TrendingKeywordsEditModal';
import ProductsSectionEditModal from './ProductsSectionEditModal';
import NewsSectionEditModal from './NewsSectionEditModal';
import VideoSectionEditModal from './VideoSectionEditModal';
import LeftSidebarEditModal from './LeftSidebarEditModal';
import RightSidebarEditModal from './RightSidebarEditModal';

const { Title, Text } = Typography;

export default function HomepageEditorPage() {
  const t = useTranslations('homepageEditor');
  const { message } = App.useApp();
  
  const { data: sections, isLoading } = useGetPageSectionsQuery('homepage');
  const [updateSections, { isLoading: isSaving }] = useUpdatePageSectionsMutation();

  // State for all 10 sections
  const [bannerHeaderSection, setBannerHeaderSection] = useState<PageSection | null>(null);
  const [megaMenuSection, setMegaMenuSection] = useState<PageSection | null>(null);
  const [searchSloganSection, setSearchSloganSection] = useState<PageSection | null>(null);
  const [sliderSection, setSliderSection] = useState<PageSection | null>(null);
  const [trendingKeywordsSection, setTrendingKeywordsSection] = useState<PageSection | null>(null);
  const [productsSectionState, setProductsSectionState] = useState<PageSection | null>(null);
  const [newsSectionState, setNewsSectionState] = useState<PageSection | null>(null);
  const [videoSectionState, setVideoSectionState] = useState<PageSection | null>(null);
  const [leftSidebarSection, setLeftSidebarSection] = useState<PageSection | null>(null);
  const [rightSidebarSection, setRightSidebarSection] = useState<PageSection | null>(null);
  
  // Modal states
  const [bannerHeaderModalOpen, setBannerHeaderModalOpen] = useState(false);
  const [megaMenuModalOpen, setMegaMenuModalOpen] = useState(false);
  const [searchSloganModalOpen, setSearchSloganModalOpen] = useState(false);
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [trendingKeywordsModalOpen, setTrendingKeywordsModalOpen] = useState(false);
  const [productsSectionModalOpen, setProductsSectionModalOpen] = useState(false);
  const [newsSectionModalOpen, setNewsSectionModalOpen] = useState(false);
  const [videoSectionModalOpen, setVideoSectionModalOpen] = useState(false);
  const [leftSidebarModalOpen, setLeftSidebarModalOpen] = useState(false);
  const [rightSidebarModalOpen, setRightSidebarModalOpen] = useState(false);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!sections) return false;

    const compareContent = (original: Record<string, unknown> | undefined, current: Record<string, unknown> | undefined): boolean => {
      return JSON.stringify(original) !== JSON.stringify(current);
    };

    const checkSection = (identifier: string, currentSection: PageSection | null) => {
      const original = sections.find(s => s.section_identifier === identifier);
      return original && currentSection && compareContent(original.content, currentSection.content);
    };

    return checkSection('banner_header', bannerHeaderSection) ||
           checkSection('mega_menu', megaMenuSection) ||
           checkSection('search_slogan', searchSloganSection) ||
           checkSection('slider_section', sliderSection) ||
           checkSection('trending_keywords_section', trendingKeywordsSection) ||
           checkSection('products_section', productsSectionState) ||
           checkSection('news_section', newsSectionState) ||
           checkSection('video_section', videoSectionState) ||
           checkSection('left_sidebar', leftSidebarSection) ||
           checkSection('right_sidebar', rightSidebarSection);
  }, [
    sections,
    bannerHeaderSection,
    megaMenuSection,
    searchSloganSection,
    sliderSection,
    trendingKeywordsSection,
    productsSectionState,
    newsSectionState,
    videoSectionState,
    leftSidebarSection,
    rightSidebarSection,
  ]);

  // Initialize sections from API data
  useEffect(() => {
    if (sections) {
      const getSection = (identifier: string) => sections.find(s => s.section_identifier === identifier);

      setBannerHeaderSection(getSection('banner_header') || {
        id: '', page_identifier: 'homepage', section_identifier: 'banner_header',
        content: {}, sort_order: 0, is_active: true, created_at: '', updated_at: '',
      });

      setMegaMenuSection(getSection('mega_menu') || {
        id: '', page_identifier: 'homepage', section_identifier: 'mega_menu',
        content: { static_items: [] }, sort_order: 1, is_active: true, created_at: '', updated_at: '',
      });

      setSearchSloganSection(getSection('search_slogan') || {
        id: '', page_identifier: 'homepage', section_identifier: 'search_slogan',
        content: { slogan_text: '' }, sort_order: 2, is_active: true, created_at: '', updated_at: '',
      });

      setSliderSection(getSection('slider_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'slider_section',
        content: { slides: [], mini_ads: [], slider_settings: {}, mini_ad_settings: {} },
        sort_order: 3, is_active: true, created_at: '', updated_at: '',
      });

      setTrendingKeywordsSection(getSection('trending_keywords_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'trending_keywords_section',
        content: { title: 'Xu hướng tìm kiếm:', show_icon: true, keywords: [] },
        sort_order: 4, is_active: true, created_at: '', updated_at: '',
      });

      setProductsSectionState(getSection('products_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'products_section',
        content: { title: 'Phụ tùng xe', limit: 6, mode: 'auto', filter_by: 'latest', show_price: true },
        sort_order: 5, is_active: true, created_at: '', updated_at: '',
      });

      setNewsSectionState(getSection('news_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'news_section',
        content: { title: 'Tin tức xe', limit: 6, mode: 'auto', display_mode: 'grid', show_thumbnail: true },
        sort_order: 6, is_active: true, created_at: '', updated_at: '',
      });

      setVideoSectionState(getSection('video_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'video_section',
        content: { title: 'Video', videos: [], layout_mode: 'carousel' },
        sort_order: 7, is_active: true, created_at: '', updated_at: '',
      });

      setLeftSidebarSection(getSection('left_sidebar') || {
        id: '', page_identifier: 'homepage', section_identifier: 'left_sidebar',
        content: { show_all: true, max_items: 8 }, sort_order: 8, is_active: true, created_at: '', updated_at: '',
      });

      setRightSidebarSection(getSection('right_sidebar') || {
        id: '', page_identifier: 'homepage', section_identifier: 'right_sidebar',
        content: { news_items: [] }, sort_order: 9, is_active: true, created_at: '', updated_at: '',
      });
    }
  }, [sections]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!bannerHeaderSection || !megaMenuSection || !searchSloganSection || !sliderSection ||
        !trendingKeywordsSection || !productsSectionState || !newsSectionState ||
        !videoSectionState || !leftSidebarSection || !rightSidebarSection) return;

    try {
      await updateSections({
        pageIdentifier: 'homepage',
        data: {
          sections: [
            { sectionIdentifier: 'banner_header', content: bannerHeaderSection.content, sortOrder: 0, isActive: true },
            { sectionIdentifier: 'mega_menu', content: megaMenuSection.content, sortOrder: 1, isActive: true },
            { sectionIdentifier: 'search_slogan', content: searchSloganSection.content, sortOrder: 2, isActive: true },
            { sectionIdentifier: 'slider_section', content: sliderSection.content, sortOrder: 3, isActive: true },
            { sectionIdentifier: 'trending_keywords_section', content: trendingKeywordsSection.content, sortOrder: 4, isActive: true },
            { sectionIdentifier: 'products_section', content: productsSectionState.content, sortOrder: 5, isActive: true },
            { sectionIdentifier: 'news_section', content: newsSectionState.content, sortOrder: 6, isActive: true },
            { sectionIdentifier: 'video_section', content: videoSectionState.content, sortOrder: 7, isActive: true },
            { sectionIdentifier: 'left_sidebar', content: leftSidebarSection.content, sortOrder: 8, isActive: true },
            { sectionIdentifier: 'right_sidebar', content: rightSidebarSection.content, sortOrder: 9, isActive: true },
          ],
        },
      }).unwrap();

      message.success(t('saveSuccess'));
    } catch (error) {
      console.error('Save error:', error);
      if (error instanceof Error) {
        message.error(`${t('saveFailed')}: ${error.message}`);
      } else {
        message.error(t('saveFailed'));
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Title level={2} style={{ margin: 0 }}>
            {t('title')}
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              onClick={handleSaveAll}
              loading={isSaving}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? t('saving') : t('saveAll')}
            </Button>
          </Space>
        </div>
        <Text type="secondary">{t('subtitle')}</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar - Section List */}
        <Col xs={24} md={6}>
          <Card title="Sections" style={{ position: 'sticky', top: 80 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text type="secondary" strong style={{ fontSize: 12 }}>LAYOUT SECTIONS</Text>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('banner-header-section')?.scrollIntoView({ behavior: 'smooth' })}>
                1. Banner Header
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('mega-menu-section')?.scrollIntoView({ behavior: 'smooth' })}>
                2. Mega Menu
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('search-slogan-section')?.scrollIntoView({ behavior: 'smooth' })}>
                3. Search Slogan
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('slider-section')?.scrollIntoView({ behavior: 'smooth' })}>
                4. Slider Section
              </Button>
              
              <div style={{ margin: '12px 0' }} />
              <Text type="secondary" strong style={{ fontSize: 12 }}>HOMEPAGE CONTENT</Text>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('trending-keywords-section')?.scrollIntoView({ behavior: 'smooth' })}>
                5. Trending Keywords
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                6. Products Section
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' })}>
                7. News Section
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}>
                8. Video Section
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('left-sidebar-section')?.scrollIntoView({ behavior: 'smooth' })}>
                9. Left Sidebar
              </Button>
              <Button type="text" block style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('right-sidebar-section')?.scrollIntoView({ behavior: 'smooth' })}>
                10. Right Sidebar
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Main Content - Section Editors */}
        <Col xs={24} md={18}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Banner Header Section */}
            <Card id="banner-header-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Banner Header</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setBannerHeaderModalOpen(true)}>
                  Edit Banner Header
                </Button>
              </div>
            }>
              <Text type="secondary">Logo, banner image, and hotline numbers</Text>
            </Card>

            {/* Mega Menu Section */}
            <Card id="mega-menu-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mega Menu</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setMegaMenuModalOpen(true)}>
                  Edit Menu Items
                </Button>
              </div>
            }>
              {megaMenuSection?.content && (megaMenuSection.content as unknown as MegaMenuContent).static_items?.length > 0 ? (
                <Text>{(megaMenuSection.content as unknown as MegaMenuContent).static_items.length} menu items configured</Text>
              ) : (
                <Text type="secondary">No menu items configured</Text>
              )}
            </Card>

            {/* Search Slogan Section */}
            <Card id="search-slogan-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Search Slogan</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setSearchSloganModalOpen(true)}>
                  Edit Slogan
                </Button>
              </div>
            }>
              {searchSloganSection?.content && (searchSloganSection.content as unknown as SearchSloganContent).slogan_text ? (
                <Text style={{ fontStyle: 'italic' }}>"{(searchSloganSection.content as unknown as SearchSloganContent).slogan_text}"</Text>
              ) : (
                <Text type="secondary">No slogan configured</Text>
              )}
            </Card>

            {/* Slider Section */}
            <Card id="slider-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Slider Section</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setSliderModalOpen(true)}>
                  Edit Slider
                </Button>
              </div>
            }>
              {sliderSection?.content && (
                (sliderSection.content as unknown as SliderContent).slides?.length > 0 ||
                (sliderSection.content as unknown as SliderContent).mini_ads?.length > 0
              ) ? (
                <Text>
                  {(sliderSection.content as unknown as SliderContent).slides?.length || 0} slides, 
                  {' '}{(sliderSection.content as unknown as SliderContent).mini_ads?.length || 0} mini ads
                </Text>
              ) : (
                <Text type="secondary">No slides configured</Text>
              )}
            </Card>

            {/* Trending Keywords Section */}
            <Card id="trending-keywords-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Trending Keywords</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setTrendingKeywordsModalOpen(true)}>
                  Edit Keywords
                </Button>
              </div>
            }>
              {trendingKeywordsSection?.content && 
                (trendingKeywordsSection.content as unknown as TrendingKeywordsContent).keywords?.length > 0 ? (
                <Text>{(trendingKeywordsSection.content as unknown as TrendingKeywordsContent).keywords.length} keywords configured</Text>
              ) : (
                <Text type="secondary">No keywords configured</Text>
              )}
            </Card>

            {/* Products Section */}
            <Card id="products-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Products Section</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setProductsSectionModalOpen(true)}>
                  Edit Products
                </Button>
              </div>
            }>
              {productsSectionState?.content ? (
                <Text>
                  Title: {(productsSectionState.content as unknown as ProductsSectionContent).title}, 
                  Limit: {(productsSectionState.content as unknown as ProductsSectionContent).limit}, 
                  Mode: {(productsSectionState.content as unknown as ProductsSectionContent).mode}
                </Text>
              ) : (
                <Text type="secondary">Not configured</Text>
              )}
            </Card>

            {/* News Section */}
            <Card id="news-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>News Section</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewsSectionModalOpen(true)}>
                  Edit News
                </Button>
              </div>
            }>
              {newsSectionState?.content ? (
                <Text>
                  Title: {(newsSectionState.content as unknown as NewsSectionContent).title}, 
                  Limit: {(newsSectionState.content as unknown as NewsSectionContent).limit}, 
                  Mode: {(newsSectionState.content as unknown as NewsSectionContent).mode}
                </Text>
              ) : (
                <Text type="secondary">Not configured</Text>
              )}
            </Card>

            {/* Video Section */}
            <Card id="video-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Video Section</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setVideoSectionModalOpen(true)}>
                  Edit Videos
                </Button>
              </div>
            }>
              {videoSectionState?.content && (videoSectionState.content as unknown as VideoSectionContent).videos?.length > 0 ? (
                <Text>{(videoSectionState.content as unknown as VideoSectionContent).videos.length} videos configured</Text>
              ) : (
                <Text type="secondary">No videos configured</Text>
              )}
            </Card>

            {/* Left Sidebar Section */}
            <Card id="left-sidebar-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Left Sidebar</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setLeftSidebarModalOpen(true)}>
                  Edit Sidebar
                </Button>
              </div>
            }>
              <Text type="secondary">Categories tree (auto from database)</Text>
            </Card>

            {/* Right Sidebar Section */}
            <Card id="right-sidebar-section" title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Right Sidebar</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setRightSidebarModalOpen(true)}>
                  Edit Sidebar
                </Button>
              </div>
            }>
              {rightSidebarSection?.content && (rightSidebarSection.content as unknown as RightSidebarContent).news_items?.length > 0 ? (
                <Text>{(rightSidebarSection.content as unknown as RightSidebarContent).news_items.length} news items configured</Text>
              ) : (
                <Text type="secondary">No news items configured</Text>
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      {/* All Modals */}
      <BannerHeaderEditModal
        open={bannerHeaderModalOpen}
        onClose={() => setBannerHeaderModalOpen(false)}
        content={(bannerHeaderSection?.content || {}) as BannerHeaderContent}
        onSave={(newContent) => {
          if (bannerHeaderSection) {
            setBannerHeaderSection({ ...bannerHeaderSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setBannerHeaderModalOpen(false);
          message.success('Banner Header updated. Click "Save All" to persist changes.');
        }}
      />

      <MegaMenuEditModal
        open={megaMenuModalOpen}
        onClose={() => setMegaMenuModalOpen(false)}
        content={(megaMenuSection?.content || { static_items: [] }) as MegaMenuContent}
        onSave={(newContent) => {
          if (megaMenuSection) {
            setMegaMenuSection({ ...megaMenuSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setMegaMenuModalOpen(false);
          message.success('Mega Menu updated. Click "Save All" to persist changes.');
        }}
      />

      <SearchSloganEditModal
        open={searchSloganModalOpen}
        onClose={() => setSearchSloganModalOpen(false)}
        content={(searchSloganSection?.content || { slogan_text: '' }) as SearchSloganContent}
        onSave={(newContent) => {
          if (searchSloganSection) {
            setSearchSloganSection({ ...searchSloganSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setSearchSloganModalOpen(false);
          message.success('Search Slogan updated. Click "Save All" to persist changes.');
        }}
      />

      <SliderEditModal
        open={sliderModalOpen}
        onClose={() => setSliderModalOpen(false)}
        content={(sliderSection?.content || { slides: [], mini_ads: [], slider_settings: {}, mini_ad_settings: {} }) as SliderContent}
        onSave={(newContent) => {
          if (sliderSection) {
            setSliderSection({ ...sliderSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setSliderModalOpen(false);
          message.success('Slider updated. Click "Save All" to persist changes.');
        }}
      />

      <TrendingKeywordsEditModal
        open={trendingKeywordsModalOpen}
        onClose={() => setTrendingKeywordsModalOpen(false)}
        content={(trendingKeywordsSection?.content || { title: '', show_icon: true, keywords: [] }) as TrendingKeywordsContent}
        onSave={(newContent) => {
          if (trendingKeywordsSection) {
            setTrendingKeywordsSection({ ...trendingKeywordsSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setTrendingKeywordsModalOpen(false);
          message.success('Trending Keywords updated. Click "Save All" to persist changes.');
        }}
      />

      <ProductsSectionEditModal
        open={productsSectionModalOpen}
        onClose={() => setProductsSectionModalOpen(false)}
        content={(productsSectionState?.content || { title: '', limit: 6, mode: 'auto', filter_by: 'latest', show_price: true }) as ProductsSectionContent}
        onSave={(newContent) => {
          if (productsSectionState) {
            setProductsSectionState({ ...productsSectionState, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setProductsSectionModalOpen(false);
          message.success('Products Section updated. Click "Save All" to persist changes.');
        }}
      />

      <NewsSectionEditModal
        open={newsSectionModalOpen}
        onClose={() => setNewsSectionModalOpen(false)}
        content={(newsSectionState?.content || { title: '', limit: 6, mode: 'auto', display_mode: 'grid', show_thumbnail: true }) as NewsSectionContent}
        onSave={(newContent) => {
          if (newsSectionState) {
            setNewsSectionState({ ...newsSectionState, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setNewsSectionModalOpen(false);
          message.success('News Section updated. Click "Save All" to persist changes.');
        }}
      />

      <VideoSectionEditModal
        open={videoSectionModalOpen}
        onClose={() => setVideoSectionModalOpen(false)}
        content={(videoSectionState?.content || { title: '', videos: [], layout_mode: 'carousel' }) as VideoSectionContent}
        onSave={(newContent) => {
          if (videoSectionState) {
            setVideoSectionState({ ...videoSectionState, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setVideoSectionModalOpen(false);
          message.success('Video Section updated. Click "Save All" to persist changes.');
        }}
      />

      <LeftSidebarEditModal
        open={leftSidebarModalOpen}
        onClose={() => setLeftSidebarModalOpen(false)}
        content={(leftSidebarSection?.content || { show_all: true, max_items: 8 }) as LeftSidebarContent}
        onSave={(newContent) => {
          if (leftSidebarSection) {
            setLeftSidebarSection({ ...leftSidebarSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setLeftSidebarModalOpen(false);
          message.success('Left Sidebar updated. Click "Save All" to persist changes.');
        }}
      />

      <RightSidebarEditModal
        open={rightSidebarModalOpen}
        onClose={() => setRightSidebarModalOpen(false)}
        content={(rightSidebarSection?.content || { news_items: [] }) as RightSidebarContent}
        onSave={(newContent) => {
          if (rightSidebarSection) {
            setRightSidebarSection({ ...rightSidebarSection, content: newContent as unknown as Record<string, unknown> } as PageSection);
          }
          setRightSidebarModalOpen(false);
          message.success('Right Sidebar updated. Click "Save All" to persist changes.');
        }}
      />
    </div>
  );
}
