/**
 * Sidebar Component
 * Left navigation sidebar for admin layout with mobile drawer support
 */

'use client';

import { Layout, Menu, Typography, Button, Image, Drawer, Badge } from 'antd';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ADMIN_MENU_ITEMS } from '@/constants/menu';
import { useGetProfileQuery } from '@/store/api/profileApi';
import { useGetUnreadCountQuery } from '@/store/api/contactApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useAuth } from '@/hooks/useAuth';
import { hasMinimumRole, hasAnyRole } from '@/utils/rbac';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  mobileDrawerOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ 
  collapsed = false, 
  onToggle,
  isMobile = false,
  mobileDrawerOpen = false,
  onMobileClose
}: SidebarProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const { user } = useAuth();

  // Fetch profile for logo
  const { data: profile } = useGetProfileQuery();
  const signedLogoUrl = useSignedImageUrl(profile?.logo || '');

  // Fetch unread contact count
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();

  // Filter menu items based on user role
  const visibleMenuItems = ADMIN_MENU_ITEMS.filter((item) => {
    if (!user) return false;

    // If item has specific roles requirement
    if (item.roles && item.roles.length > 0) {
      return hasAnyRole(user.role, item.roles);
    }

    // If item has minimum role requirement
    if (item.minRole) {
      return hasMinimumRole(user.role, item.minRole);
    }

    // No restriction, show to all
    return true;
  });

  // Convert menu items to format compatible with Ant Design Menu
  const menuItems: MenuProps['items'] = visibleMenuItems.map((item) => {
    const label = item.href ? <Link href={item.href as string}>{t(item.labelKey)}</Link> : t(item.labelKey);
    
    // Add badge for contact menu item if there are unread contacts
    if (item.key === 'contact' && unreadCount > 0) {
      return {
        key: item.key,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {label}
            <Badge count={unreadCount} style={{ marginLeft: 8 }} />
          </div>
        ),
        icon: item.icon,
      };
    }
    
    return {
      key: item.key,
      label,
      icon: item.icon,
    };
  });

  // Determine selected menu key based on current pathname
  const selectedKey =
    [...visibleMenuItems]
      .sort((a, b) => (b.href?.length || 0) - (a.href?.length || 0))
      .find((m) => m.href && pathname.startsWith(m.href))?.key ?? 'dashboard';

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo & Brand Section */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : (collapsed ? 'center' : 'space-between'),
          padding: collapsed ? '12px 16px' : '12px 20px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          gap: '12px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            justifyContent: isMobile || !collapsed ? 'flex-start' : 'center',
          }}
        >
          {signedLogoUrl && (
            <Image
              src={signedLogoUrl}
              alt="Logo"
              width={isMobile ? 36 : (collapsed ? 40 : 42)}
              height={isMobile ? 36 : (collapsed ? 40 : 42)}
              preview={false}
              style={{
                borderRadius: '10px',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Toggle/Close Button */}
        {!isMobile && (
          <Button
            type="text"
            icon={
              collapsed ? (
                <RightOutlined style={{ fontSize: '16px', color: '#fff' }} />
              ) : (
                <LeftOutlined style={{ fontSize: '16px', color: '#fff' }} />
              )
            }
            onClick={onToggle}
            style={{
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              width: '36px',
              minWidth: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
            }}
          />
        )}

        {isMobile && (
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: '16px', color: '#fff' }} />}
            onClick={onMobileClose}
            style={{
              color: '#fff',
              height: '36px',
              width: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        )}
      </div>

      {/* Menu */}
      <Menu
        selectedKeys={[String(selectedKey)]}
        items={menuItems}
        mode="inline"
        onClick={isMobile ? onMobileClose : undefined}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: '8px',
          flex: 1,
          minHeight: 'fit-content',
        }}
        theme="dark"
        inlineIndent={24}
        className="custom-sidebar-menu"
      />

      {/* Bottom Info */}
      <div
        style={{
          margin: '20px',
          padding: (collapsed && !isMobile) ? '12px' : '16px',
          background: (collapsed && !isMobile)
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '12px',
          border: (collapsed && !isMobile) ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
          opacity: (collapsed && !isMobile) ? 0 : 1,
          height: (collapsed && !isMobile) ? '0' : 'auto',
          overflow: 'hidden',
        }}
      >
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            display: 'block',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          © 2026 Nam Tông Store
        </Text>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.45)',
            fontSize: '11px',
            display: 'block',
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          Version 1.0.0
        </Text>
      </div>

      {/* Custom Menu Styles */}
      <style jsx global>{`
        .custom-sidebar-menu .ant-menu-item {
          border-radius: 8px;
          margin: 4px 12px;
          padding-left: 20px !important;
          height: 44px;
          line-height: 44px;
        }

        .custom-sidebar-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.12) !important;
        }

        .custom-sidebar-menu .ant-menu-item-selected {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.2),
            rgba(147, 51, 234, 0.2)
          ) !important;
          border-left: 3px solid #3b82f6;
        }

        .custom-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          font-size: ${(collapsed && !isMobile) ? '20px' : '18px'};
        }

        .custom-sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={onMobileClose}
        closable={false}
        width={260}
        styles={{
          body: { padding: 0, background: 'linear-gradient(180deg, #1e1e2e 0%, #27273f 100%)' }
        }}
        style={{ zIndex: 999 }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: Use Sider
  return (
    <Layout.Sider
      collapsed={collapsed}
      collapsible
      trigger={null}
      width={260}
      collapsedWidth={80}
      breakpoint="lg"
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'sticky',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, #1e1e2e 0%, #27273f 100%)',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {sidebarContent}
    </Layout.Sider>
  );
};

Sidebar.displayName = 'Sidebar';
