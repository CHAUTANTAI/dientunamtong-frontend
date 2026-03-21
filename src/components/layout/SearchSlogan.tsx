'use client';

import { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/constants/routes';
import type { SearchSloganContent } from '@/types/pageSection';

const { Search } = Input;

/**
 * SearchSlogan Component - Search bar + Marquee slogan
 * Layout: [Search Box] [Slogan chạy]
 * 
 * Config slogan text from the `content` prop.
 */
interface SearchSloganProps {
  content?: SearchSloganContent;
}

export default function SearchSlogan({ content }: SearchSloganProps) {
  const router = useRouter();
  const t = useTranslations('searchSlogan');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    
    // TODO: Implement search with API
    // For now, navigate to products page with search query
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(value)}`);
  };

  // Get search slogan config from props
  const config = content;

  // Don't render slogan if no text configured
  const sloganText = config?.slogan_text;
  
  // Calculate animation duration based on text length
  // Longer text = slower speed to ensure readability
  // Formula: base speed (10s) + extra time for longer text
  const textLength = sloganText?.length || 0;
  const animationDuration = textLength > 0 
    ? Math.max(10, Math.min(25, 10 + (textLength / 20))) // Min 10s, max 25s
    : 20;
  
  if (!sloganText) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          padding: '12px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Only Search Box when no slogan */}
          <Search
            placeholder={t('searchPlaceholder')}
            allowClear
            enterButton={
              <Button
                type="primary"
                icon={<SearchOutlined />}
                style={{
                  backgroundColor: '#ff4d4f',
                  borderColor: '#ff4d4f',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {t('searchButton')}
              </Button>
            }
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            style={{
              width: '400px',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '12px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '24px',
          alignItems: 'center',
        }}
        className="search-slogan-grid"
      >
        {/* Search Box */}
        <Search
          placeholder={t('searchPlaceholder')}
          allowClear
          enterButton={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('searchButton')}
            </Button>
          }
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{
            width: '100%',
          }}
        />

        {/* Slogan Marquee */}
        <div
          style={{
            overflow: 'hidden',
            backgroundColor: '#fff5f0',
            border: '1px solid #ffd8bf',
            borderRadius: 6,
            padding: '8px 16px',
            position: 'relative',
          }}
        >
          <div
            className="marquee-container"
            style={{
              display: 'flex',
              animation: `marquee-scroll ${animationDuration}s linear infinite`,
            }}
          >
            <span
              className="marquee-content"
              style={{
                fontSize: 13,
                color: '#ff6b35',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
                paddingRight: '4em',
              }}
            >
              {sloganText}
            </span>
            <span
              className="marquee-content"
              style={{
                fontSize: 13,
                color: '#ff6b35',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
                paddingRight: '4em',
              }}
            >
              {sloganText}
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        .marquee-container {
          width: fit-content;
        }
        
        .marquee-content {
          flex-shrink: 0;
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 2em));
          }
        }

        @media (max-width: 768px) {
          .search-slogan-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
