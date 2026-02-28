import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithoutAuth } from '../api/baseQuery';

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  product_id?: string;
}

interface ContactResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    message?: string;
    product_id?: string;
    status: string;
    created_at: string;
  };
  message?: string;
}

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    submitContact: builder.mutation<ContactResponse, ContactRequest>({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const { useSubmitContactMutation } = contactApi;
