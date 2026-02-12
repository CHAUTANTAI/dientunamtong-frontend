'use client';

/**
 * EntityFormSkeleton
 * Common skeleton for forms that depend on an init API call.
 * Uses Ant Design Skeleton components to mimic labels, inputs and actions.
 */

import { Skeleton, Space } from 'antd';

interface EntityFormSkeletonProps {
  fieldCount?: number;
  /**
   * Show a placeholder area for an image / preview block.
   */
  showImage?: boolean;
  /**
   * Show action button skeletons (e.g. Save / Cancel).
   */
  showActions?: boolean;
}

export const EntityFormSkeleton = ({
  fieldCount = 4,
  showImage = false,
  showActions = true,
}: EntityFormSkeletonProps) => {
  const fields = Array.from({ length: fieldCount });

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {fields.map((_, index) => (
         
        <div key={index}>
          <Skeleton.Input style={{ width: 120, marginBottom: 8 }} active size="small" />
          <Skeleton.Input block active />
        </div>
      ))}

      {showImage && (
        <div>
          <Skeleton.Input style={{ width: 160, marginBottom: 8 }} active size="small" />
          <Skeleton.Image
            style={{ width: 200, height: 200, borderRadius: 4 }}
            active
          />
        </div>
      )}

      {showActions && (
        <Space style={{ marginTop: 8 }}>
          <Skeleton.Button active />
          <Skeleton.Button active />
        </Space>
      )}
    </Space>
  );
};

