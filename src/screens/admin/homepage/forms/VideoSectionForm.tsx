'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, List, Space, Typography, Card, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import type { VideoSectionContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';

const { Text } = Typography;

interface VideoSectionFormProps {
  content: VideoSectionContent;
  onChange: (content: VideoSectionContent) => void;
}

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: MediaValue;
  duration?: string;
  sort_order: number;
}

/**
 * VideoSectionForm - Inline form for managing video items
 */
export default function VideoSectionForm({ content, onChange }: VideoSectionFormProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [layoutMode, setLayoutMode] = useState<'carousel' | 'grid'>('carousel');
  const [sectionTitle, setSectionTitle] = useState('Video');
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoFormVisible, setVideoFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setVideos(content?.videos || []);
    setLayoutMode(content?.layout_mode || 'carousel');
    setSectionTitle(content?.title || 'Video');
  }, [content]);

  useEffect(() => {
    // Avoid infinite loop with deep comparison
    const currentState = JSON.stringify({ videos, layoutMode, sectionTitle });
    const contentState = JSON.stringify({
      videos: content?.videos || [],
      layoutMode: content?.layout_mode || 'carousel',
      sectionTitle: content?.title || 'Video',
    });
    
    if (currentState !== contentState) {
      onChange({
        title: sectionTitle,
        videos: videos as unknown as VideoSectionContent['videos'],
        layout_mode: layoutMode,
      });
    }
  }, [videos, layoutMode, sectionTitle, onChange]);

  const handleAddVideo = () => {
    form.validateFields().then((values) => {
      const newVideo: VideoItem = {
        id: uuidv4(),
        title: values.title,
        url: values.url,
        thumbnail: values.thumbnail || undefined,
        duration: values.duration || undefined,
        sort_order: videos.length,
      };

      setVideos([...videos, newVideo]);
      form.resetFields();
      setVideoFormVisible(false);
    });
  };

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail || '',
      duration: video.duration || '',
    });
    setVideoFormVisible(true);
  };

  const handleUpdateVideo = () => {
    if (!editingVideo) return;

    form.validateFields().then((values) => {
      const updatedVideos = videos.map(video =>
        video.id === editingVideo.id
          ? { ...video, ...values }
          : video
      );
      setVideos(updatedVideos);
      form.resetFields();
      setEditingVideo(null);
      setVideoFormVisible(false);
    });
  };

  const handleDeleteVideo = (id: string) => {
    const filtered = videos.filter(video => video.id !== id);
    const reordered = filtered.map((video, index) => ({ ...video, sort_order: index }));
    setVideos(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newVideos = [...videos];
    [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
    const reordered = newVideos.map((video, idx) => ({ ...video, sort_order: idx }));
    setVideos(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    const reordered = newVideos.map((video, idx) => ({ ...video, sort_order: idx }));
    setVideos(reordered);
  };

  const handleCancelForm = () => {
    form.resetFields();
    setEditingVideo(null);
    setVideoFormVisible(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Section Title */}
      <div>
        <Text strong>Section Title</Text>
        <Input
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="e.g., Video clips"
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Layout Mode */}
      <div>
        <Text strong>Layout Mode</Text>
        <Select
          value={layoutMode}
          onChange={setLayoutMode}
          style={{ width: '100%', marginTop: 8 }}
        >
          <Select.Option value="carousel">Carousel (Scrollable)</Select.Option>
          <Select.Option value="grid">Grid Layout</Select.Option>
        </Select>
      </div>

      {/* Add/Edit Video Form */}
      {videoFormVisible ? (
        <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Video Title"
              rules={[{ required: true, message: 'Title is required' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="e.g., Mạch Stop Fi nhấp nháy đèn hậu" />
            </Form.Item>

            <Form.Item
              name="url"
              label="Video URL"
              rules={[
                { required: true, message: 'URL is required' },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="https://youtube.com/watch?v=..." />
            </Form.Item>

            <Form.Item
              name="thumbnail"
              label="Thumbnail Image"
              style={{ marginBottom: 12 }}
            >
              <MediaUpload
                folder="homepage/video-thumbnails"
                accept="image/*"
                maxSizeMB={2}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (optional)"
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="e.g., 5:30" />
            </Form.Item>

            <Space>
              <Button 
                type="primary" 
                onClick={editingVideo ? handleUpdateVideo : handleAddVideo}
              >
                {editingVideo ? 'Update' : 'Add'}
              </Button>
              <Button onClick={handleCancelForm}>Cancel</Button>
            </Space>
          </Form>
        </Card>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setVideoFormVisible(true)}
          block
        >
          Add Video
        </Button>
      )}

      {/* Videos List */}
      <List
        dataSource={videos}
        locale={{ emptyText: 'No videos. Click "Add Video" to create one.' }}
        renderItem={(video, index) => (
          <List.Item
            actions={[
              <Button
                key="up"
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
              />,
              <Button
                key="down"
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === videos.length - 1}
                onClick={() => handleMoveDown(index)}
              />,
              <Button
                key="edit"
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditVideo(video)}
              />,
              <Button
                key="delete"
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteVideo(video.id)}
              />,
            ]}
          >
            <List.Item.Meta
              title={<Text strong>{video.title}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{video.url}</Text>
                  {video.duration && <Text type="secondary" style={{ fontSize: 12 }}>Duration: {video.duration}</Text>}
                </Space>
              }
            />
          </List.Item>
        )}
        bordered
      />
    </Space>
  );
}
