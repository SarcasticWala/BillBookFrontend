import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const automatedBillApi = createApi({
  reducerPath: "automatedBillApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/automated-bills`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Template", "Run"],
  endpoints: (builder) => ({
    createTemplate: builder.mutation({
      query: ({ __idempotencyKey, ...body }: any) => ({
        url: "/templates",
        method: "POST",
        body,
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
      invalidatesTags: ["Template"],
    }),
    getTemplates: builder.query<any, void>({
      query: () => "/templates",
      providesTags: ["Template"],
    }),
    updateTemplate: builder.mutation({
      query: ({ id, ...body }: { id: string } & Record<string, any>) => ({
        url: `/templates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Template"],
    }),
    pauseTemplate: builder.mutation({
      query: (id: string) => ({ url: `/templates/${id}/pause`, method: "POST" }),
      invalidatesTags: ["Template"],
    }),
    resumeTemplate: builder.mutation({
      query: (id: string) => ({ url: `/templates/${id}/resume`, method: "POST" }),
      invalidatesTags: ["Template"],
    }),
    cancelTemplate: builder.mutation({
      query: (id: string) => ({ url: `/templates/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Template"],
    }),
    getRuns: builder.query<any, void>({
      query: () => "/runs",
      providesTags: ["Run"],
    }),
    postRun: builder.mutation({
      query: (id: string) => ({ url: `/runs/${id}/post`, method: "POST" }),
      invalidatesTags: ["Run", "Template"],
    }),
    cancelRun: builder.mutation({
      query: (id: string) => ({ url: `/runs/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Run"],
    }),
    retryRun: builder.mutation({
      query: (id: string) => ({ url: `/runs/${id}/retry`, method: "POST" }),
      invalidatesTags: ["Run", "Template"],
    }),
  }),
});

export const {
  useCreateTemplateMutation,
  useGetTemplatesQuery,
  useUpdateTemplateMutation,
  usePauseTemplateMutation,
  useResumeTemplateMutation,
  useCancelTemplateMutation,
  useGetRunsQuery,
  usePostRunMutation,
  useCancelRunMutation,
  useRetryRunMutation,
} = automatedBillApi;
