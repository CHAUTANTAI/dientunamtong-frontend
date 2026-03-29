'use client';

import { Space, Typography, Popover, Skeleton } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined, RocketOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';

const { Text } = Typography;

// Helper to format business hours
interface BusinessHoursSchedule {
  schedule: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
}

function formatBusinessHours(businessHoursJson: string | null | undefined): string {
  if (!businessHoursJson) return '';
  
  try {
    const parsed: BusinessHoursSchedule = JSON.parse(businessHoursJson);
    const { schedule } = parsed;
    
    if (!schedule || schedule.length === 0) return '';
    
    // Check if all days have same hours and all are open
    const allOpen = schedule.every(day => day.isOpen);
    if (!allOpen) {
      // If some days are closed, show detailed schedule
      return formatDetailedSchedule(schedule);
    }
    
    const firstDay = schedule[0];
    const allSameHours = schedule.every(
      day => day.openTime === firstDay.openTime && day.closeTime === firstDay.closeTime
    );
    
    if (allSameHours) {
      // All days open with same hours
      return `${firstDay.openTime} - ${firstDay.closeTime} (Thứ 2 - CN)`;
    } else {
      // Different hours for different days
      return formatDetailedSchedule(schedule);
    }
  } catch (error) {
    console.error('Failed to parse business hours:', error);
    return '';
  }
}

function formatDetailedSchedule(schedule: BusinessHoursSchedule['schedule']): string {
  const dayNames: Record<string, string> = {
    monday: 'T2',
    tuesday: 'T3',
    wednesday: 'T4',
    thursday: 'T5',
    friday: 'T6',
    saturday: 'T7',
    sunday: 'CN',
  };
  
  // Group consecutive days with same hours
  const groups: string[] = [];
  let currentGroup: typeof schedule = [];
  
  schedule.forEach((day, index) => {
    if (!day.isOpen) return;
    
    if (currentGroup.length === 0) {
      currentGroup.push(day);
    } else {
      const prev = currentGroup[currentGroup.length - 1];
      if (day.openTime === prev.openTime && day.closeTime === prev.closeTime) {
        currentGroup.push(day);
      } else {
        // Finish current group
        groups.push(formatGroup(currentGroup, dayNames));
        currentGroup = [day];
      }
    }
    
    // Last item
    if (index === schedule.length - 1 && currentGroup.length > 0) {
      groups.push(formatGroup(currentGroup, dayNames));
    }
  });
  
  return groups.join('; ');
}

function formatGroup(
  days: BusinessHoursSchedule['schedule'], 
  dayNames: Record<string, string>
): string {
  if (days.length === 0) return '';
  
  const firstDay = days[0];
  if (days.length === 1) {
    return `${dayNames[firstDay.day]}: ${firstDay.openTime}-${firstDay.closeTime}`;
  } else {
    const firstDayName = dayNames[days[0].day];
    const lastDayName = dayNames[days[days.length - 1].day];
    return `${firstDayName}-${lastDayName}: ${firstDay.openTime}-${firstDay.closeTime}`;
  }
}

/**
 * TopBar Component - Thanh trên cùng
 * Layout: Work Time | Cart | Menu ngang
 * 
 * TODO: Kết nối API để lấy:
 * - Business hours từ system_info
 * - Cart count từ user session/state
 */
export default function TopBar() {
  const { data: systemInfo, isLoading } = useGetSystemInfoQuery();
  
  const businessHours = formatBusinessHours(systemInfo?.business_hours);
  const cartItemCount = 0; // TODO: Get from cart state

  const t = useTranslations?.('client.TopBar') ?? ((k: string) => k);

  // Coming Soon Popover content
  const comingSoonContent = (
    <div style={{ padding: '8px 4px', maxWidth: 250 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8 }}>
        <RocketOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
        <Text strong style={{ fontSize: 14, color: '#262626' }}>
          {t('comingSoon')}
        </Text>
      </div>
      <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
        {t('featureInProgress')} <strong style={{ color: '#ff4d4f' }}>{t('cart')}</strong> 🚀
      </Text>
    </div>
  );

  const menuItems = [
    { label: t('home'), href: ROUTES.HOME },
    { label: t('about'), href: ROUTES.ABOUT },
    { label: t('contact'), href: ROUTES.CONTACT },
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
          <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 15 }} />
          {isLoading ? (
            <Skeleton.Input active size="small" style={{ width: 300, height: 20 }} />
          ) : businessHours ? (
            <Text style={{ fontSize: 14, color: '#595959' }}>
              {t('workTime')}: <strong style={{ color: '#ff4d4f' }}>{businessHours}</strong>
            </Text>
          ) : null}
        </Space>

        {/* Center: Desktop Menu */}
        <div className="topbar-desktop-menu" style={{ display: 'flex', gap: '20px' }}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              style={{
                fontSize: 14,
                color: '#595959',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff4d4f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#595959';
            }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Language Switcher + Cart */}
        <Space size="middle">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Cart */}
          <Popover
            content={comingSoonContent}
            title={null}
            trigger="click"
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer' }}>
              <Space
                size="small"
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  border: '1px solid #d9d9d9',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ff4d4f';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,77,79,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 17, color: '#ff4d4f' }} />
                <Text style={{ fontSize: 14, color: '#595959' }}>
                  {t('cart')} <strong style={{ color: '#ff4d4f' }}>({cartItemCount})</strong>
                </Text>
              </Space>
            </div>
          </Popover>
        </Space>
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
