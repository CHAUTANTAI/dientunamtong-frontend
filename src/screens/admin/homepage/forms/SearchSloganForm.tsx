'use client';

import { useEffect } from 'react';
import { Form, Input, Typography } from 'antd';
import type { SearchSloganContent } from '@/types/pageSection';

const { Text, Paragraph } = Typography;

interface SearchSloganFormProps {
  content: SearchSloganContent;
  onChange: (content: SearchSloganContent) => void;
  form: ReturnType<typeof Form.useForm<Record<string, string>>>[0];
}

/**
 * SearchSloganForm - Inline form for editing Search Slogan
 */
export default function SearchSloganForm({
  content,
  onChange,
  form,
}: SearchSloganFormProps) {
  
  useEffect(() => {
    form.setFieldsValue({
      slogan_text: content?.slogan_text || '',
    });
  }, [content, form]);

  const handleValuesChange = (_: unknown, allValues: Record<string, string>) => {
    onChange({ slogan_text: allValues.slogan_text || '' });
  };

  const charCount = form.getFieldValue('slogan_text')?.length || 0;

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Text strong>Marquee Slogan Text</Text>
      <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 8 }}>
        This text will scroll continuously in the search bar area
      </Paragraph>
      
      <Form.Item
        name="slogan_text"
        rules={[
          { required: true, message: 'Slogan text is required' },
          { max: 500, message: 'Maximum 500 characters' }
        ]}
        style={{ marginBottom: 8 }}
      >
        <Input.TextArea
          placeholder="e.g., Chuyên cung cấp phụ tùng, đồ chơi xe máy chính hãng..."
          rows={3}
          maxLength={500}
          showCount={{
            formatter: ({ count }) => `${count}/500 characters`
          }}
        />
      </Form.Item>

      {/* Live Preview */}
      {charCount > 0 && (
        <div style={{ 
          marginTop: 12,
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Preview:</Text>
          <div style={{ 
            marginTop: 4,
            whiteSpace: 'nowrap',
            animation: 'marquee 20s linear infinite'
          }}>
            <Text>{form.getFieldValue('slogan_text')}</Text>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </Form>
  );
}
