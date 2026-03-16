'use client';

import { Carousel, Card, Typography } from 'antd';
import { PlayCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useGetActivePageSectionsQuery } from '@/store/api/pageSectionApi';
import type { VideoSectionContent } from '@/types/pageSection';

const { Title, Text } = Typography;

/**
 * VideoSection Component - Video carousel
 * Hiển thị video clips trong carousel
 * 
 * Config from page_sections API (video_section)
 */
export default function VideoSection() {
  const { data: sections } = useGetActivePageSectionsQuery('homepage');

  // Get video section config from API
  const videoSectionData = sections?.find(s => s.section_identifier === 'video_section');
  const config = videoSectionData?.content as VideoSectionContent | undefined;

  const title = config?.title || 'Video';
  const layoutMode = config?.layout_mode || 'carousel';

  // Use configured videos or fallback to placeholders
  const videos = config?.videos?.length 
    ? config.videos.sort((a, b) => a.sort_order - b.sort_order).map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail || '/placeholder-video.jpg',
        link: v.url,
      }))
    : [
    {
      id: 1,
      title: 'Mạch Stop Fi nhấp nháy đèn hậu Mio M3',
      thumbnail: '/placeholder-video-1.jpg',
      link: '#',
    },
    {
      id: 2,
      title: 'Rear box - Thùng sau tựa lưng PCX',
      thumbnail: '/placeholder-video-2.jpg',
      link: '#',
    },
    {
      id: 3,
      title: 'Cách tăng chỉnh phuộc YSS G Sport Vario/Click Thái',
      thumbnail: '/placeholder-video-3.jpg',
      link: '#',
    },
    {
      id: 4,
      title: 'Xi nhan Motogadget Pin chính hãng siêu nhỏ siêu sáng',
      thumbnail: '/placeholder-video-4.jpg',
      link: '#',
    },
    {
      id: 5,
      title: 'Bảo vệ tay lái ALB 2023 có đèn xi nhan',
      thumbnail: '/placeholder-video-5.jpg',
      link: '#',
    },
    {
      id: 6,
      title: 'Công tắc Cos Pha tích hợp tắt/mở đèn các dòng xe máy Honda',
      thumbnail: '/placeholder-video-6.jpg',
      link: '#',
    },
  ];

  const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        [direction]: '-40px',
        transform: 'translateY(-50%)',
        zIndex: 10,
        cursor: 'pointer',
        backgroundColor: '#fff',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #d9d9d9',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#ff4d4f';
        e.currentTarget.style.backgroundColor = '#ff4d4f';
        const icon = e.currentTarget.querySelector('span');
        if (icon) (icon as HTMLElement).style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d9d9d9';
        e.currentTarget.style.backgroundColor = '#fff';
        const icon = e.currentTarget.querySelector('span');
        if (icon) (icon as HTMLElement).style.color = '#595959';
      }}
    >
      {direction === 'left' ? (
        <LeftOutlined style={{ color: '#595959', fontSize: 14 }} />
      ) : (
        <RightOutlined style={{ color: '#595959', fontSize: 14 }} />
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #f0f0f0',
        }}
      >
        <Title level={3} style={{ margin: 0, fontSize: 20, color: '#262626' }}>
          {title}
        </Title>
      </div>

      {/* Video Carousel */}
      <div style={{ position: 'relative', padding: '0 50px' }}>
        <Carousel
          autoplay={false}
          slidesToShow={4}
          slidesToScroll={1}
          arrows
          prevArrow={<CustomArrow direction="left" />}
          nextArrow={<CustomArrow direction="right" />}
          responsive={[
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
              },
            },
          ]}
        >
          {videos.map((video) => (
            <div key={video.id} style={{ padding: '0 8px' }}>
              <Link href={video.link} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s',
                  }}
                  styles={{ body: { padding: '12px' } }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#ff4d4f';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  {/* Video Thumbnail */}
                  <div
                    style={{
                      width: '100%',
                      paddingTop: '60%',
                      position: 'relative',
                      borderRadius: 6,
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      marginBottom: '12px',
                    }}
                  >
                    {/* TODO: Replace with actual video thumbnails from API */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <PlayCircleOutlined
                        style={{
                          fontSize: 48,
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Video Title */}
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 36,
                      color: '#262626',
                      lineHeight: 1.4,
                    }}
                  >
                    {video.title}
                  </Text>
                </Card>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
