/*
 * Dashboard Page
 * Admin dashboard home page
 */

"use client";

import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, FileOutlined, CheckOutlined } from "@ant-design/icons";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function DashboardPage() {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={567}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={89}
              suffix="%"
              prefix={<CheckOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={42}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Content */}
      <Card style={{ marginTop: "24px" }}>
        <h3>Welcome to Admin Panel</h3>
        <p>
          Use the sidebar menu to navigate through different sections of the
          admin system.
        </p>
      </Card>
    </>
  );
}
