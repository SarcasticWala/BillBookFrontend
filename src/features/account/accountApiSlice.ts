import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/account`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Account", "AccountTxn"],
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => "/accounts",
      providesTags: ["Account"],
    }),
    createAccount: builder.mutation({
      query: ({ __idempotencyKey, ...body }: any) => ({
        url: "/accounts",
        method: "POST",
        body,
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
      invalidatesTags: ["Account", "AccountTxn"],
    }),
    getAccountById: builder.query({
      query: (id: string) => `/accounts/${id}`,
      providesTags: ["Account"],
    }),
    updateAccount: builder.mutation({
      query: ({ id, ...body }: { id: string } & Record<string, any>) => ({
        url: `/accounts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Account", "AccountTxn"],
    }),
    adjustMoney: builder.mutation({
      query: ({ id, ...body }: { id: string } & Record<string, any>) => ({
        url: `/accounts/${id}/adjust`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account", "AccountTxn"],
    }),
    transferMoney: builder.mutation({
      query: (body) => ({ url: "/transfer", method: "POST", body }),
      invalidatesTags: ["Account", "AccountTxn"],
    }),
    getTransactions: builder.query({
      query: (accountId?: string) =>
        accountId ? `/transactions?accountId=${accountId}` : "/transactions",
      providesTags: ["AccountTxn"],
    }),
    deleteAccount: builder.mutation({
      query: (id: string) => ({ url: `/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Account", "AccountTxn"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useAdjustMoneyMutation,
  useTransferMoneyMutation,
  useGetTransactionsQuery,
  useDeleteAccountMutation,
} = accountApi;
