/**
 * FormSubmitButton Component
 * Reusable submit button for forms
 */

'use client';

import { Button } from 'antd';
import type { ButtonProps } from 'antd';

interface FormSubmitButtonProps extends ButtonProps {
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const FormSubmitButton = ({
  isLoading,
  children = 'Submit',
  ...buttonProps
}: FormSubmitButtonProps) => {
  return (
    <Button
      type="primary"
      htmlType="submit"
      loading={isLoading}
      disabled={isLoading}
      block
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

FormSubmitButton.displayName = 'FormSubmitButton';
