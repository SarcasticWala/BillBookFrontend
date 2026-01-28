import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://billbook-backend-dar1.onrender.com/api/party/";

const defaultBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { endpoint }) => {
    if (endpoint !== "bulkCreateParties") {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

export const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  // Detect only for bulk-create file upload
  if (args?.url === "bulk-create") {
    try {
      const res = await fetch(baseUrl + args.url, {
        method: args.method || "POST",
        body: args.body,
      });

      const contentType = res.headers.get("content-type") || "";

      if (res.status === 400 && contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
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

      // Fallback to json parsing for success
      const data = await res.json();

      if (!res.ok) {
        return { error: { status: res.status, data } };
      }

      return { data };
    } catch (e) {
      return { error: { status: 500, data: e } };
    }
  }

  // All other requests
  return defaultBaseQuery(args, api, extraOptions);
};
