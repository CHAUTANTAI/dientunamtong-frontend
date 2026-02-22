/**
 * SpecificationInput Component
 * Dynamic key-value input for product specifications
 */

'use client';

import { Space, Input, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface SpecificationRow {
  key: string;
  value: string;
}

interface SpecificationInputProps {
  value?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  disabled?: boolean;
}

export const SpecificationInput = ({
  value = {},
  onChange,
  disabled = false,
}: SpecificationInputProps) => {
  // Convert object to array for rendering (derive from value, not separate state)
  const rows = (() => {
    const entries = Object.entries(value);
    return entries.length > 0
      ? entries.map(([key, val]) => ({ key, value: val }))
      : [{ key: '', value: '' }];
  })();

  /**
   * Update parent component
   */
  const notifyChange = (updatedRows: SpecificationRow[]) => {
    const validRows = updatedRows.filter((row) => row.key.trim() && row.value.trim());
    const specsObject = validRows.reduce(
      (acc, row) => {
        acc[row.key.trim()] = row.value.trim();
        return acc;
      },
      {} as Record<string, string>
    );
    onChange?.(specsObject);
  };

  /**
   * Add new row
   */
  const addRow = () => {
    const updated = [...rows, { key: '', value: '' }];
    notifyChange(updated);
  };

  /**
   * Remove row
   */
  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    notifyChange(updated);
  };

  /**
   * Update specific row
   */
  const updateRow = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...rows];
    updated[index][field] = newValue;
    notifyChange(updated);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {rows.map((row, index) => (
        <Space key={index} style={{ width: '100%' }} align="start">
          <Input
            placeholder="Key (e.g., CPU)"
            value={row.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
            disabled={disabled}
            style={{ width: 180 }}
          />
          <Input
            placeholder="Value (e.g., Intel Core i7)"
            value={row.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            disabled={disabled}
            style={{ flex: 1, minWidth: 200 }}
          />
          {rows.length > 1 && !disabled && (
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeRow(index)}
            />
          )}
        </Space>
      ))}

      {!disabled && (
        <Button type="dashed" onClick={addRow} icon={<PlusOutlined />} block>
          Add Specification
        </Button>
      )}
    </Space>
  );
};

SpecificationInput.displayName = 'SpecificationInput';
