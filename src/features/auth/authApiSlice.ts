import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/auth`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    getMe: builder.query<any, void>({
      query: () => "/me",
      providesTags: ["Auth"],
    }),
    // The business logo lives on its own endpoint because it is an inline
    // base64 data URI: bundling it into /me made every authenticated page load
    // block on a ~1.6 MB response. Only the three screens that actually render
    // it (sidebar avatar, Settings preview, invoice PDF) pull it, and RTK Query
    // shares one cached copy between them.
    getLogo: builder.query<any, void>({
      query: () => "/logo",
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<any, FormData | Record<string, unknown>>({
      query: (body) => ({ url: "/profile", method: "PUT", body }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useGetMeQuery, useGetLogoQuery, useUpdateProfileMutation } = authApi;
