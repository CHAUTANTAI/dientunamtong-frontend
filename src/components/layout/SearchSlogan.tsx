'use client';

import { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

const { Search } = Input;

/**
 * SearchSlogan Component - Search bar + Marquee slogan
 * Layout: [Search Box] [Slogan chạy]
 * 
 * TODO: Kết nối API để lấy:
 * - Slogan text từ system_info hoặc page_sections
 * - Implement search với API
 */
export default function SearchSlogan() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  // TODO: Replace with API data - Get from system_info or page_sections
  const sloganText = 'Dán keo xe Hoàng Trí chào mừng bạn đã ghé thăm trang Web chuyên cung cấp và lắp đặt phụ tùng inox trang trí làm đẹp xe máy, xe tay ga đời mới, tân trang xe máy, cung cấp đồ chơi xe máy';

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    
    // TODO: Implement search with API
    // For now, navigate to products page with search query
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(value)}`);
  };

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
          placeholder="Tìm sản phẩm, dòng xe, thương hiệu..."
          allowClear
          enterButton={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                height: '40px',
              }}
            >
              Tìm
            </Button>
          }
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{
            width: '100%',
          }}
          styles={{
            input: {
              height: '40px',
              fontSize: 14,
            }
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
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              animation: 'marquee 30s linear infinite',
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: '#ff6b35',
                fontStyle: 'italic',
              }}
            >
              {sloganText}
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
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
