/**
 * Header Component
 * Top header for admin layout
 */

"use client";

import { Layout, Button, Dropdown, Avatar, Typography, Space, Badge } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { MenuProps } from "antd";

const { Text } = Typography;

export const Header = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      disabled: true,
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
      {/* Brand Name */}
      <Space size="middle">
        <Typography.Title
          level={4}
          style={{
            margin: 0,
            color: "#fff",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          ☕ Admin Dashboard
        </Typography.Title>
      </Space>

      {/* Right Section */}
      <Space size="large">
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
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button
            type="text"
            style={{
              height: "auto",
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <Avatar
              size={32}
              src={user?.logo}
              style={{
                backgroundColor: "#fff",
                color: "#667eea",
                fontWeight: 600,
              }}
              icon={!user?.logo && <UserOutlined />}
            />
            {user?.company_name && (
              <Text
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.company_name}
              </Text>
            )}
          </Button>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
};

Header.displayName = "Header";
