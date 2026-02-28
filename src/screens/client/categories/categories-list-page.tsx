'use client';

import { useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Spin, Empty, Input, Space, Button, Badge } from 'antd';
import { SearchOutlined, FolderOutlined, DownOutlined, RightOutlined, ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    product_count?: number;
  };
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryImage = ({ imageUrl, name }: { imageUrl?: string; name: string }) => {
  const signedUrl = useSignedImageUrl(imageUrl || '');

  if (!signedUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: 80,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}
      >
        <FolderOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Image src={signedUrl} alt={name} fill style={{ objectFit: 'contain' }} />
    </div>
  );
};

const CategoryItem = ({ category, level, hasChildren, isExpanded, onToggle }: CategoryItemProps) => {
  const { trackView } = useViewTracker();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackView(category.id, 'category');
    window.location.href = `${ROUTES.CATEGORIES}/${category.id}`;
  };

  return (
    <Card 
      hoverable 
      style={{ 
        marginBottom: 12,
        borderLeft: level > 0 ? `4px solid ${level === 1 ? '#1890ff' : level === 2 ? '#52c41a' : '#faad14'}` : 'none',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Col flex="40px">
            <Button
              type="text"
              icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              style={{ padding: '4px 8px' }}
            />
          </Col>
        )}

        {/* Indent Spacing for non-expandable items */}
        {!hasChildren && level > 0 && <Col flex="40px" />}

        {/* Category Image */}
        <Col flex="100px">
          <div style={{ paddingLeft: hasChildren ? 0 : level * 24 }}>
            <CategoryImage imageUrl={category.image} name={category.name} />
          </div>
        </Col>

        {/* Category Info */}
        <Col flex="1">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Title level={level === 0 ? 4 : 5} style={{ margin: 0 }}>
                {category.name}
              </Title>
              <Badge count={category.product_count || 0} style={{ backgroundColor: '#52c41a' }} />
              {level === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <FolderOutlined /> Root
                </Text>
              )}
            </div>
            {category.description && (
              <Text type="secondary" style={{ fontSize: 14 }}>
                {category.description}
              </Text>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

interface CategoryNode {
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    product_count?: number;
    parent_id?: string;
    level: number;
  };
  level: number;
  children: CategoryNode[];
}

export default function CategoriesListPage() {
  const t = useTranslations();
  const { data: categories, isLoading } = useGetPublicCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [manualExpandedKeys, setManualExpandedKeys] = useState<Set<string>>(new Set());

  // Find all category IDs that match search (including their ancestors)
  const getMatchingCategoryIds = useMemo(() => {
    if (!categories) return new Set<string>();
    if (!searchTerm) return new Set(categories.map(c => c.id));

    const matchedIds = new Set<string>();
    const search = searchTerm.toLowerCase();

    // Find direct matches
    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(search)) {
        matchedIds.add(cat.id);
        
        // Add all ancestors
        let parentId = cat.parent_id;
        while (parentId) {
          matchedIds.add(parentId);
          const parent = categories.find(c => c.id === parentId);
          parentId = parent?.parent_id;
        }
        
        // Add all descendants
        const addDescendants = (id: string) => {
          categories.forEach((child) => {
            if (child.parent_id === id) {
              matchedIds.add(child.id);
              addDescendants(child.id);
            }
          });
        };
        addDescendants(cat.id);
      }
    });

    return matchedIds;
  }, [categories, searchTerm]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => getMatchingCategoryIds.has(cat.id));
  }, [categories, getMatchingCategoryIds]);

  // Build hierarchical structure
  const hierarchy = useMemo(() => {
    const rootCategories = filteredCategories.filter((cat) => cat.level === 0);
    
    const buildChildren = (parentId: string, currentLevel: number): CategoryNode[] => {
      const children = filteredCategories.filter(
        (cat) => cat.parent_id === parentId
      );
      
      return children.map((child) => ({
        category: child,
        level: currentLevel,
        children: buildChildren(child.id, currentLevel + 1),
      }));
    };

    return rootCategories.map((root) => ({
      category: root,
      level: 0,
      children: buildChildren(root.id, 1),
    }));
  }, [filteredCategories]);

  // Compute expanded keys - auto-expand when searching, otherwise use manual state
  const expandedKeys = useMemo(() => {
    if (searchTerm) {
      return getMatchingCategoryIds;
    }
    return manualExpandedKeys;
  }, [searchTerm, getMatchingCategoryIds, manualExpandedKeys]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <div>
        <Title level={2}>{t('navigation.categories')}</Title>
        <Empty description="No categories available" />
      </div>
    );
  }

  // Expand/Collapse all
  const handleExpandAll = () => {
    const allIds = new Set(categories.map(c => c.id));
    setManualExpandedKeys(allIds);
  };

  const handleCollapseAll = () => {
    setManualExpandedKeys(new Set());
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(manualExpandedKeys);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setManualExpandedKeys(newExpanded);
  };

  // Render category and its children recursively
  const renderCategoryTree = (node: CategoryNode): React.ReactNode => {
    const { category, level, children } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedKeys.has(category.id);

    return (
      <div key={category.id}>
        <CategoryItem
          category={category}
          level={level}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggle={() => toggleExpand(category.id)}
        />
        {hasChildren && isExpanded && (
          <div style={{ paddingLeft: 24 }}>
            {children.map((child) => renderCategoryTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('navigation.categories')}
      </Title>

      {/* Search & Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <Input
                placeholder={t('common.search')}
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Button
                  icon={<ExpandAltOutlined />}
                  onClick={handleExpandAll}
                  disabled={searchTerm !== ''}
                >
                  Expand All
                </Button>
                <Button
                  icon={<ShrinkOutlined />}
                  onClick={handleCollapseAll}
                  disabled={searchTerm !== ''}
                >
                  Collapse All
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Hierarchical Categories */}
      {hierarchy.length > 0 ? (
        <div>{hierarchy.map((node) => renderCategoryTree(node))}</div>
      ) : (
        <Empty description="No categories found" />
      )}
    </div>
  );
}
