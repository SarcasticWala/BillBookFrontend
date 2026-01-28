import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../api/customeBasePartyQuery";

export const partyApi = createApi({
  reducerPath: "partyApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Party"],
  endpoints: (builder) => ({
    createParty: builder.mutation({
      query: (partyData) => ({
        url: "create",
        method: "POST",
        body: partyData,
      }),
      invalidatesTags: ["Party"],
    }),

    getParties: builder.query({
      query: () => "parties",
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
  useGetPartyByIdQuery,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetLocationsQuery,
  useBulkCreatePartiesMutation,
  useUpdatePartyMutation,
} = partyApi;
