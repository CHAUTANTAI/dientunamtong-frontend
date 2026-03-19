'use client';

import { useState } from 'react';
import { Menu } from 'antd';
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
  const { data: categories, isLoading } = useGetPublicCategoriesQuery();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Get mega menu config from props
  const config = content;

  // Filter only parent categories (those without parent_id)
  const parentCategories = categories?.filter((cat) => !cat.parent_id) || [];

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
      }))
    : [
        { key: 'prices', label: 'Bảng giá', href: '#' },
        { key: 'stickers', label: 'Tem xe', href: '#' },
        { key: 'videos', label: 'Video', href: '#' },
      ];

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
          {/* Category Menus */}
          {parentCategories.slice(0, 7).map((category: { id: string; name: string; slug: string }) => {
            const subcategories = getSubcategories(category.id);
            const hasSubcategories = subcategories.length > 0;

            return (
              <div
                key={category.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredKey(category.id)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <Link
                  href={`${ROUTES.CATEGORIES}/${category.slug}`}
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
                    backgroundColor: hoveredKey === category.id ? '#ff4d4f' : 'transparent',
                  }}
                >
                  {category.name}
                  {hasSubcategories && <DownOutlined style={{ fontSize: 10 }} />}
                </Link>

                {/* Mega Dropdown */}
                {hasSubcategories && hoveredKey === category.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '0 0 8px 8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      minWidth: '800px',
                      maxWidth: '1000px',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '16px',
                      animation: 'fadeInDown 0.3s ease',
                    }}
                  >
                    {subcategories.map((sub: { id: string; name: string; slug: string }) => (
                      <Link
                        key={sub.id}
                        href={`${ROUTES.CATEGORIES}/${sub.slug}`}
                        style={{
                          padding: '8px 12px',
                          color: '#595959',
                          textDecoration: 'none',
                          fontSize: 13,
                          borderRadius: 4,
                          transition: 'all 0.3s',
                          display: 'block',
                        }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                        e.currentTarget.style.color = '#ff4d4f';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#595959';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Static Menu Items */}
          {staticMenuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff4d4f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
