'use client';

import { Popover } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

/**
 * ComingSoonPopover Component - Popover thông báo tính năng đang phát triển
 * 
 * Usage:
 * <ComingSoonPopover featureName="Tính năng XYZ">
 *   <Button>Click me</Button>
 * </ComingSoonPopover>
 */

interface ComingSoonPopoverProps {
  featureName?: string;
  children: ReactNode;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
}

export default function ComingSoonPopover({ 
  featureName = 'này', 
  children,
  placement = 'bottomRight'
}: ComingSoonPopoverProps) {
  const content = (
    <div style={{ padding: '8px 4px', maxWidth: 250 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8 }}>
        <RocketOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
          Sắp ra mắt!
        </span>
      </div>
      <div style={{ fontSize: 13, color: '#8c8c8c' }}>
        Tính năng <strong style={{ color: '#ff4d4f' }}>{featureName}</strong> đang được phát triển 🚀
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      placement={placement}
    >
      {children}
    </Popover>
  );
}

