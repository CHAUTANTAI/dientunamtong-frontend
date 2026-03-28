/**
 * Contact API Service
 * RTK Query API for managing contacts in admin panel
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithInterceptor } from '@/store/api/baseQuery';

export enum ContactStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  message?: string;
  product_id?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactListResponse {
  success: boolean;
  data: Contact[];
}

export interface ContactDetailResponse {
  success: boolean;
  data: Contact;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface UpdateContactStatusRequest {
  status: ContactStatus;
}

export const contactApi = createApi({
  reducerPath: 'adminContactApi',
  baseQuery: createBaseQueryWithInterceptor(),
  tagTypes: ['Contact', 'UnreadCount'],
  endpoints: (builder) => ({
    // Get all contacts
    getContacts: builder.query<Contact[], { status?: ContactStatus }>({
      query: ({ status }) => ({
        url: '/admin/contact',
        params: status ? { status } : undefined,
      }),
      transformResponse: (response: ContactListResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Contact' as const, id })),
              { type: 'Contact', id: 'LIST' },
            ]
          : [{ type: 'Contact', id: 'LIST' }],
    }),

    // Get contact by ID
    getContactById: builder.query<Contact, string>({
      query: (id) => `/admin/contact/${id}`,
      transformResponse: (response: ContactDetailResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),

    // Get unread count
    getUnreadCount: builder.query<number, void>({
      query: () => '/admin/contact/unread-count',
      transformResponse: (response: UnreadCountResponse) => response.data.count,
      providesTags: [{ type: 'UnreadCount', id: 'COUNT' }],
    }),

    // Update contact status
    updateContactStatus: builder.mutation<Contact, { id: string; status: ContactStatus }>({
      query: ({ id, status }) => ({
        url: `/admin/contact/${id}`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: ContactDetailResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
        { type: 'UnreadCount', id: 'COUNT' },
      ],
    }),

    // Delete contact
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
        { type: 'UnreadCount', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useGetUnreadCountQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApi;
