'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography } from 'antd';
import type { SearchSloganContent } from '@/types/pageSection';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SearchSloganEditModalProps {
  open: boolean;
  onClose: () => void;
  content: SearchSloganContent;
  onSave: (content: SearchSloganContent) => void;
}

/**
 * SearchSloganEditModal
 * 
 * Allows admin to edit the marquee slogan text that appears below the search bar
 */
export default function SearchSloganEditModal({
  open,
  onClose,
  content,
  onSave,
}: SearchSloganEditModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        slogan_text: content?.slogan_text || '',
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: SearchSloganContent = {
        slogan_text: values.slogan_text,
      };

      onSave(newContent);
    });
  };

  return (
    <Modal
      title="Edit Search Slogan"
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="slogan_text"
          label="Slogan Text"
          rules={[
            { required: true, message: 'Please enter slogan text' },
            { min: 10, message: 'Slogan should be at least 10 characters' },
          ]}
          extra="This text will scroll (marquee) horizontally below the search bar."
        >
          <TextArea
            rows={4}
            placeholder="Enter your slogan text here..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Preview */}
        <div style={{ marginTop: 16 }}>
          <Text strong>Preview:</Text>
          <div
            style={{
              marginTop: 8,
              padding: '12px 16px',
              background: '#f5f5f5',
              borderRadius: 4,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                animation: 'marquee 15s linear infinite',
              }}
            >
              <Text>{form.getFieldValue('slogan_text') || 'Your slogan will appear here...'}</Text>
            </div>
          </div>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
            Note: The actual marquee animation will appear on the live site.
          </Paragraph>
        </div>

        <style jsx global>{`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}</style>
      </Form>
    </Modal>
  );
}
