/**
 * Admin Contact Page
 * Displays list of all contact submissions from customers
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, App } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetContactsQuery,
  useDeleteContactMutation,
  ContactStatus,
  type Contact,
} from '@/store/api/contactApi';

export default function AdminContactPage() {
  const t = useTranslations();
  const router = useRouter();
  const { message, modal } = App.useApp();

  const [statusFilter, setStatusFilter] = useState<ContactStatus | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch contacts
  const { data: contacts = [], isLoading } = useGetContactsQuery({ status: statusFilter });
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  // Handle delete contact
  const handleDelete = (id: string, name: string) => {
    modal.confirm({
      title: t('adminContact.actions.confirmDelete'),
      content: `${t('adminContact.table.name')}: ${name}`,
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteContact(id).unwrap();
          message.success(t('adminContact.actions.deleteSuccess'));
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

  // Table columns
  const columns: ColumnsType<Contact> = [
    {
      title: t('adminContact.table.name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: Contact) => (
        <Link href={`/admin/contact/${record.id}`} style={{ color: '#1890ff', fontWeight: 500 }}>
          {name}
        </Link>
      ),
    },
    {
      title: t('adminContact.table.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      responsive: ['md'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
      render: (email?: string) => email || '-',
    },
    {
      title: t('adminContact.table.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: t('adminContact.table.product'),
      dataIndex: 'product',
      key: 'product',
      width: 180,
      responsive: ['lg'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
      render: (product?: { id: string; name: string; slug: string }) =>
        product ? (
          <Link href={`/products/${product.id}`} target="_blank" style={{ color: '#1890ff' }}>
            {product.name}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      title: t('adminContact.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ContactStatus) => (
        <Tag color={getStatusColor(status)}>{t(`adminContact.status.${status}`)}</Tag>
      ),
    },
    {
      title: t('adminContact.table.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      responsive: ['lg'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('adminContact.table.actions'),
      key: 'actions',
      width: isMobile ? 80 : 120,
      render: (_, record: Contact) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/admin/contact/${record.id}`)}
          >
            {!isMobile && t('common.view')}
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.name)}
            loading={isDeleting}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder={t('adminContact.status.filterAll')}
            style={{ width: 200 }}
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { label: t('adminContact.status.filterAll'), value: undefined },
              { label: t('adminContact.status.filterNew'), value: ContactStatus.NEW },
              { label: t('adminContact.status.filterProcessing'), value: ContactStatus.PROCESSING },
              { label: t('adminContact.status.filterCompleted'), value: ContactStatus.COMPLETED },
              { label: t('adminContact.status.filterCancelled'), value: ContactStatus.CANCELLED },
            ]}
          />
        </Space>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={contacts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${t('common.all')}: ${total}`,
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: t('adminContact.list.noContacts'),
          }}
        />
      </div>
    </div>
  );
}
