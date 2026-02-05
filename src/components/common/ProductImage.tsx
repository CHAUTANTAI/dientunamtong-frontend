'use client';

/**
 * ProductImage Component
 * Wrapper for Antd Image that handles signed URLs from Supabase Storage.
 * While the signed URL or image is loading, it shows an Ant Design Skeleton.Image
 * so that the layout doesn't jump.
 */

import { useState } from 'react';
import { Image, Skeleton } from 'antd';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import type { ImageProps } from 'antd';

interface ProductImageProps extends Omit<ImageProps, 'src'> {
  imageUrl: string | null | undefined;
  alt: string;
}

export const ProductImage = ({ imageUrl, alt, ...imageProps }: ProductImageProps) => {
  const signedUrl = useSignedImageUrl(imageUrl);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!imageUrl) return null;

  const { width, height, style } = imageProps;
  const skeletonStyle: React.CSSProperties = {
    width: typeof width === 'number' ? width : width ?? 200,
    height: typeof height === 'number' ? height : height ?? 200,
    borderRadius: style?.borderRadius ?? 4,
  };

  return (
    <>
      {!isLoaded && (
        <Skeleton.Image
          style={skeletonStyle}
          active
        />
      )}
      {signedUrl && (
        <Image
          src={signedUrl}
          alt={alt}
          {...imageProps}
          style={{
            ...(style || {}),
            display: isLoaded ? 'block' : 'none',
          }}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </>
  );
};
