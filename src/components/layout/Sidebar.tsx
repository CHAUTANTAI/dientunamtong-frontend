/**
 * Sidebar Component
 * Left navigation sidebar for admin layout
 */

"use client";

import { Layout, Menu, Typography, Button, Image } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU_ITEMS } from "@/constants/menu";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";
import { useAuth } from "@/hooks/useAuth";
import { hasMinimumRole, hasAnyRole } from "@/utils/rbac";
import type { MenuProps } from "antd";

const { Text } = Typography;

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Fetch profile for logo
  const { data: profile } = useGetProfileQuery();
  const signedLogoUrl = useSignedImageUrl(profile?.logo || "");

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
  const menuItems: MenuProps["items"] = visibleMenuItems.map((item) => ({
    key: item.key,
    label: item.href ? (
      <Link href={item.href as string}>{item.label}</Link>
    ) : (
      item.label
    ),
    icon: item.icon,
  }));

  // Determine selected menu key based on current pathname
  // Sort by href length (longest first) to match most specific route
  const selectedKey =
    [...visibleMenuItems]
      .sort((a, b) => (b.href?.length || 0) - (a.href?.length || 0))
      .find((m) => m.href && pathname.startsWith(m.href))?.key ?? "dashboard";

  return (
    <Layout.Sider
      collapsed={collapsed}
      collapsible
      trigger={null}
      width={260}
      collapsedWidth={80}
      style={{
        overflow: "hidden",
        height: "100vh",
        position: "sticky",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #1e1e2e 0%, #27273f 100%)",
        boxShadow: "2px 0 12px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo & Brand Section with Toggle */}
      <div
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: collapsed ? "12px 16px" : "12px 20px",
          background: "rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          gap: "12px",
        }}
      >
        {/* Logo and Company Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? "0" : "14px",
            flex: 1,
            minWidth: 0,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {signedLogoUrl && (
            <Image
              src={signedLogoUrl}
              alt="Logo"
              width={collapsed ? 40 : 42}
              height={collapsed ? 40 : 42}
              preview={false}
              style={{
                borderRadius: "10px",
                objectFit: "cover",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                flexShrink: 0,
                transition: "all 0.3s ease",
              }}
            />
          )}
          {!collapsed && (
            <Text
              style={{
                color: "#fff",
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "0.3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile?.company_name || "Nam Tông"}
            </Text>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          type="text"
          icon={
            collapsed ? (
              <RightOutlined
                style={{
                  fontSize: "16px",
                  color: "#fff",
                }}
              />
            ) : (
              <LeftOutlined
                style={{
                  fontSize: "16px",
                  color: "#fff",
                }}
              />
            )
          }
          onClick={onToggle}
          style={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "36px",
            width: "36px",
            minWidth: "36px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
      </div>

      {/* Content Container with Flex Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Menu */}
        <Menu
          selectedKeys={[String(selectedKey)]}
          items={menuItems}
          mode="inline"
          style={{
            background: "transparent",
            border: "none",
            marginTop: "8px",
            flex: 1,
            minHeight: "fit-content",
          }}
          theme="dark"
          inlineIndent={24}
          className="custom-sidebar-menu"
        />

        {/* Bottom Decoration */}
        <div
          style={{
            margin: "20px",
            padding: collapsed ? "12px" : "16px",
            background: collapsed
              ? "transparent"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
            borderRadius: "12px",
            border: collapsed
              ? "none"
              : "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: collapsed ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: collapsed ? 0 : 1,
            height: collapsed ? "0" : "auto",
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "12px",
              display: "block",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            © 2026 Nam Tông Store
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.45)",
              fontSize: "11px",
              display: "block",
              textAlign: "center",
              marginTop: "4px",
            }}
          >
            Version 1.0.0
          </Text>
        </div>
      </div>

      {/* Custom Menu Styles */}
      <style jsx global>{`
        .custom-sidebar-menu .ant-menu-item {
          border-radius: 8px;
          margin: 4px 12px;
          padding-left: ${collapsed ? "0" : "20"}px !important;
          height: 44px;
          line-height: 44px;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .custom-sidebar-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          transform: translateX(2px);
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
          font-size: ${collapsed ? "20px" : "18px"};
          transition: all 0.2s ease;
        }

        .custom-sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: #60a5fa;
          transform: scale(1.1);
        }
      `}</style>
    </Layout.Sider>
  );
};

Sidebar.displayName = "Sidebar";
