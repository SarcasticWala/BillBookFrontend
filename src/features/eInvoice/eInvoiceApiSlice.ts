import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const eInvoiceApi = createApi({
  reducerPath: "eInvoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/e-invoice`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  endpoints: (builder) => ({
    setEInvoicingEnabled: builder.mutation<any, boolean>({
      query: (enabled) => ({ url: "/enable", method: "POST", body: { enabled } }),
    }),
    submitEInvoice: builder.mutation<any, string>({
      query: (invoiceId) => ({ url: `/invoices/${invoiceId}/submit`, method: "POST" }),
    }),
    cancelEInvoice: builder.mutation<any, { invoiceId: string; reason: string }>({
      query: ({ invoiceId, reason }) => ({
        url: `/invoices/${invoiceId}/cancel`,
        method: "POST",
        body: { reason },
      }),
    }),
    getGstr1Summary: builder.query<any, string>({
      query: (month) => `/gstr1-summary?month=${month}`,
    }),
  }),
});

export const {
  useSetEInvoicingEnabledMutation,
  useSubmitEInvoiceMutation,
  useCancelEInvoiceMutation,
  useGetGstr1SummaryQuery,
} = eInvoiceApi;
