/**
 * Footer Component
 * Simple footer for admin layout
 */

'use client';

interface FooterProps {
  text?: string;
}

export const Footer = ({ text = '© 2026 Nam Tông Coffee Admin System. All rights reserved.' }: FooterProps) => {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '20px 24px',
        color: 'rgba(30, 30, 46, 0.6)',
        fontSize: '13px',
        marginTop: '32px',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {text}
    </footer>
  );
};

Footer.displayName = 'Footer';
