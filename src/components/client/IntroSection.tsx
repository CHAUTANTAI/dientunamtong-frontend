'use client';

import { Card, Typography } from 'antd';
import type { IntroContent } from '@/types/pageSection';

const { Title, Paragraph } = Typography;

interface IntroSectionProps {
  content: IntroContent;
}

export default function IntroSection({ content }: IntroSectionProps) {
  if (!content.text) return null;

  return (
    <Card
      style={{
        margin: '24px 0',
        borderRadius: 8,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
      styles={{ body: { padding: '32px' } }}
    >
      {content.title && (
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          {content.title}
        </Title>
      )}
      
      {content.subtitle && (
        <Paragraph
          style={{
            textAlign: 'center',
            fontSize: 16,
            color: '#666',
            marginBottom: 24,
          }}
        >
          {content.subtitle}
        </Paragraph>
      )}
      
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: '#333',
        }}
        dangerouslySetInnerHTML={{ __html: content.text }}
      />
    </Card>
  );
}
