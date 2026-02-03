/**
 * Header Component
 * Top header for admin layout
 */

"use client";

import { Layout, Button, Dropdown, Avatar, Image } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { MenuProps } from "antd";

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
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingRight: "24px",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      {/* User Menu */}
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button type="text">
          {user?.company_name && (
            <span style={{ marginRight: 8 }}>{user.company_name}</span>
          )}
          <Avatar size="large" src={user?.logo}/>
        </Button>
      </Dropdown>
    </Layout.Header>
  );
};

Header.displayName = "Header";
