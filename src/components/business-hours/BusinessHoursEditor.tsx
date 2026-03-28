'use client';

import { useState, useEffect } from 'react';
import { Space, TimePicker, Switch, Typography, Row, Col } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string | null; // HH:mm format
  closeTime: string | null; // HH:mm format
}

export interface BusinessHoursData {
  schedule: DaySchedule[];
}

interface BusinessHoursEditorProps {
  value?: string; // JSON string
  onChange?: (value: string) => void;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '12:00' },
  { day: 'sunday', isOpen: false, openTime: null, closeTime: null },
];

export const BusinessHoursEditor = ({ value, onChange }: BusinessHoursEditorProps) => {
  const t = useTranslations();
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (value) {
      try {
        const parsed: BusinessHoursData = JSON.parse(value);
        if (parsed.schedule && Array.isArray(parsed.schedule)) {
          return parsed.schedule;
        }
      } catch (error) {
        console.error('Failed to parse business hours:', error);
      }
    }
    return DEFAULT_SCHEDULE;
  });

  const handleScheduleChange = (index: number, updates: Partial<DaySchedule>) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    setSchedule(newSchedule);

    // Notify parent
    const data: BusinessHoursData = { schedule: newSchedule };
    onChange?.(JSON.stringify(data));
  };

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

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {schedule.map((daySchedule, index) => (
        <Row key={daySchedule.day} gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Text strong>{getDayLabel(daySchedule.day)}</Text>
          </Col>
          <Col xs={12} sm={4}>
            <Switch
              checked={daySchedule.isOpen}
              onChange={(checked) =>
                handleScheduleChange(index, {
                  isOpen: checked,
                  openTime: checked ? '08:00' : null,
                  closeTime: checked ? '17:00' : null,
                })
              }
              checkedChildren={t('common.open')}
              unCheckedChildren={t('common.closed')}
            />
          </Col>
          {daySchedule.isOpen && (
            <>
              <Col xs={12} sm={7}>
                <Space>
                  <Text type="secondary">{t('common.from')}:</Text>
                  <TimePicker
                    format="HH:mm"
                    value={daySchedule.openTime ? dayjs(daySchedule.openTime, 'HH:mm') : null}
                    onChange={(time: Dayjs | null) =>
                      handleScheduleChange(index, {
                        openTime: time ? time.format('HH:mm') : null,
                      })
                    }
                    minuteStep={15}
                    size="small"
                  />
                </Space>
              </Col>
              <Col xs={12} sm={7}>
                <Space>
                  <Text type="secondary">{t('common.to')}:</Text>
                  <TimePicker
                    format="HH:mm"
                    value={daySchedule.closeTime ? dayjs(daySchedule.closeTime, 'HH:mm') : null}
                    onChange={(time: Dayjs | null) =>
                      handleScheduleChange(index, {
                        closeTime: time ? time.format('HH:mm') : null,
                      })
                    }
                    minuteStep={15}
                    size="small"
                  />
                </Space>
              </Col>
            </>
          )}
        </Row>
      ))}
    </Space>
  );
};
