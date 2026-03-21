'use client';

import { useState } from 'react';
import { Typography, Spin, Empty, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { FolderOutlined, FolderOpenOutlined, RightOutlined } from '@ant-design/icons';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import type { LeftSidebarContent } from '@/types/pageSection';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;

/**
 * LeftSidebar Component - Category tree với auto/manual mode
 * Auto mode: Top 8 categories by views
 * Manual mode: Admin selected categories (max 8)
 */
export default function LeftSidebar({ content }: { content?: LeftSidebarContent }) {
  const t = useTranslations('homepage.leftSidebar');
  const { data: allCategories, isLoading } = useGetPublicCategoriesQuery();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Get left sidebar config from props
  const config = content;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  // Determine which categories to display
  let displayCategories = [];
  
  if (config?.mode === 'manual' && config.category_ids && config.category_ids.length > 0) {
    // Manual mode: Show admin selected categories
    displayCategories = allCategories?.filter(cat => 
      config.category_ids?.includes(cat.id)
    ) || [];
    
    // Sort by selection order
    displayCategories.sort((a, b) => {
      const indexA = config.category_ids?.indexOf(a.id) || 0;
      const indexB = config.category_ids?.indexOf(b.id) || 0;
      return indexA - indexB;
    });
  } else {
    // Auto mode (default): Top 8 by views
    const sortedCategories = [...(allCategories || [])].sort((a, b) => 
      (b.view_count || 0) - (a.view_count || 0)
    );
    displayCategories = sortedCategories.slice(0, config?.max_items || 8);
  }

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return allCategories?.filter((cat) => cat.parent_id === parentId) || [];
  };

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Empty description={t('empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  // Build items for Collapse component
  const collapseItems: CollapseProps['items'] = displayCategories.map((category) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;

    return {
      key: category.id,
      label: (
        <Link
          href={`/categories/${category.slug}`}
          style={{
            color: '#262626',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ff4d4f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#262626';
          }}
        >
          {category.name}
        </Link>
      ),
      children: hasSubcategories ? (
        <div style={{ paddingLeft: '8px' }}>
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${sub.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                color: '#595959',
                textDecoration: 'none',
                fontSize: 13,
                borderRadius: 4,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff5f5';
                e.currentTarget.style.color = '#ff4d4f';
                e.currentTarget.style.paddingLeft = '16px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#595959';
                e.currentTarget.style.paddingLeft = '12px';
              }}
            >
              <RightOutlined style={{ fontSize: 10 }} />
              <span>{sub.name}</span>
            </Link>
          ))}
        </div>
      ) : null,
      showArrow: hasSubcategories,
      collapsible: hasSubcategories ? 'header' : 'disabled',
      style: {
        borderBottom: '1px solid #f0f0f0',
      },
    };
  });

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#001529',
          padding: '12px 16px',
          borderBottom: '2px solid #ff4d4f',
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {t('title')}
        </Title>
      </div>

      {/* Category Tree */}
      <Collapse
        accordion={false}
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        ghost
        items={collapseItems}
        expandIcon={({ isActive }) =>
          isActive ? (
            <FolderOpenOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
          ) : (
            <FolderOutlined style={{ color: '#595959', fontSize: 16 }} />
          )
        }
        style={{
          backgroundColor: '#fff',
        }}
      />

      {/* Promotional Banner */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '150px',
            backgroundColor: '#e0e0e0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Text type="secondary">{t('promoPlaceholder')}</Text>
        </div>
      </div>
    </div>
  );
}
