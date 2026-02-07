/**
 * AdminLayout Component
 * Main layout wrapper for admin pages
 */

"use client";

import { Layout } from "antd";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pageTitle = usePageTitle();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Right Content */}
      <Layout>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Layout.Content
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {/* Page Title */}
          {pageTitle && (
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#1e1e2e",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              {pageTitle}
            </h1>
          )}

          {/* Breadcrumbs */}
          {<Breadcrumbs />}

          {/* Page Content */}
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              marginTop: "16px",
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

AdminLayout.displayName = "AdminLayout";
