'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Row, Col, App, Spin } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useGetPageSectionsQuery, useUpdatePageSectionsMutation } from '@/store/api/pageSectionApi';
import type { PageSection, IntroContent, BannerContent } from '@/types/pageSection';
import IntroEditModal from './IntroEditModal';
import BannerManageModal from './BannerManageModal';

const { Title, Text, Paragraph } = Typography;

export default function HomepageEditorPage() {
  const t = useTranslations('homepageEditor');
  const { message } = App.useApp();
  
  const { data: sections, isLoading } = useGetPageSectionsQuery('homepage');
  const [updateSections, { isLoading: isSaving }] = useUpdatePageSectionsMutation();

  // Local state for editing
  const [introSection, setIntroSection] = useState<PageSection | null>(null);
  const [bannerSection, setBannerSection] = useState<PageSection | null>(null);
  
  // Modal states
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  // Initialize sections from API data
  useEffect(() => {
    if (sections) {
      const intro = sections.find(s => s.section_identifier === 'intro');
      const banner = sections.find(s => s.section_identifier === 'banner');
      
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
    }
  }, [sections]);

  // Save all changes
  const handleSaveAll = async () => {
    if (!introSection || !bannerSection) return;

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
    </div>
  );
}
