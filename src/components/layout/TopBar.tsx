'use client';

import { Space, Typography } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const { Text } = Typography;

/**
 * TopBar Component - Thanh trên cùng
 * Layout: Work Time | Cart | Menu ngang
 * 
 * TODO: Kết nối API để lấy:
 * - Business hours từ system_info
 * - Cart count từ user session/state
 */
export default function TopBar() {
  // TODO: Replace with API data
  const businessHours = '8:00 - 18:00 (Kể cả thứ 7 và CN)';
  const cartItemCount = 0; // TODO: Get from cart state

  const menuItems = [
    { label: 'Trang chủ', href: ROUTES.HOME },
    { label: 'Giới thiệu', href: ROUTES.ABOUT },
    { label: 'Hướng dẫn sử dụng', href: '#' }, // TODO: Add route
    { label: 'Dịch vụ', href: '#' }, // TODO: Add route
    { label: 'Tin tức', href: '#' }, // TODO: Add route
    { label: 'Liên hệ', href: ROUTES.CONTACT },
  ];

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left: Work Time */}
        <Space size="small">
          <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
          <Text style={{ fontSize: 13, color: '#595959' }}>
            Thời gian làm việc: <strong style={{ color: '#ff4d4f' }}>{businessHours}</strong>
          </Text>
        </Space>

        {/* Center: Desktop Menu */}
        <div className="topbar-desktop-menu" style={{ display: 'flex', gap: '20px' }}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              style={{
                fontSize: 13,
                color: '#595959',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#595959';
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Cart */}
        <Link href={ROUTES.PRODUCTS} style={{ textDecoration: 'none' }}>
          <Space
            size="small"
            style={{
              cursor: 'pointer',
              padding: '4px 12px',
              borderRadius: 4,
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(24,144,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d9d9d9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: 16, color: '#1890ff' }} />
            <Text style={{ fontSize: 13, color: '#595959' }}>
              Giỏ hàng <strong style={{ color: '#1890ff' }}>({cartItemCount})</strong>
            </Text>
          </Space>
        </Link>
      </div>

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .topbar-desktop-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
