'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, '') || '/';
    
    // Navigate to new locale
    const newPath = newLocale === 'en' 
      ? pathnameWithoutLocale 
      : `/${newLocale}${pathnameWithoutLocale}`;
    
    router.push(newPath);
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
