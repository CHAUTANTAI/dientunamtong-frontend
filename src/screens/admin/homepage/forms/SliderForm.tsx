'use client';

import { useState, useEffect } from 'react';
import { Button, Space, Input, Typography, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SliderContent } from '@/types/pageSection';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [miniAds, setMiniAds] = useState<MiniAdItem[]>([]);

  // Debounce slides and miniAds to avoid rapid onChange calls
  const debouncedSlides = useDebounce(slides, 500);
  const debouncedMiniAds = useDebounce(miniAds, 500);

  useEffect(() => {
    setSlides(content?.slides || []);
    setMiniAds(content?.mini_ads || []);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [content]);

  useEffect(() => {
    // Avoid infinite loop with deep comparison
    const currentState = JSON.stringify({
      slides: debouncedSlides,
      miniAds: debouncedMiniAds,
    });
    
    const contentState = JSON.stringify({
      slides: content?.slides || [],
      miniAds: content?.mini_ads || [],
    });
    
    if (currentState !== contentState) {
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
    }
  }, [debouncedSlides, debouncedMiniAds, content, onChange]);

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
            Add Slide
          </Button>
        </Space>
        
        {slides.length === 0 ? (
          <Text type="secondary">No slides. Click &quot;Add Slide&quot; to create one.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {slides.map((slide, index) => (
              <Card key={slide.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <MediaUpload
                    value={slide.media_id}
                    onChange={(path) => {
                      const updated = [...slides];
                      updated[index].media_id = path;
                      setSlides(updated);
                    }}
                    folder="homepage/slider"
                    label={`Slide ${index + 1} Image`}
                    accept="image/*"
                    maxSizeMB={5}
                  />
                  <Input
                    placeholder="Link URL (optional)"
                    value={slide.link}
                    onChange={(e) => {
                      const updated = [...slides];
                      updated[index].link = e.target.value;
                      setSlides(updated);
                    }}
                    addonBefore="Link"
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setSlides(slides.filter((_, i) => i !== index))}
                  >
                    Remove Slide
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
            Add Mini Ad
          </Button>
        </Space>

        {miniAds.length === 0 ? (
          <Text type="secondary">No mini ads. Click &quot;Add Mini Ad&quot; to create one.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {miniAds.map((ad, index) => (
              <Card key={ad.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <MediaUpload
                    value={ad.media_id}
                    onChange={(path) => {
                      const updated = [...miniAds];
                      updated[index].media_id = path;
                      setMiniAds(updated);
                    }}
                    folder="homepage/mini-ads"
                    label={`Mini Ad ${index + 1} Image`}
                    accept="image/*"
                    maxSizeMB={5}
                  />
                  <Input
                    placeholder="Link URL (optional)"
                    value={ad.link}
                    onChange={(e) => {
                      const updated = [...miniAds];
                      updated[index].link = e.target.value;
                      setMiniAds(updated);
                    }}
                    addonBefore="Link"
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setMiniAds(miniAds.filter((_, i) => i !== index))}
                  >
                    Remove Ad
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
