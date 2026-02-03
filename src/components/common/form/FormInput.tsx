/**
 * FormInput Component
 * Reusable input field with react-hook-form integration
 */

'use client';

import { Input, Form } from 'antd';
import type { FieldPath, UseControllerProps, FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  max?: number;
}

export const FormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  type = 'text',
  max,
  ...controllerProps
}: FormInputProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController(controllerProps);

  return (
    <Form.Item
      label={label}
      validateStatus={fieldState.error ? 'error' : ''}
      help={fieldState.error?.message}
    >
      <Input
        {...field}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={max}
        status={fieldState.error ? 'error' : ''}
      />
    </Form.Item>
  );
};

FormInput.displayName = 'FormInput';
