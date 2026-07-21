import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../api/customeBasePartyQuery";

export const partyApi = createApi({
  reducerPath: "partyApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    createParty: builder.mutation({
      query: ({ __idempotencyKey, ...partyData }: any) => ({
        url: "create",
        method: "POST",
        body: partyData,
        // Guard against double-submit / retries creating duplicate parties.
        headers: __idempotencyKey ? { "Idempotency-Key": __idempotencyKey } : {},
      }),
      invalidatesTags: ["Party"],
    }),

    getParties: builder.query({
      query: () => "parties",
      providesTags: ["Party"],
    }),

    getPartiesPaged: builder.query<
      any,
      { page?: number; limit?: number; search?: string; partyType?: string; categories?: string }
    >({
      query: ({ page = 1, limit = 10, search = "", partyType = "", categories = "" }) => {
        const p = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) p.set("search", search);
        if (partyType) p.set("partyType", partyType);
        if (categories) p.set("categories", categories);
        return `parties-paged?${p.toString()}`;
      },
      providesTags: ["Party"],
    }),

    getPartyById: builder.query({
      query: (id: string) => `get-party/${id}`,
      providesTags: ["Party"],
    }),

    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "create-category",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Party"],
    }),

    getCategories: builder.query({
      query: () => "get-catagories",
      providesTags: ["Party"],
    }),

    getLocations: builder.query({
      query: () => "locations",
    }),

    bulkCreateParties: builder.mutation({
      query: (formData: FormData) => ({
        url: "bulk-create",
        method: "POST",
        body: formData,
        headers: {}, // browser handles content-type
      }),
      invalidatesTags: ["Party"],
    }),
    updateParty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `update-party/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Party"],
    }),
  }),
});

export const {
  useCreatePartyMutation,
  useGetPartiesQuery,
  useGetPartiesPagedQuery,
  useGetPartyByIdQuery,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetLocationsQuery,
  useBulkCreatePartiesMutation,
  useUpdatePartyMutation,
} = partyApi;
