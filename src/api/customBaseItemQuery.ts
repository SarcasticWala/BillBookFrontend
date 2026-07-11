import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, withAuth, authHeader } from "../config/api";

const baseUrl = `${API_BASE_URL}/api/item/`;

const defaultBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { endpoint }) => {
    // Skip setting JSON Content-Type for multipart file uploads
    if (endpoint !== "bulkCreateItems" && endpoint !== "createItem") {
      headers.set("Content-Type", "application/json");
    }
    return withAuth(headers);
  },
});

export const customItemBaseQuery = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const isMultipartUpload = args?.url === "create" || args?.url === "bulk-create-items";

  if (isMultipartUpload) {
    try {
      const res = await fetch(baseUrl + args.url, {
        method: args.method || "POST",
        headers: authHeader(), // don't set Content-Type; browser sets multipart boundary
        body: args.body,
      });

      const contentType = res.headers.get("content-type") || "";

      // Handle Excel error response
      if (
        res.status === 400 &&
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();

        return {
          error: {
            status: 400,
            file: {
              data: arrayBuffer,
            },
            message: "Some rows had validation errors",
          },
        };
      }

      // Fallback to JSON (for success or other error)
      const data = await res.json();

      if (!res.ok) {
        return { error: { status: res.status, data } };
      }

      return { data };
    } catch (error) {
      return { error: { status: 500, data: error } };
    }
  }

  // fallback for normal GET/POST requests
  return defaultBaseQuery(args, api, extraOptions);
};
