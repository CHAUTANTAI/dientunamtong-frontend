'use client';

/**
 * Create Product Page
 * Allows creating a new product
 */

import { useState } from 'react';
import { Button, Card, Form, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  useCreateProductMutation,
  useAddProductImageMutation,
} from '@/store/api/productApi';
import type { Product } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { supabase } from '@/utils/supabase';

type CreateProductFormValues = Pick<
  Product,
  'name' | 'price' | 'short_description' | 'description'
>;

const parsePrice = (price?: string | number | null) => {
  if (price === null || price === undefined || price === '') return null;
  if (typeof price === 'number') return price;
  const normalized = price.replace(/,/g, '');
  const value = Number(normalized);
  if (Number.isNaN(value)) return null;
  return value;
};

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [addProductImage, { isLoading: isAddingImage }] =
    useAddProductImageMutation();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateProductFormValues>({
    defaultValues: {
      name: '',
      price: '',
      short_description: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateProductFormValues) => {
    try {
      const numericPrice = parsePrice(values.price ?? null);

      // Step 1: Create product
      const product = await createProduct({
        name: values.name,
        price: numericPrice,
        short_description: values.short_description || null,
        description: values.description || null,
        is_active: true,
      }).unwrap();

      // Step 2: Upload image if provided
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}_${file.name}`;
        const filePath = `product/${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // eslint-disable-next-line no-console
          console.error('Upload error:', uploadError);
          message.error('Failed to upload image');
          return;
        }

        // Step 3: Add product image record
        // Store relative path without bucket name: product/id_filename
        const imageUrl = `/product/${fileName}`;
        await addProductImage({
          productId: product.id,
          image_url: imageUrl,
          sort_order: 0,
        }).unwrap();
      }

      message.success('Product created successfully');
      reset();
      setFileList([]);
      router.push(ROUTES.PRODUCT);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to create product');
    }
  };

  const handleFileChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList.slice(-1)); // Only keep the last file
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  return (
    <Card title="Create New Product">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <FormInput
          name="name"
          control={control}
          label="Name"
          placeholder="Enter product name"
          rules={{
            required: 'Name is required',
            maxLength: {
              value: 255,
              message: 'Name must not exceed 255 characters',
            },
          }}
        />

        <FormInput
          name="price"
          control={control}
          label="Price"
          placeholder="Enter price (optional)"
          rules={{
            validate: (value) => {
              if (!value) return true;
              const numeric = parsePrice(value);
              if (numeric === null) {
                return 'Price must be a valid number';
              }
              if (numeric < 0) {
                return 'Price must be greater than or equal to 0';
              }
              return true;
            },
          }}
        />

        <FormInput
          name="short_description"
          control={control}
          label="Short Description"
          placeholder="Enter short description (optional)"
          textarea
          rules={{
            maxLength: {
              value: 255,
              message: 'Short description must not exceed 255 characters',
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
              value: 1000,
              message: 'Description must not exceed 1000 characters',
            },
          }}
        />

        <Form.Item label="Product Image">
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
            Select one image file (optional)
          </div>
        </Form.Item>

        <FormSubmitButton
          isLoading={isSubmitting || isCreating || isAddingImage}
          style={{ marginTop: 8 }}
        >
          Create Product
        </FormSubmitButton>
      </Form>
    </Card>
  );
}

