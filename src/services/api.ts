const API_URL =
  "https://vibe-dating-server.onrender.com/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const {
    method = "GET",
    body,
    token,
  } = options;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      success: false,
      message:
        text || "Server returned an invalid response",
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
};