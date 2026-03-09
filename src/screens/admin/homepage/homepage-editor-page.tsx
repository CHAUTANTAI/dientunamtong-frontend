'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Row, Col, App, Spin } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetPageSectionsQuery, useUpdatePageSectionsMutation } from '@/store/api/pageSectionApi';
import type { PageSection, IntroContent, BannerContent, RightContentBoxContent, LeftSidebarCategoriesContent, RightSidebarItemsContent, HighlightCategoriesContent, HighlightProductsContent } from '@/types/pageSection';
import IntroEditModal from './IntroEditModal';
import BannerManageModal from './BannerManageModal';
import RightContentBoxEditModal from './RightContentBoxEditModal';
import LeftSidebarCategoriesEditModal from './LeftSidebarCategoriesEditModal';
import RightSidebarItemsEditModal from './RightSidebarItemsEditModal';
import HighlightCategoriesEditModal from './HighlightCategoriesEditModal';

const { Title, Text, Paragraph } = Typography;

export default function HomepageEditorPage() {
  const t = useTranslations('homepageEditor');
  const { message } = App.useApp();
  
  const { data: sections, isLoading } = useGetPageSectionsQuery('homepage');
  const [updateSections, { isLoading: isSaving }] = useUpdatePageSectionsMutation();

  // Local state for editing
  const [introSection, setIntroSection] = useState<PageSection | null>(null);
  const [bannerSection, setBannerSection] = useState<PageSection | null>(null);
  const [rightContentBoxSection, setRightContentBoxSection] = useState<PageSection | null>(null);
  const [leftSidebarCategoriesSection, setLeftSidebarCategoriesSection] = useState<PageSection | null>(null);
  const [rightSidebarItemsSection, setRightSidebarItemsSection] = useState<PageSection | null>(null);
  const [highlightCategoriesSection, setHighlightCategoriesSection] = useState<PageSection | null>(null);
  const [highlightProductsSection, setHighlightProductsSection] = useState<PageSection | null>(null);
  
  // Modal states
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [rightContentBoxModalOpen, setRightContentBoxModalOpen] = useState(false);
  const [leftSidebarCategoriesModalOpen, setLeftSidebarCategoriesModalOpen] = useState(false);
  const [rightSidebarItemsModalOpen, setRightSidebarItemsModalOpen] = useState(false);
  const [highlightCategoriesModalOpen, setHighlightCategoriesModalOpen] = useState(false);
  const [highlightProductsModalOpen, setHighlightProductsModalOpen] = useState(false);

  // Initialize sections from API data
  useEffect(() => {
    if (sections) {
      const intro = sections.find(s => s.section_identifier === 'intro');
      const banner = sections.find(s => s.section_identifier === 'banner');
      const rightContentBox = sections.find(s => s.section_identifier === 'right_content_box');
      const leftSidebarCategories = sections.find(s => s.section_identifier === 'left_sidebar_categories');
      const rightSidebarItems = sections.find(s => s.section_identifier === 'right_sidebar_items');
      const highlightCategories = sections.find(s => s.section_identifier === 'highlight_categories');
      const highlightProducts = sections.find(s => s.section_identifier === 'highlight_products');
      
      setIntroSection(intro || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'intro',
        content: { text: '' },
        sort_order: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setBannerSection(banner || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'banner',
        content: { banner_ids: [] },
        sort_order: 1,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setRightContentBoxSection(rightContentBox || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'right_content_box',
        content: { text: '' },
        sort_order: 2,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setLeftSidebarCategoriesSection(leftSidebarCategories || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'left_sidebar_categories',
        content: { category_ids: [], max_items: 8 },
        sort_order: 3,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setRightSidebarItemsSection(rightSidebarItems || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'right_sidebar_items',
        content: { items: [] },
        sort_order: 4,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setHighlightCategoriesSection(highlightCategories || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'highlight_categories',
        content: { title: 'Highlight Categories', limit: 3, categories: [] },
        sort_order: 5,
        is_active: true,
        created_at: '',
        updated_at: '',
      });

      setHighlightProductsSection(highlightProducts || {
        id: '',
        page_identifier: 'homepage',
        section_identifier: 'highlight_products',
        content: { title: 'Highlight Products', limit: 8, mode: 'auto', product_ids: [] },
        sort_order: 6,
        is_active: true,
        created_at: '',
        updated_at: '',
      });
    }
  }, [sections]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!introSection || !bannerSection || !rightContentBoxSection || !leftSidebarCategoriesSection || !rightSidebarItemsSection || !highlightCategoriesSection || !highlightProductsSection) return;

    try {
      await updateSections({
        pageIdentifier: 'homepage',
        data: {
          sections: [
            {
              sectionIdentifier: 'intro',
              content: introSection.content,
              sortOrder: 0,
              isActive: true,
            },
            {
              sectionIdentifier: 'banner',
              content: bannerSection.content,
              sortOrder: 1,
              isActive: true,
            },
            {
              sectionIdentifier: 'right_content_box',
              content: rightContentBoxSection.content,
              sortOrder: 2,
              isActive: true,
            },
            {
              sectionIdentifier: 'left_sidebar_categories',
              content: leftSidebarCategoriesSection.content,
              sortOrder: 3,
              isActive: true,
            },
            {
              sectionIdentifier: 'right_sidebar_items',
              content: rightSidebarItemsSection.content,
              sortOrder: 4,
              isActive: true,
            },
            {
              sectionIdentifier: 'highlight_categories',
              content: highlightCategoriesSection.content,
              sortOrder: 5,
              isActive: true,
            },
            {
              sectionIdentifier: 'highlight_products',
              content: highlightProductsSection.content,
              sortOrder: 6,
              isActive: true,
            },
          ],
        },
      }).unwrap();

      message.success(t('saveSuccess'));
    } catch (error) {
      console.error('Save error:', error);
      message.error(t('saveFailed'));
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const introContent = introSection?.content as IntroContent;
  const bannerContent = bannerSection?.content as BannerContent;
  const rightContentBoxContent = rightContentBoxSection?.content as RightContentBoxContent;
  const leftSidebarCategoriesContent = leftSidebarCategoriesSection?.content as LeftSidebarCategoriesContent;
  const rightSidebarItemsContent = rightSidebarItemsSection?.content as RightSidebarItemsContent;
  const highlightCategoriesContent = highlightCategoriesSection?.content as HighlightCategoriesContent;
  const highlightProductsContent = highlightProductsSection?.content as HighlightProductsContent;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Title level={2} style={{ margin: 0 }}>
            {t('title')}
          </Title>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSaveAll}
            loading={isSaving}
          >
            {isSaving ? t('saving') : t('saveAll')}
          </Button>
        </div>
        <Text type="secondary">{t('subtitle')}</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar - Section List */}
        <Col xs={24} md={6}>
          <Card title="Sections" style={{ position: 'sticky', top: 80 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('intro-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                1. {t('sidebar.intro')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('banner-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                2. {t('sidebar.banner')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('right-content-box-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                3. {t('sidebar.rightContentBox')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('left-sidebar-categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                4. {t('sidebar.leftSidebarCategories')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('right-sidebar-items-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                5. {t('sidebar.rightSidebarItems')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('highlight-categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                6. {t('sidebar.highlightCategories')}
              </Button>
              <Button
                type="text"
                block
                style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => document.getElementById('highlight-products-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                7. {t('sidebar.highlightProducts')}
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Main Content - Section Editors */}
        <Col xs={24} md={18}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Intro Section */}
            <Card
              id="intro-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('intro.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIntroModalOpen(true)}
                  >
                    {t('intro.editButton')}
                  </Button>
                </div>
              }
            >
              {introContent?.text ? (
                <div>
                  {introContent.title && <Title level={4}>{introContent.title}</Title>}
                  {introContent.subtitle && <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{introContent.subtitle}</Text>}
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    <div dangerouslySetInnerHTML={{ __html: introContent.text }} />
                  </Paragraph>
                </div>
              ) : (
                <Text type="secondary">{t('intro.emptyText')}</Text>
              )}
            </Card>

            {/* Banner Section */}
            <Card
              id="banner-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('banner.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setBannerModalOpen(true)}
                  >
                    {t('banner.manageButton')}
                  </Button>
                </div>
              }
            >
              {bannerContent?.banner_ids?.length > 0 ? (
                <Text>
                  {bannerContent.banner_ids.length} banner(s) configured
                </Text>
              ) : (
                <Text type="secondary">{t('banner.emptyText')}</Text>
              )}
            </Card>

            {/* Right Content Box Section */}
            <Card
              id="right-content-box-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('rightContentBox.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setRightContentBoxModalOpen(true)}
                  >
                    {t('rightContentBox.editButton')}
                  </Button>
                </div>
              }
            >
              {rightContentBoxContent?.text ? (
                <div>
                  {rightContentBoxContent.title && <Title level={4}>{rightContentBoxContent.title}</Title>}
                  {rightContentBoxContent.subtitle && <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{rightContentBoxContent.subtitle}</Text>}
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    <div dangerouslySetInnerHTML={{ __html: rightContentBoxContent.text }} />
                  </Paragraph>
                </div>
              ) : (
                <Text type="secondary">{t('rightContentBox.emptyText')}</Text>
              )}
            </Card>

            {/* Left Sidebar Categories Section */}
            <Card
              id="left-sidebar-categories-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('leftSidebarCategories.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setLeftSidebarCategoriesModalOpen(true)}
                  >
                    {t('leftSidebarCategories.editButton')}
                  </Button>
                </div>
              }
            >
              {leftSidebarCategoriesContent?.category_ids?.length > 0 ? (
                <Text>
                  {leftSidebarCategoriesContent.category_ids.length} category(ies) selected (Max: {leftSidebarCategoriesContent.max_items || 8})
                </Text>
              ) : (
                <Text type="secondary">{t('leftSidebarCategories.emptyText')}</Text>
              )}
            </Card>

            {/* Right Sidebar Items Section */}
            <Card
              id="right-sidebar-items-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('rightSidebarItems.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setRightSidebarItemsModalOpen(true)}
                  >
                    {t('rightSidebarItems.editButton')}
                  </Button>
                </div>
              }
            >
              {rightSidebarItemsContent?.items?.length > 0 ? (
                <Text>
                  {rightSidebarItemsContent.items.length} item(s) configured
                </Text>
              ) : (
                <Text type="secondary">{t('rightSidebarItems.emptyText')}</Text>
              )}
            </Card>

            {/* Highlight Categories Section */}
            <Card
              id="highlight-categories-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('highlightCategories.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setHighlightCategoriesModalOpen(true)}
                  >
                    {t('highlightCategories.editButton')}
                  </Button>
                </div>
              }
            >
              {highlightCategoriesContent?.categories?.length > 0 ? (
                <Text>
                  {highlightCategoriesContent.categories.length} category(ies) configured
                </Text>
              ) : (
                <Text type="secondary">{t('highlightCategories.emptyText')}</Text>
              )}
            </Card>

            {/* Highlight Products Section (Coming Soon) */}
            <Card
              id="highlight-products-section"
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('highlightProducts.title')}</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    disabled
                  >
                    {t('highlightProducts.editButton')} (Coming Soon)
                  </Button>
                </div>
              }
            >
              <Text type="secondary">{t('highlightProducts.emptyText')}</Text>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Modals */}
      {introSection && (
        <IntroEditModal
          open={introModalOpen}
          onClose={() => setIntroModalOpen(false)}
          content={introContent}
          onSave={(newContent) => {
            setIntroSection({
              ...introSection,
              content: newContent,
            });
            setIntroModalOpen(false);
            message.success('Introduction updated. Click "Save All" to persist changes.');
          }}
        />
      )}

      {bannerSection && (
        <BannerManageModal
          open={bannerModalOpen}
          onClose={() => setBannerModalOpen(false)}
          content={bannerContent}
          onSave={(newContent) => {
            setBannerSection({
              ...bannerSection,
              content: newContent,
            });
            setBannerModalOpen(false);
            message.success('Banners updated. Click "Save All" to persist changes.');
          }}
        />
      )}

      {rightContentBoxSection && (
        <RightContentBoxEditModal
          open={rightContentBoxModalOpen}
          onClose={() => setRightContentBoxModalOpen(false)}
          content={rightContentBoxContent}
          onSave={(newContent) => {
            setRightContentBoxSection({
              ...rightContentBoxSection,
              content: newContent,
            });
            setRightContentBoxModalOpen(false);
            message.success('Right content box updated. Click "Save All" to persist changes.');
          }}
        />
      )}

      {leftSidebarCategoriesSection && (
        <LeftSidebarCategoriesEditModal
          open={leftSidebarCategoriesModalOpen}
          onClose={() => setLeftSidebarCategoriesModalOpen(false)}
          content={leftSidebarCategoriesContent}
          onSave={(newContent) => {
            setLeftSidebarCategoriesSection({
              ...leftSidebarCategoriesSection,
              content: newContent,
            });
            setLeftSidebarCategoriesModalOpen(false);
            message.success('Left sidebar categories updated. Click "Save All" to persist changes.');
          }}
        />
      )}

      {rightSidebarItemsSection && (
        <RightSidebarItemsEditModal
          open={rightSidebarItemsModalOpen}
          onClose={() => setRightSidebarItemsModalOpen(false)}
          content={rightSidebarItemsContent}
          onSave={(newContent) => {
            setRightSidebarItemsSection({
              ...rightSidebarItemsSection,
              content: newContent,
            });
            setRightSidebarItemsModalOpen(false);
            message.success('Right sidebar items updated. Click "Save All" to persist changes.');
          }}
        />
      )}

      {highlightCategoriesSection && (
        <HighlightCategoriesEditModal
          open={highlightCategoriesModalOpen}
          onClose={() => setHighlightCategoriesModalOpen(false)}
          content={highlightCategoriesContent}
          onSave={(newContent) => {
            setHighlightCategoriesSection({
              ...highlightCategoriesSection,
              content: newContent,
            });
            setHighlightCategoriesModalOpen(false);
            message.success('Highlight categories updated. Click "Save All" to persist changes.');
          }}
        />
      )}
    </div>
  );
}
