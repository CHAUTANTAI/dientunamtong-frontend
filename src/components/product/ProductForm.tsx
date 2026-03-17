/**
 * ProductForm Component - Shared form for Create/Edit Product
 * Handles both creation and editing with the same form
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Divider, Space, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductCategoriesMutation,
  useAddProductMediaMutation,
  useRemoveProductMediaMutation,
} from '@/store/api/productApi';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { SpecificationInput } from '@/components/common/SpecificationInput';
import { CategoryMultiSelect } from '@/components/common/CategoryMultiSelect';
import { ProductMediaUpload, MediaFile } from '@/components/common/ProductMediaUpload';
import { isValidSlug, generateSlug } from '@/utils/slug';
import { getErrorMessage } from '@/utils/error';
import { uploadToPublicBucket } from '@/utils/supabase';

interface ProductFormValues {
  name: string;
  slug: string;
  sku?: string;
  price?: number;
  contactForPrice?: boolean;
  short_description?: string;
  description?: string;
  specifications?: Record<string, string>;
  category_ids?: string[];
  tags?: string;
  media: MediaFile[];
  is_active: boolean;
  in_stock: boolean;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  isLoading?: boolean;
}

export function ProductForm({ mode, product, isLoading }: ProductFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { message } = App.useApp();
  const [autoSlug, setAutoSlug] = useState(mode === 'create');

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [updateCategories] = useUpdateProductCategoriesMutation();
  const [addProductMedia] = useAddProductMediaMutation();
  const [removeProductMedia] = useRemoveProductMediaMutation();

  // Track original media IDs to detect deletions
  const [originalMediaIds, setOriginalMediaIds] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      price: undefined,
      contactForPrice: true,
      short_description: '',
      description: '',
      specifications: {},
      category_ids: [],
      tags: '',
      media: [],
      is_active: true,
      in_stock: true,
    },
  });

  const nameValue = watch('name');
  const contactForPriceValue = watch('contactForPrice');

  // Load existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && product) {
      // Convert Media[] from backend to MediaFile[] format
      const existingMedia: MediaFile[] = (product.media || []).map((media) => ({
        uid: media.id,
        url: media.file_url,
        type: media.media_type === 'video' ? 'video' : 'image',
        sort_order: media.sort_order,
      }));

      // Track original media IDs to detect deletions
      setOriginalMediaIds(existingMedia.map((m) => m.uid));

      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku || '',
        price: product.price ? Number(product.price) : undefined,
        contactForPrice: !product.price,
        short_description: product.short_description || '',
        description: product.description || '',
        specifications: product.specifications || {},
        category_ids: product.categories?.map((c) => c.id) || [],
        tags: product.tags?.join(', ') || '',
        media: existingMedia,
        is_active: product.is_active ?? true,
        in_stock: product.in_stock ?? true,
      });
      setAutoSlug(false);
    }
  }, [mode, product, reset]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && nameValue && mode === 'create') {
      const slug = generateSlug(nameValue);
      setValue('slug', slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, autoSlug]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (!isValidSlug(values.slug)) {
        message.error('Invalid slug format');
        return;
      }

      // Validate featured image (required)
      const hasFeaturedImage = values.media.some(m => m.sort_order === 0);
      if (!hasFeaturedImage) {
        message.error(t('product.messages.featuredImageRequired'));
        return;
      }

      const tags = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      if (mode === 'create') {
        // CREATE MODE
        const dto: CreateProductDto = {
          name: values.name,
          slug: values.slug,
          sku: values.sku || undefined,
          price: values.contactForPrice ? null : (values.price || null),
          short_description: values.short_description || null,
          description: values.description || null,
          specifications: values.specifications || {},
          category_ids: values.category_ids || [],
          tags,
          is_active: values.is_active,
          in_stock: values.in_stock,
        };

        const newProduct = await createProduct(dto).unwrap();

        // Upload media files
        if (values.media.length > 0) {
          try {
            for (const mediaFile of values.media) {
              if (mediaFile.file) {
                console.log('Uploading media:', {
                  fileName: mediaFile.file.name,
                  type: mediaFile.type,
                  size: mediaFile.file.size,
                });

                const result = await uploadToPublicBucket(
                  mediaFile.file,
                  `products/${newProduct.id}`
                );

                console.log('Supabase upload result:', result);

                await addProductMedia({
                  productId: newProduct.id,
                  file_url: `/${result.path}`,
                  file_name: mediaFile.file.name,
                  media_type: mediaFile.type,
                  mime_type: mediaFile.file.type,
                  file_size: mediaFile.file.size,
                  sort_order: mediaFile.sort_order,
                }).unwrap();

                console.log('Media added to product successfully');
              }
            }
          } catch (mediaError) {
            console.error('Media upload error:', mediaError);
            message.error(getErrorMessage(mediaError, 'Failed to upload media'));
            // Continue to success message since product is created
          }
        }

        message.success(t('product.messages.createSuccess'));
        router.push(ROUTES.PRODUCT);
      } else {
        // EDIT MODE
        const dto: UpdateProductDto = {
          name: values.name,
          slug: values.slug,
          sku: values.sku || undefined,
          price: values.contactForPrice ? null : (values.price || null),
          short_description: values.short_description || null,
          description: values.description || null,
          specifications: values.specifications || {},
          tags,
          is_active: values.is_active,
          in_stock: values.in_stock,
        };

        await updateProduct({ id: product!.id, body: dto }).unwrap();

        if (values.category_ids) {
          await updateCategories({
            productId: product!.id,
            category_ids: values.category_ids,
          }).unwrap();
        }

        // Media management: Add new files, Remove deleted files
        try {
          // Step 1: Detect deleted media (original IDs not in current list)
          const currentMediaIds = values.media.map((m) => m.uid);
          const deletedMediaIds = originalMediaIds.filter((id) => !currentMediaIds.includes(id));

          if (deletedMediaIds.length > 0) {
            console.log(`Deleting ${deletedMediaIds.length} removed media...`);
            for (const mediaId of deletedMediaIds) {
              await removeProductMedia({ mediaId, productId: product!.id }).unwrap();
              console.log(`Deleted media: ${mediaId}`);
            }
          }

          // Step 2: Upload new media files (files with 'file' property)
          const newMediaFiles = values.media.filter((m) => m.file);
          if (newMediaFiles.length > 0) {
            console.log(`Uploading ${newMediaFiles.length} new media files...`);
            for (const mediaFile of newMediaFiles) {
              console.log('Uploading media:', {
                fileName: mediaFile.file!.name,
                type: mediaFile.type,
                size: mediaFile.file!.size,
              });

              const result = await uploadToPublicBucket(
                mediaFile.file!,
                `products/${product!.id}`
              );

              console.log('Supabase upload result:', result);

              await addProductMedia({
                productId: product!.id,
                file_url: `/${result.path}`,
                file_name: mediaFile.file!.name,
                media_type: mediaFile.type,
                mime_type: mediaFile.file!.type,
                file_size: mediaFile.file!.size,
                sort_order: mediaFile.sort_order,
              }).unwrap();

              console.log('Media added successfully');
            }
          }

          if (deletedMediaIds.length > 0 || newMediaFiles.length > 0) {
            console.log('Media update completed');
          }
        } catch (mediaError) {
          console.error('Media update error:', mediaError);
          message.error(getErrorMessage(mediaError, 'Failed to update media'));
        }

        message.success(t('product.messages.updateSuccess'));
        router.push(ROUTES.PRODUCT);
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', error ? Object.keys(error) : 'null');
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      message.error(getErrorMessage(error, `Failed to ${mode} product`));
    }
  };

  if (mode === 'edit' && isLoading) {
    return (
      <Card title={t('product.actions.edit')}>
        <div>{t('product.messages.loading')}</div>
      </Card>
    );
  }

  if (mode === 'edit' && !product) {
    return <Card title={t('product.edit')}>{t('product.messages.notFound')}</Card>;
  }

  return (
    <Card title={mode === 'create' ? t('product.create') : `${t('product.edit')}: ${product?.name}`}>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Divider orientation="left">{t('product.sections.basicInfo')}</Divider>

        <FormInput
          name="name"
          control={control}
          label={t('product.labels.name')}
          placeholder={t('product.labels.name')}
          rules={{ required: t('validation.required', { field: 'Name' }) }}
        />

        <FormInput
          name="slug"
          control={control}
          label={
            <span>
              {t('product.labels.slug')}{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>
                - {t('product.labels.slugHelp')}
              </span>
            </span>
          }
          placeholder="product-slug"
          rules={{
            required: t('validation.required', { field: 'Slug' }),
            validate: (v) => isValidSlug(v) || t('validation.invalid', { field: 'slug' }),
          }}
        />

        {mode === 'create' && (
          <Space style={{ marginBottom: 16 }}>
            <span>{t('product.actions.autoGenerateSlug')}:</span>
            <Switch
              checked={autoSlug}
              onChange={setAutoSlug}
              checkedChildren={t('product.switchOn')}
              unCheckedChildren={t('product.switchOff')}
            />
          </Space>
        )}

        <FormInput 
          name="sku" 
          control={control} 
          label={
            <span>
              {t('product.labels.sku')}{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>
                - {t('product.labels.skuHelp')}
              </span>
            </span>
          }
          placeholder={t('product.placeholders.sku')} 
        />

        <Form.Item label={t('product.labels.price')} help={t('product.labels.priceHelp')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Controller
              name="contactForPrice"
              control={control}
              render={({ field }) => (
                <Space>
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        setValue('price', undefined);
                      }
                    }}
                  />
                  <span>{t('product.labels.contactForPriceLabel')}</span>
                </Space>
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  disabled={contactForPriceValue}
                  min={0}
                  precision={0}
                  controls={false}
                  style={{ width: '100%' }}
                  placeholder={contactForPriceValue ? t('product.labels.contactForPrice') : t('product.placeholders.price')}
                  formatter={(value) => {
                    if (!value) return '';
                    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={(value) => {
                    if (!value) return 0;
                    const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 1) {
                      return Number(parts[0]);
                    }
                    const parsed = Number(cleaned);
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                />
              )}
            />
          </Space>
        </Form.Item>

        <FormInput
          name="short_description"
          control={control}
          label={t('product.labels.shortDescription')}
          placeholder={t('product.placeholders.shortDescription')}
          textarea
        />

        <FormInput
          name="description"
          control={control}
          label={t('product.labels.description')}
          placeholder={t('product.placeholders.description')}
          textarea
        />

        <Divider orientation="left">{t('product.labels.specifications')}</Divider>

        <Form.Item label={t('product.labels.specifications')}>
          <Controller
            name="specifications"
            control={control}
            render={({ field }) => (
              <SpecificationInput value={field.value} onChange={field.onChange} />
            )}
          />
        </Form.Item>

        <Divider orientation="left">{t('product.sections.categorization')}</Divider>

        <Form.Item label={t('product.labels.categories')}>
          <Controller
            name="category_ids"
            control={control}
            render={({ field }) => (
              <CategoryMultiSelect 
                value={field.value} 
                onChange={field.onChange}
                placeholder={t('product.placeholders.categories')}
              />
            )}
          />
        </Form.Item>

        <FormInput name="tags" control={control} label={t('product.labels.tags')} placeholder={t('product.placeholders.tags')} />

        <Divider orientation="left">{t('product.labels.media')}</Divider>

        <Form.Item label={t('product.labels.media')}>
          <Controller
            name="media"
            control={control}
            render={({ field }) => (
              <ProductMediaUpload
                value={field.value}
                onChange={field.onChange}
                maxImages={9}
                maxVideos={1}
              />
            )}
          />
        </Form.Item>

        <Divider orientation="left">{t('product.labels.status')}</Divider>

        <Form.Item label={t('common.active')}>
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

        <Form.Item label={t('product.labels.stock')}>
          <Controller
            name="in_stock"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren={t('common.inStock')}
                unCheckedChildren={t('common.outOfStock')}
              />
            )}
          />
        </Form.Item>

        <FormSubmitButton isLoading={isSubmitting} style={{ marginTop: 24 }}>
          {mode === 'create' ? t('product.actions.create') : t('product.actions.edit')}
        </FormSubmitButton>
      </Form>
    </Card>
  );
}
