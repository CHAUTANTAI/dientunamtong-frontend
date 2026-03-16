'use client';

import { useState } from 'react';
import { Typography, Spin, Empty, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { FolderOutlined, FolderOpenOutlined, RightOutlined } from '@ant-design/icons';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import Link from 'next/link';

const { Text, Title } = Typography;

/**
 * LeftSidebar Component - Category tree như source Hoàng Trí
 * Hiển thị category tree với subcategories collapsible
 * 
 * TODO: Kết nối với page_sections để lấy configuration
 * - Lấy từ left_sidebar_categories trong page_sections
 * - Hoặc hiển thị tất cả categories nếu chưa config
 */
export default function LeftSidebar() {
  const { data: allCategories, isLoading } = useGetPublicCategoriesQuery();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  // TODO: Filter parent categories (those without parent_id)
  const parentCategories = allCategories?.filter((cat) => !cat.parent_id) || [];

  // TODO: Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return allCategories?.filter((cat) => cat.parent_id === parentId) || [];
  };

  if (!parentCategories || parentCategories.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Empty description="Chưa có danh mục" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  // Build items for Collapse component
  const collapseItems: CollapseProps['items'] = parentCategories.map((category) => {
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
          Danh mục
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

      {/* TODO: Add promotional banner at bottom like source */}
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
          <Text type="secondary">Promotional Banner</Text>
        </div>
      </div>
    </div>
  );
}
