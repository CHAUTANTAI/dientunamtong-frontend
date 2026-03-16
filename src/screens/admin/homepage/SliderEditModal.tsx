'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Switch, Button, Space, Upload, Input, Typography, message as antMessage, List, Image as AntImage } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { SliderContent } from '@/types/pageSection';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text, Title } = Typography;

interface SliderEditModalProps {
  open: boolean;
  onClose: () => void;
  content: SliderContent;
  onSave: (content: SliderContent) => void;
}

export default function SliderEditModal({
  open,
  onClose,
  content,
  onSave,
}: SliderEditModalProps) {
  const [form] = Form.useForm();
  const [slides, setSlides] = useState(content?.slides || []);
  const [miniAds, setMiniAds] = useState(content?.mini_ads || []);

  useEffect(() => {
    if (open) {
      setSlides(content?.slides || []);
      setMiniAds(content?.mini_ads || []);
      form.setFieldsValue({
        slider_height: content?.slider_settings?.height || 300,
        slider_autoplay: content?.slider_settings?.autoplay ?? true,
        slider_autoplay_speed: content?.slider_settings?.autoplay_speed || 5000,
        mini_ad_height: content?.mini_ad_settings?.height || 149,
        mini_ad_gap: content?.mini_ad_settings?.gap || 2,
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: SliderContent = {
        slides,
        mini_ads: miniAds,
        slider_settings: {
          height: values.slider_height,
          autoplay: values.slider_autoplay,
          autoplay_speed: values.slider_autoplay_speed,
        },
        mini_ad_settings: {
          height: values.mini_ad_height,
          gap: values.mini_ad_gap,
        },
      };
      onSave(newContent);
    });
  };

  const addSlide = () => {
    const newSlide = {
      id: `temp_slide_${Date.now()}`,
      media_id: '',
      link: '#',
      alt: `Slide ${slides.length + 1}`,
      sort_order: slides.length,
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const addMiniAd = () => {
    const newAd = {
      id: `temp_ad_${Date.now()}`,
      media_id: '',
      link: '#',
      alt: `Mini Ad ${miniAds.length + 1}`,
      sort_order: miniAds.length,
    };
    setMiniAds([...miniAds, newAd]);
  };

  const removeMiniAd = (index: number) => {
    setMiniAds(miniAds.filter((_, i) => i !== index));
  };

  const updateMiniAd = (index: number, field: string, value: string) => {
    const updated = [...miniAds];
    updated[index] = { ...updated[index], [field]: value };
    setMiniAds(updated);
  };

  return (
    <Modal
      title="Edit Slider Section"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Title level={5}>Slider Settings</Title>
        <Space>
          <Form.Item label="Height (px)" name="slider_height">
            <InputNumber min={200} max={600} />
          </Form.Item>
          <Form.Item label="Autoplay" name="slider_autoplay" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Autoplay Speed (ms)" name="slider_autoplay_speed">
            <InputNumber min={1000} max={10000} step={1000} />
          </Form.Item>
        </Space>

        <Title level={5} style={{ marginTop: 24 }}>Main Slides</Title>
        <List
          dataSource={slides}
          renderItem={(slide, index) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeSlide(index)}
                />,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Media ID (TODO: Upload integration)"
                  value={slide.media_id}
                  onChange={(e) => updateSlide(index, 'media_id', e.target.value)}
                />
                <Input
                  placeholder="Link URL"
                  value={slide.link}
                  onChange={(e) => updateSlide(index, 'link', e.target.value)}
                />
                <Input
                  placeholder="Alt text"
                  value={slide.alt}
                  onChange={(e) => updateSlide(index, 'alt', e.target.value)}
                />
              </Space>
            </List.Item>
          )}
        />
        <Button
          type="dashed"
          onClick={addSlide}
          icon={<PlusOutlined />}
          style={{ width: '100%', marginBottom: 24 }}
        >
          Add Slide
        </Button>

        <Title level={5}>Mini Ads Settings</Title>
        <Space>
          <Form.Item label="Height (px)" name="mini_ad_height">
            <InputNumber min={100} max={300} />
          </Form.Item>
          <Form.Item label="Gap (px)" name="mini_ad_gap">
            <InputNumber min={0} max={20} />
          </Form.Item>
        </Space>

        <Title level={5} style={{ marginTop: 24 }}>Mini Ads</Title>
        <List
          dataSource={miniAds}
          renderItem={(ad, index) => (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeMiniAd(index)}
                />,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Media ID (TODO: Upload integration)"
                  value={ad.media_id}
                  onChange={(e) => updateMiniAd(index, 'media_id', e.target.value)}
                />
                <Input
                  placeholder="Link URL"
                  value={ad.link}
                  onChange={(e) => updateMiniAd(index, 'link', e.target.value)}
                />
                <Input
                  placeholder="Alt text"
                  value={ad.alt}
                  onChange={(e) => updateMiniAd(index, 'alt', e.target.value)}
                />
              </Space>
            </List.Item>
          )}
        />
        <Button
          type="dashed"
          onClick={addMiniAd}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
        >
          Add Mini Ad
        </Button>

        <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
          Note: Media upload integration will be added. For now, enter media_id manually.
        </Text>
      </Form>
    </Modal>
  );
}
