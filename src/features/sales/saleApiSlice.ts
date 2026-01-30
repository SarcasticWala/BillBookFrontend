import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
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
  }),
});

export const { useCreateSaleMutation, useGetSaleInvoicesQuery } = saleApi;
