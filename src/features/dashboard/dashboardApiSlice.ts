import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/dashboard`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<any, void>({
      query: () => "/summary",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
