/**
 * Footer Component
 * Simple footer for admin layout
 */

'use client';

interface FooterProps {
  text?: string;
}

export const Footer = ({ text = '© 2026 Admin System. All rights reserved.' }: FooterProps) => {
  return (
    <footer
      style={{
        textAlign: 'right',
        padding: '24px',
        color: '#888',
        fontSize: '12px',
        borderTop: '1px solid #f0f0f0',
        marginTop: '32px',
      }}
    >
      {text}
    </footer>
  );
};

Footer.displayName = 'Footer';
