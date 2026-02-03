/**
 * Contact API - RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/utils/auth';
import type { Contact } from '@/types/contact';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], void>({
      query: () => '/contacts',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Contact' as const, id })), { type: 'Contact', id: 'LIST' }]
          : [{ type: 'Contact', id: 'LIST' }],
    }),
    getContact: builder.query<Contact, string>({
      query: (id) => `/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),
    createContact: builder.mutation<Contact, Partial<Contact>>({
      query: (body) => ({ url: '/contacts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }],
    }),
    updateContact: builder.mutation<Contact, { id: string; body: Partial<Contact> }>({
      query: ({ id, body }) => ({ url: `/contacts/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contact', id }],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({ url: `/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
