'use client';

import { useState, useEffect } from 'react';
import { Form, InputNumber, Switch, Button, Space, Input, Typography, List, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { SliderContent } from '@/types/pageSection';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';

const { Text, Title } = Typography;

interface SliderFormProps {
  content: SliderContent;
  onChange: (content: SliderContent) => void;
}

interface SlideItem {
  id: string;
  media_id: MediaValue;
  link?: string;
  alt?: string;
  sort_order: number;
}

interface MiniAdItem {
  id: string;
  media_id: MediaValue;
  link?: string;
  alt?: string;
  sort_order: number;
}

/**
 * SliderForm - Inline form for Slider & Mini Ads configuration
 * Simplified version for Tabs + Accordion layout
 */
export default function SliderForm({ content, onChange }: SliderFormProps) {
  const [form] = Form.useForm();
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [miniAds, setMiniAds] = useState<MiniAdItem[]>([]);

  useEffect(() => {
    setSlides(content?.slides || []);
    setMiniAds(content?.mini_ads || []);
    form.setFieldsValue({
      slider_height: content?.slider_settings?.height || 300,
      slider_autoplay: content?.slider_settings?.autoplay ?? true,
      slider_autoplay_speed: content?.slider_settings?.autoplay_speed || 5000,
      mini_ad_height: content?.mini_ad_settings?.height || 149,
      mini_ad_gap: content?.mini_ad_settings?.gap || 2,
    });
  }, [content, form]);

  useEffect(() => {
    const values = form.getFieldsValue();
    
    // Avoid infinite loop with deep comparison
    const currentState = JSON.stringify({
      slides,
      miniAds,
      settings: {
        slider_height: values.slider_height || 300,
        slider_autoplay: values.slider_autoplay ?? true,
        slider_autoplay_speed: values.slider_autoplay_speed || 5000,
        mini_ad_height: values.mini_ad_height || 149,
        mini_ad_gap: values.mini_ad_gap || 2,
      },
    });
    
    const contentState = JSON.stringify({
      slides: content?.slides || [],
      miniAds: content?.mini_ads || [],
      settings: {
        slider_height: content?.slider_settings?.height || 300,
        slider_autoplay: content?.slider_settings?.autoplay ?? true,
        slider_autoplay_speed: content?.slider_settings?.autoplay_speed || 5000,
        mini_ad_height: content?.mini_ad_settings?.height || 149,
        mini_ad_gap: content?.mini_ad_settings?.gap || 2,
      },
    });
    
    if (currentState !== contentState) {
      const newContent: SliderContent = {
        slides: slides as unknown as SliderContent['slides'],
        mini_ads: miniAds as unknown as SliderContent['mini_ads'],
        slider_settings: {
          height: values.slider_height || 300,
          autoplay: values.slider_autoplay ?? true,
          autoplay_speed: values.slider_autoplay_speed || 5000,
        },
        mini_ad_settings: {
          height: values.mini_ad_height || 149,
          gap: values.mini_ad_gap || 2,
        },
      };
      onChange(newContent);
    }
  }, [slides, miniAds, onChange]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    onChange({
      slides: slides as unknown as SliderContent['slides'],
      mini_ads: miniAds as unknown as SliderContent['mini_ads'],
      slider_settings: {
        height: values.slider_height,
        autoplay: values.slider_autoplay,
        autoplay_speed: values.slider_autoplay_speed,
      },
      mini_ad_settings: {
        height: values.mini_ad_height,
        gap: values.mini_ad_gap,
      },
    });
  };

  const addSlide = () => {
    setSlides([...slides, {
      id: `temp_slide_${Date.now()}`,
      media_id: '',
      link: '#',
      alt: `Slide ${slides.length + 1}`,
      sort_order: slides.length,
    }]);
  };

  const addMiniAd = () => {
    setMiniAds([...miniAds, {
      id: `temp_ad_${Date.now()}`,
      media_id: '',
      link: '#',
      alt: `Mini Ad ${miniAds.length + 1}`,
      sort_order: miniAds.length,
    }]);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Slider Settings */}
      <Card title={<Text strong>Slider Settings</Text>} size="small">
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
          <Form.Item
            name="slider_height"
            label="Height (px)"
            style={{ marginBottom: 12 }}
          >
            <InputNumber min={100} max={800} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="slider_autoplay"
            label="Auto-play"
            valuePropName="checked"
            style={{ marginBottom: 12 }}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="slider_autoplay_speed"
            label="Auto-play Speed (ms)"
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1000} max={10000} step={1000} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Card>

      {/* Slides */}
      <div>
        <Space style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Slides</Title>
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addSlide}>
            Add Slide
          </Button>
        </Space>
        
        {slides.length === 0 ? (
          <Text type="secondary">No slides. Click "Add Slide" to create one.</Text>
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
                    placeholder="Link URL"
                    value={slide.link}
                    onChange={(e) => {
                      const updated = [...slides];
                      updated[index].link = e.target.value;
                      setSlides(updated);
                    }}
                    addonBefore="Link"
                  />
                  <Input
                    placeholder="Alt text"
                    value={slide.alt}
                    onChange={(e) => {
                      const updated = [...slides];
                      updated[index].alt = e.target.value;
                      setSlides(updated);
                    }}
                    addonBefore="Alt"
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setSlides(slides.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </div>

      {/* Mini Ads Settings */}
      <Card title={<Text strong>Mini Ads Settings</Text>} size="small">
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
          <Form.Item
            name="mini_ad_height"
            label="Height (px)"
            style={{ marginBottom: 12 }}
          >
            <InputNumber min={50} max={400} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="mini_ad_gap"
            label="Gap between ads (px)"
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={0} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Card>

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
          <Text type="secondary">No mini ads. Click "Add Mini Ad" to create one.</Text>
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
                    placeholder="Link URL"
                    value={ad.link}
                    onChange={(e) => {
                      const updated = [...miniAds];
                      updated[index].link = e.target.value;
                      setMiniAds(updated);
                    }}
                    addonBefore="Link"
                  />
                  <Input
                    placeholder="Alt text"
                    value={ad.alt}
                    onChange={(e) => {
                      const updated = [...miniAds];
                      updated[index].alt = e.target.value;
                      setMiniAds(updated);
                    }}
                    addonBefore="Alt"
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setMiniAds(miniAds.filter((_, i) => i !== index))}
                  >
                    Remove
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
