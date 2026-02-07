/**
 * Sidebar Component
 * Left navigation sidebar for admin layout
 */

"use client";

import { Layout, Menu, Typography, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU_ITEMS } from "@/constants/menu";
import type { MenuProps } from "antd";

const { Text } = Typography;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();

  // Convert menu items to format compatible with Ant Design Menu
  const menuItems: MenuProps["items"] = ADMIN_MENU_ITEMS.map((item) => ({
    key: item.key,
    label: item.href ? (
      <Link href={item.href as string}>{item.label}</Link>
    ) : (
      item.label
    ),
    icon: item.icon,
  }));

  // Determine selected menu key based on current pathname
  const selectedKey =
    ADMIN_MENU_ITEMS.find((m) => m.href === pathname)?.key ?? "dashboard";

  return (
    <Layout.Sider
      collapsed={collapsed}
      collapsible
      trigger={null}
      width={260}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #1e1e2e 0%, #27273f 100%)",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Logo & Brand Section */}
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "0" : "0 20px",
          background: "rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ☕
            </div>
            <Text
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              Nam Tông
            </Text>
          </div>
        )}
        
        <Button
          type="text"
          icon={
            collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: "18px", color: "#fff" }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: "18px", color: "#fff" }} />
            )
          }
          onClick={onToggle}
          style={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: collapsed ? "100%" : "auto",
          }}
        />
      </div>

      {/* Menu */}
      <Menu
        selectedKeys={[String(selectedKey)]}
        items={menuItems}
        mode="inline"
        style={{
          background: "transparent",
          border: "none",
          marginTop: "8px",
        }}
        theme="dark"
        inlineIndent={24}
      />

      {/* Bottom Decoration */}
      {!collapsed && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            padding: "16px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "12px",
              display: "block",
              textAlign: "center",
            }}
          >
            © 2026 Nam Tông Coffee
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "11px",
              display: "block",
              textAlign: "center",
              marginTop: "4px",
            }}
          >
            Version 1.0.0
          </Text>
        </div>
      )}
    </Layout.Sider>
  );
};

Sidebar.displayName = "Sidebar";
