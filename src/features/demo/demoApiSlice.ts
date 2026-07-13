import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const demoApi = createApi({
  reducerPath: "demoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/demo`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Demo", "AdminDemo"],
  endpoints: (builder) => ({
    bookDemo: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: "/book", method: "POST", body }),
      invalidatesTags: ["Demo", "AdminDemo"],
    }),
    getDemos: builder.query<any, void>({
      query: () => "/list",
      providesTags: ["Demo"],
    }),
    // Admin
    getAllDemos: builder.query<any, void>({
      query: () => "/admin/list",
      providesTags: ["AdminDemo"],
    }),
    updateDemoStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminDemo"],
    }),
  }),
});

export const {
  useBookDemoMutation,
  useGetDemosQuery,
  useGetAllDemosQuery,
  useUpdateDemoStatusMutation,
} = demoApi;
