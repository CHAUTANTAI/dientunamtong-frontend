'use client';

/**
 * Create Category Page
 * Complete category creation with media upload, parent selection, and slug generation
 */

import { useState, useEffect, Suspense } from 'react';
import { Card, Form, Input, InputNumber, Switch, Space, Divider, message, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useCreateCategoryMutation } from '@/store/api/categoryApi';
import type { CreateCategoryDto } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { CategoryImageUpload } from '@/components/common/CategoryImageUpload';
import { CategorySelect } from '@/components/common/CategorySelect';
import { generateSlug, isValidSlug } from '@/utils/slug';
import { getErrorMessage } from '@/utils/error';

interface CreateCategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  media_id?: string | null;
  sort_order: number;
  is_active: boolean;
}

function AdminCategoryCreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent_id');
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CreateCategoryFormValues>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: parentId || null,
      media_id: null,
      sort_order: 0,
      is_active: true,
    },
  });

  const nameValue = useWatch({ control, name: 'name' });

  /**
   * Auto-generate slug from name
   */
  useEffect(() => {
    if (autoSlug && nameValue) {
      const slug = generateSlug(nameValue);
      setValue('slug', slug);
    }
  }, [nameValue, autoSlug, setValue]);

  /**
   * Handle form submission
   */
  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      // Validate slug
      if (!isValidSlug(values.slug)) {
        message.error('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
        return;
      }

      const dto: CreateCategoryDto = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        parent_id: values.parent_id || null,
        media_id: values.media_id || null,
        sort_order: values.sort_order,
        is_active: values.is_active,
      };

      await createCategory(dto).unwrap();

      message.success('Category created successfully');
      reset();
      router.push(ROUTES.CATEGORY);
    } catch (error) {
      console.error('Create category error:', error);
      message.error(getErrorMessage(error, 'Failed to create category'));
    }
  };

  return (
    <Card title={parentId ? 'Create Child Category' : 'Create Root Category'}>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Name */}
        <FormInput
          name="name"
          control={control}
          label="Category Name"
          placeholder="Enter category name"
          rules={{
            required: 'Name is required',
            maxLength: {
              value: 255,
              message: 'Name must not exceed 255 characters',
            },
          }}
        />

        {/* Slug */}
        <Form.Item
          label="Slug (URL-friendly)"
          validateStatus={errors.slug ? 'error' : ''}
          help={errors.slug?.message}
          required
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Controller
              name="slug"
              control={control}
              rules={{
                required: 'Slug is required',
                validate: (value) =>
                  isValidSlug(value) || 'Invalid slug format',
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="category-slug"
                  disabled={autoSlug}
                />
              )}
            />
            <Switch
              checked={autoSlug}
              onChange={setAutoSlug}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
            />
          </Space>
        </Form.Item>

        {/* Description */}
        <FormInput
          name="description"
          control={control}
          label="Description"
          placeholder="Enter description (optional)"
          textarea
          rules={{
            maxLength: {
              value: 1000,
              message: 'Description must not exceed 1000 characters',
            },
          }}
        />

        <Divider>Category Settings</Divider>

        {/* Parent Category */}
        <Form.Item label="Parent Category">
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select parent category (optional)"
              />
            )}
          />
        </Form.Item>

        {/* Category Image */}
        <Form.Item label="Category Image">
          <Controller
            name="media_id"
            control={control}
            render={({ field }) => (
              <CategoryImageUpload
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Form.Item>

        {/* Sort Order */}
        <Form.Item label="Sort Order">
          <Controller
            name="sort_order"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
              />
            )}
          />
        </Form.Item>

        {/* Active Status */}
        <Form.Item label="Active">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            )}
          />
        </Form.Item>

        {/* Submit Button */}
        <FormSubmitButton
          isLoading={isSubmitting || isLoading}
          style={{ marginTop: 16 }}
        >
          Create Category
        </FormSubmitButton>
      </Form>
    </Card>
  );
}

export default function AdminCategoryCreatePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
      <AdminCategoryCreatePageContent />
    </Suspense>
  );
}
