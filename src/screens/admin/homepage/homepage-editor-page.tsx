'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, Collapse, Button, Space, Typography, App, Spin, Form, Badge } from 'antd';
import { SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetPageSectionsQuery, useUpdatePageSectionsMutation } from '@/store/api/pageSectionApi';
import type {
  PageSection,
  BannerHeaderContent,
  BannerHeaderContentDraft,
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
import { processMediaValue, processMediaArray } from '@/utils/mediaUploadHelpers';
import type { MediaValue } from '@/components/common/MediaUpload';

// Import all form components
import {
  BannerHeaderForm,
  MegaMenuForm,
  SearchSloganForm,
  SliderForm,
  TrendingKeywordsForm,
  ProductsSectionForm,
  NewsSectionForm,
  VideoSectionForm,
  LeftSidebarForm,
  RightSidebarForm,
} from './forms';

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

  // Forms for sections with simple inputs (need controlled forms)
  const [bannerHeaderForm] = Form.useForm();
  const [searchSloganForm] = Form.useForm();
  const [productsSectionForm] = Form.useForm();
  const [newsSectionForm] = Form.useForm();
  const [leftSidebarForm] = Form.useForm();

  // Store ORIGINAL state (snapshot when loaded from API) for comparison
  const [originalSections, setOriginalSections] = useState<{
    bannerHeader?: PageSection;
    megaMenu?: PageSection;
    searchSlogan?: PageSection;
    slider?: PageSection;
    trendingKeywords?: PageSection;
    products?: PageSection;
    news?: PageSection;
    video?: PageSection;
    leftSidebar?: PageSection;
    rightSidebar?: PageSection;
  }>({});

  // Check if there are any changes (compare CURRENT state vs ORIGINAL snapshot)
  const hasChanges = useMemo(() => {
    // Need original snapshot to compare
    if (!originalSections || Object.keys(originalSections).length === 0) {
      return false;
    }

    // Helper to check for pending file uploads
    const hasPendingUpload = (obj: unknown): boolean => {
      if (obj && typeof obj === 'object' && 'file' in obj) return true;
      if (Array.isArray(obj)) return obj.some(item => hasPendingUpload(item));
      if (obj && typeof obj === 'object') return Object.values(obj).some(val => hasPendingUpload(val));
      return false;
    };

    // Compare function - returns true if changed
    const hasChanged = (original: PageSection | undefined, current: PageSection | null): boolean => {
      if (!original || !current) return false;
      
      // If current state has pending uploads, consider it changed
      if (hasPendingUpload(current.content)) {
        console.log('✅ Has pending uploads');
        return true;
      }

      // Compare content (deep comparison via JSON)
      const isContentChanged = JSON.stringify(original.content) !== JSON.stringify(current.content);
      if (isContentChanged) {
        console.log('✅ Content changed:', { 
          section: current.section_identifier,
          original: original.content, 
          current: current.content 
        });
      }
      return isContentChanged;
    };

    // Check all sections
    const result = 
      hasChanged(originalSections.bannerHeader, bannerHeaderSection) ||
      hasChanged(originalSections.megaMenu, megaMenuSection) ||
      hasChanged(originalSections.searchSlogan, searchSloganSection) ||
      hasChanged(originalSections.slider, sliderSection) ||
      hasChanged(originalSections.trendingKeywords, trendingKeywordsSection) ||
      hasChanged(originalSections.products, productsSectionState) ||
      hasChanged(originalSections.news, newsSectionState) ||
      hasChanged(originalSections.video, videoSectionState) ||
      hasChanged(originalSections.leftSidebar, leftSidebarSection) ||
      hasChanged(originalSections.rightSidebar, rightSidebarSection);

    console.log('🎯 hasChanges result:', result);
    return result;
  }, [
    originalSections,
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
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (sections) {
      const getSection = (identifier: string) => sections.find(s => s.section_identifier === identifier);

      const bannerHeader = getSection('banner_header') || {
        id: '', page_identifier: 'homepage', section_identifier: 'banner_header',
        content: {}, sort_order: 0, is_active: true, created_at: '', updated_at: '',
      };

      const megaMenu = getSection('mega_menu') || {
        id: '', page_identifier: 'homepage', section_identifier: 'mega_menu',
        content: { static_items: [] }, sort_order: 1, is_active: true, created_at: '', updated_at: '',
      };

      const searchSlogan = getSection('search_slogan') || {
        id: '', page_identifier: 'homepage', section_identifier: 'search_slogan',
        content: { slogan_text: '' }, sort_order: 2, is_active: true, created_at: '', updated_at: '',
      };

      const slider = getSection('slider_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'slider_section',
        content: { slides: [], mini_ads: [], slider_settings: {}, mini_ad_settings: {} },
        sort_order: 3, is_active: true, created_at: '', updated_at: '',
      };

      const trendingKeywords = getSection('trending_keywords_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'trending_keywords_section',
        content: { title: 'Xu hướng tìm kiếm:', show_icon: true, keywords: [] },
        sort_order: 4, is_active: true, created_at: '', updated_at: '',
      };

      const products = getSection('products_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'products_section',
        content: { title: 'Phụ tùng xe', limit: 6, mode: 'auto', filter_by: 'latest', show_price: true },
        sort_order: 5, is_active: true, created_at: '', updated_at: '',
      };

      const news = getSection('news_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'news_section',
        content: { title: 'Tin tức xe', limit: 6, mode: 'auto', display_mode: 'grid', show_thumbnail: true },
        sort_order: 6, is_active: true, created_at: '', updated_at: '',
      };

      const video = getSection('video_section') || {
        id: '', page_identifier: 'homepage', section_identifier: 'video_section',
        content: { title: 'Video', videos: [], layout_mode: 'carousel' },
        sort_order: 7, is_active: true, created_at: '', updated_at: '',
      };

      const leftSidebar = getSection('left_sidebar') || {
        id: '', page_identifier: 'homepage', section_identifier: 'left_sidebar',
        content: { show_all: true, max_items: 8 }, sort_order: 8, is_active: true, created_at: '', updated_at: '',
      };

      const rightSidebar = getSection('right_sidebar') || {
        id: '', page_identifier: 'homepage', section_identifier: 'right_sidebar',
        content: { news_items: [] }, sort_order: 9, is_active: true, created_at: '', updated_at: '',
      };

      // Set current state
      setBannerHeaderSection(bannerHeader);
      setMegaMenuSection(megaMenu);
      setSearchSloganSection(searchSlogan);
      setSliderSection(slider);
      setTrendingKeywordsSection(trendingKeywords);
      setProductsSectionState(products);
      setNewsSectionState(news);
      setVideoSectionState(video);
      setLeftSidebarSection(leftSidebar);
      setRightSidebarSection(rightSidebar);

      // Store ORIGINAL snapshot for comparison (deep clone to avoid reference issues)
      setOriginalSections({
        bannerHeader: JSON.parse(JSON.stringify(bannerHeader)),
        megaMenu: JSON.parse(JSON.stringify(megaMenu)),
        searchSlogan: JSON.parse(JSON.stringify(searchSlogan)),
        slider: JSON.parse(JSON.stringify(slider)),
        trendingKeywords: JSON.parse(JSON.stringify(trendingKeywords)),
        products: JSON.parse(JSON.stringify(products)),
        news: JSON.parse(JSON.stringify(news)),
        video: JSON.parse(JSON.stringify(video)),
        leftSidebar: JSON.parse(JSON.stringify(leftSidebar)),
        rightSidebar: JSON.parse(JSON.stringify(rightSidebar)),
      });
    }
  }, [sections]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!bannerHeaderSection || !megaMenuSection || !searchSloganSection || !sliderSection ||
        !trendingKeywordsSection || !productsSectionState || !newsSectionState ||
        !videoSectionState || !leftSidebarSection || !rightSidebarSection) return;

    try {
      message.loading({ content: 'Processing uploads...', key: 'upload', duration: 0 });

      // Process BannerHeader uploads
      const bannerHeaderContent = bannerHeaderSection.content as unknown as BannerHeaderContentDraft;
      const processedBannerHeader: BannerHeaderContent = {
        ...bannerHeaderContent,
        logo_media_id: await processMediaValue(
          bannerHeaderContent.logo_media_id as MediaValue, 
          'homepage/logo'
        ),
        banner_media_id: await processMediaValue(
          bannerHeaderContent.banner_media_id as MediaValue,
          'homepage/banner'
        ),
      };

      // Process Slider uploads
      const sliderContent = sliderSection.content as unknown as SliderContent;
      const processedSlider: SliderContent = {
        ...sliderContent,
        slides: await processMediaArray(
          sliderContent.slides || [],
          'homepage/slider'
        ),
        mini_ads: await processMediaArray(
          sliderContent.mini_ads || [],
          'homepage/mini-ads'
        ),
      };

      // Process Video Section uploads
      const videoContent = videoSectionState.content as unknown as VideoSectionContent;
      const processedVideos = await Promise.all(
        (videoContent.videos || []).map(async (video) => ({
          ...video,
          thumbnail: await processMediaValue(video.thumbnail as MediaValue, 'homepage/video-thumbnails'),
        }))
      );
      const processedVideoSection: VideoSectionContent = {
        ...videoContent,
        videos: processedVideos,
      };

      // Process RightSidebar promotional banners
      const rightSidebarContent = rightSidebarSection.content as unknown as RightSidebarContent;
      const processedRightSidebar: RightSidebarContent = {
        ...rightSidebarContent,
        promotional_banners: await processMediaArray(
          rightSidebarContent.promotional_banners || [],
          'homepage/promotional-banners'
        ),
      };

      message.loading({ content: 'Saving changes...', key: 'upload' });

      await updateSections({
        pageIdentifier: 'homepage',
        data: {
          sections: [
            { sectionIdentifier: 'banner_header', content: processedBannerHeader as unknown as Record<string, unknown>, sortOrder: 0, isActive: true },
            { sectionIdentifier: 'mega_menu', content: megaMenuSection.content, sortOrder: 1, isActive: true },
            { sectionIdentifier: 'search_slogan', content: searchSloganSection.content, sortOrder: 2, isActive: true },
            { sectionIdentifier: 'slider_section', content: processedSlider as unknown as Record<string, unknown>, sortOrder: 3, isActive: true },
            { sectionIdentifier: 'trending_keywords_section', content: trendingKeywordsSection.content, sortOrder: 4, isActive: true },
            { sectionIdentifier: 'products_section', content: productsSectionState.content, sortOrder: 5, isActive: true },
            { sectionIdentifier: 'news_section', content: newsSectionState.content, sortOrder: 6, isActive: true },
            { sectionIdentifier: 'video_section', content: processedVideoSection as unknown as Record<string, unknown>, sortOrder: 7, isActive: true },
            { sectionIdentifier: 'left_sidebar', content: leftSidebarSection.content, sortOrder: 8, isActive: true },
            { sectionIdentifier: 'right_sidebar', content: processedRightSidebar as unknown as Record<string, unknown>, sortOrder: 9, isActive: true },
          ],
        },
      }).unwrap();

      message.destroy('upload');
      message.success(t('saveSuccess') || 'Saved successfully!');
      
      // Update ORIGINAL snapshot after successful save (so hasChanges resets to false)
      setOriginalSections({
        bannerHeader: JSON.parse(JSON.stringify(bannerHeaderSection)),
        megaMenu: JSON.parse(JSON.stringify(megaMenuSection)),
        searchSlogan: JSON.parse(JSON.stringify(searchSloganSection)),
        slider: JSON.parse(JSON.stringify(sliderSection)),
        trendingKeywords: JSON.parse(JSON.stringify(trendingKeywordsSection)),
        products: JSON.parse(JSON.stringify(productsSectionState)),
        news: JSON.parse(JSON.stringify(newsSectionState)),
        video: JSON.parse(JSON.stringify(videoSectionState)),
        leftSidebar: JSON.parse(JSON.stringify(leftSidebarSection)),
        rightSidebar: JSON.parse(JSON.stringify(rightSidebarSection)),
      });
    } catch (error) {
      message.destroy('upload');
      console.error('Save error:', error);
      if (error instanceof Error) {
        message.error(`${t('saveFailed')}: ${error.message}`);
      } else {
        message.error(t('saveFailed') || 'Save failed');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading homepage editor...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header with Save Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: '#fff',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Homepage Editor
          </Title>
          <Text type="secondary">
            Manage your homepage layout and content sections
          </Text>
        </div>

        <Space>
          {hasChanges && (
            <Badge status="warning" text="Unsaved changes" />
          )}
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={isSaving}
            disabled={!hasChanges}
          >
            Save All Changes
          </Button>
        </Space>
      </div>

      {/* Tabs + Collapse Layout */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Tabs
          defaultActiveKey="layout"
          size="large"
          tabBarStyle={{
            marginBottom: '24px',
            borderBottom: '2px solid #f0f0f0',
          }}
          items={[
            // Tab 1: Layout Sections
            {
              key: 'layout',
              label: (
                <span style={{ fontSize: '15px', fontWeight: 500 }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>📐</span>
                  Layout Sections
                </span>
              ),
              children: (
                <Collapse
                  accordion
                  expandIconPosition="end"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                  items={[
                    {
                      key: 'banner-header',
                      label: (
                        <Space>
                          <Text strong style={{ fontSize: 15 }}>1. Banner Header</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Logo, Banner, Hotlines)
                          </Text>
                        </Space>
                      ),
                      children: bannerHeaderSection ? (
                        <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                          <BannerHeaderForm
                            content={bannerHeaderSection.content as unknown as BannerHeaderContentDraft}
                            onChange={(newContent) => {
                              console.log('🔄 BannerHeader onChange called:', newContent);
                              const updatedSection = {
                                ...bannerHeaderSection,
                                content: newContent as unknown as Record<string, unknown>,
                              };
                              console.log('📦 Setting bannerHeaderSection to:', updatedSection);
                              setBannerHeaderSection(updatedSection);
                            }}
                            form={bannerHeaderForm}
                          />
                        </div>
                      ) : null,
                      style: {
                        marginBottom: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      },
                    },
                    {
                      key: 'mega-menu',
                      label: (
                        <Space>
                          <Text strong style={{ fontSize: 15 }}>2. Mega Menu</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Static Menu Items)
                          </Text>
                        </Space>
                      ),
                      children: megaMenuSection ? (
                        <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                          <MegaMenuForm
                            content={megaMenuSection.content as unknown as MegaMenuContent}
                            onChange={(newContent) => {
                              setMegaMenuSection({
                                ...megaMenuSection,
                                content: newContent as unknown as Record<string, unknown>,
                              });
                            }}
                          />
                        </div>
                      ) : null,
                      style: {
                        marginBottom: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      },
                    },
                    {
                      key: 'search-slogan',
                      label: (
                        <Space>
                          <Text strong style={{ fontSize: 15 }}>3. Search Slogan</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Marquee Text)
                          </Text>
                        </Space>
                      ),
                      children: searchSloganSection ? (
                        <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                          <SearchSloganForm
                            content={searchSloganSection.content as unknown as SearchSloganContent}
                            onChange={(newContent) => {
                              setSearchSloganSection({
                                ...searchSloganSection,
                                content: newContent as unknown as Record<string, unknown>,
                              });
                            }}
                            form={searchSloganForm}
                          />
                        </div>
                      ) : null,
                      style: {
                        marginBottom: '12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      },
                    },
                  ]}
                />
              ),
            },

            // Tab 2: Homepage Content
            {
              key: 'content',
              label: (
                <span>
                  <span style={{ fontSize: '16px', marginRight: '8px' }}>📦</span>
                  Homepage Content
                </span>
              ),
              children: (
                <Collapse
                  accordion
                  style={{ backgroundColor: '#fafafa' }}
                  items={[
                    {
                      key: 'slider',
                      label: (
                        <Space>
                          <Text strong>4. Slider Section</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Main Slider + Mini Ads)
                          </Text>
                        </Space>
                      ),
                      children: sliderSection ? (
                        <SliderForm
                          content={sliderSection.content as unknown as SliderContent}
                          onChange={(newContent) => {
                            setSliderSection({
                              ...sliderSection,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                        />
                      ) : null,
                    },
                    {
                      key: 'trending-keywords',
                      label: (
                        <Space>
                          <Text strong>5. Trending Keywords</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Search Suggestions)
                          </Text>
                        </Space>
                      ),
                      children: trendingKeywordsSection ? (
                        <TrendingKeywordsForm
                          content={trendingKeywordsSection.content as unknown as TrendingKeywordsContent}
                          onChange={(newContent) => {
                            setTrendingKeywordsSection({
                              ...trendingKeywordsSection,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                        />
                      ) : null,
                    },
                    {
                      key: 'products',
                      label: (
                        <Space>
                          <Text strong>6. Products Section</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Product Grid)
                          </Text>
                        </Space>
                      ),
                      children: productsSectionState ? (
                        <ProductsSectionForm
                          content={productsSectionState.content as unknown as ProductsSectionContent}
                          onChange={(newContent) => {
                            setProductsSectionState({
                              ...productsSectionState,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                          form={productsSectionForm}
                        />
                      ) : null,
                    },
                    {
                      key: 'news',
                      label: (
                        <Space>
                          <Text strong>7. News Section</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (News Grid/List)
                          </Text>
                        </Space>
                      ),
                      children: newsSectionState ? (
                        <NewsSectionForm
                          content={newsSectionState.content as unknown as NewsSectionContent}
                          onChange={(newContent) => {
                            setNewsSectionState({
                              ...newsSectionState,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                          form={newsSectionForm}
                        />
                      ) : null,
                    },
                    {
                      key: 'videos',
                      label: (
                        <Space>
                          <Text strong>8. Video Section</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Video Carousel/Grid)
                          </Text>
                        </Space>
                      ),
                      children: videoSectionState ? (
                        <VideoSectionForm
                          content={videoSectionState.content as unknown as VideoSectionContent}
                          onChange={(newContent) => {
                            setVideoSectionState({
                              ...videoSectionState,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                        />
                      ) : null,
                    },
                  ]}
                />
              ),
            },

            // Tab 3: Sidebars
            {
              key: 'sidebars',
              label: (
                <span>
                  <span style={{ fontSize: '16px', marginRight: '8px' }}>📊</span>
                  Sidebars
                </span>
              ),
              children: (
                <Collapse
                  accordion
                  style={{ backgroundColor: '#fafafa' }}
                  items={[
                    {
                      key: 'left-sidebar',
                      label: (
                        <Space>
                          <Text strong>9. Left Sidebar</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Categories Menu)
                          </Text>
                        </Space>
                      ),
                      children: leftSidebarSection ? (
                        <LeftSidebarForm
                          content={leftSidebarSection.content as unknown as LeftSidebarContent}
                          onChange={(newContent) => {
                            setLeftSidebarSection({
                              ...leftSidebarSection,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                          form={leftSidebarForm}
                        />
                      ) : null,
                    },
                    {
                      key: 'right-sidebar',
                      label: (
                        <Space>
                          <Text strong>10. Right Sidebar</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (News + Promotional Banners)
                          </Text>
                        </Space>
                      ),
                      children: rightSidebarSection ? (
                        <RightSidebarForm
                          content={rightSidebarSection.content as unknown as RightSidebarContent}
                          onChange={(newContent) => {
                            setRightSidebarSection({
                              ...rightSidebarSection,
                              content: newContent as unknown as Record<string, unknown>,
                            });
                          }}
                        />
                      ) : null,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      {/* Floating Save Button (for convenience when scrolled) */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
        }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={isSaving}
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
