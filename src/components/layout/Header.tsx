/**
 * Header Component
 * Top header for admin layout
 */

"use client";

import { Layout, Button, Dropdown, Typography, Space, Badge, Tag } from "antd";
import {
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { ROUTES } from "@/constants/routes";
import { getRoleDisplayName, getRoleColor } from "@/utils/rbac";
import type { MenuProps } from "antd";

const { Text } = Typography;

export const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Fetch profile data from API (will use cached data if available)
  const { data: profile } = useGetProfileQuery();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push(ROUTES.PROFILE),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout.Header
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 999,
        height: "64px",
      }}
    >
      <Space size={"large"}></Space>

      {/* Right Section */}
      <Space size="large" style={{ marginLeft: "auto" }}>
        {/* Notifications */}
        <Badge count={0} showZero={false}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "18px" }} />}
            style={{
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Badge>

        {/* Settings */}
        <Button
          type="text"
          icon={<SettingOutlined style={{ fontSize: "18px" }} />}
          style={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {/* User Menu */}
        <Dropdown 
          menu={{ items: menuItems }} 
          placement="bottomRight"
          popupRender={(menu) => (
            <div>
              {user && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <Space direction="vertical" size={4}>
                    <Text strong>{user.username}</Text>
                    <Tag color={getRoleColor(user.role)} style={{ margin: 0 }}>
                      {getRoleDisplayName(user.role)}
                    </Tag>
                  </Space>
                </div>
              )}
              {menu}
            </div>
          )}
        >
          <Button
            type="text"
            style={{
              height: "auto",
              padding: "8px 16px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: 500,
              }}
            >
              {profile?.company_name || "Admin"}
            </Text>
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
};

Header.displayName = "Header";
