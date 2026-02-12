/**
 * CategoryTreeTable Component
 * Displays categories in tree structure with expand/collapse and inline actions
 */

'use client';

import { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DownOutlined,
  RightOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Category } from '@/types/category';
import { buildTree, type TreeNode } from '@/utils/tree';

interface CategoryTreeTableProps {
  categories: Category[];
  isLoading?: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentCategory: Category) => void;
  isDeleting?: boolean;
  canDelete?: boolean;
}

interface FlattenedCategory extends Category {
  level: number;
  hasChildren: boolean;
  parentKey?: string;
}

export const CategoryTreeTable = ({
  categories,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onAddChild,
  isDeleting,
  canDelete = true,
}: CategoryTreeTableProps) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Debug log
  console.log('[CategoryTreeTable] canDelete prop:', canDelete);

  /**
   * Build tree and flatten for table display
   */
  const flattenedData = useMemo(() => {
    const tree = buildTree<Category>(categories, {
      sortBy: 'sort_order',
    });

    const flattened: FlattenedCategory[] = [];

    const traverse = (nodes: TreeNode<Category>[], level: number, parentKey?: string) => {
      nodes.forEach((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedKeys.has(node.key);

        flattened.push({
          ...node.data,
          level,
          hasChildren: hasChildren || false,
          parentKey,
        });

        // Add children if expanded
        if (hasChildren && isExpanded) {
          traverse(node.children!, level + 1, node.key);
        }
      });
    };

    traverse(tree, 0);
    return flattened;
  }, [categories, expandedKeys]);

  /**
   * Toggle expand/collapse
   */
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  /**
   * Expand all nodes
   */
  const expandAll = () => {
    const allKeys = new Set(categories.map((cat) => cat.id));
    setExpandedKeys(allKeys);
  };

  /**
   * Collapse all nodes
   */
  const collapseAll = () => {
    setExpandedKeys(new Set());
  };

  const columns: ColumnsType<FlattenedCategory> = [
    {
      title: (
        <Space>
          <span>Name</span>
          <Space size="small">
            <Button type="link" size="small" onClick={expandAll}>
              Expand All
            </Button>
            <Button type="link" size="small" onClick={collapseAll}>
              Collapse All
            </Button>
          </Space>
        </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FlattenedCategory) => {
        const indent = record.level * 24; // 24px per level

        return (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: indent }}>
            {record.hasChildren ? (
              <Button
                type="text"
                size="small"
                icon={
                  expandedKeys.has(record.id) ? (
                    <DownOutlined style={{ fontSize: 12 }} />
                  ) : (
                    <RightOutlined style={{ fontSize: 12 }} />
                  )
                }
                onClick={() => toggleExpand(record.id)}
                style={{ marginRight: 8, padding: 0, width: 24, height: 24 }}
              />
            ) : (
              <span style={{ width: 24, marginRight: 8, display: 'inline-block' }} />
            )}
            <strong>{name}</strong>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (value: boolean) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record: FlattenedCategory) => (
        <Space size="small">
          <Tooltip title="Add child category">
            <Button
              type="default"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onAddChild(record)}
            />
          </Tooltip>
          <Tooltip title="View details">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          {canDelete && (
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={isDeleting}
                onClick={() => {
                  console.log('[CategoryTreeTable] Delete button clicked:', record);
                  onDelete(record);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<FlattenedCategory>
      rowKey="id"
      loading={isLoading}
      columns={columns}
      dataSource={flattenedData}
      pagination={false}
      bordered
    />
  );
};
