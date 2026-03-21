'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, Collapse, Button, Space, Typography, App, Spin, Form, Badge } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
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
  LeftSidebarForm,
  RightSidebarForm,
} from './forms';
import HomepageLayoutPreview from '@/components/admin/HomepageLayoutPreview';

const { Title, Text } = Typography;

export default function HomepageEditorPage() {
  const t = useTranslations('homepageEditor');
  const { message } = App.useApp();
  
  const { data: sections, isLoading } = useGetPageSectionsQuery('homepage');
  const [updateSections, { isLoading: isSaving }] = useUpdatePageSectionsMutation();

  // State for tracking active section in preview
  const [activeTab, setActiveTab] = useState<string>('layout');
  const [activeCollapseKey, setActiveCollapseKey] = useState<string[]>([]);

  // State for all 10 sections
  const [bannerHeaderSection, setBannerHeaderSection] = useState<PageSection | null>(null);
  const [megaMenuSection, setMegaMenuSection] = useState<PageSection | null>(null);
  const [searchSloganSection, setSearchSloganSection] = useState<PageSection | null>(null);
  const [sliderSection, setSliderSection] = useState<PageSection | null>(null);
  const [trendingKeywordsSection, setTrendingKeywordsSection] = useState<PageSection | null>(null);
  const [productsSectionState, setProductsSectionState] = useState<PageSection | null>(null);
  const [leftSidebarSection, setLeftSidebarSection] = useState<PageSection | null>(null);
  const [rightSidebarSection, setRightSidebarSection] = useState<PageSection | null>(null);

  // Forms for sections with simple inputs (need controlled forms)
  const [bannerHeaderForm] = Form.useForm();
  const [searchSloganForm] = Form.useForm();

  // Store ORIGINAL state (snapshot when loaded from API) for comparison
  const [originalSections, setOriginalSections] = useState<{
    bannerHeader?: PageSection;
    megaMenu?: PageSection;
    searchSlogan?: PageSection;
    slider?: PageSection;
    trendingKeywords?: PageSection;
    products?: PageSection;
    leftSidebar?: PageSection;
    rightSidebar?: PageSection;
  }>({});

  // Memoize onChange callbacks to prevent infinite loops
  const handleBannerHeaderChange = useCallback((newContent: unknown) => {
    setBannerHeaderSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleMegaMenuChange = useCallback((newContent: unknown) => {
    setMegaMenuSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleSearchSloganChange = useCallback((newContent: unknown) => {
    setSearchSloganSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleSliderChange = useCallback((newContent: unknown) => {
    setSliderSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleTrendingKeywordsChange = useCallback((newContent: unknown) => {
    setTrendingKeywordsSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleProductsChange = useCallback((newContent: unknown) => {
    setProductsSectionState(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleLeftSidebarChange = useCallback((newContent: unknown) => {
    setLeftSidebarSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

  const handleRightSidebarChange = useCallback((newContent: unknown) => {
    setRightSidebarSection(prev => prev ? { ...prev, content: newContent as Record<string, unknown> } : null);
  }, []);

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
    leftSidebarSection,
    rightSidebarSection,
  ]);

  // Initialize sections from API data
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
        content: { category_ids: [] },
        sort_order: 5, is_active: true, created_at: '', updated_at: '',
      };

      const leftSidebar = getSection('left_sidebar') || {
        id: '', page_identifier: 'homepage', section_identifier: 'left_sidebar',
        content: { mode: 'auto', max_items: 8 }, sort_order: 8, is_active: true, created_at: '', updated_at: '',
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
        leftSidebar: JSON.parse(JSON.stringify(leftSidebar)),
        rightSidebar: JSON.parse(JSON.stringify(rightSidebar)),
      });
    }
  }, [sections]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!bannerHeaderSection || !megaMenuSection || !searchSloganSection || !sliderSection ||
        !trendingKeywordsSection || !productsSectionState || !leftSidebarSection || !rightSidebarSection) return;

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
            { sectionIdentifier: 'left_sidebar', content: leftSidebarSection.content, sortOrder: 6, isActive: true },
            { sectionIdentifier: 'right_sidebar', content: processedRightSidebar as unknown as Record<string, unknown>, sortOrder: 7, isActive: true },
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
        {/* Layout Preview */}
        <HomepageLayoutPreview
          activeSection={(() => {
            if (activeTab === 'layout' && activeCollapseKey[0]) {
              return `layout-${activeCollapseKey[0]}`;
            }
            return activeTab;
          })()}
          onSectionClick={(sectionKey) => {
            console.log('🖱️ Section clicked:', sectionKey);
            
            // Map section keys to tabs and collapse panels
            const sectionMap: Record<string, { tab: string; panel?: string }> = {
              'layout-banner-header': { tab: 'layout', panel: 'banner-header' },
              'layout-mega-menu': { tab: 'layout', panel: 'mega-menu' },
              'layout-search-slogan': { tab: 'layout', panel: 'search-slogan' },
              'slider-slider': { tab: 'content', panel: 'slider' },
              'trending-keywords': { tab: 'content', panel: 'trending-keywords' },
              'products-section': { tab: 'content', panel: 'products' },
              'left-sidebar': { tab: 'sidebars', panel: 'left-sidebar' },
              'right-sidebar': { tab: 'sidebars', panel: 'right-sidebar' },
            };

            const target = sectionMap[sectionKey];
            console.log('🎯 Target:', target);
            
            if (target) {
              setActiveTab(target.tab);
              if (target.panel) {
                // For collapse panels, open the specific panel after tab changes
                setTimeout(() => {
                  setActiveCollapseKey([target.panel!]);
                }, 50);
              } else {
                setActiveCollapseKey([]);
              }
              
              // Scroll to the tabs section after a short delay to let state update
              setTimeout(() => {
                const tabsElement = document.querySelector('.ant-tabs');
                if (tabsElement) {
                  tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 150);
            }
          }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
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
                  activeKey={activeCollapseKey}
                  onChange={(keys) => setActiveCollapseKey(Array.isArray(keys) ? keys : [keys])}
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
                            onChange={handleBannerHeaderChange}
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
                            onChange={handleMegaMenuChange}
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
                            onChange={handleSearchSloganChange}
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
                  activeKey={activeTab === 'content' ? activeCollapseKey : undefined}
                  onChange={(keys) => {
                    if (activeTab === 'content') {
                      setActiveCollapseKey(Array.isArray(keys) ? keys : [keys]);
                    }
                  }}
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
                          onChange={handleSliderChange}
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
                          onChange={handleTrendingKeywordsChange}
                        />
                      ) : null,
                    },
                    {
                      key: 'products',
                      label: (
                        <Space>
                          <Text strong>6. Products Section</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (Product Grid - Max 3 Categories)
                          </Text>
                        </Space>
                      ),
                      children: productsSectionState ? (
                        <ProductsSectionForm
                          content={productsSectionState.content as unknown as ProductsSectionContent}
                          onChange={handleProductsChange}
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
                  activeKey={activeTab === 'sidebars' ? activeCollapseKey : undefined}
                  onChange={(keys) => {
                    if (activeTab === 'sidebars') {
                      setActiveCollapseKey(Array.isArray(keys) ? keys : [keys]);
                    }
                  }}
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
                          onChange={handleLeftSidebarChange}
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
                          onChange={handleRightSidebarChange}
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
