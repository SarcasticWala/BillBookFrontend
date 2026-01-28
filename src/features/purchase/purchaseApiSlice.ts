import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://billbook-backend-dar1.onrender.com/api/purchase" }),
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    // Create purchase invoice
    createPurchase: builder.mutation({
      query: (purchaseData) => ({
        url: "/create-purchase",
        method: "POST",
        body: purchaseData,
      }),
      invalidatesTags: ["Purchase"],
    }),

    // Get all purchase invoices
    getPurchaseInvoices: builder.query({
      query: () => "/purchase-invoices",
      providesTags: ["Purchase"],
    }),
  }),
});

export const { useCreatePurchaseMutation, useGetPurchaseInvoicesQuery } =
  purchaseApi;
