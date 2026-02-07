/**
 * Header Component
 * Top header for admin layout
 */

"use client";

import { Layout, Button, Dropdown, Typography, Space, Badge } from "antd";
import {
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { ROUTES } from "@/constants/routes";
import type { MenuProps } from "antd";

const { Text } = Typography;

export const Header = () => {
  const router = useRouter();
  const { logout } = useAuth();

  // Fetch profile data from API (will use cached data if available)
  const { data: profile } = useGetProfileQuery();

  const signedLogoUrl = useSignedImageUrl(profile?.logo || "");

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const menuItems: MenuProps["items"] = [
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
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
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
