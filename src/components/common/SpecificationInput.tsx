/**
 * SpecificationInput Component
 * Dynamic key-value input for product specifications
 */

'use client';

import { useState, useEffect } from 'react';
import { Space, Input, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface SpecificationRow {
  id: string;
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
  // Use local state to manage rows (including empty ones)
  const [rows, setRows] = useState<SpecificationRow[]>(() => {
    const entries = Object.entries(value);
    if (entries.length > 0) {
      return entries.map(([key, val]) => ({ id: crypto.randomUUID(), key, value: val }));
    }
    return [{ id: crypto.randomUUID(), key: '', value: '' }];
  });

  // Sync external value to local rows only on initial mount or when value structure changes
  useEffect(() => {
    const entries = Object.entries(value);
    
    // Skip sync if we're just typing (rows exist and some are empty)
    const hasEmptyRows = rows.some(r => !r.key.trim() || !r.value.trim());
    if (hasEmptyRows && entries.length > 0) {
      // User is actively editing, don't sync
      return;
    }
    
    // Only sync if external value has meaningful data and it's different from current state
    if (entries.length > 0) {
      const currentData = rows
        .filter(r => r.key.trim() && r.value.trim())
        .reduce((acc, r) => {
          acc[r.key.trim()] = r.value.trim();
          return acc;
        }, {} as Record<string, string>);
      
      const externalData = entries.reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);
      
      // Only sync if data is actually different (form reset or external change)
      if (JSON.stringify(currentData) !== JSON.stringify(externalData)) {
        setRows(entries.map(([key, val]) => ({ id: crypto.randomUUID(), key, value: val })));
      }
    } else if (entries.length === 0 && rows.every(r => !r.key.trim() && !r.value.trim())) {
      // Reset to single empty row if everything is cleared from outside
      setRows([{ id: crypto.randomUUID(), key: '', value: '' }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /**
   * Update parent component with valid rows only
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
   * Add new empty row
   */
  const addRow = () => {
    const newRows = [...rows, { id: crypto.randomUUID(), key: '', value: '' }];
    setRows(newRows);
  };

  /**
   * Remove specific row by index
   */
  const removeRow = (index: number) => {
    const rowToRemove = rows[index];
    const newRows = rows.filter((_, i) => i !== index);
    
    // Ensure at least one row remains
    if (newRows.length === 0) {
      newRows.push({ id: crypto.randomUUID(), key: '', value: '' });
    }
    
    setRows(newRows);
    
    // Only notify parent if the removed row had data
    // This prevents empty rows from triggering useEffect sync
    if (rowToRemove.key.trim() && rowToRemove.value.trim()) {
      notifyChange(newRows);
    }
  };

  /**
   * Update specific row field
   */
  const updateRow = (index: number, field: 'key' | 'value', newValue: string) => {
    const newRows = [...rows];
    newRows[index][field] = newValue;
    setRows(newRows);
    notifyChange(newRows);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {rows.map((row, index) => (
        <Space key={row.id} style={{ width: '100%' }} align="start">
          <Input
            placeholder="Key (e.g., CPU)"
            value={row.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
            disabled={disabled}
            style={{ width: 250 }}
          />
          <TextArea
            placeholder="Value (e.g., Intel Core i7 12th Gen)"
            value={row.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1, minWidth: 300 }}
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
