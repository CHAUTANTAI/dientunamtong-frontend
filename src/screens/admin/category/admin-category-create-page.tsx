'use client';

/**
 * Create Category Page
 * Allows creating a new category
 */

import { Card, Form, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateCategoryMutation } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';

type CreateCategoryFormValues = Pick<Category, 'name' | 'description'>;

export default function AdminCategoryCreatePage() {
  const router = useRouter();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateCategoryFormValues>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      await createCategory({
        name: values.name,
        description: values.description || null,
        is_active: true,
      }).unwrap();

      message.success('Category created successfully');
      reset();
      router.push(ROUTES.CATEGORY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to create category');
    }
  };

  return (
    <Card title="Create New Category">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <FormInput
          name="name"
          control={control}
          label="Name"
          placeholder="Enter category name"
          rules={{
            required: 'Name is required',
            maxLength: {
              value: 255,
              message: 'Name must not exceed 255 characters',
            },
          }}
        />

        <FormInput
          name="description"
          control={control}
          label="Description"
          placeholder="Enter description (optional)"
          textarea
          rules={{
            maxLength: {
              value: 500,
              message: 'Description must not exceed 500 characters',
            },
          }}
        />

        <FormSubmitButton
          isLoading={isSubmitting || isLoading}
          style={{ marginTop: 8 }}
        >
          Create Category
        </FormSubmitButton>
      </Form>
    </Card>
  );
}

