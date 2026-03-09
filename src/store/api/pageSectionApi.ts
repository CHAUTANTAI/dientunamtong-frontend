import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithInterceptor, baseQueryWithoutAuth } from '@/store/api/baseQuery';
import type { PageSection, UpdatePageSectionsRequest } from '@/types/pageSection';

export const pageSectionApi = createApi({
  reducerPath: 'pageSectionApi',
  baseQuery: createBaseQueryWithInterceptor(),
  tagTypes: ['PageSection'],
  endpoints: (builder) => ({
    // Admin: Get all sections for a page
    getPageSections: builder.query<PageSection[], string>({
      query: (pageIdentifier) => `/admin/page-sections/${pageIdentifier}`,
      transformResponse: (response: { data: PageSection[] }) => response.data,
      providesTags: (result, error, pageIdentifier) => [
        { type: 'PageSection', id: pageIdentifier },
      ],
    }),

    // Admin: Update sections for a page
    updatePageSections: builder.mutation<
      PageSection[],
      { pageIdentifier: string; data: UpdatePageSectionsRequest }
    >({
      query: ({ pageIdentifier, data }) => ({
        url: `/admin/page-sections/${pageIdentifier}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data: PageSection[] }) => response.data,
      invalidatesTags: (result, error, { pageIdentifier }) => [
        { type: 'PageSection', id: pageIdentifier },
        { type: 'PageSection', id: `public-${pageIdentifier}` },
      ],
    }),

    // Admin: Delete a section
    deletePageSection: builder.mutation<void, { id: string; pageIdentifier: string }>({
      query: ({ id }) => ({
        url: `/admin/page-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { pageIdentifier }) => [
        { type: 'PageSection', id: pageIdentifier },
        { type: 'PageSection', id: `public-${pageIdentifier}` },
      ],
    }),
  }),
});

// Public API - separate API slice without auth
export const publicPageSectionApi = createApi({
  reducerPath: 'publicPageSectionApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: ['PublicPageSection'],
  endpoints: (builder) => ({
    // Public: Get active sections for a page
    getActivePageSections: builder.query<PageSection[], string>({
      query: (pageIdentifier) => `/public/page-sections/${pageIdentifier}`,
      transformResponse: (response: { data: PageSection[] }) => response.data,
      providesTags: (result, error, pageIdentifier) => [
        { type: 'PublicPageSection', id: pageIdentifier },
      ],
    }),
  }),
});

export const {
  useGetPageSectionsQuery,
  useUpdatePageSectionsMutation,
  useDeletePageSectionMutation,
} = pageSectionApi;

export const {
  useGetActivePageSectionsQuery,
} = publicPageSectionApi;
