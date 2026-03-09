'use client';

import { Modal, Form, Input, Button } from 'antd';
import { useTranslations } from 'next-intl';
import type { RightContentBoxContent } from '@/types/pageSection';
import { useEffect } from 'react';

const { TextArea } = Input;

interface RightContentBoxEditModalProps {
  open: boolean;
  onClose: () => void;
  content: RightContentBoxContent;
  onSave: (content: RightContentBoxContent) => void;
}

export default function RightContentBoxEditModal({ 
  open, 
  onClose, 
  content, 
  onSave 
}: RightContentBoxEditModalProps) {
  const t = useTranslations('homepageEditor.rightContentBox.modal');
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: content?.title || '',
        subtitle: content?.subtitle || '',
        text: content?.text || '',
      });
    }
  }, [open, content, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSave({
        title: values.title,
        subtitle: values.subtitle,
        text: values.text,
      });
    });
  };

  return (
    <Modal
      title={t('title')}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          OK
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label={t('titleLabel')}
          name="title"
        >
          <Input
            placeholder={t('titlePlaceholder')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={t('subtitleLabel')}
          name="subtitle"
        >
          <Input
            placeholder={t('subtitlePlaceholder')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={t('textLabel')}
          name="text"
          rules={[
            { required: true, message: t('textRequired') },
          ]}
        >
          <TextArea
            placeholder={t('textPlaceholder')}
            rows={10}
            size="large"
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
