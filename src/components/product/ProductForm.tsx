/**
 * ProductForm Component - Shared form for Create/Edit Product
 * Handles both creation and editing with the same form
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Divider, Space, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductCategoriesMutation,
  useAddProductMediaMutation,
} from '@/store/api/productApi';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { SpecificationInput } from '@/components/common/SpecificationInput';
import { CategoryMultiSelect } from '@/components/common/CategoryMultiSelect';
import { ProductMediaUpload, MediaFile } from '@/components/common/ProductMediaUpload';
import { isValidSlug, generateSlug } from '@/utils/slug';
import { getErrorMessage } from '@/utils/error';
import { uploadToSupabase } from '@/utils/supabase';

interface ProductFormValues {
  name: string;
  slug: string;
  sku?: string;
  price?: number;
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
  const router = useRouter();
  const { message } = App.useApp();
  const [autoSlug, setAutoSlug] = useState(mode === 'create');

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [updateCategories] = useUpdateProductCategoriesMutation();
  const [addProductMedia] = useAddProductMediaMutation();

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

  // Load existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && product) {
      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku || '',
        price: product.price ? Number(product.price) : undefined,
        short_description: product.short_description || '',
        description: product.description || '',
        specifications: product.specifications || {},
        category_ids: product.categories?.map((c) => c.id) || [],
        tags: product.tags?.join(', ') || '',
        media: [],
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

      const tags = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      if (mode === 'create') {
        // CREATE MODE
        const dto: CreateProductDto = {
          name: values.name,
          slug: values.slug,
          sku: values.sku || undefined,
          price: values.price || null,
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

                const result = await uploadToSupabase(
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

        message.success('Product created successfully!');
        router.push(ROUTES.PRODUCT);
      } else {
        // EDIT MODE
        const dto: UpdateProductDto = {
          name: values.name,
          slug: values.slug,
          sku: values.sku || undefined,
          price: values.price || null,
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

        message.success('Product updated successfully!');
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
      <Card title="Edit Product">
        <div>Loading...</div>
      </Card>
    );
  }

  if (mode === 'edit' && !product) {
    return <Card title="Edit Product">Product not found</Card>;
  }

  return (
    <Card title={mode === 'create' ? 'Create New Product' : `Edit Product: ${product?.name}`}>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Divider orientation="left">Basic Information</Divider>

        <FormInput
          name="name"
          control={control}
          label="Product Name"
          placeholder="Enter product name"
          rules={{ required: 'Name is required' }}
        />

        <FormInput
          name="slug"
          control={control}
          label="Slug (URL-friendly)"
          placeholder="product-slug"
          rules={{
            required: 'Slug is required',
            validate: (v) => isValidSlug(v) || 'Invalid slug',
          }}
        />

        {mode === 'create' && (
          <Space style={{ marginBottom: 16 }}>
            <span>Auto-generate slug:</span>
            <Switch
              checked={autoSlug}
              onChange={setAutoSlug}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Space>
        )}

        <FormInput name="sku" control={control} label="SKU" placeholder="Product SKU" />

        <Form.Item label="Price (VNĐ)">
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter price"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value!.replace(/,/g, '');
                  return Number(parsed);
                }}
              />
            )}
          />
        </Form.Item>

        <FormInput
          name="short_description"
          control={control}
          label="Short Description"
          placeholder="Brief description (1-2 sentences)"
          textarea
        />

        <FormInput
          name="description"
          control={control}
          label="Full Description"
          placeholder="Detailed description"
          textarea
        />

        <Divider orientation="left">Specifications</Divider>

        <Form.Item label="Technical Specifications">
          <Controller
            name="specifications"
            control={control}
            render={({ field }) => (
              <SpecificationInput value={field.value} onChange={field.onChange} />
            )}
          />
        </Form.Item>

        <Divider orientation="left">Categorization</Divider>

        <Form.Item label="Categories">
          <Controller
            name="category_ids"
            control={control}
            render={({ field }) => (
              <CategoryMultiSelect value={field.value} onChange={field.onChange} />
            )}
          />
        </Form.Item>

        <FormInput name="tags" control={control} label="Tags (comma-separated)" />

        {mode === 'create' && (
          <>
            <Divider orientation="left">Media</Divider>

            <Form.Item label="Product Media">
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
          </>
        )}

        <Divider orientation="left">Status</Divider>

        <Form.Item label="Active Status">
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

        <Form.Item label="Stock Status">
          <Controller
            name="in_stock"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="In Stock"
                unCheckedChildren="Out of Stock"
              />
            )}
          />
        </Form.Item>

        <FormSubmitButton isLoading={isSubmitting} style={{ marginTop: 24 }}>
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </FormSubmitButton>
      </Form>
    </Card>
  );
}
