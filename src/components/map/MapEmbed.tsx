'use client';

interface MapEmbedProps {
  embedCode: string;
  height?: number;
}

export default function MapEmbed({ embedCode, height = 300 }: MapEmbedProps) {
  // Extract iframe from embed code and modify its attributes
  const getModifiedIframe = (code: string) => {
    const iframeMatch = code.match(/<iframe[^>]*>.*?<\/iframe>/i);
    const iframe = iframeMatch ? iframeMatch[0] : code;
    
    // Remove width and height attributes, add style for full width
    const modifiedIframe = iframe
      .replace(/width="[^"]*"/gi, '')
      .replace(/height="[^"]*"/gi, '')
      .replace(/<iframe/i, `<iframe style="width: 100%; height: ${height}px; border: 0;"`);
    
    return modifiedIframe;
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        height, 
        borderRadius: 8, 
        overflow: 'hidden',
        border: '1px solid #d9d9d9'
      }}
      dangerouslySetInnerHTML={{ __html: getModifiedIframe(embedCode) }}
    />
  );
}
