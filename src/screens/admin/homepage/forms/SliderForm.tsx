'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Space, Input, Typography, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SliderContent } from '@/types/pageSection';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from 'next-intl';

const { Text, Title } = Typography;

interface SliderFormProps {
  content: SliderContent;
  onChange: (content: SliderContent) => void;
}

interface SlideItem {
  id: string;
  media_id: MediaValue;
  link?: string;
  sort_order: number;
}

interface MiniAdItem {
  id: string;
  media_id: MediaValue;
  link?: string;
  sort_order: number;
}

/**
 * SliderForm - Simplified form for Slider & Mini Ads
 * Only image and link - no technical settings
 */
export default function SliderForm({ content, onChange }: SliderFormProps) {
  const t = useTranslations('homepageEditor.forms.slider');
  const [slides, setSlides] = useState<SlideItem[]>(() => content?.slides || []);
  const [miniAds, setMiniAds] = useState<MiniAdItem[]>(() => content?.mini_ads || []);
  const isInitializingRef = useRef(true);

  // Debounce slides and miniAds to avoid rapid onChange calls
  const debouncedSlides = useDebounce(slides, 500);
  const debouncedMiniAds = useDebounce(miniAds, 500);

  // Initialize slides/miniAds from incoming content on first render.
  // Further updates originate from user interactions which call setSlides/setMiniAds.

  // Call onChange only when debounced values change AND not initializing
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('⏳ Initializing, skipping onChange call');
      isInitializingRef.current = false;
      return;
    }

    console.log('📤 Calling onChange - slides:', debouncedSlides.length, 'mini_ads:', debouncedMiniAds.length);
    
    const newContent: SliderContent = {
      slides: debouncedSlides as unknown as SliderContent['slides'],
      mini_ads: debouncedMiniAds as unknown as SliderContent['mini_ads'],
      slider_settings: content?.slider_settings || {
        height: 300,
        autoplay: true,
        autoplay_speed: 5000,
      },
      mini_ad_settings: content?.mini_ad_settings || {
        height: 149,
        gap: 2,
      },
    };
    onChange(newContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlides, debouncedMiniAds]);

  const addSlide = () => {
    setSlides([...slides, {
      id: `temp_slide_${Date.now()}`,
      media_id: '',
      link: '#',
      sort_order: slides.length,
    }]);
  };

  const addMiniAd = () => {
    setMiniAds([...miniAds, {
      id: `temp_ad_${Date.now()}`,
      media_id: '',
      link: '#',
      sort_order: miniAds.length,
    }]);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Slides */}
      <div>
        <Space style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Slides</Title>
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addSlide}>
            {t('addSlide')}
          </Button>
        </Space>
        
        {slides.length === 0 ? (
          <Text type="secondary">{t('noSlides')}</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {slides.map((slide, index) => (
              <Card key={slide.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space.Compact style={{ display: 'flex', width: '100%', gap: 0 }}>
                    <MediaUpload
                      value={slide.media_id}
                      onChange={(path) => {
                        // Deep clone to avoid mutating readonly objects
                        const updated = slides.map((s, i) => 
                          i === index ? { ...s, media_id: path } : s
                        );
                        setSlides(updated);
                      }}
                      folder="homepage/slider"
                      label={`Slide ${index + 1} Image`}
                      accept="image/*"
                      maxSizeMB={5}
                      helperText="Recommended for homepage: 1138x300px (desktop) or larger with similar ratio."
                    />
                  </Space.Compact>
                  <Space.Compact style={{ display: 'flex', width: '100%', gap: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', backgroundColor: '#fafafa', border: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px' }}>
                      <span style={{ fontSize: '14px', color: '#595959' }}>{t('linkLabel')}</span>
                    </div>
                    <Input
                      placeholder={t('linkPlaceholder')}
                      value={slide.link}
                      onChange={(e) => {
                        const updated = slides.map((s, i) => 
                          i === index ? { ...s, link: e.target.value } : s
                        );
                        setSlides(updated);
                      }}
                      style={{ borderRadius: '0 4px 4px 0' }}
                    />
                  </Space.Compact>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const updated = slides.filter((_, i) => i !== index);
                      setSlides(updated);
                    }}
                  >
                    {t('remove')}
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </div>

      {/* Mini Ads */}
      <div>
        <Space style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Mini Ads (Max 2)</Title>
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={addMiniAd}
            disabled={miniAds.length >= 2}
          >
            {t('addMiniAd')}
          </Button>
        </Space>

        {miniAds.length === 0 ? (
          <Text type="secondary">{t('noMiniAds')}</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {miniAds.map((ad, index) => (
              <Card key={ad.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <MediaUpload
                    value={ad.media_id}
                    onChange={(path) => {
                      // Deep clone to avoid mutating readonly objects
                      const updated = miniAds.map((a, i) => 
                        i === index ? { ...a, media_id: path } : a
                      );
                      setMiniAds(updated);
                    }}
                    folder="homepage/mini-ads"
                    label={`Mini Ad ${index + 1} Image`}
                    accept="image/*"
                    maxSizeMB={5}
                    helperText="Recommended for homepage: 260x149px (desktop) or 520x298px for sharper image quality."
                  />
                  <Space.Compact style={{ display: 'flex', width: '100%', gap: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', backgroundColor: '#fafafa', border: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px' }}>
                      <span style={{ fontSize: '14px', color: '#595959' }}>{t('linkLabel')}</span>
                    </div>
                    <Input
                      placeholder={t('linkPlaceholder')}
                      value={ad.link}
                      onChange={(e) => {
                        const updated = miniAds.map((a, i) => 
                          i === index ? { ...a, link: e.target.value } : a
                        );
                        setMiniAds(updated);
                      }}
                      style={{ borderRadius: '0 4px 4px 0' }}
                    />
                  </Space.Compact>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const updated = miniAds.filter((_, i) => i !== index);
                      setMiniAds(updated);
                    }}
                  >
                    {t('remove')}
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </Space>
  );
}
