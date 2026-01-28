import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://billbook-backend-dar1.onrender.com/api/item/";

const defaultBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { endpoint }) => {
    // Skip setting JSON Content-Type for file uploads
    if (endpoint !== "bulkCreateitems" && endpoint !== "createItemWithImage") {
      headers.set("Content-Type", "application/json");
    }
    return headers;
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
