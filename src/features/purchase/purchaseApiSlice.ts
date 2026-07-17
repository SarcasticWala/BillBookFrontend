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
      query: ({ __idempotencyKey, ...purchaseData }: any) => ({
        url: "/create-purchase",
        method: "POST",
        body: purchaseData,
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
      invalidatesTags: ["Purchase"],
    }),

    // Get all purchase invoices
    getPurchaseInvoices: builder.query({
      query: () => "/purchase-invoices",
      providesTags: ["Purchase"],
    }),

    getPurchaseInvoicesPaged: builder.query<
      any,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const p = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) p.set("search", search);
        return `/purchase-invoices-paged?${p.toString()}`;
      },
      providesTags: ["Purchase"],
    }),

    // Get a single purchase invoice
    getPurchaseById: builder.query({
      query: (id: string) => `/${id}`,
      providesTags: ["Purchase"],
    }),

    // Update a purchase invoice
    updatePurchase: builder.mutation({
      query: ({ id, ...body }: { id: string } & Record<string, any>) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Purchase"],
    }),

    // Delete a purchase invoice
    deletePurchase: builder.mutation({
      query: (id: string) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Purchase"],
    }),
  }),
});

export const {
  useCreatePurchaseMutation,
  useGetPurchaseInvoicesQuery,
  useGetPurchaseInvoicesPagedQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApi;
