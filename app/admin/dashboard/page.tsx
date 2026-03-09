/*
 * Dashboard Page
 * Admin dashboard overview (Coming Soon)
 */

'use client';

import { Result } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

export default function Page() {
  return (
    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
      <Result
        icon={<DashboardOutlined style={{ fontSize: 72, color: '#1890ff' }} />}
        title="Dashboard Coming Soon"
        subTitle="Trang tổng quan dashboard đang được phát triển. Vui lòng sử dụng Homepage Editor để chỉnh sửa nội dung trang chủ."
      />
    </div>
  );
}
