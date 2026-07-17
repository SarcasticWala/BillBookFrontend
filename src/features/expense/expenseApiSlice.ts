import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/expense`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Expense"],
  endpoints: (builder) => ({
    getExpenses: builder.query<
      any,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const p = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) p.set("search", search);
        return `/list?${p.toString()}`;
      },
      providesTags: ["Expense"],
    }),
    createExpense: builder.mutation({
      query: ({ __idempotencyKey, ...body }: any) => ({
        url: "/create",
        method: "POST",
        body,
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
      invalidatesTags: ["Expense"],
    }),
    deleteExpense: builder.mutation({
      query: (id: string) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["Expense"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
