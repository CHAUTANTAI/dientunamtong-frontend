import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from '@/i18n.server';
import ReduxProvider from '@/providers/ReduxProvider';
import AntdProvider from '@/providers/AntdProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nam Tông Store',
  description: 'Motorcycle electronics and accessories',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  
  // Load messages dynamically
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <AntdProvider>{children}</AntdProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
