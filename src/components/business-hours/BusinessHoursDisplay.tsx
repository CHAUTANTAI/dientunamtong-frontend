'use client';

import { Space, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

interface BusinessHoursData {
  schedule: DaySchedule[];
}

interface BusinessHoursDisplayProps {
  data?: string; // JSON string
}

export const BusinessHoursDisplay = ({ data }: BusinessHoursDisplayProps) => {
  const t = useTranslations();

  if (!data) {
    return (
      <Space align="start">
        <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
        <div>
          <Text strong>{t('client.contact.businessHours')}</Text>
          <br />
          <Text>{t('client.contact.mondayFriday')}</Text>
          <br />
          <Text>{t('client.contact.saturday')}</Text>
          <br />
          <Text>{t('client.contact.sunday')}</Text>
        </div>
      </Space>
    );
  }

  let businessHours: BusinessHoursData;
  try {
    businessHours = JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse business hours:', error);
    return null;
  }

  const getDayLabel = (day: string) => {
    const dayMap: Record<string, string> = {
      monday: t('common.days.monday'),
      tuesday: t('common.days.tuesday'),
      wednesday: t('common.days.wednesday'),
      thursday: t('common.days.thursday'),
      friday: t('common.days.friday'),
      saturday: t('common.days.saturday'),
      sunday: t('common.days.sunday'),
    };
    return dayMap[day] || day;
  };

  // Check if all days have the same schedule
  const checkIfAllSame = () => {
    const schedule = businessHours.schedule;
    if (schedule.length === 0) return false;

    const first = schedule[0];
    
    // Check if all days have same isOpen, openTime, closeTime
    const allSame = schedule.every(
      (day) =>
        day.isOpen === first.isOpen &&
        day.openTime === first.openTime &&
        day.closeTime === first.closeTime
    );

    return allSame;
  };

  const allSame = checkIfAllSame();

  // If all days are the same, show "Everyday"
  if (allSame) {
    const firstDay = businessHours.schedule[0];
    return (
      <Space align="start">
        <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
        <div style={{ width: '100%' }}>
          <Text strong style={{ fontSize: 16 }}>{t('client.contact.businessHours')}</Text>
          <div style={{ marginTop: 8 }}>
            <div>
              <Text style={{ display: 'inline-block', width: 100, fontSize: 15, fontWeight: 500 }}>
                {t('common.everyday')}:
              </Text>
              {firstDay.isOpen && firstDay.openTime && firstDay.closeTime ? (
                <Text style={{ fontSize: 15 }}>
                  {firstDay.openTime} - {firstDay.closeTime}
                </Text>
              ) : (
                <Text type="secondary" style={{ fontSize: 15 }}>
                  {t('common.closed')}
                </Text>
              )}
            </div>
          </div>
        </div>
      </Space>
    );
  }

  // Show individual days
  return (
    <Space align="start">
      <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
      <div style={{ width: '100%' }}>
        <Text strong style={{ fontSize: 16 }}>{t('client.contact.businessHours')}</Text>
        <div style={{ marginTop: 8 }}>
          {businessHours.schedule.map((daySchedule) => (
            <div key={daySchedule.day} style={{ marginBottom: 4 }}>
              <Text style={{ display: 'inline-block', width: 100, fontSize: 15 }}>
                {getDayLabel(daySchedule.day)}:
              </Text>
              {daySchedule.isOpen && daySchedule.openTime && daySchedule.closeTime ? (
                <Text style={{ fontSize: 15 }}>
                  {daySchedule.openTime} - {daySchedule.closeTime}
                </Text>
              ) : (
                <Text type="secondary" style={{ fontSize: 15 }}>
                  {t('common.closed')}
                </Text>
              )}
            </div>
          ))}
        </div>
      </div>
    </Space>
  );
};
