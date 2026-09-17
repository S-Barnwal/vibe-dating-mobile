const API_URL =
  "http://192.168.29.162:5000/api";

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

  const url = `${API_URL}${endpoint}`;

  console.log("API REQUEST:", {
    method,
    url,
    hasToken: !!token,
  });

  const response = await fetch(url, {
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
  });

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

  console.log("API RESPONSE:", {
    endpoint,
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
};