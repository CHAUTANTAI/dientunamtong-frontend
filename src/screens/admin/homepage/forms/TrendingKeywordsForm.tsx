'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Switch, Button, Space, Typography, List, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TrendingKeywordsContent } from '@/types/pageSection';

const { Text } = Typography;

interface TrendingKeywordsFormProps {
  content: TrendingKeywordsContent;
  onChange: (content: TrendingKeywordsContent) => void;
}

interface Keyword {
  id: string;
  text: string;
  link: string;
  sort_order: number;
}

/**
 * TrendingKeywordsForm - Inline form for Trending Keywords
 */
export default function TrendingKeywordsForm({ content, onChange }: TrendingKeywordsFormProps) {
  const [title, setTitle] = useState('Xu hướng tìm kiếm:');
  const [showIcon, setShowIcon] = useState(true);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeywordText, setNewKeywordText] = useState('');
  const [newKeywordLink, setNewKeywordLink] = useState('');

  useEffect(() => {
    setTitle(content?.title || 'Xu hướng tìm kiếm:');
    setShowIcon(content?.show_icon ?? true);
    setKeywords(content?.keywords || []);
  }, [content]);

  useEffect(() => {
    // Avoid infinite loop with deep comparison
    const currentState = JSON.stringify({ title, showIcon, keywords });
    const contentState = JSON.stringify({
      title: content?.title || 'Xu hướng tìm kiếm:',
      showIcon: content?.show_icon ?? true,
      keywords: content?.keywords || [],
    });
    
    if (currentState !== contentState) {
      onChange({
        title,
        show_icon: showIcon,
        keywords,
      });
    }
  }, [title, showIcon, keywords, onChange]);

  const handleAddKeyword = () => {
    if (!newKeywordText.trim()) return;

    const newKeyword: Keyword = {
      id: `keyword_${Date.now()}`,
      text: newKeywordText.trim(),
      link: newKeywordLink.trim() || '#',
      sort_order: keywords.length,
    };

    setKeywords([...keywords, newKeyword]);
    setNewKeywordText('');
    setNewKeywordLink('');
  };

  const handleDeleteKeyword = (id: string) => {
    const filtered = keywords.filter(k => k.id !== id);
    const reordered = filtered.map((k, index) => ({ ...k, sort_order: index }));
    setKeywords(reordered);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Section Title */}
      <div>
        <Text strong>Section Title</Text>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Xu hướng tìm kiếm:"
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Show Icon */}
      <div>
        <Space>
          <Text strong>Show Icon</Text>
          <Switch
            checked={showIcon}
            onChange={setShowIcon}
          />
        </Space>
      </div>

      {/* Add Keyword Form */}
      <Card size="small" title="Add New Keyword">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Keyword text (e.g., Đèn LED)"
            value={newKeywordText}
            onChange={(e) => setNewKeywordText(e.target.value)}
            onPressEnter={handleAddKeyword}
          />
          <Input
            placeholder="Link URL (optional, default: #)"
            value={newKeywordLink}
            onChange={(e) => setNewKeywordLink(e.target.value)}
            onPressEnter={handleAddKeyword}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddKeyword}
            disabled={!newKeywordText.trim()}
            block
          >
            Add Keyword
          </Button>
        </Space>
      </Card>

      {/* Keywords List */}
      <div>
        <Text strong>Keywords ({keywords.length})</Text>
        {keywords.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#fafafa', marginTop: 8, borderRadius: 4 }}>
            <Text type="secondary">No keywords. Add some keywords above.</Text>
          </div>
        ) : (
          <List
            dataSource={keywords}
            renderItem={(keyword) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteKeyword(keyword.id)}
                  />,
                ]}
                style={{ padding: '8px 0' }}
              >
                <List.Item.Meta
                  title={<Text>{keyword.text}</Text>}
                  description={<Text type="secondary" style={{ fontSize: 12 }}>{keyword.link}</Text>}
                />
              </List.Item>
            )}
            style={{ marginTop: 8 }}
            bordered
          />
        )}
      </div>
    </Space>
  );
}
