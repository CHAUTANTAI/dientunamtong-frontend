'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { LOCALE_COOKIE } from '@/i18n';

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    // Set locale cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000`; // 1 year
    
    // Refresh page to apply new locale
    router.refresh();
  };

  return (
    <Select
      value={locale}
      onChange={handleChange}
      style={{ width: 150 }}
      options={languages.map((lang) => ({
        value: lang.value,
        label: (
          <span>
            {lang.flag} {lang.label}
          </span>
        ),
      }))}
      suffixIcon={<GlobalOutlined />}
    />
  );
};
