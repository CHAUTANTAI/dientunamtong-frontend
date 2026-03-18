'use client';

import { useEffect } from 'react';
import { Form, Input, Typography } from 'antd';
import type { SearchSloganContent } from '@/types/pageSection';
import { useDebounce } from '@/hooks/useDebounce';

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

  // Get current form values with debounce
  const formValues = Form.useWatch([], form) || {};
  const debouncedFormValues = useDebounce(formValues, 500);

  // Handle debounced changes (avoid infinite loop with deep comparison)
  useEffect(() => {
    if (Object.keys(debouncedFormValues).length > 0) {
      const newSloganText = debouncedFormValues.slogan_text || '';
      
      // Only call onChange if value actually changed
      if (newSloganText !== (content?.slogan_text || '')) {
        onChange({ slogan_text: newSloganText });
      }
    }
  }, [debouncedFormValues, content?.slogan_text, onChange]);

  const charCount = form.getFieldValue('slogan_text')?.length || 0;

  return (
    <Form
      form={form}
      layout="vertical"
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
          placeholder="Enter your slogan text here..."
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
