'use client';

import { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import type { MegaMenuContent } from '@/types/pageSection';

/**
 * MegaMenu Component - Menu dropdown lớn với categories
 * Hiển thị categories với subcategories trong dropdown
 * 
 * Config static menu items from the `content` prop.
 */
interface MegaMenuProps {
  content?: MegaMenuContent;
}

export default function MegaMenu({ content }: MegaMenuProps) {
  const { data: categories } = useGetPublicCategoriesQuery();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Get mega menu config from props
  const config = content;

  // Filter only parent categories (those without parent_id)
  // const parentCategories = categories?.filter((cat) => !cat.parent_id) || [];

  // Group subcategories by parent
  const getSubcategories = (parentId: string) => {
    return categories?.filter((cat) => cat.parent_id === parentId) || [];
  };

  // Get static menu items from API config (via props) with fallback
  const staticMenuItems = config?.static_items?.length 
    ? [...config.static_items].sort((a, b) => a.sort_order - b.sort_order).map(item => ({
        key: item.id,
        label: item.label,
        href: item.href,
        categoryId: item.category_id || undefined, // To check if it's a category
      }))
    : [];

  return (
    <div
      style={{
        backgroundColor: '#001529',
        borderBottom: '2px solid #ff4d4f',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
          }}
        >
          {/* Static Menu Items from Admin Config */}
          {staticMenuItems.map((item) => {
            // If item is from category, check for subcategories
            const isCategory = !!item.categoryId;
            const subcategories = isCategory && item.categoryId ? getSubcategories(item.categoryId) : [];
            const hasSubcategories = subcategories.length > 0;

            return (
              <div
                key={item.key}
                style={{ position: 'relative' }}
                onMouseEnter={() => hasSubcategories && setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '16px 20px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    transition: 'all 0.3s',
                    backgroundColor: hoveredKey === item.key ? '#ff4d4f' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!hasSubcategories) {
                      e.currentTarget.style.backgroundColor = '#ff4d4f';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasSubcategories) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.label}
                  {hasSubcategories && <DownOutlined style={{ fontSize: 10 }} />}
                </Link>

                {/* Mega Dropdown for categories */}
                {hasSubcategories && hoveredKey === item.key && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: '#fff',
                      border: '2px solid #ff4d4f',
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      boxShadow: '0 12px 32px rgba(255, 77, 79, 0.25), 0 4px 16px rgba(0, 0, 0, 0.1)',
                      minWidth: '800px',
                      maxWidth: '1000px',
                      padding: '32px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '20px',
                      animation: 'fadeInDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 9999,
                    }}
                  >
                    {subcategories.map((sub: { id: string; name: string; slug: string }) => (
                      <Link
                        key={sub.id}
                        href={`${ROUTES.CATEGORIES}/${sub.slug}`}
                        style={{
                          padding: '12px 16px',
                          color: '#262626',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: 500,
                          borderRadius: 8,
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#fafafa',
                          border: '1px solid transparent',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff5f5';
                          e.currentTarget.style.color = '#ff4d4f';
                          e.currentTarget.style.borderColor = '#ff4d4f';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.color = '#262626';
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ 
                          fontSize: 16, 
                          transition: 'transform 0.25s',
                        }}>▸</span>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          /* TODO: Add mobile menu drawer */
        }
      `}</style>
    </div>
  );
}
