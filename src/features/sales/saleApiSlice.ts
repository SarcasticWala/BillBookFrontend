import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/sale`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Sale"],
  endpoints: (builder) => ({
    createSale: builder.mutation({
      query: (saleData) => ({
        url: "/create-sale",
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sale"],
    }),
    getSaleInvoices: builder.query({
      query: () => "/sale-invoices",
      providesTags: ["Sale"],
    }),
    getSaleById: builder.query({
      query: (id: string) => `/${id}`,
      providesTags: ["Sale"],
    }),
    updateSale: builder.mutation({
      query: ({ id, ...body }: { id: string } & Record<string, any>) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Sale"],
    }),
    deleteSale: builder.mutation({
      query: (id: string) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sale"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetSaleInvoicesQuery,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = saleApi;
