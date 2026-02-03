/**
 * Sidebar Component
 * Left navigation sidebar for admin layout
 */

'use client';

import { Layout, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_MENU_ITEMS } from '@/constants/menu';
import type { MenuProps } from 'antd';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();

  // Convert menu items to format compatible with Ant Design Menu
  const menuItems: MenuProps['items'] = ADMIN_MENU_ITEMS.map((item) => ({
    key: item.key,
    label: item.href ? <Link href={item.href as string}>{item.label}</Link> : item.label,
    icon: item.icon,
  }));

  // Determine selected menu key based on current pathname
  const selectedKey = ADMIN_MENU_ITEMS.find((m) => m.href === pathname)?.key ?? 'dashboard';

  return (
    <Layout.Sider
      collapsed={collapsed}
      collapsible
      trigger={null}
      width={250}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        left: 0,
        top: 0,
      }}
    >
      {/* Sidebar Toggle Button */}
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
          }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Menu */}
      <Menu selectedKeys={[String(selectedKey)]} items={menuItems} mode="inline" />
    </Layout.Sider>
  );
};

Sidebar.displayName = 'Sidebar';
