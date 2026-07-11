import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/document`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Document"],
  endpoints: (builder) => ({
    createDocument: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: "/create", method: "POST", body }),
      invalidatesTags: ["Document"],
    }),
    getDocuments: builder.query<any, string>({
      query: (type) => `/list?type=${type}`,
      providesTags: ["Document"],
    }),
  }),
});

export const { useCreateDocumentMutation, useGetDocumentsQuery } = documentApi;
