import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

const qs = (params: Record<string, string | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/report`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  endpoints: (builder) => ({
    getSalesSummary: builder.query<any, { from?: string; to?: string }>({
      query: ({ from, to }) => `/sales-summary${qs({ from, to })}`,
    }),
    getPurchaseSummary: builder.query<any, { from?: string; to?: string }>({
      query: ({ from, to }) => `/purchase-summary${qs({ from, to })}`,
    }),
    getDaybook: builder.query<any, { from?: string; to?: string }>({
      query: ({ from, to }) => `/daybook${qs({ from, to })}`,
    }),
    getPartyOutstanding: builder.query<any, void>({
      query: () => "/party-outstanding",
    }),
    getPartyLedger: builder.query<any, { partyId: string; from?: string; to?: string }>({
      query: ({ partyId, from, to }) => `/party-ledger/${partyId}${qs({ from, to })}`,
    }),
    getStockSummary: builder.query<any, { lowStockOnly?: boolean }>({
      query: ({ lowStockOnly }) => `/stock-summary${qs({ lowStockOnly: lowStockOnly ? "true" : undefined })}`,
    }),
    getReceivablesAging: builder.query<any, { asOf?: string } | void>({
      query: (args) => `/receivables-aging${qs({ asOf: (args || {}).asOf })}`,
    }),
  }),
});

export const {
  useGetSalesSummaryQuery,
  useGetPurchaseSummaryQuery,
  useGetDaybookQuery,
  useGetPartyOutstandingQuery,
  useGetPartyLedgerQuery,
  useGetStockSummaryQuery,
  useGetReceivablesAgingQuery,
} = reportApi;
