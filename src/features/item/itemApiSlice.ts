import { createApi } from "@reduxjs/toolkit/query/react";
import { customItemBaseQuery } from "../../api/customBaseItemQuery";

export const itemApi = createApi({
  reducerPath: "itemApi",
  baseQuery: customItemBaseQuery,
  tagTypes: ["Item"],
  endpoints: (builder) => ({
    createItem: builder.mutation({
      query: (itemData: FormData) => ({
        url: "create",
        method: "POST",
        body: itemData,
        headers: {}, // browser sets content-type
      }),
      invalidatesTags: ["Item"],
    }),

    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "create-item-category",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Item"],
    }),

    getCategories: builder.query<any, void>({
      query: () => "get-item-catagories",
      providesTags: ["Item"],
    }),

    getTaxes: builder.query<any, void>({
      query: () => "taxes",
      providesTags: ["Item"],
    }),

    getUnits: builder.query<any, void>({
      query: () => "units",
      providesTags: ["Item"],
    }),

    getItems: builder.query<any, void>({
      query: () => "items",
      providesTags: ["Item"],
    }),
    getItemById: builder.query<
      any,
      { id: string; itemType: "PRODUCT" | "SERVICE" }
    >({
      query: ({ id, itemType }) => `get-item?id=${id}&itemType=${itemType}`,
      providesTags: ["Item"],
    }),
    bulkCreateItems: builder.mutation({
      query: (formData: FormData) => ({
        url: "bulk-create-items",
        method: "POST",
        body: formData,
        headers: {}, // browser handles content-type
      }),
      invalidatesTags: ["Item"],
    }),
    updateItemStock: builder.mutation({
      query: (data) => ({
        url: "update-item-stock",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Item"],
    }),
  }),
});

export const {
  useCreateItemMutation,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetTaxesQuery,
  useGetUnitsQuery,
  useGetItemsQuery,
  useGetItemByIdQuery,
  useBulkCreateItemsMutation,
  useUpdateItemStockMutation,
} = itemApi;
