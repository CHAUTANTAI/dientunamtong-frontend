'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Space, Typography, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { VideoSectionContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface VideoSectionEditModalProps {
  open: boolean;
  onClose: () => void;
  content: VideoSectionContent;
  onSave: (content: VideoSectionContent) => void;
}

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  sort_order: number;
}

/**
 * VideoSectionEditModal
 * 
 * Allows admin to manage video section:
 * - Title
 * - Add/Remove videos
 * - Reorder videos
 * - Edit video details (title, URL, thumbnail, duration)
 * - Layout mode (carousel/grid)
 */
export default function VideoSectionEditModal({
  open,
  onClose,
  content,
  onSave,
}: VideoSectionEditModalProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoFormVisible, setVideoFormVisible] = useState(false);
  const [form] = Form.useForm();
  const [titleForm] = Form.useForm();

  useEffect(() => {
    if (open) {
      setVideos(content?.videos || []);
      setEditingVideo(null);
      setVideoFormVisible(false);
      
      titleForm.setFieldsValue({
        title: content?.title || 'Video',
        layout_mode: content?.layout_mode || 'carousel',
      });
    }
  }, [open, content, titleForm]);

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
          ? {
              ...video,
              title: values.title,
              url: values.url,
              thumbnail: values.thumbnail || undefined,
              duration: values.duration || undefined,
            }
          : video
      );

      setVideos(updatedVideos);
      form.resetFields();
      setEditingVideo(null);
      setVideoFormVisible(false);
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    const filteredVideos = videos.filter(video => video.id !== videoId);
    // Re-index sort_order
    const reindexed = filteredVideos.map((video, index) => ({
      ...video,
      sort_order: index,
    }));
    setVideos(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newVideos = [...videos];
    [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
    // Update sort_order
    newVideos.forEach((video, idx) => {
      video.sort_order = idx;
    });
    setVideos(newVideos);
  };

  const handleMoveDown = (index: number) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    // Update sort_order
    newVideos.forEach((video, idx) => {
      video.sort_order = idx;
    });
    setVideos(newVideos);
  };

  const handleSave = () => {
    titleForm.validateFields().then((values) => {
      const newContent: VideoSectionContent = {
        title: values.title,
        videos: videos,
        layout_mode: values.layout_mode,
      };
      onSave(newContent);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingVideo(null);
    setVideoFormVisible(false);
  };

  return (
    <Modal
      title="Edit Video Section"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Section Settings */}
        <div>
          <Text strong>Section Settings</Text>
          <Form form={titleForm} layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="e.g., Video" />
            </Form.Item>

            <Form.Item
              name="layout_mode"
              label="Layout Mode"
            >
              <Radio.Group>
                <Radio value="carousel">Carousel</Radio>
                <Radio value="grid">Grid</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>

        {/* Videos List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>Videos ({videos.length})</Text>
            {!videoFormVisible && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingVideo(null);
                  setVideoFormVisible(true);
                }}
              >
                Add Video
              </Button>
            )}
          </div>

          {/* Add/Edit Form */}
          {videoFormVisible && (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label="Video Title"
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input placeholder="e.g., Product Installation Guide" />
                </Form.Item>

                <Form.Item
                  name="url"
                  label="Video URL"
                  rules={[
                    { required: true, message: 'Please enter URL' },
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                  extra="YouTube, Vimeo, or direct video URL"
                >
                  <Input placeholder="https://www.youtube.com/watch?v=..." />
                </Form.Item>

                <Form.Item
                  name="thumbnail"
                  label="Thumbnail URL (Optional)"
                  rules={[
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                >
                  <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label="Duration (Optional)"
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
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </div>
          )}

          {/* Videos List */}
          {videos.length > 0 ? (
            <List
              dataSource={videos}
              renderItem={(video, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="up"
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    />,
                    <Button
                      key="down"
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={index === videos.length - 1}
                      onClick={() => handleMoveDown(index)}
                    />,
                    <Button
                      key="edit"
                      type="link"
                      onClick={() => handleEditVideo(video)}
                    >
                      Edit
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteVideo(video.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={video.title}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary">URL: {video.url}</Text>
                        {video.duration && <Text type="secondary">Duration: {video.duration}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No videos yet. Click "Add Video" to start.</Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}
