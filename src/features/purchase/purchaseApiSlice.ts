import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/purchase`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
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
