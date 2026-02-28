'use client';

import { useState, useEffect } from 'react';
import { Button, FloatButton, Space, Tooltip } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useGetSystemInfoQuery } from '@/store/services/publicSystemInfoApi';
import { useTranslations } from 'next-intl';

export default function FloatingContactButton() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: systemInfo } = useGetSystemInfoQuery();
  const t = useTranslations('client.floatingContact');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePhone = () => {
    if (systemInfo?.phone) {
      window.location.href = `tel:${systemInfo.phone}`;
    }
  };

  const handleEmail = () => {
    if (systemInfo?.email) {
      window.location.href = `mailto:${systemInfo.email}`;
    }
  };

  const handleFacebook = () => {
    if (systemInfo?.facebook_url) {
      window.open(systemInfo.facebook_url, '_blank');
    }
  };

  const handleTiktok = () => {
    if (systemInfo?.tiktok_url) {
      window.open(systemInfo.tiktok_url, '_blank');
    }
  };

  const handleZalo = () => {
    if (systemInfo?.phone) {
      // Remove all non-digit characters and country code
      const cleanPhone = systemInfo.phone.replace(/\D/g, '').replace(/^84/, '0');
      window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    }
  };

  // Responsive styles
  const buttonSize = isMobile ? 56 : 72;
  const buttonPosition = {
    right: isMobile ? 20 : 48,
    bottom: isMobile ? 28 : 32,
  };
  const menuPosition = {
    right: isMobile ? 20 : 48,
    bottom: isMobile ? 82 : 112,
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          right: buttonPosition.right,
          bottom: buttonPosition.bottom,
          width: buttonSize,
          height: buttonSize,
          pointerEvents: 'none',
        }}
        className="floating-contact-wrapper"
      >
        <FloatButton
          icon={<CustomerServiceOutlined />}
          type="primary"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: buttonSize,
            height: buttonSize,
            pointerEvents: 'auto',
          }}
          className="floating-contact-button"
          onClick={() => setOpen(!open)}
        />
      </div>

      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .floating-contact-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background-color: transparent;
          border: 2px solid #ff4d4f;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          pointer-events: none;
        }
        
        .floating-contact-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background-color: transparent;
          border: 2px solid #ff4d4f;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          animation-delay: 0.5s;
          pointer-events: none;
        }
        
        .floating-contact-button .ant-float-btn-body {
          background-color: #ff4d4f !important;
          box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3) !important;
          transition: all 0.3s ease;
        }
        
        .floating-contact-button:hover .ant-float-btn-body {
          background-color: #ff7875 !important;
          box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4) !important;
          transform: scale(1.05);
        }
        
        .floating-contact-button .ant-float-btn-icon {
          font-size: ${isMobile ? '20px' : '24px'} !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .floating-contact-button .ant-float-btn-icon svg {
          margin: 0 auto !important;
        }
        
        /* Menu button hover effects */
        .contact-menu-phone:hover {
          background-color: #1890ff !important;
          border-color: #1890ff !important;
          color: #fff !important;
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
        }
        
        .contact-menu-email:hover {
          background-color: #722ed1 !important;
          border-color: #722ed1 !important;
          color: #fff !important;
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(114, 46, 209, 0.4);
        }
        
        .contact-menu-zalo:hover {
          background-color: #0068ff !important;
          border-color: #0068ff !important;
          color: #fff !important;
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.4);
        }
        
        .contact-menu-facebook:hover:not(:disabled) {
          background-color: #1877f2 !important;
          border-color: #1877f2 !important;
          color: #fff !important;
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(24, 119, 242, 0.4);
        }
        
        .contact-menu-tiktok:hover:not(:disabled) {
          background-color: #000000 !important;
          border-color: #000000 !important;
          color: #fff !important;
          transform: translateX(-4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        
        .contact-menu-phone,
        .contact-menu-email,
        .contact-menu-zalo,
        .contact-menu-facebook,
        .contact-menu-tiktok {
          transition: all 0.3s ease !important;
        }
      `}</style>

      {open && (
        <div
          style={{
            position: 'fixed',
            right: menuPosition.right,
            bottom: menuPosition.bottom,
            zIndex: 1000,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            padding: isMobile ? 10 : 14,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <Space direction="vertical" size={isMobile ? 8 : 10}>
            {systemInfo?.phone && (
              <Tooltip title={systemInfo.phone} placement="left">
                <Button
                  icon={<PhoneOutlined />}
                  onClick={handlePhone}
                  style={{ 
                    width: isMobile ? 160 : 200, 
                    justifyContent: 'flex-start',
                    fontSize: isMobile ? '13px' : '14px',
                    borderColor: '#1890ff',
                    color: '#1890ff',
                  }}
                  size={isMobile ? 'middle' : 'large'}
                  className="contact-menu-phone"
                >
                  {t('phone')}
                </Button>
              </Tooltip>
            )}

            {systemInfo?.email && (
              <Tooltip title={systemInfo.email} placement="left">
                <Button
                  icon={<MailOutlined />}
                  onClick={handleEmail}
                  style={{ 
                    width: isMobile ? 160 : 200, 
                    justifyContent: 'flex-start',
                    fontSize: isMobile ? '13px' : '14px',
                    borderColor: '#722ed1',
                    color: '#722ed1',
                  }}
                  size={isMobile ? 'middle' : 'large'}
                  className="contact-menu-email"
                >
                  {t('email')}
                </Button>
              </Tooltip>
            )}

            {systemInfo?.phone && (
              <Button
                icon={<MessageOutlined />}
                onClick={handleZalo}
                style={{ 
                  width: isMobile ? 160 : 200, 
                  justifyContent: 'flex-start',
                  fontSize: isMobile ? '13px' : '14px',
                  borderColor: '#0068ff',
                  color: '#0068ff',
                }}
                size={isMobile ? 'middle' : 'large'}
                className="contact-menu-zalo"
              >
                {t('zalo')}
              </Button>
            )}

            <Button
              icon={<FacebookOutlined />}
              onClick={handleFacebook}
              disabled={!systemInfo?.facebook_url}
              style={{ 
                width: isMobile ? 160 : 200, 
                justifyContent: 'flex-start',
                fontSize: isMobile ? '13px' : '14px',
                borderColor: systemInfo?.facebook_url ? '#1877f2' : undefined,
                color: systemInfo?.facebook_url ? '#1877f2' : undefined,
              }}
              size={isMobile ? 'middle' : 'large'}
              className="contact-menu-facebook"
            >
              {t('facebook')} {!systemInfo?.facebook_url && `(${t('comingSoon')})`}
            </Button>

            <Button
              icon={
                <svg
                  viewBox="0 0 1024 1024"
                  style={{ width: 14, height: 14 }}
                  fill="currentColor"
                >
                  <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm271.5 780.9c-81.9 81.9-191.8 127.2-307.5 127.2s-225.6-45.3-307.5-127.2C86.6 699 41.3 589.1 41.3 473.4s45.3-225.6 127.2-307.5C250.4 84 360.3 38.7 476 38.7s225.6 45.3 307.5 127.2c81.9 81.9 127.2 191.8 127.2 307.5s-45.3 225.6-127.2 307.5z" />
                  <path d="M391.4 258.7c-34.5 8.1-65.4 29-85.8 58.1-20.4 29.1-28.6 64.8-22.9 99.3 5.7 34.5 24.2 65.4 51.4 86.1 27.2 20.7 61.9 31.5 96.4 29.9 34.5-1.6 67.8-16.6 92.6-41.7 24.8-25.1 39.4-58.7 40.6-93.2 1.2-34.5-11.7-68.6-35.9-94.6-24.2-26-58.1-42.3-94.1-45.3-36-3-72.8 4.4-102.3 20.4zm241.2 221.5c-18.9 34.8-50.4 61.5-87.7 74.1-37.3 12.6-78.3 10.8-114.1-5-35.8-15.8-64.4-44.7-79.5-80.2-15.1-35.5-16.2-75.8-3-111.9 13.2-36.1 39.4-66.6 72.8-84.7 33.4-18.1 72.3-23.5 108.1-14.9 35.8 8.6 67.8 28.9 89.1 56.5 21.3 27.6 31.5 62.5 28.3 97.1-3.2 34.6-19 66.5-44 88.8l102.8 155.4h-90.2L632.6 480.2z" />
                </svg>
              }
              onClick={handleTiktok}
              disabled={!systemInfo?.tiktok_url}
              style={{ 
                width: isMobile ? 160 : 200, 
                justifyContent: 'flex-start',
                fontSize: isMobile ? '13px' : '14px',
                borderColor: systemInfo?.tiktok_url ? '#000000' : undefined,
                color: systemInfo?.tiktok_url ? '#000000' : undefined,
              }}
              size={isMobile ? 'middle' : 'large'}
              className="contact-menu-tiktok"
            >
              {t('tiktok')} {!systemInfo?.tiktok_url && `(${t('comingSoon')})`}
            </Button>
          </Space>
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </>
  );
}
