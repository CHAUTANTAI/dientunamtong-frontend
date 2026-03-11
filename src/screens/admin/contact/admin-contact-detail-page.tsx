/**
 * Admin Contact Detail Page
 * View and manage individual contact submission
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Descriptions, Tag, Button, Space, Select, App, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  useGetContactByIdQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
  ContactStatus,
} from '@/store/api/contactApi';

export default function AdminContactDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { message, modal } = App.useApp();
  const contactId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<ContactStatus | undefined>();

  // Fetch contact details
  const { data: contact, isLoading } = useGetContactByIdQuery(contactId, {
    skip: !contactId,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateContactStatusMutation();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  // Set initial status when contact is loaded
  if (contact && !selectedStatus) {
    setSelectedStatus(contact.status);
  }

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === contact?.status) {
      return;
    }

    try {
      await updateStatus({ id: contactId, status: selectedStatus }).unwrap();
      message.success(t('adminContact.actions.updateSuccess'));
    } catch {
      message.error(t('adminContact.actions.updateFailed'));
    }
  };

  // Handle delete contact
  const handleDelete = () => {
    modal.confirm({
      title: t('adminContact.actions.confirmDelete'),
      content: `${t('adminContact.table.name')}: ${contact?.name}`,
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteContact(contactId).unwrap();
          message.success(t('adminContact.actions.deleteSuccess'));
          router.push('/admin/contact');
        } catch {
          message.error(t('adminContact.actions.deleteFailed'));
        }
      },
    });
  };

  // Get status tag color
  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.NEW:
        return 'blue';
      case ContactStatus.PROCESSING:
        return 'orange';
      case ContactStatus.COMPLETED:
        return 'green';
      case ContactStatus.CANCELLED:
        return 'red';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contact) {
    return (
      <Card>
        <p>{t('adminContact.list.noContacts')}</p>
        <Button type="primary" onClick={() => router.push('/admin/contact')}>
          <ArrowLeftOutlined /> {t('common.back')}
        </Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/contact')}>
            {t('common.back')}
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={isDeleting}
          >
            {t('adminContact.details.deleteContact')}
          </Button>
        </Space>
      </div>

      {/* Contact Details */}
      <Card
        title={t('adminContact.details.title')}
        style={{ marginBottom: 24 }}
      >
        <Descriptions 
          bordered 
          column={2}
          styles={{ 
            label: { width: '180px', fontWeight: 500 } 
          }}
        >
          {/* Row 1: Name | Email */}
          <Descriptions.Item label={t('adminContact.details.name')}>
            <strong>{contact.name}</strong>
          </Descriptions.Item>

          <Descriptions.Item label={t('adminContact.details.email')}>
            <div style={{ wordBreak: 'break-word' }}>{contact.email || '-'}</div>
          </Descriptions.Item>

          {/* Row 2: Phone | Address */}
          <Descriptions.Item label={t('adminContact.details.phone')}>
            {contact.phone}
          </Descriptions.Item>

          <Descriptions.Item label={t('adminContact.details.address')}>
            <div style={{ wordBreak: 'break-word' }}>{contact.address || '-'}</div>
          </Descriptions.Item>

          {/* Row 3: Status | Created At */}
          <Descriptions.Item label={t('adminContact.details.status')}>
            <Tag color={getStatusColor(contact.status)}>
              {t(`adminContact.status.${contact.status}`)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label={t('adminContact.details.createdAt')}>
            {new Date(contact.created_at).toLocaleString()}
          </Descriptions.Item>

          {/* Row 4: Product | Updated At */}
          <Descriptions.Item label={t('adminContact.details.product')}>
            {contact.product ? (
              <Link
                href={`/products/${contact.product.id}`}
                target="_blank"
                style={{ color: '#1890ff', wordBreak: 'break-word' }}
              >
                {contact.product.name}
              </Link>
            ) : (
              '-'
            )}
          </Descriptions.Item>

          <Descriptions.Item label={t('adminContact.details.updatedAt')}>
            {new Date(contact.updated_at).toLocaleString()}
          </Descriptions.Item>

          {/* Row 5: Message - full width at the end */}
          <Descriptions.Item label={t('adminContact.details.message')} span={2}>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>
              {contact.message || '-'}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Update Status */}
      <Card title={t('adminContact.details.updateStatus')}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%', maxWidth: 300 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              {
                label: t('adminContact.status.new'),
                value: ContactStatus.NEW,
              },
              {
                label: t('adminContact.status.processing'),
                value: ContactStatus.PROCESSING,
              },
              {
                label: t('adminContact.status.completed'),
                value: ContactStatus.COMPLETED,
              },
              {
                label: t('adminContact.status.cancelled'),
                value: ContactStatus.CANCELLED,
              },
            ]}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleUpdateStatus}
            loading={isUpdating}
            disabled={!selectedStatus || selectedStatus === contact.status}
          >
            {t('common.save')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
