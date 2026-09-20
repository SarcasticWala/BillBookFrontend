import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const posApi = createApi({
  reducerPath: "posApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/pos`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  endpoints: (builder) => ({
    checkoutPos: builder.mutation({
      query: ({ __idempotencyKey, ...body }: any) => ({
        url: "/checkout",
        method: "POST",
        body,
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
    }),
  }),
});

export const { useCheckoutPosMutation } = posApi;
