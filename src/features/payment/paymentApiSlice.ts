import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth } from "../../config/api";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/payment`,
    prepareHeaders: (headers) => withAuth(headers),
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPayment: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({ url: "/create", method: "POST", body }),
      invalidatesTags: ["Payment"],
    }),
    getPayments: builder.query<any, string>({
      query: (type) => `/list?type=${type}`,
      providesTags: ["Payment"],
    }),
  }),
});

export const { useCreatePaymentMutation, useGetPaymentsQuery } = paymentApi;
