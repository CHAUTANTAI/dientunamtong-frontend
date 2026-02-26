/**
 * Edit Category Page
 * Complete category editing with media upload, parent selection, and slug management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Space, Divider, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useGetCategoryQuery, useUpdateCategoryMutation } from '@/store/api/categoryApi';
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
  const t = useTranslations();
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
        message.error(t('category.messages.invalidSlug'));
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

      message.success(t('category.messages.updateSuccess'));
      router.push(ROUTES.CATEGORY);
    } catch (error) {
      console.error('Update category error:', error);
      message.error(getErrorMessage(error, t('category.messages.updateError')));
    }
  };

  if (isLoadingCategory) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>{t('category.messages.loadingCategory')}</p>
        </div>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card>
        <p>{t('category.messages.notFound')}</p>
      </Card>
    );
  }

  return (
    <Card title={`${t('category.edit')}: ${category.name}`}>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Name */}
        <FormInput
          name="name"
          control={control}
          label={t('category.labels.name')}
          placeholder={t('category.placeholders.name')}
          rules={{
            required: t('category.validation.nameRequired'),
            maxLength: {
              value: 255,
              message: t('category.validation.nameMaxLength'),
            },
          }}
        />

        {/* Slug */}
        <Form.Item
          label={t('category.labels.slug')}
          validateStatus={errors.slug ? 'error' : ''}
          help={errors.slug?.message}
          required
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Controller
              name="slug"
              control={control}
              rules={{
                required: t('category.validation.slugRequired'),
                validate: (value) => isValidSlug(value) || t('category.validation.slugInvalid'),
              }}
              render={({ field }) => (
                <Input {...field} placeholder={t('category.placeholders.slug')} disabled={autoSlug} />
              )}
            />
            <Switch
              checked={autoSlug}
              onChange={setAutoSlug}
              checkedChildren={t('common.auto')}
              unCheckedChildren={t('common.manual')}
            />
          </Space>
        </Form.Item>

        {/* Description */}
        <FormInput
          name="description"
          control={control}
          label={t('category.labels.description')}
          placeholder={t('category.placeholders.description')}
          textarea
          rules={{
            maxLength: {
              value: 1000,
              message: t('category.validation.descriptionMaxLength'),
            },
          }}
        />

        <Divider>{t('category.labels.name')} Settings</Divider>

        {/* Parent Category */}
        <Form.Item label={t('category.labels.parent')}>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                excludeId={categoryId} // Prevent selecting self or descendants
                placeholder={t('category.placeholders.parent')}
              />
            )}
          />
        </Form.Item>

        {/* Category Image */}
        <Form.Item label={t('category.labels.image')}>
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
        <Form.Item label={t('category.labels.sortOrder')}>
          <Controller
            name="sort_order"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} style={{ width: '100%' }} placeholder="0" />
            )}
          />
        </Form.Item>

        {/* Active Status */}
        <Form.Item label={t('category.labels.active')}>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren={t('common.active')}
                unCheckedChildren={t('common.inactive')}
              />
            )}
          />
        </Form.Item>

        {/* Submit Button */}
        <Space>
          <FormSubmitButton isLoading={isSubmitting || isUpdating} style={{ marginTop: 16 }}>
            {t('category.actions.updateCategory')}
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
            {t('common.cancel')}
          </button>
        </Space>
      </Form>
    </Card>
  );
}
