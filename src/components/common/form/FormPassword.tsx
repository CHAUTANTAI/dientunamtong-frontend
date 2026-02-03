/**
 * FormPassword Component
 * Reusable password input field with react-hook-form integration
 */

'use client';

import { Input, Form } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import type { FieldPath, UseControllerProps, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

interface FormPasswordProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const FormPassword = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  ...controllerProps
}: FormPasswordProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController(controllerProps);

  return (
    <Form.Item
      label={label}
      validateStatus={fieldState.error ? 'error' : ''}
      help={fieldState.error?.message}
    >
      <Input.Password
        {...field}
        placeholder={placeholder}
        disabled={disabled}
        prefix={<LockOutlined />}
        status={fieldState.error ? 'error' : ''}
      />
    </Form.Item>
  );
};

FormPassword.displayName = 'FormPassword';
