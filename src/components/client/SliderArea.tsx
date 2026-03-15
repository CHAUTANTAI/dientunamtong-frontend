'use client';

import { Carousel, Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

/**
 * SliderArea Component - Main carousel + Mini ads
 * Layout: [Main Slider 70%] [Mini Ads 30%]
 * 
 * TODO: Kết nối API để lấy:
 * - Slider images từ page_sections banner
 * - Mini ads images từ page_sections hoặc media
 */
export default function SliderArea() {
  // TODO: Replace with API data - Get from page_sections banner
  const sliderImages = [
    {
      id: 1,
      url: '/placeholder-slide-1.jpg',
      alt: 'Slide 1',
      link: '#',
    },
    {
      id: 2,
      url: '/placeholder-slide-2.jpg',
      alt: 'Slide 2',
      link: '#',
    },
    {
      id: 3,
      url: '/placeholder-slide-3.jpg',
      alt: 'Slide 3',
      link: '#',
    },
  ];

  // TODO: Replace with API data - Get from page_sections or media
  const miniAds = [
    {
      id: 1,
      url: '/placeholder-ad-1.jpg',
      alt: 'Ad 1',
      link: '#',
    },
    {
      id: 2,
      url: '/placeholder-ad-2.jpg',
      alt: 'Ad 2',
      link: '#',
    },
  ];

  const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        [direction]: '20px',
        transform: 'translateY(-50%)',
        zIndex: 10,
        cursor: 'pointer',
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(24,144,255,0.8)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      }}
    >
      {direction === 'left' ? (
        <LeftOutlined style={{ color: '#fff', fontSize: 16 }} />
      ) : (
        <RightOutlined style={{ color: '#fff', fontSize: 16 }} />
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '2px',
        }}
        className="slider-area-grid"
      >
        {/* Main Slider - Left */}
        <div
          style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Carousel
            autoplay
            autoplaySpeed={5000}
            arrows
            prevArrow={<CustomArrow direction="left" />}
            nextArrow={<CustomArrow direction="right" />}
            dotPosition="bottom"
            style={{ height: '300px' }}
          >
            {sliderImages.map((slide) => (
              <div key={slide.id}>
                <Link href={slide.link}>
                  <div
                    style={{
                      width: '100%',
                      height: '300px',
                      position: 'relative',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {/* TODO: Replace with actual images from API */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                        Slider {slide.id}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Mini Ads - Right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {miniAds.map((ad, index) => (
            <Link key={ad.id} href={ad.link}>
              <div
                style={{
                  width: '100%',
                  height: index === 0 ? '149px' : '149px',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {/* TODO: Replace with actual images from API */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${
                      index === 0 ? '#f093fb 0%, #f5576c 100%' : '#4facfe 0%, #00f2fe 100%'
                    })`,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    Mini Ad {ad.id}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .slider-area-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Custom Carousel Dots */
        .ant-carousel .slick-dots li button {
          background: rgba(255, 255, 255, 0.5) !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
        }
        
        .ant-carousel .slick-dots li.slick-active button {
          background: #fff !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}
