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
    getSaleInvoicesPaged: builder.query<
      any,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const p = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) p.set("search", search);
        return `/sale-invoices-paged?${p.toString()}`;
      },
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
  useGetSaleInvoicesPagedQuery,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = saleApi;
