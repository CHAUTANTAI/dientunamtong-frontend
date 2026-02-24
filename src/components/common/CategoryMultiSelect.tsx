/**
 * CategoryMultiSelect Component
 * Tree select for multiple categories selection
 */

'use client';

import { useMemo } from 'react';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { DataNode } from 'antd/es/tree';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { buildTree, type TreeNode } from '@/utils/tree';

interface CategoryMultiSelectProps extends Omit<TreeSelectProps, 'treeData' | 'multiple'> {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CategoryMultiSelect = ({
  value,
  onChange,
  placeholder = 'Select categories',
  disabled = false,
  ...restProps
}: CategoryMultiSelectProps) => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  /**
   * Build tree data for TreeSelect
   */
  const treeData = useMemo(() => {
    if (!categories.length) return [];

    // Build tree structure sorted by name
    const tree = buildTree<Category>(categories, {
      sortBy: 'name',
    });

    /**
     * Convert tree nodes to TreeSelect format
     */
    const convertToTreeSelectData = (
      nodes: TreeNode<Category>[],
      parentPath: string[] = []
    ): DataNode[] => {
      return nodes.map((node) => {
        const currentPath = [...parentPath, node.data.name];
        return {
          title: node.data.name,
          value: node.key,
          key: node.key,
          // Store full path in custom property for later use
          fullPath: currentPath,
          children:
            node.children && node.children.length > 0
              ? convertToTreeSelectData(node.children, currentPath)
              : undefined,
        };
      });
    };

    return convertToTreeSelectData(tree);
  }, [categories]);

  /**
   * Build a map of category ID to full path (breadcrumb)
   */
  const categoryPathMap = useMemo(() => {
    const map = new Map<string, string>();
    const buildMap = (nodes: DataNode[]) => {
      nodes.forEach((node) => {
        if (node.key && (node as DataNode & { fullPath?: string[] }).fullPath) {
          const fullPath = (node as DataNode & { fullPath?: string[] }).fullPath!;
          map.set(node.key as string, fullPath.join(' > '));
        }
        if (node.children) buildMap(node.children);
      });
    };
    buildMap(treeData);
    return map;
  }, [treeData]);

  /**
   * Get all valid category IDs from tree data
   */
  const validCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    const collectIds = (nodes: DataNode[]) => {
      nodes.forEach((node) => {
        if (node.key) ids.add(node.key as string);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(treeData);
    return ids;
  }, [treeData]);

  /**
   * Filter out invalid category IDs from value
   */
  const validValue = useMemo(() => {
    if (!value || !value.length) return value;
    return value.filter((id) => validCategoryIds.has(id));
  }, [value, validCategoryIds]);

  /**
   * Handle change
   */
  const handleChange = (newValue: string[]) => {
    onChange?.(newValue || []);
  };

  return (
    <TreeSelect
      value={validValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      loading={isLoading}
      showSearch
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      treeDefaultExpandAll
      treeNodeFilterProp="title"
      treeData={treeData}
      style={{ width: '100%' }}
      maxTagCount="responsive"
      tagRender={(props) => {
        const { label, value: tagValue, closable, onClose } = props;
        const fullPath = categoryPathMap.get(tagValue as string);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 7px',
              marginRight: 4,
              background: '#f0f0f0',
              border: '1px solid #d9d9d9',
              borderRadius: 2,
              fontSize: 12,
            }}
          >
            <span>{fullPath || label}</span>
            {closable && (
              <span
                onClick={onClose}
                style={{
                  marginLeft: 4,
                  cursor: 'pointer',
                  fontSize: 10,
                  opacity: 0.6,
                }}
              >
                ✕
              </span>
            )}
          </span>
        );
      }}
      {...restProps}
    />
  );
};

CategoryMultiSelect.displayName = 'CategoryMultiSelect';
