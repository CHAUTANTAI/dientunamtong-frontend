/**
 * Ant Design Provider
 * Provides context for static methods like Modal.confirm, message, notification
 */

'use client';

import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
