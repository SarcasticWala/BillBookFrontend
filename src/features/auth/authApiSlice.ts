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
    updateProfile: builder.mutation<any, FormData | Record<string, unknown>>({
      query: (body) => ({ url: "/profile", method: "PUT", body }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useGetMeQuery, useUpdateProfileMutation } = authApi;
