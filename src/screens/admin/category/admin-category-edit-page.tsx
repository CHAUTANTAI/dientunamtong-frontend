/**
 * Edit Category Page
 * Complete category editing with media upload, parent selection, and slug management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Space, Divider, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { 
  useGetCategoryQuery, 
  useUpdateCategoryMutation 
} from '@/store/api/categoryApi';
import type { UpdateCategoryDto } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { CategoryImageUpload } from '@/components/common/CategoryImageUpload';
import { CategorySelect } from '@/components/common/CategorySelect';
import { generateSlug, isValidSlug } from '@/utils/slug';
import { getErrorMessage } from '@/utils/error';

interface EditCategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  media_id?: string | null;
  sort_order: number;
  is_active: boolean;
}

interface AdminCategoryEditPageProps {
  categoryId: string;
}

export default function AdminCategoryEditPage({ categoryId }: AdminCategoryEditPageProps) {
  const router = useRouter();
  const { data: category, isLoading: isLoadingCategory } = useGetCategoryQuery(categoryId);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [autoSlug, setAutoSlug] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<EditCategoryFormValues>();

  const nameValue = useWatch({ control, name: 'name' });

  /**
   * Load category data into form
   */
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id || null,
        media_id: category.media_id || null,
        sort_order: category.sort_order || 0,
        is_active: category.is_active ?? true,
      });
    }
  }, [category, reset]);

  /**
   * Auto-generate slug from name (only when enabled)
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
  const onSubmit = async (values: EditCategoryFormValues) => {
    try {
      // Validate slug
      if (!isValidSlug(values.slug)) {
        message.error('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
        return;
      }

      const dto: UpdateCategoryDto = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        parent_id: values.parent_id || null,
        media_id: values.media_id || null,
        sort_order: values.sort_order,
        is_active: values.is_active,
      };

      await updateCategory({ id: categoryId, body: dto }).unwrap();

      message.success('Category updated successfully');
      router.push(ROUTES.CATEGORY);
    } catch (error) {
      console.error('Update category error:', error);
      message.error(getErrorMessage(error, 'Failed to update category'));
    }
  };

  if (isLoadingCategory) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading category...</p>
        </div>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card>
        <p>Category not found</p>
      </Card>
    );
  }

  return (
    <Card title={`Edit Category: ${category.name}`}>
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
                excludeId={categoryId} // Prevent selecting self or descendants
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
                existingMedia={category.media}
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
        <Space>
          <FormSubmitButton
            isLoading={isSubmitting || isUpdating}
            style={{ marginTop: 16 }}
          >
            Update Category
          </FormSubmitButton>
          <button
            type="button"
            onClick={() => router.push(ROUTES.CATEGORY)}
            style={{
              marginTop: 16,
              padding: '4px 15px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </Space>
      </Form>
    </Card>
  );
}

