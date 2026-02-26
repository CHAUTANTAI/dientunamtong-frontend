'use client';

/**
 * Create Category Page
 * Complete category creation with media upload, parent selection, and slug generation
 */

import { useState, useEffect, Suspense } from 'react';
import { Card, Form, Input, InputNumber, Switch, Space, Divider, message, Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
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
        message.error(t('category.messages.invalidSlug'));
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

      message.success(t('category.messages.createSuccess'));
      reset();
      router.push(ROUTES.CATEGORY);
    } catch (error) {
      console.error('Create category error:', error);
      message.error(getErrorMessage(error, t('category.messages.createError')));
    }
  };

  return (
    <Card title={parentId ? t('category.createChild') : t('category.createRoot')}>
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

        <Divider>{t('category.labels.name')}</Divider>

        {/* Parent Category */}
        <Form.Item label={t('category.labels.parent')}>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
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
              <CategoryImageUpload value={field.value} onChange={field.onChange} />
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
        <FormSubmitButton isLoading={isSubmitting || isLoading} style={{ marginTop: 16 }}>
          {t('category.actions.createCategory')}
        </FormSubmitButton>
      </Form>
    </Card>
  );
}

export default function AdminCategoryCreatePage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      }
    >
      <AdminCategoryCreatePageContent />
    </Suspense>
  );
}
